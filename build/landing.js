// build/landing.js — the landing copy on "/".  (rewritten 2026-08-13)
//
// SUPERSEDES the eight-block page of 2026-08-09. That page was measured at 1,149 visible words
// across eight sections; this one is four blocks and roughly 560 words, of which ~250 are corpus
// strings no human authored and ~60 are legally load-bearing disclaimer bytes.
//
// THE FOUR BLOCKS ARE UNCHANGED AS AN INTERFACE — `fold`, `story`, `proof`, `close` still fill the
// four `<!--I-…-->` placeholders in build/prerender.js. The FATAL at prerender.js:3273 needs no edit.
//
// WHAT CHANGED, AND WHY EACH ONE:
//   · THE SEARCH FIELD MOVED ABOVE THE TAP GRID and gained a visible <label for>. The old
//     aria-label="Say it however you say it" disagreed with the visible text, which is a WCAG 2.5.3
//     Label-in-Name failure; the visible label is now the accessible name.
//   · THE SECOND TAP GRID AND SECOND FORM ARE GONE. 838 bytes emitted twice, byte-identical, and
//     only the hero copy carried a typeahead output div — so solveGuidance()'s live safety routing
//     never fired in the lower one.
//   · THE HOOK DRAWING IS GONE. It argued that the reader's past searching was futile. That is a
//     feeling, not a step, and it cost 167px of drawing plus a 160px caption.
//   · THE FOUR-ROW RECEIPT IS GONE. It said "nothing" four times and then said it again in prose.
//     It survives as one clause of the counted line.
//   · THE WORKED EXAMPLE IS GONE, replaced by the two root causes chronic-fatigue actually
//     publishes, printed from the record. It also took twelve ★, three ☆, a ⭐ entity and the
//     caption "stars = strength of the human evidence for this use", which contradicts /legend,
//     /about, /methodology and /compare. A five-glyph scale whose key lives on another URL is the
//     instruction-manual failure this page exists to remove; assertLandingPage now bans the glyphs.
//   · THE 16-GOAL LIST IS GONE. A second entry mode competing with the one call to action, and
//     three of its sixteen rows printed "N prescription-only" for compounds that are CONTROLLED or
//     NEVER APPROVED — inventing a lawful supply route that does not exist. Every goal keeps 6-51
//     inbound links excluding home, so nothing orphans.
//   · "no account, ever" IS GONE, narrowed to "Reading needs no account." The "ever" foreclosed
//     steps 3-6 of the owner's own customer flow and collided with the #signin-btn that
//     assertAnonymousFirst REQUIRES to exist. Scoped to reading, the promise is permanently true.
//
// NOTHING ON THIS PAGE IS TYPED THAT SOMETHING ELSE ALREADY KNOWS — unchanged, and now wider:
//   · the marks in the library drawing and the filled ones are COUNTED from the published route set
//   · the doors are the causes /problem/chronic-fatigue publishes, in rank order, each door's tell
//     that cause's own `hook` string byte for byte
//   · the two plans are that problem's own root_causes, printing the record's own prescription
//   · the number of causes with no plan is SUBTRACTED, never typed
//   · the corrections count is counted from the EMITTED /corrections document
//   · the three state rows are keyed on CAPABILITIES COMPUTED FROM THE EMITTED BYTES, never from an
//     environment flag — see prerender.js's CAPS. PUBLIC_COMMUNITY=1 produces no comment box
//     anywhere, so the flag is not the truth signal; the presence of the UI in the built site is.
// assertLandingPage() re-derives every one of those from the EMITTED bytes and refuses to build on
// a disagreement, in BOTH directions: a capability that starts working while this page still says
// it does not fails the build too.
//
// THE AUTHORED JUDGEMENTS ON THIS PAGE, and there are only four: TAP_IDS (which six problems the
// first screen shows), TAP_WORDS (the reader's word for each), CAUSE_WORDS (the plainer wording for
// each cause) and the three STATE sentences. Everything else is a lookup or a subtraction.
//
// EVERY <h2> AND <h3> HERE CARRIES AN ATTRIBUTE, DELIBERATELY. anchorHeadings() in prerender.js
// matches /<h([23])>/ — attribute-free only — and rewrites the heading to inject
// `<a class="hanchor">#</a>`. That anchor is opacity:0 and display:none under 640px, so no sighted
// reader ever saw it, but the literal "#" is a real text node: reader mode, clipboard, and every
// answer engine that reads the document receives it verbatim in front of the heading. Ten of them
// shipped on this page. Giving each heading a class is the whole fix, and there is a gate.
'use strict';

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// The problem the doors open. A judgement rather than a lookup, so it is written down once, here.
const CAUSE_PROBLEM = 'chronic-fatigue';

