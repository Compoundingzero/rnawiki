# RNAwiki v1.9 — Graph / HCI audit

**Role:** Graph/HCI specialist · **Wave A, read-only.** No product code was edited.
**Date:** 2026-08-11 · **Branch:** `refine/site-wide-2026-08` (tree clean, 27 improvements unpublished)
**Authority:** `RNAwiki_Unified_Desktop_Experience_v1_9_Spec.md` (Markdown, source-authoritative).
§6.2 "Canonical graph invariants" as named in the task lives in
`RNAwiki_Unified_Experience_v1_9_Claude_CLI_Prompt.md:265-287`, not in the Unified Spec — the Unified
Spec's own §6.2 is "Exercise wiki · First viewport". **Recorded as a source-pack discrepancy (D-01).**
The invariant list itself is unambiguous and is what I audited against.

## 0. What I measured, and with what

| Artefact | Evidence route |
|---|---|
| v1.9 Flow Builder prototype | headless Chrome, `file://…/RNAwiki_Visual_Flow_Builder_Desktop_Prototype_v1_9.html`, viewports 1024/1280/1440/1728 + 200% zoom |
| Repo Studio | **hydrated** `http://localhost:8099/studio` at 1440×900 and 390×844 |
| Repo daily plan | **hydrated** `http://localhost:8099/plan` |
| Owner demo | `RNAwiki_protocol_builder_demo.mp4`, 52.0 s, 1920×1080, frames at 00:03/00:12/00:22/00:32/00:42 |
| ManyChat reference | 166.3 s, 1920×1080, frames at 00:45/01:35/02:30 |

Scripts and raw JSON: `/Users/admin/.claude/jobs/b8afc277/tmp/qa/v19_vfb_*.mjs`,
`/Users/admin/.claude/jobs/b8afc277/tmp/qa/out/v19gh/`.
Screenshots: `out/v19gh/vfb_1024.png`, `vfb_1440_zoom125.png`, `vfb_1024_zoom200.png`, `studio_1440.png`.

**Two-document rule observed.** Every claim about the repo below names `hydrated` and the viewport.
No claim in this file rests on `curl`.

---

## 1. The finding that governs everything else

**OBSERVED FACT.** The repository has **no graph**. `/studio` hydrated at 1440×900 renders
`svg: 0, canvas: 0, elements matching [class*=node|edge|map]: 0`, one `<h1>` ("Build a protocol"),
199 words, and six buttons (`Sign in`, `☰`, `＋ Add something`, `Clear`, `Publish…`, `💬 Feedback`).
Its own copy states the model: *"A protocol is a list of things you actually do: compounds,
movements, foods and small tools."* (`out/v19gh/studio_1440.png`.)

The wire format confirms it. `site/app.js:8834` `stSpec()` returns `{v:1, items:[…]}`;
`studio-safety.js:224` refuses anything else — measured against the live endpoint through the page's
own origin (`v19_api.mjs`):

```
POST /api/protocols/check  {"spec":{"v":2,…}}
  → {"ok":false,"refusals":[{"rule":"shape","message":"A protocol is {v:1, items:[…]}."}]}
```

There is no node, no edge, no question, no possible-reason, no Plan grouping, no Check-in, no
relationship and no timing kind anywhere in the persisted shape (`db.js:562-578`, column `spec JSONB`).

**Consequence for this audit.** Every one of the 20 invariants in §6.2 is currently *vacuous* in the
repo — not passing, not failing, but asserted over an empty set. That is the exact failure mode the
round-6 lesson names ("a gate over an empty set always passes"). The correct verdict for the repo is
**ABSENT**, not "fails". The prototype is where the invariants can actually be tested, so §2-§6 below
audit the prototype and §7 states the repo delta.

---

## 2. §6.2 invariant-by-invariant verdict

`P` = v1.9 prototype · `R` = repository. Verdicts: **PASS / PARTIAL / FAIL / ABSENT / N-A-IN-PROTOTYPE**.

