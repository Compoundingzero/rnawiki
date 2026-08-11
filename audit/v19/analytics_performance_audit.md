# RNAwiki v1.9 — Analytics and performance audit

**Wave A · read-only.** No product code was changed. Author role: analytics / performance specialist.
**Date of measurement:** 2026-08-11. **Branch:** `refine/site-wide-2026-08`.
**Spec sections:** §12 Measurement · §13.4 metadata privacy · V19-PERF-001 · §9.2 never-public.

Evidence labels: **OBSERVED FACT** · **INFERENCE** · **PRODUCT DECISION** · **LEGAL-CLINICAL
DEPENDENCY** · **could-not-check**.

Measurement rig: headless Chrome via `probe.mjs`, **one fresh browser per route** (cold cache),
CDP `Network.setCacheDisabled`, Slow-4G emulation (1.6 Mbps down / 150 ms RTT) and **4× CPU
throttling** — the Lighthouse mobile profile. Raw output:
`/Users/admin/.claude/jobs/b8afc277/tmp/qa/out/wA_a11y/cwv2.txt`.

---

## 1. Executive summary

**Analytics is the best-engineered privacy surface in this repository, and it measures almost none of
what §12 asks for.** Both halves of that sentence are load-bearing.

**Performance is the single largest gap between this codebase and v1.9.** V19-PERF-001 sets
`p75 LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1` and "editor/wiki code route-loaded", against an initial-JS
target of ≤ 250 KB. The site ships **2,667 KB of compressed JavaScript / 12.64 MB decoded on every
single route**, blocking, before anything renders. That is **10.7× the budget compressed** and
**51.8× decoded**.

| # | Finding | Spec | Severity | Status |
|---|---|---|---|---|
| **P1** | **Initial JS 2,667 KB compressed / 12.64 MB decoded on every route vs ≤250 KB target** | V19-PERF-001 | **P0 (product-defining)** | existing |
| **P2** | **LCP 14.7–15.6 s on 3 of 8 routes** — the hydration swap becomes the LCP element | V19-PERF-001 | **P0** | existing |
| **P3** | **CLS 0.286 vs ≤0.1** — two 0.143 shifts, both from `FOOTER.foot` | V19-PERF-001, §10 | **P1** | existing, exact cause found |
| **P4** | **DOMContentLoaded 14.0–14.8 s on every route measured** | V19-PERF-001 | **P1** | existing |
| **P5** | **§12 asks for 13 event families; 3 exist.** North-star metric is uncomputable by construction | §12 | **P1** | absent |
| **P6** | **GA4 fires for every reader with no consent control, no opt-out, no DNT/GPC check** | §12, PDPA | **P1 (privacy)** | existing |
| **P7** | **`navigator.webdriver` early-return means no automated test ever exercises the beacon** | house rule | **P1** | existing |
| **P8** | `Cache-Control: no-cache` on unversioned 2.4 MB assets — long-lived caching impossible | V19-PERF-001 | **P2** | existing |
| **P9** | `/api/interest` + `interest_signups` still live for a removed feature — PII with no purpose | §9.2, PDPA | **P1 (privacy)** | removal scope |

---

## 2. P1 (P0) — the initial JavaScript payload

**OBSERVED FACT — cold cache, per route, from `PerformanceResourceTiming`:**

```
route                                      JS transfer   JS decoded   total decoded
/                                           2,667 KB      12.64 MB      13.02 MB
/c/creatine-monohydrate                     2,667 KB      12.64 MB      13.02 MB
/problem/knee-pain                          2,667 KB      12.64 MB      13.02 MB
/az                                         2,667 KB      12.64 MB      13.02 MB
/solve                                      2,667 KB      12.64 MB      13.02 MB
/target/SLC6A2                              2,667 KB      12.64 MB      13.02 MB
/studio                                     2,776 KB      13.80 MB      14.18 MB
/protocol/endurance-plateau/aerobic-base    2,809 KB      14.09 MB      14.47 MB
```

