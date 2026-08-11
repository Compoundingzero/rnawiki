# v1.9 WAVE A — Nutrition database audit

**Scope:** `site/foods.js` (656 foods), the nutrient-target model, the fuel tracker, and the
contribution/moderation path, against v1.9 §3.10 (Nutrition action fields), §9 (public/private),
§11 (required states) and §12 (measurement privacy).
**Method:** `site/foods.js` and `site/data.js` loaded in a `vm` sandbox; every UI claim measured in
**headless Chrome** (W0 harness) at 1440×900. Raw output: `/Users/admin/.claude/jobs/b8afc277/tmp/qa/out/wA/wA_fuel.json`.
**Read-only.** No product code was changed.

---

## 0. What v1.9 §3.10 asks for, and what exists

> **Nutrition:** target or limit; food-first or nutrient target; unit and period; default tracked
> fields: calories, protein, carbohydrate, fat; optional macro, micronutrient, vitamin, mineral,
> food, fiber, omega-3, hydration, or custom reviewed field; **source, privacy, contribution, and
> version state.**

| Requirement | Repo | Verdict |
|---|---|---|
| target **or limit** | `nutrient_targets[k].type` ∈ `{goal:156, limit:33}` | ✅ present |
| unit | `.unit` on every target | ✅ |
| period | **absent** — every target is implicitly per-day, never stated | ❌ |
| default tracked: kcal/protein/carbs/fat | `MACRO_KEYS` (`app.js:8206`) | ✅ |
| micronutrient / vitamin / mineral | 11 `MICRO_KEYS`, but see §2 | ⚠️ nominal only |
| hydration | **not a nutrient field** (it is a separate counter tool) | ⚠️ |
| **source** | **0 of 189 targets and 0 of 656 foods carry a source, citation or retrieval date** | ❌ |
| privacy | fuel log is `localStorage` only — good — but logging is **account-gated** | ❌ (§4) |
| contribution | `user_foods` table + `openAddFoodModal()` | ⚠️ ships unmoderated (§5) |
| **version state** | **no version column, no history, no effective date anywhere** | ❌ |

---

## 1. Corpus shape (OBSERVED)

`site/foods.js` → `window.RNAWIKI_FOODS`:

```
generated_by : scripts/fetch-foods.js
sources      : { seed: 154, openfoodfacts: 331 }        <-- header disagrees with the data
note         : "null nutrient = not reported (not zero). Hawker macros ~ HPB composition;
                whole-food micros ~ standard tables."
nutrient_keys: 17
foods        : 656
```

**Measured `source` distribution over the 656 records: `seed 198 · openfoodfacts 331 · intl-2026-07 127`.**
The `sources` header says 154 seed and omits `intl-2026-07` entirely — so the file's own provenance
header is wrong about 171 of its records. Minor, but it is the field a reviewer would trust first.
`sg_local: true` on 198.

Per-record fields: 26 keys, of which `gi` (glycemic index) is present on 99, `region` on 127,
`place` on 29. **No `source_url`, no `retrieved_at`, no `version`, no `verified_by` on any record.**

---

## 2. P0 — 38 nutrient targets across 31 protocols track a nutrient the food database
## cannot measure

**Status: VERIFIED (data census + hydrated render).**

The fuel tracker sets 189 nutrient targets across the 52 protocols and renders a progress bar for
each. Whether a bar can ever fill depends on how many of the 656 foods carry that nutrient. Measured:

| nutrient | # targets using it | foods with a non-null value (of 656) | % |
|---|---:|---:|---:|
| protein_g | 30 | 655 | 99.8% |
| kcal | 7 | 650 | 99.1% |
| sugar_g | 32 | 563 | 85.8% |
| sodium_mg | 2 | 520 | 79.3% |
| fiber_g | 22 | 492 | 75.0% |
| calcium_mg | 3 | 148 | 22.6% |
| iron_mg | 5 | 138 | 21.0% |
| magnesium_mg | **26** | 109 | **16.6%** |
| potassium_mg | 1 | 94 | 14.3% |
| vitamin_c_mg | **13** | 81 | **12.3%** |
| zinc_mg | **10** | 75 | **11.4%** |
| **vitamin_d_iu** | **7** | **31** | **4.7%** |
| **omega3_mg** | **18** | **16** | **2.4%** |
| **choline_mg** | **4** | **10** | **1.5%** |
| **glycine_g** | **9** | **8** | **1.2%** |