| # | §6.2 invariant | P | R | Evidence |
|---|---|---|---|---|
| 1 | published versions are immutable | N-A | **PASS (by accident)** | `studio_protocols` has no UPDATE path; only INSERT of a fresh `code` (`server.js:1787`, `:1816`) and `status='withdrawn'` (`:1868`). Immutable because editing was never built, not because it was designed. No `version` column exists (`db.js:562-576`). |
| 2 | one reducer handles all graph mutations | **PARTIAL** | ABSENT | P mutates `routes[]`/`questions[]` in place from ~14 call sites (`normaliseModel`, `act()`, modal handlers); the only shared chokepoint is `render()`. |
| 3 | node/edge IDs stable and collision-resistant | **FAIL** | ABSENT | P has **no edge IDs at all** — edges are literal SVG path strings (`vfb.js:69`, `:71`). Node "IDs" are hand-written slugs (`load`,`control`,`recovery`,`base`,`build`,`control-plan`) with no uniqueness enforcement. |
| 4 | every assessment answer has a typed destination | **PASS** | ABSENT | P's destination picker offers exactly 5 typed options and no free text (measured, `v19_vfb_safety2.mjs`): *Show a possible reason · Ask a later question · Urgent guidance · Professional review · Unsupported request*. |
| 5 | urgent/safety destinations precede self-care | **FAIL** | PARTIAL | **See F-01.** P: no validator asserts a safety destination exists. R: red-flag screen precedes the result for 10/41 problems; the other 31 skip it (see D-06 in the domain audit). |
| 6 | every authored safety path terminates in the correct guidance destination and cannot fall through to self-care | **FAIL** | n/a | **F-01, proven by mutation.** |
| 7 | all public nodes reachable from entry | **PASS** | ABSENT | P `questionGraphIssues()` walks from question 0 and raises `question-unreachable` / `unreachable-route` (`vfb.js:60`). |
| 8 | self-edges prohibited; undeclared cycles prohibited | **PASS** | ABSENT | Enforced at *authoring* time, not just validation: the destination picker's "Ask a later question" option is labelled **"Self and backwards links are unavailable."** and `question:N` with `N<=qi` raises `question-cycle`. This is the single best piece of graph design in the prototype. |
| 9 | every public contributor path has a Plan or explicit no-match/professional route | **PARTIAL** | ABSENT | P raises `missing-plan`, but has no concept of an *explicit* no-match terminal attached to a possible reason. |
| 10 | every Plan has ≥1 eligible action or explicit non-action destination | **PARTIAL** | ABSENT | P raises `missing-item`. "Eligible" is never evaluated — see #20. |
| 11 | cycles allowed only for declared ongoing/review loops | **FAIL** | ABSENT | P forbids *all* back-edges (#8). There is therefore **no way to author the declared ongoing/review loop** that §3.3's Check-in stage and §3.8's `ongoing` timing both require. The Check-in node has no outbound edge at all (`overviewMap()`, `vfb.js:69`). |
| 12 | sequential / parallel / choose-one explicit | **PARTIAL** | ABSENT | P stores `relation: start\|after\|parallel\|alternative` and renders `NEXT / SAME TIME / OR` edge labels in route focus (`vfb.js:71`). Not represented at all in the overview map. |
| 13 | layout coordinates are presentation metadata | **FAIL** | ABSENT | **F-04.** In P the layout coordinate *is* protocol data: `routes[]` carries a literal `y:0 / y:124 / y:248` (`vfb.js:3-5`). Changing the map changes the model. |
| 14 | list/map/preview compile from the same state | **PASS** | ABSENT | `map()` dispatches to `listView()`/`overviewMap()`/`routeMap()` over one `routes`/`questions` model; `preview()` likewise. Verified by mutation: removing a Plan in map view removed it from list view. |
| 15 | undo/redo operates on canonical mutations | **FAIL** | ABSENT | **F-03.** |
| 16 | import/duplicate/API mutations pass the same validators as UI edits | N-A | **PARTIAL** | R validates item-level keys strictly (`{"plan":"p1"}` → refused, measured) but **ignores unknown top-level spec keys and silently drops them**: `{"v":1,"nodes":[…],"edges":[["q1","q1"]],"items":[…]}` → `{"ok":true,"refusals":[]}`, and `validate()` returns a rebuilt `spec:{v:1,items,note}` (`studio-safety.js:257`) so `nodes`/`edges` never reach storage. No exploit today; it violates §3.10's "never silently dropped, defaulted, or reinterpreted" and becomes a real data-loss path the moment the schema grows. |
| 17 | unreviewed/high-risk/expired blocks cannot enter published Plans | N-A | **PARTIAL** | R's `studio-safety.js` R4 `restricted-substance` blocks them at publish for **user** protocols. First-party protocols are not held to it — see **F-06** and the domain audit's P0-1. |
| 18 | every action reference is immutable `ApprovedBlock.id + version`; version mismatch fails closed | **PARTIAL** | **FAIL** | P has a frozen `approvedBlockRegistry` of 15 `AB-*` ids + semver (`vfb.js:13`) and attaches it to every action — good. But nothing ever *checks* it: no code path compares a stored version to the registry, so "fails closed" is unimplemented. R stores bare corpus ids (`{k:'c',id:'c13'}`) with **no version at all**, so a corrected dose or a withdrawn compound silently rewrites every saved protocol. |
| 19 | fixed vs ongoing lifecycle distinct; ongoing never invents completion | **PARTIAL** | ABSENT | See domain audit §4. P models both `PlanTiming.kind`s and correctly deletes the opposite kind's fields in `normaliseSchedule()` (`vfb.js:37`) — but the **fixed** default fabricates a completion title `` `${state.title} Champion` `` with no authored rule behind it. |
| 20 | every specialist field round-trips | **PARTIAL** | ABSENT | P holds the fields in memory only. **Nothing in the prototype persists** — 0 occurrences of `localStorage`, `sessionStorage` or `fetch(` in 80,682 bytes of script. See **F-02**. |

---

## 3. P0 findings (safety / data-loss)

### F-01 — P0 · SAFETY · The publish gate does not implement §3.12 rules 1 and 2. Re-routing a red-flag answer into a self-care Plan is declared safe.

**Status: verified by mutation.** Script `v19_vfb_safety2.mjs`, 1440×900.

1. At rest the header reads `Continue setup · 1`; the one blocker is *"Recovery and context needs a Plan"*.
2. Through the prototype's own UI I opened **Edit questions**, took answer 4 of question 1 —
   **"After a new injury or with severe symptoms"** — and used the **Change** control to move its
   destination from **Urgent guidance** to the self-care possible reason **Movement control**.
3. The editor's own verdict banner then read, verbatim:

   > **All routes terminate safely** — No cycles, missing destinations, or unreachable possible reasons were found.

4. The header still read `Continue setup · 1`, and clicking it still surfaced only
   *"Recovery and context needs a Plan"*. Publication is not blocked.

`questionGraphIssues()` (`vfb.js:60`) implements §3.12 rules **3, 4, 5, 6** and nothing else. There is
no check that an urgent destination exists anywhere in the protocol (rule 1), and no check that a
safety-flagged answer terminates in a guidance destination rather than falling through to self-care
(rule 2). Rules 7 (unreviewed/expired/high-risk action), 8 (contradictory timing) and 9 (missing
review/disclosure/consent/jurisdiction) are absent too — `issueList()` is exactly
`questionGraphIssues() + missing-plan + missing-item`.

**Why this is P0 and not a prototype nit.** This site has already shipped and fixed this exact defect
once: the neck-shoulder quiz omitted the referred-cardiac flag and a reader with anginal-equivalent
symptoms could pass into a stretching plan — the fix is still in the code with its own comment
(`site/app.js:1358-1366`, the `emergencyIdx` escalation). A builder that lets a creator undo that
with two clicks and prints "All routes terminate safely" reintroduces the defect class at scale, once
per creator.

**PRODUCT DECISION required:** rules 1 and 2 must be *authored*, not inferred. An answer needs a
`safetyFlag` (or the question needs a red-flag block) so the validator has something to check.
Inferring urgency from answer wording is not acceptable.

---

### F-02 — P0 · DATA-LOSS · The prototype says "Saved" and persists nothing; the two states §3.4 mandates for unacknowledged work do not exist.

**Status: verified.** `grep -c` over the extracted script: `localStorage` **0**, `sessionStorage`
**0**, `fetch(` **0**. The complete save vocabulary is two strings (`vfb.js:22`, `:41`):

```
saveStatus:'Saved in this tab'     // state.saveState = 'saved'
saveStatus='Editing—not saved'     // markEditing()
```

§3.4 requires four explicit states — **Saving… / Saved / Offline—changes on this device / Resolve
save conflict** — and says *"**Saved** appears only after the server durably acknowledges the current
revision."* Occurrences in the prototype of `Saving…`, `Offline—changes on this device` and
`Resolve save conflict`: **0**. `commitSession()` sets `saveState='saved'` synchronously with no
acknowledgement of any kind, and a reload loses the entire protocol.

**Contradiction worth recording (D-02):** the *repository* gets this right and the *prototype* gets it
wrong. `/studio` hydrated prints: *"Saved on this device. It is not on a server and nobody else can
see it."* That sentence is the correct pattern. The risk here is an implementer copying the
prototype's weaker string into production.

---

### F-03 — P0 · DATA-LOSS · "Remove Plan" destroys a Plan and its actions with no confirmation and no undo; the *reversible* action is the one that got undo.

**Status: verified by mutation.** `v19_vfb_undo.mjs`, 1440×900.

Selected the "Calm and rebuild" Plan (3 actions: Supported wall hold, Wall calf stretch, Pain traffic
light) → **Plan settings** → **Remove Plan**. Measured immediately after:

```
modal:   ""                                     (closed, no confirmation step ever appeared)
toast:   "“Calm and rebuild” was removed."
undoBtn: false                                  (no button matching /undo/i inside the toast)
```

Meanwhile `notify(message, undo)` at `vfb.js:124` *does* build a 6-second undo affordance — and the
only mutation that uses it is **adding an action** (`vfb.js:171`,
`plan.actions.splice(undo.index,1)`). So:

| Mutation | Undo | Confirmation |
|---|---|---|
| Add an action to a Plan | 6-second toast, then gone | n/a |
| **Remove Plan (+ all its actions)** | **none** | **none** |
| Remove an answer / a question | none | none (§3.6 requires showing which destinations become unreachable **before** confirmation — not implemented) |

There is no undo stack, no redo anywhere, and keyboard undo is explicitly unreachable: the global
handler returns early on `metaKey`/`ctrlKey` (`vfb.js:191`). §6.2 requires "undo/redo operates on
canonical mutations". Verdict **FAIL**, and the failure is asymmetric in the dangerous direction.

---

### F-04 — P1→P0-adjacent · The map does not draw the safety branch. What a creator can see is not what a participant will get.

**Status: verified, rendered.** `out/v19gh/vfb_1024.png`.

Question 1 has **5** authored answers. The overview map draws **3** edges out of the Questions node,
and there is **no urgent / professional-review / unsupported node on the canvas at all** — measured
node inventory at every width is exactly `question ×1, contributor ×3, program ×3, checkin ×1 = 8`.
The `guidance:urgent` destination on answer 4 and the `question:1` follow-up on answer 5 are drawn as
nothing.

Compare the **owner's own demo at 00:12**: the Ask card has a per-answer output port on the right of
*each* answer row, the third answer row is tinted red ("It gave way, or it locked"), and a **red edge
runs down to a distinct `Safety route` node reading "Stop here — Looking or giving way is not a
self-care problem. The path ends and says be seen."** The right rail at 00:03 lists `Safety route —
Ends the path, says be seen` as a first-class block type alongside Movement / Supplement / Food / Note.

The one thing the owner's intent puts on the canvas in red is the one thing the v1.9 prototype does
not draw. Combined with F-01 (no validator for it either), the safety path in v1.9 is neither
*visible* nor *checked*.

---

## 4. Camera, layout, collision — measured at every required width

§3.11 / V19-BLD-014: *"At 1024, 1280, 1440, and 1728 CSS pixels — and at 200% zoom — labels stay over
their columns, the map does not collide with the bottom workbench, and camera controls do not cover
nodes."*

### F-05 — P1 · Node collision at **all four** required widths, and workbench occlusion at 200% zoom.

`v19_vfb_geom.mjs`, JSON at `out/v19gh/vfb_geom.json`.

| Width | Zoom shown | Node overlap (px) | Map ∩ workbench | Camera ∩ nodes | Doc h-scroll |
|---|---|---|---|---|---|
| 1024 | 76% | **181 × 14** — "Front-of-knee load sensitivity" over "Movement control" | no | no | no |
| 1280 | 97% | **230 × 17** — same pair | no | no | no |
| 1440 | 100% | **238 × 18** — same pair | no | no | no |
| 1728 | 100% | **238 × 18** — same pair | no | no | no |
| 1024 @ 200% | — | **362 × 26** — same pair | **yes — all 8 nodes fall below the workbench top** | — | no |

Visually confirmed in `out/v19gh/vfb_1024.png`: the first possible-reason card's lower border sits
over the second card's upper border.

**Root cause, stated precisely.** Row position is a hardcoded constant in the data
(`vfb.js:3-5`, `y:0 / y:124 / y:248`) while row *height* is content-derived. The first card's summary
wraps to two lines and measures 108 px against a 124 px pitch (93 px for the others). There is no
measurement pass, no auto-layout and no collision resolution anywhere in the file. **A protocol whose
first summary is one word longer collides; the prototype is one string edit away from this at any
width.**

### F-06 — P1 · "Tidy map" is a no-op that reports success.

§3.11 defines **Tidy map** as *"recalculate presentation coordinates without changing protocol
meaning."* `vfb.js:149`:

```js
if(action==='tidy'){state.viewMenu=false;
  const width=state.focus==='overview'?1240:Math.max(1000,330+…);
  state.zoom=Math.min(1,Math.max(.75,(window.innerWidth-80)/width));
  notify('Map tidied. The protocol did not change.');return}
```

That body is **byte-for-byte the same computation as `action==='fit'`** (`vfb.js:180`). Tidy map
recalculates *zoom* and touches no coordinate. It therefore cannot fix F-05 — the collision it exists
to remove — and it prints "Map tidied." over a map it did not change. Two controls (`Fit view`,
`Tidy map`) do exactly one thing, which is also the duplication §3.4 forbids.

### F-07 — P1 · No pan. At maximum zoom 110 px of the map is unreachable, and a long route is mostly unreachable.

`v19_vfb_interact.mjs` at 1440×900, after 6× zoom-in (reads **125%**):

```
map:   left −55 … right 1495      stage: 0 … 1440
overflow: 55 px clipped left, 55 px clipped right
stage overflow-x: hidden ·  stage scrollWidth 1495 > clientWidth 1440
synthetic mousedown→mousemove→mouseup on #map: map moved 0 px
```

Handler inventory in the whole file: `keydown` ×1, `wheel` ×0, `pointerdown` ×0, `mousedown` ×0. §3.11
names only zoom-out / zoom-in / **Fit view**, so *no pan* is spec-conformant — but the combination of
`overflow:hidden`, no pan and no scrollbar makes the clipped region permanently unreachable, which the
spec cannot have intended.

**It gets worse at scale, and provably so.** `routeMap()` (`vfb.js:71`) lays Plans out at a fixed
`step=390` with `mapWidth = Math.max(1000, 330 + plans.length*390 + 220)`, and `fit` clamps zoom at a
**floor of 0.75**. A possible reason with 20 Plans therefore renders 8,350 px wide → 6,262 px after
the clamped 0.75 scale → inside a 1,440 px `overflow:hidden` stage with no pan. **≈77% of that
protocol is unviewable, at 20 Plans — nowhere near the 500-node budget.**

By contrast the ManyChat reference (01:35, 02:30) puts a camera stack (`fit / + / −`) at the right
edge, a canvas that pans freely, and drag-from-port edge creation (`Then ●` → `Next Step ○`). RNAwiki
should be simpler than ManyChat, but "simpler" cannot mean "content you cannot reach".

### Large-graph performance: 500 and 2,000 nodes

**INFERENCE, clearly labelled.** I could not load 500 or 2,000 nodes because the prototype's model is
closed over inside an IIFE and its overview geometry is authored per-route. What I can state as fact:

- `render()` (`vfb.js:123`) does `app.innerHTML = studio()` — a **full string rebuild and full DOM
  replacement of the entire application on every single interaction**, including every selection.
- Measured baseline at the shipped 8 nodes: **0.23 ms per full re-render**, 112 DOM elements,
  5,174 bytes of app HTML, 8 `.node`, 9 `<path>` (`v19_perf.mjs`).
- There is no virtualisation, no canvas/WebGL, no spatial index, no `requestAnimationFrame` batching
  and no diffing.

Linear extrapolation gives ~14 ms at 500 nodes and ~58 ms at 2,000 nodes for the string build alone,
before layout and paint — i.e. the raw arithmetic is survivable and the *architecture* is not: full
DOM replacement destroys focus, scroll and selection on every keystroke, and F-07's fixed-pitch layout
has already run out of viewport two orders of magnitude earlier. **The honest verdict is "not
testable at 500/2,000 in this prototype, and the layout fails long before the renderer does."**

---

## 5. Focus, keyboard parity, accessibility

**PASS — list view is a genuine equivalent for the mutations that exist.** `v19_vfb_list.mjs`
confirms that in List view, selecting a possible reason yields the same workbench
(`Edit wording`, `Add a Plan`) and selecting a Plan yields the same workbench
(`Plan settings`, `Add to this Plan`); Plan settings opens the same modal
(`Change ×3, Remove Plan, Save changes`). 9 `[data-key-target]` stops in list view vs 8 nodes in map
view. Individual Plan items are `<span class="pill">` and not focusable in either view — which is
**spec-conformant**, since §3.5 places "Plan item" inside Plan settings. I record this as a
**non-finding**; an earlier reading of mine treated it as a parity gap and the measurement refuted it.

### F-08 — P2 · WCAG 2.2 SC 2.1.4: a single-character shortcut with no off switch and no remap.

**Verified.** `vfb.js:191` registers a document-level handler where `a` triggers a context-dependent
Add. Test: focused the `.node.contributor` button, pressed `a` → the **Questions** modal opened
(`modalAfterPressingA: "Questions"`). The only guard is `event.target.matches('input,textarea,select')
|| isContentEditable`. `+`/`-` are the same shape. SC 2.1.4 requires a mechanism to turn off, remap,
or scope the shortcut to component focus. **OBSERVED FACT** = the behaviour; **INFERENCE** = the SC
mapping.

### F-09 — P2 · Arrow-key navigation is a flat wrap-around ring, not graph traversal.

`vfb.js:191`: Arrow Right/Down = +1 and Left/Up = −1 through `[...document.querySelectorAll('[data-key-target]')]`,
modulo length. Down behaves identically to Right. In a four-column graph a screen-reader or keyboard
user cannot move "to the Plan attached to this possible reason"; they can only walk document order.
§6.2's spirit and V19-BLD-009 are met in List view, so this is P2 — but Map view's keyboard model is
not a graph model.

### F-10 — P2 · Selection changes only on click; keyboard focus does not update the workbench.

The workbench is driven by `state.selected`, which is set exclusively in `onclick` handlers
(`vfb.js:129-133`). Arrow-keying to a node moves focus and `aria-pressed` stays on the old node, so
the `aria-live="polite"` workbench announces nothing until Enter/Space. §3.5 says *"Selecting a node
changes only the reserved bottom workbench"* — for keyboard users, focusing is not selecting.

---

## 6. Where the owner's demo and the v1.9 spec disagree

These are **PRODUCT DECISIONS for Felix**, not defects. The demo is explicitly "the owner's own
intent"; v1.9 supersedes earlier *layout* decisions. Both statements are true and they collide here.

| # | Owner demo (timecode) | v1.9 spec | Note |
|---|---|---|---|
| D-03 | Persistent right rail **"Add a block"** with 5 types: Movement / Supplement / Food / Note / **Safety route** (00:03, 00:12, 00:22, 00:42 — present in every frame) | §3.4: *"No floating 'New task', **generic block library**, always-open inspector…"*; §3.5: *"Only one Add command exists for the current focus."* | Direct contradiction. The demo's rail is exactly the "generic block library" §3.4 forbids. |
| D-04 | **Safety route is a draggable block type** that becomes a visible red terminal node | v1.9 has guidance *destinations* selectable inside the question editor, and draws no safety node | See F-04. The demo's model is strictly safer to author and to review. |
| D-05 | Explicit **entry node**: "Someone arrives · Knee pain — One of 41 problems. Six causes sit under this one." (00:03) | No entry node; the Questions node is the implicit entry | The demo's entry node is where the *problem* binding lives. v1.9 has nowhere to put it. |
| D-06 | Per-answer **output ports** on the Ask card; edges authored by connecting | Destinations chosen from a typed list in a modal; edges are non-interactive presentation | The v1.9 approach is what makes invariant #8 enforceable-by-construction. I'd keep v1.9's mechanism and adopt the demo's *rendering* (one drawn edge per answer). |
| D-07 | Plan cards carry typed rows inline: `MOVE / STRETCH / SUPPLEMENT / NOTE` with the exact prescription visible (00:22), plus a creator note *"The stretch that helps cause 1 makes this one worse. Same knee, opposite instruction."* | §3.5: Plan node shows "timing, item count, and up to four item chips" | The demo shows **cross-branch contradiction** as a first-class authoring concern. v1.9 has no representation of it at all — nothing warns a creator that two branches prescribe opposite things for the same joint. |

**ManyChat is correctly treated as anti-reference.** Its 00:45 frame is a full-screen **Templates
modal** with 9 template cards — precisely the "choice before the creator has a task" that §3.11
rejects. Nothing in that recording should be copied except the camera stack and free pan (F-07).

---

## 7. Repo → v1.9 delta for the graph layer

| Layer | Repo today (hydrated, cited) | v1.9 requires | Gap |
|---|---|---|---|
| Canvas | none — `/studio` has 0 svg, 0 canvas, 0 node/edge elements at 1440×900 | Map view + List view + Preview over one graph | build from zero |
| Desktop layout | `/studio` `<main>` is 1080 px wide inside a 1440 px viewport, single column — the phone UI stretched | four-column left-to-right map + reserved bottom workbench | build from zero |
| Model | `{v:1, items:[{k,id,dose?,days?,note?,sets?,reps?,target?}]}`, ≤60 items (`studio-safety.js:40`) | typed nodes + typed edges + Plans + timing | replace |
| Safety at save | **5 real rules**, mirrored to build gates and gate-enforced in both directions by `assertStudioSafetyMirrorsBuildGates()` — `unknown-entity`, `contraindicated-move`, `uncapped-dose`, `restricted-substance`, `animal-only-evidence` (`studio-safety.js:50-62`) | §3.12's 9 ordered publish rules | **keep all 5** and add graph rules 1-6, 8, 9 on top. This engine is the most valuable asset in the repo for v1.9 and must not be rewritten. |
| Versioning | none — no `version` column; bare corpus ids | `ApprovedBlock.id + version`, fails closed on mismatch | build from zero |
| Build gates | **54** `assert*` functions across `build/parse.js` (23) + `build/prerender.js` (31) — the brief's "58 build checks" does not reproduce at 58; measured 54 | — | correct the number in the brief |

---

## 8. Ranked remediation (graph layer only)

1. **F-01** — author a safety flag on answers/questions and implement §3.12 rules 1 and 2 before any
   other builder work. Prove the gate by reintroducing the exact mutation in §3: flip
   "After a new injury or with severe symptoms" to a self-care route and require the build to fail.
2. **F-03** — a confirmation + a durable undo stack for every destructive mutation; §3.6's
   "show which destinations become unreachable before confirmation" is the same fix.
3. **F-02** — implement the four save states, and make `Saved` conditional on a server ack. Copy the
   repo's `/studio` sentence, not the prototype's.
4. **F-04** — draw one edge per answer and draw guidance terminals as nodes. Adopt the demo's red
   safety terminal (D-04).
5. **F-05 / F-06** — replace authored `y` with a measurement + auto-layout pass; make **Tidy map**
   actually move nodes, and delete the duplicate **Fit view** or the duplicate **Tidy map**.
6. **F-07** — either allow pan, or make `Fit view` guarantee the whole graph is inside the stage with
   no zoom floor. `overflow:hidden` + zoom floor + no pan is unshippable.
7. **#11** — decide how a declared ongoing/review loop is authored. Today it cannot be expressed.
8. **F-08 / F-09 / F-10** — keyboard model.

## 9. Discrepancy register

- **D-01** §6.2 "Canonical graph invariants" is in the CLI prompt, not the Unified Spec. Recorded.
- **D-02** Prototype save copy is weaker than the shipped repo copy (F-02).
- **D-03…D-07** Owner demo vs v1.9 spec (§6). Need Felix's decision.
- **D-08** Brief says "58 build checks"; measured **54** `assert*` functions.
- **Non-finding retracted:** "List view has no mutation parity" — refuted by `v19_vfb_list.mjs`.
