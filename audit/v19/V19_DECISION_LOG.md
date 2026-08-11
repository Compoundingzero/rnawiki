# RNAwiki v1.9 — DECISION LOG

**Companion to `V19_CHECKPOINT.md`.** Two things are recorded here and nowhere else:

- **Part A** — every conflict **between specialists** that I resolved, with the resolution and the
  measurement that settled it.
- **Part B** — every place the **supplied audits**, the **v1.9 spec**, the **task brief**, or the
  repo's **own documentation and code comments** were **contradicted by the actual repository**.

**Author:** Lead agent, Wave A synthesis · **Date:** 2026-08-11 · **Branch:** `refine/site-wide-2026-08`
Nothing in this file is a product decision. Product decisions are in `V19_CHECKPOINT.md` §10.

**Standing rule applied throughout:** the v1.9 **Markdown** is source-authoritative; DOCX/PDF are
renders. A rendering discrepancy follows the Markdown **and gets recorded**. Earlier documents govern
unresolved safety, privacy, consent, review, versioning and governance; v1.9 supersedes **layout**
decisions only.

**Second standing rule:** when a document and a measurement disagree, the measurement wins and the
document is recorded as wrong. A previous audit of this site got roughly a third of its conclusions
wrong by measuring the prerendered document and describing it as what a user sees.

---

# PART A — Conflicts between specialists, resolved

## A-1. "3 P0s" vs "41 P0s" — the largest apparent conflict in the pack

**The conflict.** `v19_gap_matrix.csv` (80 rows) scores **3** requirements as P0. The 20 specialist
audit files, taken together, name **41** P0-class defects.

**Resolution: not a conflict. Two different questions, both correctly answered.**

- The matrix asks *"does the shipped product conform to this v1.9 requirement?"* Most v1.9
  requirements describe unbuilt things, so "absent" is honest and the severity is the severity of
  **not having built it**.
- The specialist P0 registers ask *"is the live product dangerous, leaking, or lying?"* Those defects
  are mostly **outside** v1.9's requirement list — v1.9 contains no requirement reading "do not
  pre-tick statins onto a knee patient's daily checklist."

**Recorded resolution:** both totals stand and both are published in the checkpoint (§4.1–4.3 and
§5). **§5 governs what gets fixed first, not §4.** Anyone reading only the matrix will conclude this
product has three urgent problems. It has forty-one.

## A-2. Sequencing — reading layer vs Visual Flow Builder

**The conflict.** The design/cognitive specialist disputes the whole pack's emphasis: *"All three
supplied audits treat 'simple' as a canvas/builder problem. Measured, the largest cognitive-load
numbers on the shipped product are on the READING layer (138-character line measure on
`/problem/knee-pain` across 174 paragraphs; 55% of its sentences over 25 words), which serves the
~90% of traffic that never runs JavaScript. The builder serves the creator minority."* The graph/HCI
specialist and the v1.9 spec both put the builder first.

**Resolution:** both are right about their own evidence and the dispute is about cost, not truth.
The reading-layer fixes are **one-line, independent and cheap** (`max-width:68ch`; a build-time
25-word sentence ceiling; deleting one `white-space:nowrap`). They do not compete with the builder —
they are a **rider on slice 0/2**, not a competing programme. The builder stays a real slice because
it is the owner's stated product direction.

**Escalated anyway** as checkpoint D-13, because reordering the owner's own emphasis is his call, not
mine.

## A-3. Which P0 is "the" prescription-only defect — four specialists, four different surfaces

**The conflict.** Four specialists each reported a prescription-only P0 as *the* headline defect, on
four different surfaces, and each was written as if it were the whole finding:

| Specialist | Surface | Mechanism |
|---|---|---|
| Clinical/pharmacy | `/c/*` compound pages | `compoundTier()` regex over prose → 88 of 95 get `+ Add to stack` |
| Compound content | `/fuel/*` stack generator | whole-compound star rank, no regulatory filter → 39 of 52 protocols |
| Graph/protocol domain | `/plan` daily checklist | `selSupps()` defaults to `allSupp`, every checkbox **pre-ticked** → 39 of 52 causes |
| Design/cognitive | `/studio` | `isRx` derived from the approval **emoji** → Insulin classifies as not-Rx |

**Resolution: these are four distinct defects with four distinct root causes, not one defect
reported four times.** Fixing any one leaves the other three live. I have merged them into P0-S1,
S2, S3 and S5 with separate change specs and separate gates, and recorded that **`consumer_renderable`
is authored, correct, and already trusted by the Studio and by `assertRegulatoryAxes`** — so all four
fixes are "read the field that already exists" rather than "author a policy."

**The sharpest single sentence in the pack, preserved:** the same site refuses to hand you
testosterone in the plan builder and offers you a one-tap add on the testosterone page. *That is not
a policy, it is two policies.*

## A-4. The evidence star — a genuine unresolved contradiction, escalated not decided

