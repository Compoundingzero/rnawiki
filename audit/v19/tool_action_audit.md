# v1.9 WAVE A — Tool / reminder action audit

**Scope:** the 22 protocol tools (`PLAN_FUNCTIONS`), the exercise/stretch action fields, reminders,
completion rules, equipment substitutions, data retention, and commercial-link governance — against
v1.9 §3.10 (Professional action fields), §3.12 (publish repair validation order), §9 (public/private),
§10 (accessibility), §11 (required states) and §12 (measurement).
**Method:** source read at exact line numbers, corpus census in a `vm` sandbox, hydrated
measurement in headless Chrome (W0 harness). **Read-only.** No product code was changed.

---

## 0. What exists (OBSERVED — `site/app.js:5205-5298`, `PLAN_FUNCTIONS`)

**22 tools**, by kind:

| kind | n | ids |
|---|---:|---|
| counter | 7 | plants, steps, hydration, protein, fermented, focus, zone2 |
| timer | 4 | walk, breath, sigh, craving |
| scale | 2 | symptom, readiness |
| **reminder** | **2** | **wake, sunlight** |
| triage | 1 | pain |
| window | 1 | eatwin |
| bp | 1 | bp |
| deload | 1 | deload |
| adherence | 1 | adhere |
| log | 1 | win |
| sleep | 1 | sleepwin |

Against v1.9 §3.10's **Tool** field list:

| §3.10 Tool field | Repo | Verdict |
|---|---|---|
| exact job | `desc` | ✅ |
| trigger / moment | encoded in `how` prose only ("after eating", "when a craving hits") — no structured field | ⚠️ |
| completion rule | implicit per kind; `target` + `unit` + `period` present on counters/timers | ⚠️ partial |
| **data collected and retention** | collected: yes. **Retention: undeclared anywhere** | ❌ |
| equipment / product substitution rules | none on tools; exercises have variation swaps only | ❌ |
| protocol and participant fit | `match: [...]` keyword array, auto-assigns one default per protocol | ⚠️ keyword match, unreviewed |
| marketplace / commercial link after eligibility+relationship+jurisdiction review | see §5 | ⚠️ |

---

## 1. P0 — The blood-pressure tool averages away a dangerous reading

**Status: VERIFIED (`site/app.js:5800-5810`).**

```js
let ss = 0, ds = 0, n = 0;
for (let i = 0; i < 7; i++) { const dl = (plan.log || {})[dISO(i)];
  if (dl && dl.bp && dl.bp.sys) { ss += dl.bp.sys; ds += dl.bp.dia || 0; n++; } }
const avgS = n ? Math.round(ss / n) : 0, avgD = n ? Math.round(ds / n) : 0;
const guide = !n ? ''
  : (avgS >= 160 || avgD >= 100) ? '🔴 High — please see a doctor soon.'
  : (avgS >= 140 || avgD >=  90) ? '🟠 Above target — keep at the plan; recheck weekly.'
  : (avgS >= 130 || avgD >=  80) ? '🟡 Slightly raised — you\'re on the right track.'
  :                                '🟢 In a healthy range — nice.';
```

**Every triage decision is made on the 7-day mean. There is no rule on the reading just entered.**

Worked example, entirely within the tool's own arithmetic:
a user logs `120, 118, 122, 119, 121, 118` over six days, then enters **200/125** today.
`avgS = round(798/7) = 133`. The tool renders:

> `🟡 Slightly raised — you're on the right track.`

