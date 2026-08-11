# RNAwiki v1.9 — Accessibility audit (WCAG 2.2 AA)

**Wave A · read-only.** No product code was changed. Author role: accessibility specialist.
**Date of measurement:** 2026-08-11. **Branch:** `refine/site-wide-2026-08` (tree clean apart from `audit/`).
**Server under test:** `http://localhost:8099` (`PORT=8099 node server.js`).
**Chrome:** headless `--headless=new`, via `/Users/admin/.claude/jobs/b8afc277/tmp/qa/probe.mjs`.

## 0. How to read this file

Every claim is labelled and every claim names its document.

- **OBSERVED FACT** — I ran it and this is what came back.
- **INFERENCE** — reasoned from an observed fact, not directly measured.
- **PRODUCT DECISION** — needs Felix, not a fix.
- **LEGAL-CLINICAL DEPENDENCY** — needs a named human reviewer.
- **could-not-check** — I tried and could not get evidence. Said so, not guessed.

**The two-document rule is honoured throughout.** Anything I say about what a *user* perceives comes
from a **hydrated** DOM measurement in real Chrome. Anything about a *crawler* comes from the
prerendered bytes. Each finding states which.

Measurement scripts I wrote (scratch only, outside the repo):
`/Users/admin/.claude/jobs/b8afc277/tmp/qa/out/wA_a11y/{a11y,menu2,modal,reflow,gloss,pills,contrast,obscured,cwv2}.mjs`
Raw output: `a11y_1440.json`, `cwv2.txt` in the same directory.

---

## 1. Spec-reference correction (must be recorded before anything else)

**OBSERVED FACT.** My brief instructs "SEO against **§6.7**". In the source-authoritative Markdown,
`/Users/admin/Documents/Codex/2026-07-31/i-need-you-make-a-full/outputs/RNAwiki_Unified_Desktop_Experience_v1_9_Spec.md`,
**§6 is "Exercise wiki" and stops at §6.3. There is no §6.7.** The SEO contract is **§13**
(§13.1 exact metadata patterns, §13.2 indexing/canonical, §13.3 structured data + UGC,
§13.4 sitemap/404/privacy), verified by `grep -n "^#"` over the 961-line file.

`§6.7` **does** exist — in the *earlier* `RNAwiki_Desktop_Visual_Flow_Builder_Focused_Spec.md`
(v1.8), where it is "**Checks before preview**", a builder gate, not SEO.

**I have followed the Markdown, per the source-authority rule, and audited SEO against §13.**
The accessibility contract is **§10**, plus the prototype-index clause in **§15** and the
semantic-index sentence at the end of **§2.5**. Traceability IDs are **V19-A11Y-001** and
**V19-A11Y-002**.

**Where "§6.7" probably came from.** Two of the three supplied specialist audits have their own
§6.7 — `v19_novice_builder_audit.md:337` "Check and preview" and `v19_wiki_blocks_audit.md:588`
"Common mistakes" — neither of which is SEO either. The reference appears to be a cross-document
numbering collision rather than a pointer to anything. Recorded so the next wave does not re-derive it.

---

## 1a. One correction to a supplied audit

**`v19_community_profile_audit.md:1165`** states: *"Minimum target 44 × 44 CSS pixels for
frequent/high-value controls, consistent with W3C **target-size-enhanced** guidance."*

That citation is to **SC 2.5.5 Target Size (Enhanced), which is level AAA**. The **AA** requirement
in WCAG 2.2 is **SC 2.5.8 Target Size (Minimum) at 24 × 24 CSS px**, with an inline exception and a
spacing exception that 2.5.5 does not have.

This matters for scoping, not pedantry. Against 24 px the existing site has a bounded, fixable set of
failures (§4, A6). Against 44 px it has 15–68 per route and a retrofit that changes the visual
density of 41 problem pages. **§10 of the v1.9 spec does set 44 px** — as a *product* standard above
WCAG AA — and `rnawiki-v19-desktop.css` implements it. So the right framing is: **44 px is RNAwiki's
own bar, 24 px is the conformance bar, and the two produce very different remediation programmes.**
I have scored both separately throughout and labelled which is which.

---

## 2. Executive summary

