# RNAwiki v1.9 — Clinical / Pharmacy Safety Audit (WAVE A, read-only)

**Role:** Clinical & pharmacy safety specialist
**Date:** 2026-08-11 · **Branch:** `refine/site-wide-2026-08` (27 improvements unpublished, tree clean)
**Measured against:** local `http://localhost:8099` (`dbEnabled:false` — see §0.2), corpus as built in `site/`
**Spec authority:** `RNAwiki_Unified_Desktop_Experience_v1_9_Spec.md` (Markdown is source-authoritative)
**Scope:** urgent routing · action eligibility · stop rules · high-risk compounds · interaction coverage · expired-review behaviour

Every finding is labelled **VERIFIED** (I ran it), **INFERRED** (read from code, not executed), or
**COULD-NOT-CHECK**. Every measurement names its document (prerendered | hydrated) per AGENT_RULES.

---

## 0. Ground rules I applied, and one retraction

### 0.1 The v1.9 rule I audited against

> §8.2 — "When the `RiskPolicy` permits it **and** interaction coverage is sufficient, an eligible
> example is **Add to Considering** … When interaction coverage is **unknown**, the dominant CTA is
> **Prepare pharmacist questions** or the permitted Current Use route — **never a self-directed add
> action**."
> §8.4 — "Prescription/controlled: current use or questions for professional only … Investigational:
> no self-directed action … Review expired: remove action controls automatically."
> V19-CMP-004 — "eligible/prescription/investigational/toxic/unknown/expired matrix has **no action escape**."

**Technical mechanism never creates permission to act. Risk policy chooses the CTA.**

### 0.2 What I could not execute

Local Postgres is off (`GET /api/config` → `{"googleClientId":null,"dbEnabled":false}`). Anything
requiring a stored row (a real `/p/<code>`, a real account) was measured either by (a) intercepting
**only** the one API response in a real browser against the real shipped `site/app.js` — stated
explicitly where used — or (b) reading code, labelled INFERRED.

### 0.3 RETRACTION — a finding I drafted and then disproved by measuring

I initially concluded that a reader routed into a mental-health protocol never meets an escalation
line. **That does not reproduce.** Measured hydrated at 1440×900:

| route | document | "harming yourself / crisis line" string | offset | inside `<details>`? | visible by default |
|---|---|---|---|---|---|
| `/protocol/low-mood/monoamine-inflammation` | hydrated | present | **448 px** (0.5 screens) | no | **yes** |
| `/problem/low-mood` | hydrated | present | 445 px | no | **yes** |
| `/problem/anxiety` | hydrated | present | 496 px | no | **yes** |

Ancestry of the node: `STRONG > P > DIV.plan-card.plan-reassess > SECTION.safety-first`, under the
heading **"🚩 First — when this is not a self-care problem"**, and every one of the 41 problems
carries a structured stop rule (`safety.metric` 41/41, `safety.stopIssue` 41/41 — measured over
`site/data.js`). **The authored escalation layer on this site is good and is above the fold.** The
real defect (C-04) is narrower and is stated as such.

---

## 1. Findings, most severe first

| ID | Sev | Finding | Status vs v1.9 |
|---|---|---|---|
| C-01 | **P0** | 88 of 95 restricted compounds render a self-directed **"+ Add to stack"** CTA | contradictory |
| C-02 | **P0** | 34 of those 88 also have **zero** interaction coverage — both gates fail at once | contradictory |
| C-03 | **P0** | `/p/<code>` headlines "✅ NOTHING FLAGGED, CHECKED JUST NOW" over 0-of-N coverage | contradictory |
| C-04 | **P0** | The emergency (995/A&E) tier is authored for 4 problems and reachable from the primary CTA on **0** | partial |
| C-05 | P1 | Interaction coverage is per-**compound**, printed as if per-**pair** | partial |
| C-06 | P1 | 69/171 compounds unreachable by any firable rule; 35 of them restricted | existing (known), understated |
| C-07 | P1 | **No review-expiry concept exists anywhere in the codebase** | absent |
| C-08 | P1 | A user-built protocol carries no stop rule, no monitoring, no review requirement | absent |
| C-09 | P2 | R2 (contraindicated movement) reaches 2 of 52 root causes, and **0** when the protocol has no base cause | partial |
| C-10 | P2 | Which compounds lose the CTA is decided by a **regex over free prose**, not by risk policy | contradictory |

