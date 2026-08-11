# RNAwiki v1.9 — Avatar / Marketplace audit (WAVE A, read-only)

**Author role:** Avatar + Marketplace specialist
**Date:** 2026-08-11 · branch `refine/site-wide-2026-08` · no product code changed
**Scope:** v1.9 §5.6 (Marketplace inventory taxonomy, Avatar Level, training style, real-service
state machine, purchase → entitlement → equip authorisation, refund/revocation), §5.2 identity rail,
§5.5 accomplishments, §9 public/private contract, §14 gates V19-AVA-001/002/003, V19-PRO-002.

Evidence method and the throwaway-Postgres harness: see `community_reputation_audit.md` §0.

---

## 1. The blocking finding: an avatar cannot be added to this codebase today

**VERIFIED by reintroducing the bug in a scratch copy of the tree.**

`build/parse.js:3634 assertProfileDisclosesOnlyPublished()`, part (2), scans **every non-comment
line of `server.js`, `site/app.js` and `db.js`** for:

```js
const IDENTITY = /avatar|profile_pic|profile_photo|\bheadshot\b|real_name|realname|full_name|legal_name|display_name/i;
```

and calls `process.exit(1)` on a hit. `parse.js` runs in `prestart`, and CLAUDE.md records that a
`process.exit(1)` there **stops the Railway deploy**.

I copied the tree to `/Users/admin/.claude/jobs/b8afc277/tmp/qa/out/w19_gate` (product code
untouched), confirmed a clean baseline, then added the two columns v1.9 §5.6 minimally needs:

```
baseline
  [parse] profile disclosure gate OK — GET /api/u/:handle carries 7 banned pattern(s) 0 times,
          0 avatar/real-name fields in 3 files, and the 2 private-route lists match on 10 routes.

injected into db.js
  ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_state JSONB NOT NULL DEFAULT '{}';
  ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_level INTEGER NOT NULL DEFAULT 0;

result
  [parse] PROFILE DISCLOSURE GATE FAILED — refusing to build. A profile shows what somebody PUBLISHED:
    ✗ db.js:34 — an avatar, photograph or real-name field. RNAwiki asks for no real name and holds
                 no photograph, and the publish sheet and both profile pages now say so to the reader.
    ✗ db.js:35 — an avatar, photograph or real-name field. …
```

