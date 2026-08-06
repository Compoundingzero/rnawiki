# RNAwiki event schema

**Status:** W1, 2026-08-01. **Implementation:** `site/app.js`, the `RNA_A` module.
**Gate:** `build/parse.js` → `assertAnalyticsVocabulary()` refuses to build if this document and
`site/app.js` disagree. This file is the spec; the code is the implementation.

**Status, 2026-08-06.** Two senders, one chokepoint (`aSend`), one closed vocabulary.

| sender | switch | state |
|---|---|---|
| **GA4** | `A_GA4` in `site/app.js` | **LIVE** — `G-TPLGY5M63B`. Blank or `null` = fully inert. |
| GoatCounter | `A_CODE` in `site/app.js` | **INERT** — `null`, so no request is ever constructed. Kept because it costs nothing while off; deleting it means changing the endpoint-count gate in the same commit. |

**Neither needs a CSP change** (§3), because both are `<img>` GETs and `img-src 'self' data: https:`
already permits any https host. Both are suppressed when `navigator.webdriver` is true, so
`probe.mjs` and `npm run smoke` move no counts.

**Google Analytics has no effect on search rankings.** It reports what happened after an arrival;
Search Console reports the arrival itself. They are different instruments and neither improves the
other. Nothing in this file is an SEO measure.

---

## 0. The one rule

> **Nothing that describes a reader's health ever leaves this origin.**
> Not a symptom, not a problem id, not a compound name, not a PMID, not a page title, not a
> query string, not a same-origin referrer. Not once, not in aggregate, not "just the slug".

Everything below is the machinery that makes that rule true by construction rather than by
discipline. If you are adding an event and it feels like the rule is in your way, the event is
wrong, not the rule.

---

## 1. What is installed, and why not the obvious things

**Chosen: GoatCounter, called directly from a ~40-line sender in `site/app.js` via an `<img>` GET.**
Cookie-free, free, hosted (Felix maintains no server), no third-party script on the page, and
**no CSP change required** — the existing `img-src 'self' data: https:` already permits it.

### GA4 via `gtag.js` — rejected, with the measurement. We use the endpoint, not the script.

`https://www.googletagmanager.com/gtag/js?id=G-TPLGY5M63B`, fetched 2026-08-06: **HTTP 200,
497,740 B decoded / 169,053 B gzipped on the wire.** The measurement id appears **19 times**, and
the inline container configuration Google serves for **this property, today**, contains:

| tag in the served container | what it would do on this site |
|---|---|
| `__ccd_em_site_search`, `vtp_searchQueryParams:"q,s,search,query,keyword"` | The home hero is a real `<form action="/solve" method="get" name="q">`. **This reads the reader's own typed symptom text off the URL and sends it.** |
| `__ccd_em_page_view`, `vtp_historyEvents:true` | This router is `pushState`. It would re-read `location.href` on every navigation and send `/protocol/low-testosterone/primary-hypogonadism` verbatim. |
| `__ccd_em_outbound_click`, `vtp_includeParams:true` | Sends `link_url` — i.e. the **PMID**. A paper identifies a condition. |
| `__ccd_em_scroll`, `vtp_autoEmailEnabled:true`, `vtp_isAutoCollectPiiEnabledFlag:true` | Further automatic collection, all server-configured. |

**None of these can be switched off from code.** They are Data-stream settings in the GA4 admin, so
a privacy property that depended on them would be a property of a web console someone else can
change, not of this repository. `send_page_view:false` does not govern them.

So, exactly as with GoatCounter's `count.js`: **we call the collect endpoint ourselves** — the same
request `gtag.js` makes — and send only the fields in §4a. `aGA()` in `site/app.js`, ~25 lines.
The build refuses to compile a `site/app.js` that mentions `googletagmanager.com` (§7).

Measured in real Chrome against the CSP this server actually serves, 2026-08-06:

| what was attempted | result |
|---|---|
| `new Image().src = '…/g/collect?…'` | **allowed, 0 CSP violations** — `img-src 'self' data: https:` |
| `<script src="…/gtag/js?id=…">` injected into the same page | **refused by `script-src`** |
| `navigator.sendBeacon()` to the same collect URL | **refused by `connect-src` — and returned `true`** |

That third row is why this file exists: a blocked `sendBeacon` reports success to the page. This
site has already shipped one beacon that was silently blocked and collected nothing for months.

### Cloudflare Web Analytics — rejected, with the measurement

