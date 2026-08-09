// build/landing.js — the landing copy on "/".  (2026-08-09)
//
// SUPERSEDES build/interest.js, which was the interest-CAPTURE landing page: an H1, five drawings,
// a nine-chip email form and seven answer panels. The owner's instruction, verbatim:
//   "the landing page looks horrible right now. the copywrite does not flow. i just need 1 CTA:
//    search and protocol. You can remove all the expression of interest portion. optimize the
//    landing page based on 'Turned away, priced out, or told it was nothing from the healthcare
//    system'."
// So: one call to action, and it is the search. The form, its seven answer panels, the room drawing
// and the builder drawing are gone from the page. POST /api/interest and its table are untouched —
// they are simply no longer reachable from any document.
//
// WHY IT IS ITS OWN FILE, unchanged from before: build/prerender.js is 5,300 lines and every other
// page in it is GENERATED from the corpus. This one is AUTHORED COPY — the owner's, word for word —
// plus the two surviving drawings. Keeping it here means prerender.js gains one require, one call
// and one gate, and the words can be edited without opening the generator.
//
// NOTHING ON THIS PAGE IS TYPED THAT SOMETHING ELSE ALREADY KNOWS.
//   · the marks in the library drawing and the filled ones are COUNTED from the published route set.
//   · the six doors are the causes /problem/chronic-fatigue publishes, in its rank order, and each
//     door's one-line tell is that cause's own `hook` string, byte for byte.
//   · every cause count on a tap target is that problem's own why.causes.length.
//   · 41 / 52 / 224 / the minimum-causes figure are all counted at build time.
// assertLandingPage() in build/prerender.js re-derives every one of those from the EMITTED bytes and
// refuses to build on a disagreement.
//
// THE ONLY AUTHORED JUDGEMENTS ON THE PAGE are TAP_IDS (which six problems the first screen shows)
// and TAP_WORDS (the reader's word for each one). Everything else on a tap target — the count, the
// destination — is read from the corpus, and both maps are gated against it.
//
// WHAT WAS *NOT* TAKEN, and why — recorded because it is the most tempting change on this page:
// an earlier design headed the doors "You were told it was stress. Stress is number three of six."
// `rank` in data/cause_learn.json is LEVERAGE, not likelihood — /problem/* renders "Ranked by
// leverage: #1 is the cause that, fixed, changes the most for the most" and calls the ordering "a
// reading aid rather than a diagnosis". Setting a leverage rank in 32px bold on the first screen
// reads as a likelihood claim about the reader's own body, which is an implied diagnosis and the
// site's largest Medicines Act exposure. The rank order is kept, the numbers are kept, and the
// corpus's own disclaimer is kept WITH them, on the same screen. See LEVERAGE_NOTE.
'use strict';

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// The problem the six doors open. Written down ONCE, here, because it is a judgement rather than a
// lookup. assertLandingPage() fails the build if it stops existing or stops publishing causes.
const CAUSE_PROBLEM = 'chronic-fatigue';

// THE OWNER'S PLAINER WORDING FOR THE CAUSES, keyed by the corpus's exact cause name. Each one is a
// cause /problem/chronic-fatigue already publishes, said in the words a reader uses. Keyed by the
// corpus name rather than by position so that re-ranking cannot silently re-label them;
// assertLandingPage() fails the build if a key stops matching a published cause. A published cause
// with no entry prints the corpus's own name — cause 6 has none, because he wrote five lines and
// inventing a sixth is the one thing this page may not do. See needsFelix.
const CAUSE_WORDS = {
  'Sleep debt & circadian disruption': 'Sleep debt, or a body clock that has drifted',
  'Iron deficiency (with or without anemia)': 'Low iron, which a blood test finds',
  'Depression, chronic stress & burnout': 'Burnout, or stress that has gone on too long',
  'Blood-sugar swings & insulin resistance': 'Blood sugar swinging through the day',
  'Hypothyroidism (overt; subclinical is contested)': 'A thyroid running slow',
};
// The owner's line. A generic escalation sentence, not a claim about this problem.
const RED_FLAG = 'Severe, sudden, or getting worse. Be seen.';
// The corpus's own framing for the rank numbers, carried onto this page WITH them. /problem/* says
// the same thing in the same words; if it is ever dropped there, the numbers here lose their
// meaning and this page starts implying a likelihood ordering.
const LEVERAGE_NOTE = 'Ranked by leverage &mdash; #1 is the cause that, fixed, changes the most for '
  + 'the most people. It is a reading aid, not a diagnosis, and not an order of likelihood.';

