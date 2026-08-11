# v1.9 WAVE A — Compound corpus audit (pharmacology / evidence)

**Scope:** the 171-compound corpus against v1.9 §8 (Supplement and drug wiki) and §3.10 (Supplement
professional action fields), plus the earlier PRD's safety/jurisdiction contract.
**Method:** `site/data.js` loaded in a `vm` sandbox (11.8 MB — never read whole, per AGENT_RULES trap 2);
all UI claims measured in **headless Chrome via the W0 harness** (`/Users/admin/.claude/jobs/b8afc277/tmp/qa/probe.mjs`),
never curl. Raw measurements: `/Users/admin/.claude/jobs/b8afc277/tmp/qa/out/wA/`.
**Read-only.** No product code was changed.

Evidence labels: **OBSERVED** = measured this session · **INFERENCE** = reasoned from observed ·
**PRODUCT DECISION** = needs Felix · **LEGAL-CLINICAL** = needs a qualified human.

---

## 0. Corpus shape (OBSERVED — `site/data.js` meta.counts + key census)

`out/wA/compound_keys.json`, n = 171.

| v1.9 §8.2 / §3.10 required field | Repo field | Coverage |
|---|---|---|
| exact ingredient / formulation / route | `bio.form.buy` / `.avoid` (free text) | **87 / 171** |
| jurisdiction | **does not exist** | **0 / 171** |
| outcome selector | **does not exist** | 0 |
| outcome-specific bottom line | `bottom` (whole-compound, free text) | 171 (wrong granularity) |
| absolute result + comparison context | `evi.effect` (free text) | 157 / 171 |
| certainty | `stars` (**whole-compound**), `evi.howStrong` | 171 / 157 |
| population, comparator, duration, limitations | `evi.whoBenefits`, `evi.caveats` (free text) | 157 / 171 |
| direct selected evidence source | `evi.trials[].pmid` | see §3 |
| mechanism | `mechanism` 171, `mechSteps` 157, `tech` 157 | good |
| targets / pathways | `targets` 171, `pathwayIds` 171 | good |
| **kinetics** | `pk` | **82 / 171 (48%)** |
| interaction coverage state | `pairFlags` + `site/ixn-engine.js` | see §4 |
| risk tier | `regulatory_class` (5 values) + derived `compoundTier()` | 171 |
| review / version metadata | **does not exist** on compound records | 0 |

`regulatory_class` distribution: `supplement 75 · prescription 39 · unapproved 34 · controlled 22 · pharmacy 1`.

---

## 1. P0 — The /fuel stack generator recommends prescription, controlled and unapproved
## compounds by whole-compound star rank, including six pairings the repo's own verified
## claim records say are wrong

**Status: VERIFIED (hydrated, 1440×900). This is the highest-severity finding in my scope.**

### 1.1 The mechanism (OBSERVED — `site/app.js:4656-4666`)

```js
// --- STACK: resolve hero compounds by name, backfill from goals/pathways, rank by evidence ---
(rc.compounds || []).forEach(name => add(findCpt(name)));
const pool = D.compounds.filter(c =>
  (rc.goal_ids || []).some(g => (c.goalIds || []).includes(g)) ||
  (rc.pathway_ids || []).some(p => (c.pathwayIds || []).includes(p)));
pool.sort((a, b) => b.stars - a.stars);      // <-- WHOLE-COMPOUND STAR RANK
pool.forEach(add);
const stack = picked.slice(0, 6);
```

The backfill pool is every compound sharing **any** goal id or **any** pathway id with the root
cause, sorted by `c.stars` — the whole-compound human-evidence star — and the top 6 are rendered as
the protocol's supplement stack. There is:

- **no `regulatory_class` filter** (a 🔵/⚫/🔴 compound ranks exactly like a 🟡 one);
- **no claims-spine check** (`D.claims` is never consulted);
- **no interaction check** at render time;
- **no per-outcome evidence check** — `stars` is a whole-compound reputation number, which is what
  v1.9 §8.1 names as the exact failure mode ("confusing mechanism, popularity, or whole-compound
  reputation with evidence or suitability") and §8.4 prohibits outright.

`renderFuelStack()` (`site/app.js:3352`) prints each with a `+ Add` button.

### 1.2 Blast radius (OBSERVED — replayed the algorithm over all 52 root causes in `d.graph.problems`)

**39 of 52 protocols** produce a stack containing at least one **prescription, controlled or
unapproved** compound. Full list in this file's appendix A. Examples:

| /fuel route | Rx/controlled/unapproved compound(s) offered with `+ Add` |
|---|---|
| `low-testosterone/primary-hypogonadism` | Testosterone (TRT) [controlled], HCG [Rx], Clomiphene [Rx], Finasteride [Rx], **Insulin (prescribed) [Rx]** |
| `adhd-focus/dopamine-deficit` | Methylphenidate (Ritalin) [controlled], Modafinil [controlled] |
| `gut-health/dysbiosis` | Statins [Rx] |
| `endurance-plateau/aerobic-base` | Metformin [Rx] |
| `insomnia/circadian-misalign` | Melatonin [Rx in SG] |
| `longevity/mtor-overactivation` | Rapamycin [Rx], Metformin [Rx] |

`Insulin (prescribed)` surfacing in a testosterone protocol is the most dangerous single row: insulin
is the compound in this corpus with the shortest path from a dosing error to death.

### 1.3 Six exact contradictions of the repo's own verified claim records (OBSERVED — hydrated)

`data/claims.json` → `D.claims` holds 14 reviewed compound×indication records. Six of them describe
**the exact pairing the /fuel generator recommends**, and all six carry `renders:false`, so the reader
never sees the refutation. Verified by loading each route in headless Chrome
(`out/wA/wA_collide.json`, all `status:200`, all `refutationShown:false`):

| Route (hydrated) | Rendered string | The repo's own claim record |
|---|---|---|
| `/fuel/knee-pain/knee-oa` | `Statins (Atorvastatin/Rosuvastatin) ★★★★★ + Add` | `statins__knee_oa` · **refutes** · grade B · PMID 33844449 — *"Randomised trial evidence does not support statins for knee osteoarthritis pain or progression."* |
| `/fuel/acne/sebum-insulin` | `Testosterone (TRT) ★★★★★ + Add` | `testosterone__acne` · **inverts** · grade A · PMID 39589032 — *"Androgens including testosterone INCREASE sebum and acne; testosterone is not a treatment for acne."* |
| `/fuel/chronic-fatigue/iron-anemia` | `Metformin ★★★★★ + Add` | `metformin__iron_deficiency_anaemia` · **inverts** · grade A — *"Metformin LOWERS vitamin B12 and is associated with anaemia; it does not treat iron-deficiency anaemia."* |
| `/fuel/knee-pain/patellar-tendinopathy` | `BPC-157 ★ + Add` | `bpc157__tendon_healing` · **not_established** — *"There are no completed human trials of BPC-157 for tendon or soft-tissue healing; the evidence is animal only."* |
| `/fuel/low-libido/vascular-hormonal-libido` | `Yohimbine ★★★ + Add` | `yohimbine__low_libido` · **insufficient** · grade C — *"…studied for erectile dysfunction, not for sexual desire… the evidence does not transfer."* |
| `/fuel/fat-loss-plateau/metabolic-adaptation` | `Yohimbine ★★★ + Add` | `yohimbine__fat_loss` · **insufficient** · grade C — *"…a single small trial; it is not a basis for recommending it."* |

The gate in `build/verify_claims.js:44-49` and `build/parse.js:486-490` is correct and working — it
blocks `renders:true` on an inverting/refuting claim. **The defect is that the gate protects only the
claim renderer; nothing connects the claims spine to the stack generator.** A gate over a set the
defect does not live in always passes (the round-6 lesson, verbatim).

### 1.4 The `/protocol` pages do NOT have this defect (OBSERVED — measured, negative control)

`/protocol/knee-pain/knee-oa` (10,390 words hydrated): `Statins` **not found**.
`/protocol/acne/sebum-insulin` (6,858 words hydrated): `Testosterone` **not found**.

So the curated protocol surface is already clean; the star-ranked backfill is a **/fuel-only**
regression. That scopes the fix tightly and makes it cheap.

### 1.5 Regulatory exposure (LEGAL-CLINICAL)

Constraint 6 in AGENT_RULES: Singapore Medicines Act 1975 s.51 — do not advertise a prescription-only
medicine to the public. A page that names Semaglutide / Rapamycin / Testosterone / Methylphenidate as
the answer to a named condition and offers a `+ Add` control to an **anonymous, signed-out reader**
is, at minimum, arguable advertising. This is not my call to make. **Needs Felix + a regulatory read.**

### 1.6 The change spec (for the integrator — DO NOT APPLY in Wave A)

`site/app.js:4661-4665`, inside `generateProtocol()`:
1. Filter the backfill pool to `c.regulatory_class === 'supplement'` before sorting. Hero compounds
   named explicitly in `rc.compounds` keep their curated place (that is authored, reviewed intent).
2. Drop any compound for which `D.claims` holds a record with the same compound and a matching
   indication whose `direction` is `inverts | refutes | insufficient | not_established`.
3. Add a build gate `assertFuelStackSafety()` in `build/parse.js` that replays the same algorithm over
   all 52 root causes and fails on any Rx/controlled/unapproved member or any claims-spine collision.
   **Prove it by reverting step 1 and watching it fail** (AGENT_RULES: a gate that has never failed is
   unproven).

---

## 2. P0 — The default view has no jurisdiction and silently inherits Singapore's access category

**v1.9 §8.2:** *"Jurisdiction defaults to **Global / unspecified** until the viewer deliberately
chooses another view. That default cannot inherit a country-specific approval, access category, dose,
claim, or interaction conclusion."*

### 2.1 What the repo does today (OBSERVED)

- The string `Global / unspecified` **does not exist anywhere in the repository**
  (`grep -rao "jurisdiction"` over all `.js/.json/.md/.html/.css` outside `node_modules` returns 11
  hits, all prose inside compound copy — `site/data.js` ×5, `data/bio_learn.json` ×3,
  `data/compound_learn.json` ×2, and 3 prerendered `site/c/*.html` files).
- There is **no jurisdiction field, no jurisdiction selector, and no jurisdiction label** on any
  compound record or any compound page. Hydrated probe of 5 compound pages at 1440×900
  (`out/wA/wA_cpage.json`): `hasJurisdiction: false` and `globalUnspec: false` on **5 of 5**.
- What *does* exist is **`sg_hsa_status`** — a Singapore Health Sciences Authority access category —
  present on **170 of 171** compounds, and **it is what the default view renders**, via
  `supply.why` / `supply.tag` (built in `build/parse.js`, consumed by the page header).

### 2.2 The proof case — Melatonin (OBSERVED, hydrated `/c/melatonin`)

Record: `sg_hsa_status = "Prescription-only medicine in Singapore. Widely sold over the counter in the
US and elsewhere, which is a common source of confusion for Singapore readers."`

Hydrated first viewport, verbatim:

> `Melatonin ★★★★★ 5 of 5 🔵 Prescription-only medicine ℞ Prescription only — needs a doctor`

The reader is shown an unqualified, jurisdiction-free `Prescription-only medicine` badge. The
record's own text says the opposite is true in most of the world. **The default view has inherited a
country-specific access category and stripped the country.** That is the §8.2 prohibition, exactly,
and the corpus itself contains the sentence that proves it.

This is not one compound: **all 39 `prescription` + 22 `controlled` + 1 `pharmacy` records** derive
their badge from `sg_hsa_status`, so **62 of 171 compounds** carry an SG access category presented as
a global fact.

### 2.3 The mirror-image defect — the 🟢 badge is US FDA

`D.approvalLabels['🟢'] = "FDA Approved"`, carried by **20 compounds**. AGENT_RULES constraint 6
already says a 🟢 badge means "approved by a regulator", not "buy off a shelf" — but the label itself
names *one* country's regulator while the page carries no jurisdiction. A reader in the UK, EU or
Australia is told the FDA's answer with no signal that it is the FDA's answer.

Cost is a third channel: **37 of 171** compounds state cost in **S$** (`c.cost`), again with no
jurisdiction label and no price date.

### 2.4 Severity

P0-safety, not merely cosmetic: a reader outside Singapore who sees "🔵 Prescription-only medicine" on
melatonin may not buy something legal and helpful; a Singapore reader who sees "🟢 FDA Approved" on a
compound that is POM in Singapore may try to buy something they cannot legally obtain, or obtain it
grey-market. Both directions of error are live.

### 2.5 Recommended shape (PRODUCT DECISION)

Add `jurisdiction: "Global / unspecified"` as the compound-record default; move `sg_hsa_status` and
the FDA label behind an explicit `jurisdiction === 'SG' | 'US'` view; and gate it in `build/parse.js`
with an assertion that no default-view string carries a country-specific access category. The
per-jurisdiction copy already exists for SG — the work is wiring and gating, not authoring.

---

## 3. P1 — Evidence granularity and citation reach

### 3.1 Whole-compound stars vs per-outcome evidence — an unresolved spec conflict

**v1.9 §8.4, verbatim:** *"Whole-compound stars and 'content migration' UI are prohibited."*
**AGENT_RULES §DO NOT IMPLEMENT:** *"Do not remove the evidence star or call it meaningless."*
**`v19_wiki_blocks_audit.md:904`:** whole-compound `stars` → *"no direct destination … replace with
claim-level certainty; keep only in migration audit history."*

These three cannot all be satisfied. **CONTRADICTION — needs Felix.** My reading of the evidence is
that the reconciliation is *not* deletion: the star is the only accessible evidence signal on the
page today (W5a shipped `.pos-stars` accessible names and "Not yet rated"), and deleting it would
regress a fixed a11y defect. The honest resolution is to **keep the star and bind it to an outcome** —
i.e. build the §8.2 outcome selector, and let each outcome carry its own certainty. Then §8.4 is
satisfied in substance (no *whole-compound* star drives a decision) without destroying the signal.

Cost note: §1.1 shows the whole-compound star is not merely displayed, it is the **ranking key** for
the /fuel stack. Fixing §1 removes the star's decision authority even before the outcome selector
lands, which is why §1 is the higher-value change.

### 3.2 The outcome selector does not exist (OBSERVED — hydrated)

Probing 5 compound pages for `select`, `[role=tablist]`, `[role=radiogroup]`: the only match is
`.ch-steps`, the **7-chapter learning journey** (`1 🌱 Start here / 2 ⚙️ How it works / 3 💊 How it's
used / 4 🛡️ Using it safely / 5 📊 The evidence / 6 🔬 Deep dive / 7 🎓 Prove it`). That is a
pedagogical spine, not an outcome selector. So §8.2's chain —
*"Does this help the outcome I care about?" → outcome-specific bottom line → absolute result* — has no
implementation. `c.goals` is a free-text list (`["Build muscle","Strength","Power",…]`) with no
per-goal evidence, effect size, or certainty attached.

**INFERENCE:** the corpus already contains most of the raw material (`evi.effect`, `evi.whoBenefits`,
`evi.caveats`, `evi.trials`) — it is written once per compound rather than once per outcome. Splitting
157 `evi` blocks by outcome is real authoring work, not wiring. Scope it honestly.

### 3.3 Citation coverage (OBSERVED — corrects a widely-quoted number)

- `evi.trials`: **489 entries** across 157 compounds; **344 carry a PMID**; **336 carry
  `pmid_verified_by`** (all `"felix"`, dated 2026-07-28 → 2026-07-30).
- **13 compounds** have trial entries but **no PMID on any of them**: Orforglipron, Trenbolone,
  Hexarelin/GHRP-2/GHRP-6, HGH (Somatropin), TB-500, Dihexa, 5-HTP/L-Tryptophan, PT-141, Cordyceps,
  Insulin (anabolic misuse), Medicinal Mushrooms, **SSRIs (Sertraline, Escitalopram)**, Prebiotics.
- **17 compounds** have no trial entries at all (14 are `(brief)` bundle stubs; the three that are
  not are **Boldenone (Equipoise)**, **IGF-1 LR3**, **T3/T4 Thyroid**).
- **Total with zero PMID-backed evidence: 30 of 171.** This is consistent with W0's errata figure of
  29 (one record has drifted since) and confirms the brief's "77 compounds have zero citations" is
  wrong — 77 is the interaction-tag number carried across.

**The sharpest sub-finding:** `SSRIs (Sertraline, Escitalopram)` is a prescription antidepressant
class with **zero PMID-backed evidence entries**, and it is the compound the /fuel generator puts on
`low-mood/monoamine-inflammation`. A prescription psychotropic recommended for a mood condition with
no verifiable source. Same for `T3/T4 Thyroid` on `thyroid/subclinical-hypothyroid`.

### 3.4 `refs` is an identity register, not an evidence register

582 `refs` across the corpus. Host distribution: `ncbi.nlm.nih.gov 341` (overwhelmingly `/gene/`),
`pubchem 177`, `examine.com 55`, `uniprot 5`, `pubmed 2`, `pmc 2`. **170 of 171 compounds have no
primary-literature link in `refs`.** That is fine — the evidence lives in `evi.trials` — but §8.2's
"direct selected evidence source" belongs in the **first viewport**, and `refs` is what the identity
header renders. Worth stating explicitly so nobody re-derives "the corpus has no citations".

### 3.5 Kinetics gap (OBSERVED)

§8.3 requires, inside *How it works*: "targets, transporters/receptors/enzymes, pathway, **kinetics**,
variability, and exact sources". `pk` is present on **82 of 171 (48%)**. `bio.form` on **87 of 171**.
So roughly half the corpus cannot satisfy §8.3's professional-disclosure block.

---

## 4. P1 — Interaction coverage: the engine is honest, the corpus is thin

### 4.1 The engine is correct (OBSERVED — read + executed)

`site/ixn-engine.js` computes `RULE_TAGS` as only the tags of rules that **can actually fire against
this corpus**, and `covered(list)` returns only compounds some firable rule can reach. Everything else
renders the ❔ "absence of data, never a clearance" state. The W3/W3.5/W4.5 comments at lines 44-56 and
71-84 document three real defects that were fixed here (unfirable `double_5ar` counting as coverage;
name-substring tag fabrication; duplicate pages counted as two drugs). `assertOneInteractionMatcher()`
and `assertInteractionCoverage()` gate it at build time. **This layer is in good shape — I could not
break it.**

### 4.2 The exact current numbers (OBSERVED — engine executed in a `vm` sandbox)

`IXN.stamp()` → `compounds:171 rules:25 dupes:6 firable-tags:26`

- **102 of 171 covered · 69 of 171 uncovered.**
  (The brief's "77 unreachable" is stale — the corpus/ruleset moved. **Do not quote 77.**)
- **35 of the 69 uncovered are prescription, controlled or unapproved**, including HGH (Somatropin),
  EPO, Rapamycin-adjacent peptides, Estradiol/Menopausal HRT, PCSK9 inhibitors, Tretinoin, Lithium,
  BPC-157, MK-677 and Finasteride/Dutasteride.
- `pairFlags`: 269 pairs (`danger 194 · timing 43 · blunt 32`) reaching **91 of 171** compounds;
  **80 compounds appear in no pair at all**.
- `pairFlags` entries carry only `{tier, title}` — **no mechanism, no source, no severity grading**.

### 4.3 The v1.9 gap (OBSERVED — hydrated)

§8.2's decision rail requires *"interaction coverage state: known concern, covered/no authored
concern, or unknown"* on the **compound page**. The honest three-state render exists on `/stack`; it
does **not** appear on the compound detail page. Hydrated probe of `/c/creatine-monohydrate`,
`/c/semaglutide`, `/c/bpc-157`, `/c/testosterone-trt`, `/c/melatonin`: no interaction-coverage string
on any of the five. So a reader who never opens the stack builder never learns that the site cannot
check 69 of its 171 compounds.

**Cheap fix, high value:** the arithmetic already exists in one place (`IXN.covered`). Surfacing the
❔ state in the compound decision rail is wiring, not authoring, and it is the single change that
most directly serves §8.2.

---

## 5. P1 — Risk-tier behaviour does not match §8.4

**§8.4:** *"Prescription/controlled: current use or questions for professional only unless a governed
prescribed-plan workflow exists. Investigational: no self-directed action, sourcing, dose, marketplace,
reward, or optimization. Unknown product/interaction: unknown, not safe; professional questions /
current-use record only."*

### 5.1 What the code does (OBSERVED — `site/app.js:1945-1959, 2356`)

`compoundTier()` returns `brief | DANGER | RESEARCH | RX | OTC`. Distribution over the corpus:
`OTC 75 · RESEARCH 56 · RX 24 · DANGER 3 · brief 13`.

Line 2356 is the only place the tier gates the CTA:

```js
${compoundTier(c) === 'DANGER'
  ? '<span class="stack-btn-lg danger-chip" title="Not for human use">⚠️ Not for use</span>'
  : `<button id="stack-btn" ...>+ Add to stack</button>`}
```

**Only `DANGER` (3 compounds) suppresses the add action.** RX (24), RESEARCH (56) and `brief` (13) all
render `+ Add to stack` as the dominant CTA. **168 of 171 compound pages present a self-directed add
action.**

### 5.2 What §8.4 requires and the repo has none of (OBSERVED — hydrated)

- `Add to Considering` — **string does not exist** in the repo. Probed 5 pages: `addConsidering:false`
  on 5 of 5.
- `Prepare pharmacist questions` — **no such route**. `pharmQ` matched only on `/c/melatonin`, and
  that match is prose inside the body copy, not a CTA.
- `Current Use` record — **does not exist**.
- "Review expired: remove action controls automatically" — **no review metadata exists on any
  compound record**, so this state is unimplementable today.

### 5.3 The tier logic is also derived, not authored

`compoundTier()` re-derives risk from `approvalLabels` strings plus a regex over `watch`/`bottom`
prose (`/death|fatal|lethal|deadly|do not use/i`). A compound whose warning copy is reworded without
those six words silently drops out of `DANGER`. Meanwhile `regulatory_class` **is** an authored field
with a build-time gate (`build/regulatory_class.js`). **INFERENCE:** `compoundTier` should read
`regulatory_class`, and the prose regex should become an authored `danger: true` flag. Two sources of
truth for risk tier is exactly the drift pattern the codebase has been burned by before.

---

## 6. Where I disagree with the existing v1.9 specialist audits

| Their position | My measurement | Verdict |
|---|---|---|
| `v19_wiki_blocks_audit.md:904` — whole-compound `stars` has "no direct destination", keep only in migration history | The star is the **ranking key** of `generateProtocol()` (`app.js:4664`) and the only accessible evidence signal shipped after W5a | **Challenge.** Deleting it regresses a fixed a11y defect and does not fix the actual harm. Bind it to an outcome; strip its *decision authority* first (§1.6). |
| `v19_wiki_blocks_audit.md:107-111` restates §8 requirements as a to-build list | It never measures the current default-jurisdiction inheritance, never names `sg_hsa_status`, never measures the /fuel generator | **Complement, not contradiction.** That audit is a specification; this one is the measured baseline it lacks. |
| `v19_wiki_blocks_audit.md:851-863` — a commercial/marketplace component with "seller, jurisdiction, relationship/commission" | AGENT_RULES constraint 1: "Free. No paywall, **no affiliate links**, no brand recommendations" | **CONTRADICTION — needs Felix.** See `tool_action_audit.md` §5. |
| Brief: "77 compounds have zero citations" | **30** have zero PMID-backed evidence (13 no-PMID + 17 no-trials) | **Refuted**, consistent with W0 errata (29). |
| Brief: "~77 unreachable interaction tags" | **69 of 171** uncovered as of this build (`firable-tags:26`) | **Stale number — do not quote 77.** |

---

## 7. Findings table

| # | Finding | Severity | Status | Evidence |
|---|---|---|---|---|
| C1 | /fuel stack generator ranks by whole-compound stars, surfacing Rx/controlled/unapproved compounds in 39/52 protocols | **P0 safety** | verified (hydrated) | `app.js:4661-4665`; `out/wA/wA_collide.json` |
| C2 | Six of those pairings contradict the repo's own verified claim records, all `renders:false` | **P0 safety** | verified (hydrated) | §1.3 table; `data/claims.json` |
| C3 | No jurisdiction field; default view inherits SG access category on 62/171 and US FDA label on 20/171 | **P0 safety** | verified (hydrated) | §2; `out/wA/wA_cpage.json` |
| C4 | `+ Add to stack` on 168/171 compound pages incl. 24 RX and 56 RESEARCH tier | **P0 legal** | verified | `app.js:2356` |
| C5 | Compound page never shows interaction coverage state; 69/171 uncheckable, 35 of them Rx/controlled | P1 | verified | §4; `ixn-engine.js` |
| C6 | No outcome selector; evidence is whole-compound only | P1 | verified | §3.2 |
| C7 | 30/171 with zero PMID-backed evidence, incl. SSRIs and T3/T4 which the generator recommends | P1 | verified | §3.3 |
| C8 | `pk` (kinetics) on 82/171; `bio.form` on 87/171 | P2 | verified | §3.5 |
| C9 | `compoundTier` derives risk from prose regex, not the authored `regulatory_class` | P2 | verified | `app.js:1945-1951` |
| C10 | No review/version metadata on any compound record → §8.4 "review expired" unimplementable | P2 | verified | key census |
| C11 | Whole-compound stars: §8.4 prohibits, AGENT_RULES forbids removing | — | **contradiction** | §3.1 |

---

## Appendix A — all 39 protocols whose auto-generated /fuel stack contains a
## prescription, controlled or unapproved compound

Replayed `generateProtocol()`'s stack selection over `d.graph.problems` (52 problem/root-cause pairs).
Six spot-checked hydrated; the rest are **INFERENCE from the identical algorithm**.

```
knee-pain/patellofemoral-pain          Statins [Rx]
knee-pain/patellar-tendinopathy        BPC-157 [unapproved]
knee-pain/knee-oa                      Statins [Rx]
low-back-pain/poor-core-stability      Clomiphene [Rx], MK-677 [unapproved]
neck-shoulder/upper-cross              Statins [Rx], Clomiphene [Rx]
neck-shoulder/rotator-cuff-impinge     BPC-157 [unapproved], Statins [Rx]
elbow-wrist/lateral-epicondylopathy    BPC-157 [unapproved], TB-500 [unapproved]
ankle-foot/achilles-tendinopathy       Statins [Rx]
insulin-resistance/poor-glucose-disposal  Metformin [Rx], Acarbose [Rx]
insulin-resistance/visceral-adiposity  Semaglutide [Rx], Tirzepatide [Rx], Testosterone [controlled]
visceral-fat/energy-surplus            Semaglutide [Rx], Tirzepatide [Rx], Testosterone [controlled]
visceral-fat/cortisol-fat              Semaglutide [Rx]
chronic-fatigue/iron-anemia            Metformin [Rx], Statins [Rx]
cravings/glycemic-swings               Semaglutide [Rx], Tirzepatide [Rx], Testosterone [controlled]
thyroid/subclinical-hypothyroid        T3 / T4 Thyroid [Rx]
blood-pressure/endothelial-sodium      Semaglutide [Rx], PDE-5 Inhibitors [Rx]
cholesterol/ldl-fiber                  Red Yeast Rice · Ezetimibe [Rx], Statins [Rx], Semaglutide [Rx]
brain-fog/neuroinflammation            Metformin [Rx]
low-mood/monoamine-inflammation        SSRIs [Rx]
adhd-focus/dopamine-deficit            Methylphenidate [controlled], Modafinil [controlled]
burnout/hpa-dysregulation              Testosterone [controlled]
insomnia/circadian-misalign            Melatonin [Rx in SG]
sleep-maintenance/cortisol-glucose-night  DSIP [unapproved], Melatonin [Rx in SG]
shift-work/circadian-desync            Melatonin [Rx in SG], Semaglutide [Rx], Tirzepatide [Rx]
low-testosterone/primary-hypogonadism  Testosterone [controlled], HCG [Rx], Clomiphene [Rx],
                                       Finasteride [Rx], Insulin (prescribed) [Rx]
menopause/estrogen-decline             Estradiol / Menopausal HRT [Rx], Testosterone [controlled]
low-libido/vascular-hormonal-libido    PDE-5 Inhibitors [Rx], PT-141 [Rx], Yohimbine [unapproved]
bone-density/low-bmd                   Testosterone [controlled]
pcos/insulin-androgen                  Metformin [Rx], Semaglutide [Rx]
skin-aging/collagen-loss-glycation     Tretinoin / Retinoids [Rx], GHK-Cu [unapproved]
skin-aging/uv-oxidative                Finasteride / Dutasteride [Rx]
acne/sebum-insulin                     Tretinoin / Retinoids [Rx], Testosterone [controlled]
hair-loss/dht-sensitivity              Finasteride / Dutasteride [Rx], Testosterone [controlled]
hair-loss/nutrient-deficiency-hair     Finasteride / Dutasteride [Rx], Tretinoin / Retinoids [Rx]
longevity/cellular-senescence          Rapamycin (Sirolimus) [Rx]
longevity/mtor-overactivation          Rapamycin (Sirolimus) [Rx], Metformin [Rx]
gut-health/dysbiosis                   Statins [Rx]
fat-loss-plateau/metabolic-adaptation  Semaglutide [Rx], Yohimbine [unapproved], Tirzepatide [Rx],
                                       Testosterone [controlled]
endurance-plateau/aerobic-base         Metformin [Rx]
```

## Appendix B — reproduction

```bash
# corpus census
cd "/Users/admin/ClaudeRepo/Claude Projects/rnawiki"
node -e "const fs=require('fs');const vm=require('vm');const sb={window:{}};sb.self=sb.window;
vm.createContext(sb);['site/data.js','site/interactions.js','site/ixn-engine.js']
.forEach(f=>vm.runInContext(fs.readFileSync(f,'utf8'),sb));
const D=sb.window.RNAWIKI_DATA;const IXN=sb.window.RNAWIKI_IXN_ENGINE.init(D,sb.window.RNAWIKI_INTERACTIONS);
console.log(IXN.stamp(), IXN.covered(D.compounds).length, D.compounds.length);"

# hydrated collision proof
cd /Users/admin/.claude/jobs/b8afc277/tmp/qa && node out/wA/wA_collide.mjs
```
