# RNAwiki v1.9 — Profile & creator-discovery audit

**Role:** Profile / creator-discovery specialist · WAVE A · READ-ONLY
**Date:** 2026-08-11 · **Branch:** `refine/site-wide-2026-08` · tree clean, 27 improvements unpublished
**Audited against:** `RNAwiki_Unified_Desktop_Experience_v1_9_Spec.md` §5 (Profile and creator landing),
§9 (Public/private contract), §13.2–13.4, §16 rows `V19-PRO-001..004`, `V19-AVA-001..003`, `V19-PRI-001/002`
**Companion file:** `privacy_age_legal_triggers.md` (same directory) — every P0 lives there; this file
carries the profile-shaped findings and the §5 conformance table.

---

## 0. Two corrections to the brief, before anything else

**0.1 The brief cites the wrong section number.** The task brief says to audit *"v1.9 section 5 and
§6.3's public-projection invariants."* §6.3 of the source-authoritative Markdown
(`RNAwiki_Unified_Desktop_Experience_v1_9_Spec.md:576`) is **"Page chapters and companion rail"** for the
Exercise wiki. It contains no public-projection content. The public-projection invariants are **§9**
(`:699–724`), split into §9.1 *May be public after the relevant disclosure/consent* and §9.2 *Never
public*. I have audited against **§5 + §9**. Recorded per the instruction that a discrepancy is
followed to the Markdown and written down. **Status: verified** (read both sections).

**0.2 I nearly filed a false P0 and am recording the near-miss.** `server.js:2942` states:

> `assertPrivateRoutesAgree()` in build/parse.js fails the build if the two ever diverge.

`grep -rn "assertPrivateRoutesAgree" build/ server.js site/app.js db.js scripts/ docs/` returns **exactly
one hit — that comment itself.** My first conclusion was "the gate does not exist; the noindex lists are
hand-synced with nothing enforcing them." That conclusion is **wrong**. Reading
`build/parse.js:3676–3697` shows the check is real and is **part (3) of
`assertProfileDisclosesOnlyPublished()`** — it parses `NOINDEX_ROUTES` out of `server.js` and
`PRIVATE_ROUTES` out of `site/app.js` and `process.exit(1)`s on any asymmetry. Only the *name in the
comment* is wrong. Downgraded from P0 to **P3 (stale comment)**. This is the exact two-document /
"verify before asserting" trap AGENT_RULES warns about, and it is written down so the next agent does not
re-file it.

---

## 1. What actually exists today (measured, not assumed)

### 1.1 The public profile is `GET /api/u/:handle` + `renderPublicProfile()`

| Layer | Location | Verified how |
|---|---|---|
| Server payload | `server.js:1605–1661` | read |
| SPA renderer | `site/app.js:8901–8923` | read |
| Route dispatch | `site/app.js:10131` (`parts[0] === 'u' && parts[1]`) | read |
| Owner's private page | `site/app.js:8959` `renderMe()`, dispatched at `:10130` | read |
| Published-protocol page | `site/app.js:9505` `renderPublished()`, server `server.js:1892–1913` | read |
| Build gate | `build/parse.js:3634–3708` `assertProfileDisclosesOnlyPublished()` (IIFE, runs at module load) | read |

**The entire public projection, verbatim from `server.js:1652–1660`:**

```
user: { username, joined /* ISO slice(0,7) — MONTH, never the day */ }
published: [{ code, title, clones, published_at }]   // status='published' only, LIMIT 50
clonesMean: "How many people started it. Not how well it worked — nothing here measures that."
shows:      "Only what this account published on purpose. Nothing it reads, plans, logs or follows."
```

That is **four public fields**. Nothing else. `renderPublicProfile()` renders exactly those and adds one
static paragraph stating there is no credential, profession, rating or score.

### 1.2 Runtime verification status — be honest about this

`db.enabled` is false locally (no `DATABASE_URL`), so **every account-backed endpoint answers
`503 {"error":"Accounts are not available right now."}`.** Measured:

```
/api/u/felix                                             503
/api/contributors                                        503
/api/protocol-contributors?problem=…&rc=…                503
/api/pulse                                               503
/api/comments/recent                                     503
/api/shared-plan?code=abc                                503
```