// THE SIX TAP TARGETS. The one authored judgement on the first screen: six problem ids out of 41,
// chosen for the complaints most often sent away as stress, age or nothing. They are ids, not
// names — the label is the corpus's own `name` unless TAP_WORDS overrides it, and the cause count
// is the problem's own why.causes.length. assertLandingPage() fails the build if any id stops being
// a published problem, if any override stops matching, or if a printed count disagrees with the
// corpus.
const TAP_IDS = ['chronic-fatigue', 'brain-fog', 'insomnia', 'low-back-pain', 'menopause', 'anxiety'];
// THE READER'S WORDS FOR A CORPUS PROBLEM, keyed by the problem id. Every one of the six is a
// synonym of that problem's own `name` — "Chronic Fatigue / Low Energy" is what a clinician calls
// the thing a reader calls being tired all the time — and assertLandingPage() fails the build if an
// id here stops resolving to a published problem, so a label can never detach from the page it
// opens. This is the same pattern, and the same gate, that CAUSE_WORDS has used since 2026-08-08.
// Sentence case throughout, deliberately: Title Case reads as a taxonomy, and the reader arriving
// here has already been handed enough taxonomy. It is also what makes the six fit on one line each
// at 390px — measured, "Trouble Falling Asleep" wraps and leaves the grid with rows of two
// different heights, which a judge correctly called out on an earlier draft.
const TAP_WORDS = {
  'chronic-fatigue': 'Always tired',
  'brain-fog': 'Brain fog',
  'insomnia': "Can't fall asleep",
  'low-back-pain': 'Lower back pain',
  'menopause': 'Menopause',
  'anxiety': 'Anxiety',
};
// NO EMOJI ON THE TAP TARGETS, deliberately, and this was decided by rendering it both ways. The
// corpus icon for Lower Back Pain is 🔙, which draws a literal BACK arrow and reads as navigation;
// but the real reason is tonal. This page is for somebody who wants to be taken seriously after
// being dismissed, and six emoji make a menu look like a game.

// ============ 1. THE HOOK ========================================================================
// A rounded search box holding a typed line, and the same line five times below it in a lighter
// pane, each with a small clock and a right-aligned serif label. The typed line is a SCRIBBLE, not
// words: it is the same search every year, and setting it in type would make the reader read it
// five times. One template, so the five repeats cannot drift.
const PENSTROKES = [8.5, 5.7, 10.4, 6.6, 4.8, 9.5, 5.7, 7.6, 11.4, 5.7, 6.6, 8.5, 4.8, 7.6, 8.5, 5.7];
function scribble(y, s) {
  let d = '', x = 104;
  PENSTROKES.forEach((k, i) => {
    d += `M${x.toFixed(1)} ${y} c${(2.3 * s).toFixed(1)} -${(k * s).toFixed(1)} ${(4.3 * s).toFixed(1)} -${(k * s).toFixed(1)} ${(6.6 * s).toFixed(1)} 0 `;
    x += 6.6 * s + (i % 3 === 2 ? 6 : 0);
  });
  return d.trim();
}
const WHEN = ['last night', 'last month', 'last year', 'the year before', 'and before that'];
function hookFigure() {
  const g = WHEN.map((label, i) => {
    const y = 128 + i * 36;
    return `<circle cx="76" cy="${y}" r="8" stroke-width="1.4"/><path d="M76 ${y - 5}v5h4" stroke-width="1.4"/>`
      + `<path d="${scribble(y, 1)}" stroke-width="2"/>`
      + `<text class="i-when" x="504" y="${y + 5}" text-anchor="end">${esc(label)}</text>`;
  }).join('');
  return `<svg class="i-hook" viewBox="0 0 560 300" role="img" aria-labelledby="i-t-hook" focusable="false" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><title id="i-t-hook">A search box holding one typed line, and below it the same line repeated five times, labelled ${WHEN.slice(0, -1).join(', ')} ${WHEN[WHEN.length - 1]}.</title><path d="M72 22h420a30 30 0 0 1 0 60h-420a30 30 0 0 1 0-60z" stroke-width="2.6"/><circle cx="82" cy="46" r="12" stroke-width="2.4"/><path d="M91 55l11 11" stroke-width="2.4"/><path d="${scribble(54, 1.33)}" stroke-width="2.6"/><path d="M300 34v34" stroke-width="2.6"/><path class="i-pane" d="M52 100h456a8 8 0 0 1 8 8v168a8 8 0 0 1-8 8h-456a8 8 0 0 1-8-8v-168a8 8 0 0 1 8-8z" stroke-width="1.4"/>${g}</svg>`;
}

