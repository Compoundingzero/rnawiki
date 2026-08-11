# RNAwiki v1.9 — Cognitive-accessibility audit

**Role:** Cognitive-accessibility specialist · WAVE A · read-only assessment
**Date:** 2026-08-11 · **Branch:** `refine/site-wide-2026-08`
**Reader modelled:** a novice, low-literacy adult who arrived from a search for a symptom, has no
account, and is on a phone. `AGENT_RULES.md` §3 — anonymous-first — makes this the default user, not
an edge case.

**The v1.9 rule being measured against:** *one current question while editing, one dominant action
per focus* (spec §1.2, §3.5). Plus the spec's own budgets: Grade 6 copy, ≤18-word sentences,
45–70 character lines, body copy ≥16 px (`v19_novice_builder_audit.md:471–487`).

**Product code changed:** none.

---

## 0. Method

All UI claims are **HYDRATED-DOM** measurements in headless Chrome against `localhost:8099`, with
`<details name>` stripped, all `<details>` opened and `.chapter` animation disabled per the
post-W0 harness rules. Screenshots are cited by path and were **looked at**, not inferred from code.

Harnesses and raw output live in `/Users/admin/.claude/jobs/b8afc277/tmp/qa/` —
`wa_measure.mjs`, `wa_fold.mjs`, `wa_targets.mjs`, `wa_studio2.mjs`, `wa_studio3.mjs`;
JSON and PNGs in `out/wa_ds/`.

Readability: Flesch–Kincaid grade and Flesch Reading Ease computed over **`<p>` prose only**, on a
deterministic random sample of 24 sitemap routes (`out/wa_ds/sample24.txt`). Measuring all visible
text instead — as a first pass did — gives nonsense on index pages (`/browse` scores FK 75 because it
has 3 sentences and 512 link words). That first pass is discarded; only the prose figures are used.

---

## 1. Verdict

The product's **writing** is good and its **reading level is too high**. The product's **hierarchy**
is the bigger problem: on 4 of 6 sampled first viewports there is **no visually dominant product
action at all**, and on `/studio` the most dominant control is the *terminal* one (Publish) while
the actual next action (Add something) is a white outline button.

Against v1.9's core loop — **Questions → What may be going on → Plan → Check-in** — the shipped
Protocol Studio implements **none of the four stages**. It is a flat list builder. That is not a
styling gap; it is the whole product decision, unbuilt.

And one measured P0: **a no-account visitor can add a prescription-only medicine to a daily
self-built protocol and the app answers with a green "✅ NOTHING FLAGGED".**

---

## 2. Reading level — measured

### 2.1 Random 24-route sample, prose only, hydrated

```
median Flesch–Kincaid grade      10.5
median Flesch Reading Ease       56.1
median words per sentence        18.6
median % of sentences > 25 words 31 %
routes at or below Grade 6       1 of 23
routes at Grade 9 or above      17 of 23
```

(23 of 24 scored; `/solve` had 67 words of prose, below the 80-word floor.)

| route | words | w/sentence | FRE | FK | % sentences > 25 w |
|---|---|---|---|---|---|
| `/about` | 111 | 10.1 | 71.6 | **5.8** | 9 % |
| `/compare/magnesium-vs-omega-3-epa-dha` | 331 | 19.5 | 68.2 | 8.6 | 41 % |
| `/compare/citicoline-cdp-choline-vs-l-theanine` | 296 | 18.5 | 64.0 | 8.9 | 38 % |
| `/target/NOS3` | 623 | 19.5 | 60.5 | 9.7 | 34 % |
| `/c/boron` | 736 | 17.1 | 49.3 | 10.6 | 19 % |
| `/c/metformin` | 824 | 17.5 | 46.4 | 11.1 | 26 % |
| `/c/tirzepatide-mounjaro-zepbound` | 907 | 18.1 | 44.6 | 11.5 | 24 % |
| `/muscle/calves` | 4,454 | **22.7** | 51.7 | 11.7 | 35 % |
| `/goal/joints` | 250 | 15.6 | **3.2** | **16.7** | 19 % |

