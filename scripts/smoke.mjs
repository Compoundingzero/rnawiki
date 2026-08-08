#!/usr/bin/env node
/**
 * scripts/smoke.mjs — boot smoke test. The gate that would have caught D42.
 *
 * WHAT IT DOES
 *   1. Boots `node server.js` on a spare port, in the read-only run mode (DATABASE_URL deliberately
 *      removed from the child env) so the result is identical on every machine.
 *   2. Drives a real headless Chrome over one route of EVERY template class.
 *   3. Fails the process (exit 1) on ANY of:
 *        · a non-200 main-document response
 *        · an uncaught JS exception (pageerror) or unhandled promise rejection
 *        · a failed same-origin subresource whose {status, path} is not on ALLOWED_REQUEST_FAILURES
 *        · a console error whose text is not on CONSOLE_ALLOWLIST, or that exceeds the number of
 *          allowlisted request failures actually observed on that page (so a NEW silent failure
 *          cannot hide behind the existing ones)
 *        · a page that hydrates to notFound() ("Not found"), loses its <h1>, or ends with != 1 <h1>
 *        · a break in a W0 invariant that held on 564/564: lang="en", the skip link, exactly one
 *          <h1>, zero inline onclick handlers, the role="status" route announcer
 *        · a documented per-route DOM assertion that does not hold
 *
 * WHY THE ALLOWLIST IS A CEILING, NOT A FLOOR
 *   Everything on it is a 503 caused by running with no Postgres. If a machine DOES have a
 *   DATABASE_URL the endpoints answer 200, the allowlisted failures simply do not occur, and the
 *   gate still passes. Nothing here asserts that a 503 must happen.
 *
 * INSTALL (once, and it deliberately touches neither package.json nor package-lock.json, so the
 * Railway build — which runs `npm ci` against that lockfile — cannot be affected by it):
 *      npm i --no-save puppeteer-core
 *
 * RUN:      npm run smoke
 * FULL:     npm run gate          (build && smoke)
 * NOT in prestart — Railway must never need Chrome to boot.
 */
import { spawn } from 'node:child_process';
import net from 'node:net';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SETTLE_MS = Number(process.env.SMOKE_SETTLE_MS || 1200);
const NAV_TIMEOUT = 45000;

// ---------------------------------------------------------------- routes
// W4 · Loop C: a cohort slug carries its own start date, so the LIVE case has to be computed when
// the gate runs. A date typed into this file would pass on the day it was written and then quietly
// start testing the refusal path instead — a gate that changes what it tests as the calendar moves
// is worse than no gate. The stale case is deliberately fixed in 2020: it must ALWAYS be refused.
const COHORT_TODAY = (() => { const d = new Date(), p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; })();
// W5: the OLDEST cohort link cohortParse() still accepts (COHORT_BACK = 6), which lands the reader
// on day 7 of 7 at arrival — one tap from a downloadable card. Computed for the same reason as the
// line above: a date typed into this file would silently stop testing the accepted case.
const COHORT_BACK6 = (() => { const d = new Date(); d.setDate(d.getDate() - 6); const p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; })();

// One route per template class. `/` first so a total boot failure is reported against the home page.
const ROUTES = [
  ['home', '/'],
  ['compound', '/c/creatine-monohydrate'],
  // W5b: the same template with a fragment Google publishes for it. Measured before the fix,
  // hydrated at 390x844: /c/creatine-monohydrate#how-it-works left window.scrollY at 0 with
  // document.getElementById('how-it-works') === null, and 7,339 of 8,080 published fragments across
  // 620 routes did the same. Its own route because the assertion below reads window.scrollY, which
  // any other assertion that taps something would invalidate.
  ['compound-deeplink', '/c/beta-alanine#bottom-line'],
  // W5c: the widest h1 on the compound surface — "Statins (Atorvastatin/Rosuvastatin)" measured
  // 398px in a 390px viewport and took the document to 417px. /c/creatine-monohydrate fits and
  // cannot detect it.
  ['compound-longname', '/c/statins-atorvastatin-rosuvastatin'],
  // W6 (2026-08-08): the three compound routes above were all CLEAN under the new per-chapter
  // overflow check, so adding that check without adding these two would have been a gate over a
  // set that already passes — the failure mode this project has shipped before. These are the two
  // worst cases of the 33 that overflowed, one from each of the two affected chapters, measured at
  // 390x844 with the chapter activated (qa/x_overflow.mjs):
  //   /c/cerebrolysin-ara-290-brief  106px  chapter 3 "🛡️ Using it safely — what to know"  (25 routes)
  //   /c/iodine-selenium              58px  chapter 3 "🎯 Dial it in — the biohacker layer" (8 routes)
  // Both are 0px now. PROVE IT by deleting `min-width:0` from .bio-card in site/styles.css.
  ['compound-safety-cards', '/c/cerebrolysin-ara-290-brief'],
  ['compound-biohacker-cards', '/c/iodine-selenium'],
  ['protocol', '/protocol/knee-pain/patellofemoral-pain'],
  // W4: the OTHER branch of the $0 split. 8 of 52 root causes have no free first step and say so
  // instead of inventing one; on those, Phase 2 must render OPEN, because hiding the only thing
  // the page has behind a step the reader cannot take would be worse than the defect.
  ['protocol-nophase1', '/protocol/hair-loss/dht-sensitivity'],
  // Same template class again, and the route where resolveCompound() linked the wrong molecule:
  // its "oral butyrate" plan item pointed at HMB (β-Hydroxy β-Methylbutyrate). See the
  // planItemLinksNameTheirOwnRef assertion — the invariant it checks holds on all 52 protocol
  // routes (365 linked items measured hydrated), but only this one carries the item that broke it.
  ['protocol-linkref', '/protocol/gut-health/dysbiosis'],
  // Same template class, but a route whose correct open cause is NOT the first one. The route
  // above is one of the 32 whose correct index IS 0, so it cannot detect D3 or its regression.
  ['protocol-rc', '/protocol/knee-pain/patellar-tendinopathy'],
  // W5: the third branch of the same join — a root cause data/cause_map.json deliberately does NOT
  // map, where the accordion opens a DEFAULT. Neither route above can detect it: one is mapped to
  // index 0, the other to index 2. This one's URL says "Sluggish thyroid / nutrient deficits" and
  // the page opens "Hashimoto's autoimmune thyroiditis".
  ['protocol-unmapped', '/protocol/thyroid/subclinical-hypothyroid'],
  // W4 · Loop C, all three branches: a live cohort, a cohort whose week is already over, and a
  // cohort asked for on a protocol with no $0 first step.
  ['protocol-cohort', `/protocol/insomnia/circadian-misalign?cohort=${COHORT_TODAY}-smoke`],
  ['protocol-cohort-stale', '/protocol/insomnia/circadian-misalign?cohort=2020-01-01-old'],
  ['protocol-cohort-rx', `/protocol/hair-loss/dht-sensitivity?cohort=${COHORT_TODAY}-smoke`],
  // W5: the fourth branch, and the only one of the four that needed no devtools, no file and no
  // forged DOM. COHORT_BACK = 6 accepts a link dated six days back, which arrives on "Day 7 of 7" —
  // one tap from a downloadable, X-shareable "7-day self-observation log". Deliberately a protocol
  // no other assertion touches: this one taps Start, and it clears its own storage at both ends.
  ['protocol-cohort-day7', `/protocol/cravings/glycemic-swings?cohort=${COHORT_BACK6}-smoke`],
  // W4.5: the consent gate. Its own route, and the bare form of the URL, because
  // syncSendsExactlyWhatTheConsentCopySays DRIVES THE UI — it taps Start, taps a day and taps the
  // sync toggle — exactly like phase1LoggerIsOneTapAndLeaksNothing on /protocol/knee-pain/
  // patellar-tendinopathy, and two UI-driving assertions must never share a page. The two cohort
  // variants of this same path above are untouched: their assertions read a rendered date and
  // would be invalidated by a tap on Start.
  ['protocol-consent', '/protocol/insomnia/circadian-misalign'],
  ['problem', '/problem/knee-pain'],                       // KEEP_PRERENDERED
  ['target', '/target/AR'],
  // W5c: the longest target name in the corpus, and one of exactly three routes of 568 that
  // pushed the document wider than a 390px viewport (403px). /target/AR cannot detect it — its
  // h1 is "androgen receptor" and fits. Its own route for the same reason the deep-link case has
  // one: the defect is a property of this page's content, not of the template.
  ['target-longname', '/target/MTHFR'],
  ['compare-index', '/compare'],                           // KEEP_PRERENDERED + mounted picker
  ['compare-pair', '/compare/caffeine-vs-creatine-monohydrate'],
  // W5d: the pair that actually HAS a missing value. /compare/caffeine-vs-creatine-monohydrate
  // has a bottom line on both sides, so it cannot detect D40 — a gate over an empty set always
  // passes. Iron is one of only two consumer-renderable compounds with an empty `bottom`.
  ['compare-pair-gap', '/compare/caffeine-vs-iron'],
  ['muscle', '/muscle/abdominals'],
  ['pathway', '/pathway/0'],
  ['pathways', '/pathways'],
  ['goal', '/goal/muscle'],
  ['learn-index', '/learn'],
  ['learn-module', '/learn/0'],
  ['energy', '/energy/atp-pcr'],
  ['physiology', '/physiology/insulin-blood-sugar'],
  ['fuel', '/fuel/knee-pain/patellofemoral-pain'],
  ['body', '/body'],
  ['body-region', '/body/leg'],
  ['about', '/about'],
  ['anatomy', '/anatomy'],
  ['az', '/az'],
  ['browse', '/browse'],
  ['corrections', '/corrections'],                         // KEEP_PRERENDERED
  ['legend', '/legend'],
  // "/" and "/?state=ok" are two DIFFERENT documents — the second is the first with data-state
  // stamped on <html> and two literal substitutions made — and only this one exercises the
  // substitutions, the CSS that reveals the answer panel, and the removal link. The token matches
  // /^[A-Za-z0-9_-]{16,48}$/, which is what server.js requires before it will render the state at
  // all. /interest was merged into "/" on 2026-08-08; its 301 is checked below, OUTSIDE the
  // per-route runner, because page.goto() follows a redirect and would report the home page's 200.
  ['home-ok', '/?state=ok&t=smoke-token-0000000000'],
  ['methodology', '/methodology'],                         // KEEP_PRERENDERED
  ['plan', '/plan'],
  ['progress', '/progress'],
  ['solve', '/solve'],
  // Same template class, with a query. /solve?q= used to render byte-identically to /solve
  // (#app.innerHTML 11,797 chars on every query), so the unqueried route above cannot detect D11.
  ['solve-q', '/solve?q=knee%20pain'],
  ['stack', '/stack'],
  // W4.5: the two halves of the duplicate-substance fix, as two routes because each is a different
  // claim. assertDuplicateSubstances() in build/parse.js gates the DATA and its own copy of the
  // predicate; site/app.js stackInteractions() carries the second copy, and only a real browser on
  // a real stack can prove that one. The second route is the positive control — a fix that stopped
  // the rule firing at all would pass the first assertion and fail this one.
  ['stack-same-substance', '/stack?ids=c1,c24'],
  ['stack-two-substances', '/stack?ids=c1,c25'],
  ['where', '/where'],
];

// ------------------------------------------------- documented failure allowlist
// Every entry is "this request is expected to fail when the site runs with no database".
// Adding one is a deliberate act: write down WHY, and what the user sees instead.
const ALLOWED_REQUEST_FAILURES = [
  { status: 503, path: /^\/api\/me$/, why: 'no DB: signed-out; header renders the Sign in button' },
  { status: 503, path: /^\/api\/rootcause-overlay$/, why: 'no DB: community cause overlay unavailable; the protocol page STATES the absence (see the rcOverlayNotice assertion)' },
  { status: 503, path: /^\/api\/edits\/[^/]+$/, why: 'no DB: compound page shows the base text, no community edit layer' },
  { status: 503, path: /^\/api\/explain$/, why: 'no DB: community "explain it" thread unavailable' },
  // W4.5: first seen when /stack?ids=… entered ROUTES. setStack() (app.js:260) pings this once per
  // session the first time a stack is non-empty, so the bare /stack route never triggered it. The
  // call is `.catch(() => null)` and its only consumer is the aggregate `helped` figure in
  // GET /api/stats — nothing on the page reads the response, so the reader sees no difference.
  { status: 503, path: /^\/api\/helped$/, why: 'no DB: the anonymous "a stack was built" ping cannot be recorded; it is fire-and-forget and nothing on the page depends on it' },
  { status: 503, path: /^\/api\/comments$/, why: 'no DB: page discussion unavailable' },
  { status: 503, path: /^\/api\/ledger$/, why: 'no DB: protocol adoption ledger unavailable' },
  { status: 503, path: /^\/api\/outcomes\/public$/, why: 'no DB: aggregate outcome stat stays dark (a gated feature anyway)' },
  { status: 503, path: /^\/api\/votes$/, why: 'no DB: vote counts unavailable' },
  { status: 503, path: /^\/api\/experiments\/mine$/, why: 'no DB: personal streak unavailable' },
  { status: 503, path: /^\/api\/protocol-requests$/, why: 'no DB: /solve request board unavailable' },
  { status: 503, path: /^\/api\/forks$/, why: 'no DB: protocol variations unavailable' },
  { status: 503, path: /^\/api\/forks\/popular$/, why: 'no DB: /stack popular variations unavailable' },
  { status: 503, path: /^\/api\/foods$/, why: 'no DB: /fuel user-submitted foods unavailable' },
  { status: 503, path: /^\/api\/partners$/, why: 'no DB: local partners unavailable' },
  { status: 503, path: /^\/api\/pulse$/, why: 'no DB: site activity pulse unavailable' },
  { status: 503, path: /^\/api\/contributors$/, why: 'no DB: contributor leaderboard unavailable' },
  { status: 503, path: /^\/api\/rootcause-changes$/, why: 'no DB: proposed cause changes unavailable' },
];

// Console errors that are allowed AT ALL. The 503 line is additionally budget-capped below: Chrome
// logs exactly one of these per failed request, so more of them than allowlisted failed requests
// means something new started failing.
const CONSOLE_ALLOWLIST = [
  {
    re: /^Failed to load resource: the server responded with a status of 503 \(Service Unavailable\)$/,
    budgeted: true,
    why: 'Chrome logs one line per failed subresource; each must map to an ALLOWED_REQUEST_FAILURES entry',
  },
];

