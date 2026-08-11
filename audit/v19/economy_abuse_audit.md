# RNAwiki v1.9 — Economy / anti-abuse audit (WAVE A, read-only)

**Author role:** Economy + anti-abuse specialist
**Date:** 2026-08-11 · branch `refine/site-wide-2026-08` · no product code changed
**Scope:** v1.9 §4.6 (Credit ledger, pending/settled/reversed, caps, collusion, self-voting, bot
prevention), §4.6 Community Boost, §4.6 Money Tree, §14 gates V19-DIS-004 / V19-REW-001 /
V19-GOV-002; the repo's `rep_events`, `votes`, `fork_clones`, `studio_clones`, `helped_people`,
`experiments`, `referrals`, `interest_signups`.

Evidence method, labels and the throwaway-Postgres harness are described in
`community_reputation_audit.md` §0. Nothing here touches production.

---

## 1. Headline

**There is no economy in this repository. There is a reputation ledger that pays for self-reports
and for counters one laptop can move, and v1.9 §4.6 proposes to make that ledger spendable.**

Measured, not assumed — case-sensitive occurrence counts across the product code:

| term | `server.js` | `site/app.js` | `site/styles.css` |
|---|---:|---:|---:|
| `credit` / `Credit` | 1 | 11 | 1 |
| `money tree` | 0 | 0 | 0 |
| `boost` | 0 | 2 | 0 |
| `marketplace` | 0 | 3 | 0 |
| `entitlement` | 0 | 0 | 0 |
| `inventory` | 0 | 0 | 0 |
| `refund` | 0 | 0 | 0 |
| `pending` / settlement state | — | — | — |

**VERIFIED** that every one of those hits is unrelated: `fig-credit` (figure captions, e.g.
app.js:909, 3050, 3147), "credited to you" in the suggestion modal (app.js:4846, 4857), `equipment`
(app.js:4613, 8710, 9345), `ampk … boosts fat-burning` (app.js:1835), `performance boost`
(app.js:1180), and `online marketplace` inside the **prescription-only warning** string
(app.js:523 — *"Buying it from an online marketplace or an overseas seller is unsafe"*).

So: `/community`, `/marketplace`, `/credits` all return **404** (PRERENDERED, `curl :8099`). There is
no ledger table, no balance, no state machine, no Boost, no Money Tree.

**That is the good news.** Nothing wrong has shipped to a wallet, because there is no wallet. The
whole of §4.6 is greenfield, and this audit's job is to stop it being built on the foundation that
is already here.

---

## 2. The owner's demo shows the exact model §4.6 forbids

`/Users/admin/Downloads/RNAwiki_protocol_builder_demo.mp4` — frames at
`/Users/admin/.claude/jobs/b8afc277/tmp/qa/out/demo/`. This is the owner's own intent and the brief
says to treat it as such, so the divergence has to be recorded rather than glossed.

| timecode | frame | what the demo shows |
|---|---|---|
| ≈00:34 | f_18 | an accepted answer carrying `+32 helpful` and `ACCEPTED IMPLEMENTATION HELP`, caption **"Answer somebody, and it gets marked helpful."** |
| ≈00:40 | f_21, crop d_06 | right rail: `CLOSED-LOOP BALANCE` · **`822`** · `CREDITS FOR CONFIRMED HELP`; directly below, `Marketplace` with `Teal training jacket 180 Credits` / `White court trainers 140 Credits`. Caption **"Helping earns credits."** |
| ≈00:43–44 | crops d_12, d_16; f_23 | the same number has animated to **`840`** and stayed there. Caption **"And credits are something you wear."** |

Four divergences from v1.9 §4.6, each concrete:

1. **One number, not two.** §4.6 requires *settled* and *pending* to be distinct and pending to be
   unspendable. The demo shows a single `CLOSED-LOOP BALANCE`. A user watching this learns
   "help → balance goes up → buy jacket". Retrofitting a pending state onto that mental model after
   launch is the "users feel cheated" failure the earlier audit predicted (its §3.1 P1) — and the
   demo is *why* it will happen, which that audit did not connect.
2. **Instant settlement, in-frame.** The balance moves within ~3 s of the helpful action and the
   prices are in the same card. §4.6: *"settle only after independent, valid feedback and anti-abuse
   checks"*, *"pending Credits are not spendable"*.
