# RNAwiki v1.9 — Protocol-domain model audit

**Role:** Protocol-domain modeller · **Wave A, read-only.** No product code was edited.
**Date:** 2026-08-11 · **Branch:** `refine/site-wide-2026-08`
**Companion:** `graph_hci_audit.md` (same author, same evidence set).

Scope: assessment · contributor path · Plan · Check-in · fixed-vs-ongoing lifecycle and completion
semantics · periodization · alternatives · versioning · participant compilation — repo today vs v1.9.
Plus the eight owner decisions of 2026-08-11.

Every repo claim below names the **document** (all UI claims are `hydrated`) and the viewport.
Raw JSON: `/Users/admin/.claude/jobs/b8afc277/tmp/qa/out/v19gh/`.

---

## 0. The headline

The repository already contains **most of the v1.9 domain — as authored prose and first-party JSON,
compiled at build time.** What it does not contain is any of it as a *model a user can author*.

| v1.9 concept | Repo has it as… | Machine-readable? | User-authorable? |
|---|---|---|---|
| Questions | `data/assessments.json`, 10 problems, weighted options | yes | **no** |
| Safety route before self-care | `redFlags` + `emergencyIdx` in the same file | yes | **no** |
| What may be going on | `graph.problems[].root_causes[]`, 52 across 41 problems | yes | **no** |
| Plan | `data/protocol_plan.json` `timeline[]`, 41/41, 4–5 stages each | **prose only** | **no** |
| Check-in | `data/protocol_safety.json` — 5 fields × 41/41 complete | **yes, fully structured** | **no** |
| Alternatives | `regression_id` 309 / `progression_id` 698 of 873 exercises | yes (ids only) | **no** |
| Multi-protocol stacking | `mergedPlan()` at `site/app.js:5918`, live at `/plan` | yes | yes (via wizard) |
| User-authored protocol | Studio: **flat list of ≤60 items**, no stages, no questions | yes | yes |

So the v1.9 job is **not** "invent a protocol domain". It is: (a) lift `timeline[]` out of prose into
a Plan object, (b) let a user author what Felix authors today, and (c) close the safety asymmetries
that already exist between the first-party layer and the user layer. Item (c) is where the P0s are.

---

## 1. P0 — SAFETY · Ten prescription-only, controlled and unapproved substances are pre-ticked onto the daily checklist at `/plan`, with no regulatory label, on 39 of 52 root causes

**Status: verified, hydrated, with the exact DOM.**

### The measurement

`v19_rx4.mjs` — `http://localhost:8099/plan` at 1440×900, plan seeded with the single protocol
`knee-pain / patellofemoral-pain`, `supps` untouched (the default a user gets by tapping through the
wizard without unticking anything). The `💊 STACK` layer renders **6 tickable rows, header `0/6`**.
Row 6, verbatim from the hydrated DOM:

```html
<div class="trk-item ">
  <label class="trk-row">
    <input type="checkbox" class="plan-cb" data-done="c159"
           aria-label="Mark Statins (Atorvastatin/Rosuvastatin) taken">
    <span class="trk-txt">
      <span class="trk-name">💊 Statins (Atorvastatin/Rosuvastatin)</span>
      <span class="trk-sub">Turn down your liver's cholesterol factory so it pulls LDL o…</span>
    </span>
    <a class="trk-i" href="#/c/statins-atorvastatin-rosuvastatin">Details</a>
  </label>
</div>
```

`c159` is authored `regulatory_class: "prescription"`, `consumer_renderable: false`.
The accessible name is **"Mark Statins (Atorvastatin/Rosuvastatin) taken"**. There is no badge, no
class pill, no "prescription-only", no "ask your doctor" — and this is a **knee-pain** protocol.

### The scale

Sweep of all 52 root causes, one at a time, reading `[data-layer="stack"] [data-done]` from the
hydrated DOM (`v19_rx3.mjs`):

- **39 of 52 root causes (75%)** put at least one `consumer_renderable:false` compound on the daily
  tick-list.
- Across the 12-problem union: **10 of 28** stack rows were `consumer_renderable:false` —
  Statins, Enclomiphene/Clomiphene, BPC-157, TB-500, Metformin, Acarbose, Semaglutide, Tirzepatide,
  Testosterone (TRT), T3/T4 Thyroid. Classes present: `prescription`, `controlled`, `unapproved`.
