# RNAwiki v1.9 — Security & Abuse Audit (WAVE A, read-only)

**Role:** Security / abuse specialist
**Date:** 2026-08-11 · **Branch:** `refine/site-wide-2026-08` (27 improvements unpublished, tree clean)
**Target:** local `http://localhost:8099` (`dbEnabled:false`) + static read of `server.js` (3,157 lines),
`db.js` (604), `studio-safety.js` (337), `site/app.js` (10,286)
**Brief:** "attack the same-origin + bot-filter + per-IP write guard and `studio-safety.js` on paper
and name what a hostile user could still do."

Labels: **VERIFIED** (executed) · **INFERRED** (read, not executed) · **COULD-NOT-CHECK**.

---

## 0. The threat model this codebase actually has

`server.js:866-978` documents the guard honestly. Three layers at one chokepoint in `api()`:

```js
function writeBlocked(req, res) {
  if (!sameOrigin(req))            → 403   // Origin or Referer must match Host
  if (looksAutomated(req))         → 403   // UA blocklist: curl|wget|python-requests|…
  if (!rateAllow(clientIp(req)))   → 429   // 15 burst, +1 token / 4 s, keyed on clientIp()
}
```

It calls `looksAutomated` "speed bump only" and it is right. The finding below is not that these are
weak — it is that **all three collapse to nothing against a scripted attacker**, and that two of
them are keyed on a header the client controls.

---

## 1. Findings, most severe first

| ID | Sev | Finding | Status |
|---|---|---|---|
| S-01 | **P0** | Rotating a spoofed `X-Forwarded-For` defeats **every** per-IP control on the site | contradictory |
| S-02 | **P0** | The whole write guard is bypassed by `Origin:` + a browser UA — no CSRF token exists | partial |
| S-03 | **P0** | `clinician_interest` still stores **licence numbers and credential photographs** for an abolished programme | existing (acknowledged in code), unresolved |
| S-04 | P1 | There is **no account-deletion endpoint** — v1.9 §9 requires one | absent |
| S-05 | P1 | `/api/explain` is a live unauthenticated public-write endpoint with **zero client callers**, an outbound-email trigger, and a **global** anti-spam cap that is itself a DoS | contradictory |
| S-06 | P1 | `POST /api/partners` is unauthenticated — arbitrary attacker-chosen names and URLs enter the DB | partial |
| S-07 | P1 | `diff()`/`apply()` do not round-trip: a published remix can resolve to a different item order than the server validated | contradictory |
| S-08 | P2 | `/api/foodphoto` read-side MIME regex is broader than the write-side allowlist — latent stored XSS under the current CSP | partial |
| S-09 | P2 | `role='admin'` is keyed on a **username**, and usernames are derived from the Google e-mail localpart with no reserved-name list | partial |
| S-10 | P2 | Username enumeration oracle on `GET /api/u/<handle>`, unthrottled by design | partial |
| S-11 | P2 | `SESSION_SECRET` default makes participant cookies forgeable and the research pseudonym reversible; the boot warning only fires when the DB is on | could-not-check on prod |
| S-12 | P2 | Whole-corpus scrape is one unauthenticated request (2.41 MB brotli / 11.87 MB raw) | accepted-by-design |

Plus **§4 Removal scope** for the collection-of-interest feature the owner has decided to delete.

---

## S-01 · **P0** — `X-Forwarded-For` spoofing defeats every per-IP control

### The code — `server.js:877-880`

```js
function clientIp(req) {
  const xf = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return xf || (req.socket && req.socket.remoteAddress) || 'unknown';
}
```

`X-Forwarded-For` is a **client-supplied request header**. Proxies *append* to it, so the trustworthy
entry behind Railway is the **rightmost** hop, not `[0]`. `[0]` is whatever the attacker typed.

### VERIFIED — executed against the running server

```
--- 25 rapid POSTs, SAME spoofed XFF (9.9.9.9) ---
200 ×15, then 429 ×10        ← the limiter works when the key is stable

--- 25 rapid POSTs, ROTATING spoofed XFF (10.0.$i.1) ---
200 200 200 200 200 200 200 200 200 200 200 200 200 200 200 200 200 200 200 200 200 200 200 200 200
```

**25 of 25 accepted.** The token bucket is not defeated — it is simply never consulted twice.

