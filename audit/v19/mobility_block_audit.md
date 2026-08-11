# RNAwiki v1.9 — Stretch / mobility block audit (WAVE A, read-only)

**Role:** stretch & mobility specialist + media specialist
**Date:** 11 August 2026 · branch `refine/site-wide-2026-08`, tree clean
**Scope:** the 123 records in `site/exercises.js` with `kind: "stretch"`, measured against v1.9 §7
(Stretch and mobility wiki) and §3.10 (Professional action fields · Stretch/mobility).
**Method:** identical to `exercise_block_audit.md` — every user-facing claim is a hydrated-DOM
measurement (Chrome via `/Users/admin/.claude/jobs/b8afc277/tmp/qa/probe.mjs`, scripts in
`…/qa/out/`); data claims are computed off `site/exercises.js` with the script named. No `curl`-based
UI claims. Nothing was changed in the repository.

Labels: **OBSERVED FACT** · **INFERENCE** · **PRODUCT DECISION** · **LEGAL-CLINICAL DEPENDENCY**.

---

## 0. The headline

There is no stretch/mobility block in this repository. There are **123 records that were filed as
stretches by one string comparison** —

```js
// scripts/enrich-exercises.js:62
ex.kind = STRETCH_CATEGORIES.has((ex.category || '').toLowerCase()) ? 'stretch' : 'strengthen';
// STRETCH_CATEGORIES = new Set(['stretching'])
```

— and then given **one identical prescription, all 123 of them**:

```js
// scripts/enrich-exercises.js:45
{ sets: 2, hold: '30s', rest: '20s', cue: 'ease to mild tension, never pain', source: 'default' }
```

Measured: `hold` is `"30s"` on **123/123**; `sets` is `2` on **123/123**; `rest` is `"20s"` on
**123/123**; `cue` is that exact sentence on **123/123**; `source` is `"default"` on **123/123**.
`regression_id` and `progression_id` are `null` on **123/123**.

Everything below follows from those two lines of code.

---

## 1. Challenge to `work/v19_wiki_blocks_audit.md` §6

§6.4 of that document is the right model — its static/dynamic field table is exactly what v1.9 §7 asks
for. My objections are about what it did not measure, because its **Files audited** list (lines 7–14)
contains four mobile prototypes and a *copy* of `app.js`/`data.js` under `work/audit/`, and **never
`site/exercises.js`**.

| # | Claim | My measurement | Verdict |
|---|---|---|---|
| M1 | §3.1.2 "Exercise and stretch are treated as **states of one page**" | True but far weaker than reality. They are not two states — **there is one classifier, one prescription and one renderer**, and the classifier is `category === 'stretching'`. `rxLine()` (`site/app.js:8057-8059`) is a two-branch ternary and is the *entire* static/dynamic model in the product. | **Understated.** |
| M2 | §6.4 table (static vs dynamic) | Correct as a target. The repo has **no subtype field at all** — not `static`, not `dynamic`, not `controlled range`. `force:"static"` exists on only **94 of 123** stretch records (push 7, pull 20, null 2) and is an upstream biomechanics label, not a stretch subtype. | **Right rule; the doc never states the zero baseline.** |
| M3 | §6.6 "Reduce the range if…" copy contract | Cannot be attached to anything: **0 of 123 stretch records have a regression or progression id**, and `exerciseCard()` explicitly suppresses the Easier/Harder buttons for stretches (`site/app.js:8070-8071`, `e.kind !== 'stretch' &&`). So the doc's §6.6 "Smaller range / Current / Next step" triad has **no data and no UI** behind it today. | **Missing baseline.** |
| M4 | §14.3 "Static and dynamic modes expose different required fields" | Un-runnable: there is one mode. As written this test passes vacuously. | **Needs restating as a data gate.** |
| M5 | Whole §6 | Never mentions that **14 self-myofascial-release (foam-rolling) records** and **7 jumping/lunging records** are inside the stretch set carrying a 30-second hold. | **Missed the live content defect.** |

