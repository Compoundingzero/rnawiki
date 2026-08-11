# RNAwiki v1.9 — Design-system / token audit

**Role:** Design-system specialist · WAVE A · read-only assessment
**Date:** 2026-08-11 · **Branch:** `refine/site-wide-2026-08` (tree clean, 27 improvements unpublished)
**Product code changed:** none. This file and `cognitive_ux_audit.md` are the only repo writes.

---

## 0. Method and what each number is evidence of

Per `AGENT_RULES.md` the site serves two documents. **Every measurement in this file is either
(a) a static read of a stylesheet on disk, or (b) a HYDRATED-DOM measurement in headless Chrome.**
No claim here comes from `curl`.

| Harness | Path | What it measured |
|---|---|---|
| `wa_measure.mjs` | `/Users/admin/.claude/jobs/b8afc277/tmp/qa/wa_measure.mjs` | rendered font-size/colour/radius/shadow inventory, control counts, tap targets, per route, per viewport |
| `wa_fold.mjs` | same dir | first-viewport screenshots + prose extraction at 1440×900 |
| `wa_targets.mjs` | same dir | target size against **both** WCAG 2.2 SC 2.5.8 (24 px, inline exception applied) and the v1.9 §10 contract (44 px) |
| raw JSON | `/Users/admin/.claude/jobs/b8afc277/tmp/qa/out/wa_ds/` | `desk1440.analysed.json`, `m390.a.json`, `tgt390.json`, `fold_1440.json` |
| screenshots | same dir | `1440__*.png`, `studio_*.png`, `reflow320.png`, `404.png` |

The v1.9 **prototypes were rendered, not read** — headless Chrome at 1440×900 over
`file:///Users/admin/Documents/Codex/2026-07-31/i-need-you-make-a-full/outputs/`. That is deliberate:
the standing lesson from `rnawiki-3d-leg-fix` is that visual work must be rendered, never trusted
from source.

Evidence labels used throughout: **OBSERVED FACT** · **INFERENCE** · **PRODUCT DECISION** ·
**LEGAL-CLINICAL DEPENDENCY**.

---

## 1. Verdict

There is no shared design system between the shipped product and v1.9, and **v1.9 is not yet a
design system either.** Adopting `rnawiki-v19-desktop.css` as written would:

1. **fail the repo's own `assertContrastTokens()` build gate** on three tokens
   (`--rw-muted`, `--rw-faint`, `--rw-teal`) — including reintroducing, almost to the hex, the exact
   value W5c deleted in August;
2. **ship a focus ring that is invisible on the primary button** (1.42:1 on `--rw-teal`);
3. **violate the v1.9 novice audit's own typography budget** — the shared stylesheet renders
   30.6 %–69.2 % of visible characters below 14 px, against a stated budget of "body copy ≥ 16 px,
   quiet metadata ≥ 14 px";
4. **introduce a webfont dependency** (`Inter` + `font-synthesis:none` + eight weights including
   680/730/760/770/780/830) into a codebase whose entire dependency tree is `pg` and `@resvg/resvg-js`,
   with **no `@font-face`, no `<link>` and no font file anywhere in the v1.9 pack**.

The repo's own token layer is in a worse but *different* state: **24 declared tokens against 255
distinct hex values, 93 distinct `font-size` values, 60 distinct `box-shadow` values, 32 distinct
`border-radius` values.** 79 % of colour occurrences bypass the token layer entirely, which is also
the coverage boundary of the contrast gate.

**The honest framing for Felix: this is not "adopt v1.9's CSS". It is "extract one token set that
satisfies both the v1.9 layout decisions and the contrast gate the site already passes", then
rebuild both sides against it.**

---

## 2. Measured inventory — repo vs v1.9

### 2.1 Static, from disk