200/125 mmHg is in hypertensive-crisis territory. The tool has the number, stores it, and prints
reassurance. The green/yellow branches also carry actively soothing copy ("you're on the right
track", "nice"), which is the worst possible framing over a suppressed signal.

Secondary problems in the same block:
- The top rung is `🔴 High — please see a doctor soon.` There is **no urgent tier at all** — no
  ≥180/120 branch, no "today", no emergency route. v1.9 §3.12 orders publish-repair validation with
  *"1. urgent/safety destination missing"* first, and §4.7 requires authored urgent signals to *"open
  a stop/help route"*. Neither exists here.
- The thresholds (160/100, 140/90, 130/80) carry **no source and no population**. They are inline
  literals in a template string. The tool description claims *"I show your 7-day average and flag
  when it needs a doctor"* — a clinical-escalation promise.
- Input validation accepts anything `0 < n < 300` (`app.js:5887`), so 250/200 stores silently.

**LEGAL-CLINICAL — needs Felix and a clinician.** The minimum defensible change is: triage on the
**latest reading** as well as the mean, add an urgent tier, cite the thresholds, and never print a
reassuring adjective when any reading in the window is above the amber line. I have not applied it.

---

## 2. P0 — The only two reminder tools promise a Telegram bot that was deleted on 2026-07-28

**Status: VERIFIED (`site/app.js:5291-5297` and `:5778`; `server.js:679, 825, 1017`).**

```js
{ id: 'wake', icon: '⏰', name: 'Fixed wake-time reminder', kind: 'reminder',
  how: 'Set one wake time; the bot nudges you nightly to protect your wind-down.', … },
{ id: 'sunlight', icon: '☀️', name: 'Morning-sunlight reminder', kind: 'reminder',
  how: 'The bot reminds you to get outside within an hour of waking.', … },
```

And the entire renderer for that kind (`app.js:5778`):

```js
if (f.kind === 'reminder') return `<div class="fn-w"><div class="fn-w-h">…<b>${esc(f.name)}</b></div>
  <p class="fn-w-sub">${esc(f.how)}</p></div>`;
```

**No input. No control. No time picker. No scheduling. No notification permission request.** The
widget is a static paragraph.

The bot it names is gone. `server.js:679` — *"(The Telegram notification branch was removed
2026-07-28 with the bot. Email is now the …)"*; `server.js:1017` — *"Bot photo uploads are gone with
the Telegram integration (removed 2026-07-28)"*; `server.js:825` records the removed
`telegram_users` clause. The only surviving `telegram` strings in `app.js` are three share-sheet
labels ("paste it into WhatsApp / Telegram / X").

So: **the product has two tools of kind `reminder`, both of which are pure text, and both of which
tell the user a bot will contact them. Zero reminder delivery exists anywhere in RNAwiki.** A user
who selects "Fixed wake-time reminder" — the tool the corpus itself calls *"the biggest lever for
sleep"* — receives nothing at all, and is not told so.

This also propagates into the data: **15 of the 22 tools carry `tg: true`**, a flag whose only
purpose was bot eligibility. It is now a dead field that will mislead the next reader of this file.

**INFERENCE:** the honest options are (a) delete both reminder tools and the `tg` flag, or (b) build
reminders on the Notification API / a calendar `.ics` export. (b) is real work; (a) is a five-line
change and stops the product lying today. Note the "no camera" constraint is untouched by either.

---

## 3. P1 — Timers are counter-based, not wall-clock, and leak

**Status: VERIFIED (`site/app.js:5905-5915`).**

```js
function startFnTimer(f, btn, render) {
  if (!f) return; const disp = …; let s = f.target * 60;
  btn.disabled = true; btn.textContent = 'Running…';
  const tick = () => { …; if (s <= 0) { clearInterval(iv); …markDone…; return; } s--; };
  tick(); const iv = setInterval(tick, 1000);
}
```

Four defects in eleven lines:

1. **Not wall-clock.** `s` decrements once per `setInterval` fire. Browsers throttle background
   intervals to ≥1 s and far more aggressively when a mobile screen locks. The flagship tool is a
   *"Post-meal walk timer"* — the exact tool a user starts and then pockets the phone. It will
   under-count wall time and either finish late or never. Fix: store `startedAt = Date.now()` and
   derive remaining time.
2. **No cancel, no pause.** `btn.disabled = true` and the only exit is reaching zero.
3. **Interval leak.** `iv` is captured only inside `tick`. If the SPA re-renders or the user
   navigates (this is a hash router — navigation does not unload the page), the interval keeps
   firing against a detached node and is never cleared. Every abandoned timer leaks one interval for
   the lifetime of the tab.