// THE OWNER'S PLAINER WORDING FOR THE CAUSES, keyed by the corpus's exact cause name. Keyed by name
// rather than by position so that re-ranking cannot silently re-label a door.
//
// CAUSE 6 IS NEW AND IT IS MINE, NOT HIS — flagged for sign-off. The corpus calls it "Mitochondrial
// inefficiency & cofactor depletion". Five doors read like sentences and the sixth read like a
// journal title. "Energy production inside the cells themselves" names a location, claims no
// mechanism and promises nothing. assertLandingPage() now fails the build if a published cause has
// NO entry here, so the old behaviour — quietly printing corpus jargon beside five plain lines —
// cannot come back, and replacing my line with his own is a one-line edit.
const CAUSE_WORDS = {
  'Sleep debt & circadian disruption': 'Sleep debt, or a body clock that has drifted',
  'Iron deficiency (with or without anemia)': 'Low iron, which a blood test finds',
  'Depression, chronic stress & burnout': 'Burnout, or stress that has gone on too long',
  'Blood-sugar swings & insulin resistance': 'Blood sugar swinging through the day',
  'Hypothyroidism (overt; subclinical is contested)': 'A thyroid running slow',
  'Mitochondrial inefficiency & cofactor depletion': 'Energy production inside the cells themselves',
};
// The owner's line. A generic escalation sentence, not a claim about this problem. It is the
// best-gated string on the site: assertLandingPage() and scripts/smoke.mjs both pin it.
const RED_FLAG = 'Severe, sudden, or getting worse. Be seen.';
// The corpus's own framing for the rank numbers, carried onto this page WITH them. The ranks are
// LEVERAGE, not likelihood; printed alone they read as an ordering of how likely each cause is to
// be the reader's, which is an implied diagnosis and this page's largest regulatory exposure.
const LEVERAGE_NOTE = 'Ranked by leverage &mdash; #1 is the cause that, fixed, changes the most for '
  + 'the most people. It is a reading aid, not a diagnosis, and not an order of likelihood.';

// THE SIX TAP TARGETS. Six problem ids, chosen for the complaints most often sent away as stress,
// age or nothing. They are ids, not names — the label is TAP_WORDS or the corpus's own `name`, and
// the cause count is the problem's own why.causes.length.
const TAP_IDS = ['chronic-fatigue', 'brain-fog', 'insomnia', 'low-back-pain', 'menopause', 'anxiety'];
// Sentence case throughout: Title Case reads as a taxonomy, and a reader arriving here has been
// handed enough taxonomy. It is also what makes each fit one line at 390px.
const TAP_WORDS = {
  'chronic-fatigue': 'Always tired',
  'brain-fog': 'Brain fog',
  'insomnia': "Can't fall asleep",
  'low-back-pain': 'Lower back pain',
  'menopause': 'Menopause',
  'anxiety': 'Anxiety',
};
// NO EMOJI ON THE TAP TARGETS. The corpus icon for Lower Back Pain is 🔙, which draws a literal
// BACK arrow and reads as navigation — but the real reason is tonal. This page is for somebody who
// wants to be taken seriously after being dismissed, and six emoji make a menu look like a game.