### Everything keyed on `clientIp()`

| control | line | what breaks |
|---|---|---|
| `rateAllow()` — the only volumetric write limit on the entire API | 881 | unbounded writes to every POST endpoint |
| `countOnce()` — dedupes `booking_clicks`, `shared_plans.clicks`, `profile_views` | 929 | **fabricated counts** — a direct violation of non-negotiable product constraint 5. `server.js:994-997` calls `booking_clicks` "the single easiest number on the site to fabricate" and the fix does not hold. |
| `interestAllow()` — 10 stored addresses per IP per 24 h | 960 | unbounded signups (moot once §4 lands) |

### Change spec

Trust only the **last** XFF hop, and only when the immediate peer is the known proxy:

```js
function clientIp(req) {
  const chain = String(req.headers['x-forwarded-for'] || '').split(',').map(s => s.trim()).filter(Boolean);
  const peer = (req.socket && req.socket.remoteAddress) || 'unknown';
  if (!TRUST_PROXY) return peer;              // env flag, default off for local
  return chain.length ? chain[chain.length - 1] : peer;
}
```

Gate it with a test that sends `X-Forwarded-For: 1.1.1.1, 2.2.2.2` and asserts the bucket key is
`2.2.2.2`, and **prove it by reintroducing `[0]`** and watching the test fail.

> Note: on Railway the proxy may itself rewrite XFF. Verify the real header shape on production
> before shipping — **NEEDS FELIX / a production request dump.** Getting this wrong in the other
> direction collapses every user behind the proxy into one bucket.

---

## S-02 · **P0** — the write guard is not an authorisation, and there is no CSRF token

### VERIFIED

```
$ curl -X POST /api/protocols/check -d '…'                                   → 403 Forbidden
$ curl -X POST /api/protocols/check -H 'Origin: http://localhost:8099' \
       -H 'User-Agent: Mozilla/5.0 (Macintosh) … Chrome/126' -d '…'          → 200 {"ok":true,…}
```

Two extra headers. `looksAutomated()` (`server.js:910-914`) is a regex over a string the attacker
writes; `sameOrigin()` (899-908) reads a header a *browser* cannot forge cross-site but a *script*
sets freely.

### What this is and is not

- **Against browser CSRF: adequate.** `sameOrigin()` plus `SameSite=Lax` on `sid`
  (`server.js:538`) is a real control. Note `SameSite=Lax` still permits top-level cross-site
  **GET** navigation with cookies — which matters because three GET handlers mutate state
  (`/api/track`, `/api/shared-plan`, `/api/u/:handle` all `UPDATE … +1`).
- **Against scripted abuse: nothing.** There is **no CSRF token, no nonce, no proof-of-work, no
  captcha** anywhere in `server.js`. Combined with S-01, an attacker has an unbounded write channel
  to every POST endpoint on the site.

### Concretely, what a hostile user can still do today

1. Flood `explain_posts` (S-05) and trigger outbound e-mail from RNAwiki's sending domain.
2. Flood `partners`, `feedback`, `protocol_requests`, `user_foods` moderation queues (S-06).
3. Inflate `booking_clicks` / `shared_plans.clicks` arbitrarily (S-01).
4. Publish unlimited `studio_protocols` — *subject to* `studio-safety.js`, which does hold: a
   restricted substance, an off-ladder dose, an unknown id and a danger pairing are all refused at
   publish. **The safety engine is the strongest control on this site and it is not bypassed by any
   of the above.** What is unbounded is *volume*, not *content*.
5. Enumerate usernames (S-10).

### Recommendation

Given constraint 4 (solo-maintainable, two npm deps) the proportionate answer is **not** a token
framework. It is: fix `clientIp()` (S-01), then add a per-endpoint cost for the three endpoints that
have real-world side effects — a signed `rw_pid` cookie is already minted (`server.js:442-461`), so
key the expensive limits on **that** (it is HMAC-signed and server-issued) rather than on an IP.

---

## S-03 · **P0** (privacy) — government identity documents retained for an abolished programme

**Status: existing, acknowledged in code, unresolved. NEEDS FELIX.**

`db.js:301-314`:

