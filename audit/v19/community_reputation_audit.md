# RNAwiki v1.9 — Community / Reputation audit (WAVE A, read-only)

**Author role:** Community + reputation specialist
**Date:** 2026-08-11 · branch `refine/site-wide-2026-08` · tree clean, nothing committed by me
**Scope:** v1.9 spec §4 (Community + Discussion), §4.4 Champion, §4.5 attribution, §4.6 reactions,
§4.7 safety routing, §5.4–§5.5 roles/accomplishments; the repo tables `explain_posts`, `votes`,
`comments`, `rep_events`, `protocol_forks`/`fork_clones`, `studio_protocols`/`studio_clones`.

## 0. How the evidence was produced (read this before trusting a number)

Three documents were used and are labelled on every claim:

| document | how | what it is evidence of |
|---|---|---|
| PRERENDERED | `curl http://localhost:8099/<route>` | what a crawler sees |
| HYDRATED | headless Chrome via `qa/probe.mjs` / bespoke puppeteer-core scripts | what a user sees |
| LIVE SERVER + REAL POSTGRES | **a throwaway instance I stood up**: `docker run postgres:16-alpine` on `127.0.0.1:55433`, then `DATABASE_URL=… PORT=8098 node server.js` from the working copy | what the API actually does |

The third one matters. Every previous audit of this feature area was written against a database that
was **off** (`db.enabled=false` → every community endpoint answers `503`), so no one had exercised
these paths. **Production was never touched.** The throwaway container is
`rw_qa_pg`; kill it with `docker rm -f rw_qa_pg`.

Labels used: **VERIFIED** (I ran it, output pasted) · **INFERRED** (read from code, not executed) ·
**COULD-NOT-CHECK**.

---

## 1. The finding that reframes this whole workstream

**There is no protocol community in this repository, and the one threaded-comment endpoint that
exists has no caller, no moderation, no deletion and no reader.**

v1.9 §4 describes a *protocol-scoped* Discussion: questions, alternatives, patches, accepted answers
with attribution, Champion context, Helpful/Not-helpful with a net floor, and resolution. The repo
contains none of that. What it contains:

| repo object | what it actually holds | v1.9 §4 concept it could serve |
|---|---|---|
| `explain_posts` (db.js:496) | one flat "explain it back" thread per **compound/pathway slug**, one level of nesting, `handle` snapshotted at post time | the *shape* of a question thread — but wrong subject (a compound, not a protocol) |
| `votes` (db.js:61) | up/down on an arbitrary `target_id` string; only real target rendered is `${pid}:${rcid}:protocol` | nothing — it rates a *page*, never a *comment* |
| `comments` (db.js:39) | comments on a **goal id**; requires an account | nothing protocol-scoped |
| `rep_events` (db.js:102) | 7 kinds; today only `vote`, `food_log`, `share`, `fork`, `fork_clone`, `outcome` can be written | the ledger v1.9 wants to build Credits on — see `economy_abuse_audit.md` |
| `protocol_forks` / `fork_clones` | a named variation of a protocol stack + one clone per browser | closest thing to "alternative", but no review/acceptance state, no attribution to an *action*, no version |
| `studio_protocols` / `studio_clones` | user-built protocols + one clone per browser | the protocol object itself, not its discussion |

**There is no table anywhere for: a question, an accepted answer, an alternative bound to an action,
a Helpful reaction on a comment, a Champion record, a manager permission, a report/flag, or a
moderation action.** (VERIFIED — full DDL read, db.js 1–605.)

### 1.1 `/api/explain` is a live, unauthenticated, public read/write text store with zero callers

**VERIFIED.**

- Server handler: `server.js:1139–1194`. `GET` needs nothing; `POST` needs nothing (`currentUser`
  is `catch(()=>null)`, `user_id` may be NULL).
- Callers in the product: **zero.**
  `/usr/bin/grep -ac "api/explain" site/app.js` → `0`; same for all 10 files in `site/*.js` and for
  `build/prerender.js`.