4. **Completion is all-or-nothing and unsaved until zero.** `d.fn[f.id] = true` is written only in
   the `s <= 0` branch. A user who genuinely walked ten minutes but navigated away at minute nine
   gets no credit and no partial state. §11 requires a defined **save conflict** and **context
   expired** state; there is neither.

Accessibility (§10): `.fn-timer-disp` has **no `aria-live`**, so a screen-reader user gets no
countdown and no completion announcement. The `▶ Start 10 min` button's label never updates beyond
`Running…`.

---

## 4. P1 — Exercise and stretch action fields are almost entirely absent

**Status: VERIFIED (census over `site/exercises.js`, 873 records).**

`prescription` keys present anywhere in the corpus: `source, sets, reps, tempo, rest, hold, cue`.

### 4.1 Every prescription in the product is a machine default

**`prescription.source === "default"` on 873 of 873 records.** There is not one reviewed exercise
prescription in the corpus. Sample: `{"source":"default","sets":3,"reps":"10-12","tempo":"2-1-2","rest":"60s"}`.

That value is **never surfaced to the reader**. A user on a rehab protocol sees "3 × 10-12, tempo
2-1-2, rest 60s" presented with the same confidence as everything else on the page.
§3.10 asks for "reviewed defaults"; §11 says *"No state may silently substitute approximate data or
imply 'safe'."* Rendering `source:"default"` as a visible "generic starting point, not a personal
prescription" label is a one-line honest fix that costs nothing.

### 4.2 §3.10 Exercise fields — coverage

| §3.10 field | present on |
|---|---|
| sets | 873 |
| reps / seconds / distance / duration | 873 (`reps`), 123 (`hold`, stretch only) |
| **side mode** | **0** |
| **load mode + unit-aware value** | **0** |
| **effort (RPE / RIR / %)** | **0** |
| tempo | 873 |
| rest | 873 |
| **range** | **0** |
| **frequency and session slot** | **0** |
| equipment | 796 of 873 (**77 null**) |
| **reviewed substitutions** | see §4.4 |
| regression / progression links | `regression_id` 309 · `progression_id` 698 · **neither on 123** |
| criteria / initiator / scope / blockers for progression | **0** |
| tutorial / media | `image` 873 — all remote (see §6) |
| **source versions** | **0** (corpus-level `schema_version: 3` only) |

### 4.3 §3.10 Stretch/mobility fields — coverage

123 records with `kind === 'stretch'`; all 123 carry `hold` and a stop-rule-ish string.
**Absent on all 123:** subtype (static / dynamic / controlled-range), rounds, side mode, sensation
scale, enter/hold/release tempo, **breathing** (0 records), expected-vs-unexpected sensation, and
smaller-range alternatives with criteria. §7 of v1.9 builds a whole wiki surface on fields that do
not exist.

### 4.4 Substitutions are variation swaps, not equipment substitutions

`app.js:8044-8068` implements **Easier/Harder**, which swaps the card to the linked
`regression_id`/`progression_id` exercise, and — correctly — *"only appear when a real variation
exists"* (the comment records this as a deliberate honesty decision). But:

- **123 of 873 exercises have neither link**, so they offer no alternative at all.
- The swap is by **difficulty**, not by **equipment**. §3.10 asks for equipment substitution
  ("I don't have a barbell"), and §10 asks for accessibility substitutions ("I can't kneel").
  Neither exists. `equipment` values are a flat 13-item enum (`body only, machine, other, foam roll,
  null, kettlebells, dumbbell, cable, barbell, bands, medicine ball, exercise ball, e-z curl bar`)
  with no substitution graph between them.
- `needs_scaling_bounty` is present on all 873 records and **true on 0**. It is an orphan field
  pointing at the Micro-bounty Board, which `app.js` (comment near :8660) records as REMOVED on
  2026-08-08. Same class of dead artefact as `tg: true` in §2.

### 4.5 5 exercises ship with empty `instructions`

`instructions.length === 0` on 5 of 873. They still render as prescribable actions inside protocols.