```sql
CREATE TABLE IF NOT EXISTS clinician_interest ( … );
ALTER TABLE clinician_interest ADD COLUMN IF NOT EXISTS country    TEXT;
ALTER TABLE clinician_interest ADD COLUMN IF NOT EXISTS license_no TEXT;
ALTER TABLE clinician_interest ADD COLUMN IF NOT EXISTS proof_photo TEXT;
```

`server.js:1993-2006` records the history: the intake endpoint accepted, **with no account and no
e-mail verification**, a name, e-mail, profession, country, a **professional licence number** and a
**base64 photograph of a credential document**. The endpoint is closed (good) and the reader
`GET /api/clinician-photo` is `isSuper`-gated (good). The rows and the photographs remain.

The code's own comment: *"Collecting government identity documents for a verification programme that
has been abolished is the largest data liability on this site."* I agree, and I agree with its
reasoning that deletion should follow telling the people on the list rather than happen as a code
side-effect. **That makes it a Felix decision with a deadline, not a defect I can close.**

v1.9 §9.2 lists "email, precise age/location, consent record" as never-public — these are not public,
so this is a **retention/minimisation** issue (PDPA), not a disclosure one.

**Action for Felix (concrete):**
1. `SELECT count(*), min(created_at), max(created_at) FROM clinician_interest;` — how many people.
2. Export what exists (`GET /api/admin/export`).
3. Mail them, then `UPDATE clinician_interest SET proof_photo = NULL, license_no = NULL;` and drop
   the columns. Keeping the row without the identity document is the minimal honest outcome.

---

## S-04 · P1 — there is no account-deletion endpoint

**Status: absent**

v1.9 §9: *"Account deletion immediately removes the public projection and queues index/cache
removal."*

What exists is `DELETE /api/mydata` (`server.js:1403-1411`), which deletes `outcome_checkins`,
`blood_markers`, `wearable_daily`, `user_profile` and withdraws consent. That is the *research* data.

What survives an account holder's every available action:

`users` (username, e-mail, `google_sub`) · `sessions` · `comments` · `explain_posts` ·
`studio_protocols` (title + spec — a protocol title is something a person writes about their own
body) · `feedback` (with `contact`) · `user_foods` · `rep_events` · `protocol_forks` ·
`shared_plans`.

`POST /api/protocols/:code/withdraw` (`server.js:1865-1874`) is genuinely good — owner-only via the
`WHERE user_id=$2` clause, no owner override, and it keeps the row so remixes still resolve. But it
is per-protocol and it does not remove the account.

**Change spec:** `DELETE /api/account` — anonymise `users` (null the e-mail and `google_sub`, rename
the handle to a tombstone), delete `sessions`, delete `explain_posts`/`comments`/`feedback` authored
by the user, set every `studio_protocols` row to `status='withdrawn'`, and leave `studio_clones`
alone (it is keyed to browser keys, not user ids — see `server.js:1605-1650`, which is the best
privacy commentary in the repo).

---

## S-05 · P1 — `/api/explain`: a live public-write endpoint with no client, an e-mail trigger, and a global DoS

**Status: contradictory** (a live write surface with no product on the other end)

### VERIFIED — no caller exists

```
$ for f in site/*.js; do grep -aoc "api/explain" "$f"; done   → 0 in every file
```

`site/app.js` has no `api.explain*` method (the api object is at `app.js:780-810`). The Feynman
"explain it back" box (`app.js:2166`) is a **private, local** self-test — it posts nothing.

### The endpoint is nevertheless fully live (`server.js:1139-1193`)

- `POST /api/explain` needs **no account**: `const u = await currentUser(req).catch(() => null)`.
- It writes a public row keyed by an arbitrary caller-chosen `slug` (80 chars, unvalidated against
  any real page).
- Anonymous anti-spam, `server.js:1172-1173`:

```js
const ac = (await db.query("SELECT count(*)::int n FROM explain_posts WHERE user_id IS NULL AND created_at > now() - interval '10 minutes'")).rows[0];
if (ac && ac.n >= 20) return json(res, 429, { error: 'A lot of anonymous posts just arrived — …' });
```

  This is a **global** counter, not per-actor. **One attacker posting 20 rows in ten minutes blocks
  every anonymous user on the site from posting.** The comment above it explains it chose volume over
  IP "because IP is unreliable behind Railway's proxy" — correct diagnosis (see S-01), wrong remedy:
  the signed `rw_pid` cookie (`server.js:442-461`) is the right key and already exists.