The W1 brief said the CSP already whitelists it. **Half true, and the false half is the one that
matters.** `static.cloudflareinsights.com` is indeed in **script-src** — so `beacon.min.js` would
*load*. But `beacon.min.js` (fetched 2026-08-01, HTTP 200, 31,612 B) reports to
**`https://cloudflareinsights.com/cdn-cgi/rum`** — the apex host, not `static.` — via
`navigator.sendBeacon`, and `sendBeacon` is governed by **connect-src**, where that host does not
appear. Enabling Cloudflare Web Analytics today reproduces exactly the failure the CSP's own
comment in `server.js` records having already happened once: *"It was CSP-blocked from the day the
headers shipped, so it had collected nothing."*

Two further disqualifications, independent of the CSP:

1. **It cannot be made template-only.** `beacon.min.js` reads `window.location` and exposes no
   path, title or referrer override hook. The full URL — `/problem/erectile-dysfunction`,
   `/c/ssris-sertraline-escitalopram` — would go to Cloudflare. That violates §0.
2. **It has no custom-event API.** It could deliver page views and nothing else.

Current state, verified 2026-08-01: production HTML (`https://rnawiki.com/`, 18,803 B) contains
**0** occurrences of `cloudflareinsights`, so the beacon is not being injected. The whitelist is
dormant. See §9.

### Plausible — rejected

Hosted Plausible is paid, which fails *free*. Self-hosted Plausible CE is ClickHouse + Postgres +
a container to keep alive, which fails *solo-maintainable* and *free* again.

### GoatCounter's own `count.js` — rejected, and this is the important one

We use GoatCounter's **endpoint**. We do **not** load its script. From `count.js`
(fetched 2026-08-01, HTTP 200, 9,213 B), `get_data()` builds:

```js
var data = {
  p: (vars.path     === undefined ? goatcounter.path     : vars.path),
  r: (vars.referrer === undefined ? goatcounter.referrer : vars.referrer),
  t: (vars.title    === undefined ? goatcounter.title    : vars.title),
  e: !!(vars.event || goatcounter.event),
  s: window.screen.width,
  b: is_bot(),
  q: location.search,          // ← no hook. No override. Always sent.
}
```

and `get_path()` returns `loc.pathname + loc.search` (both strings verified present in the fetched
file).

`p`, `r` and `t` are overridable. **`q` is not.** On this site that is fatal: the home hero is a
real `<form action="/solve" method="get" name="q">`, so **`/solve?q=<the reader's own words>` is a
URL the site's own primary call-to-action generates**. Loading `count.js` would ship the reader's
typed symptom text to a third party with no configuration available to stop it.

The defaults on the other three are leaks too, and are easy to miss:

| Channel | Default value on this site | Why it is a health disclosure |
|---|---|---|
| `t` (title) | `document.title` | *"Bremelanotide (PT-141): dosage, evidence & side effects · RNAwiki"* |
| `r` (referrer) | `document.referrer` | Same-origin navigation → the reader's full previous URL |
| `q` (query) | `location.search` | `?q=erectile dysfunction`, typed by the reader |
| `p` (path) | `pathname + search` | `/protocol/low-testosterone/primary-hypogonadism` |

The site's `Referrer-Policy: strict-origin-when-cross-origin` header (verified live on
`https://rnawiki.com/`) does **not** close the `r` channel: that header governs the `Referer`
*request header*, while `count.js` reads `document.referrer` in JavaScript, which for a same-origin
navigation is the full previous URL.

So we construct the request ourselves and send only the fields in §4.

---

## 2. Page views are recorded by TEMPLATE, never by URL

### The reasoning, stated in full because this is the load-bearing decision

A URL on this site is frequently a health disclosure in itself. `/problem/hair-loss`,
`/problem/low-testosterone`, `/protocol/insulin-resistance/visceral-adiposity`,
`/c/ssris-sertraline-escitalopram`, `/c/finasteride-dutasteride`, `/c/pt-141-bremelanotide`,
`/goal/sexual` — a reader who loads one of these has told us something about their body. Sending
that URL to a third party, alongside the IP address, user-agent, screen width and timestamp that
any HTTP request carries, is a health inference attached to a near-identifier.

Four arguments, in ascending order of how much they should matter here:

1. **Legal.** Under Singapore's PDPA, health information is personal data and RNAwiki is the
   controller. Under GDPR Art. 9 it is special-category data, which needs an Art. 9(2) condition —
   "product analytics" is not one. A site with no consent banner cannot lawfully route
   special-category data to a processor, and the site does not want a consent banner.
