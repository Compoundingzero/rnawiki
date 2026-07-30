#!/usr/bin/env node
// build/rank_citations.js — SCORE the candidates we already have, instead of demanding exactly one.
//
// WHY THIS EXISTS
// The resolver's rule was "exactly one hit = resolved, anything else = ambiguous". That threw away
// the answer over and over. Two real rows from the 200 still open:
//
//   Grgic 2020, Br J Sports Med — finding: "Umbrella review of 21 meta-analyses…"
//     candidate 3 was "Wake up and smell the coffee: caffeine supplementation and exercise
//     performance — an umbrella review of 21 published meta-analyses". That IS the paper.
//   Kilic 2006, Neuro Endocrinol Lett — finding: "In elite wrestlers, 4 weeks of oral zinc…"
//     candidate 2 was "The effect of exhaustion exercise on thyroid hormones and testosterone
//     levels of elite athletes receiving oral zinc". That IS the paper.
//
// In both cases three or four hits came back, the count was not 1, and the row was filed as
// "ambiguous — a human must pick". The retrieval was fine. The SELECTION was the bug, and no
// amount of better querying would have fixed it.
//
// So: score every candidate against the claim it is supposed to support, and accept the top one
// only when it is clearly better than the runner-up. That costs no API calls — the candidates are
// already stored in data/citation_review.json — and it is checkable, because the score decomposes
// into reasons a human can read.
//
// This still PROPOSES. Nothing is written into the corpus; a person adjudicates, as before.
//
// Usage: node build/rank_citations.js [--min 3] [--gap 1.5]

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const args = process.argv.slice(2);
const num = (flag, dflt) => { const i = args.indexOf(flag); return i >= 0 ? parseFloat(args[i + 1]) : dflt; };
const MIN_SCORE = num('--min', 3);      // below this, we are guessing
const MIN_GAP = num('--gap', 1.5);      // top must beat runner-up by this, or it is a genuine tie

// Words that carry no discriminating power in a biomedical title.
const STOP = new Set(('the a an of to in and or is are it its that this for from with into on at by as be been ' +
  'was were will can may might study trial effects effect on during after before versus vs between among ' +
  'randomized randomised controlled double blind placebo human humans patients subjects participants ' +
  'analysis review results conclusion background objective methods new role using use used').split(' '));

const toks = (s) => (String(s || '').toLowerCase().match(/[a-z][a-z0-9-]{2,}/g) || []).filter((w) => !STOP.has(w));

// Study-design vocabulary. If the claim says "umbrella review of 21 meta-analyses" and a title says
// the same, that is a much stronger signal than any single content word.
const DESIGN = [
  [/umbrella review/i, /umbrella review/i, 4],
  [/meta-?analys/i, /meta-?analys/i, 2.5],
  [/systematic review/i, /systematic review/i, 2],
  [/randomi[sz]ed|RCT\b/i, /randomi[sz]ed/i, 1.5],
  [/crossover|cross-over/i, /crossover|cross-over/i, 1.5],
  [/cohort/i, /cohort/i, 1.5],
  [/case report/i, /case report/i, 2],
  [/position stand/i, /position stand/i, 3],
];

// Titles that are ABOUT a paper rather than being one. These are the trap the tighter query created.
const SECONDARY = /\b(infographic|reply|comment|editorial|erratum|correction|retraction|letter to the editor|author response)\b/i;

