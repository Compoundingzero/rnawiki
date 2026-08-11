# RNAwiki v1.9 — Exercise block audit (WAVE A, read-only)

**Role:** exercise-prescription specialist + media specialist
**Date:** 11 August 2026 · branch `refine/site-wide-2026-08`, tree clean, 27 improvements unpublished
**Scope:** the real exercise layer in this repository (`site/exercises.js`, 873 records) measured against
v1.9 spec §6 (Exercise wiki) and §3.10 (Professional action fields), with the earlier PRD governing
safety/provenance where it is stricter.
**Method:** every user-facing claim below is a **hydrated-DOM** measurement taken with
`/Users/admin/.claude/jobs/b8afc277/tmp/qa/probe.mjs` and per-test scripts under
`/Users/admin/.claude/jobs/b8afc277/tmp/qa/out/` (Chrome, 1440×900 unless stated, `<details>` expanded).
Data claims are computed off `site/exercises.js` and `data/clinical_graph.json` and the exact script is
named. No claim below comes from `curl`. No test is reported as passing that was not run.

Labels used: **OBSERVED FACT** · **INFERENCE** · **PRODUCT DECISION** (needs Felix) ·
**LEGAL-CLINICAL DEPENDENCY** (needs a qualified human).

---

## 0. What I am challenging in `work/v19_wiki_blocks_audit.md`

That document is a good page contract. It is not an audit of this repository. Its own **Files audited**
header (lines 7–14) lists four *mobile prototypes*, `work/audit/app.js`, `work/audit/data.js` and
`work/audit/sitemap.xml`. **It never opens `site/exercises.js`.** Every consequence below follows from
that.

| # | Claim in `v19_wiki_blocks_audit.md` | My measurement | Verdict |
|---|---|---|---|
| C1 | §3.1.3 "Professional prescription fields are **compressed into one line**. Sets, quantity, side, load, RPE/RIR, tempo, rest, range, frequency … need semantic fields" | 4 of those 10 exist (`sets`, `reps`, `tempo`, `rest`). **`side`, `load`, `RPE/RIR`, `range`, `frequency`, `sessionSlot`, `TUT` have no field, no default and no holder at any layer.** | **Materially wrong direction.** "Compressed" says present-but-crammed. The truth is *absent*. A team reading C1 would ship a layout change; the actual work is schema creation. |
| C2 | §5.6 lists 15 typed prescription fields as the target | Correct as a target, but the doc never states the **starting point**: `prescription.source === "default"` on **873/873** records, and **exactly 3 distinct strength prescriptions exist for all 750 strength records** (441 × `3×10-12 t2-1-2 r60s`, 264 × `3×8-12 t3-1-1 r90s`, 45 × `4×5-8 t3-0-1 r120s`), keyed only off the upstream `level` string. | **Incomplete in the load-bearing way.** |
| C3 | §5.8 writes a regression/progression **edge contract** as if greenfield | **1,007 scaling edges already ship**, machine-derived by `scripts/enrich-exercises.js` from `move_tags[0]` + `level`. The job is not "author a schema", it is "retire or re-scope 1,007 unreviewed edges that are already on screen". | **Understates the work and its risk.** |
| C4 | §5.5 "never a search-results link" | Correct — and it is **live in production on 873/873 pages**, `site/app.js:8690`. The doc frames it as a prototype defect. | **Right rule, wrong status.** |
| C5 | §14.2 acceptance test "Video has captions, transcript, text alternative, and source/version" | There are **0 `<video>` and 0 `<track>` elements** on movement pages (hydrated, 4/4 sampled). As written the test passes vacuously over an empty set — the documented RNAwiki failure mode ("a gate over an empty set always passes"). | **Un-runnable as written.** |
| C6 | §12 accessibility contract | Never mentions the one WCAG failure actually shipping: `.ex-demo.anim .exd-1{animation:exflip 2s ease-in-out infinite}` (`site/styles.css:1561`), **still `animationPlayState:"running"` under `prefers-reduced-motion: reduce`**, with no pause control. | **Missed the live defect.** |
| C7 | Whole document | Never mentions `avoid_movements` — the contraindicated-movement layer that **already exists** at `site/app.js:4592`, `build/parse.js:2695`, `studio-safety.js:132`. Consequently it does not notice that the layer is **bypassed on two of the three paths that add a movement to a plan** (§2 P0-1, P0-2 below). | **Missed the highest-severity finding in the layer.** |