---

## C-01 · **P0** — 88 of 95 restricted compounds ship a self-directed add CTA

**Status: contradictory** (the repo contradicts both v1.9 and its own Studio)

### Observed fact — hydrated, 1440×900, `/Users/admin/.claude/jobs/b8afc277/tmp/qa/out/w19/cta2.mjs`

| route | `regulatory_class` | `consumer_renderable` | `#stack-btn` present | label |
|---|---|---|---|---|
| `/c/testosterone-trt` | controlled | `false` | **yes** | `+ Add to stack` |
| `/c/epo-erythropoietin` | controlled | `false` | **yes** | `+ Add to stack` |
| `/c/low-dose-lithium` | prescription | `false` | **yes** | `+ Add to stack` |
| `/c/estradiol-menopausal-hrt` | prescription | `false` | **yes** | `+ Add to stack` |
| `/c/2-4-dinitrophenol-dnp` | controlled | `false` | no | `⚠️ Not for use` |

### The mechanism — `site/app.js:2356` and `site/app.js:1945`

```js
// app.js:2356
${compoundTier(c) === 'DANGER'
  ? '<span class="stack-btn-lg danger-chip" title="Not for human use">⚠️ Not for use</span>'
  : `<button id="stack-btn" class="stack-btn-lg ...">+ Add to stack</button>`}
```
```js
// app.js:1945
function compoundTier(c) {
  if (c.brief) return 'brief';
  const L = (c.approvalLabels || []).join(',');
  if (/death|fatal|lethal|deadly|do not use/i.test((c.watch || '') + (c.bottom || ''))) return 'DANGER';
  if (/Not Approved|Controlled/.test(L)) return 'RESEARCH';
  if (needsDoctor(c) || /Prescription|Off-Label/.test(L)) return 'RX';
  return 'OTC';
}
```

`RESEARCH` and `RX` — i.e. **prescription, controlled and unapproved** — fall through to the button.

### Measured counts (over `site/data.js`, tier function replicated exactly)

```
tiers: {"OTC":75,"RX":24,"RESEARCH":56,"DANGER":3,"brief":13}
compounds offering "+ Add to stack": 155 of 171
… of which consumer_renderable === false:  88 of 95
DANGER tier (the only suppressed ones):    c28 DNP · c132 Insulin (prescribed) · c133 Insulin (anabolic misuse)
```

Included in the 88: Trenbolone, Nandrolone, Stanozolol, Clenbuterol, Ephedrine, HGH (Somatropin),
EPO, Testosterone (TRT), Ketamine/Esketamine, Amphetamine (Adderall), Methylphenidate, Psilocybin,
Semaglutide, Tirzepatide, Retatrutide, RAD-140, LGD-4033, Cardarine, MK-677, Low-Dose Lithium,
Estradiol/HRT, PCSK9 inhibitors.

### Why this is P0 and not cosmetic

1. **v1.9 §8.4 forbids it outright.** Prescription/controlled → "current use or questions for
   professional only unless a governed prescribed-plan workflow exists". No such workflow exists.
2. **This repository already knows better.** The Protocol Studio's assembly catalogue withholds
   **all 95** restricted compounds and prints a named disclosure line (`site/app.js:5184-5186`,
   `5419`, `9366-9371`). The same site therefore refuses to hand you testosterone in the plan
   builder and offers you a one-tap add on the testosterone page. That is not a policy, it is two
   policies.
3. **`CLAUDE.md` rule 7 / Medicines Act 1975 s.51.** A one-tap "add this to my stack" control on a
   prescription-only medicine is closer to an advertisement than to a page of documentation, and
   the operative Singapore regime carries a prior-permit requirement and no educational exemption.
4. **`consumer_renderable:false` already exists, is authored, and is already trusted by the Studio
   and by `assertRegulatoryAxes`.** The fix is to read the field that already exists rather than a
   regex over prose.

### Honest scoping — blast radius

**PRERENDERED document: not affected.** `curl /c/epo-erythropoietin | grep 'Add to stack'` → 0 hits
on all three restricted routes I checked. The CTA is SPA-only, so it reaches the ~20 JS-executing
sessions/day, not the ~90% who never run JavaScript. It is still P0: it is the *only* action control
on the page, it is on the highest-risk substances on the site, and it is the exact escape v1.9
V19-CMP-004 names ("no action escape").

