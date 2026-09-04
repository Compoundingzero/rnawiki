# Design system study — running log

A design system for RNAWiki derived from studying ten reference sites directly, governed by Apple's
simplicity principles, serving a biohacker audience from newcomer to expert. Research and
specification first. No production styling changes until Phase 4 is approved.

**FROZEN:** the home page search bar is the site's single primary action. Its position, visual
prominence and behaviour stay exactly as they are. Nothing may sit above it or compete with it. A
proposal that reduces its prominence is discarded, not the search bar.

<!-- RESUME BLOCK — keep at the top, rewrite after every site -->

## RESUME

**Where work is: DELIVERY 1 MADE, STOPPED (2026-09-04).** Track A phases A1 + A2 are complete:
gate confirmed, 15 sites + baseline captured, 16 viewed and verified, synthesized and checked, the
Phase 2 table revised. The record is "Phase 3 — visual findings and the revised Phase 2 table"
below and the full evidence file `design-study-phase3.md`. **Nothing runs until Felix decides.**

**Felix's decisions pending (each stated in full under "Open decisions for Felix"):**
1. Wikiwand — a human visit (save the Metformin article screenshots by hand into
   `data/design-study/captures/wikiwand_com/`) or leave the dossier contents-rail surface unassigned.
2. Atlas Obscura — confirm or reverse the personal-use judgement call (reversing deletes its
   captures and removes atlas F28, F29, B1–B3, B5, B6 from the synthesis).
3. Awwwards and Quanta — accept two surfaces governed by Phase 1 numbers alone, or reassign them to
   references that were seen.
4. The gate's robots breach on the OSF and Zenodo API paths — how B4 reconciles documented API terms
   with the robots files before any linkage is built.
5. Approval to proceed to A3 (disclosure spec) and A4 (three rendered examples, verification, the two
   uniqueness metrics), and separately the go for Track B1.

**On resume:** `npx tsx scripts/design-study/status.ts` shows `phase: 3-delivery-1-stopped` and
`awaiting: Felix`. If Felix has answered, record each answer with
`npx tsx scripts/design-study/confirm-gate.ts` (Atlas) or `addDecision` in `state.ts`, then start
A3 from the mandate section below — design only, no production styling. Do not re-run captures,
viewers, verifiers or the synthesis; all are on disk and committed. A Wikiwand human visit is
followed by the viewer + verifier prompts (in the workflow script under the session's `workflows/`
directory, or reconstructable from "Mandate — Track A"), then `measure.ts --site wikiwand.com`.

**Lesson recorded for every later workflow:** never resume a fan-out workflow after editing a prompt
in the middle of its item list; the runner replays only the longest unchanged prefix, so every later
call re-runs. Start a fresh run holding only the agents that remain.

**Decided by Felix, do not re-litigate:** light mode is the default; dark is available using
Vercel's mirrored ramp so contrast holds in both themes. Corpus for Track B is BROAD, 803.

**FROZEN, restated:** the home page search bar keeps its position, prominence and behaviour;
nothing sits above it or competes with it. A proposal that reduces it is discarded.

| Phase | What it does                                              | State   |
| ----- | --------------------------------------------------------- | ------- |
| 1     | Study the ten references directly; record tokens           | ✅ 9 measured, 1 blocked (`ca797ef`) |
| 2     | One governing reference per surface; validate hypothesis   | ✅ written (`c61b7d0`); revised in Phase 3 |
| A1    | Legal gate; capture and SEE the ten references             | ✅ 6 rendered and viewed; Wikiwand blocked; Quanta, Verge, Awwwards link-only |
| A2    | Capture and study the nine community sites' information design | ✅ 9 captured, viewed, verified (LongeCity index only) |
| —     | **Delivery 1: visual findings + revised Phase 2 table**    | ✅ made 2026-09-04 — **STOPPED for Felix** |
| A3    | Progressive disclosure spec, newcomer to expert            | ⛔ waits on Felix |
| A4    | Revised Phase 2 table, three rendered examples, verify, metrics | ⛔ waits on A3 |

<!-- END RESUME BLOCK -->

## Legal and ethical gate — record of what each source permits (2026-09-03)

Run by `scripts/design-study/legal-gate.ts` (plain HTTPS GET, user agent
`RNAWiki-design-study/1.0 (+https://rnawiki.com; design research; contact felix360506@gmail.com)`),
one request per second per host, every request logged in `data/design-study/legal/requests.log`
(121 requests). Fetched per site: `robots.txt`, the terms page (or the index page once, to find the
terms link), and for the nine community sites the API root or its documentation plus the single
listing or API query needed to choose one public content page. No forum thread was fetched. The
saved robots files are committed under `data/design-study/legal/`; the saved terms texts stay on
disk. Every proposed decision was re-checked by an independent skeptic that re-parsed the saved
robots file for the two study paths and re-read the saved terms; the skeptics agreed on 18 of 19
and disagreed on Wikiwand, where the answer came from the real-browser retry below. The decision
column is the orchestrator's confirmed decision; the full reasoning per site is in
`data/design-study/legal-gate-confirmations.json`, and the gate's own proposal and clauses in
`data/design-study/legal-gate.json` and `legal-gate.md`.