Three things are true at once and the report is worthless if it flattens them.

**(a) The remediated layers held.** Colour contrast, 400 % reflow, skip links, `lang`, heading
order, link naming, button naming, image `alt` and table headers all measure clean on a 30-route
hydrated sweep. I attempted to break each of these and could not. Two prior audit findings do **not**
reproduce and I say so with the measurement (§7).

**(b) One signature feature is keyboard-dead.** The inline glossary — the feature the footer
advertises on **every page of the site** — is built at `site/app.js:4294` as a bare `<span>` with
no `role`, no `tabindex` and no key handler. It is reachable by mouse only. This is a WCAG 2.2 **A**
failure (2.1.1 Keyboard), not AA, and it is the highest-severity accessibility defect I found.

**(c) The v1.9 accessibility contract has no implementation to attach to.** §10 requires modal
focus trap, background `inert`, return-to-opener, `aria-expanded` state, graph/list parity and
captioned tutorial media. The repository today contains **zero** `role="dialog"`, **zero**
`aria-modal`, **zero** `aria-expanded` and **zero** `<video>`. That is not a defect in shipped code —
it is a measurement of how much of §10 is unbuilt, and of the fact that **no build gate exists for
any of it**, so the first implementation will ship unverified unless a gate lands with it.

### Severity table

| # | Finding | SC | Severity | Status |
|---|---|---|---|---|
| A1 | Inline glossary `.gloss` is mouse-only, no role, no tabindex, no key handler | 2.1.1 (A), 4.1.2 (A) | **P1** | existing defect |
| A2 | Glossary tooltip `title=` is hover-only, not dismissable/persistent | 1.4.13 (AA) | **P1** | existing defect |
| A3 | Mobile menu contents precede their trigger in DOM order — unreachable by forward Tab | 2.4.3 (A) | **P1** | existing defect |
| A4 | `#menu-btn` never exposes `aria-expanded` (0 occurrences site-wide) | 4.1.2 (A) | **P1** | existing defect |
| A5 | Site-wide `#search` input has no programmatic label (placeholder only) | 4.1.2 (A), 3.3.2 (A) | **P2** | existing defect |
| A6 | Target size: 58 controls < 24 × 24 px on `/problem/knee-pain` | 2.5.8 (AA) | **P2** | existing, partly exempt |
| A7 | No dialog primitive exists; §10 modal contract has nothing to bind to | 2.4.3, 2.4.11 | **P1** | absent |
| A8 | No captioned/transcripted media primitive; V19-EXE-004 / V19-MOB-003 unbuildable today | 1.2.2 (A), 1.2.3 (A) | **P1** | absent |
| A9 | Prototype index: `aria-label` on a role-less `<div>` is dropped by AT | 1.3.1 (A) | **P2** | prototype defect |
| A10 | Prototype index: Community card is a non-link `<div>` styled and arrowed like the 6 link cards | 3.2.4 (AA) | **P2** | prototype defect |
| A11 | Prototype index has **no `<nav>`** although §15 calls it "navigation index only" | 1.3.1 (A) | **P2** | prototype defect |
| A12 | `forced-colors` / `prefers-contrast` unsupported (0 rules in 401 KB of CSS) | 1.4.1 adjacent | **P3** | gap |
| A13 | `scroll-padding-top` unset globally; 10 per-element `scroll-margin-top` patches instead | 2.4.11 (AA) | **P3** | fragility |

---

## 3. P1 findings — verified against the hydrated DOM

### A1 · The inline glossary is not operable by keyboard

**OBSERVED FACT — hydrated DOM, `/c/creatine`, 1440 × 900.**

```
.gloss total on page          28
  with role attribute          6
  with tabindex                6
  with NEITHER               22
tagName of all 28            SPAN
element.focus() on the first .gloss  ->  document.activeElement !== element   ("NOT focusable")
element.click()  ->  className becomes "gloss open"  (it IS an interactive control)
```

Site-wide sample (hydrated, count of `.gloss` / count with `tabindex`):

| route | `.gloss` | with `tabindex` |
|---|---|---|
| `/` | 4 | **0** |
| `/problem/knee-pain` | 10 | **0** |
| `/az` | 3 | **0** |
| `/c/creatine` | 28 | 6 |
| `/learn` | 0 | 0 |

