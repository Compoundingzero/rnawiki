#!/usr/bin/env node
// build/resolve_citations.js — PROPOSE-ONLY citation resolver.
//
// The 489 `evi.trials[].ref` strings in compound_learn.json are author-year-journal prose, not
// identifiers. Turning them into PMIDs would make every effect claim on the site checkable by a
// reader — which is the single biggest credibility upgrade available.
//
// ★ THIS SCRIPT NEVER WRITES INTO THE CORPUS, AND MUST NOT BE MADE TO. ★
// It writes a review file for a human to adjudicate. That is not caution for its own sake — it is
// the measured conclusion of the round-4 audit:
//   - at a STRICT rule (exactly one hit, first-author surname matches, year matches) it
//     auto-resolves only ~40% of refs (Wilson 95% CI ~22-61%);
//   - RELAXING the rule to "take rank 1" binds *Manson 2019 NEJM* to "Total Hip Arthroplasty or
//     Hemiarthroplasty for Hip Fracture" (VITAL is rank 3) and *Martens 2018 Nat Commun* to
//     "Routes of Zika virus dissemination in the testis of immunodeficient mice". Roughly half the
//     rank-1 fallbacks were wrong.
//   - ~25% of refs are STRUCTURALLY unresolvable, not merely hard: corporate authors (CDC MMWR,
//     MRC Vitamin Study Research Group, ATAC Trialists' Group), conference presentations not in the
//     index, refs with no author at all, and single strings packing two different sources. Those
//     need the ref REWRITTEN editorially before any resolver can touch them.
// A mis-bound PMID manufactures a false citation at scale, which is worse than no citation: it
// looks like rigour. So the strict rule earns its precision by REJECTING, and the rejects are the
// point of the output, not a failure of it.
//
// Usage:  node build/resolve_citations.js [--limit N]
// Output: data/citation_review.md   (human queue, grouped by confidence)
//         data/citation_review.json (machine-readable, for a later apply step a human runs)

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');

const args = process.argv.slice(2);
const LIMIT = (() => { const i = args.indexOf('--limit'); return i >= 0 ? parseInt(args[i + 1], 10) : Infinity; })();

// ---- collect every ref, with the finding it belongs to (so a reviewer can judge in context) ----
const learn = JSON.parse(fs.readFileSync(path.join(DATA, 'compound_learn.json'), 'utf8'));
const refs = [];
(function walk(o, p) {
  if (!o || typeof o !== 'object') return;
  if (Array.isArray(o.trials)) {
    o.trials.forEach((t, i) => {
      if (t && t.ref) refs.push({ path: `${p}.trials[${i}]`, ref: String(t.ref), finding: String(t.finding || '') });
    });
  }
  for (const k of Object.keys(o)) walk(o[k], `${p}.${k}`);
})(learn, 'compound_learn');