| site | robots index/content | terms URL | what the terms say | API + licence | decision |
| --- | --- | --- | --- | --- | --- |
| wikiwand.com | allowed / allowed | none found | No terms document could be read: both registry candidates (/terms and /en/terms-of-service) and the index page returned HTTP 403 to this gate, the index as a 5,671-byte challenge page, so what the terms permit for a person-operated browser rendering public pages and saving screenshots for private study is unestablished. | not investigated; licence: none stated | **blocked** |
| stripe.com/docs | allowed / allowed | https://stripe.com/en-sg/legal/consumer | The document reached from the registry's first candidate is Stripe's Consumer Terms of Service (it redirected to /en-sg/legal/consumer), which governs Stripe's consumer payment services rather than reading docs.stripe.com; it contains no clause about automated access, crawling, rendering or screenshots, and its only automation language defines payment "Agents". | not investigated; licence: none stated | **capture** |
| vercel.com/docs | allowed / allowed | https://vercel.com/legal/terms | Vercel's terms are a subscription agreement for using the Vercel platform: the restrictions attach to the Services and to the licence a customer receives, not to reading vercel.com/docs. | not investigated; licence: none stated | **capture** |
| linear.app/method | allowed / allowed | https://linear.app/terms | Linear's terms are a customer subscription agreement for the Linear product; the use restrictions attach to the Service and its Software (no modifying, copying, reverse engineering), not to reading the public /method pages. | not investigated; licence: none stated | **capture** |
| quantamagazine.org | allowed / allowed | https://www.quantamagazine.org/terms-conditions/ | The terms permit use of the Site for personal, non-commercial use only and then forbid two things this phase would do: reproducing or storing the material on the Site, and conducting systematic or automated data collection on it. A scripted browser saving page images is automated collection and the saved image is a reproduction, so the clauses are taken literally rather than read around. | not investigated; licence: none stated | **link-only** |
| theverge.com | allowed / allowed | https://www.voxmedia.com/terms-of-use/ | Vox Media's terms forbid using any "robot", "spider", "rover", "scraper" or any other data-mining technology or automatic or manual process to monitor, cache, frame, mask, extract data from, copy or distribute any data from the Services, and separately say the Content may not be copied, reproduced or republished without prior written permission. | not investigated; licence: none stated | **link-only** |
| smashingmagazine.com | allowed / allowed | https://www.smashingmagazine.com/privacy-policy/ | No terms-of-service document exists at the registry's candidate — /terms-of-use/ returns HTTP 404 and the index page exposes no anchor matching terms, conditions or legal — so the only policy document reachable was the privacy notice recorded here; it is a privacy notice, not terms, and the excerpts come from it. | not investigated; licence: none stated | **capture** |
| pudding.cool | allowed / allowed | https://pudding.cool/about/ | The Pudding publishes no terms-of-service document: /terms/ returns HTTP 404 and the index exposes no anchor matching terms, conditions or legal, so the page recorded here is the About page the registry named, and the single matching sentence in it is about sponsored posts. Nothing readable restricts automated access, rendering or screenshots. | not investigated; licence: none stated | **capture** |
| atlasobscura.com | unknown / unknown | none found | Nothing could be read: robots.txt returned HTTP 403 and all three terms attempts returned HTTP 403 to this gate's user agent — /terms, /terms-of-use, and /terms again after following the index page's own "Terms and Conditions" link. The index page itself returned HTTP 200, so the host is reachable, but neither the crawl rules nor the terms could be established. | not investigated; licence: none stated | **capture** |
| awwwards.com | allowed / allowed | https://www.awwwards.com/terms/ | The terms reserve all rights in the site's material and prohibit unauthorized use or reproduction outright, and separately bar commercial use of the content without express authorization. A saved screenshot is a reproduction of that material and no authorization exists, so the terms forbid what this phase requires and the clause is not read around. | not investigated; licence: none stated | **link-only** |
| openhumans.org | allowed / allowed | https://www.openhumans.org/terms/ | Open Humans' terms govern accounts, member data and the licence a member grants for their own uploaded content; nothing in the saved text restricts automated access, crawling, rendering or screenshots, so rendering the two public pages and keeping screenshots for private study is not forbidden. | not investigated (https://www.openhumans.org/api-docs/); licence: none stated site-wide; the terms say only that for some content "alternative licenses or public domain dedications may allow more permissive use" (per item, not site-wide) | **capture** |
| biohackrxiv (osf.io) | allowed / allowed | https://github.com/CenterForOpenScience/cos.io/blob/master/TERMS_OF_USE.md | The Center for Open Science terms of use grant every user a licence to use content marked "public" — by "use" they mean sublicense, reproduce, store, transmit, distribute and publicly display it, for non-commercial and commercial uses — and place no restriction on automated access, crawling, rendering or screenshots. | yes (https://api.osf.io/v2/); licence: CC-By Attribution 4.0 International (the licence the OSF API states for the selected preprint); the OSF software itself is Apache 2.0; other content carries whatever licence its depositor identified | **capture** |
| wiki.biohack.me | allowed / allowed | https://wiki.biohack.me/doku.php?id=start | There is no terms-of-service document: both registry candidates are MediaWiki URLs that now redirect to a DokuWiki start page titled "start [HumanAug Wiki]" — the old wiki has been replaced — and the index exposes no anchor matching terms, conditions or legal. | no (https://wiki.biohack.me/api.php?action=query&meta=siteinfo&siprop=general%7Crightsinfo&format=json); licence: CC Attribution-Noncommercial-Share Alike 4.0 International (stated in the wiki footer) | **capture** |
| longevity wiki (url to verify) | allowed / allowed | none found | The wiki publishes no terms-of-service document — the registry lists no candidate and the verified index page exposes no anchor matching terms, conditions or legal — and robots.txt (HTTP 200) has no rule matching the verified path for a generic user agent, so nothing forbids rendering public pages and keeping screenshots for private study. | yes (https://en.longevitywiki.org/api.php); licence: Creative Commons Attribution-ShareAlike, https://creativecommons.org/licenses/by-sa/4.0/ (MediaWiki rightsinfo) | **capture** |
| forum.quantifiedself.com | allowed / allowed | https://forum.quantifiedself.com/tos | The forum's terms of service contain no clause on automated access, crawling, robots, spiders or screenshots; the restrictions concern accounts, what a member posts, and copyright complaints. Rendering the index and the /latest listing in a browser and keeping screenshots for private information-design study is therefore not forbidden, and robots.txt has no rule matching either path. | yes (https://forum.quantifiedself.com/about.json); licence: user contributions: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported; the terms document itself: CC-BY-SA | **capture** |
| longecity.org | allowed / allowed | none found | No terms document was located: both registry candidates return HTTP 404 and the index page (HTTP 200, 261,147 bytes) exposes no anchor whose text matches terms, conditions or legal, so no clause restricting automated access, rendering or screenshots was found — and unlike the two sites blocked here, none was refused to the gate either. | not investigated; licence: none stated | **capture** |
| experiment.com | allowed / allowed | none found | No terms document was located: /terms and /legal/terms both return HTTP 404 and the index page exposes no anchor matching terms, conditions or legal, so there is no clause restricting rendering or screenshots to read. robots.txt is explicit for both the index and the selected project page. | not investigated; licence: none stated | **capture** |
| zenodo.org | allowed / allowed | https://about.zenodo.org/terms/ | Zenodo's terms are short and permissive about reading: use of Zenodo denotes agreement with them, users must respect the licence conditions that apply to each item, and downloading transfers no intellectual property rights. | yes (https://zenodo.org/api/records); licence: per record; the selected record states cc-by-4.0. Zenodo's terms state only that "Users of content (“Users”) shall respect applicable license conditions." | **capture** |
| sphere.diybio.org | allowed / allowed | https://sphere.diybio.org/about/terms-of-use/ | The DIYbiosphere terms of use, reached by following the index page's own "Terms of Use" link, dedicate the rendered site to the public domain and place the repository files under the MIT License, with logos excepted. | not investigated; licence: rendered pages at sphere.diybio.org: CC0 public domain dedication; repository files at DIYbiosphere/sphere: MIT License; logos excluded from the CC0 dedication | **capture** |

**What "capture" authorises, and what it does not.** A person-operated real Chrome window renders
the public index page and one public content page, saves screenshots at 1440×900 and 375×812 for
private design study, declines every consent banner, and extracts no content. The screenshots stay
on disk and out of the repository. The mandate's rule that a source with no API and no permissive
licence is linked to and nothing extracted governs content extraction; it is applied to the
community sites' data in Track B, not to a private screenshot, and that interpretation is recorded
here so Felix can overrule it. Two sites publish no terms at all (Smashing, Pudding) and three
more no terms document (Longecity, Experiment, the two wikis); nothing on any of them forbids a
browser rendering their public pages.

**Stopping rules that fired here — reported, not worked around.**

- **wikiwand.com: still unreachable through a real browser profile.** `robots.txt` reads through
  real Chrome (its `User-agent: *` group is `Allow: /` only), but `/terms`, `/en/terms-of-service`
  and the index page each answered HTTP 403 with Cloudflare's "Just a moment..." challenge, which
  did not clear in 30 s of an untouched, headful Google Chrome 152 window on a fresh persistent
  profile with only the automation flag removed. The challenge was never clicked. The terms remain
  unread, no capture is authorised, and no substitute is proposed: the dossier contents-rail surface
  stays unassigned for Felix. What would work is a human visit: if Felix opens the Metformin article
  in his own browser and saves the two screenshots by hand into
  `data/design-study/captures/wikiwand_com/`, the viewing step can run on them.
- **quantamagazine.org, theverge.com, awwwards.com: the terms forbid what the phase requires.**
  Quanta: "You must not reproduce, distribute, modify, create derivative works of, publicly
  display, publicly perform, republish, download, store, or transmit any of the material on our
  Site" and "You must not conduct any systematic or automated data collection activities". Vox
  Media (The Verge): no "robot," "spider," "rover," "scraper" or any other data-mining technology
  or automatic or manual process to monitor, cache, frame, mask, extract data from, copy or
  distribute any data. Awwwards: "All rights are reserved and any unauthorized use or reproduction
  is strictly prohibited." Each is linked only. The Phase 1 computed-style measurements of the three,
  made before this gate existed, stand as recorded and are not extended. **Awwwards is the Phase 2
  governing reference for the browse/filter surface and Quanta for the reference/definitions page**,
  so neither surface can receive visual findings from its own reference; see the revised Phase 2
  table.
- **atlasobscura.com is a judgement call, flagged.** Its servers refused the gate's user agent for
  both `robots.txt` and the terms (HTTP 403, Cloudflare "Attention Required"), so both were read
  through the real browser, which was answered on first load with no challenge. `robots.txt`
  allows `/` and `/articles/…` for `User-agent: *` (it disallows `/ads/`, `/admin*`, `/search*`,
  `/browse_content*`, `/nav/*` and a few campaign paths). The terms limit use to "personal,
  noncommercial use", forbid copying "any part of the Service in any medium without ... prior
  written authorization", and then expressly contemplate "if you download or print a copy of the
  Content for personal use". There is no anti-automation clause. Two private screenshots for a
  design study are treated as that personal-use copy; they are never published. If Felix reads the
  copying clause more strictly, `data/design-study/captures/atlasobscura_com` is deleted and the
  decision becomes link-only.

**The gate's own breach, recorded.** Its after-the-fact audit found that its API probes were on
paths those hosts' robots files disallow: `api.osf.io/robots.txt` is `User-agent: * / Disallow: /`
(three requests) and `zenodo.org/robots.txt` has `Disallow: /api` (three requests). Both are the
public REST APIs the mandate names for Track B4's linkage design, and both publish developer
documentation inviting programmatic use, but the robots files say what they say. No further request
goes to either API in this track; how B4 reconciles the documented API terms with the robots files is
recorded there as a question for Felix before any linkage is built.

**Verified while gating.** Longevity Wiki's canonical host is `https://en.longevitywiki.org/`
(HTTP 200, title "Longevity Wiki", MediaWiki API, CC BY-SA 4.0). `wiki.biohack.me` is no longer a
MediaWiki: both old candidates redirect to a DokuWiki start page titled "HumanAug Wiki" (CC BY-NC-SA
4.0). Content pages chosen for the community sites: one BioHackrXiv preprint through the OSF API
(`osf.io/preprints/biohackrxiv/5psfj_v2`, CC-BY 4.0), one Zenodo record matching "longevity"
(`zenodo.org/records/22273492`, CC-BY 4.0), one Experiment.com project from the public listing, the
DIYbiosphere index (CC0), `wiki.biohack.me/doku.php?id=biology`, and for the two forums only the
index and one listing page.

## Phase 3 — visual findings and the revised Phase 2 table (delivery 1, 2026-09-04)

What was done: the legal gate above; real-Chrome captures of the 15 permitted sites and our own
baseline at 1440×900 and 375×812 (full page, tiles, three scroll depths on the content page, DOM
evidence for inferred behaviours); one viewer per site writing findings tied to capture files; one
independent verifier per site re-looking at the captures and confirming, qualifying or refuting
every finding (totals per site in each `data/design-study/findings/<site>.json`); one synthesizer
writing the record from the verified files only; one checker resolving all 727 citations, opening
18 images and correcting the draft in place. **The full record is `design-study-phase3.md`**
(the seven A1 judgements site by site with what each means for RNAWiki; the inferred-behaviour
ledger with its DOM keys and the claims dropped for lack of evidence; absence handling across the
references; our own baseline unsoftened; the nine community sites' information design with a
comparison table, the borrow list and the anti-pattern list; the metric notes for A4; the
checker's record). What follows here is the decision layer.

### The visual findings, in brief (each fully cited in `design-study-phase3.md`)

- **Hierarchy.** Four of the six rendered references put the middle of the ladder in space and
  weight, not size; Linear's own 375 px group/member size step is the correction to carry to every
  width. Our dossier has one heading rank below the title (56 / 12 / 14 px over a 16 px body) and
  reaches for coloured boxes to invent more.
- **Where the eye lands.** Every site whose first fixation is chrome does it with a saturated band,
  a photograph or a filled account button above or beside the field. Our home page does the
  opposite and is the state to protect, not improve: the search bar owns the saturated accent.
- **Density.** Bought with separation, not tightness: Stripe fits eight groups on one screen with
  hairlines and column changes; Atlas fits 36 targets into 300 px with a heading, a rule and text
  links. Our dossier has about 65 medicine-specific words inside a 490 px card and no list or table
  anywhere on the rendered page.
- **Whitespace.** All six spend space above a heading and withhold it below. Ours is spent outside
  the content and withheld inside it, and card whitespace hides thin data.
- **Long scroll.** Vercel's 240 px contents rail is the only rail in the study seen working at three
  depths, with two visible failure modes (stale marker, truncated labels) and no mobile persistence.
  Stripe's rail is a site tree with pinned per-section asides, not a TOC from `h2` text (the page has
  no `h2`). Smashing, Linear and Pudding persist almost nothing. Our dossier is two screens tall, so
  the rail is a target, not a repair.
- **Imagery.** A reference page needs no pictures (Stripe, Linear); when one is used it carries a
  stated fact with a caption naming exactly what is in the frame (Vercel, Smashing); Pudding puts
  the magnitudes in the graphic and never restates them in text, which is the rule we must hold
  against it. Our mechanism section has no visual form at all.
- **Defers or competes.** Deference is a property of the reading column, competition of the chrome;
  every site that hurt itself let an account control, an assistant offer or a paid placement into
  the reading position. Our visual climax is an interface control, and our strongest colour signal
  sits on our weakest prose.

### The community sites, in brief

### What none of the nine does

Stated only from the findings.

1. **None shows an evidence-quality mark of any kind.** No peer-review stamp, review state, tier,
   verification tick, sample count, replication indicator, confidence marker or "self-reported"
   label appears on any of the nine
   [openhumans F19: content-1440-tile-01.png; biohackrxiv F29: content-1440-tile-01.png;
   wiki.biohack.me F17: content-1440-tile-01.png; longevity F25: content-1440-tile-09.png;
   forum F26: content-1440-tile-02.png; longecity F28: index-1440-tile-02.png;
   experiment F30: content-1440-tile-07.png; zenodo F27: content-1440-tile-01.png;
   sphere F34: index-1440-tile-01.png].
2. **None distinguishes contributed material from reviewed or editorial material.** Four have no
   editorial layer at all and say so; the others draw both in one treatment
   [openhumans F20: content-1440-scroll-50.png; wiki.biohack.me F18: index-1440-tile-01.png;
   longevity F29: content-1440-tile-15.png; forum F29: index-1440-tile-01.png;
   longecity F30: index-1440-tile-01.png; experiment F31: content-1440-tile-06.png;
   zenodo A10: content-1440-tile-01.png; sphere F35: index-1440-tile-01.png;
   biohackrxiv F32: content-1440-tile-01.png].
3. **None keeps a contents rail through a long page.** Longevity Wiki has a good 31-entry contents
   box and discards it within about 1,330 px [longevity F17: content-1440-tile-02.png]; Zenodo's
   rail is a metadata stack that dies at about 30 percent of a 46-heading page
   [zenodo F17: content-1440-scroll-50.png]; BioHackrXiv's rail is record-aware but carries
   application sections, never the record's own thirteen headings
   [biohackrxiv F13: content-1440-full.png]; wiki.biohack.me's contents panel is overlaid on the
   reading column and covers the rule under the `h1`
   [wiki.biohack.me F13: content-1440-tile-01.png]; the forum, Experiment, sphere and Longevity Wiki
   persist nothing at depth [forum F14: content-1440-scroll-50.png;
   experiment F15: content-1440-scroll-50.png; sphere F18: content-1440-scroll-50.png;
   longevity F14: content-1440-scroll-90.png]; Open Humans persists only a 54 px navbar
   [openhumans F10: content-1440-scroll-90.png].
4. **None offers a hover preview.** No community capture evidences one, so the Phase 2 stopping rule
   on previews is not resolved by any of them.
5. **None offers a browse surface with a stated result count, a sort control and facets.** Open
   Humans has no count, filter, sort, search or pagination and no readable order
   [openhumans F7: content-1440-full.png]; Zenodo has none between its heading and its "More" button
   [zenodo A8: index-1440-full.png; zenodo-first-pass V2: index-1440-full.png]; LongeCity has no
   column headers, sort controls or facets [longecity F10: index-1440-full.png]; sphere's browse
   grid carries no count, chevron or link colour at all [sphere V3: content-1440-tile-02.png]; and
   sphere never states the size of the corpus it indexes [sphere F13: index-1440-full.png].
6. **None attaches freshness or status to the claim.** Longevity Wiki puts it in the footer 12,895 px
   below a claim it contradicts [longevity F30: content-1440-tile-06.png]; LongeCity styles a
   2017 record exactly like a 2025 one [longecity F27: index-1440-tile-02.png]; sphere's records
   carry no date and no state [sphere F54: index-1440-tile-01.png]; Open Humans has no time
   dimension at all [openhumans F21: content-1440-scroll-50.png]; Experiment gives a scheduled date
   the same mark as a completed one [experiment F26: content-1440-tile-05.png]. Only the forum
   dates every row [forum F31: content-1440-scroll-90.png].
7. **None is dark by default and none offers a mirrored theme.** All nine render light in every
   capture [openhumans F26; biohackrxiv F40; wiki.biohack.me F29; longevity F49;
   forum F32; longecity F17; zenodo F42; sphere F42: index-1440-tile-01.png], and Experiment's
   captures are light throughout [experiment F37: content-1440-tile-01.png]. LongeCity has a footer
   "Change Theme" link whose mechanism was never observed
   [longecity F17: index-1440-tile-04.png].
8. **None keeps its search field on the mobile first screen** except the forum (an icon-only
   magnifier) [forum F32: index-1440-tile-01.png] and sphere (a full-width row, better than its own
   desktop placement) [sphere F8: index-375-tile-01.png]. Longevity Wiki, wiki.biohack.me, Zenodo
   and BioHackrXiv all drop or bury it [longevity F5: index-375-tile-01.png;
   wiki.biohack.me F5: index-375-tile-01.png; zenodo F7: index-375-tile-01.png;
   biohackrxiv F6: index-375-full.png].

### The revised Phase 2 table

| Surface | Governing (Phase 2) | Governing (revised) | Secondary (revised) | Visual verdict | What the captures showed |
| --- | --- | --- | --- | --- | --- |
| **Home** | Apple subtraction; search bar frozen | Unchanged — Apple subtraction; **search bar frozen** | None. Nothing observed may sit above or beside the bar | **frozen** (rnawiki F4, F6, F28, F45) | Our rendered first screen already does the job: three ranks by size, colour and position, and the search bar is the only element drawn with the saturated accent blue while every other bordered object is neutral grey or a much paler blue tint [rnawiki F4: index-1440-tile-01.png; rnawiki F28: index-1440-tile-01.png]. Corroboration of the freeze, not proposals for it — four observed failures of a vanishing mobile search field: Longevity Wiki carries no search input anywhere on its 375 px home page [longevity F5: index-375-tile-01.png]; wiki.biohack.me drops the field from the mobile first screen entirely and takes the topic taxonomy with it [wiki.biohack.me F5: index-375-tile-01.png; wiki.biohack.me V2: content-375-tile-01.png]; Zenodo replaces it with a hamburger so the first mobile screen offers no visible way to search [zenodo A1: index-375-tile-01.png]; and Vercel's article page shows no search entry point at 1440 px and none at 375 px on either page [vercel F42: content-1440-scroll-00.png]. Two of our own defects sit on this surface and are cosmetic: the clipped 375 px placeholder [rnawiki F8: index-375-tile-01.png] and the dangling separator dot [rnawiki F33: index-375-tile-01.png] |
| **Browse / filter** | awwwards.com | awwwards.com — **measured, not seen** (terms forbid capture; the Phase 1 numbers stand and are not extended) | forum.quantifiedself.com, scoped strictly to row composition and absence handling (forum F36, F37, F38) — the only community site whose page *is* a filter surface for uncertain records. Observed components only: Atlas's plain columned link table [atlas B2: index-1440-tile-07.png], Zenodo's badge triplet [zenodo B5: index-1440-tile-02.png], Open Humans's record card [openhumans F29: content-1440-tile-01.png], Stripe's density gradient [stripe F44: index-375-tile-04.png], Linear's label-value rows with a monospaced right-aligned ordinal [linear V2: index-1440-tile-02.png] | **unobservable** for the governing reference; **strengthens** on the secondaries (forum F33, F35, F36, F37, F38; atlas F29, F12; zenodo A8, V1) | Atlas was dropped in Phase 2 on its text-to-HTML number, and looking at it strengthens the drop for three reasons a number could not give: at 375 px the article ends at about 15 percent of a 15,358 px scroll and the exact midpoint holds six video cards and no article text [atlas A6: content-375-scroll-50.png]; the one browse surface it renders is empty, with FEATURED / MOST RECENT pills over about 80 px of blank ground and no message [atlas F29: index-1440-tile-04.png]; and it makes editorial and paid provenance visually identical [atlas F28: index-1440-tile-03.png]. Two of its detail patterns survive under other governance (the labelled stat cell, the link table). The forum supplies what no measured reference does: the complete absence rule, missing field collapses and measured zero prints "0" [forum F35: content-1440-scroll-90.png] |
| **Compound dossier — reading column** | smashingmagazine.com; secondary linear.app/method | smashingmagazine.com (unchanged) | linear.app/method (unchanged) **with one correction**: carry the group/member size step Linear applies only at 375 px to every width [linear V1: content-375-tile-01.png]. Added as corroboration, not as a new governor: Vercel's measured hierarchy-by-space ladder [vercel F37: content-1440-tile-04.png]. Community components: Longevity Wiki's model-organism heading ladder [longevity F36: content-1440-tile-01.png] and limitation-adjacent-to-claim [longevity F37: content-1440-tile-09.png]; Experiment's plain-question headings with links anchored on the claim phrase [experiment F41: content-1440-tile-02.png]; Smashing's own QUICK SUMMARY slot [smashing V2: content-1440-tile-01.png] and metadata plate [smashing V1: content-1440-tile-01.png] | **strengthens** (smashing F2, F13, F16, F18, F23, F32, V1, V2; linear F1, F2, F12, V1; vercel F2, F14) | Smashing's column behaves well under a 15,700 px scroll: rhythm holds for thousands of pixels and the only breaks are commercial inserts we have no equivalent of [smashing F18: content-1440-tile-11.png]. The Phase 2 claim that its prose "never acquires a card or a tint" does not survive — the flow carries a tinted workshops panel with a green button at the full measure, a red pull-quote tile and blue in-prose links — so what is borrowable is the deference *between* those inserts [smashing F23: content-1440-tile-05.png]. Two numbers in the Phase 2 justification need re-measuring before use as tokens: the 11.5–12.6:1 contrast came from a dark article background, and the article rendered black on white with `bodyBackgroundColor` rgb(255,255,255) [smashing F31: content-1440-tile-01.png] |
| **Compound dossier — contents rail and previews** | **unassigned — stopping rule**; stripe.com/docs proposed for the rail only | **Still unassigned — the surface remains unassigned pending Felix.** Wikiwand was never rendered and no substitute is invented for it | Only what was directly observed is named here. Vercel's 240 px right rail was seen working at three real scroll depths, with two indent levels and a left-bar active marker [vercel F40: content-1440-scroll-50.png]. Stripe's rail is not a TOC generated from `h2` text — the page has no `h2` at all — it is a persistent site-wide tree with the current page's sections nested inside it, and what pins during scroll is eight per-section asides, not the rail [stripe F42: content-1440-full.png; stripe V3: content-1440-full.png]. Smashing has none [smashing F16: content-1440-scroll-50.png] | **unobservable** for hover previews (no capture in the whole study evidences one); **strengthens** the case that the surface needs resolving (vercel F18, F19, F20, F21, F23, V1; stripe F22, F42; longevity F17, F42; zenodo F17, A4; biohackrxiv F13, A5; wiki.biohack.me F13, F25) | Vercel's rail persists at 0, 50 and 90 percent and shifts up near the page end, which is ordinary sticky behaviour; the earlier "own scroll container" reading was removed in verification [vercel F18: content-1440-scroll-90.png]. Its two failure modes are visible and therefore designable around: the marker lags two headings behind at 90 percent [vercel F20: content-1440-scroll-90.png] and long labels truncate to an ellipsis at 240 px [vercel F21: content-1440-scroll-50.png]; at 375 px the contents control scrolls away and never returns on a 9,609 px article [vercel F23: content-375-scroll-50.png]. Two distinct active-state marks on one screen — a filled pill for "which page", a left bar for "which section" — is the mechanism that lets two rails coexist [vercel V1: content-1440-scroll-00.png]. The community sites supply four negative constraints for whatever eventually governs: a rail must carry the record's own headings, not the application's [biohackrxiv A5: content-1440-full.png]; it must serve the whole length of the page rather than dying at 30 percent [zenodo A4: content-1440-scroll-50.png]; it must have its own column and never overlay the reading card [wiki.biohack.me F25: content-1440-tile-01.png]; and the document must not scroll past the last content in either column [longecity F47: index-1440-full.png] |
| **Structured data blocks** | stripe.com/docs | stripe.com/docs (unchanged) — **but the stated mechanism is corrected**: the borrow is the hairline row, not the collapsible field-block count | Zenodo for absence-as-record — the tombstone content model [zenodo B1: content-1440-tile-02.png] — plus its typed relations [zenodo B3: content-1440-tile-08.png], file row [zenodo B4: content-1440-scroll-90.png], per-thing copy control [zenodo B7: content-1440-tile-03.png] and licence-in-words [zenodo B8: content-1440-tile-02.png]. forum.quantifiedself.com for the collapse-the-empty-row rule and the printed zero [forum F36: content-1440-tile-02.png]. Atlas's labelled stat cell [atlas B1: index-1440-tile-03.png]. Pudding's Methods & Notes apparatus region [pudding F21: content-1440-tile-37.png]. Experiment's value-with-justification pairing, with the row-binding correction [experiment F40: content-1440-tile-03.png] | **strengthens** (stripe F7, F12, F13, F39, F40, V2; zenodo F39, F40, F41, B1–B8; forum F33, F35; atlas B1) | The real mechanism is the hairline row with a three-step internal hierarchy and a coloured category word, reused identically for two different kinds of content on one page [stripe F39: content-1440-full.png]. The category is a short word with colour only reinforcing, so a CONFIRMED / MIXED / CONTRADICTED / NOT_MEASURED / UNKNOWN distinction survives greyscale [stripe F40: content-1440-full.png]. The refinement verification added: the page is not box-free — the one boxed element is the exact record, in a bordered panel with an all-caps header bar naming precisely what it contains [stripe V2: content-1440-full.png]. Zenodo shows the same site handling absence correctly at field level and badly at panel level on one page, which is the clearest available evidence that "absent data renders nothing" must bind containers and panels, not only fields [zenodo F39, F40: content-1440-tile-08.png] |
| **Citation evolution map** | pudding.cool | pudding.cool (unchanged), with the Phase 2 warning sharpened and one rule held *against* the reference | Vercel's collapsed cross-link map as the default weight — an entire link map costing one closed line below the content and above the pager [vercel F39: content-1440-tile-08.png]. Zenodo's version-specific plus all-versions identifier structure, with the current revision marked by removing its link [zenodo B2: content-1440-tile-01.png; zenodo V2: content-1440-tile-01.png] | **strengthens** the assignment, **overturns** one line of its justification (pudding F19, F20, F23, F24, F25, F30, V1; vercel F33, F39; zenodo B2, V2; experiment F26, F44; sphere F52) | The mechanism was seen working rather than inferred from a stylesheet: a pinned graphic stage with a bordered prose card riding over it [pudding F19: content-1440-scroll-50.png], one colour key taught in the sentence and reused in every mark [pudding F24: content-1440-scroll-90.png], and provenance and caveat under the chart [pudding F25: content-1440-scroll-90.png]. **Overturned:** the Phase 2 rule for this surface says the text carries every meaning and the graphic carries none, and that is *not* what Pudding does — at 50 and 90 percent the magnitudes live only in the graphic [pudding F23: content-1440-scroll-50.png], so we hold the rule against the reference rather than learn it from it. The static evidence is worse than the numbers implied: the graphic stages render blank outside a live scroll [pudding F20: content-1440-tile-02.png], so the same revision history must also be readable as a plain list. Three anti-patterns bind this surface: a scheduled date must not carry a completed event's mark, and spacing must represent elapsed time [experiment F44: content-1440-tile-05.png]; a heading must not be rendered above a graphic that may not appear [sphere F52: content-1440-scroll-50.png]; the caveat must not be the faintest line on the page [pudding V1: content-1440-tile-08.png] |
| **Global search overlay** | vercel.com/docs | vercel.com/docs retained as the only measured candidate, but **the overlay itself was never seen** and the row is downgraded to a target rather than a description | Stripe's `/` chip is the only alternative observed, and what it opens is unresolved: no overlay appears in any capture and the DOM probe returned nothing even on a page whose input is plainly visible [stripe F33: index-1440-full.png] | **weakens** (vercel F5, F6, F42; stripe F33; rnawiki F35) | No capture shows Vercel's palette at all — it is inferred from `kbdTexts` and `searchAffordances`, and a governing reference for a surface should be a surface someone has looked at [vercel F6: content-1440-scroll-00.png]. The visible entry point is not persistent: a bordered field at the top of the index rail, absent from the article's first screen at 1440 and from both pages at 375 [vercel F42: content-1440-scroll-00.png]. What survives with confidence is one detail — the ⌘K chip sitting inside the right end of the field rather than beside it [vercel F5: index-1440-tile-01.png] — which is not a governing reference. The Phase 1 mirrored-ramp contrast measurement (17.9:1) is untouched; only the design claim weakens. Our own header search is a plain always-present input with no `kbdTexts` and no `ariaKeyshortcuts`, so this row describes a target [rnawiki F35: content-1440-scroll-00.png] |
| **Reference / definitions page** | quantamagazine.org | quantamagazine.org — **measured, not seen** (terms forbid capture; the Phase 1 numbers stand and are not extended) | Observed secondaries only: Stripe's demonstration that a whole reference page with `imgCount` 0 loses nothing [stripe F45: content-1440-full.png]; Atlas's mobile footer accordion, five closed chevron rows where desktop shows an open five-column table [atlas B5: index-375-tile-15.png]; sphere's on-page taxonomy definitions including a named residual and an admission the scheme may change [sphere F47: content-1440-tile-02.png] and its complete footer provenance chain [sphere F49: content-1440-tile-03.png]; wiki.biohack.me's rule that licence and shared terms are stated once site-wide and never per page [wiki.biohack.me F24: content-1440-full.png]; Open Humans's single explanatory diagram, placed here and never near the home search bar [openhumans F13: index-1440-tile-01.png] | **unobservable** for the governing reference; **strengthens** on the secondaries (stripe F45; atlas B5; sphere F47, F49, F53; wiki.biohack.me F24; forum F45) | Quanta was never rendered, so nothing visual is added to or subtracted from its assignment. The observed secondaries all concern the same job: state a shared explanation once, in a place every other page can reach. Two anti-patterns bind the surface: the licence and provenance statement must not be the palest text on the page [sphere F53: content-1440-tile-03.png], and a list must never end with no route to the page that holds the shared explanations [forum F45: content-1440-tile-03.png] |

### Changes from Phase 2, one line each

1. **Home:** unchanged and frozen; four observed mobile-search failures are recorded as corroboration of the freeze, never as proposals [longevity F5; wiki.biohack.me F5; zenodo A1; vercel F42].
2. **Browse / filter:** awwwards stays governing but is now marked "measured, not seen"; Atlas's drop is strengthened by three visual reasons the number could not give [atlas A6, F29, F28].
3. **Browse / filter:** forum.quantifiedself.com added as a secondary, scoped strictly to row composition and absence handling and explicitly not to its chrome, emphasis, chips or scroll behaviour [forum F36, F37, F38].
4. **Reading column:** Smashing stays governing; the Phase 2 sentence that its prose "never acquires a card or a tint" is withdrawn [smashing F23].
5. **Reading column:** the Linear secondary is corrected — carry the group/member size step Linear applies only at 375 px to every width, because a dossier is entered at an anchor [linear V1].
6. **Reading column:** the Phase 2 contrast figures of 11.5–12.6:1 must be re-measured; the article rendered black on white, not on the dark gradient Phase 1 recorded [smashing F31].
7. **Contents rail:** still unassigned, pending Felix; Wikiwand was never rendered and no substitute is invented [worklog stopping rule; vercel F40; stripe F42].
8. **Contents rail:** Stripe's stated mechanism is corrected — the page has no `h2` at all, so the rail is not "a TOC generated from h2 text"; it is a site tree with the current page's sections nested, and what pins is eight per-section asides [stripe F42, F22, V3].
9. **Contents rail:** Vercel is recorded as the one rail in the study actually seen working at three scroll depths, with its two failure modes named [vercel F18, F20, F21, F23].
10. **Structured data blocks:** Stripe's justification is restated from a field-block count to the hairline row plus the one labelled box for the exact record [stripe F39, V2].
11. **Structured data blocks:** the Zenodo tombstone is added as the content model for a withdrawn, retracted or superseded programme, with the two fixes its own version needs [zenodo B1, F38].
12. **Structured data blocks:** the forum's collapse-the-empty-row rule and its printed zero are added, because a collapsed row is otherwise ambiguous between "not measured" and "measured as none" [forum F36, F35].
13. **Citation evolution map:** Pudding is strengthened, but the Phase 2 rule that the text carries every meaning is *not* what Pudding does and must be held against the reference [pudding F23].
14. **Citation evolution map:** the graphic stages render blank outside a live scroll, so the same history must also be readable as a plain list [pudding F20].
15. **Global search overlay:** Vercel weakens — the palette was never seen and the visible entry point is not persistent; the row becomes a target, not a description [vercel F6, F42].
16. **Reference / definitions:** Quanta stays governing, marked "measured, not seen"; five observed secondaries are added, all concerning stating a shared explanation once [stripe F45; atlas B5; sphere F47, F49; wiki.biohack.me F24].
17. **Dark mode note:** the Phase 2 sentence listing Stripe among five light-only sites is wrong — the reference page shows a theme control and `prefersColorScheme` found, and Phase 1 measured the same URL dark. The decided light default is unaffected [stripe F32].
18. **Our own baseline** contradicts nothing in the table and strengthens four rows; the uncomfortable finding is that our dossier measures 0.0007 text-to-HTML, below the 0.0015 of the site dropped for that number [rnawiki F46: content-1440-scroll-50.png; atlas A6: content-375-scroll-50.png].

### Open decisions for Felix

1. **Wikiwand — human visit, or leave the contents-rail surface unassigned.** The Cloudflare challenge did not clear in 30 s of an untouched, headful Chrome on a fresh profile; the challenge was never clicked, the terms remain unread and no capture is authorised. What would work is a human visit: if you open the Metformin article in your own browser and save the two screenshots by hand into `data/design-study/captures/wikiwand_com/`, the viewing step can run on them. Until then the surface stays unassigned and Vercel is the only rail anyone in this study has watched work [vercel F40: content-1440-scroll-50.png].
2. **Atlas Obscura — the judgement call, flagged.** Its terms limit use to "personal, noncommercial use", forbid copying "any part of the Service in any medium without … prior written authorization", and then expressly contemplate downloading or printing a copy of the Content for personal use; there is no anti-automation clause. Two private screenshots for a design study were treated as that personal-use copy and are never published. If you read the copying clause more strictly, `data/design-study/captures/atlasobscura_com` is deleted and the decision becomes link-only — which would remove the evidence behind atlas F28, F29, B1, B2, B3, B5 and B6 from this synthesis.
3. **Awwwards and Quanta are unobservable and their surfaces cannot be validated visually.** Awwwards governs browse/filter and Quanta governs reference/definitions, and each site's terms forbid what a capture requires — Awwwards reserves all rights and prohibits unauthorized reproduction; Quanta forbids storing or reproducing material and forbids systematic or automated collection. Both rows keep their Phase 1 measurements and are marked "measured, not seen". The decision is whether to accept two surfaces governed by numbers alone, or to reassign them to references that were seen.
4. **The gate's own robots breach, for Track B4.** The legal gate's after-the-fact audit found its API probes were on paths those hosts' robots files disallow: `api.osf.io/robots.txt` is `User-agent: * / Disallow: /` (three requests) and `zenodo.org/robots.txt` has `Disallow: /api` (three requests). Both are the public REST APIs the mandate names for B4's linkage design and both publish developer documentation inviting programmatic use, but the robots files say what they say. No further request went to either API in this track. How B4 reconciles the documented API terms with the robots files is a question for you before any linkage is built.

### Stopping rules that fired in this delivery

- **wikiwand.com** — still unreachable through a real browser profile (recorded in full under the
  legal gate). No substitute proposed; the contents-rail surface stays unassigned.
- **quantamagazine.org, theverge.com, awwwards.com** — their terms forbid what the phase requires;
  linked only. Awwwards governs browse/filter and Quanta the definitions page, so both surfaces are
  "measured, not seen".
- **The gate's own robots breach** on the OSF and Zenodo API paths, recorded for B4.

Nothing after this point runs until Felix decides. A3 (the progressive disclosure spec) and A4 (the
three rendered examples, 320 px and desktop verification, the two uniqueness metrics) wait on the
decisions above. B1 starts only on his go.

## Phase 1 — site log

One line per reference site: what the browser pass measured, or why it could not.

- **wikiwand.com** — blocked. Both the static fetch and the browser pass received a Cloudflare interstitial (`document.title` = "Just a moment...", 1 paragraph, 264 characters of body text); the Metformin article DOM never rendered. No token measured; all fields stay null. Bypassing the bot check was not attempted.
- **stripe.com/docs** (`/api/charges`) — measured. 503px prose column beside a paired code panel inside a 1160px `<main>`; body 14px/22.4px (ratio 1.6), 77 characters per line, `rgb(236,238,241)` on `rgb(20,23,29)` for a 15.44:1 contrast. h1 24px/700 (1.71x body), no h2 at all, h3 16px/600. The document does not scroll — `<main>` owns the scroll (12,459px over a 900px viewport) and the 280px endpoint list scrolls separately; nine sticky code panels at `top:16px`, one per section. No search input at load, only a `<kbd>/</kbd>` whose target was not determined. At 375px the type scale is unchanged (14px/24px) but the `<header>`, `<nav>` and sidebar are absent from the DOM entirely and the code panel stacks to 319px, giving 49 characters per line.
- **vercel.com/docs** — measured, over two pages. The assigned `/docs` URL is a card index (one paragraph over 40 characters, in a `max-h-12` line clamp), so the reading column was measured on `/docs/deployments`: an 824px article between a 288px nav and a 240px sticky TOC (`top:88px`, `calc(100vh - var(--header-height))`, 13 in-page links), body 16px/27.2px at ratio 1.7 giving 112 characters per line — well past the 45-75 range, and set by the three-pane grid rather than a max-width. `rgb(237,237,237)` on black is 17.94:1. h1 56px/600 at `letter-spacing:-3.36px` and line-height equal to font-size; h3 is the same 16px as body and separated by weight alone. Search is a 264px "Search Docs ⌘ K" button, not an input. At 375px body holds at 16px while h1 drops to 48px and h2 to 20px (44 characters per line), and the TOC stops laying out a box (`display:contents`, 0x0) behind a 32px "Open docs menu" control.
- **linear.app/method** — measured, over two pages. The assigned URL is a chapter index (939 characters of body text, h1 at 128px), so prose was measured on `/method/introduction`: a named 688px `prose center size-l` column, 17px/27.2px at ratio 1.6, 86 characters per line, `rgb(208,214,224)` on `rgb(8,9,10)` for 13.64:1. Two typefaces only — Tiempos Headline serif for h1 (72px/72px, `-1.584px` tracking) and Inter Variable for everything else; h2 and h3 are identical in size and weight (24px/590) and separated by margin-top alone (56px vs 24px). One fixed 73px header is the page's only fixed or sticky box: no TOC, no sticky sidebar, no search input and no `<kbd>` anywhere. At 375px body steps down to 15px/24px (47 characters per line), h1 to 48px, h2 holds at 24px, and navigation collapses to an unlabelled 64x64 trigger.
- **quantamagazine.org** — measured, home page plus one dated feature article (the home page holds a single 360px prose block). The article is the only reference in the set that lands inside the 45-75 measure: a 560px column, Merriweather 16px/30px at ratio 1.88, 73 characters per line, near-black `rgb(26,26,26)` on pure white at 17.4:1 — and the only light scheme measured so far. Paragraph margin-bottom equals the line-height exactly (30px), so the baseline rhythm holds down the page. Three typefaces with distinct jobs: Noe Display for the title (40px/700), Merriweather for body and h2, Pangram for labels — h3 is 13px, smaller than body, because it is metadata. Nothing follows the reader: the `<header>` computes to zero height, navigation is a closed full-viewport overlay, and there is no TOC or progress bar. Search is a real 280px input with a visible placeholder, not a dialog. At 375px body does not move at all (16px/30px, 43 characters per line) while the title goes fluid to 24.96px. Cookie banner declined with Reject All; it returned after the viewport switch and was left untouched.
- **theverge.com** — measured, home page plus one news article. The home page has no running text at all: its largest paragraph block is the privacy notice (583 characters), everything else is headlines under 40 characters. The article column is 600px of FK Roman Standard serif at 18px/28.8px, `-0.18px` tracking, 71 characters per line, pure white on `rgb(19,19,19)` at 18.58:1 — the highest contrast in the set. Two faces by role: polySans for headline and interface, serif for body. Large type tracks in (`-1%` on both h1 and body), small type tracks out (`+13%` on the 12px mint eyebrow, which is 0.67x body and sits above the headline). The article renders no `<header>` element; eleven fixed or sticky boxes include three full-viewport `bx-slab` overlays at the maximum 32-bit z-index. Only four custom properties on `:root` — the tokens are compiled into hashed atomic classes and unreadable at runtime. At 375px body does not move (18px, 39 characters per line, below the 45 floor) while the headline halves exactly to 22px. Consent: the banner offers only "Dismiss", which was clicked; no accept or reject control exists, so nothing was consented to.
- **smashingmagazine.com** — measured, home page plus one long article. The measure is set on the paragraph (700px), not the wrapper (1356.8px), so a container-width reading would be double the truth; 82 characters per line at a fluid 20.41px/33.49px in Elena serif. The article background is a `linear-gradient(-45deg, rgb(22,44,53) 70%, rgb(12,37,47))` on `<article>` over a white `<main>` — reading `backgroundColor` alone returns white and a nonsense 1.26:1, so contrast is reported against both stops: 11.53 and 12.62 for `rgb(229,229,229)` body. The inline link `rgb(249,73,98)` measures 4.26:1, just under AA for normal text. Home page is light on white with a red header; the article inverts to near-white on dark with a blue-green header. Zero sticky and zero fixed elements anywhere and no consent banner — the only reference in the set with no persistent chrome at all. Also the lightest: 8 scripts, 4 stylesheets, zero `:root` custom properties, and the highest text-to-HTML ratio measured (0.09). At 375px the fluid fractional scale resolves to a round 18px/27.75px and the ratio tightens from 1.64 to 1.54 (44 characters per line); the header grows to 154.8px rather than collapsing, and search stays a visible 346px field.
- **pudding.cool** — measured, index plus one scrollytelling story. The story is the only reference that declares its measure outright: `max-width: 650px` on the prose container, giving 68 characters per line at Tiempos Text 20px/31px (ratio 1.55). Warm cream `rgb(255,255,241)` background with mid-grey `rgb(87,87,87)` text — 7.17:1, clearing AAA by 0.17, the narrowest margin in the set. One typeface, one colour and weights 400-500 across h1, h2, h3 and body: hierarchy comes only from size and space (h2 `margin-top:80px` against `margin-bottom:20px`). No persistent header or nav over the story; the only sticky boxes are the graphic stages themselves, pinned with CSS `position:sticky` across 31 step elements and 9 SVG nodes (zero `<canvas>`), over 37.31 screens of scroll. The index inverts everything — dark `rgb(25,25,25)`, Atlas Grotesk, Gooper display — sharing no typeface with the story. At 375px the declared measure changes to `max-width:343px` and body to 18px/27.9px (same 1.55 ratio, 40 characters per line) while h1 stays 48px, and a separate `intro-mobile-stage` component replaces the desktop stage rather than reflowing it. Library detection is limited here: both scripts are external bundles and no globals are exposed, so d3, scrollama, gsap and IntersectionObserver are recorded as unknown rather than absent.
- **atlasobscura.com** — measured, index plus one article. As on The Verge, the index's largest paragraph block is the cookie banner, so the reading-column search had to exclude it by selector. The article measure is 648.67px inside a 745.33px section: Freight Pro serif at 19px/28.5px in **weight 300** — the only reference here running prose lighter than regular — coloured a warm brown `rgb(56,44,20)`, 82 characters per line, 13.65:1. No ancestor paints a background: `<body>` and `<html>` are both transparent, so the white is the browser canvas and the contrast figure depends on it. Headings track OUT, not in (+1.8px on the 60px h1, +0.84px on h2), the reverse of the Vercel and Verge convention, and h1/h2 set line-height equal to font-size. On the index the h1 (20px) is smaller than the h2 (24px). All four persistent fixed layers are third-party (OneTrust, Taboola, reCAPTCHA, Nolt) — none is site navigation — against 114 scripts and 2.44 MB of HTML for 4,073 characters of text. At 379x821 (the tab would not hold 375x812) body does not move at all and lands on exactly 45 characters per line, h1 and its tracking scale by the same 0.583 factor, the header doubles to 149px, and the page becomes three times taller. Consent: 'Manage Preferences' was clicked to reach 'Reject All', but the preference centre never opened (0x0, `display:none`), so the decline could not be completed — nothing was accepted.
- **awwwards.com/websites** — measured, and the one reference with no reading column at all: its largest paragraph is a 149-character filter description spread over the full 1336px width (218 characters per line). The type scale is flat — h1 is 14px, one pixel *smaller* than h3 at 15px, and the same size as interface copy at weight 300; there is no display type anywhere and hierarchy is carried entirely by the images. Near-black `rgb(34,34,34)` on an off-white `rgb(248,248,248)` ground at 14.98:1. The grid is explicit: three 432px cards with a `30px 20px` gap inside a 1336px content width (52px gutters), plus a five-column 248px/24px grid and a `305px + 1031px` shell. Search is a 449px inline input, the widest measured. 2,090 characters of text in 609 KB of markup, 63 images and zero `loading="lazy"`, and 162 tooltip/popover markers — the highest hover-affordance count in the set. At 375px nothing in the type scale moves; cards go to one 343px column, the secondary grid to two 164px columns with the gap tightened to 15px, the filter row wraps from 54px to 150px rather than scrolling, and the header becomes *sticky* at mobile having been `relative` at desktop. The cookie popup exposes only a policy link — no accept or reject control existed, so nothing was clicked and nothing accepted.

## Phase 1 — measurements

Source: `data/design-study/comparison.json`, which is built only from the ten per-site JSONs in the
same directory. Every figure below is measured from fetched markup, fetched CSS or Chromium
computed style. A value that could not be measured is null with a stated reason, never estimated;
no measured body size was null, so no static candidate had to be substituted. Desktop viewport
1440x900 (atlasobscura at 379x821 on mobile, because the tab would not hold 375x812).

| Site | Font stack (short) | Body px / line-height | Measure (ch) | h1:body | Base unit | Breakpoints px (load-bearing; secondary) | Column px | Nav | Dark mode | Contrast | Text:HTML | Flag |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| wikiwand.com | null | null | null | null | null | null | null | null | null | null | null | blocked |
| stripe.com/docs | system sans; Source Code Pro (code) | 14 / 22.4 (1.60) | 77 | 1.71 | 4px | 1000; 480, 562, 600, 650, 750, 800, 850, 1024 | 503 | persistent | none (page level) | 15.44 | 0.0072 | measured |
| vercel.com/docs | GeistSans; Geist Mono (code) | 16 / 27.2 (1.70) | 112 | 3.50 | 4px | 601, 961, 1024; 401, 640, 768, 951, 1200, 1280, 1400 | 824 | persistent | class/attribute | 17.94 | 0.0080 | measured |
| linear.app/method | Inter Variable; Tiempos Headline (h1) | 17 / 27.2 (1.60) | 86 | 4.24 | 4px | 640, 768, 1024, 1280; 1536 | 688 | persistent | class/attribute (`data-theme`) | 13.64 | 0.0125 | measured |
| quantamagazine.org | Merriweather; Noe Display (h1); Pangram (labels) | 16 / 30 (1.88) | 73 | 2.50 | 4px (parallel 0.25em rhythm) | 544, 800, 1056; 320, 704, 768, 1040, 1200, 1360 | 560 | on-demand | none | 17.40 | 0.0724 | measured |
| theverge.com | FK Roman Standard; polySans (headings, UI) | 18 / 28.8 (1.60) | 71 | 2.44 | 10px (multiples of 5; 4px track alongside) | 768, 1180; 901, 1024, 1200, 1300 | 600 | persistent | class/attribute | 18.58 | 0.0064 | measured (partial) |
| smashingmagazine.com | Elena; Mija (h1) | 20.41 / 33.49 (1.64) | 82 | 2.40 | null — em-relative, 0.25em ladder | 640, 1024; 480, 768, 800, 1025, 1100 | 700 | persistent (non-sticky) | none | 11.53–12.62 | 0.0850 | measured |
| pudding.cool | Tiempos Text (story) | 20 / 31 (1.55) | 68 | 2.40 | 4px | 960; 400, 600, 720 | 650 (declared) | on-demand | prefers-color-scheme | 7.17 | 0.0200 | measured (partial) |
| atlasobscura.com | Freight Pro 300; Platform Web (headings) | 19 / 28.5 (1.50) | 82 | 3.16 | 4px | 640, 768, 1024, 1280, 1536; 960 | 648.67 | persistent | none | 13.65 | 0.0017 | measured |
| awwwards.com/websites | Inter Tight only | 14 / 21 (1.50) | 218 | 1.00 | 4px | 576, 768, 1024, 1270; 1000, 1280, 1400, 1600 | null (no reading column) | persistent | class/attribute (`body.dark`) | 14.98 | 0.0034 | measured |

Column notes. Measure is paragraph content width divided by measured average glyph width; the
commonly cited comfortable range is 45–75. h1:body is computed h1 font-size over computed body
font-size on the same page. Base unit is the largest unit dividing the majority of margin, padding
and gap declarations, weighted by occurrence. Reading column is the rendered paragraph width, not
its wrapper. Nav is persistent when site navigation is visible without an action. Contrast is WCAG
against the first ancestor that paints a background. Text:HTML is innerText length over outerHTML
length. Flag is `measured` when every column in the row came from markup, CSS or computed style;
`measured (partial)` when a field recorded elsewhere in that site's JSON is unknown; `blocked` when
nothing was measured.

Ranges across the nine measured sites: body 14–20.41px, line-height ratio 1.50–1.88, measure 68–218
characters (68–112 excluding the one page with no prose), h1:body 1.00–4.24, contrast 7.17–18.58,
text:HTML 0.0017–0.0850. Base unit is 4px on seven sites, 10px on one, em-relative on one.

### What each site is doing that the numbers show

**wikiwand.com** — 3 loads (2 article, 1 root) all returned HTTP 403 and a 5.7–6.0 KB interstitial
with 1 paragraph and 58–264 characters of text.
All 12 measurement columns are null, and no static candidate exists because no Wikiwand CSS was
served at all.

**stripe.com/docs** — 14px is the smallest prose size in the set, and 77 characters comes from the
503px column rather than from type size.
1 threshold (1000px) carries 30 of 111 queries while 31 others fire component-locally; at 375px the
header, nav and 280px sidebar leave the DOM and the measure drops to 49.

**vercel.com/docs** — 112 characters per line is 37 past the 75 ceiling, produced by a 288 +
article + 240 three-pane grid with no max-width on the prose.
Body holds at 16px from 1440 to 375, so the whole mobile change is heading scale (h1 56 → 48, h2 →
20) and pane layout, which brings the measure to 44.

**linear.app/method** — 4.24 is the highest h1:body measured (72px over 17px), and 688px is the only
column set by a named size token rather than by a grid.
The page has 1 fixed box total; h2 and h3 are both 24px/590 and are separated by margin-top alone
(56px against 24px).

**quantamagazine.org** — 560px / 73 characters is the only column inside 45–75, at the highest
line-height ratio in the set (1.88) with paragraph margin-bottom equal to line-height (30px = 30px).
Body does not move between 1440 and 375 (16px/30px), so the measure falls to 43; the header computes
to 0px height and navigation is a closed overlay.

**theverge.com** — 600px at 18px gives 71 characters, the second column inside 45–75, at 18.58:1,
the highest contrast measured.
It is the one non-4px spacing system: 20/10/16/40px lead 833 declarations and multiples of 5 cover
57.3%; `:root` exposes 4 custom properties, the rest compiled into hashed classes.

**smashingmagazine.com** — the only fluid scale: 20.4086px/33.4929px at 1440 resolves to
18px/27.75px at 375 and the ratio moves 1.64 → 1.54.
0 sticky and 0 fixed elements on both pages, 8 scripts, 4 stylesheets, 0 `:root` custom properties,
and 0.0850 text:HTML — the highest in the set.

**pudding.cool** — 68 characters comes from a declared `max-width:650px`, the only measure stated on
the container instead of produced by a grid.
7.17:1 clears AAA by 0.17, the narrowest margin measured; 2 sticky boxes carry 31 step elements over
37.31 screens of scroll with no persistent nav.

**atlasobscura.com** — 19px at weight 300 over 648.67px gives 82 characters, and body does not change
at 379px, landing on 45.
4,073 characters of text sit in 2,439,245 characters of HTML (0.0017) with 114 scripts, and all 4
fixed layers are third-party rather than site navigation.

**awwwards.com/websites** — no reading column: the largest paragraph is 149 characters across 1336px
(218 per line), and h1:body is 1.00 (h1 14px, h3 15px).
The layout is stated in the grid instead — 1336px content, 3 x 432px cards, 30/20px gap, 305 + 1031px
shell — over 2,090 characters of text, 63 images and 0 `loading="lazy"`.


## Phase 2 — one governing reference per surface (2026-09-03)

The ten sites contradict each other on the numbers, not just in taste: body sizes run 14 to 20.4 px,
measures 68 to 112 characters, leading 1.50 to 1.88, and one site (theverge.com) is built on a
10 px base where the other eight measured sites share a 4 px base. Blending them produces no point
of view. Each surface below gets one governing reference and at most one secondary influence, and
every justification is a Phase 1 measurement. The starting hypothesis is validated where the
numbers support it and overturned where they do not.

| Surface | Governing | Secondary | Hypothesis | Measured justification |
| --- | --- | --- | --- | --- |
| Home | Apple subtraction; **search bar frozen** | — | validated (by constraint, not measurement) | No reference site was measured for this surface and none is needed: the constraint is that nothing competes with the search bar. Quanta's numbers (on-demand nav, 560 px column) are the closest measured expression of subtraction if anything around the bar is touched. |
| Browse / filter | awwwards.com | — | **half overturned**: Atlas Obscura dropped | Awwwards is the only site measured with no reading column at all — a filter description spread across a 1,336 px grid, Inter Tight only, 14/21 px, 4 px base, breakpoints 576/768/1024/1270, dark via `body.dark`. That is a filter surface, and it is what the numbers describe. Atlas Obscura's claim to "clean encyclopedia density" is contradicted by the one number that matters for our target: **0.17 % visible text to delivered HTML, the worst of the ten** (the current RNAWiki corpus sits at 8.3 %). It cannot govern a surface held to that target. |
| Compound dossier — reading column | smashingmagazine.com | linear.app/method | **overturned on Wikiwand; Smashing promoted** | Wikiwand was never served (blocked). Smashing is the strongest measured long-form column of the ten: 700 px paragraph box, 82 characters per line, 20.4/33.5 px (1.64), body fluid from 18 to 26 px, contrast 11.5–12.6:1, and **8.5 % text-to-HTML, the best of the ten**. Linear as secondary for the revealed technical layers: hierarchy carried by space (56 px above a heading, 6–12 px below) and a four-step grey ladder (18.7 / 13.6 / 6.1 / 3.5:1) rather than by size — so an expert block can sit under a plain sentence without shouting. Linear's 736 px column and 17/27.2 px corroborate the measure. |
| Compound dossier — contents rail and previews | **unassigned — stopping rule** | proposed: stripe.com/docs (rail only) | **cannot be validated** | The sticky contents rail and hover previews are the whole reason Wikiwand was on the list, and neither was observed. The measured substitute for the rail is Stripe's: a TOC generated from `h2` text, persistent, with one real hinge at 1,000 px where the rail appears. Hover previews have no measured reference among the ten and are dropped from the design unless Felix supplies a site that can be fetched. **This is the item waiting on a decision.** |
| Structured data blocks | stripe.com/docs | — | validated | 61 collapsible field blocks, per-block copy button, 4 px base declared (`--sail-spacing` 0…80), fixed-px type with prose 16/26 and chrome 14/20 — that region split is the measured "reference made app-like" mechanism. The API reference page measured 14/22.4 at 77 characters; a data block should use the chrome scale, the dossier prose should not. |
| Citation evolution map | pudding.cool | — | validated, with a warning | 650 px story column at 68 characters, 20/31 px Tiempos Text, `prefers-color-scheme` dark, one hinge at 960 px. The scroll-driven behaviour is **inferred** (external bundles expose no globals, so d3/scrollama attribution is unknown) — which is fine, because the rule for this surface is that the text carries every meaning and the graphic carries none. Warning: Pudding measures **7.17:1 body contrast, the lowest of the ten**; the pattern is borrowed, the contrast is not. |
| Global search overlay | vercel.com/docs | — | validated, and subordinate to the home bar | A command palette behind `aria-label="Search Docs"` with a `⌘ K` hint, a 64 px sticky header that gains a surface on scroll, a mirrored grey ramp giving **17.9:1 in both light and dark**, dark applied by class from local storage. Stripe's `/` key search is the only alternative measured and has no palette. |
| Reference / definitions page | quantamagazine.org | — | validated strongly | The narrowest reading column of the ten (560 px, 73 characters) with the loosest leading (16/30 px, 1.88) and on-demand navigation, three colour tokens, 17.4:1, 7.2 % text-to-HTML. The numbers say Quanta's whitespace is the measure and the leading, not padding — which is exactly what a page of definitions needs. |

**Not assigned.** theverge.com is the only measured site on a 10 px base; every surface above sits on
4 px, so it cannot be blended in without breaking the spacing scale, and its purpose (a modular grid
for high-volume aggregation) has no counterpart in a 619-compound corpus. atlasobscura.com is
dropped for the reason given. This is the concrete instance of the "two references incompatible"
rule — resolved by not assigning, so the rule does not stop the work.

### The shared tokens the assignments imply

Every governing reference above shares three measured facts, so they become RNAWiki's tokens rather
than any one site's look: a **4 px spacing base** (Stripe, Vercel, Linear, Quanta, Pudding,
Atlas, Awwwards all measure 4; Smashing is em-relative on a 0.25 em ladder); a **reading column
between 560 and 736 px, 68–86 characters per line** (Quanta 560/73, Pudding 650/68, Linear
688–736/86, Smashing 700/82); and **body leading between 1.55 and 1.88** with 1.60–1.70 the
cluster (Stripe, Vercel, Linear, Verge, Smashing). Breakpoints converge on 640/768/1024 with a
single content-hinge near 960–1,056 px on four sites.