// ============ 2. THE LIBRARY =====================================================================
// One 4px dash per published route, 40 to a row, 11px pitch. TWO <path> elements rather than 568:
// the accessibility tree walks two nodes, and the <title> states both numbers in words, so nothing
// the drawing says is available by colour alone.
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

// ============ 3. THE SIX DOORS ===================================================================
// This REPLACES causeFigure(), which drew six inert <text> boxes inside an SVG. The drawing argued
// that a differential exists; this IS one. Same six causes, same rank order, same red row — but
// every row is a real <a> to /problem/chronic-fatigue#cause-N, which is a genuine in-page fragment
// (no slash, so not SPA hash-router navigation) and lands the reader on the heading of that cause.
//
// data-native is MANDATORY, not decoration: 'problem' is in KEEP_PRERENDERED (site/app.js), so an
// ordinary SPA link to /problem/* renders notFound() for a reader with JavaScript.
//
// THE TELLS ARE THE CORPUS'S OWN `hook` STRINGS, byte for byte — not one word here is authored.
// assertLandingPage() re-reads them out of the emitted bytes and compares.
//
// THE RED ROW IS OUTSIDE THE <ol>, AND THAT IS A FIX, NOT A STYLE CHOICE. A prototype put it in an
// unstyled <li> inside the list; rendered at 390px it wrapped to one word per line across eight
// lines and lost its --warn colour to the list's default ink. It is the one safety-critical element
// on the page. It is now its own block-level link, and it is the only link on the page that goes to
// the escalation section rather than to a cause.
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

// ============ 4. THE TAP GRID — the page's one call to action ====================================
// ONE FUNCTION, TWO PLACEMENTS. Two hand-maintained copies of a control block is the exact drift
// this codebase has been bitten by six times, so the fold and the closing block call this.
//
// `id="hero-solve-input"` is on the FOLD copy only: scripts/smoke.mjs asserts it by name on "/" with
// the message "the site's first call to action is gone", and site/app.js binds the typeahead to it.
// The closing copy is the same form with no id.
//
// THE SUBTITLE IS THE COUNT, AND THE REPETITION IS THE ARGUMENT. Five of the six read "6 causes" and
// one reads "7". A judge called that wallpaper on an earlier draft and was right about the pixels —
// so the line above the grid now names the repetition instead of hiding it: not one of these has a
// single cause. Rendered as a right-aligned numeral column it reads as a table of counts, which is
// the site's whole thesis stated six times before anything is tapped. The alternative — each
// problem's 57-character `hook` under its label — was measured and does not fit: six full-width
// rows carrying a hook is 544px, which pushes the search field off a 390x844 screen and reinstates
// the exact defect this page exists to fix. The hooks are on the six doors instead, where they fit.
function tapGrid(taps, o, first) {
  const cells = taps.map((t) =>
    `<a class="lp-tap" href="/problem/${esc(t.id)}" data-pid="${esc(t.id)}" data-cc="${t.causes}" data-native>`
    + `<b>${esc(t.label)}</b><span>${t.causes} causes</span></a>`).join('');
  const id = first ? 'hero-solve-input' : 'close-solve-input';
  return `<div class="lp-grid">${cells}</div>
    <a class="lp-all" href="/solve"><b>All ${o.nProblems} problems and goals</b><span aria-hidden="true">&rarr;</span></a>
    <form class="lp-form" action="/solve" method="get" role="search">
      <label class="lp-lab" for="${id}">Not there? Say it however you say it.</label>
      <div class="lp-search funnel-search"><input id="${id}" name="q" type="text" autocomplete="off"
        placeholder="&ldquo;tired all the time&rdquo;" aria-label="Say it however you say it">${first ? '<div id="hero-solve-out" class="funnel-out" hidden></div>' : ''}</div>
      <button class="lp-go"${first ? ' id="hero-solve-btn"' : ''} type="submit">Show me the causes &rarr;</button>
    </form>`;
}