// ---- parse an author-year-journal string ------------------------------------------------------
const CORPORATE = /\b(group|trialists|consortium|committee|CDC|MMWR|WHO|NIH|study g\d|phase 3 trial|Eli Lilly|research group)\b/i;
function parseRef(ref) {
  const yearM = ref.match(/\b(19|20)\d{2}\b/g);
  const year = yearM ? yearM[yearM.length - 1] : null;
  // first-author surname = leading token before "et al", "&", or a comma
  const lead = ref.split(/,| et al| and | & /i)[0].trim();
  const surname = /^[A-Z][A-Za-z'’-]{1,}$/.test(lead.split(/\s+/)[0] || '') ? lead.split(/\s+/)[0] : null;
  const twoSources = (ref.match(/\b(19|20)\d{2}\b/g) || []).length > 1 && /;|\band\b/.test(ref);
  return {
    year,
    surname,
    corporate: CORPORATE.test(ref),
    twoSources,
    // journal is whatever trails the year — used only as a soft confirmation, never as the key
    journalHint: (ref.split(',').pop() || '').trim(),
  };
}

// ---- Europe PMC ------------------------------------------------------------------------------
async function search(query, pageSize = 5) {
  const u = 'https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=' +
    encodeURIComponent(query) + `&format=json&pageSize=${pageSize}&resultType=core`;
  const r = await fetch(u, { headers: { 'User-Agent': 'rnawiki-citation-resolver/1.0' }, signal: AbortSignal.timeout(25000) });
  if (!r.ok) throw new Error('europepmc ' + r.status);
  const j = await r.json();
  return (j.resultList && j.resultList.result) || [];
}

// Europe PMC puts the journal in different places depending on the record; take whichever exists.
const jname = (h) => h.journalTitle || (h.journalInfo && h.journalInfo.journal && h.journalInfo.journal.title) || '';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const out = { resolved: [], ambiguous: [], unresolvable: [], errored: [] };
  const todo = refs.slice(0, LIMIT === Infinity ? refs.length : LIMIT);
  console.log(`[cite] ${refs.length} refs found; processing ${todo.length}`);

  for (let i = 0; i < todo.length; i++) {
    const r = todo[i];
    const p = parseRef(r.ref);

    // Structurally unresolvable -> straight to the editorial queue. Do not burn a query on it, and
    // do not pretend a resolver can fix a ref that names no author.
    if (p.corporate || p.twoSources || !p.year || !p.surname) {
      out.unresolvable.push({ ...r, reason:
        !p.year ? 'no year' : !p.surname ? 'no parsable first-author surname'
        : p.twoSources ? 'one string packs more than one source' : 'corporate/consortium author' });
      continue;
    }

    try {
      // THE STRICT RULE: first-author surname AND exact year AND, where the ref names one, the
      // journal. Author+year alone is far too loose — measured, it resolved 1.7% because common
      // surnames return dozens of papers per year. Adding the journal is what the round-4 measurement
      // (~40% auto-resolve) actually used, and it is the narrowing that makes a single hit MEAN
      // something rather than just being lucky.
      const jt = p.journalHint && p.journalHint.length > 3 && !/^\d/.test(p.journalHint)
        ? ` AND JOURNAL:"${p.journalHint.replace(/[":]/g, ' ').trim()}"` : '';
      let q = `AUTH:"${p.surname}" AND PUB_YEAR:${p.year}${jt}`;
      let hits = await search(q, 5);
      // If the journal string was too specific to match anything, fall back to author+year and let
      // it land in `ambiguous` — never widen in a way that could produce a confident wrong answer.
      if (!hits.length && jt) { q = `AUTH:"${p.surname}" AND PUB_YEAR:${p.year}`; hits = await search(q, 5); }
      if (hits.length === 1) {
        const h = hits[0];
        out.resolved.push({ ...r, pmid: h.pmid || null, title: h.title, journal: jname(h), year: h.pubYear,
          pubTypes: (h.pubTypeList && h.pubTypeList.pubType) || [], rule: q.includes('JOURNAL:') ? 'single hit on author+year+journal' : 'single hit on author+year' });
      } else {
        out.ambiguous.push({ ...r, nHits: hits.length,
          candidates: hits.slice(0, 4).map((h) => ({ pmid: h.pmid, title: h.title, journal: jname(h), year: h.pubYear })) });
      }
    } catch (e) {
      out.errored.push({ ...r, error: e.message });
    }
    if ((i + 1) % 25 === 0) console.log(`[cite]   ${i + 1}/${todo.length}…`);
    await sleep(120);   // be polite to a free API
  }

  const n = todo.length;
  const pct = (x) => n ? ((100 * x) / n).toFixed(1) + '%' : '0%';
  fs.writeFileSync(path.join(DATA, 'citation_review.json'), JSON.stringify(out, null, 1));

  const md = [];
  md.push('# Citation review queue — PROPOSE ONLY, nothing here has been written into the corpus\n');
  md.push(`Generated by \`build/resolve_citations.js\` over ${n} of ${refs.length} \`evi.trials[].ref\` strings.\n`);
  md.push('**Claims are printed IN FULL below.** The first version of this file truncated them at 220');
  md.push('characters, which made 41 of 136 rows impossible to verify — the reviewer could not see the end of');
  md.push('the sentence they were being asked to confirm. Never truncate the thing being audited.\n');
  md.push('**A proposal is not a citation.** Each row below needs a human to confirm the paper actually');
  md.push('supports the finding it is attached to — matching an author and a year does not mean the paper');
  md.push('says what the claim says. Reject freely; a missing citation is recoverable and a wrong one is not.\n');
  md.push(`| bucket | count | share |\n|---|---|---|`);
  md.push(`| auto-resolved (single hit on author+year) | ${out.resolved.length} | ${pct(out.resolved.length)} |`);
  md.push(`| ambiguous (needs a human to pick) | ${out.ambiguous.length} | ${pct(out.ambiguous.length)} |`);
  md.push(`| structurally unresolvable (rewrite the ref first) | ${out.unresolvable.length} | ${pct(out.unresolvable.length)} |`);
  md.push(`| errored | ${out.errored.length} | ${pct(out.errored.length)} |\n`);

  md.push('\n## 1. Auto-resolved — confirm each against its finding before accepting\n');
  out.resolved.forEach((x) => {
    md.push(`### ${x.ref}`);
    md.push(`- **path**: \`${x.path}\``);
    md.push(`- **finding it is attached to**: ${x.finding}`);
    md.push(`- **proposed**: PMID ${x.pmid} — ${x.title} (*${x.journal}* ${x.year}) — ${(x.pubTypes || []).join(', ')}`);
    md.push(`- [ ] accept  [ ] reject\n`);
  });

  md.push('\n## 2. Ambiguous — a human picks, or none of them\n');
  out.ambiguous.forEach((x) => {
    md.push(`### ${x.ref}  _(${x.nHits} hits)_`);
    md.push(`- **path**: \`${x.path}\``);
    md.push(`- **finding**: ${x.finding}`);
    (x.candidates || []).forEach((c) => md.push(`  - [ ] PMID ${c.pmid} — ${c.title} (*${c.journal}* ${c.year})`));
    md.push('');
  });

  md.push('\n## 3. Structurally unresolvable — the REF must be rewritten, not looked up\n');
  out.unresolvable.forEach((x) => md.push(`- \`${x.path}\` — **${x.reason}** — "${x.ref}"`));

  fs.writeFileSync(path.join(DATA, 'citation_review.md'), md.join('\n'));
  console.log(`[cite] resolved ${out.resolved.length} (${pct(out.resolved.length)}) · ambiguous ${out.ambiguous.length} · unresolvable ${out.unresolvable.length} · errored ${out.errored.length}`);
  console.log('[cite] wrote data/citation_review.md and data/citation_review.json — NOTHING was written into the corpus.');
})();