- The client feature it was built for was converted to a **private** self-test. `site/app.js:1150`
  says so in its own words: *"a PRIVATE active-recall self-test … No sharing, no community thread
  (all commenting removed) — nothing they write leaves the page."* `wireFeynman()` (app.js:1153)
  only un-hides the model answer.
- I posted through it and read it back on the throwaway instance:

```
POST /api/explain {"slug":"magnesium","body":"…"}   → {"ok":true,"id":21,"signedIn":true}
GET  /api/explain?slug=creatine                     → {"posts":[{"id":41,"user":"Someone","anon":true,…}]}
```

So today rnawiki.com hosts an anonymous message board on every compound slug that **no page renders,
so nobody will ever see the abuse**, and that:

- has **no delete path of any kind**. VERIFIED: `/usr/bin/grep -an "explain_posts" server.js` returns
  6 hits — one SELECT for the reply e-mail, one SELECT for the thread, two rate-limit COUNTs, one
  parent lookup, one INSERT. **No DELETE, no UPDATE, no admin queue.** `comments` has
  `DELETE /api/comments/:id` (server.js:1491); `explain_posts` has nothing.
- is **not in the PDPA export or erasure path**. `/api/mydata` (server.js:1390) covers
  `user_consent`, `user_profile`, `outcome_checkins`, `blood_markers`, `wearable_daily` and nothing
  else. A signed-in user's public post carrying their handle is neither exportable nor erasable.
- can still e-mail a real user: `notifyReply()` (server.js:670) mails the parent post's author. The
  cross-slug amplifier was closed (parent must be on the same slug, `parent_id IS NULL`), but a real
  top-level poster can be mailed once per anonymous reply within the rate budget.

**P0.** This is the same defect class the repo already found and documented for `/api/share-plan`
(server.js:1263 — *"an unauthenticated, publicly-readable arbitrary-text store"*). It is still open
here. It is also a Singapore exposure: an unmoderated public field on a page about a
prescription-only medicine is where an unlicensed seller's advert goes, and Medicines Act 1975 s.51
does not care that the owner never rendered it.

### 1.2 Twenty anonymous posts lock out every anonymous poster on the site for ten minutes

**VERIFIED — executed end to end through the public API only, no SQL seeding in the final run.**

`server.js:1172`:
```js
const ac = (await db.query("SELECT count(*)::int n FROM explain_posts WHERE user_id IS NULL AND created_at > now() - interval '10 minutes'")).rows[0];
if (ac && ac.n >= 20) return json(res, 429, { error: 'A lot of anonymous posts just arrived — try again in a few minutes, or sign in to post now.' });
```

That COUNT has **no `WHERE slug=`, no IP, no participant key**. It is a single global bucket.

Run (one IP, browser UA, real Origin, respecting the 15-burst/1-per-4s write limiter):

```
… 20 anonymous posts created on slug=creatine …
POST /api/explain {"slug":"magnesium", …}  (a different reader, a different page)
→ {"error":"A lot of anonymous posts just arrived — try again in a few minutes, or sign in to post now."}
POST /api/explain  with a session cookie   → {"ok":true,"id":21,"signedIn":true}
```

Cost of the attack: 20 requests. Effect: **anonymous-first posting is dead site-wide for 10 minutes**,
and the error text tells the victim the fix is to create an account. Product constraint 3 says
anonymous-first is non-negotiable; this is a 20-request denial of it. The comment above the code
correctly identifies that the *old* limiter left the anonymous path unthrottled and fixes that — but
it replaced "no limit" with "a shared limit", which is worse for the honest user. **P1** today
(nothing renders it), **P0 the moment §4 ships on top of it.**

### 1.3 What the existing specialist audit got right, and where I disagree

`work/v19_community_profile_audit.md` (1,458 lines) is a good *product design* document. My
disagreements are about evidence, not taste.