2. **Regulatory posture.** The project already treats Singapore exposure as real (Medicines Act
   1975 s.51). A per-URL trail of anonymous readers' interest in prescription-only medicines,
   held by a third party, is a needless second front.
3. **The product's own promise.** The site's hardest constraint is *anonymous-first: reading,
   logging and the $0 protocol must work with no account*. Shipping a third party a per-URL record
   of what an anonymous reader read contradicts the promise directly. It does not matter that the
   record is "only" an IP hash.
4. **It is not actually needed for the question W1 exists to answer.** The open question is
   *which templates do readers use, where do they come from, and do they finish the funnel* —
   all template-level.

### The counter-argument, honestly stated

Template-only page views **cannot** tell Felix whether `/c/creatine-monohydrate` is read more than
`/c/bpc-157`. That is a genuine loss, and per-page popularity is the most obviously useful thing an
analytics tool produces.

**The resolution is that these are two different questions with two different right answers:**

- *Which template, from where, does the funnel complete?* → third-party, template-level. This
  document. Ships now.
- *Which individual page is popular, and how deep is it read?* → **does not need a third party at
  all.** Google Search Console (which Felix already has) reports per-URL impressions and clicks for
  the ~90% of traffic that arrives from search, and the data never leaves Google's existing
  relationship with the site. A first-party, aggregate-only depth counter is the other option, and
  it is a separate decision — do not smuggle it in here.

### How the collapse works

`aTemplate(parts)` in `site/app.js`:

- If the path is one of the **allowlisted public routes** — `/`, `/about`, `/anatomy`, `/az`,
  `/body`, `/browse`, `/compare`, `/corrections`, `/learn`, `/legend`, `/methodology`, `/pathways`,
  `/plan`, `/solve`, `/stack`, `/where` — it is sent verbatim. None of these encodes a health
  interest.
- Otherwise the **first segment only** is mapped to a template name: `/t/compound`, `/t/protocol`,
  `/t/problem`, `/t/goal`, `/t/target`, `/t/pathway`, `/t/muscle`, `/t/learn-module`,
  `/t/compare-pair`, `/t/energy`, `/t/physiology`, `/t/body-region`, `/t/fuel`, `/t/exercise`,
  `/t/fork`, `/t/progress`, `/t/shared-plan`, `/t/admin`.
- Anything unrecognised → **`/t/other`**.

This is an **allowlist, not a blocklist**. A route template added tomorrow and forgotten here
degrades to `/t/other`; it can never leak a health-encoding URL by omission. That is the whole
reason for the shape.

### How many page views one visit sends: exactly one (W5.5, 2026-08-03)

`route()` is **not** a navigation hook. It means "re-render whatever the URL now says", and three
things ran it on a path the reader was already on. Measured hydrated at 390×844 and 1440×900 over
all 568 published routes, 0 page errors, with the `A_CODE` kill switch and the `navigator.webdriver`
suppressor flipped in flight so the beacons were observable:

| what the reader did | page views before | after |
|---|---|---|
| load any of the 568 routes | 1 (568/568) | 1 (568/568) |
| click the **skip link** on `/c/creatine-monohydrate` | 2 extra | 0 extra |
| jump to `#red-flags` inside a protocol page | 2 extra | 0 extra |
| load one page with the **root-cause overlay serving rows** | 2 | 1 |
| one legacy `#/target/ATP` hash-router navigation | 2 | 1 |
| real navigation A → B → A → back | 4 | 4 |

Two mechanisms. `route()` is bound to **both** `popstate` and `hashchange`, and Chrome fires both
for one same-document fragment change; and boot does `if (applyRcOverlay(ov)) route();`, which
re-renders the page it is already on. The overlay case is the production configuration, so every
page on the site counted double whenever the database had an overlay to serve — and the skip-link
case inflated the counts of the readers using the accessibility affordance most.

The fix is one guard at the call site: the page view is sent **only when the path changed**
(`pathPart !== _aLastPath`). What that gives up, deliberately: clicking a link to the route you are
already on no longer counts. It is a re-render, not a second visit. Counting a re-render as a visit
inflates the only number this site keeps, in the direction that flatters it.