**The conflict.** v1.9 §8.4 and `v19_wiki_blocks_audit.md` §7 **prohibit** whole-compound evidence
stars and require an outcome selector. `AGENT_RULES.md` "DO NOT IMPLEMENT" says **"Do not remove the
evidence star or call it meaningless."** The repo currently leads every `/c/*` page with a
whole-compound star beside the h1.

**Resolution: I did not resolve it.** Two binding documents give opposite instructions about a
user-visible element. My reading — keep the star, bind it to the **selected outcome** rather than
deleting it — reconciles the letter of both, but it is a product decision.

**Escalated as checkpoint D-2.** Recorded here so no later wave silently picks a side.

## A-5. `assertPrivateRoutesAgree()` — one specialist nearly filed a false P0; another built on it

**The conflict.** The repository archaeologist reported route-table drift as "structurally unguarded"
and noted `assertPrivateRoutesAgree()` is referenced only in a comment. The profile specialist
independently reached the same conclusion, **then kept reading** and found the check is real: it is
part (3) of `assertProfileDisclosesOnlyPublished()`, `build/parse.js:3676-3697`, which parses
`NOINDEX_ROUTES` out of `server.js` and `PRIVATE_ROUTES` out of `app.js` and exits non-zero on
asymmetry. Only the **name in the comment** is wrong.

**Resolution:** the profile specialist is correct and the archaeologist's framing needs narrowing.
The gate **exists** for the server↔app noindex pair. What is genuinely unguarded is
`SPA_ONLY_ROUTES ⊇ NOINDEX_ROUTES` — and that is the exact gap that produced the live
`/clinic` `/exercise` `/fork` defect. Downgraded from "no gate" to "one of four pairs gated"; the
stale comment is P3.

**Recorded because it is the trap this codebase keeps setting:** a comment naming a function that
exists under a different name reads exactly like a missing gate.

## A-6. Build-gate count: 52 vs 54 vs 58

**The conflict.** The task brief says **58**. The archaeologist measured **52** self-invoking gates
(22 `parse.js` + 30 `prerender.js`) with **54** distinct `assert*` names. The graph specialist
measured **54** using a different regex (`/function assert[A-Z]\w*\s*\(/g`).

**Resolution: both measurements are right; they count different things.** 52 = gates that
**self-invoke at module load** and therefore actually run. 54 = `assert*` **functions defined**,
including two called from inside another gate rather than invoked directly.

**I re-ran it myself:** `grep -acE '^\(function assert[A-Za-z]+\(\) \{'` → `build/parse.js:22`,
`build/prerender.js:30` = **52**. The checkpoint quotes 52 and says what it counts. **58 is
unreproducible and must not be quoted again.**

## A-7. Smoke-test count: 49 vs 52

**The conflict.** Brief says 52 route types; the archaeologist measured 49 `[name, route]` template
classes at `scripts/smoke.mjs:57-180`.

**Resolution:** 49 stands. My own `grep -c -aE "^\s*\['"` returns 73 lines, which is a *superset*
(it catches array literals elsewhere in the file) and therefore does not refute 49; the specialist's
line-bounded count of the `ROUTES` const is the tighter measurement. **Do not quote 52.**

Materially: `grep -ac "'/p/" scripts/smoke.mjs` → **0**. The share URL that `POST /api/protocols`
mints has **no hydrated-DOM gate**, which is exactly the surface carrying P0-S6.

## A-8. `/studio` "Clear" — a P0 that dissolved on measurement

**The conflict.** An early read described `/studio`'s "Clear" control as unconfirmed data loss.

**Resolution: refuted, and recorded as a non-finding.** The specialist intercepted `confirm()` and
captured the dialog verbatim — *"Empty this protocol? It is only on this device, so this cannot be
undone."* — and `localStorage` was byte-identical before and after with the dialog dismissed.

**Recorded because it looked like a P0 in code and was not in the browser.** Same class as the
`/body/leg` 3D lesson, inverted.

## A-9. Assessment bypass on 31 of 41 problems — P0 downgraded to P1 by the specialist himself

**The conflict.** `openIntake()` (`site/app.js:1312`) returns early to `/protocol/<pid>/<rcid>` when
a problem has one root cause — 31 of 41 problems. First read: total red-flag bypass, P0.

**Resolution: self-retracted on hydrated measurement, and I am upholding the retraction.** The
destination page's **first h2** is "🚩 First — when this is not a self-care problem", and reassess
content exists on **41 of 41**. The content is present; the *interruption* is not. **P1 asymmetry**,
not a bypass.

Separately upheld as a real defect: the string **"Possible reason · not a diagnosis"** — the locked
mental model's own wording — appears **0 times** in `site/app.js` and **0 times** in `site/data.js`.
The current headline is "**Most likely:** {root cause}", which inverts the emphasis. That is
`V19-VOCAB-001`, the only `contradictory` P0 in the gap matrix, and it is a cheap copy fix.