### 2.2 The honest reading of these numbers

**Two different problems are hiding inside one metric, and only one of them is fixable.**

- **Word length is largely not a choice.** `glucosamine`, `chondroitin`, `tirzepatide`,
  `patellofemoral` are the subject matter. FK punishes syllables heavily (`11.8 × syllables/word`),
  so a page can be plain English and still score Grade 10. `/goal/joints` at FK 16.7 / FRE 3.2 is
  almost entirely a compound-name density artefact.
- **Sentence length is entirely a choice, and it is where the load is.** Median 18.6 words per
  sentence against a stated budget of ≤18, and **a median of 31 % of sentences over 25 words**.
  On the two highest-traffic long pages it is far worse:

  | route | sentences | % over 25 words |
  |---|---|---|
  | `/problem/knee-pain` | 263 | **55 %** (145 sentences) |
  | `/protocol/knee-pain/patellofemoral-pain` | 55 | **31 %** (17 sentences) |

**Recommendation, and I want to be precise about it: do not chase the FK number.** Chasing it
produces mangled pharmacology. Chase the two things that are real:

1. **A hard 25-word sentence ceiling in `content/*.md` and `data/*.json`,** gated at build time the
   way every other content rule is. That alone moves median FK by roughly a grade *and* is the change
   a low-literacy reader actually feels.
2. **A plain-language first sentence per section**, which the corpus already does well in places —
   `/c/insulin-prescribed`'s `plain` field is a model of it.

### 2.3 Line length — the desktop reading measure is broken

Measured characters per line, hydrated at 1440×900, against the v1.9 budget of **45–70**:

| route | median | max | paragraphs measured |
|---|---|---|---|
| `/goal/sleep` | **45** | 48 | 8 |
| `/` | 74 | 87 | 20 |
| `/solve` | 95 | 95 | 1 |
| `/c/creatine-monohydrate` | 104 | 121 | 41 |
| `/protocol/knee-pain/patellofemoral-pain` | **137** | 171 | 75 |
| `/problem/knee-pain` | **138** | 158 | 174 |
| `/studio` | **167** | 167 | 2 |

`/problem/knee-pain` serves 174 paragraphs at a 138-character measure. That is roughly **double** the
upper bound of every legibility guideline, and it is the single cheapest cognitive win on the site:
one `max-width` on the prose container. It is caused by `--maxw:1080px` being applied to *text*
rather than to *layout* (see `design_token_audit.md` C6).

**Note the v1.9 prototypes are not better here** — rendered, Supplement detail measures a 78-char
median / 200-char max and Community Discussion 95/132. Adopting v1.9 does not fix this; it has to be
fixed deliberately in both.

---

## 3. Control budget — measured

Visible interactive controls, hydrated. "Fold" = intersecting the first viewport.

### 3.1 Desktop 1440×900

| route | total controls | in fold | headings in fold | `<details>` closed |
|---|---|---|---|---|
| `/` | 66 | 18 | 2 | 0 |
| `/solve` | **120** | 28 | 3 | 0 |
| `/studio` | 24 | 14 | 1 | 0 |
| `/problem/knee-pain` | 79 | 15 | 3 | 0 |
| `/c/creatine-monohydrate` | 45 | 19 | 1 | **8** |
| `/c/semaglutide-…` | 46 | 19 | 1 | **9** |
| `/goal/sleep` | 33 | 16 | 7 | 0 |
| `/browse` | **139** | **46** | 1 | 0 |
| `/learn` | 51 | 16 | 6 | 0 |

### 3.2 Phone 390×844