function scoreCandidate(cand, row) {
  const title = String(cand.title || '');
  const finding = String(row.finding || '');
  const reasons = [];
  let s = 0;

  // 1. Content-word overlap, weighted toward rarer words. A word appearing in the claim AND the
  //    title is evidence; a long word is better evidence than a short one.
  const fT = new Set(toks(finding));
  const tT = new Set(toks(title));
  let overlap = 0;
  for (const w of fT) if (tT.has(w)) { overlap += Math.min(1.2, 0.35 + w.length * 0.06); }
  if (overlap) { s += overlap; reasons.push(`shares ${[...fT].filter((w) => tT.has(w)).slice(0, 5).join('/')} (+${overlap.toFixed(1)})`); }

  // 2. The compound itself, from the path. Strongest single signal that we are in the right area.
  const subject = (String(row.path).match(/^compound_learn\.([^.]+)/) || [])[1] || '';
  const subjWords = subject.split('-').filter((w) => w.length > 3);
  const subjHit = subjWords.filter((w) => title.toLowerCase().includes(w));
  if (subjHit.length) { s += 2.5 * subjHit.length; reasons.push(`names the compound: ${subjHit.join(', ')} (+${(2.5 * subjHit.length).toFixed(1)})`); }

  // 3. Study design agreement.
  DESIGN.forEach(([inFinding, inTitle, w]) => {
    if (inFinding.test(finding) && inTitle.test(title)) { s += w; reasons.push(`both say ${String(inTitle).slice(1, 20)} (+${w})`); }
  });

  // 4. Numbers. "21 meta-analyses" in the claim and "21 published meta-analyses" in the title is
  //    close to conclusive, and numbers almost never collide by chance.
  const fNums = (finding.match(/\b\d{2,4}\b/g) || []);
  const tNums = new Set(title.match(/\b\d{2,4}\b/g) || []);
  const numHit = fNums.filter((n) => tNums.has(n));
  if (numHit.length) { s += 2 * numHit.length; reasons.push(`same figure ${numHit.join(',')} (+${(2 * numHit.length).toFixed(1)})`); }

  // 5. SPECIES. The claim that separated a right answer from a wrong one on the Kilic row: the
  //    finding says "in elite wrestlers" and the runner-up title says "in rats". Both mention zinc
  //    and testosterone, so word overlap could not tell them apart. This site caps animal evidence
  //    at two stars, so getting human-vs-animal wrong is not a ranking nicety — it would attach an
  //    animal study to a human claim and inflate its own evidence grade.
  const ANIMAL = /\b(rats?|mice|mouse|murine|rodents?|canine|porcine|bovine|zebrafish|drosophila|in vitro|cell culture)\b/i;
  const HUMAN = /\b(men|women|adults?|patients?|volunteers?|participants?|athletes?|wrestlers?|players?|humans?|boys|girls|elderly|children)\b/i;
  const fAnimal = ANIMAL.test(finding), tAnimal = ANIMAL.test(title);
  const fHuman = HUMAN.test(finding), tHuman = HUMAN.test(title);
  if (fHuman && tAnimal && !tHuman) { s -= 4; reasons.push('claim is about people, title is an animal study (-4)'); }
  else if (fAnimal && tHuman && !tAnimal) { s -= 3; reasons.push('claim is an animal study, title is about people (-3)'); }
  else if (fHuman && tHuman) { s += 1.5; reasons.push('both are about people (+1.5)'); }
  else if (fAnimal && tAnimal) { s += 1.5; reasons.push('both are animal work (+1.5)'); }

  // 6. Penalise commentary. A reply about the right trial scores high on words and is still wrong.
  if (SECONDARY.test(title)) { s -= 4; reasons.push('looks like commentary, not the study (-4)'); }
  if (!cand.pmid) { s -= 1.5; reasons.push('no PMID (-1.5)'); }

  return { score: +s.toFixed(2), reasons };
}

// ---- run ------------------------------------------------------------------------------------
const review = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'citation_review.json'), 'utf8'));
const rows = review.ambiguous || [];
const picked = [];
const stillOpen = [];

rows.forEach((row) => {
  const scored = (row.candidates || []).map((c) => ({ c, ...scoreCandidate(c, row) }))
    .sort((a, b) => b.score - a.score);
  if (!scored.length) { stillOpen.push({ ...row, why: 'no candidates at all' }); return; }
  const top = scored[0];
  const gap = scored.length > 1 ? top.score - scored[1].score : Infinity;
  if (top.score >= MIN_SCORE && gap >= MIN_GAP) {
    picked.push({ ...row, pmid: top.c.pmid, title: top.c.title, journal: top.c.journal, year: top.c.year,
      score: top.score, gap: +(gap === Infinity ? 99 : gap).toFixed(2), reasons: top.reasons });
  } else {
    stillOpen.push({ ...row, best: top.c.title, bestScore: top.score, gap: gap === Infinity ? null : +gap.toFixed(2),
      why: top.score < MIN_SCORE ? 'no candidate scores high enough — the paper is probably not in this list'
        : 'two candidates are too close to call' });
  }
});