## A-10. Interaction-panel visibility vs interaction-panel correctness

**The conflict.** One specialist reported the interaction engine as correct and well-built; another
reported a ☠️ danger-tier interaction as a P0.

**Resolution: both true, and the combination is the finding.** The engine **computes** additive
hypoglycaemia (Berberine + Metformin + Acarbose + Semaglutide + Tirzepatide) correctly at
`site/app.js:6022` — then `:6033` puts it inside `<details class="trk-fold">` with `open=false`
behind a summary that does not carry the danger count. Measured hydrated, open state read **before
any interaction**.

**Recorded because it is the owner's own decision, built and then muted:** "if drugs overlap, warn."
It warns, inside a closed box. ~15-line fix.

## A-11. `/fuel` — "product decision" vs "P0 defect", on the same 52 pages

**The conflict.** The archaeologist recorded the 52 `/fuel` pages as a *product decision to confirm*
(authored, correct metadata, deliberately noindexed). The compound-content specialist recorded the
same 52 pages as the location of a **P0** (the stack generator hands out prescription compounds).

**Resolution: both stand, and they are about different properties of the same route.** Discovery
posture = product decision (D-7). Stack contents = P0-S2. **Fixing the P0 does not settle the
discovery question, and confirming discovery does not fix the P0.** Recorded so neither is closed by
resolving the other.

## A-12. Contrast gate coverage — "the gate proves the tokens are safe" vs "79% of colours are ungated"

**The conflict.** `assertContrastTokens()` is cited elsewhere as evidence the site is AA-safe. The
design specialist measured that it checks **11 named tokens × 3 surfaces**, while the stylesheet uses
**255 distinct hex values**, of which 231 (91%) — 895 of 1,138 occurrences (79%) — sit outside the
gate; restricted to text, 75 distinct off-token `color:#hex` values across 246 declarations.

**Resolution:** the specialist explicitly **declined to claim a failure count** from that set,
because a static check cannot resolve the real composited background of a value like `#5eead4`.
That restraint is correct and I am preserving it. The honest statement: **the gate proves 11 tokens
are safe and proves nothing about 246 text-colour declarations.** Settling it needs a composited
hydrated sweep, not a static check. Recorded as a **coverage hole with a could-not-check on the
failure count** — not as "246 failures."

## A-13. Prototype save copy vs shipped save copy — the direction nobody expected

**The conflict.** Prototypes are normally the aspirational artefact. Here the **shipped repo is more
honest than the prototype**.

- v1.9 prototype: prints **"Saved in this tab"** with **0** occurrences of `localStorage`,
  `sessionStorage` and `fetch(` in 80,682 bytes of script. A reload loses the whole protocol.
- Shipped `/studio`, hydrated: *"Saved on this device. It is not on a server and nobody else can see
  it."*

**Resolution: the repo's copy is the model; the prototype's is a defect to be prevented from
propagating.** Recorded explicitly because the ordinary instinct — copy the prototype — is wrong
here, and §3.4 requires *"Saved appears only after the server durably acknowledges the current
revision."*

---

# PART B — Where the repository contradicted the documents

## B-1. Against the v1.9 SPEC and its CSS