// ============ THE LIBRARY DRAWING ================================================================
// One 4px dash per published route, 40 to a row. TWO <path> elements rather than 567: the
// accessibility tree walks two nodes, and the <title> states both numbers in words.
// The unfilled run is DASHED as well as paler — filled and unfilled measured 1.52:1 against each
// other, so colour alone carried the distinction.
const PER_ROW = 40, PITCH = 11, X0 = 4, Y0 = 4, LEN = 4, CAP = 4;
function marks(from, to) {
  let d = '';
  for (let i = from; i < to; i++) d += `M${X0 + (i % PER_ROW) * PITCH},${Y0 + Math.floor(i / PER_ROW) * PITCH}h${LEN}`;
  return d;
}
function libraryFigure(total, filled, nProblems, nProtocols) {
  const rows = Math.ceil(total / PER_ROW);
  const w = X0 + (PER_ROW - 1) * PITCH + LEN + CAP;
  const h = Y0 + (rows - 1) * PITCH + CAP;
  return `<svg class="i-lib" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="i-t-lib" focusable="false" data-total="${total}" data-filled="${filled}">`
    + `<title id="i-t-lib">${total} marks, one for every page published here. ${filled} of them are filled in: `
    + `the ${nProblems} problem pages and the ${nProtocols} root-cause protocols that carry a plan.</title>`
    + `<path class="i-lib-off" d="${marks(filled, total)}"/><path class="i-lib-on" d="${marks(0, filled)}"/></svg>`;
}

// ============ THE DOORS ==========================================================================
// Every row is a real <a> to /problem/chronic-fatigue#cause-N — a genuine in-page fragment (no
// slash, so not SPA hash-router navigation) landing on that cause's heading.
//
// data-native IS MANDATORY, not decoration: 'problem' is in KEEP_PRERENDERED (site/app.js), so an
// ordinary SPA link to /problem/* renders notFound() for a reader with JavaScript.
//
// EACH <a> MUST BE EMITTED ON ONE LINE. assertLandingPage()'s door regex uses `.*?` with no `s`
// flag, so a newline between the anchor and its <b> silently drops the door from the gate's view.
//
// THE TELLS ARE THE CORPUS'S OWN `hook` STRINGS, byte for byte. Not one word is authored.
//
// THE RED ROW IS OUTSIDE THE <ol>, and that is a fix rather than a style choice: inside an unstyled
// <li> at 390px it wrapped to one word per line across eight lines and lost its --warn colour.
function doorsHtml(causes) {
  const rows = (causes || []).slice().sort((a, b) => (a.rank || 99) - (b.rank || 99))
    .map((c, i) => {
      const n = i + 1;
      const title = CAUSE_WORDS[c.name] || c.name;
      return `<li><a class="lp-door" href="/problem/${CAUSE_PROBLEM}#cause-${n}" data-native>`
        + `<span class="lp-dn" aria-hidden="true">${n}</span>`
        + `<span class="lp-db"><b>${esc(title)}</b><small>${esc(c.hook || '')}</small></span>`
        + `<span class="lp-da" aria-hidden="true">&rarr;</span></a></li>`;
    }).join('');
  return `<ol class="lp-doors">${rows}</ol>`
    + `<a class="lp-red" href="/problem/${CAUSE_PROBLEM}#first-when-this-is-not-a-self-care-problem" data-native>`
    + `<b>${esc(RED_FLAG)}</b><span aria-hidden="true">&rarr;</span></a>`;
}

// ============ THE ONE CALL TO ACTION =============================================================
// ONE FUNCTION, ONE PLACEMENT now. `id="hero-solve-input"` is asserted by name in scripts/smoke.mjs
// with the message "the site's first call to action is gone", and site/app.js binds the typeahead
// to it.
//
// THE ATTRIBUTE ORDER ON .lp-tap IS FROZEN by assertLandingPage()'s regex. Do not reorder.
//
// THE SUBTITLE IS THE COUNT, AND THE REPETITION IS THE ARGUMENT. Five of the six read "6 causes"
// and one reads "7". Rendered as a right-aligned numeral column it reads as a table of counts,
// which is the site's whole thesis stated six times before anything is tapped.
function tapGrid(taps) {
  return taps.map((t) =>
    `<a class="lp-tap" href="/problem/${esc(t.id)}" data-pid="${esc(t.id)}" data-cc="${t.causes}" data-native>`
    + `<b>${esc(t.label)}</b><span>${t.causes} causes</span></a>`).join('');
}