console.log(`[rank] ${rows.length} ambiguous rows`);
console.log(`[rank]   ranked to a single confident answer: ${picked.length}`);
console.log(`[rank]   still genuinely open: ${stillOpen.length}`);
const lowScore = stillOpen.filter((r) => (r.bestScore ?? 0) < MIN_SCORE).length;
console.log(`[rank]     of those, ${lowScore} because the right paper is NOT among the candidates (needs a new query, not a human)`);
console.log(`[rank]     and ${stillOpen.length - lowScore} because two candidates are genuinely close (needs a human)`);

fs.writeFileSync(path.join(ROOT, 'data', 'citation_ranked.json'),
  JSON.stringify({ picked, stillOpen }, null, 1));
console.log('[rank] wrote data/citation_ranked.json — PROPOSALS ONLY, nothing written into the corpus.');

// ---- PHASE 2: re-query the rows where the paper is not in the candidate list -----------------
// Ranking fixed the SELECTION failure. It cannot fix a RETRIEVAL failure — 89 rows scored nothing
// above the floor, which means the right paper was never returned. Those need a different query.
//
// The original searched AUTH + PUB_YEAR (+ the compound as a TITLE term). That finds papers BY the
// author ABOUT the compound, which is not the same as the paper that reports THIS finding. A person
// would search the distinctive words of the claim itself. So: pull the rarest content words out of
// the finding and use them as TITLE/ABSTRACT terms, keeping the author as a filter rather than the
// anchor. Run with --requery (network) to execute; it prints proposals and writes nothing.
async function requery(rows, search) {
  const STOPQ = new Set(('significant significantly increase increased decrease decreased improve improved reduce ' +
    'reduced higher lower versus compared showed found study trial group groups week weeks day days').split(' '));
  const out = [];
  for (const r of rows) {
    const words = [...new Set(toks(r.finding))].filter((w) => w.length > 5 && !STOPQ.has(w)).slice(0, 4);
    const subject = (String(r.path).match(/^compound_learn\.([^.]+)/) || [])[1] || '';
    const subj = subject.split('-').filter((w) => w.length > 3)[0] || '';
    if (!words.length && !subj) { out.push({ ...r, requery: 'no distinctive terms to search on' }); continue; }
    const terms = [subj, ...words].filter(Boolean).map((w) => `"${w}"`).join(' AND ');
    const p = parseRefYear(r.ref);
    const q = `(${terms})${p ? ` AND PUB_YEAR:${p}` : ''}`;
    try {
      const hits = await search(q, 6);
      const scored = hits.map((c) => ({ c, ...scoreCandidate({ title: c.title, pmid: c.pmid, journal: c.journalTitle }, r) }))
        .sort((a, b) => b.score - a.score);
      out.push({ ...r, requery: q, nHits: hits.length,
        best: scored[0] ? { pmid: scored[0].c.pmid, title: scored[0].c.title, score: scored[0].score, reasons: scored[0].reasons } : null });
    } catch (e) { out.push({ ...r, requery: q, error: e.message }); }
    await new Promise((z) => setTimeout(z, 130));
  }
  return out;
}
function parseRefYear(ref) { const m = String(ref).match(/\b(19|20)\d{2}\b/g); return m ? m[m.length - 1] : null; }

if (args.includes('--requery')) {
  const search = async (query, n) => {
    const u = 'https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=' +
      encodeURIComponent(query) + `&format=json&pageSize=${n}&resultType=core`;
    const res = await fetch(u, { headers: { 'User-Agent': 'rnawiki-citation-ranker/1.0' }, signal: AbortSignal.timeout(25000) });
    if (!res.ok) throw new Error('europepmc ' + res.status);
    const j = await res.json();
    return (j.resultList && j.resultList.result) || [];
  };
  const targets = stillOpen.filter((r) => (r.bestScore ?? 0) < MIN_SCORE);
  const LIM = num('--limit', targets.length);
  requery(targets.slice(0, LIM), search).then((res) => {
    const found = res.filter((r) => r.best && r.best.score >= MIN_SCORE);
    console.log(`[requery] ${res.length} rows re-queried on the claim's own words`);
    console.log(`[requery]   now score above the floor: ${found.length}`);
    fs.writeFileSync(path.join(ROOT, 'data', 'citation_requeried.json'), JSON.stringify(res, null, 1));
    console.log('[requery] wrote data/citation_requeried.json — proposals only.');
  });
}