| # | Document says | Repository / measurement says | Verdict |
|---|---|---|---|
| **B-1.1** | v1.9 §10 declares a **"WCAG 2.2 AA target"** | `rnawiki-v19-desktop.css` ships **three tokens below AA** — `--rw-muted` 4.35, `--rw-teal`-as-text 4.22, `--rw-faint` **2.68** — and `--rw-faint #8a97a5` reintroduces almost exactly the `#8b97a6` value W5c deleted (`styles.css:7`: "~450 failing text nodes"). Adopting it **fails the repo's own `assertContrastTokens()` deploy gate**. | **The Markdown is authoritative, so the CSS is the error.** Do not import the file. |
| **B-1.2** | v1.9 ships a single global focus ring `#5788ff` (`rnawiki-v19-desktop.css:35-37`) | **1.42:1 against `--rw-teal`** — invisible on `.rw-primary`, the one dominant CTA on every v1.9 screen. Also fails SC 1.4.11 on `--rw-soft` (2.96) and `--rw-teal-soft` (2.97). | CSS is the error. Needs a two-tone ring. |
| **B-1.3** | v1.9 mandates `font-family: Inter` with `font-synthesis:none` and **eight weights, six of them non-standard** (680/700/730/760/770/780/800/830) | **No `@font-face`, no `<link>`, no font file anywhere in the v1.9 outputs.** `grep -c googleapis` across all nine v1.9 files → **0**. The repo loads **zero** webfonts and its CSP is `style-src 'self'`. | The pack mandates an asset it does not ship. **Ships looking correct on a Mac; collapses on Android/Windows** — the 3D-leg lesson class. Escalated as D-16. |
| **B-1.4** | The task brief says the **§6.2 canonical graph invariants** are in the v1.9 Markdown spec | They are **not**. §6.2 of `RNAwiki_Unified_Desktop_Experience_v1_9_Spec.md` is *"Exercise wiki · First viewport."* The invariant list is at `RNAwiki_Unified_Experience_v1_9_Claude_CLI_Prompt.md:265-287`. | Source-pack discrepancy. The invariants themselves are unambiguous and were audited as given. |
| **B-1.5** | Two specialists' briefs said "audit SEO against **§6.7**" | **There is no §6.7** in the 961-line Markdown. §6 is "Exercise wiki" and stops at §6.3. The SEO contract is **§13**. A §6.7 exists in the *earlier* v1.8 focused spec, where it is "Checks before preview" — a builder gate, unrelated to SEO. Two of the three supplied audits have their own §6.7 ("Check and preview", "Common mistakes"), neither of which is SEO either. | **Cross-document numbering collision, not a pointer.** Both specialists audited §13 and said so. Recorded so nobody re-derives it. |
| **B-1.6** | A brief cited "§6.3's public-projection invariants" | §6.3 is *"Page chapters and companion rail"* for the Exercise wiki. Public projection is **§9**. | Audited against §5 + §9. Recorded. |
| **B-1.7** | v1.9 §3.4 forbids a "generic block library"; §3.5 forbids duplicate Add controls | **The owner's own demo shows exactly that** — a persistent right-rail "Add a block" palette (00:03), a draggable **Safety route** block, and an explicit entry node "Someone arrives · Knee pain". Meanwhile the v1.9 prototype draws **no safety node at all** and draws only 3 edges for 5 authored answers. | **Both documents are binding and they collide.** The demo is owner intent; v1.9 supersedes layout. Escalated as D-12, not decided. |
| **B-1.8** | v1.9 public profile shows "Day {n} / streak / Active Journey" | That payload **fails the repo's own `assertProfileDisclosesOnlyPublished()` gate** (`build/parse.js:3634`), which hard-fails the deploy if `experiments`, `user_plans`, `studio_clones`, `conditions`, `meds` or activity re-enter the public payload. | **The sharpest spec-vs-repo collision in the community lane, and neither document mentions it.** Escalated as D-9. |
| **B-1.9** | v1.9 slice 17: "Protocol monetization architecture behind an off flag" | `AGENT_RULES` product constraint 1: **"Free. No paywall, no affiliate links."** | Direct conflict between binding documents. Escalated as D-11. |
| **B-1.10** | v1.9 §3.12 orders publish-repair validation with *"1. urgent/safety destination missing"* first | The prototype's own gate implements **rules 3,4,5,6 only**. Proven by mutation: re-pointing "After a new injury or with severe symptoms" from Urgent guidance into a self-care Plan produces the banner **"All routes terminate safely."** | The prototype contradicts its own spec. P0-S19. |

## B-2. Against the SUPPLIED SPECIALIST AUDITS