### Change spec (for the integrator — do not apply in Wave A)

`site/app.js:2356` — replace the `compoundTier(c) === 'DANGER'` predicate with the authored
regulatory field, and route the two non-eligible classes to the CTAs v1.9 names:

- `c.consumer_renderable === false` **and** interaction coverage `unknown` → **Prepare pharmacist questions**
- `c.consumer_renderable === false` **and** coverage present → **Current use / questions for a professional**
- otherwise → the existing add control.

Gate it: extend `assertRegulatoryAxes()` in `build/parse.js` to fail the build if any
`consumer_renderable:false` compound's rendered page can emit `id="stack-btn"`. **Prove the gate by
reintroducing the bug** (flip one compound back and confirm the build fails).

---

## C-02 · **P0** — 34 compounds fail *both* gates simultaneously

**Status: contradictory**

v1.9 §8.2 requires **risk policy permits AND coverage sufficient**. These 34 satisfy neither, and
still get the add button. Measured (`site/data.js` + `site/ixn-engine.js` `covered()`):

```
compounds offering "+ Add to stack" AND consumer_renderable:false AND interaction-UNCOVERED: 34
```

| id | name | class |
|---|---|---|
| c34 | HCG | prescription |
| c35 | Enclomiphene / Clomiphene (Clomid) | prescription |
| c38 | DHEA | prescription |
| c39 | Finasteride / Dutasteride | prescription |
| c54 | Stenabolic (SR9009) | unapproved |
| c55 | Tesamorelin (Egrifta) | prescription |
| c56 | Sermorelin | prescription |
| c57 | CJC-1295 (± DAC) | unapproved |
| c58 | Ipamorelin | unapproved |
| c59 | Hexarelin / GHRP-2 / GHRP-6 | unapproved |
| c60 | MK-677 (Ibutamoren) | unapproved |
| c61 | Human Growth Hormone (Somatropin) | **controlled** |
| c64 | BPC-157 | unapproved |
| c65 | TB-500 | unapproved |
| c66 | GHK-Cu | unapproved |
| c67 | KPV | unapproved |
| c76 | Quercetin + Dasatinib (D+Q) | **controlled** |
| c84 | Epithalon | unapproved |
| c85 | MOTS-c | unapproved |
| c86 | Elamipretide (SS-31) | prescription |
| c87 | 17-α-Estradiol | prescription |
| c88 | **Low-Dose Lithium** | prescription |
| c91 | Noopept | unapproved |
| c96 | Semax / Selank | unapproved |
| c102 | Dihexa | unapproved |
| c115 | PT-141 (Bremelanotide) | prescription |
| c129 | Setmelanotide (Imcivree) | prescription |
| c135 | **EPO (Erythropoietin)** | **controlled** |
| c136 | AOD-9604 | unapproved |
| c137 | MGF / PEG-MGF | unapproved |
| c138 | DSIP | unapproved |
| c143 | Tretinoin / Retinoids | prescription |
| c146 | **Estradiol / Menopausal HRT** | prescription |
| c160 | PCSK9 Inhibitors | prescription |

**The four in bold are the ones a pharmacist would flag first.** Lithium has one of the narrowest
therapeutic indices in general practice; the page's own prose says so — measured hydrated on
`/c/low-dose-lithium` (5,194 words after chapter expansion):

> "anyone with kidney disease, **on NSAIDs / thiazides / ACE inhibitors**, on a low-salt diet,
> pregnant, or already taking psychiatric lithium — interactions and dehydration can push levels up
> unexpectedly."

That sentence is authored, correct, and **invisible to the interaction engine**: `c88` carries no
tag any rule consumes, so adding lithium to a stack produces zero rows.

EPO is worse: **5,337 words hydrated, and the substring "interact" appears zero times on the page.**
It is a controlled substance whose principal hazard (erythrocytosis → thrombosis/stroke) is
additive with testosterone, which the same site documents and lets you stack.

---

## C-03 · **P0** — the published-protocol page issues a green clearance over an empty knowledge base

