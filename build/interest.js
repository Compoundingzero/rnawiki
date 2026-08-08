// build/interest.js — /interest, the interest-capture landing page.  (2026-08-08)
//
// WHY IT IS ITS OWN FILE. build/prerender.js is 4,900+ lines and every other page in it is GENERATED
// from the corpus. This one is AUTHORED COPY — the owner's, word for word, from his own wireframe —
// plus five inline drawings. Keeping it here means prerender.js gains one require, one add() and one
// gate, and the words can be edited without opening the generator.
//
// NOTHING ON THIS PAGE IS TYPED THAT SOMETHING ELSE ALREADY KNOWS.
//   · the marks in the library drawing and the filled ones are COUNTED from the published route set
//     at build time. The wireframe hard-coded 568 and 93, and both would have been false on the
//     first build that publishes a page.
//   · the nine chips are read from data/site_config.json — the SAME array server.js validates
//     POST /api/interest against — so a chip can never submit a value the endpoint discards.
//   · the causes in drawing 3 are the causes /problem/chronic-fatigue publishes, in its rank order.
//   · the seven answer panels are pinned to the seven states server.js can 303 to.
// assertInterestPage() in build/prerender.js re-derives every one of those from the EMITTED bytes
// and refuses to build on a disagreement.
//
// WHOSE WORDS ARE ON THIS PAGE. Every heading, kicker, caption, form label and footer line is the
// owner's, verbatim from his wireframe / the transcription in LANDING_SPEC.md. Three deliberate
// departures, all recorded for him:
//   1. The micro-line under the button was "Reply delete and your address is removed." Nothing on
//      this site sends email and there is no inbound mail handler, so no code keeps that promise.
//      It is replaced by a sentence describing the removal token that DOES exist, which also
//      carries the PDPA purpose statement the page is required to make.
//   2. The Q1 help line was "Whatever the most people name is what gets written first. Nobody has
//      answered yet, so it is still open." The second sentence stops being true the moment one
//      person answers, and nothing here can read the table at build time. Dropped, not rewritten.
//   3. Question 2's label is "Where do I tell you". The wireframe wrote "Where do we tell you", and
//      assertSingleVoice() in build/parse.js refuses "we + verb" in any renderer because this site
//      is one person and not an organisation. One word, and the gate is the reason.
//   4. The seven answer panels are authored here. The wireframe designed none — that is blindspot
//      #3 in the spec — and a state the server can 303 to with no panel is a reader who filled in a
//      form and landed on a page saying nothing happened.
'use strict';

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// The problem page whose causes drawing 3 draws. Written down ONCE, here, because it is the only
// join on this page that is a judgement rather than a lookup: the chip is labelled "Tiredness" and
// the corpus calls the same thing "Chronic Fatigue / Low Energy". assertInterestPage() fails the
// build if either end of it stops existing.
const CAUSE_PROBLEM = 'chronic-fatigue';
const CAUSE_CHIP = 'tiredness';

// THE OWNER'S PLAINER WORDING FOR THE CAUSES, keyed by the corpus's exact cause name.
// His wireframe drew five plain-English lines under "Tiredness". Those five are not inventions and
// they are not a different list — each one is one of the causes /problem/chronic-fatigue already
// publishes, said in the words a reader uses. They are keyed by the corpus name rather than by
// position so that re-ranking the causes cannot silently re-label them, and assertInterestPage()
// fails the build if a key here stops matching a published cause — which is what stops his sentence
// from ending up attached to a cause that no longer exists.
// A published cause with no entry here prints the corpus's own name. Cause 6 has none: he drew five
// lines and a sixth would have to be written by somebody, and inventing copy is the one thing this
// page may not do. See needsFelix.
const CAUSE_WORDS = {
  'Sleep debt & circadian disruption': 'Sleep debt, or a body clock that has drifted',
  'Iron deficiency (with or without anemia)': 'Low iron, which a blood test finds',
  'Depression, chronic stress & burnout': 'Burnout, or stress that has gone on too long',
  'Blood-sugar swings & insulin resistance': 'Blood sugar swinging through the day',
  'Hypothyroidism (overt; subclinical is contested)': 'A thyroid running slow',
};
// The owner's line. A generic escalation sentence, not a claim about this problem, which is why it
// is authored here rather than pulled out of a page's own `safety` block.
const RED_FLAG = 'Severe, sudden, or getting worse. Be seen.';

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
// One 4px dash per published route, 40 to a row, 11px pitch — the geometry of the owner's drawing,
// which was 568 marks in rows of 40 with 93 filled. TWO <path> elements rather than 568: the
// accessibility tree walks two nodes, and the <title> states both numbers in words, so nothing the
// drawing says is available by colour alone.
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