**Contradiction with the earlier PRD** (`RNAwiki_Core_Protocol_Product_Requirements_Document.docx`,
extracted line 107): *"46 stretch records describe rep-based/dynamic movement while the template
renders a 2 × 30-second hold."* I cannot reproduce 46 and the PRD gives no method. My bounds
(script `/tmp/dyn.js`): **29** strict (instructions literally prescribe repetitions) / **58** broad
(any dynamic signal in name or instructions). Recorded as an open contradiction.

---

## 2. P0 findings (safety)

### P0-M1 — A plyometric jumping drill is served under "🧘 Stretches" to a knee-pain protocol, at "2 × 30s hold · ease to mild tension, never pain"
**OBSERVED FACT · verified hydrated, 1440×900, script `out/cue.mjs`.**

Route: `/#/protocol/knee-pain/patellofemoral-pain` → **Start building my plan** → step 2
**🧘 Stretches**. The two cards rendered, verbatim:

```
All Fours Quad Stretch | 2 × 30s hold · rest 20s · ease to mild tension, never pain | Stretches: Quadriceps →
Frog Hops            | 2 × 30s hold · rest 20s · ease to mild tension, never pain | Stretches: Quadriceps →
```

`Frog Hops` (`site/exercises.js`, id `Frog_Hops`) is:
`category:"stretching"` → `kind:"stretch"`, `mechanic:"compound"`, `level:"intermediate"`,
`move_tags:["vmo_knee_strengthening","hypertrophy_lower","power_plyometric","mobility_stretch"]`,
and its own instructions read:

> "Stand with your hands behind your head, and squat down… **Jump forward several feet**… As your feet
> contact the ground, absorb the impact through your legs, and jump again. **Repeat this action 5-10 times.**"

So a person who has just told the site they have **patellofemoral pain** is offered repeated loaded
jump landings, labelled a stretch, with an instruction ("hold for 30 seconds") that is physically
impossible for the movement, under a sensation cue ("ease to mild tension, never pain") that belongs to
a passive stretch.

`patellofemoral-pain` has no `avoid_movements`, so `notContra` is a no-op here — and the stretch
selection path does not call it anyway (see P0-M3).

**This one record is machine-detectable:** it is the only record in the corpus where
`kind === 'stretch'` **and** `move_tags` contains `power_plyometric` (measured: 1 of 123). Six more are
detectable by name shape (`Crossover Reverse Lunge`, `Groiners`, `Inchworm`, `Iron Crosses (stretch)`,
`Scissor Kick`, `Windmills`) — all seven carry `2 × 30s hold`.

### P0-M2 — The Protocol Studio silently reinterprets a 30-second hold as 10 repetitions
**OBSERVED FACT · verified hydrated, 390×844, script `out/studio6.mjs`.**

`/#/studio` → **＋ Add something** → **💪 Movements** tab → search `calf stretch` → add
`Calf Stretch Elbows Against Wall`. The row that lands in the protocol:

```
💪 | Calf Stretch Elbows Against Wall | 3 × 10 · every day | Adjust | SETS − 3 + | REPS − 10 + | …
```

The same record's own wiki page renders `2 × 30s hold · rest 20s` (hydrated, `out/final_meas.mjs`).

Cause: `stAdjust()` / `stSummary()` (`site/app.js:9130`, `9140-9141`) branch only on `it.k === 'x'`
and offer **Sets** and **Reps** steppers with hard-coded defaults `3` and `10`. There is no `hold`
field, no seconds unit, no stretch branch, and the record's own `prescription` is not read at all —
the strength records are mis-defaulted too (a `4×5-8` record also shows `3 × 10`).

v1.9 §3.10 closes: *"Every field above must round-trip exactly through save, reload, reopen, duplicate,
protocol versioning, participant preview, and published compilation. An unsupported legacy value is
preserved and flagged for review; **it is never silently dropped, defaulted, or reinterpreted**."*
A hold is dropped, a rep count is invented, and the icon says 💪 rather than 🧘. Classified P0 because
it changes what a person physically does, silently, on the surface that can be *published to others*.

