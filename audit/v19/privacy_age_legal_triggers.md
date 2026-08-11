# RNAwiki v1.9 — Privacy, age gate and legal triggers

**Role:** Privacy / age / legal specialist · WAVE A · READ-ONLY
**Date:** 2026-08-11 · **Branch:** `refine/site-wide-2026-08`
**Audited against:** v1.9 §9 (Public/private contract), §12 (Measurement), §13.2–13.4, §14 (Release
gates), §16 rows `V19-PRI-001/002`, `V19-SEO-003/005`, `V19-GOV-001`; and the earlier
`RNAwiki_Core_Protocol_Product_Requirements_Document.docx`, which the brief states governs **unresolved
safety, privacy, consent, youth and governance** requirements and is **not** superseded by v1.9's layout
decisions.
**Companion:** `profile_creator_discovery_audit.md` (same directory).

**Evidence convention.** `verified (measured)` = I ran it against `localhost:8099` and pasted the output.
`verified (source)` = I read the exact lines cited. `inference` = reasoned from cited code, not observed.
`could-not-check` = named, with the reason and the exact check someone else must run.

**Runtime limitation, stated up front.** `db.enabled` is false locally (no `DATABASE_URL`). Every
account-backed endpoint answers `503 {"error":"Accounts are not available right now."}` — measured on
eight of them. **No JSON payload in this file was observed at runtime.** Payload claims are source reads.

---

## P0 register

| # | Finding | Class | Status |
|---|---|---|---|
| P0-1 | Four unauthenticated public endpoints violate the profile gate's own banned-pattern list; the gate reads one handler and never inspects them. Includes a handle × named-health-protocol join. | privacy | verified (source) |
| P0-2 | `GET /api/shared-plan` publishes, to anyone holding a code and with no consent step, `pid` + `rcid` (a health problem and its root cause) + the **supplement/compound list** + the author's **handle**. §9.2 forbids all three. | privacy | verified (source) |
| P0-3 | **No age gate of any kind exists.** Zero matches for `under 18`/`age gate`/`date of birth`/`youth`/`minor`/`guardian` across `server.js`, `db.js`, `site/app.js`, `build/parse.js`. The earlier PRD's *"production fallback is 18+"* is unimplemented — there is no flag to keep disabled. | legal / child-safety | verified (measured grep) |
| P0-4 | Research consent is **absent, not merely default-on**, on the only open signup path. Google sign-in creates no `user_consent` row; the check-in gate treats a missing row as permission. `db.js:418` states the opposite contract. | privacy / legal | verified (source) |
| P0-5 | The research **export ignores consent entirely** — `/api/admin/export?type=checkins` selects all `outcome_checkins` joined to demographics with no `consent_research` filter. | privacy / legal | verified (source) |
| P0-6 | **No account-deletion path exists.** `/api/mydata DELETE` erases research data and explicitly keeps the account. §9 (`:724`) requires deletion to remove the public projection; `explain_posts.handle` survives as a snapshot string regardless. | privacy / data-rights | verified (source) |
| P0-7 | The **interest-list removal UI is dark** while the collection endpoint still accepts writes. A reader handed a removal link cannot exercise it from any page. | privacy / data-rights | verified (measured) |
| P0-8 | Cloudflare Web Analytics is **deliberately CSP-allowlisted and auto-injected**, and its beacon sends `location.href` (including `/solve?q=<the reader's typed symptoms>`) and `document.title` (compound names) — the two exact channels the in-house analytics module was built to avoid. | privacy / §12 | inference (strong) — live check named below |

---

## 1. What is already correct — verify these before "fixing" them

I checked six things a privacy audit normally finds broken. **All six are already right**, and three of
them would have produced false findings if I had reasoned instead of measured.

**1.1 Private routes are noindexed in both channels.** `verified (measured)`, `curl localhost:8099`:
all ten routes in `NOINDEX_ROUTES` (`server.js:2943` — `admin, me, p, pro, progress, pros, s,
stewardship, studio, u`) return **both** `X-Robots-Tag: noindex, nofollow` **and**
`<meta name="robots" content="noindex,nofollow">`. `nofollow` as well as `noindex` is deliberate
(`server.js:3043`: *"the links out of a personal page are that person's protocols"*).

**1.2 Sitemap is clean.** `verified (measured)`: 568 `<loc>` entries; **0** under `/u/`, `/p/`,
`/studio`, `/progress`, `/s/`, `/admin`. The 16 apparent `/me` matches are substrings (`/c/metformin`,
`/problem/menopause`, `/methodology`). `V19-SEO-003` private-pages-out-of-sitemap — **PASS**.