// ============ 3. ONE SYMPTOM, SEVERAL CAUSES =====================================================
function causeFigure(symptom, rows, redFlag) {
  const ROW = 38, TOP = 86;
  const g = rows.map((r, i) => {
    const y = TOP + i * ROW;
    return `<rect class="i-box" x="40" y="${y}" width="340" height="34" rx="8"/>`
      + `<text class="i-tx" x="58" y="${y + 22}">${esc(r)}</text>`
      + `<path class="i-join" d="M210 ${y + 34}v4"/>`;
  }).join('');
  const ry = TOP + rows.length * ROW;
  return `<svg class="i-cause" viewBox="0 0 420 ${ry + 40}" role="img" aria-labelledby="i-t-fork" focusable="false" data-causes="${rows.length}">`
    + `<title id="i-t-fork">The word ${esc(symptom.toLowerCase())} at the top, and beneath it the ${rows.length} causes this site publishes for it, listed one under the other. Under those, a separate row saying when to be seen in person instead.</title>`
    + `<rect class="i-head" x="150" y="6" width="120" height="36" rx="8"/>`
    + `<text class="i-tx i-hd" x="210" y="29" text-anchor="middle">${esc(symptom)}</text>`
    + `<path class="i-join i-join1" d="M210 42v14"/>`
    + `<text class="i-lbl" x="210" y="72" text-anchor="middle">${rows.length} different causes underneath</text>`
    + g
    + `<rect class="i-box i-red" x="40" y="${ry}" width="340" height="34" rx="8"/>`
    + `<text class="i-tx i-redt" x="58" y="${ry + 22}">${esc(redFlag)}</text></svg>`;
}

// ============ 4. THE ROOM ========================================================================
function roomFigure() {
  const chair = (x, y) => `M${x} ${y}h22v20h-22zM${x} ${y}v-20h22v20M${x + 2} ${y + 20}v10M${x + 20} ${y + 20}v10`;
  return `<svg class="i-room" viewBox="0 0 420 190" role="img" aria-labelledby="i-t-room" focusable="false"><title id="i-t-room">Six chairs drawn in a ring around an open floor. Five are drawn in solid outline; the sixth is dashed and labelled yours.</title><ellipse class="i-floor" cx="210" cy="104" rx="150" ry="52"/><g class="i-draw"><path d="${chair(74, 96)}"/><path d="${chair(136, 60)}"/><path d="${chair(262, 60)}"/><path d="${chair(324, 96)}"/><path d="${chair(262, 136)}"/></g><g class="i-draw i-yours"><path d="${chair(136, 136)}"/></g><text class="i-lbl" x="147" y="186" text-anchor="middle">yours</text></svg>`;
}

// ============ 5. THE BUILDER =====================================================================
function builderFigure() {
  return `<svg class="i-build" viewBox="0 0 420 128" role="img" aria-labelledby="i-t-build" focusable="false"><title id="i-t-build">A box reading ask, one question, with a bracket fanning right to three boxes: this answer, that answer, and a dashed red stop here. A dotted line runs on to a note card labelled your note.</title><rect class="i-abox" x="8" y="36" width="104" height="52" rx="8"/><text class="i-lbl" x="20" y="58">ask</text><text class="i-tx i-hd" x="20" y="76">one question</text><path class="i-draw i-acc" d="M112 62h34M146 20v84M146 20h30M146 62h30M146 104h30"/><rect class="i-box" x="176" y="4" width="110" height="34" rx="8"/><text class="i-tx" x="188" y="26">this answer</text><rect class="i-box" x="176" y="46" width="110" height="34" rx="8"/><text class="i-tx" x="188" y="68">that answer</text><rect class="i-box i-red" x="176" y="88" width="110" height="34" rx="8"/><text class="i-tx i-redt" x="188" y="110">stop here</text><path class="i-draw i-bdash" d="M286 62h28"/><rect class="i-note" x="314" y="38" width="98" height="48" rx="8"/><text class="i-lbl" x="326" y="56">your note</text><path class="i-draw i-rule" d="M326 66h74M326 74h52"/></svg>`;
}