---

## 5. Commercial-link governance — and an unresolved contradiction

### 5.1 What exists (OBSERVED)

- `partners` table + `POST /api/partners` (`server.js:1673-1690`), admin approve/reject
  (`app.js:3874-3876`), `status ∈ {pending, active, rejected}`, and a `backlink_url` column. Only
  `status='active'` rows are served. So there **is** a relationship-and-review gate, which is more
  than v1.9 §3.10 finds in most products.
- `app.js:3698` states the policy to the reader: *"It will not tell you what to buy, or name a brand
  to buy. Nothing is for sale; no affiliate links."*
- **Marketplace / Credits / Avatar Level do not exist in the codebase** (6 incidental string matches
  in `app.js`, 0 in `server.js`, 1 in `db.js`).

### 5.2 What is missing against §3.10 / §7.9

A partner row carries `name, type, location, link, serves` — and **no jurisdiction, no relationship
or commission disclosure, no last-checked date, no expiry**. §3.10 requires "marketplace or
commercial link only after eligibility, relationship, and jurisdiction review"; the v1.9-derived
`v19_wiki_blocks_audit.md:860` requires the component to state "seller, jurisdiction,
relationship/commission, last price check". The `backlink_url` field verifies that the partner links
*back* to RNAwiki — which is an SEO relationship, and is precisely the kind of relationship §3.10
wants **disclosed to the reader**. It currently is not.

### 5.3 CONTRADICTION — needs Felix

| Source | Says |
|---|---|
| AGENT_RULES non-negotiable 1 | *"Free. No paywall, **no affiliate links**, no brand recommendations."* |
| `app.js:3698` (shipped, reader-facing) | *"Nothing is for sale; no affiliate links."* |
| v1.9 §4.6 / §5.6 | Marketplace Credits, Community Boost multiplier, Money Tree, redemption states |
| v1.9 §3.10 | *"marketplace or commercial link only after eligibility, relationship, and jurisdiction review"* |
| `v19_wiki_blocks_audit.md:860-863` | a commercial component stating "seller … relationship/commission" |

v1.9 supersedes earlier **layout** decisions; it does not supersede stricter safety/privacy controls,
and "no affiliate links" is a **product** constraint, not a layout one. Building §4.6's Credit
economy and §7.9's commercial component would reverse a promise that is currently rendered to
readers. **I am not resolving this. It needs an explicit decision, and if the answer is "build it",
the reader-facing sentence at `app.js:3698` must change in the same commit.**

Note also §4.6's *"no reward for … adding compounds"* — the food-submission path already pays
**+20 reputation on insert** (`server.js:1731`), before any validation. See
`nutrition_data_audit.md` §5.

---

## 6. P1 — Data collected, retention, and third-party leakage

### 6.1 Retention is undeclared everywhere

Tools write into `getPlan()` → `localStorage`, indefinitely, keyed by date (`plan.log[YYYY-MM-DD]`).
Stored per day: pain triage reads, symptom and readiness 1-5 scales, **blood-pressure readings**,
sleep in-bed/asleep/wake times and computed efficiency, eating-window timestamps, free-text "one
small win" entries, adherence ticks, and every counter.

That is a **health record**. There is:
- **no retention statement** anywhere in the product;
- **no export**;
- **no per-tool delete** (the fuel tracker has a `confirm()` reset; the tools do not);
- no `/me`-level "delete my data" path for this store that I could find.

§9.2 lists *"symptoms, outcomes … private notes, observation data, adherence/confounders"* as
**never public** — and correctly, none of this is sent to the server, so the privacy posture is
actually strong by construction. The gap is **§11's required delete/withdrawal state** and the
absence of any statement of what is kept and for how long. **PRODUCT DECISION**, cheap to fix.

### 6.2 Two third-party leaks in the action path

1. **OpenFoodFacts barcode lookup** (`app.js:8593`) — sends a scanned food barcode + IP to
   `world.openfoodfacts.org`, with no disclosure. Also blocked by the served CSP
   (`connect-src 'self' https://accounts.google.com https://pubchem.ncbi.nlm.nih.gov`), so it is
   simultaneously a privacy exposure and dead code. Full treatment in `nutrition_data_audit.md` §6.2.