- Rows whose visible text contains any of `prescription|controlled|unapproved|℞|Rx|doctor|clinician|
  pharmacist`: **0 of 28**.

### Why this is the site contradicting itself, in writing

`site/app.js:5147-5187` is the assembly-catalogue withholding code. Its own comment states the rule:

> *"95 of 171 compounds are authored `consumer_renderable:false` … precisely because their own page
> refuses to render self-dosing. READING IS UNTOUCHED … **What changes is that a plan builder cannot
> hand one out.**"*

That last sentence is **false as shipped**. The filter is applied to `catalogSearch('stack', …)` — the
"＋ Add your own" search — and *not* to the default stack. `renderPlanBuilder()` at `site/app.js:5356`
defaults selection to every item:

```js
const selSupps = () => { const d = getDraft(); const s = d && d.supps;
  return s === 'none' ? [] : (Array.isArray(s) ? s : allSupp); };   // allSupp = every id in P.stack
```

and each checkbox renders `${on ? 'checked' : ''}`. So the surface that *searches* withholds them and
the surface that *pre-selects* hands them out, pre-ticked.

Three further contradictions of the site's own rules:

1. `studio-safety.js:57` rule `restricted-substance` — *"A published protocol may not instruct anyone
   to take a prescription-only, controlled or unapproved substance."* — refuses exactly these
   compounds in **user** protocols. First-party protocols are not held to the rule they enforce on
   users.
2. `stAddableC()` (`site/app.js:8847`) withholds them from the Studio catalogue.
3. AGENT_RULES constraint 6 (Medicines Act 1975 s.51).

### Honest caveats

- The compounds are **reachable and unticked-able**: a user can untick them in the wizard, and
  `/c/<slug>` pages exist and are correct. The defect is *default-on, unlabelled, on a daily
  "mark taken" checklist*.
- My seed set `supps: undefined`. That is the code's own default (`selSupps()` above) and therefore
  the state of any user who does not touch the supplement step — but a user who does deselect is not
  affected.

### Fix shape (spec, not applied)

Filter `P.stack` through `consumer_renderable !== false` for **selection and daily rendering**, and
disclose the withheld ones by name with a link — the identical pattern `catalogSearch` already uses
(`out.withheld` / `out.withheldTotal`). Then add a build gate
`assertPlanStackIsConsumerRenderable()` and **prove it by reintroducing `c159` into
knee-pain/patellofemoral-pain and requiring the build to fail.**

---

## 2. P0 — SAFETY · A ☠️ danger-tier interaction across stacked protocols is real, correct, and hidden inside a closed `<details>`

**Status: verified, hydrated.** `v19_ixn_fold.mjs`, `/plan` at 1440×900, 12 protocols stacked,
56 supplement rows.

The cross-protocol check exists and works — `site/app.js:6022`:

```js
const danger = M.supps.length > 1 ? interactionPanel(M.supps) : '';
```

It produced, correctly:

> ☠️ **Additive low-blood-sugar risk** — Berberine + Metformin + Acarbose + Semaglutide + Tirzepatide.
> *"Two or more glucose-lowering agents together can drop blood sugar too far… Insulin plus anything
> else is especially risky."*
> 🔻 **Two GLP-1 agonists — duplicate therapy** — Semaglutide + Tirzepatide.

Measured presentation (`site/app.js:6033`):

```
element:          <details class="trk-fold">
open by default:  false
summary text:     "🔬 Interaction & safety check   tap to view"
danger count in summary: absent
```

So a documented ☠️ hazard **assembled by the product itself** out of two protocols the user started
sits behind a neutral, closed disclosure whose label does not say anything is wrong. The panel's own
first line — *"☠️ 1 dangerous combination — read below"* — is inside the thing that is closed.

This is the owner's decision *"if drugs overlap, warn, and let the user remove/edit their plan"*
partially satisfied: the **warn** is built but muted; the **remove/edit** is fully built
(`data-remove-proto`, `site/app.js:6137`, 12 remove buttons measured).

**Fix shape:** danger and blunt tiers render *outside* the fold, always open; the fold keeps
timing-tier and good-pairing rows. The summary must carry the count when the count is non-zero.
This is a ~15-line change at `site/app.js:6033`.