// ----------------------------------------------- per-route DOM assertions
// Keep these few and load-bearing. Each names the defect it locks down.
const ASSERTIONS = {
  // W4.5 (2026-08-02): A ROW MAY NOT ASSERT AN INTERACTION BETWEEN A MOLECULE AND ITSELF.
  // MEASURED HYDRATED, real browser at 390x844, 0 pageerrors, before this gate existed:
  //   /stack?ids=c1,c24    "☠️ Stacked stimulants — cardiovascular strain · Caffeine + Caffeine
  //                         (thermogenic) · Each drives the same fight-or-flight system. Stacked,
  //                         heart rate and blood pressure compound."
  //   /stack?ids=c132,c133 "☠️ Additive low-blood-sugar risk · Insulin (prescribed) + Insulin
  //                         (anabolic misuse) · Two or more glucose-lowering agents together…"
  //   /c/caffeine-thermogenic rendered the same fabricated danger flag inline in its own
  //                         "🧬 Acts on the same pathway" list, from build-time data.pairFlags.
  // Two pages exist for these molecules because they are written for two different readers; the
  // checker counted the second page as a second drug. The fix makes every `need` count a count of
  // DISTINCT SUBSTANCES (site/interactions.js `duplicates` + stackInteractions()).
  // WHY THIS IS A SMOKE ASSERTION AND NOT ONLY A BUILD GATE: there are two copies of the predicate,
  // one in build/parse.js and one in site/app.js. The build gate can only prove its own. Deleting
  // the runtime half would ship the fabricated row with a green build.
  // PROVE IT by deleting the `caffeine` group from site/interactions.js `duplicates`, or by
  // changing `distinctCarriers` back to a length check in site/app.js.
  // ---- W5b (2026-08-02): A PUBLISHED DEEP LINK MUST LAND ---------------------------------------
  // MEASURED HYDRATED at 390x844 over all 620 served routes, 0 pageerrors
  // (qa/out/w5b_anchors_before.json): 7,339 of 8,080 in-page anchor targets emitted by
  // build/prerender.js — the ones Google renders as "jump to section" links under a result — did
  // not exist after the SPA rebuilt #app, on 574 of 620 pages. 13,475 anchor elements point at
  // them. On this very route, #bottom-line resolved to null and window.scrollY stayed 0. no other assertion touches, so the main document is a fresh 200 and not a 304 off the
  // compound route above.
  // THREE SEPARATE THINGS had to be true and this asserts all three, because fixing only the first
  // is what the first pass at this did: the id has to EXIST (anchorizeHeadings), the chapter it
  // lives in has to be OPENED (1 of 7 chapters is display:none, so scrollIntoView on a hidden
  // element does nothing — measured: id present, chapter inactive, scrollY 0), and the page has to
  // actually MOVE.
  // PROVE IT by deleting the anchorizeHeadings(app) call from route() in site/app.js, or by
  // deleting the ANCHOR_ALIASES entry for bottom-line, or by reverting revealAnchor() to only
  // clicking the chapter tab (whose onclick is not wired yet when route() runs).
  '/c/beta-alanine#bottom-line': [{
    name: 'aPublishedDeepLinkResolvesOpensItsChapterAndScrolls',
    why: 'W5b: every jump-to-section link Google publishes for this page landed on nothing — the id did not survive hydration',
    evaluate: () => {
      const el = document.getElementById('bottom-line');
      if (!el) return 'the fragment #bottom-line, which build/prerender.js publishes on this page, does not exist after hydration';
      const ch = el.closest('.chapter');
      if (ch && !ch.classList.contains('active')) return 'the target exists but sits in a display:none chapter that was never opened — scrollIntoView on it does nothing and the reader stays at the top';
      if (document.querySelectorAll('.chapter.active').length !== 1) return `${document.querySelectorAll('.chapter.active').length} chapters are active at once — opening the target's chapter must not leave two on screen`;
      if (window.scrollY < 200) return `the page did not move: window.scrollY = ${Math.round(window.scrollY)}`;
      const top = el.getBoundingClientRect().top;
      if (top < -20 || top > 220) return `landed ${Math.round(top)}px from the viewport top — the section is off-screen or under the sticky header`;
      // The alias must not have renamed anything the app queries.
      if (!document.getElementById('sec-bottom')) return 'the SPA section id #sec-bottom is gone — the alias replaced a name instead of adding one';
      return null;
    },
  }],
  // ---- W5b (2026-08-02): D16 — /target's heading layer, contents card and read-time -----------
  // MEASURED on all 103 /target routes: the prerendered document carries 8 <h2 id>, an "On this
  // page · N min read" contents card and 1,398-1,997 words; the hydrated document carried
  // h2 = 0 and h4 = 0 on 103/103, an H1 -> H3 skip on 103/103 (the compound cards are <h3>), no
  // contents card and no read-time. 77 of 103 had exactly two headings for a 1,340-word page.
  // The chapters were always the structure; they were simply never headings.
  // PROVE IT by deleting the `chTitle(ch)` call from the `sections` template in targetPage().
  '/target/AR': [{
    name: 'targetPageHasAHeadingLayerAContentsCardAndAReadTime',
    why: 'W5b/D16: the crawler was given eight addressable sections, a contents card and a read-time on this page, and a reader was given none of them',
    evaluate: () => {
      const app = document.getElementById('app');
      const h2 = [...app.querySelectorAll('h2')];
      if (h2.length < 2) return `${h2.length} <h2> in the hydrated document — the chapters are the section structure and they must be headings, or this page has no outline for a reader, a screen reader or an answer engine`;
      const seq = [...app.querySelectorAll('h1,h2,h3,h4')].map((h) => +h.tagName[1]);
      for (let i = 1; i < seq.length; i++) if (seq[i] - seq[i - 1] > 1) return `heading level jumps from h${seq[i - 1]} to h${seq[i]} — the outline skips a level`;
      const toc = app.querySelector('.pagetoc');
      if (!toc) return 'no contents card, which the prerendered document has on 103/103';
      if (!/\d+\s*min read/i.test(toc.innerText)) return `the contents card gives no read-time: "${toc.innerText.replace(/\s+/g, ' ').slice(0, 80)}"`;
      const links = [...toc.querySelectorAll('a[href^="#"]')];
      if (links.length < 2) return 'the contents card lists fewer than two sections';
      const missing = links.map((a) => decodeURIComponent(a.getAttribute('href').slice(1))).filter((id) => !document.getElementById(id));
      if (missing.length) return `the contents card links to ${missing.length} section(s) that do not exist: ${missing.join(', ')}`;
      return null;
    },
  }, {
    // ---- W5c (2026-08-02): D28 — HALF THE COURSE WAS PAST THE RIGHT EDGE OF THE PHONE --------
    // Measured hydrated at 390x844 on all 103 /target routes (qa/out/w5cdi/before-390.json): the
    // four `.ch-step` right edges were 147 / 303 / 472 / 596 px against a 390px viewport, so steps
    // 3 and 4 were off-screen on 103/103 — and step 3 is "What acts on it", the compound list this
    // page's own <title> promises. Compound pages carry seven steps in the same strip.
    // `overflow-x:auto` scrolls, but a touch device draws no scrollbar.
    // PROVE IT by putting `flex-wrap:nowrap;overflow-x:auto` back on .ch-steps below 640px.
    name: 'everyChapterStepIsOnScreenAndTappable',
    why: 'W5c/D28: steps 3 and 4 of a 4-step course sat past the right edge of a 390px viewport on 103 of 103 target pages, in a scroller with no affordance',
    evaluate: () => {
      const vw = document.documentElement.clientWidth;
      const steps = [...document.querySelectorAll('.ch-step')];
      if (steps.length < 3) return `${steps.length} chapter steps — the course strip has lost its chapters`;
      const off = steps.filter((s) => s.getBoundingClientRect().right > vw + 1);
      if (off.length) return `${off.length} of ${steps.length} chapter steps are off-screen at ${vw}px (worst right edge ${Math.round(Math.max(...off.map((s) => s.getBoundingClientRect().right)))}px) — including "${off[0].innerText.replace(/\s+/g, ' ').trim()}"`;
      const small = steps.filter((s) => s.getBoundingClientRect().height < 44);
      if (small.length) return `${small.length} of ${steps.length} chapter steps are under the 44px touch minimum (${Math.round(small[0].getBoundingClientRect().height)}px)`;
      const strip = document.querySelector('.ch-steps');
      if (strip && strip.scrollWidth > strip.clientWidth + 1) return `the chapter strip still scrolls sideways (${strip.scrollWidth} in ${strip.clientWidth})`;
      return null;
    },
  }],
  // ---- W5b (2026-08-02): D33 — the paragraph Google quotes must be the paragraph on the page ---
  // MEASURED across all 123 published pairs, hydrated at 390x844, 0 pageerrors
  // (qa/out/w5b_verdict_before.json): the verdict was string-equal between the prerendered and the
  // hydrated document on 0/123, and on the HYDRATED page the FAQPage JSON-LD answer — which
  // survives in <head>, since hydration only replaces #app — equalled the visible verdict on
  // 0/123. The prerendered text names the goal and says "comparing them here would be
  // misleading"; the SPA's copy said "for this use" and dropped that clause. The goal label itself
  // disagreed on 4/123 (/compare/caffeine-vs-sodium-bicarbonate: "build muscle & strength"
  // hydrated vs "endurance" prerendered).
  // A build gate can prove the map holds the string this file emitted. Only a browser can prove
  // the SPA then uses it, and that the surviving JSON-LD still matches what is on screen.
  // PROVE IT by replacing the RNAWIKI_VERDICT lookup in renderComparison() with null.
  '/compare/caffeine-vs-creatine-monohydrate': [{
    name: 'theVerdictOnScreenIsTheVerdictInTheStructuredData',
    why: 'W5b/D33: the FAQPage answer an answer engine quotes back was not the paragraph the reader is shown, on 123 of 123 pairs',
    evaluate: () => {
      const N = (s) => String(s || '').replace(/\s+/g, ' ').trim();
      const h2 = [...document.querySelectorAll('#app h2')].find((h) => /Which is better/i.test(h.textContent));
      if (!h2) return 'no "Which is better" heading on a comparison page';
      if (/this goal/i.test(h2.textContent)) return `the heading does not name the goal: "${N(h2.textContent)}" — the prerendered document names it, so the two pages ask different questions`;
      const p = h2.nextElementSibling;
      if (!p || N(p.textContent).length < 80) return 'the verdict paragraph is missing or empty';
      let ld = null;
      [...document.querySelectorAll('script[type="application/ld+json"]')].forEach((s) => {
        try { [].concat(JSON.parse(s.textContent)).forEach((o) => { if (o && o['@type'] === 'FAQPage') { const q = (o.mainEntity || [])[0]; if (q) ld = N(q.acceptedAnswer && q.acceptedAnswer.text); } }); } catch (e) { }
      });
      if (!ld) return 'no FAQPage JSON-LD survives in this document — the rich result it earns has nothing behind it';
      if (N(p.textContent) !== ld) return `the visible verdict and the FAQPage answer differ.\n  ON SCREEN: ${N(p.textContent).slice(0, 150)}…\n  IN SCHEMA: ${ld.slice(0, 150)}…`;
      if (!document.querySelector('#app a[href*="/goal/"]')) return 'the intro no longer links the goal both compounds are used for — the prerendered document carries that link on 123/123 and it is the page\'s only goal link';
      return null;
    },
  }, {
    // ---- W5d (2026-08-02): D18/D19 — THE VERDICT'S PROMISE, IN THE HYDRATED DOCUMENT ---------
    // build/prerender.js assertCompareDimensions() proves the prerendered table carries every
    // dimension the verdict names. This proves the SPA rebuilt the same table — which is exactly
    // where it went wrong before: the SPA emitted 5 rows and the prerenderer 6, so the sentence
    // could be true of one document and false of the other. Measured hydrated on all 123 pairs
    // before the fix (qa/out/w5cdi/before-390.json), OUTSIDE the verdict paragraph: cost 4/123,
    // interactions 0/123, side-effects 0/123, dose 11/123 — four of five named dimensions were
    // nowhere on the page, and the verdict said "below" on 123/123 while the table bottom sat
    // ABOVE the verdict top on 123/123.
    // PROVE IT by deleting a row from the ROWS array in site/app.js renderComparison().
    name: 'theVerdictOnlyNamesRowsThisPageHas',
    why: 'W5d/D18+D19: the verdict named five things to decide on, four of which appeared nowhere on the page, and pointed "below" at a table that is above',
    evaluate: () => {
      const h2 = [...document.querySelectorAll('#app h2')].find((h) => /Which is better/i.test(h.textContent));
      const p = h2 && h2.nextElementSibling;
      if (!p) return 'no verdict paragraph';
      const v = p.textContent.replace(/\s+/g, ' ');
      if (/\bbelow\b/i.test(v)) return `the verdict points the reader "below": "${v.slice(0, 140)}…"`;
      const m = v.match(/compares them on ([^—]+) — read down/);
      if (!m) return `the verdict no longer names the dimensions it asks the reader to decide on: "${v.slice(0, 140)}…"`;
      const dims = m[1].split(/,\s*|\s+and\s+/).map((x) => x.trim().toLowerCase()).filter(Boolean);
      const heads = [...document.querySelectorAll('.cmp-table tbody th')].map((t) => t.textContent.trim().toLowerCase());
      const missing = dims.filter((d) => !heads.includes(d));
      if (missing.length) return `the verdict tells the reader to decide on ${missing.map((x) => `"${x}"`).join(', ')}, and the hydrated table has no such row (it has: ${heads.join(' · ')})`;
      const extra = heads.filter((h) => h && h !== 'human evidence' && !dims.includes(h));
      if (extra.length) return `the hydrated table has ${extra.map((x) => `"${x}"`).join(', ')} that the verdict does not mention`;
      if (dims.length < 4) return `the verdict names only ${dims.length} dimensions — this pair should carry more, and a shrinking list is how this defect comes back`;
      // W5d/D30: and the page must not be a leaf. Measured hydrated on all 123 pairs: every one
      // contained exactly two /compare/ anchors and both were the breadcrumb — 0 links to another
      // pair, on 123 of 123. build/prerender.js assertCompareCluster() proves the prerendered
      // document carries them; this proves the SPA rebuilt them from the same generated map, which
      // is the half that reaches a reader.
      const lat = [...document.querySelectorAll('#app a[href*="/compare/"]')]
        .map((x) => x.getAttribute('href').replace(/^#/, ''))
        .filter((h) => /-vs-/.test(h) && h !== location.pathname);
      if (!lat.length) return 'no links to any other comparison — 123 pages hanging off one hub with no edges between them is what D30 was';
      if (!document.querySelector('#app .cmp-sib')) return 'the lateral links are not in a labelled block, so a reader cannot tell what they are';
      // and the geometry the word "above" asserts
      const tbl = document.querySelector('.cmp-table').getBoundingClientRect();
      const vp = p.getBoundingClientRect();
      if (tbl.bottom > vp.top) return 'the table is no longer above the verdict, so "the table above" has become the wrong word';
      return null;
    },
  }, {
    // ---- W5c (2026-08-02): D6 — HALF OF A TWO-THING COMPARISON WAS OFF-SCREEN --------------
    // This gate runs at 390x844, which is the whole point: the defect is invisible at any desktop
    // width and invisible to every build-time check, because the markup was never wrong. Measured
    // hydrated on all 123 published pairs before the fix (qa/out/w5cdi/before-390.json):
    // `.cmp-wrap` scrollWidth 520 / clientWidth 350 on 123/123, and the compound-B column's right
    // edge had a MEDIAN of 597px against a 390px viewport, on 123/123 — the second compound was
    // entirely off-screen. `overflow-x:auto` scrolls it, but documentElement.scrollWidth stayed
    // 390, so nothing on the page said so.
    // PROVE IT by deleting the `@media(max-width:600px)` .cmp-table block from site/styles.css.
    name: 'bothCompoundsAreOnScreenOnAPhone',
    why: 'W5c/D6: the second compound of a two-compound comparison sat a median of 597px into a 390px viewport, on 123 of 123 pairs, with no affordance',
    evaluate: () => {
      const vw = document.documentElement.clientWidth;
      const cells = [...document.querySelectorAll('.cmp-table tbody td')];
      if (cells.length < 8) return `only ${cells.length} data cells in the comparison table — the table has lost rows`;
      const over = cells.filter((td) => td.getBoundingClientRect().right > vw + 1);
      if (over.length) return `${over.length} of ${cells.length} table cells extend past the ${vw}px viewport (worst right edge ${Math.round(Math.max(...over.map((t) => t.getBoundingClientRect().right)))}px) — the second compound is off-screen again`;
      const wrap = document.querySelector('.cmp-wrap');
      if (wrap && wrap.scrollWidth > wrap.clientWidth + 1) return `.cmp-wrap still scrolls sideways (${wrap.scrollWidth} in ${wrap.clientWidth}) — content is hidden behind an affordance a touch device does not draw`;
      // Stacked cells lose the visual column header, so each one has to name its own compound.
      const who = [...document.querySelectorAll('.cmp-table .cmp-who')];
      const shown = who.filter((e) => getComputedStyle(e).display !== 'none');
      if (shown.length !== cells.length) return `${shown.length} per-cell compound labels for ${cells.length} stacked cells — a stacked value that does not say which compound it belongs to is worse than a hidden one`;
      // ...and the header row must stay in the accessibility tree, or AT loses the association
      // that .cmp-who is aria-hidden precisely because it already had.
      const thead = document.querySelector('.cmp-table thead');
      if (!thead || getComputedStyle(thead).display === 'none') return 'the comparison table header is display:none — clipped is required, not removed, or a screen reader loses the column association for every cell';
      if (document.querySelector('.cmp-table').getAttribute('role') !== 'table') return 'the comparison table has lost role="table" — `display:block` strips a table\'s implicit ARIA roles, so the explicit ones are what keep it a table';
      return null;
    },
  }],
  // ---- W5d (2026-08-02): D40 — A BARE EM-DASH IS NOT AN ANSWER --------------------------------
  // Measured hydrated at 390x844 on all 123 pairs (qa/out/w5cdi/before-390.json): 11 routes
  // rendered a tbody cell whose entire content was "—", always the BOTTOM LINE row, always Iron or
  // Vitamin C. build/prerender.js assertNoBareDashCells() covers all 123 prerendered documents;
  // this covers the hydrated twin, on the pair that has the gap.
  // PROVE IT by putting `${va || '—'}` back in renderComparison()'s row() helper.
  '/compare/caffeine-vs-iron': [{
    name: 'anAbsentValueSaysSoInWords',
    why: 'W5d/D40: a cell containing only an em-dash reads as a fact about the compound, when it is a fact about the corpus',
    evaluate: () => {
      const cells = [...document.querySelectorAll('.cmp-table tbody td')];
      if (!cells.length) return 'no comparison table on this route';
      const bare = cells.filter((td) => /^[—–-]*$/.test(td.innerText.replace(/^[^\n]*\n/, '').trim()));
      if (bare.length) return `${bare.length} of ${cells.length} cells contain only a dash`;
      // ...and this route must keep containing the gap, or the gate stops testing anything.
      const stated = cells.filter((td) => /not written up yet/i.test(td.innerText));
      if (!stated.length) return 'no stated absence anywhere on this pair — Iron has been given a bottom line, so this route no longer exercises the defect; retarget it at another pair with a gap';
      return null;
    },
  }],
  '/stack?ids=c1,c24': [{
    name: 'oneMoleculeOnTwoPagesIsNotAnInteraction',
    why: 'W4.5: a danger row naming a molecule against itself is a fabricated interaction, and it is the row a reader is most likely to act on',
    evaluate: () => {
      const panel = document.querySelector('.ixn-panel');
      if (!panel) return 'no interaction panel on a two-compound stack';
      const rows = [...panel.querySelectorAll('.ixn')].map(d => ({
        cls: d.className,
        head: (d.querySelector('.ixn-h') || {}).innerText || '',
        why: (d.querySelector('.ixn-why') || {}).innerText || '',
      }));
      const bad = rows.find(r => /stacked stimulants/i.test(r.head));
      if (bad) return `"${bad.head.replace(/\s+/g, ' ').trim()}" fired for two pages of caffeine — the checker is counting pages, not substances`;
      const dupe = rows.find(r => /same substance|same mineral/i.test(r.head));
      if (!dupe) return 'the duplication is not named at all — silence is not the fix; a reader holding two pages of one molecule is doing something worth saying';
      if (!/\bdanger\b/.test(dupe.cls)) return `the duplicate row is "${dupe.cls}" — it must inherit the tier of the rule it replaced (stim_stack is danger), or the verdict quietly downgrades`;
      if (!/one molecule|one dose/i.test(dupe.why)) return `the duplicate row's why does not say it is one molecule: "${dupe.why.slice(0, 120)}"`;
      const verdict = [...panel.querySelectorAll('.ixn-verdict')].map(s => s.innerText).join(' ');
      if (!/dangerous combination/.test(verdict)) return `the verdict reads "${verdict}" — replacing the row must not drop it out of the count`;
      return null;
    },
  }],
  // The positive control. A "fix" that simply stopped stim_stack firing would pass the assertion
  // above and fail here — a gate over an empty set always passes.
  '/stack?ids=c1,c25': [{
    name: 'twoRealSubstancesStillFire',
    why: 'W4.5: caffeine + ephedrine is the textbook stimulant stack and must still be flagged after the duplicate-substance fix',
    evaluate: () => {
      const panel = document.querySelector('.ixn-panel');
      if (!panel) return 'no interaction panel on a two-compound stack';
      const heads = [...panel.querySelectorAll('.ixn-h')].map(h => h.innerText.replace(/\s+/g, ' '));
      if (!heads.some(h => /stacked stimulants/i.test(h))) return `caffeine + ephedrine no longer flags a stimulant stack — the duplicate fix suppressed a real interaction. Rows: ${JSON.stringify(heads)}`;
      if (heads.some(h => /same substance|same mineral/i.test(h))) return 'two different molecules were called the same substance';
      return null;
    },
  }],
  // D13 (commit 7c832be): /problem/* is the differential-diagnosis hub — where /solve, every
  // protocol and every breadcrumb send a reader to work out which of their 4-7 causes they have.
  // Measured hydrated at 390x844 on all 41 pages before the fix: the first protocol link sat at 98%
  // of a 29,844 px page on 41/41, there was no escalation block on any of them, 0 of 224 causes had
  // an anchor or a next step, and 0 of 861 plan items were linked. This asserts the ORDER, which is
  // what the defect actually was. Prove it by moving ${causeCascadeFlat(p)} back above
  // ${problemDifferential(p, causes)} in build/prerender.js — firstProtocolPct jumps back to 98.
  // ---- W5c (2026-08-02): THE PHONE MENU DID NOT CONTAIN THE SITE'S TWO INDEX PAGES ------------
  // Measured hydrated at 390x844 on /az (qa/out/w5cdi/before-390.json): clicking ☰ opened a drawer
  // with exactly four links — /solve, /where, /plan, /learn — and neither /az nor /browse. On
  // desktop that costs nothing, because the footer is two screens away. On a phone it is the whole
  // cost: /problem pages have a median height of 29,844px, so "every compound, A–Z" sat 35 phone
  // screens below a reader on exactly the pages most likely to send them looking for it.
  // Its own route, because this assertion DRIVES THE UI (it taps ☰).
  // PROVE IT by deleting the two .nav-more anchors from shell() in build/prerender.js.
  '/browse': [{
    name: 'thePhoneMenuReachesEveryIndexPage',
    why: 'W5c: the ☰ drawer offered 4 links and neither of the site\'s two index pages, on a viewport where the footer is up to 35 screens away',
    evaluate: async () => {
      const btn = document.getElementById('menu-btn');
      if (!btn) return 'no ☰ button in the header';
      if (getComputedStyle(btn).display === 'none') return 'the ☰ button is display:none at this viewport — this gate runs at 390x844 and is no longer testing the phone menu';
      btn.click();
      await new Promise((r) => setTimeout(r, 120));
      const nav = document.querySelector('.topnav');
      if (!nav || !nav.classList.contains('open')) return 'tapping ☰ did not open the drawer';
      const shown = [...nav.querySelectorAll('a')].filter((a) => getComputedStyle(a).display !== 'none');
      const hrefs = shown.map((a) => a.getAttribute('href'));
      const missing = ['/az', '/browse', '/solve', '/where'].filter((h) => !hrefs.some((x) => x === h || x === '#' + h));
      if (missing.length) return `the phone menu is missing ${missing.join(', ')} — it offers ${hrefs.join(', ')}`;
      const small = shown.filter((a) => a.getBoundingClientRect().height < 24);
      if (small.length) return `${small.length} of ${shown.length} drawer links are under the 24px minimum`;
      btn.click();
      return null;
    },
  }],
  // ---- W5c (2026-08-02): THE BODY MAP WAS UNTAPPABLE, UNREACHABLE AND UNNAMED ----------------
  // Measured hydrated at 390x844 (qa/out/w5cdi/before-390.json):
  //   · 21 of 25 hotspots under 24x24 CSS px, smallest (Elbow) 16.7x22.2
  //   · tabindex null on 25/25, role null on 25/25, and 90 real Tab presses focused one ZERO times
  //   · the <svg> carried role="img", which prunes every descendant from the accessibility tree,
  //     so the zones did not merely lack a role — they did not exist for AT at all
  //   · all 15 "find your cause →" buttons had the IDENTICAL accessible name and no aria-label
  // This is the page a reader arrives at BECAUSE they cannot name their problem, so every one of
  // those controls is a first tap.
  // This assertion DRIVES THE UI (it focuses a hotspot and presses Enter), so it owns this route.
  // PROVE IT by putting role="img" back on the svg in build/parse.js, or by deleting the
  // role/tabindex/aria-label from the .bw-hit ellipses.
  '/where': [{
    name: 'theBodyMapIsTappableReachableAndNamed',
    why: 'W5c/D26: 21 of 25 hotspots were under 24px, 0 of 25 were keyboard-reachable, and 15 buttons shared one accessible name',
    evaluate: async () => {
      const svg = document.querySelector('.body-where-svg');
      if (!svg) return 'no body map on /where';
      if (svg.getAttribute('role') === 'img') return 'the body map is role="img" again — that prunes every child from the accessibility tree, so no hotspot inside it exists for a screen reader whatever attributes it carries';
      const hits = [...document.querySelectorAll('.bw-hit')];
      if (hits.length < 20) return `${hits.length} hit targets on the body map — the touch layer is missing`;
      const small = hits.filter((h) => { const r = h.getBoundingClientRect(); return r.width < 24 || r.height < 24; });
      if (small.length) return `${small.length} of ${hits.length} body-map targets are under 24x24 CSS px (smallest ${small.map((h) => Math.round(Math.min(h.getBoundingClientRect().width, h.getBoundingClientRect().height))).sort((a, b) => a - b)[0]}px)`;
      const focusable = hits.filter((h) => h.getAttribute('tabindex') === '0');
      const sections = document.querySelectorAll('.bw-zone-sec').length;
      if (focusable.length !== sections) return `${focusable.length} keyboard-reachable hotspots for ${sections} zone sections — one focus stop per zone, no more and no fewer`;
      const unnamed = focusable.filter((h) => !(h.getAttribute('aria-label') || '').trim() || h.getAttribute('role') !== 'button');
      if (unnamed.length) return `${unnamed.length} focusable hotspots have no role="button" or no accessible name — a shape that takes focus and says nothing is worse than one that cannot take it`;
      if (new Set(focusable.map((h) => h.getAttribute('aria-label'))).size !== focusable.length) return 'two hotspots share an accessible name — they go to different sections';
      // A role="button" that does not answer Enter is a lie told to a screen reader.
      const knee = document.querySelector('.bw-hit[data-zone="knee"][role="button"]');
      if (!knee) return 'no focusable knee hotspot to test the key handler on';
      knee.focus();
      if (document.activeElement !== knee) return 'a hotspot cannot take focus';
      knee.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await new Promise((r) => setTimeout(r, 200));
      if (!document.querySelector('#zone-knee.on')) return 'pressing Enter on a hotspot did nothing — role="button" with no key handler';
      if (document.activeElement.id !== 'zone-knee') return `Enter moved the page but not focus (activeElement is "${document.activeElement.id || document.activeElement.className}") — a smooth scroll away from the control is invisible to the person who triggered it`;
      // ...and the 15 cause-finder buttons must say WHICH cause they find.
      const finds = [...document.querySelectorAll('.bw-find')];
      const noAria = finds.filter((f) => !(f.getAttribute('aria-label') || '').trim());
      if (noAria.length) return `${noAria.length} of ${finds.length} "find your cause" buttons have no aria-label — they all read as the same control`;
      const tiny = finds.filter((f) => f.getBoundingClientRect().height < 44);
      if (tiny.length) return `${tiny.length} of ${finds.length} "find your cause" buttons are under 44px tall`;
      return null;
    },
  }],
  '/problem/knee-pain': [{
    name: 'problemPageIsADifferential',
    why: 'D13: escalation, every tell, and a route to a protocol must all come BEFORE the mechanism prose, and every #cause-N must resolve',
    evaluate: () => {
      const app = document.querySelector('#app') || document.body;
      const H = document.documentElement.scrollHeight;
      const y = el => Math.round(el.getBoundingClientRect().top + window.scrollY);
      if (!document.getElementById('red-flags')) return 'no #red-flags escalation block';
      if (!/not medical advice/i.test(app.innerText)) return '#red-flags does not say the page is not medical advice';
      const dx = document.getElementById('which-one');
      if (!dx) return 'no #which-one differential block';
      const rows = dx.querySelectorAll('.dx-row');
      const causes = app.querySelectorAll('.cause-flat-item');
      if (rows.length !== causes.length) return `${rows.length} differential rows for ${causes.length} causes`;
      if (dx.querySelectorAll('.dx-tell').length !== rows.length) return 'a differential row has no tell';
      if (y(dx) > 844 * 4) return `the differential starts at ${y(dx)}px, below the 4th screen`;
      const proto = [...app.querySelectorAll('a[href]')].find(a => /(^|\/)protocol\//.test(a.getAttribute('href')));
      if (!proto) return 'no link to a protocol anywhere on the page';
      const pct = Math.round(100 * y(proto) / H);
      if (pct > 40) return `the first protocol link is at ${pct}% of page height (was 98% — this is the defect)`;
      const ids = new Set([...causes].map(c => c.id).filter(Boolean));
      if (ids.size !== causes.length) return `${ids.size} of ${causes.length} cause blocks have an id`;
      const jumps = [...app.querySelectorAll('a[href^="#cause-"]')];
      if (!jumps.length) return 'no #cause-N jump links';
      const dead = jumps.filter(a => !document.getElementById(a.getAttribute('href').slice(1)));
      if (dead.length) return `${dead.length} of ${jumps.length} #cause-N links resolve to nothing`;
      const next = [...causes].filter(c => c.querySelector('.cf-next a[href^="/protocol/"]')).length;
      if (next !== causes.length) return `${next} of ${causes.length} causes offer a protocol at the end`;
      const lis = [...app.querySelectorAll('.cf-fixes li')];
      const linked = lis.filter(li => li.querySelector('a[href^="/c/"]')).length;
      if (!linked) return `0 of ${lis.length} plan items link to the compound they name`;
      return null;
    },
  }],
  // W2.5 (2026-08-01): a plan item must link to the compound IT NAMES. site/app.js's
  // resolveCompound() ended in a last-resort pass that flattened both slugs and asked for a bare
  // substring, so a ref could match a fragment inside a longer chemical word. Measured hydrated at
  // 390x844 on this route: the item "Daily fermented foods (yoghurt, kefir, kimchi) … oral butyrate
  // is an optional adjunct" (authored ref "Butyrate") linked to #/c/hmb-hydroxy-methylbutyrate,
  // because "hmbhydroxymethylbutyrate" contains "butyrate". HMB is a leucine metabolite for muscle.
  // The prerendered document rendered the same item as plain text (prerender.js:findCpt has no
  // substring pass), so the two documents disagreed on exactly this item and only a hydrated check
  // can see it.
  // This asserts the PROPERTY, not the algorithm: the linked compound's name and the authored ref
  // must share whole words — either the ref's words appear as a run inside the compound's name
  // ("B12" inside "B-Complex / B12 / Methylfolate / B6"), or the compound's name appears as a run
  // inside the ref ("Magnesium" inside "Magnesium glycinate"). Letters inside a longer word are not
  // a shared name. Verified hydrated over all 52 protocol routes: 1,110 rendered plan items, all
  // 1,110 matched to their authored fix, 365 of them linked, 0 violations after the fix.
  // Prove this gate by restoring the old pass 5 in site/app.js —
  // `|| D.compounds.find(c => flat(slug(c.name)).includes(flat(s)))` with `const flat = x =>
  // x.split('-').join('')` — and rebuilding: this route fails and names the item.
  '/protocol/gut-health/dysbiosis': [{
    name: 'planItemLinksNameTheirOwnRef',
    why: 'W2.5: a plan item that links to a compound page must link to the compound it names — "Butyrate" linked to HMB',
    evaluate: () => {
      const norm = t => String(t).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      const sl = t => String(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const run = (hay, ndl) => {
        for (let i = 0; i + ndl.length <= hay.length; i++) {
          let ok = true;
          for (let j = 0; j < ndl.length; j++) if (hay[i + j] !== ndl[j]) { ok = false; break; }
          if (ok) return true;
        }
        return false;
      };
      const pid = location.pathname.split('/')[2];
      const p = window.RNAWIKI_DATA.graph.problems.find(x => x.id === pid);
      if (!p) return `no problem ${pid} in the shipped data`;
      const fixes = [];
      ((p.why || {}).causes || []).forEach(c => (c.fixes || []).forEach(f => fixes.push(f)));
      const lis = [...document.querySelectorAll('#app li')].filter(li => li.querySelector('.fix-kind'));
      if (!lis.length) return 'no plan items rendered on this protocol page';
      let linked = 0, unmatched = 0;
      for (const li of lis) {
        const t = norm(li.textContent);
        const f = fixes.find(x => x.what && t.endsWith(norm(x.what)));
        if (!f) { unmatched++; continue; }
        const a = li.querySelector('a[href*="/c/"]');
        if (!a) continue;
        linked++;
        const href = a.getAttribute('href');
        if (!f.ref) return `a plan item links to ${href} while authoring no ref at all: "${li.textContent.trim().slice(0, 70)}"`;
        const ct = href.replace(/^#?\/c\//, '').split('-');
        const rt = sl(f.ref).split('-');
        if (!run(ct, rt) && !run(rt, ct))
          return `the plan item whose ref is ${JSON.stringify(f.ref)} links to ${href}, whose name does not contain that word — a reader clicking "${li.textContent.trim().slice(0, 60)}" lands on a different molecule`;
      }
      if (unmatched) return `${unmatched} of ${lis.length} rendered plan items match no authored fix — the text match this assertion relies on has drifted, so it can no longer see the defect`;
      if (!linked) return `0 of ${lis.length} plan items link to a compound — resolveCompound() has stopped resolving`;
      return null;
    },
  }],
  // ---- W4 · LOOP C (2026-08-02): COHORTS ----------------------------------------------------
  // "$0 protocols only. No leaderboard, no competition, no ranking of participants. It is a shared
  // start date, nothing more." The three route entries above cover the live case, the expired case
  // and the prescription case. The property that matters most is the one in the middle:
  //   A COHORT LINK MAY NEVER HAND A READER A FINISHED WEEK.
  // The Research Receipt unlocks on day 7, so a link dated 8+ days back would mint a write-up for
  // days nobody did, straight out of a URL. That is why the lower bound exists and why it is gated.
  // PROVE THESE GATES by raising COHORT_BACK in site/app.js above 6, by printing any count of other
  // participants into cohortStripHTML(), or by deleting the receiptGuard() call in cohortParse().
  [`/protocol/insomnia/circadian-misalign?cohort=${COHORT_TODAY}-smoke`]: [{
    name: 'loopCCohortIsAStartDateAndNothingElse',
    why: 'W4: a cohort is a shared start date. It must never rank anyone, never count anyone, and never begin a week that is already over',
    evaluate: () => {
      const el = document.querySelector('#app .p1-cohort');
      if (!el) return 'a ?cohort= link rendered no cohort strip at all — a link that does nothing and says nothing makes a reader believe they joined something';
      if (el.dataset.cohort !== 'ok') return `a cohort starting today was refused: "${(el.innerText || '').slice(0, 120)}"`;
      const t = (el.innerText || '').replace(/\s+/g, ' ');
      if (!/day 1 of 7/i.test(t)) return `the cohort strip does not align the day counter — "${t.slice(0, 120)}"`;
      if (!/no leaderboard/i.test(t)) return 'the cohort strip does not say there is no leaderboard';
      if (!/no ranking/i.test(t)) return 'the cohort strip does not say there is no ranking';
      // nothing may count, rank or compare other people
      if (/\b(\d+)\s+(people|others|participants|readers|members|joined|in this cohort)\b/i.test(t)) return `the cohort strip counts other participants — "${t}". This page cannot see another person's week and must not imply that it can`;
      if (/(rank|leader ?board|position|streak of the|top \d)/i.test(t.replace(/no leaderboard|no ranking/gi, ''))) return `the cohort strip ranks participants — "${t}"`;
      if (/\b\d+\s?%/.test(t)) return `the cohort strip carries a statistic — "${t}"`;
      const btn = document.getElementById('phase1-start');
      if (!btn) return 'no start button on a live cohort';
      if (!/join the cohort/i.test(btn.textContent)) return `the start button does not offer to join the cohort — "${btn.textContent.trim()}"`;
      if (btn.textContent.indexOf(el.getAttribute('data-cohort-start')) < 0) return 'the start button does not name the cohort start date it would adopt';
      return null;
    },
  }],
  '/protocol/insomnia/circadian-misalign?cohort=2020-01-01-old': [{
    name: 'loopCCohortCannotHandOverAFinishedWeek',
    why: 'W4: the receipt unlocks on day 7, so a back-dated cohort link would mint a write-up for days nobody did — straight out of a URL',
    evaluate: () => {
      const el = document.querySelector('#app .p1-cohort');
      if (!el) return 'a stale ?cohort= link was dropped silently — the reader must be told the link did nothing';
      if (el.dataset.cohort !== 'refused') return `a cohort dated 2020-01-01 was ACCEPTED (state "${el.dataset.cohort}") — that puts the reader past day 7 of a week they never did, and the receipt unlocks on day 7`;
      if (!/already over/i.test(el.innerText || '')) return 'the refusal does not say why';
      const btn = document.getElementById('phase1-start');
      if (btn && /join the cohort/i.test(btn.textContent)) return 'the start button still offers to join a cohort whose week is over';
      // And the refusal must not have started anything. Scoped to THIS route's key: the smoke
      // browser keeps one origin and one localStorage across every route, and the receipt
      // assertion earlier in this run deliberately seeds a finished week under a different
      // protocol. The first version of this check read the whole `rnawiki_track` object and failed
      // on that neighbour's data — which is how a gate ends up being switched off rather than
      // believed.
      const [, , pid, rcid] = location.pathname.split('/');
      let t = null; try { t = JSON.parse(localStorage.getItem('rnawiki_track') || 'null'); } catch (e) {}
      if (t && (t.logs || {})[pid + '/' + rcid]) return 'a refused cohort link created a log for this protocol anyway';
      return null;
    },
  }],
  [`/protocol/hair-loss/dht-sensitivity?cohort=${COHORT_TODAY}-smoke`]: [{
    name: 'loopCNoCohortOnAProtocolThatIsNotFree',
    why: 'W4: "$0 protocols only. Never run a supplement cohort." A cohort on a prescription protocol is a group of strangers told to start a medicine on a date, by a URL',
    evaluate: () => {
      const el = document.querySelector('#app .p1-cohort');
      if (!el) return 'the cohort link was dropped silently on a protocol that has no $0 first step — say so instead';
      if (el.dataset.cohort !== 'refused') return `a cohort was ACCEPTED on a root cause with no $0 Phase 1 (state "${el.dataset.cohort}") — $0 protocols only`;
      const t = el.innerText || '';
      if (!/No cohort runs on this protocol/i.test(t)) return `the refusal does not say a cohort does not run here — "${t.slice(0, 120)}"`;
      if (!/costs nothing/i.test(t)) return 'the refusal does not give the rule it is applying';
      return null;
    },
  }],
  // ---- W5 (2026-08-02): A COHORT LINK MAY NOT SHORTEN THE WEEK --------------------------------
  // MEASURED HYDRATED at 390x844, fresh profile, NO devtools (qa/out/w5r_repro.json d_strip,
  // d_afterTap, d_clicks): ?cohort=<today-6>-slug rendered "That makes today day 7 of 7 for this
  // cohort" and a button reading "Join the cohort — start on 2026-07-27". Join, then ONE tap on
  // "✔ Did it", produced data-receipt="ready", a card headed "7-day self-observation log" dated
  // 2026-07-27 → 2026-08-02, an X share link, and a real file:
  // rnawiki-7-day-log-cravings-glycemic-swings-2026-08-02.png. N=7 is refused by name; N=6 was not.
  // Boundary sweep (qa/out/w5r_repro2.json d_ages): N=3 arrives on day 4, N=5 on day 6, N=6 on
  // day 7 — so the fix is the `opened` rule in receiptReady(), not the constant.
  // PROVE THIS GATE by deleting the `log.opened` clause from receiptReady(), or by dropping the
  // `opened` field from the object trackStart() writes. Joining still works and the card comes back.
  [`/protocol/cravings/glycemic-swings?cohort=${COHORT_BACK6}-smoke`]: [{
    name: 'aCohortLinkCannotMintAWeekTheReaderWasNotHereFor',
    why: 'W5: a public URL and one tap produced a downloadable, X-shareable "7-day self-observation log" covering six days the reader was not present for — no devtools, no file, no forged DOM',
    evaluate: async () => {
      localStorage.removeItem('rnawiki_track'); localStorage.removeItem('rnawiki_phase1');
      const el = document.querySelector('#app .p1-cohort');
      if (!el) return 'the six-day-old cohort link rendered no strip at all';
      if (el.dataset.cohort !== 'ok') return `a cohort dated six days back was refused ("${(el.innerText || '').slice(0, 90)}") — joining late is allowed and this gate no longer tests what it was written for; if COHORT_BACK was lowered on purpose, retarget this route`;
      const start = document.getElementById('phase1-start');
      if (!start) return 'no start button on a live cohort';
      start.click();
      await new Promise(r => setTimeout(r, 120));
      const L = (JSON.parse(localStorage.getItem('rnawiki_track') || 'null') || { logs: {} }).logs['cravings/glycemic-swings'];
      if (!L) return 'joining the cohort wrote no log';
      if (!/^\d{4}-\d{2}-\d{2}$/.test(L.opened || '')) return 'the log records no `opened` date — without the day it was created on this device, a start date handed over by a URL is indistinguishable from a week that was lived';
      if (L.opened === L.started) return `the log claims it was opened on ${L.opened}, its own day 1, six days before this browser first loaded the page`;
      const day = (document.querySelector('#p1-log .p1-day') || {}).innerText || '';
      if (!/Day 7 of 7/.test(day)) return `the joined log reads "${day}" — this gate is written for the day-7 arrival and is no longer testing it`;
      const did = document.querySelector('#p1-log button[data-p1="did"][data-v="1"]');
      if (!did) return 'no tap target on the joined day';
      did.click();
      await new Promise(r => setTimeout(r, 200));
      const w = document.querySelector('#p1-log .rcpt');
      if (!w) return 'no receipt block after the tap';
      if (w.dataset.receipt === 'ready') return 'one tap on a cohort link dated six days back produced a finished 7-day card — a public URL is not seven days of self-observation';
      if (document.querySelector('#p1-log button[data-p1="receipt-png"]')) return 'the download control exists on a week the reader joined on its last day';
      if (document.querySelector('#p1-log .rcpt-x')) return 'the share control exists on a week the reader joined on its last day';
      if (!/of its own 7 days|were over before it existed/i.test(w.innerText || '')) return `the block does not say why there is no card — "${(w.innerText || '').slice(0, 110)}"`;
      // AND THE REFUSAL MUST BE REAL, NOT PAINTED. host.onclick is delegated, so an injected button
      // is a live route into receiptDownload() — this is exactly how the day-7 lock was bypassed in
      // W4.5, and the same mistake was then made again with the day-1 direction lock.
      const proto = HTMLAnchorElement.prototype, realClick = proto.click;
      let minted = null;
      proto.click = function () { minted = this.download; };
      const forged = document.createElement('button'); forged.dataset.p1 = 'receipt-png';
      try { document.getElementById('p1-log').appendChild(forged); forged.click(); await new Promise(r => setTimeout(r, 900)); }
      finally { proto.click = realClick; forged.remove(); }
      localStorage.removeItem('rnawiki_track'); localStorage.removeItem('rnawiki_phase1');
      if (minted) return `a forged tap minted ${minted} for a week the reader joined on its last day — the refusal is in the renderer again, not in receiptModel()`;
      return null;
    },
  }],
  // D10 (commit e7a19ef): /solve is the funnel entrance. It used to link every card to
  // `#/protocol/{pid}/{root_causes[0].id}`, so a JS reader saw 41 of the 52 protocol URLs and 0
  // /problem URLs while the crawler document had all 52 — 11 protocol URLs unreachable. Prove this
  // gate by reverting solveCard() to a single <a href="#/protocol/${p.id}/${p.root_causes[0].id}">.
  // The data-native clause is separate and just as load-bearing: /problem is KEEP_PRERENDERED, so a
  // /problem link without it leaves the /solve DOM sitting under a /problem URL.
  '/solve': [{
    name: 'solveReachesEveryProtocolAndProblem',
    why: 'D10: /solve must reach all 52 protocol URLs and all 41 problem URLs, and every /problem link must carry data-native',
    evaluate: () => {
      const G = window.RNAWIKI_DATA.graph;
      const want = [];
      G.problems.forEach(p => p.root_causes.forEach(rc => want.push('/protocol/' + p.id + '/' + rc.id)));
      const A = [...document.querySelectorAll('#app a[href]')].map(a => a.getAttribute('href').replace(/^#/, ''));
      const missP = want.filter(u => A.indexOf(u) < 0);
      if (missP.length) return `${missP.length} of ${want.length} protocol URLs unreachable, e.g. ${missP.slice(0, 3).join(', ')}`;
      const missProb = G.problems.map(p => '/problem/' + p.id).filter(u => A.indexOf(u) < 0);
      if (missProb.length) return `${missProb.length} of ${G.problems.length} problem URLs unreachable, e.g. ${missProb.slice(0, 3).join(', ')}`;
      const noNative = [...document.querySelectorAll('#app a[href^="/problem/"]')].filter(a => !a.hasAttribute('data-native')).length;
      if (noNative) return `${noNative} /problem link(s) missing data-native — KEEP_PRERENDERED means the click would leave the /solve DOM in place under a /problem URL`;
      return null;
    },
  }],
  // D11 (commits e7a19ef + d6df0f8): the query must change the page and round-trip into the field.
  // Prove this gate by reverting route() to `html = solvePage()`.
  '/solve?q=knee%20pain': [{
    name: 'solveQueryIsRead',
    why: 'D11: ?q= was split off in route() and thrown away — every query rendered the same 11,797-char #app with no <input> in it',
    evaluate: () => {
      const inp = document.getElementById('solve-q');
      if (!inp) return 'no #solve-q field on /solve';
      if (inp.value !== 'knee pain') return `#solve-q value is ${JSON.stringify(inp.value)}, expected "knee pain"`;
      const hits = document.querySelector('#q-hits');
      if (!hits || !hits.querySelector('.solve-card')) return 'no ranked matches rendered for q=knee pain';
      const first = hits.querySelector('.solve-card').dataset.pid;
      if (first !== 'knee-pain') return `top match is ${first}, expected knee-pain`;
      return null;
    },
  }],
  // D3 (commit da1e71e): the protocol page must expand the cause its own URL is about. Before the
  // fix app.js hard-coded `open` on index 0, so this route printed "Patellar tendinopathy (tendon
  // overload)" in its header and expanded "Hip & quad weakness with patellofemoral pain" — on 20
  // of 52 protocol URLs. Index 2 is what data/cause_map.json binds knee-pain/patellar-tendinopathy
  // to ("Training-load error (patellar tendinopathy)"); if that entry is ever re-authored, this
  // number must move with it. Selector-only, because the runner below tests element presence —
  // which is why app.js stamps data-cause-index on every accordion. The exclusive-group invariant
  // means one [open] existing implies no sibling is open.
  // ---- W5 (2026-08-02): A DEFAULT IS ALLOWED. A SILENT DEFAULT IS NOT. ------------------------
  // 5 of 52 root causes are deliberately unmapped in data/cause_map.json, each with an authored
  // reason the build has always REQUIRED and never rendered. Measured hydrated at 390x844 on all
  // 52 protocol routes, 0 pageerrors (qa/out/w5int/acc-before.json): the 47 mapped routes open the
  // mapped cause 47/47, and these 5 open accordion index 0 with nothing on the page saying so. On 3
  // of the 5 the opened cause makes a materially different claim from the URL's own root cause —
  // this route displays "Sluggish thyroid / nutrient deficits" and opens "Hashimoto's autoimmune
  // thyroiditis", which is a different diagnosis, not a narrower one.
  // Read-only assertion, so it can share a route with nothing else that drives the UI — this route
  // has no other assertion at all. PROVE IT by deleting the `.cause-fallback` line from
  // causesSection() in site/app.js, or by passing `rc` no further than causeIndexForRc().
  '/protocol/thyroid/subclinical-hypothyroid': [{
    name: 'aDefaultCauseSaysItIsADefault',
    why: 'W5: on the 5 root causes with no authored cause to open, the page opened one anyway and said nothing — on 3 of them a different claim from the one in the URL',
    evaluate: async () => {
      const [, , pid, rcid] = location.pathname.split('/');
      const p = window.RNAWIKI_DATA.graph.problems.find(x => x.id === pid);
      const rc = p && p.root_causes.find(x => x.id === rcid);
      if (!rc) return 'this route names no root cause — retarget this gate';
      if (rc.cause_key) return `${pid}/${rcid} is now MAPPED to "${rc.cause_key}" — this gate exists to test the unmapped branch and is no longer testing it; move it to another unmapped root cause`;
      if (!rc.cause_unmapped) return 'the root cause carries no `cause_unmapped` — build/parse.js requires a reason for every null in data/cause_map.json, so it exists; it is simply not reaching the reader';
      const open = document.querySelector('#p-causes .cause-acc[open]');
      if (!open) return 'no cause is open at all';
      const note = document.querySelector('#p-causes .cause-fallback');
      if (!note) return 'a cause was opened for the reader with nothing saying it is a default — the page shows a selection it did not make and does not disclose that';
      const t = (note.innerText || '').replace(/\s+/g, ' ').trim();
      if (t.indexOf(rc.name) < 0) return `the note does not name the URL's own root cause "${rc.name}" — "${t.slice(0, 120)}"`;
      const idx = +open.getAttribute('data-cause-index');
      if (t.indexOf('#' + (idx + 1)) < 0) return `the note does not name the cause that is actually open (#${idx + 1}) — a caveat that points at a different row is worse than none`;
      if (t.indexOf(rc.cause_unmapped.slice(0, 60)) < 0) return 'the note does not quote the authored reason from data/cause_map.json';
      if (getComputedStyle(note).borderTopWidth === '0px') return 'the note carries no .cause-fallback styling — it reads as more body copy, which is how a caveat stops being one';
      return null;
    },
  }],
  '/protocol/knee-pain/patellar-tendinopathy': [{
    name: 'urlRootCauseIsTheOpenCause',
    selector: '#p-causes .cause-acc[data-cause-index="2"][open]',
    why: 'D3: the accordion must open the cause data/cause_map.json binds to this URL, not index 0',
  }, {
    // W4 (2026-08-02): THE 1-TAP LOGGER. This assertion DRIVES THE UI — it taps Start, taps a day,
    // taps a direction — so it MUST STAY LAST in this array and this route must stay the one whose
    // other assertion is a pure selector check. It deliberately does NOT live on
    // /protocol/knee-pain/patellofemoral-pain: phase1IsOneFreeThingAndComesFirst there asserts that
    // Phase 2 is CLOSED on a first visit, and tapping Start opens it.
    // MEASURED HYDRATED at 390x844 in the DEFAULT DOM state on three protocol routes before this
    // (out/w4log_before.json): #p1-log 0/3 · a day counter 0/3 · a sparkline 0/3 · export or restore
    // 0/3 · input[type=range] anywhere on the page 0/3 · localStorage 40 B. The page told a reader to
    // do one free thing every day for a week and gave them nowhere to record the week.
    // FIVE THINGS ARE ASSERTED, and each is a rule the logger could quietly lose:
    //   1. it works with NO ACCOUNT (this smoke run has no database at all — /api/me 503s)
    //   2. TAP-ONLY: zero range/text/number inputs and zero textareas inside #p1-log
    //   3. NO HEALTH STATE IN ANY URL: location.href is byte-identical before and after logging
    //   4. an EXPLICIT start: nothing is stored until Start is tapped
    //   5. what is stored is exactly what the panel shows, in the format the restore path validates
    // PROVE IT by reintroducing any of them: render the direction as <input type="range">, or write
    // the day into location.hash, or store on load instead of on the Start tap. Each fails by name.
    name: 'phase1LoggerIsOneTapAndLeaksNothing',
    why: 'W4: the $0 protocol must be loggable with no account, by tapping only, without putting a single health fact into a URL',
    evaluate: async () => {
      const [, , pid, rcid] = location.pathname.split('/');
      const p = window.RNAWIKI_DATA.graph.problems.find(x => x.id === pid);
      const rc = p.root_causes.find(x => x.id === rcid);
      if (!rc.phase1) return 'this root cause carries no Phase 1 — pick a different smoke route for the logger';
      const KEY = 'rnawiki_track';
      const urlBefore = location.href;
      const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return 'UNPARSEABLE'; } };
      const host = document.getElementById('p1-log');
      if (!host) return 'no #p1-log — Phase 1 asks for 7 days and offers nowhere to put them';
      // 4. explicit start
      if (read()) return 'a log already exists before Start was tapped — logging must never begin on its own';
      // W4.5 (d): the pre-start panel now carries exactly ONE control — restore. A reader who
      // exported their log (because this page's own copy told them to) and then cleared their browser
      // had nowhere to put the file back: measured hydrated on a device with no log, 0 buttons, no
      // file input, and the word "restore" 0 times on the whole page (qa/out/w45log_bde.json).
      // Everything that RECORDS a day must still be absent until Start is tapped.
      const preBtns = [...host.querySelectorAll('button')].map(b => b.dataset.p1 || b.className || '?');
      if (preBtns.some(x => x !== 'restore')) return `#p1-log offers ${JSON.stringify(preBtns)} before Start was tapped — nothing that records a day may exist yet`;
      if (!host.querySelector('button[data-p1="restore"]')) return 'no restore control before Start — the reader who exported their log and cleared their browser cannot put it back, which is the exact case the export copy is written for';
      if (!host.querySelector('#p1-sync-state')) return 'the pre-start panel has no #p1-sync-state, so a refused restore would fail silently — the one outcome trackValidate() exists to prevent';
      const start = document.getElementById('phase1-start');
      if (!start) return 'no #phase1-start button to begin the log';
      start.click();
      await new Promise(r => setTimeout(r, 30));
      const t0 = read();
      if (!t0 || t0 === 'UNPARSEABLE' || t0.v !== 1) return 'tapping Start wrote no readable v1 log to localStorage';
      const L0 = t0.logs[pid + '/' + rcid];
      if (!L0) return 'tapping Start wrote a log under the wrong key';
      if (!/^\d{4}-\d{2}-\d{2}$/.test(L0.started || '')) return 'the started date is not a plain calendar date';
      if (Object.keys(L0.days).length) return 'Start pre-filled a day — starting is not doing, and a log that fills itself in is fiction';
      if (L0.sync !== false) return 'anonymous sync is ON by default — it must be opt-in';
      // the day counter and the sparkline
      const txt = (host.innerText || '').replace(/\s+/g, ' ');
      if (!/Day 1 of 7/.test(txt)) return `no day counter in the log ("${txt.slice(0, 80)}")`;
      const spark = host.querySelector('.p1-spark');
      if (!spark) return 'no sparkline';
      if (spark.querySelectorAll('rect').length !== 7) return `the sparkline draws ${spark.querySelectorAll('rect').length} day marks, expected 7`;
      if (!spark.getAttribute('aria-label')) return 'the sparkline has no text equivalent — a height-and-colour-only signal is D1';
      const chips = host.querySelectorAll('.p1-chip');
      if (chips.length !== 7) return `${chips.length} day chips, expected 7`;
      if (![...chips].slice(1).every(c => c.disabled)) return 'a future day can be logged — that is inventing data';
      // 2. TAP-ONLY
      const typed = host.querySelectorAll('input[type=range],input[type=text],input[type=number],textarea,select');
      if (typed.length) return `${typed.length} typed/dragged control(s) inside the log — it is one TAP a day, and a slider is a precision claim seven self-reports cannot support`;
      // 1 + 5. log a day by tapping, with no account
      if (window.__smokeMe) return 'this assertion assumes a signed-out reader';
      const did = host.querySelector('button[data-p1="did"][data-v="1"]');
      if (!did) return 'no "did it" tap target';
      did.click();
      await new Promise(r => setTimeout(r, 30));
      // W4.5 (c): DAY 1 IS THE COMPARISON, so it cannot be compared with itself. The log was started
      // today, so the direction question must be OFF here. Measured before the fix (qa/out/
      // w45log_a.json, w45log_c.json): 3 buttons, 0 disabled, pointer-events auto, beside copy that
      // said "leave it blank" — and on day 5 the day-1 chip was still selectable, the sentence had
      // vanished, and a tap stored {"did":1,"dir":"better"} against day 1.
      const dirDay1 = [...document.getElementById('p1-log').querySelectorAll('button[data-p1="dir"]')];
      if (dirDay1.length !== 3) return `${dirDay1.length} direction controls, expected 3`;
      if (!dirDay1.every(b => b.disabled)) return 'the direction buttons are live on day 1 — day 1 is the reader\'s own comparison point, so a direction here is a comparison with itself';
      // Backdate this same log so the direction round-trip below runs on a day that HAS a day 1 to
      // compare with. Nothing else about the log changes.
      const back = JSON.parse(localStorage.getItem(KEY));
      const zp = n => String(n).padStart(2, '0');
      const bd = new Date(); bd.setDate(bd.getDate() - 2);
      back.logs[pid + '/' + rcid].started = `${bd.getFullYear()}-${zp(bd.getMonth() + 1)}-${zp(bd.getDate())}`;
      localStorage.setItem(KEY, JSON.stringify(back));
      document.querySelectorAll('#p1-log [data-p1="day"]')[0].click();
      await new Promise(r => setTimeout(r, 40));
      document.querySelectorAll('#p1-log [data-p1="day"]')[2].click();   // day 3 = today
      await new Promise(r => setTimeout(r, 40));
      const dir = document.getElementById('p1-log').querySelector('button[data-p1="dir"][data-v="better"]');
      if (!dir) return 'no direction tap target';
      if (dir.disabled) return 'the direction buttons are locked on day 3 — the lock is meant to cover day 1 only';
      dir.click();
      await new Promise(r => setTimeout(r, 30));
      const L1 = read().logs[pid + '/' + rcid];
      const today = Object.keys(L1.days)[0];
      if (Object.keys(L1.days).length !== 1) return `${Object.keys(L1.days).length} days written by two taps on one day`;
      if (L1.days[today].did !== 1 || L1.days[today].dir !== 'better') return `the two taps stored ${JSON.stringify(L1.days[today])}`;
      const spark2 = document.getElementById('p1-log').querySelector('.p1-spark');
      if (spark2.querySelectorAll('rect.sp-bar').length !== 1) return 'the logged day did not appear in the sparkline';
      // the direction must be clearable, or the reader can never take back a guess
      document.getElementById('p1-log').querySelector('button[data-p1="dir"][data-v="better"]').click();
      await new Promise(r => setTimeout(r, 30));
      if (read().logs[pid + '/' + rcid].days[today].dir !== null) return 'tapping the chosen direction again does not clear it';
      // 3. NO HEALTH STATE IN ANY URL
      if (location.href !== urlBefore) return `logging changed the URL to ${location.href} — a health fact in a URL lands in history, Referer headers and proxy logs`;
      const exp = document.getElementById('p1-log').querySelector('button[data-p1="export"]');
      if (!exp) return 'no export control — a device-only log with no way out is a log you lose';
      if (!document.getElementById('p1-log').querySelector('button[data-p1="restore"]')) return 'no restore control';
      // The export must hand back a Blob object URL, never a data: URI, which would carry the
      // reader's own log inside a URL string. THE FIRST VERSION OF THIS CHECK LOOKED FOR
      // a[href^="data:"] IN THE DOM AND PASSED with a deliberately planted data: URI export — the
      // anchor is created, clicked and removed synchronously, so it is never in the DOM to find.
      // A gate that cannot fail is decorative. Capture the click instead, and swallow it so the
      // smoke browser does not write a stray file.
      const proto = HTMLAnchorElement.prototype, realClick = proto.click;
      let href = null;
      proto.click = function () { href = this.href; };
      try { exp.click(); } finally { proto.click = realClick; }
      await new Promise(r => setTimeout(r, 40));
      if (!href) return 'tapping export produced no download at all';
      if (href.slice(0, 5) !== 'blob:') return `the export href is "${href.slice(0, 48)}…" — it must be a blob: object URL. A data: URI puts the log itself inside a URL string`;
      if (location.href !== urlBefore) return `exporting changed the URL to ${location.href}`;
      return null;
    },
  }, {
    // W4 (2026-08-02): THE RESEARCH RECEIPT, AND THE $0 RULE ENFORCED IN CODE.
    // The build gate (assertPhase1 in build/parse.js) proves the DATA is free. This proves the CARD
    // is: it plants a prescription, a purchase, a compound name and a non-zero cost into the LIVE
    // rc.phase1 — i.e. it makes the data lie — and requires the receipt to refuse each time and to
    // remove the download control with it. All 44 root causes that carry a Phase 1 pass the guard,
    // so without this the refusal branch would never execute and the gate would be a gate over an
    // empty set.
    // PROVE THIS GATE by deleting any one clause of receiptGuard() in site/app.js — e.g. the
    // `p1.cost !== 'none'` line — or by printing a percentage into receiptModel()'s rows.
    name: 'receiptIsOnly0DollarAndOnlyWhatWasTapped',
    why: 'W4: a shareable card is the most quotable thing on the site. It must never be generatable for a prescription, controlled or paid protocol, and must never carry a statistic',
    evaluate: async () => {
      const [, , pid, rcid] = location.pathname.split('/');
      const p = window.RNAWIKI_DATA.graph.problems.find(x => x.id === pid);
      const rc = p.root_causes.find(x => x.id === rcid);
      if (!rc.phase1) return 'this root cause carries no Phase 1 — pick a different smoke route for the receipt';
      const urlBefore = location.href;
      const iso = (d) => { const q = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${q(d.getMonth() + 1)}-${q(d.getDate())}`; };
      // a finished week: 6 days tapped, one genuinely missed, mixed directions
      const start = new Date(); start.setDate(start.getDate() - 6);
      const days = {}, dirs = [null, 'worse', 'same', 'same', 'better', 'better', 'better'];
      for (let i = 0; i < 7; i++) { if (i === 3) continue; const d = new Date(start); d.setDate(start.getDate() + i); days[iso(d)] = { did: i === 5 ? 0 : 1, dir: dirs[i] }; }
      // W5.5: a planted week must now look like one this page wrote — every record marked `w:1`
      // (tapped here, through the UI), `opened` on its own day 1, and a write ledger whose own days
      // span the seven. Without those the receipt refuses, which is the whole point of the gate
      // below; this one asserts the HONEST path still produces a card.
      Object.keys(days).forEach((d) => { days[d].w = 1; });
      localStorage.setItem('rnawiki_track', JSON.stringify({ v: 1, logs: { [pid + '/' + rcid]: { started: iso(start), opened: iso(start), seen: Object.keys(days).sort(), taps: Object.keys(days).length, action: '', metric: '', sync: false, days } } }));
      // tapping a day chip is the only public way to force a redraw; focus falls back safely when
      // the chip's date is not in the new week
      const redraw = async () => { document.querySelector('#p1-log [data-p1="day"]').click(); await new Promise(r => setTimeout(r, 40)); };
      await redraw();
      const wrap = () => document.querySelector('#p1-log .rcpt');
      const dl = () => document.querySelector('#p1-log button[data-p1="receipt-png"]');
      if (!wrap()) return 'no receipt block in the log at all';
      if (wrap().dataset.receipt !== 'ready') return `after a finished week the receipt state is "${wrap().dataset.receipt}", expected "ready"`;
      const card = document.getElementById('rcpt-card');
      if (!card) return 'the receipt says ready and there is no card';
      const t = card.innerText.replace(/\s+/g, ' ');
      // What the card may NOT say. Seven self-reported taps are a diary; anything that reads like a
      // measurement is the most shareable false claim this site could make.
      if (/\d+\s?%/.test(t)) return `the card prints a percentage — "${t.match(/.{0,30}\d+\s?%.{0,30}/)[0]}"`;
      if (/\d+\s*\/\s*10/.test(t)) return 'the card prints an N/10 score — this logger collects no scale, so that number would be invented';
      if (/(of (users|people|readers)|on average|the average|cohort|other readers|compared with others)/i.test(t)) return 'the card carries an aggregate — no aggregate efficacy statistic may render anywhere';
      if (!/personal observation, not a clinical result/i.test(t)) return 'the card never says it is a personal observation rather than a clinical result';
      if (!/\$0/.test(t)) return 'the card never states that the week cost nothing';
      if (!dl()) return 'no download control — sharing must never be the only way to keep it';
      const r = dl().getBoundingClientRect();
      if (r.width < 44 || r.height < 44) return `the download control is ${Math.round(r.width)}x${Math.round(r.height)} — under 44x44 (D25)`;
      // the PNG must leave as a blob:, exactly like the JSON export
      const proto = HTMLAnchorElement.prototype, realClick = proto.click;
      let href = null;
      proto.click = function () { href = this.href; };
      try { dl().click(); } finally { setTimeout(() => { proto.click = realClick; }, 1500); }
      await new Promise(r2 => setTimeout(r2, 500));
      proto.click = realClick;
      if (!href) return 'tapping download produced no file at all';
      if (href.slice(0, 5) !== 'blob:') return `the receipt download href is "${String(href).slice(0, 48)}…" — a data: URI would put the reader's own week inside a URL string`;
      if (location.href !== urlBefore) return `downloading the receipt changed the URL to ${location.href}`;
      // ---- THE $0 RULE, FORCED. Make the data lie; the card must still refuse. ----
      const orig = { action: rc.phase1.action, cost: rc.phase1.cost, cls: rc.phase1.class, from: rc.phase1.from };
      const restore = () => { rc.phase1.action = orig.action; rc.phase1.cost = orig.cost; rc.phase1.class = orig.cls; rc.phase1.from = orig.from; };
      const cases = [
        ['a prescription', { action: 'Take the prescribed dose daily' }],
        ['a purchase', { action: 'A daily psyllium scoop' }],
        ['a compound the corpus knows', { action: 'Creatine Monohydrate daily' }],
        ['a cost that is not zero', { cost: 'some' }],
        // W6 (2026-08-08): THE EIGHT THAT GOT THROUGH. Every one of these was MEASURED hydrated at
        // 390x844 on /protocol/cravings/glycemic-swings, by this exact technique, minting a
        // finished card, a real PNG and an X share link saying "One free thing, nothing bought"
        // (qa/w6_dollar.mjs). Not one of them contains a word from the two published patterns —
        // that is the point. They are refused now because the action is no longer judged as prose:
        // it must be a condensation of the protocol's OWN authored quote, which build/parse.js
        // already proves for all 44 published Phase 1s.
        // PROVE THESE by deleting the structural block at the end of receiptGuard() in site/app.js.
        ['a dose spelled out in words', { action: 'Take 500 milligrams of it before bed' }],
        ['a dose in a unit the pattern does not list', { action: 'Two grams before bed' }],
        ['a dose form nobody typed into the word list', { action: 'One softgel with your evening meal' }],
        ['a thing you buy, in packaging words', { action: 'One stick pack each morning' }],
        ['a paid lab test, phrased colloquially', { action: 'Get your bloods done first' }],
        ['a clinic, under a Singapore name', { action: 'Ask at the polyclinic' }],
        ['a clinician the word list does not name', { action: 'Ask a nurse first' }],
        ['a device, phrased as an errand', { action: 'Pick up a chest belt' }],
        // And the two enumerated fields the structural check reads, so neither can be blanked to
        // slip past it.
        ['filed under a class this build does not publish', { cls: 'purchase' }],
        ['sourced from no authored text at all', { from: '' }],
      ];
      for (const [label, patch] of cases) {
        rc.phase1.action = patch.action || orig.action;
        rc.phase1.cost = patch.cost || 'none';
        rc.phase1.class = ('cls' in patch) ? patch.cls : orig.cls;
        rc.phase1.from = ('from' in patch) ? patch.from : orig.from;
        await redraw();
        const w = wrap();
        if (!w || w.dataset.receipt !== 'refused') {
          restore();
          return `a Phase 1 that is ${label} still produced receipt state "${w ? w.dataset.receipt : 'none'}" — the $0 rule must be enforced in code, not only in the data`;
        }
        if (dl()) {
          restore();
          return `a Phase 1 that is ${label} was refused but the download control is still on the page`;
        }
        if (!(w.innerText || '').trim()) {
          restore();
          return `a Phase 1 that is ${label} was refused silently — the reader must be told why`;
        }
      }
      restore();
      await redraw();
      if (wrap().dataset.receipt !== 'ready') return 'the receipt did not come back after the planted values were removed — the guard is stateful, which it must not be';
      return null;
    },
  }, {
    // W5.5 (2026-08-02): THE RECEIPT GUARDS WERE DATE-BASED AND THE DEVICE CLOCK IS THE ATTACKER'S.
    // Four bypasses, each of which WROTE A REAL PNG, measured hydrated at 390x844 on fresh profiles
    // with real UI taps and the real <input type=file> (qa/out/w55r_clock.json, w55r_openedmerge.json):
    //  9  page clock frozen +7 days, log started today, ONE real tap  -> "2026-08-02 → 2026-08-08 ·
    //     DID THE ONE THING ON 1 of the 7 days", written by the REAL download button.
    //  10 the same plus seven pre-written day records restored from a file -> "DID THE ONE THING ON
    //     7 of the 7 days · DAYS TAPPED 7 of 7", one day elapsed, one day tapped.
    //  11 `opened` ABSENT read as a pre-W5 log -> the cohort case the rule refuses by name, back in,
    //     with no devtools at all: the restore control exists before any log does.
    //  12 `opened` PRESENT but lowered by a restored file (one edited date in a text editor) -> a log
    //     that read data-receipt="closed" read "ready".
    // The rule that closes all four: a card asserts only days that were tapped ON THIS DEVICE through
    // the UI, and the week is measured by the page's own write ledger, never by Date.
    // PROVE THIS GATE — and these six were RUN, one at a time, each failing this gate by name:
    // delete the `led.span < TRACK_DAYS` clause from receiptReady() (case b2), delete the `opened`
    // presence test (case d), delete the `led.first` clause (case f), delete the `led.taps < led.n`
    // clause (case g), put tapOn() back in place of tapHere() in receiptModel() (case c), or restore
    // `o.logs[k] = inc` in the restore merge (case e).
    // ONE CLAUSE IS NOT INDEPENDENTLY PROVABLE AND SAYING SO IS THE POINT: `led.n < 2` cannot be
    // isolated, because a span of 7 days requires two distinct days, so `led.span < TRACK_DAYS`
    // catches everything it catches. Measured: deleting `led.n < 2` alone leaves this gate GREEN.
    // It is kept for the sentence it gives the reader who tapped once, not as a second guard, and it
    // is not counted as one.
    // IT LEAVES AN HONEST FINISHED WEEK ON SCREEN, deliberately: the share assertion below reads the
    // share control off this render, and the assertion after that needs day chips to redraw from.
    // That final re-plant is also the positive half of this gate — the honest path must still mint.
    name: 'receiptCountsOnlyDaysThisDeviceWrote',
    why: 'W5.5: the day-7 lock read a clock the reader controls and fields a text file supplies. A shareable card is the most quotable thing on this site and must assert only days this page itself watched somebody tap',
    evaluate: async () => {
      const [, , pid, rcid] = location.pathname.split('/');
      const K = pid + '/' + rcid;
      const iso = (d) => { const q = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${q(d.getMonth() + 1)}-${q(d.getDate())}`; };
      const shift = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };
      const redraw = async () => { const c = document.querySelector('#p1-log [data-p1="day"]'); if (c) c.click(); await new Promise(r => setTimeout(r, 60)); };
      const state = () => { const w = document.querySelector('#p1-log .rcpt'); return w ? w.dataset.receipt : 'none'; };
      const dl = () => document.querySelector('#p1-log button[data-p1="receipt-png"]');
      const week = (over) => { const days = {}; for (let i = 0; i < 7; i++) days[shift(i - 6)] = Object.assign({ did: 1, dir: i ? 'better' : null }, over || {}); return days; };
      const plant = async (log) => { localStorage.setItem('rnawiki_track', JSON.stringify({ v: 1, logs: { [K]: log } })); await redraw(); };
      const base = { started: shift(-6), action: '', metric: '', sync: false };
      // (a) a finished week with NO write ledger — bypasses 9, 10 and 11 in their stored form
      await plant(Object.assign({}, base, { opened: shift(-6), days: week({ w: 1 }) }));
      if (state() === 'ready') return 'a finished week with no write ledger still produced a card — elapsed days are being read from the clock again, and the clock belongs to the reader';
      if (dl()) return 'a week with no write ledger was refused and the download control is still on the page';
      // (b) a ledger that covers ONE day — the frozen-clock case exactly
      await plant(Object.assign({}, base, { opened: shift(-6), seen: [shift(0)], taps: 1, days: week({ w: 1 }) }));
      if (state() === 'ready') return 'one day in the write ledger minted a 7-day card — one sitting is one day whatever the clock is set to';
      // (b2) TWO sittings, one day apart, then the clock jumps to day 7. This is the case that
      // ISOLATES the span clause: (b) above is caught by `led.n < 2` as well, so without this one no
      // single reintroduction fails the gate and the "prove it" instruction below would be untrue.
      await plant(Object.assign({}, base, { opened: shift(-6), seen: [shift(-1), shift(0)], taps: 2, days: week({ w: 1 }) }));
      if (state() === 'ready') return 'a write ledger covering 2 adjacent days minted a 7-day card — the card is dated across a week the page watched two days of';
      // (c) a ledger that spans the week, but no record was written HERE
      await plant(Object.assign({}, base, { opened: shift(-6), seen: [shift(-6), shift(0)], taps: 2, days: week() }));
      if (state() === 'ready') return 'a card was minted from records this page never wrote — a restored file is the reader\'s data, not seven days of self-observation';
      if (state() !== 'empty') return `records this page never wrote gave receipt state "${state()}", expected "empty" — the reader must be told there is nothing to write up rather than shown nothing`;
      // (d) `opened` absent is untrusted, not legacy
      await plant(Object.assign({}, base, { seen: [shift(-6), shift(0)], taps: 2, days: week({ w: 1 }) }));
      if (state() === 'ready') return 'a log with no `opened` date minted a card — absent is unknown, and unknown may not be read as a week that was lived';
      // (f) a ledger that spans 7 days but did not begin until after this log's own week was over.
      // Span alone would admit it, and the card would print the ORIGINAL week's dates.
      const old7 = {}; for (let i = 0; i < 7; i++) old7[shift(i - 20)] = { did: 1, dir: i ? 'better' : null, w: 1 };
      await plant({ started: shift(-20), opened: shift(-20), seen: [shift(-6), shift(0)], taps: 2, action: '', metric: '', sync: false, days: old7 });
      if (state() === 'ready') return 'a card was minted for a week whose first tap on this device came 14 days after the week had ended — the card would carry the original dates';
      // (g) more days in the ledger than taps. This page increments taps on every accepted tap, so
      // it cannot have written this; only a hand-edited store can say it.
      await plant(Object.assign({}, base, { opened: shift(-6), seen: [shift(-6), shift(0)], taps: 1, days: week({ w: 1 }) }));
      if (state() === 'ready') return 'a ledger recording more days than taps minted a card — this page cannot have written that, so it is not evidence of anything';
      // (e) a file may not carry provenance INTO this device
      const forged = { v: 1, exported: shift(0), logs: { [K]: { started: shift(-6), opened: shift(-6), seen: [shift(-6), shift(0)], taps: 9, action: '', metric: '', sync: false, days: week({ w: 1 }) } } };
      localStorage.removeItem('rnawiki_track');
      const input = document.getElementById('p1-file');
      if (!input) return 'no restore file input to test — the restore path is where three of the four bypasses arrived';
      const dt = new DataTransfer();
      dt.items.add(new File([JSON.stringify(forged)], 'log.json', { type: 'application/json' }));
      input.files = dt.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise(r => setTimeout(r, 400));
      await redraw();
      const stored = (JSON.parse(localStorage.getItem('rnawiki_track') || '{}').logs || {})[K] || {};
      if ((stored.seen || []).length) return `a restored file wrote ${JSON.stringify(stored.seen)} into this device's write ledger — a file is days, never a claim about which days this page watched`;
      if (stored.taps) return `a restored file set taps to ${stored.taps} on this device`;
      if (Object.keys(stored.days || {}).some((d) => stored.days[d].w === 1)) return 'a restored file kept its records marked as written on this device';
      if (stored.opened !== shift(0)) return `a restored file set \`opened\` to ${JSON.stringify(stored.opened)} — it must be the day THIS device first held the log, or one edited date in a text file buys a finished week (qa/out/w55r_openedmerge.json)`;
      if (state() === 'ready') return 'a restored file minted a card on a device that watched none of the week';
      // ---- AND THE HONEST WEEK STILL MINTS. A guard that refuses everything is not a guard, it is
      // a broken feature, so the last thing this gate asserts is the path a real reader takes.
      const honest = week({ w: 1 });
      await plant(Object.assign({}, base, { opened: shift(-6), seen: Object.keys(honest).sort(), taps: 7, days: honest }));
      if (state() !== 'ready') return `a week tapped on this device across all 7 days gave receipt state "${state()}", expected "ready" — the ledger tests are refusing the honest path`;
      if (!dl()) return 'the honest week produced no download control';
      return null;
    },
  }, {
    // W6 (2026-08-08) · THE CARD MAY NOT COUNT A DAY THIS PAGE WAS NOT OPEN ON.
    // The gate above proves the WEEK was watched. It did not prove each DAY RECORD was written on
    // the day it claims, and that gap was worth six days.
    // MEASURED HYDRATED at 390x844 on /protocol/cravings/glycemic-swings in a fresh browser
    // profile, with NO devtools, NO restore file and NO localStorage edit — only real clicks
    // through the real UI (qa/w6_skew.mjs): tap "Did it" once on day 1, reopen with the page clock
    // seven days forward, tap the seven day chips in one sitting. Out came data-receipt="ready",
    // "DID THE ONE THING ON 7 of the 7 days", a real downloaded PNG
    // (rnawiki-7-day-log-cravings-glycemic-swings-2026-08-14.png) and an X share link saying the
    // same. Every one of the four ledger guards above passed: seen had 2 days, span 8, taps 7.
    // This plants that exact stored shape — seven w:1 records, a ledger of two days — and requires
    // the card to count ONE and to NAME the six it drops. A number a card silently omits is a
    // number it is lying about.
    // PROVE THIS GATE by deleting the ledgerDays() clause from tapHere() in site/app.js.
    name: 'theCardCountsOnlyDaysThisPageWasOpenOn',
    why: 'W6: one device-clock change and seven chip taps in one sitting minted a shareable PNG claiming a full calendar week',
    evaluate: async () => {
      const [, , pid, rcid] = location.pathname.split('/');
      const K = pid + '/' + rcid;
      const iso = (d) => { const q = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${q(d.getMonth() + 1)}-${q(d.getDate())}`; };
      const shift = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };
      const redraw = async () => { const c = document.querySelector('#p1-log [data-p1="day"]'); if (c) c.click(); await new Promise(r => setTimeout(r, 80)); };
      // Seven records this page really did write (w:1), on a device the page was only ever open on
      // TWO days — the first day of the week, and one day after the week ended. That is byte for
      // byte the store the measured attack produced: seen:[started, started+7], taps > 7, seven
      // w:1 day records. The second ledger day is deliberately OUTSIDE the seven, because that is
      // what a clock jumped forward past the end of the week looks like from in here, and it is
      // what makes the honest count 1 rather than 2.
      const days = {};
      for (let i = 0; i < 7; i++) days[shift(i - 7)] = { did: 1, dir: i ? 'better' : null, w: 1 };
      localStorage.setItem('rnawiki_track', JSON.stringify({ v: 1, logs: { [K]: {
        started: shift(-7), opened: shift(-7), action: '', metric: '', sync: false,
        seen: [shift(-7), shift(0)], taps: 8, days } } }));
      await redraw();
      const card = document.getElementById('rcpt-card');
      const t = card ? card.innerText.replace(/\s+/g, ' ') : '';
      const share = document.querySelector('#p1-log a[href*="x.com/intent"]');
      const shareText = share ? decodeURIComponent((share.getAttribute('href').match(/[?&]text=([^&]*)/) || [, ''])[1].replace(/\+/g, ' ')) : '';
      localStorage.removeItem('rnawiki_track'); localStorage.removeItem('rnawiki_phase1');
      // Refusing outright is stricter than counting one, and is a legitimate answer.
      if (!card) return null;
      if (/on 7 of the 7 days/i.test(t)) return `the card claims "7 of the 7 days" from a log this page was only ever open on 2 days — "${t.slice(0, 160)}"`;
      if (/DAYS TAPPED 7 of 7/i.test(t)) return `the card claims 7 of 7 days tapped from a 2-day write ledger — "${t.slice(0, 160)}"`;
      if (!/1 of the 7 days/i.test(t)) return `the card neither refused nor counted the one witnessed day — "${t.slice(0, 160)}"`;
      if (!/filled in afterwards/i.test(t)) return `the six days the card stopped counting are not named on it — a number a card drops must be stated, not dropped: "${t.slice(0, 160)}"`;
      // The share text travels further than the card and is generated separately, so it is checked
      // separately: it carried "Did it on 7 of the 7 days" in the measured attack.
      if (shareText && /on 7 of the 7 days/i.test(shareText)) return `the card says 1 but the X share text still says 7 — "${shareText.slice(0, 160)}"`;
      return null;
    },
  }, {
    // W4 · LOOP A (2026-08-02). The share is the one thing on this site that travels: it is read by
    // people who never see the page, so it must carry no claim the card does not, and it must never
    // post itself. Measured hydrated at 390x844 before it: links to x.com or twitter.com, 0/4 on
    // four protocol routes (qa/out/w4rl_before.json).
    // PROVE THIS GATE by dropping rel="noreferrer" from receiptShareHTML(), by putting an efficacy
    // word into receiptShareText(), or by turning the anchor into a fetch/window.open.
    name: 'loopAShareIsEditableAndClaimsNothing',
    why: 'W4: a share is quoted by people who never read the page — it may claim nothing beyond the reader\'s own counts, must never auto-post, and must not hand X the URL that names the reader\'s problem',
    evaluate: async () => {
      // runs after the receipt assertion above, which leaves a finished week rendered
      const a = document.querySelector('#p1-log .rcpt-x');
      if (!a) return 'no share control on a ready receipt';
      if (a.tagName !== 'A') return `the share control is a <${a.tagName.toLowerCase()}> — it must be a plain link to X's own composer, so nothing this site runs can post on the reader's behalf`;
      const href = a.getAttribute('href') || '';
      if (!/^https:\/\/x\.com\/intent\//.test(href)) return `the share href is "${href.slice(0, 60)}…" — it must open X's intent composer, which is editable and posts nothing on its own`;
      if (a.target !== '_blank') return 'the share does not open in a new tab, so it would take the reader away from a log they have not finished';
      const rel = (a.getAttribute('rel') || '');
      if (!/noreferrer/.test(rel)) return 'the share link has no rel="noreferrer" — X would receive the protocol URL as the Referer, and that URL names the reader\'s problem';
      if (!/noopener/.test(rel)) return 'the share link has no rel="noopener"';
      const text = decodeURIComponent((href.match(/[?&]text=([^&]*)/) || [, ''])[1]);
      if (!text) return 'the share carries no pre-filled text';
      if (text.length > 240) return `the share text is ${text.length} characters — it will be truncated by X and the sentence that says this is not a result is the part that gets cut`;
      if (/\d+\s?%/.test(text)) return `the share text prints a percentage — "${text}"`;
      if (/\d+\s*\/\s*10/.test(text)) return `the share text prints an N/10 score this logger never collected — "${text}"`;
      if (/\b(cured|healed|fixed it|proven|proves|effective|efficacy|works|worked|treatment for|remedy)\b/i.test(text)) return `the share text makes an efficacy claim — "${text}"`;
      if (/(of (users|people|readers)|on average|others)/i.test(text)) return `the share text carries an aggregate — "${text}"`;
      if (!/personal observation, not a result/i.test(text)) return `the share text never says it is a personal observation rather than a result — "${text}"`;
      if (!/\$0/.test(text)) return 'the share text never says the week cost nothing, which is the whole point of it';
      const cfgHandle = (((window.RNAWIKI_DATA.site || {}).x) || {}).handle;
      if (!cfgHandle) return 'no handle in data.site — the config the share reads from is missing';
      if (text.indexOf('@' + cfgHandle) < 0) return `the share text does not carry @${cfgHandle} from data/site_config.json`;
      // it must not be a precondition for anything, and it must not be the only way to keep the week
      if (!document.querySelector('#p1-log button[data-p1="receipt-png"]')) return 'the download is gone — sharing must never be the only way to keep your own week';
      return null;
    },
  }, {
    // W4.5 (2026-08-02): THE RECEIPT MAY ONLY ASSERT WHAT WAS RECORDED.
    // MEASURED in a real browser against the shipped W4 code: app.js
    // `Object.assign({ did: 1, dir: null }, ...)` defaulted did to 1, so a DIRECTION-ONLY tap wrote
    // {"did":1,"dir":"worse"}, and the day-7 card printed "DID THE ONE THING ON 1 of the 7 days"
    // plus an X share text saying "Did it on 1 of the 7 days" — for a reader who said only that it
    // got worse (qa/out/w45log_a.json). The chips and the sparkline announced the same invention,
    // and drawing it as "missed it" instead would be the identical lie inverted.
    // PROVE THIS GATE by restoring `did: 1` in that Object.assign default. It fails by name.
    // IT OVERWRITES rnawiki_track, so it must stay AFTER the two assertions above it, which read
    // the state they plant themselves. W5 (2026-08-02): it is no longer the last entry — the
    // elapsed-day assertion below runs after it, plants its own weeks from scratch, and clears both
    // storage keys at the end. Nothing between them is shared.
    name: 'aReceiptAssertsOnlyRecordedDaysAndOnlyAfterDay7',
    why: 'W4.5: the card and the share text are the two artefacts that leave the device. Neither may state a fact the reader did not enter, and neither may exist before the week it describes is over',
    evaluate: async () => {
      const [, , pid, rcid] = location.pathname.split('/');
      const key = pid + '/' + rcid;
      const q = (n) => String(n).padStart(2, '0');
      const iso = (d) => `${d.getFullYear()}-${q(d.getMonth() + 1)}-${q(d.getDate())}`;
      const dm = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };
      const today = iso(new Date());
      const put = (log) => localStorage.setItem('rnawiki_track', JSON.stringify({ v: 1, logs: { [key]: log } }));
      const read = () => JSON.parse(localStorage.getItem('rnawiki_track')).logs[key];
      // tapping a day chip is the only public way to force a redraw. Index matters: day 1 is the
      // comparison, so its direction controls are deliberately off (W4.5 (c)) and a direction tap
      // has to be made on a later day.
      const redraw = async (i) => {
        const c = document.querySelectorAll('#p1-log [data-p1="day"]')[i || 0];
        if (!c) return `no day chip at index ${i || 0} to redraw from`;
        c.click(); await new Promise(r => setTimeout(r, 40)); return null;
      };
      // ---- A. A DIRECTION-ONLY TAP CLAIMS NOTHING ABOUT THE INTERVENTION ----
      put({ started: dm(-3), action: '', metric: '', sync: false, days: {} });
      // TWICE, and that is load-bearing: the first tap redraws the panel from the week just planted
      // (the chips still on screen belong to the previous assertion's week, and their dates would
      // select the wrong day of the new one); the second selects day 4 of the new week.
      const e0 = await redraw(0); if (e0) return e0;
      const e1 = await redraw(3); if (e1) return e1;          // day 4 = today
      const worse = document.querySelector('#p1-log button[data-p1="dir"][data-v="worse"]');
      if (!worse) return 'no direction control to tap';
      if (worse.disabled) return 'the direction buttons are locked on a day that is not day 1';
      worse.click();
      await new Promise(r => setTimeout(r, 40));
      const rec = read().days[today];
      if (!rec) return 'a direction tap recorded nothing at all';
      if (rec.did === 1) return `tapping only "worse" stored ${JSON.stringify(rec)} — did:1 is a claim the reader never made, and the card prints it back as "DID THE ONE THING ON N of the 7 days"`;
      if (rec.did === 0) return `tapping only "worse" stored ${JSON.stringify(rec)} — "missed it" is the same invention inverted`;
      const sum = (document.querySelector('#p1-log .p1-log-sum') || {}).innerText || '';
      if (/did it on [1-9]/.test(sum)) return `the summary reads "${sum}" after a direction-only tap`;
      if (document.querySelector('#p1-log button[data-p1="did"][data-v="1"]').getAttribute('aria-pressed') !== 'false') return '"Did it" reads as pressed after a direction-only tap';
      const chipA = (document.querySelectorAll('#p1-log .p1-chip')[3].getAttribute('aria-label') || '');
      // Anchored: the honest label is "…, direction only, you did not say whether you did it", which
      // contains the substring "did it". Only a label that ENDS on the claim is the fabrication.
      if (/,\s*(did it|missed it)\s*$/.test(chipA)) return `the day chip announces "${chipA}" for a day the reader only gave a direction for`;
      const sparkA = document.querySelector('#p1-log .p1-spark').getAttribute('aria-label') || '';
      if (/day 4 (did it|missed it)/.test(sparkA)) return `the sparkline announces "${sparkA}"`;
      // ---- A2. THE FINISHED CARD COUNTS ONLY WHAT WAS ANSWERED ----
      const dd = {};
      // W5.5: `w:1` plus a write ledger spanning the seven days — this is the HONEST path (a week
      // this page itself watched somebody tap), and it must still mint. The dishonest shapes are
      // asserted by receiptCountsOnlyDaysThisDeviceWrote above.
      for (let i = 0; i < 7; i++) dd[dm(i - 6)] = i < 3 ? { did: 1, dir: null, w: 1 } : { did: null, dir: 'worse', w: 1 };
      put({ started: dm(-6), opened: dm(-6), seen: Object.keys(dd).sort(), taps: 7, action: '', metric: '', sync: false, days: dd });
      const e2 = await redraw(0); if (e2) return e2;
      const e2b = await redraw(0); if (e2b) return e2b;
      const card = document.getElementById('rcpt-card');
      if (!card) return 'a finished week produced no card';
      const rows = [...card.querySelectorAll('.rcpt-row')].map(r => r.innerText.replace(/\s+/g, ' ').trim());
      const didRow = rows.find(r => /^Did the one thing on/i.test(r)) || '(missing)';
      if (!/\b3 of the 7 days\b/.test(didRow)) return `the card says "${didRow}" for a week with 3 recorded "did it" days and 4 days the reader never answered`;
      if (!rows.some(r => /did not answer/i.test(r))) return 'the card counts 4 unanswered days in "days tapped" and states them nowhere — the two counts silently disagree';
      const sh = document.querySelector('#p1-log .rcpt-x');
      if (sh && !/Did it on 3 of the 7 days/.test(decodeURIComponent(sh.getAttribute('href')))) return 'the share text does not carry the same count as the card — it is the copy that travels';
      // ---- B. THE DAY-7 LOCK. Not paintable: forge the tap. ----
      // The lock used to live in receiptBlockHTML() only, i.e. it chose MARKUP. Measured on day 3
      // (qa/out/w45log_bde.json): the visible state was perfect — "Day 3 of 7", pending, no download
      // and no share control — while an injected <button data-p1="receipt-png"> reached the delegated
      // handler and wrote rnawiki-7-day-log-…-2026-08-08.png to disk, a card for a window ending four
      // days after the device's own date.
      // PROVE by deleting `if (!receiptReady(log, isoDay()).ok) return null;` from receiptModel().
      // W5.5: planted as an HONEST day-1 log — opened today, the record written here, one tap in the
      // ledger — so what this case exercises is the day-7 lock itself and not the newer `opened`
      // refusal. On day 1 the ledger tests are not even reached: the day count returns first, which
      // is what keeps an unfinished week reading "pending" rather than "closed".
      put({ started: today, opened: today, seen: [today], taps: 1, action: '', metric: '', sync: false, days: { [today]: { did: 1, dir: 'better', w: 1 } } });
      const e3 = await redraw(0); if (e3) return e3;
      const e3b = await redraw(0); if (e3b) return e3b;
      const w = document.querySelector('#p1-log .rcpt');
      if (!w || w.dataset.receipt !== 'pending') return `on day 1 the receipt state is "${w ? w.dataset.receipt : 'none'}", expected "pending"`;
      if (document.querySelector('#p1-log button[data-p1="receipt-png"]')) return 'the download control exists on day 1';
      if (document.querySelector('#p1-log .rcpt-x')) return 'the share control exists on day 1';
      // The click handler is delegated (host.onclick + closest('button[data-p1]')), so an injected
      // button is a real client-side route into receiptDownload(). This is the exact forgery that
      // wrote a future-dated PNG to disk before the lock moved into receiptModel().
      const proto = HTMLAnchorElement.prototype, realClick = proto.click;
      let minted = null;
      proto.click = function () { minted = { href: String(this.href).slice(0, 32), name: this.download }; };
      const forged = document.createElement('button'); forged.dataset.p1 = 'receipt-png';
      try { document.getElementById('p1-log').appendChild(forged); forged.click(); await new Promise(r => setTimeout(r, 900)); }
      finally { proto.click = realClick; forged.remove(); }
      if (minted) return `a forged tap on day 1 minted a real download (${minted.name}) — the day-7 lock is painted in receiptBlockHTML() and not enforced in receiptModel()`;
      const said = (document.getElementById('p1-sync-state') || {}).textContent || '';
      if (!/day 1 of 7/i.test(said)) return `the refusal said "${said}" — it must name the real reason (the week is not over), not "nothing recorded"`;
      // B2. A start date in the FUTURE is legitimate (a cohort may start up to 28 days ahead) and
      // must be equally unmintable.
      const fd = {};
      for (let i = 0; i < 7; i++) fd[dm(i + 3)] = { did: 1, dir: 'better', w: 1 };
      // W5.5: `opened` today on a week that starts in three days — legitimate, and still unmintable.
      put({ started: dm(3), opened: today, seen: [today], taps: 1, action: '', metric: '', sync: false, days: fd });
      let minted2 = null;
      proto.click = function () { minted2 = this.download; };
      const forged2 = document.createElement('button'); forged2.dataset.p1 = 'receipt-png';
      try { document.getElementById('p1-log').appendChild(forged2); forged2.click(); await new Promise(r => setTimeout(r, 900)); }
      finally { proto.click = realClick; forged2.remove(); }
      if (minted2) return `a week that has not started yet minted a card (${minted2}) — seven days nobody has lived`;
      localStorage.removeItem('rnawiki_track'); localStorage.removeItem('rnawiki_phase1');
      return null;
    },
  }, {
    // ---- W5 (2026-08-02): A LOG MAY ONLY ASSERT DAYS THAT ELAPSED, AND ONLY DATES THIS PAGE WROTE
    // Three more ways to print a week nobody lived, all measured hydrated at 390x844 on a real
    // profile, /protocol/cravings/glycemic-swings (qa/out/w5r_BEFORE_repro.json):
    //  (a) started:"not-a-date" — dayNum() is NaN and EVERY comparison against NaN is false, so
    //      `dayN < TRACK_DAYS` was false and the day-7 lock returned ok. Panel "Day NaN of 7", card
    //      "DID THE ONE THING ON 7 of the 7 days" built from ONE stored record (dayPlus returns
    //      'NaN-NaN-NaN' for all seven days), and a real file:
    //      rnawiki-7-day-log-cravings-glycemic-swings-NaN-NaN-NaN.png.
    //  (b) a restore file whose seven day keys were all in the future passed trackValidate, which
    //      checked the FORMAT of every key and never whether the day had happened. The panel then
    //      read "7 of 7 days tapped · did it on 7 · 7 better" under "Day 1 of 7", with chips 2-7
    //      carrying aria-label "Day N, not yet" AND class "did" in the same element.
    //  (c) the day-1 direction lock was `disabled` on three buttons and nothing else — the delegated
    //      handler asks only `if (!b || b.disabled) return;`. Stripping the attribute stored
    //      {"did":null,"dir":"better"} against day 1: a comparison of day 1 with itself.
    // Each of the three is checked at the layer that has to hold it — the write boundary, the file
    // boundary, and the read boundary — not at the layer that draws.
    // PROVE THIS GATE by reintroducing any one: revert the dir branch to
    // `e.dir = (e.dir === v) ? null : v`, or delete the isFuture clause from trackValidate, or drop
    // the TRACK_DAY_RE test from receiptReady and trackUsable. Each fails by name.
    // IT MUST STAY LAST in this array: it plants and then clears rnawiki_track, and it ends on a
    // log the panel deliberately refuses to draw.
    name: 'aLogMayOnlyAssertElapsedDaysAndDatesThisPageWrote',
    why: 'W5: a malformed start date, a future-dated restore file and a stripped `disabled` attribute each produced a week the reader had not lived — two of them on the shareable card',
    evaluate: async () => {
      const [, , pid, rcid] = location.pathname.split('/');
      const key = pid + '/' + rcid;
      const q = (n) => String(n).padStart(2, '0');
      const iso = (d) => `${d.getFullYear()}-${q(d.getMonth() + 1)}-${q(d.getDate())}`;
      const dm = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };
      const today = iso(new Date());
      const put = (log) => localStorage.setItem('rnawiki_track', JSON.stringify({ v: 1, logs: { [key]: log } }));
      const raw = () => (JSON.parse(localStorage.getItem('rnawiki_track') || 'null') || { logs: {} }).logs[key] || null;
      // Tapping a day chip is the only public way to force a redraw, and a future day's chip is
      // disabled — so take the first chip that is not.
      const redraw = async () => {
        const c = [...document.querySelectorAll('#p1-log [data-p1="day"]')].find((x) => !x.disabled);
        if (!c) return 'no enabled day chip to redraw from';
        c.click(); await new Promise(r => setTimeout(r, 60)); return null;
      };
      const sum = () => (document.querySelector('#p1-log .p1-log-sum') || {}).innerText || '';

      // ---- C. DAY 1 CANNOT RECEIVE A DIRECTION, AND `disabled` IS NOT WHAT STOPS IT ----
      put({ started: today, action: '', metric: '', sync: false, days: {} });
      const c0 = await redraw(); if (c0) return c0;
      const c1 = await redraw(); if (c1) return c1;
      const dirs = [...document.querySelectorAll('#p1-log button[data-p1="dir"]')];
      if (dirs.length !== 3) return `expected 3 direction controls on day 1, found ${dirs.length}`;
      if (!dirs.every((b) => b.disabled)) return 'the day-1 direction buttons are not even painted as off';
      const better = document.querySelector('#p1-log button[data-p1="dir"][data-v="better"]');
      better.removeAttribute('disabled'); better.disabled = false;
      better.click();
      await new Promise(r => setTimeout(r, 80));
      const recC = (raw() || { days: {} }).days[today];
      if (recC) return `stripping \`disabled\` recorded ${JSON.stringify(recC)} against day 1 — day 1 IS the comparison, so this is a comparison of day 1 with itself, and it reached the panel as "${sum()}"`;
      if (/1 of 7 days tapped/.test(sum())) return `the panel counted the day-1 direction anyway: "${sum()}"`;

      // ---- B. A DAY THAT HAS NOT HAPPENED IS NOT A TAP ----
      const fut = {};
      for (let i = 0; i < 7; i++) fut[dm(i)] = { did: 1, dir: 'better' };
      put({ started: today, action: '', metric: '', sync: false, days: fut });
      const b0 = await redraw(); if (b0) return b0;
      const b1 = await redraw(); if (b1) return b1;
      const day = (document.querySelector('#p1-log .p1-day') || {}).innerText || '';
      if (!/Day 1 of 7/.test(day)) return `expected "Day 1 of 7" for a week starting today, got "${day}"`;
      if (!/^1 of 7 days tapped/.test(sum())) return `the panel reads "${sum()}" on day 1 of a week whose six remaining days are all still in the future — only today can have been tapped`;
      const chips = [...document.querySelectorAll('#p1-log .p1-chip')];
      const lying = chips.filter((c) => /not yet/.test(c.getAttribute('aria-label') || '') && /\b(did|miss|unsaid)\b/.test(c.className));
      if (lying.length) return `${lying.length} day chip(s) announce "not yet" and render as tapped in the same element — e.g. "${lying[0].getAttribute('aria-label')}" with class "${lying[0].className}"`;
      const spark = (document.querySelector('#p1-log .p1-spark') || { getAttribute: () => '' }).getAttribute('aria-label') || '';
      if (/day [2-7] (did it|missed it)/.test(spark)) return `the sparkline's text equivalent announces a day that has not happened: "${spark}"`;

      // ---- B2. AND THE FILE BOUNDARY REFUSES IT, BY NAME, CHANGING NOTHING ----
      const before = localStorage.getItem('rnawiki_track');
      const bad = { v: 1, logs: { [key]: { started: today, action: '', metric: '', sync: false, days: { [dm(3)]: { did: 1, dir: 'better' } } } } };
      const inp = document.getElementById('p1-file');
      if (!inp) return 'no restore input — the file the export copy tells the reader to keep has nowhere to open';
      const dt = new DataTransfer();
      dt.items.add(new File([JSON.stringify(bad)], 'w5.json', { type: 'application/json' }));
      inp.files = dt.files;
      inp.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise(r => setTimeout(r, 400));
      const said = (document.getElementById('p1-sync-state') || {}).textContent || '';
      if (!/has not happened yet/i.test(said)) return `a file recording ${dm(3)} — three days from now — was not refused for that reason. The page said: "${said}"`;
      if (localStorage.getItem('rnawiki_track') !== before) return 'a refused restore changed the log on this device — "Nothing on this device was changed" is the contract';

      // ---- A. A START DATE THIS PAGE COULD NOT HAVE WRITTEN IS NOT A WEEK ----
      put({ started: 'not-a-date', action: '', metric: '', sync: false, days: { 'NaN-NaN-NaN': { did: 1, dir: 'better' } } });
      const a0 = await redraw(); if (a0) return a0;
      // POSITIVE test, and it has to be. The first version of this check asked only whether the
      // panel printed "NaN" — and it PASSED with the bug reintroduced, because the broken log made
      // phase1LogHTML() throw on an undefined selected day, the innerHTML assignment never ran, and
      // the panel simply kept the previous week on screen. "The bad string is absent" is satisfied
      // by a render that never happened. The state this page must reach is the pre-start panel: a
      // log whose start date is not a date is not a week, so the reader is offered Start.
      const pre = document.querySelector('#p1-log .p1-log-pre');
      const dayA = (document.querySelector('#p1-log .p1-day') || {}).innerText || '';
      if (!pre) return `a log started "not-a-date" did not render as "no log on this device" — the panel shows "${dayA || (document.querySelector('#p1-log') || {}).innerText.slice(0, 80)}". Either it counted days from a date this page could not have written, or the render threw and the previous week is still on screen.`;
      if (dayA) return `the panel counts days from a start date that is not a date: "${dayA}"`;
      if (document.getElementById('rcpt-card')) return 'a log whose start date is not a date produced a finished card';
      if (document.querySelector('#p1-log button[data-p1="receipt-png"]')) return 'the download control exists on a log whose start date is not a date';
      // Not paintable: the delegated handler makes an injected button a live route into
      // receiptDownload(). This is the forgery that wrote …-NaN-NaN-NaN.png to disk.
      const proto = HTMLAnchorElement.prototype, realClick = proto.click;
      let mintedA = null;
      proto.click = function () { mintedA = this.download; };
      const forgedA = document.createElement('button'); forgedA.dataset.p1 = 'receipt-png';
      try { document.getElementById('p1-log').appendChild(forgedA); forgedA.click(); await new Promise(r => setTimeout(r, 900)); }
      finally { proto.click = realClick; forgedA.remove(); }
      if (mintedA) return `a forged tap on a log started "not-a-date" minted ${mintedA} — seven days counted from one stored record, because dayPlus() returns the same NaN string for all seven`;
      // And the reader is not trapped: Start must replace an unreadable log, or the panel offers a
      // button that hands the same broken object straight back.
      const sb = document.getElementById('phase1-start');
      if (!sb) return 'no start button to recover with';
      if (sb.disabled) { sb.disabled = false; }
      sb.click();
      await new Promise(r => setTimeout(r, 150));
      const after = raw();
      if (!after || !/^\d{4}-\d{2}-\d{2}$/.test(after.started || '')) return `after tapping Start the log still reads started ${JSON.stringify(after && after.started)} — the reader cannot get out of a corrupted log`;
      localStorage.removeItem('rnawiki_track'); localStorage.removeItem('rnawiki_phase1');
      return null;
    },
  }],
  // W1 visible degradation (commit 587c056): when /api/rootcause-overlay fails, the protocol page
  // must SAY the community cause layer is missing instead of silently showing the built-in list.
  // Gated on the request having actually failed, so this assertion is a no-op — not a false
  // failure — on a machine that runs with a real DATABASE_URL.
  // W4: the $0 split, on the branch that HAS a Phase 1. Measured hydrated at 390x844 in the
  // DEFAULT DOM state on all 52 protocol routes before it: "Phase 1"/"Phase 2" 0/52, "$0" 1/52,
  // any hold-everything-constant instruction 0/52, and the page's own free single habit at
  // median y 17,687 px = 94% depth, 7,732 px BELOW the first supplement link, on 52/52.
  // Every value below is read from the SHIPPED DATA at assertion time, so re-selecting a Phase 1
  // cannot silently leave the page printing the old one.
  // Prove this gate by moving ${phase1Section(problem, rc)} below ${protocolLayers(...)} in
  // renderProtocol(), or by deleting the `open` state logic so Phase 2 renders open on a route
  // that has a Phase 1.
  // W4.5 (2026-08-02): THE CONSENT CONTROL MUST DESCRIBE THE REQUEST IT AUTHORISES.
  // MEASURED HYDRATED, real browser at 390x844 on this route before this gate existed
  // (out/w45_consent.json): opting into "anonymous sync" POSTed
  //   /api/experiments/start   {problemId, rootCauseId, voterKey, ref}
  //   /api/experiments/checkin {problemId, rootCauseId, voterKey}
  // while the panel in the same DOM read "Sends two things … nothing else" and "nothing links it
  // to you" — and `ref` is exactly the field that made server.js write
  // referrals(referrer, participant) and award the referrer 25 points.
  // The gate reads window.RNAWIKI_SYNC_MANIFEST (published by site/app.js) and checks BOTH
  // directions: no request may carry a key the manifest does not list, and both consent sentences
  // must name every key that is listed. It also asserts the two claims with the most at stake:
  // nothing goes out before the opt-in, and the logger never touches /api/experiments/outcome,
  // the endpoint that feeds the public aggregate ledger.
  // IT PLANTS rnawiki_ref ITSELF. That key is only ever set by arriving through a ?ref= link, and
  // nothing on the site produces one — so without the plant the offending branch is an empty set,
  // and a gate over an empty set always passes (the W4 lesson).
  // window.fetch is stubbed for /api/experiments/* so the bodies can be read without a database
  // and without emitting a POST failure that is not in ALLOWED_REQUEST_FAILURES; it is restored in
  // a finally block.
  // PROVE IT by putting `ref: localStorage.getItem('rnawiki_ref') || undefined` back into
  // api.startExperiment, or by deleting "which protocol this is" from either consent sentence.
  '/protocol/insomnia/circadian-misalign': [{
    name: 'syncSendsExactlyWhatTheConsentCopySays',
    why: 'W4.5: the one control whose entire purpose is to state what is shared. It named two fields and sent four, and the field it omitted is the one that links this browser to another account',
    evaluate: async () => {
      const M = window.RNAWIKI_SYNC_MANIFEST;
      if (!Array.isArray(M) || !M.length) return 'site/app.js publishes no window.RNAWIKI_SYNC_MANIFEST — the consent copy and the request body no longer share one source of truth';
      localStorage.setItem('rnawiki_ref', 'u:plantedreferrer');
      const seen = [];
      const realFetch = window.fetch;
      window.fetch = (u, o) => {
        const url = String(u && u.url ? u.url : u);
        if (/\/api\/experiments\//.test(url)) {
          seen.push({ url, body: (o && o.body) || null });
          return Promise.resolve(new Response('{"ok":true,"streak":1,"checkedToday":true}', { status: 200, headers: { 'content-type': 'application/json' } }));
        }
        return realFetch(u, o);
      };
      try {
        const start = document.getElementById('phase1-start');
        if (!start) return 'no #phase1-start — the logger cannot be reached, so its consent control cannot be checked';
        start.click(); await new Promise(r => setTimeout(r, 60));
        const did = document.querySelector('#p1-log button[data-p1="did"][data-v="1"]');
        if (!did) return 'no day tap target inside #p1-log';
        did.click(); await new Promise(r => setTimeout(r, 200));
        if (seen.length) return `${seen.length} request(s) left the device with sync OFF, which the panel calls "Nothing about this log has left this device"`;
        const note = () => (document.querySelector('.p1-sync .p1-log-note') || {}).innerText || '';
        const copyOff = note();
        const btn = document.querySelector('.p1-sync-btn');
        if (!btn) return 'no anonymous-sync control';
        btn.click();
        await new Promise(r => setTimeout(r, 600));
        const copyOn = note();
        if (!seen.length) return 'opting in sent nothing at all — the control says it syncs';
        const allowed = M.map((x) => x.field);
        for (const s of seen) {
          const path = s.url.replace(location.origin, '');
          if (/\/api\/experiments\/outcome/.test(path)) return 'the logger POSTed /api/experiments/outcome — that endpoint feeds the public aggregate ledger and the copy says the direction is never sent';
          let keys = [];
          try { keys = Object.keys(JSON.parse(s.body || '{}')); } catch (e) { return `a sync request body is not JSON: ${String(s.body).slice(0, 80)}`; }
          const extra = keys.filter((k) => allowed.indexOf(k) < 0);
          if (extra.length) return `${path} carries ${JSON.stringify(extra)} — a field the consent copy does not name. \`ref\` makes server.js write referrals(referrer,participant) and award the referrer, under copy that says nothing links it to you`;
          const missing = allowed.filter((k) => keys.indexOf(k) < 0);
          if (missing.length) return `${path} does not carry ${JSON.stringify(missing)}, which the consent copy says is sent`;
        }
        for (const f of M) {
          if (copyOn.indexOf(f.plain) < 0) return `the sync-ON copy never says "${f.plain}", but \`${f.field}\` is on the wire`;
          if (copyOff.indexOf(f.plain) < 0) return `the sync-OFF copy never says "${f.plain}", so a reader deciding whether to turn it on is not told \`${f.field}\` is sent`;
        }
        return null;
      } finally { window.fetch = realFetch; localStorage.removeItem('rnawiki_ref'); }
    },
  }],
  '/protocol/hair-loss/dht-sensitivity': [{
    name: 'phase1SaysSoWhenThereIsNoFreeStep',
    why: 'W4: 8 of 52 root causes have no $0 first step. They must say so, not invent one — and their Phase 2 must not be hidden behind a step the reader cannot take',
    evaluate: () => {
      const [, , pid, rcid] = location.pathname.split('/');
      const p = window.RNAWIKI_DATA.graph.problems.find(x => x.id === pid);
      const rc = p.root_causes.find(x => x.id === rcid);
      const app = document.querySelector('#app');
      if (rc.phase1) return 'this root cause now carries a Phase 1 — pick a different smoke route for the no-free-step branch';
      if (!rc.phase1None) return 'no rc.phase1None — build/parse.js should have refused to build';
      const sec = app.querySelector('#phase-1');
      if (!sec) return 'no #phase-1 section';
      if (!sec.hasAttribute('data-phase1-none')) return 'the section does not declare that there is no $0 version of this protocol';
      if (app.querySelectorAll('.p1-action').length !== 1) return `${app.querySelectorAll('.p1-action').length} .p1-action elements — expected exactly 1`;
      if ((sec.textContent || '').indexOf(rc.phase1None) < 0) return 'the authored reason is not printed, so the page states a bare refusal';
      const d = app.querySelector('#phase-2');
      if (!d) return 'no #phase-2 container';
      if (!d.open) return 'Phase 2 is COLLAPSED on a route with no Phase 1 — the only thing this page has is hidden behind a step the reader cannot take';
      return null;
    },
  }],
  '/protocol/knee-pain/patellofemoral-pain': [{
    name: 'phase1IsOneFreeThingAndComesFirst',
    why: 'W4: the free first step must be one thing, cost nothing, be quoted from the page own plan, come before the stack, and keep Phase 2 collapsed until it is started or skipped',
    evaluate: () => {
      const [, , pid, rcid] = location.pathname.split('/');
      const p = window.RNAWIKI_DATA.graph.problems.find(x => x.id === pid);
      const rc = p.root_causes.find(x => x.id === rcid);
      const app = document.querySelector('#app');
      if (!rc.phase1) return 'this root cause carries no Phase 1 — build/parse.js should have refused to build, or pick a different smoke route';
      const sec = app.querySelector('#phase-1');
      if (!sec) return 'no #phase-1 section — nothing on the page names a first step that costs nothing';
      const acts = app.querySelectorAll('.p1-action');
      if (acts.length !== 1) return `${acts.length} .p1-action elements — Phase 1 is ONE intervention, not a list`;
      if (sec.getAttribute('data-phase1-action') !== rc.phase1.action)
        return `the action on the page is not the one the build selected (${JSON.stringify(sec.getAttribute('data-phase1-action'))} vs ${JSON.stringify(rc.phase1.action)})`;
      if (acts[0].textContent.trim() !== rc.phase1.action) return 'the printed action is not the selected action';
      if (sec.getAttribute('data-phase1-cost') !== 'none') return 'Phase 1 does not declare that it costs nothing';
      const txt = (sec.textContent || '').replace(/\s+/g, ' ');
      if (txt.indexOf(rc.phase1.quote) < 0) return 'the authored sentence the action was condensed from is not printed';
      if (!/one variable at a time/i.test(txt)) return 'Phase 1 never tells the reader to hold everything else constant, so the 7 days measure nothing';
      // the metric is the W2 structure REUSED, not a second one authored here
      const m = (p.safety || {}).metric;
      if (!m || txt.indexOf(m) < 0) return 'Phase 1 does not name the same tracked metric the safety card promotes';
      if (app.querySelectorAll('[data-primary-metric]').length !== 1) return 'more than one primary metric on the page';
      // ORDER, in DOM terms: free before paid.
      const order = [...app.querySelectorAll('*')];
      const stack = app.querySelector('#p-stack');
      if (!stack) return 'no #p-stack';
      if (order.indexOf(sec) > order.indexOf(stack)) return 'Phase 1 comes AFTER the supplement stack — the free step must precede the paid one';
      const firstRec = Math.min(
        order.indexOf(app.querySelector('.fix-kind.fk-compound')) >>> 0,
        order.indexOf(app.querySelector('.adopt-plan')) >>> 0,
        order.indexOf(stack) >>> 0);
      if (order.indexOf(sec) > firstRec) return 'Phase 1 comes after the first supplement recommendation on the page';
      // Phase 2 collapsed on a fresh (anonymous, no-localStorage) visit
      const d = app.querySelector('#phase-2');
      if (!d) return 'no #phase-2 container — the stack must be behind an optional second phase';
      if (d.open) return 'Phase 2 is OPEN on a first visit — the split does nothing if the paid half is already unrolled';
      return null;
    },
  }, {
    // W4 · LOOP B (2026-08-02). build/prerender.js gates the crawler's copy on all 52 routes; this
    // gates the READER's, because the two documents saying different things is the defect class
    // (D2/D33) this branch has already fixed four times. The offer is one person's, so it must
    // read as one person's, must state that it is not from a clinician, and must be visible
    // WITHOUT opening the Phase 2 drawer — the reader it is aimed at already takes a stack.
    // PROVE THIS GATE by deleting ${stackAuditCallout()} from renderProtocol(), by moving it
    // inside protocolLayers()' <details>, or by dropping the "not a clinician" sentence.
    name: 'loopBStackAuditIsOnePersonAndSaysItsScope',
    why: 'W4: an open offer to go through a stranger\'s supplements must be visible, must be in one person\'s voice, and must state in the same breath that it is not a clinician and not medical advice',
    evaluate: () => {
      const app = document.getElementById('app');
      const el = app.querySelector('.stack-audit');
      if (!el) return 'no stack-audit callout in the hydrated document — the crawler gets one and the reader does not';
      const t = (el.innerText || '').replace(/\s+/g, ' ');
      if (!/supplement stack right now/i.test(t)) return `the callout does not open with the question it exists to ask — "${t.slice(0, 70)}…"`;
      if (!/not a clinician/i.test(t)) return 'the callout never says it is not from a clinician';
      if (!/not medical advice/i.test(t)) return 'the callout never says it is not medical advice';
      if (/\b(we|our|us)\b/i.test(t)) return `the callout speaks as an organisation — "${(t.match(/.{0,40}\b(we|our|us)\b.{0,40}/i) || [''])[0]}". There is one person here`;
      if (/\b(verified|certified|qualified|licensed|registered)\b/i.test(t)) return 'the callout implies a credential that does not exist';
      const a = el.querySelector('a.sa-x');
      if (!a) return 'the callout makes an offer on X and gives no way to reach it';
      const h = (((window.RNAWIKI_DATA.site || {}).x) || {}).handle;
      if (!h) return 'no handle in data.site';
      if (a.getAttribute('href') !== 'https://x.com/' + h) return `the callout links to "${a.getAttribute('href')}" instead of the configured profile for @${h}`;
      const r = a.getBoundingClientRect();
      if (r.height < 44) return `the callout link is ${Math.round(r.height)}px tall — under 44 (D25)`;
      // visible without opening Phase 2
      const d2 = app.querySelector('#phase-2');
      if (d2 && d2.contains(el)) return 'the callout is inside the collapsed Phase 2 drawer, so the reader who already takes a stack never sees it';
      if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') return 'the callout is not rendered';
      return null;
    },
  }, {
    name: 'rcOverlayNotice',
    onlyIfRequestFailed: /^\/api\/rootcause-overlay$/,
    selector: '#p-causes [data-api-absent="rootcause-overlay"]',
    why: 'D42: the root-cause overlay 503s and nothing on the page tells the reader',
  }, {
    // D2: hydration used to DELETE safety content the crawler receives. Measured hydrated at
    // 390x844 with every <details> expanded, on all 52 protocol routes, before the fix:
    // "Move —" 0/52 · "Fuel —" 0/52 · "Stack —" 0/52 · "Daily nutrient targets" 0/52 ·
    // "call your local emergency number" 2/52 · "995" 0/52 — against 52/52 for each in the
    // prerendered document, while the hydrated footer still claimed "Nutrient targets are general
    // adult guidance with a stated reason". Every number below is read from the SHIPPED DATA at
    // assertion time, so re-authoring a root cause cannot silently drop a target from the page.
    // Prove this gate by deleting `${protocolLayers(problem, rc, P)}` from renderProtocol(), or by
    // deleting the .esc-note <p> from planSection() — each failure names itself.
    name: 'hydratedProtocolKeepsWhatTheCrawlerGets',
    why: 'D2: Move/Fuel/Stack, every authored nutrient target, and the emergency-number escalation must survive hydration',
    evaluate: () => {
      const [, , pid, rcid] = location.pathname.split('/');
      const p = window.RNAWIKI_DATA.graph.problems.find(x => x.id === pid);
      const rc = p.root_causes.find(x => x.id === rcid);
      const app = document.querySelector('#app');
      const txt = (app.textContent || '').replace(/\s+/g, ' ');
      for (const [id, word] of [['p-move', 'Move —'], ['p-fuel', 'Fuel —'], ['p-stack', 'Stack —']]) {
        if (!document.getElementById(id)) return `no #${id} section`;
        if (txt.indexOf(word) < 0) return `#${id} exists but the page never says "${word}"`;
      }
      // every authored nutrient target, with its number and unit
      const tg = Object.entries(rc.nutrient_targets || {});
      if (!tg.length) return 'this root cause authors no nutrient target — pick a different smoke route';
      if (txt.indexOf('Daily nutrient targets') < 0) return 'no "Daily nutrient targets" block';
      const missing = tg.filter(([, t]) => txt.indexOf(String(t.target) + (t.unit || '')) < 0);
      if (missing.length) return `${missing.length} of ${tg.length} nutrient targets are not printed`;
      // the escalation path, and every number in it
      const re = document.querySelector('.plan-reassess .esc-note');
      if (!re) return 'no escalation note inside the red-flag card';
      const nums = ['999', '911', '112', '995', '000'].filter(x => re.textContent.indexOf(x) < 0);
      if (nums.length) return `the escalation note omits ${nums.join(', ')}`;
      // red flags before the first supplement — a stack recommendation must never outrank them.
      // W4 (2026-08-02): this compared getBoundingClientRect().top. #p-stack is about to live
      // inside <details id="phase-2">, closed by default, so the y-comparison was expected to
      // read y(card) === 0 and invert on every protocol route.
      // The predicted inversion DOES NOT HAPPEN — measured, not assumed. The element this
      // assertion actually reads, #p-stack .st-card, keeps a real rect inside the closed
      // <details> (top 18,152 px, height 227 px, display block, contentVisibility "visible"), so
      // the old predicate fired on 0/2 smoke routes.
      // BUT GEOMETRY IN THERE IS NOT TRUSTWORTHY, and that IS measured
      // (out/w4int_after_geom.json, hydrated 390x844, 52/52, reproduced 4/4 on one route):
      // #p-stack ITSELF returns a ZERO rect while its own descendant .st-card returns 18,152 px
      // IN THE SAME evaluate. Any collapsed subtree can report either. So the geometry form of
      // this assertion was one selector change away from silently comparing against zero.
      // DOM order is what "above" means here and it does not depend on a UA's current choice
      // about laying out collapsed content.
      const order = [...app.querySelectorAll('*')];
      const card = document.querySelector('#p-stack .st-card');
      if (card && order.indexOf(document.querySelector('.plan-reassess')) > order.indexOf(card))
        return 'the first supplement card sits ABOVE the red-flag block';
      // the Stack is what the regulator calls a supplement/OTC, never a prescription medicine
      const rx = document.querySelectorAll('#p-stack .st-card.rx').length;
      if (rx) return `${rx} prescription/controlled compound(s) rendered inside the Stack`;
      // the tab must name the root cause, not just the problem
      const short = rc.name.replace(/\s*\([^)]*\)/, '').toLowerCase();
      if (document.title.toLowerCase().indexOf(short.slice(0, 24)) < 0)
        return `document.title ${JSON.stringify(document.title)} does not name the root cause`;
      return null;
    },
  }, {
    // W2 safety structure. Measured hydrated at 390x844 in the DEFAULT DOM state on all 52 protocol
    // routes before this: a labelled stop-rule element 0/52, a named tracking metric 0/52, and the
    // 🚩 card BELOW the page's first supplement recommendation on 52/52 (median y 11,023 px against
    // 8,914 px, on an 18,430 px page). Note WHICH recommendation comes first: not the Stack, but the
    // "💊 Supplement" fix line inside the open cause accordion — the assertion above compares
    // against #p-stack and so cannot see that, which is why this one exists.
    // Both structures are promoted from the page's own authored plan by data/protocol_safety.json
    // and gated in build/parse.js; this checks they survived hydration and stayed in front.
    // Prove this gate by moving ${safetyFirstSection(problem)} back below
    // ${causesSection(...)} in renderProtocol(), or by deleting either data attribute.
    name: 'safetyStructureLeadsTheProtocol',
    why: 'W2: the red flags, the one tracked metric and the stop rule must come before the first thing the page recommends',
    evaluate: () => {
      const [, , pid] = location.pathname.split('/');
      const p = window.RNAWIKI_DATA.graph.problems.find(x => x.id === pid);
      const app = document.querySelector('#app');
      const s = p.safety;
      if (!s) return `problem ${pid} carries no promoted safety structure — build/parse.js should have refused to build`;
      const metric = app.querySelector('[data-primary-metric]');
      const stop = app.querySelector('[data-stop-rule]');
      if (!metric) return 'no [data-primary-metric] element — nothing names the one thing this protocol is judged by';
      if (!stop) return 'no [data-stop-rule] element — nothing states the point at which the answer is to stop';
      if (metric.getAttribute('data-primary-metric') !== s.metric)
        return `the metric on the page is not the one the build promoted (${JSON.stringify(metric.getAttribute('data-primary-metric'))} vs ${JSON.stringify(s.metric)})`;
      // W2.5: the attribute is the stop rule's OWN horizon, not a timeline rung. It used to be
      // `checkpoint`, which is the last timeline `when` on 41 of 41 problems and agreed with the
      // rule only by luck — /protocol/skin-aging/* headed "MONTHS 6–12" over "after 12 weeks".
      // Assert both that the attribute matches the build AND that the visible header prints it,
      // so a renderer that keeps the attribute and drops the text cannot pass.
      if (stop.getAttribute('data-horizon') !== (s.stopHorizon || ''))
        return `the stop rule names horizon ${JSON.stringify(stop.getAttribute('data-horizon'))}, the build promoted ${JSON.stringify(s.stopHorizon)}`;
      if (s.stopHorizon && stop.textContent.indexOf('The stop rule · ' + s.stopHorizon) < 0)
        return `the stop rule's header does not print the horizon its own rule names (${JSON.stringify(s.stopHorizon)})`;
      if (s.stopHorizon && s.stopIssue.indexOf(s.stopHorizon) < 0)
        return `the horizon on the page (${JSON.stringify(s.stopHorizon)}) is not named by the rule it heads (${JSON.stringify(s.stopIssue)})`;
      const txt = (app.textContent || '').replace(/\s+/g, ' ');
      if (txt.indexOf(s.metricSource.replace(/\*/g, '')) < 0)
        return 'the metric label is printed without the authored sentence it was promoted from';
      // ORDER is the assertion. The first recommendation on the page is the earliest of: a
      // "Supplement" fix line in the cause accordion, the "add the supplements" button, or the Stack.
      const idx = el => (el ? [...app.querySelectorAll('*')].indexOf(el) : Infinity);
      const red = app.querySelector('.plan-reassess');
      if (!red) return 'no red-flag block';
      const firstRec = Math.min(idx(app.querySelector('.fix-kind.fk-compound')), idx(app.querySelector('.adopt-plan')), idx(document.getElementById('p-stack')));
      if (firstRec === Infinity) return 'no supplement recommendation found on the page — pick a different smoke route';
      const worst = Math.max(idx(red), idx(metric), idx(stop));
      if (worst > firstRec) return 'the safety structure comes AFTER the first supplement recommendation — this is the defect';
      return null;
    },
  }],
};

// ---------------------------------------------------------------- helpers
const bold = s => (process.stdout.isTTY ? `\x1b[1m${s}\x1b[0m` : s);
const fail = [];

function freePort() {
  return new Promise((res, rej) => {
    const s = net.createServer();
    s.once('error', rej);
    s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); });
  });
}

function get(url) {
  return new Promise(res => {
    const r = http.get(url, x => { x.resume(); res(x.statusCode); });
    r.on('error', () => res(0));
    r.setTimeout(2000, () => { r.destroy(); res(0); });
  });
}

async function waitForServer(base, child, ms = 40000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (child.exitCode !== null) throw new Error(`server exited early with code ${child.exitCode}`);
    if (await get(base + '/') === 200) return;
    await new Promise(r => setTimeout(r, 250));
  }
  throw new Error(`server did not answer 200 on ${base}/ within ${ms}ms`);
}

async function loadPuppeteer() {
  try { return (await import('puppeteer-core')).default; }
  catch {
    console.error('\n✖ smoke: puppeteer-core is not installed.\n'
      + '  npm i --no-save puppeteer-core\n'
      + '  (--no-save on purpose: this must not enter package.json or package-lock.json,\n'
      + '   because the Railway build runs npm ci against that lockfile.)\n');
    process.exit(1);
  }
}

function chromePath() {
  if (process.env.CHROME) return process.env.CHROME;
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ];
  const hit = candidates.find(p => { try { return fs.statSync(p).isFile(); } catch { return false; } });
  if (!hit) {
    console.error('\n✖ smoke: no Chrome found. Set CHROME=/path/to/chrome.\n  tried:\n   ' + candidates.join('\n   ') + '\n');
    process.exit(1);
  }
  return hit;
}