2. **Exercise media** — all 873 `image` values point at `https://cdn.jsdelivr.net/gh/yuhonas/…`.
   Permitted by `img-src 'self' data: https:`, so they render — but every protocol view tells jsDelivr
   which rehab exercises the reader is viewing, and the §11 **offline** state degrades to a broken
   image grid. Mirroring 873 images at build time removes both.

### 6.3 The progress-photo promise

`adhere.how` (`app.js:5271`): *"I track your streak and remind you to snap a monthly progress photo
**(kept privately in your own album)**."*

The product stores **only a date** (`plan.tools[id].lastPhoto = today()`, `app.js:5889`). There is no
album, no storage, no gallery. The toast even says *"📸 Logged — keep it in your album"*, i.e. the
user's own phone. Reading the two strings together, the tool description asserts a private-storage
feature that does not exist. Honesty defect; one word ("your phone's album") fixes it.

---

## 7. Interest-collection removal scope (per the owner's decision today)

The owner's decision: **remove the collection-of-interest feature entirely.**

Verified state:

| Surface | State | Action |
|---|---|---|
| Landing-page form | **already gone** — `grep -c "api/interest" site/home.html site/index.html` → **0, 0** | ✅ done |
| `POST /api/interest` | live (`server.js:1079` INSERT) | remove |
| `POST /api/interest/remove` | live (`server.js:1102` DELETE) | remove **last** — it is the only way a stored row can be deleted, so it must outlive the insert path until the table is dropped |
| `interest_signups` table | live (`db.js:342-351`) — holds `email UNIQUE`, `topic`, `topic_other`, `remove_token` | drop, **after** exporting or deleting existing rows. This is PII. |
| `INTEREST_TOPICS` + `site_config.json → interest.topics` | live (`server.js:947, 2835, 2857`) | remove |
| `/thanks` 303 redirect + `?topic=` echo handler | live (`server.js:2667-2743`) | remove |
| **`registerAiInterest()`** (`app.js:8557-8567`) | **live — a SECOND interest-collection surface** posting `targetId: 'feature:ai-food-scan'` to `/api/votes`, rendering *"N people want snap-a-photo food logging — I build it when enough of you do."* | **in scope; not previously named.** It is account-gated (`if (!ME) return openAuth('register')`), so it is also an account-creation funnel. |

**Ordering matters:** dropping the table before the removal endpoint strands anyone holding a
`remove_token`, which converts the page's honest removal promise (`db.js:333` documents it as *"what
makes the page's removal sentence a fact rather than a promise"*) into a broken one. Delete the rows
first, then the endpoints, then the table.

---

## 8. Required states (§11) — implementation status for tool surfaces

| §11 state | Tool surfaces |
|---|---|
| loading | ⚠️ `loadUserFoods()` renders twice (before + after) — no skeleton, content shifts |
| empty | ✅ counters/timers render a zero state |
| no match | ✅ `renderFuelStack` has a "No compounds mapped" branch |
| **offline** | ❌ remote images break; barcode lookup prints *"Lookup failed. Check your connection."* for a CSP block |
| invalid route / real 404 | out of scope here |
| permission denied | ⚠️ auth gate renders, but as a growth prompt not a permission state |
| **review expired** | ❌ no review metadata exists on any exercise, food or compound record |
| **unsafe / high-risk blocked** | ❌ only `compoundTier === 'DANGER'` (3 compounds) — see `compound_content_audit.md` §5 |
| **unknown interaction coverage** | ✅ on `/stack` (genuinely well built) · ❌ on compound pages |
| **stale version / material update** | ❌ nothing is versioned |
| **save conflict** | ❌ `localStorage` last-write-wins, no detection |
| **delete / withdrawal** | ⚠️ fuel reset only; no tool-data delete, no export |
| success | ✅ `toast()` |
| **context expired** | ❌ timers lose all state on navigation (§3) |
| moderation hold | ⚠️ exists for food *corrections* only |
| payment states | n/a — no monetization shipped |