Per-file, measured over the wire with `Accept-Encoding: br, gzip`:

```
/data.js          2,412,320 B  Content-Encoding: br   (11,874,630 B decoded)
/app.js             232,948 B  br                     (899,877 B decoded)
/interactions.js     35,157 B  br
/head.js             33,192 B  br
/facts.js            11,064 B  br
/ixn-engine.js        4,749 B  br
/styles.css          79,684 B  br                     (401,505 B decoded, render-blocking)
```

`site/index.html` loads five of these as **classic, non-`defer`, non-`async`** scripts before
`</body>`:

```html
<script src="/data.js"></script>      <!-- 2.36 MB compressed -->
<script src="/facts.js"></script>
<script src="/interactions.js"></script>
<script src="/ixn-engine.js"></script>
<script src="/app.js"></script>
```

**`data.js` alone is 2,356 KB compressed — 9.4× the entire ≤250 KB budget — and it is downloaded,
decompressed and parsed on `/`, on `/az`, and on every compound, problem, target, pathway, muscle
and goal page, whether or not the route needs any of it.**

**This contradicts a live errata entry, and the contradiction is in the site's favour.** The W0
baseline records: *"`data.js` is brotli-compressed and deferred → **neither**. 11,662,047 B encoded
AND decoded, no ETag, `If-Modified-Since: 2040` returns the full body."* That is **no longer true**.
Measured today, `data.js` is served with `Content-Encoding: br` at 2,412,320 B, with a working
`ETag: "b53146-19fea2ee6a6"` and `Last-Modified`. Brotli was fixed between W0 and now. It is still
not deferred, and the file has grown from 11,662,047 to 11,874,630 B decoded.

**What v1.9 already accepts as the fix, partially built.** `site/app.js:4386` has a real lazy loader:

```js
async function ensureProtocolData() {
  if (!window.RNAWIKI_EXERCISES) jobs.push(loadScript('/exercises.js'));
  if (!window.RNAWIKI_FOODS)     jobs.push(loadScript('/foods.js'));
  ...
}
```

Confirmed working — `/exercises.js` (112 KB) + `/foods.js` (30 KB) appear in the resource list **only**
on `/protocol/*` and `/studio`, never on `/` or `/c/*`. So the route-loading pattern
V19-PERF-001 asks for is already implemented, understood, and proven in this codebase. It has simply
never been pointed at the 2.36 MB file.

**Repair shape (spec only).** Split `data.js` into a small index (names, slugs, ratings — what the
search box and A–Z need) plus per-record chunks fetched by the router, and route-load `interactions.js`
and `ixn-engine.js` the same way (they are only needed where the interaction checker renders).
Do **not** attempt this without a gate: assert in `build/parse.js` that the sum of `<script>` bytes
referenced by `site/index.html` stays under a declared ceiling, and **prove the gate by adding
`data.js` back**.

**PRODUCT DECISION.** This is architectural and touches the one 899 KB single-IIFE file the house
rules say only a designated integrator may edit. It is not a Wave-A change and I am not proposing one.

---

## 3. P2 (P0) — LCP fails on the content-heavy routes, and the reason is hydration

**OBSERVED FACT — cold cache, Slow 4G, 4× CPU.**

| route | LCP | FCP | CLS | DCL | load | long tasks |
|---|---|---|---|---|---|---|
| `/` | 2,280 ms | 2,280 | 0 | 14,771 | 14,784 | 3 / 782 ms |
| `/c/creatine-monohydrate` | 2,096 ms | 2,096 | 0.001 | 14,564 | 14,571 | 3 / 692 ms |
| `/problem/knee-pain` | 2,084 ms | 2,084 | 0 | 14,799 | 14,809 | 2 / 690 ms |
| `/solve` | 2,136 ms | 2,136 | 0 | 14,576 | 14,582 | 3 / 343 ms |
| `/target/SLC6A2` | 2,312 ms | 2,312 | 0 | 14,342 | 14,348 | 3 / 394 ms |
| **`/az`** | **14,732 ms** | 2,032 | **0.286** | 14,598 | 14,600 | 3 / 603 ms |
| **`/studio`** | **15,112 ms** | 1,976 | **0.113** | 14,017 | 15,061 | 3 / 374 ms |
| **`/protocol/endurance-plateau/aerobic-base`** | **15,616 ms** | 2,180 | **0.286** | 14,140 | 15,581 | 4 / 789 ms |