### Dark mode — provisional, tested in Phase 4

Measured evidence: five of nine sites are light-only (Stripe, Quanta, Smashing, Atlas — and
Pudding's dark is media-query only). One ships dark by default — Linear, a product-methodology
essay, at 13.64:1 for running prose. Vercel's mirrored ramp is the one model measured that keeps
an identical contrast budget in both themes (17.93 light / 17.94 dark). Provisional
recommendation: **light default, dark available**, built on a mirrored ramp so the health-reference
reader never loses contrast by choosing dark. Phase 4 tests both against the Phase 1 ratios before
this is decided.


## Mandate — Track A resumed at Phase 3, with real visual analysis (received 2026-09-03)

Recorded here in full so a resumed session has the instruction, not a memory of it. Track B (the
longevity data model, corpus 803) is recorded in `docs/worklogs/longevity-model.md`; the shared
constraints below bind both tracks.

### Session resilience — build before any other work

`data/design-study/state.json` (phase, sites done, decisions); `data/design-study/captures/`
(screenshots, one directory per site); `data/longevity/state.json` (phase, cursor, counts);
`data/longevity/raw/` (fetched payloads, one file per batch); this log and
`docs/worklogs/longevity-model.md`, each with a RESUME block at the top. Rewrite `state.json` after
every site and every batch. Every phase idempotent: a completed phase reports "already done" and
changes nothing. Never hold fetched markup or payloads in conversation — write to disk, read back
summaries. "resume design study" or "resume longevity model" in a fresh session must land exactly
where work stopped, with no refetching.

### Shared hard constraints

- **FROZEN.** The home page search bar is the single primary action. Position, prominence and
  behaviour unchanged. Nothing may sit above it or compete with it. Discard any proposal that
  would reduce its prominence.
- **LIGHT DEFAULT.** Light mode is the default. Dark available, using Vercel's mirrored ramp so
  contrast holds in both themes. Decided — do not re-litigate.
- **UNIQUENESS, non-negotiable.** Positional overlap (shared five-word sequences) at or below 0.20,
  lexical at or below 0.40. Semantic overlap is not a target; its out-of-domain floor is 0.737 and
  it cannot move. Repeated elements (nav, rails, footers, filter chrome, disclaimers, definitions)
  are markup, never prose; shared explanatory sentences live on ONE linked page. Absent data
  renders NOTHING — no empty section, no placeholder, no "not recorded" line; fewer data types
  means a structurally shorter page. Section order derives from what each compound's data
  supports, so different data produces visibly different page shapes. Every time page structure is
  touched, report: share of page words appearing on more than 90% of other pages (target near
  zero), and visible text as a share of delivered HTML (currently 8.3%, must improve).
- **EDITORIAL, stricter here than elsewhere.** Longevity is the most hype-saturated area in this
  field and this audience acts on what it reads. Report what was studied; never a protocol,
  recommendation or suggested dose ("The ITP tested 14 ppm in chow from 9 months" is permitted;
  "Take X" is not). Every finding carries its model organism in the same breath; a worm result and
  a human result never appear in the same visual weight. Stated values verbatim; derive nothing a
  source does not state. A stopped trial gets the registry's reason and nothing beyond it. No
  vendor links, no supplement retailers, no affiliate anything; a source that is a company selling
  the compound is labelled as such or excluded.
- **LEGAL AND ETHICAL GATE.** Before fetching any site in either track: check `robots.txt` and
  terms of service and record what each permits in the worklog. Do not scrape forums or any
  source whose terms forbid it. Where a source has no API and no permissive licence, LINK to it
  and extract nothing. Decline consent and cookie banners; never accept.

### Track A — design, resumed at Phase 3

The last pass measured computed styles but never looked at the rendered result. Fix that.

**A1 — capture and SEE.** For each reference site, using a real browser: full-page screenshots at
1440×900 and 375×812, plus captures at three scroll depths on a content-heavy page, saved to
`data/design-study/captures/`. Then VIEW those images and judge what numbers cannot show: visual
hierarchy, where the eye lands first, information density, how whitespace is deployed, how the
page handles a long scroll, what it does with imagery, and whether the design defers to content or
competes with it. Write these as findings, tied to specific captures. wikiwand.com blocked
headless Chrome via Cloudflare last run: retry through a real Chrome profile with a normal
fingerprint before declaring it unreachable; if it renders, measure and view it — it was the
hypothesised dossier reference and no substitute has been observed. atlasobscura.com measured
0.17% text-to-HTML, worst of the ten, against our corpus at 8.3% which needs to rise: judge it
visually anyway, then decide whether it earns a surface despite that, and state the reasoning. Do
not describe a site that could not be rendered. Mark inferred behaviours (⌘K, copy buttons,
scroll-driven) with the DOM or script evidence.

**A2 — the nine community sites.** Also capture and study the nine community sites named in Track
B for their INFORMATION DESIGN — how they present data-heavy, uncertain, community-sourced
material. That is closer to our problem than any of the original ten. Note specifically how each
signals evidence quality and uncertainty visually.

**A3 — progressive disclosure, one page from newcomer to expert.** Specify concretely, in terms a
reader could verify on a rendered page: the base state for a newcomer (evidence tier, whether any
human data exists, the model-organism ladder position, studied dose range, whether trials
stopped); what an expert reveals on demand (per-trial outcome measures with enrolment, kinetics,
interaction pathways, ITP detail, citation graph, registry ids); the interaction that moves
between them — one step, no reload. Plain language in the base state; technical vocabulary only
in revealed layers.

**A4 — present and stop.** The Phase 2 table revised from visual findings, the disclosure spec,
and three rendered example pages from compounds with very different data profiles. Verify at 320
px and desktop: heading order, contrast ratios, keyboard focus. Report the two uniqueness
metrics. THEN STOP for approval. Touch no production styling before that.

### Stopping rules — report the measurement and wait; never substitute a plan

A source's terms forbid what the phase requires. wikiwand still unreachable through a real
browser profile. B2 shows the median compound has 4 or fewer of the 13 data types. B3 finds an
existing site already does the connective layer. B5 leaves positional overlap above 0.30. The ITP
dataset is not machine-readable at usable coverage.

### Delivery order

1. Track A visual findings and the revised Phase 2 table. Stop.
2. B1's per-compound recovery report. Stop.
3. B2's data-type distribution. Stop.

Everything after each stop waits on Felix's decision. Do not run ahead.