| Dimension | `site/styles.css` (4,984 lines, 401,505 B) | `rnawiki-v19-desktop.css` (96 lines) |
|---|---|---|
| declared colour tokens | 24 in one `:root` (`styles.css:1–39`) | 17 `--rw-*` + 2 shadows |
| distinct hex values in file | **255** | **34** |
| hex occurrences | 1,138 (+142 `rgba()`) | — |
| hex **not** in the token set | **231 of 255 (91 %)**, 895 of 1,138 occurrences (**79 %**) | n/a |
| distinct `font-size` values | **93** | **9** (11, 12, 15, 16, 18, 22, 23, 25, 36 px) |
| distinct `border-radius` values | **32** (tokens declare 3: `--r-sm:10px --radius:14px --r-lg:18px`) | 8 (11, 12, 13, 14, 16, 20, 24 px + 999px/50%) |
| distinct `box-shadow` values | **60** (tokens declare 4) | 2 tokens + ~6 literals |
| distinct `gap` values | **62** | 12 |
| `font-weight` values | 6 (400/500/600/650/700/800) | **8** (680/700/730/760/770/780/800/830) |
| distinct class selectors | **2,180** | 50 `.rw-*` primitives |
| media-query breakpoints | **15 distinct widths** — max-width 420/520/560/600/620/640/720/760/820/860/899/900, min-width 560/760/900 | **2** — max-width 1120, max-width 900 |
| global focus token | **none** — 11 scoped `:focus-visible` rules, 14 `outline:none` overrides | one global rule (`:35–37`) |
| `prefers-reduced-motion` | 13 scoped blocks (8 + 5), plus a correct `html{scroll-behavior}` guard at `styles.css:3723` | one global `*{animation:none!important;transition:none!important}` (`:96`) |
| dark scheme | 2 `@media(prefers-color-scheme:dark)` blocks + 3 dead `:root[data-theme="dark"]` rules (`styles.css:701–703`) | **none at all** |

**OBSERVED FACT.** Both numbers are reproducible: `/usr/bin/grep -ao "font-size:[^;}]*" site/styles.css \| sort -u \| wc -l` → 93.

### 2.2 Rendered — v1.9 prototypes at 1440×900, headless Chrome

Percentages are share of *visible characters*, not of rules.

| Prototype | text < 14 px | text ≥ 16 px | line length (chars, median/max) | fold controls | fold controls < 44 px |
|---|---|---|---|---|---|
| Community | **40.1 %** | **0.6 %** | — (no long paragraphs) | 22 | 0 |
| Community `?state=empty` | 32.3 % | 8.9 % | — | 24 | 0 |
| Community Discussion | **48.4 %** | 2.2 % | **95 / 132** | 23 | 0 |
| Profile | 39.9 % | 2.9 % | — | 18 | 1 |
| Exercise detail | 32.8 % | 1.3 % | 58 / **154** | 17 | 0 |
| Stretch detail | 30.6 % | 1.6 % | 56 / **154** | 17 | 0 |
| Supplement detail | 31.8 % | 8.2 % | **78 / 200** | 13 | 0 |
| **Visual Flow Builder** | **69.2 %** | 26.5 % | — | 18 | 0 |

**OBSERVED FACT.** The builder renders 8.3 % of its characters at **10 px** and 18.9 % at 11 px.
It also renders **31.7 % of its characters at 13.3333 px** — the browser's default `<small>`
computation, i.e. a third of the flagship surface's type is not set by the type scale at all.

### 2.3 Rendered — the shipped product at 1440×900

| Route | chars | < 14 px | ≥ 16 px | line length med/max | top 5 rendered sizes |
|---|---|---|---|---|---|
| `/` | 6,190 | 39.2 % | 34.8 % | 74 / 87 | 18, 15, 12.5, 23, 13 |
| `/solve` | 7,620 | **66.1 %** | 18.8 % | 95 / 95 | 13.12, 16, 14.08, 12.16, 12.8 |
| `/studio` | 960 | 42.8 % | 32.5 % | **167 / 167** | 16, 13.12, 14.08, 12.48, 13.44 |
| `/c/creatine-monohydrate` | 26,762 | 22.3 % | 10.3 % | 104 / 121 | **14.4, 14.72, 15.04, 14.88, 14.08** |
| `/problem/knee-pain` | 48,951 | 4.8 % | 80.4 % | **138 / 158** | 16, 14.72, 15.04, 13.33, 12.8 |
| `/protocol/knee-pain/patellofemoral-pain` | 59,773 | 16.6 % | 23.1 % | **137 / 171** | 15.68, 16, 14.4, 14.72, 12.48 |
| `/goal/sleep` | 3,383 | 36.0 % | 14.5 % | 45 / 48 | 14.08, 11.52, 16, 13.12, 17.28 |