**Status: contradictory** — this is the W3 defect class (`site/ixn-engine.js:43-49`, "a negative
safety claim issued from an empty knowledge base") reintroduced on a newer surface.

### The code — `site/app.js:9530`

```js
+ (now ? (nowFlags.length
      ? nowFlags…map(f => stFlagCard(f, false)).join('')
      : '<div class="st-flag st-clean"><div class="st-flag-k">✅ Nothing flagged, checked just now</div></div>')
  + '<p class="st-cov">❔ ' + esc(now.says || '') + '</p>'
```

`nowFlags` is empty both when *nothing is wrong* and when *nothing was checkable*. The honest ❔
sentence — the one `studio-safety.js:242-250` was written to produce — is demoted to a sub-line
under a green tick.

### VERIFIED hydrated, 1440×900

Real shipped `site/app.js`, real `styles.css`, real route `/p/TEST9`; the **only** thing stubbed was
the single `GET /api/protocols/TEST9` response (harness:
`/Users/admin/.claude/jobs/b8afc277/tmp/qa/out/w19/pverdict.mjs`). Rendered `.st-verdict`:

```
✅ NOTHING FLAGGED, CHECKED JUST NOW
❔ Not enough to check — RNAwiki holds interaction pharmacology for 0 of these 3.
   Nothing flagged against the rest is an absence of data, not a clearance.
When it was published: …
```

The first line is set in caps by `styles.css` and is the dominant element in the region.

### This is reachable with a perfectly ordinary, publishable protocol

Not a contrived one. Running the real `studio-safety.js` against five plain supplements:

```
[Creatine Monohydrate + L-Theanine + Glycine + Beta-Alanine + Sodium Bicarbonate] publish=true ok=true
   says: Not enough to check — RNAwiki holds interaction pharmacology for 0 of these 5.
```

Five over-the-counter supplements, publish accepted, coverage 0/5 → the published page will headline
**"✅ NOTHING FLAGGED, CHECKED JUST NOW"**.

### Contrast — `/stack` gets this right

Measured hydrated, `/stack?ids=c135,c33` (EPO + Testosterone):

> "Interaction check **❔ Not enough to check — I have interaction pharmacology for 1 of these 2** ·
> ❔ I hold no interaction pharmacology for EPO (Erythropoietin) — nothing flagged against that is an
> absence of data, not a clearance."

The ❔ state **is** the headline there. So the fix is not new work — it is making `/p/` behave like
`/stack`.

### Change spec

`site/app.js:9530` — make the clean card conditional on `now.coverage.checked >= 2`. When
`checked < 2`, render the ❔ card *as the verdict*, with no tick. Gate: extend `scripts/smoke.mjs`
with a `/p/` fixture whose coverage is 0 and assert the rendered `.st-verdict` first line does not
contain "Nothing flagged".

---

## C-04 · **P0** — the emergency tier is authored and unreachable from the primary CTA

**Status: partial** (see the retraction in §0.3 — the *generic* escalation is fine; the *emergency
stop* is not reachable)

### What is authored

`site/app.js:1359-1370` implements a two-tier red-flag result. The emergency tier prints
"**This needs emergency care now**", the 995/999/112/911/000 line, **and withholds the "Show the
protocol for background" button** — a hard stop. Its comment records exactly why it exists:

> "the neck-shoulder page's own reassess prose opens with referred cardiac pain as *call emergency
> services now*, yet the quiz … did not carry that flag at all, so someone with anginal-equivalent
> symptoms could pass straight through into a stretching plan."

Measured over `site/data.js`:

```
problems: 41
problems with an assessment quiz (which owns the red-flag screen): 10
… with a redFlags list:                                            10
… with emergencyIdx (can reach the 995 / A&E card):                 4
       -> low-back-pain, neck-shoulder, insulin-resistance, chronic-fatigue
problems with a causeQuiz:                                         41
```

### The routing defect — `site/app.js:1476-1479`

```js
function openCauseFinder(problem) {
  if (problem.causeQuiz && problem.causeQuiz.questions && problem.causeQuiz.questions.length)
    return openCauseQuiz(problem);              // ← wins on 41 of 41
  if (problem.assessment && problem.assessment.questions.length)
    return openAssessment(problem);             // ← the ONLY function containing the red-flag step
  …
}
```

`openCauseQuiz` (`app.js:1425-1475`) has **no safety step**: its only exits are `goToCause()` and a
`[data-cause]` click handler. `openCauseFinder` is the handler for `[data-find-cause]`
(`app.js:10236`), which is emitted by the **primary** CTA on every protocol page
(`app.js:6322`: `🔍 Find my cause — 20-second check`, class `cta-primary`).

**Therefore: 4 of 41 problems have an emergency-stop card, and it is reachable from the primary CTA
on 0 of them.**

### VERIFIED hydrated, 1440×900 — full click-through
(harness `/Users/admin/.claude/jobs/b8afc277/tmp/qa/out/w19/cf.mjs`)

`/protocol/neck-shoulder/upper-cross` — `[data-find-cause]` count = 1, `#assess-trigger` present:

```
step0  "Where do you feel it the most?"
step1  "What tends to set it off or make it worse?"
step2  "Do you notice any of these alongside the pain?"
step3  "When you move your arm or head, what happens?"
step4  "YOUR QUICK CHECK — This looks most like: Sustained static neck/shoulder loading ('tech neck')"
```

Four questions, then a result. **No safety screen at any step.** Neck-shoulder is one of the four
problems that *has* an authored cardiac-referral emergency flag.

`/protocol/low-mood/monoamine-inflammation` — `[data-find-cause]` = 1, **`#assess-trigger` absent**:
four questions → lands on `/problem/low-mood#cause-6`. There is no path from this page to any
red-flag screen at all.

The only surviving door is the *secondary* control `🔍 Not sure? Take the 30-second check`
(`app.js:7912`, `id="assess-trigger"`), rendered only `if (problem.assessment)` — 10 of 41.

### Why it still matters despite §0.3

The generic `SECTION.safety-first` block is prose you can scroll past and it keeps the plan below it.
The emergency card is a **stop**: it replaces the screen and deletes the "continue anyway" button.
v1.9 §3.12 orders publish validation with "1. urgent/safety destination missing" *first*, and §4.7
says "authored urgent/safety signals bypass … and open a stop/help route". A stop route that the
primary path cannot reach is not a stop route.

### Change spec

Insert the red-flag step into `openCauseQuiz` (or make `openCauseFinder` run `openAssessment`'s
red-flag screen *before* dispatching to either quiz). Gate: add a build assertion that every problem
with `assessment.redFlags.emergencyIdx` is reachable from `[data-find-cause]`, and prove it by
deleting the step and watching the build fail.

**Also for Felix (product decision, not mine):** 31 of 41 problems have no authored red-flag list at
all. The highest-stakes gaps by clinical convention are `blood-pressure` (hypertensive emergency),
`memory` / `brain-fog` (sudden focal deficit), `gut-health` (GI bleeding / weight loss), `thyroid`
(thyroid storm, myxoedema), `ankle-foot` (DVT / septic joint), `pcos` / `menopause` (postmenopausal
bleeding). Note `memory`'s `reassess` prose *already* says "Get **urgent, emergency** care for sudden
confusion, slurred speech, weakness or drooping on one side" — the words exist; only the gate is
missing.

---

## C-05 · P1 — coverage is per-compound, printed as if it were per-pair

**Status: partial**

`site/ixn-engine.js:186-190`:

```js
function covered(list) {
  return list.filter(c => { let ok=false; compoundTags(c).forEach(t => { if (RULE_TAGS.has(t)) ok = true; }); return ok; });
}
```

`covered()` asks *"does this compound carry at least one tag that some firable rule reads?"* — it
never asks whether **this pair** shares a rule domain. `studio-safety.js:250` then prints:

> `Checked the ${coverage.checked} of ${coverage.of} RNAwiki holds interaction pharmacology for.`

### VERIFIED — a pair that was never checked, reported as "checked 2 of 2"

```
Ashwagandha  (c105) tags: hepatotoxic, sedative_mild
Testosterone (c33)  tags: hpta_suppressive
[Ashwagandha + Testosterone] publish=false ok=true
   says: Checked the 2 of 2 RNAwiki holds interaction pharmacology for.
```

No rule connects `hepatotoxic` or `sedative_mild` to `hpta_suppressive`; the `liver` rule needs two
`hepatotoxic` carriers. **Nothing compared these two substances.** The sentence a reader gets says
otherwise.

This is the same defect family the engine's own comments already fixed twice (the `double_5ar`
single-carrier case, `ixn-engine.js:50-60`). The remaining half is pairwise reachability.