| route | total | in fold |
|---|---|---|
| `/` | 60 | 12 |
| `/solve` | **117** | 13 |
| `/studio` | 21 | 11 |
| `/protocol/knee-pain/patellofemoral-pain` | 88 | 9 |
| `/problem/knee-pain` | 76 | 12 |
| `/browse` | **136** | 15 |

**Assessment.** Fold budgets are broadly fine (9–28 on phone and desktop; the v1.9 prototypes measure
13–24 for comparison). `/browse` at 46 fold controls is an index page and that is acceptable.

The real budget problem is not count, it is **kind**: `/c/*` pages carry a 7-tab chapter switcher
*plus* 8–9 collapsed `<details>` *plus* the site nav, and the compound page's chapter tabs are
numbered `1 … 7` with emoji — which reads as a mandatory seven-step sequence rather than optional
depth. See `out/wa_ds/1440__c_creatine_monohydrate.png`.

---

## 4. One dominant action per focus — measured, and mostly absent

I classified a control as *visually dominant* only if it has an opaque dark/saturated fill with light
text (i.e. a filled button, not an outline). Hydrated at 1440×900:

| route | filled controls in fold | which ones |
|---|---|---|
| `/` | 3 | Skip to content · **Show me the causes →** · 💬 Feedback |
| `/solve` | 4 | Skip to content · **Find it →** · All · 💬 Feedback |
| `/studio` | 3 | Skip to content · **Publish…** · 💬 Feedback |
| `/problem/knee-pain` | 2 | Skip to content · 💬 Feedback |
| `/c/creatine-monohydrate` | 2 | Skip to content · 💬 Feedback |
| `/c/semaglutide-…` | 2 | Skip to content · 💬 Feedback |
| `/goal/sleep` | 2 | Skip to content · 💬 Feedback |
| `/browse` | 2 | Skip to content · 💬 Feedback |
| `/learn` | 2 | Skip to content · 💬 Feedback |

**OBSERVED FACT: on 6 of 9 routes the most visually dominant control in the first viewport is the
floating "💬 Feedback" widget.** It is the only filled, high-contrast, fixed-position element on the
compound, problem, goal, browse and learn layers. v1.9 §1.2 rule 2 — "only one action is visually
dominant in the current region" — is satisfied on those pages by *the wrong action*.

Three specific inversions, each verified by screenshot:

### 4.1 `/studio` — the terminal action outranks the next action
`out/wa_ds/1440__studio.png`. On an empty protocol: **"Publish…"** is a filled teal pill and
**"+ Add something"** — the only thing a user can usefully do — is a full-width white outline button.
"Clear", a destructive action, is a purple-outlined pill sitting beside Publish. The v1.9 workbench
contract (§3.5) is exactly the opposite: *one* Add command for the current focus, dominant; publish
gated behind `Continue setup · {n}`.