**OBSERVED FACT.** On the compound page the five most-used sizes are **14.4, 14.72, 15.04, 14.88 and
14.08 px — five values inside a 1 px band.** That is what a 93-value `rem` scale nested inside `em`
parents produces. It is not a type scale; it is a continuum with rounding noise.

---

## 3. The exact collisions

Each is stated as: what v1.9 asks for → what the repo does → the collision → severity.

### C1 — P0 (accessibility regression). The v1.9 palette fails the repo's own contrast gate.

`build/prerender.js:4631 assertContrastTokens()` is a **hard deploy gate**. It checks 11 tokens
(`AS_TEXT`) at 4.5:1 against three surfaces. Running the same arithmetic on the v1.9 tokens against
the v1.9 surfaces (`--rw-bg #f4f7f8`, `--rw-surface #ffffff`, `--rw-soft #eef4f4`):

| v1.9 token | on `--rw-bg` | on `--rw-surface` | on `--rw-soft` | verdict |
|---|---|---|---|---|
| `--rw-ink #101925` | 16.42 | 17.68 | 15.90 | ok |
| **`--rw-muted #657385`** | **4.49** | 4.83 | **4.35** | **fails AA** |
| **`--rw-faint #8a97a5`** | **2.77** | **2.98** | **2.68** | **fails AA, badly** |
| **`--rw-teal #0b8277`** (as text) | **4.36** | **4.69** | **4.22** | **fails AA** |
| `#647382` (`.column-label`, 12 px uppercase) | 4.52 | 4.87 | **4.37** | fails AA |
| `--rw-teal-dark #08665f` | 6.34 | 6.83 | 6.14 | ok |
| `--rw-gold #8c5b00` | 5.40 | 5.81 | 5.23 | ok |
| `--rw-red #a6362d` | 6.12 | 6.59 | 5.92 | ok |

`--rw-faint #8a97a5` at 2.77/2.98 is, to two decimal places, **the same defect W5c removed**:
`styles.css:7` records the deleted value as `--faint #8b97a6 → 2.79:1 on --bg, 2.97:1 on --panel,
~450 failing text nodes`. The shipped replacement `--faint #64707c` measures 4.75/5.06/4.59.

**v1.9 §10 states "WCAG 2.2 AA target". Its own stylesheet does not meet it.** This is the single
clearest case where the Markdown spec and the CSS render disagree, and per the brief the Markdown is
authoritative — so the CSS is wrong and gets recorded. **OBSERVED FACT.**

### C2 — P0 (accessibility). The v1.9 focus ring is invisible on the primary button.

`rnawiki-v19-desktop.css:35–37` sets one global focus indicator: `outline:3px solid #5788ff`.
Contrast of `#5788ff` against every surface it will land on:

| background | ratio | SC 1.4.11 (3:1) |
|---|---|---|
| `--rw-surface #ffffff` | 3.30 | ok |
| `--rw-bg #f4f7f8` | 3.06 | ok by 0.06 |
| `--rw-soft #eef4f4` | **2.96** | **fail** |
| `--rw-teal-soft #e8f6f3` (`.rw-avatar-button`, `.rw-side-nav a[aria-current]`, `.rw-state-note`, `.rw-ghost:hover`) | **2.97** | **fail** |
| **`--rw-teal #0b8277` (`.rw-primary` — the one dominant CTA)** | **1.42** | **fail, catastrophic** |

The `outline-offset:2px` puts most of the ring on the page background rather than the button, which
mitigates but does not fix it: the inner 2 px of offset region is the button's own box-shadow halo.
**OBSERVED FACT.** The fix is a two-tone ring (light outer + dark inner) or an offset ring plus a
`box-shadow` spacer, not a single colour.

### C3 — P1. v1.9 mandates a webfont the pack does not ship and the repo cannot afford.

`rnawiki-v19-desktop.css:21` — `font-family:Inter,...;font-synthesis:none`. Weights used across the
pack: **680, 700, 730, 760, 770, 780, 800, 830** — six of them non-standard, which only render as
authored on a *variable* font.