// ---------------------------------------------------------------- main
const port = await freePort();
const BASE = `http://127.0.0.1:${port}`;
const env = { ...process.env, PORT: String(port), NODE_ENV: 'test' };
// Deterministic run mode: the gate must behave the same on a laptop with a local Postgres and on a
// clean checkout. SMOKE_DATABASE_URL is the deliberate opt-in for exercising the write backend.
if (process.env.SMOKE_DATABASE_URL) env.DATABASE_URL = process.env.SMOKE_DATABASE_URL;
else delete env.DATABASE_URL;

console.log(bold(`\n▸ smoke: booting server.js on :${port} (${env.DATABASE_URL ? 'DB on' : 'read-only, no DB'})`));
const child = spawn(process.execPath, ['server.js'], { cwd: ROOT, env, stdio: ['ignore', 'pipe', 'pipe'] });
const serverLog = [];
child.stdout.on('data', d => serverLog.push(String(d)));
child.stderr.on('data', d => serverLog.push(String(d)));

let browser;
try {
  await waitForServer(BASE, child);
  const puppeteer = await loadPuppeteer();
  browser = await puppeteer.launch({
    executablePath: chromePath(),
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  const rows = [];
  for (const [cls, route] of ROUTES) {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

    const consoleErrors = [];
    const pageErrors = [];
    const badRequests = [];   // {status, path}
    const netFailures = [];   // DNS/abort/etc
    // SAME-ORIGIN ONLY. Muscle pages embed a Sketchfab iframe (which in turn calls sentry.io);
    // in a headless sandbox those cross-origin requests abort non-deterministically. Gating on
    // them would make this gate flaky, and a flaky gate gets switched off. Third-party embeds are
    // out of scope; everything RNAwiki serves is in scope.
    const ours = u => u.startsWith(BASE);
    page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    page.on('pageerror', e => pageErrors.push(String(e).slice(0, 300)));
    page.on('requestfailed', q => { if (ours(q.url())) netFailures.push(`${q.method()} ${q.url()} ${(q.failure() || {}).errorText || ''}`); });
    page.on('response', r => {
      if (r.status() >= 400 && ours(r.url())) {
        let p = r.url();
        try { p = new URL(r.url()).pathname; } catch { }
        badRequests.push({ status: r.status(), path: p, url: r.url() });
      }
    });

    // Unhandled promise rejections are NOT reported as pageerror by CDP, and this codebase is full
    // of un-awaited async calls (route() fires renderProtocol/renderPlan/mountBody and never catches).
    // Collect them in-page and read them back with the DOM measurement.
    await page.evaluateOnNewDocument(() => {
      window.__smokeRejections = [];
      window.addEventListener('unhandledrejection', e => {
        const r = e.reason;
        window.__smokeRejections.push(String((r && (r.stack || r.message)) || r).slice(0, 300));
      });
    });

    let status = 0, dom = null, navErr = null;
    try {
      const resp = await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: NAV_TIMEOUT });
      status = resp ? resp.status() : 0;
      await new Promise(r => setTimeout(r, SETTLE_MS));
      dom = await page.evaluate(() => {
        const h1s = [...document.querySelectorAll('h1')];
        return {
          h1Count: h1s.length,
          h1: (h1s[0]?.textContent || '').trim().slice(0, 120),
          lang: document.documentElement.lang,
          skipLink: !!document.querySelector('a[href="#main"], a[href="#app"]'),
          announcer: document.querySelectorAll('[role="status"][aria-live="polite"]').length,
          inlineOnclick: document.querySelectorAll('[onclick]').length,
          appChildren: (document.getElementById('app')?.children.length) || 0,
          // W5c (2026-08-02): this whole gate already runs at 390x844, so it can see the one
          // defect class no build check can: a page wider than the phone it is being read on.
          // Measured hydrated over all 568 published routes before the fix
          // (qa/out/w5cdi/before-390.json), exactly three overflowed, each for a different reason:
          //   /target/MTHFR                        403px — h1 "methylenetetrahydrofolate reductase"
          //   /c/statins-atorvastatin-rosuvastatin 417px — h1 "Statins (Atorvastatin/Rosuvastatin)"
          //   /compare                             454px — the picker's `1fr 1fr` grid floored at
          //                                        the min-content of a nowrap approval pill
          // The first two are now covered by `overflow-wrap:anywhere` on headings and the third by
          // `minmax(0,1fr)`, but the next long compound name would have reopened it silently.
          // `widest` names the element so the failure is actionable rather than a number.
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          // W6 (2026-08-08): AND IN EVERY CHAPTER, NOT JUST THE ONE THAT HAPPENS TO BE OPEN.
          // The measurement directly above is of the DEFAULT DOM state. On a compound page that is
          // chapter 0 of 7 — the other six are `.chapter{display:none}` and contribute nothing to
          // scrollWidth. So a gate that has passed on all 568 routes since 2026-08-02 was, on the
          // 171 compound pages, only ever looking at one seventh of the page.
          // MEASURED hydrated at 390x844 over all 171 /c/* routes with each chapter activated in
          // turn (qa/x_overflow.mjs), while this gate was green: 33 routes scrolled sideways —
          // 25 in "🛡️ Using it safely" and 8 in "🎯 Dial it in" — worst 106px, the offending
          // element a DIV.bio-card on 33 of 33.
          // PROVE IT by deleting `min-width:0` from .bio-card in site/styles.css: this reports
          // /c/andarine-s4-yk-11-s-23 and the rest by name, chapter and pixel count.
          chapterOverflow: (() => {
            const chs = [...document.querySelectorAll('.chapter')];
            if (chs.length < 2) return null;
            const open = chs.findIndex((c) => c.classList.contains('active'));
            const vw = document.documentElement.clientWidth;
            let worst = null;
            for (let i = 0; i < chs.length; i++) {
              chs.forEach((x, j) => { x.classList.toggle('active', i === j); x.style.animation = 'none'; });
              const px = Math.round(document.documentElement.scrollWidth - vw);
              if (px > 1 && (!worst || px > worst.px)) {
                let el = null;
                chs[i].querySelectorAll('*').forEach((e) => {
                  const r = e.getBoundingClientRect();
                  if (r.width > 0 && r.height > 0 && r.right > vw + 1 && (!el || r.right > el.right)) {
                    el = { right: Math.round(r.right), tag: e.tagName, cls: String(e.className || '').slice(0, 40) };
                  }
                });
                worst = { px, i, name: ((chs[i].querySelector('h2,h3') || {}).textContent || '').trim().slice(0, 44), el };
              }
            }
            // Leave the page exactly as it was found — later checks in this same evaluate() read it.
            chs.forEach((x, j) => { x.classList.toggle('active', j === (open < 0 ? 0 : open)); x.style.animation = ''; });
            return worst;
          })(),
          // W5c (2026-08-02): the persistent header is on all 568 routes, so a control too small
          // to tap there is a defect 568 times over. Measured hydrated at 390x844 before the fix
          // (qa/out/w5cdi/before-390.json): search input 104x37, "Sign in" 71x30, hamburger 32x29,
          // brand 97x29 — all four under the 44px touch minimum, and the search box so narrow that
          // its placeholder rendered as the words "Search 1" out of "Search 171 compounds,
          // protocols, terms…". `searchClipped` catches that second half: a control can be 44px
          // tall and still be too narrow to say what it is for.
          // W5c (2026-08-02): the SPA moves focus to the new <h1> after every route change, which
          // is correct — and it was doing it on PAGE LOAD too, which is not the same act. Measured
          // hydrated before the fix, on arrival at any route with no interaction of any kind: the
          // <h1> was document.activeElement, matched :focus-visible, and Chrome painted
          // `outline:2px solid rgb(13,148,136)` around the title (visible in every W0 screenshot).
          // The ring is the smaller half. The larger one is that the browser had already placed
          // focus at the top of the document, so moving it into the content skipped the skip link
          // and the entire header — the first Tab landed in the middle of the page.
          h1FocusedOnLoad: document.activeElement === document.querySelector('#app h1'),
          header: (() => {
            const g = (sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; };
            const inp = document.getElementById('search');
            return { search: g('#search'), acct: g('.acct-btn'), menu: g('#menu-btn'), brand: g('.brand'),
              searchClipped: inp ? inp.scrollWidth > inp.clientWidth + 1 : null };
          })(),
          widest: (() => {
            const vw = document.documentElement.clientWidth;
            let worst = null;
            document.querySelectorAll('#app *, header *, footer *').forEach((el) => {
              const s = getComputedStyle(el);
              if (s.position === 'fixed') return;
              const r = el.getBoundingClientRect();
              if (r.width > 0 && r.right > vw + 1 && (!worst || r.right > worst.right)) {
                worst = { right: Math.round(r.right), tag: el.tagName, cls: String(el.className || '').slice(0, 40), txt: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 50) };
              }
            });
            return worst;
          })(),
          rejections: (window.__smokeRejections || []).slice(0, 10),
          // W5b: the head, read AFTER hydration has finished with it.
          title: document.title,
          desc: document.querySelector('meta[name="description"]')?.content ?? null,
          ogTitle: document.querySelector('meta[property="og:title"]')?.content ?? null,
          ogDesc: document.querySelector('meta[property="og:description"]')?.content ?? null,
        };
      });
    } catch (e) { navErr = String(e).slice(0, 200); }

    const add = msg => fail.push(`${route}  ${msg}`);

    if (navErr) add(`navigation failed — ${navErr}`);
    if (status !== 200) add(`main document returned ${status} (expected 200)`);
    pageErrors.forEach(e => add(`UNCAUGHT JS EXCEPTION — ${e}`));
    (dom?.rejections || []).forEach(r => add(`UNHANDLED PROMISE REJECTION — ${r}`));

    // failed subresources
    const allowedFailures = [];
    for (const b of badRequests) {
      if (b.path === route && b.status === status) continue; // already reported as the main document
      const hit = ALLOWED_REQUEST_FAILURES.find(a => a.status === b.status && a.path.test(b.path));
      if (hit) allowedFailures.push(b);
      else add(`UNDOCUMENTED FAILED REQUEST — ${b.status} ${b.path}  (add it to ALLOWED_REQUEST_FAILURES with a reason, or fix it)`);
    }
    netFailures.forEach(f => add(`REQUEST DID NOT COMPLETE — ${f}`));

    // console errors
    let budget = allowedFailures.length;
    for (const c of consoleErrors) {
      const hit = CONSOLE_ALLOWLIST.find(a => a.re.test(c));
      if (!hit) { add(`CONSOLE ERROR (not allowlisted) — ${c.slice(0, 200)}`); continue; }
      if (hit.budgeted) {
        if (budget > 0) budget--;
        else add(`CONSOLE ERROR beyond the allowlisted-failure budget — ${c.slice(0, 160)}`);
      }
    }

    // structural invariants (W0: held on 564/564 — do not regress)
    if (dom) {
      if (dom.h1Count !== 1) add(`expected exactly one <h1>, found ${dom.h1Count}`);
      if (!dom.h1) add('page has no <h1> text');
      if (dom.h1 === 'Not found') add('hydrates to notFound() — the SPA has no renderer for this route');
      if (dom.lang !== 'en') add(`documentElement.lang = "${dom.lang}" (expected "en")`);
      if (!dom.skipLink) add('skip link is gone');
      if (dom.announcer < 1) add('role="status" aria-live="polite" route announcer is gone');
      if (dom.inlineOnclick) add(`${dom.inlineOnclick} inline onclick handler(s) — the site is CSP-clean, keep it that way`);
      if (dom.appChildren === 0) add('#app is empty after hydration');
      // W5c: nothing may push the document wider than the viewport it is being read on. A page
      // that scrolls sideways on a phone hides content behind a gesture nobody is told to make.
      // PROVE IT by removing `overflow-wrap:anywhere` from the h1,h2,h3,h4 rule in styles.css —
      // /target/MTHFR and /c/statins-atorvastatin-rosuvastatin fail by name.
      // W5c: focus belongs where the browser put it until the reader moves it.
      // PROVE IT by removing the `!_firstRender` guard from the h1.focus() call in site/app.js.
      if (dom.h1FocusedOnLoad) fail.push(`${route}  the <h1> is focused on page LOAD — that paints a focus ring nobody asked for and skips the reader past the skip link and the whole header; focus after an in-app navigation is correct and is a different thing`);
      // W5c: every persistent header control must be tappable, on every route.
      // PROVE IT by removing `min-height:44px` from the #search rule in site/styles.css.
      if (dom.header) {
        Object.entries(dom.header).forEach(([k, v]) => {
          if (!v || typeof v !== 'object') return;
          if (v.h < 44) fail.push(`${route}  header control "${k}" is ${v.w}x${v.h} px — under the 44px touch minimum, on a control that is on every one of the 568 routes`);
        });
        if (dom.header.searchClipped) fail.push(`${route}  the header search box is too narrow for its own placeholder — it renders as a truncated fragment, which reads as a broken string rather than a prompt`);
      }
      if (dom.scrollWidth > dom.clientWidth + 1) {
        const w = dom.widest;
        add(`the page is ${dom.scrollWidth}px wide in a ${dom.clientWidth}px viewport — it scrolls sideways on a phone${w ? `; widest element is <${w.tag.toLowerCase()}${w.cls ? ' class="' + w.cls + '"' : ''}> ending at ${w.right}px: "${w.txt}"` : ''}`);
      }
      // W6 (2026-08-08): the same rule, applied to the six sevenths of a compound page the check
      // above cannot see. See the note on `chapterOverflow` for the 33 routes it was missing.
      if (dom.chapterOverflow) {
        const c = dom.chapterOverflow, e = c.el;
        add(`chapter ${c.i} ("${c.name}") scrolls sideways by ${c.px}px in a ${dom.clientWidth}px viewport — the reader cannot see it until they open that chapter, so the default-state check above passes${e ? `; widest element is <${e.tag.toLowerCase()}${e.cls ? ' class="' + e.cls + '"' : ''}> ending at ${e.right}px` : ''}`);
      }
    }

    // ---- W5b (2026-08-02): THE HEAD MUST SURVIVE HYDRATION ------------------------------------
    // This is the only check on the project that sees BOTH documents' <head> on the same URL, and
    // it is the one that would have caught D7/D8. Measured before it existed, headless Chrome at
    // 1280x900 with a 900 ms settle, over all 620 served routes, 0 non-200 and 0 pageerrors:
    //   · 135 routes finished hydration with document.title === "RNAwiki — translate the code of
    //     human performance into real results" and 151 with the homepage description, on pages
    //     whose prerendered <title> was correct on 620 of 620. /az served "All 171 compounds A–Z"
    //     to a crawler and the site slogan to a reader.
    //   · title === prerendered title on 127/620, description on 69/620.
    //   · title !== og:title IN THE SAME HYDRATED DOCUMENT on 493/620 — /target/AR carried three
    //     different strings at once.
    // build/prerender.js assertHeadParity() proves the map is complete and app.js reads it. It
    // cannot prove the browser then USES it — a lookup that silently returns undefined, a head.js
    // that loads after app.js, a later renderer that overwrites document.title, all pass the build.
    // This is that half. One route per template class is enough because the defect is per-template.
    // PROVE IT by deleting the RNAWIKI_HEAD lookup from setPageMeta() in site/app.js.
    if (dom && dom.title) {
      let pre = null;
      try {
        const html = await (await fetch(BASE + route)).text();
        const un = s => String(s).replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
        const t = html.match(/<title>([\s\S]*?)<\/title>/), d = html.match(/<meta name="description" content="([^"]*)"/);
        pre = { title: t ? un(t[1]) : null, desc: d ? un(d[1]) : null };
      } catch (e) { add(`could not fetch the prerendered document to compare heads — ${String(e).slice(0, 120)}`); }
      // /progress has no prerendered page: it falls through to site/index.html, the SPA shell,
      // whose <title> IS the site default. Comparing against that would assert the defect.
      const SHELL_TITLE = 'RNAwiki — translate the code of human performance into real results';
      if (pre && pre.title && pre.title !== SHELL_TITLE) {
        if (dom.title !== pre.title) add(`HEAD PARITY — the crawler is served <title> "${pre.title}" and a reader ends hydration on "${dom.title}". Two documents, two identities, one URL (D7/D8).`);
        if (dom.desc !== pre.desc) add(`HEAD PARITY — the crawler is served description "${String(pre.desc).slice(0, 80)}…" and a reader ends on "${String(dom.desc).slice(0, 80)}…"`);
      }
      if (dom.ogTitle !== null && dom.ogTitle !== dom.title) add(`HEAD PARITY — one document, two identities: <title> is "${dom.title}" and og:title is "${dom.ogTitle}". A share card and a tab must not disagree.`);
      if (dom.ogDesc !== null && dom.ogDesc !== dom.desc) add(`HEAD PARITY — description and og:description differ in the same document: "${String(dom.desc).slice(0, 60)}…" vs "${String(dom.ogDesc).slice(0, 60)}…"`);
      if (dom.title === SHELL_TITLE && route !== '/progress') add(`HEAD PARITY — hydration ended on the site default title. This page has no identity in a tab, a bookmark, a share or a search result (D7).`);
      if (!dom.desc) add('HEAD PARITY — no meta description after hydration');
    }

    // documented per-route assertions
    for (const a of (ASSERTIONS[route] || [])) {
      const gate = !a.onlyIfRequestFailed || badRequests.some(f => a.onlyIfRequestFailed.test(f.path));
      if (!gate) continue;
      // Two kinds of assertion. `selector` is presence-only and covers most defects. `evaluate`
      // exists for the ones that are a RELATION between things on the page — "every protocol URL
      // in the graph is reachable from here" cannot be written as a CSS selector. It runs in the
      // page and returns null to pass, or the failure message.
      if (a.evaluate) {
        const msg = await page.evaluate(a.evaluate).catch(e => 'threw: ' + (e && e.message ? e.message : String(e)));
        if (msg) add(`ASSERTION ${a.name} FAILED — ${msg} — ${a.why}`);
        continue;
      }
      const present = await page.$(a.selector).then(x => !!x).catch(() => false);
      if (!present) add(`ASSERTION ${a.name} FAILED — expected ${a.selector} — ${a.why}`);
    }

    rows.push({ cls, route, status, con: consoleErrors.length, pe: pageErrors.length, bad: badRequests.length });
    await page.close();
  }

  // ------------------------------------------------- the SAME geometry, at a DESKTOP width
  // W5.5 (2026-08-02): EVERY VIEWPORT THIS SUITE HAS EVER DRIVEN IS 390x844.
  // All four setViewport calls in this file were the same phone, so the whole geometry gate —
  // overflow, the 44px header controls, the focus-on-load check — only ever described one width.
  // That is not a hypothetical gap. Commit 7a6f9c1 fixed a defect that was INVISIBLE at 390 and
  // obvious at 1440: `.menu-btn` had been added to the shared 44px tap-target selector list, whose
  // `display:inline-flex` sits after `.menu-btn{display:none}` and overrode it at every width, so
  // the ☰ rendered on DESKTOP beside the full nav bar it exists to replace. It was found by looking
  // at a screenshot, and the note on assertMobileOnlyControls() in build/prerender.js says so.
  // That build gate is the static half: it reads styles.css as text, for one selector, and only
  // checks `display` outside a media query. It cannot see a RENDERED result. This is the other half.
  //
  // WHY THIS IS NOT JUST `setViewport({width:1280})` ON THE LOOP ABOVE. Measured hydrated over all
  // 568 published routes at 1280x900 (qa/out/w55_geom_1280.json): #menu-btn is `display:none` there
  // — the breakpoint is max-width:760px — so getBoundingClientRect() gives {w:0,h:0} and the
  // existing `if (v.h < 44)` check fails on 568 of 568 routes. A control that is not rendered at
  // this width is not a control that is too small; it is a control this width does not have. The
  // pass therefore skips anything with computed display:none and asserts the pair invariant instead.
  //
  // BASELINE, so this is understood as a REGRESSION NET and not a bug report: at 1280x900 across
  // all 568 routes today there is 0 horizontal overflow, 0 h1-focused-on-load, and the header
  // measures search 520x44 / acct 68x44 / brand 98x44 with the ☰ correctly absent. Also checked at
  // 768, 1024 and 1440 on a 127-route stratified subset: 0 overflow at every width.
  // COST, stated so it is a decision and not a surprise: this adds one page load per ROUTES entry,
  // roughly doubling the wall time of `npm run smoke`.
  //
  // PROVE IT by adding `.menu-btn` back to the shared 44px tap-target rule at styles.css:195-197
  // (the exact bug 7a6f9c1 fixed). At 390 the ☰ is 44x44 and .topnav is display:none, so
  // BOTH_VISIBLE is false and the mobile pass above stays green — which is precisely why nothing
  // saw it. At 1280 the ☰ is 44x44 AND .topnav is 279x24, and the pair check below names it.
  {
    const DESKTOP = { width: 1280, height: 900 };
    // The phone control and the desktop control it stands in for. Exactly one may be rendered.
    const PAIRS = [['#menu-btn, .menu-btn', '.topnav', 'the ☰ menu button', 'the full nav bar']];
    for (const [, route] of ROUTES) {
      const page = await browser.newPage();
      try {
        await page.setViewport(DESKTOP);
        const resp = await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: NAV_TIMEOUT });
        // 304 is expected and correct here: the pass above already fetched every one of these URLs
        // in this same browser, so the second visit revalidates and the server says "unchanged".
        // The document still renders. Only a real error status means there is nothing to measure —
        // and the pass above is the one that asserts the status is 200 in the first place.
        const st = resp ? resp.status() : 0;
        if (st !== 200 && st !== 304) { fail.push(`${route}  [desktop ${DESKTOP.width}px] main document returned ${st}`); await page.close(); continue; }
        await new Promise(r => setTimeout(r, SETTLE_MS));
        const d = await page.evaluate((pairs) => {
          const box = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return { w: Math.round(r.width), h: Math.round(r.height), disp: s.display, vis: s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0 }; };
          const g = (sel) => box(document.querySelector(sel));
          const inp = document.getElementById('search');
          return {
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
            h1FocusedOnLoad: document.activeElement === document.querySelector('#app h1'),
            searchClipped: inp ? inp.scrollWidth > inp.clientWidth + 1 : null,
            header: { search: g('#search'), acct: g('.acct-btn'), brand: g('.brand'), menu: g('#menu-btn, .menu-btn') },
            pairs: pairs.map(([a, b]) => [g(a), g(b)]),
            widest: (() => {
              const vw = document.documentElement.clientWidth; let worst = null;
              document.querySelectorAll('#app *, header *, footer *').forEach((el) => {
                const s = getComputedStyle(el); if (s.position === 'fixed') return;
                const r = el.getBoundingClientRect();
                if (r.width > 0 && r.right > vw + 1 && (!worst || r.right > worst.right)) worst = { right: Math.round(r.right), tag: el.tagName, cls: String(el.className || '').slice(0, 40), txt: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 50) };
              });
              return worst;
            })(),
          };
        }, PAIRS.map(p => [p[0], p[1]]));

        const at = m => fail.push(`${route}  [desktop ${DESKTOP.width}px] ${m}`);
        if (d.scrollWidth > d.clientWidth + 1) {
          const w = d.widest;
          at(`the page is ${d.scrollWidth}px wide in a ${d.clientWidth}px viewport — it scrolls sideways${w ? `; widest element is <${w.tag.toLowerCase()}${w.cls ? ' class="' + w.cls + '"' : ''}> ending at ${w.right}px: "${w.txt}"` : ''}`);
        }
        if (d.h1FocusedOnLoad) at('the <h1> is focused on page LOAD — a focus ring nobody asked for, and it skips the reader past the skip link and the whole header');
        if (d.searchClipped) at('the header search box is too narrow for its own placeholder');
        // ONLY controls this width actually renders. A display:none control is not a small control.
        Object.entries(d.header).forEach(([k, v]) => {
          if (!v || !v.vis) return;
          if (v.h < 44) at(`header control "${k}" is ${v.w}x${v.h} px — under the 44px pointer-target minimum, on a control that is on every one of the 568 routes`);
        });
        // THE PAIR INVARIANT — exactly one of a phone control and its desktop replacement.
        d.pairs.forEach(([a, b], i) => {
          const [, , an, bn] = PAIRS[i];
          const av = !!(a && a.vis), bv = !!(b && b.vis);
          if (av && bv) at(`${an} and ${bn} are BOTH rendered (${a.w}x${a.h} and ${b.w}x${b.h}) — the phone control is showing on desktop beside the nav it exists to replace, which is the defect 7a6f9c1 fixed and no 390px gate can see`);
          else if (!av && !bv) at(`neither ${an} nor ${bn} is rendered — there is no way to reach the site's navigation at this width`);
        });
      } catch (e) { fail.push(`${route}  [desktop ${DESKTOP.width}px] harness error — ${e && e.message ? e.message : String(e)}`); }
      await page.close();
    }
  }

  // ------------------------------------------------- W6 (2026-08-08): THE PRERENDERED DOCUMENT
  // MUST FIT ON A PHONE TOO.
  // Every geometry check in this file runs with JavaScript ON. That measures the SPA's document.
  // ~90% of this site's traffic never runs JavaScript and gets a DIFFERENT document — the one
  // build/prerender.js wrote — and nothing has ever measured its width.
  //
  // MEASURED at 390x844 with JavaScript disabled over all 568 published routes, while every
  // existing geometry gate was green: 28 routes scrolled sideways. Three separate causes, and the
  // first two were cutting text off the right-hand edge of the phone, not merely adding a scrollbar:
  //   20 /c/*    TABLE.biof-tbl, the biomarker table, which had NO rule in site/styles.css at all
  //              and so sized to its content. Worst 95px (/c/fadogia-agrestis,
  //              /c/cerebrolysin-ara-290-brief). Screenshotted on /c/iodine-selenium: the whole
  //              third column — the target ranges, the point of the table — ran off the screen.
  //    1 /learn/0  a 59-character BPC-157 amino-acid sequence in <code>, held on one line by
  //              `.article code{white-space:nowrap}`. 141px, the sequence visibly cut mid-chain.
  //    7 /muscle/*  FORM.w.wsort, the CSS-only sort widget. 2-20px, and NOT fixed — screenshotted
  //              at 390x844 and nothing is cut off or unreachable; it is a scrollbar, not lost
  //              content, and it is a different concern from the two above.
  //
  // SO THIS GATE IS A RATCHET, NOT A CLEAN SWEEP. `KNOWN` records exactly what is still wrong,
  // with the pixel count measured today. A route not in KNOWN may not overflow at all; a route in
  // KNOWN may not get WORSE. Recording it here is the only honest alternative to either shipping a
  // gate with a silent carve-out or claiming a fix that was not made.
  // PROVE IT by deleting the `.biof-tbl` block from site/styles.css and rebuilding (the rebuild
  // matters — server.js serves styles.css.br): /c/cerebrolysin-ara-290-brief and /c/iodine-selenium
  // both report, by name and pixel count.
  {
    const KNOWN = {
      // route: [px measured 2026-08-08, why it is still here]
      '/muscle/abdominals': [5, 'FORM.w.wsort, the CSS-only sort widget — a scrollbar, nothing cut off (screenshotted); 7 /muscle routes share it, 2-20px'],
    };
    for (const [cls, route] of ROUTES) {
      if (route.includes('?')) continue;   // the ?state= and ?cohort= variants are the same document
      const page = await browser.newPage();
      try {
        await page.setJavaScriptEnabled(false);
        await page.setViewport({ width: 390, height: 844 });
        await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await new Promise(r => setTimeout(r, 250));
        const m = await page.evaluate(() => {
          const vw = document.documentElement.clientWidth;
          // The widest element that is NOT inside something that clips or scrolls it — otherwise
          // the report names a <b> sitting happily inside an overflow-x:auto box.
          const boxed = (e) => { let n = e.parentElement; while (n && n !== document.body) { if (getComputedStyle(n).overflowX !== 'visible') return true; n = n.parentElement; } return false; };
          let w = null;
          document.querySelectorAll('body *').forEach((e) => {
            if (getComputedStyle(e).position === 'fixed') return;
            const r = e.getBoundingClientRect();
            if (r.width > 0 && r.height > 0 && r.right > vw + 1 && !boxed(e) && (!w || r.right > w.right)) {
              w = { right: Math.round(r.right), tag: e.tagName, cls: String(e.className || '').slice(0, 34), txt: (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 46) };
            }
          });
          return { px: Math.max(0, Math.round(document.documentElement.scrollWidth - vw)), vw, w };
        });
        const known = KNOWN[route];
        const el = m.w ? `; widest unclipped element is <${m.w.tag.toLowerCase()}${m.w.cls ? ` class="${m.w.cls}"` : ''}> ending at ${m.w.right}px: "${m.w.txt}"` : '';
        if (m.px > 1 && !known) {
          fail.push(`${route}  [no-JS ${m.vw}px] the PRERENDERED document is ${m.vw + m.px}px wide in a ${m.vw}px viewport — it scrolls sideways for the ~90% of readers who never run JavaScript, and for the crawler${el}`);
        } else if (known && m.px > known[0] + 1) {
          fail.push(`${route}  [no-JS ${m.vw}px] the prerendered document overflows by ${m.px}px, worse than the ${known[0]}px recorded in KNOWN on 2026-08-08 (${known[1]})${el}`);
        } else if (known && m.px <= 1) {
          fail.push(`${route}  [no-JS] no longer overflows — good, now delete its KNOWN entry in scripts/smoke.mjs so the ratchet keeps its teeth`);
        }
      } catch (e) {
        fail.push(`${route}  [no-JS 390px] harness error (${cls}) — ${e && e.message ? e.message : String(e)}`);
      }
      await page.close();
    }
  }

  // ------------------------------------------------- /solve?q= cross-document parity
  // The ?q= ranking exists TWICE: rankProblems() in site/app.js for the SPA, and searchSolve() in
  // server.js for the ~90% who never run JavaScript. Both read the same parse.js-authored index, so
  // the only way they can diverge is a weight edited in one file and not the other. That divergence
  // is silent — each document looks fine on its own. This is the only check that sees both.
  // The server expresses its ranking as injected `#q-hits .solve-card[data-pid=…]{order:N}` rules;
  // the SPA expresses it as the DOM order of #q-hits cards. They must be the same list.
  // Prove this gate by changing a single weight in server.js searchSolve() (e.g. 18 -> 4).
  for (const q of ['knee pain', 'belly fat', 'low testosterone', 'insomnia', 'zzzznonsense']) {
    const u = '/solve?q=' + encodeURIComponent(q);
    let pre, hyd;
    try {
      const html = await (await fetch(BASE + u)).text();
      pre = /id="q-none" data-on/.test(html) ? ['(none)']
        : [...html.matchAll(/#q-hits \.solve-card\[data-pid="([a-z0-9-]+)"\]\{order:(\d+)\}/g)]
          .map(m => ({ id: m[1], o: +m[2] })).sort((a, b) => a.o - b.o).map(x => x.id);
      const page = await browser.newPage();
      await page.setViewport({ width: 390, height: 844 });
      await page.goto(BASE + u, { waitUntil: 'networkidle2', timeout: 45000 });
      await new Promise(r => setTimeout(r, 700));
      hyd = await page.evaluate(() => document.querySelector('#q-hits.q-empty') ? ['(none)']
        : [...document.querySelectorAll('#q-hits .solve-card')].map(c => c.dataset.pid));
      await page.close();
    } catch (e) {
      fail.push(`solve-q-parity ${JSON.stringify(q)}: harness error — ${e && e.message ? e.message : String(e)}`);
      continue;
    }
    if (JSON.stringify(pre) !== JSON.stringify(hyd)) {
      fail.push(`ASSERTION solveQParity FAILED — q=${JSON.stringify(q)}: prerendered ranks [${pre.join(', ')}] but hydrated ranks [${hyd.join(', ')}] — server.js searchSolve() and site/app.js rankProblems() have drifted`);
    }
  }

  // ------------------------------------------------- /solve?q= ranking: the regression battery
  // W2.5(d). The parity check above only asserts the two runtimes AGREE — they agreed perfectly
  // while both were wrong. This asserts they are RIGHT, against the phrasings a reader actually
  // types. Measured before the fix: 9 of these 20 ranked the wrong problem #1, and not narrowly —
  // "hair falling out" returned insomnia (its name owns "falling"), "lose weight" returned pcos as
  // its only hit, "balding" returned nothing at all. Plus the invariant the ranking has always
  // claimed: every problem is #1 for its own display name.
  // Both read the server's ranking, which is the ~90% document; app.js is pinned to it by the
  // parity check. PROVED by reintroduction: cutting data/solve_aliases.json's "hair-loss" list
  // down to ["hair"] and rebuilding makes this print
  //   ASSERTION solveBattery FAILED — q="balding" ranks (none) first, expected hair-loss
  // Measured while proving it: deleting "the" from graph.solveStopwords does NOT fail this gate
  // any more, because the alias phrase now outscores the spurious name-word hit. The stopword and
  // word-prefix changes are still right (see build/parse.js) — they are just no longer the thing
  // holding these 20 up. The alias layer is: without it the battery scores 11/20.
  {
    const topOf = async (q) => {
      const html = await (await fetch(BASE + '/solve?q=' + encodeURIComponent(q))).text();
      if (/id="q-none" data-on/.test(html)) return '(none)';
      const hits = [...html.matchAll(/#q-hits \.solve-card\[data-pid="([a-z0-9-]+)"\]\{order:(\d+)\}/g)]
        .map(m => ({ id: m[1], o: +m[2] })).sort((a, b) => a.o - b.o);
      return hits.length ? hits[0].id : '(none)';
    };
    const BATTERY = [
      ['hair falling out', 'hair-loss'], ['lose weight', 'fat-loss-plateau'], ['tired all the time', 'chronic-fatigue'],
      ['knee hurts', 'knee-pain'], ['high blood pressure', 'blood-pressure'], ['cant sleep', 'insomnia'],
      ['balding', 'hair-loss'], ['belly fat', 'visceral-fat'], ['brain fog', 'brain-fog'], ['cant focus', 'adhd-focus'],
      ['always exhausted', 'chronic-fatigue'], ['wake up at 3am', 'sleep-maintenance'], ['build muscle', 'hypertrophy'],
      ['live longer', 'longevity'], ['bloating', 'gut-health'], ['plantar fasciitis', 'ankle-foot'],
      ['tennis elbow', 'elbow-wrist'], ['low testosterone', 'low-testosterone'], ['keep getting sick', 'immunity'],
      ['cant lose weight', 'fat-loss-plateau'],
    ];
    try {
      for (const [q, want] of BATTERY) {
        const top = await topOf(q);
        if (top !== want) fail.push(`ASSERTION solveBattery FAILED — q=${JSON.stringify(q)} ranks ${top} first, expected ${want} — /solve does not answer the words a reader types`);
      }
      // …and nothing at all for a query with no answer, so the ranking cannot pass by matching
      // everything.
      const none = await topOf('zzzznonsense');
      if (none !== '(none)') fail.push(`ASSERTION solveBattery FAILED — a nonsense query ranked ${none} first`);
      // the invariant: every problem is #1 for its own name
      const dj = await (await fetch(BASE + '/data.js')).text();
      const G = JSON.parse(dj.match(/^window\.RNAWIKI_DATA = ([\s\S]*);\s*$/)[1]).graph;
      for (const p of G.problems) {
        const top = await topOf(p.name);
        if (top !== p.id) fail.push(`ASSERTION solveBattery FAILED — the problem "${p.name}" is not the top hit for its own name (got ${top})`);
      }
    } catch (e) { fail.push('solveBattery: harness error — ' + (e && e.message ? e.message : String(e))); }
  }

  // ------------------------------------------------- the home hero typeahead
  // W4.5 (2026-08-02): THE LIST UNDER THE BOX AND THE PAGE THE BOX SUBMITS TO ARE ONE QUESTION.
  // The home hero is a real <form action="/solve" method="get">. Its typeahead used to run
  // suggestProtocols() — a third scoring loop over a third index, with no stopwords and no
  // data/solve_aliases.json — while the page it submits to runs rankProblems() / searchSolve().
  // MEASURED HYDRATED, real browser at 390x844, 10 real queries, 0 pageerrors
  // (qa/out/w45c_before.json): different lists on 10 of 10, different TOP HIT on 2 of 10 —
  //   "high blood sugar"  hero: blood-pressure …   /solve: insulin-resistance
  //   "tired after lunch" hero: burnout …          /solve: chronic-fatigue
  // This drives the real input on the real home page and compares the dropdown against the
  // SERVER's ranking of the same words, read out of the #q-filter order rules on /solve?q= — so it
  // closes all three loops at once (hero -> app.js rankProblems -> server.js searchSolve), not just
  // two. Its queries include both measured disagreements.
  // PROVE IT by restoring the old suggestProtocols() body in site/app.js — this then prints
  // 'q="high blood sugar": the hero suggests blood-pressure first, /solve answers
  //  insulin-resistance'.
  {
    const serverRank = async (q) => {
      const html = await (await fetch(BASE + '/solve?q=' + encodeURIComponent(q))).text();
      if (/id="q-none" data-on/.test(html)) return [];
      return [...html.matchAll(/#q-hits \.solve-card\[data-pid="([a-z0-9-]+)"\]\{order:(\d+)\}/g)]
        .map(m => ({ id: m[1], o: +m[2] })).sort((a, b) => a.o - b.o).map(x => x.id);
    };
    const QUERIES = ['high blood sugar', 'tired after lunch', 'hair falling out', 'cant sleep',
      'knee pain going downstairs', 'belly fat', 'losing muscle', 'brain fog'];
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
      await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: NAV_TIMEOUT });
      await new Promise(r => setTimeout(r, SETTLE_MS));
      if (!(await page.$('#hero-solve-input'))) fail.push('ASSERTION heroTypeaheadIsTheSolveRanking FAILED — no #hero-solve-input on the home page; the site\'s first call to action is gone');
      else for (const q of QUERIES) {
        const hero = await page.evaluate(async (query) => {
          const i = document.getElementById('hero-solve-input');
          i.focus(); i.value = query;
          i.dispatchEvent(new Event('input', { bubbles: true }));
          await new Promise(r => setTimeout(r, 150));
          return [...document.querySelectorAll('#hero-solve-out .funnel-hit')].map(a => a.dataset.pid).filter(Boolean);
        }, q);
        const srv = await serverRank(q);
        if (!hero.length) { fail.push(`ASSERTION heroTypeaheadIsTheSolveRanking FAILED — q=${JSON.stringify(q)}: the hero suggests nothing, /solve answers [${srv.join(', ')}]`); continue; }
        if (hero[0] !== srv[0]) fail.push(`ASSERTION heroTypeaheadIsTheSolveRanking FAILED — q=${JSON.stringify(q)}: the hero suggests ${hero[0]} first, /solve answers ${srv[0]} — one query, two answers, and the reader sees the wrong one before they press Enter`);
        else if (JSON.stringify(hero) !== JSON.stringify(srv)) fail.push(`ASSERTION heroTypeaheadIsTheSolveRanking FAILED — q=${JSON.stringify(q)}: the hero lists [${hero.join(', ')}] and /solve lists [${srv.join(', ')}] — the same question is being scored twice`);
      }
      await page.close();
    } catch (e) { fail.push('heroTypeaheadIsTheSolveRanking: harness error — ' + (e && e.message ? e.message : String(e))); }
  }

  // ------------------------------------------------- /interest -> "/" (merged 2026-08-08)
  // OUTSIDE THE PER-ROUTE RUNNER, deliberately: page.goto() follows a 301 and reports the home
  // page's 200, so a browser route here would prove nothing. /interest was published, is in the
  // sitemap that shipped, and an unknown top-level path on this server falls through to the SPA
  // shell at HTTP 200 (a soft 404) — so "it 404s" is not the failure to watch for, "it 200s with the
  // wrong page" is.
  // The second check is the one that is easy to lose: at the moment this deploys, a reader mid-
  // submit is 303'd by the OLD container to /interest?state=ok&t=<token>, and that URL is the only
  // copy of their removal token that will ever exist, because nothing here sends email.
  // PROVE IT by deleting the '/interest' entry from LEGACY_REDIRECTS (server.js) — the first check
  // then reports 200 — or by dropping the query passthrough — the second then reports Location "/".
  {
    const r1 = await fetch(BASE + '/interest', { redirect: 'manual' });
    if (r1.status !== 301) fail.push(`ASSERTION interestMergedIntoHome FAILED — /interest answers ${r1.status}, expected 301. It is an indexed URL, and an unknown path here answers 200 with the SPA shell, which is a soft 404.`);
    if ((r1.headers.get('location') || '') !== '/') fail.push(`ASSERTION interestMergedIntoHome FAILED — /interest redirects to ${JSON.stringify(r1.headers.get('location'))}, expected "/"`);
    const tokUrl = '/interest?state=ok&t=smoke-token-0000000000';
    const r2 = await fetch(BASE + tokUrl, { redirect: 'manual' });
    if ((r2.headers.get('location') || '') !== '/?state=ok&t=smoke-token-0000000000') fail.push(`ASSERTION interestMergedIntoHome FAILED — ${tokUrl} redirects to ${JSON.stringify(r2.headers.get('location'))}; the query must travel with it or a reader mid-deploy loses the only copy of their removal token`);
    const home = await (await fetch(BASE + '/')).text();
    for (const [lit, what] of [['action="/api/interest"', 'the form'], ['class="i-state i-s-ok"', 'the "you are on the list" panel'], ['<a class="i-rm" href=""></a>', "server.js's removal-link substitution target"], ['data-total=', 'the library drawing']]) {
      if (home.indexOf(lit) < 0) fail.push(`ASSERTION interestMergedIntoHome FAILED — the home page does not contain ${what} (${lit}). The merge did not land, and the crawler's copy is the one ~90% of readers get.`);
    }
  }

  // ------------------------------------------------- the /compare withdrawal notice
  // W4.5 (2026-08-02): A WITHDRAWAL NOTICE MAY NOT INVENT ITS OWN REASON.
  // MEASURED (curl, localhost:8099, before the fix): the three /compare URLs that were in the
  // published sitemap at W0 and are not in it now —
  //   /compare/creatine-monohydrate-vs-sodium-bicarbonate
  //   /compare/sodium-bicarbonate-vs-vitamin-d3-k2
  //   /compare/sodium-bicarbonate-vs-whey-casein-protein
  // each answered HTTP 410 with "I removed the head-to-head comparisons that pitted a prescription
  // or controlled medicine against a supplement", verbatim. Every one of the six compounds in those
  // pairs is `regulatory_class: supplement`. Sodium Bicarbonate had fallen from rank 8 to rank 9 of
  // the `muscle` goal when EPO was re-filed into that category, and the generator pairs a goal's
  // top eight — so the site printed a reason its own corpus contradicts, under the one status code
  // that tells Google never to ask again.
  // NOT A LIST — the pair is derived from /data.js and /sitemap.xml on every run, so it keeps
  // working when the corpus moves. Outside the per-route runner deliberately: these URLs answer
  // 404/410 by design, and fetching them from inside a page would register as an undocumented
  // failed subresource.
  // PROVE IT by restoring the single hard-coded `gone`/`code`/`body` triple in serveMissing()
  // (server.js): the supplement pair then answers 410 with the prescription sentence, and both the
  // status check and the sentence check below fail by name.
  {
    const RX_SENTENCE = 'pitted a prescription or controlled medicine against a supplement';
    try {
      const dj = await (await fetch(BASE + '/data.js')).text();
      const C = JSON.parse(dj.match(/^window\.RNAWIKI_DATA = ([\s\S]*);\s*$/)[1]).compounds || [];
      const sm = await (await fetch(BASE + '/sitemap.xml')).text();
      const live = new Set([...sm.matchAll(/<loc>[^<]*?(\/compare\/[^<]*)<\/loc>/g)].map(m => m[1]));
      const sl = n => String(n).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const consumer = c => ['supplement', 'otc'].includes(c.regulatory_class);
      const ok = C.filter(consumer), rx = C.filter(c => !consumer(c));
      const get = async u => { const r = await fetch(BASE + u); return { status: r.status, text: await r.text() }; };
      // 1. A supplement-vs-supplement address the generator does not publish. This is the exact
      //    shape of the three URLs above.
      let benign = null;
      for (let i = 0; i < ok.length && !benign; i++) for (let j = i + 1; j < ok.length && !benign; j++) {
        const [a, b] = [ok[i], ok[j]].sort((x, y) => sl(x.name) < sl(y.name) ? -1 : 1);
        const u = `/compare/${sl(a.name)}-vs-${sl(b.name)}`;
        if (!live.has(u)) benign = { u, a: a.name, b: b.name };
      }
      if (!benign) fail.push('ASSERTION compareWithdrawalIsHonest FAILED — every supplement pair is published, so the branch this gate guards is an empty set (see the W4 lesson: a gate over an empty set always passes)');
      else {
        const r = await get(benign.u);
        if (r.status === 410) fail.push(`ASSERTION compareWithdrawalIsHonest FAILED — ${benign.u} answers 410 Gone. ${benign.a} and ${benign.b} are both regulatory_class supplement, so nothing was withdrawn on policy grounds and nothing about it is permanent — 410 tells Google to drop the URL for good`);
        else if (r.status !== 404) fail.push(`ASSERTION compareWithdrawalIsHonest FAILED — ${benign.u} answers ${r.status}; an unpublished comparison must answer 404`);
        if (r.text.indexOf(RX_SENTENCE) >= 0) fail.push(`ASSERTION compareWithdrawalIsHonest FAILED — ${benign.u} tells the reader it was pulled because it "${RX_SENTENCE}". ${benign.a} and ${benign.b} are both regulatory_class supplement — the page is stating a reason the corpus contradicts`);
        if (r.text.indexOf(benign.a) < 0 || r.text.indexOf(benign.b) < 0) fail.push(`ASSERTION compareWithdrawalIsHonest FAILED — ${benign.u} names neither ${benign.a} nor ${benign.b}, so the reader is not told the two pages they came for are still here`);
      }
      // 2. The real policy withdrawal must still be stated. Trading a false reason for no reason
      //    would be the same defect facing the other way.
      if (ok.length && rx.length) {
        const [a, b] = [ok[0], rx[0]].sort((x, y) => sl(x.name) < sl(y.name) ? -1 : 1);
        const u = `/compare/${sl(a.name)}-vs-${sl(b.name)}`;
        const r = await get(u);
        if (r.status !== 410) fail.push(`ASSERTION compareWithdrawalIsHonest FAILED — ${u} answers ${r.status}; a pair containing ${rx[0].name} (${rx[0].regulatory_class}) is a deliberate, permanent editorial withdrawal and 410 is the honest code for it`);
        if (r.text.indexOf(RX_SENTENCE) < 0) fail.push(`ASSERTION compareWithdrawalIsHonest FAILED — ${u} no longer states why it was withdrawn, and for this pair the policy reason is true`);
      }
    } catch (e) { fail.push('compareWithdrawalIsHonest: harness error — ' + (e && e.message ? e.message : String(e))); }
  }

  // ------------------------------------------------- A query string is not an indexable page
  // W6 (2026-08-06). BEFORE: all 8 parameterised URL shapes the codebase can produce answered 200
  // with robots `index,follow,…` and no X-Robots-Tag, so /solve?q=<anything the reader typed> was
  // an unbounded family of indexable near-duplicates of /solve under an identical <title>.
  // This asserts BOTH directions, because a rule that fires on everything is as wrong as one that
  // fires on nothing: the header must be present on every "?" URL and absent from every clean one.
  // It also asserts that render resources are NOT tagged — a noindex on /app.js or /styles.css
  // would be a far worse defect than the one being fixed, and it is one character away.
  // PROVE THIS GATE by deleting the two `_qs` lines from endHtml() in server.js: it must fail
  // naming every "?" URL below.
  try {
    const hdr = async (u) => {
      const r = await fetch(BASE + u, { redirect: 'manual' });
      await r.text();
      return { status: r.status, xr: r.headers.get('x-robots-tag') };
    };
    const dirty = ['/solve?q=knee%20pain', '/az?q=creatine', '/stack?ids=c1,c25', '/plan?cohort=abc',
      '/body/leg?fma=FMA%3A22430', '/c/creatine-monohydrate?utm_source=x',
      '/protocol/knee-pain/patellofemoral-pain?by=felix', '/?ref=twitter'];
    const clean = ['/', '/solve', '/az', '/stack', '/plan', '/body/leg', '/c/creatine-monohydrate',
      '/protocol/knee-pain/patellofemoral-pain'];
    const assets = ['/app.js', '/styles.css', '/data.js', '/sitemap.xml', '/robots.txt'];
    for (const u of dirty) {
      const h = await hdr(u);
      if (!/noindex/i.test(h.xr || '')) fail.push(`ASSERTION queryStringsAreNotIndexable FAILED — ${u} answered ${h.status} with X-Robots-Tag ${JSON.stringify(h.xr)}; a query-string URL is a view of a page, not a page, and every one of these self-canonicalises to its clean twin already`);
      if ((h.xr || '').indexOf('nofollow') >= 0) fail.push(`ASSERTION queryStringsAreNotIndexable FAILED — ${u} sends nofollow. These URLs are how a crawler reaches deeper pages (all 42 links to /body/leg carry ?fma=); the directive must be noindex, FOLLOW`);
    }
    for (const u of clean) {
      const h = await hdr(u);
      if (h.xr) fail.push(`ASSERTION queryStringsAreNotIndexable FAILED — the clean route ${u} sends X-Robots-Tag ${JSON.stringify(h.xr)}. It is in sitemap.xml; tagging it deindexes a published page`);
    }
    for (const u of assets) {
      const h = await hdr(u);
      if (h.xr) fail.push(`ASSERTION queryStringsAreNotIndexable FAILED — the render resource ${u} sends X-Robots-Tag ${JSON.stringify(h.xr)}. Googlebot must be able to fetch and use every asset the page needs; this rule is for text/html only`);
    }
  } catch (e) { fail.push('queryStringsAreNotIndexable: harness error — ' + (e && e.message ? e.message : String(e))); }

  // ------------------------------------------------- Back button on a KEEP_PRERENDERED route
  // W2.5(a): /problem is in KEEP_PRERENDERED, so route() returns the KEEP sentinel and never
  // writes #app. Before the fix, Back from a protocol restored the URL and left the PROTOCOL on
  // screen on 41 of 41 /problem routes (URL returned 41/41, DOM returned 0/41): /problem/knee-pain
  // showed h1 "Knee Pain" / 3,363 words / 0 cause anchors instead of the 8,490-word differential.
  // The per-route runner above cannot express this -- it is a relation between two navigations.
  // Prove this gate by deleting the `html === KEEP && ... && !KEEP_LIVE` branch from route().
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(BASE + '/problem/knee-pain', { waitUntil: 'networkidle2', timeout: NAV_TIMEOUT });
    await new Promise(r => setTimeout(r, SETTLE_MS));
    const before = await page.evaluate(() => ({
      h1: document.querySelector('#app h1').textContent.trim(),
      causes: document.querySelectorAll('#app [id^="cause-"]').length,
    }));
    const went = await page.evaluate(() => {
      const a = [...document.querySelectorAll('#app a')].find(x =>
        (x.getAttribute('href') || '').indexOf('/protocol/') === 0 && !x.hasAttribute('data-native'));
      if (!a) return false; a.click(); return true;
    });
    if (!went) fail.push('ASSERTION backButtonRestoresKeptDocument FAILED — /problem/knee-pain has no in-app protocol link to navigate away with');
    else {
      await new Promise(r => setTimeout(r, SETTLE_MS));
      await page.goBack({ waitUntil: 'domcontentloaded' }).catch(() => { });
      await new Promise(r => setTimeout(r, SETTLE_MS));
      const after = await page.evaluate(() => ({
        path: location.pathname,
        h1: document.querySelector('#app h1').textContent.trim(),
        causes: document.querySelectorAll('#app [id^="cause-"]').length,
      }));
      if (after.path !== '/problem/knee-pain' || after.h1 !== before.h1 || after.causes !== before.causes)
        fail.push(`ASSERTION backButtonRestoresKeptDocument FAILED — Back landed on ${after.path} showing h1 ${JSON.stringify(after.h1)} with ${after.causes} cause anchors; expected /problem/knee-pain, ${JSON.stringify(before.h1)}, ${before.causes} — the address bar and the document disagree`);
    }
    await page.close();
  } catch (e) { fail.push('backButtonRestoresKeptDocument: harness error — ' + (e && e.message ? e.message : String(e))); }

  const w = Math.max(...rows.map(r => r.route.length));
  console.log(bold(`\n  class            route${' '.repeat(Math.max(0, w - 5))}  http  console  pageerr  failed-req`));
  for (const r of rows) {
    console.log(`  ${r.cls.padEnd(15)}  ${r.route.padEnd(w)}  ${String(r.status).padStart(4)}  ${String(r.con).padStart(7)}  ${String(r.pe).padStart(7)}  ${String(r.bad).padStart(10)}`);
  }
} catch (e) {
  fail.push(`harness: ${e && e.message ? e.message : String(e)}`);
} finally {
  if (browser) await browser.close().catch(() => { });
  child.kill('SIGTERM');
  await new Promise(r => setTimeout(r, 300));
  if (child.exitCode === null) child.kill('SIGKILL');
}

if (fail.length) {
  console.error(bold(`\n✖ SMOKE FAILED — ${fail.length} problem${fail.length === 1 ? '' : 's'}\n`));
  fail.forEach(f => console.error('  · ' + f));
  if (serverLog.length) console.error('\n  server output:\n' + serverLog.join('').split('\n').map(l => '    ' + l).join('\n'));
  console.error('');
  process.exit(1);
}
console.log(bold(`\n✔ SMOKE PASSED — ${ROUTES.length} routes, ${ROUTES.length} template classes, 0 undocumented errors\n`));
process.exit(0);
