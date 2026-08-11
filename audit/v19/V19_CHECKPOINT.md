# RNAwiki v1.9 — MANDATORY ASSESSMENT CHECKPOINT

**Status: STOP. No product code may change until Felix approves this checkpoint or selects slices.**
(Per `RNAwiki_Unified_Experience_v1_9_Claude_CLI_Prompt.md:237` — "Do not implement until a human
explicitly approves the checkpoint or selects slices.")

**Author:** Lead agent, Wave A synthesis · **Date:** 2026-08-11
**Branch:** `refine/site-wide-2026-08` · **Repo:** `/Users/admin/ClaudeRepo/Claude Projects/rnawiki`
**Inputs:** 20 Wave-A specialist audit files in this directory + `v19_gap_matrix.csv` (80 rows) +
`live_route_inventory.csv` + `evidence_ledger.csv`, plus my own independent re-measurement of every
load-bearing count below.
**Companion:** `V19_DECISION_LOG.md` (same directory) — every conflict resolved, every place the
supplied audits or the v1.9 spec were contradicted by the actual repository.

**Evidence labels used throughout:** `OBSERVED FACT` · `INFERENCE` · `PRODUCT DECISION` ·
`LEGAL-CLINICAL DEPENDENCY` · `could-not-check`.
**Document discipline:** every claim about what a *user* sees names a **hydrated** measurement; every
claim about a *crawler* names the **prerendered** bytes. The two are different documents on this site.

---

## 1. Repository / branch / dirty-state summary

`OBSERVED FACT` — re-run by me at 2026-08-11, not taken from a Wave-A summary.

| Item | Measured value | Command |
|---|---|---|
| Repo root | `/Users/admin/ClaudeRepo/Claude Projects/rnawiki` | — |
| Branch | `refine/site-wide-2026-08` | `git rev-parse --abbrev-ref HEAD` |
| Commits ahead of `main` | **27**, all unpublished | `git rev-list --count main..HEAD` |
| Working tree | **Clean apart from `?? audit/`** (this directory, untracked) | `git status --short` |
| HEAD | `0652877` "The honesty banner printed an invented count, and two routes were soft 404s" | `git log --oneline -3` |
| Runtime | Node, no framework, no bundler. `package.json`: **2 dependencies** (`@resvg/resvg-js`, `pg`), **0 devDependencies** | `package.json` |
| `prestart` | `node build/parse.js && node build/prerender.js && node scripts/anatomy/copy-assets.mjs && node build/precompress.js` — **no `\|\| echo`**, so `prerender.js` is a hard deploy gate | `package.json` |
| `server.js` | 3,157 lines | `wc -l` |
| `site/app.js` | 10,286 lines (one IIFE) | `wc -l` |
| `db.js` | 604 lines, **34** `CREATE TABLE IF NOT EXISTS` | `wc -l`, `grep -ac` |
| `studio-safety.js` | 337 lines | `wc -l` |
| `site/data.js` | 11,874,630 B — the largest tracked blob, **committed to git** | `ls -la` |
| Build gates | **52** self-invoking `(function assertX(){…})()` — 22 in `build/parse.js`, 30 in `build/prerender.js` | `grep -acE '^\(function assert[A-Za-z]+\(\) \{'` |
| Smoke test | `scripts/smoke.mjs` — **49** route template classes; imports `puppeteer-core`, which is **not in `package.json`** | source read |
| CI | **None.** `.github/workflows/` holds one file (a 6-hourly Postgres backup). No git hooks. | `ls` |
| Local server | `http://localhost:8099` returns 200; `dbEnabled:false` (no Postgres locally) | `curl -o /dev/null -w %{http_code}` |
| Production | `https://rnawiki.com` — `dbEnabled:true`, Cloudflare in front, brotli on all HTML and static | `curl -I` |

**The single most important line in this section:** the 27 commits are **unpublished**, and three of
them close a live privacy defect (§5, P0-P1). Every day they stay unpublished, the live site carries
a defect that is already fixed on disk.

---

## 2. Current route and data architecture

### 2.1 Four route classes

`OBSERVED FACT` — `site/sitemap.xml` (568 `<loc>`, re-counted by me), `find site -name '*.html'` (621
files), and the runtime tables in `server.js`.

**(a) Prerendered AND in the sitemap — 568.** Built by `build/prerender.js`, then **replaced**
client-side by `site/app.js route()` on hydration — except `KEEP_PRERENDERED =
['methodology','corrections','problem']`, the only three surfaces a reader sees as emitted.

| surface | count | notes |
|---|---:|---|
| `/c/*` compounds | 171 | renders a 7-chapter course (`.chapter{display:none}`) |
| `/compare/*` (+ `/compare`) | 124 | |
| `/target/*` | 103 | |
| `/protocol/*` | 52 | 18 collapsed `<details name="p-cause-acc">` (exclusive accordion) |
| `/problem/*` | 41 | **KEEP_PRERENDERED** |
| `/muscle` 17 · `/goal` 16 · `/pathway` 16 · `/learn`+5 · `/physiology` 4 · `/energy` 3 · `/body`+1 | 63 | |
| 13 singletons (`/ /about /anatomy /az /browse /corrections /legend /methodology /pathways /plan /solve /stack /where`) | 13 | |

**(b) Prerendered, deliberately NOT in the sitemap — 53.** 52 × `/fuel/<problem>/<root-cause>` +
`site/home.html` (a fragment). All 52 return 200 with `robots: noindex,follow`, correct
self-canonical, correct specific titles. `PRODUCT DECISION` pending Felix (§10, D-7).

**(c) SPA-only, no prerendered file — 25 prefixes** (`server.js:2900-2905`):
`about admin anatomy az body browse clinic exercise fork fuel legend me p pathways plan pro progress
pros s solve stack stewardship studio u where`.

**(d) API — 27 `/api/*` handlers** in `server.js`, one chokepoint `api()` with a three-layer write
guard (same-origin → UA blocklist → per-IP rate limit).

### 2.2 The structural hazard: four hand-maintained lists, one gate

`OBSERVED FACT` — `server.js:2900` `SPA_ONLY_ROUTES` (25) · `server.js:2944` `NOINDEX_ROUTES` (10) ·
`PRIVATE_ROUTES` in `site/app.js` · the `parts[0] === '…'` branches in `app.js route()`.

Only **one pair** is gated: `assertProfileDisclosesOnlyPublished()` part (3),
`build/parse.js:3676-3697`, parses `NOINDEX_ROUTES` out of `server.js` and `PRIVATE_ROUTES` out of
`app.js` and exits non-zero on asymmetry. (Note: `server.js:2942`'s comment names it
`assertPrivateRoutesAgree()`, which does not exist under that name — stale comment, recorded in the
decision log, **not** a missing gate.)

Nothing gates `SPA_ONLY_ROUTES ⊇ NOINDEX_ROUTES`. That is the exact mechanism that produced the live
`/clinic` `/exercise` `/fork` indexing defect (§5, P0-P2). **v1.9 adds Community, Discussion, Profile
and Flow-Builder routes — every one lands in these same four lists.** Gate the agreement before
adding routes, or the defect returns with more surface.

### 2.3 Data flow

```
data/*.json + content/*.md
   │  node build/parse.js         (22 gates; writes site/data.js — 11.87 MB)
   ▼
site/data.js  ──►  build/prerender.js  (30 gates; writes 621 .html + sitemap.xml + lastmod.json)
   │                                     │
   │                                     ▼
   └──────────────►  site/app.js  ──►  hydrated DOM (replaces the prerendered body on 618 of 621)
Postgres (34 tables, db.js)  ◄──►  server.js /api/*  ◄──►  app.js fetch
studio-safety.js  ── mirrored by ──►  build gates (assertStudioSafetyMirrorsBuildGates)
```

**Committed-vs-generated inconsistency** (`OBSERVED FACT`): `git ls-files` tracks `site/data.js`,
`site/app.js`, `site/exercises.js`, `site/foods.js` and 93 prerendered HTML files under
`site/problem/` (41) and `site/fuel/` (52), while `.gitignore` covers `site/c/`, `site/target/`,
`site/protocol/`, `site/compare/`. **Half the build output is ignored and half is committed**, which
contradicts the repo's own `CLAUDE.md` ("`site/` is ephemeral"). Recorded in the decision log.

### 2.4 What is genuinely already built (verified, do not rebuild)

`OBSERVED FACT` — each verified by a named specialist and spot-checked by me.

- **One universal account type.** `assertOneAccountType()`, `build/parse.js:3417`. Building, saving
  and running a protocol need **no account**; only publishing does (`server.js:1779`).
- **Protocol stacking already works, and better than the owner asked.** `mergedPlan()`,
  `site/app.js:5918`. Hydrated `/plan` with 5 and with 12 protocols renders **one** merged Today
  checklist with de-duplicated movements and supplements, unioned tools, max-wins fuel targets, and
  per-protocol Edit/Share/Remove.
- **Protocol Studio back end** — `studio_protocols` + `studio_clones` (`db.js:562-578`), dose
  ladders, restricted-compound withholding in the assembly catalogue, `studio-safety.js` mirroring
  all 5 build gates, `POST /api/protocols/check`.
- **Check-in data is fully structured at the data layer** — `data/protocol_safety.json` carries
  `metric`, `metricSource`, `checkpoint`, `stopIssue`, `stopHorizon` at **41/41**. Only the
  *rendering* is prose. (This corrects the W0 errata — see decision log D-11.)
- **The in-house analytics module is the best privacy engineering in the repo.**
  `site/app.js:3974-4110` sends the route *template*, never the URL, never `document.title`, no
  cookie, no `localStorage`, allowlist failing closed. **Preserve it exactly.**
- **Private-route noindex is correct on this branch** — all 10 `NOINDEX_ROUTES` return both the
  header and the meta tag on localhost. Sitemap has 0 private entries.
- **`Referrer-Policy: strict-origin-when-cross-origin`** is set; the classic symptom-URL leak to
  PubMed does **not** happen.

---

## 3. Live experience findings, with evidence

Every row below names the document it was measured in. Screenshots live under
`/Users/admin/.claude/jobs/b8afc277/tmp/qa/out/`.

| # | What a visitor or creator actually gets | Document | Evidence |
|---|---|---|---|
| L1 | `https://rnawiki.com/u/felix` returns **HTTP 200** with `<meta name="robots" content="index,follow,max-image-preview:large">` and renders the **home page**. Same for `/pros /pro /s /stewardship /u/ /clinic`. | prerendered + hydrated | **I re-ran this myself at 08:27 UTC 2026-08-11**: `curl -D- https://rnawiki.com/u/felix` → `HTTP/2 200`, no `X-Robots-Tag`, robots meta = `index,follow`. Pixel proof: `md5` of `prod-home.png prod-pros.png prod-stew.png prod-u-felix.png` all `b1a304f48efaff04425236e716e25750`. |
| L2 | `https://rnawiki.com/exercise` and `/fork` are **self-canonical, index-eligible pages that hydrate to two words** ("Loading exercise…" / "Loading variation…") and never resolve. | hydrated, both origins | **I re-ran `/exercise` myself**: 200 + `index,follow`. Root cause `server.js:2900` vs `:2944`. **Not fixed by the 27 commits.** |
| L3 | On `/c/testosterone-trt`, `/c/epo-erythropoietin`, `/c/low-dose-lithium`, `/c/estradiol-menopausal-hrt` the page offers **`+ Add to stack`**. 88 of the 95 compounds marked `consumer_renderable:false` carry that button. | hydrated 1440×900 | `out/w19/cta2.mjs`. Mechanism `site/app.js:2356` + `compoundTier()` `:1945` — a **regex over free prose**, not the authored `regulatory_class`. |
| L4 | A `/fuel/<problem>/<cause>` page generates the supplement stack by **whole-compound star rank with no regulatory filter**. 39 of 52 protocols produce a stack containing a prescription, controlled or unapproved compound, each with `+ Add`. e.g. `low-testosterone/primary-hypogonadism` → Testosterone (TRT), HCG, Clomiphene, Finasteride, **Insulin (prescribed)**. | hydrated | `site/app.js:4656-4666`, algorithm replayed over all 52 causes. |
| L5 | `/plan` pre-**ticks** prescription-only compounds onto the daily "mark taken" checklist. Row 6 DOM verbatim: `<input type="checkbox" class="plan-cb" data-done="c159" aria-label="Mark Statins (Atorvastatin/Rosuvastatin) taken">`. 39 of 52 causes contain ≥1 such compound; across a 12-problem union, 10 of 28 stack rows are non-renderable and **0 of 28 rows carry any word like prescription/doctor/pharmacist**. | hydrated 1440×900 | `site/app.js:5356` `selSupps()` defaults to `allSupp`, every checkbox checked. The withholding filter exists only in `catalogSearch('stack')` (`:5179`), whose own comment claims the opposite. |
| L6 | On `/studio` a visitor **with no account** can add **Insulin** and the app answers with a dominant green **"✅ NOTHING FLAGGED"**. The row asserts "the dose its own page publishes" — false; `/c/insulin-prescribed` publishes a refusal. | hydrated | `out/wa_ds/studio_two_items.png`. Root cause `build/parse.js:295` derives `isRx` **only** from the approval emoji; insulin's 🟢 badge text literally reads "(essential medicine; prescription only)". Only badge/`isRx` mismatch in 171 compounds. |
| L7 | A published protocol page `/p/<code>` headlines **"✅ NOTHING FLAGGED, CHECKED JUST NOW"** in caps over a coverage of **0 of N**. Reachable with five ordinary supplements. | hydrated 1440×900, real `app.js`/`styles.css`, only the API response stubbed | `out/w19/pverdict.mjs`; `site/app.js:9530`. `/stack` gets this right — the fix is to make `/p/` behave like `/stack`. |
| L8 | On `/plan` with 12 protocols stacked, a **☠️ danger-tier** interaction (additive hypoglycaemia: Berberine + Metformin + Acarbose + Semaglutide + Tirzepatide) is computed correctly and then **hidden inside a `<details>` that is closed by default**, behind the summary "🔬 Interaction & safety check — tap to view" with no danger count. | hydrated, open state read before any interaction | `site/app.js:6022` computes it; `:6033` buries it. |
| L9 | A visitor building a plan for **rotator-cuff impingement** can search "military" in "+ Add your own movement", get 5 results, add **Machine Shoulder (Military) Press**, and see **no warning of any kind**. That cause's own `avoid_movements` list contains "military press". | hydrated | `out/builder_contra2.mjs`. `catalogSearch` (`app.js:5192-5203`) applies no eligibility filter to movement buckets while the **stack branch in the same function** withholds 95 compounds and names them. |
| L10 | The rule that would have caught L9 (`studio-safety.js:131` `contraindicated-move`) **is never armed**. Proven by running the API both ways: same spec without `base_pid/base_rcid` → `{"ok":true,"refusals":[]}`; with them → `{"ok":false,"refusals":[{"rule":"contraindicated-move",…}]}`. `app.js:795` never sends them. | API executed | A gate over an empty set always passes. |
| L11 | **Frog Hops** — whose own instructions read "Jump forward several feet… Repeat this action 5-10 times" — is served under the heading **"🧘 Stretches"** to a **patellofemoral-pain** protocol as "2 × 30s hold · rest 20s · ease to mild tension, never pain". | hydrated | `out/cue.mjs`. Only record in the corpus with `kind==='stretch'` AND `move_tags` containing `power_plyometric` — machine-detectable, therefore gateable. Six more jumping/lunging records carry the same 30s hold. |
| L12 | **1,007** "← Easier variation / Harder variation →" links ship as prescriptive scaling. 276 (27.4%) share **zero** primary muscle with their source; 231 flip push↔pull; **61 "Easier" edges increase equipment demand** (Clock Push-Up, body only → *Easier* → Alternating Floor Press, kettlebells). | full-corpus computation + hydrated render on `/#/exercise/Barbell_Squat` | Derived in `scripts/enrich-exercises.js` from `move_tags[0]` + a `level` string. |
| L13 | **873 of 873** movement pages carry **no stop rule**, and the canonical page **drops** the only authored safety string in the dataset: `/#/exercise/Calf_Stretch_Elbows_Against_Wall` shows "2 × 30s hold · rest 20s · isolation · static" while the *same record's* builder card shows "…· ease to mild tension, never pain". | hydrated, both surfaces | `app.js:8710` appends `equipment·mechanic·force` after `rxLine(e)` and never `rx.cue`. |
| L14 | The Studio silently converts a **30-second hold into "3 × 10"**. Adding "Calf Stretch Elbows Against Wall" renders "3 × 10 · every day" with Sets/Reps steppers and a 💪 icon. | hydrated 390×844 | `app.js:9130, 9140-9141` branch only on `it.k==='x'` with hard-coded 3 and 10; no hold field, no seconds unit. |
| L15 | The blood-pressure tool triages on the **7-day mean only**. Logging 120,118,122,119,121,118 then **200/125** yields `avgS=133` and prints **"🟡 Slightly raised — you're on the right track."** There is no urgent tier at all. | source read, arithmetic within the tool's own code | `site/app.js:5800-5810`. Thresholds are inline literals with no source and no population. |
| L16 | Two of the site's tools promise "the bot nudges you nightly" / "the bot reminds you". The Telegram bot was **deleted on 2026-07-28**. The widget renders as a **static paragraph** — no input, no time picker, no notification permission. | source read | `site/app.js:5291-5297`, `:5778`; `server.js:679, 825, 1017`. |
| L17 | An anonymous reader **cannot log food**: "🔒 Sign in to log your meals." The scanner and add-food controls are not in the DOM at all. Yet the storage is `localStorage` (`FUEL_KEY`) and is never sent to the server — **nothing technical requires the account**. | hydrated, signed-out, 1440×900 | `app.js:8155-8171`, gate at `:8207`. Violates AGENT_RULES constraint 3 (anonymous-first). |
| L18 | 38 nutrient targets across 31 protocols track a nutrient the food database **cannot measure**: omega-3 has 18 targets and 16 of 656 foods carry a value (2.4%); choline 4 targets / 10 foods (1.5%); vitamin D 7 / 31 (4.7%). The progress bar can never fill. | data census + hydrated render | `nutrition_data_audit.md` §2. |
| L19 | Any signed-in user can write arbitrary kcal/protein/sodium into the food database; it goes **live instantly for every reader**, and the submitter is **paid 20 reputation on insert**. | source read | `server.js:1729-1732`; modal copy "It goes live instantly for everyone… +20 reputation." |
| L20 | **Four cookieless `curl` requests** put "⚠ More readers said this did not help than said it did" on a real clinical protocol page, rendered in orange at 326×20 px. The same door forges the results ledger (`{"better":4}`) and the "🧬 4 people are building this plan" line, and inflates a published protocol's public clone count. | API executed + hydrated render + screenshot `out/w19_badge.png` | `resolveParticipant()` mints a **fresh** signed anonymous cookie per cookieless request, so `UNIQUE(target_id, voter_key)` never fires. |
| L21 | 52 `/protocol/*` pages **scroll sideways at 320 CSS px** (= 1280 px at 400% zoom): `documentElement.scrollWidth=345` on 5 of 5 sampled. | hydrated 320×600, screenshot `out/wa_ds/reflow320.png` | One line: `site/styles.css:3269` `.cause-tier{…;white-space:nowrap}`. |
| L22 | Every movement page runs an **infinite, unpausable image animation that survives `prefers-reduced-motion: reduce`** — measured `{animationName:'exflip', iterationCount:'infinite', playState:'running', pauseControl:false}` with reduce emulated. Applies to 873/873. | hydrated with `emulateMediaFeatures` | `styles.css:1561-1562`; none of the 10 reduced-motion blocks mentions `.ex-demo`/`exflip`. |
| L23 | Every route ships **2,667 KB of compressed / 12.64 MB decoded JavaScript before anything renders** — 10.7× the v1.9 budget compressed, 51.8× decoded. LCP **14.7–15.6 s** on 3 of 8 routes; DOMContentLoaded 14.0–14.8 s on every route; CLS 0.286 vs ≤0.1. | headless Chrome, cold cache, Slow-4G + 4× CPU (Lighthouse mobile profile) | `out/wA_a11y/cwv2.txt`. |
| L24 | On **6 of 9** sampled routes the most visually dominant control in the first screen is the floating **"💬 Feedback"** widget. `/protocol/*` has **zero** product controls in the entire first 900 px — breadcrumb, title, then a 230-word red safety block. | hydrated 1440×900 | `wa_measure.mjs`; screenshots `1440__studio.png`, `1440__protocol_knee_pain_patellofemoral_pain.png`. |
| L25 | Reading level: **median Flesch–Kincaid Grade 10.5** across a random 24-route prose sample; 17 of 23 routes at Grade 9+. Line length on desktop is roughly double every guideline — `/problem/knee-pain` serves 174 paragraphs at a **138-character** median measure. | hydrated 1440×900, `<p>` elements only | Cause: `--maxw:1080px` (`styles.css:36`) applied to text rather than layout; no breakpoint above 900 px anywhere. |
| L26 | The new landing headline is **not implemented**. h1 on both origins is still "Turned away, priced out, or told it was nothing." The protocol search bar Felix required **is** present — three real GET forms, all `action="/solve"`. | prerendered + hydrated | Copy is generated by `build/landing.js` and gated by `assertLandingPage()`; `build/prerender.js:4478-4491` requires every home form to be `action="/solve" method="get"` with `#hero-solve-input`, `#close-solve-input` and submit text "Show me the causes". |

### 3.1 Explicit non-findings — recorded so they are not rediscovered as false positives

`OBSERVED FACT`. Each of these looked like a defect and is not:

1. `/studio` "Clear" **does** confirm and does not lose data (`confirm()` intercepted; `localStorage`
   byte-identical with the dialog dismissed).
2. The ▲▼ controls on Studio rows are **reorder** buttons, not dose steppers (accessible name:
   "Move Insulin (prescribed) up. Currently 1 of 1").
3. The six 1 px `input.pgl-c` elements on `/problem/knee-pain` are a correct visually-hidden pattern,
   not target-size failures.
4. Focus is **not** globally broken — 0 of 18 tabbed elements on `/` lacked an indicator.
5. `html{scroll-behavior:smooth}` **is** correctly guarded by `prefers-reduced-motion`.
6. `assertPrivateRoutesAgree()` **does** exist, as part (3) of `assertProfileDisclosesOnlyPublished()`
   (`build/parse.js:3676-3697`). Only the comment naming it is stale.
7. `GET /api/outcomes/public` (the "X% of N improved" sentence) is **genuinely protected** —
   `COUNT(DISTINCT user_id)`, floored at n<20, accounts require Google sign-in. It is the *anonymous*
   counters that are forgeable, not this one.
8. The `probe.mjs` harness field `anchorDead` counts `#/route` SPA links as dead in-page anchors.
   On `/studio` it reports 6; the true count is **0**. **Do not quote that field.**

---

## 4. Requirement gap matrix — TOTALS by severity and status

Source: `v19_gap_matrix.csv`, 80 rows, one per v1.9 requirement. Re-tabulated by me from the CSV.

### 4.1 By severity

| Severity | Count | % |
|---|---:|---:|
| **P0** | 3 | 3.8% |
| **P1** | 24 | 30.0% |
| **P2** | 39 | 48.8% |
| **P3** | 14 | 17.5% |
| **Total** | **80** | 100% |

### 4.2 By status

| Status | Count | % |
|---|---:|---:|
| **partial** | 34 | 42.5% |
| **absent** | 28 | 35.0% |
| **existing** | 12 | 15.0% |
| **blocked** | 3 | 3.8% |
| **contradictory** | 3 | 3.8% |

### 4.3 Severity × status cross-tabulation

| | absent | blocked | contradictory | existing | partial | **total** |
|---|---:|---:|---:|---:|---:|---:|
| **P0** | 2 | 0 | 1 | 0 | 0 | **3** |
| **P1** | 9 | 1 | 2 | 1 | 11 | **24** |
| **P2** | 10 | 1 | 0 | 6 | 22 | **39** |
| **P3** | 7 | 1 | 0 | 5 | 1 | **14** |
| **total** | **28** | **3** | **3** | **12** | **34** | **80** |

### 4.4 By requirement family

`V19-BLD` 15 · `V19-OWN` 7 · `V19-DIS` 6 · `V19-CMP` 6 · `V19-SEO` 5 · `V19-IA` 4 · `V19-COM` 4 ·
`V19-PRO` 4 · `V19-EXE` 4 · `V19-AVA` 3 · `V19-MOB` 3 · `V19-PRI` 3 · `V19-SAFE` 3 · `V19-A11Y` 2 ·
`V19-GOV` 2 · one each: `V19-REW`, `V19-NUT`, `V19-TOOL`, `V19-AUTH`, `V19-PERF`, `V19-VOCAB`,
`V19-STATE`, `V19-MEAS`, `V19-DOC`.

### 4.5 Proposed owner

`Content macro` 31 · `UX macro` 19 · `Integrator` 19 · `none` 7 · `Content macro + integrator` 2 ·
**`OWNER` 2** (the two that only Felix can settle).

### 4.6 Evidence quality

`OBSERVED FACT` 78 of 80 · `INFERENCE` 2 of 80. Confidence: high 71, medium 9. **No row is
speculative.**

### 4.7 The number that will mislead you if you stop reading here

**The matrix says 3 P0s. The specialists found 41.** This is not a contradiction; it is two different
questions, and it is the single most important interpretive point in this checkpoint.

- The **matrix** scores *"does the shipped product conform to this v1.9 requirement?"* Most v1.9
  requirements describe things that do not exist yet, so "absent" is the honest answer and the
  severity is the severity of *not having built it*.
- The **P0 register in §5** scores *"is the product that is live right now dangerous, leaking, or
  lying?"* Those defects are mostly **outside** v1.9's requirement list, because v1.9 does not have a
  requirement saying "do not pre-tick statins onto a knee patient's daily checklist."

**Both totals are correct. Use §5, not §4, to decide what to fix first.**

---

## 5. P0 safety / privacy / data-loss issues

**41 P0-class defects, consolidated and de-duplicated across 20 specialist audits.** Grouped by
class, most consequential first within each group. Every row names its evidence.

### 5.1 SAFETY — the site hands out prescription-only and contraindicated things (19)

| ID | Defect | Where | Class |
|---|---|---|---|
| **P0-S1** | 88 of 95 restricted compounds ship a one-tap **`+ Add to stack`** — Trenbolone, Nandrolone, Clenbuterol, HGH, EPO, Testosterone, Ketamine, Adderall, Methylphenidate, Psilocybin, Semaglutide, RAD-140, Low-Dose Lithium, HRT. Which ones lose the button is decided by a **regex over free prose** (`compoundTier()`), not by the authored `regulatory_class`. | `site/app.js:2356`, `:1945` | `LEGAL-CLINICAL DEPENDENCY` — Medicines Act 1975 s.51 |
| **P0-S2** | The `/fuel` stack generator ranks by **whole-compound star** with no regulatory filter, no claims check, no interaction check. 39 of 52 protocols emit ≥1 prescription/controlled/unapproved compound with `+ Add`. | `site/app.js:4656-4666` | `LEGAL-CLINICAL DEPENDENCY` |
| **P0-S3** | `/plan` **pre-ticks** prescription-only compounds onto the daily "mark taken" checklist on 39 of 52 causes, with **zero** regulatory labelling on any row. | `site/app.js:5356` | `LEGAL-CLINICAL DEPENDENCY` |
| **P0-S4** | 34 compounds fail **both** v1.9 §8.2 gates simultaneously (risk policy AND coverage) and still get the button — incl. HGH (controlled), EPO (controlled), D+Q (controlled), Low-Dose Lithium. | computed over `site/data.js` + `ixn-engine.js covered()` | `LEGAL-CLINICAL DEPENDENCY` |
| **P0-S5** | **Insulin** is addable on `/studio` with no account, over a dominant green "✅ NOTHING FLAGGED", with a row that falsely claims to use "the dose its own page publishes". Root cause: `isRx` derived from the approval **emoji**, so a 🟢 badge whose text says "prescription only" classifies as not-Rx. | `build/parse.js:295`; record `c132` | `LEGAL-CLINICAL DEPENDENCY` |
| **P0-S6** | `/p/<code>` headlines **"✅ NOTHING FLAGGED, CHECKED JUST NOW"** over 0-of-N coverage. Reachable with five ordinary OTC supplements. This is the W3 defect class ("a negative safety claim from an empty knowledge base") on a newer surface. | `site/app.js:9530` | `OBSERVED FACT` |
| **P0-S7** | The **☠️ danger-tier** interaction panel on `/plan` is computed and then hidden in a `<details>` closed by default, with the danger count absent from the summary. This is precisely the owner's decision "if drugs overlap, warn" — built, then muted. | `site/app.js:6022` / `:6033` | `OBSERVED FACT` |
| **P0-S8** | The **emergency (995/A&E) tier** is authored for 4 problems and reachable from the primary CTA on **0**. | `site/app.js:1359-1370` | `LEGAL-CLINICAL DEPENDENCY` |
| **P0-S9** | `studio-safety.js` rule R2 `contraindicated-move` is **never armed** — the client never sends `base_pid`/`base_rcid`, so the root cause is always null and `avoid_movements` always empty. Proven by running the API both ways. | `site/app.js:795, 8855, 9422` | `OBSERVED FACT` |
| **P0-S10** | The `/plan` builder — the path a person actually reaches from a protocol page — **never calls the safety checker at all**, and its movement search applies **no** eligibility filter. Military Press added to a rotator-cuff plan, silently. | `site/app.js:5192-5203` | `OBSERVED FACT` |
| **P0-S11** | **Frog Hops**, a plyometric jump drill, served under "🧘 Stretches" to a patellofemoral-pain protocol as a 30-second hold with a passive-stretch sensation cue. Six more jump/lunge records carry the same 30 s hold. | `site/exercises.js`; hydrated | `LEGAL-CLINICAL DEPENDENCY` |
| **P0-S12** | **1,007** machine-derived "Easier/Harder" scaling links ship as prescription. 276 share zero primary muscle; 61 "Easier" edges *increase* equipment demand. | `scripts/enrich-exercises.js`; `app.js:8703` | `OBSERVED FACT` |
| **P0-S13** | **873 of 873** movement pages have no stop rule, and the canonical page **drops** the one authored safety string ("ease to mild tension, never pain") that the builder card shows. | `site/app.js:8710` | `OBSERVED FACT` |
| **P0-S14** | The Studio silently reinterprets a **30-second hold as 10 repetitions**, on the one surface that can be published to other people. | `site/app.js:9130, 9140-9141` | `OBSERVED FACT` |
| **P0-S15** | The blood-pressure tool triages on the **7-day mean only** and prints "you're on the right track" over a 200/125 reading. No urgent tier exists. Thresholds are unsourced inline literals. | `site/app.js:5800-5810` | `LEGAL-CLINICAL DEPENDENCY` |
| **P0-S16** | Two reminder tools promise a **Telegram bot deleted on 2026-07-28** and render as static paragraphs with no controls. | `site/app.js:5291-5297`, `:5778` | `OBSERVED FACT` (honesty) |
| **P0-S17** | 38 nutrient targets across 31 protocols track nutrients the food database cannot measure (omega-3 2.4% coverage, choline 1.5%, vitamin D 4.7%) — the bar can never fill. | data census | `OBSERVED FACT` (honesty) |
| **P0-S18** | User-submitted foods **publish instantly, unmoderated**, and pay 20 reputation on insert, into the database that drives every protocol's nutrient targets. | `server.js:1729-1732` | `OBSERVED FACT` |
| **P0-S19** | *(v1.9 prototype, not shipped)* The publish gate does not implement §3.12 rules 1 and 2. **Proven by mutation**: re-pointing "After a new injury or with severe symptoms" from Urgent guidance into a self-care Plan yields the banner **"All routes terminate safely."** Rules 7, 8, 9 are also absent. | `vfb.js:60`, `questionGraphIssues()` | `OBSERVED FACT` |

### 5.2 PRIVACY / LEGAL (12)

| ID | Defect | Where | Class |
|---|---|---|---|
| **P0-P1** | **LIVE NOW.** `https://rnawiki.com/u/<handle>` returns 200 with `index,follow` for every handle and renders the home page. A named person's profile URL space is inviting Google to index it. **The fix is committed on this branch and unpublished.** | `server.js:2944` + `:3050-3067` (fixed); production not deployed | `OBSERVED FACT` — re-verified by me today |
| **P0-P2** | **LIVE NOW, and NOT fixed by the 27 commits.** `/exercise` and `/fork` are self-canonical, index-eligible, two-word pages; `/clinic` is a full 1,148-word duplicate of the landing page at 200 + `index,follow`. | `server.js:2900` vs `:2944` | `OBSERVED FACT` — re-verified by me today |
| **P0-P3** | `clinician_interest` retains **name, email, discipline, country, professional licence number and a base64 photograph of a credential document** for a verification programme **abolished on 2026-07-30**, and `GET /api/clinician-photo` still serves the photographs. Access control holds (`isSuper` → 403, not bypassed). The code's own comment calls it "the largest data liability on this site". | `db.js:301-314`, `server.js:1991-2016` | `LEGAL-CLINICAL DEPENDENCY` |
| **P0-P4** | `GET /api/shared-plan` publishes, to anyone holding a code and with **no consent step**, a health problem + its root cause + the **supplement/compound list** + the author's **handle**. v1.9 §9.2 forbids all three. | `server.js` | `LEGAL-CLINICAL DEPENDENCY` |
| **P0-P5** | **No age gate of any kind exists.** Zero matches for `under 18` / `age gate` / `date of birth` / `youth` / `minor` / `guardian` across `server.js`, `db.js`, `site/app.js`, `build/parse.js`. The earlier PRD's "production fallback is 18+" is unimplemented — **there is no flag to keep disabled.** | measured grep | `LEGAL-CLINICAL DEPENDENCY` |
| **P0-P6** | **Research consent is absent, not default-on.** Google sign-in creates no `user_consent` row, and the check-in gate treats a **missing row as permission**. `db.js:418` states the opposite contract. | `server.js`, `db.js:418` | `LEGAL-CLINICAL DEPENDENCY` |
| **P0-P7** | The research **export ignores consent entirely** — `/api/admin/export?type=checkins` selects all `outcome_checkins` joined to demographics with no consent filter. | `server.js` | `LEGAL-CLINICAL DEPENDENCY` |
| **P0-P8** | **No account-deletion path exists.** `DELETE /api/mydata` erases research data and explicitly keeps the account; `explain_posts.handle` survives as a snapshot string regardless. v1.9 §9 requires deletion to remove the public projection. | `server.js` | `LEGAL-CLINICAL DEPENDENCY` |
| **P0-P9** | The interest-list **removal UI is dark** while `POST /api/interest` still accepts writes. A reader handed a removal link cannot exercise it from any page. | `server.js:1045`, `:1093` | `OBSERVED FACT` |
| **P0-P10** | **Cloudflare Web Analytics** is deliberately CSP-allowlisted and auto-injected, and its beacon sends `location.href` — including `/solve?q=<the reader's typed symptoms>` — and `document.title` (compound names). These are the **two exact channels** the in-house analytics module was built to avoid. | CSP header (I read it live today: `script-src … https://static.cloudflareinsights.com`) | `INFERENCE (strong)` — live beacon capture named as the confirming check |
| **P0-P11** | Four unauthenticated public endpoints violate the profile gate's own banned-pattern list; the gate reads **one** handler and never inspects them. Includes a handle × named-health-protocol join. | `server.js` | `OBSERVED FACT (source)` |
| **P0-P12** | `GET https://rnawiki.com/api/stats` returns **`{"experiments":20,"improved":1,"helped":19}`** unauthenticated — an aggregate efficacy ratio. AGENT_RULES forbids shipping one. Nothing renders it (**0** call sites in `app.js`), so removing the endpoint costs nothing. | I re-ran this today | `OBSERVED FACT` |

### 5.3 SECURITY / INTEGRITY (4)

| ID | Defect | Where | Class |
|---|---|---|---|
| **P0-X1** | Rotating a spoofed `X-Forwarded-For` defeats **every** per-IP control on the site — `clientIp()` takes `[0]`, which behind a proxy is whatever the attacker typed. | `server.js:877-880` | `OBSERVED FACT` (executed) |
| **P0-X2** | The write guard is **not an authorisation** and **there is no CSRF token** — `Origin:` + a browser UA passes all three layers. | `server.js:866-978` | `OBSERVED FACT` |
| **P0-X3** | **Four cookieless requests** publish "⚠ More readers said this did not help" on any of the 52 clinical protocol pages, forge the public results ledger (`better:4`), and produce the reader-visible sentence "🧬 4 people are building this plan". `resolveParticipant()` mints a fresh signed identity per cookieless request. The 2026-08-01 fix stopped the caller *naming* a key; it did not bound how many keys one caller can be **issued**. | `server.js:457`, `:462`, `:1542` | `OBSERVED FACT` (executed + hydrated + screenshot) |
| **P0-X4** | The same trick inflates a **published, public** protocol's "how many people started it", which is the sort key of the "MOST USED" index, and farms the author's reputation. | `server.js:1940`; `idx_studio_used` | `OBSERVED FACT` (executed) |

### 5.4 DATA-LOSS (2)

| ID | Defect | Where | Class |
|---|---|---|---|
| **P0-D1** | *(v1.9 prototype)* **"Remove Plan" destroys a Plan and all its actions with no confirmation and no undo** — while *adding* an action, the reversible mutation, is the one that got a 6-second undo. No undo stack, no redo; keyboard undo unreachable because the handler returns early on metaKey/ctrlKey. | `vfb.js:124, 171, 191` | `OBSERVED FACT` (proven by mutation) |
| **P0-D2** | *(v1.9 prototype)* The prototype prints **"Saved in this tab" and persists nothing** — 0 occurrences of `localStorage`, `sessionStorage` and `fetch(` in 80,682 bytes of script. A reload loses the whole protocol. **The shipped repo gets this right** ("Saved on this device. It is not on a server and nobody else can see it.") — do not copy the prototype's weaker copy into production. | extracted prototype script | `OBSERVED FACT` |

### 5.5 ACCESSIBILITY, P0-class (3)

| ID | Defect | Where |
|---|---|---|
| **P0-A1** | 52 `/protocol/*` pages fail WCAG 2.2 SC 1.4.10 **Reflow** at 320 CSS px (= 400% zoom) — `scrollWidth=345` on 5 of 5 sampled. One-line cause. | `site/styles.css:3269` |
| **P0-A2** | **Adoption blocker.** `rnawiki-v19-desktop.css` **fails the repo's own `assertContrastTokens()` deploy gate** on three tokens: `--rw-muted` 4.35, `--rw-teal`-as-text 4.22, `--rw-faint` **2.68** — the last reintroducing almost exactly the `#8b97a6` value W5c deleted (styles.css:7 records "~450 failing text nodes"). **Do not import this file.** | v1.9 CSS vs `build/prerender.js:4631` |
| **P0-A3** | **Adoption blocker.** The v1.9 global focus ring `#5788ff` measures **1.42:1** against `--rw-teal`, i.e. **invisible on `.rw-primary`, the one dominant CTA on every v1.9 screen**; also fails SC 1.4.11 on both soft surfaces. | `rnawiki-v19-desktop.css:35-37` |

### 5.6 PERFORMANCE, P0-class by v1.9's own budget (1)

| ID | Defect | Where |
|---|---|---|
| **P0-F1** | **2,667 KB compressed / 12.64 MB decoded JavaScript on every route**, blocking, before anything renders — 10.7× the V19-PERF-001 budget compressed, 51.8× decoded. LCP 14.7–15.6 s on 3 of 8 routes; DOMContentLoaded 14.0–14.8 s on every route measured. | `site/data.js` (11.87 MB) loaded unconditionally |

---

## 6. Proposed route / component / schema changes

**Nothing in this section may be built before Felix approves the slice it belongs to.**

### 6.1 Routes

**Remove (owner decision, collection-of-interest — exactly 7 code sites):**

| Site | What |
|---|---|
| `server.js:1045` | `POST /api/interest` |
| `server.js:1093` | `POST /api/interest/remove` |
| `server.js:2667-2760` | interest thank-you page |
| `server.js:2857` | `INTEREST_TOPICS` boot log |
| `db.js:342-351` | `interest_signups` table + `idx_interest_created` |
| `build/parse.js:2480-2486` | schema validation |
| `build/prerender.js:4487-4488` | **the gate that asserts the form markup EXISTS** |

**Hard ordering constraint** (`OBSERVED FACT`): `build/prerender.js:4487` asserts
`['/api/interest','type="email"','name="topic"','Count me in']` are present. **Removing the endpoint
without removing that gate in the same commit breaks the build.** The landing form is already off the
page and regrowth is gated — so the gate currently protects a form that no longer renders.

**Also remove (not in the brief's scope, added by this checkpoint):** `GET /api/stats` (P0-P12, zero
call sites) and — pending Felix's decision — `clinician_interest` + `GET /api/clinician-photo`
(P0-P3).

**Fix in place (2-word edit, but only with a gate):** add `clinic`, `exercise`, `fork` to
`NOINDEX_ROUTES` (`server.js:2944`). Ungated, this grows back.

**New routes v1.9 requires** (all currently 404): `/today`, `/community`, `/community/<protocol>`
(Discussion), `/marketplace`, `/protocols`. Each must be added to **all four** route lists (§2.2) and
must have a prerendered answer *and* an SPA answer, or a crawler gets one and a reader gets `notFound()`.

### 6.2 Components

| Component | Change | Justification |
|---|---|---|
| `compoundTier()` `app.js:1945` | Replace the prose regex with a read of the authored `regulatory_class` / `consumer_renderable` fields, which already exist and are already trusted by the Studio and by `assertRegulatoryAxes`. | P0-S1, P0-S4 |
| `/fuel` stack generator `app.js:4656` | Filter the backfill pool by `consumer_renderable !== false` **before** ranking; disclose withheld names using `catalogSearch`'s existing `out.withheld` pattern. | P0-S2 |
| `selSupps()` `app.js:5356` | Filter `P.stack` by `consumer_renderable !== false` for **both** selection and daily rendering. **This changes what 39 protocols visibly prescribe** — see §10, D-1. | P0-S3 |
| `/p/` verdict `app.js:9530` | Make the green "Nothing flagged" card conditional on `now.coverage.checked >= 2`; when coverage is short, render the ❔ card **as the verdict**, with no tick. `/stack` already does this correctly — copy it. | P0-S6 |
| Interaction panel `app.js:6033` | Render danger and blunt tiers **outside** the fold, always open; put the count in the summary. ~15 lines. | P0-S7 |
| `checkProtocol()` `app.js:795` | Send `base_pid`/`base_rcid`; call it from the `/plan` builder, not only from the Studio. | P0-S9, P0-S10 |
| `catalogSearch()` movement buckets `app.js:5192` | Apply the same eligibility filter the stack branch already applies 30 lines above. | P0-S10 |
| `mountExercise()` `app.js:8710` | Render `rx.cue`; add the compact stop line and expected/unexpected sensation the v1.9 §6.2/§7.2 first viewport requires. | P0-S13 |
| `stAdjust()`/`stSummary()` `app.js:9130` | Branch on the record's own prescription kind; add a hold/seconds unit; never default 3×10 over an authored value. | P0-S14 |
| BP tool `app.js:5800` | Triage on the **latest** reading as well as the mean; add an urgent tier; cite thresholds; never print a reassuring adjective when any reading in the window is above the amber line. **Requires a clinician, §10 D-4.** | P0-S15 |
| Food-log gate `app.js:8207` | Remove the account gate. Storage is already `localStorage` and never leaves the device. | P0-S17 |
| `.cause-tier` `styles.css:3269` | Drop `white-space:nowrap`; extend the geometry smoke gate from 390 px to **320 px**. | P0-A1 |
| `.ex-demo`/`exflip` `styles.css:1561` | Add to a `prefers-reduced-motion` block, or add a pause control. | L22 |
| Article container | `max-width: 68ch` on text, keep `--maxw:1080px` for layout. Cheapest cognitive win on the site. | L25 |

### 6.3 Schema

**New tables / columns v1.9 requires that do not exist:**

- Protocol graph: nodes, edges, typed answer destinations, authored **safety flags on answers**
  (urgency must never be inferred from wording), fixed-vs-ongoing plan timing.
- `studio_protocols` has **no version column** (`db.js:562-576`). Item references are bare corpus ids
  (`{k:'c',id:'c13'}`) with no pin, so a corrected dose ladder or regulatory class silently rewrites
  every saved and published protocol. v1.9 §6.2 requires `ApprovedBlock.id + version` failing closed.
  **Sequencing constraint: versioning must land BEFORE "edit my published protocol" ships**, or
  published immutability — which currently holds only because editing was never built — is lost that day.
- `user_consent` rows on every signup path; a consent filter on the research export; a deletion path.
- Age/`date_of_birth` — currently nothing exists to disable.
- Exercise records: `sideMode`, load mode/value, effort (RPE/RIR), range, frequency, session slot,
  subtype (static/dynamic/controlled-range), breathing, expected/unexpected sensation, media version.
  **All 873 prescriptions are `source:'default'`** — 3 distinct strength prescriptions cover 750
  records. The v1.9 audit calls these "compressed into one line"; measured, they are **absent**.
- Scaling edges: `criteria`, `initiator`, `scope`, `blockers`, `version` on each of the 1,007.
- A **feature-flag table**. There is none — see §8.

**Warning** (`OBSERVED FACT`): `studio-safety.js:257` rebuilds the spec as `{v:1, items, note}`, so
**unknown top-level keys are silently dropped**. A posted `{v:1,nodes,edges,items}` returns `ok:true`
and stores neither `nodes` nor `edges`. Harmless today; **P0 the day Plans are added.**

**Blocking schema constraint** (`OBSERVED FACT`, proven by reintroducing the bug in a scratch copy):
`assertProfileDisclosesOnlyPublished()` part (2), `build/parse.js:3634`, scans every non-comment line
of `server.js`, `site/app.js` and `db.js` for `/avatar|profile_pic|profile_photo|headshot|real_name|
full_name|display_name/i` and calls `process.exit(1)`. **An avatar cannot be added to this codebase
today without deliberately amending that gate** — which is also the gate that keeps the public
profile honest. See §10, D-9.

---

## 7. Migration and backward-compatibility plan

**Principle: nothing in Wave B may change data that already exists on production until the branch is
published and verified.** The 27 unpublished commits are the first migration.

| Step | Action | Backward compatibility | Rollback |
|---|---|---|---|
| **M0** | **Publish `refine/site-wide-2026-08` to main.** 27 commits. Closes P0-P1. | No schema change. | `git revert` + redeploy; Railway keeps the prior build. |
| **M1** | Route-list fix (`clinic`/`exercise`/`fork` → `NOINDEX_ROUTES`) + a new gate asserting `SPA_ONLY_ROUTES ⊇ NOINDEX_ROUTES` for personal/thin routes. | Pure header/meta change; no data. | One-line revert. |
| **M2** | Interest removal, all 7 sites in **one commit** (the prerender gate must go in the same change). **Decide data disposition first** — dropping the table destroys removal tokens for anyone already signed up. Export before dropping via the existing super-admin path (`server.js:2137`). | Table drop is irreversible. **Export is mandatory.** | Restore from the 6-hourly Postgres backup workflow. |
| **M3** | `clinician_interest` disposition. If deleted: export first, notify the people on the list (the code comment says deletion should follow notification). If retained: a stated retention period. | Irreversible. | Backup restore. |
| **M4** | Safety filters (P0-S1…S3, S6, S7, S9, S10). **Read-only over existing data** — they change what renders, not what is stored. | Fully reversible. **But 39 protocols will visibly stop prescribing Statins/Metformin/Semaglutide/TRT/BPC-157.** Needs D-1. | Revert per-commit; one concern per commit. |
| **M5** | `isRx` re-derivation from badge **text**. Requires `node build/parse.js` (rewrites `site/data.js`, 11.87 MB). | Regenerated artefact; committed to git, so the diff is reviewable. | Revert the commit; re-run `parse.js`. |
| **M6** | Consent + deletion + age (P0-P5…P8). **Additive** columns with a backfill decision: existing accounts have no consent row, and the current code reads absence as permission. **The migration must flip that default to deny**, which retroactively excludes existing rows from research use. | Excludes existing data from research until re-consented. That is the correct direction. | Additive columns; drop to roll back. |
| **M7** | Protocol versioning (`ApprovedBlock.id + version`). **Must precede any edit-published-protocol feature.** Existing specs are `{v:1, items:[…]}`; migrate by pinning each item to the *current* corpus version at migration time and recording that this is a backfilled pin, not an authored one. | Old `{v:1}` specs must keep resolving. `POST /api/protocols/check` already refuses `{v:2}` with a shape message — that refusal is the compatibility boundary. | Version column is additive; readers ignore it until the reader is shipped. |
| **M8** | New v1.9 routes. Each needs prerendered + SPA + all four route lists + `assertLinkGraph` satisfied (a link to a route no page serves, **or a page with nothing linking to it**, fails the build). | Additive. | Remove the route from all four lists in one commit. |
| **M9** | Landing revamp. Must satisfy `assertLandingPage()` and `build/prerender.js:4478-4491` (every home form `action="/solve" method="get"`, `#hero-solve-input`, `#close-solve-input`, submit text "Show me the causes") **or change that gate deliberately, in the same commit, with the reason recorded**. | Copy-only. | Revert. |

**Cross-cutting, not fixable in this repository** (`LEGAL-CLINICAL DEPENDENCY` → Felix only):
Cloudflare returns `cache-control: max-age=14400` for `/data.js` while the origin sets `no-cache`
specifically "so the CDN cannot pin a build" (`server.js:236-239`). **A safety correction to
`data.js` — every dose, every interaction rule — does not reach a returning reader for up to four
hours.** Set Browser Cache TTL to "Respect Existing Headers" in the Cloudflare dashboard. **Do this
before M4**, or the safety fixes ship into a 4-hour stale window.

---

## 8. Feature flags

### 8.1 The finding that governs this whole section

`OBSERVED FACT` — **there is no feature-flag system in this repository.**
`grep -c -aiE "feature_flag|featureFlag|flags\[" server.js db.js site/app.js` → **0, 0, 0**.

Configuration is 17–19 `process.env.*` values (`ADMIN_USER`, `ALLOW_PASSWORD_REGISTRATION`,
`ANTHROPIC_API_KEY`, `DATABASE_URL`, `EMAIL_FROM`, `GOOGLE_CLIENT_ID`, `PGSSL`, `POM_WARN_ONLY`,
`PORT`, `RESEND_API_KEY`, `SCAN_CAP`, `SCAN_MODEL`, `SESSION_SECRET`, `SITE_NAME`, `SITE_URL`,
`SMOKE_DATABASE_URL`, `SMOKE_SETTLE_MS`, `SUPERADMIN_GOOGLE_SUB`, `SUPERADMIN_ID`). Of these, exactly
**two** change product behaviour: `ALLOW_PASSWORD_REGISTRATION` (closed by default) and
**`POM_WARN_ONLY`, which downgrades a hard prescription-only safety gate to a warning** — that one
must be owned explicitly by whoever runs the safety slice, and its production value must be recorded.

**Therefore: "server-authoritative feature flags, default off" is itself a slice, and it is a
prerequisite for every risky slice.** It cannot be assumed.

### 8.2 The seventeen flags v1.9 names, with current state

Source: `RNAwiki_Unified_Experience_v1_9_Claude_CLI_Prompt.md:241-262`. All must default **off**,
all must be **server-side** (client flags are never authority), all must have a kill switch that
preserves already-published read paths.

| # | Flag | Current repo state | Default | Kill-switch behaviour required |
|---|---|---|---|---|
| 1 | `public_profiles` | **Shipped, unflagged.** `/u/<handle>` live, noindexed on branch. | **on** (existing) — needs a flag to turn *off* | Hide the projection; published protocols stay readable at `/p/<code>`. |
| 2 | `active_journey_public_projection` | Absent. **And it fails `assertProfileDisclosesOnlyPublished()` as v1.9 writes it** — see §10 D-6. | off | n/a until built. |
| 3 | `core_protocol` | Absent — **no main/core designation exists anywhere.** | off | n/a. |
| 4 | `visual_plan_builder_v19` | **0% built.** `/studio` is a flat list; 0 svg, 0 canvas, 0 node/edge elements. | off | Disabling must preserve published read paths **and drafts**. |
| 5 | `approved_block_builder` | Absent. | off | n/a. |
| 6 | `protocol_execution` | Partially exists (`/plan`, daily dashboard, streak ledger). | on (existing) | Preserve read-only access to existing private logs. |
| 7 | `community_home_v19` | Absent — `/community` 404. | off | n/a. |
| 8 | `protocol_discussion_v19` | Partial — `explain_posts` threaded comments exist. | off for the v1.9 surface | Existing posts stay readable. |
| 9 | `questions_and_patches` | Absent. | off | n/a. |
| 10 | `protocol_rewards` | **Shipped, unflagged, and forgeable** (P0-X3/X4). `rep_events`, `reputation_points`. Not publicly displayed — which is the only reason it is not already P0-visible. | **off** — recommend disabling until P0-X1…X4 close | Freeze accrual; keep balances. |
| 11 | `community_boost` | Absent (0 occurrences). | off | n/a. |
| 12 | `avatar_studio` | Absent — **and structurally blocked by a build gate** (§6.3). | off | n/a. |
| 13 | `marketplace_cosmetics` | Absent. | off | n/a. |
| 14 | `marketplace_services` | Absent. | **off until independent gates pass** | n/a. |
| 15 | `protocol_payments` | Absent. | **off until named commercial/legal/privacy/security approval** | n/a. |
| 16 | `public_profile_indexing` | **Effectively ON in production right now** (P0-P1) and off on the branch. | **off** | This is the flag whose current state is a live defect. |
| 17 | `youth_accounts` | **Absent — there is nothing to disable** (P0-P5). Building the flag is itself the first youth work. | **permanently disabled pending independent approval** | n/a. |

**Additional kill switches v1.9 §9 of the earlier prompt requires and this repo lacks:** search safety
routing, food logging (must preserve export/delete and read-only access to existing private logs),
high-risk actions, Discussion posting, reactions, indexing.

---

## 9. Phased implementation slices, mapped to v1.9's twenty

Source of the twenty: `RNAwiki_Unified_Experience_v1_9_Claude_CLI_Prompt.md:489-508`.

**I am proposing a re-ordering, and saying so explicitly.** v1.9's order is a build order for a
greenfield product. This product is **live, with 41 P0-class defects, and 27 unpublished commits**.
Shipping v1.9 slice 1 before closing the live defects means building new surface on top of a site
that is currently handing out prescription-only medicines. **The reordering is a recommendation, not
a decision — see §10, D-13.**

### 9.1 Slice 0 — PRE-SLICE, not in v1.9's twenty. Two days.

Not a v1.9 requirement; it is the cost of the site being live and wrong today.

| Work | Closes | Maps to |
|---|---|---|
| Publish the branch | P0-P1 | — |
| `clinic`/`exercise`/`fork` noindex + the four-list gate | P0-P2 | slice 18 |
| Cloudflare Browser Cache TTL → Respect Existing Headers | 4-hour stale-safety window | slice 19 |
| Remove `GET /api/stats` | P0-P12 | slice 1 |
| Interest removal, 7 sites, one commit, export first | P0-P9 | slice 1 |
| `clinician_interest` disposition | P0-P3 | slice 1 |

**Gate:** `curl -D- https://rnawiki.com/u/felix | grep -i x-robots` must return `noindex, nofollow`.

### 9.2 Slice 1 — Safety, honesty and consent contracts. **v1.9 slice 1.**

The largest single block of value in this checkpoint. Closes **19 of the 41 P0s**.

| Sub-slice | Closes | Notes |
|---|---|---|
| 1a Regulatory gating: `compoundTier()` reads `regulatory_class`; `/fuel` generator filters; `selSupps()` filters; `isRx` from badge **text** | P0-S1, S2, S3, S4, S5 | + `assertRxClassification()` **proven by reintroducing the bug**. Needs D-1 and D-3. |
| 1b Verdict honesty: `/p/` coverage-conditional card; danger tier out of the fold; emergency tier reachable | P0-S6, S7, S8 | `/stack` is the working model for 1b-i. |
| 1c Arm the movement rules: send `base_pid/base_rcid`; call `checkProtocol` from `/plan`; filter movement search | P0-S9, S10 | |
| 1d Tool honesty: BP urgent tier; delete or rebuild the two reminder tools; nutrient targets the database can measure | P0-S15, S16, S17 | 1d-i needs a clinician (D-4). |
| 1e Anonymous-first restored: remove the food-log account gate | P0-S17 | AGENT_RULES constraint 3. |
| 1f Consent, deletion, age: `user_consent` on every signup path, consent filter on export, deletion path, age field | P0-P5, P6, P7, P8 | Needs D-5, D-8. |
| 1g Sybil closure: trust the rightmost XFF hop; CSRF token; bound anonymous identity minting | P0-X1, X2, X3, X4 | |
| 1h Moderation: user-submitted foods pending, reward on settle not insert | P0-S18, P0-X? | v1.9 §4.6: "no Credit merely for posting". |

### 9.3 Slice 2 onward — mapped to v1.9's twenty

| v1.9 # | Slice | Status now | Depends on | My proposed position |
|---:|---|---|---|---|
| 1 | Evidence/risk/review/consent/public-projection contracts | 3 P0s + 12 privacy P0s open | Slice 0 | **1st** (§9.2) |
| 2 | Canonical protocol graph, versioning, validators, list representation | **0% built.** No svg/canvas/node/edge anywhere. Data-model rewrite, not a UI refresh. | 1 | 4th |
| 3 | Questions and possible-contributor editing | absent; the string "Possible reason · not a diagnosis" appears **0 times in the repo** | 2 | 5th |
| 4 | Fixed/ongoing Plan timing and relationship editor | absent | 2 | 6th |
| 5 | Approved action family library + curated add flow | Add modal violates §3.9 on 3 counts (4 permanent toggles, search above matches, 7 results) | 2 | 7th |
| 6 | Exercise prescription + versioned real media + canonical wiki | 4 of 14 fields exist; 873/873 `source:'default'`; 0 video, 0 captions, 0 transcript; the only video route is an unreviewed YouTube **search-results** link | 1 | **3rd** (P0-S11…S14) |
| 7 | Stretch/mobility prescription + media + wiki | 2 of 13 fields; 58 of 123 "stretches" show dynamic signals, all get a 30 s hold; 38 contradict their own steps on screen | 1 | **3rd** (with 6) |
| 8 | Supplement/drug claim, mechanism, safety, canonical wiki | strongest layer; the star-vs-outcome conflict is unresolved (D-2) | 1 | 8th |
| 9 | Nutrition audit, target/tracker, logging and contribution review | P0-S17, S18 partly in slice 1 | 1 | 9th |
| 10 | Participant page compiler, immutable block/version continuity, Today, Check-in | **Stacking already built and better than asked** (`mergedPlan()`). Check-in data already structured 41/41 — a rendering job, not an authoring job. | 2, 6, 7 | 10th |
| 11 | Community home, Discussion, questions, resolution, notifications | `/community` 404; `explain_posts` exists | 1, 10 | 11th |
| 12 | Patch proposal/test/accept/attribution/version propagation | absent | 2, 11 | 12th |
| 13 | Profile, Core/Active projection, legacy migration | `/me` + `/u/<handle>` exist and are noindexed on branch; **no main/core designation exists** | 1 | 13th |
| 14 | Avatar Studio, purchase/entitlement/equip ledger, cosmetic Marketplace | **structurally blocked by a build gate** (§6.3, D-9) | 1, 13 | 14th |
| 15 | Credit ledger, reaction settlement, Boost, anti-abuse | **no economy exists**; the reputation ledger that would become spendable is forgeable today | 1g | 15th |
| 16 | Real-world service quotation/reservation/refund **behind an off flag** | absent | 15 | 16th |
| 17 | Protocol monetization **behind an off flag** | absent; **conflicts with product constraint 1 (Free)** — D-11 | human review | 17th |
| 18 | SEO, schema, sitemap, canonical, indexing gates | 11 findings (D1–D11 in `seo_discovery_audit.md`); `/fork` defaults to index | Slice 0 | **2nd** (cheap, and D1 is a privacy default) |
| 19 | Analytics, performance, abuse monitoring, lifecycle messaging | §12 asks for 13 event families; **3 exist**. P0-F1: 10.7× the JS budget. | 1 | **2nd** (with 18) |
| 20 | Youth architecture **behind a permanently disabled flag** | **nothing exists to disable** | independent approval | last |

**Blocking rule, restated from the source:** "Do not begin a later slice merely because an earlier
slice's UI renders. The slice's data, safety, migration, accessibility, abuse, and rollback gates
must pass."

### 9.4 The sequencing dispute, stated openly

Two Wave-A specialists dispute v1.9's emphasis, and I am recording rather than deciding:

> **~90% of traffic never runs JavaScript.** The largest measured cognitive-load numbers on the
> shipped product are on the **reading** layer (138-character line measure across 174 paragraphs on
> one page; median Grade 10.5). The Visual Flow Builder serves the **creator minority**. All three
> supplied audits treat "simple" as a canvas problem.

My resolution: the reading-layer fixes (line measure, sentence ceiling, protocol reflow) are **cheap,
one-line, and independent** — they belong inside slice 0/2 as a rider, not as a competing programme.
The builder remains a real slice because it is the owner's stated product direction. **This is D-13.**

---

## 10. Explicit decisions requiring named human approval

**No agent may proceed on any of these.** Each names who must sign, what the decision is, and what it
unblocks. Grouped by approver.

### FOUNDER / PRODUCT (Felix)

| # | Decision | What it unblocks | What to look at first |
|---|---|---|---|
| **D-1** | **Publish the 27 commits to main?** Three of them close the live `/u/<handle>` indexing defect. Nothing else in this checkpoint moves until this is decided. | Everything | Open `https://rnawiki.com/u/felix` in a browser — it renders the home page. |
| **D-2** | **The evidence star.** v1.9 §8.4 and `v19_wiki_blocks_audit.md` §7 prohibit whole-compound stars and require an outcome selector. `AGENT_RULES` says "Do not remove the evidence star or call it meaningless." Every `/c/*` page currently leads with ★★★★★ beside the h1. **Direct, unresolved conflict.** My read: keep the star, bind it to the *selected outcome* rather than deleting it. **But it is your call.** | Slices 1a, 8 | `/c/creatine-monohydrate` |
| **D-3** | **Filtering prescription compounds out of the default stack removes Statins, Metformin, Semaglutide, TRT, BPC-157 etc. from the daily checklists of 39 root-cause protocols.** Reading pages at `/c/<slug>` are untouched. This changes what 39 protocols visibly prescribe. Confirm the intent. | Slice 1a | `/plan` after starting knee-pain/patellofemoral-pain |
| **D-7** | **The 52 `/fuel` pages.** Fully authored, correctly headed, `noindex,follow`, absent from the sitemap. Intentional or inherited? | Slice 18 | `http://localhost:8099/fuel/knee-pain/patellofemoral-pain` |
| **D-10** | **The landing headline.** Current h1: "Turned away, priced out, or told it was nothing." Stated new direction: "the current healthcare is accessible for all but effective for none". One-place change in `build/landing.js` once the wording is fixed — but the revamp must satisfy `assertLandingPage()` and the form gate, or change them deliberately. | Slice 0/M9 | `https://rnawiki.com/` |
| **D-11** | **v1.9 slice 17 (protocol monetization) conflicts with product constraint 1 ("Free. No paywall")** in `AGENT_RULES`. One document has to give. | Slice 17 | — |
| **D-12** | **The owner demo vs the v1.9 spec.** Your own demo shows a persistent right-rail "Add a block" palette — which §3.4 explicitly forbids as a "generic block library" — and a draggable Safety-route block and an explicit entry node, which have no home in §3.4/§3.5. The demo is your intent; v1.9 supersedes layout. **Both statements are true and they collide.** | Slice 2 | demo at 00:03 / 00:12 |
| **D-13** | **Sequencing.** Reading layer before builder, or builder first? See §9.4. | Slice order | — |
| **D-14** | **"One main protocol, maximum two more" is unenforced in both storage layers, and no main/core designation exists.** Hydrated `/plan` accepted **12** seeded protocols and rendered all 12. Also: no endpoint lists a participant's started protocols, so clearing the browser orphans server-side rows and the streak ledger. Confirm the cap and whether existing over-cap users are grandfathered. | Slices 3, 10, 13 | `/plan` |
| **D-15** | **Content sizing.** v1.9 wants several possible reasons per problem, each with its own Plan. **31 of 41 problems ship 1 actionable root cause against ~6 described causes** (anxiety 6→1, insomnia 7→1, cravings 6→1, gut-health 6→1). Size that authoring bill before the builder is built. | Slice 3 | — |
| **D-16** | **Webfont or no webfont.** v1.9 mandates Inter with `font-synthesis:none` and **six non-standard weights**, and **ships no font file and no `@font-face`**. On your Mac the fallback looks correct; on Android/Windows the six weights collapse and cannot synthesise. **This is the 3D-leg lesson class: it ships looking correct.** Recommendation: collapse to 400/600/700/800 and keep the system stack. | Design system | Render a prototype on a non-Mac device |

### CLINICAL (a named clinician — not an agent, not Felix alone)

| # | Decision |
|---|---|
| **D-4** | **The blood-pressure tool.** Minimum defensible change: triage on the latest reading as well as the mean, add an urgent tier, cite the thresholds and their population, never print a reassuring adjective when any reading in the window is above the amber line. **Not applied.** |
| **D-17** | **The 1,007 scaling edges and the 123 "stretches."** Retire, re-scope or re-author. Includes the plyometric-jump-as-stretch class (P0-S11) and the 38 stretch pages that contradict their own steps. |
| **D-18** | **Stop rules and expected/unexpected sensation on 873 movement pages** — currently 0 of 873. |

### PHARMACY / REGULATORY

| # | Decision |
|---|---|
| **D-19** | **May a screen list a prescription-only medicine with a "+ Add", a schedule ("every day") and a safety verdict at all, under Medicines Act 1975 s.51?** This is materially different from a page that merely *describes* the drug. Needs a real legal read before the catalogue policy is set. Affects P0-S1…S5 and 39 protocols. |
| **D-20** | **The production value of `POM_WARN_ONLY`** — the one env var that downgrades a hard prescription-only gate to a warning. Record it, own it, and default it off. |

### PRIVACY / LEGAL (PDPA)

| # | Decision |
|---|---|
| **D-5** | **`clinician_interest`: delete or retain?** Name, email, discipline, country, **professional licence number and a photograph of a credential document**, for a programme abolished on 2026-07-30. If retained: a stated retention period **and** notification to the people on the list. If deleted: **export first** via the existing super-admin path. This is a legal/ethical call about other people's identity documents. |
| **D-6** | **`interest_signups` disposition.** Delete the data, or stop collecting and keep it? **Dropping the table destroys existing removal tokens.** Decide explicitly. |
| **D-8** | **Retroactive research consent.** Existing accounts have no consent row and the code currently reads absence as permission. Flipping the default to deny retroactively excludes existing data from research use. Confirm — and confirm whether the people whose data was exported under the current behaviour must be told. |
| **D-9** | **`active_journey_public_projection` as v1.9 writes it (public "Day {n} / streak / Active Journey") fails the repo's own `assertProfileDisclosesOnlyPublished()` gate.** This is the sharpest spec-vs-repo collision in the community lane and **neither document mentions it.** Either the spec narrows or the gate is deliberately amended — and the gate is the thing keeping the public profile honest. |
| **D-21** | **Cloudflare Web Analytics.** Its beacon sends `location.href` — including `/solve?q=<typed symptoms>` — and `document.title`. These are the two exact channels the in-house module was built to avoid. Remove the CSP allowlist entry, or accept and document. **Felix only — needs the dashboard.** |
| **D-22** | **Age gate.** There is nothing to disable. Decide the policy before slice 20 exists. |

### SECURITY

| # | Decision |
|---|---|
| **D-23** | **Trust boundary for `X-Forwarded-For`.** Behind Railway the trustworthy hop is the rightmost, not `[0]`. Confirm the proxy topology before changing `clientIp()` — getting this wrong locks out real users. |
| **D-24** | **`SESSION_SECRET` production value.** The default makes participant cookies forgeable and the research pseudonym reversible; the boot warning only fires when the DB is on. **`could-not-check` on production** — Felix must verify. |
| **D-25** | **Anonymous identity minting.** Bounding it is what closes the sybil (P0-X3/X4), but anonymous-first is a product constraint. The fix must not require an account to vote — it must bound how many identities one caller is *issued*. |

### ACCESSIBILITY

| # | Decision |
|---|---|
| **D-26** | **Do not import `rnawiki-v19-desktop.css`.** It fails the repo's own contrast gate on three tokens and its focus ring is invisible on the primary button. The extractable subset (radii, 44 px min-height, 52 px summary, two-breakpoint model, grids) is safe. Confirm the v1.9 visual signature may change. |
| **D-27** | **The target-size standard.** A supplied audit cites SC 2.5.5 (44×44) which is **AAA**; the AA requirement is SC 2.5.8 at **24×24** with inline and spacing exceptions. Confirm which bar RNAwiki holds itself to — it changes the scope materially. |

---

## 11. Exact test and rollback plan

### 11.1 The harness that must exist before Wave B starts

`OBSERVED FACT` — **the repo's own test command cannot run from a clean checkout.** `scripts/smoke.mjs`
imports `puppeteer-core`, which is in neither `dependencies` nor `devDependencies`. There is **no CI**.
Fix this first; a rollback plan with no runnable test is a wish.

### 11.2 Per-commit gates (every commit in every slice)

1. `node build/parse.js && node build/prerender.js` — **hard deploy gates**, 52 assertions.
   Never re-add `|| echo`.
2. `node --check` on every edited JS file. **Insufficient alone** — it does not catch a deleted
   function that still has callers.
3. **Boot the server and hit real routes.** `(PORT=8099 node server.js &)` then curl the routes the
   commit touched.
4. `npm run smoke` — 49 hydrated route classes (after 11.1 is fixed).
5. **Hydrated re-measurement of the exact defect**, using `probe.mjs` (which already expands
   `<details>`, removes the exclusive-accordion `name`, activates `.chapter` and kills the fade
   animation). A curl-only measurement is not evidence about a user.
6. **One concern per commit.** Never batch.

### 11.3 New gates each slice must add, and prove

**A gate that has never failed is unproven. Prove every one by reintroducing the original bug in a
scratch copy of the tree** (as the avatar finding was proven).

| Gate | Proves | Slice |
|---|---|---|
| `assertRouteListsAgree()` — `SPA_ONLY_ROUTES ⊇ NOINDEX_ROUTES` for personal/thin routes | P0-P2 cannot grow back | 0 |
| `assertRxClassification()` — `isRx` derived from badge **text**, no badge-text/`isRx` mismatch in any of the 171 compounds | P0-S5 | 1a |
| `assertNoRestrictedAddCTA()` — no `consumer_renderable:false` compound renders an add control on any surface | P0-S1, S2, S3, S4 | 1a |
| `assertPlanStackIsConsumerRenderable()` — proven by reintroducing `c159` | P0-S3 | 1a |
| `assertVerdictNeverLeadsGreen()` — a `/p/` fixture with coverage 0 must not render "Nothing flagged" first | P0-S6 | 1b |
| `assertMovementSafetyArmed()` — `checkProtocol` call sites all send `base_pid`/`base_rcid` | P0-S9, S10 | 1c |
| `assertStretchIsNotPlyometric()` — no record with `kind==='stretch'` and a `power_plyometric` tag | P0-S11 | 6/7 |
| `assertScalingEdgeHasCriteria()` — every scaling edge carries criteria, initiator, scope, blockers, version | P0-S12 | 6 |
| `assertMovementHasStopLine()` — 873/873 | P0-S13 | 6 |
| **Geometry smoke gate extended from 390 px to 320 px** | P0-A1 | 0 rider |
| `assertReducedMotionCovers()` — every infinite animation appears in a `prefers-reduced-motion` block | L22 | 0 rider |
| `assertSentenceCeiling()` — build-time 25-word sentence ceiling on `content/*.md` and `data/*.json` | L25 | 2nd |
| `assertNutrientTargetIsMeasurable()` — no target whose nutrient has <N% food coverage | P0-S17 | 9 |
| `assertNoAggregateEfficacyEndpoint()` | P0-P12 | 0 |
| `assertConsentRequiredForExport()` | P0-P7 | 1f |

**Do not weaken `assertLinkGraph`.** It fails the build on a dead link **and** on an orphan page.
Every new prerendered route needs an SPA answer too (the `KEEP` sentinel + `data-native` on inbound
links), or a crawler gets the page and a JS reader gets `notFound()`.

### 11.4 Rendered evidence required per slice

Per the source: render at **320 / 375 / 390 / 430 / 1440** and test all states. Additionally, for this
repo specifically:

- **For anything visual, RENDER it.** The `/body/leg` 3D shipped dead and looked correct in code.
  A screenshot, not a code read.
- Screenshot before and after, at the widths above, into `audit/v19/evidence/<slice>/`.
- Any claim about a user cites a hydrated measurement; any claim about a crawler cites the
  prerendered bytes; state which.

### 11.5 Rollback

| Layer | Rollback |
|---|---|
| Code | `git revert <sha>` — one concern per commit makes this exact. Railway keeps the prior build; redeploy is the rollback. |
| Generated artefacts | `site/data.js` and 93 HTML files are **committed**, so a revert restores them. The `.gitignore`d surfaces (`site/c/`, `/target/`, `/protocol/`, `/compare/`) regenerate at boot via `prestart`. |
| Database, additive columns | Drop the column. Safe. |
| Database, destructive (M2 `interest_signups`, M3 `clinician_interest`) | **Irreversible.** Export first via the super-admin path (`server.js:2137`); the 6-hourly Postgres backup workflow in `.github/workflows/` is the only other recovery route. **Verify a backup restores before running either drop.** |
| Feature flags | Once §8 exists: flip off, server-side. Until it exists there is **no kill switch** — which is itself a reason to build §8 early. |
| Cloudflare | Zone settings are outside this repository. Record the before-value in writing before changing it. |

### 11.6 Post-deploy verification, exact commands

```
curl -D- https://rnawiki.com/u/felix    | grep -i x-robots     # expect: noindex, nofollow
curl -D- https://rnawiki.com/exercise   | grep -i x-robots     # expect: noindex, nofollow
curl -s   https://rnawiki.com/api/stats                        # expect: 404
curl -I   https://rnawiki.com/data.js   | grep -i cache-control # expect: no-cache (not max-age=14400)
```
Then, hydrated in a real browser: `/plan` after starting knee-pain — **no pre-ticked Statins row**;
`/c/testosterone-trt` — **no `+ Add to stack`**; `/p/<a 0-coverage code>` — **no green tick**.

---

## Appendix — what I did NOT check

Stated so nobody treats absence as clearance.

- I did **not** run `node build/parse.js` or `npm run smoke` (parse.js rewrites `site/data.js`;
  smoke.mjs needs an undeclared dependency). **No claim here asserts a build gate or test passed.**
- I did **not** exercise any write path against `rnawiki.com`. All production probes were GET/HEAD.
- I did **not** attempt to bypass `isSuper()` on `/api/clinician-photo`.
- The Cloudflare Web Analytics beacon payload (P0-P10) is `INFERENCE (strong)` from the CSP
  allowlist, which I read live today. A live beacon capture is the confirming check.
- `SESSION_SECRET`'s production value is `could-not-check`.
- Production write-path behaviour of `POST /api/interest` is `could-not-check`.