**INFERENCE, and it is well supported by the numbers.** On five routes LCP == FCP: the *prerendered*
document paints its largest element at ~2.1 s, hydration later replaces the DOM with something no
larger, and LCP never moves. On the other three, hydration at ~14.5 s produces a **larger** contentful
element than anything the prerendered document contained — the 171-row A–Z list, the Studio shell,
the protocol's expanded blocks — and Chrome records a **new LCP candidate at 14.7–15.6 s**.

**So the "two documents" architecture has a measurable performance cost that nobody has priced:
on any route where the hydrated page is visually richer than the prerendered one, LCP is not
determined by the prerender at all. It is determined by when 12.64 MB of JavaScript finishes.**

Five of eight routes pass ≤ 2.5 s — but by 190–420 ms, against a **localhost** server with a measured
TTFB of 6–36 ms. Railway from Singapore adds real TTFB. **INFERENCE:** the passing routes have almost
no field headroom and would likely fail p75 in CrUX. I did not measure real-world TTFB and will not
claim a field number.

`p75` cannot be computed at all from eight lab runs. **could-not-check** — a real p75 needs field
data, which needs the analytics that §12 asks for and P5 shows does not exist. The two findings are
the same finding seen from two ends.

---

## 4. P3 (P1) — CLS 0.286, and the culprit is one empty div in the footer

**OBSERVED FACT — layout-shift entries with their source node:**

```
/protocol/endurance-plateau/aerobic-base   CLS 0.286
    shift 0.143 @ t=14,136 ms   source: FOOTER.foot
    shift 0.143 @ t=15,555 ms   source: FOOTER.foot
/az                                        CLS 0.286
    shift 0.143 @ t=14,509 ms   source: FOOTER.foot
    shift 0.143 @ t=14,592 ms   source: FOOTER.foot
/studio                                    CLS 0.113
    shift 0.038 @ t=14,013 ms   source: FOOTER.foot
    shift 0.074 @ t=15,055 ms   source: FOOTER.foot
```

Two shifts, 1.4 s apart or less, therefore inside one 5-second session window, therefore they sum:
**0.286 vs the ≤ 0.1 target. 2.9× over.**

**Root cause, exact.** `site/index.html:55`:

```html
<footer class="foot">
  <div>💡 Tip: tap any underlined word …</div>
  <div class="foot-stats" id="foot-stats"></div>   <!-- ships EMPTY, filled by app.js -->
</footer>
```

`#foot-stats` is served with zero height and populated after hydration, twice — once when the corpus
stats are computed and once when the route-specific stats land. Nothing reserves its height.

**This is directly a §10 violation as well as a perf one.** §10: *"no automatic carousel, autoplay,
surprise panel, or **layout shift after Add**"*, and V19-BLD-002 requires *"no surprise overlay or
layout jump"*. A 0.286 CLS on the page a user is reading is the same defect class.

**Repair shape.** Reserve the box: `#foot-stats{min-height:<measured>px}` — or render the stats
server-side, since the corpus counts are already build-time constants (`assertCorpusCountCopy()`
proves the build knows them). The second option removes the shift *and* one hydration dependency.
Gate it with a headless CLS assertion over the smoke route set; **prove the gate by removing the
`min-height`.**

**Honest caveat.** These shifts occur at t≈14 s, i.e. after most readers on a fast connection would
already have the content. In the field, on fast devices, the shift will land earlier and may be
smaller. But it lands *after* first paint on every profile, which is the definition of the metric.

---

## 5. P5 (P1) — §12 asks for 13 event families and 3 exist

**OBSERVED FACT — the complete event vocabulary, `site/app.js:4045-4049`:**