**Root cause, exact.** There are **two** glossary emitters and only one of them is accessible.

- `site/app.js:1870` — the accessible path:
  `<span class="gloss" tabindex="0" role="button" aria-label="${term}: ${def}" data-def="…">`
- `site/app.js:4294` — the dominant path, built imperatively:
  `span.className = 'gloss'; span.setAttribute('data-def', _gdef); span.setAttribute('title', _gdef);`
  **No `tabindex`. No `role`. No `aria-label`.**

The activator is a delegated **`click`** listener only — `site/app.js:4368`:
`document.addEventListener('click', e => { const g = e.target.closest('.gloss'); if (g) { … showGlossPop(g); } … })`.
There is **no `keydown` handler anywhere for `.gloss`** (verified: `grep -a` over `site/app.js`).

**Why this is the top finding.** `site/index.html` line 51 puts this in the **footer of every page**:
`💡 Tip: tap any underlined word for a plain-English definition.` The site promises the feature
globally and delivers it to pointer users only.

**Also OBSERVED FACT — the prerendered document is a different, and better, story.** The crawler
document uses a *different* class, `.pgl`, emitted by `build/glossify.js:63-67` with
`<span class="pgl-d" role="note">`, and a CSS-only reveal with a real `:focus-visible` rule at
`site/styles.css:4042`. `grep` over all 17 prerendered HTML files: **0 occurrences of
`<span class="gloss"`**. So `.gloss` is **100 % a hydration artefact**. A prerendered-document audit
would score this feature as passing. It does not pass for a user.

**Repair shape (spec only — I am read-only).** At `site/app.js:4294` add
`span.tabIndex = 0; span.setAttribute('role','button'); span.setAttribute('aria-label', term + ': ' + _gdef);`
and add a `keydown` branch beside the click listener at `site/app.js:4368` for `Enter`/`Space`, plus
`Escape` → `closeGlossPop()`. Gate it: assert in `build/parse.js` that every string in `site/app.js`
creating `className = 'gloss'` is within N lines of a `tabIndex` assignment — **and prove the gate by
reintroducing the bug**, per the house rule.

### A2 · The glossary tooltip is a `title` attribute

**OBSERVED FACT.** `site/app.js:4294` sets `span.setAttribute('title', _gdef)` on every glossed term.

Native `title` tooltips fail **1.4.13 Content on Hover or Focus (AA)** on all three of its
requirements: they are not **dismissable** without moving the pointer, not **hoverable** (the pointer
cannot enter them), and not **persistent** (the browser times them out). They are also not surfaced
on keyboard focus in any major browser, and on touch they do not appear at all. Combined with A1,
a keyboard or touch user gets **nothing** from the glossary on 22 of 28 terms.

### A3 · The mobile menu's contents come before the button that opens them

**OBSERVED FACT — hydrated, 390 × 844, route `/`.**

```
BEFORE click: .topnav  className="topnav"        display:none   0 × 0
AFTER  click: .topnav  className="topnav open"   display:flex   136 × 364   (6 links)
DOM order of .topbar children:
  A.brand · DIV.search-wrap · NAV.topnav · SPAN.account-slot · BUTTON.menu-btn
```

Focus `#menu-btn`, then press **Tab** 14 times — measured, every step:

```
 1 [OUT] A "Always tired 6 causes"      … 14 [OUT] A "5 A thyroid running slow"
```

**Not one Tab lands in the menu.** Focus `#menu-btn`, then press **Shift+Tab**:

```
 1 [NAV] Browse   2 [NAV] A–Z   3 [NAV] Learn   4 [NAV] My Plan
 5 [NAV] Where it hurts   6 [NAV] Solve   7 [--] A "🧬 RNAwiki"
```

A keyboard user who activates the menu must press **Shift+Tab** to reach it, and then reads it in
**reverse order** (Browse first, Solve last). WCAG 2.2 **2.4.3 Focus Order (A)**: the order does not
preserve meaning and operability.

The handler is one line — `site/app.js:10198`:
`document.getElementById('menu-btn').onclick = () => document.querySelector('.topnav').classList.toggle('open');`