- **No `@font-face`, no `<link rel=stylesheet>` to any font host, and no font file** exists anywhere
  in `/Users/admin/Documents/Codex/2026-07-31/i-need-you-make-a-full/outputs/`. Verified:
  `grep -c googleapis *_v1_9.html rnawiki-v19-desktop.css` → 0 on all nine files.
- With `font-synthesis:none`, a fallback that lacks those weights renders 830 and 780 identically to
  700 and **cannot synthesise**. On macOS the `-apple-system` fallback is variable and will look
  right on Felix's machine; on Android/Windows it will not. **This is precisely the class of defect
  that ships looking correct.**
- The repo currently loads **zero** webfonts (`grep -c "@font-face\|fonts.googleapis" site/styles.css site/index.html` → 0/0). Adding one adds a render-blocking third-party origin to a site whose CSP
  currently allows `style-src 'self'` only, and whose stated virtue is a two-package dependency tree.

**PRODUCT DECISION required:** either (a) self-host one variable Inter subset under `site/` and add
the `@font-face` + CSP entry, or (b) collapse the weight scale to 400/600/700/800 and keep the
system stack. **(b) is the recommendation** — the six extra weights carry no information.

### C4 — P1. Two different type systems, neither of which is a scale.

v1.9: 9 sizes, `body{font-size:15px;line-height:1.48}`.
Repo: 93 sizes, `body` inherits 16 px, `line-height:1.6` (`styles.css:42`).

Collisions if both load: `rnawiki-v19-desktop.css:29` sets `body{font-size:15px;line-height:1.48}`
unscoped. Loaded after `styles.css` it **restyles every existing page**, shrinking all `rem`-derived
type by 6.25 % and tightening every line. Loaded before, its own `.rw-*` components inherit 16/1.6.
Either order is wrong. `:root{font-family:Inter…}` at `:21` and `*{box-sizing}` at `:26` collide the
same way.

**INFERENCE:** the two stylesheets cannot coexist. v1.9 must be namespaced behind a container class,
or `styles.css` must be rebuilt on the v1.9 token set. There is no drop-in path.

### C5 — P1. The Visual Flow Builder prototype is off-system.

Verified: `grep -c rnawiki-v19-desktop.css` per prototype →

```
Community 1 · Discussion 1 · Index 1 · Exercise 1 · Profile 1 · Stretch 1 · Supplement 1
Visual_Flow_Builder 0        ← the flagship surface does not load the design system
```

It re-declares its own `:root` with **drifted values**: `--line:#d9e3e6` (system: `#dce4e8`),
`--bg:#f3f7f8` (system: `#f4f7f8`), `--gold-soft:#fff5dc` (system: `#fff6dc`), a different
`--shadow`, and it **omits `--faint`, `--line-strong`, `--soft`, `--red-soft` entirely**. It also
omits the global `@media(prefers-reduced-motion)` block and the `.rw-sr-only` utility.

Consequence: 11 of the pack's 14 sub-12 px `font-size` declarations live in this one file, and its
69.2 % sub-14 px text share is more than double the next worst prototype. **OBSERVED FACT.**

### C6 — P1. Density: the product is a phone laid out on a desktop.

Measured content width on `/c/creatine-monohydrate`, hydrated:

| viewport | content width | left gutter | viewport used |
|---|---|---|---|
| 1024 | 1024 | 122 | 100 % |
| 1280 | 1080 | 250 | 84 % |
| 1440 | 1080 | 330 | 75 % |
| 1728 | 1080 | 474 | 63 % |
| 1920 | 1080 | 570 | **56 %** |

`--maxw:1080px` (`styles.css:36`) is the only desktop constraint, and there is **no `min-width`
breakpoint above 900 px anywhere in the file**. v1.9 assumes
`.rw-app-shell{grid-template-columns:190px minmax(0,1fr)}` + `.rw-main-inner{width:min(1180px,100%)}`
+ `.rw-three-column{250px minmax(0,1fr) 300px}` — a ~1,370 px shell with a persistent left nav and a
sticky companion rail. **None of that structure exists.** Adopting the v1.9 layout is not a CSS
change; it is a new page shell in `app.js`. **INFERENCE.**

### C7 — P0 (accessibility, live, independent of v1.9). Protocol pages fail WCAG 2.2 SC 1.4.10 Reflow.

At 320 CSS px (the SC 1.4.10 threshold, equal to 1280 px at 400 % zoom), **5 of 5 sampled protocol
pages scroll horizontally**:

```
/protocol/knee-pain/patellofemoral-pain      scrollW=345  SPAN.cause-tier t3 @335px
/protocol/knee-pain/knee-oa                  scrollW=345  SPAN.cause-tier t3 @335px
/protocol/low-back-pain/weak-posterior-chain scrollW=345  SPAN.cause-tier t3 @335px
/protocol/low-back-pain/poor-core-stability  scrollW=345  SPAN.cause-tier t3 @335px
/protocol/knee-pain/patellar-tendinopathy    scrollW=345  SPAN.cause-tier t3 @335px
```

Single cause: `site/styles.css:3269` — `.cause-tier{…;white-space:nowrap}`.
Screenshot: `out/wa_ds/reflow320.png`. **OBSERVED FACT, hydrated.**
v1.9 §10 requires "200 % zoom and 400 % reflow without clipped actions" — the current product does
not meet it on the 52-page protocol layer. `/`, `/problem/*`, `/c/*` and `/studio` all pass at 320.

### C8 — P2. Target size: passes WCAG 2.2, fails the v1.9 44 px contract.

Measured at 390×844 with the SC 2.5.8 inline-link exception applied:

| route | non-inline controls | < 44 px (v1.9 contract) | < 24 px (WCAG 2.2 AA) |
|---|---|---|---|
| `/` | 50 | 0 | 0 |
| `/solve` | 107 | 4 | 0 |
| `/studio` | 11 | 1 | 0 |
| `/c/creatine-monohydrate` | 31 | 3 | 0 |
| `/problem/knee-pain` | 37 | 18 | **9** |
| `/protocol/knee-pain/patellofemoral-pain` | 73 | 21 | **8** |

The real defects are narrow and specific:

- **`<summary>` disclosures render 23 px tall** on protocol pages — seven per page, and `<summary>`
  is the site's primary progressive-disclosure control. 1 px under SC 2.5.8. v1.9 already solves
  this: `rnawiki-v19-desktop.css:73` — `.rw-disclosure summary{min-height:52px}`.
- **"Cite this protocol" is 14 px tall** (`button.linkbtn`).
- Two cause-list anchors at 19 px on `/problem/knee-pain`.

**Explicit non-finding, recorded so it is not rediscovered:** `wa_targets` reports six
`input.pgl-c` at **1 px** on `/problem/knee-pain`. These are **not** target-size failures.
`styles.css:4035` shows `.pgl-d` is a correct visually-hidden pattern and the real target is the
visible `.pgl-t` label. Counting them would repeat the brief's `#/route` anchor error in a new form.

### C9 — P2. There is no focus token, but focus is not broken.

Tabbing 18 elements on `/` hydrated: **0 elements with no visible indicator.** The UA default
`outline:auto 1px rgb(0,95,204)` fires everywhere `styles.css` does not override it. Of the 14
`outline:none` rules, 13 pair with a `box-shadow` ring.

The weak one is the search input family: computed on focus →
`outline:none 3px rgb(40,53,68)` (i.e. none) + `box-shadow: rgba(13,148,136,0.12) 0 0 0 3px`.
Composited over white that ring is ≈ `#e2f2f1` ≈ **1.13:1** — effectively invisible. What actually
satisfies SC 2.4.7 there is the 1 px border colour change to `--accent`. That meets 2.4.7 ("visible")
but nothing more, and fails WCAG 2.2 SC 2.4.13 Focus Appearance thresholds.

**The systemic finding is the absence, not a failure:** relying on the UA default means focus
appearance is browser-dependent and untestable, and any future `outline:none` silently removes it.
v1.9's single global rule is the right idea; only its colour is wrong (C2).

### C10 — P3. Dead theme code.

`styles.css:701–706` declares six `:root[data-theme="dark"|"light"] .gi-*` rules.
`prerender.js:4631`'s own comment states *"this site has no dark `:root` and app.js never sets
`data-theme`"*. Verified: 3 `data-theme="dark"` occurrences in the whole stylesheet, all in that
block. These rules can never fire. v1.9 ships **no dark scheme at all**, so adopting it does not
change this either way. **OBSERVED FACT.**

### C11 — P1. The contrast gate has a 79 % coverage hole.

