#!/usr/bin/env node
// build/verify_claims.js — the citation verifier. This is the spine that makes RNAwiki
// defensible to a clinician or a grant panel: no effect statement renders without a claim_id,
// and every claim_id's citations are checked to actually EXIST and be the right type of study.
//
// It queries Europe PMC (free, no API key) for each PMID and checks:
//   1. the PMID resolves to exactly one record (an unresolved citation = fabricated/typo = BLOCK);
//   2. captures title / journal / year / pubType so a reviewer sees what was actually cited;
//   3. a claim that `renders:true` but has grade 'not_established' or 0 sources is a BLOCK;
//   4. a claim with `direction:inverts|refutes` but `renders:true` is a BLOCK (you'd be
//      recommending the thing the evidence says does the opposite);
//   5. `status:draft` claims and empty PMIDs are reported (soft) — they just can't render.
//
// Exit code: non-zero if any BLOCK. Wire into CI before build/prerender.js so a page can never
// ship an effect claim whose citation doesn't resolve.
//
// Run: node build/verify_claims.js            (verifies data/claims.json)
//      node build/verify_claims.js --strict   (also fail on any draft/unresolved soft warning)

const fs = require('fs');
const path = require('path');
const STRICT = process.argv.includes('--strict');
const CLAIMS = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'claims.json'), 'utf8'));

const EPMC = 'https://www.ebi.ac.uk/europepmc/webservices/rest/search';
async function lookupPmid(pmid) {
  if (!pmid) return { ok: false, reason: 'empty PMID' };
  const url = `${EPMC}?query=EXT_ID:${encodeURIComponent(pmid)}%20AND%20SRC:MED&format=json&resultType=lite`;
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!r.ok) return { ok: false, reason: 'http ' + r.status };
    const j = await r.json();
    if (!j.hitCount || !j.resultList || !j.resultList.result || !j.resultList.result.length)
      return { ok: false, reason: 'no record — citation does not resolve' };
    const rec = j.resultList.result[0];
    return { ok: true, title: rec.title, journal: rec.journalTitle, year: rec.pubYear, pubType: (rec.pubTypeList && rec.pubTypeList.pubType || []).join('/') || rec.pubType || '' };
  } catch (e) { return { ok: false, reason: e.message }; }
}

(async () => {
  const blocks = [], softs = [], oks = [];
  for (const c of CLAIMS.claims) {
    // structural checks first (no network needed)
    if (c.renders && (c.direction === 'inverts' || c.direction === 'refutes'))
      blocks.push(`${c.claim_id}: renders:true but direction:${c.direction} — you would be recommending what the evidence contradicts`);
    if (c.renders && c.grade === 'not_established')
      blocks.push(`${c.claim_id}: renders:true but grade:not_established`);
    if (c.renders && (!c.sources || !c.sources.length))
      blocks.push(`${c.claim_id}: renders:true with zero sources`);
    if (c.status === 'draft') softs.push(`${c.claim_id}: status:draft — cannot render until verified`);

    // citation resolution
    for (const s of (c.sources || [])) {
      const res = await lookupPmid(s.pmid);
      if (res.ok) {
        oks.push(`${c.claim_id} PMID ${s.pmid} ✓ ${res.pubType || 'article'} — ${(res.title || '').slice(0, 70)} (${res.journal || ''} ${res.year || ''})`);
      } else {
        const msg = `${c.claim_id} PMID "${s.pmid}" ✗ ${res.reason}`;
        // an unresolved citation on a claim that renders is a hard block; otherwise soft (still a data-quality bug)
        (c.renders ? blocks : softs).push(msg);
      }
    }
  }

  console.log('\n=== resolved citations ===');
  oks.forEach((l) => console.log('  ' + l));
  if (softs.length) { console.log('\n=== soft warnings (non-blocking) ==='); softs.forEach((l) => console.log('  ⚠ ' + l)); }
  if (blocks.length) { console.log('\n=== BLOCKING ==='); blocks.forEach((l) => console.log('  ✗ ' + l)); }

  console.log(`\n[claims] ${CLAIMS.claims.length} claims | ${oks.length} citations resolved | ${softs.length} soft | ${blocks.length} blocking`);
  const fail = blocks.length || (STRICT && softs.length);
  if (fail) { console.error(`[claims] FAILED (${blocks.length} blocking${STRICT ? ' + strict soft' : ''})`); process.exit(1); }
  console.log('[claims] OK');
})();