### Change spec

Compute coverage as *pairs whose union of tags satisfies at least one rule's `need` shape* and
report `checked N of M possible pairings`. Keep the compound-level ❔ list — it is good — but stop
letting "2 of 2" mean "compared".

---

## C-06 · P1 — 69 of 171 unreachable; the missing rule classes are nameable

**Status: existing and known, but understated in the honest sentence**

```
engine stamp: compounds:171 rules:25 dupes:6 firable-tags:26
covered: 102 of 171   (interactions.js coverage block: reachable 102 / unreachable 69 / unreachableRx 35)
```

**Note for the record:** the W0 errata quotes "77/171 unreachable". On this branch it is **69/171**
(35 restricted). Use 69.

The 25 rules cover: serotonin, bleeding, nitrate/PDE-5 (×2), PDE-5+vasodilator, sedation, double
statin, statin+niacin, stimulant stacking, hypoglycaemia, liver, estrogen crash, DNP, mTOR conflict,
immune conflict, antioxidant/training, HPTA stacking, double 5-AR, double GLP-1, hypotensive
stacking, mild sedatives, mineral competition, thyroid/mineral absorption, zinc/copper, CYP3A4/statin.

### Hazard pairs the corpus contains and the engine cannot flag (VERIFIED — real `studio-safety.js`)