- It triggers outbound e-mail: `notifyReply(parent.id, slug, u, body)` (`server.js:1189`). The
  `parent_id`-aiming amplifier was correctly closed on 2026-08-08 by resolving the parent against
  the slug (`server.js:1185`), and the body is `htmlEsc`'d (`server.js:582`). **Both of those fixes
  hold.** What remains is that an unauthenticated caller can still cause RNAwiki's sending domain to
  e-mail a legitimate reply-author, repeatedly, at burst rate.

**Recommendation:** given zero callers, the honest move is deletion — endpoint, table (following the
`newsletter_subscribers` / `telegram_*` discipline already documented in `db.js:78` and `287-296`),
and `notifyReply()`. If it is meant to ship in v1.9's Discussion, then it needs per-actor limiting on
`rw_pid`, slug validation against the real route table, and a moderation state — none of which exist.

---

## S-06 · P1 — `POST /api/partners` is unauthenticated

`server.js:1681-1691`:

```js
if (seg[0] === 'partners' && method === 'POST') {
  const b = await readBody(req); …
  const link = safeUrl(b.link), backlink = safeUrl(b.backlink_url), …
  const u = await currentUser(req);                       // ← optional, checked nowhere
  await db.query('INSERT INTO partners(… submitted_by) VALUES(…)', [… u ? u.id : null]);
```

Anyone who can pass S-02 (two headers) can insert unlimited rows carrying an attacker-chosen business
name, type, location and two attacker-chosen URLs.

**Mitigations that hold:** `safeUrl()` (`server.js:404-409`) enforces `^https?://` — no `javascript:`
or `data:`; the `backlink` must contain `rnawiki.com|rnawiki.ai|rna-wiki.com`; and `GET /api/partners`
filters `status='active'`, so a pending row is never rendered.

**Residual:** queue flooding, and an unbounded attacker-controlled URL store that a human moderator
is expected to click. Add `if (!u) return 401` — a business listing is not an anonymous-first action
under constraint 3, which protects *reading, logging and the $0 protocol*.

---

## S-07 · P1 — `diff()`/`apply()` do not round-trip; a published remix can differ from what was validated

**Status: contradictory** · **VERIFIED by fuzzing the real module**

`server.js:1814` stores a remix as a **patch**, not as the spec it validated:

```js
if (!v.ok) return json(res, 422, …);          // validate() ran on v.spec
const patch = STUDIO.diff(base.spec, v.spec); // ← what is stored
```

`GET /api/protocols/:code` later rebuilds it with `STUDIO.resolve()` → `apply()`. If
`apply(base, diff(base, next)) !== next`, the published document is not the validated one.

### Fuzz result (40,000 random edit sequences over the real `studio-safety.js`)

```
tested 40000 | membership diverged: 0 | dose/override diverged: 0 | ORDER ONLY diverged: 361  (0.90%)
```

### Minimal reproduction

```
base:  [c0, c2, c4, c1, c8, c6]
next:  [c0, c2, c4, c9, c1, c8, c6]        ← author inserted c9 at index 3
patch: {add:[c9], move:[[c1,4],[c8,5],[c6,6]]}
apply: [c0, c2, c4, c1, c8, c9, c6]        ← c9 lands at index 5
```

**Cause:** `apply()` (`studio-safety.js:290-305`) runs drop → set → **add (appends to the end)** →
move, while `diff()` (`310-335`) computes `move` indices against `next`'s final positions. Added
items are already at the tail when the moves execute, so every index below the insertion point is
off by the number of insertions.

### Severity: P1, not P0 — stated honestly

`validate()` is order-independent (every rule iterates `items` as a set), so **no safety refusal is
bypassed**, and membership and dose overrides always round-trip. The harm is integrity and honesty:
`site/app.js:9520` renders `spec.items` in order, and this site tells readers explicitly to
*"work down the list — cheapest & safest first"* (`app.js:6310`). A remix can present a different
priority order than its author saw and than the server signed off.

### Change spec