**38 of 189 targets (20%) point at a nutrient present on under 10% of the food database, affecting
31 of 52 protocols.**

### 2.1 The rendered consequence (OBSERVED — hydrated `/fuel/knee-pain/patellofemoral-pain`, 1440×900)

```
Protein     0 / 100 g     substrate for tendon & cartilage repair
Omega-3     0 / 2000 mg   EPA/DHA lower inflammatory eicosanoids around the joint
Vitamin C   0 / 300 mg    cofactor for collagen crosslinking
Glycine     0 / 10 g      most abundant amino acid in collagen
```

Three of those four bars are effectively unfillable: omega-3 exists on 16 foods, glycine on 8,
vitamin C on 81. A user who logs a genuinely omega-3-rich meal will very likely see the bar stay at
0 — because the record has `omega3_mg: null`, and the file's own note says **null means "not
reported", not zero**.

### 2.2 The `null`-means-zero problem

`foods.js` is explicit: *"null nutrient = not reported (not zero)"*. The tracker renders a summed
progress bar. Summation necessarily treats `null` as `0`. So the honest data model and the rendering
model disagree, and the disagreement always resolves in the direction of **under-reporting the
user's intake** — which, for `type:'goal'` targets, tells a user to eat more of something they may
already be getting enough of. For the 33 `type:'limit'` targets the error runs the other way and is
worse: **sodium is null on 136 of 656 foods**, so a sodium *limit* bar under-counts, and the user is
told they are under a limit they may have exceeded.

**v1.9 §11:** *"No state may silently substitute approximate data or imply 'safe'."* This is exactly
that. The fix is small: a bar whose nutrient is missing from ≥1 logged item must render a
"partially measured — n items don't report this" state, not a confident number.

### 2.3 No target carries a source (OBSERVED)

189 targets, **0** with a `source`, `ref`, `pmid` or population field. Each has a `why` sentence
(a mechanism statement, e.g. *"cofactor for collagen crosslinking"*), which is a mechanism claim, not
an evidence claim for the **number**. Where does `omega3_mg: 2000` for patellofemoral pain come from?
Nothing in the repo says. §3.10 requires "source"; the earlier PRD's evidence contract requires the
same. **This is authoring work, not wiring** — 189 numbers need a provenance line each, or they need
to be labelled "general adult guidance, not a personal prescription" (a sentence that already exists
at `app.js:7686` but does not travel to the bars).

---

## 3. P1 — Micronutrient model is structurally incomplete

The 17-key model (`FOODS.nutrient_keys`, mirrored in `app.js:8199 NUT_META` and in `server.js:1716`'s
allowlist — **three copies, correctly kept in sync**) contains:

`kcal, protein_g, carbs_g, sugar_g, fat_g, fiber_g, sodium_mg, vitamin_c_mg, vitamin_d_iu,
calcium_mg, magnesium_mg, zinc_mg, iron_mg, potassium_mg, omega3_mg, glycine_g, choline_mg`

**Absent entirely** (no field, so not even nullable): vitamin A, E, K, **all B vitamins including
B12 and folate**, selenium, iodine, phosphorus, copper, manganese, saturated fat, trans fat,
cholesterol, added sugar (vs total), omega-6, and any amino acid other than glycine.

This bites in two concrete places already in the product:

1. `chronic-fatigue/iron-anemia` is a protocol about anaemia. **B12 and folate cannot be tracked**,
   and B12/folate are two of the three deficiencies that cause anaemia. (The compound stack for that
   same protocol recommends Metformin — see `compound_content_audit.md` §1.3 — which the repo's own
   claim record says *lowers* B12.)
2. `cholesterol/ldl-fiber` cannot track **saturated fat**, the single dietary lever with the
   strongest LDL evidence.

**PRODUCT DECISION:** extending the model is cheap on the schema side (one array, three synced
copies) but expensive on the data side — every added key starts at ~0% coverage across 656 foods.
The honest sequence is: fix coverage on the 17 keys already declared before declaring more.