`assertContrastTokens()` reads `:root`, builds a token map, and checks **11 named tokens × 3
surfaces**. It does not look at any other colour in the file.

- 24 hex values are declared in `:root`.
- 255 distinct hex values are used.
- **231 distinct values (91 %), 895 of 1,138 occurrences (79 %), are outside the gate.**
- Restricted to text: **75 distinct off-token `color:#hex` values across 246 declarations.**

I deliberately do **not** claim a failure count from that set. A static check cannot resolve the real
background of `#5eead4` or `#f2a5b8` — several are obviously light-on-dark. The correct statement is:
**the gate proves 11 tokens are safe and proves nothing about 246 text-colour declarations**, and the
only instrument that can settle them is a composited hydrated sweep like `w5cd_meas.mjs`.
**COULD-NOT-CHECK** on the failure count; **OBSERVED FACT** on the coverage hole.

### C12 — P2. Icon system: emoji-as-token, in both systems.

Both the repo and v1.9 use emoji as the icon layer (`.rw-nav-icon` in v1.9; `💊 ✅ ❔ 🟢 ⭐ 🔵 ⚫ 🟠`
in the repo). For v1.9 that is cosmetic. **For the repo it is not** — `🟢`/`🔵`/`⚫`/`🟠` are the
*machine-readable* regulatory classification: `build/parse.js:295` derives `isRx` by scanning the
badge string for those exact code points. An icon set that is also a data schema cannot be swapped
for a v1.9 icon set without a data migration. Flagged so the v1.9 visual refresh does not quietly
break the safety classifier. See `cognitive_ux_audit.md` §6 P0-1 for what that classifier is already
getting wrong. **OBSERVED FACT.**

---

## 4. Where I disagree with the supplied audits

1. **`v19_novice_builder_audit.md:471–487` sets "body copy ≥ 16 px; quiet metadata ≥ 14 px;
   line length 45–70 characters".** The v1.9 stylesheet those budgets are supposed to govern
   **breaks all three**: `body{font-size:15px}`, 30–69 % of rendered characters under 14 px, and
   measured line lengths of 78/95 median and 132/154/200 max on Supplement, Discussion, Exercise and
   Stretch. The audit and the artefact were not reconciled. **This is the highest-value contradiction
   in the pack** — a reviewer who trusts the audit will assume the CSS implements it.

2. **The novice audit's budget table has no contrast row and no focus row.** Both C1 and C2 are
   invisible to it. Budget tables that count controls but not colour are how `--faint #8b97a6`
   shipped the first time.

3. **`v19_wiki_blocks_audit.md` §7 designs a Supplement page around an outcome selector and forbids
   whole-compound stars (v1.9 spec §8.4).** The repo's compound pages lead with a whole-compound star
   (`★★★★★ 5 of 5` beside the `<h1>` on `/c/creatine-monohydrate` — see `out/wa_ds/1440__c_creatine_monohydrate.png`),
   and `AGENT_RULES.md` §"DO NOT IMPLEMENT" says **"Do not remove the evidence star or call it
   meaningless."** These two instructions are in direct conflict. **This needs Felix, not an agent.**
   My read: the star is a *whole-compound* signal that v1.9 bans, but it is also the site's most
   load-bearing honesty device. The reconcilable version is to keep the star and bind it to the
   selected outcome, not to delete it — but that is a product call.

---

## 5. Change specs (read-only — for an integrator, not applied)

Ordered by severity. Each gives exact file, line, old string, new string, and the measurement that
justifies it. **None of these has been applied.**

### S1 — `site/styles.css:3269` — fixes C7, WCAG 1.4.10 on 52 protocol pages

```
old: .cause-tier{font-size:.74rem;color:var(--faint);letter-spacing:1px;white-space:nowrap}
new: .cause-tier{font-size:.74rem;color:var(--faint);letter-spacing:1px}
```

Justification: hydrated at 320×600, `SPAN.cause-tier.t3` renders 335 px wide inside a 320 px
viewport, forcing `documentElement.scrollWidth` to 345 on 5/5 sampled protocol routes. Removing
`nowrap` is sufficient; `letter-spacing:1px` on a wrapped label is still legible.
**Verify after:** re-run `wa_targets`/reflow probe at 320 across all 52 `/protocol/*` routes and
assert `scrollWidth <= 320`.
**Gate it:** the existing geometry smoke gate (W5.5c) checks desktop; it should gain a 320 px pass,
otherwise this recurs. A gate proven only at 390 did not catch a 320 defect.