**Every claim in this file about a JSON payload's shape is therefore a source read, labelled
`verified (source)`, not a runtime capture.** No JSON body in this audit was observed at runtime. The
route-shell measurements in §4 below *were* captured at runtime and are labelled `verified (measured)`.

---

## 2. §5 conformance table — Profile and creator landing

Spec §5.2 asks for a left identity rail and a three-block main column. Status of each element:

| §5 element | Spec line | Repo status | Evidence |
|---|---|---|---|
| Full avatar | `:470` | **absent — and actively gated against** | `parse.js:3665–3672` fails the build on any line matching `/avatar\|profile_pic\|profile_photo\|headshot\|real_name\|full_name\|legal_name\|display_name/i` in `server.js`, `site/app.js`, `db.js` |
| Name (real / display) | `:471` | **absent — same gate** | as above |
| Handle | `:471` | **present** | `server.js:1654` `username` |
| Concise description / bio | `:471` | **absent** | no bio column in `db.js` `users` |
| Edit name/description (owner) | `:472` | **absent** | `POST /api/profile/domain` removed 2026-08-08 (`server.js:1563`); the socials writer removed 2026-08-10 (`server.js:1574`) |
| Customize avatar · Marketplace | `:473` | **absent** | no Marketplace, no Credits, no entitlement table in `db.js` |
| Public Avatar Level | `:474` | **absent** | no level; `reputation_points` exists but is deliberately **off the wire** (`server.js:1624`, `parse.js:3651`) |
| Accomplishments | `:475` | **absent** | `addBadge()` deleted 2026-08-08; `users.badges` is `[]` on every row (`server.js:403`, `:1626`) |
| Public disclosures / links | `:476` | **absent — deliberately removed** | `users.socials` taken off `/api/u/:handle` 2026-08-10 with a written rationale (`server.js:1627–1631`) |
| **Coaching Core Protocol** (dominant) | `:480`, `:486` | **absent** | no "core" flag on `studio_protocols` (`db.js:562–580`) |
| **Active Journey** (optional, consented) | `:481`, `:487`, `:490` | **absent — and refused in writing** | see §3 |
| **Protocols by {Name}** with `Coaches` / `Helps manage` labels | `:482`, `:511–512` | **partial** | a flat list of *published* protocols only (`app.js:8913–8917`); no role model, no manager grant, no Champion |
| Participation band / exact count after threshold | `:497` | **partial, and safer than spec** | `clones` printed via `startedBy()` with the explicit "not how well it worked" caveat; **no k-threshold** on the count |
| Community Boost + info control | `:498` | **absent** | no boost anywhere |
| `Review & join` (visitor) | `:499` | **partial** | link to `#/p/<code>`; no join-review screen |
| `Manage Core Protocol` (owner) | `:500` | **absent** | |
| `Preview Day 1` (secondary) | `:501` | **absent** | |
| Remove clinical-review ticks + "Use this protocol as a starting point" | `:503` | **already satisfied** | `parse.js:3320` `assertNoCredentialClaims()`; `parse.js:3417` `assertOneAccountType()` |
| `Identity verified` label only on a real ownership check | `:505` | **N/A — no verification exists** | the only two code paths that could ever set `domain_verified = true` were deleted 2026-08-08 (`server.js:2553–2556`), so the flag cannot be granted by anyone including the owner |

**Score: 1 of 19 §5 elements fully present (handle); 4 partial; 14 absent.**

**This is the load-bearing conclusion of the profile audit, and it is not "build the other 14."**

---

## 3. HEADLINE FINDING — §5.3 Active Journey is the one thing the repo explicitly refused to build

**Status: verified (source). Severity: P0 (privacy) — but it is a *product decision*, not a defect.**

Spec §5.3 (`:487`, `:490`):

> One **Active Journey**: the protocol the account is personally following. […] Active Journey
> title/status is public only after per-enrollment confirmation.

`server.js:1642–1649`, in the `/api/u/:handle` handler, is a written refusal of exactly that feature:

> ```
> // ---- AND NOTHING THIS ACCOUNT FOLLOWS. THERE IS NO FIELD FOR IT TO APPEAR IN. ----
> // A plan, a 7-day log and a clone are the three ways somebody follows a protocol here. The
> // first two never leave the device (PLAN_KEY / TRACK_KEY in localStorage) and the third is
> // keyed to an anonymous browser key in studio_clones(code, voter_key) — no user_id — so "which
> // protocols does @alice follow" is not merely unrendered, it is not answerable in SQL. Keep it
> // that way. "@alice follows the herpes protocol" is a health disclosure about a named person.
> // DO NOT ADD ONE BEHIND A TOGGLE: a toggle is a thing somebody flips before they understand
> // what it publishes, and the person who flips it is the person least able to afford the leak.
> ```

Corroborated in the schema: `db.js:589–594`

```sql
CREATE TABLE IF NOT EXISTS studio_clones (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL REFERENCES studio_protocols(code) ON DELETE CASCADE,
  voter_key TEXT NOT NULL,            -- anonymous browser key. NO user_id column.
  UNIQUE(code, voter_key)
);
```

And enforced: `parse.js:3651` bans `user_plans|outcome_checkins|experiments|studio_clones` from ever
appearing in the `/api/u/:handle` handler body, with the reason *"@alice follows the herpes protocol is a
health disclosure about a named person."*

**So §5.3 Active Journey requires three changes the repo built a gate to prevent:**
1. a `user_id` on the enrolment record (currently absent by design),
2. a per-enrolment public toggle (currently refused in writing),
3. removing or scoping `parse.js:3651` (the gate would `exit 1` on the implementation).

**This is a genuine conflict between v1.9 and a deliberate, gated, documented repo decision. It is not
resolvable by an implementation agent.** The brief itself states v1.9 *"supersedes earlier LAYOUT
decisions; it does NOT supersede stricter safety or privacy controls."* The Active-Journey refusal is a
stricter **privacy** control, not a layout decision. **On the brief's own rule, the repo wins and §5.3
does not ship as written.** → `needsHumanApproval`.

### 3.1 The same conflict is created by today's owner decision

Owner decision: *"Users get access to the Community for the protocols they started."*

`studio_clones` has **no `user_id`** (`db.js:589–594`), so "which protocols did this account start" is
currently unanswerable in SQL. Community-by-started-protocol **requires adding that column**, i.e.
building precisely the account↔health-condition link the code refused.

Worse, membership in a protocol-scoped community is a **de-facto disclosure to every other member**: a
community attached to `/protocol/erectile-dysfunction/low-testosterone` discloses a health condition
about every handle visible inside it. §9.1 allows "memberships" as public-after-consent; §9.2 forbids
"symptoms, outcomes, diagnoses **or inferred contributors**." A visible member list of a
condition-named community is an inferred diagnosis.

**Recommended framing for Felix (product decision, not a fix I can apply):** community identity should be
**per-community pseudonymous** — a stable per-(user, community) handle that is *not* the account handle —
so joining a second community cannot be correlated with the first. That preserves the owner's decision
and does not create a global "@alice has herpes" join key. Requires an explicit decision.

---

## 4. Owner-vs-visitor hierarchy — the split is correct and better than the spec's

**Status: verified (measured, prerendered) + verified (source, hydrated renderer).**

`site/app.js:8925–8940` documents the architecture:

- `/me` — the owner's page. **Private by construction, not by a setting**: rendered from this device's
  `localStorage` (`PLAN_KEY` / `TRACK_KEY`) plus the account's own rows. *There is no URL at which anybody
  else can open it.* A signed-out reader's `/me` makes **no network call at all**.
- `/u/<handle>` — the public page. Only what that account published.

This satisfies `V19-PRO-002` ("private owner controls and Credit balance disappear in public preview")
**structurally rather than by a preview toggle** — there is no shared renderer that could leak owner
state, because they are two different functions reading two different sources. That is a stronger
guarantee than the spec asks for. **Record as compliant-and-better; do not "fix" it into one renderer
with an `isOwner` flag.**

### 4.1 Route-shell measurements (runtime, prerendered document)