### 4.2 `/protocol/*` — no action at all in the first viewport
`out/wa_ds/1440__protocol_knee_pain_patellofemoral_pain.png`. The entire 900 px first viewport is
breadcrumb → title → three metadata cells → a **230-word red safety block** → the start of two cards.
Zero product controls. v1.9 §1.2 rule 1 ("a new user can identify the next action within five
seconds") is not met, and cannot be — there is nothing to identify.

The safety block itself is correct content in the wrong shape: seven long sentences of
comma-separated clauses, at the top, before the reader has any orientation. The cognitive-accessible
form of the same information is a short list of *observable* triggers with one action each — which
the corpus already has the material for.

### 4.3 `/c/*` — two equal-weight CTAs, neither dominant
`out/wa_ds/1440__c_creatine_monohydrate.png`. Top-right carries **"+ Mark learned"** and
**"+ Add to stack"** as two outline buttons of near-identical weight. v1.9 §8.2 mandates
"one dominant CTA only" in the supplement decision rail, selected by `RiskPolicy`. Neither of these
is risk-selected: the same pair renders on `/c/semaglutide-ozempic-wegovy-rybelsus` (measured: same
2/2 filled-CTA profile) as on creatine.

---

## 5. The v1.9 mental model is 0 % built

`out/wa_ds/1440__studio.png` and `out/wa_ds/studio_after_add.png`.

| v1.9 requirement | shipped in `/studio` |
|---|---|
| four-stage grammar **Questions → What may be going on → Plan → Check-in** as column headings (§3.3) | **absent** — no stages, no columns, no map |
| Map view / List view / Tidy map; zoom, Fit view (§3.11) | **absent** |
| reserved bottom workbench that changes on selection and never moves the map (§3.5) | **absent** — no selection model |
| **one** Add command per focus (§3.5, V19-BLD-003) | one (`+ Add something`) — **this one is met** |
| Add flow: 4 mutually-exclusive family choices, **≤3 best-fit matches**, full search *below* them (§3.9, V19-BLD-004) | **violated** — see 5.1 |
| "Do not render four permanent category toggles" (§3.9) | **violated** — four permanent toggles |
| no auto-open panel after Add (§3.9.7, V19-BLD-006) | met — Add returns to the list |
| truthful save state; `Saved` only after durable server ack (§3.4, V19-BLD-012) | **honestly stated but device-local**: "Saved on this device. It is not on a server and nobody else can see it." |
| `Continue setup · {n}` one-blocker-at-a-time publish repair (§3.12, V19-BLD-010) | **absent** — Publish is enabled with 1 item |
| card labelled **"Possible reason · not a diagnosis"** | **absent** — the phrase does not exist in the Studio |

### 5.1 The Add modal, measured
`out/wa_ds/studio_after_add.png`, hydrated at 1440×900:

- **Four permanent category toggles** — `Compounds 76 · Movements 873 · Foods 656 · Tools 22` —
  which §3.9 explicitly forbids.
- **A search field above the results**, not below them.
- **Seven results**, not ≤3, and unranked by fit to any stated goal (the strip says "Strongest human
  evidence first", which is a *corpus* ranking, not a fit ranking — there is no question to fit to,
  because stage 1 of the grammar does not exist).
- `Movements 873` as a single flat namespace is beyond any novice's ability to choose from.

**INFERENCE, stated as such:** the Studio was built as a *stack list* and v1.9 asks for a *reasoning
graph*. That is a rewrite of the Studio's data model (nodes, edges, answer destinations, plan timing
kinds), not a UI refresh. Anyone scoping this from the CSS will underestimate it by an order of
magnitude.

---

## 6. P0 findings

### P0-1 — SAFETY. A prescription-only medicine is addable to a daily self-built protocol, and the app says "✅ NOTHING FLAGGED".

**Reproduced, hydrated, screenshotted.** `out/wa_ds/studio_two_items.png`,
`out/wa_ds/studio_insulin_adjust.png`.

With **no account**, on `/studio`:

1. `+ Add something` → Compounds → the seventh row is
   **"Insulin (prescribed) — Prescription only — needs a doctor"** with a `+` affordance.
2. Adding it produces the row:
   **`💊 Insulin (prescribed) · the dose its own page publishes · every day`**
3. The safety verdict renders as a green, bordered, uppercase banner:
   **`✅ NOTHING FLAGGED`**
   with the qualification *"Only one compound here, so there is no pairing to check"* in 12 px grey
   **below and outside** the green box.
4. `Publish…` is enabled.

Two independent defects compound here:

**(a) The classifier is wrong.** `build/parse.js:295`:

```js
const isRx = approvals.some(a => a === '🔵' || a === '⚫' || a === '🟠');
```

`isRx` is derived **only** from the approval emoji. Insulin's record (`site/data.js`, `c132`) is:

```json
"badge": "🟢 ⭐⭐⭐⭐⭐ (essential medicine; prescription only)",
"approvals": ["🟢"], "approvalLabels": ["FDA Approved"], "isRx": false
```