| pair | engine verdict | the pharmacology |
|---|---|---|
| EPO + Testosterone (TRT) | `ok=true`, "pharmacology for 1 of these 2" | both raise haematocrit; additive erythrocytosis → thrombosis. Both are in the corpus, both are on the site, both offer "+ Add to stack" |
| MK-677 + HGH (+ IGF-1 LR3) | no danger row; `/stack` shows only a generic "🔻 Overlapping pathways · PI3K/Akt ×3" | duplicate GH-axis therapy; the site has a `double_glp1` duplicate-therapy rule and no GH-axis equivalent |
| Low-Dose Lithium + anything | 0 of N covered | narrow therapeutic index; NSAIDs / thiazides / ACE-I / dehydration. **The page's own prose names all four.** |
| Estradiol/HRT + Testosterone | "1 of these 2" | no rule |
| Finasteride + Testosterone | "1 of these 2" | no rule (and `double_5ar` is unfirable — one carrier) |
| PCSK9 + Berberine | "1 of these 2" | no rule |
| BPC-157 + TB-500 | 0 of 2 | no rule (correctly labelled animal-only) |

I am **not** claiming these are the only gaps, and I am not proposing to write 40 new rules — that is
authoring work with a clinical-sign-off dependency. The actionable finding is narrower and is C-01/C-02:
**a compound the engine cannot reason about must not carry a self-directed add control.** That is a
one-line policy that closes the whole class without authoring a single new rule.

---

## C-07 · P1 — there is no review-expiry concept anywhere in the codebase

**Status: absent**

```
$ /usr/bin/grep -an "review_expir|reviewExpir|reviewedAt|reviewed_at|lastReviewed|review_due|staleReview" \
    site/app.js server.js build/parse.js studio-safety.js
(no matches)
```

v1.9 requires this in three places:

- §8.4 — "**Review expired:** remove action controls automatically; retain version history and follow-update route."
- §11 — "review expired" is a **required state** on every production surface.
- §3.12 step 7 — publish validation must block "action is unreviewed/**expired**/high-risk-ineligible".
- V19-CMP-004 — the matrix must have no escape, and `expired` is one of its six cells.

Nothing on RNAwiki records when a compound record, a dose ladder, an interaction rule or a published
protocol was last reviewed, so nothing can expire and no control can be withdrawn on expiry.

The one adjacent thing that *does* exist and is good: `GET /api/protocols/:code`
(`server.js:1888-1912`) revalidates the stored protocol against **today's** corpus and returns both
`safetyWhenSaved` and `safetyNow`, precisely so a stale clearance is not handed over. That is the
right instinct with no clock behind it.

**Recommendation:** the cheapest honest version is a build-time `reviewed_on` per compound sidecar
entry + a `REVIEW_MAX_AGE` constant; when exceeded, `compoundTier()` returns a non-actionable tier
and `/p/` prints "this record is past its review date". Do **not** build a per-claim versioned
evidence ledger — that is explicitly refuted in AGENT_RULES §DO NOT IMPLEMENT.