`assertPageviewIntegrity()` in `build/prerender.js` holds all of it: exactly one `RNA_A.pv()` call
site, that call site guarded, one `_aLastPath` declaration, `route()` still bound to both listeners,
`aTemplate()`'s body pinned verbatim, every `A_PUBLIC` entry a single-segment index route, and every
one of the 568 published routes replayed through `aTemplate()` and required to collapse to a public
path or `/t/<template>`. Coverage is **reported, never enforced** — `/t/other` is the safe answer,
and failing the build on it would create pressure to widen `A_TPL`, which is the direction that
leaks.

---

## 3. Transport, and why the CSP needs no change

The sender builds a URL and assigns it to `new Image().src`. That is an image GET, governed by
**`img-src`**, and the CSP served by both `localhost:8099` and `https://rnawiki.com` (byte-identical,
verified 2026-08-01) is:

```
default-src 'self';
script-src 'self' 'wasm-unsafe-eval' 'unsafe-inline' https://accounts.google.com https://static.cloudflareinsights.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
connect-src 'self' https://accounts.google.com https://pubchem.ncbi.nlm.nih.gov;
frame-src https://accounts.google.com https://sketchfab.com;
frame-ancestors 'none'; base-uri 'self'; form-action 'self'
```

`img-src 'self' data: https:` permits **any** https host, so `https://<code>.goatcounter.com/count`
is already allowed and **`server.js` needs no edit**. No new script origin is introduced, because
no script is loaded.

> **Do not "upgrade" the transport to `navigator.sendBeacon` or `fetch()`.** Both are governed by
> **connect-src**, which is `'self'` plus two named hosts — the beacon would be blocked and would
> fail *silently*. That is exactly how Cloudflare Web Analytics collected nothing, and how the
> PubChem fetch failed before its host was added. If you ever need sendBeacon, add the host to
> connect-src in `server.js` **in the same commit**.

---

## 4. What is actually sent

Five fields, and no others:

| Field | Value | Worst case |
|---|---|---|
| `p` | the template (`/t/compound`) or event path (`e/search-issued/hit`) | a template name |
| `t` | **the same string as `p`** — never `document.title` | a template name |
| `e` | `1` on events | a constant |
| `s` | `screen.width` | a number GoatCounter uses to bucket device size |
| `r` | the **origin** of an *external* referrer, omitted entirely if same-origin | `https://www.reddit.com` |

Implicit in any HTTP request and not removable client-side: IP address, User-Agent, timestamp.
GoatCounter does not set cookies and does not store raw IPs.

`document.referrer` handling is deliberately harsher than it needs to be: a same-origin referrer is
dropped completely (it is the reader's previous RNAwiki URL — the exact disclosure this module
exists to withhold), and an external referrer is reduced to its **origin**, because a forum thread
whose URL names a condition discloses the reader's health state just as effectively as our own URL
would.

`navigator.webdriver` short-circuits the sender, so the QA harness (`probe.mjs`, headless Chrome)
can never move a count. Honest-by-default: a driven session is not a reader.

---

## 4a. GA4 specifically — the fields, the cookies, and the numbers that lie

### The fields

| GA4 param | value sent | worst case |
|---|---|---|
| `tid` | `G-TPLGY5M63B` | the property |
| `dl` (page_location) | `https://rnawiki.com` + **the template** — `/t/compound` | a template name |
| `dt` (page_title) | **the same template string.** Never `document.title` | a template name |
| `dr` (referrer) | the **origin** of an *external* referrer; omitted entirely if same-origin | `https://www.reddit.com` |
| `en` (event) | `page_view`, or the §5 vocabulary flattened to GA4's `[A-Za-z0-9_]` charset | see the mapping below |
| `cid` / `sid` / `_p` | random, **generated in memory at page load and never stored** | a number that dies with the tab |
| `ul`, `sr` | browser language, screen size | coarse device bucketing |
| `_s`, `seg`, `_et`, `_fv`, `_ss` | hit counter, engagement flag, ms between hits, first-hit flags | timing, no content |

The origin in `dl` is **hard-coded to `https://rnawiki.com`**, so a localhost or preview build
cannot report a second hostname into the property.

Nothing after a `?` is ever sent. `route()` splits the query off before `parts` exists, so
`/solve?q=<the reader's own words>` can only reach the sender as `/solve`.

**Event-name mapping.** GA4 event names may only contain letters, digits and underscores, so §5's
vocabulary is flattened at the point of sending — `e/search-chosen/compare-pair` →
`search_chosen_compare_pair`. No new names are introduced: the string was already validated against
`A_EVENTS` before it reached the sender, and the whole vocabulary is a small closed set against
GA4's 500-per-property limit. It needs **no custom dimensions configured in GA** to be readable.