### P0-M3 — The stretch selection path bypasses the contraindication filter (latent, currently firing 0 times)
**OBSERVED FACT (code) + measured negative (data).**

In `generateProtocol()` the strengthen list is filtered by `inRegion` → `notContra`
(`site/app.js:4593-4600`). The **primary stretch path is not**:

```js
// site/app.js:4636-4641  — no inRegion(), no notContra()
stretch = EX.exercises
  .filter(e => e.kind === 'stretch' && (e.primaryMuscles || []).some(m => muscles.has(m)))
  …
// site/app.js:4642 — only the FALLBACK path is filtered
if (!stretch.length) stretch = (EX.byTag['mobility_stretch'] || []).map(id => exById[id]).filter(e => e && inRegion(e))…
```

I tested both `avoid_movements` causes (script `/tmp/contra.js`): the contraindicated-stretch candidate
pool is **0 for both**, so nothing bad currently reaches a reader. Reported honestly as a **latent**
defect, not a live one — but it is one authored stretch away from firing, and it is the same defect
class that `build/parse.js:2695` exists to prevent.

*Related fragility, live:* the filter is a **name-substring** test. On
`/#/protocol/neck-shoulder/upper-cross` (whose `avoid_movements` lists `"overhead press"`,
`"military press"`, `"push press"` but **not** `"shoulder press"`), the #1 default movement rendered is
**`Alternating Cable Shoulder Press`** (verified hydrated, `out/builder_contra.mjs`). The neighbouring
cause's list *does* contain `"shoulder press"` and would have caught it. The comment at
`site/app.js:4586-4591` describes exactly this bug being fixed once, for one cause, by one keyword list.

*(The P0 that dominates both documents — R2 never being armed because the client never sends
`base_pid`/`base_rcid` — is written up in `exercise_block_audit.md` §P0-1 and applies identically to
stretch items.)*

### P0-M4 — 123/123 stretch pages state no expected sensation, no unexpected sensation, and no stop rule
**OBSERVED FACT · hydrated, 3/3 stretch pages sampled (`out/final_meas.mjs`).**

v1.9 §7.2 requires in the **first viewport**:
`Expected: gentle pull in the named region` and
`Not expected: sharp pain, tingling, numbness, cramping, or joint pinching`.

Measured on `/#/exercise/Calf_Stretch_Elbows_Against_Wall`,
`/#/exercise/Standing_Hamstring_and_Calf_Stretch`, `/#/exercise/Ankle_Circles`:
`hasStopLine: false` on all three (regex over the full hydrated page text for
`stop|sharp pain|not expected|tingling|numb`).

The one sensation string that exists in the data — `cue: "ease to mild tension, never pain"` — is
rendered by the builder card, the modal and the tracker row but **is dropped by the canonical page**:
`site/app.js:8710` appends `equipment · mechanic · force` after `rxLine(e)` and never `rx.cue`.
Measured page text: `2 × 30s hold · rest 20s · isolation · static`.

Also absent: the required region-map boundary sentence
*"This shows the expected region—not a diagnosis or a guarantee of which tissue is limiting you."*
and the required principle
*"Do not push deeper to earn completion. The assigned time—not maximum range—is the task."*
Neither string appears anywhere in `site/app.js` or `site/styles.css`.

---

## 3. Static vs dynamic — the measurements

Script: `/tmp/dyn.js` over `site/exercises.js` (`kind === 'stretch'`, n = 123).

| Signal | Count | Share |
|---|---|---|
| instructions literally prescribe **repetitions** (`repetition`, `reps`, `repeat for…`) | **29** | 24% |
| **name** is dynamic-shaped (`circle`, `swing`, `kick`, `hop`, `roll`, `SMR`, `windmill`, `scissor`, `inchworm`, `lunge`, `iron cross`, `march`…) | 32 | 26% |
| instructions describe repeated/continuous motion (`back and forth`, `alternat…`, `circular motion`, `repeat`) | 50 | 41% |
| **union — any dynamic signal** | **58** | **47%** |
| instructions actually say **hold** | 49 | 40% |
| neither hold nor any dynamic signal | 33 | 27% |
| **self-myofascial release / foam rolling filed as "stretch"** | **14** | 11% |
| **records whose own instructions require per-side work** | **69** | 56% |
| **records whose own instructions name a hold ≠ 30 s** | **38** | 31% |