`curl` against `localhost:8099`, all ten routes in `NOINDEX_ROUTES` (`server.js:2943`):

| route | HTTP | `X-Robots-Tag` | `<meta name="robots">` |
|---|---|---|---|
| `/u/felix` | 200 | `noindex, nofollow` | `noindex,nofollow` |
| `/me` | 200 | `noindex, nofollow` | `noindex,nofollow` |
| `/studio` | 200 | `noindex, nofollow` | `noindex,nofollow` |
| `/p/abc123` | 200 | `noindex, nofollow` | `noindex,nofollow` |
| `/progress` | 200 | `noindex, nofollow` | `noindex,nofollow` |
| `/s/abc` | 200 | `noindex, nofollow` | `noindex,nofollow` |
| `/admin` · `/pro` · `/pros` · `/stewardship` | 200 | `noindex, nofollow` | `noindex,nofollow` |

**10/10 carry both the header and the meta tag, in the prerendered document.** The header and the tag
agree (`server.js:3048`, `:3051`). Sitemap: `curl /sitemap.xml` → **568 `<loc>` entries, 0 under `/u/`,
`/p/`, `/studio`, `/progress`, `/s/`, `/admin`** (the 16 apparent `/me` hits are substrings —
`/c/metformin`, `/problem/menopause`, `/methodology`). **`V19-SEO-003` "private pages stay out of
sitemap" — PASS, measured.**

### 4.2 The one real defect here: soft-404 on every private shell

**Status: verified (measured). Severity: P2.**

`/u/felix` and `/p/abc123` return **HTTP 200** for a handle and a code that do not exist. Spec §13.4
(`:848`): *"Unknown profile/protocol/wiki routes return a real HTTP 404 with useful recovery;
withdrawn/thin content is not disguised as HTTP 200 or a soft 404."* `V19-SEO-005` requires "real
404/no soft-404."

The shell 200s because these routes fall through `SPA_ONLY_ROUTES` (`server.js:2900`) to the SPA
skeleton, and the *hydrated* document then renders `renderPublicProfile()`'s
`<h1>No page at that name</h1>` (`app.js:8905`) — a textbook soft 404. Real-world risk is low because
the route is `noindex,nofollow` and out of the sitemap, so no crawler forms an opinion; but it is a
stated spec requirement and it is cheap to satisfy for `/u` and `/p` specifically (the server can ask
the database before choosing the shell). **Not a P0. Listed for completeness.**

---

## 5. Creator discovery — where the actual leaks are

`V19-COM-004` asks for "creator discovery without clutter … protocol results name creators; no default
leaderboard." The repo has **three** creator-discovery endpoints, and they are the weak point of the
whole profile system. Full treatment is in `privacy_age_legal_triggers.md` §2; the profile-relevant
summary:

| endpoint | line | auth | what it publishes about a handle |
|---|---|---|---|
| `GET /api/contributors` | `server.js:2503–2527` | **none** | a **leaderboard** of 25 handles by edits+comments+proposals, plus a top-5 by `reputation_points` **including `socials`** (`:2523`) |
| `GET /api/protocol-contributors` | `server.js:2529–2551` | **none** | for a given `problem`+`root_cause`: **which handles commented on that specific protocol**, plus `socials` (`:2543`) |
| `GET /api/pulse` | `server.js:1959–1979` | **none** | `username` × `problem_id`/`root_cause_id` (forks) and `username` × `goal_id` (comments) |
| `GET /api/comments/recent` | `server.js:1472–1475` | **none** | `username` + `goal_id` + **the comment body**, 8 most recent, sitewide |

All four have live callers in `site/app.js` (`:728`, `:729`, `:773`, `:714`).

Two things are simultaneously true and they contradict each other:

1. `/api/u/:handle` **removed** `socials`, comment counts and follow-state, and `parse.js:3646–3653`
   **fails the build** if any of them come back — with the reason *"an Instagram handle printed beside
   somebody's health protocols is a de-anonymisation key"* and *"'3 comments on Lose fat' under a handle
   is a disclosure the commenter never agreed to publish here."*
