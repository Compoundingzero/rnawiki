# RNAwiki production revamp state

Last updated: 2026-08-13

This file is the repository-local handoff for the current production architecture. Read it before
changing the navigation, Find, Today, protocol rendering, account consent, public identity,
community, protocol publishing, or interaction checker.

## Product spine now implemented

The public experience is organised around one plain-language loop:

1. **Find** a symptom or goal.
2. Compare **possible reasons**; RNAwiki does not diagnose a “root cause.”
3. Review the first useful action, its suitability, stopping rule and expected measure.
4. Save it and return to **Today** for one next action.
5. Open the full reasoning, movement, food, compounds and sources only when wanted.

The primary shell labels are **Find**, **Today**, **Learn**, and **Profile** or **Sign in**. Where it
hurts, A–Z and Browse remain available in the menu. The global Feedback floating button was
removed; feedback remains available in deliberate context rather than competing with every task.

## Rendering contract

Every visible change must still obey the two-document rule in `CLAUDE.md`:

- `build/prerender.js` owns the no-JavaScript/crawler document.
- `site/app.js` owns the hydrated document.
- `site/index.html` owns the SPA shell.
- Shell and route labels, copy, order and safety states must be updated in every applicable twin.

The protocol page deliberately uses progressive disclosure. The resting order is **Before you
start** (collapsed triage) → the first action and **Start day 1** → **What to track and when to
stop** (collapsed) → **Review the full protocol** (collapsed Move/Fuel/compound reasoning and
sources). The emergency boundary remains present and reachable without competing visually with
the action. Hiding a section visually is never permission to omit it from the prerendered document
or accessibility tree.

The problem page is now an assessment rather than a 30,000-pixel article. It leads with a compact
**Which feels closest?** comparison, keeps urgent-care guidance in a clearly labelled disclosure,
links each mapped reason to its own protocol, and puts the long mechanism for each possible reason
inside a separate closed disclosure. Do not restore a page-wide table of contents or open every
mechanism by default.

Find routes safety-sensitive language before fuzzy ranking. Emergency-shaped terms use `urgent`;
pregnancy, children and medicine-combination terms use `professional_review`. Those states must
show no approximate protocol cards. Keep `solveGuidance()` identical in `server.js` and
`site/app.js`, invoke it for direct URLs and live input/submit updates, and extend
`scripts/solve-guidance.test.mjs` whenever the corpus changes.

`/plan` is the device-specific **Today** utility. It is served at HTTP 200, self-canonical,
`noindex,follow`, and excluded from the sitemap. It must not become an indexed empty/personal page.
It also must not silently resume setup: an unfinished draft with no active protocol renders one
**Continue setup** action, whose explicit route is `/plan?mode=edit`. If an active protocol exists,
Today renders that protocol's next action and leaves the draft as secondary management state.

## Toxic/no-safe-dose document contract

A record with `risk_policy.tier === "toxic_no_safe_dose"` does not pass through the ordinary
compound lesson. Its dedicated document may contain only: an unmistakable no-safe-dose warning,
an emergency/poison-centre route, non-actionable mechanism and harm education, attributable
toxicology evidence, regulatory status, and references.

Both `build/prerender.js` and `site/app.js` must withhold evidence stars or scores, numeric dose or
range copy, dose-response comparisons, how-to-use content, sourcing, cost, protocol/stack links,
comparison/optimisation modules, social-generation controls and gamified learning actions. The
build inspects emitted prerendered bytes, and the browser smoke test inspects the hydrated DOM.
Keep an ordinary low-risk compound as a positive control so the toxic policy cannot erase the wiki
experience for every compound. Neutral A–Z and Browse rows keep the record findable, but render
**Toxic · no safe dose** instead of stars or generic product-like status shorthand. Goal, efficacy,
comparison and optimisation lists exclude the record entirely: inclusion under copy such as “help
you” is a recommendation even without a star glyph. On the prerendered detail page, stop guidance
and emergency action precede contents or supporting education; a generic table of contents is
deliberately suppressed. A toxic entry left in legacy local storage is quarantined before ordinary
stack interaction, goal, pathway or target analysis. Its quarantine shows exposure/emergency
guidance and only **Open toxicity guidance** and **Remove saved entry**. Community-stack imports
refuse toxic IDs and name the refusal instead of silently dropping them.