---

## 3. P1 — Owner decision "one main protocol, maximum two more" is unenforced in both storage layers

**Status: verified, hydrated + schema.**

| Layer | Enforcement | Evidence |
|---|---|---|
| Local plan (`localStorage rnawiki_plan`) | **none** | `site/app.js:5488` / `:5545` — `p.protocols = planProtocols(p).filter(…).concat(entry)`. Seeded **12** protocols; `/plan` rendered all 12 with 12 remove buttons and 56 supplement rows (`out/v19gh/plan_12proto.png`). |
| Server ledger (`experiments`) | **none** | `POST /api/experiments/start`, `server.js:2083`. `UNIQUE(participant, problem_id, root_cause_id)` (`db.js:365`) dedupes a *repeat* start; it does not cap the count. `runningTotal` is computed at `server.js:2069` and never used as a limit. |

There is also **no "main / core" designation** anywhere — no column, no field, no UI. §5.3 of v1.9
("Core and Active Protocols") and the owner's "one main protocol" both need one.

**Related architectural finding (P1):** there is no endpoint that lists a participant's started
protocols. `GET /api/experiments/mine` **requires** `?problem=&rc=` (`server.js:2058`) and returns
`blank` without them. The client only knows what to ask about because `localStorage` already holds the
list — so a user who clears their browser loses the *identity* of their started protocols while the
server still holds the `experiments` rows and the streak ledger. That is silent data loss with a
recovery path that exists in the database and not in the API.

---

## 4. Fixed vs ongoing lifecycle and completion semantics

### 4.1 The repo has no timing model at all