3. **`CREDITS FOR CONFIRMED HELP` asserts a check that has no mechanism.** "Confirmed" is the exact
   word §4.6 reserves for a settled, independently-validated award. Nothing in the demo or the repo
   confirms anything. Under product constraint 5 this is a claim about a process that does not exist.
4. **"Credits are something you wear"** collapses earn → spend → identity into one sentence. §5.6
   requires the opposite: *"Eligible actions and Marketplace transactions remain separate ledgers"*
   and Avatar Level *"is not health, strength, attractiveness, expertise, popularity, protocol
   performance, or fitness"*.

**Verdict:** the demo is a valid statement of *desire* (help should be worth something, and the
reward should be visible and wearable). It is not a valid statement of *mechanism*. v1.9 §4.6 is the
corrected mechanism, and the correction is real work, not copy-editing. **The demo must not be used
as the acceptance criterion for the Credit UI.**

---

## 3. `rep_events` measured against v1.9 §4.6 — and why it cannot be the Credit ledger

`db.js:102`:
```sql
CREATE TABLE rep_events (id SERIAL PK, user_id INT, kind TEXT, ref TEXT, points INT,
                         created_at TIMESTAMPTZ, UNIQUE(user_id, kind, ref));
```
Writer: `award()` at `server.js:388` — insert `ON CONFLICT DO NOTHING RETURNING id`, then
`UPDATE users SET reputation_points = reputation_points + $1` only if a row was created.

| §4.6 / §14 requirement | `rep_events` today | verdict |
|---|---|---|
| **append-only** | yes — no UPDATE or DELETE anywhere (`/usr/bin/grep -an "rep_events" server.js` → 3 hits: 1 INSERT, 2 reads) | **satisfied** |
| **idempotent** | yes, via `UNIQUE(user_id,kind,ref)` | **satisfied in form, broken in substance** — see §4.1 |
| **pending / settled / reversed / expired / refunded** | **no state column at all.** Every row is final at insert. | **absent** |
| **reversal as an append-only entry** | impossible: `points` is the only value column and `users.reputation_points` is a denormalised running total updated in the same non-transactional call. A reversal would need a negative row *and* a compensating UPDATE, with no transaction wrapping the pair. | **absent, and structurally hostile** |
| **settle only after independent checks** | `award()` runs synchronously inside the request that caused it. There is no queue, no delay, no reviewer, no second signal. | **absent** |
| **author's own vote excluded** | inverted — `/api/forks/:id/clone` pays the fork's **author** for clones the author can generate himself (VERIFIED, `community_reputation_audit.md` §2.3: 6 self-clones → +30) | **contradictory** |
| **no Credit merely for posting** | inverted — `award(u.id,'comment',id)` = 3 points per comment (server.js:1487); `award(vu.id,'vote',targetId)` = 2 points per vote cast (server.js:1573) | **contradictory** |
| **daily and issue caps server-side** | partial: only `food_log` (5) and `share` (10) use a `YYYY-MM-DD` ref, so only those two are capped. `vote`, `comment`, `edit`, `fork`, `fork_clone`, `outcome`, `proposal`, `merged` have **no cap** | **partial** |
| **coordinated / serial / ring / sock-puppet detection** | none. No IP, device, timing, account-age or graph signal is recorded on an award. There is no `ip`, `user_agent` or `session` column anywhere in the ledger. | **absent** |
| **verified-email / account-age friction before a reaction counts** | `users.email` is never verified (server.js:495 says so); Google sign-in is the only open path, which is real friction — but no age or reputation threshold gates any award | **partial** |
| **material-edit versioning: votes stay attached to the version they evaluated** | absent — `votes.target_id` is a string; nothing versions | **absent** |
| **plagiarism / duplicate detection** | absent | **absent** |
| **transparent "voting corrected" ledger text** | absent (nothing to correct with) | **absent** |
| **appeals / moderator audit record** | absent | **absent** |

### 3.1 `reputation_points` is not published — and that is the only reason none of this is P0 today

`GET /api/u/:handle` (server.js:1605) deliberately drops it, and `build/parse.js:3634`
**fails the build** if it comes back:

> `reputation_points` — *a ledger of self-reported taps: POST /api/rep accepts kind ∈ {food_log,
> share} and nothing else… Publishing a score built from "I tapped a button today" as standing, to
> an audience of three accounts, is a status fiction.*

That judgement is correct and it is the load-bearing conclusion of this audit:
**v1.9 §4.6 proposes to give that number purchasing power.** The repo already decided the number is
not fit to be *shown*. It is certainly not fit to be *spent*.

**Recommendation (P0 for the build order, not a live defect):** freeze `rep_events` read-only. The
Credit ledger is a new table with, minimally: `id`, `account_id`, `event_type`, `source_ref`
(server-minted), `amount`, `state ∈ {pending,settled,reversed,expired,refunded}`,
`state_changed_at`, `reverses_id` (self-FK, nullable), `idempotency_key UNIQUE` **derived
server-side from data the caller cannot choose**, `engine_version`, `risk_signals JSONB`. And
`users.credit_balance` must **not** exist as a denormalised column — the balance is `SUM(amount)
WHERE state='settled'`, or the first reversal desynchronises it exactly the way `reputation_points`
would today.

---

## 4. Anti-abuse: what is actually shipped, tested

### 4.1 The idempotency keys are attacker-supplied · **P0 for the economy, P1 today**

Every "one per person" guarantee in this codebase is `UNIQUE(x, voter_key)` or
`UNIQUE(user_id, kind, ref)`. Both halves are reachable by the caller:

**(a) `voter_key` — the identity is minted on demand.** `resolveParticipant()` (server.js:462) calls
`anonMint(res)` (server.js:457) whenever the request has no valid `rw_pid` cookie. A cookieless
client gets a **new** signed identity **per request**. VERIFIED:

```
5 × POST /api/votes (no cookie jar) → SQL: 5 rows, 5 distinct voter_key on one target_id
6 × POST /api/forks/1/clone         → clones=6, 6 distinct voter_key, +30 rep to the author
5 × POST /api/protocols/<code>/clone→ clones=5, published on GET /api/u/farmer
4 × POST /api/experiments/outcome   → GET /api/ledger → {"total":4,"better":4}
```

`server.js:426` records the 2026-08-01 fix that stopped the caller **naming** its key. It did not
bound how many keys one caller is **issued**. The comment reads as if the class is closed; it is not.
This is the finding I would most want re-verified by whoever fixes it, because the fix is subtle:
minting must move out of the counting write.

**(b) `ref` — the dedupe key embeds caller data.** `votes.target_id` is `clean(b.targetId, 120)`
with no allowlist (server.js:1547), and `award(vu.id,'vote',targetId)` uses it as the `ref`.
VERIFIED: 14 votes on invented ids (`farm3:rc:protocol`, …) each minted 2 points and a permanent
row. `fork_clone`'s ref is `'forkclone:'+id+':'+voterKey` — half caller-influenced by (a).

**The only rate control in front of all of it** is per-IP: `RL_BURST = 15`,
`RL_REFILL_MS = 4000` (server.js:873–875) → ~15 writes/min sustained. It bit me during testing
(20 attempted votes → 14 landed), so it is real. It is also the *only* thing standing between the
site and unlimited fabricated counts, and it is defeated by any residential proxy pool, or by
patience: 15/min × 10 min = 150 identities per IP per 10 minutes.

Supporting controls, honestly stated: `sameOrigin()` (server.js:899) requires `Origin` or `Referer`
to match `Host` — real CSRF protection, trivially forged by a script; `looksAutomated()`
(server.js:909) blocks a default `curl`/`python-requests` UA — a one-flag bypass. Both are labelled
"speed bump only" in the code, correctly.

### 4.2 What is genuinely well built (do not regress these)

- **`/api/outcomes/public` (server.js:1275)** — the *"X% of N reported improvement"* statistic counts
  `COUNT(DISTINCT user_id)` and returns `{stat:null}` below `n < 20`. Accounts need Google sign-in
  (`/api/register` closed by default, server.js:1202). **VERIFIED protected**: my anonymous forgeries
  cannot reach it. This is the one place the k-anonymity + account-binding pattern was applied, and
  it is the pattern the whole economy should copy.