In `apply()`, insert `add` items at their intended index instead of appending — i.e. have `diff()`
emit `add: [[item, index], …]` — or simply rebuild the final order from an explicit `order: [keys…]`
field and drop `move` entirely. Then gate it: a property test asserting
`apply(base, diff(base, next))` deep-equals `next` over ≥10,000 random sequences, and
**prove the gate by restoring the current `apply()`**, which fails it at ~0.9%.

---

## S-08 · P2 — `/api/foodphoto` read/write MIME mismatch (latent stored XSS)

`server.js:1010-1015` (read):

```js
const mm = d.photo_data.match(/^data:(image\/[\w+.-]+);base64,(.*)$/);
res.writeHead(200, { 'Content-Type': mm[1], … });
```

`server.js:1724` (write):

```js
const photo = typeof b.photo_data === 'string'
  && /^data:image\/(png|jpe?g|webp);base64,/.test(b.photo_data)
  && b.photo_data.length < 60000 ? b.photo_data : null;
```

The reader will serve **any** `image/*` subtype the row happens to carry, including
`image/svg+xml`. The global CSP (`server.js:3090`, applied via `res.setHeader` to *every* response
at `server.js:3126`) is:

```
script-src 'self' 'wasm-unsafe-eval' 'unsafe-inline' https://accounts.google.com https://static.cloudflareinsights.com
```

`'unsafe-inline'` is present, and `X-Content-Type-Options: nosniff` does not help against a
*declared* `image/svg+xml`. So a top-level navigation to `/api/foodphoto?id=N` on an SVG row would
execute attacker script **in the rnawiki.com origin**. `sid` is `HttpOnly` so the cookie is not
readable, but same-origin `fetch()` would carry it *and* satisfy `sameOrigin()` — i.e. full
authenticated action on the victim's behalf.

**Not exploitable today.** The write allowlist is `png|jpe?g|webp`; the Telegram photo path is gone
(`server.js:1017-1019`); I found no other writer of `photo_data`. This is a defence-in-depth gap that
becomes live the moment any future writer, import or legacy row carries a different subtype.

**Change spec (two lines, no behaviour change):** narrow the read regex to the same allowlist, and
add `Content-Disposition: attachment` + `Content-Security-Policy: sandbox` on that response.

---

## S-09 · P2 — `role='admin'` is keyed on a username; usernames come from the Google e-mail localpart

`server.js:490` — `const ADMIN_USER = (process.env.ADMIN_USER || '').toLowerCase();`
`server.js:531` / `1462` — `if (u && ADMIN_USER && u.username.toLowerCase() === ADMIN_USER) u.role = 'admin';`

`server.js:1452-1459` derives a new Google account's username from the e-mail localpart:

```js
let base = (email.split('@')[0] || String(p.name || 'user')).toLowerCase().replace(/[^a-z0-9_.-]/g,'').slice(0,20) || 'user';
```

There is **no reserved-username list anywhere in `server.js`** (grep for `RESERVED|reserved|blocklist`
→ no hits). So if `ADMIN_USER` is set to a name that is *not yet taken*, the first person to sign in
with a Google account whose localpart matches that string is granted `role='admin'`.

`role='admin'` is not nothing: it approves and rejects proposed edits (`server.js:2446`, `2474`),
opens the review panel (`2217`), reads the pending-food queue (`1700`), and deletes any comment
(`1494`).

**Mitigations that hold:** `isSuper` was correctly re-keyed to immutable identifiers after the
2026-07-28 e-mail escalation (`server.js:495-504` — *"NEVER key this on email again"*), and the
`UNIQUE(username)` collision handler means an **existing** `ADMIN_USER` account cannot be
impersonated. So this is a race on a name, not a takeover of a live account.

**Change spec:** key `role='admin'` on `SUPERADMIN_ID`/`SUPERADMIN_GOOGLE_SUB` like `isSuper` does,
and add a reserved-handle list (`admin`, `rnawiki`, `official`, `moderator`, `support`, `staff`,
`felix`, plus whatever `ADMIN_USER` holds) to the Google username derivation. Impersonation matters
independently: v1.9 §5.3 permits an "Identity verified" label only behind a real
ownership/impersonation check, and RNAwiki has no such check today.

**COULD-NOT-CHECK:** whether `ADMIN_USER` is set on production. **NEEDS FELIX** —
`railway variable list --service RNAwiki`.