**1.3 `Referrer-Policy: strict-origin-when-cross-origin` is set.** `verified (measured)` on
`/solve?q=erectile+dysfunction`. I expected the classic leak — a reader clicking a PubMed citation from a
symptom-bearing URL sending that URL to NCBI — and **it does not happen**: cross-origin requests carry
only `https://rnawiki.com`. Do not re-file this.

**1.4 The in-house analytics module is genuinely §12-compliant.** `verified (source)`,
`site/app.js:3974–4110`. It sends the route **template** (`/t/compound`), never the URL
(`:4088` `dl=` uses `_aTplNow`); never `document.title` (`:4089` `dt=` also uses the template); and only
the **origin** of an **external** referrer, dropping same-origin entirely because *"a same-origin
referrer is the reader's previous RNAwiki URL — exactly the health disclosure this module exists to
withhold"* (`:4054–4057`). `A_PUBLIC` (`:4021`) is an **allowlist** that fails closed to `/t/other`.
Identity is memory-only — no cookie, no `localStorage` (`:4014–4017`). gtag.js is deliberately not loaded
because its `__ccd_em_site_search` tag reads `q` and this site's hero is a real
`<form action="/solve" method="get" name="q">` (`:3999–4006`). **This is the best privacy engineering in
the repo. Preserve it exactly.** (It is also what makes P0-8 so sharp — see §7.)

**1.5 `POST /api/interest` does not over-collect.** `db.js:322–331` records the deliberate absence of
name, IP, user-agent, referrer and source page, and explains why `newsletter_subscribers` was **not**
reused: *"those rows carry consent to a mailing that no longer exists, and attaching old consent to a new
purpose is the thing PDPA exists to stop."* Correct reasoning.

**1.6 Session cookie flags are correct.** `server.js:540`:
`sid=…; HttpOnly; Path=/; Max-Age=2592000; SameSite=Lax; Secure`.

---

## 2. P0-1 — the profile gate reads one handler; four public endpoints in the same file violate it

**Status: verified (source). Class: privacy.**

`build/parse.js:3634` `assertProfileDisclosesOnlyPublished()` is a real, well-built gate. Its subject is
selected at `parse.js:3644`:

```js
const start = src.indexOf("seg[0] === 'u' && seg[1] && method === 'GET'");
…
const body = src.slice(start, src.indexOf('\n  }\n', start) + 1);
```

**It reads the body of `GET /api/u/:handle` and nothing else.** Its `PAYLOAD_BANNED` list
(`parse.js:3646–3654`) bans, with reasons:

- `socials` — *"an Instagram handle beside somebody's health protocols is a de-anonymisation key"*
- `FROM proposals|FROM comments|FROM edits` — *"'3 comments on Lose fat' under a handle is a disclosure
  the commenter never agreed to publish here"*
- `reputation_points`, `badges`, `profile_views|booking_clicks`, follow-tables, `user_profile`