| # | Its claim | My verdict |
|---|---|---|
| C1 | Evidence list (lines 5–11) is four **mobile** prototypes + the video. | **It never read the v1.9 desktop prototypes or the repository.** Not one repo path, line number, route, table or API appears in 1,458 lines. Its §8/§9 credit and anti-abuse rules are therefore written against nothing that exists, and it does not know that `explain_posts` has no caller, that `/api/rep` self-awards, or that every public count on the site is currently forgeable. Its P0 register is a list of *design* risks; the *shipped* risks are all missing from it. |
| C2 | §2 "What the current work gets right": *"Marketplace Credits are already separated from public wallet information"*, *"the helpful score is floored at zero and credit settlement is delayed for checks"*. | **Contradicted by the owner's own demo.** At **t≈40–44 s** the account rail shows one number, `825` → `840`, captioned `CREDITS FOR CONFIRMED HELP`, with `Teal training jacket · 180 Credits` in the same card. There is no pending state, no settled state and no delay anywhere in the demo. See `economy_abuse_audit.md` §2. What is "already right" is right *in the v1.9 prototypes only*, which were written after the demo — the audit credits the product with a property only its newest mock has. |
| C3 | §8.3 recommends exact settlement values ("25 per comment, 75/day, 300/7d, +150 per patch, 1.25× Champion bonus") and then says *"The exact commercial values need product-economics and legal approval."* | Correct as written — but those numbers then **shipped into user-facing copy** in `RNAwiki_Community_Discussion_Desktop_Prototype_v1_9.html:108`, stated to the reader as policy: *"Eligible settlement is capped at 25 Credits per comment, 75 a day and 300 in seven days."* An unapproved number presented to a user as a rule is the fabricated-count failure mode this repo has been bitten by repeatedly (product constraint 5). **Recorded as a defect against the prototype, not the audit.** |
| C4 | P0: *"the composer relies on a small client-side keyword check"*. | **Right, and understated.** The check is `sensitiveText = /chest pain\|…\|medicine\|medication\|dose\|…/i` (Discussion prototype line 111). It matches the word **"dose"**, so *"what time of day should I take the dose?"* — the single most common implementation question this product exists to answer — triggers `openPrivateHelp()`, whose copy is **"Your draft was not posted and has been discarded."** That is silent destruction of user text on a false positive. v1.9 §4.7 permits three outcomes (saved privately / discarded / escalated); the prototype hard-codes the destructive one. **Add: data-loss, not just mis-routing.** |
| C5 | P1: *"a raw net score can be manipulated by reciprocal groups, multiple accounts…"* — framed as a future design risk. | **It is a shipped, executed defect today, on a different object.** Four cookieless `curl` requests put a public warning banner on a real clinical protocol page. See §2 below. The audit did not find it because it never ran the server. |
| C6 | §11.1 public allowlist, §11.2 Active Journey privacy warning. | **Agree, and the repo is already stricter than the audit asks.** `GET /api/u/:handle` (server.js:1605) publishes exactly `{username, joined-to-the-month, published protocols, clones}` and a build gate (`assertProfileDisclosesOnlyPublished`, build/parse.js:3634) fails the deploy if `reputation_points`, `socials`, `badges`, `profile_views`, `user_plans`, `experiments`, `studio_clones`, `user_profile`, `conditions`, `meds`, or proposal/comment/edit activity re-enters that payload. v1.9's public "Day {n} / streak / Active Journey" **fails that gate as written**. This is the sharpest spec-vs-repo collision in the community lane and neither document mentions it. |

---

## 2. Community reputation signals are forgeable — executed, with the rendered result

### 2.1 Four cookieless requests publish "more readers said this did not help" on any protocol · **P0**

**VERIFIED — API run + HYDRATED render.**

`site/app.js:8625 voteFoot()` puts a vote widget on all 52 `/protocol/**` routes, with a badge that
reveals itself on a pure data condition (`app.js:8651`):

```js
badge.hidden = !(total >= 4 && (score.up || 0) / total < 0.5);
```

`POST /api/votes` (server.js:1542) resolves the voter with `resolveParticipant(req,res)`
(server.js:462), which mints a **fresh** signed anonymous cookie whenever the request carries none
(`anonMint`, server.js:457). A client that simply does not keep cookies therefore gets a new
identity per request, and `UNIQUE(target_id, voter_key)` never fires.