2. `/api/protocol-contributors` publishes `socials` **and** a comment count **scoped to one named health
   protocol** — strictly more identifying than the unscoped count the gate bans — and
   `/api/contributors` publishes `socials` too.

**The gate is correct and its scope is too narrow.** `parse.js:3644` targets one string:
`src.indexOf("seg[0] === 'u' && seg[1] && method === 'GET'")`. It reads **that handler's body only**. The
other four public endpoints live in the same file and are never inspected. This is the
"a gate over an empty set always passes" lesson generalised: **a gate over one handler misses the other
four.** → P0 in the privacy file; the fix is to widen the gate's subject set, not to add a new gate.

Mitigating (state it, do not hide it): `users.socials` is `{}` on **every** row and the only writer was
dead twice over (`server.js:1574–1591`), so today these endpoints ship an empty object. **A public field
nothing can fill is a public field waiting to be filled** — the repo's own words at `server.js:1631`.
The handle × protocol join in `/api/protocol-contributors` is **not** empty-by-construction and is live
the moment anyone comments.

### 5.1 Residual lead-gen framing contradicts one-account-type

**Status: verified (source). Severity: P3.** `site/app.js:4838`:

> `Your contribution is live. Post this to your socials to build your profile — every view is a potential lead.`

"Every view is a potential lead" is copy from the abolished professional/lead-gen tier. It survives
`assertOneAccountType()` and `assertNoCredentialClaims()` because it asserts no credential — but it tells
a contributor their profile is a customer-acquisition surface, which is exactly the framing the earlier
PRD flags as *"Creator promotion becomes undisclosed advertising"* (PRD ¶154–155, requiring
"affiliation/material-relationship capture, on-page disclosure"). One-line copy change.

---

## 6. Accomplishments, Champions, Avatar / Marketplace — §5.5, §5.6

**Status: absent across the board (verified, source).** No badges table, no Champion, no manager grant,
no Credits, no entitlement ledger, no Marketplace. `db.js` has no table for any of it.

The profile-specific risk if these are built, in priority order:

1. **§5.5 count parity.** *"The summary count and View all {n} must derive from the same collection"*
   (`:520`). The repo has already shipped the failure mode this guards against, twice, in other contexts
   (per the memory index: "look at the OUTPUT not the count"). If accomplishments ship, the count and the
   modal must read one query — gate it at build time the way `assertProfileDisclosesOnlyPublished` gates
   the payload.
2. **§5.5 "Do not label owner/manager permission as an accomplishment"** (`:520`) — permission is not an
   achievement. Trivially satisfiable now because neither exists.
3. **§5.6 Avatar Level** is *"settled Credits redeemed for eligible avatar cosmetics only"* (`:534`) —
   i.e. **a public spend signal**. §9.2 forbids "Credit balance, marketplace purchases" being public.
   Avatar Level is a monotone function of redeemed spend, so publishing it publishes a **coarsened
   purchase history**. The spec permits it (§9.1 lists Avatar Level) but only "under the allowlist **and
   the account's separate public-display choice**" (`:540`). If it ships, the separate opt-in is not
   optional and the level must be **banded**, not exact, or it is a spend ticker. → `needsHumanApproval`.