---

## 4. P0 — Food logging is behind an account, violating the anonymous-first constraint

**Status: VERIFIED (hydrated, signed-out, 1440×900, `/fuel/knee-pain/patellofemoral-pain`).**

Rendered verbatim:

> `🔒 Sign in to log your meals. Logging is for members — track what you eat against this protocol's
> biological targets. It's free and takes ten seconds. Sign in / create account`

**AGENT_RULES non-negotiable constraint 3:** *"Anonymous-first. Reading, **logging** and the $0
protocol must work with **no account**."*

Measured with the same signed-out session: `hasScan:false`, `hasAddFood:false` — the barcode scanner
and the add-a-food control are **not in the DOM at all** for an anonymous reader.

This is doubly odd because the storage is already anonymous-capable: `FUEL_KEY =
'rnawiki_fuel_log'` in `localStorage` (`app.js:8155-8171`), and the log is **never sent to the
server**. Nothing technical requires the account. The gate is `if (!ME) return openAuth('login')`
(`app.js:8207` for add-food) plus the `#fuel-signin` panel. **INFERENCE:** this is a growth gate that
was added without re-reading the constraint. Removing it is a small, contained change and it is the
single highest-leverage nutrition fix available.

Interaction with the owner's decisions from today: "Everyone with an account can build protocols" is
about **building**, not **logging**. It does not license an account gate on the food diary.

---

## 5. P0 — User-submitted foods publish instantly, unmoderated, and pay a reward

**Status: VERIFIED (`server.js:1729-1732`, `db.js:145-155`, `app.js` add-food modal copy).**

```js
// new foods go live instantly (like the bot); corrections stay pending so a dietitian confirms
const status = corrects ? 'pending' : 'active';
const r = await db.query('INSERT INTO user_foods(name,serving,data,submitted_by,status) …');
await award(u.id, 'food_submit', 'food:' + r.rows[0].id, 20);
```

And the modal copy (`app.js`, add-food branch): *"Add a missing dish — only the name is required,
everything else is optional. **It goes live instantly for everyone.** … **+20 reputation.**"*

So:

- Any signed-in user can write **arbitrary kcal/protein/sodium numbers** into the database that
  drives every protocol's target bars, and it is **live for every reader immediately**.
- The submitter is **paid 20 reputation** for doing it, which is a direct incentive to submit
  volume. v1.9 §4.6: *"no Credit merely for posting; settle only after independent, valid feedback
  and anti-abuse checks."* This awards on insert, before any check.
- The **moderation hold runs on the wrong side**: a *correction* to an existing food is held pending
  (sensible), but a *brand-new* food — which has no baseline to compare against and is therefore
  harder to sanity-check — publishes with no review at all.
- `db.js:145` declares `status TEXT NOT NULL DEFAULT 'pending'`, and the schema comment says *"a
  verified dietitian (or admin) approves it, after which it shows in the fuel tracker's search with
  a verified badge."* **The server overrides that default for new foods.** The schema documents a
  policy the code does not implement.
- **No version column, no history table.** An approved correction calls
  `window.__foodOverrides[data.corrects] = …` (`app.js:8188`) and silently replaces the published
  values with no record of the prior version and no revert path. §3.10 requires "version state";
  §11 requires "stale version/material update" and "save conflict" states. Neither exists.

**Credit where due:** `app.js:8186-8188` carries a comment recording that a client-side
`verified: true` flag was removed on 2026-07-30 because *"flagging it verified client-side asserted a
check that nobody performs."* The same reasoning applies unchanged to `status: 'active'` on insert.

### 5.1 Adjacent: photo uploads and consent

`openAddFoodModal` accepts a photo, resizes to 256 px client-side, and posts it as a data URI stored
in `user_foods.data.photo_data` (server caps at 60 000 chars — a well-reasoned bound, `server.js:1720-1724`).
It is then served publicly via `/api/foodphoto?id=…`. **There is no consent sentence telling the
submitter the photo becomes public.** §9.1 requires "the relevant disclosure/consent" before any
public projection. One sentence in the modal closes this.