// ============ 6. THE FORM ========================================================================
// THE CHIPS COME FROM data/site_config.json, which is the SAME array POST /api/interest validates
// against (server.js loads it at boot out of site/data.js as INTEREST_TOPICS). One definition, two
// readers, so a chip cannot submit a value the endpoint throws away.
// THE WIREFRAME SHIPPED TWO DEFECTS HERE, both impossible now: no chip carried a `value`, so all
// nine serialised to `topic=on` and choosing "Tiredness" produced the byte-identical body to
// choosing "Knee"; and the ids were crossed — the chip labelled "Knee" carried id `f-tired`. The id
// is now DERIVED from the value (`i-f-${id}`) and the value is the config's id, so they cannot
// disagree, and assertInterestPage() checks both against the config and against each other.
function formHtml(topics) {
  const other = topics.find((t) => t.id === 'other');
  const chips = topics.filter((t) => t.id !== 'other').map((t) =>
    `<input class="i-o" type="radio" name="topic" id="i-f-${esc(t.id)}" value="${esc(t.id)}" required>`
    + `<label class="i-chip" for="i-f-${esc(t.id)}">${esc(t.label)}</label>`).join('');
  return `<form class="i-form" method="post" action="/api/interest">
    <p class="i-formtop">Two questions. That is the whole thing.</p>
    <p class="i-formlede">Nothing is built yet. This is how you get told when it is.</p>
    <div class="i-step"><span class="i-stepn" aria-hidden="true">1</span><p class="i-q" id="i-q1">What were you sent away with?</p></div>
    <p class="i-help" id="i-q1h">Whatever the most people name is what gets written first.</p>
    <div class="i-chips" role="radiogroup" aria-labelledby="i-q1 i-q1h">${chips}<input class="i-o i-wide" type="radio" name="topic" id="i-f-${esc(other.id)}" value="${esc(other.id)}" required><label class="i-chip i-wide" for="i-f-${esc(other.id)}">${esc(other.label)}</label><div class="i-escape"><label for="i-f-otherwords">In a few words</label><input id="i-f-otherwords" type="text" name="topic_other" maxlength="60" autocomplete="off"></div></div>
    <div class="i-creator">
      <p class="i-formtop i-mut">If this is you <span class="i-opt">Optional</span></p>
      <p class="i-help i-help0">No qualification asked for, no photograph, and no real name if you would rather not. What you know is the only thing that matters here.</p>
      <input class="i-o" type="checkbox" name="creator" id="i-f-ck" value="1">
      <label class="i-ck" for="i-f-ck"><span><span class="i-ckflag">Tick this if it is you</span><br>I found something that worked, and I want to write it down so the next person is not left searching alone.</span></label>
      <p class="i-creveal">Somebody looking for this at 2am will find you instead of nothing.</p>
    </div>
    <div class="i-field">
      <div class="i-step"><span class="i-stepn" aria-hidden="true">2</span><label class="i-q" for="i-em">Where do I tell you</label></div>
      <p class="i-help" id="i-emh">Two emails. The day you can start writing, and the day the rooms open.</p>
      <input id="i-em" name="email" type="email" required autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false" enterkeyhint="go" maxlength="160" aria-describedby="i-emh" placeholder="you@example.com">
    </div>
    <button type="submit">Count me in</button>
    <p class="i-micro">Your address is stored to send those two emails, and for nothing else. It is never shown to anyone, never sold and never passed on. The next screen gives you a link that deletes it — no reply needed and no account.</p>
  </form>`;
}

// ============ 7. THE SEVEN ANSWERS ===============================================================
// SEVEN, because server.js can 303 to seven states, and a state with no panel is a reader who
// filled in a form and got a page that says nothing happened. They are authored HERE, in the
// prerendered document, and revealed by the ONE attribute server.js stamps — on the <html> ELEMENT,
// not on a wrapper (server.js: `html.replace(/<html\b/, '<html data-state="…"')`), which is why
// every selector in styles.css starts `html[data-state=…]`. No JavaScript on any path.
//
// TWO LITERALS IN HERE ARE A CONTRACT WITH server.js AND MUST NOT BE REFORMATTED. Its need() does a
// plain indexOf and logs loudly when it misses, but a missed substitution still ships a page that
// says "here is your link" and shows none:
//   ok      <a class="i-rm" href=""></a>
//   remove  <input type="hidden" name="t" value="">
// assertInterestPage() asserts both, byte for byte, in this page AND in server.js's own source.
//
// EVERY SENTENCE BELOW IS A STATEMENT ABOUT WHAT THE CODE DID. No number is quoted that could
// drift: the rate-limit panel says there is a daily cap and does not name it, because the cap lives
// in server.js and nothing here can read it.
function statesHtml() {
  return `<div class="i-states" id="answer" tabindex="-1">
  <div class="i-state i-s-ok">
    <h2>You are on the list.</h2>
    <p>Two emails, then nothing: the day you can start writing, and the day the rooms open.</p>
    <p class="i-rmline">Changed your mind? <a class="i-rm" href=""></a> — that page has one button, and pressing it deletes your address. Nothing has been emailed to you yet, so this is the only copy of that link.</p>
  </div>
  <div class="i-state i-s-dupe">
    <h2>That address was already on the list.</h2>
    <p>Nothing changed and you have not been added twice, so you will not be told twice either.</p>
  </div>
  <div class="i-state i-s-bad">
    <h2>That address did not look like an address.</h2>
    <p><strong>Nothing was saved.</strong> Check it and send it again — the form is just below.</p>
  </div>
  <div class="i-state i-s-rate">
    <h2>That is enough sign-ups from this connection today.</h2>
    <p><strong>Nothing was saved.</strong> There is a cap on how many addresses one connection can add in a day, and this one has reached it. It is a limit on abuse, not on you. Try again tomorrow, or from somewhere else.</p>
  </div>
  <div class="i-state i-s-down">
    <h2>Something at this end is down.</h2>
    <p><strong>Your address was not saved</strong>, and that is not your fault. Try again in a few minutes; if it keeps happening, <a href="/corrections" data-native>the corrections page</a> says how to report it.</p>
  </div>
  <div class="i-state i-s-remove">
    <h2>Delete your address?</h2>
    <p>This removes the row completely. Nothing is kept and nothing will be sent to it.</p>
    <form class="i-rmform" method="post" action="/api/interest/remove"><input type="hidden" name="t" value=""><button type="submit">Delete it</button></form>
    <p class="i-help">Changed your mind again? Close this page and nothing happens.</p>
  </div>
  <div class="i-state i-s-removed">
    <h2>That address is not on the list.</h2>
    <p>Either it has just been deleted or it was never there. Nothing is stored against it and nothing will be sent to it.</p>
  </div>
</div>`;
}