**Contradiction with the earlier PRD (`RNAwiki_Core_Protocol_Product_Requirements_Document.docx`, extracted text line 107):**
it states *"46 stretch records describe rep-based/dynamic movement"*. I cannot reproduce 46 and the PRD
does not publish its method. My two bounds, script `/tmp/dyn.js`:
**29** (strict — instructions literally prescribe repetitions) and **58** (broad — any dynamic signal in
name or instructions). Recorded, not resolved. Do not quote 46 without a method.

---

## 1. What exists in the repo today — the exact field inventory

**OBSERVED FACT.** `site/exercises.js` → `window.RNAWIKI_EXERCISES`, `schema_version: 3`, 873 records.
Field presence counted across all 873 (script: inline `node -e` over `site/exercises.js`):

| Field | Coverage | Origin |
|---|---|---|
| `id`, `name`, `instructions`, `category`, `image` | 873/873 | upstream free-exercise-db |
| `force` (`pull` 371 / `push` 369 / `static` 104 / `null` 29) | 873/873 | upstream |
| `level` (`beginner` 523 / `intermediate` 293 / `expert` 57) | 873/873 | upstream |
| `mechanic` (`compound` 489 / `isolation` 297 / `null` 87) | 873/873 | upstream |
| `equipment` (13 values incl. **`other` ×122** and **`null` ×77**) | 873/873 | upstream |
| `primaryMuscles`, `secondaryMuscles` | 873/873 | upstream |
| `move_tags`, `score` | 873/873 | derived, `scripts/fetch-exercises.js:56` |
| `kind` (`strengthen` 750 / `stretch` 123) | 873/873 | derived from `category==='stretching'`, `scripts/enrich-exercises.js:62` |
| `prescription{source,sets,reps,tempo,rest}` | 873/873, **`source:"default"` on 873/873** | `scripts/enrich-exercises.js:42` |
| `regression_id` / `progression_id` | 309 / 698 (strength only) | derived, `scripts/enrich-exercises.js:~74` |
| `needs_scaling_bounty` | 873/873, **`true` on 0** | derived |

### 1.1 v1.9 §3.10 "Professional action fields · Exercise" — field-by-field

| v1.9 field | Holder in repo | Status |
|---|---|---|
| sets | `prescription.sets` | **exists** (3 distinct values across 750 records) |
| repetitions / seconds / distance / controlled duration | `prescription.reps` (string range) | **partial** — one mode only; no `measureMode` |
| **side mode** | — | **ABSENT.** No field. **215/873 records' own text implies per-side work** (`each side/leg/arm`, `switch legs`, `other arm`). The rendered line "3 sets × 10-12 reps" is therefore ambiguous on 215 pages. |
| **load mode + unit-aware value** | — | **ABSENT.** `Barbell Squat` renders `3 Sets × 10-12 Reps · Tempo 2-1-2 · Rest 60s · Barbell · Compound · Push` (hydrated, 1440×900). Equipment is named; **load is never named**. |
| **effort (RPE/RIR/%/qualitative)** | — | **ABSENT** at every layer. Zero `rpe`/`rir` strings in `site/exercises.js` or `data/clinical_graph.json`. |
| tempo | `prescription.tempo` | **partial** — free-text `"2-1-2"`, the exact shape v1.9 §5.6 forbids ("not a free-text `3-1-X-0` alone"). Rendered verbatim to the participant as `Tempo 2-1-2` with no translation. |
| rest | `prescription.rest` | **exists** (string `"60s"`) |
| **range** | — | **ABSENT** |
| **frequency + session slot** | — | **ABSENT** per exercise. Frequency exists only as prose inside `clinical_graph.json` `prescription.detail` (see §3). |
| equipment + reviewed substitutions | `equipment` | **partial** — a raw upstream enum. **122 records render the word `other`; 77 render nothing** (`site/app.js:8710` drops it when falsy). No substitution field. |
| regression/progression links + **criteria, initiator, scope, blockers** | `regression_id` / `progression_id` only | **links exist, contract absent** — see §2 P0-3 |
| **tutorial/media, technique, safety, source versions** | — | **ABSENT.** No asset id, no version, no reviewer, no review date, no licence on the page. |
| **derived TUT / estimated working time** | — | **ABSENT** |

**Score: 4 of 14 v1.9 exercise fields have a holder; 10 have none.**

---

## 2. P0 findings (safety)