## Containment and privacy defaults

These server-enforced flags default to off and must not be enabled merely to reveal an unfinished
surface:

| Environment variable | Contained capability |
|---|---|
| `RESEARCH_COLLECTION` | storage of research profile, check-in, marker and wearable data |
| `PUBLIC_COMMUNITY` | comments, votes, reputation, forks, pulse and popularity lists |
| `PUBLIC_PROFILES` | `/api/u/:handle` public identity projection |
| `PUBLIC_OUTCOME_AGGREGATES` | uncontrolled self-report outcome percentages |
| `SHARED_PLANS` | health-state-bearing share codes |

Contained capabilities are absent from the visible task flow, not merely backed by endpoints that
return an error. In particular, the protocol vote strip remains hidden and makes no vote request
while `PUBLIC_COMMUNITY=0`; it becomes visible and interactive only after the server config says
the community capability is on. Find's protocol-request button, zero-result request action and
request board follow the same contract: they are not rendered and make no request while the flag
is off.

Research storage requires the latest explicit `consent_records` decision for purpose `research`.
Legacy `user_consent` rows are not proof because signup previously wrote consent automatically.
Consent choices are append-only and include their source. Withdrawal and research-data deletion
write a negative record before erasure.

Google sign-in resolves an account only by its stored Google subject. A matching email address is
not an account-linking instruction. An existing signed-in user may explicitly link Google from
account settings; unauthenticated collisions fail with `explicit_link_required`.

Existing accounts remain non-public. `users.public_profile_enabled` defaults to false and the
public-profile query requires it. There is no automatic migration based on username, protocol
publication or old account state.

Personal selections never travel in URLs. Legacy protocol `by`/`s`/`log` parameters and Stack
`ids` parameters are redirected or scrubbed before hydration; they are not imported. With
`SHARED_PLANS=0`, plan/progress sharing controls are absent and their endpoints return 404. A
clean public protocol URL is the only shareable protocol address in the contained release.

User-submitted food photos are unavailable unless `PUBLIC_COMMUNITY=1`, and even then only an
approved `active` record can be served. New foods and corrections both enter `pending`; images are
restricted to PNG, JPEG or WebP and are delivered `no-store` with MIME sniffing disabled.

Production with accounts refuses to boot unless `SESSION_SECRET` contains at least 32 characters.
Forwarded client addresses are trusted only when `TRUST_PROXY=1`, and only syntactically valid IPs
are accepted. Signup and sign-in currently require an explicit 18-or-older confirmation. Youth
accounts remain out of scope until independent child-safety, privacy and legal review.

## Protocol interaction contract

Interaction coverage has four explicit states: `not_applicable`, `complete`, `partial`, and `none`.
The unit is an **exact compound pair**, not a compound. A pair counts as covered only when a narrow
authored rule names both members; two compounds carrying unrelated tags are not pair coverage, and
positive synergy copy is not safety coverage. A protocol containing two or more compounds cannot
publish unless every exact pair is covered. Drafts remain editable but carry an honest coverage
state. Existing published protocols are revalidated against the current engine before being
returned; an invalid or incompletely covered result must fail closed and never inherit an old green
verdict. Even complete coverage is described neutrally as authored guidance, never “safe” or
“nothing flagged.”

Prescription, controlled, experimental, toxic and no-safe-dose compounds must not become
self-directed plan actions. Do not add an override button around a refusal.

Creator-written titles and notes are private-draft content, not reviewed health copy. Public
Studio titles are generated from the governed problem/root-cause labels (or the neutral “Custom
RNAwiki protocol” fallback). Any non-empty creator note makes publication fail closed until a real
human review and `ReviewRecord` workflow exists. Existing public protocols are revalidated and
their stored custom titles are never returned on public surfaces.

## Protocol Studio: one problem, N causes, N plans