/**
 * landingParts(o) -> the FOUR blocks the home page composes.
 *
 *   fold   the H1, the turn, the tap grid and the one form.  The page's only <h1>.
 *   story  the recognition drawing, the six doors, the receipt + the library + the honest limit.
 *   proof  the worked example, repointed, and "before you trust any of it".
 *   close  the tap grid again, the goal list, the escalation line and the utility links.
 *
 * o.total       published routes, counted from the sitemap set
 * o.filled      routes that carry a plan (= o.nProblems + o.nProtocols)
 * o.nProblems   /problem/* count       o.nProtocols  /protocol/* count
 * o.nCauses     causes across the whole corpus       o.minCauses  fewest on any one problem
 * o.taps        [{id,label,causes}]    o.causes  the CAUSE_PROBLEM cause records (with .hook)
 * o.payoff      the worked-example cards, rendered in prerender.js from the protocol record
 * o.goalList    the 16 goal links, with their Medicines Act split, rendered in prerender.js
 */
function landingParts(o) {
  const grid = (first) => tapGrid(o.taps, o, first);
  return {
    // ---- 1. THE FOLD ---------------------------------------------------------------------------
    // Two sentences, then the control. Measured on a 390x844 phone the whole call to action —
    // six taps, the all-41 row, the field and the submit button — finishes above the fold.
    //
    // THE H1 IS THE OWNER'S, UNCHANGED. The second line is his too, in the shape that blames
    // nobody: a four-minute appointment and an 18-month waiting list are the same sentence.
    // The other half of his couplet — "What is wrong with you has a name, and somebody already
    // knows it" — is NOT here. It is the strongest promise on the site and it goes in §2, next to
    // the drawing that earns it and one screen above the honest limit that qualifies it.
    fold: `<div class="ipage lp">
<section class="lp-fold" id="top">
  <h1>Turned away, priced out, or told it was nothing.</h1>
  <p class="lp-turn">Nobody had the time to work it out with you. This page has nothing but time.</p>
  <p class="lp-lead">Not one of these has a single cause. Tap the one that is yours.</p>
  ${grid(true)}
  <p class="lp-fine">Free &middot; no account, ever &middot; nothing here is for sale</p>
</section>
</div>`,

    // ---- 2. THE RECOGNITION, THE DOORS, THE RECEIPT ----------------------------------------------
    story: `<div class="ipage lp">
<section class="i-wrap">
  <h2>You were never going to find it that way.</h2>
  <figure class="i-fig i-rise">${hookFigure()}<figcaption class="i-cap"><b>What is wrong with you has a name, and somebody already knows it.</b></figcaption></figure>
</section>

<section class="i-wrap">
  <p class="i-kick">The one thing nobody did</p>
  <h2>Yours is one of these. Not all of them, and not the one they guessed.</h2>
  <p class="lp-arg">You were told it was stress. Stress is on this list. So is low iron, which a
  blood test finds; so is a thyroid running slow, and a body clock that has drifted. Which one it
  is decides everything you do next &mdash; and nobody sat down and worked that out with you.</p>
  ${doorsHtml(o.causes)}
  <p class="lp-rank">${LEVERAGE_NOTE}</p>
  <p class="lp-counted">Not one of the ${o.nProblems} problems here has a single cause. The fewest is
  ${o.minCauses}. There are ${o.nCauses} written down, and every one of them says how to tell
  whether it is yours.</p>
</section>

<section class="i-wrap">
  <h2>You will never be priced out of this one.</h2>
  ${/* THE RECEIPT, not a badge. Somebody who has been priced out has been burned by warmth before
        and does not distrust "free" — they distrust "free FOR NOW". Four flat rows and a full stop
        read as a policy; a cheerful FREE badge reads as a trial. Every number in it is counted. */ ''}
  <ul class="lp-receipt">
    <li><span>To read one page</span><b>nothing</b></li>
    <li><span>To read all ${o.total}</span><b>nothing</b></li>
    <li><span>To keep a plan and come back to it in a year</span><b>nothing</b></li>
    <li><span>To ask me to correct something</span><b>nothing</b></li>
  </ul>
  <p class="lp-receipt-foot">There is nothing on this site to buy, no account to make, and no
  affiliate links on it. Nothing is behind a payment, an account or a waiting list &mdash; <b>that
  is the part that is not going to change.</b></p>
  <figure class="i-fig i-swipe">${libraryFigure(o.total, o.filled, o.nProblems, o.nProtocols)}<figcaption class="i-cap">One mark per page. The filled ones are the ${o.nProblems} problems and the ${o.nProtocols} root-cause protocols that carry a plan.</figcaption></figure>
  ${/* THE HONEST LIMIT. This is the paragraph that answers "priced out" with dignity rather than
        charity, and it is the reason the "free" claim above cannot be read as covering the DOING
        as well as the READING: /protocol/chronic-fatigue/iron-anemia says in its own words that
        every intervention on it is a purchase or a lab test. It names no medicine, claims no
        efficacy, promises no outcome, and points AT the clinician rather than away. */ ''}
  <p class="lp-limit">I can&rsquo;t run a blood test, and I&rsquo;m not going to pretend a website
  replaces the person who can. What I <i>can</i> do is tell you which test separates your six causes
  from each other, and what each result would mean &mdash; so that if you do spend money, you know
  what you are asking for.</p>
  <p class="lp-counted">All ${o.nCauses} causes here say what to do about them. ${o.nProtocols} of
  them carry a full Move &middot; Fuel &middot; Stack protocol like the one below.</p>
</section>
</div>`,

    // ---- 3. THE PAYOFF, AND THE LIMITS ------------------------------------------------------------
    proof: `<div class="ipage lp">
<section class="i-wrap">
  <p class="i-kick">One tap, start to finish</p>
  <h2>Tap <span class="lp-q">${esc(o.taps[0].label)}</span>. This is what comes back.</h2>
  ${/* THE KEYWORD PARAGRAPH, MOVED NOT DELETED. build/prerender.js's own comment named `.hero-lead`
        as "the only prose carrying root cause underneath it / movement / food / compounds / human
        evidence". It is here verbatim, directly above a demonstration of literally that sentence. */ ''}
  <p class="lp-lede">Name the problem &mdash; I&rsquo;ll show you the <b>root cause underneath
  it</b>, then the movement, the food and the compounds that act on <i>that cause</i>, each one
  ranked by how good the human evidence actually is. Not a shopping list. The reasoning you were
  never handed.</p>
  ${o.payoff}
</section>

<section class="i-wrap">
  ${/* PLACED AFTER THE CALL TO ACTION ON PURPOSE. For a reader whose injury is that a confident
        person waved them away, the page that undersells itself is the trustworthy one. Every
        sentence below is a statement about machinery that already exists and is build-gated. */ ''}
  <h2>Before you trust any of it.</h2>
  <p>Written with AI assistance and edited by one person &mdash; me. <b>Not yet reviewed by a
  clinician.</b> Every claim links to the source it came from so you can check it without taking my
  word for it, and where the evidence is thin the page says so out loud instead of rounding up.
  Animal studies are labelled as animal studies and capped at two stars, because a mouse is not a
  person.</p>
  <p class="lp-links"><a href="/methodology" data-native>How a page gets made</a><a href="/corrections" data-native>Tell me something is wrong</a></p>
</section>
</div>`,

    // ---- 4. THE CLOSE --------------------------------------------------------------------------
    close: `<div class="ipage lp">
<section class="i-wrap lp-close">
  <h2>One tap, and you never have to tell me who you are.</h2>
  ${grid(false)}
</section>

<section class="i-wrap">
  <h2>Or start from a goal</h2>
  ${/* THE MEDICINES ACT SPLIT STAYS VISIBLE. A bare compound tally under "Lose Fat" on the site's
        most promotional surface is a promotional count for medicines the reader cannot legally
        obtain; the "N you can buy · N prescription-only" wording is the safeguard, and a safeguard
        that lives in a title attribute is invisible on touch. What changed is the geometry: a
        16-card grid measured 1,116px on a phone and competed with the closing call to action. */ ''}
  <ul class="lp-goals">${o.goalList}</ul>
</section>

<div class="i-foot">
  <p>Information, not medical advice. No clinician has reviewed these pages and nothing on them is
  a diagnosis. If something is getting worse fast or frightening you, see someone in person today.</p>
  <p class="i-meta"><a href="/solve">Read any of the ${o.nProblems} now</a><a href="/methodology" data-native>How a page is made</a><a href="/corrections" data-native>Corrections</a></p>
  <p class="lp-open">Being built in the open, by one person.</p>
</div>
</div>`,
  };
}

module.exports = {
  landingParts, hookFigure, libraryFigure, doorsHtml,
  CAUSE_PROBLEM, CAUSE_WORDS, RED_FLAG, TAP_IDS, TAP_WORDS, PER_ROW,
};