Four other **unauthenticated** endpoints in the same file trip that list. None has a `currentUser()` call
(verified by reading each handler's first five lines):

| endpoint | line | banned pattern present | what a stranger gets |
|---|---|---|---|
| `GET /api/protocol-contributors` | `server.js:2529–2551`; `socials` at **`:2543`** | `socials` **+** `FROM comments` **+** `FROM proposals` | **which handles commented on one named health protocol**, given only `?problem=…&rc=…` |
| `GET /api/contributors` | `server.js:2503–2527`; `socials` at **`:2523`** | `socials` + `reputation_points` + comment/edit/proposal counts | a 25-handle activity leaderboard + a top-5 by reputation |
| `GET /api/pulse` | `server.js:1959–1979` | comments joined to `username` (`:1968`) | `username` × `problem_id`/`root_cause_id` (forks, `:1966`) and `username` × `goal_id` (comments) |
| `GET /api/comments/recent` | `server.js:1472–1475` | comments joined to `username` | `username` + `goal_id` + **the comment body**, 8 most recent, sitewide |

All four have live callers in `site/app.js` (`:729`, `:728`, `:773`, `:714`).

**The severity is concentrated in `/api/protocol-contributors`.** It answers, for an
attacker-chosen problem and root cause, *"who engaged with this protocol"* — by handle. That is the
`@alice ↔ health condition` join the repo spent a whole comment block (`server.js:1642–1649`) and a build
gate refusing to create on the profile page. It is **more** identifying than the unscoped comment count
the gate bans, because it is scoped to one condition.

**Partial mitigation, stated rather than hidden:** `users.socials` is `{}` on every row and its only
writer was dead twice over (`server.js:1574–1591`), so today those two endpoints ship an empty object.
That is protection by accident. `server.js:1631`, the repo's own words: *"A public field nothing can fill
is a public field waiting to be filled."* The handle × protocol join is **not** empty by construction and
goes live with the first comment.

**Second-order note:** `server.js:2537–2547` records that `/api/protocol-contributors` *"HAS ALWAYS
RETURNED 500"* because of an `ORDER BY` alias bug, now fixed on this branch. So the fix that made it work
is the change that makes the disclosure reachable. **This is unpublished work on
`refine/site-wide-2026-08` — it can be corrected before it ever ships.**

**Fix shape (spec, not applied):** widen the gate's subject from one `indexOf` to the set of
`seg[0] === '<name>'` handlers that lack a `currentUser()` guard, and run `PAYLOAD_BANNED` over each.
Prove it by reintroducing `socials` into `/api/contributors` and confirming `exit 1` — the gate's own
header (`parse.js:3630`) already teaches this discipline.

---

## 3. P0-2 — `GET /api/shared-plan` publishes a health problem, a supplement list and a handle

**Status: verified (source). Class: privacy.**

`server.js:1413–1424`. Unauthenticated. Given `?code=<12 chars>` it returns:

```js
return json(res, 200, { pid: row.pid, rcid: row.rcid, plan: row.plan || {}, author });
```

where `author` is resolved at `:1422` — `SELECT username FROM users WHERE id=$1` — and `plan` is
`{moves, supps, functions}` (`db.js:407–415`), i.e. **the compound/supplement ids the person selected**.

Against v1.9 §9.2 (`:714–722`), this single response carries three forbidden categories at once:

- *"symptoms, outcomes, diagnoses or inferred contributors"* → `pid` + `rcid` **is** a problem and its
  asserted root cause;
- *"current medicines/supplements, doses"* → `plan.supps`;
- and it binds both to a **named handle**.

The write path, `POST /api/share-plan` (`server.js:1256–1272`), takes the author from
`await currentUser(req)` at `:1259` and stores `author_user_id` with **no consent prompt, no disclosure
sheet and no opt-out**. A signed-in user who taps "share" publishes their handle next to a health
problem and a supplement list.

**This is the same disclosure `/api/u/:handle` refuses**, arrived at from the other direction: the
profile will not tell you what `@alice` follows, but a share code tells you that `@alice` authored a plan
for `pid=erectile-dysfunction`.

Mitigations that reduce but do not remove it: the code is 48 bits of `crypto.randomBytes(6)` so it is not
enumerable; `/s/<code>` is `noindex,nofollow` and out of the sitemap (measured, §1.1–1.2). The exposure is
to **anyone the link reaches** — and `server.js:1417–1420` records that the click counter fires on
WhatsApp/Telegram/Slack **preview unfurls**, i.e. these URLs are routinely handed to third-party
link-preview crawlers.

**Fix shape:** drop `author` from the response (the handle adds nothing to a plan the recipient was sent
directly), or gate it behind an explicit at-share disclosure that names the three things being published.
The former is one line and needs no product decision.

---

## 4. P0-3 — there is no age gate, so there is nothing to keep disabled

**Status: verified (measured grep). Class: legal / child-safety.**

```
/usr/bin/grep -anoiE '(under.?18|age.?gate|minimum age|date.?of.?birth|birthdate|youth|
  minor|coppa|guardian consent|13 year|16 year|18 year)'
  server.js db.js site/app.js build/parse.js
→ 0 matches
```

The only age-shaped construct in the codebase is `AGE_BANDS` (`server.js:507`):
`['18-24','25-34','35-44','45-54','55-64','65+']` — an **optional self-declared research demographic**
written by `POST /api/profile` (`server.js:1330`), stored in `user_profile` (`db.js:427–434`). It is not
consulted by registration, by the check-in path, by the Studio, or by anything else. It is a survey field,
not a gate.

**What the governing documents require:**

- v1.9 §14 (`:856–869`): the prototypes do not authorize *"youth signup"*; *"Youth participation remains
  behind a **disabled flag** until independent legal, child-safety, privacy, clinical, accessibility, and
  security reviews pass."*
- v1.9 §10 (`:756`): *"'Simple enough for a child to understand' is a comprehension benchmark, not
  permission to test with children or enable youth accounts."*
- Earlier PRD ¶152 (stricter, therefore governing): *"Youth flag remains off pending formal
  multidisciplinary approval; **production fallback is 18+**."*
- Earlier PRD ¶57: *"Keep `youth_accounts` disabled until the independent release gate passes."*
- Earlier PRD ¶91 (anti-goal): *"Launching children's public profiles from a generic guardian checkbox."*
- Earlier PRD ¶151 (named risk): *"Children are exposed as ordinary public users."*

**Repo state:** `youth_accounts` does not exist. There is no flag, no default, and no fallback. The
spec's control is *"keep the flag disabled"*; **you cannot disable a flag that was never created**, and
the production fallback the PRD names — 18+ — is unenforced.

**What a minor can do today, with a Google account and no age question anywhere:**

1. Sign in (`server.js:1425`; password registration is closed by default at `:1202`, so **Google is the
   only open path** — and it derives a handle from the email local-part at `:1452` with no age step).
2. Have research consent silently assumed (P0-4).
3. Log `symptom_0_10`, `improvement`, `adherence_pct`, free-text `side_effects` and free-text `note`
   (`server.js:1357–1360`).
4. Log `weight_kg` and `waist_cm` (`server.js:1384–1387`) — body-composition data on a minor.
5. Log blood markers (`server.js:1367–1373`).
6. Read dose ladders and build a protocol in the Studio.
7. Publish a protocol under a handle at a public `/p/<code>` URL (`server.js:1892`).

**Legal triggers.** Singapore PDPA: a minor under 13 generally cannot give valid consent, and the PDPC's
guidance treats consent from a minor as needing a parent/guardian where the minor lacks capacity — here
there is no consent artefact at all (P0-4), for anyone, of any age. Health data is the most sensitive
category the Act contemplates. Separately, the site is reachable worldwide: UK Age-Appropriate Design
Code and EU GDPR Art. 8 both attach where a child is a likely user, and a global health site with no age
question is a likely-user case by default.

**This is a decision for Felix and a named legal reviewer, not for an implementation agent** — v1.9 §14
and `V19-GOV-001` both say youth is a *named human release gate*. The minimum honest interim control is a
self-declared 18+ affirmation at first account creation plus a stated 18+ term, which is weak but is the
PRD's own named "production fallback" and is currently absent entirely. → `needsHumanApproval`.

---

## 5. P0-4 / P0-5 / P0-6 — the consent and deletion trio

### 5.1 P0-4 — consent is absent on the only open signup path, and absence is read as permission

**Status: verified (source).**

Three lines, in tension:

| where | what it says |
|---|---|
| `db.js:418` | `-- Research consent, versioned. **No data below is used for research unless consent_research = true.**` |
| `db.js:421` | `consent_research BOOLEAN NOT NULL DEFAULT false` |
| `server.js:1350` | `if (cr.rows[0] && cr.rows[0].consent_research === false) return json(res, 403, …)` |

`server.js:1350` blocks **only** on an explicit `false`. **A missing row falls through and the check-in is
written.** The schema's stated contract is "unless `= true`"; the runtime contract is "unless `= false`".

Now trace the two signup paths:

- **Password registration** (`server.js:1214`) writes `user_consent(consent_research) VALUES(true)` — the
  comment at `:1213` says *"tracking on by default"*. But this path is **closed by default**
  (`server.js:1202`, requires `ALLOW_PASSWORD_REGISTRATION=1`).
- **Google sign-in** (`server.js:1425–1468`) — the **only open path** — inserts a `users` row at `:1457`
  and a `sessions` row at `:1464` and **never touches `user_consent`.**

**Therefore: every account that can currently be created has no consent record at all, and
`server.js:1350` treats that as permission to collect symptom scores, free-text side effects, free-text
notes, blood markers and body measurements.** `GET /api/mydata` (`:1400`) will honestly return
`consent: null` to that user — the data-access response tells them there is no lawful basis on file.

Against v1.9 §9.2 (`:720`, "consent record" is a protected artefact that must therefore exist) and the
earlier PRD ¶140 (*"explicit signup disclosure"*) and ¶605 (*"obtain informed publication consent"*).

**Fix shape:** (a) make absence fail closed — `if (!cr.rows[0] || cr.rows[0].consent_research !== true)
return 403`; (b) present the consent notice in the Google-signup flow and write a versioned row; (c) add
a build gate asserting every signup path writes `user_consent`, proven by deleting the insert and
confirming `exit 1`. **(a) alone is a one-line change and closes the collection.**

### 5.2 P0-5 — the research export ignores consent entirely

**Status: verified (source).** `server.js:2143–2158`, `GET /api/admin/export?type=checkins`:

```sql
SELECT c.user_id, c.pid, c.rcid, c.phase, c.symptom_0_10, c.improvement, c.adherence_pct,
       c.still_on, c.stop_reason, c.side_effects, c.extra,
       p.age_band, p.sex, p.ethnicity, p.conditions, p.height_cm, p.meds, …
FROM outcome_checkins c LEFT JOIN user_profile p ON p.user_id = c.user_id
ORDER BY c.user_id, c.created_at
```

**There is no `consent_research` predicate.** Same for `type=markers` (`:2160`) and `type=wearables`
(`:2165`). `db.js:418` says *"No data below is used for research unless consent_research = true"*, and
this is the endpoint whose entire purpose is research use. A user who withdraws via
`POST /api/consent {research:false}` (`server.js:1288`) — which sets the flag but, correctly, does not
delete rows — is **still exported**.

Note the endpoint is genuinely careful in other respects: super-admin gated (`:2134`), and `anonId()`
(`:2141`) is an HMAC-SHA256 pseudonym over the server `SECRET`. But the joined row carries `age_band` +
`sex` + `ethnicity` + `conditions` + `meds` + `height_cm` + free-text `side_effects` — a quasi-identifier
set that is **re-identifiable in a small population**, and the site is Singapore-targeted with a
three-account user base. Pseudonymisation is not anonymisation at this cohort size.

Also relevant: v1.9's §5-adjacent contract and `V19-PRI-001` require leak tests across **exports**. The
`clinicians` export at `server.js:2136–2139` emits `name, email, discipline, country, **license_no**` —
see §8.

**Fix shape:** add `WHERE` on `consent_research = true` to all three research exports; and either drop
`ethnicity`+`conditions`+`meds` from the joined checkins export or gate it behind a stated small-cell
suppression rule.

### 5.3 P0-6 — there is no account deletion, and a handle outlives the account

**Status: verified (measured grep + source).**

```
grep -an "DELETE FROM users|deleteAccount|closeAccount" server.js site/app.js db.js
→ no account-deletion path. Only site/app.js:5639, whose own confirm() text reads
  "Delete your research data (check-ins, mar…" — i.e. /api/mydata DELETE.
```

`/api/mydata DELETE` (`server.js:1402–1411`) is well built for what it is — it erases
`outcome_checkins`, `blood_markers`, `wearable_daily`, `user_profile` and sets `withdrawn_at` — and its
own comment says *"erase research data, **keep the account** + their tracker."*

**What survives that nobody can remove:**

| survives | why | line |
|---|---|---|
| the `users` row, handle and email | nothing deletes it | — |
| every `explain_posts` row | `user_id … ON DELETE SET NULL` but **`handle TEXT` is a snapshot** written at post time | `db.js:496–508`; writer `server.js:1188` |
| `shared_plans` rows | `author_user_id … ON DELETE SET NULL`, but `pid`/`rcid`/`plan` persist | `db.js:407–415` |
| `studio_protocols` rows | `user_id … ON DELETE SET NULL`; published rows stay servable | `db.js:562–580` |
| `clinician_interest` rows incl. `license_no` + `proof_photo` | deliberately retained | `server.js:2001–2005` |

**No delete endpoint exists for a user's own `explain_posts` either** — the handler
(`server.js:1139–1193`) serves `GET` and `POST` then returns `405`. A signed-in user's explanation is
posted under their handle automatically (`server.js:1188`, `handle = u ? u.username : null`) with no
per-post identity choice, and they cannot take it down.

Against v1.9 §9 (`:724`): *"Account deletion immediately removes the public projection and queues
index/cache removal."* Against earlier PRD ¶140 (*"deletion propagation"*) and ¶646 (*"protect a deleted
or renamed handle from immediate reuse; retain a non-public tombstone"*). Under PDPA, withdrawal of
consent must be honoured and retention must be purpose-bound.

### 5.4 P0-7 — the interest-list removal UI is dark while collection still accepts writes

**Status: verified (measured).**

```
curl -s "http://localhost:8099/?state=remove&t=abcdefghijklmnop"
  | grep -ao 'name="t" value="[^"]*"|data-state="[^"]*"|class="i-rm"'
→ (no output)

grep -ac 'i-state i-s-ok' site/home.html  → 0
```

The mechanism, from the code itself: `HAS_ANSWER_PANELS()` (`server.js:15–22`) reads the built
`home.html` at boot for `class="i-state i-s-ok"`; the panels were removed with the form on 2026-08-09, so
the guard at `server.js:2704` (`p === '/' && qp.get('state') && HAS_ANSWER_PANELS()`) is false and the
whole state handler is dark. `server.js:2702–2703` records the consequence honestly:

> *"LEFT BEHIND, for the record: a reader who was handed a removal link before today can no longer press
> it from the page. The endpoint still accepts the POST."*

Meanwhile `POST /api/interest` (`server.js:1045–1091`) still **writes** `interest_signups` rows
(email + health topic + `topic_other` free text + `creator` flag). So the site is in the worst
combination: **collection live, self-service removal dead.** `POST /api/interest/remove`
(`server.js:1093–1109`) still works but is reachable only by hand-crafting a request.

**Owner decision today: remove the collection-of-interest feature entirely.** Removal scope, verified:

| artefact | location | action |
|---|---|---|
| `POST /api/interest` | `server.js:1045–1091` | delete handler |
| `POST /api/interest/remove` | `server.js:1093–1109` | delete **only after** the rows are dealt with |
| `/?state=` render branch | `server.js:2704–2749` | delete (already dark) |
| `HAS_ANSWER_PANELS()` + `_hasPanels` | `server.js:14–22` | delete |
| `INTEREST_TOPICS` + boot log | `server.js:947`, `:2835`, `:2857` | delete |
| `interestAllow()` rate limiter | `server.js` (called `:1076`) | delete |
| `interest_signups` table + index | `db.js:342–351` | **do not drop silently — see below** |
| `site.interest.topics` in `data/site_config.json` | via `parse.js` → `site/data.js` | remove; re-run `parse.js` (integrator only) |
| `A_PUBLIC` entry | already absent — `site/app.js:4023` records `/interest` was added and removed the same day | none |

**The rows are the part that needs Felix, not code.** `interest_signups.email` is a direct identifier
bound to a self-declared health topic. The repo's own discipline (`db.js:322–331`,
`server.js:2001–2005`) is that dropping a table with somebody's data in it is the owner's decision and
should follow telling them, not happen as a side effect of a code change. **Sequence:** (1) count and
export the rows; (2) email the list that the feature is withdrawn and their address is being deleted;
(3) delete rows; (4) drop the table. **Do not delete `POST /api/interest/remove` before step 3** — it is
currently the only working mechanism for a data subject who asks.