```js
const A_EVENTS = {
  'search-issued':      ['hit', 'miss'],
  'search-chosen':      A_TPLV,
  'citation-outbound':  ['pubmed','pmc','ncbi','pubchem','fda','other'],
};
```

Plus one `page_view`. **Call sites in the entire 899 KB file: four.**

```
site/app.js:4131   RNA_A.ev('citation-outbound', …)
site/app.js:4172   RNA_A.ev('search-issued', hit|miss)
site/app.js:4181   RNA_A.ev('search-chosen', …)
site/app.js:10179  RNA_A.pv(parts)
```

§12 requires instrumentation for **thirteen** families:

| §12 event family | instrumented? |
|---|---|
| builder next-task completion | **no** |
| question destination completion / no-match | **no** |
| reviewed block search / add / default adjustment | **no** |
| participant preview and publish repair | **no** |
| tutorial start / completion / transcript | **no** |
| wiki-to-context return | **no** |
| evidence outcome change / source open | partial — `citation-outbound` covers "source open" |
| safety / unknown / blocked route | **no** |
| discussion question / accepted alternative / resolution | **no** |
| pending / settled / reversed Credit event | **no** |
| profile review / join, protocol preview, Active Journey privacy change | **no** |
| avatar / Marketplace browse and redemption state | **no** |
| *(search — not in §12's list but present)* | yes |

**The north-star metric is uncomputable by construction, and the codebase says so itself.**
§12: *"weekly returning informed participants in public Core Protocols."* `site/app.js:4038`:

```js
// ---- IDENTITY: MEMORY ONLY. No cookie, no localStorage, no sessionStorage …
// One document load = one cid …
const A_GID = (1 + Math.floor(Math.random()*2147483646)) + '.' + Math.floor(Date.now()/1000);
```

The comment then states the cost plainly: *"in this property 'Users' means page loads, not people."*
**"Weekly returning" requires cross-session identity. There is none, deliberately.**

**This is a genuine, principled conflict, not an oversight, and it needs Felix — not an agent.**
The anonymous-first constraint (house rule 3) and §12's north star are in direct tension. Options,
none of which I am authorised to pick:

1. Keep the north star and measure it **only for signed-in accounts**, stating publicly that the
   number covers accounts and not readers.
2. Keep memory-only identity and **replace the north star** with something it can actually compute
   (e.g. weekly *sessions* completing an informed action).
3. Introduce a consented, first-party, rotating identifier — which reopens the consent question in
   P6 and would need a PDPA view.

**PRODUCT DECISION + LEGAL-CLINICAL DEPENDENCY.** Do not let this be resolved by an implementation
agent adding a cookie.

---

## 6. P6 (P1, privacy) — the payload is exemplary; the consent posture is not

### What is genuinely excellent, and I went looking to break it

**OBSERVED FACT — the full GA4 request, `site/app.js:4085-4106`:**

```
https://www.google-analytics.com/g/collect
  ?v=2&tid=G-TPLGY5M63B&cid=<random>&sid=<ts>&sct=1&_p=<random>&seg=0|1
  &en=page_view|search_chosen_compound|…
  &dl=https://rnawiki.com/t/compound        ← the TEMPLATE, never the URL
  &dt=/t/compound                            ← never document.title
  &ul=en&sr=1440x900&_s=1&_fv=1&_ss=1
  &dr=<external referrer ORIGIN only>        ← same-origin referrer dropped entirely
```

I checked every channel §12 names and could not find a leak:

- **URL.** `aTemplate()` (`app.js:4051`) maps `/c/semaglutide` → `/t/compound`,
  `/problem/erectile-dysfunction` → `/t/problem`. `A_PUBLIC` is a **verbatim allowlist** of 18
  routes that encode no health interest, and anything unlisted falls to `/t/<template>` or
  `/t/other`. Its comment is the correct engineering: *"A route template added tomorrow and
  forgotten here fails **CLOSED** … it can never leak a health-encoding URL by omission."*
- **Query string.** `aTemplate()` receives **path segments only**, so `/solve?q=<typed symptom>`
  — a URL the site's own hero form generates — sends `/solve`. Verified by reading the call site
  at `app.js:10179` (`RNA_A.pv(parts)`).
- **Title.** `dt` is set to the template, never `document.title`. Compound titles read
  *"Bremelanotide (PT-141): dosage, evidence…"* and never leave the browser.
- **Referrer.** `aRefOrigin()` returns `''` for a same-origin referrer — because the reader's
  previous RNAwiki URL *is* the health disclosure — and only the **origin** of an external one.
- **Event names.** `RNA_A.ev()` rejects any suffix not in a closed array. A compound name cannot be
  sent because the data structure will not carry it.
- **PMID.** The outbound-citation listener sends the **host class only** (`pubmed`/`pmc`/…). The
  comment is right: *"The PMID is withheld: a paper identifies a condition."*
- **gtag.js is deliberately not loaded**, and `build/parse.js:3172` **fails the build** if
  `googletagmanager.com` appears in `app.js`. The comment documents the actual container fetch —
  `__ccd_em_site_search` with `vtp_searchQueryParams "q,s,search,query,keyword"`, which would have
  read the reader's typed symptom off the hero form.
- **No cookie, no `localStorage`, no `sessionStorage`.** Nothing is written to the reader's device.
- **A gate exists**: `build/parse.js:3127-3183` refuses to build if `app.js` emits an event that is
  not a key of `A_EVENTS`, or one that is not documented in `docs/EVENT_SCHEMA.md`.

**§12's prohibition — *"Do not send raw symptoms, medicine names, assessment answers, private
prescription values, or free-text health content to general analytics"* — is satisfied, and it is
satisfied structurally rather than by promise.** Same for §13.4's clause on metadata and
"server logs exposed to general analytics". This is the strongest privacy engineering in the
repository and it should be held up as the pattern for everything v1.9 adds.

### What is nonetheless wrong

**(a) There is no consent control and no opt-out. OBSERVED FACT:**

```
grep -a "doNotTrack|globalPrivacyControl|Do-Not-Track"  site/app.js server.js   ->  0 matches
```

`A_GA4 = 'G-TPLGY5M63B'` is live. Every reader — including a fully anonymous one who has consented
to nothing — causes an HTTP request to `google-analytics.com` carrying their **IP address**,
`User-Agent`, screen resolution and language. The template withholds the *health interest*; it does
not withhold the *reader*. IP + UA + `sr` + `ul` is a recognised fingerprinting surface, and the
recipient is a US ad-tech processor.

House constraint 3 says *"Reading … must work with **no account**"* — it does, but "no account" is
not the same as "no third-party beacon". A reader has no way to decline and no way to see that it
happens.

**Recommendation:** honour `navigator.globalPrivacyControl` and `navigator.doNotTrack === '1'` as an
early return in `aSend()` — two lines, no UI, no consent banner, and it respects the readers who have
already expressed the preference. Then a **PRODUCT DECISION + LEGAL-CLINICAL DEPENDENCY** on whether
Singapore PDPA / GDPR-for-EU-readers require more (a first-party proxy endpoint, or a genuine
opt-out control). This is not an agent's call.

**(b) A cross-check I ran and it came back clean.** I verified that the two switches are genuinely
independent and that the GoatCounter path is inert: `A_CODE = null` (`app.js:3993`), and `aSend()`
returns before building the GoatCounter URL. Only GA4 fires. No second beacon.

---

## 7. P7 (P1) — the beacon is invisible to every automated test

**OBSERVED FACT — `site/app.js:4108`:**

```js
function aSend(p, isEvent) {
  if (navigator.webdriver) return;   // headless Chrome / the QA harness must not move the counts
  aGA(p, isEvent);
  ...
}
```

The intent is right — a QA sweep of 568 routes must not inflate the counts. The consequence is that
**`aGA()` is never executed under automation**, so:

- no test can assert that `dl` carries a template and not a URL;
- no test can assert that a new route falls closed to `/t/other`;
- no test can assert that `dr` drops a same-origin referrer.

Everything that makes this module good is enforced by **code reading and a build-time string gate**,
and nothing by a runtime behavioural gate. **This is the project's own recurring lesson** — *"a gate
over an empty set always passes"* — in its purest form: the gate exists, the set it runs over under
test is empty.

**Repair shape.** Split the guard: build the URL always, and gate only the *send*.

```js
const url = aGA4Url(p, isEvent);          // pure, testable
if (navigator.webdriver) { window.__lastBeacon = url; return; }   // recorded, not sent
new Image().src = url;
```

Then a headless test walks a route sample and asserts `__lastBeacon` never contains a compound slug,
a problem slug, a `?q=` value or `document.title`. **Prove the gate by deleting one entry from
`A_PUBLIC`** and confirming the assertion fires.

---

## 8. P8 (P2) — caching

**OBSERVED FACT — response headers for every static asset:**

```
Cache-Control: no-cache
ETag: "b53146-19fea2ee6a6"
Last-Modified: Mon, 10 Aug 2026 05:39:30 GMT
Content-Encoding: br
```

`no-cache` means *revalidate on every use*. With `ETag` + `Last-Modified` present, a repeat visit
gets `304 Not Modified` rather than 2.4 MB — so bytes are saved, but a **full network round-trip is
spent on every asset on every navigation**. At the emulated 150 ms RTT that is a fixed ~150 ms per
asset before the first byte of anything, on top of the 14 s hydration.

**Root cause: the filenames are not content-addressed.** `data.js`, `app.js`, `styles.css` are stable
names, so `immutable` / `max-age=31536000` is unsafe — a deploy would serve stale code. `no-cache` is
the *correct conservative choice given the naming*. The finding is the naming, not the header.

**Repair shape.** Content-hash the filenames at build time (`data.<hash>.js`) — the machinery is
adjacent to work that already exists: `loadScript()` at `app.js:4388` already appends
`?v=window.__V`, so a version token is understood in this codebase. Then serve
`Cache-Control: public, max-age=31536000, immutable`. That converts a repeat visit from
*6 round-trips + revalidation* to *zero network*.

---

## 9. P9 (P1, privacy) — removal scope for the collection-of-interest feature

The owner's decision today: **remove the collection-of-interest feature entirely.** Here is the
complete verified surface, so nothing is missed.

**OBSERVED FACT — what is already gone.**

```
$ curl -s http://localhost:8099/ | grep -c 'action="/api/interest"'   ->   0
```

The form is off the landing page, as stated.

**OBSERVED FACT — what is still live.**

| artefact | location | state |
|---|---|---|
| `POST /api/interest` handler | `server.js:1045-1092` | live route; returns 403 to a cross-origin `curl`, i.e. an origin check, **not** a removal |
| `POST /api/interest/remove` handler | `server.js:1093-1104` | live route, 403 to `curl` |
| `interestAllow(ip)` rate limiter | `server.js:960` | live, holds IPs in memory |
| `interest_signups` table | `db.js:342-351` | **created on every boot** by `CREATE TABLE IF NOT EXISTS` |
| `idx_interest_created` | `db.js:351` | created on every boot |
| `/?state=…` stamping branch | `server.js:2692-2740` | documented as "NOW DARK, AND DELIBERATELY LEFT IN PLACE" |
| `data/site_config.json → interest.topics` | referenced `db.js:327` | closed topic vocabulary, still read |
| allowlist comment | `site/app.js:4024-4026` | correctly records that `/interest` was added and removed the same day |

**The privacy item, and it is the one that needs Felix.** `interest_signups` stores
`email TEXT NOT NULL UNIQUE` plus `topic_other TEXT` (free text) with a `remove_token`. The schema
comment is careful and correct — no name, no IP, no user-agent, no referrer — and it explicitly
refuses to reuse `newsletter_subscribers` because *"attaching old consent to a new purpose is the
thing PDPA exists to stop."* That reasoning is exactly right, and it now applies to **this** table:
once the feature is removed, every stored address is **personal data held for a purpose that no
longer exists**, and the only deletion path (`POST /api/interest/remove` with a token that was
emailed to the subscriber) will disappear with the route.

**could-not-check.** I have no Postgres connection in this sandbox, so **I do not know whether the
production table holds zero rows or many.** That single number decides whether this is a five-minute
cleanup or a notification obligation.

**Recommended removal order — deletion path last, not first:**

1. **Felix runs `SELECT count(*) FROM interest_signups;` against production.** If 0, everything below
   is trivial. If > 0, steps 2–3 change.
2. If rows exist: honour the promise those readers were given before removing the mechanism — either
   send the promised emails and then delete, or delete and tell them. **LEGAL-CLINICAL DEPENDENCY /
   PDPA** — not an agent's call.
3. `DROP TABLE interest_signups` (and its index) **only after** step 2, in its own migration.
4. Delete the two handlers (`server.js:1045-1104`), `interestAllow()` (`server.js:960`), and the dark
   `/?state=` branch (`server.js:2692-2740`).
5. Remove `interest.topics` from `data/site_config.json`.
6. Boot the server and hit `/`, `/api/interest` (expect 404, not 403) and the smoke route set —
   `node --check` will not catch a deleted function that still has callers.

**Note the same file already documents the correct precedent**: `server.js:1991-2010` closed
`POST /api/clinician-interest` by deleting the handler while **deliberately not dropping the rows**,
because those rows were still needed. Whether the same reasoning applies here is a *purpose*
question, and the answer differs — a clinician register has an ongoing use; an interest list for a
cancelled feature does not.

---

## 10. Payload-exclusion audit against §9.2 and §13.4

Checked every field §9.2 puts on the never-public list against every outbound channel I could reach.

| §9.2 forbidden field | in GA4 payload | in a URL | in `<title>`/`<meta>` | in JSON-LD | in a public sitemap |
|---|---|---|---|---|---|
| symptoms / outcomes / diagnoses | no — template only | **no** — `?q=` is `noindex,follow` and never sent | no | no | no |
| current medicines / supplements / doses | no | no | no — see `Drug` entity, name only | no | no |
| interactions / safety events | no | no | no | no | no |
| private notes / observation data / adherence | no | no | no | no | no |
| assessment answers / eligibility results | no | no | no | no | no |
| email / precise age / location | no | no | no | no | no |
| consent record | no | no | no | no | no |
| Credit balance / purchases / bookings | n/a — not built | n/a | n/a | n/a | n/a |
| raw analytics events | no — closed vocabulary | n/a | n/a | n/a | n/a |

**Verdict: V19-PRI-001's forbidden-field leak test PASSES on every surface that exists today.**
I could not make it fail. The caveat is that most rows are "not built", so this is a pass over a
partly empty set — and per the standing lesson, that is worth **less** than it looks. The test
becomes meaningful the day Profile, Discussion and Marketplace ship, and it should be written as an
executable gate *now*, while the correct answer is easy to assert.

---

## 11. What Wave A cannot decide

- **PRODUCT DECISION + LEGAL-CLINICAL DEPENDENCY** — the §12 north star vs anonymous-first identity
  (§5). Three options laid out; all three are Felix's.
- **PRODUCT DECISION + LEGAL-CLINICAL DEPENDENCY** — GA4 consent posture under PDPA/GDPR (§6).
  The two-line DNT/GPC guard is safe to do regardless; anything beyond it is not.
- **LEGAL-CLINICAL DEPENDENCY / PDPA** — `interest_signups` retention (§9), blocked on one
  `SELECT count(*)`.
- **PRODUCT DECISION** — splitting `data.js` (§2). Architectural, touches the single-IIFE file, and
  §14 puts "production deployment" behind a named human gate.
- **could-not-check** — real-world p75 CWV. Needs field data, which needs §12 instrumentation,
  which does not exist. Lab numbers here are lab numbers and are labelled as such throughout.