### P0-1 — The contraindicated-movement rule is dead in the shipped client: it is never armed
**OBSERVED FACT · verified by running the endpoint both ways.**

`studio-safety.js:131` rule **R2 `contraindicated-move`** is the only contraindication rule in the
product. It reads `rc.avoid_movements` and refuses a movement the root cause says to avoid. The server
resolves `rc` from `base_pid`/`base_rcid` on the request body (`server.js:1119`).

The shipped client **never sends them**. `site/app.js:795`
`checkProtocol(spec, status) { return this.raw('POST','/api/protocols/check', status ? {spec,status} : {spec}) }`
— and both call sites (`site/app.js:8855` draft check, `site/app.js:9422` publish check) pass
`stSpec()`, which is `{v:1, items:[…]}` (`site/app.js:8835`). No `base_pid`. No `base_rcid`.

Proof, local server, browser-shaped request (the endpoint rejects non-browser UAs):

```
POST /api/protocols/check   {"spec":{"v":1,"items":[{"k":"x","id":"Standing_Military_Press"}]}}
→ {"ok":true,"refusals":[],"warn":[], "says":"No compounds in this protocol, so there was nothing to cross-check."}

POST /api/protocols/check   same spec + {"base_pid":"neck-shoulder","base_rcid":"rotator-cuff-impinge"}
→ {"ok":false,"refusals":[{"rule":"contraindicated-move",
    "message":"Standing Military Press is a \"military press\" movement, and this protocol's own root
     cause tells people to avoid exactly that."}]}
```

The rule works. Nothing ever calls it with a root cause. This is the documented RNAwiki failure mode —
**a gate over an empty set always passes** — reproduced in the safety layer itself. It also means the
"58 build checks / 5 mirrored build gates" claim is true of the *code* and false of the *shipped path*
for R2.

*Aggravating:* the honest-coverage sentence returned to the reader is
`"No compounds in this protocol, so there was nothing to cross-check."` A movement-only protocol
therefore gets a reassuring clearance sentence with **zero movement coverage disclosed**.

**Fix class (spec only, not applied):** send `base_pid`/`base_rcid` from the Studio when the protocol
was started from a root cause; when it was not, say so in `says` rather than returning a
compound-shaped clearance. Prove the gate by re-running the two requests above.

---

### P0-2 — `/plan` builder: a contraindicated movement can be searched for and added, with no warning
**OBSERVED FACT · verified hydrated, 1440×900, script `out/builder_contra2.mjs`.**

Route: `/#/protocol/neck-shoulder/rotator-cuff-impinge` → **Start building my plan** → step 1
**💪 Movements**.

- Default list (filtered by `notContra`, `site/app.js:4593`): `Back Flyes - With Bands`,
  `Cable Internal Rotation`, `Bent Over Two-Dumbbell Row`. The filter works here.
- **"＋ Add your own movement" search is not filtered at all.** Measured results:
  - `military` → `Machine Shoulder (Military) Press`, `One-Arm Kettlebell Military Press To The Side`, `Seated Barbell Military Press`, `Standing Military Press`, `Two-Arm Kettlebell Military Press`
  - `shoulder press` → 6 results incl. `Barbell Shoulder Press`
  - `upright row` → 5 results · `snatch` → 6 results
- I clicked the first result. **`Machine Shoulder (Military) Press` was added to the plan.** Page text
  after the add contains no `avoid`, `caution` or `warn` string. No withheld line. No counter-copy.

This root cause's own authored `avoid_movements` is
`["overhead press","shoulder press","military press","push press","behind the neck","behind neck","upright row","jerk","snatch","overhead"]`.

`catalogSearch()` (`site/app.js:5192-5203`) applies **no** eligibility filter to the movement buckets.
The contrast inside the same function is the finding: the `stack` branch (`site/app.js:5160-5190`)
withholds **95 of 171** compounds *and names them in a disclosure sentence*. The movement branch
withholds nothing and discloses nothing. `/#/studio`'s Add sheet shows the same asymmetry verbatim in
its tab counts, measured hydrated at 390×844: **"💊 Compounds 76"** (of 171, deliberately) next to
**"💪 Movements 873"** (of 873).

**Compounding:** the `/plan` builder **never calls the safety checker at all**. `checkProtocol` has
exactly two call sites and both are in the Studio. The path a person actually reaches from a protocol
page is unchecked end to end.

---