4. **§5.6 cosmetic body presentation by muscle group** (`:528`, `:535`) — the earlier PRD is stricter
   (¶169 *"Body avatar creates false change or body-image pressure"*; ¶1390 *"the profile may expose only
   the selected art stage and its non-result label. It never exposes muscle-group session counts,
   measurements, protocol answers or outcomes; youth remains disabled"*). **The earlier PRD's control is
   stricter and therefore survives v1.9.** Requires body-image, privacy and advertising review before
   any adult opt-in. → `needsHumanApproval`.

**Recommendation: none of §5.6 belongs in the next release.** It is the largest new public surface in the
document, it is the furthest from anything the repo has built, and every element of it is a privacy
decision rather than an implementation.

---

## 7. Identity verification and impersonation — §5.2 `:505`

**Status: absent (verified, source). Severity: P1 for the handle-reuse half.**

Spec: *"An **Identity verified** label is permitted only when backed by a real ownership/impersonation
check."* The earlier PRD is more specific and stricter, and therefore governs:

- PRD ¶644: *"Reserve RNAwiki, regulator, emergency-service, institution and well-known identity
  variants. High-reach or impersonation-risk accounts require ownership checks before indexing."*
- PRD ¶646: *"Protect a deleted or renamed handle from immediate reuse; retain a **non-public tombstone**
  keyed to normalized handle and impersonation risk."*
- PRD ¶681: *"That handle is not available. Try another. **Do not reveal whether it is reserved, deleted
  or under moderation.**"*
- PRD ¶645: *"Do not imply credential verification from identity verification."*

Repo state:

| requirement | status | evidence |
|---|---|---|
| Reserved-handle list | **absent** | `server.js:1206` validates only `/^[a-zA-Z0-9_.-]{3,24}$/`. Nothing stops registering `rnawiki`, `hsa`, `admin`, `support`, `moderator`, `felix-official` |
| Google-signup handle derivation | **unguarded** | `server.js:1452` derives the handle from the email local-part with no reserved-name check at all |
| Handle tombstone | **absent** | no tombstone table in `db.js` |
| Non-disclosing "unavailable" message | **partial** | `server.js:1218` returns `409 {"error":"That username is taken"}` — truthful, and there is no reserved/deleted state to leak yet, so it is not yet an oracle |
| "Identity verified" label | **absent, correctly** | no verification path exists; the two that could set `domain_verified` were deleted (`server.js:2553`) |

**Finding P1-A: the reserved-handle namespace is unprotected on the only open signup path.** Password
registration is closed by default (`server.js:1202`, `ALLOW_PASSWORD_REGISTRATION !== '1'`), so **Google
sign-in is the only way to get an account** (`server.js:1425`) — and it is the path with *no* reserved
check. A handle like `rnawiki` or `hsa-sg` on a page that lists health protocols is an impersonation
vector on a health site with real Singapore regulatory exposure. Cheap fix: one denylist consulted by
both signup paths.

**Finding P1-B: handle reuse after deletion is unbounded — and account deletion does not exist.** See
privacy file §5; the profile-side consequence is that `explain_posts.handle` is a **snapshot string**
(`db.js:496–508`), so a comment keeps a handle after `users.id` is gone (`ON DELETE SET NULL`), and a new
account can then claim that handle and inherit the old author's visible comment history. §9 (`:724`)
requires *"Account deletion immediately removes the public projection."*

---

## 8. Verdict summary for this role

**What is right, and must not be "improved" into compliance with §5:**

- The four-field public projection (`server.js:1652`) is a strict subset of §9.1 and is the correct
  starting point for a health site. §9.1 is a *ceiling*, not a target.
- `/me` vs `/u/<handle>` as two renderers over two sources — stronger than `V19-PRO-002`'s preview toggle.
- `assertProfileDisclosesOnlyPublished()` (`parse.js:3634`) is a real, provable gate with three
  reintroduction tests written into its own header comment (`parse.js:3630–3631`). Widen its subject set;
  do not replace it.
- Join **month**, never day (`server.js:1655`) — matches PRD ¶176 "no last-active timestamp."
- 10/10 private routes noindex in both channels, 0/568 in the sitemap. Measured.

**The three things that must be decided by Felix before any §5 work starts:**

1. **Active Journey (§5.3) vs the written refusal at `server.js:1642–1649`.** The repo's control is a
   privacy control, so on the brief's own precedence rule it survives v1.9. Confirm or overrule.
2. **Community-by-started-protocol** requires a `user_id` on `studio_clones` and creates a public
   handle↔condition link. Decide the pseudonymity model *before* the column is added — it is far harder
   to un-publish a join key than to never create it.
3. **Avatar / Marketplace / Avatar Level (§5.6)** is a public spend signal plus a body-image surface, and
   the earlier PRD's stricter controls survive. Recommend deferring the whole section.

**The one P0 this file contributes** (detailed in the privacy file): the profile-disclosure gate reads
one handler; four other unauthenticated public endpoints in the same file violate that gate's own
banned-pattern list, including a handle × named-health-protocol join.