Executed against the throwaway instance, one IP, one machine:

```
4 × POST /api/votes  {"targetId":"knee-pain:patellofemoral-pain:protocol","value":-1}   (no cookie jar)
GET /api/votes?ids=knee-pain:patellofemoral-pain:protocol
→ {"scores":{"knee-pain:patellofemoral-pain:protocol":{"up":0,"down":4}}}
SQL: select count(*), count(distinct voter_key) from votes → 5 rows, 5 distinct keys (earlier 5-shot run)
```

HYDRATED render of `/protocol/knee-pain/patellofemoral-pain` at 1440×900 immediately afterwards:

```json
{"found":true,"hidden":false,
 "text":"⚠ More readers said this did not help than said it did",
 "color":"rgb(194, 65, 12)","w":326,"h":20,
 "footText":"Did this help you? | 👍 0 | 👎 4 | ⚠ More readers said this did not help than said it did"}
```

Screenshot: `/Users/admin/.claude/jobs/b8afc277/tmp/qa/out/w19_badge.png`.

So: **any of the 52 protocol pages can be publicly discredited for the price of four HTTP requests,
with no account, and the inverse (four upvotes) suppresses a genuine negative signal.** The badge
text was rewritten in W3.5 to remove the fake "expert review needed" credential — that fix is
correct and I am not re-litigating it. The remaining defect is the *input*, not the wording.

Note the repo believes this class was fixed. `server.js:426` records the 2026-08-01 fix
("the key was `clean(extra.voterKey,64)` straight from the POST body … 12 made-up voterKeys"). That
fix stopped the caller **naming** a key. It did not bound how many keys one caller can be **issued**.
**The `voter_key` sybil is still open; only its spelling changed.**

### 2.2 The same door forges the public efficacy ledger · **P0, highest consequence in this audit**

**VERIFIED — API run + HYDRATED render.**

```
4 × POST /api/experiments/outcome {"problemId":"knee-pain","rootCauseId":"patellofemoral-pain","outcome":"better"}   (no cookie jar)
GET /api/ledger?problem=knee-pain&rc=patellofemoral-pain
→ {"total":4,"running":0,"better":4,"same":0,"worse":0}
GET /api/stats
→ {"experiments":4,"improved":4,"helped":4}
```

HYDRATED `/protocol/knee-pain/patellofemoral-pain`, `#adoption-panel`:

```json
{"adoption":"🧬 4 people are building this plan","visible":true}
```

Four `curl` calls produced a reader-visible sentence asserting that four people are on a knee
protocol, and a public aggregate saying 4 of 4 improved. Product constraint 5 (never fabricate
counts) and the standing "no aggregate efficacy statistic" rule are both defeated from a shell loop.

**Honest counterweight, so this is not overstated:** `GET /api/outcomes/public` (server.js:1275),
which renders the *"X% of N people reported improvement"* sentence (`app.js:5095`), counts
`COUNT(DISTINCT user_id)` from `outcome_checkins` and floors at `n < 20`. Accounts require Google
sign-in (`/api/register` is closed by default — `ALLOW_PASSWORD_REGISTRATION`, server.js:1202).
**That statistic is genuinely protected.** The two that are not — the adoption line and the Results
Ledger — are the anonymous-keyed ones.

### 2.3 A fork author farms their own clone count and their own reputation · **P1**

**VERIFIED.** `server.js:1940` awards the fork author 5 points per distinct `voter_key`, and the
comment above it explicitly says the old unbounded version was fixed. Executed:

```
POST /api/forks  (signed in as @farmer)                        → {"ok":true,"id":1}
6 × POST /api/forks/1/clone   (no cookie jar, 4 s apart)
SQL: protocol_forks → 1 | My variation | clones=6
     fork_clones    → 6 distinct voter_key
     users          → farmer | reputation_points = 83
     rep_events     → fork_clone | 6 rows | 30 points
```