**All 123 receive `2 × 30s hold`.**

### 3.1 The 14 foam-rolling records
`Anterior Tibialis-SMR`, `Brachialis-SMR`, `Calves-SMR`, `Foot-SMR`, `Hamstring-SMR`,
`Iliotibial Tract-SMR`, `Latissimus Dorsi-SMR`, `Lower Back-SMR`, `Neck-SMR`, `Peroneals-SMR`,
`Piriformis-SMR`, `Quadriceps-SMR`, `Rhomboids-SMR` (13 by name) plus `Adductor` (matched by text).
Self-myofascial release is neither a static stretch nor a dynamic mobility drill; v1.9 §3.10 asks for
`subtype: static stretch, dynamic mobility, controlled range drill`. SMR is a fourth thing, and
"hold for 30 seconds, ease to mild tension" is not its instruction. **Neck-SMR** in particular is a
record where the applied 30-second-pressure default deserves a clinician's eyes
(**LEGAL-CLINICAL DEPENDENCY**).

### 3.2 The card contradicts its own steps on the same screen — verified hydrated
| Route | Card says | Steps immediately below say |
|---|---|---|
| `/#/exercise/Calf_Stretch_Elbows_Against_Wall` | `2 × 30s hold · rest 20s · isolation · static` | "…**Hold for 10-20 seconds.** You may move further or closer the wall…" |
| `/#/exercise/Standing_Hamstring_and_Calf_Stretch` | `2 × 30s hold · rest 20s · other · static` | "…**Hold for 10-20 seconds and repeat with the other foot.**" |
| `/#/exercise/Ankle_Circles` | `2 × 30s hold · rest 20s · isolation · pull` | "…perform a circular motion with the big toe… **One circle equals 1 repetition.**… then repeat with the left leg." |
| `/#/exercise/90_90_Hamstring` | `2 × 30s Hold · Rest 20s · Body Only · Push` | "Extend your leg straight into the air, pausing briefly at the top… **Repeat for 10-20 repetitions**, and then switch to the other leg." |