---

## S-10 · P2 — username enumeration oracle

`server.js:1605-1609` — `GET /api/u/<handle>` returns `404 {"error":"No such user"}` for an unknown
handle and `200 {user:{…}}` for a known one. GET is deliberately outside the write chokepoint
(`server.js:982-983`, "reads must stay anonymous and unthrottled"), so this is unlimited.

Because handles are derived from Google e-mail localparts (S-09), this is effectively an oracle for
*"does someone with this e-mail localpart have an RNAwiki account"*.

Low severity — the response body is exemplary (see below) and the handle is the only thing exposed —
but the correct answer is to return the same shape for both cases, or to include this endpoint in a
generous read-side bucket keyed on the signed `rw_pid`.

**Positive, recorded so it is not regressed:** the comment block at `server.js:1610-1650` is the best
privacy design in the repo. It enumerates what a stranger may see and why, states that
`reputation_points`, `socials`, `badges`, `profile_views`, proposal/edit/comment counts came *off*
the wire, truncates the join date to the **month**, never lists drafts or withdrawn protocols, and
notes that *"which protocols does @alice follow" is not merely unrendered, it is not answerable in
SQL* because `studio_clones` is keyed to a browser key with no `user_id`. It also refuses to add such
a field behind a toggle. That is exactly the v1.9 §9.1/§9.2 allowlist discipline. **Do not regress
it, and do not let a v1.9 "Profile" rebuild reintroduce Avatar Level, Credits or Active Journey
without re-reading it.**

---

## S-11 · P2 — `SESSION_SECRET` default, and a warning that can be missed

`server.js:3147-3152`:

```js
if (db.enabled && SECRET === 'dev-secret-change-me') {
  console.warn('[security] SESSION_SECRET is UNSET — participant cookies are forgeable and the research-export pseudonym is reversible…');
}
```

The diagnosis is right: with the default, `anonSign()` (`server.js:442`) is an HMAC under a key
published in a public repository, so `rw_pid` is forgeable — which would re-open the exact
`voterKey` forgery closed on 2026-08-01 — and the research-export pseudonym is reversible by anyone
with the repo.

Two observations:
1. The warning is gated on `db.enabled`, so a misconfigured deploy that *also* loses its database
   prints nothing.
2. It warns and continues. For a value this load-bearing, refusing to boot in production
   (`NODE_ENV === 'production'`) is the proportionate behaviour.

**COULD-NOT-CHECK on production. NEEDS FELIX:** confirm `SESSION_SECRET` is set to ≥32 random bytes
on the `RNAwiki` Railway service.

---

## S-12 · P2 — whole-corpus scrape in one request (accepted-by-design, one correction to the baseline)

`GET /data.js` is unauthenticated, unthrottled and returns the entire corpus.

### VERIFIED — and this **contradicts** the W0 baseline errata

`W0_BASELINE.md` §3 states: *"`data.js` is brotli-compressed and deferred → **neither**.
11,662,047 B encoded AND decoded, no ETag, `If-Modified-Since: 2040` returns the full body."*
That no longer reproduces on this branch:

```
Accept-Encoding: br   →  Content-Encoding: br,  Content-Length: 2,412,320
Accept-Encoding: (none) →                       Content-Length: 11,874,630
ETag: "b53146-19fea2ee6a6"   ·   Cache-Control: no-cache   ·   Vary: Accept-Encoding
If-None-Match: <etag>  →  HTTP 304
```

Brotli **is** served (`site/data.js.br` exists, `build/precompress.js`), an ETag **is** present, and
revalidation **does** 304. Whoever quotes that errata line next should use these numbers instead.

The scrape itself is not a defect — a free wiki that renders client-side must ship its corpus, and
constraint 1 says free. Recorded so it is a decision rather than an oversight. If it ever matters,
the cheap mitigation is a read-side bucket on `rw_pid` for `/data.js` **only**, never for HTML.

---

## 2. What I attacked and could **not** break

Recorded so a future round does not re-attack these, and so nobody "simplifies" them away.