### P0-3 — 1,007 unreviewed machine-derived "Easier / Harder variation" edges are presented as prescriptive
**OBSERVED FACT · data measured (script `/tmp/…` inline over `site/exercises.js`); rendering verified hydrated.**

Rendered as `← Easier variation` / `Harder variation →` chips on the exercise page
(`site/app.js:8703-8704`) and as `← Easier` / `Harder →` buttons that **swap the card in place**
inside the plan builder (`site/app.js:8070-8072`). Verified hydrated on `/#/exercise/Barbell_Squat`:
`Harder variation →` present.

Derivation (`scripts/enrich-exercises.js:~74`): take `move_tags[0]`, sort that tag's records by the
upstream `level` string, pick the nearest lower/higher level with the most shared tags. No clinician,
no criterion, no goal check.

Measured over all 1,007 edges:

| Property | Count | Share |
|---|---|---|
| total edges shipped | 1,007 | — |
| **share zero primary muscle with their source** | **276** | **27.4%** |
| flip `push` ↔ `pull` force | 231 | 22.9% |
| cross exercise `category` | 317 | 31.5% |
| **"Easier" edges that INCREASE equipment demand** | **61** | — |

Verbatim examples:

- `Wide-Grip Standing Barbell Curl` → **Harder** → `Close-Grip Push-Up off of a Dumbbell`
- `Zottman Curl` → **Harder** → `Bench Press with Chains`
- `Ab Roller` → **Harder** → `Atlas Stones`
- `Wrist Roller` → **Harder** → `Bottoms-Up Clean From The Hang Position`
- `Bottoms-Up Clean From The Hang Position` → **Easier** → `Barbell Bench Press - Medium Grip`
- `Clock Push-Up` (body only) → **Easier** → `Alternating Floor Press` (kettlebells)
- `Bodyweight Mid Row` → **Easier** → `Bent Over Barbell Row` (barbell)
- `Dumbbell Squat To A Bench` → **Easier** → `Barbell Side Split Squat` (barbell)

v1.9 §6.3 requires every edge to carry *"explicit criteria, initiator, scope, safety blockers, and
version"*. **None of the 1,007 carries any of the five.** A beginner tapping "Easier" on a bodyweight
movement can be handed a barbell lift.

**INFERENCE:** the honest interim state is to stop calling these *regressions/progressions* and label
them for what they are (same-tag neighbours at a different upstream difficulty label), or withdraw the
chips until edges are authored. **PRODUCT DECISION for Felix** — either is defensible; shipping them
as prescriptive scaling is not.

---

### P0-4 — 873/873 exercise pages carry no stop rule and no safety boundary
**OBSERVED FACT · hydrated, 1440×900, 4/4 pages sampled (`out/final_meas.mjs`, `out/ex_dump.mjs`).**

`mountExercise()` (`site/app.js:8682-8724`) renders: breadcrumbs · type+level · H1 · Edit button ·
demo images · YouTube link · one prescription line · scale chips · Muscles worked · How to do it ·
"Find a protocol that uses this →" · comments. **There is no stop line, no contraindication, no
"why would I stop", and no safety route anywhere on the page.**

Worse: the **only authored safety string in the entire movement dataset** —
`prescription.cue: "ease to mild tension, never pain"`, present on 123 records — is rendered by
`exerciseCard()` (`site/app.js:8076`), by `exModalHtml()` (`8113`) and by the daily tracker row
(`5981`), but is **dropped by the canonical wiki page**: `site/app.js:8710` calls
`rxLine(e)` then appends `equipment · mechanic · force` and never `rx.cue`.

Measured hydrated on `/#/exercise/Calf_Stretch_Elbows_Against_Wall`, full page text:
`2 × 30s hold · rest 20s · isolation · static` — no cue.
Same record inside the plan builder card:
`2 × 30s hold · rest 20s · ease to mild tension, never pain`.

The deepest page in the product is the one with the least safety copy on it.

v1.9 §6.2 requires "one compact stop line" in the **first viewport**. Present on 0 of 873.

---

## 3. P1 findings

### P1-1 — Two contradictory prescriptions for the same movement, in one product
**OBSERVED FACT.** `data/clinical_graph.json` carries a per-root-cause `prescription{scheme,detail}` on
**52 of 52** root causes, and the detail string contains real programming — e.g. patellar tendinopathy:
`"3×/week, 3–4 sets, tempo 3-0-3, 6–8 reps at heavy load; pain ≤4/10 during and settled by next morning."`
Rendered hydrated on `/#/protocol/knee-pain/patellar-tendinopathy` (verified, `out/proto_dump.mjs`).