| # | Supplied audit says | Measurement says | Consequence |
|---|---|---|---|
| **B-2.1** | `v19_novice_builder_audit.md:471-487` sets the typography budget: **body ≥16px, quiet metadata ≥14px, line length 45–70 characters** | The v1.9 stylesheet those budgets govern **breaks all three**. Rendered at 1440×900: `body{font-size:15px}`; **30.6%–69.2% of visible characters below 14px** across the eight prototypes; the Visual Flow Builder has 69.2% under 14px, 8.3% at 10px and **31.7% at 13.3333px — the browser's default `<small>`, i.e. a third of the flagship surface is not set by the type scale at all**. Line-length medians 78 (Supplement) and 95 (Discussion), maxima 132/154/200. | **The highest-value contradiction in the pack.** An implementer trusting the audit while styling from the CSS satisfies **neither**. |
| **B-2.2** | `v19_novice_builder_audit.md` §8 sets control budgets | Measured fold-control counts on every sampled route are **9–28, inside every limit in that table.** The table has **no contrast row, no focus row and no reading-level row** — so it is structurally blind to the three measured P0-class failures. | **The budget constrains the thing that is not broken.** |
| **B-2.3** | `v19_wiki_blocks_audit.md` §3.1.3: professional prescription fields are *"compressed into one line"* | **4 of 10 exist** (sets, reps, tempo, rest). Side, load, RPE/RIR, range, frequency, session slot and TUT have **no field, no default and no holder at any layer**. All **873/873** prescriptions are `source:'default'`; **3 distinct strength prescriptions cover all 750** strength records. | *"Compressed"* implies present-but-crammed. **They are absent.** A team acting on that sentence ships a layout change instead of creating a data model. |
| **B-2.4** | `v19_wiki_blocks_audit.md` "Files audited" (lines 7-14) lists four mobile prototypes plus `work/audit/app.js`, `data.js`, `sitemap.xml` | It **never opens `site/exercises.js`** — the 873-record file that is the entire movement layer. | The movement audit was performed without the movement data. |
| **B-2.5** | `v19_wiki_blocks_audit.md` §12 accessibility contract | **Never mentions the one WCAG failure actually shipping**: an infinite, unpausable animation on 873/873 movement pages that survives `prefers-reduced-motion: reduce` (measured with `emulateMediaFeatures`). | |
| **B-2.6** | `v19_community_profile_audit.md:1165` cites *"44 × 44 CSS pixels… consistent with W3C target-size-enhanced guidance"* | That is **SC 2.5.5, level AAA**. The **AA** requirement in WCAG 2.2 is **SC 2.5.8 at 24 × 24 CSS px**, with an inline exception and a spacing exception 2.5.5 does not have. | Scoping error, not pedantry. Against 24 px the existing defect set is bounded and fixable. Escalated as D-27. |
| **B-2.7** | `v19_community_profile_audit.md` C5 frames reciprocal-group / multi-account manipulation as a **future design risk** | **It is a shipped, executed defect today, on a different object.** Four cookieless `curl` requests put a public warning banner on a real clinical protocol page, forged the results ledger, and produced "🧬 4 people are building this plan". Screenshot captured. | *"The audit did not find it because it never ran the server."* |
| **B-2.8** | `v19_community_profile_audit.md` C6 asks for a public allowlist and an Active Journey privacy warning | **The repo is already stricter than the audit asks** — `GET /api/u/:handle` publishes exactly `{username, joined-to-the-month, published protocols, clones}`, gated by `assertProfileDisclosesOnlyPublished()`. | Do not "fix" this. See B-1.8 for the collision it creates. |
| **B-2.9** | `v19_novice_builder_audit.md` §8: *"Scoped library before search: ≤1 recommendation + ≤3 alternatives"* — reported as unmet | **Corroborated, and the shipped violation is worse than described**: the Add modal renders **four permanent category toggles** (which §3.9 explicitly forbids), search **above** the matches rather than below, and **seven** results, over an **873-item flat Movements namespace**. | Agreement, recorded with the sharper measurement. |
| **B-2.10** | All three supplied audits treat "simple" as a canvas/builder problem | The largest measured cognitive-load numbers are on the **reading** layer, serving the ~90% of traffic that never runs JavaScript. | Disputed sequencing. See A-2 / D-13. |

## B-3. Against the W0 BASELINE (`out/W0_BASELINE.md`, which `AGENT_RULES` calls authoritative)

W0 measured **localhost on 2026-08-01**. Several of its findings are now stale, and some were never
true of production. **`AGENT_RULES` instructs every agent to treat W0 as authoritative — that
instruction now needs this table attached to it.**

| # | W0 says | Measured 2026-08-11 | Verdict |
|---|---|---|---|
| **B-3.1** | "The route universe is closed at **564**" | **568** sitemap `<loc>` (I re-counted: `grep -c "<loc>" site/sitemap.xml` → 568). `/compare` grew 120→124. Plus **52** prerendered-but-unlisted `/fuel` pages and **13** SPA-only routes with no prerendered file. Total served HTML 200s: 633 local / 631 prod. | **Restate "564" everywhere.** |
| **B-3.2** | D22 / erratum E12: `data.js` is `decodedBodySize = encodedBodySize = 11,662,047 B` → "zero compression on the wire; server.js contains no compression middleware" | **Not true of production and no longer true of the branch.** `curl -I https://rnawiki.com/data.js` → `content-encoding: br`, `content-length: 2,411,882`. All 631 prod HTML routes and all static assets serve brotli. | The 8.80 MB/load saving W0 said was "not taken" **has been taken**. |
| **B-3.3** | Erratum E13: "0 validators on 5/5 assets; `If-Modified-Since: 2040` → 200 + full body" | **Now split by origin.** Production static assets **do** carry `etag` + `last-modified` + `max-age=14400`. Production **HTML** still carries neither (0 of 631) and still returns 200. **The branch fixes HTML too** — local `If-None-Match` on `/c/creatine-monohydrate` returns **`304 Not Modified`** (verified, not inferred). | Split the erratum by origin and by asset class. |
| **B-3.4** | D42 / §5 open question 1: "503 on `GET /api/me` and `/api/rootcause-overlay` on all 564 routes… whether production also 503s is not established" | **Resolved as a localhost artefact only.** Production: `/api/me` → `200 {"user":null}`, `/api/rootcause-overlay` → `200 {"overlay":[]}`, `/api/stats` → 200, `/api/config` → `200 dbEnabled:true`. | **Never carry "503 on 564/564" into a production claim.** |
| **B-3.5** | Errata: of the protocol stop rule and metric, "the real, smaller finding is that **neither is structured**" | **False at the data layer.** `data/protocol_safety.json` carries `metric`, `metricSource`, `checkpoint`, `stopIssue`, `stopHorizon` at **41/41 each** — 205 fields, fully structured. What is unstructured is the **rendering**: hydrated `/protocol/anxiety/gaba-deficit` and `/protocol/knee-pain/patellofemoral-pain` emit it as one prose section with **0** elements carrying `data-metric`/`data-checkpoint`/`data-stop`/`data-checkin`. | **A v1.9 plan built on W0's wording would re-author 205 fields that already exist.** The Check-in node is a rendering job, not an authoring job. |