| Attack | Result | Why |
|---|---|---|
| SQL injection | **no finding** | Every `db.query` in `server.js` uses `$n` placeholders. I read all ~110 call sites. Even `DELETE FROM comments WHERE id=$1 AND (user_id=$2 OR $3='admin')` is parameterised. |
| Publish a prescription/controlled substance in a protocol | **refused** | `studio-safety.js:172-179` (R4). VERIFIED: `[Testosterone + Ephedrine] publish=true → refusals`. Unconditional; no override path exists. |
| Type an off-ladder or above-cap dose | **refused** | `studio-safety.js:149-161` (R3). Refused even when *under* the ceiling if the value is not on the ladder. |
| Smuggle prose into a protocol row (so a master correction stops reaching runners) | **refused** | `OVERRIDE_KEYS` (`studio-safety.js:34-39`) — no `name`, `text`, `instructions` or `evidence` key exists; R1 rejects any other own key. |
| Prototype pollution via `__proto__`/`constructor` in a spec item | **refused** | R1 iterates `Object.keys(it)` and rejects anything not in the allowlist; `JSON.parse` makes `__proto__` an own key, so it is caught. |
| Unbounded remix chain / cycle hang | **bounded twice** | `studio_protocols.depth <= 8` **and** the `_n` counter in `resolve()` (`studio-safety.js:274-288`), deliberately belt-and-braces. |
| Read another account's draft | **refused** | `GET /api/protocols/:code` 404s on `status='draft'` (`server.js:1895`); `GET /api/protocols/mine` is the only draft reader and is scoped by `user_id=$1`. |
| Withdraw someone else's protocol | **refused** | `user_id` is in the `WHERE` clause, not checked after (`server.js:1868`). No owner override. |
| XSS via a protocol title / author handle | **refused** | `esc()` (`app.js:684`, escapes `& < > "`) is applied to `d.title`, `d.by_user`, `it.note`, `stSummary(it)` and every fork/comment/food/feedback field I traced. |
| Bind a victim's Google identity to an attacker account | **refused** | `server.js:1440-1448` — `ORDER BY (google_sub=$1) DESC` after the 2026-07-28 fix. |
| Super-admin escalation via a chosen e-mail | **refused** | `isSuper` keys on the serial PK or the Google subject only (`server.js:495-504`). |
| Cross-origin write | **refused** | `sameOrigin()` requires Origin **or** Referer to match Host and returns `false` when both are absent — the hoisting bug that inverted this is documented as removed (`server.js:540-545`). |
| Private state in a URL / index | **holds** | `/me`, `/u/<handle>`, `/studio`, `/p/<code>` all return `X-Robots-Tag: noindex, nofollow` (VERIFIED by `curl -I`). |
| Shared-plan code brute force | **not practical** | `crypto.randomBytes(6)` → 48 bits (`server.js:1269`). |
| Health data in a public profile | **refused** | see S-10's positive note. |

---

## 3. Cross-references to the clinical audit

- The **only** action control on 88 restricted compound pages is a self-directed add
  (`clinical_pharmacy_safety_audit.md` §C-01/C-02). That is a *policy* defect, not an authorisation
  one — `studio-safety.js` still refuses to publish those compounds — but it is the single
  highest-severity finding across both files.
- `/p/<code>` headlines a green "Nothing flagged" over zero coverage (§C-03). Security-adjacent
  because it is a **claim** the server did not make: `studio-safety.js` produced the honest ❔
  sentence and the client demoted it.

---

## 4. Removal scope — the collection-of-interest feature

Per the owner's decision ("remove the collection-of-interest feature entirely"), here is the complete
surface. The form is already off the landing page; **everything below is still live.**

| what | where | note |
|---|---|---|
| `POST /api/interest` | `server.js:1045-1088` | still accepts and stores addresses (no-JS 303 flow) |
| `POST /api/interest/remove` | `server.js:1093-1105` | the **only** way anyone on the list can get off it |
| `interest_signups` table | `db.js:342-351` | holds the addresses |
| `INTEREST_TOPICS` | `server.js:947` + parsed from `data/site_config.json` | the nine-chip allowlist |
| `INT_SEEN` / `INT_PER_DAY` / `interestAllow()` | `server.js:956-971` | per-IP cap (defeated by S-01) |
| `/?state=ok\|bad\|dupe\|rate\|down\|removed` handler | `server.js:2704-2752` (`HAS_ANSWER_PANELS()`, `server.js:16`) | the answer panels + `#answer` focus target |
| `?t=<remove_token>` | reaches the reader only via the 303 URL | **nothing on this site sends e-mail for this list** |