// ============ THE PLANS ==========================================================================
// The two root causes chronic-fatigue actually publishes, printed from the record. Every string
// except the two headings is corpus bytes, and assertLandingPage() re-reads each prescription out
// of the emitted document and compares.
//
// NO FUEL ROW, DELIBERATELY. Both records carry the SAME three nutrient targets (iron, vitamin C,
// magnesium), so a Fuel line on each card would print two identical rows under a heading saying the
// plans differ. The food is named once, in the foot line, as a fact about what a plan carries.
function planCards(rootCauses) {
  return (rootCauses || []).map((rc) =>
    `<article class="lp-plan-c">`
    + `<h3 class="lp-h3"><a href="/protocol/${esc(CAUSE_PROBLEM)}/${esc(rc.id)}" data-native>${esc(rc.name)}</a></h3>`
    + `<p class="lp-plain">${esc(rc.plain || '')}</p>`
    + `<p class="wex-line"><span class="pf-l mv">Move</span><b>${esc(rc.scheme || '')}</b> <small>${esc(rc.detail || '')}</small></p>`
    + `<p class="wex-line"><span class="pf-l st">Stack</span><b>${(rc.stack || []).map(esc).join(' &middot; ')}</b></p>`
    + `</article>`).join('');
}

// ============ THE LOOP, PRINTED AS STATE =========================================================
// Three rows: what works now, and what does not. `on` is a CAPABILITY COMPUTED FROM THE EMITTED
// BYTES in prerender.js — never from process.env, because flipping PUBLIC_COMMUNITY produces no
// comment box anywhere; the flag is not the truth signal.
//
// THE NEGATIVE SENTENCES ARE LOAD-BEARING. assertLandingPage() checks both directions: while the
// capability is off the sentence must be present, and the moment the built site contains that
// surface the sentence must be gone and an affordance must exist. A page that silently keeps
// telling readers there are no comments on the day comments start working fails the build.
function stateRows(caps) {
  const c = caps || {};
  const rows = [
    [true,
      'Read anything here, keep what you decide to do on Today, and tell me when a sentence is wrong. '
      + 'No account for any of it, and nothing you do on Today reaches me.'],
    [!!(c.discuss || c.vote),
      'No comments, no votes, no points, and no moderators. There is one kind of account here and I '
      + 'have not built a second one.'],
    [!!c.discover,
      'Nothing here lists what other people have built, so there would be nowhere for your work to '
      + 'be found. That has to exist before I ask anyone to make something.'],
  ];
  return `<ul class="lp-state">` + rows.map(([on, text]) =>
    `<li data-on="${on ? 1 : 0}"><span class="lp-st">${on ? 'Now' : 'Not yet'}</span><span>${text}</span></li>`
  ).join('') + `</ul>`;
}

// ============ NEW FROM THE COMMUNITY =============================================================
// The founder's requirement: "The homepage must include a 'New from the community' strip showcasing
// recently created protocols. This is the entry point for the cycle to continue."
//
// IT IS PRERENDERED EMPTY AND FILLED BY app.js FROM /api/protocols/new, and that split is forced by
// the architecture rather than chosen: this page is built once, at deploy time, with no database
// connection, while what it lists lives in Postgres and changes by the hour. Server-substituting it
// per request was the alternative and was rejected — "/" is Railway's health check and the site's
// most-hit document, and it is currently served as a static file.
//
// THE EMPTY STATE IS THE HONEST ONE AND IT IS WHAT SHIPS TODAY. Nothing is published yet, so the
// strip does not pretend otherwise and does not print a fake example. What it does instead is name
// the actual reason — the site had no way to list anyone's work until 2026-08-13 — because a strip
// reading "nothing here yet" with no explanation reads as a broken feature rather than an honest one.
// assertLandingPage() checks the pair: while CAPS.discover is false this block may not claim a
// count, and the moment the site can list published work it must stop saying it cannot.
function communityStrip(caps) {
  const on = !!(caps && caps.discover);
  return `<section class="lp-comm" data-community-strip data-on="${on ? 1 : 0}">
  <p class="i-kick">New from the community</p>
  <ul class="lp-comm-list" id="lp-comm-list" hidden></ul>
  <p class="lp-comm-empty" id="lp-comm-empty">Nobody has published one here yet. Until today this site
  had no way to list what anyone had built, which is a reason and not an excuse &mdash; the page that
  lists them is the next thing being built.</p>
</section>`;
}