The gate is 3 days old (commit `48f4d6f`, "assertProfileDisclosesOnlyPublished() — a build gate over
the disclosure surface"). It is not an accident and it is not stale.

### 1.1 Three reader-facing promises depend on it

The gate exists because the site **already tells readers** what it holds:

| where | copy (verbatim) |
|---|---|
| `site/app.js:8922` — the `/u/<handle>` page | *"RNAwiki has one kind of account. This is not a credential, a profession or a rating, and there is no score on it. **A username is the only thing the site knows about the person who wrote these — no real name, no photograph.**"* |
| `site/app.js:9047` — `/me` | *"RNAwiki has never asked you for your real name and **holds no photograph of you**."* |
| `site/app.js:9451` — the publish sheet, shown **before** the publish tap | *"Your username is the only thing about you that goes with it. RNAwiki asks for no real name and holds no photograph. **Nothing you plan, log or follow is published** — not by this and not by anything else. That stays on this device."* |

An illustrated cosmetic avatar is not a photograph, so a narrow reading survives sentence 1 and 2.
**Sentence 3 does not survive §5.6 at all**: Avatar Level is defined as *"settled Credits redeemed
for eligible avatar cosmetics"*, and the optional **training style** cosmetic is *"unlocked only by
versioned eligible-action rules"* — i.e. it is a public rendering of **what you did**. That is
exactly "what you plan, log or follow", published.

**This is a PRODUCT DECISION for the owner, not an engineering workaround.** Three routes:

- **A — no avatar.** Keep the gate, keep the copy, drop §5.6. §4 and §5 still work with a handle.
- **B — avatar, no achievement signal.** Cosmetics only, purchasable, never unlocked by activity;
  Avatar Level private by default; the gate's `IDENTITY` regex narrowed with a written exemption in
  the same house style as the existing `proof_photo` exemption; all three sentences rewritten
  *before* the column exists.
- **C — full §5.6 including training style.** Then sentence 3 becomes false and must be rewritten to
  say what is published, and `/methodology` + `/corrections` should record the change of policy,
  because this repo publishes its own reversals.

I cannot pick. **It is on the human-approval list, and nothing in §5.6 should be built until it is
answered**, because every other item below depends on which route is taken.

---

## 2. What exists in the repo today

**VERIFIED — measured, not assumed:**

| §5.6 concept | occurrences in `server.js` / `site/app.js` / `styles.css` | state |
|---|---|---|
| avatar | 1 / 0 / 1 | **absent** — the `server.js` hit is inside the disclosure-gate comment; the CSS hit is unrelated |
| marketplace | 0 / 3 / 0 | **absent** — all three are prose: `online marketplace` inside the prescription-only warning (app.js:523) and two comments about the abolished "expert marketplace" (app.js:892, 8619) |
| entitlement | 0 / 0 / 0 | **absent** |
| inventory | 0 / 0 / 0 | **absent** |
| equip | 0 / 6 / 0 | **absent** — every hit is `equipment` (app.js:4613, 5191, 8710, 9345) |
| refund | 0 / 0 / 0 | **absent** |
| Avatar Level | 0 | **absent** |
| routes | `/marketplace` → **404**, `/credits` → **404** (PRERENDERED, `curl :8099`) | absent |

There is no `users.avatar_*` column, no item catalogue, no entitlement table, no purchase ledger, no
service-request state machine. **§5.6 is 0 % implemented.** The only adjacent shipped concept is
`levelFor()` (server.js:483) — a four-rung ladder (Builder → Experimenter → Veteran → Architect)
computed as a pure function of completed experiments, with no state of its own. It is **not** an
Avatar Level (it measures activity, which §5.6 forbids Avatar Level from doing) and it must not be
renamed into one.

`users.badges` (db.js:98) is the closest thing to an accomplishment store. It is `[]` on every row,
its only writer `addBadge()` was deleted on 2026-08-08 (server.js:398), and the disclosure gate bans
it from the public payload. The comment there is the standard §5.5 should be held to:

> *"A badge may only assert something this site can itself observe — 'logged 30 days', not 'is a
> pharmacist'."*

---

## 3. The v1.9 prototype, assessed honestly

`RNAwiki_Profile_Desktop_Prototype_v1_9.html` is the strongest artefact in the v1.9 pack for this
lane. Credit where it is due before the defects.

### 3.1 What it gets right

| §5.6 requirement | prototype evidence |
|---|---|
| idempotent purchase → entitlement → equip | line 72: `const redemptionId = 'avatar:'+item.id; … if(!redemptionLedger.has(redemptionId)){ redemptionLedger.set(…,{status:'settled'}); creditBalance-=item.cost; entitlements.add(item.id); equipAvatar(item); }` — a real dedupe key, purchase strictly before entitlement, entitlement strictly before equip |
| equip requires ownership | line 73 `updateAction()`: `const owned = entitlements.has(item.id) … action.textContent = … owned ? 'Equip' : 'Review purchase · '+item.cost+' Credits'` |
| Avatar Level derives from settled redemptions only | line 72: `avatarLevel = Math.max(1, Math.floor(settledRedeemed/100)+1)` — derived, never set |
| pending is unspendable, stated at the point of failure | line 72: *"Pending Credits cannot be spent."* |
| cost confirmed before redemption | line 72 `reviewAvatarPurchase()` shows current balance, cost, balance-after, then `Redeem {n} Credits` |
| cosmetic ≠ health claim | line 73: *"Avatar changes are cosmetic. They never show measured muscle, strength or a health result."*; line 72: *"This is a cosmetic entitlement. It does not change health, strength, status or protocol completion."* |
| services are visibly unavailable | line 74 `openServicePreview()`: *"Planned service · not available to request. RNAwiki has not connected a provider, verified availability or set a real Credit price in this prototype."* and line 75: *"Provider, quote, booking, refund and fulfilment controls must exist before service redemption is enabled."* |
| gym access earns nothing | line 74: *"Gym access never completes a protocol action, changes your training style or earns Credits."* |
| Avatar Level public display is a choice | line 80 `toggleAvatarLevel` → *"Avatar Level is public" / "Avatar Level is private"* |

That "planned service · not available to request" pattern is the honest-by-default standard the rest
of the v1.9 pack should be held to, and it is the direct answer to §5.6's *"Never claim a real
service is available until a provider/market contract exists."*

### 3.2 Prototype defects

| # | file:line | defect | severity |
|---|---|---|---|
| **A-1** | `RNAwiki_Profile_Desktop_Prototype_v1_9.html:58` | `let journeyPublic=true` — **Active Journey is public by default.** v1.9 §5.3: *"Active Journey title/status is public only after per-enrollment confirmation."* The earlier specialist audit's own P0 says *"Preferred privacy default is private."* The prototype ships the opposite of both, and the toggle at line 81 confirms what is exposed: *"visitors can see the protocol title, Day 9 of 28 and your 6-day streak."* A protocol title on a health site is a health disclosure. | **P0 — privacy** |
| **A-2** | same file:58 | `let avatarLevelPublic=true` — public by default. §5.6: *"Public profile may show the equipped avatar and Avatar Level only under the allowlist **and the account's separate public-display choice**."* A default-on switch is not a choice. | P1 — privacy |
| **A-3** | all 16 prototypes | **no refund and no revocation flow exists.** `/usr/bin/grep -ci "refund\|revoke\|revocation\|unequip"` → Profile 2, Community 1, Discussion 1 — and every one is prose, none a flow. §5.6 requires *"refunds/revocations unequip safely and preserve the audit ledger"* and §14 **V19-AVA-003** gates it. Half of that gate has no artefact to test against. | P1 — untestable gate |
| **A-4** | Profile:72 | the entitlement has **no item version**. §5.6 and V19-AVA-003 both say *"entitlement for that account **and item/version**"*. `redemptionId = 'avatar:'+item.id` and `entitlements.add(item.id)` are version-free, so a re-issued or corrected cosmetic silently reuses an old grant. | P2 |
| **A-5** | Profile:72 | the ledger is a client-side `Map`. Fine for a mock, but §5.6 is explicit: *"Server authorization — not client state — checks ownership."* **V19-AVA-003 cannot be closed by this prototype**; it needs a server artefact that does not exist. Recording so nobody marks the gate green off the mock. | P2 (process) |
| **A-6** | Profile:73 | training style shows `Locked · 6 of 12 actions to unlock` on the shop tile. That is an activity progress bar inside a **purchase** surface, which is precisely the earn/spend blur §5.6 §"separate ledgers" exists to prevent — and it is where "credits are something you wear" (demo, ≈00:44) becomes "your body shape is your activity record". | P1 — see §4 |
| **A-7** | Profile:58 | `creditBalance=840` — the demo's number (≈00:44). Continuity is good; the risk is that a mock number becomes copy. See `economy_abuse_audit.md` §9 E-P1/E-P2 for the same failure already realised in the Discussion prototype. | P2 |

---

## 4. Inventory taxonomy — the two categories that need a decision, not a design

§5.6 lists five inventory classes. Three are unremarkable. Two are not.

**(a) Cosmetic body presentation by muscle group / "training style".** §5.6 already fences it well —
*"never measurements or before/after results"*, *"must be labeled cosmetic"*, and the earlier audit
adds *"cannot regress as punishment for missing a day"*, *"maximum stylization range to avoid
body-image pressure"*, *"needs independent safety and youth review"*. All correct. Two things neither
document says:

1. **It is the one Marketplace item that is not purchasable**, because it unlocks from eligible
   actions. That makes it the single point where the two ledgers §5.6 insists on keeping separate
   have to touch. Whatever the architecture, this is the seam to guard with a constraint, not a
   convention.
2. **It renders a body on a health site to a user who came about a health problem.** RNAwiki's
   corpus includes weight, metabolic and body-composition protocols. A cosmetic that grows arms as
   you log sessions is an appearance reward attached to a health behaviour. That is a
   **LEGAL-CLINICAL DEPENDENCY**, and the relevant reviewer is a clinician with eating-disorder
   competence, not a designer. It should be the **last** thing built, behind a flag, or dropped.

**(b) Real-world services** (haircut, barbering, styling, sneaker cleaning, personal styling,
equipment fitting). This turns RNAwiki from a wiki into a **marketplace operator**: provider
onboarding, quotes, no-shows, disputes, cancellation terms, tax, consumer protection, and — since
Credits are earned by helping — a possible labour characterisation. §4.6 already says any change to
convertibility needs *"a new legal, payments, fraud, tax, labor, and consumer-protection review"*.
Two additions from the repo's own constraints:

- **Product constraint 1 (no brand recommendations).** A Marketplace listing a specific local barber
  *is* a commercial recommendation. The constraint is written about supplements, but a paid-partner
  directory is the same shape, and this repo already dismantled one lead-gen scheme
  (`stewardships` + `partners.backlink_url`, deleted 2026-08-08) for adjacent reasons. Anyone
  building the Marketplace must be told that history rather than rediscovering it.
- **Solo-maintainable (constraint 4).** A service marketplace is recurring manual work — provider
  vetting, dispute handling — for one person with an August 2026 deadline. That is a capital-
  allocation objection, not a technical one, and it belongs in front of Felix.

**Recommendation:** ship §5.6 as **cosmetics only, purchased with settled Credits, no training style,
no services**, and keep §5.6's excellent "planned service · not available to request" copy as the
permanent state until a provider contract exists. That satisfies V19-AVA-001 and V19-AVA-002
(*"no fake availability"*) at zero legal exposure.

---

## 5. Real-service state machine (§5.6, gate V19-AVA-002)

Spec: `request → provider quote/availability → user accepts → Credits reserved → service
confirmed/completed → settlement/refund`. The earlier audit §9.5 correctly expands this to nine
states: requested, quote ready, accepted/held, provider declined, user declined, completed,
cancelled, refunded, disputed, expired.

**Repo status: absent.** No table, no endpoint, no state column. The nearest analogue is
`partners` (db.js:129) — `status ∈ {pending, active, rejected}` for a backlink-verified directory —
whose grant path was **deleted** on 2026-08-08.

Three requirements neither document states, from this repo's own history:

1. **A reservation must be an append-only ledger entry, not a mutable balance.** `rep_events` +
   `users.reputation_points` (a denormalised running total updated outside a transaction) is the
   anti-pattern already in the tree; a "Credits reserved" state written that way desynchronises on
   the first failed fulfilment. See `economy_abuse_audit.md` §3.1.
2. **Expiry must be a written event, not a cron-swept absence.** Otherwise a user who never hears
   back cannot tell "expired" from "lost".
3. **The refund path must unequip.** §5.6 says so and no artefact demonstrates it (A-3). The order
   matters: revoke entitlement → unequip → write the reversal → recompute Avatar Level. Any other
   order leaves a user wearing an item they no longer own, or an Avatar Level that no ledger
   supports.

---

## 6. Public/private projection (§9, gate V19-PRO-002)

§9.1 allows public: *handle, name, bio, avatar, Avatar Level … Champion/completion/accomplishment
records … public comments and net helpful count.*
§9.2 never public: *Credit balance, marketplace purchases, service bookings.*

**The repo is currently stricter than §9.1 and enforces it at build time.** `GET /api/u/:handle`
(server.js:1605) publishes exactly four things — `username`, `joined` truncated to the **month**,
published protocol titles/codes, and `clones` — and `assertProfileDisclosesOnlyPublished()` fails
the build if `reputation_points`, `socials`, `badges`, `profile_views`, `booking_clicks`,
`user_plans`, `experiments`, `studio_clones`, `user_profile`, `conditions`, `meds`, or
proposal/comment/edit activity re-enters that payload.

So of §9.1's allowlist, **`avatar`, `Avatar Level`, `Champion/completion records` and `net helpful
count` are all either banned by the gate or unrepresentable**. §9.2 is satisfied vacuously (nothing
to leak). `/me` and `/u/<handle>` both carry `<meta name="robots" content="noindex,nofollow">`
(VERIFIED, PRERENDERED via `curl`), and `NOINDEX_ROUTES` (server.js:2943) matches `PRIVATE_ROUTES`
(app.js:9600) on all 10 routes — the gate checks that pair too.

Two live cautions:

- **`clones` is forgeable.** `GET /api/u/farmer` returned `clones: 5` after five cookieless `curl`
  calls, beside the sentence *"How many people started it."* (VERIFIED — full run in
  `community_reputation_audit.md` §2.4.) Any Avatar Level, accomplishment or Champion record derived
  from a count must not be derived from **this** count.
- **`robots.txt` is `Allow: /` with no `Disallow: /api/`.** The `<meta>` noindex covers the HTML
  routes, but `GET /api/explain?slug=…` returns public user text as JSON with no directive. Minor
  today (nothing links it); it matters the moment a Marketplace or profile API returns anything
  personal.

---

## 7. §14 gate readiness for this lane

| gate | testable today? | why |
|---|---|---|
| **V19-AVA-001** Avatar/Marketplace boundary — Avatar Level cosmetic and separately public; purchases cannot imply health/strength/completion | **partially** — the copy exists in the Profile prototype and is good; the *separately public* half fails because `avatarLevelPublic=true` by default (A-2) | |
| **V19-AVA-002** Real-service state machine; no fake availability | **yes, and it passes** — by refusing to offer the service at all (Profile:74/75). Keep this posture; do not "improve" it into a fake booking flow. | |
| **V19-AVA-003** Purchase before equip; idempotent; duplicate retry, refund and revocation safe/audited | **half.** Purchase→entitlement→equip and duplicate-retry are demonstrated (Profile:72, `redemptionLedger`). **Refund and revocation are demonstrated nowhere (A-3), the entitlement has no version (A-4), and the whole thing is client state (A-5).** | |
| **V19-PRO-002** Owner/visitor projection — private owner controls and Credit balance disappear in public preview | **cannot be tested against the repo** — there is no Credit balance and no owner/visitor projection; the repo has one public profile shape and no owner mode on it | |
| **V19-REW-001** One truthful Money Tree | **no** — the artefact does not exist in any of the 16 prototypes (`"money tree"` → 0 occurrences). A gate over an empty set always passes. | |

---

## 8. If §5.6 is approved: the four gates to write with it

In the house style — each provable by reintroducing the bug it prevents:

1. **`assertAvatarIsCosmeticOnly()`** — no code path writes an avatar/entitlement row from an
   eligible-action event, and none writes an eligible-action event from a Marketplace transaction.
   This is §5.6's "separate ledgers" made mechanical. Prove it by wiring a clone into an entitlement.
2. **`assertEntitlementBeforeEquip()`** — every equip write is preceded in the same server handler by
   an entitlement lookup keyed on `(account, item, version)`. Prove it by deleting the lookup.
3. **`assertPublicProfileAllowlist()`** — extend the existing `assertProfileDisclosesOnlyPublished()`
   with the §9.2 never-public set (`credit_balance`, `purchase`, `booking`, `measurement`) rather
   than writing a second gate. One gate, one subject; the repo has already been bitten by two
   hand-synced lists (the `NOINDEX_ROUTES`/`PRIVATE_ROUTES` pair that this same gate now checks).
4. **`assertNoUnstatedCreditValue()`** — no Credit price, cap or multiplier literal in user-facing
   copy that is not read from a single config object. Prevents A-7, E-P1 and E-P2 permanently.

And one non-gate: **update `/methodology` and `/corrections`.** This project publishes its own
reversals. If the "no real name, no photograph, nothing you follow is published" promise changes,
readers who were told the old thing should be told the new thing on the page that already lists what
was got wrong before.