`clones` is the sort key of `GET /api/forks/popular` and of the "MOST USED" studio index
(`idx_studio_used`, db.js:585).

### 2.4 The same trick inflates a **published, public** protocol's "how many people started it" · **P0**

**VERIFIED, and this one is already on a live public page.**

```
POST /api/protocols  {"title":"QA farm protocol","status":"published", …}  → code WsRvM8yP
5 × POST /api/protocols/WsRvM8yP/clone  (no cookie jar)  → {"ok":true,"counted":true} × 5
GET /api/u/farmer
→ {"user":{"username":"farmer","joined":"2026-08"},
   "published":[{"code":"WsRvM8yP","title":"QA farm protocol","clones":5,…}],
   "clonesMean":"How many people started it. Not how well it worked — nothing here measures that."}
```

The endpoint ships a sentence guaranteeing what `clones` means, next to a number that means nothing.
The sentence is the aggravating factor: `/u/<handle>` is the page v1.9 §5 turns into a creator
landing page and §4.4 turns into comment identity. **Every Champion, helpfulness and Credit rule in
§4 would be computed from counters that one laptop can move.**

### 2.5 `/api/rep` mints reputation for asserting you did something · **P1**

**VERIFIED.**

```
POST /api/rep {"kind":"share"}    → {"ok":true,"reputation_points":38}   (+10; idempotent, repeats do not add)
POST /api/rep {"kind":"food_log"} → {"ok":true,"reputation_points":43}   (+5)
```

I shared nothing and logged no food. The daily `UNIQUE(user_id,kind,YYYY-MM-DD)` dedupe **works** —
credit where due — but the award is for a self-report. Combined with §2.3, `@farmer` finished this
audit on **83 points, 100 % self-generated from one machine**:

```
food_log |1| 5   fork |1| 10   fork_clone |6| 30   share |1| 10   vote |14| 28
```

`server.js:1632` already calls `reputation_points` *"a ledger of self-reported taps"* and removed it
from the public payload. **That judgement is correct and it is the single most important sentence in
this file: v1.9 §4.6 proposes to build a spendable currency on exactly this ledger.**

### 2.6 `votes.target_id` is unvalidated free text — the idempotency key is attacker-chosen · **P2**

**VERIFIED.** `clean(b.targetId, 120)` (server.js:1547) is checked against nothing. My 14 farm votes
carry ids like `farm12:rc:protocol` for pages that do not exist, each worth 2 reputation points, each
a permanent row. This is the identical bug shape as the 2026-08-01 `voterKey` finding, on the other
side of the unique constraint. No cap, no daily bucket, no taxonomy check.

---

## 3. v1.9 §4 requirement-by-requirement, against the repo

Status: **absent** (nothing) · **partial** (a related object exists but does not satisfy it) ·
**contradictory** (the repo or a gate actively refuses it) · **blocked** (needs a decision I cannot make).

