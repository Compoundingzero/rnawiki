#!/usr/bin/env node
// build/verify_citations.js — check a proposal against the paper's ABSTRACT, not just its title.
//
// The gap this closes: ranking says the TITLE looks right. It cannot say the paper supports the
// CLAIM. Batch 2 measured that gap — of 117 title-plausible proposals a human accepted 47 as-is,
// needed 62 corrected, and rejected 8. So handing over 118 unverified proposals just moves the
// work back to Felix, which is what parking them was avoiding.
//
// An abstract is a much stronger test than a title: it carries the population, the design, the
// direction of effect and usually the headline number. Most mismatches die here without a human.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchAbstracts(pmids) {
  const out = {};
  for (let i = 0; i < pmids.length; i += 20) {
    const batch = pmids.slice(i, i + 20).filter(Boolean);
    if (!batch.length) continue;
    const u = 'https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=' +
      encodeURIComponent(batch.map((p) => `EXT_ID:${p}`).join(' OR ')) +
      '&format=json&pageSize=25&resultType=core';
    try {
      const r = await fetch(u, { headers: { 'User-Agent': 'rnawiki-verify/1.0' }, signal: AbortSignal.timeout(30000) });
      const j = await r.json();
      ((j.resultList || {}).result || []).forEach((x) => {
        if (x.pmid) out[x.pmid] = { title: x.title || '', abstract: x.abstractText || '', types: (x.pubTypeList || {}).pubType || [] };
      });
    } catch (e) { /* a fetch failure must not lose the row */ }
    await sleep(150);
    process.stdout.write(`\r[verify] abstracts ${Math.min(i + 20, pmids.length)}/${pmids.length}`);
  }
  process.stdout.write('\n');
  return out;
}

// Signals that an abstract genuinely covers a claim, each independently checkable by a reader.
function checkAgainstAbstract(claim, rec) {
  const ab = String(rec.abstract || '');
  if (!ab) return { verdict: 'no-abstract', score: 0, notes: ['Europe PMC has no abstract for this record'] };
  const notes = []; let s = 0;
  const nums = (t) => new Set((String(t).match(/\b\d+(?:\.\d+)?\b/g) || []).filter((n) => +n >= 2));
  const cn = nums(claim), an = nums(ab);
  const shared = [...cn].filter((n) => an.has(n));
  if (shared.length) { s += Math.min(4, shared.length * 1.5); notes.push(`abstract repeats the figure(s) ${shared.slice(0, 4).join(', ')}`); }
  const STOP = new Set('the a an of to in and or is are it that this for from with on at by as was were'.split(' '));
  const words = (t) => new Set((String(t).toLowerCase().match(/[a-z][a-z-]{4,}/g) || []).filter((w) => !STOP.has(w)));
  const cw = words(claim), aw = words(ab);
  const ov = [...cw].filter((w) => aw.has(w));
  const cov = cw.size ? ov.length / cw.size : 0;
  s += cov * 6; notes.push(`${Math.round(cov * 100)}% of the claim's distinctive words appear in the abstract`);
  const DIR = [[/\bincreas|\braise|\bimprov|\bhigher|\bgreater/i, /\bincreas|\braise|\bimprov|\bhigher|\bgreater/i],
               [/\breduc|\bdecreas|\blower|\bprevent|\bslow/i, /\breduc|\bdecreas|\blower|\bprevent|\bslow/i],
               [/\bno (?:significant )?(?:change|effect|benefit|difference)|\bfailed|\bdid not/i, /\bno (?:significant )?(?:change|effect|benefit|difference)|\bfailed|\bdid not/i]];
  const dirHit = DIR.filter(([c, a]) => c.test(claim) && a.test(ab)).length;
  if (dirHit) { s += 2; notes.push('direction of effect agrees'); }
  else if (DIR.some(([c]) => c.test(claim))) { s -= 2; notes.push('claim states a direction the abstract does not'); }
  const verdict = s >= 7 ? 'strong' : s >= 4.5 ? 'plausible' : 'weak';
  return { verdict, score: +s.toFixed(2), notes };
}

(async () => {
  const ranked = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'citation_ranked.json'), 'utf8'));
  const req = fs.existsSync(path.join(ROOT, 'data', 'citation_requeried.json'))
    ? JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'citation_requeried.json'), 'utf8')) : [];
  const props = [
    ...ranked.picked.map((p) => ({ ref: p.ref, path: p.path, finding: p.finding, pmid: p.pmid, title: p.title, via: 'ranked' })),
    ...req.filter((r) => r.best && r.best.score >= 3).map((r) => ({ ref: r.ref, path: r.path, finding: r.finding, pmid: r.best.pmid, title: r.best.title, via: 'requeried' })),
  ].filter((p) => p.pmid);
  console.log(`[verify] ${props.length} proposals to check against their abstracts`);
  const recs = await fetchAbstracts([...new Set(props.map((p) => String(p.pmid)))]);
  const out = props.map((p) => ({ ...p, ...checkAgainstAbstract(p.finding, recs[String(p.pmid)] || {}) }));
  const by = {}; out.forEach((o) => { by[o.verdict] = (by[o.verdict] || 0) + 1; });
  console.log('[verify] ' + Object.entries(by).map(([k, v]) => `${k}: ${v}`).join(' · '));
  fs.writeFileSync(path.join(ROOT, 'data', 'citation_verified.json'), JSON.stringify(out, null, 1));
  console.log('[verify] wrote data/citation_verified.json — still proposals only.');
})();