`could-not-check`: the row count. `db.enabled` is false locally and I did not query production.
Run `SELECT count(*), min(created_at), max(created_at) FROM interest_signups;` against Railway Postgres.

---

## 6. `/solve?q=<symptom>` — health state in a URL

**Status: verified (measured). Severity: P1.**

The home hero is a real `<form action="/solve" method="get" name="q">` (`site/app.js:4001`), so the site's
own primary CTA generates URLs containing the reader's typed symptom words. Earlier PRD ¶140 states the
requirement flatly: *"**no health state in URLs**"*; ¶764: *"Assessment answers and inferred path stay
private by default, **are absent from URLs**, profile projection, comment metadata and general
analytics."*

Measured on `/solve?q=erectile+dysfunction`:

```
HTTP/1.1 200 OK
X-Robots-Tag: noindex, follow          ← set by endHtml() when a query string is present (server.js:72)
Referrer-Policy: strict-origin-when-cross-origin
```

The two defences are real and were verified, not assumed: search engines are directed away, and
cross-origin navigations carry only the origin. **Residual exposure, all of it real:**

1. **Browser history and session restore** on a possibly shared device.
2. **Server access logs.** Railway and Cloudflare both log the full request line including `?q=`. v1.9
   §13.4 (`:849`) is explicit that *"server logs exposed to general analytics … contain no assessment
   answer, symptom …"*. There is no log-scrubbing or retention policy in the repo.