| §4 requirement | repo status | evidence |
|---|---|---|
| §4.2 Community home (joined / empty state) | **absent** | `/community` → 404 (PRERENDERED, `curl` on :8099). No nav entry. `NOINDEX_ROUTES` (server.js:2943) and `PRIVATE_ROUTES` (app.js:9600) list 10 routes; `community` is not one. |
| §4.2 no invented participation count in the empty state | **contradictory** | the only participation counts that exist (`clones`, adoption, ledger) are all forgeable — §2.2/2.4. |
| §4.3 protocol-scoped Discussion, filters All/Questions/Alternatives | **absent** | no table keyed to `(problem_id, root_cause_id)` for discussion. `protocol_forks` is keyed that way but is a *stack*, not a thread. |
| §4.3 context strip with Day/status/streak/Boost | **partial + contradictory** | streaks exist (`experiment_checkins` + `streakFromDays`, server.js:414) but are **per-participant and private**; publishing them on a comment fails `assertProfileDisclosesOnlyPublished` (it bans `experiments` and `studio_clones` from any handle-keyed payload). Boost does not exist (`/usr/bin/grep -aic boost server.js` → 0). |
| §4.4 comment identity: handle + relationship + consented Day/streak | **blocked** | needs a per-post consent record that does not exist, *and* needs the disclosure gate widened. See §5. |
| §4.4 **Champion** = completed the published completion rule + recorded a private goal check | **absent** | no completion rule object, no `champions` table, no `badges` writer (`addBadge()` deleted 2026-08-08, server.js:398; `users.badges` is `[]` on every row and a build gate keeps it off the wire). |
| §4.4 Champion never weights a vote / never multiplies Credits | **satisfied by absence, at risk** | nothing weights anything today. The risk is the demo: at **t≈34 s** `@MinaL` carries `STRONGER KNEES CHAMPION` on the accepted answer, directly above `ACCEPTED IMPLEMENTATION HELP` and `+32 helpful` — visually the title *is* the reason the answer won. §4.4's rule is a code rule; the demo's layout teaches the opposite. |
| §4.5 alternatives: affected action + version + contributor + review state + acceptance reason + compatibility | **partial (≈15 %)** | `protocol_forks` has `title`, `note`, `stack[]`, `user_id`, `clones`. It has **no** action binding, **no** version, **no** review/acceptance state, **no** accepter, **no** compatibility constraint. `studio_protocols` has `parent_code`/`depth`/`spec` diffs (a real remix chain) but no acceptance concept at all. |
| §4.5 never collapse compatible alternatives into one winner | **contradictory** | `/api/forks/popular` and `idx_studio_used` sort by `clones DESC` and nothing else, i.e. exactly one winner, ranked by a forgeable counter. |
| §4.6 Helpful / Not helpful **on a comment** | **absent** | `votes` targets a page, never a post. No FK from `votes` to `explain_posts` or `comments`. |
| §4.6 `net = max(0, valid↑ − valid↓)` | **contradictory** | the shipped widget renders `👍 0` and `👎 4` **as two separate raw numbers** (`paintVote`, app.js:8647) and then adds a *worse-than-negative* editorial badge. There is no net, and there is no floor. |
| §4.6 no Credit for posting; settle after independent checks; exclude the author's own vote | **contradictory** | `/api/rep` pays for a self-report (§2.5); `award(vu.id,'vote',targetId)` pays the *voter* 2 points per vote (server.js:1573); a fork author is paid for their own clones (§2.3). Every one of the three rules is inverted in the shipped code. |
| §4.6 daily and issue-specific caps server-side | **partial** | daily caps exist for `food_log`/`share` only (the `YYYY-MM-DD` ref). `vote`, `fork`, `fork_clone`, `outcome` have **no cap of any kind**. |
| §4.6 pending / settled / reversed | **absent** | `rep_events` has no state column and no reversal row type. See `economy_abuse_audit.md` §3. |
| §4.7 authored urgent/safety signals bypass publication | **absent** | `/api/explain` POST applies zero classification, zero authored-hazard match, zero moderation hold. `studio-safety.js` (337 lines, 5 mirrored build gates) is a *protocol-save* engine and is not wired to any text path. |
| §4.7 the participant is told whether the draft was saved / discarded / escalated | **absent in repo; wrong in prototype** | prototype always says discarded (C4 above). |
| §4.7 community cannot alter doses, contraindications, stop rules | **satisfied, and well** | the only write path to protocol content is `/api/protocols`, which runs `STUDIO.validate()` and returns 422 with the engine's own text (server.js:1782–1786). Restricted compounds are withheld at build time. This is the strongest thing in the community lane and must not be relaxed for "alternatives". |

---

## 4. What the owner's demo actually asks for (timecoded)

Source: `/Users/admin/Downloads/RNAwiki_protocol_builder_demo.mp4`, 52 s, 1920×1080, 25 fps.
Frames at `/Users/admin/.claude/jobs/b8afc277/tmp/qa/out/demo/`.