The exercises that protocol assembles carry `3 sets × 8-12 reps · tempo 3-1-1 · rest 90s` from
`defaultPrescription()`. Nothing joins the two. **The blob is prose** — unparsed, unstructured, never
reconciled — and it is the only place in the repo where **frequency**, **load intent** and a
**pain-threshold stop rule** exist at all (4 of 52 causes state a `/10` pain limit).

*Note for the movement contract:* this is where the missing `frequency`, `effort` and `stopRule` fields
should be lifted from. They are authored; they are just not typed.

### P1-2 — The protocol page advertises "6 moves" and renders none
**OBSERVED FACT · hydrated.** `/#/protocol/knee-pain/patellar-tendinopathy` prints
`THIS PROTOCOL · 6 moves · 6 supplements · 4 food targets` (`site/app.js:7933-7937`, `moveN` =
`P.strengthen.length + P.stretch.length`). With every `<details>` expanded and the exclusive-accordion
`name` stripped, the page contains **0 `a[href^="#/exercise/"]` and 0 `.ex-card`**.
`protocolLayers()` (`site/app.js:7674-7677`) deliberately renders only the prose prescription plus
*"This page gives the prescription, not a fixed exercise list."* The count and the copy disagree.

### P1-3 — Infinite unpausable animation on every movement page (WCAG 2.2.2)
**OBSERVED FACT · hydrated with `emulateMediaFeatures prefers-reduced-motion: reduce`
(`out/rm.mjs`).** On `/#/exercise/Barbell_Squat`:
`{animationName:"exflip", duration:"2s", iterationCount:"infinite", playState:"running", pauseControl:false}`.
`site/styles.css:1561-1562`; **no `prefers-reduced-motion` block anywhere in `styles.css` mentions
`.ex-demo`, `.exd` or `exflip`** (grep of all 10 reduced-motion blocks). Applies to 873/873 records —
every `image` ends `/0.jpg`, so `hasAnim` is true on all of them (`site/app.js:8693`).

### P1-4 — No heading structure below H1
**OBSERVED FACT.** 12/12 movement pages sampled return `headingCount: 1` (`out/wordsweep.mjs`).
"Muscles worked" and "How to do it" are `div.section-title`, not headings (`site/app.js:8713,8718`).
A screen-reader user has no heading navigation on any of the 873 pages.
Median page length **172 words** (min 130 `Seated_Calf_Stretch`, max 387 `Barbell_Squat`).

### P1-5 — Third-party image beacon on every movement page
**OBSERVED FACT.** Both demo frames load from `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/<Id>/{0,1}.jpg`
(hydrated; `build/parse.js:825-828` rewrites the raw GitHub host to jsDelivr). The CDN therefore learns
the reader's IP plus the exact movement viewed, on a health-adjacent page, with no account and no
consent step. Mitigation already in place: `Referrer-Policy: strict-origin-when-cross-origin` (measured
on the response headers), so only the origin leaks in the `Referer` — but the **image path itself names
the exercise**. **PRODUCT DECISION:** self-host the 1,746 frames (they are the same licence) or accept
and disclose. v1.9 §9.2 and the PRD privacy contract both point at self-hosting.

### P1-6 — No on-page provenance, attribution or licence for third-party instructions
**OBSERVED FACT.** `"free-exercise-db"` appears **0 times** in `site/app.js` and in no rendered page;
it exists only as a top-level key in `data/clinical_exercises.json` / `site/exercises.js`, which is
never displayed. 873 pages present third-party instruction text and images as RNAwiki content with no
source, no licence, no version, no review date. v1.9 §6.2 requires
*"licensed/provenance-checked asset ID/version"*.
**LEGAL-CLINICAL DEPENDENCY:** the payload declares the images MIT; MIT requires the notice to be
reproduced. Needs a human decision on placement (per-page credit vs `/methodology`).

### P1-7 — The Studio silently reinterprets a hold as reps
See `mobility_block_audit.md` §P0-M2. It fires for exercise items too: `stAdjust()`
(`site/app.js:9140-9141`) offers **only** `Sets` and `Reps` steppers for every `k:'x'` item, with
hard-coded defaults `3` and `10` that **ignore the record's own `prescription`** (which may be
`3×8-12` or `4×5-8`). v1.9 §3.10 closes with *"An unsupported legacy value is preserved and flagged for
review; it is never silently dropped, defaulted, or reinterpreted."*