---

## C-08 · P1 — a user-built protocol has no stop rule, no monitoring, no review requirement

**Status: absent**

v1.9 §3.10 (Supplement) requires every Plan action to carry "monitoring, **stop** and
professional-review requirements". `studio-safety.js:34-39` is the complete list of what a protocol
item may carry:

```js
const OVERRIDE_KEYS = {
  c:  ['dose', 'days', 'note'],
  x:  ['sets', 'reps', 'days', 'note'],
  f:  ['days', 'note'],
  fn: ['target', 'days'],
};
```

There is no `stop`, no `monitor`, no `review`, no `checkpoint`. The `/p/<code>` renderer
(`app.js:9505-9540`) prints title → items → verdict → "Build my own". **A published protocol page
contains no stopping boundary of any kind.**

Meanwhile the *authored* corpus is excellent and structured — measured over all 41 problems:

```
safety.metric      41/41   e.g. "Pain on stairs, kneeling and standing up, week over week"
safety.checkpoint  41/41   e.g. "Week 12"
safety.stopIssue   41/41   e.g. "No change after 12 weeks of consistent strengthening"
safety.stopHorizon 41/41
safety.stopFix     41/41   "…This is the point to see a physiotherapist or doctor."
```

A Studio protocol built **on** a root cause (`base_pid`/`base_rcid`) inherits none of it, and one
built with no base has no route to it at all. This is the "authored well and connected to nothing"
pattern named in `CLAUDE.md`.