## B-4. Against `AGENT_RULES.md` itself

| # | `AGENT_RULES` says | Measured | Consequence |
|---|---|---|---|
| **B-4.1** | Line 71: "`site/app.js` is ONE IIFE, **6,307 lines**… **577 KB**. `server.js` is **2,025 lines**. `styles.css` is **298 KB**." | I re-ran `wc -l` myself: **`app.js` 10,286 lines**, `server.js` **3,157 lines**, `db.js` 604, `studio-safety.js` 337. `app.js` is 899,877 B; `styles.css` 401,505 B. | The **editing-discipline rules built on these figures under-state `app.js` by 63%.** Every edit plan scoped from them is mis-sized. |
| **B-4.2** | Line 6: "`KEEP_PRERENDERED = ['methodology','corrections','problem']` (**app.js:6059**)" | The **set is unchanged and correct**; the **line number is stale** — app.js is now 10,286 lines. | **Cite `app.js` by symbol, never by line number.** |
| **B-4.3** | "Do not ship any aggregate efficacy statistic." | `GET https://rnawiki.com/api/stats` → **`{"experiments":20,"improved":1,"helped":19}`**, unauthenticated, live. I re-ran this today. Its display was removed (`site/app.js:5104-5106`) and `grep -ac 'api.stats('` → **0 call sites** — but the endpoint publishes it and the dead client method survives at `app.js:848`. | A third party can fetch and quote a **5% improvement figure** as RNAwiki's own number. Removing the endpoint costs nothing. P0-P12. |
| **B-4.4** | Constraint 3: "Anonymous-first. Reading, **logging** and the $0 protocol must work with **no account**." | Hydrated, signed-out: *"🔒 Sign in to log your meals."* `hasScan:false`, `hasAddFood:false` — the controls are not in the DOM at all. Yet storage is `localStorage` and never leaves the device. | The constraint is violated by a growth gate. **Nothing technical requires the account.** P0-S17. |
| **B-4.5** | Trap 5: "`#/target/ATP` is SPA hash-ROUTER navigation, not an in-page anchor." | The harness itself still violates this: `qa/probe.mjs` reports `anchorDead: 6` on `/studio` with `deadSample: ['#/','#/solve','#/where','#/plan','#/learn','#/']` — **all six are SPA navigations; the true dead-anchor count is 0.** | **Do not quote `probe.mjs`'s `anchorDead` field.** Already produced a false finding in the original brief and W0 errata E1/E22. |

## B-5. Against the TASK BRIEF

| # | Brief says | Measured | Verdict |
|---|---|---|---|
| **B-5.1** | "**58** build checks" | **52** self-invoking gates (22 + 30), 54 distinct `assert*` names. Re-run by me. | 58 is unreproducible. |
| **B-5.2** | "**52** smoke page types" | **49** `[name, route]` classes at `scripts/smoke.mjs:57-180`. | 52 is unreproducible. |
| **B-5.3** | The collection-of-interest removal scope is `/api/interest` + `interest_signups` | **Four removal targets, not one.** Also `clinician_interest` + `GET /api/clinician-photo` (credential photographs, abolished programme) and `GET /api/stats`. And the removal has a **hard ordering constraint the brief does not name**: `build/prerender.js:4487` asserts the interest form markup **exists** and will fail the build if it is not removed in the same commit. | **The removal scope is bigger and more ordered than stated.** |
| **B-5.4** | "one account type… Protocol Studio back end… daily dashboard… 58 build checks… 52 smoke page types" — presented as what exists | All the *feature* claims verified true, and **two are better than the brief implies**: `mergedPlan()` already delivers the owner's "stacking onto one my-protocol page" decision, verified hydrated with 5 and 12 protocols; and building/saving/running need **no account** — only publishing does. | Reduces v1.9 scope materially. |
| **B-5.5** | Owner decision: "A user has ONE main protocol and may start a MAXIMUM OF TWO more" | **Unenforced in both storage layers, and no main/core designation exists anywhere.** Hydrated `/plan` accepted **12** seeded protocols and rendered all 12 with 12 remove buttons and 56 supplement rows. `app.js:5488`/`:5545` `.concat()` with no cap; `POST /api/experiments/start` has no cap; `runningTotal` is computed at `server.js:2069` and **never used as a limit**. | The decision is not implemented. D-14. |

## B-6. Against the repository's OWN documentation and code comments