- **`countOnce()` (server.js:928)** — GET-side counters are deduped per `(ip, kind, target)` per 6 h
  and skipped entirely for automated UAs. Correct shape.
- **`interestAllow()` (server.js:958)** — 10 stored addresses per IP per 24 h, in memory, never
  written down. Correct shape, and the comment explaining why it is a *separate* bucket from
  `rateAllow` (so a flood cannot exhaust a real reader's write budget) is the right instinct and
  should be repeated for every economy write.
- **Publishing requires an account** (server.js:1779) while building, saving and running do not —
  exactly the anonymous-first line product constraint 3 asks for.
- **`studio_clones` awards no reputation.** The newer table learned from the older one. Keep it.

### 4.3 Collusion / self-dealing, concretely

| §4.6 vector | reachable today? | evidence |
|---|---|---|
| self-vote | **yes** | nothing compares `votes.voter_key` to the target's author; the target is a page, so there is no author to compare to — and for forks the author is paid directly (§4.1(a)) |
| serial voting (one actor, many targets) | **yes, unbounded** | 14 votes/14 targets in one session, +28 points, no cap on `kind='vote'` |
| ring / reciprocal | **untestable and undetectable** | no signal is recorded on an award: no IP, no device, no timing, no referrer. A ring would leave literally no trace in `rep_events`. |
| duplicate / plagiarised content | **yes** | no dedupe on `explain_posts.body` or `protocol_forks.title` |
| creator accepting their own contribution | **n/a today** (no acceptance concept) — **but** §4.5's "who accepted it and why" plus §4.6's "creators and managers cannot settle a reward by accepting their own content" both need a separation-of-parties record that has no home in the schema |
| referral farming | **yes** | `referrals` (db.js:382) is `UNIQUE(participant)` — first-touch, good — but `participant` is a `voter_key`, so §4.1(a) mints referred "people" on demand. `server.js:429` records that this exact path once minted 25 points per forged key. |

### 4.4 Denial-of-service on the anonymous path · **P1**

Covered in `community_reputation_audit.md` §1.2 and repeated here because it is an anti-abuse
finding: the anonymous `explain_posts` throttle (server.js:1172) is a **global** 20-per-10-minutes
bucket with no slug, IP or participant dimension. **VERIFIED end-to-end through the public API**:
20 anonymous posts from one IP → every other anonymous poster site-wide gets 429, and the error text
tells them to create an account. Any global counter used as a rate limit is a griefing primitive;
the economy must not add another.

---

## 5. Community Boost (§4.6) — nothing exists; three traps to avoid

Nothing named `boost` exists in the product (measured, §1). The prototype shows it as
`Boost 1.08×` in the Discussion context strip
(`RNAwiki_Community_Discussion_Desktop_Prototype_v1_9.html:46`) and on the profile Core card
(`RNAwiki_Profile_Desktop_Prototype_v1_9.html:45`), which matches §4.6's "protocol surfaces show only
the current Community Boost and its small info control". Good.

1. **The 1.08× is an illustration and the spec says so** (§4.6: *"an interaction example — not an
   approved production formula"*). The prototypes render it as a fact on two surfaces. If the copy
   ships as-is, RNAwiki is telling a reader a multiplier that no code computes — a fabricated number
   under constraint 5. **Do not ship a number until a formula exists.**
2. **Boost is defined over "unique verified eligible action activity"** (earlier audit §8.6). The
   only per-person activity signals in the repo are `experiment_checkins` and `studio_clones`, both
   keyed to `voter_key`, i.e. both forgeable per §4.1(a). **Boost inherits the sybil.** A protocol
   owner could sit their own protocol at the 1.10× cap from one machine.
3. **The eligible-completion carve-out is the whole safety of it.** §4.6 is explicit that posts,
   reactions, patches, purchases and payments neither increase nor receive the multiplier. That
   separation must be a **column constraint** (`event_type IN (…)` on the multiplied set), not a
   convention, or the first refactor merges them.

---

## 6. The Money Tree (§4.6, gate V19-REW-001) — specified, prototyped nowhere

**VERIFIED:** `"money tree"` appears **0 times in all 16 prototype HTML files** and 0 times in the
product code. Yet §14 lists it as a release gate:

> `V19-REW-001 | One truthful Money Tree | Credits/Marketplace | visualization exists only in global
> help, matches the settled ledger/multiplier, never implies cash or health change, and never
> punishes missed days`

So there is a release gate over an artefact no prototype contains and no test can target.
**A gate over an empty set always passes** — that is this project's own recorded lesson from round 6.
Either the Money Tree gets a prototype in the v1.9 pack, or V19-REW-001 must be struck from §14
until it does. Recording it as a **spec-internal contradiction**, not a repo defect.

If it is built, §4.6's constraints are unusually well chosen and worth keeping verbatim: it must
visualise **settled only**, must show the exact numeric balance beside the picture, must not imply
cash value, and **must never shrink for a missed day** — that last one is a genuine self-harm/
compulsion guardrail, not decoration, on a health product.

---

## 7. Legal-clinical / regulatory dependencies (LEGAL-CLINICAL DEPENDENCY — not engineering calls)

1. **Closed-loop non-cash Credits redeemable for real-world services** (§5.6: haircuts, barbering,
   sneaker cleaning, equipment fitting) is a stored-value construct. In Singapore, whether it engages
   the **Payment Services Act 2019** (limited-purpose e-money exemptions turn on issuer, network and
   redemption scope) is a question for counsel, not for this file. §4.6's "any change to
   convertibility or cash value requires a new legal, payments, fraud, tax, labor and
   consumer-protection review" is the right posture; the review has to happen **before** the first
   real service is listed, not before the first cash-out.
2. **Earning a thing of value for health-related content** brings the Medicines (Medical
   Advertisements) Regulations into the community layer. Today no user text reaches a reader
   (`/api/explain` renders nowhere). The moment §4 ships, a paid contributor writing about a
   prescription-only medicine on rnawiki.com is a different regulatory object from an unpaid one.
   CLAUDE.md rule 7 already flags s.51 exposure; this widens it.
3. **PDPA:** the Credit ledger will hold purchase history and service bookings — §5.6 says these stay
   private. `/api/mydata` (server.js:1390) currently covers 5 tables and would need to cover them.
   And see the standing gap: `explain_posts` is in **neither** the export nor the erasure path today.
4. **Under-18.** §4.6/§5.6 introduce a reward loop and cosmetic body presentation. The earlier audit
   flags an 18+ production gate; **no age field exists anywhere in `db.js`** (`user_profile.age_band`
   is optional, research-consented and self-declared, so it cannot serve as an age gate). If the 18+
   claim is being made, it is currently unenforced. **VERIFIED absent.**

---

## 8. Removal scope: the collection-of-interest feature (owner's decision today)

The owner decided to remove it entirely. Measured state:

| surface | state | evidence |
|---|---|---|
| the landing form | **already gone (HYDRATED)** | Chrome at `:8099/`: 3 forms, all `action="/solve"` with a single `q` input; **0** `input[type=email]`; the word "interest" appears **0** times in `document.body.innerText`. |
| `/interest` route | **301 → `/`** | `curl -s -o /dev/null -w '%{redirect_url}' :8099/interest` → `http://localhost:8099/` |
| `POST /api/interest` | **live** | server.js:1045; registered **above** the `db.enabled` guard on purpose (server.js:1023). Answers 403 to a bare curl (same-origin guard), 303 from a real browser form post. |
| `POST /api/interest/remove` | **live** | server.js:1093 — this is the only path that can delete a row, via `remove_token` |
| `interest_signups` table | **live, recreated on every boot** | db.js:342. Confirmed created on the throwaway DB. |
| supporting code | `interest` occurs **42×** in `server.js`, **11×** in `db.js`, **20×** in `site/app.js`, **21×** in `build/parse.js`, **11×** in `build/prerender.js`, **9×** in `site/styles.css` | measured |
| topic vocabulary | 9 topics loaded at boot from `data/site_config.json` | server log: `[server] interest topics loaded: 9 (tiredness, low-back, neck-shoulder, hip, digestion, sleep, brain-fog, knee, other)` |

**Removal order that does not lose data or break a promise:**

1. **Do not `DROP TABLE` first.** `db.js:316–341` documents the consent reasoning: these rows carry
   consent to a *specific* purpose, and the page promised two e-mails and a removal token. Under PDPA
   the row is the auditable record. **Export first** (`SELECT count(*), min(created_at),
   max(created_at) FROM interest_signups;` then a full CSV), tell the people on the list the
   programme ended, *then* drop. This is Felix's call and is on the human-approval list.
2. **Keep `POST /api/interest/remove` alive until the table is gone.** It is the only deletion path;
   removing the endpoint before the rows strands them permanently — the exact mistake recorded for
   the newsletter unsubscribe link (db.js:294).
3. Then: delete the `POST /api/interest` handler, the 301, the `INTEREST_TOPICS` boot read, the
   `interest` block in `data/site_config.json`, the CSS, and the `parse.js`/`prerender.js`
   references — **and check whether any of those 21 `parse.js` hits is an assertion**, because
   deleting the subject of a gate turns it into a vacuous pass (this repo's own recorded lesson).
4. Remove the CREATE from `db.js` last, following the `newsletter_subscribers` / `telegram_*`
   precedent already applied twice in this file.

---

## 9. Prototype defects in scope (v1.9 pack)

| # | file:line | defect | severity |
|---|---|---|---|
| E-P1 | `RNAwiki_Community_Discussion_Desktop_Prototype_v1_9.html:108` | user-facing copy states unapproved caps as policy: *"Eligible settlement is capped at 25 Credits per comment, 75 a day and 300 in seven days."* Those figures come from the earlier audit's §8.3, which says in the same breath that they *"need product-economics and legal approval"*. | P1 — fabricated policy |
| E-P2 | same file:46; `Profile…:45` | `Boost 1.08×` rendered as fact; §4.6 says it is an example, not a formula | P1 — fabricated number |
| E-P3 | same file:111 | `sensitiveText` regex matches `medicine\|medication\|dose`, and the match path destroys the draft (*"Your draft was not posted and has been discarded."*). A user asking *"what time of day do I take the dose?"* loses their text. §4.7 allows saved-privately / discarded / escalated; the prototype hard-codes destruction. | **P0 — data loss + safety mis-route** |
| E-P4 | all 16 prototypes | no Money Tree exists, yet §14 gates it (V19-REW-001) | P2 — untestable gate |
| E-P5 | `Community…:105`, `Discussion…:110` | Marketplace modal correctly says *"No service request or booking is available in this prototype"* and *"Provider, quote, Credit hold, cancellation, refund and fulfilment controls must exist before launch."* | **not a defect — this is the standard the rest of the pack should meet** |

---

## 10. Build order for the economy (spec only; no code written)

1. **Nothing spendable until the sybil is closed.** Concretely: an anonymous identity must be minted
   by a *read* (or an explicit "start" the user takes), never by the counting write itself, and the
   counting write must reject a request whose identity was created in the same request. Prove it by
   re-running the four §4.1 loops — each must leave the counter at 0.
2. **New ledger table, `rep_events` frozen.** Shape in §3.1. No denormalised balance column.
3. **Every award event carries a risk envelope** (`ip_hash`, `ua_class`, `account_age_days`,
   `time_since_source_event`) written at insert. Without it, §4.6's collusion reversal is
   unimplementable retroactively — you cannot reverse a ring you have no data about.
4. **Separation of parties as a constraint, not a convention**: `award.beneficiary_id != award.actor_id`
   and `acceptance.accepter_id != contribution.author_id`, enforced in SQL.
5. **Build gates, in the house style.** Four candidates, each provable by reintroducing its bug:
   - `assertNoUnstatedCreditValue()` — no numeric Credit/multiplier literal in user-facing copy that
     is not read from one config object (kills E-P1/E-P2 permanently).
   - `assertLedgerAppendOnly()` — no `UPDATE`/`DELETE` against the credit ledger in `server.js`.
   - `assertNoAnonMintOnCountingWrite()` — the counting endpoints do not call the minting path.
   - `assertSeparateLedgers()` — no code path lets a Marketplace transaction write an
     eligible-action event, or vice versa (§5.6's hard boundary).
6. **Only then**: Boost, then Marketplace, then Money Tree. In that order, because each depends on
   the previous one being honest.