---

## 6. P1 — Third-party data dependencies with no attribution, no consent, and a live network call

### 6.1 OpenFoodFacts, 331 of 656 records (50.5%) — no licence attribution anywhere

`scripts/fetch-foods.js:59` pulls from `https://world.openfoodfacts.org/api/v2/search?countries_tags_en=singapore`.
Open Food Facts data is **ODbL-licensed** and requires attribution and share-alike on redistribution.
Searched the entire repository (`grep -rani "open food facts|openfoodfacts|odbl"` outside
`node_modules`): the only hits are `scripts/fetch-foods.js`, `data/foods.json` source tags,
`site/foods.js` source tags, and two runtime strings in `app.js`. **There is no attribution notice on
any user-facing page, and the string "ODbL" does not appear in the repository.**
**LEGAL-CLINICAL — needs Felix.** Cheap fix: a line on `/methodology` and in the fuel tracker footer.

Note the same applies to the exercise corpus (`site/exercises.js`: `source:
free-exercise-db`, `license: "free-exercise-db (public domain / MIT images)"`) — that one **is**
declared in the data file, which is the pattern `foods.js` should copy.

### 6.2 The barcode scanner makes a live third-party request — and CSP blocks it

`app.js:8593`:

```js
const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?…`);
```

Two independent problems:

1. **Privacy.** This sends the barcode of a food the user is about to eat, plus their IP and
   `Referer`, to a third party. There is no disclosure — the only copy is *"Free — looks up
   OpenFoodFacts, no account or AI needed"*, which is a **cost** statement, not a privacy statement.
   v1.9 §12: *"Do not send raw symptoms, medicine names, assessment answers, private prescription
   values, or free-text health content to general analytics."* A food diary entry is health content.
2. **It cannot work in production.** The served CSP is:
   `connect-src 'self' https://accounts.google.com https://pubchem.ncbi.nlm.nih.gov`
   (measured: `curl -sI http://localhost:8099/`). `world.openfoodfacts.org` is **not** in
   `connect-src`, so the browser refuses the fetch and the user sees *"Lookup failed. Check your
   connection."* — a message that blames the user's network for a policy block.

   **Could-not-check caveat:** I could not exercise the scanner end-to-end because it is behind the
   account gate (§4) and Postgres is off locally (the page logged three 503s). The CSP header and the
   fetch URL are both directly observed; the conclusion that the fetch is refused is **INFERENCE**
   from those two facts. It is testable in one line once auth is available, and it should be tested
   before anyone "fixes" the scanner logic.

Either the host is added to `connect-src` **with** a disclosure sentence and a consent step, or the
feature is removed. Shipping it in the current state means it is dead *and* would leak if revived.

### 6.3 Exercise images are all remote

All 873 exercise records point `image` at `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/...`.
`img-src 'self' data: https:` permits this, so they render — but every protocol view tells jsDelivr
which rehab exercises the reader is looking at, and the **offline** required state (§11) fails to a
broken-image grid. Mirroring 873 images is a one-off build step and removes both problems.

---

## 7. P2 — Data loss: the food diary is destroyed at local midnight, silently

`app.js:8167-8171`:

```js
function getFuelLog() {
  try { const l = JSON.parse(localStorage.getItem(FUEL_KEY)); if (l && l.date === today()) return l; } catch (e) {}
  return { date: today(), items: [] };            // <-- yesterday is discarded
}
function setFuelLog(l) { l.date = today(); localStorage.setItem(FUEL_KEY, JSON.stringify(l)); }
```

One key, one day. At the first write after local midnight, the previous day's entire food log is
overwritten and unrecoverable. There is **no history view, no export, and no warning**. The `today()`
implementation itself is correct and carefully commented (a real UTC/UTC+8 bug was fixed here on
2026-07-28) — the issue is the single-slot storage, not the date.

This may be a deliberate simplification. It still needs a decision, because:
- the page copy invites longitudinal use (*"watch the bars fill toward the biological targets"*);
- §11 requires an explicit **delete/withdrawal** state, and silent destruction is not one;
- the manual reset already does the right thing —
  `confirm("Clear everything you logged today? This can't be undone.")` — so the product already
  knows this data is worth confirming before destroying. Midnight destroys it without asking.