The most dangerous class in this log: comments that describe a protection the code does not provide.

| # | The repo says | The repo does | Verdict |
|---|---|---|---|
| **B-6.1** | `site/app.js:5179` comment, about `consumer_renderable:false` withholding: *"What changes is that **a plan builder cannot hand one out**."* | **False as shipped.** The filter is applied **only** to `catalogSearch('stack')`. The **default stack pre-ticks them** (`app.js:5356`, `selSupps()` defaults to `allSupp` with every checkbox checked), on 39 of 52 causes. | **A comment asserting a safety property the code does not have.** P0-S3. |
| **B-6.2** | `studio-safety.js:131` implements rule R2 `contraindicated-move`, mirrored by a build gate | **Never armed.** The client never sends `base_pid`/`base_rcid` (`app.js:795`, both call sites `:8855`, `:9422`), so the resolved root cause is always null and `avoid_movements` always empty. Proven by running `POST /api/protocols/check` **both ways**: without the base ids → `{"ok":true,"refusals":[]}`; with them → `{"ok":false,"refusals":[{"rule":"contraindicated-move",…}]}`. | **A gate over an empty set always passes.** The round-6 lesson, recurring. P0-S9. |
| **B-6.3** | `server.js:2942`: *"`assertPrivateRoutesAgree()` in build/parse.js fails the build if the two ever diverge."* | The **check is real** but lives under a different name — part (3) of `assertProfileDisclosesOnlyPublished()` (`build/parse.js:3676-3697`). | Stale comment, P3. **Nearly produced a false P0** — see A-5. |
| **B-6.4** | `server.js:3069-3080` documents the soft-404 defect class: *"soft 404s are actively harmful… they spend crawl budget and dilute the set of pages Google trusts"* | **`clinic`, `exercise` and `fork` fall outside the list that comment's mechanism uses.** `/exercise` and `/fork` are self-canonical, `index,follow`, and hydrate to two words. I verified `/exercise` on production today. | The code documents the defect and then ships it. P0-P2. |
| **B-6.5** | `server.js:236-239` sets `no-cache` on `.js/.css/.json` with the comment *"so the CDN cannot pin a build"* | **Cloudflare overrides it**: `curl -I https://rnawiki.com/data.js` → `cache-control: max-age=14400`, `cf-cache-status: REVALIDATED`. | **A safety correction to `data.js` — every dose, every interaction rule — does not reach a returning reader for up to four hours.** Not fixable in this repository. D-21 / M-cross-cutting. |
| **B-6.6** | `rnawiki/CLAUDE.md`: *"`prestart` is `node build/parse.js && (node build/prerender.js \|\| echo …)` — only prerender.js failures are swallowed."* | **Not true of the current `package.json`.** `prestart` is `node build/parse.js && node build/prerender.js && node scripts/anatomy/copy-assets.mjs && node build/precompress.js` — **no `\|\| echo`**. I read it myself. | **Good news, recorded so nobody re-adds the `\|\| echo` believing it is still there.** `prerender.js` is now a hard deploy gate. |
| **B-6.7** | `rnawiki/CLAUDE.md`: *"`site/` is ephemeral — a fresh container, no volume. Everything under `site/` is regenerated at boot by prestart."* | **Contradicted by the repository.** `git ls-files` tracks 201 files including `site/data.js` (11,874,630 B — the largest tracked blob), `site/app.js`, `site/exercises.js`, `site/foods.js`, and 93 prerendered HTML files under `site/problem/` (41) and `site/fuel/` (52). `.gitignore` covers `site/c/`, `site/target/`, `site/protocol/`, `site/compare/` but **not** these. | **Half the build output is ignored and half is committed.** Materially changes the rollback story (§11.5). |
| **B-6.8** | `server.js:1991-2004` comment: the clinician intake was closed 2026-08-08, *"the `clinician_interest` ROWS ARE DELIBERATELY NOT DROPPED and `GET /api/clinician-photo` stays"*, and the same comment calls it *"the largest data liability on this site"* | Accurate — and still true. Access control holds (`server.js:2007` `if (!isSuper(u)) 403`; **not bypassed, not tested**). | **The code correctly names its own worst liability and the liability is still there.** This is a decision, not a defect — D-5. |
| **B-6.9** | `server.js:426` records the 2026-08-01 vote-forgery fix: *"the key was `clean(extra.voterKey,64)` straight from the POST body… 12 made-up voterKeys"* | The fix stopped the caller **naming** a key. It did **not** bound how many keys one caller can be **issued** — `resolveParticipant()` mints a fresh signed anonymous cookie per cookieless request. **The sybil is still open; only its spelling changed.** | P0-X3. **A fix that moved the defect rather than closing it, with a comment implying closure.** |
| **B-6.10** | `db.js:418` states the research-consent contract | **The check-in gate treats a missing `user_consent` row as permission**, and Google sign-in — the only open signup path — creates no row at all. | **The code states one contract and implements its opposite.** P0-P6. |
| **B-6.11** | `studio-safety.js:257` rebuilds the spec as `{v:1, items, note}` | **Unknown top-level keys are silently dropped.** A posted `{v:1,nodes,edges,items}` returns `ok:true` and stores neither `nodes` nor `edges`. | Harmless today; **P0 the day Plans are added.** A silent-drop path directly under v1.9 §3.10's *"never silently dropped, defaulted, or reinterpreted."* |
| **B-6.12** | `build/parse.js:3634` `assertProfileDisclosesOnlyPublished()` part (2) scans every non-comment line of `server.js`, `site/app.js` and `db.js` for `/avatar\|profile_pic\|headshot\|real_name\|full_name\|display_name/i` and `process.exit(1)`s | **An avatar cannot be added to this codebase today.** Proven by reintroducing the bug in a scratch copy of the tree (product code untouched): adding the two columns v1.9 §5.6 minimally needs stops the Railway deploy. | v1.9 slice 14 is **structurally blocked by the gate that keeps the public profile honest.** D-9 / D-16 territory. |
| **B-6.13** | `site/app.js:1945` `compoundTier()` decides which compounds lose the add button | It decides by a **regex over free prose** (`/death\|fatal\|lethal\|deadly\|do not use/i` over `watch` + `bottom`), **not** by the authored `regulatory_class` / `consumer_renderable` fields — which exist, are authored, and are already trusted by the Studio and by `assertRegulatoryAxes`. | Only **3** compounds are suppressed (DNP, two insulins). **88 of 95 restricted compounds keep the button.** P0-S1. |
| **B-6.14** | `site/app.js:5205-5298` ships two reminder tools promising *"the bot nudges you nightly"* | `server.js:679`: *"(The Telegram notification branch was removed 2026-07-28 with the bot.)"* The renderer at `:5778` emits a **static paragraph** — no input, no time picker, no notification permission. | **The product promises a capability that was deleted three days before this audit.** P0-S16. |