### A4 · `aria-expanded` does not exist anywhere on this site

**OBSERVED FACT.** Counted with `/usr/bin/grep -a` (NUL-safe, per house rule):

```
site/app.js               aria-expanded: 0
site/*.html  (17 files)   aria-expanded: 0  in every file
```

`#menu-btn` toggles a menu open and closed and never says so. Same class of defect will recur on
every v1.9 disclosure (§3.5 workbench, §3.9 Add flow, §5.4 Other protocols, §8.3 chapters).
WCAG **4.1.2 Name, Role, Value (A)**.

The site *does* use `<details>`/`<summary>` extensively (18 on protocol pages), and those carry
native expanded state — so the pattern is understood, it is just not applied to the one
JavaScript-driven disclosure.

### A5 · The site-wide search input has no programmatic label

**OBSERVED FACT — hydrated, all 9 routes that returned 200.** My label check tests, in order:
`aria-label`, `aria-labelledby`, `label[for=id]`, ancestor `<label>`. All four miss.

```
/ /solve /c/creatine /problem/knee-pain /studio /me /plan /az /learn
   fields with no label: 1 of 1..8   ->   always  search : "Search 171 compounds, protocols, terms…"
```

Source: `site/index.html:41`
`<input id="search" type="search" placeholder="Search 171 compounds, protocols, terms…" autocomplete="off" spellcheck="false">`

A `placeholder` is not an accessible name in the WCAG sense and disappears on first keystroke.
**4.1.2 (A)** and **3.3.2 Labels or Instructions (A)**. This is the single most-repeated
accessibility defect on the site, present on every route.