**Order matters, and this is a P0 data-loss trap:**

1. `SELECT count(*), min(created_at), max(created_at) FROM interest_signups;` and **export the rows
   first**. The `remove_token` is delivered exclusively in a redirect URL — once the table is gone,
   nobody on that list can ever be told anything or removed by request, and the addresses are
   unrecoverable (Postgres has **no PITR**; the only backup is the GitHub Action to the private
   `rnawiki-backups` repo — verify it ran before dropping anything).
2. Delete the two endpoints and the `?state=` panels in the **same** commit, so a stale browser tab
   posting the old form gets a real 404 rather than a 500.
3. Drop `interest_signups` **by hand**, after the deploy is confirmed green — the same discipline
   `db.js:287-296` already applies to `newsletter_subscribers` and `telegram_*`.
4. Then remove `INTEREST_TOPICS`, `INT_SEEN`, `interestAllow()`, and the `interest` chips from
   `data/site_config.json` + `node build/parse.js`.

**Watch out:** `/?state=…` is also how the site returns from other no-JS flows in future, and
`HAS_ANSWER_PANELS()` (`server.js:16`) gates the whole panel block. Deleting the panels without
deleting `HAS_ANSWER_PANELS` leaves a dead gate; deleting `HAS_ANSWER_PANELS` without checking
`build/landing.js` may break the landing build. Boot the server and hit `/`, `/?state=ok` and
`/api/interest` after the change — `node --check` will not catch this.

---

## 5. NEEDS FELIX (cannot be closed by an agent)

| # | Ask | What to open / run | What it unblocks |
|---|---|---|---|
| F1 | Confirm `SESSION_SECRET` is set to ≥32 random bytes on production | `railway variable list --service RNAwiki` | S-11 — and with it the integrity of `rw_pid` and the research pseudonym |
| F2 | Confirm whether `ADMIN_USER` is set, and to what | same command | S-09 — decides whether the handle race is live |
| F3 | Decide the `clinician_interest` disposition (notify → null the licence + photo → drop the columns) | `SELECT count(*), min(created_at), max(created_at) FROM clinician_interest;` | S-03 — the largest data liability on the site |
| F4 | Confirm the real `X-Forwarded-For` shape Railway sends | one production request header dump | S-01 — fixing `clientIp()` wrongly collapses every user into one bucket |
| F5 | Confirm the `rnawiki-backups` GitHub Action ran recently | the Actions tab on `Compoundingzero/rnawiki-backups` | §4 step 1 — no PITR, so this is the only safety net before any DROP |
| F6 | Decide: delete `/api/explain` + `explain_posts`, or build the Discussion it was written for | — | S-05 |

---

## 6. Reproduction index

| finding | command |
|---|---|
| S-01 | `for i in $(seq 1 25); do curl -s -o /dev/null -w "%{http_code} " -X POST http://localhost:8099/api/protocols/check -H 'Content-Type: application/json' -H 'Origin: http://localhost:8099' -H 'User-Agent: Mozilla/5.0 Chrome/126' -H "X-Forwarded-For: 10.0.$i.1" -d '{"spec":{"v":1,"items":[{"k":"c","id":"c0"}]}}'; done` |
| S-02 | same, with and without the `Origin`/`User-Agent` headers |
| S-05 | `for f in site/*.js; do grep -aoc "api/explain" "$f"; done` |
| S-07 | fuzz harness in this file — loads the real `/Users/admin/ClaudeRepo/Claude Projects/rnawiki/studio-safety.js`, 40,000 trials |
| S-12 | `curl -sI -H 'Accept-Encoding: br' http://localhost:8099/data.js` then `curl -s -o /dev/null -w '%{http_code}' -H "If-None-Match: <etag>" http://localhost:8099/data.js` |
| noindex | `for u in /me /u/alice /studio /p/abc; do curl -sI http://localhost:8099$u \| grep -i x-robots; done` |

**Nothing in the repository was modified except the two files under `audit/v19/`.**
`git status` at the end of this audit shows only `audit/v19/clinical_pharmacy_safety_audit.md` and
`audit/v19/security_abuse_audit.md` as additions.