3. **Cloudflare Web Analytics** — see §7, the sharpest one.

**Fix shape (spec):** make the hero form `method="post"` with a redirect, or move the query to a
`sessionStorage` hand-off with a clean `/solve` URL. Both preserve the no-JS path if the POST target
renders directly. This is a real change to a core CTA and should be Felix's call on conversion grounds.

---

## 7. P0-8 — Cloudflare Web Analytics reintroduces the two channels gtag.js was rejected for

**Status: inference (strong). The one live check I could not run is named at the end.**

`server.js:3090–3100`, `SECURITY_HEADERS`:

```
"script-src 'self' 'wasm-unsafe-eval' 'unsafe-inline' https://accounts.google.com
   https://static.cloudflareinsights.com"
```

with the comment at `:3092–3096`:

> *"static.cloudflareinsights.com is Cloudflare Web Analytics, which Cloudflare **auto-injects**. It was
> CSP-blocked from the day the headers shipped, so it had collected nothing. **Enabled deliberately** …
> This is the only source for which pages actually get read … **Cookieless, so it needs no consent
> banner.**"*

Cloudflare Web Analytics' beacon (`beacon.min.js`) reports `location.href` — **including the query
string** — and `document.title`. Those are exactly two of the four channels
`site/app.js:3978–3986` enumerates as the reason a third-party analytics script tag must not be used
here:

> *"On this site **all four channels carry a health disclosure**: the home hero is a real
> `<form action="/solve" method="get" name="q">`, so `/solve?q=<the reader's own words>` is a URL the
> site's own primary CTA generates; titles read 'Bremelanotide (PT-141): dosage, evidence…'; and a
> same-origin `document.referrer` is the full previous URL. There is no configuration of count.js that
> withholds them."*

The repo then built a bespoke, template-only GA4 sender to avoid precisely this (§1.4) — **and
allowlisted a different third-party script with the same two properties.** The "cookieless, so it needs
no consent banner" note answers a *cookie-law* question, not the §12 question, which is about **content**:
*"Do not send raw symptoms, medicine names, assessment answers, private prescription values, or free-text
health content to general analytics"* (v1.9 `:806`).

**Why this is inference, not verified:** the beacon is injected at the Cloudflare edge, not by this
repo — `curl localhost:8099/solve?q=…` shows **0** occurrences of `cloudflareinsights`, and it is absent
from `site/index.html` and `site/home.html` (measured). Whether it is live depends on the zone setting,
which I did not check (no WebFetch per the brief).

**The exact check for whoever can run it:** `curl -s https://rnawiki.com/solve?q=test | grep -c
"beacon.min.js\|cloudflareinsights"`. If ≥ 1, this is a confirmed §12 violation: turn Web Analytics off
in the Cloudflare dashboard **and** remove `static.cloudflareinsights.com` from `script-src` in the same
commit, so the CSP cannot silently re-permit it.