**Note it is one line to fix and it is the global search box the v1.9 §2.1 contract depends on**
("The global search accepts problems/wants, protocols, exercises, stretches, supplements, and
compounds").

### A7 · There is no dialog primitive to build §10 on

**OBSERVED FACT.**

```
site/app.js:  role="dialog"   0 occurrences
site/app.js:  aria-modal      0 occurrences
hydrated sweep, 9 routes:  dialogs found = 0 on every route; [inert] elements = 0 on every route
```

`inert` appears 4× in `site/app.js` but not as a modal background mechanism.

§10 requires, verbatim: *"modal/dialog focus moves to a useful initial control, remains trapped while
open, makes the background inert, closes with Escape where safe, and returns to the exact opener."*

**INFERENCE.** The v1.9 surfaces that need this are, at minimum: Add-a-Plan (§3.7), Add-an-action
(§3.9), professional action fields (§3.10), publish repair (§3.12), join review (§2.4), the
accomplishments modal (V19-PRO-004), and the Marketplace purchase flow (V19-AVA-003). That is
**seven** modal contexts with **zero** shared primitive and **zero** gate. Building them ad hoc is
how you get seven different focus bugs.

**Recommendation (PRODUCT DECISION for sequencing).** One `<dialog>`-based primitive, one focus
manager, one gate that opens every registered dialog in headless Chrome and asserts: initial focus
inside, Tab cycles inside, `Escape` closes, `document.activeElement` returns to the recorded opener,
and the background carries `inert`. **Prove the gate by removing the focus return.**

### A8 · No media primitive exists, so the captions contract is unbuildable

**OBSERVED FACT.** `<video>` elements found on the 9-route hydrated sweep: **0**. Therefore
captions = 0, transcripts = 0, autoplay = 0, missing-controls = 0. All four counters are zero
because the **set is empty** — and *a gate over an empty set always passes*, which is the standing
lesson from this project. Any "media accessibility passes" claim today is vacuous, and I will not
make one.

§10 requires *"captions, transcript, text alternative, and provenance for tutorial media"*;
V19-EXE-004 and V19-MOB-003 additionally require poster / loading / retry-error / written fallback /
no-surprise-autoplay states. The Exercise and Stretch prototypes both show a `.rw-media-frame`
(`rnawiki-v19-desktop.css`) that is a CSS gradient placeholder — no `<video>`, no `<track>`.

**LEGAL-CLINICAL DEPENDENCY.** §10's "provenance for tutorial media" and the no-camera constraint
interact: the media cannot be Felix on video, so it must be sourced or generated, and *sourced
demonstration video of a clinical exercise carries a provenance and licensing obligation that an
implementation agent cannot discharge.* Flagging, not resolving.

---

## 4. P2 findings

### A6 · Target size (WCAG 2.2 SC 2.5.8, AA — new in 2.2)

**OBSERVED FACT — hydrated, 1440 × 900.** Counts of visible focusable targets whose bounding box is
under 24 × 24 CSS px, and under the spec's own stricter 44 px:

| route | targets | **< 24 px** | < 44 px |
|---|---|---|---|
| `/problem/knee-pain` | 89 | **58** | 68 |
| `/c/creatine` | 45 | **11** | 27 |
| `/learn` | 51 | **11** | 33 |
| `/` | 76 | **20** | 24 |
| `/az` | 192 | 10 | 15 |
| `/solve` | 120 | 10 | 19 |

Worst offenders, with measured geometry:

```
/problem/knee-pain   "1. Hip & quad weakness with…"   379 × 19   (block list row)
                     "2. Cartilage degeneration …"    368 × 19
                     "3. Training-load error (pa…"    354 × 19
                     "Link to this section"            16 × 24  and  17 × 25
/                    "Link to this section"            19 × 29,  14 × 20
/c/creatine          "Full PubChem record →"          143 × 21
```

**Honest scoping — this is not 58 clean failures.** SC 2.5.8 has two exceptions that bite here:

- **Inline exception.** The footer nav (`Solve` 33 × 16, `Where it hurts` 86 × 16, `My Plan` 48 × 16,
  `Stack`, `Browse`) sits inside a running-text `<div>` in `site/index.html:51`. Those are **exempt**.
  That accounts for the constant "10 under 24 px" floor on every route.
- **Spacing exception.** A target under 24 px passes if a 24 px circle centred on it does not
  intersect another target's circle.

**What I can state without hedging:** the cause rows on `/problem/knee-pain` are **19 px tall block
list items stacked vertically** — they are not inline, and vertically stacked 19 px rows cannot
satisfy the 24 px spacing circle. Those **fail**. So do the `"Link to this section"` heading anchors
at 14 × 20 and 16 × 24.

**INFERENCE, not measured:** I did not compute the spacing circles for all 58. The defensible claim
is "the vertically-stacked cause rows and the section-anchor links fail 2.5.8"; the number 58 is an
upper bound on candidates, not a count of failures. **Do not quote 58 as a failure count.**

Separately: the spec's own §10 sets **44 × 44**, stricter than WCAG. Against *that* line, `< 44 px`
runs 15–68 per route and the site is nowhere near compliant. The v1.9 desktop CSS
(`rnawiki-v19-desktop.css`) does honour it — `button{min-height:44px}`, `.rw-primary{min-height:44px}`,
`.rw-side-nav a{min-height:44px}`, `.state-link{min-height:44px}`, `.arrow{width:44px;height:44px}` —
so the *new* design system is right and the *existing* site is the gap.

### A9–A11 · The v1.9 prototype index (V19-A11Y-002)

Validated by reading the file directly:
`/Users/admin/Documents/Codex/2026-07-31/i-need-you-make-a-full/outputs/RNAwiki_Desktop_Prototype_Index_v1_9.html`
(5,073 bytes, single-file, links `rnawiki-v19-desktop.css`).

**What §15 explicitly demands, and what I found:**

| §15 clause | Verdict | Evidence |
|---|---|---|
| "headings and paragraphs must not be placed inside `span` wrappers" | **PASS** | every `<h2>`/`<p>` is a child of a `<div>` inside the card; the only `<span>`s are `.rw-eyebrow`, `.arrow` and `.loop span` — all phrasing content |
| "decorative arrows are `aria-hidden='true'`" | **PASS** | all 7 `<span class="arrow" aria-hidden="true">›</span>` carry it |
| "every link has an understandable accessible name" | **PASS** | 9 links, none empty, none generic; card links compute a name from eyebrow + `h2` + `p` |

**Beyond §15, three real defects:**

**A9 — `aria-label` on a role-less `<div>` is silently dropped.**

```html
<div class="loop" aria-label="Product loop"><span>Questions</span><span>What may be going on</span>
<span>Plan</span><span>Check-in</span><span>Community help</span></div>
```

A `<div>` with no `role` maps to **`role="generic"`**, and ARIA **prohibits an accessible name on
`generic`**. Every conforming AT drops `"Product loop"`. The five stages then read as one
undifferentiated run-on: *"Questions What may be going on Plan Check-in Community help"* — with no
indication that these are five discrete stages of the locked mental model. Given that
**V19-BLD-001** is literally *"Questions → possible reason → Plan → Check-in grammar"* and
**§1.1** fixes this vocabulary, losing its structure on the one page that introduces it is a real
regression against the product's core idea.

Fix: `<ul class="loop" aria-label="Product loop">` with `<li>` children, or `role="list"` +
`role="listitem"`. Then the name is permitted and the count ("list, 5 items") is announced.

**Same class of defect exists in the shipped site.** Hydrated `/c/creatine` carries **12**
`aria-label`s on role-less `<span class="pill …">`:

```
DROPPED  <span class="pill y">        visible "🟡 Regulated as a supplement"       aria-label "Regulator status: Regulated as a supplement"
DROPPED  <span class="pill supply">   visible "🛒 No prescription needed"           aria-label "How you get it: no prescription needed"
DROPPED  <span class="pill b">        visible "🔵 Prescription-only medicine"       aria-label "Regulator status: Prescription-only medicine"
DROPPED  <span class="pill supply">   visible "℞ Prescription only — needs a doctor" aria-label "How you get it: prescription only — needs a doctor"
```

**But — and this matters — no information is lost.** The visible text already spells out the status,
so AT falls back to the content and announces the same words. The `aria-label` is **inert code that
looks like an accessibility control and is not one**. That is a maintenance hazard (someone will
"improve" the label and see no effect) but **not a user-facing failure**, and I will not inflate it
into one. Contrast this with `<span role="img" class="stars">` and `<span role="button"
class="gloss">` on the same page, where the role is present and the label **is** honoured — the
codebase already knows the correct pattern.

**A10 — the Community card is a lie about its own affordance.**

Six of the seven prototype cards are `<a class="rw-card prototype" href="…">`. The seventh is
`<div class="rw-card prototype">` — no `href` — because it has two states to offer, so the links
moved inside as `.state-link` chips. But it keeps the identical `.prototype` styling **and the
identical `<span class="arrow" aria-hidden="true">›</span>`**, and `.prototype:hover{border-color:
#a3c9c4;transform:translateY(-1px)}` fires on it too. A pointer user gets lift-on-hover feedback from
a non-interactive region; a screen-reader user finds an arrow-shaped card that is not a link.
**WCAG 3.2.4 Consistent Identification (AA)**: the same visual component does not have the same
function. Drop the arrow on that one card, or give it a real destination and demote the two states.

**A11 — a "navigation index" with no `<nav>`.**
§15 calls this file *"navigation index only"*. Landmarks present: **one `<main>`**, and three
`<section aria-label="…">` ("Product loop" is the broken div; "Interactive prototypes";
"Specifications"). **`<nav>` count: 0. `<header>`: 0. Skip link: 0.**
`<section aria-label="Interactive prototypes">` is the page's entire purpose and should be `<nav>`.
Low user impact on a 9-link page, but it is exactly the "named landmarks" clause of **§2.5**
("one meaningful `h1`, ordered headings, named landmarks, labelled controls") and of
**V19-A11Y-002**, so it should not ship failing its own acceptance test.

**Heading structure of the prototype index — PASS.** One `<h1>` ("One connected desktop
experience."), then nine `<h2>`s, no skipped level, no empty heading, `lang="en"` present,
viewport meta present, no `user-scalable=no`.

---

## 5. P3 gaps

**A12 — no `forced-colors` or `prefers-contrast` support.** `grep -c "forced-colors\|prefers-contrast"
site/styles.css` = **0**, in 401,505 bytes of CSS. In Windows High Contrast Mode the regulatory pill
tints, the evidence-star colours and the cascade diagram fills are all replaced by system colours.
**Mitigating OBSERVED FACT:** the pills carry their status **in text** and the stars carry
`role="img"` + `aria-label="Human evidence: 5 out of 5 stars"`, so the semantics survive. This is a
polish gap, not a failure — but a `@media (forced-colors: active)` block should land before any new
colour-carrying UI (v1.9 §3.3 "one visual grammar" introduces typed edges and node colours, which
*would* fail).

**A13 — focus obscured by the sticky header is unproven but architecturally fragile.**
`.topbar` is `position:sticky;top:0;z-index:50`, measured height **67 px** (`site/styles.css:61`).
`document.documentElement`'s `scroll-padding-top` computes to **`auto`** — i.e. unset. Instead there
are **10** individual `scroll-margin-top` rules (`site/styles.css:2013, 2406, 3326, 3697, 3752,
3753, …`) patching specific anchor targets at 1.5rem / 5rem / 66px / 180px — four different values.

**I could not reproduce an actual obscuring.** On `/az` at 1366 × 768 I focused all 16 focusable
elements in the viewport after scrolling to y=3000; the only overlap was the skip-link itself, which
is intentional. `scrollIntoView` on a deep link put it at `top=4641` with `barBottom=67` — clear.
**Verdict: could-not-check for a real failure; recorded as fragility.** One
`html{scroll-padding-top:72px}` would replace ten patches and make **2.4.11 Focus Not Obscured
(Minimum, AA)** fail-safe for every anchor added afterwards. As written, a new anchor target defaults
to *no* padding and lands under the bar.

---

## 6. §10 clause-by-clause conformance

| §10 clause | Verdict | Evidence |
|---|---|---|
| WCAG 2.2 AA target | **partial** | see severity table; 4 SC failures at level A |
| 44 × 44 CSS-px targets | **FAIL (site)** / PASS (v1.9 CSS) | 15–68 controls under 44 px per route; `rnawiki-v19-desktop.css` enforces `min-height:44px` throughout |
| native controls and DOM order | **FAIL** | A3: menu contents precede trigger |
| visible focus and focus restoration | **partial** | 32 `:focus`/`:focus-visible` rules; 14 `outline:none` all paired with a replacement ring — checked each (`styles.css:71, 474, 494, 502, 621, 686, 882, 2093, 2129, 2472, 2519, 2524, 3501, 4713`). **No orphan `outline:none`.** Focus *restoration* untestable — no modals exist |
| modal focus trap / inert / Escape / return-to-opener | **absent** | A7: 0 dialogs, 0 `aria-modal` |
| keyboard-equivalent list representation for graph editing | **absent** | V19-BLD-009; no graph editor exists yet |
| SR names include type, name, status, destination/action count | **absent** | no nodes exist yet |
| 200 % zoom and 400 % reflow without clipped actions | **PASS** | §7 |
| no hover-only operation | **FAIL** | A2: `title` tooltip is the only affordance on 22/28 glossary terms |
| reduced-motion behaviour | **partial** | 17 `prefers-reduced-motion` blocks vs **25 `@keyframes` and 39 `animation:` declarations** — coverage is roughly 2/3, not universal. No blanket `@media (prefers-reduced-motion:reduce){*{animation:none!important}}` as the v1.9 CSS has (`rnawiki-v19-desktop.css`, last line). **Recommend adopting the v1.9 blanket rule.** |
| captions / transcript / text alternative / provenance | **absent** | A8 |
| colour never the only status signal | **PASS** | pills carry text + emoji; stars carry `role="img"` + `aria-label`; verified in §4 A9 dump |
| no autoplay carousel / surprise panel / layout shift after Add | **FAIL (layout shift)** | CLS 0.286 measured — see `analytics_performance_audit.md` §4 |
| validation explains one issue at a time | could-not-check | no v1.9 publish-repair surface exists |
| semantic landmarks / heading order / control names / link purpose | **mostly PASS** | see §7 |

---

## 7. What I tried to break and could not — findings that do **not** reproduce

Recorded per the house rule that a non-reproducing hypothesis must be stated with its measurement.

**(1) 400 % reflow / horizontal scroll — CLEAN across 30 routes.** At **320 × 600** (the WCAG 1.4.10
reflow target, equivalent to 400 % zoom on a 1280 px viewport), with all `<details>` expanded
(`name` stripped first, per the exclusive-accordion trap) and all `.chapter` elements activated with
`animation:none`:

```
30 routes tested (21 returned 200, 9 were slugs I guessed wrong and 404'd)
scrollWidth > clientWidth :  0 of 30
```

Two routes have inline text boxes extending past the client width without producing a scroll
(`/c/testosterone` `<b>` w=172 right=333; `/problem/knee-pain` `<span class="gloss">` w=81 right=343)
— contained by an ancestor, no document overflow. **SC 1.4.10 Reflow: PASS.** The 2026-08 fix for
"33 compound pages scroll sideways at 390px" held, and it also holds at 320 px, which is stricter
than what it was fixed for.

**(2) Colour contrast — 0 real failures across 7 routes, and my own tool produced 3 false ones.**
My sweep initially reported 3 failures on `/c/creatine-monohydrate`:

```
1.30:1  A.mnode.t   color rgb(29,78,216)
1.46:1  A.mnode.g   color rgb(4,120,87)
1.00:1  SPAN.mini-t color rgb(37,99,235)
```

These are **artefacts of my script**, and I am recording that rather than shipping them. My
background walker treats any `rgba()` with alpha > 0 as opaque. The real rules are:

```
styles.css:294  .mnode.t { color:#1d4ed8; background:rgba(37,99,235,.07) }
styles.css:296  .mnode.g { color:var(--green); background:rgba(5,150,105,.07) }
styles.css:212  .mini-t  { color:var(--accent2); background:rgba(37,99,235,.08) }
```

A 7 % blue tint composited over white is ≈ `#f2f5fe`, and `#1d4ed8` on that is ≈ 7:1 — a comfortable
pass. My tool compared `#1d4ed8` against `#2563eb`. **These three are PASSES.** The W5.5(d)
remediation of `.mnode.t` (task #16) holds.

Anyone re-running a contrast sweep on this codebase must composite alpha backgrounds or they will
regenerate these three phantom failures.

**(3) Link and control naming — clean.** Across all 9 hydrated routes: links with no accessible name
= **0**; links with generic text (`click here`, `here`, `more`, `→`, `›`) = **0**; `href="#"` dead
controls = **0**; buttons with no accessible name = **0**; images with no `alt` = **0** (1 image
total, on `/c/creatine`); `<svg>` without name or `aria-hidden` = **0** (2 SVGs on `/`);
tables without `<th>` = **0**. `lang="en"` and a working skip link on **17 of 17** prerendered files.

**(4) Heading structure — 2 minor skips, not systemic.** `/c/creatine` has one `h1→h3` jump where the
h3 is **empty** (`@""`), and `/learn` has one `h1→h3` at "Biology 101: the machine a drug acts on".
Every other route: exactly one `h1`, no skipped level, no empty heading. That is 2 defects across
9 routes, and both are single-instance.

**(5) The `aria-label`-on-`span` pills are not a user-facing failure.** See A9. I went looking for
"the regulatory badge is announced as an emoji" and it is not — the visible text carries the words.

---

## 8. What Wave A cannot decide

- **PRODUCT DECISION** — whether the v1.9 dialog primitive is `<dialog>` (native trap + `inert`
  backdrop, but a styling reset burden on a 401 KB stylesheet) or a hand-rolled focus manager. I
  recommend native `<dialog>`; I am not authorised to choose.
- **PRODUCT DECISION** — whether the 44 px target floor from §10 is retrofitted to the existing 800
  routes or applied only to v1.9 surfaces. Retrofitting `/problem/*` cause rows from 19 px to 44 px
  changes the visual density of 41 pages.
- **LEGAL-CLINICAL DEPENDENCY** — tutorial media provenance and licensing (A8), which interacts with
  the no-camera constraint.
- **could-not-check** — screen-reader *output* (VoiceOver / NVDA). Everything above is DOM and
  computed-style evidence, which predicts AT behaviour but is not the same as hearing it. A manual
  VoiceOver pass over `/c/creatine`, `/problem/knee-pain` and the mobile menu is the one thing I
  could not automate and it should happen before any AA claim is made publicly.