| timecode | what is on screen | reading |
|---|---|---|
| 00:00–00:26 | canvas builder: `One problem.` → `Each cause opens its own plan. Movement, supplements, food.` → `A different cause needs the opposite instruction.` (f_01, f_09, f_12) | the demo is 3⁄4 **builder**. Community is the last quarter. |
| **≈00:34** (f_18) | `Community` — "PROTOCOLS AND PEOPLE"; a `NEEDS YOU` row: *"12 people need an equipment-free option · Supported split squat · 3 existing alternatives may fit"*; a thread `@noah.walks  DAY 16 OF 28 · 7-DAY STREAK` → `@MinaL  STRONGER KNEES CHAMPION`, tagged `ACCEPTED IMPLEMENTATION HELP`, `+32 helpful`. Caption: **"Answer somebody, and it gets marked helpful."** | this is v1.9 §4.3/§4.4 almost exactly, and it predates the spec. **The owner's model is real.** Note what it is *not*: no feed, no follower count, no DM. Good. |
| **≈00:40–00:44** (f_21, f_23, crops d_06→d_12) | right rail: `CLOSED-LOOP BALANCE` / **825 → 840** / `CREDITS FOR CONFIRMED HELP`, with `Teal training jacket · 180 Credits` and `White court trainers · 140 Credits` **in the same card**. Captions: **"Helping earns credits."** then **"And credits are something you wear."** | see `economy_abuse_audit.md` §2 — one balance, no pending state, spendable in the same viewport. |
| **≈00:44** (f_23) | account card: `Felix · @felix · Day 8 of Stronger knees` · `Style Lv 4 · participation style` · `Evidence Basics Champion` | **the P0 privacy collision, in the owner's own intent**: a protocol title + day is on a profile card. See §5. |
| 00:50 (f_26) | `One problem. Six causes. Six different plans.` / `Being built in the open. rnawiki.com/join` | note `/join` — `curl :8099/join` is not in the built route set; the demo advertises a route the site does not serve. Flagged for the IA agent, not mine. |

**Where v1.9 already corrects the demo, and correctly:** `Style Lv 4 · participation style` → `Avatar
Level` (§5.6); one balance → settled + pending (§4.6); `+32 helpful` → net floored at zero (§4.6).
**Where the demo is better than v1.9:** the `NEEDS YOU` row states a *concrete unmet need with a
count and an existing-alternative count* — that is a better entry into §4.2's "What people are
discussing today" than the spec's abstract phrasing, and it is the only thing in either artefact
that makes answering feel obligatory rather than optional.

---

## 5. The privacy collision nobody has written down · **P0**

v1.9 wants, on a **public** comment and a **public** profile: handle, avatar, Avatar Level,
`Day {n}`, current streak, Champion title, Active Journey title/status, net helpful count
(§4.4, §5.2, §5.3, §9.1).

This repository ships a **build gate that fails the deploy** if a handle-keyed payload can reach any
of that. `build/parse.js:3634 assertProfileDisclosesOnlyPublished()`:

- **(1)** `GET /api/u/:handle`'s body is scanned for 7 banned patterns; `user_plans|experiments|studio_clones`
  is one of them, with the stated reason: *"a table that records what somebody FOLLOWS. '@alice
  follows the herpes protocol' is a health disclosure about a named person. There must be no code
  path from a handle to it."*
- **(2)** the literal words `avatar|profile_pic|profile_photo|headshot|real_name|display_name` are
  banned from **any non-comment line of `server.js`, `site/app.js`, `db.js`**.
- **(3)** `NOINDEX_ROUTES` (server.js:2943) and `PRIVATE_ROUTES` (app.js:9600) must match; both are
  `['admin','me','p','pro','progress','pros','s','stewardship','studio','u']`.

I proved the gate is live rather than decorative, in a **scratch copy of the tree** at
`/Users/admin/.claude/jobs/b8afc277/tmp/qa/out/w19_gate` (product code untouched):

```
baseline:  [parse] profile disclosure gate OK — … 0 avatar/real-name fields in 3 files …
inject:    ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_state JSONB …;
           ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_level INTEGER …;
result:    [parse] PROFILE DISCLOSURE GATE FAILED — refusing to build.
             ✗ db.js:34 — an avatar, photograph or real-name field …
             ✗ db.js:35 — an avatar, photograph or real-name field …
```