**Change spec:** when `base_pid`/`base_rcid` are present, render that problem's `safety.{metric,
checkpoint, stopIssue, stopHorizon, stopFix}` on `/p/<code>` *live from the master* (never copied
into the row — same discipline as the animal-only badge in `studio-safety.js:207-215`). When they
are absent, `/p/` should say so rather than show nothing.

---

## C-09 · P2 — the contraindicated-movement rule reaches 2 of 52 causes, and 0 without a base

**Status: partial** — `studio-safety.js` states its own scope honestly (lines 127-130), which is
exactly right; this finding is about what that scope *is*.

```
root causes carrying avoid_movements: 2 of 52   (neck-shoulder/upper-cross, neck-shoulder/rotator-cuff-impinge)
```

VERIFIED with the real module:

```
S.validate({spec:{items:[…]}, publish:true})                              -> avoidTermsChecked 0
S.validate({… base_pid:'neck-shoulder', base_rcid:'upper-cross' …})       -> avoidTermsChecked 8
```

`studio-safety.js:232` — `const rc = (base_pid && base_rcid) ? rootCause(...) : null;` — and
`server.js:1773-1791` accepts `base_pid: null`. So **a from-scratch protocol receives zero movement
contraindication checking and is published**, and the `avoidTermsChecked: 0` that records this is
inside the stored `safety` JSON, not on the page.

Recommendation: surface `avoidTermsChecked` on `/p/` in the same ❔ register as `says`
("no movement contraindications were checkable for this protocol — it is not built on a root cause"),
and treat authoring `avoid_movements` for the remaining 50 causes as content work with a clinical
dependency, not as a code fix.

---

## C-10 · P2 — the risk classifier is a regex over prose

**Status: contradictory**

`app.js:1948` decides which compounds lose their action control by matching
`/death|fatal|lethal|deadly|do not use/i` against `c.watch + c.bottom` — free editorial prose. This
means:

- a copy edit that rewrites "can be fatal" to "can kill you" silently **restores** the add button;
- a compound whose prose happens to say "do not use with alcohol" is silently classified DANGER;
- exactly 3 of 171 compounds land in DANGER, and which 3 is an accident of wording.

`regulatory_class` (supplement 75 / prescription 39 / unapproved 34 / controlled 22 / pharmacy 1)
and `consumer_renderable` are authored, build-gated by `assertRegulatoryAxes`, and already used by
the Studio catalogue. **v1.9 says risk policy chooses the CTA.** `compoundTier()` is not a risk
policy; it is a string search. Fixing C-01 fixes this at the same time.

---

## 2. What the repo already gets right (do not regress it)

Recorded because a v1.9 rebuild could easily throw these away:

1. **The `/stack` interaction panel is honest.** VERIFIED hydrated on three stacks: it leads with
   ❔ when coverage is short, names the uncovered compound, and says "an absence of data, not a
   clearance". This is the model `/p/` should copy (C-03).
2. **The Studio catalogue withholds all 95 restricted compounds and *says so by name*** with a
   working link to the full page (`app.js:5184`, `5419`, `9366`) — "RNAwiki documents them in full …
   a plan builder is just not the place to hand out a dose". That is a better answer than silence.
3. **Dose ladders.** 171/171 compounds have a ladder entry; only 7 are open; a dose off the ladder is
   refused even when under the ceiling (`studio-safety.js:149-161`). The uncapped-dose-calculator
   class is closed on the server, not just the UI.
4. **Publishing a restricted substance is refused unconditionally** (`studio-safety.js:172-179`),
   with the compound's own authored supply sentence in the message.
5. **Both verdicts are returned and labelled** on protocol read — stored *and* recomputed
   (`server.js:1902-1912`).
6. **Animal-only evidence** is rendered live from the master, never copied into the row
   (`studio-safety.js:207-215`); 7/171 carry it.
7. **`assertStudioSafetyMirrorsBuildGates()` checks both directions** — a sixth build gate with no
   save-time twin fails the build (`studio-safety.js:44-62`). This is the single best structural idea
   in the safety layer.
8. **The escalation layer is above the fold** — see §0.3.

---

## 3. Cross-references to the security audit

- **Order divergence in published remixes** (`diff`/`apply` do not round-trip, 0.9% of edit
  sequences, VERIFIED over 40,000 fuzz trials) — item order is clinically meaningful here
  ("work down the list — cheapest & safest first", `app.js:6310`). Full detail in
  `security_abuse_audit.md` §S-07. Membership and doses always round-trip, so this is an
  integrity/honesty defect, **not** a safety-gate bypass.
- **`POST /api/protocols/check` is reachable by any script that sets `Origin` + a browser UA** —
  fine for the check endpoint (it writes nothing), but it means the *save* endpoint's guard is a
  speed bump, not an authorisation. `security_abuse_audit.md` §S-02.

---

## 4. Open questions that are Felix's, not mine

| # | Question | Why it cannot be decided by an implementation agent |
|---|---|---|
| Q1 | Should `consumer_renderable:false` compounds lose the stack CTA entirely, or get "Prepare pharmacist questions"? | v1.9 says the latter; the latter is new UI and new copy. LEGAL-CLINICAL DEPENDENCY (Medicines Act s.51). |
| Q2 | Is keeping a restricted compound in a **private draft** (currently allowed, `studio-safety.js:169-171`) acceptable, or should it be refused everywhere? | The code itself flags this as "the owner's to confirm". |
| Q3 | Author `redFlags` + `emergencyIdx` for the 31 problems that have none? | Content work with a clinical sign-off dependency. |
| Q4 | Adopt a `reviewed_on` date per compound so C-07 becomes implementable? | Creates recurring maintenance — weigh against constraint 4 (solo-maintainable). |
| Q5 | Should `/p/` inherit the base problem's structured stop rule? | Product decision about what a user-built protocol *is*. |

---

## 5. Reproduction index

| finding | harness / command |
|---|---|
| C-01, C-02 | `node /Users/admin/.claude/jobs/b8afc277/tmp/qa/out/w19/cta2.mjs /c/testosterone-trt /c/epo-erythropoietin /c/low-dose-lithium` |
| C-01 counts | tier function replicated over `site/data.js` (transcript in this file) |
| C-03 | `node /Users/admin/.claude/jobs/b8afc277/tmp/qa/out/w19/pverdict.mjs` |
| C-04 | `node /Users/admin/.claude/jobs/b8afc277/tmp/qa/out/w19/cf.mjs /protocol/neck-shoulder/upper-cross /protocol/low-mood/monoamine-inflammation` |
| §0.3 retraction | `node /Users/admin/.claude/jobs/b8afc277/tmp/qa/out/w19/reassess.mjs /problem/low-mood /problem/anxiety` |
| C-05, C-06, C-09 | `/tmp/ss.js` — loads the **real** `studio-safety.js` + `site/ixn-engine.js` against the built corpus |
| `/stack` honesty | `node /Users/admin/.claude/jobs/b8afc277/tmp/qa/out/w19/cta2.mjs "/stack?ids=c135,c33"` |