/**
 * causeRows(causes) -> one line per published cause, in rank order, in the owner's words where he
 * wrote one for that cause and in the corpus's own words otherwise.
 */
function causeRows(causes) {
  return (causes || []).slice().sort((a, b) => (a.rank || 99) - (b.rank || 99))
    .map((c) => CAUSE_WORDS[c.name] || c.name);
}

/**
 * interestBody(o) -> the <main id="app"> body for /interest.
 * o.total       published routes, counted from the sitemap set INCLUDING this page
 * o.filled      routes that carry a plan (= o.nProblems + o.nProtocols)
 * o.nProblems   /problem/* count       o.nProtocols  /protocol/* count
 * o.symptom     the chip label for CAUSE_CHIP        o.causeRows  one line per published cause
 * o.topics      data/site_config.json -> interest.topics, via D.site.interest.topics
 */
function interestBody(o) {
  return `<div class="ipage">
<section class="i-wrap i-first">
  <p class="i-kick">Being built in the open</p>
  <h1>Turned away, priced out, or told it was nothing.</h1>
  <figure class="i-fig i-rise">${hookFigure()}<figcaption class="i-cap"><b>You were never going to find it that way. What is wrong with you has a name, and somebody already knows it.</b></figcaption></figure>
</section>
<section class="i-wrap">
  <h2>You will never be priced out of this one.</h2>
  <figure class="i-fig i-swipe">${libraryFigure(o.total, o.filled, o.nProblems, o.nProtocols)}<figcaption class="i-cap">Every mark is already written and given away, never behind a payment, account or waiting list. <b>That is the part that is not going to change.</b></figcaption></figure>
</section>
<section class="i-wrap">
  <p class="i-kick">One of the ${o.nProblems}</p>
  <h2>Yours is one of these. Not all of them, and not the one they guessed.</h2>
  <figure class="i-fig i-rise">${causeFigure(o.symptom, o.causeRows, RED_FLAG)}</figure>
</section>
<section class="i-wrap">
  <p class="i-mean">Nobody got to you in time. You can be the one who gets to somebody else.</p>
  <h2>Next time it flares up at 2am, somebody is awake.</h2>
  <figure class="i-fig i-rise">${roomFigure()}<figcaption class="i-cap"><b>Every chair is empty today. Whoever sits down first decides what it feels like to walk in.</b></figcaption></figure>
</section>
<section class="i-wrap">
  <h2>What took you years to work out could save somebody theirs.</h2>
  <figure class="i-fig i-rise">${builderFigure()}</figure>
${statesHtml()}
${formHtml(o.topics)}
</section>
<div class="i-foot">
  <p>Information, not medical advice. If something is getting worse fast or frightening you, see someone in person today.</p>
  <p class="i-meta"><a href="/solve">Read any of the ${o.nProblems} now</a><a href="/methodology" data-native>How a page is made</a><a href="/corrections" data-native>Corrections</a></p>
</div>
</div>`;
}

module.exports = { interestBody, causeRows, CAUSE_PROBLEM, CAUSE_CHIP, CAUSE_WORDS, RED_FLAG, PER_ROW };