### Cookies — the plain answer

**This install sets no cookies. It writes nothing to the reader's device at all** — no cookie, no
`localStorage`, no `sessionStorage`. A standard GA4 install writes `_ga` and `_ga_<id>`, first-party,
**two-year** expiry, containing a random identifier whose entire purpose is to recognise the same
browser across days. On a site whose URLs disclose a health interest, that is a persistent handle
attached to a health inference. Because `gtag.js` is never loaded, none of it is created.

So: **reading RNAwiki without an account is completely unchanged.** No banner, no prompt, no stored
identifier, nothing to opt out of, and nothing that follows anyone to another site.

### The consequence, stated before anyone misreads a dashboard

The identifier lives in a JavaScript variable for the life of one document load. Every SPA
navigation inside that load shares it (the SPA never reloads the document), and it is gone the
moment the page is closed or refreshed. Therefore, in the GA4 interface:

- **"Users" means page loads, not people.** A reader who comes back tomorrow is a new user.
- **"New users" ≈ "Users", and "Returning users" is permanently ~0.** These carry no information.
- **"Sessions" ≈ page loads.** There is no cross-visit stitching, by design.
- **"Average engagement time" is time *between* beacons.** It cannot see the last page of a visit,
  so read it as a floor, never as a measurement.
- **Campaign attribution (`utm_*`) is absent**, because those live after `?` and the rule is
  absolute. Channel grouping (Organic Search vs Referral vs Direct) is derived from `dr`, which is
  sent — confirm that in GA after 24 h rather than assuming it.
- **Ad blockers and Safari's tracking prevention block the collect host outright.** Every number
  here is a floor. And ~90% of readers never run JavaScript, so they are invisible to GA entirely —
  **GA is not a traffic count and must never be quoted as one.** Search Console is.

## 5. The event vocabulary

Every event is `e/<name>/<suffix>`, and **both halves are closed sets**. `RNA_A.ev(name, suffix)`
looks `name` up in `A_EVENTS` and requires `suffix` to be a member of that event's array; anything
else returns without sending. "A compound name can never be sent" is therefore a property of a data
structure, not a promise in a document.

### Wired now

| Event | Suffixes | Fires when | What is deliberately NOT sent |
|---|---|---|---|
| `e/search-issued/` | `hit`, `miss` | 900 ms after typing stops in the site search | the query text, and its length/rhythm (see below) |
| `e/search-chosen/` | any template name, or `other` | a search result is clicked | the result's title, href and position |
| `e/citation-outbound/` | `pubmed`, `pmc`, `ncbi`, `pubchem`, `fda`, `other` | an external link is clicked | the URL, and above all the **PMID** — a paper identifies a condition |

Page views are not events; they are the template path from §2.

**Why `search-issued` is debounced to a 900 ms idle rather than fired per keystroke:** `runSearch`
already runs on every `input`, so a naive emitter would send one third-party hit per character.
Even though the text never travels, that prefix series is a timing side channel that reconstructs
the length and rhythm of what the reader typed. One event per settled query, carrying one bit.

**Why `citation-outbound` is a single delegated listener:** app.js emits external links from many
`target="_blank"` call sites. One capture-phase listener cannot drift the way N edits can. Because
those links open a new tab, the page is not unloaded and the `Image()` request completes.

### Deliberately NOT in the vocabulary (yet)

The W1 analysis proposed five further events — a sprint start, a day logged, a receipt generated,
a share click, a chapter opened. **They are not declared and not emitted**, because declaring an
event that nothing fires would make this document claim collection that does not happen, and §0's
sibling rule is *never fabricate counts*. Add each one **with its emitter, in the same commit**,
and document it in the table above — the gate in §7 will refuse the build otherwise.

---

## 6. Adding an event — the checklist

1. Add the name and its **closed suffix array** to `A_EVENTS` in `site/app.js`.
2. Add the emitter call. The first argument **must be a single-quoted string literal** — the gate
   rejects a computed name, because a vocabulary you cannot read out of the source is not a
   vocabulary.
3. Add a row to §5 of this file containing the literal string `e/<name>/`.
4. Run `node build/parse.js`. It must print `analytics vocabulary OK`.
5. Ask the §0 question one more time: could the suffix, over many readers, identify a body?

---

## 7. The gate

`build/parse.js` → `assertAnalyticsVocabulary()`, which runs on every build and every deploy
(`prestart` is a hard `&&` chain: `node build/parse.js && node build/prerender.js && …`, so a
non-zero exit stops the deploy). It fails the build when:

- **(a)** any `RNA_A.ev(` call passes a non-literal event name;
- **(b)** an emitted event name is not a key of `A_EVENTS`;
- **(c)** a declared event is not documented in this file as `e/<name>/`;
- **(d)** `site/app.js` contains anything other than exactly one `goatcounter.com` endpoint;
- **(e)** `site/app.js` contains anything other than exactly one `google-analytics.com` collect
  endpoint, **or mentions `googletagmanager.com` at all** — a build-time proof that the
  enhanced-measurement leaks measured in §1a can never be switched on by a code edit;
- **(f)** `A_GA4` is not exactly one declaration, or is neither blank nor a well-formed
  `G-XXXXXXXXXX` measurement id (a typo there collects nothing, silently).

`build/prerender.js` → `assertPageviewIntegrity()` additionally pins, verbatim, the two lines that
send `dl` and `dt`, the two lines of `aRefOrigin()` that drop a same-origin referrer, and refuses
any reference to `document.title`, `location.search`, `location.href`, `location.pathname` or
`document.referrer` **inside `aGA()`** — which is how the query string and the page title would get
back in. The route replay proves the vocabulary covers the corpus; it is blind to the sender, and
these pins are the other half.

Check (a) is the one that matters. It is what makes §0 a build property: a call site cannot be
edited into `RNA_A.ev(name, compound.name)` without the build refusing.

Proven on 2026-08-01 by reintroducing the bug — `RNA_A.ev(evName, c.name)` at one call site made
the gate exit 1 on checks (a) and (b); reverting made it pass.

---

## 8. What this cannot tell you

Stated plainly so nobody later reads more into a dashboard than is in it:

- **No per-page popularity.** `/t/compound` is 170 pages in one bucket. Use Search Console.
- **No scroll depth or read time.** W0 measured a median 10.3% of a compound page and 33.8% of a
  target page visible in the default DOM state; this schema does not tell you whether that costs
  anything. That question needs a first-party, aggregate-only measurement and its own decision.
- **No per-reader funnel.** There is no id of any kind in these requests, so "did the person who
  searched also start a protocol" is unanswerable by construction. Only rates across the whole
  population are.
- **No outcome or efficacy data, ever.** That is out of scope permanently, not pending.

---

## 9. Open, for Felix

1. **Confirm ingestion — the one thing code cannot prove.** The collect endpoint returns `204` for
   anything, valid or not, so a successful response is **not** evidence that GA stored the hit.
   Open **GA4 → Reports → Engagement → Pages and screens**, last 7 days, and look for the marker
   path **`/t/ga-install-check`**, sent once by `curl` on 2026-08-06 (HTTP 204) with exactly the
   payload `aGA()` builds. That path exists nowhere else and can only have come from that request.
   If it appears, the transport is proven end-to-end and nothing further is needed. Real template
   paths (`/t/compound`, `/solve`, `/t/protocol`) should follow once the branch deploys.
   **If nothing appears after 48 h**, the payload is being
   dropped and the fallback is `gtag.js` plus a CSP edit — which costs the enhanced-measurement
   leaks in §1a and needs a consent decision. Do not conclude "it works" from the 204.
2. **GA4 Admin → Data streams → Enhanced measurement: turn all of it OFF.** Nothing in this repo
   loads `gtag.js`, so none of it runs today. Turn it off anyway: it is currently **ON** (measured,
   §1a), and the day a Google tag reaches these pages by any other route — the Search Console
   "install your Google tag" prompt, a Tag Manager snippet, a platform auto-injection — the site
   search / history page_view / outbound-click leaks switch themselves on with no code change and
   no build failure.
3. **GA4 Admin → Data collection: Google signals OFF, ads personalisation OFF; data retention 2
   months.** Page-type data from a health site should never join an advertising profile, and
   14-month retention buys nothing this property can use.
4. **`A_CODE` / GoatCounter.** It is inert and free to keep. If it is never going to be used, say so
   and it can be deleted — but check (d) in §7 must change in the same commit or the build fails.
5. **Remove `static.cloudflareinsights.com` from `script-src`?** Cloudflare Web Analytics is off,
   but the dashboard toggle exists and would auto-inject the beacon into every HTML response — at
   which point the full URL would be sent and blocked only by the *absence* of the apex host from
   connect-src, i.e. by accident rather than by design. Removing the entry makes it fail closed.
   This is a product decision (it permanently closes that option), so it has **not** been applied.
</content>