### S2 — new global focus token in `site/styles.css:1–39` + one rule — fixes C9's absence, avoids C2

```
add to :root:  --focus:#1d4ed8; --focus-ring:0 0 0 2px #ffffff, 0 0 0 5px var(--focus);
add after line 44:
  a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,
  textarea:focus-visible,summary:focus-visible,[tabindex]:focus-visible{
    outline:2px solid var(--focus);outline-offset:2px;box-shadow:var(--focus-ring)
  }
```

Do **not** use v1.9's `#5788ff`: measured 1.42:1 on `--rw-teal` and 2.96/2.97 on the two soft
surfaces. `#1d4ed8` with a white inner spacer clears 3:1 on white, on `--bg`, on `--panel2` and on
the accent fill, because the white spacer — not the blue — is what carries the contrast against the
dark button. **Add `--focus` to `assertContrastTokens`'s list as a non-text 3:1 check** so it cannot
drift.

### S3 — `site/styles.css:621` and `:882` — remove the two invisible focus rings

```
old: .solve-q input:focus{outline:none;border-color:var(--accent)}
new: .solve-q input:focus{border-color:var(--accent)}
```
(and the same for `#hero-solve-input:focus` at `:882`, which `:4841` already overrides on `.lp`).
Measured composited ring: `rgba(13,148,136,.12)` over white ≈ 1.13:1.

### S4 — do **not** import `rnawiki-v19-desktop.css`. Extract a token file instead.

Recommended token set — v1.9's *layout and radius* decisions with the repo's *gate-passing* colours:

| v1.9 token | v1.9 value | recommended | why |
|---|---|---|---|
| `--rw-ink` | `#101925` | keep | 16.42:1 |
| `--rw-muted` | `#657385` | **`#5c6a7a`** (repo `--muted`) | 4.35 → 5.01 worst-case |
| `--rw-faint` | `#8a97a5` | **`#64707c`** (repo `--faint`) | 2.68 → 4.59 worst-case; this is the W5c value |
| `--rw-teal` as text | `#0b8277` | **`#08665f`** (`--rw-teal-dark`) | 4.22 → 6.14; keep `#0b8277` as a *fill* only (white on it = 4.69, passes) |
| `#647382` column labels | — | **`#5c6a7a`** | 4.37 → 5.01 |
| focus | `#5788ff` | **`#1d4ed8` + white spacer** | 1.42 on the primary button |

Keep from v1.9 without change: the radius scale (11/12/13/14/16/20/24/999), the two-tier shadow, the
44 px `min-height` on `button`, `.rw-disclosure summary{min-height:52px}`, the two-breakpoint model
(1120/900), the global reduced-motion block, and the `.rw-app-shell` / `.rw-two-column` /
`.rw-three-column` grids. Those are the parts of v1.9 that are genuinely better than what ships.

### S5 — collapse the weight scale before adopting any of v1.9

`680/730/760/770/780/830 → 600/700/800`. Six of eight v1.9 weights carry no information and only
render as authored under a variable Inter that the pack does not ship (C3).

---

## 6. What I could not check

- **Live `rnawiki.com`.** All measurement is against `localhost:8099`. `WebFetch` is prohibited by
  the brief. The branch is 27 improvements ahead of what is published, so live may differ.
- **The failure count inside the 246 off-token text-colour declarations (C11).** Needs a composited
  hydrated sweep, not a static check. Recorded as a coverage hole, not a defect count.
- **`RNAwiki_Core_Protocol_Product_Requirements_Document.{docx,pdf}`** — read only as line counts;
  the earlier SAFETY/privacy/governance contract in it was not diffed against v1.9 in this file.
  That is the safety agent's lane; where it touched mine (C12, and P0-1 in the cognitive audit) it
  is called out.
- **200 % browser zoom** specifically. I measured 400 % reflow (320 CSS px), which is the stricter
  SC. 200 % was not separately measured.
- **Dark-mode rendering.** The site has no dark theme to measure and v1.9 supplies none.