38 of 123 pages contain this contradiction on hold duration alone (mostly the card's 30 s against the
steps' 20 s). `Ankle_Circles` and `90_90_Hamstring` are the sharper class: a **rep-counted drill sold
as a timed hold**, plus `· pull` / `· push` rendered as a participant-facing descriptor.

### 3.3 Side mode
**69 of 123** stretch records require per-side work by their own text; **no `sideMode` field exists**.
"2 × 30s hold" therefore under-states the true time by 2× on 56% of the set, or — for a reader who
takes it literally — leaves one side of the body unstretched. v1.9 §7.2 lists `side` in the first
viewport.

---

## 4. v1.9 §3.10 "Stretch/mobility" field-by-field

| v1.9 field | Holder in repo | Status |
|---|---|---|
| **subtype** (static / dynamic mobility / controlled range drill) | — | **ABSENT.** One classifier: `category === 'stretching'`. |
| rounds and hold/cycle count | `prescription.sets` + `prescription.hold` | **exists but is one constant** (`2` / `"30s"` on 123/123). No cycle mode. |
| **side mode** | — | **ABSENT** (69/123 need it) |
| gentle/comfortable sensation or reviewed scale | `prescription.cue` (one string, 123/123) | **partial, and dropped by the canonical page** (§P0-M4) |
| **enter / hold / release tempo** | — | **ABSENT.** `tempo` exists only on the 750 strength records. |
| **breathing** | — | **ABSENT.** Zero breathing fields; breathing appears only incidentally inside 3rd-party instruction prose. |
| **expected sensation** | — | **ABSENT** as a field |
| **unexpected sensation** | — | **ABSENT** as a field — the v1.9 "sharp pain, tingling, numbness, cramping, joint pinching" line has no holder |
| **smaller-range / alternative / next-step links + criteria** | — | **ABSENT.** 0/123 have `regression_id` or `progression_id`; the UI suppresses the buttons for stretches anyway (`site/app.js:8070-8071`). |
| equipment | `equipment` | **partial** — raw upstream enum, `other`/`null` common |
| **stop rules** | — | **ABSENT** |
| **media** | `image` (two JPEGs) | see §5 |
| **source versions** | — | **ABSENT** |

**Score: 2 of 13 v1.9 stretch fields have a holder, and both hold a single constant value.**

### 4.1 v1.9 §7.2 first-viewport conformance (hydrated, 1440×900, 3 pages)

| §7.2 requirement | Present? |
|---|---|
| `Stretch & mobility · Static stretch` **or exact subtype** | partial — renders `Stretch / mobility · beginner`; subtype does not exist |
| large tutorial / key frames | two JPEGs, §5 |
| exact **rounds, hold/cycles, side, breathing, position, timing** | 2 of 6 (rounds, hold) |
| **Expected:** gentle pull in the named region | **no** |
| **Not expected:** sharp pain, tingling, numbness, cramping, joint pinching | **no** |
| dominant **Back to today's action** | **no** — the only CTA is `Find a protocol that uses this →` |
| text action **Need a smaller range?** | **no** |
| "Do not show RPE by default for a simple static stretch" | **satisfied** — RPE does not exist anywhere (satisfied by absence, not by design) |

---

## 5. The real-video asset contract for stretches (v1.9 §7.2 — "the same as Exercise")

Identical to the exercise finding; the numbers below are the stretch subset.

| Requirement | Repo today | Evidence |
|---|---|---|
| representative real **stretch video** | **none.** `0 <video>` on 3/3 stretch pages sampled | hydrated `out/ex_dump.mjs`, `out/final_meas.mjs` |
| asset / version provenance | **absent** — `"free-exercise-db"` appears **0 times** in `site/app.js` and on no rendered page | grep |
| poster · loading state · **retryable error** | **absent** — `onerror` silently hides the frame (`site/app.js:8694`) | code |
| **written fallback** | **dishonest.** With the CDN blocked (`out/media_fail.mjs`) the media area is a 440×200 box containing only the caption **"▶ the movement (start ⇄ end)"**. The steps survive below. | hydrated |
| captions · transcript | **absent** — `0 <track>` elements | hydrated |
| slow / **reduced-motion** behaviour | **violated.** `.ex-demo.anim .exd-1{animation:exflip 2s infinite}` (`site/styles.css:1561`) measured `playState:"running"` under `prefers-reduced-motion: reduce`, no pause control | hydrated `out/rm.mjs` |
| **no surprise autoplay** | violated in spirit — an infinite cross-fade starts on load; two `▶` glyphs sit where no play control exists | hydrated |
| never a search-results link | **violated on 123/123** — `▶ Watch a form tutorial on YouTube` → `youtube.com/results?search_query=<name>+exercise+proper+form`, `target="_blank"` (`site/app.js:8690`) | hydrated |

**Specific to stretch:** a two-frame start⇄end cross-fade is a *worse* medium for a static stretch than
for a strength rep. The information a reader needs — *where the sensation should be, how far to go,
when to stop* — is exactly the information two still frames cannot carry, and the page has no words
carrying it either (§P0-M4).

---

## 6. Discovery, structure, accessibility (stretch subset)

- **0 of 123** stretch routes appear in `site/sitemap.xml` (568 `<loc>` entries, 0 match `exercise`).
- Hydrated `<title>` on every stretch page is the site-generic
  *"RNAwiki — translate the code of human performance into real results"*; `<link rel=canonical>` is
  per-page and correct; JSON-LD is `BreadcrumbList` / `WebSite` / `Organization` only.
- `headingCount: 1` on 12/12 movement pages sampled — "How to do it" / "Muscles worked" are
  `div.section-title` (`site/app.js:8713, 8718`), so there is no heading navigation.
- Median stretch page length **~130–172 words** (`Seated_Calf_Stretch` 130, `Ankle_Circles` 141,
  `Childs_Pose` 146, `Iron_Crosses_stretch` 143).
- `smallTargets: 15` at 390×844 on `/#/exercise/Calf_Stretch_Elbows_Against_Wall` (probe.mjs).

---

## 7. What NOT to do

1. **Do not delete the 123 records or the `cue` string.** The cue is the only authored safety sentence
   in the movement layer and it is correct; the defect is that the canonical page drops it.
2. **Do not "fix" the classifier by widening `STRETCH_CATEGORIES`.** The defect is that a *category*
   is being used as a *prescription mode*. Widening the set multiplies the error.
3. **Do not fabricate per-record holds, sides or breathing cues to fill the schema.** Constraint 5.
   The honest interim is an explicit "no reviewed prescription for this stretch yet" state, the same
   discipline `/plan`'s withheld-compound line already uses.
4. **Do not add RPE to static stretches** (v1.9 §7.2 forbids it by default) — the current absence is
   accidentally correct; keep it deliberately.

---

## 8. Ranked remediation spec (analysis only — nothing applied)

| # | Change | Where | Proof |
|---|---|---|---|
| 1 | Give the Studio a hold/seconds mode for `k:'x'` items and read the record's own `prescription` instead of hard-coded `3 × 10` | `site/app.js:9130, 9140-9141` | re-run `out/studio6.mjs`; the calf-stretch row must read `2 × 30s hold` |
| 2 | Add `subtype` (`static` / `dynamic` / `controlled-range` / `smr`) as a real field; back-fill from the measured signals; **gate the build** when a `kind:'stretch'` record carries `power_plyometric`, or when its instructions prescribe repetitions while its prescription is a hold | `scripts/enrich-exercises.js:62`, `build/parse.js` | reintroduce `Frog_Hops` as `kind:'stretch'` — the build must refuse (the gate must be *proved* by reintroducing the bug) |
| 3 | Add `sideMode`; back-fill the 69 records whose own text names a side | `scripts/enrich-exercises.js` | gate: instructions say "each side/other leg" and `sideMode==='both'` → build fails |
| 4 | Reconcile the 38 hold contradictions — the record's own instruction text is the more trustworthy source than a global default | data | a gate comparing the parsed instruction duration to `prescription.hold` |
| 5 | Render `cue` on the canonical page and author expected/unexpected sensation per subtype | `site/app.js:8710` | hydrated `hasStopLine` true on a random 20 |
| 6 | Apply `notContra` to the primary stretch path | `site/app.js:4636` | re-run `/tmp/contra.js` after adding a deliberately contraindicated test stretch |
| 7 | `prefers-reduced-motion` + pause control; honest no-media state; drop the YouTube search link | `site/styles.css:1561`, `site/app.js:8690-8698` | re-run `out/rm.mjs` and `out/media_fail.mjs` |

---

## 9. Open questions (PRODUCT DECISION / LEGAL-CLINICAL DEPENDENCY)

1. **Do the 14 SMR records belong in the stretch wiki at all?** They are a different intervention with
   different cautions. Keep as a fourth subtype, or move them out? (**PRODUCT DECISION**)
2. **`Neck-SMR` and the neck stretch set** carry a generic 30-second pressure default. Neck technique
   is the highest-consequence corner of this dataset. (**LEGAL-CLINICAL DEPENDENCY**)
3. **Who authors 123 real prescriptions?** v1.9's stretch contract cannot be met by derivation — hold,
   side, breathing, expected sensation and smaller-range criteria are authored facts. Scope this before
   promising §7 in a release gate. (**PRODUCT DECISION**)
4. **Self-host the demo frames** (removes a third-party per-page beacon on health-adjacent routes) — same
   question as the exercise audit. (**PRODUCT DECISION**)
5. The PRD's **"46 dynamic stretch records"** figure needs its method published or withdrawing; my
   reproducible bounds are 29 and 58.