`🟢` means *approved by a regulator*. `CLAUDE.md` rule 6 states in terms: **"A badge is not a supply
classification. 🟢 means 'approved by a regulator', NOT 'buy it off a shelf'."** `parse.js:295` makes
exactly that conflation, so the one compound in the corpus whose own badge text says
*"prescription only"* is classified `isRx:false` and falls through the Studio's restricted-compound
withholding.

I scanned all 171 compounds: **this is the only record where the badge text asserts
prescription/controlled status while `isRx` is false.** One record — and it is insulin, where the
failure mode is hypoglycaemia, which the page's own `watch` field calls out as capable of causing
"seizures, coma and death… within hours", and which is one of the most misused drugs in
bodybuilding. Its own `protocol` field says **"Not something to self-direct."**

**(b) The row copy is false.** `"the dose its own page publishes"` — `/c/insulin-prescribed`
publishes **no dose**. It publishes a refusal to give one. The Studio is asserting a fact about its
own corpus that its corpus contradicts.

**(c) The hierarchy amplifies both.** This is the cognitive-accessibility half. The dominant signal
is a green tick and the word FLAGGED negated — the two strongest "you are fine" cues available — and
the actual epistemic state ("we have no data, which is not clearance") is rendered smallest, greyest
and outside the container. A low-literacy reader takes the green box and nothing else. This is the
same defect class as the closed task **"LIVE SAFETY DEFECTS — five false 'nothing flagged' verdicts
over documented hazards"**; it has reappeared in a surface that did not exist when that was fixed.
**A gate over an empty set passes** — the earlier fix was proven on the pages, not on the Studio.

**LEGAL-CLINICAL DEPENDENCY.** Under the Medicines Act 1975 s.51 exposure noted in `CLAUDE.md`
rule 7, a screen that lists a prescription-only medicine with a `+ Add`, a schedule ("every day") and
a green safety verdict is materially different from a page that describes it. **This needs Felix's
decision and probably a real legal read, not an agent's.**

**Not claimed** (checked, and it is *not* true — recorded so nobody re-reports it): the `▲ ▼`
controls on the row are **reorder** buttons, not a dose stepper. Their accessible names are
`"Move Insulin (prescribed) up. Currently 1 of 1"`, and both are `disabled` for a single-item list.
There is no dose-escalation control and no dose ladder is offered for insulin. The defect is
classification, copy and hierarchy — not dose escalation.

**Minimal, gate-backed fix (spec only, not applied):**
1. `build/parse.js:295` — derive `isRx` from the badge **text** as well as the emoji:
   `|| /prescription|prescribed|controlled|schedule\s+[IVX]|pharmacy[- ]only/i.test(badge)`.
2. Add a build gate `assertRxClassification()` that fails when a compound's badge text asserts
   prescription/controlled status and `isRx` is false, **and prove it by reverting fix 1** — the
   gate must fail on today's `c132`.
3. `studio-safety.js` / the Studio verdict: when any item is `isRx` **or** when interaction coverage
   is partial, the dominant banner must not be the green "NOTHING FLAGGED". v1.9 §3.12 orders
   validation with "action is unreviewed/expired/high-risk-ineligible" at rank 7; that check does not
   exist in the Studio at all.

### P0-2 — PRIVACY (scope, not breach). The removed interest feature still has a live endpoint and a PII table.

The owner's decision today is *"Remove the collection-of-interest feature entirely."* What still
exists in the repo:

| artefact | location |
|---|---|
| `POST /api/interest` handler + INSERT | `server.js:1079` |
| `POST /api/interest/remove` + DELETE | `server.js:1102` |
| topic validation + boot log | `server.js:2667`, `:2694`, `:2739`, `:2857` |
| `interest_signups` table (email UNIQUE, topic, topic_other, creator, remove_token) + index | `db.js:333–351` |
| build-time schema validation of `interest.topics` | `build/parse.js:2480–2486` |
| **a prerender gate asserting the form markup exists** | `build/prerender.js:4487` — `['/api/interest','type="email"','name="topic"','Count me in']` |
| landing-build note that the endpoint is deliberately untouched | `build/landing.js:10` |

