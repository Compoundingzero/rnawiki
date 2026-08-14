'use strict';

// The home page has one job: move a person from an unnamed problem to search.
// Keep the examples few enough to scan, and keep their destinations in the corpus.
const TAP_IDS = ['chronic-fatigue', 'knee-pain', 'insomnia'];
const TAP_WORDS = {
  'chronic-fatigue': 'Tired all the time',
  'knee-pain': 'Knee pain',
  'insomnia': "Can't fall asleep",
};

const HEADLINE = 'Turned away, priced out, or told it was nothing?';
const SUPPORT = 'The same problem can look different. Find the path that matches what you\u2019re experiencing.';
const SEARCH_LABEL = 'What do you want help with?';
const TRUST = 'Free to search and read. No account needed.';

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function examplesHtml(taps) {
  return (taps || []).map((t) => `<a class="lp-example" href="/problem/${esc(t.id)}" data-pid="${esc(t.id)}" data-native>${esc(t.label)}</a>`).join('');
}

function landingParts(o) {
  return {
    fold: `<div class="ipage lp">
<section class="lp-fold" id="top">
  <h1>${HEADLINE}</h1>
  <p class="lp-turn">${SUPPORT}</p>
  <form class="lp-form" action="/solve" method="get" role="search">
    <label class="lp-lab" for="hero-solve-input">${SEARCH_LABEL}</label>
    <div class="lp-form-row">
      <div class="lp-search funnel-search"><input id="hero-solve-input" name="q" type="search" autocomplete="off" spellcheck="false" placeholder="e.g. tired all the time"><div id="hero-solve-out" class="funnel-out" hidden></div></div>
      <button class="lp-go" id="hero-solve-btn" type="submit">Search</button>
    </div>
  </form>
  <nav class="lp-examples" aria-label="Example searches">${examplesHtml(o.taps)}</nav>
  <a class="lp-all" href="/solve">Browse all</a>
  <p class="lp-trust">${TRUST}</p>
</section>
</div>`,
    story: '',
    proof: '',
    close: '',
  };
}

// Kept for server.js's boot guard. These sentences no longer appear on the home page; the guard
// therefore passes only in its safe direction while older generated home files remain detectable.
const STATE_NEGATIVE_COMMUNITY = 'No comments, no votes, no points, and no moderators.';
const STATE_NEGATIVE_DISCOVER = 'Nothing here lists what other people have built.';

module.exports = {
  landingParts,
  TAP_IDS,
  TAP_WORDS,
  HEADLINE,
  SUPPORT,
  SEARCH_LABEL,
  TRUST,
  STATE_NEGATIVE_COMMUNITY,
  STATE_NEGATIVE_DISCOVER,
};