**Minimum honest fix:** keep N days keyed by date and offer a JSON export. Both are local-only, so
neither touches the privacy posture. **PRODUCT DECISION.**

---

## 8. What is genuinely good here (worth not breaking)

- **`null` semantics are declared** in the data file, and the number model is kept in **exactly three
  synced places** (`foods.js nutrient_keys` / `app.js NUT_META` / `server.js` allowlist). That is the
  right shape; the bug is only that the renderer doesn't honour the semantics (§2.2).
- The photo payload bound (`< 60000` chars) is derived from a **measured** worst case
  (`resizeImage(file,256)` at 35 131 chars), with the reasoning recorded inline. That is the standard
  the rest of the codebase should be held to.
- Corrections-vs-new-food is modelled correctly (`data.corrects` → override, not duplicate) — the
  moderation policy is simply attached to the wrong branch.
- The Singapore hawker seed (198 `sg_local` records, plus 99 with `gi` and a nutritionist-authored
  "healthier swap" table at `app.js:4540`) is real, differentiated content that no generic tracker
  has.

---

## 9. Findings table

| # | Finding | Severity | Status | Evidence |
|---|---|---|---|---|
| N1 | 38/189 nutrient targets across 31/52 protocols track a nutrient present on <10% of foods (omega-3 2.4%, glycine 1.2%, choline 1.5%, vit-D 4.7%) | **P0** | verified | §2 census; hydrated `/fuel/knee-pain/patellofemoral-pain` |
| N2 | `null` ("not reported") is summed as 0; limit bars under-count — sodium null on 136/656 | **P0** | verified | `foods.js` note vs tracker render |
| N3 | Food logging gated behind an account, violating the anonymous-first constraint; storage is already local-only | **P0** | verified (hydrated, signed out) | `out/wA/wA_fuel.json` |
| N4 | New user foods publish `status:'active'` with no review and a +20 reputation award; schema default says `pending` | **P0** | verified | `server.js:1729-1732`; `db.js:145-155` |
| N5 | 0 of 189 nutrient targets carry a source; 0 of 656 foods carry `source_url`/`retrieved_at`/`version` | **P1** | verified | §2.3, §1 |
| N6 | 331/656 records are ODbL OpenFoodFacts data with no attribution anywhere in the product | **P1 legal** | verified | §6.1 |
| N7 | Barcode scanner posts the scanned barcode to a third party with no disclosure, and CSP blocks the host | **P1 privacy** | fetch+CSP verified; block inferred | §6.2 |
| N8 | No versioning/history on `user_foods`; an approved correction silently overwrites | **P1** | verified | `app.js:8186-8190`; `db.js:145` |
| N9 | Food diary destroyed at local midnight, no history, no export, no warning | **P2 data-loss** | verified | `app.js:8167-8171` |
| N10 | Micronutrient model omits all B vitamins, folate, saturated fat, vitamin A/E/K, selenium | **P1** | verified | §3 |
| N11 | Photo submissions become public with no consent sentence | **P2 privacy** | verified | §5.1 |
| N12 | `foods.js` `sources` header (`seed:154, openfoodfacts:331`) disagrees with the data (`198/331/127`) | P3 | verified | §1 |

---

## Appendix — reproduction

```bash
cd "/Users/admin/ClaudeRepo/Claude Projects/rnawiki"
node -e "const fs=require('fs'),vm=require('vm');const sb={window:{}};sb.self=sb.window;
vm.createContext(sb);['site/foods.js','site/data.js'].forEach(f=>vm.runInContext(fs.readFileSync(f,'utf8'),sb));
const F=sb.window.RNAWIKI_FOODS.foods,D=sb.window.RNAWIKI_DATA;
sb.window.RNAWIKI_FOODS.nutrient_keys.forEach(k=>console.log(k,F.filter(f=>f[k]!=null).length));"

cd /Users/admin/.claude/jobs/b8afc277/tmp/qa && node out/wA/wA_fuel.mjs   # hydrated, signed-out
curl -sI http://localhost:8099/ | grep -i content-security                # connect-src allowlist
```