`POST /api/interest` on localhost returns **403** (origin/CSRF guard), so it is not trivially
writable from off-origin. **COULD-NOT-CHECK on live** — `WebFetch` is prohibited and I did not test
`rnawiki.com`.

Severity is *scope and data-minimisation*, not an active leak: an email-collecting table with no UI
is retained personal data with no purpose, which is the thing to remove rather than to leave dormant.
Note `prerender.js:4487` will **fail the build** if the form markup is removed without also removing
that gate — so the removal has an ordering constraint worth stating in the change spec.

### P0-3 — ACCESSIBILITY. 52 protocol pages fail WCAG 2.2 SC 1.4.10 Reflow.

Detailed in `design_token_audit.md` C7 with the one-line fix (`site/styles.css:3269`,
`white-space:nowrap`). Repeated here because 400 % zoom is the primary accommodation for the low-
vision half of this audit's user, and a 345 px document in a 320 px viewport means every line
requires horizontal scrolling. 5/5 sampled protocol routes fail; `/`, `/problem/*`, `/c/*` and
`/studio` pass.

---

## 7. Error recovery and required states

v1.9 §11 lists 16 required states. Spot-checked, hydrated:

| state | finding |
|---|---|
| **invalid route / real 404** | **good.** `/protocol/knee-pain` returns a real HTTP **404** with: *"Page not found. That page does not exist. It may have been renamed."* plus three recovery links (Browse problems and goals · Compound index · Home). FK 1.8. `out/wa_ds/404.png`. This is the best-written state on the site and is the model the others should copy. |
| **destructive action** | **good, and the brief's likely hypothesis does not reproduce.** `/studio` → `Clear` fires a real `confirm()`: *"Empty this protocol? It is only on this device, so this cannot be undone."* Verified by dialog interception (`wa_studio2.mjs`): with the dialog dismissed, `localStorage.rnawiki_studio_draft` was byte-identical before and after. **Not a data-loss P0.** No undo is offered after accepting, which is a P2. |
| **save state** | honest but weak. "Saved on this device. It is not on a server and nobody else can see it." is truthful and clear. It has no `Saving…`, no failure state, and no warning that clearing browser data destroys the draft. v1.9 §3.4's four states (`Saving… / Saved / Offline—changes on this device / Resolve save conflict`) collapse to one. |
| **unknown interaction coverage** | **present in words, absent in hierarchy.** The text *"Not enough to check — RNAwiki holds interaction pharmacology for 1 of these 2. Nothing flagged against the rest is an absence of data, not a clearance."* is exactly right, and is rendered as the least prominent element on the screen underneath a green tick. See P0-1(c). |
| **unsafe / high-risk blocked** | **absent.** No blocked state exists in the Studio for any compound. |
| **loading / offline / permission denied / review expired / stale version / save conflict / moderation hold** | not observed on any sampled surface. **COULD-NOT-CHECK** for the authenticated ones without an account. |

---

## 8. Where I disagree with the supplied audits

1. **`v19_novice_builder_audit.md:471–487` sets budgets that the v1.9 stylesheet itself breaks.**
   Body copy ≥16 px vs `body{font-size:15px}` and 30–69 % of rendered characters under 14 px;
   line length 45–70 vs measured medians of 78 and 95 on the Supplement and Discussion prototypes.
   Anyone implementing to the audit and styling from the CSS will produce something that satisfies
   neither. Full numbers in `design_token_audit.md` §2.2.

2. **The novice audit's §8 budget table counts controls but not contrast, focus or reading level.**
   Those are where the measured failures actually are. A control budget is the *least* binding
   constraint on this product: measured fold-control counts (9–28) are already inside every budget in
   that table, on every route.