/**
 * landingParts(o) -> the FOUR blocks the home page composes.
 *
 *   fold   the H1, the turn, the one form, the tap grid. The page's only <h1>.
 *   story  the doors, the escalation row and the leverage note.
 *   proof  the two plans this problem actually publishes, and what the other causes do not have.
 *   close  the corrections log, the loop printed as state, the honest limit, the library, the counts.
 *
 * o.total       published routes, counted from the sitemap set
 * o.filled      routes that carry a plan (= o.nProblems + o.nProtocols)
 * o.nProblems   /problem/* count            o.nProtocols   /protocol/* count
 * o.nCauses     causes across the corpus    o.minCauses    fewest on any one problem
 * o.taps        [{id,label,causes}]         o.causes       the CAUSE_PROBLEM cause records (.hook)
 * o.rootCauses  [{id,name,plain,scheme,detail,stack[]}] — the plans CAUSE_PROBLEM publishes
 * o.nCorrections  <h3> count read out of the EMITTED /corrections document
 * o.caps        {correct,discuss,vote,discover} — computed from emitted bytes, never from env
 */
function landingParts(o) {
  const causeList = (o.causes || []).slice().sort((a, b) => (a.rank || 99) - (b.rank || 99));
  // SUBTRACTED, NEVER TYPED. chronic-fatigue publishes six causes and two of them carry a protocol;
  // four of the six doors the reader just tapped through open no plan. Saying so in this block,
  // rather than three blocks down, is the difference between an honest page and a brochure.
  const noPlan = causeList.length - (o.rootCauses || []).length;

  return {
    // ---- 1. THE FOLD -----------------------------------------------------------------------------
    // Two sentences, then the control. The field is ABOVE the six taps because a reader who already
    // has the words should not have to scan a grid first; the grid is for the reader who has been
    // dismissed and will not compose a query into an empty box.
    //
    // THE H1 IS THE OWNER'S, UNCHANGED, and pinned byte-for-byte by the gate. The second line is his
    // too, in the shape that blames nobody: a four-minute appointment and an 18-month waiting list
    // are the same sentence.
    fold: `<div class="ipage lp">
<section class="lp-fold" id="top">
  <h1>Turned away, priced out, or told it was nothing.</h1>
  <p class="lp-turn">Nobody had the time to work it out with you. This page has nothing but time.</p>
  <form class="lp-form" action="/solve" method="get" role="search">
    <label class="lp-lab" for="hero-solve-input">What is happening to you?</label>
    <div class="lp-search funnel-search"><input id="hero-solve-input" name="q" type="text" autocomplete="off"
      placeholder="&ldquo;tired all the time&rdquo;"><div id="hero-solve-out" class="funnel-out" hidden></div></div>
    <button class="lp-go" id="hero-solve-btn" type="submit">Show me the causes &rarr;</button>
  </form>
  <p class="lp-lead">Or use somebody else&rsquo;s words. Not one of these has a single cause.</p>
  <div class="lp-grid">${tapGrid(o.taps)}</div>
  <a class="lp-all" href="/solve"><b>All ${o.nProblems} problems</b><span aria-hidden="true">&rarr;</span></a>
  <p class="lp-fine">Free to read. Reading needs no account.</p>
</section>
</div>`,

    // ---- 2. THE DOORS ----------------------------------------------------------------------------
    // The differential IS the product, so it is the second thing on the page rather than the fifth.
    // The old block above it — a paragraph hand-copying three CAUSE_WORDS values as prose — is gone;
    // the doors say it in the corpus's own words directly underneath.
    story: `<div class="ipage lp">
<section class="i-wrap">
  <p class="i-kick">One problem</p>
  <h2 class="lp-h">Yours is one of these. Not all of them, and not the one they guessed.</h2>
  ${doorsHtml(o.causes)}
  <p class="lp-rank">${LEVERAGE_NOTE}</p>
</section>
</div>`,

    // ---- 3. THE PLANS, AND WHAT IS MISSING -------------------------------------------------------
    // The eyebrow is the arithmetic, not the aspiration. An earlier draft headed this block "Each
    // cause opens its own plan" — four of the six do not, and a front door that overstates the
    // corpus by a factor of three is the exact failure this page was rebuilt to end.
    //
    // "different", NOT "opposite". The owner's third narrative beat is "a different cause needs the
    // opposite instruction". The two prescriptions here — "Confirm then correct" and "Aerobic base"
    // — are DIFFERENT, not contradictory: nothing in either says the other is harmful and a person
    // could do both on the same day. On a health page "opposite" implies the wrong choice hurts
    // you, which the corpus does not claim anywhere. This is the one place the page deliberately
    // softens a stated wish, and it is flagged for the owner.
    //
    // NEITHER LINE CARRIES A TYPED NUMBER. The first draft read "The same tiredness. Two causes.
    // Two different first moves." and assertLandingPage's spelled-out-count check refused the
    // build — correctly: the day a third protocol is written, a heading that says "Two" is wrong
    // and nothing would have noticed. The eyebrow counts in digits, from the corpus; the heading
    // states the thesis in the singular, which is true at any count.
    proof: `<div class="ipage lp">
<section class="i-wrap">
  <p class="i-kick">${o.rootCauses.length} of the ${causeList.length} causes here have a plan written</p>
  <h2 class="lp-h">The same tiredness. A different cause underneath. A different first move.</h2>
  <div class="lp-plan">${planCards(o.rootCauses)}</div>
  <p class="lp-plan-foot">Each of these also carries the daily food targets for that cause, and what
  to track and when to stop. The other ${noPlan} causes above have the mechanism and how to tell
  whether it is yours, and no plan written yet.</p>
  <p class="lp-fine">Both are real protocols from this site, in their own words. Educational, not medical advice.</p>
  ${/* THE CONTRIBUTION VERB, IN THE READING SURFACE. It was a link to /corrections; that route no
        longer exists, because reporting a wrong sentence belongs ON the sentence rather than on a
        page you have to go and find. This is the same "Flag this" control that now sits on every
        protocol page, in the same slot a one-tap report form will occupy once there is a POST path
        with a CSRF answer. A mailto works today for everyone: no account, no JavaScript. */ ''}
  <p class="lp-links"><a class="lp-fix flag-this" href="mailto:hello@rnawiki.com?subject=Flag%20this%20page" data-flag>Something here is wrong &rarr;</a></p>
</section>
</div>`,

    // ---- 4. THE LOOP -----------------------------------------------------------------------------
    // For a reader whose injury is that a confident person waved them away, the page that
    // undersells itself is the trustworthy one. Every sentence below is a statement about machinery
    // that already exists and is build-gated, or an admission that it does not.
    close: `<div class="ipage lp">
<section class="i-wrap lp-close">
  <p class="i-kick">How this page changes</p>
  <h2 class="lp-h">I get things wrong in public.</h2>
  <p class="lp-body">${o.nCorrections} claims on this site have already been wrong. Each one is in
  the log, with what was wrong and what replaced it. If you find the ${o.nCorrections + 1}th, write
  to me and I will fix it at the source, so it changes on every page that repeats it.</p>
  <p class="lp-links"><a class="lp-fix" href="/methodology" data-native>Read every one of them &rarr;</a></p>
  ${communityStrip(o.caps)}
  ${stateRows(o.caps)}
  ${/* THE HONEST LIMIT. The paragraph that answers "priced out" with dignity rather than charity,
        and the reason the free claim above cannot be read as covering the DOING as well as the
        READING. It names no medicine, claims no efficacy, promises no outcome, and points AT the
        clinician rather than away. */ ''}
  <p class="lp-limit">I can&rsquo;t run a blood test, and I&rsquo;m not going to pretend a website
  replaces the person who can. What I <i>can</i> do is tell you which test separates one of these
  causes from another, and what each result would mean &mdash; so that if you do spend money, you
  know what you are asking for.</p>
  <figure class="i-fig i-swipe">${libraryFigure(o.total, o.filled, o.nProblems, o.nProtocols)}</figure>
  <p class="lp-counted">All ${o.total} pages are free to read. ${o.nCauses} causes are written down; ${o.nProtocols} carry a full plan. The fewest on any one problem is ${o.minCauses}.</p>
  <p class="lp-fine">Written with AI assistance and edited by one person &mdash; me. <b>Not yet reviewed by a clinician.</b></p>
  <p class="lp-open">The next person who arrives reads the page you fixed.</p>
</section>
</div>`,
  };
}

module.exports = {
  landingParts, libraryFigure, doorsHtml,
  CAUSE_PROBLEM, CAUSE_WORDS, RED_FLAG, TAP_IDS, TAP_WORDS,
};