---

## 8. Retained special-category data with no purpose — the clinician archive

**Status: verified (source). Severity: P1 (legal / retention).**

`POST /api/clinician-interest` is closed (`server.js:1991–2000`), and the comment is unusually candid:

> *"It accepted, with NO ACCOUNT and NO EMAIL VERIFICATION, a name, an email, a profession, a country, a
> PROFESSIONAL LICENCE NUMBER and a base64 PHOTOGRAPH OF A CREDENTIAL DOCUMENT (up to ~1.2 MB) …
> Collecting government identity documents for a verification programme that has been abolished is the
> largest data liability on this site, and it is now shut."*

**Shut, but not cleared.** Still live:

- `clinician_interest` rows including `license_no` and `proof_photo` (`db.js:301–314`), deliberately
  retained (`server.js:2001–2005`);
- `GET /api/clinician-photo` (`server.js:2007–2016`) — super-admin gated, serves the credential image;
- `GET /api/admin/export?type=clinicians` (`server.js:2136–2139`) — CSV with `name, email, discipline,
  country, **license_no**`.

The retention rationale is honourable — *"those are somebody's licence photographs; deleting them is
Felix's decision and should follow telling the people on the list"*. But the purpose for which they were
collected **no longer exists** (the professional tier was abolished 2026-08-08), and purpose limitation
under PDPA means data must not be retained once the purpose is done. **This is now an aging liability with
a documented owner action attached and no date on it.** → `needsHumanApproval`: notify the list, then
delete rows and drop `proof_photo`. Give it a date.

---

## 9. Consent-shaped and disclosure-shaped gaps, ranked below P0