A reader arrives with a **symptom**. What they can act on is one of the **root causes** under it —
10 of 41 problems publish more than one, and knee pain publishes three. What you do about a tendon
being overloaded is not what you do about cartilage wear, so those are separate plans, not one plan
with options.

The Studio draft is therefore `{v:2, title, pid, causes:[{rcid, items, code}], open, remixOf}` in
`localStorage` under `rnawiki_studio_draft`. One `pid` chosen once; one entry per root cause, each
with its own item list, its own safety verdict and its own published code. `stMigrate()` converts a
v1 draft (`{title, items, base_pid, base_rcid}`) into a single-cause v2 draft rather than dropping
it; a draft that arrives with no problem keeps its plans visible under the problem picker.

- **Publishing publishes one cause.** Each is its own `studio_protocols` row keyed
  `(base_pid, base_rcid)` — the pair `idx_studio_base` and the variants rail already group by, and
  the pair `publicProtocolTitle()` builds the neutral public title from. A plan with no cause is
  refused in the client with the reason, before the server's shape refusal.
- **A creator never names a cause.** Every cause offered comes from the governed graph, so
  `base_rcid` always resolves in `studio-safety.js`. Overlay `_stub` causes (an approved
  root-cause change not yet in `site/data.js`) are excluded, because they build and then refuse.
  The route for a cause RNAwiki does not publish is the moderated `POST /api/rootcause-changes`
  queue; it is linked, never reimplemented as a text field.
- **Every cause is checked, not just the open one.** `stCheckAllCauses()` runs the same
  corpus-only `POST /api/protocols/check` per non-empty cause and paints the result on its card. A
  cause whose request fails renders as *not checked*, never as clean, and a checked cause with
  nothing to say prints so — an empty strip must not be mistakable for an unchecked one.
- **The branch that is not a plan.** The spine renders the problem's own authored
  `plan.reassess` prose, unfolded. It is collapsed on the reading page because the reader is
  deciding for themselves; in the Studio somebody is authoring a plan strangers will run.
- **No canvas.** Every control is a full-width block with a ≥44px target; nothing is dragged,
  connected or positioned. A pointer-driven canvas on a 390px screen fights vertical scroll and the
  iOS left-edge back gesture — the same reason item rows have no drag handle.
- `/studio` and `/studio/<code>` both serve the SPA shell (`SPA_MAX_ARGS`, noindex). `/studio/<code>`
  answered 404 on direct load until 2026-08-13 although `app.js` navigates there itself after a
  remix.

Gates: `assertStudioAuthorsEveryRootCause()` in `build/parse.js` (source), the multi-root-cause
base block in `scripts/studio-safety.test.mjs` (validator), and
`oneProblemAuthorsAPlanPerRootCause` in `scripts/smoke.mjs` (rendered browser).

## Account and deletion contract

- Account creation and sign-in are 18+ until the youth gate is independently approved.
- Research participation is separate from account use and defaults off.
- Account deletion is available from the user’s data controls and withdraws authored public
  protocols before the account row is removed.
- Public projections use an allowlist; private health state must never be inferred from “helpful”
  profile fields, URL parameters, analytics events or share previews.

## Release gates

Run before every push:

```text
npm run gate
```

This runs the exact production prestart sequence, rebuilds every public document and then runs
the containment, privacy, Studio safety and safety-query tests. The GitHub workflow
`.github/workflows/release-gates.yml` runs this exact gate on pull requests and `main`, installs a
pinned browser driver, and then executes the rendered mobile journey smoke suite.

For visible changes, also boot the local server and inspect the real hydrated and prerendered
documents at phone and desktop widths. `scripts/smoke.mjs` is a required Chrome-backed release
gate; locally it needs `puppeteer-core@25.6.0` available without changing the production lockfile.

## Deliberately not launched in this release

The marketplace, redeemable currency, engagement multipliers, avatar body transformations,
paywalled creator protocols, youth accounts, automatic community publication and public outcome
claims are not part of this release. They require economic-abuse, advertising, clinical, privacy,
moderation and/or child-safety contracts that do not yet exist. Do not resurrect their old tables
or UI fragments as a shortcut.

No camera and no video remain project constraints.