---

## 9. Findings table

| # | Finding | Severity | Status | Evidence |
|---|---|---|---|---|
| T1 | BP tool triages on a 7-day mean only; a 200/125 reading can render "🟡 …you're on the right track"; no urgent tier; thresholds uncited | **P0 safety** | verified | `app.js:5800-5810` |
| T2 | Both `reminder` tools promise a Telegram bot removed 2026-07-28; the renderer emits text only; zero reminder delivery exists | **P0 honesty** | verified | `app.js:5291-5297, 5778`; `server.js:679, 1017` |
| T3 | Timers are interval-counted not wall-clock, leak the interval on navigation, have no cancel and save nothing before completion | P1 | verified | `app.js:5905-5915` |
| T4 | 873/873 exercise prescriptions are `source:"default"`; zero reviewed; the flag is never shown to the reader | P1 | verified | `exercises.js` census |
| T5 | §3.10 exercise fields absent on all 873: side mode, load/unit, RPE/RIR, range, frequency; stretch fields absent on all 123: subtype, rounds, breathing, sensation scale | P1 | verified | §4.2-4.3 |
| T6 | No equipment or accessibility substitution model; 123/873 have no variation at all; `needs_scaling_bounty` is a dead field (true on 0) for a removed feature | P1 | verified | `app.js:8044-8068` |
| T7 | Tool data (BP, symptoms, sleep, free text) stored indefinitely with no retention statement, no export, no delete | P1 privacy | verified | `getPlan()`/`localStorage` |
| T8 | Partner commercial links carry no jurisdiction, relationship/commission disclosure, or expiry; `backlink_url` is an undisclosed SEO relationship | P2 | verified | `server.js:1673-1690`; `db.js` partners |
| T9 | Progress-photo copy promises "kept privately in your own album"; product stores only a date | P2 honesty | verified | `app.js:5271, 5889` |
| T10 | Exercise media (873 images) served from jsDelivr — third-party view tracking + offline failure | P2 privacy | verified | `exercises.js` `image` |
| T11 | `registerAiInterest()` is a second, unnamed interest-collection surface and an account funnel | P2 | verified | `app.js:8557-8567` |
| T12 | `tg: true` on 15/22 tools — dead bot-eligibility flag | P3 | verified | `PLAN_FUNCTIONS` |
| T13 | Marketplace/Credits (§4.6, §5.6) vs "no affiliate links, nothing is for sale" | — | **contradiction** | §5.3 |
| T14 | Timer/scale/triage widgets have no `aria-live`; no completion announcement | P2 a11y | verified | `app.js:5791, 5878-5882` |

**Positive control (do not regress):** all tool handlers bind to real `<button>`/`<input>` elements
via `onclick`/`onchange` — there is **no hover-only operation** anywhere in `PLAN_FUNCTIONS`, which
satisfies one §10 requirement outright.

---

## Appendix — reproduction

```bash
cd "/Users/admin/ClaudeRepo/Claude Projects/rnawiki"
# exercise action-field census
node -e "const fs=require('fs'),vm=require('vm');const sb={window:{}};sb.self=sb.window;vm.createContext(sb);
vm.runInContext(fs.readFileSync('site/exercises.js','utf8'),sb);const X=sb.window.RNAWIKI_EXERCISES.exercises;
const m={};X.forEach(e=>{const s=(e.prescription||{}).source;m[s]=(m[s]||0)+1});console.log(m,
X.filter(e=>!e.regression_id&&!e.progression_id).length, X.filter(e=>e.needs_scaling_bounty).length);"

# reminder/bot evidence
/usr/bin/grep -an "the bot nudges\|bot reminds\|kind === 'reminder'" site/app.js
/usr/bin/grep -an "removed 2026-07-28 with the bot\|Telegram integration (removed" server.js

# interest removal scope
/usr/bin/grep -an "api/interest" server.js ; /usr/bin/grep -c "api/interest" site/home.html
```