## B-7. Contradiction inside the SOURCE PACK itself

| # | Finding |
|---|---|
| **B-7.1** | The v1.9 prototype's own save copy is **weaker** than the shipped repository's — see A-13. |
| **B-7.2** | The v1.9 prototype's "Tidy map" control is a **byte-identical copy** of "Fit view": both compute the same clamped zoom expression (`vfb.js:149` and `:180`), change only zoom, and report *"Map tidied. The protocol did not change."* Meanwhile node collision is measured at **all four required widths** (overlap 181×14 px @1024, 238×18 @1440, 362×26 @1024/200%), because row position is a hardcoded data constant (`vfb.js:3-5`, y:0/124/248) while row height is content-derived (108 px against a 124 px pitch). **Layout coordinates are protocol data**, violating §6.2's *"layout coordinates are presentation metadata."* |
| **B-7.3** | The v1.9 prototype has **no pan**: 110 px of the map is permanently unreachable at max zoom (map left −55 / right 1495 against a 0/1440 stage, `overflow-x: hidden`, synthetic drag moves it 0 px). Handler inventory in the entire file: `keydown` ×1, `wheel` 0, `pointerdown` 0, `mousedown` 0. A 20-Plan route renders 8,350 px into a 1,440 px hidden-overflow stage. **The layout fails two orders of magnitude before the 500-node renderer budget is reached** — so 500/2,000-node performance is not testable in this prototype. (Extrapolation labelled INFERENCE in the source audit; the measurements are verified.) |
| **B-7.4** | `RNAwiki_Desktop_Prototype_Index_v1_9.html` and the eight prototypes render at font sizes their own governing audit forbids — see B-2.1. |

---

## Appendix — self-retractions preserved

Recorded because a retraction is evidence, and because each of these would otherwise be
re-discovered as a false positive.

1. **Assessment bypass, P0 → P1.** Refuted by hydrated measurement; the destination page's first h2
   is the red-flag section and reassess content exists 41/41. (A-9.)
2. **Prototype List-view mutation parity.** First read: List view lacks parity. Refuted — List view
   yields the same workbench actions and the same Plan-settings modal; Plan items being
   non-focusable spans is **spec-conformant** per §3.5. Recorded as a non-finding.
3. **`assertPrivateRoutesAgree()` does not exist.** Refuted by reading further. (A-5.)
4. **`/studio` "Clear" as a data-loss P0.** Refuted by intercepting the dialog. (A-8.)
5. **An earlier reading-level pass scored `/browse` at Flesch–Kincaid 75** because it is a link index
   with 3 sentences. That pass was **discarded** and the prose-only sample substituted; the discard
   is noted in the source file so the number is not re-used.
6. **Contrast failure count.** The design specialist **declined** to convert a 79% coverage hole into
   a failure count, because a static check cannot resolve composited backgrounds. Preserved as
   could-not-check. (A-12.)