`parse.js` is `prestart` and is a hard deploy gate (CLAUDE.md), so this stops a Railway deploy.

And three reader-facing sentences already promise the current behaviour:

- `site/app.js:8922` (`/u/<handle>`): *"A username is the only thing the site knows about the person
  who wrote these — no real name, no photograph."*
- `site/app.js:9047` (`/me`): *"RNAwiki has never asked you for your real name and holds no
  photograph of you."*
- `site/app.js:9451` (the publish sheet, shown **before** the publish tap): *"Your username is the
  only thing about you that goes with it… **Nothing you plan, log or follow is published** — not by
  this and not by anything else."*

**v1.9 §4.4 and §5.3 make all three of those sentences false.** This is not a bug to route around; it
is a product decision the owner has to take with his eyes open, and it needs to be taken *before* any
of §4 is built, because the disclosure surface is what the whole Champion/helpfulness model hangs
from. **See `needsHumanApproval` in the summary.**

---

## 6. Recommended sequence (no code written; this is a spec for whoever integrates)

1. **Close `/api/explain` or give it a product.** It is a public write sink with no reader.
   Either delete the POST handler (the client has already moved on) or make it the §4.3 thread —
   but it cannot stay as it is for another release. Gate it: an assertion that every write endpoint
   in `server.js` has ≥1 caller in `site/*.js`, proven by reintroducing `/api/explain`.
2. **Fix the sybil before anything is built on a count.** The one-line shape: never mint an anon
   identity on a *counting* write; require an identity that already existed before the request
   (cookie present, or account). Then re-run §2.1–§2.4 — each must fail to move the number.
   This is the prerequisite for Champion, helpfulness, Boost and Credits alike.
3. **Do not carry `rep_events` forward into Credits.** Start a new ledger with
   `state ∈ {pending,settled,reversed,expired,refunded}` and an idempotency key the *server* owns.
   `rep_events` should be read-only-frozen, not extended. (Detail in `economy_abuse_audit.md`.)
4. **Take the disclosure decision (§5) before designing comment identity.** If the answer is "no
   public Day/streak", §4.4 shrinks to handle + relationship, and most of v1.9 §4 still works.
5. **Deletion and reporting before reactions.** A community whose posts cannot be deleted, reported
   or hidden cannot honour §4.6's "deleted/hidden content loses eligibility", and cannot honour
   PDPA. This is cheaper to build first than to retrofit.
6. **Replace `👍 n / 👎 n` with §4.6's `max(0, ↑−↓)` on the protocol widget** and delete the
   editorial badge, or keep the badge and require a non-forgeable identity. Not both as they are.

---

## 7. Reproduction

```bash
docker run -d --name rw_qa_pg -e POSTGRES_PASSWORD=qa -e POSTGRES_DB=rwqa -p 55433:5432 postgres:16-alpine
cd "/Users/admin/ClaudeRepo/Claude Projects/rnawiki"
DATABASE_URL='postgres://postgres:qa@127.0.0.1:55433/rwqa' PORT=8098 node server.js &
# §2.1
for i in 1 2 3 4; do curl -s -X POST -H 'Origin: http://localhost:8098' -H 'Content-Type: application/json' \
  -A 'Mozilla/5.0 … Chrome/126.0 …' \
  -d '{"targetId":"knee-pain:patellofemoral-pain:protocol","value":-1}' http://localhost:8098/api/votes; done
node /Users/admin/.claude/jobs/b8afc277/tmp/qa/out/w19_badge.mjs     # renders the badge
node /Users/admin/.claude/jobs/b8afc277/tmp/qa/out/w19_adopt.mjs     # renders "N people are building this plan"
docker rm -f rw_qa_pg
```

Scripts written for this audit (scratch only, no product code touched):
`out/w19_badge.mjs`, `out/w19_adopt.mjs`, `out/w19_interest.mjs`, `out/w19_gate/` (tree copy),
`out/demo/` (video frames), `out/w19_srv.log`.