### P1-8 — Discovery: 0 of 873 movement pages are in the sitemap
**OBSERVED FACT.** `site/sitemap.xml` contains 568 `<loc>` entries and **0** matching `exercise`.
`GET /exercise/Barbell_Squat` returns 200 / 5,333 bytes of empty SPA shell with
`<meta name="robots" content="index,follow">`, no `<h1>`, and the site-generic `<title>`. Hydrated, the
page sets a correct per-page `<link rel=canonical>` but keeps the **site-generic title and meta
description** and emits only `BreadcrumbList` / `WebSite` / `Organization` JSON-LD — no `HowTo`,
`ExerciseAction` or `VideoObject`. Against v1.9 §13.1/§13.4 the whole movement layer is invisible.

---

## 4. The real-video asset contract — measured, item by item (v1.9 §6.2)

| v1.9 requirement | Repo today | Evidence |
|---|---|---|
| large first-party / source-locked tutorial **video** | **none.** `0 <video>` elements on 4/4 pages sampled. The "demo" is two cross-fading JPEGs. | hydrated, `out/ex_dump.mjs` |
| never a search-results link | **violated on 873/873.** `site/app.js:8690` builds `https://www.youtube.com/results?search_query=<name>+exercise+proper+form`, rendered as **"▶ Watch a form tutorial on YouTube"**, `target="_blank"`. | hydrated + code |
| **captions** | **absent.** `0 <track>` elements. | hydrated |
| **transcript** | **absent.** No transcript element, no anchors. | hydrated |
| **poster** | n/a — no video; the first frame doubles as the poster with no `poster` semantics | code |
| **visible duration** | **absent** | hydrated |
| **loading state** | **absent** — `loading="lazy"` only; no skeleton, no state copy | code `8694` |
| **retryable error** | **absent.** `onerror="this.style.display='none'; …classList.add('noimg')"` — silent hide, no retry, no message. | code `8694` |
| **written fallback** | **partial and dishonest.** With the CDN blocked (request interception, `out/media_fail.mjs`) the media area becomes a **440×200 box whose only content is the caption "▶ the movement (start ⇄ end)"** — a play glyph promising motion over an empty box. The written steps *do* survive below, which satisfies "a missing video never removes the written prescription", but there is no honest no-media state. |
| **slow / reduced-motion behaviour** | **violated** — P1-3 | hydrated |
| **no surprise autoplay** | **violated in spirit.** Nothing is a video, but an infinite 2s cross-fade starts on load with no control, and two `▶` glyphs appear where no play control exists. | hydrated |
| **asset ID / version / licence / reviewer / review date** | **absent on page** — P1-6 | grep |

**Latent risk (INFERENCE, not a live defect):** `site/app.js:8692` derives the second frame by string
substitution `/0.jpg → /1.jpg` and sets `hasAnim` purely on whether the substitution changed the
string — i.e. the code **assumes** a second frame exists for every record. The repo does not store the
upstream `images` array (`scripts/fetch-exercises.js:91` keeps `images[0]` only), so it cannot know.
I sampled 8 ids over the CDN: 8/8 returned `200` for both `0.jpg` and `1.jpg`. Currently harmless;
one upstream deletion turns the caption "▶ the movement (start ⇄ end)" into a lie on that page,
because `onerror` removes the `anim` class but **leaves the caption**.

---

## 5. v1.9 §6.2 first-viewport conformance — measured at 1440×900

| §6.2 requirement | Present? | Evidence (hydrated first-viewport contents, `out/final_meas.mjs`) |
|---|---|---|
| type · **Exercise · Strength** | partial | renders `Strengthening · beginner` / `Stretch / mobility · beginner` |
| title + ≤18-word purpose | **no purpose field exists** | H1 only |
| large first-party media | **no** | §4 |
| three key-frame steps, captions, transcript, slow playback | **no** | §4 |
| equipment line | partial | inlined into the prescription line; blank on 77, the word `other` on 122 |
| sticky **Today in your Plan** rail | **no** | no rail; no plan context reaches this page |
| plain prescription: sets, reps/seconds, **side**, **load**, lower/lift timing, rest, **effort** | 4 of 7 | `3 Sets × 10-12 Reps · Tempo 2-1-2 · Rest 60s` — no side, no load, no effort |
| **one compact stop line** | **no** | P0-4 |
| one dominant **Back to today's action** | **no** | the only CTA is `Find a protocol that uses this →` |
| **Need an easier version?** text action | **no** | chips only, and 0 for all 123 stretches |
| *no* anatomy in first viewport | **violated** | "Muscles worked" + muscle chips are above the fold at 1440×900 on 4/4 pages |
| anatomy boundary copy *"shows regions involved… does not measure activation"* | **absent** | page says only "Tap a muscle for its anatomy…" |