The only temporal field a Studio item can carry is `days` — a set of weekday numbers
(`studio-safety.js:36`, `OVERRIDE_KEYS`, validated at `:113` as *"distinct weekday numbers, 0
(Sunday) to 6"*). That is a weekly recurrence and nothing else. There is:

- no duration, no unit, no start rule;
- no completion rule and no completion title;
- no review interval, no pause/exit;
- no `PlanTiming.kind` and therefore no fixed/ongoing distinction;
- **no Plan object to hang any of it on** — the spec is a flat item array.

**Verdict: ABSENT.** v1.9 §3.8 must be built from zero on the user side.

### 4.2 The first-party side has a fixed model — in prose

`data/protocol_plan.json`, **41/41 entries complete** on all five fields:

| Field | Coverage | v1.9 counterpart |
|---|---|---|
| `timeline[]` | 41/41, **4–5 stages each** (min 4, max 5, mean 4.0) | the sequential Plan chain (§3.8 "Starts first / After Foundation finishes") |
| `working` | 41/41 | Check-in signal |
| `reassess` | 41/41 | safety terminal / professional route |
| `context` | 41/41 | — |
| `troubleshooting` | 41/41 | §3.12 repair copy |

`timeline[].when` holds **35 distinct string values** across 41 protocols —
`Week 0`, `Weeks 2–4`, `Weeks 6–8`, `Week 12`, `Weeks 1-2` *(hyphen)*, `Weeks 1–2` *(en dash)*, …
The same interval is spelled two ways. **These are display strings, not durations.** Any migration to
`PlanTiming.fixed{durationValue, durationUnit}` must parse them, and 35 hand-written variants over 41
records is exactly the kind of set where a parser silently mis-reads a few. **Recommend a one-off
authored mapping table checked by a build gate, not a regex.**

### 4.3 The Check-in is the repo's best-modelled v1.9 concept, and the brief understates it

`data/protocol_safety.json` — **41/41 complete on all five fields**:

```
metric        41/41   "Pain on stairs, kneeling and standing up, week over week"
metricSource  41/41   the sentence a reader is shown
checkpoint    41/41   "Week 12"
stopIssue     41/41   "No change after 12 weeks of consistent strengthening"
stopHorizon   41/41   "12 weeks"
```

**Contradiction with the supplied audit set (D-10).** The W0 errata records the brief's
"0 of 52 protocols state a stop rule / 2 name a metric" as wrong (true figures 52/52 and 50/52) and
adds *"the real, smaller finding is that neither is structured."* Measured today, **both are
structured** — five typed fields at 100% coverage. What is *not* structured is the **rendering**:
hydrated `/protocol/anxiety/gaba-deficit` and `/protocol/knee-pain/patellofemoral-pain` at 1440×900
both emit the check-in as one prose section, `✅ What "it's working" looks like`, with
**0** elements carrying `data-metric`, `data-checkpoint`, `data-stop` or `data-checkin`. So the data
is ready for v1.9's Check-in node; only the projection is missing. That is a much cheaper job than the
errata implies, and I am flagging it because a plan built on "neither is structured" would
re-author 205 fields that already exist.

### 4.4 Completion, and the Champion trap

The repo has completion only as `experiments.status ∈ {running, completed}` + `outcome ∈
{better, same, worse}` (`db.js:356-366`), self-declared by the participant. No authored completion
rule, no completion title, no award.

The **prototype** invents one. `scheduleDefaults()` (`vfb.js:37`) for `mode:'fixed'` sets:

```js
completionRule:  'Complete all scheduled days',
completionTitle: `${state.title} Champion`,      // e.g. "Stronger knees Champion"
```

Both are **defaults with no author behind them**. §6.2 requires *"fixed Plans use **authored**
completion semantics"*, and V19-BLD-007 requires *"ongoing never invents completion or Champion"*.
The `ongoing` branch is correct — `normaliseSchedule()` deletes `completionRule` and
`completionTitle` when `mode==='ongoing'` (`vfb.js:37`), which is precisely right. The **fixed**
branch fabricates a Champion title from the protocol name. **P1 — the completion title must be a
required authored field with no default, or the site ships a manufactured accolade.**

---

## 5. Assessment and contributor path

### 5.1 What exists — and it is genuinely good

`data/assessments.json`: **10 of 41 problems** carry a clinician-shaped triage —
weighted differentiator questions → red-flag safety screen → result. Rendered by `openAssessment()`
(`site/app.js:1326`). Sequence: `step 0..Q-1` questions → `step Q` red flags → `step Q+1` result.
Safety therefore *precedes* the plan, satisfying §6.2's "urgent/safety destinations precede
self-care", and there is a two-tier escalation — `emergencyIdx` flags render
*"This needs emergency care now"* and **withhold** the "show the protocol anyway" button
(`site/app.js:1358-1372`). That escalation was added because the neck-shoulder quiz previously let a
cardiac-equivalent presentation through into a stretching plan. It is a well-earned piece of code.

### 5.2 D-06 — P1 · 31 of 41 problems skip the interactive red-flag screen entirely

`openIntake()` (`site/app.js:1312`):

```js
if (p.root_causes.length === 1) { navigate('/protocol/' + p.id + '/' + p.root_causes[0].id); return; }
```

Measured over the corpus: **41 problems, 31 with exactly one root cause, 10 with an assessment,
0 overlap.** So every one of `hip-mobility, elbow-wrist, ankle-foot, sarcopenia, cravings, thyroid,
blood-pressure, cholesterol, brain-fog, anxiety, low-mood, adhd-focus, memory, burnout, insomnia,
sleep-maintenance, shift-work, menopause, low-libido, bone-density, pcos, acne, inflammation,
gut-health, immunity, hypertrophy, strength-plateau, fat-loss-plateau, endurance-plateau,
pre-workout, overtraining` goes straight to the plan with **no red-flag gate**.

**Mitigation, measured and stated so this is not overclaimed:** the destination page carries the
safety content as its **first `<h2>`** — hydrated `/protocol/anxiety/gaba-deficit` at 1440×900 leads
with `🚩 First — when this is not a self-care problem`, and 41/41 `reassess` entries exist. So the
information is present; what is missing is the *interruption*. The asymmetry is the finding: 10
problems require an explicit "none of these" before showing a plan, 31 do not.

### 5.3 The result card is not "Possible reason · not a diagnosis"

`grep -a -c "Possible reason"` over `site/app.js` and `site/data.js`: **0 and 0**.
The assessment result headline is (`site/app.js:1382`):

> **Most likely: {root cause}** — *"Based on your answers — X · Y · Z — this most closely matches {rc}."*

with `Educational self-check, not a diagnosis.` as a small footer. §1.1 makes
**"Possible reason · not a diagnosis"** the participant-facing label and the locked mental model
requires it on the card itself. *"Most likely: Patellofemoral pain"* as an `<h2>`, with the
disclaimer three elements below, inverts the emphasis. **P1, copy-level, cheap.** It is also the
single string that most distinguishes RNAwiki from the products it must not resemble.

### 5.4 Contributor path — the differential exists but is not actionable

`anxiety` describes **6** causes in `why.causes[]` and ships **1** root cause with a protocol;
`insomnia` 7 and 1; `cravings` 6 and 1; `gut-health` 6 and 1. So the "what may be going on" layer is
authored ~6-wide and actionable 1-wide, and `openIntake()` routes straight past the other five.
v1.9 §3.3 wants several possible reasons each carrying their own Plan. **The content debt is
5 unactioned causes per single-root-cause problem, ×31 problems.** That is the real cost of the v1.9
grammar and it should be sized before the builder is built, not after.

---

## 6. Alternatives, periodization, specialist fields

| §3.10 requirement | Repo | Verdict |
|---|---|---|
| regression/progression **links** | `regression_id` on **309/873** exercises, `progression_id` on **698/873** | PARTIAL |
| regression/progression **criteria, initiator, scope, blockers** | **absent** — the exercise record has no such keys at all (full key list: `id,name,force,level,mechanic,equipment,primaryMuscles,secondaryMuscles,instructions,category,image,move_tags,score,kind,regression_id,progression_id,prescription,needs_scaling_bounty`) | **ABSENT** (V19-EXE-002 fails) |
| sets / reps / tempo / rest | present in `prescription{}` on 873/873 — **but `prescription.source === "default"` on all 873**, i.e. every exercise on the site carries the identical `{sets:3, reps:"10-12", tempo:"2-1-2", rest:"60s"}` | **P1 HONESTY.** A uniform machine default is being rendered as an exercise-specific prescription. 123/873 have a `cue`. |
| side mode, load mode, effort (RPE/RIR), range, frequency, session slot, equipment substitutions | absent (equipment present on 796/873, substitutions absent) | ABSENT |
| Stretch: hold/cycle, breathing, expected vs unexpected sensation, stop rules | absent as fields; `kind:'stretch'` exists | ABSENT |
| Supplement: exact formulation, route, risk tier, permitted CTA, jurisdiction, monitoring | `regulatory_class` + `consumer_renderable` merged at `build/parse.js:548`; dose ladders at `D.doseLadders`; **no formulation/route/jurisdiction/monitoring fields** | PARTIAL |
| Nutrition: unit, period, source version, privacy, contribution | `rc.nutrient_targets{}` + `data/foods.json`; no period/source-version/privacy state | PARTIAL |
| Tool: trigger, completion rule, data collected, retention, substitution | `PLAN_FUNCTIONS` with `{id,name,desc,target,unit,period,step}`; no retention or data-collected field | PARTIAL |
| **Periodization labels** (anatomical adaptation / hypertrophy / strength / taper / …) | **absent.** The nearest thing is `data/protocol_phase1.json` — 52 entries, one $0 first step per root cause, `{action, quote, from, class, cost}` | ABSENT |

§3.10's closing requirement — *"Every field above must round-trip exactly through save, reload,
reopen, duplicate, protocol versioning, participant preview, and published compilation. An
unsupported legacy value is preserved and flagged for review; it is never silently dropped."* — is
**violated today in the one place it can be tested.** `studio-safety.js:257` rebuilds the spec as
`{v:1, items: spec.items, note: …}`, so any top-level key the caller sent is dropped without a
refusal. Measured (`v19_api.mjs`): `{"v":1,"nodes":[…],"edges":[…],"items":[…]}` returns
`{"ok":true,"refusals":[]}` and stores neither `nodes` nor `edges`. Harmless now, a data-loss path the
moment the schema grows. **P2 today, P0 the day Plans are added.**

---

## 7. Versioning and participant compilation

### 7.1 Versioning — ABSENT, and it is the biggest silent correctness risk

- `studio_protocols` has **no `version` column** (`db.js:562-576`). The only version-shaped value in
  the whole schema is `user_consent.version` (`db.js:422`).
- A protocol item is `{k:'c', id:'c13'}` — a **bare corpus id with no version pin**. When a compound's
  dose ladder, evidence star, interaction row or regulatory class is corrected at build time, **every
  saved and published protocol silently changes meaning**, and no one is told.
- The comment at `studio-safety.js:31-36` argues (correctly) that a protocol must never carry its own
  copy of the text, *"the moment a protocol can carry its own copy of a compound's text, a correction
  to the master stops reaching the people running it."* That reasoning is right and it is why the
  answer is **id + version + a fail-closed check**, not embedded text. v1.9 §2.3 and §6.2 say exactly
  this: `ApprovedBlock.id + ApprovedBlock.version`, *"a version mismatch fails closed."*
- Published immutability holds today only because **editing was never built** — there is no UPDATE
  path, only INSERT of a new `code` (`server.js:1787`, `:1816`) and `status='withdrawn'`
  (`server.js:1868`). The moment "edit my published protocol" ships, immutability is gone unless
  versioning lands first. **Sequence this before the builder.**

### 7.2 The remix chain is the one versioning-adjacent thing that is well built

`STUDIO.resolve()` (`studio-safety.js:270`) walks `parent_code`, applies each diff, and is bounded
**twice** — `depth <= 8` as a CHECK constraint (`db.js:566`) *and* a counter in the resolver, with the
stated reason that *"a denormalised column can be wrong and a cycle must not hang a request."* An
orphaned diff returns an explicit error rather than rendering as an empty protocol. This is the
correct instinct applied to the wrong object: apply it to versions.

### 7.3 Participant compilation

The first-party compiler is real and large: hydrated `/protocol/anxiety/gaba-deficit` = **10,779
words**, `/protocol/knee-pain/patellofemoral-pain` = **10,425**, both with the section order
🚩 safety → 🔍 causes → 🗺️ plan/timeline → 🏃 move → 🥗 fuel → 💊 stack. That *is* v1.9's participant
scrolling page, already built, already crawlable.

The **user** compiler is `/p/<code>` rendering a flat item list. There is no Preview in the Studio
that compiles a participant page from the same state — the two compilers share no code. v1.9's
*"Preview compiles from the same canonical graph/version; no separately edited content"* is therefore
**ABSENT on the user side and PASS on the first-party side.** The cheapest honest path to v1.9 is to
make the user graph compile through the *existing* protocol-page renderer rather than writing a second
one — a second renderer is the defect class this codebase has caught repeatedly.

---

## 8. The eight owner decisions of 2026-08-11 — verified status

| # | Decision | Status | Evidence |
|---|---|---|---|
| 1 | Remove collection-of-interest entirely | **PARTIAL — removal scope confirmed** | Form is gone from the landing page and a build gate keeps it gone: `build/prerender.js:4487` fails the build if `/api/interest`, `type="email"`, `name="topic"` or `Count me in` reappear in `MAIN`. **Still live:** `POST /api/interest` (`server.js:1045`), `POST /api/interest/remove` (`server.js:1093`), the thank-you page (`server.js:2667-2760`), `INTEREST_TOPICS` boot log (`server.js:2857`), table `interest_signups` + index (`db.js:342-351`), note at `build/landing.js:10`. **Removal scope = those 7 sites + a data-retention decision on existing rows (PDPA).** |
| 2 | One universal account type | **EXISTING** | `assertOneAccountType()` at `build/parse.js:3417`; expert/steward routes redirect to home (`site/app.js:10036`). |
| 3 | Everyone with an account can build | **EXISTING, and stronger** | Building/saving/running need **no** account; only publishing does (`server.js:1779`). |
| 4 | One main + max two more | **ABSENT** | §3 above. No cap in either layer; no "main" concept. |
| 5 | Started protocols stack into one page | **EXISTING** | `mergedPlan()` `site/app.js:5918`; hydrated `/plan` with 5 and with 12 protocols rendered one merged Today checklist, deduped moves/supps, unioned tools, max-wins fuel targets. **This is already what the owner asked for.** |
| 6 | Warn on drug overlap, allow remove/edit | **PARTIAL** | Warn built (`site/app.js:6022`) but collapsed — §2. Remove/edit fully built (`site/app.js:6137`). |
| 7 | Community access for started protocols | **ABSENT** | No community route (`site/app.js:10036` redirects the retired ones to home). The nearest thing is `explain_posts` — threaded comments keyed to a `slug` (`server.js:1145-1200`, `db.js:496`), which is per **compound/pathway page**, not per protocol. A per-protocol Discussion needs a new key, not a new table. |
| 8 | New landing headline + full revamp, keep protocol search | **NOT STARTED** (out of my scope; noting the constraint) | `build/prerender.js:4478-4491` will fail the build unless every `<form>` on the home page is `action="/solve" method="get"` with `#hero-solve-input` and `#close-solve-input`, and every submit reads *"Show me the causes"* (plural, gated). **Any landing revamp must satisfy that gate or change it deliberately.** |

---

## 9. P0 / P1 summary

**P0 (safety / data-loss)**

1. **Prescription-only, controlled and unapproved compounds pre-ticked on the daily checklist**,
   unlabelled, on 39/52 root causes — `/plan`, hydrated. §1.
2. **☠️ danger-tier cross-protocol interaction hidden in a closed `<details>`** — `site/app.js:6033`. §2.
3. *(graph audit F-01)* **Publish gate does not implement §3.12 rules 1–2**; re-routing a red-flag
   answer to self-care is declared *"All routes terminate safely."* Proven by mutation.
4. *(graph audit F-03)* **"Remove Plan" destroys a Plan + its actions with no confirm and no undo**,
   while the reversible add-action *does* get an undo.
5. *(graph audit F-02)* **Prototype prints "Saved" and persists nothing**; the two states §3.4
   requires for unacknowledged work do not exist.

**P1**

6. No cap and no "main" designation on started protocols; 12 accepted (§3).
7. No endpoint lists a participant's started protocols — clearing the browser orphans server-side
   experiment rows (§3).
8. Fixed-Plan defaults fabricate `"{title} Champion"` and `"Complete all scheduled days"` (§4.4).
9. 31/41 problems skip the interactive red-flag screen (§5.2).
10. Result card says *"Most likely: X"*; the mandated *"Possible reason · not a diagnosis"* string
    appears **0** times in the repo (§5.3).
11. All 873 exercises share one `prescription.source:"default"` rendered as an exercise-specific
    prescription (§6).
12. No versioning on protocol item references; published immutability holds only because editing was
    never built (§7.1).
13. `interest_signups` + 2 endpoints + thank-you page still live after the owner's removal decision
    (§8.1) — plus an unmade PDPA decision on existing rows.

**Contradictions with the supplied audit set**

- **D-10** W0 errata says the stop rule and metric are *"not structured."* Measured: `protocol_safety.json`
  is fully structured, 5 fields × 41/41. What is unstructured is the **rendering** — 0 elements carry
  `data-metric`/`data-checkpoint`/`data-stop` on hydrated protocol pages. Plan accordingly; do not
  re-author 205 existing fields.
- **D-08** Brief says "58 build checks"; measured **54** `assert*` functions
  (`build/parse.js` 23 + `build/prerender.js` 31).
- **Non-finding retracted:** I first read `openIntake()`'s single-root-cause shortcut as a total safety
  bypass. Hydrated measurement of the destination page refuted the "total" — the red-flag content is
  the page's first `<h2>`. Recorded as P1 asymmetry, not P0.

---

## 10. What needs Felix

1. **§1 fix confirmation.** Filtering `consumer_renderable:false` out of the default stack removes
   Statins/Metformin/Semaglutide/TRT etc. from 39 root-cause protocols' checklists. Reading pages are
   untouched. Confirm that is the intent before an integrator applies it.
2. **Owner-demo vs v1.9 conflicts** — graph audit D-03…D-07: the right-rail block palette, the
   Safety-route block type, and the entry node are in the owner's own demo and forbidden or absent in
   v1.9 §3.4/§3.5. One of the two documents has to give.
3. **`interest_signups` data decision** — delete existing rows, export first, or retain? PDPA.
4. **Content sizing** — the v1.9 grammar wants several possible reasons per problem, each with a Plan.
   31 problems currently ship 1 actionable cause against ~6 described. That is the real v1.9 bill.
5. **Sequencing** — versioning (§7.1) must land *before* "edit my published protocol", or published
   immutability is lost the day editing ships.