| # | Finding | Severity | Evidence |
|---|---|---|---|
| P1-A | Reserved-handle namespace unprotected on the only open signup path; Google handle derived from the email local-part with no denylist. Impersonation of `rnawiki`/regulators. Earlier PRD ¶644. | P1 | `server.js:1206`, `:1452` |
| P1-B | No handle tombstone; a released handle can be reclaimed and inherits the prior author's visible `explain_posts` history (handle is a snapshot string). PRD ¶646. | P1 | `db.js:496–508` |
| P2-A | `explain_posts` gives no identity choice — signed-in always posts under the handle (`handle = u ? u.username : null`), no disclosure preview, no self-delete (handler is GET/POST/405). v1.9 §4.4; community audit §11.3. | P2 | `server.js:1139–1193` |
| P2-B | `GET /api/outcomes/public` returns `{n, pct}` — *"% of people who improved"* — behind a k≥20 floor. AGENT_RULES §DO-NOT-IMPLEMENT: *"Do not ship any aggregate efficacy statistic ('X% of users improved'). The gated feature stays dark."* It has a live caller (`app.js:760`). Dark today only because n<20. **A gate that passes only because the set is empty is not a gate.** | P2 | `server.js:1275–1282` |
| P2-C | `GET /api/stats` publishes `improved` (count of `experiments` with `outcome='better'`) alongside `experiments` — the same aggregate-efficacy shape, with **no** k-floor at all. | P2 | `server.js:2019–2028` |
| P2-D | Soft-404: `/u/<unknown>` and `/p/<unknown>` return HTTP 200. v1.9 §13.4 `:848`, `V19-SEO-005`. Low real risk (noindex + out of sitemap) but a stated requirement. | P2 | measured, §1.1 |
| P3-A | `rel="nofollow noopener"` on user-supplied links but **no `ugc`**, and no `sponsored` anywhere. v1.9 §13.3 `:843`. | P3 | `build/prerender.js:765` |
| P3-B | `server.js:2942` names `assertPrivateRoutesAgree()`, a function that does not exist; the check is real and is part (3) of `assertProfileDisclosesOnlyPublished()`. Stale comment only. | P3 | `parse.js:3676–3697` |
| P3-C | `site/app.js:4838` — *"Post this to your socials to build your profile — every view is a potential lead"* — surviving lead-gen framing from the abolished professional tier. PRD ¶154–155 (undisclosed advertising). | P3 | source |

---

## 10. Where the audit could not reach

Stated so nobody mistakes silence for a pass:

1. **No runtime JSON.** Every account endpoint 503s locally. All payload findings are source reads.
   Re-run §2 and §3 against a database before the fixes are called verified.
2. **No live-site check.** Per the brief I used no WebFetch. P0-8 (Cloudflare beacon) and the
   `interest_signups` row count both need one command each, named inline.
3. **I did not run `node build/parse.js`.** It rewrites `site/data.js`, which is product code. So
   `assertProfileDisclosesOnlyPublished()` is verified **by reading its body**, not by executing it, and
   I have **not** claimed any gate passes. Its three reintroduction tests (`parse.js:3630–3631`) are
   written down and unrun by me.
4. **No hydrated-DOM measurement in this file.** Every runtime measurement here (`X-Robots-Tag`, meta
   robots, sitemap, `Referrer-Policy`, the dark interest state, the 503s) is a property of the
   **prerendered** document or of an HTTP header, which is the correct document for a crawler/leak claim.
   Any future claim about what a *user sees* on `/me` or `/u` still needs `probe.mjs`.

---

## 11. The single ranked list, if only some of it gets done

1. **P0-4(a)** — one line: make a missing `user_consent` row fail closed at `server.js:1350`. Stops
   collection without a lawful basis today.
2. **P0-5** — add `consent_research = true` to the three research exports.
3. **P0-2** — drop `author` from the `GET /api/shared-plan` response.
4. **P0-1** — widen `assertProfileDisclosesOnlyPublished()` to every unauthenticated handler; fix the
   four endpoints it then catches. **All of this is unpublished — correct it before it ships.**
5. **P0-7** — execute the interest removal in the stated order; **removal UI back or rows gone first.**
6. **P0-8** — run the one-line live check; if positive, kill the beacon and the CSP entry together.
7. **P0-3** — the 18+ decision. Needs Felix and a named legal reviewer; nothing an agent can close.
8. **P0-6** — design account deletion, including the `explain_posts.handle` snapshot and a tombstone.
9. **§8** — put a date on the clinician-archive notify-and-delete.