Also rendered to participants verbatim from upstream enums, with no translation: `isolation`,
`compound`, `other`, `static`, `push`, `pull`. `· Push` on a hamstring stretch page is measured, real,
and meaningless to a novice (`/#/exercise/90_90_Hamstring`).

---

## 6. What NOT to do (protecting existing good work)

1. **Do not delete `avoid_movements`, `build/parse.js:2695` or `studio-safety.js:131`.** They are
   correct, honestly scoped ("2 of 52 root causes carry `avoid_movements` today") and the R2 rule
   *demonstrably works* when armed. The defect is the wiring, not the rule.
2. **Do not delete `notContra` in `generateProtocol`.** It is the reason the rotator-cuff default list
   is clean (measured).
3. **Do not replace the honest `source:"default"` marker with authored-looking numbers.** The dataset
   telling the truth about itself is the one thing that currently protects the layer. What is missing
   is that the *UI never shows it*.
4. **Do not treat the `/plan` builder and the Studio as one surface** in any fix — they are two
   different code paths with two different safety postures (measured).

---

## 7. Ranked remediation spec (analysis only — no code changed)

| # | Change | Where | Proof that it worked |
|---|---|---|---|
| 1 | Send `base_pid`/`base_rcid` on every `checkProtocol` call; make `says` disclose movement coverage separately from compound coverage | `site/app.js:795, 8855, 9422` | re-run the two `curl` requests in P0-1; the unarmed one must now refuse |
| 2 | Route the `/plan` builder's add path through the same check, or filter `catalogSearch` movement buckets by `avoid_movements` **and name what was withheld** (mirror the `stack` branch exactly) | `site/app.js:5192-5203` | re-run `out/builder_contra2.mjs`; `Machine Shoulder (Military) Press` must be refused or withheld-and-named |
| 3 | Add `sideMode` + `loadMode`/`loadValue` + `effortMode`/`effortValue` to the record schema; back-fill `sideMode` from the 215 records whose own text implies it | `scripts/enrich-exercises.js`, `build/parse.js` gate | a gate that fails the build when a record's instructions say "each side" and `sideMode` is `both` |
| 4 | Stop rendering unreviewed edges as prescriptive scaling (relabel or withdraw) | `site/app.js:8070-8072, 8703-8704` | edge count rendered drops from 1,007 to the authored subset |
| 5 | Put the stop line / `cue` on the canonical page; author a real stop rule per subtype | `site/app.js:8710` | hydrated: `hasStopLine` true on a random sample of 20 |
| 6 | `prefers-reduced-motion` block for `.ex-demo.anim .exd-1`, plus a pause control | `site/styles.css:1561` | re-run `out/rm.mjs`; `playState` must be `paused`/`animationName` `none` |
| 7 | Honest no-media state + retry; remove the YouTube search link | `site/app.js:8690-8698` | re-run `out/media_fail.mjs`: the box must contain words, not a play glyph |
| 8 | `h2` for section titles; per-page `<title>`/description; sitemap entries | `site/app.js:8713+`, `build/prerender.js` | `headingCount ≥ 4`; sitemap `<loc>` count rises by the movement set |

---

## 8. Open questions for Felix (PRODUCT DECISION)

1. **The 1,007 edges** — relabel as "similar movements" or withdraw until authored? (Deleting them
   removes the only "easier/harder" affordance in the product.)
2. **Self-host the 1,746 demo frames?** Removes the third-party beacon and the CDN dependency; costs
   repo size and a build step.
3. **Real video** is the single largest v1.9 gap and every option (licence a library, commission,
   user-contributed) has a cost and a rights question — and *none of them requires Felix on camera*.
   This needs a decision before the exercise page can meet §6.2 at all.
4. **Attribution placement** for free-exercise-db (LEGAL-CLINICAL DEPENDENCY).
5. Who is the **technique reviewer** of record? Every v1.9 field marked "reviewed" is currently
   unfillable because no reviewer role exists on this project.