3. **The audits treat "simple" as a canvas problem.** Measured, the biggest cognitive-load numbers on
   the shipped product are a 138-character line measure and a 31 %-of-sentences-over-25-words prose
   style on the *reading* layer, which serves ~90 % of traffic that never runs JavaScript. The
   builder serves the creator minority. **Sequencing recommendation: fix the reading layer first.**
   It is cheaper, it is gate-able, and it is where the users are.

4. **`v19_wiki_blocks_audit.md` §7 / spec §8.4 forbid whole-compound stars; `AGENT_RULES.md` forbids
   removing the evidence star.** Direct contradiction, restated here because it is a comprehension
   issue as much as a design one: the star is currently the site's clearest honesty signal to a
   low-literacy reader, and v1.9's outcome-selector model is more accurate but demands more of that
   same reader. **Needs Felix.**

---

## 9. Ranked recommendations (specs only — nothing applied)

| # | Change | Fixes | Cost |
|---|---|---|---|
| 1 | `parse.js:295` badge-text `isRx` derivation + `assertRxClassification()` gate proven by reintroducing the bug + Studio verdict must not lead green when any item is `isRx` or coverage is partial | P0-1 | small code, must be gated |
| 2 | `styles.css:3269` drop `white-space:nowrap`; extend the geometry smoke gate to 320 px | P0-3 | one line + one gate |
| 3 | Cap the prose measure — `max-width:68ch` on the article container, independent of `--maxw:1080px` | §2.3, the largest reading-layer win | one rule |
| 4 | Invert `/studio` emphasis: `+ Add something` filled, `Publish…` secondary until the protocol validates; move `Clear` out of the primary action row | §4.1 | small |
| 5 | Build-time 25-word sentence ceiling on `content/*.md` + `data/*.json` prose fields | §2.2 | content work, but gate-able |
| 6 | `<summary>{min-height:44px}` (v1.9 uses 52) and `button.linkbtn` to 44 px | §C8 | one rule |
| 7 | Remove `/api/interest`, `interest_signups`, `INTEREST_TOPICS` and the `prerender.js:4487` gate **in that order** | P0-2 | small, ordering matters |
| 8 | Give `/protocol/*` one dominant first-viewport action; restructure the 230-word safety block into observable-trigger rows | §4.2 | medium |
| 9 | One risk-policy-selected CTA on `/c/*` instead of two equal outline buttons | §4.3 | medium |
| 10 | Global focus token (`design_token_audit.md` S2) — **not** v1.9's `#5788ff` | §C2/C9 | small |

---

## 10. What I could not check

- **Anything requiring an account** — `/me`, `/u/<handle>`, `explain_posts` threads, the daily
  dashboard streak ledger, Community. All of §4 and §5 of the v1.9 spec is therefore assessed against
  the prototypes and the spec, not against a running signed-in product.
- **Live `rnawiki.com`.** `WebFetch`/`WebSearch` prohibited by the brief; the branch is 27
  improvements ahead of published.
- **Whether `POST /api/interest` accepts writes in production.** Local returns 403.
- **The `RNAwiki_Core_Protocol_Product_Requirements_Document` safety/consent/versioning contract**
  was not diffed line-by-line against v1.9. Where it intersected my lane (P0-1) it is called out; the
  full reconciliation belongs to the safety agent.
- **Real novices.** Every usability target in v1.9 §10 ("90 % of novices identify the next action in
  10 seconds") is a claim about people. Nothing in this file tests people; it tests whether the
  interface makes those targets *achievable*. On the four routes with no dominant action, it does not.
- **The two supplied recordings** (`RNAwiki_protocol_builder_demo.mp4`, the ManyChat tutorial) were
  not frame-extracted for this pass — they govern the builder's interaction intent, which is the
  novice-builder agent's lane. No timecode is cited anywhere in this file, and no claim here depends
  on one.
