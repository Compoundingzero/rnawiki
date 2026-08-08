#!/usr/bin/env node
// Parses content/*.md (the source of truth) into site/data.js.
// Run: node build/parse.js   — regenerate whenever the markdown changes.

const fs = require('fs');
const path = require('path');
const vm = require('vm'); // site/interactions.js is a browser file; assertInteractionCoverage() runs it in a sandbox

const ROOT = path.join(__dirname, '..');
const CONTENT = path.join(ROOT, 'content');
const OUT = path.join(ROOT, 'site', 'data.js');

const APPROVAL = ['🟢', '🟡', '🔵', '🟠', '🔴', '⚫'];
const BADGE_CHARS = [...APPROVAL, '⭐', '⚠'];

// W5a (2026-08-02): 🟡 and 🔵 RELABELLED onto the regulator axis. They read "OTC Supplement" and
// "Prescription" — two shop instructions sitting in a table of regulator decisions, on a site whose
// authored `regulatory_class` answers that question separately and disagreed with them on 24 of 171
// compounds. Per Felix's decision, a colour here is the FDA's or the relevant global regulator's
// current CALL ON THE MOLECULE and nothing else; how you actually get it has its own carrier now
// (see SUPPLY_BY_CLASS). assertRegulatoryAxes() fails the build if a label goes back to retail
// wording. "FDA Approved", "Off-Label", "Not Approved" and "Controlled" were already regulator
// calls and are unchanged.
const APPROVAL_LABEL = {
  '🟢': 'FDA Approved',
  '🟡': 'Regulated as a supplement',
  '🔵': 'Prescription-only medicine',
  '🟠': 'Off-Label',
  '🔴': 'Not Approved',
  '⚫': 'Controlled',
};

// ---- W5a (2026-08-02): A RATING IS CARRIED BY ITS TEXT, NEVER BY A COLOUR ---------------------
// site/app.js rendered the evidence chip as
//     `${'★'.repeat(c.stars)}<span class="sc-dim">${'★'.repeat(5 - c.stars)}</span> ${tier}`
// — FIVE FILLED STARS on every compound, the empty ones told apart only by
// `.spec-chip .sc-dim{color:var(--line)}`. Measured hydrated at 390x844 on /c/bpc-157 (a ONE-star
// compound), 0 pageerrors:
//     outerHTML  <span class="sc-k">Evidence</span><span class="sc-v">★<span class="sc-dim">★★★★</span> Minimal</span>
//     innerText  "EVIDENCE\n★★★★★ Minimal"
//     .sc-dim computed colour rgb(233,237,242) on card rgb(246,248,250) = 1.10:1
// 148 of 171 compounds carry dim glyphs (star distribution 5★=23, 4★=42, 3★=58, 2★=32, 1★=3,
// 0★=13), so every text extractor, screen reader, LLM crawler and copy-paste read a 1-star
// compound as five stars. WCAG 1.4.1 forbids colour as the sole carrier; this is also the single
// most consequential honesty defect measured on the site, because the star is the site's whole
// evidence claim.
//
// The table lives HERE, in the build, and is emitted into site/data.js, so the renderer cannot
// keep a second copy that drifts. Three parallel arrays, indexed by the star count 0–5:
//   glyphs — the picture. The EMPTY slot is a DIFFERENT CHARACTER (☆), never ★ in another colour.
//   text   — what survives when every glyph is stripped. This is what a text extractor gets, and
//            it alone must identify the rating.
//   aria   — the accessible name. 171 star badges shipped with aria-label = null and role = null;
//            the only description was a `title` on a bare <span>, which is not an accessible name
//            and never surfaces on touch.
// Index 0 is deliberately NOT "☆☆☆☆☆": the 13 "(brief)" bundles are UNRATED, and a rating widget
// reporting the worst possible score for a page that was never rated is a false low, which is a
// lie in the other direction. assertRatingIsTextCarried() below is the gate.
const RATING = {
  glyphs: ['', '★☆☆☆☆', '★★☆☆☆', '★★★☆☆', '★★★★☆', '★★★★★'],
  compact: ['', '★', '★★', '★★★', '★★★★', '★★★★★'],
  text: ['Not yet rated', '1 of 5', '2 of 5', '3 of 5', '4 of 5', '5 of 5'],
  aria: [
    'Human evidence: not yet rated',
    'Human evidence: 1 out of 5 stars',
    'Human evidence: 2 out of 5 stars',
    'Human evidence: 3 out of 5 stars',
    'Human evidence: 4 out of 5 stars',
    'Human evidence: 5 out of 5 stars',
  ],
};

// Canonical goals for the "wants-first" home grid. Match compound goal-text by keyword.
const GOALS = [
  { id: 'muscle', label: 'Build Muscle & Strength', icon: '💪', keys: ['muscle', 'strength', 'power', 'anabolic', 'hypertrophy'] },
  { id: 'fatloss', label: 'Lose Fat', icon: '🔥', keys: ['fat loss', 'fat oxidation', 'weight', 'appetite', 'thermogen', 'lipolysis'] },
  { id: 'endurance', label: 'Endurance', icon: '🏃', keys: ['endurance', 'vo2', 'aerobic', 'stamina', 'oxygen'] },
  { id: 'recovery', label: 'Recover Faster', icon: '🔧', keys: ['recover', 'healing', 'repair', 'soreness', 'inflammation'] },
  { id: 'sleep', label: 'Sleep Better', icon: '😴', keys: ['sleep', 'circadian', 'deep sleep'] },
  { id: 'focus', label: 'Focus & Cognition', icon: '🧠', keys: ['focus', 'cognition', 'memory', 'wakeful', 'alert', 'nootropic', 'fatigue resist', 'attention'] },
  { id: 'longevity', label: 'Live Longer', icon: '⏳', keys: ['longevity', 'aging', 'healthspan', 'senolytic', 'autophagy', 'mitochond'] },
  { id: 'joints', label: 'Joint Health', icon: '🦴', keys: ['joint', 'connective', 'tendon', 'ligament', 'cartilage'] },
  { id: 'heart', label: 'Cardiovascular', icon: '❤️', keys: ['cardiovascular', 'heart', 'blood pressure', 'cholesterol', 'lipid', 'ldl'] },
  { id: 'hormones', label: 'Hormones & Testosterone', icon: '⚡', keys: ['testosterone', 'hormon', 'libido', 'estrogen', 'thyroid', 'androgen', 'growth hormone', 'igf'] },
  { id: 'stress', label: 'Stress & Anxiety', icon: '🧘', keys: ['stress', 'anxiety', 'calm', 'mood', 'cortisol', 'depression'] },
  { id: 'sexual', label: 'Sexual Health', icon: '❤️‍🔥', keys: ['libido', 'sexual', 'erectile', 'desire'] },
  { id: 'gut', label: 'Gut Health', icon: '🌱', keys: ['gut', 'digest', 'microbiome', 'probiotic'] },
  { id: 'immune', label: 'Immunity', icon: '🛡️', keys: ['immune', 'immunity', 'antimicrobial'] },
  { id: 'skin', label: 'Skin & Hair', icon: '✨', keys: ['skin', 'hair', 'collagen', 'aesthetic', 'anti-aging'] },
  { id: 'bone', label: 'Bone Health', icon: '🦴', keys: ['bone', 'density'] },
];

// Hand-assigned goals for the 12 compounds whose curated `goals`/`category` fields contain no
// goal keyword. See the note at the goalIds assignment below for why prose matching was removed.
const GOAL_OVERRIDES = {
  // Selective androgen / PPAR agonists — unapproved. Listed for completeness with a "Not approved"
  // badge; assigning the goal they are actually taken for is more honest than hiding them.
  'Ostarine (MK-2866, Enobosarm)': ['muscle'],
  'Ligandrol (LGD-4033)': ['muscle'],
  'Testolone (RAD-140)': ['muscle'],
  'Andarine (S4) · YK-11 · S-23': ['muscle'],
  'Cardarine (GW-501516)': ['endurance'],
  'Stenabolic (SR9009)': ['endurance'],
  // Micronutrients — the goal is the deficiency they correct.
  'Vitamin C (Ascorbate)': ['immune', 'skin'],
  'B-Complex / B12 / Methylfolate / B6': ['focus'],
  'Iron': ['endurance', 'focus'],
  'Iodine / Selenium': ['hormones'],
  'Niacin / NADH (Vitamin B3)': ['heart'],
  // Controlled; endurance is what it is misused for.
  'EPO (Erythropoietin)': ['endurance'],
};


// Official gene names for targets whose COMPENDIUM link text is just the bare symbol.
// Added 2026-07-28: 19 of the 103 /target/ pages rendered an <h1> that was only the gene symbol
// ("PPARA", "MTHFR", "PCSK9"), because parse.js takes the target name from the markdown LINK TEXT
// and that text is sometimes only the symbol. Fetched from NCBI Gene esummary, not written from
// memory. Used only as a fallback when the authored name adds nothing beyond the symbol.
const GENE_FULL_NAME = {
  'ABL1': 'ABL proto-oncogene 1, non-receptor tyrosine kinase',
  'COMT': 'catechol-O-methyltransferase',
  'COQ2': 'coenzyme Q2, polyprenyltransferase',
  'CRAT': 'carnitine O-acetyltransferase',
  'EP300': 'EP300 lysine acetyltransferase',
  'EPOR': 'erythropoietin receptor',
  'FFAR4': 'free fatty acid receptor 4',
  'FFAR4/GPR120': 'free fatty acid receptor 4',
  'GABRB2': 'gamma-aminobutyric acid type A receptor subunit beta2',
  'GSK3B': 'glycogen synthase kinase 3 beta',
  'IGF1': 'insulin like growth factor 1',
  'KDR': 'kinase insert domain receptor',
  'KDR/VEGFR2': 'kinase insert domain receptor',
  'MTHFR': 'methylenetetrahydrofolate reductase',
  'MAOA': 'monoamine oxidase A',
  'MTOR': 'mechanistic target of rapamycin kinase',
  'NFE2L2': 'NFE2 like bZIP transcription factor 2',
  'NFE2L2/NRF2': 'NFE2 like bZIP transcription factor 2',
  'PCSK9': 'proprotein convertase subtilisin/kexin type 9',
  'PPARA': 'peroxisome proliferator activated receptor alpha',
  'SHBG': 'sex hormone binding globulin',
  'TET2': 'tet methylcytosine dioxygenase 2',
  'TLR9': 'toll like receptor 9',
};

// ---- minimal markdown -> HTML ----------------------------------------------
function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function inline(s) {
  // links first (before escaping would break them) — do a protected pass
  const links = [];
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, t, u) => {
    const internal = /^(#|\/)(?!\/)/.test(u);
    links.push(internal ? `<a href="${u}">${esc(t)}</a>` : `<a href="${u}" target="_blank" rel="noopener">${esc(t)}</a>`);
    return ` ${links.length - 1} `;
  });
  s = esc(s);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/ (\d+) /g, (m, i) => links[+i]);
  return s;
}
function block(md) {
  const lines = md.split('\n');
  let html = '', list = null;
  const closeList = () => { if (list) { html += `</${list}>`; list = null; } };
  for (let raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim()) { closeList(); continue; }
    if (/^---+$/.test(line)) { closeList(); html += '<hr>'; continue; }
    let m;
    if ((m = line.match(/^(#{1,4})\s+(.*)$/))) { closeList(); const n = m[1].length; html += `<h${n}>${inline(m[2])}</h${n}>`; continue; }
    if ((m = line.match(/^[-*]\s+(.*)$/))) { if (list !== 'ul') { closeList(); list = 'ul'; html += '<ul>'; } html += `<li>${inline(m[1])}</li>`; continue; }
    if ((m = line.match(/^\d+\.\s+(.*)$/))) { if (list !== 'ol') { closeList(); list = 'ol'; html += '<ol>'; } html += `<li>${inline(m[1])}</li>`; continue; }
    closeList(); html += `<p>${inline(line)}</p>`;
  }
  closeList();
  return html;
}

// ---- parse compendium -------------------------------------------------------
function firstBadgeIdx(chars) {
  for (let i = 0; i < chars.length; i++) if (BADGE_CHARS.includes(chars[i])) return i;
  return -1;
}
function parseCompendium(md) {
  const lines = md.split('\n');
  let category = '', out = [], cur = null, buf = [];
  const numMap = {}; // category number -> canonical name (for EXPANSION "Additions to CATEGORY N")
  const flush = () => {
    if (!cur) return;
    cur.raw = buf.join('\n').trim();
    // extract fields
    const field = (name) => {
      const re = new RegExp(`^\\*\\*${name}:?\\*\\*\\s*(.*)$`, 'i');
      for (const l of buf) { const m = l.match(re); if (m) return m[1].trim(); }
      return '';
    };
    cur.goals = field('Goals').split('·').map(s => s.trim()).filter(Boolean);
    cur.mechanism = field('Technical mechanism');
    cur.target = field('Molecular target');
    cur.plain = field('In plain English');
    cur.protocol = field('Protocol');
    cur.watch = field('Watch out');
    cur.bottom = field('Bottom line');
    cur.stacksWith = field('Stacks with');   // curated synergy pairs
    cur.avoid = field('Avoid');               // curated interaction warnings (safety)
    cur.cost = field('Cost');                 // curated SG price/where-to-buy
    cur.evidence = field('Human evidence');   // curated landmark human trials (collapsible)
    // gene/pubchem links
    cur.geneLinks = (cur.raw.match(/ncbi\.nlm\.nih\.gov\/gene/gi) || []).length;
    cur.pubchem = (cur.raw.match(/pubchem\.ncbi\.nlm\.nih\.gov/gi) || []).length;
    // molecular targets: NCBI Gene links whose text names the gene/receptor
    const seenSym = {};
    cur.targets = [];
    const re = /\[([^\]]+)\]\((https?:\/\/[^)]*ncbi\.nlm\.nih\.gov\/gene[^)]*)\)/gi;
    let mm;
    while ((mm = re.exec(cur.raw))) {
      let txt = mm[1].replace(/\((?:NCBI Gene[^)]*|NCBI)\)/gi, '').trim();
      const sym = (txt.split(/\s+/)[0] || '').replace(/[^A-Za-z0-9αβγδ/\-]/g, '');
      if (!sym || sym.length > 12) continue;
      const key = sym.toUpperCase();
      if (seenSym[key]) continue; seenSym[key] = 1;
      // Fall back to the official gene name when the link text carries no more information than
      // the symbol itself — otherwise the target page's <h1> is just "PPARA".
      const full = GENE_FULL_NAME[txt.trim()] || GENE_FULL_NAME[sym];
      if (full && txt.trim().toUpperCase() === sym.toUpperCase()) txt = full;
      cur.targets.push({ sym, name: txt, url: mm[2] });
    }
    cur.bodyHtml = block(cur.raw);
    out.push(cur);
    cur = null; buf = [];
  };
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    let m;
    if ((m = line.match(/^#\s+CATEGORY\s+(\d+)\s*[—-]\s*(.*)$/))) { flush(); category = m[2].replace(/\(.*$/, '').trim(); numMap[m[1]] = category; continue; }
    if ((m = line.match(/^##\s+Additions to CATEGORY\s+(\d+)\s*[—-]?\s*(.*)$/i))) {
      flush();
      // The NUMBER binds; the label after the dash used to be thrown away silently. That is how
      // "## Additions to CATEGORY 6 — Endurance/blood doping" filed EPO under "SARMs & SELECTIVE
      // METABOLIC AGENTS", which site/interactions.js's category-default tag then turned into a
      // rendered claim that EPO suppresses testosterone. If the author's label and the category
      // they actually addressed share no significant word, one of the two is wrong — stop the
      // build and make someone choose. All 16 other headings in COMPENDIUM.md pass this; the EPO
      // one was the only failure, which is what makes it a proven gate rather than a decoration.
      const canon = numMap[m[1]] || '';
      const STOP = new Set(['the', 'and', 'of', 'a', 'actual', 'more', 'drugs', 'sourced', 'batch', 'missing', 'essential', 'general', 'health']);
      const toks = (s) => new Set(String(s).toLowerCase().split(/[^a-z0-9]+/).filter((w) => w && !STOP.has(w)));
      const lab = toks(m[2]), can = toks(canon);
      if (canon && ![...lab].some((w) => can.has(w))) {
        console.error(`[parse] CATEGORY HEADING MISMATCH: "Additions to CATEGORY ${m[1]} — ${m[2]}" files its compounds under "${canon}", which shares no word with that label. Point the heading at the right number, or rename it to say what it actually files under.`);
        process.exit(1);
      }
      category = canon || category;
      continue;
    }
    if ((m = line.match(/^#\s+CATEGORY\s+(.*)$/))) { flush(); category = m[1].trim(); continue; }
    if (line.startsWith('### ')) {
      flush();
      const head = line.slice(4);
      const chars = [...head];
      const bi = firstBadgeIdx(chars);
      let name = bi === -1 ? head.trim() : chars.slice(0, bi).join('').trim();
      const badge = bi === -1 ? '' : chars.slice(bi).join('').trim();
      // skip pure "Also ..." note headers (no badge, starts with Also)
      const isNote = bi === -1 && /^also\b/i.test(name);
      // Evidence rating, 1–5. A badge may carry TWO runs with different provenance, e.g.
      //   "⭐⭐⭐⭐⭐ (animal) ⭐⭐⭐ (human, emerging)"
      // FIXED 2026-07-28. This used to take the strongest run regardless of its label, so
      // Rapamycin rendered FIVE stars sourced entirely from animal data — on a page whose own text
      // says no completed human longevity trial exists. That breaks the site's own editorial rule
      // ("human evidence gets the stars; animal-only data is capped at ⭐⭐ and must say animal"),
      // and it fed the FAQPage "Does X actually work?" answer, so the inflated number was the part
      // answer engines quoted. Same defect on BPC-157, Acarbose, Fisetin and D+Q.
      // The label now decides: a human run always wins; an animal-only rating is capped at 2 and
      // marked. Runs with no label are taken at face value (that is the common single-run case).
      // Classify by EXCLUSION, not inclusion. Most labels are indications, not provenance —
      // "(CV)", "(glucose)", "(recovery)", "(EAAs)" — so a whitelist of human-ish words drops them
      // to zero stars. Only an explicitly animal/preclinical label is treated as animal evidence;
      // everything else, labelled or not, is a human rating.
      const ANIMAL = /\b(animal|animals|mouse|mice|murine|rodent|rat|rats|worm|fly|flies|yeast|preclinical|in ?vitro|cell ?culture)\b/;
      const runs = [...badge.matchAll(/(⭐+)\s*(?:\(([^)]*)\))?/g)]
        .map((m) => ({ n: m[1].length, label: (m[2] || '').toLowerCase() }))
        .filter((r) => r.n > 0);
      const animal = runs.filter((r) => ANIMAL.test(r.label));
      const humanish = runs.filter((r) => !ANIMAL.test(r.label));
      let stars, animalOnly = false;
      if (humanish.length) stars = Math.max(...humanish.map((r) => r.n));
      else if (animal.length) { stars = Math.min(2, Math.max(...animal.map((r) => r.n))); animalOnly = true; }
      else stars = 0;
      stars = Math.min(5, stars);
      const approvals = [...badge].filter(c => APPROVAL.includes(c));
      // prescription / controlled / off-label all require medical supervision → flag as Rx
      const isRx = approvals.some(a => a === '🔵' || a === '⚫' || a === '🟠');
      cur = {
        name: name.replace(/\s+$/, ''),
        category,
        badge,
        stars,
        animalOnly,   // true when the ONLY evidence run is animal-labelled; the star is capped at 2
        approvals,
        approvalLabels: [...new Set(approvals.map(a => APPROVAL_LABEL[a]))],
        isRx,
        brief: /\(brief\)/i.test(name),
        isNote,
      };
      buf = [];
      continue;
    }
    if (cur) buf.push(line);
  }
  flush();
  // keep only real compounds: has a category, not a note/key/meta header
  const SKIP = /^(Approval key|Evidence key|A note on|MASTER INDEX)/i;
  return out.filter(c => !c.isNote && c.name && c.category && !SKIP.test(c.name));
}

function parseTargetExplainers(md) {
  const lines = md.split('\n'); const out = {}; let cur = null, buf = [];
  const flush = () => {
    if (cur) {
      let text = buf.filter(l => l.trim() !== '---').join('\n').trim();
      const ol = text.match(/\*\*In one line:\*\*\s*(.+)/);
      out[cur] = { oneLine: ol ? ol[1].trim() : '', html: block(text) };
    }
    cur = null; buf = [];
  };
  for (const raw of lines) {
    const m = raw.match(/^##\s+(\S+)\s*$/);
    if (m) { flush(); cur = m[1].toUpperCase(); buf = []; continue; }
    if (cur) buf.push(raw);
  }
  flush();
  return out;
}

function parseSections(md, marker) {
  // marker like '# MODULE' or '## PATHWAY'
  const lines = md.split('\n');
  const out = []; let cur = null, buf = [];
  const flush = () => {
    if (cur) {
      let text = buf.join('\n').trim();
      const dm = text.match(/```pbdiagram\s*([\s\S]*?)```/);
      if (dm) { try { cur.diagram = JSON.parse(dm[1].trim()); } catch (e) { console.warn('bad pbdiagram in', cur.title); } text = text.replace(dm[0], '').trim(); }
      const lm = text.match(/```learn\s*([\s\S]*?)```/);
      if (lm) { try { cur.learn = JSON.parse(lm[1].trim()); } catch (e) { console.warn('bad learn block in', cur.title); } text = text.replace(lm[0], '').trim(); }
      const ol = text.match(/\*\*In one line:\*\*\s*(.+)/);
      if (ol) cur.oneLine = ol[1].trim();
      cur.html = block(text);
      out.push(cur);
    }
    cur = null; buf = [];
  };
  const re = new RegExp('^' + marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
  for (const raw of lines) {
    if (re.test(raw)) { flush(); cur = { title: raw.replace(/^#+\s*/, '').trim() }; buf = []; continue; }
    if (cur) buf.push(raw);
  }
  flush();
  return out;
}

// ---- assemble ---------------------------------------------------------------
const compendium = fs.readFileSync(path.join(CONTENT, 'COMPENDIUM.md'), 'utf8');
const foundations = fs.readFileSync(path.join(CONTENT, 'FOUNDATIONS.md'), 'utf8');
const pathways = fs.readFileSync(path.join(CONTENT, 'PATHWAYS.md'), 'utf8');

// pathway keyword map — order matches PATHWAYS.md (index = pathway id used by the app router)
const PATHWAY_KW = [
  ['GPCR → cAMP', ['gpcr', 'g-protein', 'camp', 'adenosine', 'adrenergic', 'glp-1', 'glp1', 'glucagon', 'adenylate', ' pka']],
  ['Nuclear receptors', ['androgen', 'testosterone', 'anabolic', 'dht', 'nuclear receptor', 'estrogen', 'estradiol', 'aromatase', ' esr', 'vdr', 'thyroid receptor', 'ppar', 'glucocorticoid', 'retinoic', 'response element', 'transcription factor', 'steroid']],
  ['mTOR', ['mtor', 'leucine', 'rapamycin', 'mtorc']],
  ['AMPK', ['ampk', 'prkaa', 'energy sensor']],
  ['Nitric oxide / cGMP', ['nitric oxide', 'enos', 'nos3', 'cgmp', 'vasodil', 'pde5', 'nitrate', 'guanylate']],
  ['PI3K/Akt growth factor', ['pi3k', ' akt', 'tyrosine kinase', 'insulin receptor', 'igf', 'vegfr', 'kdr', 'growth factor', 'insr', 'epor']],
  ['GABA / Glutamate', ['gaba', 'glutamate', 'nmda', 'ampa recept', 'chloride channel']],
  ['Monoamines', ['dopamine', 'serotonin', 'norepinephrine', 'noradren', 'monoamine', 'reuptake', 'slc6a3', 'slc6a4', 'slc6a2', ' mao ', 'maoi', 'dopamine transporter']],
  ['Cholinergic', ['acetylcholine', 'cholinergic', 'nicotinic', 'muscarinic', 'choline', 'chat']],
  ['HPTA axis', ['hpta', 'testosterone', 'lh ', 'fsh', 'gnrh', 'leydig', 'shbg', 'lhcgr', 'testicular', 'hypogonad']],
  ['HPA axis', ['hpa axis', 'cortisol', ' crh', 'acth', 'adrenal', 'adaptogen', 'nr3c1']],
  ['Mitochondria', ['mitochond', 'electron transport', 'oxidative phosphoryl', 'coq10', 'uncoupl', 'atp synth', 'cardiolipin', 'ubiquinol']],
  ['NAD⁺ / Sirtuins', ['nad+', 'nad⁺', 'sirtuin', 'sirt1', 'nampt', 'nad metabolism']],
  ['NF-κB / Inflammation', ['nf-κb', 'nf-kb', 'inflammat', 'cytokine', ' cox', 'lipoxygenase', 'nrf2', 'il-6', 'tnf']],
  ['Melanocortin', ['melanocortin', 'mc4r', 'mc1r', 'mc3r', 'msh']],
  ['Senescence / Autophagy', ['senescen', 'senolytic', 'autophagy', 'mitophagy', 'zombie cell']],
];


const compounds = parseCompendium(compendium).map((c, i) => ({ id: 'c' + i, ...c }));

for (const c of compounds) {
  const hay = (c.goals.join(' ') + ' ' + c.category + ' ' + c.mechanism + ' ' + c.plain + ' ' + c.name + ' ' + c.targets.map(t => t.sym + ' ' + t.name).join(' ')).toLowerCase();
  // GOAL TAXONOMY — FIXED 2026-07-28. Goals used to be substring-matched over `hay`, which
  // includes the compound's MECHANISM and PLAIN-ENGLISH prose — and that prose describes HARMS as
  // readily as benefits. Measured result: 72 of 387 assignments (18.6%) were wrong, in three
  // classes — 22 derived from harm prose, 5 from negation ("does NOT do this"), and 45 from bare
  // substring artefacts. Verified live examples:
  //   Saffron      -> /goal/heart     because "mi(ldl)y" contains "ldl"
  //   Semaglutide  -> /goal/muscle    because "will(power)" contains "power"  (a drug with
  //                                   documented lean-mass loss, listed under Build Muscle)
  //   DNP          -> /goal/longevity via "(mitochond)rial"  (a compound that has killed people)
  //   Modafinil    -> ranked #1 on /goal/sleep;  EPO -> #3 on /goal/bone;  Amphetamine -> /goal/heart
  //   Clenbuterol/Trenbolone -> /goal/heart from "strains the heart" / "cardiovascular strain"
  // Goals now match ONLY the curated `goals` field and the category — no prose. This is why the
  // fix is not "word-boundary matching": that removes ~13 of the 72; only dropping the prose
  // removes all three classes. Measured: 387 -> 235 assignments, 0 of the harm rows surviving.
  // NOTE: `whenToUse` is NOT usable here (a proposal suggested it) — it is merged 87 lines later so
  // it is undefined at this point, it is an object not a string, and it is long instructional prose
  // that discusses risks, so 22 of the 26 harm rows survive it anyway.
  const goalHay = (c.goals.join(' ') + ' ' + c.category).toLowerCase();
  c.goalIds = GOALS.filter(g => g.keys.some(k => goalHay.includes(k))).map(g => g.id);
  // The 12 compounds whose curated fields name no goal keyword. Hand-assigned rather than left
  // empty (invisible on every goal page) or prose-matched (the defect above). Each is what the
  // compound is actually used or misused FOR — the regulatory badge on the card carries the
  // legality, which is the honest division of labour between the two.
  if (!c.goalIds.length && GOAL_OVERRIDES[c.name]) c.goalIds = GOAL_OVERRIDES[c.name].slice();
  // FIXED 2026-07-28. Pathway keywords are matched with String.includes(), which is DELIBERATE for
  // most of them -- 'mitochond' is meant to catch "mitochondrial", 'senolyt' to catch "senolytic".
  // But three keywords are short enough to appear inside unrelated words, and each created a real
  // false pathway edge:
  //   'ad(enos)ine'.includes('enos')          -> eNOS / nitric-oxide pathway
  //   'r(epor)ts'.includes('epor')            -> EPO receptor pathway
  //   'nor(adrenal)ine'.includes('adrenal')   -> adrenal / HPA pathway
  // Measured: 8 false edges (Caffeine, Caffeine thermogenic, Ephedrine, Apigenin, Ligandrol,
  // Testolone, Phentermine/Qsymia, Vitamin C).
  // A blanket switch to token-boundary matching is WRONG -- measured, it removed 43 edges and left
  // 13 compounds with no pathway at all, because it breaks every intentional prefix. So only these
  // three are boundary-matched; everything else keeps prefix semantics.
  const BOUNDARY_KW = new Set(['enos', 'epor', 'adrenal']);
  const kwHit = (k) => {
    if (!BOUNDARY_KW.has(k)) return hay.includes(k);
    return new RegExp('(^|[^a-z0-9])' + k + '([^a-z0-9]|$)', 'i').test(hay);
  };
  c.pathwayIds = PATHWAY_KW.map((p, idx) => [idx, p[1]]).filter(([idx, keys]) => keys.some(kwHit)).map(([idx]) => idx);
}

// aggregate molecular-target nodes (the "parts catalog" — one target, many compounds)
const targetMap = {};
for (const c of compounds) {
  for (const t of c.targets) {
    const key = t.sym.toUpperCase();
    if (!targetMap[key]) targetMap[key] = { sym: t.sym, name: t.name, url: t.url, compoundIds: [] };
    if (!targetMap[key].compoundIds.includes(c.id)) targetMap[key].compoundIds.push(c.id);
  }
}
const targets = Object.values(targetMap).filter(t => t.sym.toLowerCase() !== 'gene').sort((a, b) => b.compoundIds.length - a.compoundIds.length || a.sym.localeCompare(b.sym));

// attach deep explainers (content/TARGETS.md) to targets by gene symbol
let targetExplainers = {};
try { targetExplainers = parseTargetExplainers(fs.readFileSync(path.join(CONTENT, 'TARGETS.md'), 'utf8')); } catch (e) { console.warn('no TARGETS.md'); }
for (const t of targets) { const e = targetExplainers[t.sym.toUpperCase()]; if (e) t.explainer = e; }

const modules = parseSections(foundations, '# MODULE');
const pathwayList = parseSections(pathways, '## PATHWAY').map((p, i) => ({ id: i, shortLabel: PATHWAY_KW[i] ? PATHWAY_KW[i][0] : p.title.replace(/^\d+\s*[—-]\s*/, ''), ...p }));

// ---- Protocol Engine data (Phase 1/2 pipelines) --------------------------------
// The clinical graph is small -> folded into the main payload. The exercise (873)
// and food (375+) datasets are large -> emitted as separate window globals that
// app.js lazy-loads only when a protocol route is visited (keeps the home page light).
const DATA_DIR = path.join(ROOT, 'data');
// ---- the claims spine ------------------------------------------------------------------------
// Wired 2026-07-28. data/claims.json has existed since the rev-3 audit and was read by NOTHING:
// parse.js had 0 references to it, so every rule it encodes was advisory and every claim in it was
// inert. It is the mechanism that is supposed to stop the site stating an effect it cannot back —
// so leaving it unread meant the safeguard existed only on paper.
// Loading it here does three things: it puts the claims into data.js so renderers can gate on a
// claim_id, it lets parse.js ENFORCE the structural rules at build time (parse.js is already a hard
// deploy gate), and it makes the file's coverage measurable instead of assumed.
const claimsFile = readJSON(path.join(DATA_DIR, 'claims.json')) || { claims: [] };
const CLAIMS = Array.isArray(claimsFile.claims) ? claimsFile.claims : [];
const CLAIM_BY_ID = {};
CLAIMS.forEach((c) => { if (c && c.claim_id) CLAIM_BY_ID[c.claim_id] = c; });
(function assertClaims() {
  const bad = [];
  const seen = new Set();
  CLAIMS.forEach((c, i) => {
    const id = c && c.claim_id;
    if (!id) { bad.push(`claim #${i} has no claim_id`); return; }
    if (seen.has(id)) bad.push(`${id}: duplicate claim_id`);
    seen.add(id);
    // A claim that RENDERS is a statement the site makes to a reader in its own voice. It must be
    // backed, and it must not be a claim whose own direction says the opposite of what it would
    // appear to recommend.
    if (c.renders) {
      if (!Array.isArray(c.sources) || !c.sources.length) bad.push(`${id}: renders:true with no sources`);
      if (c.grade === 'not_established') bad.push(`${id}: renders:true but grade is not_established`);
      if (c.direction === 'inverts' || c.direction === 'refutes') {
        bad.push(`${id}: renders:true but direction is '${c.direction}' — that would surface the thing the evidence contradicts`);
      }
    }
    (c.sources || []).forEach((sc) => {
      if (sc && sc.pmid && !/^\d{6,9}$/.test(String(sc.pmid))) bad.push(`${id}: source pmid '${sc.pmid}' is not a plausible PMID`);
    });
  });
  if (bad.length) {
    console.error('\n[parse] CLAIMS ASSERTION FAILED — refusing to build:');
    bad.forEach((m) => console.error('  \u2717 ' + m));
    process.exit(1);
  }
  const renders = CLAIMS.filter((c) => c.renders).length;
  const blocking = CLAIMS.filter((c) => c.direction === 'inverts' || c.direction === 'refutes').length;
  console.log(`[parse] claims spine OK — ${CLAIMS.length} claims (${renders} render, ${blocking} record a contradicted/inverted pairing).`);
})();


// Authored regulatory classification, merged 2026-07-28. Until now this file was read by NOTHING
// -- parse.js had 0 references to it -- so every regulatory decision on the site ran on a name
// regex, and all 170 authored rows (including 13 human overrides) were inert. The badge is not a
// supply classification: a green "FDA approved" badge means a regulator approved the molecule, NOT
// that you can buy it off a shelf, and reading it as the latter is what put "available over the
// counter -- Guardian, Watsons" on seven prescription medicines.
const regClassFile = readJSON(path.join(DATA_DIR, 'regulatory_class.json')) || {};

// ---- ONE prescription-token list, shared by the notice generator and the gate ------------------
// These were computed independently in two places and drifted immediately: the gate flagged 7
// targets the notice generator had not covered, because one tokenised "Amphetamine (Adderall)"
// and the other did not look in the same fields. Two lists that must agree are one list.
const POM_ENDOGENOUS_TOK = /^(insulin|testosterone|estradiol|erythropoietin|epo|melatonin|thyroid|t3|t4)$/i;
function pomTokens() {
  const split = (n) => String(n).replace(/\([^)]*\)/g, ' ').split(/[+&/·,]| and /i).map((t) => t.trim()).filter(Boolean);
  const notPom = new Set((regClassFile.compounds || [])
    .filter((c) => ['supplement', 'otc'].includes(c.regulatory_class))
    .flatMap((c) => split(c.name).map((t) => t.toLowerCase())));
  const out = new Map();
  (regClassFile.compounds || [])
    .filter((c) => ['prescription', 'controlled'].includes(c.regulatory_class))
    .forEach((c) => split(c.name).forEach((t) => {
      if (t.length <= 4 || POM_ENDOGENOUS_TOK.test(t) || notPom.has(t.toLowerCase())) return;
      if (!out.has(t.toLowerCase())) out.set(t.toLowerCase(), { token: t, cls: c.regulatory_class });
    }));
  return [...out.values()];
}
const POM_RE = (t) => new RegExp('\\b' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
const REG_BY_NAME = {};
(regClassFile.compounds || []).forEach((r) => {
  if (r && r.name) REG_BY_NAME[String(r.name).trim().toLowerCase()] = r;
});

// Merge the authored regulatory class onto every compound. Downstream (app.js sgAvailability /
// rxBadge, prerender.js regClass) prefers c.regulatory_class and only falls back to the name
// regexes when it is absent -- so the authored value, including every human override, wins.
{
  let merged = 0, missing = [];
  compounds.forEach((c) => {
    const r = REG_BY_NAME[String(c.name).trim().toLowerCase()];
    if (r && r.regulatory_class) {
      c.regulatory_class = r.regulatory_class;
      c.consumer_renderable = r.consumer_renderable !== false;
      if (r.sg_hsa_status) c.sg_hsa_status = r.sg_hsa_status;
      merged++;
    } else missing.push(c.name);
  });
  console.log(`[parse] regulatory_class merged onto ${merged}/${compounds.length} compounds` +
    (missing.length ? ` (no row for: ${missing.slice(0, 6).join(', ')}${missing.length > 6 ? ` +${missing.length - 6} more` : ''})` : ''));
  // A regulatory classifier that silently covers only part of the corpus is worse than none: the
  // uncovered rows fall back to a name regex and look identical to the covered ones.
  if (missing.length > 8) {
    console.error(`[parse] REGULATORY CLASS ASSERTION FAILED — ${missing.length} compounds have no authored class.`);
    process.exit(1);
  }
}

// ---- W5a (2026-08-02): TWO AXES, ONE ANSWER EACH ---------------------------------------------
// FELIX'S DECISION, applied here: a colour on this site is the REGULATOR'S CURRENT CALL on that
// molecule — the FDA's or the relevant global regulator's — and nothing else. It never implies a
// human on this project reviewed anything, and it is not a supply classification (CLAUDE.md rule 6,
// Medicines Act 1975 s.51).
//
// WHAT WAS BROKEN. Two authored sources answered "how do you get this", separately, and disagreed
// on 24 of 171 compounds. Measured HYDRATED at 390x844 by comparing the visible
// `.detail-head .badges .pill` text against `c.regulatory_class`, 0 pageerrors:
//   OVER-WARNING (3) — /c/vitamin-d3-k2 and /c/iron are authored `supplement` and rendered a blue
//     "🔵 Prescription" pill; /c/yohimbine is `unapproved` and rendered 🔵 Prescription AND
//     🟡 OTC Supplement. out/shot-vitd.png shows Vitamin D3 with a blue Prescription pill and,
//     directly below it, a STATUS chip reading "🟡🔵 OTC Supplement".
//   UNDER-LABELLING (21) — /c/ssris-…, /c/statins-…, /c/pde-5-inhibitors-…, /c/minoxidil and 17
//     more carry a prescription/pharmacy class and rendered only 🟢 FDA Approved or 🟠 Off-Label.
// The badge came from the markdown badge line; the class came from data/regulatory_class.json,
// which is the authored, per-compound, human-overridable source with a Singapore status sentence
// attached — and app.js:275 already stated the rule ("The authored class wins; the badge is only a
// fallback") without anything enforcing it.
//
// THE RULE, stated once and applied the same way to all 171:
//   · Three badges make a SUPPLY claim: 🟡 (sold as a supplement), 🔵 (prescription-only) and
//     ⚫ (controlled). Each renders only where the authored class agrees. 🔵 is kept on
//     `controlled` too, because a controlled medicine is also prescription-only — dropping it
//     there would delete a true fact.
//   · 🟢 / 🟠 / 🔴 make no supply claim at all — they are pure regulator-approval facts — so they
//     are never dropped.
//   · The SUPPLY answer has exactly one carrier, derived from the authored class, rendered on
//     171/171, and its long form is the compound's OWN authored `sg_hsa_status` sentence, which
//     until now existed in the data and was rendered nowhere near the badge.
// Nothing is invented: every dropped badge is dropped because a human-authored field about that
// same compound denies it, and every suppression is recorded on the compound in `badgesDropped`.
const SUPPLY_BY_CLASS = {
  supplement:   'No prescription needed',
  otc:          'Available over the counter',
  pharmacy:     'Pharmacy medicine — ask the pharmacist',
  prescription: 'Prescription only — needs a doctor',
  controlled:   'Controlled substance',
  unapproved:   'Not approved for human use',
  unknown:      'Status varies — check your regulator',
};
// The supply route each supply-claiming badge asserts, and the authored classes that agree with it.
const BADGE_SUPPLY_OK = {
  '🟡': ['supplement', 'otc'],
  '🔵': ['prescription', 'pharmacy', 'controlled'],
  '⚫': ['controlled'],
};
{
  let dropped = 0, touched = 0;
  compounds.forEach((c) => {
    const cls = SUPPLY_BY_CLASS[c.regulatory_class] ? c.regulatory_class : 'unknown';
    const keep = [], drop = [];
    (c.approvals || []).forEach((a) => {
      const ok = BADGE_SUPPLY_OK[a];
      if (!ok || ok.includes(cls)) keep.push(a);
      else drop.push({ badge: a, label: APPROVAL_LABEL[a] || '', why: `the authored regulatory class is "${cls}"` });
    });
    c.badges = keep;
    c.badgeLabels = [...new Set(keep.map((a) => APPROVAL_LABEL[a]).filter(Boolean))];
    c.badgesDropped = drop;
    c.supply = {
      cls,
      tag: SUPPLY_BY_CLASS[cls],
      aria: `How you get it: ${SUPPLY_BY_CLASS[cls].toLowerCase()}`,
      why: c.sg_hsa_status || '',
    };
    if (drop.length) { dropped += drop.length; touched++; }
  });
  console.log(`[parse] regulatory axes reconciled — ${dropped} supply-claiming badge(s) on ${touched} compound(s) withdrawn because the authored class denies them; ${compounds.length}/${compounds.length} now carry exactly one supply statement.`);
}

// ---- W5a (2026-08-02): THE 13 "(brief)" BUNDLES MISREPRESENTED THEMSELVES --------------------
// Measured: `meta[name=description]` content === '' HYDRATED on exactly these 13 and on 0 of the
// other 158, because setPageMeta() reads `c.plain || c.bottom || c.mechanism` and a bundle page has
// none of the three; the PRERENDERED description fell back to `c.name`, i.e. the page's own title
// repeated back at it. Neither is a description, and one of them is empty.
// The honest replacement is not written by hand per page — it is DERIVED from what the page
// demonstrably is: its members (the name, split), its category, and the fact that it is unrated.
// `members` also lets the renderer say WHICH compound a Formula / Mol. weight chip belongs to:
// /c/agmatine-glycerol-theacrine-brief renders "FORMULA C5H14N4 · MOL. WEIGHT 130 g/mol ·
// PubChem CID 199" — agmatine's chemistry alone — under an h1 naming three compounds.
compounds.forEach((c) => {
  const base = String(c.name).replace(/\s*\(brief\)\s*$/i, '').trim();
  const members = base.split(/\s+·\s+/).map((x) => x.trim()).filter(Boolean);
  c.members = members.length > 1 ? members : [];
  if (!(c.plain || c.bottom || c.mechanism)) {
    const cat = String(c.category || '').split('/')[0].trim().toLowerCase();
    c.metaSummary = c.members.length
      ? `A short entry covering ${c.members.length} related compounds together${cat ? ` in ${cat}` : ''} — ${c.members.join(', ')}. What each one is, how it is regulated, and why it has no separate evidence rating here.`
      : `${base}: what it is, how it is regulated, and what the human evidence does and does not show. Plain English, not medical advice.`;
  }
});
// The gate. An empty description is not a shorter description — it is a page with nothing to say
// about itself in a search result, a share card, or an answer engine, and it shipped on exactly the
// 13 pages that most needed to explain what they were. PROVE IT by deleting `c.metaSummary` from
// the assignment above (fails naming all 13) or from either renderer (fails naming the file).
(function assertEveryCompoundDescribesItself() {
  const bad = [];
  compounds.forEach((c) => {
    const d = c.plain || c.bottom || c.mechanism || c.metaSummary || '';
    if (!String(d).trim()) bad.push(`${c.id} ("${c.name}") would ship meta[name=description] content="" — measured hydrated on exactly the 13 "(brief)" bundles and 0 of the other 158`);
    if (c.members.length && c.members.length < 2) bad.push(`${c.id}: members has one entry — it should be empty for a single-compound page`);
  });
  const app = fs.readFileSync(path.join(ROOT, 'site', 'app.js'), 'utf8');
  const pre = fs.readFileSync(path.join(ROOT, 'build', 'prerender.js'), 'utf8');
  if (app.indexOf('c.metaSummary') < 0) bad.push('site/app.js never falls back to c.metaSummary — the 13 bundle pages go back to content=""');
  if (pre.indexOf('c.metaSummary') < 0) bad.push('build/prerender.js never falls back to c.metaSummary — the crawler goes back to the page title repeated as its own description');
  // A bundle page shows ONE member's Formula / Mol. weight / CID under an h1 naming several. It has
  // to say so, and it may not say WHICH by guessing — the name comes from PubChem's own record.
  if (app.indexOf('MolecularFormula,MolecularWeight,Title') < 0) bad.push('site/app.js no longer fetches PubChem\'s record Title — then a bundle page prints one member\'s chemistry with nothing saying whose it is');
  if (app.indexOf('spec-mol-of') < 0 || app.indexOf('mol-of') < 0) bad.push('site/app.js does not attribute the molecule on a multi-compound page');
  if (bad.length) {
    console.error('\n[parse] COMPOUND SELF-DESCRIPTION ASSERTION FAILED — refusing to build:');
    bad.slice(0, 20).forEach((m) => console.error('  ✗ ' + m));
    process.exit(1);
  }
  const n = compounds.filter((c) => c.metaSummary).length;
  console.log(`[parse] meta fallbacks OK — ${n} compound(s) have no plain/bottom/mechanism text and now carry a derived description instead of an empty one; ${compounds.filter((c) => c.members.length).length} multi-compound bundles know their own members; 0 compounds would ship an empty description.`);
})();

function readJSON(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { console.warn('[parse] missing', path.basename(p)); return null; } }
const graph = readJSON(path.join(DATA_DIR, 'clinical_graph.json'));
// "Why this happens" causes layer — keyed by problem id, merged onto each problem as p.why.
const causeLearn = readJSON(path.join(DATA_DIR, 'cause_learn.json')) || {};
let _causeHits = 0;
(graph && graph.problems || []).forEach(p => { const w = causeLearn[p.id]; if (w) { p.why = w; _causeHits++; } });
console.log('[parse] cause sections merged:', _causeHits);

// ---- /solve?q= SEARCH INDEX (2026-08-01, W2/D11) ---------------------------------------------
// /solve?q= was discarded entirely: /solve, /solve?q=knee%20pain and /solve?q=zzzznonsense all
// produced a byte-identical #app (innerHTML 11,797 chars, measured hydrated 2026-08-01) and a
// byte-identical prerendered document (16,222 B). Fixing it needs a ranking in TWO runtimes --
// server.js (the ~90% who never run JS, who arrive here from the home hero's real
// <form action="/solve" method="get">) and site/app.js (the SPA). The DATA is authored exactly
// once, here, so the two runtimes can only ever differ in the ~10-line scoring loop.
// hay = every string a reader might type, de-duplicated to single tokens, space-delimited on both
// ends so a whole-word test is a plain indexOf(' term ').
if (graph && graph.problems) {
  const _n = (s) => ' ' + String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9']+/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
  const _str = (v) => (typeof v === 'string' ? v : '');
  graph.problems.forEach((p) => {
    const src = [p.name, p.category, p.kind === 'want' ? 'goal' : 'problem']
      .concat((p.root_causes || []).map((r) => [_str(r.name), _str(r.plain), _str(r.diagnostic)].join(' ')))
      .concat(((p.why && p.why.causes) || []).map((c) => [_str(c.name), _str(c.confusedWith), _str(c.hook)].join(' ')));
    p.solveHay = _n([...new Set(_n(src.join(' ')).trim().split(' '))].filter((t) => t.length > 2).join(' '));
    p.solveName = _n(p.name);
  });
  // ---- THE READER'S VOCABULARY (2026-08-01, W2.5d) -------------------------------------------
  // The corpus is authored in clinical language; readers type symptoms. Measured against the
  // shipped index with the shipped loop, 9 of a 20-query battery of realistic phrasings ranked the
  // WRONG problem #1, and the failures were not near-misses:
  //   "hair falling out"  -> insomnia(22), hair-loss(19). "Trouble Falling Asleep" owns the word
  //                          "falling" (a NAME word, 18) and "out" scored 10 as a substring inside
  //                          "Burnout" and "Pre-Workout Energy".
  //   "lose weight"       -> pcos(18) as the ONLY hit, because "PCOS / Hormonal Weight" owns
  //                          "weight" and neither fat-loss-plateau nor visceral-fat has that word
  //                          in its name or its hay.
  //   "tired all the time"-> sleep-maintenance(18): "the" was not a stopword and "Waking Through
  //                          the Night" contains it as a name word. chronic-fatigue scored 4.
  //   "balding"           -> nothing at all.
  // Two authored fixes, no cleverness: a synonym layer (data/solve_aliases.json) and a longer
  // stop list. Both are DATA, authored once here, so the SPA loop and the server loop cannot
  // diverge on vocabulary — only on the ~12-line scoring, which scripts/smoke.mjs already asserts.
  const aliasSrc = readJSON(path.join(DATA_DIR, 'solve_aliases.json')) || {};
  const _known = new Set(graph.problems.map((p) => p.id));
  const _abad = [];
  Object.keys(aliasSrc).forEach((k) => {
    if (k.charAt(0) === '_') return;
    if (!_known.has(k)) _abad.push(`data/solve_aliases.json names "${k}", which is not a problem id`);
    else if (!Array.isArray(aliasSrc[k]) || !aliasSrc[k].length) _abad.push(`data/solve_aliases.json: "${k}" has no phrases`);
    else if (aliasSrc[k].some((s) => typeof s !== 'string' || !s.trim())) _abad.push(`data/solve_aliases.json: "${k}" has an empty phrase`);
  });
  graph.problems.forEach((p) => { if (!aliasSrc[p.id]) _abad.push(`data/solve_aliases.json has no entry for problem "${p.id}" — every problem must declare the words a reader would type for it, even if that is just its own name`); });
  if (_abad.length) {
    console.error('[parse] SOLVE ALIAS ASSERTION FAILED:');
    _abad.forEach((b) => console.error('  · ' + b));
    process.exit(1);
  }
  let _ap = 0;
  graph.problems.forEach((p) => {
    const al = aliasSrc[p.id] || [];
    // A word bag for token scoring, and the whole phrases for the phrase bonus. A phrase shorter
    // than 5 characters is not a phrase, it is a token, and it is already in the bag.
    p.solveAlias = _n([...new Set(al.map((a) => _n(a).trim()).join(' ').split(' '))].filter((t) => t.length > 2).join(' '));
    p.solvePhrases = al.map((a) => _n(a)).filter((a) => a.trim().length >= 5);
    _ap += p.solvePhrases.length;
  });
  // Stopwords authored ONCE. Anything here, and anything under 3 characters, is dropped from a
  // query before scoring -- without this, "tired all the time" matched 41 of 41 problems and
  // "low testosterone" matched 37 of 41 (measured against site/data.js), i.e. the filter was noise.
  // The second line is the 2026-08-01 addition: pure function words that were scoring as NAME
  // words. "the" is the one that cost the most — it is in "Waking Through the Night".
  graph.solveStopwords = ('all and any are but can cant feel feels feeling for from get getting got has have how its keep keeps '
    + 'lot lots make makes more much not really some that their them then there these this time times too very was were '
    + 'what when why with you your always been being after before also just like need want help fix '
    + 'the through out off over into onto per via about does doing done each else even ever every his her him she they '
    + 'who will would could should still such sure than thing think try trying use using way well went while wont yet upon'
  ).split(' ').filter((w, i, a) => w && a.indexOf(w) === i);
  const _hb = graph.problems.reduce((a, p) => a + p.solveHay.length + p.solveName.length + p.solveAlias.length, 0);
  console.log('[parse] solve search index:', graph.problems.length, 'problems,', _hb, 'bytes,',
    _ap, 'alias phrases,', graph.solveStopwords.length, 'stopwords');
}
const exercisesData = readJSON(path.join(DATA_DIR, 'clinical_exercises.json'));

// ---- CLINICAL TAGS BY FUNCTION, NOT BY MUSCLE GROUP (2026-07-28) -----------------------------
// `rotator_cuff` was on 127 exercises and `neck_deep_flexor` on 13, both assigned by which muscle
// GROUP the movement hits rather than what the movement DOES. The consequences are not cosmetic:
//   - 50 of the 127 "rotator cuff" exercises were presses, jerks or upright rows — patterns
//     routinely limited in cuff impingement. A cuff-rehab protocol was prescribing overhead
//     pressing. Only 16 were genuine cuff work.
//   - `neck_deep_flexor` included "Lying Face DOWN Plate Neck Resistance", which trains the neck
//     EXTENSORS, and "Wide-Grip Pulldown Behind The Neck", which is not a neck exercise at all.
//     Deep neck flexor training is craniocervical flexion — the chin tuck.
// Re-derived from the movement name, then asserted. Cuban press is a real cuff movement despite
// the word "press", which is why the exclusion is checked against a named exemption rather than a
// blanket keyword.
{
  const ex = (exercisesData && exercisesData.exercises) || [];
  const CUFF = /\b(internal rotation|external rotation|rotator cuff|cuban|scaption|face pull|band pull.?apart|pull.?apart|reverse (fly|flye)|prone (y|t|w|raise)|\b[ytw] raise|empty can|full can|sword|shoulder rotation|lying rear delt|rear delt (fly|flye|raise))/i;
  const NECKFLEX = /\b(chin.?tuck|chin to chest|craniocervical|face up|front and back|forward flexion|nod)/i;
  const NECKEXT = /\b(face down|behind|back of the head|prone|sides|side neck|smr)/i;
  const CONTRA = /\b(press|jerk|snatch|behind the neck|overhead|upright row)/i;
  const CONTRA_OK = /cuban/i;                       // the one legitimate "press" in cuff work
  let rcBefore = 0, rcAfter = 0, nfBefore = 0, nfAfter = 0;
  ex.forEach((x) => {
    const tags = x.move_tags; if (!Array.isArray(tags)) return;
    const nm = String(x.name || '');
    const isShoulder = (x.primaryMuscles || []).some((m) => /shoulder/i.test(m));
    const isNeck = (x.primaryMuscles || []).includes('neck');
    if (tags.includes('rotator_cuff')) {
      rcBefore++;
      if (CUFF.test(nm) && isShoulder) rcAfter++;
      else x.move_tags = tags.filter((t) => t !== 'rotator_cuff');
    }
    if ((x.move_tags || []).includes('neck_deep_flexor')) {
      nfBefore++;
      if (isNeck && NECKFLEX.test(nm) && !NECKEXT.test(nm)) nfAfter++;
      else x.move_tags = x.move_tags.filter((t) => t !== 'neck_deep_flexor');
    }
  });
  // Cable Hip Adduction was tagged `vmo_knee_strengthening` — an adduction movement, primary muscle
  // adductors, filed under quadriceps rehab. Drop it the same way: the tag must match the function.
  ex.forEach((x) => {
    if (!Array.isArray(x.move_tags) || !x.move_tags.includes('vmo_knee_strengthening')) return;
    const hitsQuad = (x.primaryMuscles || []).some((m) => /quadricep/i.test(m));
    if (!hitsQuad) x.move_tags = x.move_tags.filter((t) => t !== 'vmo_knee_strengthening');
  });
  const stillBad = ex.filter((x) => (x.move_tags || []).includes('rotator_cuff')
    && CONTRA.test(String(x.name)) && !CONTRA_OK.test(String(x.name)));
  if (stillBad.length) {
    console.error('[parse] CLINICAL TAG — press/jerk/upright-row patterns are tagged rotator_cuff:');
    stillBad.slice(0, 8).forEach((x) => console.error('  ✗ ' + x.name));
    console.error('  These are commonly limited in cuff impingement. Refusing to build.');
    process.exit(1);
  }
  console.log(`[parse] clinical tags by function: rotator_cuff ${rcBefore}→${rcAfter}, neck_deep_flexor ${nfBefore}→${nfAfter}`);
}
// Exercise demo images: serve via the jsDelivr CDN, not raw.githubusercontent.com — GitHub raw
// rate-limits (HTTP 429), so the demos frequently fail to load. jsDelivr mirrors the same repo, no cap.
if (exercisesData && exercisesData.exercises) {
  const RAW = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/';
  const CDN = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/';
  exercisesData.exercises.forEach((e) => { if (e.image && e.image.indexOf(RAW) === 0) e.image = CDN + e.image.slice(RAW.length); });
}
const foodsData = readJSON(path.join(DATA_DIR, 'foods.json'));
const businessesData = readJSON(path.join(DATA_DIR, 'sg_businesses.json'));
// ---- NORMALISE LITERAL "\n" IN AUTHORED PROSE (2026-07-28) -----------------------------------
// Felix screenshotted /muscle/biceps showing the characters \n printed mid-sentence:
//   "...transmits the pull to bone.\n\nThe biceps sits on the front of the upper arm."
// 78 of these across learn_expand.json. The author meant a paragraph break and typed an escaped
// newline into a JSON string, so it survived as two literal characters. mdBlocks() splits on REAL
// newlines, so it never saw a break and rendered the marker as text.
// Normalised at build time rather than by editing the corpus: the same typo will be made again,
// and a renderer that only works on perfectly-authored input is a renderer that will break.
function normaliseNewlines(o) {
  if (typeof o === 'string') return o.replace(/\\r\\n|\\n|\\r/g, '\n');
  if (Array.isArray(o)) return o.map(normaliseNewlines);
  if (o && typeof o === 'object') { const r = {}; for (const k of Object.keys(o)) r[k] = normaliseNewlines(o[k]); return r; }
  return o;
}

const anatomy = readJSON(path.join(DATA_DIR, 'anatomy.json')) || { muscles: [], energy_systems: [], metabolism: [] };
// Granular sub-muscle registry (structures.json) — FMA-keyed, sits BENEATH anatomy.json's 17 groups
// (each structure.groupId -> a muscle group id). Second-source-verified. Powers the sub-muscle section
// on /muscle pages (both documents) and the 3D body map's pick -> structures[fma] lookup.
const structuresFile = readJSON(path.join(DATA_DIR, 'structures.json')) || { structures: [] };
const structures = (structuresFile.structures || []).map((s) => {
  // Normalise the display name: strip a trailing " muscle"/" muscles" (WP-title artefact) but keep
  // names that don't end that way ("Erector spinae"). Slug/meshId/fma are untouched.
  const name = String(s.name || '').replace(/\s+muscles?$/i, '').trim() || s.name;
  return Object.assign({}, s, { name });
});
// Gate the defect class (parse.js is a hard deploy gate): a structure with no fma/groupId/attachment
// is a broken graph node. Check the INPUT set, not an empty one — a gate over [] always passes.
if (structures.length) {
  // groupId + attachments are required for the page render (a structure without them is a broken node).
  const bad = structures.filter((s) => !s.groupId || !s.origin || !s.insertion);
  if (bad.length) { console.error('[parse] structures.json: ' + bad.length + ' missing groupId/origin/insertion: ' + bad.map((s) => s.name).join(', ')); process.exit(1); }
  // fma is OPTIONAL: it's the 3D-mesh key, not needed for the page. Warn so empties get resolved
  // against the official BodyParts3D map in a future 3D wave, but never block the deploy on it.
  const noFma = structures.filter((s) => !s.fma);
  if (noFma.length) console.warn('[parse] structures.json: ' + noFma.length + ' without an fma (no 3D mesh key yet): ' + noFma.map((s) => s.name).join(', '));
  console.log('[parse] structures OK — ' + structures.length + ' sub-muscles across ' + new Set(structures.map((s) => s.groupId)).size + ' groups');
}
// /learn deep-expansion course layer — keyed "type:id", merged onto Foundations modules + anatomy.
const learnExpand = normaliseNewlines(readJSON(path.join(DATA_DIR, 'learn_expand.json')) )|| {};
let _leHits = 0;
modules.forEach((m, i) => { const e = learnExpand['module:' + i]; if (e) { m.expand = e; _leHits++; } });
(anatomy.energy_systems || []).forEach(e => { const x = learnExpand['energy:' + e.id]; if (x) { e.expand = x; _leHits++; } });
(anatomy.metabolism || []).forEach(p => { const x = learnExpand['metabolism:' + p.id]; if (x) { p.expand = x; _leHits++; } });
(anatomy.muscles || []).forEach(mu => { const x = learnExpand['muscle:' + mu.id]; if (x) { mu.expand = x; _leHits++; } });

// ---- SECTION SYNTHESIS WIDGETS (2026-07-28) --------------------------------------------------
// 12 agents deep-dived every section of /pathway/6 and /muscle/biceps and authored a widget spec
// per section against a fixed six-type vocabulary. Rendered here, once, into a string on the entry
// — so the app and the prerendered document print identical markup and cannot drift.
{
  const { widgetHtml } = require('./widgets.js');
  const specs = readJSON(path.join(DATA_DIR, 'section_widgets.json')) || {};
  let made = 0, skipped = 0;
  for (const [key, w] of Object.entries(specs)) {
    const [entryKey, which] = key.split('#');
    const e = learnExpand[entryKey];
    if (!e) { skipped++; continue; }
    const html = widgetHtml(w);
    if (!html) { skipped++; continue; }
    e.widgets = e.widgets || {};
    e.widgets[which] = html;
    made++;
  }
  console.log(`[parse] section widgets: ${made} rendered${skipped ? `, ${skipped} skipped` : ''}`);
}

// ---- ANIMATED ACTION FIGURES (2026-07-28) ----------------------------------------------------
// Precompute one inline-SVG figure per action string, aligned BY INDEX with anatomy.actions, so
// both renderers print a string and neither can drift from the other. See build/figures.js for why
// this is a build-time artefact rather than a twin function in each renderer.
{
  const { actionFigure, cascadeFigure } = require('./figures.js');
  // Precompute the animated cascade for every course that has a mechanism worth drawing.
  let casc = 0;
  Object.keys(learnExpand).forEach((k) => {
    const e = learnExpand[k];
    if (!e || !Array.isArray(e.mechSteps)) return;
    const svg = cascadeFigure(e.mechSteps, (e.hook && e.hook.title) || k.split(':')[1] || '');
    if (svg) { e.cascade = svg; casc++; }
  });
  console.log(`[parse] signal cascades: ${casc}/${Object.keys(learnExpand).filter((k) => (learnExpand[k] || {}).mechSteps).length} courses with mechSteps`);
  let figs = 0, acts = 0;
  (anatomy.muscles || []).forEach((mu) => {
    const a = mu.anatomy && mu.anatomy.actions;
    if (!Array.isArray(a) || !a.length) return;
    acts += a.length;
    mu.anatomy.action_figures = a.map((x) => { const f = actionFigure(x); if (f) figs++; return f; });
  });
  // Assert, don't hope. A figure silently missing is exactly the "authored but connected to
  // nothing" failure this project keeps producing, and it would look fine in every word count.
  if (figs !== acts) {
    console.error(`[parse] ACTION FIGURES — only ${figs} of ${acts} action strings produced a figure.`);
    process.exit(1);
  }
  console.log(`[parse] action figures: ${figs}/${acts} across ${(anatomy.muscles || []).filter((m) => m.anatomy && m.anatomy.action_figures).length} muscles`);
}
console.log('[parse] /learn expanded lessons merged:', _leHits);

// Clinician-authored triage assessments, folded onto their problem. Validate that every option
// weight points at a root cause that actually exists on that problem (catches authoring typos at build).
const assessments = readJSON(path.join(DATA_DIR, 'assessments.json')) || {};
if (graph && graph.problems) graph.problems.forEach(p => {
  const A = assessments[p.id]; if (!A || !Array.isArray(A.questions)) return;
  const rcIds = new Set(p.root_causes.map(r => r.id));
  A.questions.forEach(q => (q.options || []).forEach(o => Object.keys(o.weights || {}).forEach(rc => {
    if (!rcIds.has(rc)) console.warn(`[parse] assessment "${p.id}" weights unknown root cause "${rc}"`);
  })));
  p.assessment = A;
});

// Protocol action-plan layer (timeline · what-working · reassess · context modifiers · troubleshooting),
// keyed by problem id, folded onto each problem as p.plan. Educational, not medical advice.
const protoPlan = readJSON(path.join(DATA_DIR, 'protocol_plan.json')) || {};
let _planHits = 0;
if (graph && graph.problems) graph.problems.forEach(p => { const pl = protoPlan[p.id]; if (pl) { p.plan = pl; _planHits++; } });
console.log('[parse] protocol action-plans merged:', _planHits);

// Scored "find your cause" quiz (data/cause_quiz.json), keyed by problem id → p.causeQuiz.
const causeQuiz = readJSON(path.join(DATA_DIR, 'cause_quiz.json')) || {};
let _quizHits = 0;
if (graph && graph.problems) graph.problems.forEach(p => { const q = causeQuiz[p.id]; if (q && q.questions) { p.causeQuiz = q; _quizHits++; } });
console.log('[parse] cause quizzes merged:', _quizHits);

// ---- THE TWO CAUSE TAXONOMIES, JOINED (2026-08-01, W2/D3) ------------------------------------
// data/clinical_graph.json has 52 `root_causes` — one per /protocol/<problem>/<root_cause> URL.
// data/cause_learn.json has 224 `why.causes` — what that page's accordion lists, ranked by
// leverage. The two share no key (scanning every why.cause field against the 52 root-cause ids
// gives 0 matches), so the page could not tell which of its 4-7 causes its own URL was about and
// app.js opened index 0 on all 52. data/cause_map.json is the authored join: problem -> root cause
// -> the EXACT name of the cause that root cause is about, or null where no single authored cause
// corresponds (which must then carry its reason in `unmapped`, and falls back to rank 1).
//
// Keyed by NAME, not index, on purpose: re-ranking or inserting a cause cannot silently repoint a
// mapping — it fails the build here instead. Consumers read `rc.cause_key`; it reaches
// window.RNAWIKI_DATA because the graph object is serialised wholesale into site/data.js below.
const causeMap = readJSON(path.join(DATA_DIR, 'cause_map.json')) || {};
(function assertCauseMap() {
  if (!graph || !graph.problems) return;
  const M = causeMap.map || {};
  const UN = causeMap.unmapped || {};
  const bad = [];
  let joined = 0, unmapped = 0;
  const seen = new Set();
  graph.problems.forEach((p) => {
    const names = new Set(((p.why && p.why.causes) || []).map((c) => c.name));
    const m = M[p.id] || {};
    (p.root_causes || []).forEach((rc) => {
      const key = `${p.id}/${rc.id}`;
      seen.add(key);
      if (!(rc.id in m)) { bad.push(`${key}: no entry in data/cause_map.json — every root cause must name the cause its page opens, or null with a reason`); return; }
      const val = m[rc.id];
      if (val === null) {
        if (!UN[key] || !String(UN[key]).trim()) { bad.push(`${key}: mapped to null but data/cause_map.json.unmapped has no reason for it`); return; }
        // W5 (2026-08-02): the reason now REACHES THE READER. It has always been required here and
        // has never been rendered — it reaches window.RNAWIKI_DATA because the graph object is
        // serialised wholesale into site/data.js below, and site/app.js causesSection() prints it.
        rc.cause_unmapped = String(UN[key]).trim();
        unmapped++; return;
      }
      if (typeof val !== 'string') { bad.push(`${key}: value must be a cause name or null, got ${typeof val}`); return; }
      if (!names.has(val)) { bad.push(`${key}: names "${val}", which is not a cause of ${p.id}`); return; }
      rc.cause_key = val; joined++;
    });
  });
  // Reverse check: a mapping for a problem or root cause that no longer exists is a stale join,
  // and stale joins are how a rename quietly stops opening anything.
  Object.keys(M).forEach((pid) => Object.keys(M[pid] || {}).forEach((rcid) => {
    if (!seen.has(`${pid}/${rcid}`)) bad.push(`${pid}/${rcid}: mapped in data/cause_map.json but no such root cause exists`);
  }));
  // ---- W5 (2026-08-02): A DEFAULT IS ALLOWED. A SILENT DEFAULT IS NOT. -------------------------
  // The checks above already refuse a null with no reason. What nothing checked is that the reason
  // ever reaches a reader. site/app.js causeIndexForRc() returns 0 when a root cause has no
  // `cause_key`, which is correct behaviour and was invisible. Measured hydrated at 390x844 on all
  // 52 /protocol routes, 0 pageerrors: the 47 mapped routes open exactly the mapped cause, 47/47;
  // the 5 unmapped ones open accordion index 0 with nothing on the page saying so — and on 3 of
  // them the opened cause makes a different claim from the URL's root cause:
  //   /protocol/thyroid/subclinical-hypothyroid  "Sluggish thyroid / nutrient deficits"
  //       opened "Hashimoto's autoimmune thyroiditis"
  //   /protocol/brain-fog/neuroinflammation      "Neuroinflammation / poor metabolic control"
  //       opened "Sleep debt & circadian disruption"
  //   /protocol/low-mood/monoamine-inflammation  "Low monoamines + inflammation"
  //       opened "Chronic stress / HPA-axis dysregulation"
  // The join is NOT the fix. brain-fog/neuroinflammation is a NEEDS-FELIX editorial call and its
  // authored reason says so in as many words; it stays unmapped. What was wrong is that the reader
  // was shown a selection and not told it was a default.
  // Two-way invariant so a future root cause cannot lose its join and fall back quietly, plus a
  // renderer check so the reason cannot be exported and then never printed. Prove it by deleting
  // `cause_unmapped` from site/app.js, or by deleting the line that sets it above.
  (graph.problems || []).forEach((p) => (p.root_causes || []).forEach((rc) => {
    const hasKey = !!rc.cause_key;
    const hasWhy = !!(rc.cause_unmapped && String(rc.cause_unmapped).trim());
    if (hasKey === hasWhy) bad.push(`${p.id}/${rc.id}: carries ${hasKey ? 'BOTH cause_key and cause_unmapped' : 'NEITHER cause_key nor cause_unmapped'} — a root cause is either joined to a named cause or it opens a default, and a default must carry the reason the page prints`);
  }));
  Object.keys(UN).forEach((k) => {
    const cut = String(k).indexOf('/');
    const p = (graph.problems || []).find((x) => x.id === String(k).slice(0, cut));
    const rc = p && (p.root_causes || []).find((x) => x.id === String(k).slice(cut + 1));
    if (!rc) { bad.push(`data/cause_map.json.unmapped["${k}"] describes a root cause that does not exist — stale reason, delete it`); return; }
    if (rc.cause_key) bad.push(`data/cause_map.json.unmapped["${k}"] gives a reason for a root cause that IS mapped to "${rc.cause_key}" — stale reason, delete it`);
  });
  // The source check is deliberately TWO strings, not one. A single `cause_unmapped` grep passes on
  // a leftover COMMENT — proven while writing this gate: stubbing the render condition out to
  // `false` left one mention in the comment above it and the check went green. The renderer must
  // both read the field and emit the element the stylesheet styles, and the stylesheet must style
  // it. This is a source-string check like the goal-count gate below it, and its limits are the
  // same, which is why the hydrated half lives in scripts/smoke.mjs
  // (`aDefaultCauseSaysItIsADefault`) — that one drives a real browser.
  const appSrc = fs.readFileSync(path.join(ROOT, 'site', 'app.js'), 'utf8');
  if (!/rc\.cause_unmapped/.test(appSrc) || !/cause-fallback/.test(appSrc)) {
    bad.push('site/app.js does not both read `rc.cause_unmapped` and emit a `.cause-fallback` note — the deliberately-unmapped root causes would open a default cause and say nothing about it, which is the silent fallback this gate exists to prevent');
  }
  if (!/\.cause-fallback\s*\{/.test(fs.readFileSync(path.join(ROOT, 'site', 'styles.css'), 'utf8'))) {
    bad.push('site/styles.css has no `.cause-fallback` rule — the note would render as ordinary body copy, which is how a caveat stops reading as a caveat');
  }
  if (bad.length) {
    console.error('[parse] CAUSE MAP ASSERTION FAILED — the protocol page opens the cause its URL names:');
    bad.forEach((b) => console.error('  · ' + b));
    process.exit(1);
  }
  console.log('[parse] cause map: %d root causes joined to a named cause, %d deliberately unmapped', joined, unmapped);
})();

// ---- THE SAFETY STRUCTURE, PROMOTED AND GATED (2026-08-01, W2) --------------------------------
// Measured hydrated at 390x844 on all 52 /protocol/* routes before this:
//   · a labelled stop-rule element            0/52
//   · a named primary tracking metric element 0/52
//   · the 🚩 reassess block rendered AFTER the page's first supplement recommendation 52/52
//     (median y: first supplement 8,914 px, red flags 11,023 px, on an 18,430 px page)
// The PROSE was there — .plan-working 52/52, .plan-reassess 52/52 — which is why the brief's
// "0 of 52 state a stop rule" is refuted in W0's errata (E9). What was missing is structure: a
// reader could not find ONE number to track or ONE point at which the answer is to stop, and the
// escalation text sat below the recommendations it qualifies.
//
// data/protocol_safety.json does NOT author any of that. It SELECTS authored text and names it, and
// this gate is what keeps the selection honest:
//   · metricSource must be a verbatim substring of that problem's own `working` prose, long enough
//     to be a real quote, not starting immediately after a negation, and made of WHOLE authored
//     sentences with balanced emphasis — a substring can otherwise start and stop anywhere, and
//     40 of the 41 did (see the W2.5 note at the check);
//   · stopHorizon — the time printed in the stop rule's own header — must be a verbatim substring
//     of the stopIssue it heads, so the header can never name a horizon the rule is not about;
//   · every word of the short `metric` label must appear in that prose — clinical markers as whole
//     words with no exemption of any kind, ordinary words after light stemming (so a metric the
//     corpus never mentions cannot be introduced by a label). See the two-tier note at the check.
//   · checkpoint must be a `when` the problem's timeline actually contains;
//   · stopIssue must be an `issue` its troubleshooting list actually contains — the rendered
//     action is that entry's own authored `fix`.
// Prove it by editing one character of any metricSource in data/protocol_safety.json: the build
// stops and names the file, the problem and the field.
const protoSafety = readJSON(path.join(DATA_DIR, 'protocol_safety.json')) || {};
(function assertProtocolSafety() {
  if (!graph || !graph.problems) return;
  const M = protoSafety.map || {};
  // ---- W3 (2026-08-01): THE FABRICATION VECTOR THIS GATE EXISTS TO CLOSE ---------------------
  // The label check below used to skip every token shorter than 4 characters, then match only the
  // FIRST 4 CHARACTERS of the rest, as a substring anywhere in the prose. Every common lab marker
  // is 2-3 characters (LDL, TSH, A1c, CRP, ALT, AST, PSA, GFR, ESR, T3, T4, B12), so the one
  // free-text field on this card could name markers the page's own source never contains, and the
  // build still exited 0. PROVEN by reintroduction: metric "New inflamed spots, counted week over
  // week, plus LDL, TSH and A1c" against /protocol/acne's authored `working` prose — which
  // contains none of LDL, TSH, A1c or HbA1c — made the old filter return [] and the gate print
  // its success line. The 4-char prefix match was a second hole ("creatinine" satisfied by
  // "creatine"), and a verbatim substring quote was a third ("a clear face overnight" is a
  // verbatim substring of "You are chasing the trend, not a clear face overnight").
  //
  // Two tiers. The marker tier has no exemption of any kind:
  //   TIER A (clinical markers, absolute): a token that is a marker — by lexicon, by a run of 2-6
  //     capitals, or by a letter/digit shape (A1c, T3, B12, HbA1c) — must appear in the prose as a
  //     WHOLE WORD, case-insensitively. No length floor, no stop list, no stemming, no prefix.
  //   TIER B (ordinary words): every other token must appear as a whole word after light stemming,
  //     minus a closed function-word list.
  // Measured on the 41 authored entries: TIER A 0 failures (thyroid TSH/T3/ferritin, cholesterol
  // LDL/HDL/triglycerides, bone-density DXA, inflammation CRP all pass), TIER B 0 failures.
  // STOP and MARKERS are asserted disjoint, so growing the soft list can never open the hard one.
  const MARKERS = new Set(['ldl', 'hdl', 'vldl', 'tsh', 'a1c', 'hba1c', 'crp', 'hscrp', 'alt', 'ast', 'ggt',
    'alp', 'psa', 'gfr', 'egfr', 'esr', 'apob', 'apoa', 'lpa', 'ferritin', 'transferrin', 'tibc',
    'triglycerides', 'cholesterol', 'hemoglobin', 'haemoglobin', 'creatinine', 'cortisol', 'insulin',
    'testosterone', 'estradiol', 'oestradiol', 'estrogen', 'oestrogen', 'progesterone', 'prolactin',
    'homocysteine', 'fibrinogen', 'albumin', 'bilirubin', 'urea', 'bun', 'inr', 'lh', 'fsh', 'shbg',
    'dhea', 'dheas', 'igf', 'igf1', 'tpo', 't3', 't4', 'rt3', 'ft3', 'ft4', 'b12', 'd3', 'k2', 'folate',
    'glucose', 'hba', 'uric', 'urate', 'fbc', 'cbc', 'wbc', 'rbc', 'mcv', 'mch', 'platelets',
    'neutrophils', 'lymphocytes', 'eosinophils', 'amylase', 'lipase', 'troponin', 'bnp', 'ntprobnp',
    'pth', 'acth', 'aldosterone', 'renin', 'magnesium', 'potassium', 'sodium', 'calcium', 'phosphate',
    'zinc', 'selenium', 'iodine', 'dxa', 'dexa', 'bmd', 'vo2', 'hrv', 'ecg', 'ekg', 'mri', 'ct']);
  // Shape, not spelling: this is what catches the marker nobody thought to put in the lexicon.
  const markerShape = (raw) => /[A-Z]{2,6}/.test(raw) || /^[A-Za-z]{1,4}\d[A-Za-z0-9]*$/.test(raw);
  // Ordinary English. Every word here was measured against the 41 authored labels — nothing is
  // here speculatively, because every entry is a token this gate agrees to stop looking for.
  const STOP = new Set(('a an and are as at back be been before but by can day each fast fewer for from get '
    + 'getting go going had has have how i if in into is it its less long more much no not of off on once '
    + 'only or our out over per plus run same so still than that the their then there these this those to '
    + 'up us was week weeks were what when which while who why will with within you your yours').split(' '));
  const rawTokens = (s) => String(s == null ? '' : s).split(/[^A-Za-z0-9]+/).filter(Boolean);
  const stem = (t) => t.replace(/ies$/, 'y').replace(/(sses|shes|ches|xes)$/, '')
    .replace(/([^aeiou])ed$/, '$1').replace(/([^aeiou])ing$/, '$1').replace(/e?s$/, '').replace(/e$/, '');
  // A stop word that is also a clinical marker is a hole by construction, so it cannot be added.
  STOP.forEach((w) => {
    if (MARKERS.has(w) || markerShape(w)) {
      console.error(`[parse] PROTOCOL SAFETY: "${w}" is both a stop word and a clinical marker — refusing to build`);
      process.exit(1);
    }
  });
  // A quote that begins immediately after a negation asserts the opposite of the sentence it was
  // taken from. Measured: 0 of the 41 authored quotes start inside one.
  const NEG_TAIL = /(^|[^a-z])(not|never|no|nor|without|n't|rather than|instead of|other than|less than)[^a-z0-9]*$/i;
  const negatedRunUpTo = (src, at) => at >= 0 && NEG_TAIL.test(String(src).slice(Math.max(0, at - 14), at));
  // ---- W3.5 (2026-08-01): THE NEGATION GUARD COVERS EVERY PROMOTED FIELD, NOT ONE -------------
  // NEG_TAIL guarded `metricSource` and nothing else. `metric` — the one free-text field on this
  // card and the string the page prints biggest — had no negation guard at all, so a label could
  // assert the NEGATION of its own source and the build still exited 0. PROVEN BY REINTRODUCTION
  // in a sandbox copy of this repo: map.acne.metric = "A clear face overnight" against
  // /protocol/acne's authored prose "You are chasing the trend, not a clear face overnight."
  // — `node build/parse.js` exit 0, `npm run build` exit 0, `npm run smoke` PASSED, page shipped.
  // MEASURED HYDRATED at 390x844 on that build: data-primary-metric="A clear face overnight" under
  // "THE ONE THING TO TRACK" at y=1,114, while the sentence denying it renders at y=31,476 of a
  // 38,155 px page — 30,362 px, ~36 phone screens, apart. Every token of the label WAS in the
  // prose; the prose only ever says it is not the goal. So presence is not enough: a label may
  // only use words the prose AFFIRMS.
  // A negation scopes from its cue to the end of that clause. MEASURED over the 41 authored
  // `working` bodies: 85 negation spans on 41 of 41 problems covering 313 of 2,881 prose tokens
  // (10.9%). That is the surface this closes, and it is not an empty set.
  // Contractions are counted: "can't see or feel this working" (cholesterol) and "don't feel like
  // it" (low-mood) are the two in the corpus, and NEG_TAIL's own `n't` alternative can never fire
  // on them because it is preceded by a letter, so the cue below matches them explicitly.
  const NEG_CUE = /(?:^|[^a-z])(?:not|never|no|nor|without|rather than|instead of|other than|less than)(?=[^a-z]|$)|n['’]t(?=[^a-z]|$)/gi;
  const CLAUSE_END = /[,;:.!?()[\]{}"—–“”]/;
  // Every word of the prose, and separately only the words outside a negation's scope.
  const wordSets = (prose) => {
    const mask = new Array(prose.length).fill(false);
    NEG_CUE.lastIndex = 0;
    let m;
    while ((m = NEG_CUE.exec(prose))) {
      let i = m.index + m[0].length;
      while (i < prose.length && !CLAUSE_END.test(prose[i])) { mask[i] = true; i++; }
      NEG_CUE.lastIndex = m.index + m[0].length; // cues can nest: "not a back that never aches again"
    }
    const all = new Set(), affirmed = new Set(), re = /[A-Za-z0-9]+/g;
    let t;
    while ((t = re.exec(prose))) {
      const lo = t[0].toLowerCase();
      all.add(lo); all.add(stem(lo));
      if (!mask[t.index]) { affirmed.add(lo); affirmed.add(stem(lo)); }
    }
    return { all, affirmed };
  };
  // ---- W3.5: A STOP-RULE HORIZON MUST NAME A TIME, AND MUST NOT BE CUT OUT OF A WORD -----------
  // "verbatim substring of the rule" was the whole test, and a substring names whatever you like.
  // PROVEN BY REINTRODUCTION in the sandbox, four ways, all of which exited 0 before this:
  //   · map.acne.stopHorizon = "a consistent regimen" (from "No change after 12 weeks of a
  //     consistent regimen") -> header "THE STOP RULE - A CONSISTENT REGIMEN", no time at all;
  //   · map.acne.stopHorizon = "2 weeks", cut out of the middle of "12 weeks" -> header
  //     "THE STOP RULE - 2 WEEKS" over a rule that says 12 — telling the reader to seek help six
  //     times sooner than the rule, from a string that is a verbatim substring of it;
  //   · map.knee-pain.stopHorizon = "12 weeks of consistent strength", cut out of the END of
  //     "…strengthening" — names a time, word-aligned at the start, caught only by the tail test;
  //   · map.bone-density.stopHorizon = "improvement after 1-2 years", which begins immediately
  //     after "shows no" in its own rule -> the header asserts elapsed improvement the rule denies.
  // Shape only, never arithmetic: a quantity (digit or one..twelve) somewhere before a time unit.
  // MEASURED on the 41 authored horizons: 41/41 satisfy it ("12 weeks", "6 to 8 weeks", "two to
  // three months", "Two-plus weeks", "4-6 week block", "two-week deload", "1-2 years", "3+ months"),
  // 0/41 are cut mid-word, 0/41 follow a negation.
  const TIME_UNIT = /\b(?:hours?|days?|nights?|weeks?|months?|years?|sessions?|cycles?)\b/i;
  const TIME_QTY = /\d|\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b/i;
  const namesATime = (h) => { const u = h.search(TIME_UNIT), q = h.search(TIME_QTY); return u >= 0 && q >= 0 && q < u; };
  const isWordChar = (c) => /[A-Za-z0-9]/.test(c);
  const MIN_QUOTE = 24; // the authored minimum is 42 (adhd-focus); the median is 108.
  const bad = [];
  let joined = 0;
  graph.problems.forEach((p) => {
    const s = M[p.id];
    const pl = p.plan || {};
    if (!s) { bad.push(`${p.id}: no entry in data/protocol_safety.json — every problem must name the one metric it is tracked by and the point at which the answer is to stop`); return; }
    ['metric', 'metricSource', 'checkpoint', 'stopIssue', 'stopHorizon'].forEach((k) => {
      if (typeof s[k] !== 'string' || !s[k].trim()) bad.push(`${p.id}: ${k} is missing or empty`);
    });
    if (bad.length && bad[bad.length - 1].startsWith(p.id + ': ')) return;
    const working = String(pl.working || '');
    if (!working) { bad.push(`${p.id}: data/protocol_plan.json has no \`working\` prose to promote a metric from`); return; }
    const at = working.indexOf(s.metricSource);
    if (at < 0) {
      bad.push(`${p.id}: metricSource is not a verbatim quote of this problem's \`working\` prose — a promotion that does not quote its source is an invention`);
    } else if (s.metricSource.trim().length < MIN_QUOTE) {
      bad.push(`${p.id}: metricSource is ${s.metricSource.trim().length} characters — too short to be the sentence the label was condensed from`);
    } else if (negatedRunUpTo(working, at)) {
      bad.push(`${p.id}: metricSource begins immediately after a negation in its own prose ("${working.slice(Math.max(0, at - 14), at).trim()}"), so quoting it inverts what the page says`);
    }
    // ---- W2.5 (2026-08-01): A VERBATIM SUBSTRING IS NOT ENOUGH --------------------------------
    // A substring can start and stop anywhere, and 40 of the 41 authored quotes did. MEASURED
    // HYDRATED at 390x844 on all 52 /protocol/* routes (out/w25int/before.json): 49 of 52 cards
    // printed a quote that ran off with no full stop, and 4 printed a LITERAL ** because the quote
    // cut a bold span in half — /protocol/elbow-wrist/lateral-epicondylopathy rendered
    // "…grip before it complains** — track the actual weights and reps",
    // /protocol/bone-density/low-bmd rendered "…means a **stable or improved DXA scan".
    // Five stopped so early that a word needed to finish the clause was on the other side of the
    // cut: /protocol/burnout/hpa-dysregulation printed "…beats memory, which always rounds toward"
    // where the authored prose continues "'fine'."
    // So the quote must be WHOLE authored sentences. The fix is always to widen the selection to
    // the sentence the fragment already sits inside — never to write a new one.
    // Emphasis parity is counted on `**` RUNS first, then on the single `*` left over. Counting
    // bare asterisks does not work: "means a **stable or improved DXA scan" has two of them and
    // would pass, while the page still prints the pair.
    // PROVE THIS GATE by deleting the final "." from any metricSource in
    // data/protocol_safety.json: the build stops and names the file, the problem and the field.
    if (at >= 0) {
      const q = s.metricSource, tail = working.slice(at + q.length);
      if (!(at === 0 || /[.!?]["')]?\s+$/.test(working.slice(0, at)))) {
        bad.push(`${p.id}: metricSource starts mid-sentence — the card would open on a fragment (the authored prose runs up to it with ${JSON.stringify(working.slice(Math.max(0, at - 40), at))})`);
      }
      if (!(/[.!?]["')]?$/.test(q.trim()) || tail.trim() === '')) {
        bad.push(`${p.id}: metricSource ends mid-sentence — the card would stop mid-thought (the authored prose continues ${JSON.stringify(tail.slice(0, 40))})`);
      }
      if ((q.match(/\*\*/g) || []).length % 2 || (q.replace(/\*\*/g, '').match(/\*/g) || []).length % 2) {
        bad.push(`${p.id}: metricSource cuts a markdown emphasis span in half — the page renders a literal asterisk`);
      }
    }
    const { all: proseWords, affirmed: affirmedWords } = wordSets(working);
    const invented = [], unsourced = [], negated = [];
    rawTokens(s.metric).forEach((raw) => {
      const lo = raw.toLowerCase();
      if (MARKERS.has(lo) || markerShape(raw)) {
        if (affirmedWords.has(lo)) return;
        (proseWords.has(lo) ? negated : invented).push(raw);
        return;
      }
      if (STOP.has(lo)) return;
      if (affirmedWords.has(lo) || affirmedWords.has(stem(lo))) return;
      (proseWords.has(lo) || proseWords.has(stem(lo)) ? negated : unsourced).push(lo);
    });
    // And the label as a whole: if it appears verbatim, it must not start just after a negation.
    const labelAt = working.toLowerCase().indexOf(String(s.metric).trim().toLowerCase());
    if (negatedRunUpTo(working, labelAt)) negated.push(String(s.metric).trim());
    if (invented.length) bad.push(`${p.id}: metric label names the clinical marker(s) ${JSON.stringify(invented.join(', '))}, which this problem's own \`working\` prose never contains — the site must never assert a marker its own source does not name`);
    if (unsourced.length) bad.push(`${p.id}: metric label uses ${JSON.stringify(unsourced.join(', '))}, which its own \`working\` prose never mentions`);
    if (negated.length) bad.push(`${p.id}: metric label promotes ${JSON.stringify(negated.join(', '))} out of a NEGATED clause of its own \`working\` prose — the card would print as the one thing to track exactly what the page says it is not`);
    const missing = invented.concat(unsourced, negated);
    const whens = (pl.timeline || []).map((t) => t.when);
    if (whens.indexOf(s.checkpoint) < 0) bad.push(`${p.id}: checkpoint "${s.checkpoint}" is not one of this problem's timeline steps (${whens.join(' | ')})`);
    const stop = (pl.troubleshooting || []).find((t) => t.issue === s.stopIssue);
    if (!stop) bad.push(`${p.id}: stopIssue "${s.stopIssue}" is not one of this problem's authored troubleshooting entries`);
    // The header over the stop rule must name the horizon THE RULE names, never a timeline rung.
    // Until 2026-08-01 it printed `checkpoint` — which this same gate pins to a timeline `when`,
    // and which is the LAST rung on 41 of 41, so it could only ever agree with the rule by luck.
    // MEASURED HYDRATED, 390x844, all 52 routes (out/w25int/before.json):
    // /protocol/skin-aging/collagen-loss-glycation and /uv-oxidative headed "⏱️ THE STOP RULE ·
    // MONTHS 6–12" directly over the rule "No visible change after 12 weeks" — up to 4x longer
    // before the reader is told to seek help. /protocol/burnout/hpa-dysregulation headed "WEEKS
    // 6–8" over "after 3–4 weeks"; /protocol/chronic-fatigue/* headed "WEEKS 4-12" over "Two weeks".
    // stopHorizon must therefore be a verbatim substring of the rule it heads. Measured: 0 of the
    // 41 `checkpoint` values are a substring of their own stopIssue, so this gate provably rejects
    // the design that shipped. It deliberately does NOT parse durations — reading "two to three
    // months" numerically is the kind of cleverness that produces the next false finding.
    // PROVE THIS GATE by setting any stopHorizon back to that problem's `checkpoint`: the build stops.
    const horizon = typeof s.stopHorizon === 'string' ? s.stopHorizon : '';
    const hAt = horizon ? s.stopIssue.indexOf(horizon) : -1;
    if (horizon && hAt < 0) {
      bad.push(`${p.id}: stopHorizon "${horizon}" is not a verbatim substring of the rule it heads ("${s.stopIssue}") — the header must name the horizon the RULE names, never a timeline rung the rule is not about`);
    } else if (horizon) {
      if ((hAt > 0 && isWordChar(s.stopIssue[hAt - 1]) && isWordChar(horizon[0]))
        || (hAt + horizon.length < s.stopIssue.length && isWordChar(s.stopIssue[hAt + horizon.length]) && isWordChar(horizon[horizon.length - 1]))) {
        bad.push(`${p.id}: stopHorizon "${horizon}" is cut out of the middle of a word in its own rule ("${s.stopIssue}") — a substring can start anywhere, and "2 weeks" taken from "12 weeks" heads the rule with a sixth of the time it gives`);
      }
      if (!namesATime(horizon)) {
        bad.push(`${p.id}: stopHorizon "${horizon}" names no time — the header prints "The stop rule · ${horizon.toUpperCase()}" exactly where the reader looks for how long to wait before seeking help. Every promoted field is a selection, so the fix is to select the words of this rule that name its horizon, never to write one`);
      }
      if (negatedRunUpTo(s.stopIssue, hAt)) {
        bad.push(`${p.id}: stopHorizon "${horizon}" begins immediately after a negation in the rule it heads ("${s.stopIssue}") — the header would assert as fact the thing the rule says has NOT happened`);
      }
    }
    if (missing.length || !stop) return;
    // Folded onto the problem so site/app.js and build/prerender.js render ONE object and cannot
    // drift apart. It reaches window.RNAWIKI_DATA because `graph` is serialised wholesale below.
    p.safety = { metric: s.metric, metricSource: s.metricSource, checkpoint: s.checkpoint, stopIssue: s.stopIssue, stopHorizon: s.stopHorizon, stopFix: stop.fix };
    joined++;
  });
  Object.keys(M).forEach((pid) => {
    if (!graph.problems.some((p) => p.id === pid)) bad.push(`${pid}: in data/protocol_safety.json but no such problem exists`);
  });
  if (bad.length) {
    console.error('[parse] PROTOCOL SAFETY ASSERTION FAILED — the stop rule and the tracked metric must be promoted from authored prose, never invented:');
    bad.forEach((b) => console.error('  · ' + b));
    process.exit(1);
  }
  console.log('[parse] protocol safety: %d problems carry a named metric and a stop rule, every one quoted from its own plan', joined);
})();

// Per-root-cause keystone habit (data/keystones.json), folded onto each root cause. Warn on any
// keystone key that doesn't match a real root cause, so authoring typos are caught at build.
const keystones = readJSON(path.join(DATA_DIR, 'keystones.json')) || {};
// Learning-layer sidecar (analogy · mechSteps · pk · selfTest), keyed by compound slug, merged onto compounds.
const learn = normaliseNewlines(readJSON(path.join(DATA_DIR, 'compound_learn.json')) )|| {};
const _cslug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
let _learnHits = 0;
const LEARN_KEYS = ['refs', 'hook', 'bigIdea', 'stakes', 'analogy', 'mechSteps', 'framework', 'pk', 'sim', 'journey', 'myths', 'contrasts', 'whenToUse', 'checks', 'canExplain', 'selfTest', 'evi', 'tech'];
for (const c of compounds) { const L = learn[_cslug(c.name)]; if (!L) continue; _learnHits++; LEARN_KEYS.forEach(k => { if (L[k] != null) c[k] = L[k]; }); }
console.log('[parse] learning-layer entries merged:', _learnHits);
// Animated signal cascade for the compound pages too — 156 of 157 have 3+ mechSteps, and the
// compound page is the most-visited page type on the site.
{
  const { cascadeFigure } = require('./figures.js');
  let n = 0;
  for (const c of compounds) {
    if (!Array.isArray(c.mechSteps)) continue;
    const svg = cascadeFigure(c.mechSteps, c.name);
    if (svg) { c.cascade = svg; n++; }
  }
  console.log('[parse] compound signal cascades:', n);
}
// Biohacker / nutritionist layer (form · biomarkers · cofactors · food-first · cost/dose · dosing · timing ·
// cycling · contraindications · quality · non-responders · synergy), keyed by compound slug, merged onto c.bio.
const bioLearn = normaliseNewlines(readJSON(path.join(DATA_DIR, 'bio_learn.json')) )|| {};
let _bioHits = 0;
for (const c of compounds) { const B = bioLearn[_cslug(c.name)]; if (!B) continue; _bioHits++; c.bio = B; }
console.log('[parse] biohacker-layer entries merged:', _bioHits);
// ---- RULE 1 GATE: no brand or retailer named as somewhere to buy (2026-07-28) ----------------
// The bio layer publishes a "Buy:" line on 87 compounds, which is precisely the surface where a
// brand name would land. One had slipped in ("iHerb-style pricing"). Independent CERTIFICATION
// standards are explicitly fine and 86 compounds use them correctly — the rule is about naming a
// commercial seller or product, not about quality marks. Gate the class, not the instance.
{
  const BRANDS = /\b(Guardian|Watsons|Unity Pharmacy|iHerb|Amazon|Shopee|Lazada|GNC|Holland ?& ?Barrett|Optimum Nutrition|MyProtein|NOW Foods|Thorne|Jarrow|Doctor's Best|Life Extension|Nature's Bounty|Swanson|Costco|Vitacost|Puritan's Pride)\b/i;
  const bad = [];
  for (const c of compounds) {
    const b = c.bio; if (!b) continue;
    const surfaces = [b.form && b.form.buy, b.form && b.form.avoid, b.quality && b.quality.line,
      b.cost && b.cost.perDose, b.cost && b.cost.note, b.foodFirst && b.foodFirst.line].filter(Boolean).join(' \n ');
    const m = surfaces.match(BRANDS);
    if (m) bad.push(`${c.name}: names "${m[0]}"`);
  }
  if (bad.length) {
    console.error('[parse] RULE 1 — a commercial brand or retailer is named on a "where to get it" surface:');
    bad.forEach((x) => console.error('  ✗ ' + x));
    console.error('  Certification standards (NSF/USP/Informed Sport/IFOS) are fine; sellers are not. Refusing to build.');
    process.exit(1);
  }
  console.log(`[parse] rule-1 brand check: 0 retailers named across ${compounds.filter((c) => c.bio).length} bio entries`);
}

// ---- GATE: a bare "N compounds" count on a goal surface (2026-07-30) --------------------------
// The home page advertised "18 compounds" for Lose Fat where 18 of them were prescription-only,
// and "11 compounds" for Growth Hormone Axis Peptides where all 11 were. That is a promotional
// count for medicines a reader cannot legally obtain, on the site's most promotional surface, and
// Medicines Act 1975 s.51 has no educational exemption. It was fixed by hand in both renderers —
// this stops it coming back, because the next person to touch a goal card will not know.
{
  const RXC = new Set(['prescription', 'controlled', 'unapproved']);
  const risky = [];
  for (const g of GOALS) {
    const inGoal = compounds.filter((c) => (c.goalIds || []).includes(g.id));
    if (!inGoal.length) continue;
    const rx = inGoal.filter((c) => RXC.has(c.regulatory_class)).length;
    if (rx / inGoal.length > 0.5) risky.push(`${g.label}: ${rx}/${inGoal.length} prescription-only`);
  }
  // Both renderers must state the split wherever they print a per-goal count.
  const srcs = [
    ['site/app.js', fs.readFileSync(path.join(ROOT, 'site', 'app.js'), 'utf8')],
    ['build/prerender.js', fs.readFileSync(path.join(ROOT, 'build', 'prerender.js'), 'utf8')],
  ];
  // Match a per-goal count only: a bare "<count> compounds" phrase in the same expression as a
  // goal label. Matching any "} compounds" also caught target pages, which is a different surface.
  const bad = srcs.filter(([, src]) => /\$\{list\.length\} compounds that help you|\$\{n\} compounds<\/span>/.test(src));
  if (bad.length) {
    console.error('[parse] GOAL COUNT — a renderer prints a bare compound count per goal:');
    bad.forEach(([f]) => console.error(`  ✗ ${f}`));
    console.error(`  ${risky.length} goals are majority prescription-only (${risky.slice(0, 3).join('; ')}).`);
    console.error('  State the split ("N you can buy · M prescription-only"). Refusing to build.');
    process.exit(1);
  }
  console.log(`[parse] goal-count gate OK — ${risky.length} majority-Rx goals, both renderers state the split`);

}
// Pathway learning layer — same field names as compounds (so the chaptered pathway page reuses the
// pedagogy components). Keyed by a slug of the pathway's shortLabel.
const pwLearn = readJSON(path.join(DATA_DIR, 'pathway_learn.json')) || {};
const PW_LEARN_KEYS = ['hook', 'bigIdea', 'stakes', 'analogy', 'mechSteps', 'myths', 'canExplain', 'selfTest'];
let _pwHits = 0;
for (const p of pathwayList) { const L = pwLearn[_cslug(p.shortLabel)]; if (!L) continue; _pwHits++; PW_LEARN_KEYS.forEach(k => { if (L[k] != null) p[k] = L[k]; }); }
console.log('[parse] pathway learning entries merged:', _pwHits);
// Pathway deep-expansion (course depth: fundamentals/deepDive/expertLens/connections) onto p.expand.
let _pwExp = 0;
for (const p of pathwayList) { const x = learnExpand['pathway:' + _cslug(p.shortLabel)]; if (x) { p.expand = x; _pwExp++; } }
console.log('[parse] pathway expansions merged:', _pwExp);
// Target learning layer — same field names as compounds/pathways (chaptered target page reuses them).
const tgLearn = normaliseNewlines(readJSON(path.join(DATA_DIR, 'target_learn.json')) )|| {};
const _tk = s => String(s).toUpperCase().replace(/[^A-Z0-9]/g, '');
const TG_LEARN_KEYS = ['hook', 'bigIdea', 'stakes', 'analogy', 'mechSteps', 'myths', 'canExplain', 'selfTest'];
let _tgHits = 0;
for (const t of targets) { const L = tgLearn[_tk(t.sym)]; if (!L) continue; _tgHits++; TG_LEARN_KEYS.forEach(k => { if (L[k] != null) t[k] = L[k]; }); }
console.log('[parse] target learning entries merged:', _tgHits);
// ---- AUTOMATIC PRESCRIPTION-STATUS NOTICE (2026-07-28) ---------------------------------------
// 37 of 103 target entries name a prescription-only or controlled medicine — GLP1R names
// semaglutide, tirzepatide and liraglutide; ESR1 names tamoxifen and clomiphene — with no signal
// anywhere on the page that these need a prescriber. That is the exact defect the stage-2 gate
// audit predicted for the /target register, and it is why these pages were held back.
//
// Hand-writing 37 bespoke sentences would fix today and rot tomorrow: the 38th entry would ship
// silent. Derive the notice from regulatory_class.json instead, so it is always accurate, always
// consistent, and covers entries that do not exist yet. It states the legal fact and nothing more —
// no dose, no source, no encouragement, which is what Medicines Act 1975 s.51 requires of us.
{
  const pomNames = pomTokens();
  let noticed = 0;
  for (const t of targets) {
    const blob = JSON.stringify(t);          // the same object the gate will read
    const named = pomNames.filter((p) => POM_RE(p.token).test(blob));
    if (!named.length) continue;
    const uniq = [...new Map(named.map((p) => [p.token.toLowerCase(), p])).values()];
    const list = uniq.map((p) => p.token);
    const anyControlled = uniq.some((p) => p.cls === 'controlled');
    t.pomNotice = {
      names: list,
      text: `This page explains a molecular target, and in doing so it names ${list.length === 1 ? '' : 'medicines including '}${
        list.slice(0, 4).join(', ').replace(/, ([^,]*)$/, ' and $1')}${list.length > 4 ? `, and ${list.length - 4} other${list.length - 4 === 1 ? '' : 's'}` : ''}. ${
        list.length === 1 ? 'It is' : 'These are'} ${anyControlled ? 'prescription-only or controlled' : 'prescription-only'} in Singapore: ${
        list.length === 1 ? 'it' : 'they'} can only be supplied on a doctor's prescription, and nothing here is a recommendation to take ${list.length === 1 ? 'it' : 'them'}.`,
    };
    noticed++;
  }
  console.log(`[parse] target pages carrying an automatic prescription notice: ${noticed}/${targets.length}`);
  // Targets carry mechSteps too — they were the one corpus left without a cascade.
  const { cascadeFigure: _cf } = require('./figures.js');
  let tc = 0;
  for (const t of targets) {
    if (!Array.isArray(t.mechSteps)) continue;
    const svg = _cf(t.mechSteps, t.sym);
    if (svg) { t.cascade = svg; tc++; }
  }
  console.log(`[parse] target signal cascades: ${tc}/${targets.length}`);
}
// Fix broken PubChem links whose URL path used the compound NAME instead of the numeric CID that the
// label carries (e.g. .../compound/Tirzepatide → .../compound/156588324). Deterministic; no network.
let _pubchemFixed = 0;
for (const c of compounds) {
  if (!c.target) continue;
  c.target = c.target.replace(/\[([^\]]*?CID\s*(\d+)[^\]]*)\]\((https?:\/\/pubchem\.ncbi\.nlm\.nih\.gov\/compound\/)([^)]+)\)/gi,
    (m, label, cid, base, path) => (/^\d+$/.test(path) ? m : (_pubchemFixed++, `[${label}](${base}${cid})`)));
}
console.log('[parse] broken PubChem name-URLs repaired from label CID:', _pubchemFixed);
if (graph && graph.problems) {
  const allRc = new Set();
  graph.problems.forEach(p => p.root_causes.forEach(rc => { allRc.add(rc.id); if (keystones[rc.id]) rc.keystone = keystones[rc.id]; }));
  Object.keys(keystones).filter(k => k[0] !== '_').forEach(k => { if (!allRc.has(k)) console.warn(`[parse] keystone "${k}" matches no root cause`); });
}

// ---- W4 (2026-08-02): THE $0 PHASE 1, PROMOTED AND GATED -------------------------------------
// MEASURED HYDRATED at 390x844 in the DEFAULT DOM state (nothing clicked, nothing expanded) on all
// 52 /protocol/* routes before this — out/w4int_before.json:
//   · "Phase 1" / "Phase 2" anywhere on the page                 0/52
//   · "$0" / "zero-cost" anywhere on the page                    1/52
//   · any instruction to hold everything else constant           0/52
//   · the ⭐ keystone card — this page's own free single habit —  median y 17,687 px = 94% of a
//     median 18,939 px page on 52/52, and 7,732 px BELOW the page's first supplement link
//     (median y 9,698 px, 54%) on 52/52.
// The cheapest thing on the page was the last thing on the page.
//
// data/protocol_phase1.json does NOT author a Phase 1. It SELECTS one from that root cause's own
// keystone, its own movement prescription, or a fix its own mapped cause authored with
// kind:"behavior", and this gate keeps the selection honest. Measured over the 52 authored
// keystones: 34 of 52 are not a valid Phase 1 as written — they name two or three things, a
// purchase, or a prescription. 44 root causes carry one; the other 8 declare they have none with a
// stated reason, and the page prints it. Inventing a free lever for hair-loss/dht-sensitivity
// (finasteride and minoxidil) is exactly the fabrication class W3.5 closed.
// PROVE THIS GATE by reintroduction: set any action to "A daily step floor plus protein at each
// meal" (two things), "A daily psyllium scoop" (a purchase), "Minoxidil every single day" (a
// prescription), or change one character of any quote.
const protoPhase1 = readJSON(path.join(DATA_DIR, 'protocol_phase1.json')) || {};
// Filled by assertPhase1() below and folded into data.phase1Guard where `data` is built. It is the
// source text of the two $0 patterns, so the browser can re-run this build's own rule rather than
// keep a second copy of the word list.
let phase1GuardSrc = null;
(function assertPhase1() {
  if (!graph || !graph.problems) return;
  const M = protoPhase1.map || {}, NO = protoPhase1.noZeroCost || {};
  const CLASSES = new Set(['movement', 'timing', 'light', 'sleep', 'breath', 'removal', 'food-swap', 'measurement', 'rest']);
  // A Phase 1 that costs money is not a Phase 1. These name a thing you buy, a thing a clinician
  // prescribes, or a lab you pay for.
  const PURCHASE = /\b(buy|buys|buying|bought|order|orders|purchase|purchases|supplement|supplements|capsule|capsules|tablet|tablets|pill|pills|powder|scoop|sachet|serum|cream|gel|patch|sunscreen|spf|retinoid|device|monitor|tracker|wearable|band|bands|dumbbell|dumbbells|barbell|kettlebell|machine|membership|gym|subscription|kit|assay|panel|bloodwork|blood test|lab test|labs|scan|dxa|dexa)\b/i;
  const RX = /\b(prescription|prescribed|prescribe|medication|medicine|meds|drug|drugs|dose|dosage|mg|mcg|iu|trt|hrt|therapy|inject|injection|clinic|doctor|physician|gp|pharmacist)\b/i;
  // W4 (2026-08-02): the Research Receipt re-runs these TWO PATTERNS at generation time, in the
  // browser, before it will write a card. They are PUBLISHED here rather than retyped in
  // site/app.js on purpose — a second hand-kept copy of a word list is the drift that made the
  // interaction coverage number a lie in W3.6. One list, two consumers. If data.phase1Guard is
  // absent, receiptGuard() refuses: the receipt fails CLOSED, because a receipt that cannot prove
  // the week was free is exactly the receipt this rule exists to stop.
  // The exact class that makes 34 of the 52 authored keystones more than one intervention.
  const LISTY = /(,|;|\+|&| and | plus | then | also | as well as | while | along with )/i;
  const ACTION_MAX = 72;
  const FN = ('a an the of to for with in on at your you it its and or is are be as this that from by per each every one').split(' ');
  const FN_SET = new Set(FN);
  // W6 (2026-08-08): THE STEMMER IS NOW DATA, so the browser can run the identical one instead of a
  // hand-typed second copy. Rewritten from the inline arrow it replaces and verified byte-for-byte
  // equivalent over every word in every published action and quote (241 distinct words,
  // 0 disagreements) before it was allowed to ship.
  const P1_STEM = [['ies$', 'y'], ['(sses|shes|ches|xes)$', ''], ['([^aeiou])ed$', '$1'], ['([^aeiou])ing$', '$1'], ['e?s$', ''], ['e$', '']];
  const p1stem = (t) => P1_STEM.reduce((s, pr) => s.replace(new RegExp(pr[0]), pr[1]), t);
  // W6 (2026-08-08): AND THE STRUCTURE, NOT ONLY THE WORDS. The two patterns above are a word list,
  // and a word list loses. MEASURED HYDRATED at 390x844 on /protocol/cravings/glycemic-swings with
  // the LIVE rc.phase1.action swapped in page memory — the same technique scripts/smoke.mjs already
  // uses — 8 of 8 synonyms produced a finished card, a real PNG and an X share link, every one of
  // them reading "One free thing, nothing bought" (qa/w6_dollar.mjs):
  //   "Take 500 milligrams of it before bed"  (evades \bmg\b)   "Two grams before bed"
  //   "One softgel with your evening meal"    "One stick pack each morning"
  //   "Get your bloods done first"            "Ask at the polyclinic"
  //   "Ask a nurse first"                     "Pick up a chest belt"
  // Both known-word controls ("A daily psyllium scoop", "Take the prescribed dose daily") were
  // correctly refused, so the existing layer works — it is just not the layer that matters.
  // The answer is not more words. This gate ALREADY proves, for all 44 published Phase 1s, that the
  // action is a condensation of its own authored quote and that its class, cost and source are
  // enumerated values. So the browser's job is not to re-judge the prose; it is to confirm the
  // prose is the prose this gate judged. Everything that check needs is published here rather than
  // retyped in site/app.js — one list, two consumers, the same principle as the two patterns.
  // VERIFIED IN BOTH DIRECTIONS before shipping: 44 of 44 published Phase 1s pass the derivation
  // rule, and 8 of 8 evasions fail it against the real quote for cravings/glycemic-swings
  // ("A protein-forward breakfast — no naked carbs"). Not a gate over an empty set.
  phase1GuardSrc = {
    purchase: PURCHASE.source, rx: RX.source,
    classes: [...CLASSES], from: ['keystone', 'prescription', 'fix'],
    fn: FN, stem: P1_STEM, actionMax: ACTION_MAX, listy: LISTY.source,
  };
  const p1words = (s) => String(s || '').toLowerCase().split(/[^a-z0-9À-ɏ]+/).filter(Boolean);
  // Every compound the corpus knows, so a Phase 1 can never name a molecule to acquire.
  const CPD = new Set();
  (regClassFile.compounds || []).forEach((r) => { if (r && r.name) CPD.add(String(r.name).toLowerCase()); });
  graph.problems.forEach((p) => p.root_causes.forEach((rc) => (rc.compounds || []).forEach((n) => CPD.add(String(n).toLowerCase()))));
  // A class name that is also a purchase or Rx word would be a hole by construction.
  CLASSES.forEach((c) => { if (PURCHASE.test(c) || RX.test(c)) { console.error(`[parse] PHASE 1: class "${c}" is also a purchase/prescription word — refusing to build`); process.exit(1); } });
  // The realistic time-to-effect, taken from the protocol's OWN timeline and never written here.
  // timeline[0].when === 'Week 0' on 41 of 41, so the earliest change a protocol claims is
  // timeline[1].when. Recognised shapes only — an unparsable horizon fails the build rather than
  // being guessed at, because guessing is how a page promises a result it never promised.
  // MEASURED over the 41: 6 name a window entirely inside 7 days, 35 do not, 0 unparsable.
  const WHEN_SHAPES = [
    [/^Nights?\s+(\d+)(?:\s*[–-]\s*(\d+))?$/i, (a, b) => Math.max(+a, +(b || a))],
    [/^Days?\s+(\d+)(?:\s*[–-]\s*(\d+))?$/i, (a, b) => Math.max(+a, +(b || a))],
    [/^Weeks?\s+(\d+)(?:(?:\s*[–-]\s*| to )(\d+))?$/i, (a, b) => 7 * Math.max(+a, +(b || a))],
    [/^Months?\s+(\d+)(?:\s*[–-]\s*(\d+))?$/i, (a, b) => 30 * Math.max(+a, +(b || a))],
  ];
  const bad = [];
  let withP1 = 0, without = 0, within7 = 0;
  const seen = new Set();
  graph.problems.forEach((p) => {
    // signal horizon, per problem
    const tl = ((p.plan || {}).timeline) || [];
    const when = (tl[1] || {}).when;
    if (!when) { bad.push(`${p.id}: data/protocol_plan.json has no second timeline rung — nothing states when the first change is expected`); }
    else {
      let lastDay = null;
      for (const [re, f] of WHEN_SHAPES) { const m = when.match(re); if (m) { lastDay = f(m[1], m[2]); break; } }
      if (lastDay === null) bad.push(`${p.id}: timeline rung "${when}" is not a shape this build can read, so it cannot honestly say whether the first change falls inside 7 days. Author it as Days N-N, Nights N-N, Weeks N-N or Months N-N`);
      else { p.phase1Signal = when; p.phase1SignalWithin7 = lastDay <= 7; if (lastDay <= 7) within7++; }
    }
    p.root_causes.forEach((rc) => {
      const key = `${p.id}/${rc.id}`;
      seen.add(key);
      if (!(key in M)) { bad.push(`${key}: no entry in data/protocol_phase1.json — every protocol must name its ONE $0 Phase 1, or null with a reason`); return; }
      const e = M[key];
      if (e === null) {
        if (!NO[key] || String(NO[key]).trim().length < 40) { bad.push(`${key}: mapped to null but noZeroCost carries no stated reason. Saying "this protocol has no free first step" is honest; saying nothing is not`); return; }
        rc.phase1None = String(NO[key]).trim(); without++; return;
      }
      let src = null;
      if (e.from === 'keystone') src = (rc.keystone || {}).one;
      else if (e.from === 'prescription') src = (rc.prescription || {}).detail;
      else if (e.from === 'fix') {
        const causes = ((p.why || {}).causes) || [];
        const cause = rc.cause_key ? causes.find((c) => c.name === rc.cause_key) : causes.slice().sort((a, b) => (a.rank || 9) - (b.rank || 9))[0];
        const f = ((cause || {}).fixes || []).find((x) => x.what === e.fix);
        if (!f) { bad.push(`${key}: from="fix" but no fix on its mapped cause has that exact \`what\``); return; }
        if (f.kind !== 'behavior') { bad.push(`${key}: Phase 1 quotes a fix of kind "${f.kind}" — Phase 1 may only quote kind "behavior"`); return; }
        src = f.what;
      } else { bad.push(`${key}: from="${e.from}" is not one of keystone | prescription | fix`); return; }
      if (!src) { bad.push(`${key}: from="${e.from}" resolves to nothing authored`); return; }
      if (!String(src).includes(e.quote)) bad.push(`${key}: quote is not a verbatim substring of its ${e.from} source`);
      const q = new Set(); p1words(e.quote).forEach((w) => { q.add(w); q.add(p1stem(w)); });
      const miss = p1words(e.action).filter((w) => !FN_SET.has(w) && !q.has(w) && !q.has(p1stem(w)));
      if (miss.length) bad.push(`${key}: action uses ${JSON.stringify(miss)} — not in its own quote. A Phase 1 may condense authored text, never add to it`);
      if (LISTY.test(e.action)) bad.push(`${key}: action "${e.action}" joins two things — Phase 1 is ONE intervention, not a list. 34 of the 52 authored keystones fail here, which is why this check exists`);
      if (e.action.length > ACTION_MAX) bad.push(`${key}: action is ${e.action.length} chars (max ${ACTION_MAX}) — too long to be one commitment`);
      if (e.cost !== 'none') bad.push(`${key}: cost must be the literal "none"`);
      let m = e.action.match(PURCHASE); if (m) bad.push(`${key}: action names "${m[0]}" — Phase 1 must cost $0`);
      m = e.action.match(RX); if (m) bad.push(`${key}: action names "${m[0]}" — Phase 1 must never be a prescription or a dose`);
      const named = [...CPD].filter((n) => n.length > 3 && new RegExp(`(^|[^a-z])${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`, 'i').test(e.action));
      if (named.length) bad.push(`${key}: action names the compound(s) ${JSON.stringify(named)} — Phase 1 is the non-supplement lever`);
      if (!CLASSES.has(e.class)) bad.push(`${key}: class "${e.class}" is not one of ${[...CLASSES].join(' | ')}`);
      rc.phase1 = { action: e.action, quote: e.quote, from: e.from, class: e.class, cost: e.cost };
      withP1++;
    });
  });
  Object.keys(M).forEach((k) => { if (!seen.has(k)) bad.push(`${k}: mapped in data/protocol_phase1.json but no such root cause exists`); });
  if (bad.length) {
    console.error('[parse] PHASE 1 ASSERTION FAILED — a $0 Phase 1 must be ONE free, non-prescription thing, selected from this page’s own authored text:');
    bad.forEach((b) => console.error('  · ' + b));
    process.exit(1);
  }
  console.log('[parse] phase 1: %d root causes carry a $0 one-intervention Phase 1, %d honestly state they have none; %d of 41 problems expect their first change inside 7 days', withP1, without, within7);
})();

// Attach the relevant muscle set to each root cause (the muscles that map to this problem in
// anatomy.json). generateProtocol uses it to keep Move exercises in the right body region — so a
// knee protocol can't surface a chest exercise via a generic tag like "low_impact_deload".
if (graph && graph.problems && anatomy && anatomy.muscles) {
  graph.problems.forEach((p) => {
    const rel = anatomy.muscles.filter((m) => (m.problems || []).includes(p.id)).map((m) => (m.db_name || m.id));
    if (rel.length) p.root_causes.forEach((rc) => { rc.relevant_muscles = rel; });
  });
}

// Cross-link each muscle to the exercises/stretches that train it (matched on primaryMuscles).
// Store just id+name (top-scored) so data.js stays light; app.js resolves full cards from exercises.js.
if (exercisesData && exercisesData.exercises) {
  const byScore = (a, b) => (b.score || 0) - (a.score || 0);
  anatomy.muscles.forEach(m => {
    const mn = m.db_name || m.id;
    const hits = exercisesData.exercises.filter(e => (e.primaryMuscles || []).includes(mn));
    const pick = arr => arr.sort(byScore).slice(0, 14).map(e => ({ id: e.id, name: e.name, level: e.level || '' }));
    m.exercises = pick(hits.filter(e => e.kind !== 'stretch'));
    m.stretches = pick(hits.filter(e => e.kind === 'stretch'));
    m.exercise_count = hits.filter(e => e.kind !== 'stretch').length;
    m.stretch_count = hits.filter(e => e.kind === 'stretch').length;
  });
}
// Reverse bridge: which muscles rely on each energy system (so an energy page links to muscles).
(anatomy.energy_systems || []).forEach(e => {
  e.muscles = (anatomy.muscles || []).filter(m => (m.energy_systems || []).includes(e.id)).map(m => ({ id: m.id, name: m.name }));
});

// ---- Move 4: "Where does it hurt?" body map. Prebuilt here so the SVG + text index are IDENTICAL
// in the prerendered and hydrated documents (no twin drift). Text index is the crawlable/a11y core;
// the SVG is an aria-hidden visual enhancement that scrolls to the matching index section. ----
const bodyZones = readJSON(path.join(DATA_DIR, 'body_zones.json')) || null;
let bodyWhereSvg = '', bodyWhereIndex = '';
if (bodyZones && Array.isArray(bodyZones.zones)) {
  const eh = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const probById = {}; ((graph && graph.problems) || []).forEach((p) => { probById[p.id] = p; });
  const sil = (ox) => bodyZones.silhouette.map((s) => s.t === 'ellipse'
    ? `<ellipse class="bw-sil" cx="${s.cx + ox}" cy="${s.cy}" rx="${s.rx}" ry="${s.ry}"/>`
    : `<rect class="bw-sil" x="${s.x + ox}" y="${s.y}" width="${s.w}" height="${s.h}" rx="${s.rx || 0}"/>`).join('');
  // ---- W5c (2026-08-02): THE BODY MAP WAS UNTAPPABLE AND UNREACHABLE BY KEYBOARD -------------
  // Measured hydrated at 390x844 (qa/out/w5cdi/before-390.json):
  //   · 21 of 25 hotspots were under 24x24 CSS px. The smallest, Elbow, rendered 16.7x22.2.
  //   · tabindex was null on 25/25 and role was null on 25/25, and 90 real Tab presses focused a
  //     .bw-zone ZERO times. The map was mouse-and-touch only, in an <svg role="img"> — and
  //     role="img" removes every child from the accessibility tree, so a keyboard or screen-reader
  //     user was not merely unable to activate a zone, the zones did not exist for them.
  // MIN_R = 13 viewBox units. The map is 380 units wide and renders ~350 CSS px at a 390 viewport
  // (scale 0.925), so 2 x 13 = 26 units = 24.1 CSS px, which clears WCAG 2.5.8. Verified against
  // every pair of zones that this does not create a new overlap in either figure.
  // ONE FOCUS STOP PER ZONE, NOT PER SHAPE. Six zones are drawn as a symmetric pair (both elbows,
  // both knees…) and both shapes carry the same data-zone, so only the first is focusable and
  // labelled; the twin is aria-hidden. That gives 15 tab stops for 15 sections, not 25 for 15.
  // TWO LAYERS, NOT ONE. The drawn ellipse keeps its authored size — the elbow blob has to look
  // like an elbow, not like a knee — and a SEPARATE, invisible `.bw-hit` ellipse carries the touch
  // target, the focus stop and the accessible name. Growing the drawn shapes to 26 units was tried
  // first and rejected: rendered at 390px it merged the neck into the shoulders and the wrists
  // into the hips, which trades a touch defect for a legibility one.
  // MIN_R = 13 viewBox units. The map is 380 units wide and renders ~352 CSS px at a 390 viewport
  // (scale 0.926), so 2 x 13 = 26 units = 24.1 CSS px, which clears WCAG 2.5.8's 24x24 minimum.
  // ORDER IS THE HIT TEST. SVG has no z-index; the last painted element wins a click, so the hit
  // layer is emitted after every drawn shape, and within it the SMALLEST zones last — otherwise a
  // grown elbow target sitting under a hip target would be unreachable exactly where it matters.
  // ONE FOCUS STOP PER ZONE, NOT PER SHAPE: six zones are drawn as a symmetric pair (both elbows,
  // both knees), both halves stay tappable, and only the first is focusable and labelled. 15 tab
  // stops for the 15 sections below, not 25.
  const MIN_R = 13;
  const zoneEls = bodyZones.zones.map((z) => {
    const ox = (bodyZones.figures[z.view] || { ox: 0 }).ox;
    return (z.shapes || []).map((sh) => `<ellipse class="bw-zone" data-zone="${eh(z.id)}" aria-hidden="true" focusable="false" cx="${sh.cx + ox}" cy="${sh.cy}" rx="${sh.rx}" ry="${sh.ry}"><title>${eh(z.label)}</title></ellipse>`).join('');
  }).join('');
  const hitEls = bodyZones.zones
    .map((z) => ({ z, area: Math.max(...(z.shapes || [{ rx: 0, ry: 0 }]).map((sh) => sh.rx * sh.ry)) }))
    .sort((a, b2) => b2.area - a.area)          // biggest first => smallest painted last => wins the tap
    .map(({ z }) => {
      const ox = (bodyZones.figures[z.view] || { ox: 0 }).ox;
      return (z.shapes || []).map((sh, i) => {
        const rx = Math.max(sh.rx, MIN_R), ry = Math.max(sh.ry, MIN_R);
        const a11y = i === 0
          ? ` role="button" tabindex="0" aria-label="${eh(z.label)} — jump to what it could be"`
          : ' aria-hidden="true" focusable="false"';
        return `<ellipse class="bw-hit" data-zone="${eh(z.id)}"${a11y} cx="${sh.cx + ox}" cy="${sh.cy}" rx="${rx}" ry="${ry}"></ellipse>`;
      }).join('');
    }).join('');
  const flabel = (v) => `<text class="bw-flabel" x="${(bodyZones.figures[v].ox) + 80}" y="428" text-anchor="middle">${eh(bodyZones.figures[v].label)}</text>`;
  // role="group", not role="img": role="img" prunes every descendant from the accessibility tree,
  // which is why 25 hotspots that are now real buttons would still have been invisible to AT.
  bodyWhereSvg = `<svg class="body-where-svg" viewBox="${eh(bodyZones.viewBox)}" role="group" aria-label="Body map — front and back. Choose where it hurts, or use the list below." xmlns="http://www.w3.org/2000/svg">${sil(bodyZones.figures.front.ox)}${sil(bodyZones.figures.back.ox)}${zoneEls}${flabel('front')}${flabel('back')}${hitEls}</svg>`;
  bodyWhereIndex = '<div class="bw-index">' + bodyZones.zones.map((z) => {
    const probs = (z.problemIds || []).map((pid) => probById[pid]).filter(Boolean);
    let items;
    if (probs.length) {
      items = probs.map((p) => {
        const rc0 = (p.root_causes && p.root_causes[0]) ? p.root_causes[0].id : '';
        // W5c: the 15 "find your cause →" buttons all carried the IDENTICAL accessible name and
        // no aria-label — measured hydrated, 15 buttons, 1 distinct label. A screen-reader user
        // listing the controls on this page heard the same sentence fifteen times with nothing to
        // tell them apart. The visible label stays (it reads correctly beside the problem name it
        // follows); the accessible name now names the problem, which is WCAG 2.4.6/4.1.2.
        return `<li><a class="bw-prob" href="/protocol/${eh(p.id)}/${eh(rc0)}"><b>${eh(p.name)}</b></a> <button class="bw-find" data-find-cause="${eh(p.id)}" type="button" aria-label="Find your cause — ${eh(p.name)}">find your cause &rarr;</button></li>`;
      }).join('');
    } else if (z.muscleGroup) {
      items = `<li><a class="bw-prob" href="/muscle/${eh(z.muscleGroup)}">Explore the ${eh(z.label.toLowerCase())} muscles &rarr;</a></li>`;
    } else {
      items = '<li class="bw-none">No dedicated protocol yet &mdash; <a href="/solve">describe it here</a>.</li>';
    }
    return `<section class="bw-zone-sec" id="zone-${eh(z.id)}"><h3>${eh(z.label)}</h3><ul>${items}</ul></section>`;
  }).join('') + '</div>';
}

const data = {
  meta: { generated: 'build', counts: {} },
  goals: GOALS,
  approvalLabels: APPROVAL_LABEL,
  ratings: RATING,   // W5a: the star rating's TEXT, so the renderer cannot carry it in colour alone
  compounds,
  targets,
  categories: [...new Set(compounds.map(c => c.category).filter(Boolean))],
  modules,
  pathways: pathwayList,
  anatomy,
  structures,
  bodyZones, bodyWhereSvg, bodyWhereIndex,
  graph: graph || { problems: [], categories: [], domains: {} },
};
// W4: the $0 rule's own word lists, published so the Research Receipt can re-run THIS BUILD'S rule
// in the browser instead of keeping a second copy of it. Null if assertPhase1() never ran, and
// receiptGuard() in site/app.js refuses to write a card when it is null — fail closed.
data.phase1Guard = phase1GuardSrc;
data.meta.counts = {
  compounds: compounds.length,
  categories: data.categories.length,
  modules: modules.length,
  pathways: pathwayList.length,
  targets: targets.length,
  geneLinks: compounds.reduce((a, c) => a + c.geneLinks, 0),
  pubchem: compounds.reduce((a, c) => a + c.pubchem, 0),
  muscles: anatomy.muscles.length,
  energySystems: anatomy.energy_systems.length,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
// ---- ONE GLOSSARY FOR BOTH DOCUMENTS (2026-07-30) --------------------------------------------
// The SPA carried two glossaries of its own (40 + 83 terms, 19 defined twice with conflicting
// wordings) while the prerendered document had none. data/glossary.json is now the single source:
// prerender.js glosses the static HTML from it, and the SPA reads the same object out of data.js.
// Two lists that must agree are one list — the rule that fixed the POM token drift.
// ---- SHORT-NAME ALIASES (2026-07-30) ---------------------------------------------------------
// "do not ever leave a page as an error." /c/creatine, /c/collagen, /c/testosterone and /c/insulin
// all 404'd, because the real entries are "Creatine Monohydrate", "Collagen Peptides" and so on.
// Those are the most obvious things a reader would type. Build an alias map from each compound's
// own name — the leading word, and the name minus any parenthetical — and let the server resolve
// them. Only unambiguous aliases are kept: if two compounds would claim the same short name,
// neither gets it, because guessing between them is worse than showing a search.
{
  const claims = new Map();
  const add = (alias, slug) => {
    const a = String(alias).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (!a || a.length < 3) return;
    if (!claims.has(a)) claims.set(a, new Set());
    claims.get(a).add(slug);
  };
  for (const c of compounds) {
    const slug = String(c.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const bare = String(c.name).replace(/\([^)]*\)/g, ' ').trim();   // "Insulin (anabolic misuse)" -> "Insulin"
    add(bare, slug);
    add(bare.split(/[\s/,-]+/)[0], slug);                            // "Creatine Monohydrate" -> "creatine"
    (String(c.name).match(/\(([^)]*)\)/) || [, ''])[1].split('/').forEach((al) => add(al, slug));
  }
  // Curated overrides beat the ambiguity rule. "insulin" is claimed by both the prescribed
  // medicine and the anabolic-misuse entry, so the automatic rule drops it — and a reader typing
  // "insulin" would get nothing. Sending them to the misuse page instead would be worse: someone
  // looking up their own diabetes medication would land on a page about bodybuilders. Point it at
  // the medicine; that page links to the misuse entry.
  const ALIAS_OVERRIDE = { insulin: 'insulin-prescribed' };
  data.compoundAliases = Object.assign({}, ALIAS_OVERRIDE);
  let kept = 0, dropped = 0;
  for (const [alias, slugs] of claims) {
    if (slugs.size !== 1) { dropped++; continue; }         // ambiguous — let search handle it
    const only = [...slugs][0];
    if (alias === only) continue;                          // already the canonical slug
    if (ALIAS_OVERRIDE[alias]) continue;                   // curated answer wins
    data.compoundAliases[alias] = only; kept++;
  }
  console.log(`[parse] compound aliases: ${kept} unambiguous, ${dropped} ambiguous left to search`);
}

// ---- GATE: the interaction checker must not overstate what it knows (W3, 2026-08-01) ----------
// site/interactions.js is exhaustive by RULE, not by pair, which is only honest if the numbers it
// publishes are true and every tag it assigns is actually read by something. Before this gate:
//   · its header claimed "Covers all 170 compounds" — the corpus is 171 and coverage was 94;
//   · six assigned tags (hypotensive, sedative_mild, 5ar_inhibitor, glp1, iron, vitc) were read by
//     no rule, so six compounds could never produce a flag while looking tagged;
//   · nothing would have caught a typo in a rule's `need`, which silently disables a danger rule.
// This gate does not demand full coverage — the honest answer to a gap is the "❔ Not enough to
// check" state in the panel. It demands that the PUBLISHED number be TRUE, that no rule depend on
// a tag no compound carries, and that no tag be assigned that no rule consumes.
// Prove it by changing any number in `coverage`, or by misspelling a tag in either direction.
(function assertInteractionCoverage() {
  const IX_PATH = path.join(ROOT, 'site', 'interactions.js');
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(IX_PATH, 'utf8'), sandbox, { filename: IX_PATH });
  const R = sandbox.window.RNAWIKI_INTERACTIONS;
  if (!R) { console.error('[parse] site/interactions.js did not define window.RNAWIKI_INTERACTIONS'); process.exit(1); }
  const bad = [];
  // app.js's compoundTags(), reproduced exactly — if these two ever diverge the number is a lie.
  // W3.6 (2026-08-02): both copies now key on the compound ID, not on a substring of its name.
  // That is deliberately a SET MEMBERSHIP test rather than a string algorithm: two hand-synced
  // copies of an algorithm can drift in behaviour, two copies of `indexOf(c.id) >= 0` cannot.
  // `r.m` and `r.not` are build-time-only from here on — assertNameTagAllowlist() below is the
  // only thing that reads them, and nothing at runtime does.
  const tagsOf = (c) => {
    const s = new Set((R.catTags || {})[c.category] || []);
    (R.nameTags || []).forEach((r) => { if ((r.ids || []).indexOf(c.id) >= 0) r.t.forEach((t) => s.add(t)); });
    return [...s];
  };
  const needed = new Set(); (R.rules || []).forEach((r) => r.need.forEach((n) => needed.add(n[0])));
  const rows = compounds.map((c) => ({ name: c.name, cls: c.regulatory_class, tags: tagsOf(c) }));
  const produced = new Set(); rows.forEach((r) => r.tags.forEach((t) => produced.add(t)));
  // W3.5 (2026-08-02): REACHABILITY MEANS "a rule that can actually fire needs this tag", not
  // "some rule mentions this tag". `double_5ar` needs two carriers of `5ar_inhibitor` and the
  // corpus carries it once, so Finasteride / Dutasteride could never produce a flag — and both this
  // number and the panel counted it as covered. Measured hydrated at 390x844, /stack?ids=c39,c120
  // rendered "✅ Nothing flagged between the 2 of 2 I have pharmacology for". A green tick asserting
  // pharmacology for a compound whose only tag belongs to a rule that can never fire is the same
  // class of false clear W3 was opened to close.
  // site/app.js RULE_TAGS carries the identical arithmetic. If these two diverge the published
  // number stops matching what the panel tells the reader. `needed` is kept because the orphan- and
  // dangling-tag checks below are about what the RULES reference, which is a different question.
  const carriers = {}; rows.forEach((r) => r.tags.forEach((t) => { carriers[t] = (carriers[t] || 0) + 1; }));
  const firable = new Set();
  (R.rules || []).forEach((r) => {
    if (!(r.need || []).every((n) => (carriers[n[0]] || 0) >= n[1])) return;
    (r.need || []).forEach((n) => firable.add(n[0]));
  });
  const reach = rows.filter((r) => r.tags.some((t) => firable.has(t)));
  const RXC = new Set(['prescription', 'controlled', 'unapproved']);
  const measured = {
    compounds: rows.length,
    reachable: reach.length,
    unreachable: rows.length - reach.length,
    unreachableRx: rows.filter((r) => !r.tags.some((t) => firable.has(t)) && RXC.has(r.cls)).length,
  };
  const dec = R.coverage || {};
  Object.keys(measured).forEach((k) => {
    if (dec[k] !== measured[k]) bad.push(`coverage.${k} says ${dec[k]}, the corpus measures ${measured[k]} — the checker must not publish a number it cannot support`);
  });
  // A CATEGORY DEFAULT ASSERTS A MECHANISM FOR EVERY CURRENT AND FUTURE MEMBER OF THAT CATEGORY.
  // That is not a shortcut, it is a fabrication engine, and it had already fired three times:
  // Cardarine (a PPARδ agonist), Stenabolic (a REV-ERBα agonist) and EPO (an EPO-receptor agonist)
  // each rendered "🔻 Compounded testosterone shutdown" on /stack because they happened to be filed
  // under "SARMs & SELECTIVE METABOLIC AGENTS". Interaction pharmacology is asserted per compound,
  // against that compound's own authored page, or not at all.
  if (Object.keys(R.catTags || {}).length) {
    bad.push('catTags is not empty — a category default asserts a mechanism for every current and future member of that category. Tag compounds, never categories.');
  }
  // ---- W3.6 (2026-08-02): A TAG MAY ONLY ATTACH TO A COMPOUND SOMEBODY LISTED BY ID ----------
  // `nameTags` assigned a tag by UNANCHORED SUBSTRING of the compound NAME. That is the same
  // fabrication engine as the category defaults deleted above, one level down: a substring
  // asserts a mechanism for every current AND FUTURE compound whose name happens to contain
  // those letters. It had already fired seven times. Measured hydrated at 390x844 on /stack:
  //   c63+c159  → "☠️ Double statin — muscle-damage risk · Follistatin / Myostatin inhibitors
  //                (ACE-031, YK-11) + Statins" — because "myoSTATIN" contains "statin". That
  //                page's mechanism is "Block myostatin (MSTN/GDF-8)"; HMG-CoA appears nowhere.
  //   c145+c159 → "☠️ Statin + high-dose niacin" — "NIACINamide", on a page whose own buying
  //                advice reads "Choose niacinamide (nicotinamide), NOT niacin/nicotinic acid".
  //   c134+c5   → "⏰ Minerals compete — space them out" — "provIRON", i.e. mesterolone.
  //   c109+c83  → "🔻 May blunt training adaptation … keep high doses away from your workout
  //                window" against a page whose own protocol is "50 mg vitamin C, 45–60 min
  //                PRE-exercise".
  //   c157+c108 → "☠️ Serotonin syndrome risk" for an NMDA-receptor antagonist.
  //   c7+c5     → "⏰ Minerals compete" for a metalloid whose page says it "travels as boric
  //                acid … without needing a transporter".
  //   c115+c1   → "☠️ Stacked stimulants … heart rate and blood pressure compound" for an MC4R
  //                agonist whose page says each dose "LOWERS heart rate".
  // `ids` is now the authority and both matchers read it (site/app.js compoundTags() and the
  // tagsOf() copy above). `m` survives only as the tripwire this gate runs: any compound the
  // substring still matches that is on neither `ids` nor `not` FAILS THE BUILD — so compound
  // #172 named "Pravastatin" becomes a prompt at build time instead of a silent tag in a
  // reader's stack. Proven by reintroducing every one of the seven bugs plus a typo'd id, a
  // dead rule and a new colliding compound; the gate fails on all ten.
  // What this gate CANNOT do is judge pharmacology: adding c63 to `ids` deliberately still
  // passes. The allowlist is the human assertion, and the comment beside it is the proof.
  const byId = new Map(compounds.map((c) => [c.id, c]));
  (R.nameTags || []).forEach((r) => {
    const hits = compounds.filter((c) => (c.name || '').toLowerCase().indexOf(r.m) >= 0).map((c) => c.id);
    if (!hits.length) bad.push(`nameTag "${r.m}" matches no compound in the corpus — a rule that can never match is dead data in a file whose job is to be true about what it covers`);
    if (!(r.ids || []).length) bad.push(`nameTag "${r.m}" has no ids — a tag is asserted per compound, against that compound's own authored page, or not at all`);
    (r.ids || []).forEach((id) => {
      if (!byId.has(id)) bad.push(`nameTag "${r.m}" allowlists ${id}, which is not a compound id`);
      else if (hits.indexOf(id) < 0) bad.push(`nameTag "${r.m}" allowlists ${id} ("${byId.get(id).name}") but that name no longer contains "${r.m}" — the rule and the page have drifted apart`);
    });
    hits.forEach((id) => {
      if ((r.ids || []).indexOf(id) >= 0 || (r.not || []).indexOf(id) >= 0) return;
      bad.push(`nameTag "${r.m}" matches ${id} ("${byId.get(id).name}") which is on neither ids nor not — prove the tag against that compound's own page and add it to ids, or acknowledge the collision in not`);
    });
    (r.not || []).forEach((id) => {
      if (!byId.has(id)) bad.push(`nameTag "${r.m}" excludes ${id}, which is not a compound id`);
      else if (hits.indexOf(id) < 0) bad.push(`nameTag "${r.m}" excludes ${id} ("${byId.get(id).name}") which it no longer matches — stale exclusion`);
      if ((r.ids || []).indexOf(id) >= 0) bad.push(`nameTag "${r.m}" has ${id} on both ids and not`);
    });
  });
  // Synergies ran the same substring engine and produce a GREEN RECOMMENDATION, which is the
  // worse direction to be wrong in. Measured hydrated at 390x844 on /stack, 2026-08-02:
  //   c63+c11   → "✅ Statin + CoQ10 — works well together · Statins deplete CoQ10" for a
  //                myostatin inhibitor, printed directly above "❔ I hold no interaction
  //                pharmacology for CoQ10 / Ubiquinol";
  //   c134+c120 → "✅ Iron + Vitamin C" for Proviron;
  //   c14+c9    → "✅ Glycine + NAC (GlyNAC)" for Betaine (trimethylGLYCINE);
  //   c80+c9    → the same row for GlyNAC + NAC, which is duplicate NAC, not a synergy.
  // The same change also FIXES a miss: `list.find` matched "collagen" and "vitamin c" to the
  // SAME compound on /stack with c109+c120, and the A!==B guard then dropped the site's own
  // authored pairing. With aIds/bIds it fires.
  (R.synergies || []).forEach((g) => {
    [['a', 'aIds', 'aNot'], ['b', 'bIds', 'bNot']].forEach(([mk, ik, nk]) => {
      const hits = compounds.filter((c) => (c.name || '').toLowerCase().indexOf(g[mk]) >= 0).map((c) => c.id);
      if (!hits.length) bad.push(`synergy "${g.title}" side ${mk} ("${g[mk]}") matches no compound`);
      if (!(g[ik] || []).length) bad.push(`synergy "${g.title}" side ${mk} ("${g[mk]}") has no ${ik}`);
      (g[ik] || []).forEach((id) => {
        if (!byId.has(id)) bad.push(`synergy "${g.title}" ${ik} lists ${id}, which is not a compound id`);
        else if (hits.indexOf(id) < 0) bad.push(`synergy "${g.title}" ${ik} lists ${id} ("${byId.get(id).name}"), which "${g[mk]}" does not match`);
      });
      hits.forEach((id) => {
        if ((g[ik] || []).indexOf(id) >= 0 || (g[nk] || []).indexOf(id) >= 0) return;
        bad.push(`synergy "${g.title}" side ${mk} matches ${id} ("${byId.get(id).name}") which is on neither ${ik} nor ${nk} — a green "works well together" row must name compounds somebody checked`);
      });
    });
  });
  // ---- W4.5 (2026-08-02): A RULE'S WHY MUST BE TRUE OF EVERY ROW IT RENDERS -------------------
  // The tag gates above ask "does this compound deserve this tag". This one asks the other half:
  // once a row fires, does the sentence printed under it describe THE TWO COMPOUNDS IN IT? Four
  // rules failed that, all four measured hydrated at 390x844 with 0 pageerrors:
  //   sedation       "never combine phenibut with alcohol" printed on 3 of its 6 rows with
  //                  phenibut absent — /stack?ids=c154,c155 renders it over "Orexin Antagonists
  //                  + Z-drugs (Zolpidem/Ambien) · Trazodone · Doxylamine".
  //   mild_sedatives named melatonin, valerian AND apigenin on all 3 rows it can render, so every
  //                  row named a compound that was not in it — /stack?ids=c103,c104.
  //   mineral        listed calcium, iron, zinc, magnesium and strontium on all 28 rows —
  //                  /stack?ids=c5,c150 names three compounds that are not in the stack.
  //   mtor_conflict  named IGF-1, EAAs/BCAAs and HMB on all 3 rows; each row contains one of them.
  // This is the same defect class as a fabricated TAG, one surface later: a true sentence about a
  // set of compounds, printed as if it were about two named ones.
  //
  // THE LEXICON IS NOT HAND-WRITTEN. It is derived entirely from the `m` strings already in
  // nameTags, which assertNameTagAllowlist above validates against all 171 corpus names — so there
  // is no second list to drift. Hyphens and runs of whitespace are flattened on both sides, which
  // is what lets "green-tea extract" match the nameTag "green tea".
  //
  // TWO-COMPOUND STACKS ARE SUFFICIENT. Every rule needs at most 2 distinct carriers, so any
  // larger stack that fires a rule contains a 2-subset that fires it, and the larger stack's
  // involved set is a superset of that pair's. If every 2-compound row carries the name, so does
  // every bigger one.
  //
  // `exemplars` IS THE ACKNOWLEDGED-EXCEPTION HALF, not a wildcard. Eight rules legitimately name
  // a compound that is absent from some rows: conditional advice ("if you take a prescribed
  // antidepressant, treat 5-HTP / SAM-e as off-limits"), an explicitly-labelled illustration ("the
  // classic ephedrine + caffeine combo is the cautionary example"), a class noun that happens to
  // be a page name ("a statin's small risk of muscle injury", on a red-yeast-rice row), a
  // physiological noun ("suppresses your natural testosterone"), and an attributed quotation from
  // another page ("the thyroid page's own absorption note names coffee, calcium and iron").
  // Deleting those would delete true content to satisfy a gate. So the id is written down by a
  // human, exactly like the `not:` allowlist above — and a STALE exemplar (listed but no longer
  // named, or named on every row) fails too, so the list cannot rot into a wildcard.
  //
  // WHAT THIS GATE CANNOT DO, stated rather than hidden: it checks NAMES, not pharmacology. The
  // fifth rewrite in this commit — double_glp1's "These act on the same receptor", false on the 7
  // of 10 rows containing tirzepatide (GIPR + GLP1R) or retatrutide (GLP1R + GIPR + GCGR) — names
  // no compound and would still pass. A mechanism claim is checked against the compound's own page
  // by a human; this gate closes the name half only.
  // ---- W4.5 (2026-08-02): A `need` COUNT IS A COUNT OF SUBSTANCES, NOT OF PAGES ---------------
  // site/app.js stackInteractions() carries the identical predicate; this copy is what fireOn()
  // below and the pathway-sibling pairFlags at the bottom of this function use, so the compound
  // page and the /stack page cannot disagree about the same two molecules.
  const dupeOf = {};
  (R.duplicates || []).forEach((g) => (g.ids || []).forEach((id) => (dupeOf[id] = dupeOf[id] || []).push(g)));
  const sameSubstance = (a, b) => {
    const ga = dupeOf[a.id] || [], gb = dupeOf[b.id] || [];
    return ga.length === 1 && gb.length === 1 && ga[0] === gb[0];
  };
  const distinctCarriers = (cs, n) => {
    if (cs.length < n) return false;
    if (n <= 1) return cs.length >= 1;
    for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) if (!sameSubstance(cs[i], cs[j])) return true;
    return false;
  };
  // ---- assertDuplicateSubstances -------------------------------------------------------------
  // Three checks, in the order they would each have caught the shipped defect:
  //  1. DISCOVERY. Any nameTag whose `ids` name two compounds is, by construction, two pages the
  //     same molecule name matches. Unless a duplicates group covers that pair, the checker will
  //     treat them as two drugs. This is the tripwire that fires the day somebody adds a second
  //     page for an existing molecule — which is how all four live defects were created.
  //  2. EFFECT. For every pair inside a group, no rule needing two distinct carriers may still
  //     fire. This is the assertion that actually proves the fix, and it is enumerated rather
  //     than argued.
  //  3. NO DEAD GROUPS. A group whose members share no tag can never collapse anything, so it is
  //     dead data that reads as a fix. Every group must also carry its own title/why/action,
  //     because the row it produces replaces a rule row and has to say something true.
  (R.duplicates || []).forEach((g) => {
    const ids = g.ids || [];
    if (ids.length < 2) bad.push(`duplicates group "${g.substance}" lists ${ids.length} id(s) — a group of one collapses nothing`);
    ids.forEach((id) => { if (!byId.has(id)) bad.push(`duplicates group "${g.substance}" lists ${id}, which is not a compound id`); });
    ['title', 'why', 'action'].forEach((k) => { if (!g[k]) bad.push(`duplicates group "${g.substance}" has no ${k} — its row replaces a rule row and must say something true`); });
    const shared = ids.filter((id) => byId.has(id)).map((id) => new Set(tagsOf(byId.get(id))))
      .reduce((acc, s) => (acc === null ? s : new Set([...acc].filter((t) => s.has(t)))), null);
    if (shared && !shared.size) bad.push(`duplicates group "${g.substance}" members share no tag, so no rule could ever have counted them twice — delete the group rather than keep dead data that reads as a fix`);
  });
  (R.nameTags || []).forEach((r) => {
    const ids = r.ids || [];
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = byId.get(ids[i]), b = byId.get(ids[j]);
        if (!a || !b) continue;
        if ((R.duplicates || []).some((g) => (g.ids || []).indexOf(a.id) >= 0 && (g.ids || []).indexOf(b.id) >= 0)) continue;
        bad.push(`nameTag "${r.m}" matches both ${a.id} ("${a.name}") and ${b.id} ("${b.name}") but no duplicates group covers that pair — the checker will count two pages of one molecule as two compounds. Add the pair to duplicates, or split this entry into separate nameTags with distinct match strings if they really are different substances`);
      }
    }
  });
  const lex = {};
  (R.nameTags || []).forEach((r) => { (lex[r.m] = lex[r.m] || new Set()); (r.ids || []).forEach((i) => lex[r.m].add(i)); });
  const flat = (s) => String(s).toLowerCase().replace(/[‐-―−-]/g, ' ').replace(/\s+/g, ' ');
  const rowsByRule = {};
  // The shipped predicate, exactly: satisfied by pages AND by distinct substances.
  // W5.5 (2026-08-02): `soloRule` is the third clause of the shipped predicate and the newest — see
  // the long note under the pair enumeration below. It lives here, beside distinctCarriers, because
  // this is the MODEL: a guard that only decides whether an assertion fires is a guard one caller
  // can skip, and there are three callers (this pair sweep, the duplicates effect check, and the
  // pathway-sibling pairFlags at the bottom of this function).
  const soloRule = (rule, inv) => (rule.need || []).length >= 2 && inv.size < 2;
  let soloDropped = 0;
  const fireOn = (a, b) => {
    const byTag = {};
    [a, b].forEach((c) => tagsOf(c).forEach((t) => (byTag[t] = byTag[t] || []).push(c)));
    const f = (R.rules || []).filter((rule) => rule.need.every((n) => distinctCarriers(byTag[n[0]] || [], n[1])));
    const seen = {}; f.forEach((x) => { seen[x.id] = 1; });
    return f.filter((x) => !(x.notIf || []).some((id) => seen[id])).map((rule) => {
      const inv = new Set(); rule.need.forEach((n) => (byTag[n[0]] || []).forEach((c) => inv.add(c.id)));
      return { rule, id: rule.id, inv };
    }).filter((x) => {
      if (!soloRule(x.rule, x.inv)) return true;
      soloDropped++;                       // counted and printed, never silently discarded
      return false;
    });
  };
  // EFFECT CHECK — enumerated, not argued. For every pair inside a duplicates group, no rule that
  // needs two distinct carriers of a tag may still fire. Note this deliberately does NOT cover
  // c148: it is in two groups (it supplies calcium AND iron by its own raw text), sameSubstance()
  // therefore refuses to collapse it, and its three mineral rows are true and stay.
  // RESIDUAL, stated rather than hidden: listing a compound in TWO groups is a human assertion that
  // it really does supply two substances, and this check cannot judge it — a wrong second listing
  // exempts that compound and its rows keep firing. That is the same limit as the `not:` allowlist
  // above, and the comment beside the listing is the proof. Proven live by reverting fireOn()'s
  // predicate to a page count: all four collapsible pairs fail by name.
  let dupePairsChecked = 0;
  (R.duplicates || []).forEach((g) => {
    const ids = (g.ids || []).filter((id) => byId.has(id) && (dupeOf[id] || []).length === 1);
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        dupePairsChecked++;
        const a = byId.get(ids[i]), b = byId.get(ids[j]);
        fireOn(a, b).forEach((x) => {
          const rule = (R.rules || []).find((r) => r.id === x.id);
          if ((rule.need || []).some((n) => n[1] >= 2)) {
            bad.push(`"${a.name}" + "${b.name}" are two pages of ${g.substance} and rule "${x.id}" ("${rule.title}") still fires on them — a ${rule.tier} row asserting an interaction between one molecule and itself`);
          }
        });
      }
    }
  });
  for (let i = 0; i < compounds.length; i++) {
    for (let j = i + 1; j < compounds.length; j++) {
      fireOn(compounds[i], compounds[j]).forEach((x) => { (rowsByRule[x.id] = rowsByRule[x.id] || []).push(x.inv); });
    }
  }
  // ---- W5.5 (2026-08-02): A COMPOUND CANNOT INTERACT WITH ITSELF -----------------------------
  // Every `need` is checked independently — `byTag[tag].length >= n` — so a rule with two needs is
  // satisfied by ONE compound that happens to carry both tags, and the row it renders lists that
  // single compound as the whole interaction. Nothing looked at the size of `involved`.
  // The under-tag audit is about to create the first instance: c112 Citrus Bergamot's own biomarker
  // block supports BOTH `cyp3a4` ("Residual bergamot furanocoumarins can inhibit CYP3A4
  // (grapefruit-like)") and `statin_like` ("via HMG-CoA reductase inhibition (a statin-like moiety
  // in brutieridin/melitidin)"), and with both tags the cyp3a4_statin rule fires on Bergamot ALONE
  // — 170 rows, one against every other compound in the corpus, e.g. Bergamot + Creatine printing a
  // timing row whose `involved` is just ["Citrus Bergamot"].
  // NOTE WHAT THIS DELIBERATELY DOES NOT DO. It does not require the needs to be filled by DISJOINT
  // compounds. That was measured: a system-of-distinct-representatives predicate takes cyp3a4_statin
  // from 174 rows to 8 correctly, but it also takes pde5_vasodilator from 2 rows to 0 — killing two
  // rows that are RIGHT, because c116 legitimately carries `pde5` AND `hypotensive` and "a PDE-5
  // drug plus another blood-flow agent" is exactly what that rule means. The honest invariant is not
  // about which compound fills which slot; it is that a rendered interaction must involve two things.
  // site/app.js stackInteractions() carries the identical filter, or this would pass at build time
  // while the SPA still rendered the row.
  // WHERE THE GUARD LIVES, AND WHY IT IS NOT JUST THIS ASSERTION. c112's two tags are BOTH quotable
  // from its own page, so "fail the build until somebody deletes one" would delete a true tag to
  // satisfy a checker. The row is what is wrong, not the tags — so the predicate itself drops it
  // (soloRule above, and the identical filter in site/app.js stackInteractions()), and this
  // assertion is the tripwire that fires if either copy is ever removed. Deleting the filter from
  // fireOn() makes the build fail by name; deleting it from app.js is caught by the hydrated check
  // recorded in that file's comment.
  Object.keys(rowsByRule).forEach((rid) => {
    const rule = (R.rules || []).find((r) => r.id === rid);
    if (!rule) return;
    const solo = rowsByRule[rid].filter((inv) => soloRule(rule, inv));
    if (solo.length) bad.push(`rule "${rid}" ("${rule.title}") renders ${solo.length} row(s) involving only ONE compound — it needs ${rule.need.length} tags and a single compound carries them all, so the checker prints a ${rule.tier} row about a compound interacting with itself. The predicate is supposed to drop these: soloRule() in this file and the same filter in site/app.js stackInteractions(). One of them has been removed.`);
  });
  let checkedRules = 0, checkedRows = 0;
  (R.rules || []).forEach((rule) => {
    const rows = rowsByRule[rule.id] || [];
    const ex = new Set(rule.exemplars || []);
    if (!rows.length) {
      if (ex.size) bad.push(`rule "${rule.id}" carries exemplars but renders no row against this corpus — nothing to except`);
      return;
    }
    checkedRules++; checkedRows += rows.length;
    // W5.5 (2026-08-02): THE TITLE WAS NEVER CHECKED. This check built its text from the why and the
    // action only, and the title is the largest string on the row and the only part many readers
    // read. "Bergamot may raise statin levels" is a sentence about a specific compound, and if
    // Bergamot is absent from the row it is exactly the false specificity the rest of this gate
    // exists to catch. That instance happens to be caught anyway because the same rule's `why` also
    // names Bergamot — which is luck, not coverage: a rule whose TITLE names a compound its why does
    // not would sail straight through.
    // Measured before adding it: replaying this check over the whole corpus with and without the
    // title produces an IDENTICAL failure list, so it fails nothing that is not already failing.
    // This is hardening, and it is labelled as hardening rather than as a live defect.
    const txt = flat(`${rule.title} ${rule.why} ${rule.action}`);
    const excused = new Set();
    Object.keys(lex).forEach((tok) => {
      if (txt.indexOf(flat(tok)) < 0) return;
      const ids = [...lex[tok]];
      const missing = rows.filter((inv) => !ids.some((id) => inv.has(id))).length;
      if (!missing) return;
      const unlisted = ids.filter((id) => !ex.has(id));
      if (unlisted.length) {
        bad.push(`rule "${rule.id}" names "${tok}" (${ids.map((i) => (byId.get(i) || {}).name || i).join(' | ')}) in its why/action, but ${missing} of its ${rows.length} rendered rows do not contain it — a row must describe the compounds in it. Rewrite the sentence, or acknowledge ${unlisted.join(', ')} in exemplars with a comment saying why the mention is legitimate`);
      }
      ids.forEach((id) => excused.add(id));
    });
    [...ex].forEach((id) => {
      if (!byId.has(id)) bad.push(`rule "${rule.id}" exemplars ${id}, which is not a compound id`);
      else if (!excused.has(id)) bad.push(`rule "${rule.id}" exemplars ${id} ("${byId.get(id).name}") but its why/action no longer names that compound on a row it is absent from — stale exemption, delete it`);
    });
  });
  // ---- W5 (2026-08-02): UNDER-TAGGING, THE INVERSE OF EVERY GATE ABOVE ------------------------
  // Every check in this function asks "does this compound deserve the tag it has". None asked the
  // other direction, and that is the more dangerous one: an over-tag prints a warning nobody needed,
  // an UNDER-tag prints a green tick over a documented hazard. Measured hydrated at 390x844, 0
  // pageerrors, before this gate existed:
  //   /stack?ids=c49,c30  → `<span class="ixn-verdict ok">✅ Nothing flagged between the 2 of 2 I
  //                          have pharmacology for` with ZERO rule rows, over Ostarine + Green Tea
  //                          Extract — a clearance that explicitly claims pharmacology for BOTH.
  //                          c30 carries `hepatotoxic`, the `liver` rule needs two carriers, and
  //                          c49's own contra block reads "Hepatotoxicity is the primary documented
  //                          harm". The tag was simply never written down.
  //   /stack?ids=c170,c30 → the identical green tick, over Valerian, whose own contra reads
  //                          "Liver disease or hepatotoxic medications | Rare hepatotoxicity
  //                          reports". A second instance nobody had found.
  // The scan is deliberately narrow so its output is a DECISION LIST, not noise. It reads the
  // SAFETY FIELDS ONLY, and discards a matching sentence that also carries a negation, per sentence
  // rather than per page. That is what keeps Boldenone out ("skips that particular liver toxicity"),
  // Berberine out ("berberine is not a known hepatotoxin"), Milk Thistle out, and 17-α-Estradiol out
  // ("are not documented for 17a-estradiol in humans"). A whole-record scan returns 36 candidates;
  // this one returns 17, and 7 of those became tags in the commit that opened this wave.
  // Everything that survives must be EITHER tagged OR written down in hazardAudit.acknowledged with
  // a reason. There is no third state, so a compound cannot sit silently in the gap — which is the
  // whole defect. WHAT THIS GATE CANNOT DO, stated rather than hidden: it cannot judge pharmacology.
  // Acknowledging a compound still passes. The acknowledgement is the human assertion and the quote
  // beside it is the proof, exactly like `not:` above.
  // PROVE IT by deleting "hepatotoxic" from the ostarine nameTag — the build fails, by name.
  const HZ = R.hazardAudit || {};
  if (!HZ.signals || !Object.keys(HZ.signals).length) bad.push('interactions.js has no hazardAudit.signals — the under-tagging scan is what stops a documented hazard being cleared with a green tick');
  // W5.5 (2026-08-02): "AT LEAST ONE SIGNAL" WAS THE WRONG BAR, AND IT IS WHAT LET THIS GAP STAND.
  // The file declared `hepatotoxic` alone, this check passed, and 25 of the 26 tags a rule reads had
  // NO under-tag scan at all — so the Ostarine fix closed one tag and read like it had closed a
  // class. Every one of those tags is a tag whose absence prints a green tick over something the
  // page documents, so the bar is COMPLETENESS. The converse is already checked immediately below
  // (a signal for a tag no rule consumes is rejected), so after this the signal set and the
  // rule-consumed tag set are pinned equal in both directions.
  // PROVE IT by deleting any one signal from the block in site/interactions.js: the build fails
  // naming the tag and the rules that consume it.
  [...needed].forEach((tag) => {
    if (!(HZ.signals || {})[tag]) bad.push(`no hazardAudit.signals entry for "${tag}", which ${(R.rules || []).filter((r) => r.need.some((n) => n[0] === tag)).map((r) => `"${r.id}"`).join(' and ')} consume(s) — a rule can only fire on compounds that carry its tag, so a tag with no under-tag scan is a rule that silently skips every compound nobody remembered to tag. Add a signal, or delete the rule.`);
  });
  const hzFields = (c) => {
    const b = c.bio || {};
    const out = [c.watch || '', c.avoid || '', (b.overdose || {}).line || '', (b.misuse || {}).line || ''];
    (b.contra || []).forEach((x) => out.push(`${x.flag || ''} ${x.advice || ''}`));
    (b.biomarkers || []).forEach((x) => out.push(`${x.marker || ''} ${x.why || ''}`));
    return out.join('  ');
  };
  // W5.5 (2026-08-02): a signal may declare which text it reads. The DEFAULT IS UNCHANGED — the
  // safety fields, because a hazard word in a mechanism paragraph is chemistry and the same word in
  // a contra block is a warning. A signal for a tag that describes a pharmacodynamic IDENTITY rather
  // than a hazard needs the other one: `mtor_activator`'s three carriers (c16 HMB, c18 EAAs/BCAAs,
  // c62 IGF-1 LR3) contain the string "mTOR" in their safety fields ZERO times — it is in
  // `mechanism` ("leucine triggers mTOR") — so on the default text that signal matches nothing at
  // all. A scan over an empty set reports success no matter what the corpus does, which is exactly
  // the failure mode the assertion below exists to close.
  const hzText = (c, sig) => (sig.fields === 'mechanism' ? String(c.mechanism || '') : hzFields(c));
  const hzLive = (c, sig) => {
    const pos = new RegExp(sig.pos, 'i'), neg = new RegExp(sig.neg, 'i');
    return hzText(c, sig).split(/(?<=[.;])\s+/).filter((s) => pos.test(s) && !neg.test(s));
  };
  let hzScanned = 0, hzAcked = 0;
  Object.keys(HZ.signals || {}).forEach((tag) => {
    if (!needed.has(tag)) { bad.push(`hazardAudit.signals has "${tag}", which no rule consumes — a hazard scan for a tag nothing reads can only find things it cannot act on`); return; }
    let hzCarrierHits = 0;
    compounds.forEach((c) => {
      const live = hzLive(c, HZ.signals[tag]);
      if (!live.length) return;
      hzScanned++;
      if (tagsOf(c).indexOf(tag) >= 0) { hzCarrierHits++; return; }
      const ack = (HZ.acknowledged || {})[`${c.id}:${tag}`];
      if (ack && String(ack).trim()) { hzAcked++; return; }
      bad.push(`${c.id} ("${c.name}") does NOT carry "${tag}", but its own safety fields say: "${live[0].trim().slice(0, 170)}" — the rule that would catch this cannot fire, so the checker will CLEAR a stack containing it with a green tick. Add the tag against that quote, or write the reason in hazardAudit.acknowledged["${c.id}:${tag}"].`);
    });
    // W5.5: THE ANTI-EMPTY-SET ASSERTION. A signal that matches none of the compounds that already
    // CARRY its tag is not detecting the property — it is detecting nothing, and a scan that returns
    // nothing reports success. That is how a gate gets written, shipped, and never once fails. It is
    // the same lesson as every other one on this project: look at the output, not the count.
    if (!hzCarrierHits) bad.push(`the hazardAudit signal for "${tag}" matches NO compound that already carries "${tag}" — it is not detecting that property, it is detecting nothing, and a scan over an empty set reports success no matter how the corpus changes. Fix the pattern against a carrier's own words.`);
  });
  // A stale acknowledgement is worse than none: it is a decision recorded about a page that no
  // longer says what it said. Every key must still point at a real compound that still fires the
  // signal and still lacks the tag — so the list cannot rot into a blanket exemption.
  Object.keys(HZ.acknowledged || {}).forEach((k) => {
    const [id, tag] = String(k).split(':');
    const c = byId.get(id);
    if (!c) { bad.push(`hazardAudit.acknowledged has "${k}", which is not a compound id`); return; }
    if (!(HZ.signals || {})[tag]) { bad.push(`hazardAudit.acknowledged has "${k}", but there is no hazard signal for "${tag}"`); return; }
    if (!String(HZ.acknowledged[k] || '').trim()) { bad.push(`hazardAudit.acknowledged["${k}"] has no reason — an exemption without the page's own words beside it is just a silent gap with extra steps`); return; }
    if (tagsOf(c).indexOf(tag) >= 0) { bad.push(`hazardAudit.acknowledged excuses "${k}" but ${c.id} now CARRIES "${tag}" — stale exemption, delete it`); return; }
    if (!hzLive(c, HZ.signals[tag]).length) bad.push(`hazardAudit.acknowledged excuses "${k}" but ${c.id}'s safety fields no longer say anything the "${tag}" signal matches — stale exemption, delete it`);
  });
  console.log('[parse] hazard under-tag scan: %d compound-signal hits over %d signal(s); every hit is either tagged or acknowledged with a quote (%d acknowledged)',
    hzScanned, Object.keys(HZ.signals || {}).length, hzAcked);

  // ---- W6 (2026-08-08): THE OTHER HALF — EVERY CARRIER MUST BE VISIBLE TO ITS OWN DETECTOR ----
  // The scan above walks the corpus looking for compounds that SHOULD carry a tag. Nothing walked
  // the compounds that already DO. The only carrier-side assertion in this whole function was
  // `if (!hzCarrierHits)` twenty lines up — ONE carrier per signal, not every carrier — and one is
  // a bar a broken pattern clears easily.
  // WHAT THAT COST, MEASURED over all 171 compounds × the 27 rule-consumed tags: 41 of 143 tag
  // assignments (29%) were invisible to the very signal named after them. `stimulant` saw 4 of its
  // 15 carriers — it could not see caffeine, ephedrine, yohimbine, clenbuterol, amphetamine or
  // methylphenidate. `serotonergic` saw 2 of 6, and could not see the SSRIs. `immunostim` saw 1 of
  // 5. `divalent_mineral` saw 1 of 7.
  // WHY THAT IS A SAFETY DEFECT AND NOT A TIDINESS ONE. Two reasons, and the second is the one
  // that reached readers:
  //   1. A LABEL COULD BE DELETED IN SILENCE. Delete a tag whose signal cannot see it, and this
  //      whole function still exits 0 — the rows it fed simply stop rendering and nothing says a
  //      word. Not argued, MEASURED: each of the 41 was deleted in turn in a sandbox copy of the
  //      repo and the REAL `node build/parse.js` was run on each. Ten exited 0. Deleting
  //      `serotonergic` from the SSRI nameTag built clean and silently removed the
  //      serotonin-syndrome rows for SSRIs + 5-HTP and SSRIs + Methylene Blue.
  //   2. A SIGNAL TOO NARROW TO SEE ITS OWN CARRIERS IS TOO NARROW TO SEE AN UNTAGGED ONE. That is
  //      one defect wearing two faces, and it is why the gate that found Ostarine walked straight
  //      past c144 Minoxidil: the page says "Primary effect is lowering BP" and the pattern was
  //      `lowers? (blood pressure|BP)`. Fixing the carrier side is what surfaced Minoxidil,
  //      Melanotan II and SGLT2 in the untagged direction.
  // THE RULE: for every rule-consumed tag, every compound that carries it must EITHER be matched by
  // that tag's own signal, OR have a sentence from its own page written down in
  // hazardAudit.carriers["<id>:<tag>"]. No third state, in either direction, exactly like
  // `acknowledged`. WHAT THIS CANNOT DO, stated rather than hidden: it cannot judge pharmacology. A
  // wrong quote still passes. The quote is the human assertion and the proof sits beside it.
  // WHY THE LIST IS NOT EMPTY AND SHOULD NOT BE FORCED TO BE: eight assignments name what a product
  // IS or CONTAINS rather than something its warnings discuss — six mineral products, mTOR on
  // IGF-1, antioxidant identity on vitamin C and ALA — and widening a regex until it could see
  // "this is 20% elemental calcium by weight" would make it match half the corpus.
  // PROVE IT by deleting `serotonergic` from the ssri/sertraline/escitalopram nameTags (fails
  // naming c156), or by deleting the strontium nameTag (fails naming the orphaned carriers entry).
  {
    const CAR = HZ.carriers || {};
    let carSeen = 0, carHand = 0;
    [...needed].forEach((tag) => {
      const sig = (HZ.signals || {})[tag];
      if (!sig) return;                                    // already reported by the loop above
      compounds.forEach((c) => {
        if (tagsOf(c).indexOf(tag) < 0) return;
        if (hzLive(c, sig).length) { carSeen++; return; }
        const q = String(CAR[`${c.id}:${tag}`] || '').trim();
        if (q) { carHand++; return; }
        bad.push(`${c.id} ("${c.name}") CARRIES "${tag}" and the hazardAudit signal for "${tag}" cannot see it anywhere in the text it reads — so that label can be deleted and this build will still pass, and the rows it feeds will vanish in silence. Widen the signal against this page's own words, or write the sentence the tag rests on into hazardAudit.carriers["${c.id}:${tag}"].`);
      });
    });
    // A carriers entry rots in four ways, and each one is a decision recorded about a page that no
    // longer says what it said. The last is the important one: once a signal CAN see a carrier, the
    // hand-written quote is dead weight that hides a widening nobody noticed.
    Object.keys(CAR).forEach((k) => {
      const [id, tag] = String(k).split(':');
      const c = byId.get(id);
      if (!c) { bad.push(`hazardAudit.carriers has "${k}", which is not a compound id`); return; }
      if (!(HZ.signals || {})[tag]) { bad.push(`hazardAudit.carriers has "${k}", but there is no hazard signal for "${tag}"`); return; }
      if (!String(CAR[k]).trim()) { bad.push(`hazardAudit.carriers["${k}"] has no quote — a tag recorded without the page's own words beside it is the silent gap this block exists to close`); return; }
      if (tagsOf(c).indexOf(tag) < 0) { bad.push(`hazardAudit.carriers records "${k}" but ${c.id} no longer carries "${tag}" — the tag was deleted and the sentence justifying it was left behind. Restore the tag, or delete this entry.`); return; }
      if (hzLive(c, HZ.signals[tag]).length) bad.push(`hazardAudit.carriers records "${k}" by hand, but the "${tag}" signal now matches ${c.id} on its own — stale entry, delete it so the hand-written list stays the short list of things a scan genuinely cannot reach`);
    });
    console.log('[parse] hazard carrier visibility OK — %d of %d rule-consumed tag assignments matched by their own signal, %d recorded by hand with the sentence they rest on; 0 that could be deleted in silence',
      carSeen, carSeen + carHand, carHand);
  }

  // ---- W5 (2026-08-02): THE PROSE A DANGER ROW PRINTS IS SHIPPED CONTENT TOO -------------------
  // "Combine glucose-loweres only under medical supervision" rendered on ALL 104 rows the
  // hypoglycemia rule can produce — 15 `hypoglycemic` carriers, C(15,2)=105, minus the collapsed
  // insulin pair. Measured hydrated at 390x844, 0 pageerrors, /stack?ids=c71,c29 printed it in
  // `.ixn-act` under the header "☠️ Additive low-blood-sugar risk · Metformin + Berberine". Nothing
  // caught it, because every gate above checks WHICH COMPOUNDS a sentence names and none checks
  // whether the sentence is spelled. On the site's highest-stakes rows, that is a gap.
  // THE VOCABULARY IS NOT HAND-WRITTEN — same principle as the row-truth lexicon above. It is every
  // word of the authored corpus. A word this corpus has never used once is either a typo or
  // genuinely new, and a genuinely new one costs one line in hazardAudit.vocab. Measured over every
  // rule, duplicate group and synergy: exactly five tokens were corpus-absent, four real
  // ("overstimulate", "raisers", "doac", "whoever") and one the typo. Prove it by putting
  // "loweres" back.
  {
    const words = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(/\s+/).filter((w) => w.length > 2);
    const vocab = new Set(words(JSON.stringify(compounds) + JSON.stringify(graph || {})));
    ((R.hazardAudit || {}).vocab || []).forEach((w) => vocab.add(String(w).toLowerCase()));
    const prose = [];
    (R.rules || []).forEach((r) => prose.push([`rule "${r.id}"`, `${r.title} ${r.why} ${r.action}`]));
    (R.duplicates || []).forEach((g) => prose.push([`duplicates "${g.substance}"`, `${g.title} ${g.why} ${g.action}`]));
    (R.synergies || []).forEach((g) => prose.push([`synergy "${g.title}"`, `${g.title} ${g.why}`]));
    let seenWords = 0;
    prose.forEach(([who, s]) => words(s).forEach((w) => {
      seenWords++;
      if (vocab.has(w)) return;
      bad.push(`${who} prints the word "${w}", which appears NOWHERE in the authored corpus — that is what a typo looks like on a row a reader is meant to act on. Fix the spelling, or add it to hazardAudit.vocab if it is a real word this corpus has simply never used.`);
    }));
    console.log('[parse] rule prose OK — %d words across %d rule/duplicate/synergy strings, all present in the authored corpus or in the %d-word acknowledged list',
      seenWords, prose.length, ((R.hazardAudit || {}).vocab || []).length);
  }

  [...needed].forEach((t) => { if (!produced.has(t)) bad.push(`rule tag "${t}" is required by a rule but no compound carries it — that rule can never fire`); });
  [...produced].forEach((t) => { if (!needed.has(t)) bad.push(`tag "${t}" is assigned to compounds but no rule consumes it — dead data that reads as coverage; wire it or delete it`); });
  const ids = new Set();
  (R.rules || []).forEach((r) => {
    if (ids.has(r.id)) bad.push(`two rules share the id "${r.id}" — notIf cannot address them`);
    ids.add(r.id);
  });
  (R.rules || []).forEach((r) => (r.notIf || []).forEach((id) => {
    if (!ids.has(id) && !(R.rules || []).some((x) => x.id === id)) bad.push(`rule "${r.id}" stands down for "${id}", which is not a rule id — it would never stand down`);
  }));
  // ---- W5a (2026-08-02): A COVERAGE NUMBER COPIED INTO PROSE HAS NO GATE ON IT ----------------
  // `coverage.reachable` is recomputed from the corpus above and the build refuses to ship if it
  // drifts. The SENTENCES about it had no such protection, and they had already rotted: site/app.js
  // said "The checker covers 92 of 171 compounds" while the live figure was 94, and
  // site/interactions.js said "coverage does not move: 90/171 before and after" with nothing saying
  // when that was true. Same defect class as every other one on this project — two records of one
  // fact, kept separately, with nothing checking them.
  // The rule: a coverage claim in prose must either state the LIVE number, or be dated, so a reader
  // can tell a current fact from a record of an edit. PROVE IT by putting "covers 92 of 171
  // compounds" back into site/app.js.
  ['site/app.js', 'site/interactions.js'].forEach((rel) => {
    const src = fs.readFileSync(path.join(ROOT, ...rel.split('/')), 'utf8');
    const re = new RegExp(`(\\d+)\\s*(?:of|/)\\s*${compounds.length}\\b`, 'g');
    let m;
    while ((m = re.exec(src))) {
      const ctx = src.slice(Math.max(0, m.index - 220), m.index + 220);
      if (!/cover|reachab|checker can|flag/i.test(ctx)) continue;         // not a coverage claim
      if (Number(m[1]) === measured.reachable) continue;                  // states the live number
      if (/\b20\d\d-\d\d-\d\d\b/.test(ctx)) continue;                     // dated as history
      bad.push(`${rel} claims coverage of "${m[0]}" in prose, but the corpus measures ${measured.reachable}/${compounds.length}. Quote the gated field, or date the sentence so a reader can tell a record of an edit from the current number.`);
    }
  });
  // ---- W6 (2026-08-08): A ONE-COMPOUND DANGER ROW IS NOT A COMBINATION -----------------------
  // stackInteractions() deliberately lets a single-`need` rule fire on one compound — "this
  // substance should not be used at all" is a real thing to say about a stack, and `dnp` is the
  // only danger rule shaped that way. The VERDICT then counted it and called it a combination.
  // MEASURED hydrated at 390x844, 0 pageerrors, /stack?ids=c28,c0: "☠️ 1 dangerous combination —
  // read below" above one row whose .ixn-who is just "2,4-Dinitrophenol (DNP)". The count was
  // right and the noun was wrong, and the noun is the part a reader acts on — it says the danger
  // comes from mixing, which invites dropping the other compound as the fix.
  // This tripwire is the cheap half of that repair: as long as a danger rule exists that CAN
  // render a one-compound row, site/app.js must still carry the wording that distinguishes it, and
  // must not have gone back to counting every danger row as a combination. Same read-the-renderer
  // pattern the analytics, voice and coverage-prose gates above already use.
  // PROVE IT by putting `${nDanger} dangerous combination` back into site/app.js.
  {
    const solo = (R.rules || []).filter((r) => r.tier === 'danger' && (r.need || []).length === 1 && (r.need || [])[0][1] === 1);
    if (solo.length) {
      const APP = fs.readFileSync(path.join(ROOT, 'site', 'app.js'), 'utf8');
      const names = solo.map((r) => `"${r.id}"`).join(', ');
      if (APP.indexOf('should not be used at all') < 0) {
        bad.push(`rule(s) ${names} render a danger row involving ONE compound (a single need of 1), but site/app.js no longer contains the wording that says so — the verdict is back to calling a one-compound row a "combination", which tells a reader the danger comes from mixing.`);
      }
      if (/\$\{nDanger\} dangerous combination/.test(APP)) {
        bad.push(`site/app.js counts every danger row as a "combination" (\`\${nDanger} dangerous combination\`) while rule(s) ${names} can render a row about a single compound. Split the count, or delete the single-need danger rule.`);
      }
    }
  }
  if (bad.length) {
    console.error('[parse] INTERACTION COVERAGE ASSERTION FAILED — the checker must not overstate what it knows:');
    bad.forEach((b) => console.error('  · ' + b));
    process.exit(1);
  }
  console.log('[parse] interaction coverage: %d/%d compounds can produce a flag (%d cannot, %d of them Rx), %d rules, %d tags, 0 orphan and 0 dangling',
    measured.reachable, measured.compounds, measured.unreachable, measured.unreachableRx, (R.rules || []).length, produced.size);
  console.log('[parse] duplicate substances OK — %d group(s), %d collapsible pair(s), 0 rules still counting two pages of one molecule as two compounds; %d nameTag(s) match >1 id and every such pair is covered',
    (R.duplicates || []).length, dupePairsChecked, (R.nameTags || []).filter((r) => (r.ids || []).length > 1).length);
  console.log('[parse] self-interaction guard: %d row(s) dropped because one compound carried every tag the rule needed — none reached a reader on any of the three surfaces', soloDropped);
  console.log('[parse] rule-text row truth OK — %d rules × %d rendered rows over all %d two-compound stacks; every compound a why/action names is either in the row or an acknowledged exemplar (%d exemplars on %d rules)',
    checkedRules, checkedRows, (compounds.length * (compounds.length - 1)) / 2,
    (R.rules || []).reduce((n, r) => n + (r.exemplars || []).length, 0), (R.rules || []).filter((r) => (r.exemplars || []).length).length);

  // ---- W3.5 (2026-08-02): ONE MATCHER FOR THE PATHWAY-SIBLING LIST -------------------------
  // Both renderers print a "shares a pathway" list of four compounds on the compound page, and
  // both used to head it "often paired with" — a pairing recommendation nobody authored, which
  // the site's own checker contradicted 80 times (63 of them at DANGER tier). The renderers now
  // print the checker's verdict beside each entry instead, and they read it from HERE rather than
  // each replaying the matcher: there are already two hand-synced copies of tagsOf (this one and
  // app.js's compoundTags) and the comment above says what a third would cost. Computed for every
  // pair that shares a pathway, which is the only pair a renderer can offer.
  const pairFlags = {};
  compounds.forEach((a, i) => {
    const pa = a.pathwayIds || []; if (!pa.length) return;
    compounds.slice(i + 1).forEach((b) => {
      if (!(b.pathwayIds || []).some((p) => pa.indexOf(p) >= 0)) return;
      const byTag = {};
      [a, b].forEach((c) => tagsOf(c).forEach((t) => (byTag[t] = byTag[t] || []).push(c)));
      // W4.5: distinct SUBSTANCES, matching site/app.js stackInteractions(). Before this,
      // /c/caffeine-thermogenic rendered "Caffeine ☠️ Stacked stimulants — cardiovascular strain"
      // inside its own "🧬 Acts on the same pathway" list — the same fabricated interaction as on
      // /stack, on a second surface, measured hydrated at 390x844.
      const fired = (R.rules || []).filter((rule) => rule.need.every((n) => distinctCarriers(byTag[n[0]] || [], n[1])));
      const seen = {}; fired.forEach((f) => { seen[f.id] = 1; });
      // W5.5: soloRule here too — this list is RENDERED beside a pathway sibling on the compound
      // page, so without it c112 would carry "Slows the enzyme that clears statins" next to every
      // sibling it shares a pathway with, none of which is in the interaction. Third surface, same
      // defect: this is why the predicate and not the assertion is the guard.
      const live = fired.filter((f) => !(f.notIf || []).some((id) => seen[id]))
        .filter((f) => { const inv = new Set(); f.need.forEach((n) => (byTag[n[0]] || []).forEach((c) => inv.add(c.id))); return !soloRule(f, inv); });
      const worst = live.find((f) => f.tier === 'danger') || live.find((f) => f.tier === 'blunt') || live[0];
      if (worst) pairFlags[a.id + '|' + b.id] = { tier: worst.tier, title: worst.title };
    });
  });
  data.pairFlags = pairFlags;
  const tiers = {}; Object.values(pairFlags).forEach((f) => { tiers[f.tier] = (tiers[f.tier] || 0) + 1; });
  console.log('[parse] pathway-sibling pairs the checker flags: %d (%s)', Object.keys(pairFlags).length,
    Object.keys(tiers).sort().map((t) => `${t} ${tiers[t]}`).join(', ') || 'none');
})();

// ---- W4 (2026-08-02): THE OWNER'S IDENTITY, IN ONE PLACE -------------------------------------
// data/site_config.json is the only place the X handle is written down. Before this it was typed
// into build/prerender.js:494 (the Organization JSON-LD `sameAs`, which reaches every prerendered
// page) and a personal username was sitting in the sign-in modal placeholder as "e.g. hyrox_felix"
// — measured hydrated at 390x844 by opening the modal on /. The three X loops added in this wave
// print the handle on the receipt, the stack-audit callout and the share text, so without this the
// same string would now exist in seven places across three files.
//
// The handle is validated against X's own rule (1–15 chars, letters/digits/underscore, no leading
// @). An invalid handle does not fail loudly at runtime — it produces a share link to a profile
// that does not exist, which is exactly the class of defect nobody notices for months.
const siteConfig = readJSON(path.join(DATA_DIR, 'site_config.json'));
(function assertSiteConfig() {
  const bad = [];
  const h = ((siteConfig || {}).x || {}).handle;
  if (!siteConfig) bad.push('data/site_config.json is missing or unreadable');
  else if (typeof h !== 'string' || !/^[A-Za-z0-9_]{1,15}$/.test(h)) {
    bad.push(`x.handle is ${JSON.stringify(h)} — it must be 1–15 characters of letters, digits or underscore, with NO leading "@". Anything else builds a share link to a profile that does not exist.`);
  } else if (((siteConfig.x || {}).profile || '') !== 'https://x.com/' + h) {
    bad.push(`x.profile is ${JSON.stringify((siteConfig.x || {}).profile)} but the handle is "${h}" — the two disagree, so half the links on the page would point somewhere else.`);
  }
  // /interest's chips (2026-08-08). This list is a WRITE SCHEMA, not copy: `id` is what goes into
  // interest_signups.topic and what POST /api/interest matches against, so a typo here is a form
  // control that silently discards the reader's only answer. It is validated here, and not in
  // server.js, because server.js reads it at boot from site/data.js — by then the build has already
  // happened and refusing is no longer an option.
  const _it = ((siteConfig || {}).interest || {}).topics;
  if (!Array.isArray(_it) || _it.length < 2) {
    bad.push('interest.topics must be an array of at least two { id, label } chips — /interest renders its radio group from it and POST /api/interest validates against it');
  } else {
    const seen = new Set();
    _it.forEach((t, i) => {
      if (!t || typeof t.id !== 'string' || !/^[a-z][a-z0-9-]{1,23}$/.test(t.id)) bad.push(`interest.topics[${i}].id is ${JSON.stringify(t && t.id)} — ids are stored in the database and matched exactly; use lower-case letters, digits and hyphens`);
      else if (seen.has(t.id)) bad.push(`interest.topics has two chips with id "${t.id}" — a radio group with a duplicated value cannot record which one was chosen`);
      else seen.add(t.id);
      if (!t || typeof t.label !== 'string' || !t.label.trim()) bad.push(`interest.topics[${i}] has no label — the reader taps the label, so a chip without one is an invisible control`);
    });
    if (!seen.has('other')) bad.push('interest.topics has no chip with id "other" — that chip is what reveals the free-text field, and topic_other is only stored when it is the chosen answer, so without it the field can never be submitted');
  }
  if (bad.length) {
    console.error('\n[parse] SITE CONFIG FAILED — refusing to build:');
    bad.forEach((b) => console.error('  ✗ ' + b));
    process.exit(1);
  }
  data.site = {
    x: { handle: h, profile: siteConfig.x.profile },
    links: siteConfig.links || {},
    // Passed through so there is exactly one definition of the chips. server.js reads
    // data.site.interest.topics at boot; anything not in it is stored as NULL, never as itself.
    interest: { topics: _it.map((t) => ({ id: t.id, label: t.label })) },
  };
  console.log('[parse] site config OK — one owner handle @%s, %d interest topics, read from data/site_config.json.', h, _it.length);
})();

data.glossary = readJSON(path.join(DATA_DIR, 'glossary.json')) || {};
console.log('[parse] glossary exposed to the SPA:', Object.keys(data.glossary).length, 'terms');
fs.writeFileSync(OUT, 'window.RNAWIKI_DATA = ' + JSON.stringify(data) + ';\n');

// emit lazy-loaded protocol datasets as window globals (loaded on demand by app.js)
const SITE = path.dirname(OUT);
if (exercisesData) fs.writeFileSync(path.join(SITE, 'exercises.js'), 'window.RNAWIKI_EXERCISES = ' + JSON.stringify(exercisesData) + ';\n');
if (foodsData) fs.writeFileSync(path.join(SITE, 'foods.js'), 'window.RNAWIKI_FOODS = ' + JSON.stringify(foodsData) + ';\n');
if (businessesData) fs.writeFileSync(path.join(SITE, 'businesses.js'), 'window.RNAWIKI_BUSINESSES = ' + JSON.stringify(businessesData) + ';\n');
data.claims = CLAIMS;                       // the claims spine, now readable by both renderers
data.meta.counts.claims = CLAIMS.length;
data.meta.counts.problems = (graph && graph.problems.length) || 0;
data.meta.counts.exercises = (exercisesData && exercisesData.exercises.length) || 0;
data.meta.counts.foods = (foodsData && foodsData.foods.length) || 0;
// rewrite data.js with updated counts
fs.writeFileSync(OUT, 'window.RNAWIKI_DATA = ' + JSON.stringify(data) + ';\n');

// Drop the precompressed twins of everything we just rewrote.
//
// CLAUDE.md documents "after editing a sidecar in data/, run node build/parse.js" — parse-only, no
// precompress. That left site/data.js newer than site/data.js.br, and server.js correctly refuses a
// twin older than its source (serving it would ship the previous build's data to every reader).
// The result was a silent fallback to identity: 11,736,203 B of data.js and 1,217,855 B of
// exercises.js on the wire, uncompressed, until someone happened to run precompress again.
//
// Deleting is the right invalidation, not regenerating: brotli q11 over data.js costs ~18 s, which
// would be paid on every parse during authoring. Absent twin -> server serves identity, which is
// correct and honest; `npm run build` and `prestart` both run precompress, so a deploy is always
// compressed. Never leave a STALE twin on disk — that is the only state that can serve wrong bytes.
for (const f of ['data.js', 'exercises.js', 'foods.js', 'businesses.js']) {
  for (const ext of ['.br', '.gz']) {
    try { fs.unlinkSync(path.join(SITE, f + ext)); } catch (e) { /* absent is the desired state */ }
  }
}

// report
console.log('Parsed:', JSON.stringify(data.meta.counts, null, 2));
console.log('Top targets by compound-count:', targets.slice(0, 10).map(t => `${t.sym}(${t.compoundIds.length})`).join(', '));
const noPath = compounds.filter(c => !c.pathwayIds.length && !c.brief);
console.log('Full compounds with NO pathway tag:', noPath.length, noPath.slice(0, 10).map(c => c.name));
console.log('Wrote', OUT);

// ---- build-time assertion: the personalised dose calculator -----------------------------------
// Added 2026-07-28 after the calculator was found rendering "3 mg" where 3 g is correct (a 1,000x
// under-dose on HMB), 84 g/day of what is actually glycerol, and 7,000 mg of l-tyrosine against
// its own authored "keep total under ~5-6 g" cap. Root cause: it ran parseFloat() over a human
// sentence, which returns NaN unless the string starts with a digit -- so 8 of 11 caps were
// silently discarded and the one that parsed produced the 1,000x error. Prose is not a number.
// This gate makes that class of defect un-shippable: parse.js is already a hard deploy gate
// (prestart joins it with &&), so a throw here stops the deploy.
(function assertDoseCalculators() {
  const problems = [];
  const walk = (o, p) => {
    if (!o || typeof o !== 'object') return;
    if (!Array.isArray(o) && o.perKg != null) {
      const key = p.split('/')[1] || p;
      const unit = String(o.unit || 'g').split('/')[0];
      const hasCap = o.capValue != null || o.capPerKg != null;
      if (!hasCap && !o.flat && !o.molecule) {
        problems.push(`${key}: perKg with no capValue/capPerKg and no flat/molecule fallback`);
      }
      if (o.cap && !hasCap && !o.flat) {
        problems.push(`${key}: has authored cap prose but no machine-readable capValue/capPerKg — the renderer cannot use prose`);
      }
      // sanity: the dose a 70 kg adult sees must not exceed its own cap
      const at70 = o.perKg * 70;
      const cap = o.capPerKg != null ? o.capPerKg * 70 : o.capValue;
      if (cap != null && at70 > cap * 1.0001 && !o.flat && !o.molecule) {
        problems.push(`${key}: renders ${at70}${unit} at 70 kg, above its own cap of ${cap}${unit}`);
      }
      if (cap != null && cap > 0 && at70 / cap > 1000) {
        problems.push(`${key}: cap (${cap}${unit}) is >1000x smaller than the computed dose (${at70}${unit}) — almost certainly a unit mismatch`);
      }
    }
    for (const k of Object.keys(o)) walk(o[k], p + '/' + k);
  };
  walk(bioLearn, '');
  if (problems.length) {
    console.error('\n[parse] DOSE CALCULATOR ASSERTION FAILED — refusing to build:');
    problems.forEach((m) => console.error('  ✗ ' + m));
    process.exit(1);
  }
  console.log('[parse] dose calculators OK (all perKg entries carry machine-readable caps).');
})();

// ---- build-time assertion: contraindicated movements ------------------------------------------
// Added 2026-07-28. The computed exercise list is a tag join: it knows which muscles an exercise
// trains and nothing about which movements the condition cannot tolerate. Rotator-cuff impingement
// prescribes "avoid painful overhead loading until controlled" and the list rendered an overhead
// cable press as the #1 movement. `avoid_movements` fixes that cause; this gate makes sure the next
// author who writes an avoidance into a prescription cannot forget the machine-readable half.
(function assertAvoidMovements() {
  const graph = readJSON(path.join(DATA_DIR, 'clinical_graph.json'));
  if (!graph) return;
  const NAMES_A_MOVEMENT = /\b(overhead|press|pressing|squat|deadlift|running|impact|jumping|flexion|extension|rotation|loading|lifting)\b/i;
  const SAYS_AVOID = /\b(avoid|stop|don'?t|do not|refrain from|no\s)\b/i;
  const missing = [];
  (graph.problems || []).forEach((p) => (p.root_causes || []).forEach((rc) => {
    const detail = ((rc.prescription || {}).detail) || '';
    if (SAYS_AVOID.test(detail) && NAMES_A_MOVEMENT.test(detail) &&
        !(Array.isArray(rc.avoid_movements) && rc.avoid_movements.length)) {
      missing.push(`${p.id}/${rc.id}: prescription says to avoid a movement but has no avoid_movements — ` +
                   `the computed exercise list can still surface it. Detail: "${detail.slice(0, 90)}…"`);
    }
  }));
  if (missing.length) {
    console.error('\n[parse] CONTRAINDICATED-MOVEMENT ASSERTION FAILED — refusing to build:');
    missing.forEach((m) => console.error('  ✗ ' + m));
    process.exit(1);
  }
  console.log('[parse] contraindicated-movement gates OK.');
})();

// ---- build-time assertion: rule 2, human evidence gets the stars ------------------------------
// Added 2026-07-30. The star cap itself was fixed earlier (see the animalOnly logic above), but
// nothing STOPPED it regressing, so the same defect was re-reported by three independent audits and
// stayed in CLAUDE.md as a "known live violation" long after it was actually fixed. A fix without a
// gate is a fix that has to be rediscovered. Rule 2 has two halves and this checks both: an
// animal-only compound may not exceed 2 stars, AND its badge must say so in words — a capped number
// with a silent badge still reads to a human as an unqualified rating.
(function assertHumanEvidenceStars() {
  const bad = [];
  compounds.filter((c) => c.animalOnly).forEach((c) => {
    if (c.stars > 2) bad.push(`${c.name}: animal-only but rendered ${c.stars} stars (cap is 2)`);
    if (!/animal|mouse|mice|rat|rodent|preclinical|in vitro/i.test(String(c.badge || '')))
      bad.push(`${c.name}: animal-only but the badge never says so — "${c.badge}"`);
  });
  if (bad.length) {
    console.error('\n[parse] HUMAN-EVIDENCE STAR ASSERTION FAILED — refusing to build:');
    bad.forEach((m) => console.error('  \u2717 ' + m));
    process.exit(1);
  }
  const n = compounds.filter((c) => c.animalOnly).length;
  console.log(`[parse] human-evidence stars OK \u2014 ${n} animal-only compound(s), all capped at \u22642 stars and labelled.`);
})();

// ---- build-time assertion: A RATING MAY NOT BE CARRIED BY COLOUR ALONE ------------------------
// W5a (2026-08-02). assertHumanEvidenceStars() above checks that the star NUMBER is honest. It
// never checked that the number SURVIVES being read. It did not: the evidence chip padded the
// empty half of the rating with the SAME character in a paler colour, so a 1-star compound's
// innerText was "\u2605\u2605\u2605\u2605\u2605 Minimal" on 148 of 171 compounds (measured hydrated at 390x844 on
// /c/bpc-157, .sc-dim colour rgb(233,237,242) on rgb(246,248,250) = 1.10:1).
//
// The defect CLASS, stated once so the gate can be about the class and not the instance: a rating
// is a claim, and a claim that only exists in a colour has not been made to anyone who cannot see
// the colour \u2014 a screen reader, a text extractor, an LLM crawler, a copy-paste, a printout, or a
// reader with low vision. So: the text alone must identify the rating, and the empty half of a
// star run must be a DIFFERENT CHARACTER, not the same one restyled.
//
// PROVE IT three ways, each of which reintroduces the original bug:
//   1. set RATING.glyphs[1] back to '\u2605\u2605\u2605\u2605\u2605'                    -> fails on the filled-pad check
//   2. set RATING.text[1] and RATING.text[2] to the same string -> fails on the strip check
//   3. put `<span class="sc-dim">${'\u2605'.repeat(5 - c.stars)}</span>` back into site/app.js
//                                                              -> fails on the source check
(function assertRatingIsTextCarried() {
  const bad = [];
  const strip = (s) => String(s).replace(/[\u2605\u2606]/g, '').replace(/\s+/g, ' ').trim();
  ['glyphs', 'compact', 'text', 'aria'].forEach((k) => {
    if (!Array.isArray(RATING[k]) || RATING[k].length !== 6) bad.push(`RATING.${k} must be a 6-entry array indexed by the star count 0-5`);
  });
  if (bad.length) { console.error('\n[parse] RATING ASSERTION FAILED \u2014 refusing to build:'); bad.forEach((m) => console.error('  \u2717 ' + m)); process.exit(1); }

  // 1. THE TEXT ALONE MUST IDENTIFY THE RATING. Strip every star glyph \u2014 which is exactly what a
  //    reader who cannot see the colour is left with \u2014 and the six remaining strings must still be
  //    six different strings. If two collapse, the difference between those two ratings was living
  //    in the picture, which is the defect.
  [['text', RATING.text], ['aria', RATING.aria]].forEach(([k, arr]) => {
    const seen = new Map();
    arr.forEach((s, i) => {
      const key = strip(s).toLowerCase();
      if (!key) { bad.push(`RATING.${k}[${i}] is nothing but star glyphs \u2014 with the glyphs stripped it says nothing at all, so the rating exists only as a picture`); return; }
      if (seen.has(key)) bad.push(`RATING.${k}[${i}] and RATING.${k}[${seen.get(key)}] are the same string once the star glyphs are stripped ("${key}") \u2014 a reader who can see the stars gets two different ratings and everyone else gets one`);
      seen.set(key, i);
    });
    arr.forEach((s, i) => { if (i > 0 && !new RegExp(`\\b${i}\\b`).test(String(s))) bad.push(`RATING.${k}[${i}] never states the number ${i} \u2014 the rating has to be readable as a number, not counted off a row of glyphs`); });
  });

  // 2. THE PAD MUST BE A DIFFERENT CHARACTER. This is the mechanical form of the original bug.
  RATING.glyphs.forEach((g, i) => {
    const filled = (String(g).match(/\u2605/g) || []).length;
    if (filled !== i) bad.push(`RATING.glyphs[${i}] draws ${filled} filled stars for a ${i}-star rating \u2014 the empty half must use a DIFFERENT character (\u2606), never \u2605 in a different colour`);
  });
  RATING.compact.forEach((g, i) => {
    if (/\u2606/.test(String(g))) bad.push(`RATING.compact[${i}] contains an empty glyph \u2014 the compact form is filled-only by design; use RATING.glyphs where the scale is shown`);
    const filled = (String(g).match(/\u2605/g) || []).length;
    if (filled !== i) bad.push(`RATING.compact[${i}] draws ${filled} filled stars for a ${i}-star rating`);
  });
  if (/\u2606/.test(RATING.glyphs[0]) || /\u2605/.test(RATING.glyphs[0]) || /[\u2605\u2606]/.test(RATING.compact[0])) {
    bad.push('RATING index 0 draws a star widget. The 13 "(brief)" bundles are UNRATED, not zero-rated \u2014 a five-empty-star widget reports the worst possible score for a page that was never scored, which is the same lie pointing the other way.');
  }

  // 3. NO RENDERER MAY PAD A STAR RUN WITH THE FILLED GLYPH, and both renderers must be checked \u2014
  //    the prerendered document and the hydrated one are different documents (see AGENT_RULES).
  //    It reads CODE, not commentary: whole-line `//` comments are dropped first, because the
  //    comments in both files quote the original defect verbatim on purpose, and a gate that
  //    punished writing down what went wrong would teach the next person to delete the record.
  const codeOnly = (src) => src.split('\n').filter((l) => !/^\s*(\/\/|\/\*|\*)/.test(l)).join('\n');
  [['site', 'app.js'], ['build', 'prerender.js']].forEach((p) => {
    const rel = p.join('/'), src = codeOnly(fs.readFileSync(path.join(ROOT, ...p), 'utf8'));
    if (/['"]\u2605['"]\s*\.repeat\(\s*5\s*-/.test(src)) bad.push(`${rel} pads a star rating with the FILLED glyph \u2014 '\u2605'.repeat(5 - n). The empty half must be a different character; a reader without the colours reads five stars.`);
    // `cmp-dim` was NOT in the W0 baseline. This gate found it on its FIRST run, on the "compare
    // with" cards that appear inside every compound page — a third instance of the same defect that
    // three audits had walked past. That is the whole argument for gating a class, not an instance.
    ['sc-dim', 'evg-dim', 'cmp-dim'].forEach((cls) => { if (src.indexOf(cls) >= 0) bad.push(`${rel} still renders "${cls}" \u2014 the colour-only star pad this gate exists to prevent`); });
  });

  // 3b. W5.5 (2026-08-02): AND NO RENDERER IN app.js MAY BUILD A STAR RUN AT ALL.
  //    \u00a73 above only banned padding with the FILLED glyph \u2014 `'\u2605'.repeat(5 - n)` \u2014 so a renderer that
  //    drew the filled half BY ITSELF walked straight past it. One did, for the whole of W5a and
  //    W5c: positioningPlot() emitted `<span class="pos-stars">${'\u2605'.repeat(x.stars)}</span>`.
  //    Measured hydrated at 390x844 across all 568 routes: 1,215 .pos-stars elements on 169 of 171
  //    compound pages, EVERY ONE with aria-label = null and role = null, while the 3,245 badges that
  //    do go through starHTML() had both. 37 of them rendered as an EMPTY span, because
  //    '\u2605'.repeat(0) is '' \u2014 the 13 unrated bundles got a blank cell instead of "Not yet rated",
  //    which is the same unrated-is-not-zero-rated distinction \u00a72 protects one level up.
  //    The invariant is therefore not "don't pad wrongly", it is: in app.js the ONLY thing that
  //    turns a star count into markup is starHTML(), because that is the single place role="img",
  //    the accessible name and the index-0 wording are applied. build/prerender.js is deliberately
  //    NOT held to this \u2014 it has its own stars() helper at prerender.js:173, which is a legitimate
  //    second renderer for the prerendered document and is covered by \u00a73's pad check.
  //    PROVE IT by restoring `<span class="pos-stars">${'\u2605'.repeat(x.stars)}</span>` in
  //    positioningPlot(): the build fails here by name.
  {
    const appCode = codeOnly(fs.readFileSync(path.join(ROOT, 'site', 'app.js'), 'utf8'));
    const runs = appCode.match(/['"][\u2605\u2606]+['"]\s*\.repeat\(/g) || [];
    if (runs.length) bad.push(`site/app.js builds a star run outside starHTML() \u2014 found ${runs.length} \u00d7 ${runs[0].trim()}. Every star on the site must go through starHTML(), which is the only place role="img", the accessible name and the "Not yet rated" wording for index 0 are applied; a hand-rolled run ships a bare <span> with no accessible name, and renders NOTHING at all for an unrated entry.`);
  }

  // 4. THE RENDERER MUST READ THIS TABLE, not keep a private copy that can drift out of it.
  const app = fs.readFileSync(path.join(ROOT, 'site', 'app.js'), 'utf8');
  if (!/D\.ratings\.text/.test(app)) bad.push('site/app.js never reads D.ratings.text \u2014 the rating\'s text carrier is emitted and unused, which is how the picture becomes the only carrier again');
  if (!/D\.ratings\.aria/.test(app)) bad.push('site/app.js never reads D.ratings.aria \u2014 the 171 star badges shipped with aria-label = null and role = null, and that is what this field is for');
  if (!/class="stars[^"]*"\s+role="img"\s+aria-label=/.test(app)) bad.push('site/app.js renders a .stars badge with no role="img" + aria-label \u2014 a bare <span> of glyphs has no accessible name, and `title` is not one');

  if (bad.length) {
    console.error('\n[parse] RATING TEXT-CARRIER ASSERTION FAILED \u2014 refusing to build:');
    bad.forEach((m) => console.error('  \u2717 ' + m));
    process.exit(1);
  }
  const rated = compounds.filter((c) => c.stars > 0).length;
  console.log(`[parse] rating text-carrier OK \u2014 6 ratings, all distinct with every star glyph stripped; ${rated} rated + ${compounds.length - rated} unrated compounds; no renderer pads with the filled glyph.`);
})();

// ---- build-time assertion: A COLOUR IS THE REGULATOR'S CALL, AND THE SUPPLY ANSWER IS ONE ------
// W5a (2026-08-02). Felix's decision is that a colour on this site means the FDA's or the relevant
// global regulator's current status/call on that molecule \u2014 never that anyone here reviewed it.
// The defect this gate exists for: TWO authored sources both answered "how do you get this" and
// disagreed on 24 of 171 compounds, measured hydrated at 390x844 (visible `.badges .pill` text vs
// `c.regulatory_class`) \u2014 Vitamin D3 and Iron rendering a blue Prescription pill on an authored
// `supplement`, 21 prescription/pharmacy compounds rendering only \ud83d\udfe2 or \ud83d\udfe0 and no supply statement.
//
// It is one carrier or it is a contradiction waiting. So: exactly one supply statement per
// compound, derived from the authored class; no badge may survive that asserts a supply route the
// authored class denies; and the approval-label table may not use retail-availability wording,
// because that is what let "OTC Supplement" be read as this page's answer in the first place.
//
// WHAT THIS GATE CANNOT DO, stated rather than hidden: it cannot judge whether the authored class
// is right. It enforces that ONE authored field answers the question and that nothing else on the
// page contradicts it. Getting the class itself right is data/regulatory_class.json's job, where
// `source: "human-override"` and `needs_human_review` are already recorded per row.
//
// PROVE IT: put 'OTC Supplement' back as the \ud83d\udfe1 label -> fails on the retail-wording check;
// add 'controlled' to BADGE_SUPPLY_OK['\ud83d\udfe1'] -> fails by naming the compounds; delete
// `data-axis="supply"` from site/app.js -> fails on the renderer check.
// What each supply-claiming badge ASSERTS about how you get the thing, and what each authored class
// ALLOWS. Deliberately written independently of BADGE_SUPPLY_OK above — the gate's whole job is to
// check that the reconciler and the rule still agree, and a gate that reads the reconciler's own
// table cannot do that.
const BADGE_SUPPLY_CLAIM = { '🟡': 'supplement', '🔵': 'prescription', '⚫': 'controlled' };
const CLASS_ADMITS = {
  supplement: ['supplement'],
  otc: ['supplement'],
  pharmacy: ['prescription'],                 // still a professional's counter, never a shelf
  prescription: ['prescription'],
  controlled: ['prescription', 'controlled'], // a controlled medicine is also prescription-only
  unapproved: [],                             // nothing legitimate supplies it
  unknown: [],
};
(function assertRegulatoryAxes() {
  const bad = [];
  const RETAIL = /\b(otc|over[- ]the[- ]counter|off the shelf|behind the counter|general sale|buy)\b/i;
  Object.entries(APPROVAL_LABEL).forEach(([b, l]) => {
    if (RETAIL.test(l)) bad.push(`approval label "${b} ${l}" uses retail-availability wording. A colour is the regulator's call on the molecule, not a shop instruction \u2014 and this is the exact wording that let a badge be read as the page's supply answer while data/regulatory_class.json said something else.`);
  });
  const tagSeen = new Map();
  Object.entries(SUPPLY_BY_CLASS).forEach(([cls, tag]) => {
    if (!String(tag || '').trim()) bad.push(`SUPPLY_BY_CLASS["${cls}"] is empty`);
    if (tagSeen.has(tag)) bad.push(`SUPPLY_BY_CLASS gives "${cls}" and "${tagSeen.get(tag)}" the same words ("${tag}") \u2014 the supply statement has to identify the class it came from`);
    tagSeen.set(tag, cls);
  });
  compounds.forEach((c) => {
    const s = c.supply || {};
    if (!s.tag || !SUPPLY_BY_CLASS[s.cls] || SUPPLY_BY_CLASS[s.cls] !== s.tag)
      bad.push(`${c.id} ("${c.name}") has no supply statement derived from its authored regulatory class \u2014 21 compounds shipped with a prescription/pharmacy class and nothing on the badge row saying so`);
    if (c.regulatory_class && SUPPLY_BY_CLASS[c.regulatory_class] && s.cls !== c.regulatory_class)
      bad.push(`${c.id} ("${c.name}") renders supply class "${s.cls}" but its authored class is "${c.regulatory_class}"`);
    // CHECKED AGAINST AN INDEPENDENT STATEMENT OF THE RULE, not against BADGE_SUPPLY_OK. The first
    // version of this check read the same table the reconciler above writes with, so widening that
    // table widened the check too and the gate passed while the defect came back \u2014 a tautology, and
    // the exact "a gate over an empty set always passes" failure this project has hit before.
    // BADGE_SUPPLY_CLAIM says what each badge ASSERTS; CLASS_ADMITS says what each authored class
    // ALLOWS. Two tables, written from two directions, that have to agree.
    (c.badges || []).forEach((a) => {
      const claim = BADGE_SUPPLY_CLAIM[a];
      if (!claim) return;                                   // \ud83d\udfe2 / \ud83d\udfe0 / \ud83d\udd34 assert no supply route
      const admits = CLASS_ADMITS[s.cls] || [];
      if (!admits.includes(claim)) bad.push(`${c.id} ("${c.name}") renders the "${a} ${APPROVAL_LABEL[a]}" badge, which asserts you get this on a "${claim}" route, but its own authored regulatory class is "${s.cls}", which admits ${admits.length ? admits.map((x) => `"${x}"`).join(' or ') : 'no supply route at all'} \u2014 this is the Vitamin-D3-with-a-blue-Prescription-pill defect`);
    });
    (c.badgesDropped || []).forEach((d) => {
      if ((c.badges || []).includes(d.badge)) bad.push(`${c.id}: badge "${d.badge}" is recorded as withdrawn and is also rendered`);
      if (!String(d.why || '').trim()) bad.push(`${c.id}: badge "${d.badge}" was withdrawn with no reason recorded \u2014 a suppression with nothing beside it is a silent edit`);
    });
  });
  // The renderers must actually distinguish the two axes. A reader cannot be expected to know that
  // one pill answers "what has a regulator decided" and the next answers "how do you get it"
  // unless the page says so; and 197 approval pills shipped with aria-label = null and title = null.
  const app = fs.readFileSync(path.join(ROOT, 'site', 'app.js'), 'utf8');
  [['data-axis="regulator"', 'the approval pills are not marked as the regulator axis'],
   ['data-axis="supply"', 'the supply pill is not marked as the supply axis'],
   ['c.supply', 'site/app.js never reads c.supply \u2014 the authored class would again be invisible on the badge row, which is where the two answers disagreed'],
   ['aria-label="Regulator status:', 'the approval pills have no accessible name (all 197 shipped with aria-label = null)'],
   ['aria-label="How you get it:', 'the supply pill has no accessible name']].forEach(([needle, why]) => {
    if (app.indexOf(needle) < 0) bad.push(`site/app.js is missing ${needle} \u2014 ${why}`);
  });
  if (/class="rx-note"/.test(app)) bad.push('site/app.js still renders .rx-note, a SECOND supply carrier that said "Prescription \u2014 needs a doctor" on /c/minoxidil, whose authored class is "pharmacy". One carrier or it is a contradiction waiting.');

  // /legend is the page every star and badge points at, and it said ONE THING TO A CRAWLER AND THE
  // OPPOSITE TO A READER. Hydrated: "\ud83c\udff7\ufe0f Legal status \u2014 colour = how you can (legally) get it".
  // Prerendered: "A badge says who has approved a molecule. It is not a statement about where you
  // can buy it." The hydrated version is the one every human read, and it is the reading that once
  // printed "available over the counter \u2014 Guardian, Watsons" on seven prescription-only medicines \u2014
  // the Medicines Act 1975 s.51 exposure, which carries a prior-permit requirement and no
  // educational exemption. Both renderers are checked, because they are two documents.
  // Scoped to each renderer's OWN /legend source, not the whole file — the first version of this
  // check searched app.js entire, and an unrelated copy of the sentence elsewhere on the site kept
  // it passing while /legend itself lost it. A gate that can be satisfied by a different page is
  // not a gate on this one.
  const pre = fs.readFileSync(path.join(ROOT, 'build', 'prerender.js'), 'utf8');
  const slice = (src, from, to) => { const i = src.indexOf(from); if (i < 0) return ''; const j = src.indexOf(to, i + from.length); return src.slice(i, j < 0 ? src.length : j); };
  const legendApp = slice(app, 'function legendBlock()', '\n  function goalPage(');
  const legendPre = slice(pre, "add('/legend', shell({", "add('/methodology'");
  if (!legendApp || !legendPre) bad.push('the /legend source could not be located in one of the two renderers — this gate is checking nothing, which is worse than failing');
  [['site/app.js /legend', legendApp], ['build/prerender.js /legend', legendPre]].forEach(([rel, src]) => {
    const code = src.split('\n').filter((l) => !/^\s*(\/\/|\/\*|\*)/.test(l)).join('\n');
    if (/colou?r\s*=\s*how you can/i.test(code)) bad.push(`${rel} tells the reader a COLOUR is how they can get a medicine. It is not: a colour is a regulator's call on the molecule, and reading it as a supply route is what put "available over the counter" on prescription-only medicines (CLAUDE.md rule 6, Medicines Act 1975 s.51).`);
    if (!/not a (shopping instruction|statement about where you can buy)/i.test(code)) bad.push(`${rel} never states that a colour is NOT a statement about where you can buy the thing \u2014 the one sentence /legend exists to carry`);
    if (!/no clinician has reviewed/i.test(code)) bad.push(`${rel} never states that no clinician has reviewed these pages. A coloured badge next to a star rating reads as a professional's verdict unless the page says otherwise, and there is no authoritative professional on this project.`);
  });

  if (bad.length) {
    console.error('\n[parse] REGULATORY AXES ASSERTION FAILED \u2014 refusing to build:');
    bad.slice(0, 25).forEach((m) => console.error('  \u2717 ' + m));
    if (bad.length > 25) console.error(`  \u2026 and ${bad.length - 25} more`);
    process.exit(1);
  }
  const pills = compounds.reduce((n, c) => n + (c.badges || []).length, 0);
  const withdrawn = compounds.reduce((n, c) => n + (c.badgesDropped || []).length, 0);
  const sourced = compounds.filter((c) => c.supply && c.supply.why).length;
  console.log(`[parse] regulatory axes OK \u2014 ${pills} regulator badges (+${withdrawn} withdrawn as contradicting the authored class), ${compounds.length} supply statements, ${sourced} of them carrying the compound's own authored status sentence. 0 contradictions.`);
})();

// ---- build-time assertion: goal taxonomy ------------------------------------------------------
// Added 2026-07-28 with the prose-free goal fix. A proposal set this guard at ">20 compounds with
// zero goals", which would NOT have fired at the real number (12) — it would have shipped silently.
// The threshold is 0: every compound must reach at least one goal, either from its curated fields
// or from GOAL_OVERRIDES. A compound with no goal is invisible on every goal page and in the
// homepage grid, which is a silent content regression rather than a visible failure.
// ---- build check: a nutrient target must be able to surface a food -----------------------------
// Added 2026-07-31. Each root cause sets `nutrient_targets` ("hit 2,000 mg omega-3 a day") and a
// separate `fuel_tags` list, and protoFuel() picks foods ONLY by fuel_tags. Those two lists had
// drifted apart on 76 targets across 38 root causes: a reader on the knee-osteoarthritis page was
// told to hit an omega-3, vitamin-C and glycine target, then shown a food list that had never been
// filtered for any of them. Seven root causes set a vitamin-D target while "vitamin-d" was not a
// fuel tag ANYWHERE in the corpus, so no food could ever surface for them however rich it was.
// Same defect class as every other one on this project: two lists that must agree, kept separately,
// with nothing checking. Now they are checked.
const FUEL_TAG_FOR = { protein_g: 'high-protein', fiber_g: 'high-fiber', omega3_mg: 'omega-3',
  vitamin_c_mg: 'vitamin-c', magnesium_mg: 'magnesium', calcium_mg: 'calcium', iron_mg: 'iron',
  zinc_mg: 'zinc', potassium_mg: 'potassium', choline_mg: 'choline', glycine_g: 'glycine',
  vitamin_d_iu: 'vitamin-d' };
// kcal/sugar_g/sodium_mg are deliberately absent: those are ceilings to stay under, not nutrients
// to go and find foods for.
(function assertFuelTargetsReachable() {
  const bad = [], noFood = [];
  const foodTags = new Set();
  try {
    const FJ = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'foods.json'), 'utf8'));
    (FJ.foods || []).forEach((f) => (f.tags || []).forEach((t) => foodTags.add(t)));
  } catch (e) { /* foods.json is checked elsewhere; do not fail this gate on its absence */ }
  (graph.problems || []).forEach((p) => (p.root_causes || []).forEach((rc) => {
    const ft = new Set(rc.fuel_tags || []);
    Object.keys(rc.nutrient_targets || {}).forEach((k) => {
      const want = FUEL_TAG_FOR[k];
      if (!want) return;
      if (!ft.has(want)) bad.push(`${p.id}/${rc.id}: targets ${k} but no "${want}" fuel tag — no food can surface for it`);
      else if (foodTags.size && !foodTags.has(want)) noFood.push(`${p.id}/${rc.id}: tag "${want}" matches no food in foods.json`);
    });
  }));
  if (bad.length || noFood.length) {
    console.error('\n[parse] FUEL-TARGET ASSERTION FAILED — refusing to build:');
    bad.slice(0, 15).forEach((m) => console.error('  \u2717 ' + m));
    noFood.slice(0, 10).forEach((m) => console.error('  \u2717 ' + m));
    const extra = (bad.length + noFood.length) - Math.min(bad.length, 15) - Math.min(noFood.length, 10);
    if (extra > 0) console.error(`  … and ${extra} more`);
    console.error('  Add the tag to that root cause\'s fuel_tags, or drop the target. A target the');
    console.error('  reader cannot act on is worse than no target.');
    process.exit(1);
  }
  const n = (graph.problems || []).reduce((a, p) => a + (p.root_causes || []).reduce((b, rc) => b + Object.keys(rc.nutrient_targets || {}).length, 0), 0);
  console.log(`[parse] fuel targets OK \u2014 ${n} nutrient targets, every one has a fuel tag that matches real foods.`);
})();

// ---- build check: no orphaned claim text --------------------------------------------------------
// Added 2026-07-31. A find/replace pass over the citation corpus left 35 trial `finding` strings
// truncated: some lost their entire opening sentence and now began mid-clause ("and increased
// correct responses during memory retrieval by 7%."), and one shipped literal nonsense — "raised
// plasma L-arginine more effectively than across the study's dosing regimens. of oral L-arginine".
// Both were LIVE on compound pages. Every one of these is a claim about a clinical trial, which is
// the last text on this site that should be broken. Nothing checked, because a truncated sentence
// is still a valid JSON string. This checks.
(function assertClaimTextIntact() {
  const bad = [];
  Object.entries(learn || {}).forEach(([slug, c]) => {
    const trials = (c && c.evi && Array.isArray(c.evi.trials)) ? c.evi.trials : [];
    trials.forEach((t, i) => {
      const f = String((t && t.finding) || '').trim();
      if (!f) return;
      // Opens mid-sentence: lower-case first letter that is not a known lower-case term
      // (mTOR, alpha-GPC, 17a-estradiol, pH...). Those legitimately start lower-case, so require
      // the token to look like a name/symbol rather than an ordinary English word.
      if (/^[a-z]/.test(f) && !/^([a-z]+[-\u2011]|[a-z]?[A-Z]|\d)/.test(f)) {
        bad.push(`${slug}.evi.trials[${i}] begins mid-sentence: "${f.slice(0, 64)}…"`);
      // A full stop immediately followed by a joining word is a spliced fragment, not a sentence.
      } else if (/\.\s+(of|than|and|with|in|for|to)\s/.test(f)) {
        bad.push(`${slug}.evi.trials[${i}] has a spliced fragment: "${f.slice(0, 80)}…"`);
      }
    });
  });
  if (bad.length) {
    console.error('\n[parse] CLAIM-TEXT ASSERTION FAILED — refusing to build:');
    bad.slice(0, 15).forEach((m) => console.error('  \u2717 ' + m));
    if (bad.length > 15) console.error(`  … and ${bad.length - 15} more`);
    console.error('  A trial finding that starts mid-sentence lost its opening to an edit. Restore it');
    console.error('  from the paper\'s own abstract — do not paper over it by lower-casing the check.');
    process.exit(1);
  }
  const n = Object.values(learn || {}).reduce((a, c) => a + (((c && c.evi && c.evi.trials) || []).length), 0);
  console.log(`[parse] claim text OK \u2014 ${n} trial findings, none truncated or spliced.`);
})();

(function assertGoalCoverage() {
  const orphans = compounds.filter((c) => !c.isNote && !(c.goalIds && c.goalIds.length)).map((c) => c.name);
  if (orphans.length) {
    console.error('\n[parse] GOAL TAXONOMY ASSERTION FAILED — refusing to build:');
    console.error(`  ✗ ${orphans.length} compound(s) reach no goal. Add each to GOAL_OVERRIDES:`);
    orphans.forEach((n) => console.error(`      '${n}': ['<goal-id>'],`));
    process.exit(1);
  }
  const total = compounds.reduce((n, c) => n + ((c.goalIds || []).length), 0);
  console.log(`[parse] goal taxonomy OK — ${total} assignments, 0 compounds without a goal.`);
})();

// ---- build check: POM mentions should carry a prescription-status string ----------------------
// Added 2026-07-28 on the recommendation of the stage-2 gate audit, which observed that three of its
// findings would have been caught mechanically by exactly this check. The failure mode it targets:
// a learn entry discusses a prescription-only medicine at length — `pathway:mtor` had 57 mentions of
// POM substances and ZERO occurrences of "prescription", "clinician" or "doctor" — so a reader meets
// rapamycin or a SERM with no signal that these need a prescriber. Crawler-visible, that is also the
// Medicines Act 1975 s.51 surface.
//
// TWO DELIBERATE DESIGN CHOICES:
// 1. WARN by default, FAIL under STRICT=1. It currently flags a large backlog, and a gate that
//    blocks every build gets deleted rather than satisfied. Ship it warning, clear the backlog, then
//    set STRICT=1 to keep it clear. (This is the pattern the plan prescribes for new assertions.)
// 2. ENDOGENOUS molecules are excluded. "Insulin" and "Testosterone" are the NAMES of prescription
//    products AND of hormones the body makes, and most mentions in a physiology course are the
//    latter — `muscle:calves` discussing insulin sensitivity does not need a prescription notice.
//    Flagging those trains the reader of this output to ignore it, which costs more than it catches.
const POM_ENDOGENOUS = /^(insulin|testosterone|estradiol|erythropoietin|epo|melatonin|thyroid|t3|t4)$/i;
(function checkPomDisclosure() {
  // SCOPE WIDENED 2026-07-28. This gate only ever read learn_expand.json — but compound_learn and
  // bio_learn are now emitted into the PRERENDERED compound pages, and target_learn is next. A gate
  // that covers one of four crawlable corpora is a gate over an arbitrary quarter of the risk.
  // Prefix each key so a failure names the file it lives in.
  const learnExpand = {};
  // Only the corpora that render as a STANDALONE PAGE are checked here. compound_learn and
  // bio_learn are emitted INTO the compound page, which discloses status in its own badge and in
  // the restricted bio path — so checking those blobs in isolation produced 66 findings of which
  // 65 were already disclosed on the page the reader actually sees. Those are checked against the
  // rendered HTML in prerender.js instead. Check the artefact the reader gets, not the fragment.
  {
    const src = readJSON(path.join(DATA_DIR, 'learn_expand.json')) || {};
    for (const k of Object.keys(src)) {
      if (src[k] && typeof src[k] === 'object') learnExpand[`course:${k}`] = src[k];
    }
  }
  // Targets are checked as MERGED objects, not as raw sidecar entries, because the automatic
  // prescription notice is attached during the merge. Checking the sidecar would report a defect
  // that the page the reader receives does not have — and a gate that cries wolf gets switched off.
  for (const t of targets) learnExpand[`target:${t.sym}`] = t;
  // Match on TOKENS, not whole product names. The first version took only the leading name, so the
  // list held things like "Quercetin + Dasatinib" and "Enclomiphene" — and an entry that plainly
  // said "dasatinib" or "clomiphene" sailed through, because neither literal string appears in the
  // list. I found that by trying to make the gate fail and watching it pass. Splitting each product
  // name into its constituent drug tokens closes it.
  const pomFinal = pomTokens().map((p) => p.token);
  const STATUS = /prescription|prescriber|prescribing|clinician|\bdoctor\b|medical supervision|POM\b|pharmacist/i;
  const problems = [];
  for (const key of Object.keys(learnExpand)) {
    const blob = JSON.stringify(learnExpand[key]);
    const named = pomFinal.filter((n) => new RegExp('\\b' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(blob));
    if (named.length && !STATUS.test(blob)) {
      problems.push(`${key}: names ${named.length} prescription/controlled substance(s) (${named.slice(0, 4).join(', ')}) but never states prescription status`);
    }
  }
  // FLIPPED TO FAIL-BY-DEFAULT 2026-07-28, once the backlog reached zero. It shipped in warn mode
  // (the plan's pattern for a new assertion), the 7 offending entries were fixed, and now it holds
  // the line: a new learn entry that names a prescription or controlled substance without saying so
  // cannot reach production. Escape hatch is POM_WARN_ONLY=1, which should basically never be used.
  const STRICT = process.env.POM_WARN_ONLY !== '1';
  if (problems.length) {
    console[STRICT ? 'error' : 'warn'](`\n[parse] POM DISCLOSURE — ${problems.length} learn entr${problems.length === 1 ? 'y' : 'ies'} name a prescription/controlled substance without stating its status:`);
    problems.slice(0, 12).forEach((m) => console[STRICT ? 'error' : 'warn']('  ' + (STRICT ? '\u2717' : '\u26a0') + ' ' + m));
    if (problems.length > 12) console[STRICT ? 'error' : 'warn'](`  … and ${problems.length - 12} more`);
    if (STRICT) { console.error('  Refusing to build. Add a sentence naming the prescription status, or set POM_WARN_ONLY=1 if you truly must ship without it.'); process.exit(1); }
    console.warn('  Not blocking the build. Fix these, then set STRICT=1 to keep it clear.');
  } else {
    console.log('[parse] POM disclosure OK — every learn entry naming a prescription/controlled substance states its status.');
  }
})();

// ---------- ANALYTICS VOCABULARY GATE (W1) ----------
// docs/EVENT_SCHEMA.md is the spec; site/app.js is the implementation. This refuses to build if
// they disagree. Check (a) is the one that matters: it is what makes "a compound name can never be
// sent to a third party" a property of the build rather than a sentence in a document. The runtime
// already fails shut on an unknown suffix (RNA_A.ev checks membership of a closed array), so this
// gate polices the two things the runtime cannot see: an undocumented event, and a call site that
// passes a variable instead of a literal.
//
// PROVE IT by reintroducing the bug: change one call site to RNA_A.ev(name, c.name) and re-run
// `node build/parse.js`. It must exit 1 on check (a). A gate that has never failed is unproven.
(function assertAnalyticsVocabulary() {
  const appPath = path.join(ROOT, 'site', 'app.js');
  const src = fs.readFileSync(appPath, 'utf8');
  if (src.indexOf('RNA_A') < 0) { console.log('[parse] analytics gate: no analytics in site/app.js — nothing to check.'); return; }
  const fail = [];
  // (a) every RNA_A.ev() first argument must be a single-quoted string literal
  const nonLiteral = src.match(/RNA_A\.ev\(\s*(?!')/g);
  if (nonLiteral) fail.push(`${nonLiteral.length} RNA_A.ev() call(s) pass a non-literal event name — the event vocabulary must be readable from the source, not computed at runtime`);
  // (b) every event name used must be a key of A_EVENTS
  const block = (src.match(/const A_EVENTS = \{[\s\S]*?\n  \};/) || [''])[0];
  const declared = new Set((block.match(/'([a-z-]+)':/g) || []).map((s) => s.slice(1, -2)));
  if (!declared.size) fail.push('could not parse the A_EVENTS vocabulary out of site/app.js — the gate cannot verify anything');
  const used = new Set((src.match(/RNA_A\.ev\('([a-z-]+)'/g) || []).map((s) => s.slice(10, -1)));
  used.forEach((n) => { if (!declared.has(n)) fail.push(`site/app.js emits event '${n}', which is not a key of A_EVENTS — it would be silently dropped at runtime`); });
  // (c) every declared event must be documented
  const docPath = path.join(ROOT, 'docs', 'EVENT_SCHEMA.md');
  if (!fs.existsSync(docPath)) fail.push('site/app.js emits analytics but docs/EVENT_SCHEMA.md does not exist');
  else {
    const doc = fs.readFileSync(docPath, 'utf8');
    declared.forEach((n) => { if (doc.indexOf('e/' + n + '/') < 0) fail.push(`event '${n}' is in A_EVENTS but is not documented in docs/EVENT_SCHEMA.md`); });
  }
  // (d) exactly one outbound analytics endpoint in the whole file
  const eps = (src.match(/goatcounter\.com/g) || []).length;
  if (eps !== 1) fail.push(`expected exactly 1 analytics endpoint in site/app.js, found ${eps} — a second sender would not be covered by the vocabulary checks above`);
  // (e) GA4: exactly one collect endpoint, and NEVER the tag-manager script.
  //     MEASURED 2026-08-06 by fetching the container Google serves for this measurement id
  //     (HTTP 200, 497,740 B decoded, the id appearing 19 times): every enhanced-measurement tag is
  //     switched ON in its inline config — site search reading "q,s,search,query,keyword" (this
  //     site's own hero generates /solve?q=<the reader's words>), page_view on history events (it
  //     re-reads location.href on every pushState), outbound click with includeParams (the PMID),
  //     scroll, autoEmailEnabled and isAutoCollectPiiEnabledFlag. None of it can be disabled from
  //     code — it is data-stream configuration. Loading that script would also send document.title
  //     and document.referrer and set the _ga cookie. So the script must never appear in this file.
  const gaEps = (src.match(/google-analytics\.com/g) || []).length;
  if (gaEps !== 1) fail.push(`expected exactly 1 GA4 collect endpoint in site/app.js, found ${gaEps} — a second sender would not be covered by the vocabulary checks above`);
  const tagMgr = (src.match(/googletagmanager\.com/g) || []).length;
  if (tagMgr) fail.push(`site/app.js references googletagmanager.com ${tagMgr} time(s). gtag.js must never be loaded on this site: its enhanced-measurement tags read location.href on every pushState, read the "q" query parameter the /solve hero itself generates, send document.title and document.referrer, and set the _ga cookie — none of which can be turned off from code. Send GA4 hits through aGA() instead. See docs/EVENT_SCHEMA.md §1a.`);
  // (f) the measurement id lives in exactly one config value, and blank switches it off
  const gaDecl = src.match(/const A_GA4 = ('[^']*'|null);/g) || [];
  if (gaDecl.length !== 1) fail.push(`expected exactly 1 \`const A_GA4 = …;\` declaration in site/app.js, found ${gaDecl.length} — the measurement id must live in exactly one place that is off when blank`);
  else {
    const gaVal = gaDecl[0].replace(/^const A_GA4 = /, '').replace(/;$/, '').replace(/'/g, '');
    if (gaVal && gaVal !== 'null' && !/^G-[A-Z0-9]{4,12}$/.test(gaVal)) fail.push(`A_GA4 is "${gaVal}", which is neither blank nor a GA4 measurement id (G-XXXXXXXXXX). A typo here collects nothing, silently — the exact failure this project has already shipped once.`);
  }
  if (fail.length) {
    console.error('\n[parse] ANALYTICS VOCABULARY GATE FAILED — refusing to build:');
    fail.forEach((m) => console.error('  ✗ ' + m));
    console.error('  Read docs/EVENT_SCHEMA.md. Do not widen the vocabulary to silence this.');
    process.exit(1);
  }
  console.log(`[parse] analytics vocabulary OK — ${declared.size} declared events, ${used.size} emitted, all documented, 1 GoatCounter endpoint, 1 GA4 collect endpoint, 0 gtag.js references.`);
})();

// ---------- SHARED: BLANK THE COMMENTS, KEEP THE COPY (W3.5, 2026-08-02) ----------
// The copy gates below read the renderers and must not fire on engineering notes. The first
// version of that stripper was `src.replace(/\/\*[\s\S]*?\*\//g, …)`, which is wrong on this
// codebase: a `/*` inside a string or a regex opens a comment that runs to the next `*/`, and the
// blanked region can be hundreds of lines of live copy. MEASURED: it blanks 2,192 of app.js's
// 7,092 non-empty lines (31%) and 534 of prerender.js's 2,975. The hole is not theoretical — it is
// exactly why the no-credential gate below failed its own proof-by-reintroduction on the first run:
// site/app.js:6583, the "⚠ Expert review needed" badge, sits inside a blanked region, so restoring
// the original bug produced a green build. A gate that cannot see a third of the file it guards is
// not a gate.
// (Re-measured against the single-voice gate: 0 of its violations were hidden there today, so this
// closes an unproven blind spot rather than an active miss. Both gates now use this.)
function blankComments(src) {
  const out = src.split('');
  const n = src.length;
  const stack = [];          // template-literal nesting: '`' = inside a template, '{' = inside ${}
  let i = 0, inS = null;     // inS = the quote char of the ordinary string we are inside
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (inS) {
      if (c === '\\') { i += 2; continue; }
      if (c === inS || c === '\n') inS = null;
      i++; continue;
    }
    if (stack.length && stack[stack.length - 1] === '`') {
      if (c === '\\') { i += 2; continue; }
      if (c === '`') { stack.pop(); i++; continue; }
      if (c === '$' && d === '{') { stack.push('{'); i += 2; continue; }
      i++; continue;
    }
    if (c === '/' && d === '/') { while (i < n && src[i] !== '\n') { out[i] = ' '; i++; } continue; }
    if (c === '/' && d === '*') {
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] !== '\n') out[i] = ' '; i++; }
      if (i < n) { out[i] = ' '; out[i + 1] = ' '; i += 2; }
      continue;
    }
    if (c === "'" || c === '"') { inS = c; i++; continue; }
    if (c === '`') { stack.push('`'); i++; continue; }
    if (c === '{' && stack.length) { stack.push('{'); i++; continue; }
    if (c === '}' && stack.length && stack[stack.length - 1] === '{') { stack.pop(); i++; continue; }
    i++;
  }
  return out.join('');
}

// ---------- SINGLE-VOICE GATE (W2.5, 2026-08-01) ----------
// @compoundingzero is one person. There is no company, no editorial board and no clinical service,
// so the site must never write as though there were. Measured across the three files that generate
// reader-facing copy, before this gate: 30 first-person-plural constructions in shipped strings —
// site/app.js 16, build/prerender.js 10 (verdict + 5 methodology/legend items + the home hero),
// server.js 4. The worst was the feedback modal, which said a plan item "goes straight to the
// team"; the most-read was the home hero's "Name the problem — we'll show you the root cause",
// the first sentence a reader meets, in the document ~90% of readers get.
//
// SCOPE, deliberately narrow: this reads the RENDERERS, not the corpus. data/*.json is authored
// prose and some of it legitimately says "we" inside a quoted or clinical sentence; a gate over the
// built HTML would fire on those and get switched off. Comments are stripped for the same reason —
// this file, app.js and prerender.js are full of "we" in engineering notes, which no reader sees.
//
// PROVE IT by putting one of the originals back, e.g. change the /compare index line in
// build/prerender.js to "We do not publish a" and re-run `node build/parse.js`. It must exit 1.
(function assertSingleVoice() {
  // build/interest.js added 2026-08-08: it is the fourth file that generates reader-facing copy
  // (all of /interest), and a gate that does not read the newest renderer has stopped covering the
  // newest copy.
  const FILES = ['site/app.js', 'build/prerender.js', 'server.js', 'build/interest.js'];
  // "us" is matched lower-case only, so "US dollars" and "US$" survive; 'We' with no following
  // lower-case word survives too, which is what keeps the ['Su','Mo','Tu','We'] day labels legal.
  const PATTERNS = [
    [/[Ww]e(&rsquo;|&#39;|['’])(ll|ve|re|d)\b/, "we'll / we've / we're / we'd"],
    [/(^|[^A-Za-z])[Ww]e\s+[a-z]/, 'we + verb'],
    [/(^|[^A-Za-z])[Oo]urs?(?![A-Za-z])/, 'our / ours'],
    [/(^|[^A-Za-z])us(?![A-Za-z])/, 'us'],
  ];
  const bad = [];
  FILES.forEach((rel) => {
    const src = blankComments(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
    src.split('\n').forEach((raw, i) => {
      const t = raw.trim();
      if (t.startsWith('//') || t.startsWith('*')) return;          // engineering notes, not copy
      PATTERNS.forEach(([re, label]) => {
        const m = raw.match(re);
        if (m) bad.push(`${rel}:${i + 1} — ${label} — …${raw.slice(Math.max(0, m.index - 50), m.index + 70).trim()}…`);
      });
    });
  });
  if (bad.length) {
    console.error('\n[parse] SINGLE-VOICE GATE FAILED — refusing to build. This site is one person, not an organisation:');
    bad.forEach((b) => console.error('  ✗ ' + b));
    console.error('  Rewrite it as "I"/"me"/"my", or drop the actor entirely ("the page says so").');
    console.error('  If a genuine quotation needs "we", put it in data/, not in a renderer.');
    process.exit(1);
  }
  console.log('[parse] single voice OK — %d renderer files, 0 first-person-plural constructions in reader-facing copy.', FILES.length);
})();

// ---------- NO-CREDENTIAL GATE (W3.5, 2026-08-02) ----------
// There is no verified expert on this project, no programme that verifies anyone, and no clinician
// has reviewed this content. /corrections publishes that in as many words. The site must therefore
// never assert a review, a verification, a credential or a professional's involvement — the risk
// Felix names as the largest reputational exposure the project carries.
//
// This is a recurring defect, not a one-off. Before this gate, over the same three renderer files
// the single-voice gate reads, a scan found 14 assertions, of which 9 were live claims and 5 were
// the honest disclosures. The 9:
//   site/app.js  "⚠ Expert review needed" — a badge in the DOM of all 52 /protocol routes, revealed
//                by four reader votes with under half positive. Nobody had to approve the claim.
//                "A clean expert answer:" / "Compare with the expert answer" — this site's own copy,
//                on the five templates that render the self-test (~307 routes).
//                "A verified expert edits a section directly" and "A second relevant expert reviews
//                and approves it" — admin queues for a programme with no members.
//   server.js    five 403 bodies ("Only verified experts can …", "Verified dietitians only" x2) and,
//                worst, the /u/<username> <meta> + JSON-LD Person description, which appended
//                " (verified expert)" from a database boolean no verification process sets — a
//                credential asserted to a crawler.
// Every one of those was a string somebody typed once and nobody re-read. That is what a gate is for.
//
// SCOPE, deliberately the same as the single-voice gate: the three files that generate reader-facing
// copy, comments stripped. data/*.json is authored prose where "reviewed by a clinician" can appear
// legitimately inside a quoted sentence, and a gate that fires on those gets switched off.
//
// A NEGATION IN FRONT OF A CLAIM IS A DISCLOSURE, not a claim — "Not yet reviewed by a clinician" is
// exactly the sentence the site must keep saying. Same guard shape as the protocol-safety gate.
//
// ALLOWED DISCLOSURES are pinned by exact text, and pinned IN BOTH DIRECTIONS: each must appear
// exactly once, so the /corrections entry that publishes the fake-credential history cannot be
// quietly deleted either. A corrections log that loses its worst entry is not a corrections log.
//
// PROVE IT by putting one of the originals back — e.g. restore
// `<span class="vote-badge" hidden>⚠ Expert review needed</span>` in site/app.js — and re-run
// `node build/parse.js`. It must exit 1 naming that file, line and phrase.
(function assertNoCredentialClaims() {
  // build/interest.js added 2026-08-08: it is the fourth file that generates reader-facing copy
  // (all of /interest), and a gate that does not read the newest renderer has stopped covering the
  // newest copy.
  const FILES = ['site/app.js', 'build/prerender.js', 'server.js', 'build/interest.js'];
  const CLAIMS = [
    // 2026-08-08 — WIDENED. This pattern required the professional noun to be the VERY NEXT WORD,
    // so server.js's live 403 body — "Compound pages are maintained by verified pharmacology
    // experts (pharmacist / MD / biomedical researcher). Apply for that role in your Pro
    // dashboard." — walked straight through the gate for months on the strength of one intervening
    // word, and reached any signed-in account that clicked Edit on a compound page. A gate a
    // single adjective defeats is worse than no gate, because it certifies the defect as absent.
    // Up to two words may now sit between "verified" and the noun, and the nouns are pluralised.
    // PROVE IT by pasting that exact 403 body back into server.js and running
    // `node build/parse.js`: it must exit 1 naming the file, the line and 'verified <professional>'.
    [/verified\s+(?:[\w-]+\s+){0,2}(experts?|clinicians?|doctors?|physicians?|pharmacists?|dietit|physios?|physiotherapists?|nutritionists?|professionals?|reviewers?)/i, 'verified <professional>'],
    [/(expert|clinical|clinician|medical|professional|specialist|physician)[- ]review/i, '<professional> review'],
    [/peer[- ]review/i, 'peer review'],
    [/(medically|clinically|professionally|expert)[- ]?(reviewed|checked|verified|approved|vetted)/i, 'medically / clinically reviewed'],
    [/(reviewed|checked|vetted|verified|approved|written|authored|edited)\s+by\s+(a|an|our|the)?\s*(licensed\s+|registered\s+|board[- ]certified\s+|qualified\s+)?(clinician|doctor|physician|pharmacist|dietitian|physiotherapist|expert|professional|specialist|nurse)/i, '<verb> by a <professional>'],
    [/board[- ]certified/i, 'board-certified'],
    [/(fact|evidence)[- ]checked\s+by/i, 'fact-checked by'],
    [/(the|our|a)\s+(editorial|clinical|medical|review)\s+(board|team|panel|committee)/i, 'editorial / clinical board'],
    [/expert\s+(answer|panel|consensus|opinion|verdict|approved)/i, 'expert answer / panel / consensus'],
    [/(a|an|our|the)\s+(expert|clinician|pharmacist|dietitian|physiotherapist)\s+(reviews?|approves?|checks?|signs? off|verifies|stewards?|has reviewed|will review)/i, 'a <professional> reviews'],
  ];
  const NEG = /(^|[^a-z])(not|never|no|none|nobody|without|nor|n['’]t)([^a-z][^.;:!?]{0,40})?$/i;
  // Each entry: the exact text that may carry a banned phrase, and why it is honest.
  const ALLOW = [
    ['ever claims a professional reviewer', '/methodology — states that no page claims one'],
    ['attributed to a <em>"verified physiotherapist"</em>', '/corrections — the fabricated credential, published'],
    ['The site said verified clinicians stewarded protocols', '/corrections — the wording that was removed'],
    ['that a verified dietitian checked corrections to food data', '/corrections — the wording that was removed'],
    ['and that a verified expert would build a', '/corrections — the wording that was removed'],
  ];
  const bad = [];
  const allowSeen = ALLOW.map(() => 0);
  FILES.forEach((rel) => {
    const src = blankComments(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
    src.split('\n').forEach((raw, i) => {
      const t = raw.trim();
      if (t.startsWith('//') || t.startsWith('*')) return;            // engineering notes, not copy
      ALLOW.forEach((a, k) => { if (raw.indexOf(a[0]) >= 0) allowSeen[k]++; });
      const allowed = ALLOW.some((a) => raw.indexOf(a[0]) >= 0);
      if (allowed) return;
      CLAIMS.forEach(([re, label]) => {
        const g = new RegExp(re.source, 'gi');
        let m;
        while ((m = g.exec(raw))) {
          if (NEG.test(raw.slice(Math.max(0, m.index - 60), m.index))) continue;  // a disclosure
          bad.push(`${rel}:${i + 1} — ${label} — …${raw.slice(Math.max(0, m.index - 70), m.index + 90).trim()}…`);
        }
      });
    });
  });
  ALLOW.forEach((a, k) => {
    if (allowSeen[k] === 1) return;
    bad.push(allowSeen[k] === 0
      ? `the allowed disclosure "${a[0]}" (${a[1]}) is gone — the record of a false credential may not be deleted; if the page was rewritten, update this list deliberately`
      : `the allowed disclosure "${a[0]}" (${a[1]}) now appears ${allowSeen[k]} times — an allowance that covers more than the one sentence it was written for is not an allowance`);
  });
  if (bad.length) {
    console.error('\n[parse] NO-CREDENTIAL GATE FAILED — refusing to build. Nobody has reviewed this content:');
    bad.forEach((b) => console.error('  ✗ ' + b));
    console.error('  There is no verified expert here and no programme that verifies anyone (see /corrections).');
    console.error('  State what was actually done — "written with AI assistance and edited by a human",');
    console.error('  "not yet reviewed by a clinician" — or drop the actor. Never assert a credential to');
    console.error('  keep a sentence sounding authoritative. A lower honest claim beats a higher false one.');
    process.exit(1);
  }
  console.log('[parse] no-credential gate OK — %d renderer files, 0 unclaimed credentials, %d pinned disclosures intact.', FILES.length, ALLOW.length);
})();

// ---------- ONE-ACCOUNT-TYPE GATE (2026-08-08) ----------
// RNAwiki has ONE kind of account. Everyone reads, everyone creates, and the only distinction the
// site recognises is "is this the owner's own control room" (users.role, elevated in memory only).
//
// This gate exists because the previous deletion did not hold. In July the verified-expert system
// was "removed"; what was actually removed was its front end. On 2026-08-08 the following were all
// still live and reachable by curl: POST /api/profile/domain (apply to become an expert),
// POST /api/admin/verify-domain (grant the badge), GET /api/contributors (publish a self-declared
// credential to anyone, no auth), three /api/steward endpoints, POST /api/clinician-interest
// (accept a licence number and a photograph of a credential document, no account), a Control Room
// table with Approve / Reject / Revoke, a second invisible copy of that same table, a
// crawlable Person JSON-LD advertising "Stewarded protocols … and professional links", and
// addBadge(user, 'verified-expert') writing that literal string into users.badges.
// Every one of those had ZERO client call sites. Being unreachable is not the same as being gone,
// and this project has now proved that twice.
//
// SCOPE: server.js and site/app.js — what an account IS and what it may do is decided in those two
// files. db.js is deliberately NOT scanned: the tier COLUMNS survive there on purpose for one
// release (dropping a column is irreversible), with a tombstone comment saying so.
// Comments are blanked first, so the tombstones above may name what they buried.
//
// PROVE IT by putting any one of them back — e.g. paste
// `const DOMAIN_LAYER = { physio: 'move' };` into site/app.js — and run `node build/parse.js`.
// It must exit 1 naming the file, the line and the thing.
(function assertOneAccountType() {
  const FILES = ['server.js', 'site/app.js'];
  const BANNED = [
    [/domain_verified/i, 'users.domain_verified — the professional-tier flag. Nothing may read it and nothing may grant it.'],
    [/requested_domain|application_status|role_backlink/i, 'the expert-application columns. There is no application, because there is no second tier to apply for.'],
    [/addBadge\s*\(/, "addBadge() — the badge-granting helper. Its only callers granted 'verified-expert'. A badge may only assert something this site can itself observe (\"logged 30 days\"), never what a person IS."],
    [/['"`]verified-expert['"`]/, "the 'verified-expert' badge string"],
    [/verify-domain/, 'the /api/admin/verify-domain grant endpoint — the only thing that ever set domain_verified = true'],
    [/profile\/domain/, 'the POST /api/profile/domain "apply for an expert role" endpoint'],
    [/clinician-interest/, 'the POST /api/clinician-interest licence-number + credential-photograph intake. (Reading the clinician_interest TABLE is still allowed — that is the archive of what was already collected.)'],
    [/\/api\/steward|seg\[0\]\s*===\s*['"]steward['"]/, 'the adopt-a-protocol stewardship endpoints. A protocol belongs to no one.'],
    [/DOMAIN_LAYER|DOMAIN_LABEL|LAYER_DOMAIN/, 'a profession -> permission lookup table. This is a second account type in seed form.'],
    [/\bu\.domain\b|\bME\.domain\b/, 'the account-level `domain` (profession) field. GRAPH.domains — which discipline addresses a root cause — is corpus content and is fine; an account carrying one is not.'],
  ];
  const bad = [];
  FILES.forEach((rel) => {
    blankComments(fs.readFileSync(path.join(ROOT, rel), 'utf8')).split('\n').forEach((raw, i) => {
      BANNED.forEach(([re, why]) => { if (re.test(raw)) bad.push(`${rel}:${i + 1} — ${why}\n      …${raw.trim().slice(0, 110)}…`); });
    });
  });
  if (bad.length) {
    console.error('\n[parse] ONE-ACCOUNT-TYPE GATE FAILED — refusing to build. This site has one kind of account:');
    bad.forEach((b) => console.error('  ✗ ' + b));
    console.error('  There are no verified professionals here, no programme that verifies anyone, and no tier');
    console.error('  to promote an account into (see /corrections). If you are adding a permission and reaching');
    console.error('  for one of these, you are adding a second account type. Use users.role, which means');
    console.error('  "the owner" and nothing else, or do not gate it at all.');
    process.exit(1);
  }
  console.log('[parse] one-account-type gate OK — %d files, 0 professional-tier surfaces (%d banned patterns).', FILES.length, BANNED.length);
})();

// ---------- HANDLE-FROM-CONFIG GATE (W4, 2026-08-02) ----------
// The owner's X handle lives in data/site_config.json and nowhere else. Before this gate it was
// typed into build/prerender.js:494 — the Organization JSON-LD `sameAs`, which is emitted into
// EVERY prerendered page — and a personal username sat in the sign-in modal placeholder
// ("e.g. hyrox_felix", measured hydrated at 390x844 by opening the modal on /). This wave adds
// three more surfaces that print it, so an ungated handle would now be seven strings in three
// files and renaming the account would silently break some of them.
//
// SCOPE is the same three renderer files the single-voice and no-credential gates read, comments
// stripped for the same reason: this file and app.js discuss the handle in engineering notes that
// no reader ever sees. data/*.json is exempt because that is where the handle is SUPPOSED to be.
//
// It also refuses a bare "@something" placeholder in an <input>, which is how the founder's own
// username got into the sign-in modal in the first place: an example is a real person's name
// unless somebody checks, and nobody checks a placeholder.
//
// PROVE IT by putting the original back — restore
// `sameAs: ['https://twitter.com/Compoundingzero', …]` in build/prerender.js, or
// `placeholder="e.g. hyrox_felix"` in site/app.js — and re-run `node build/parse.js`. It must
// exit 1 naming the file and line.
(function assertHandleFromConfig() {
  // build/interest.js added 2026-08-08: it is the fourth file that generates reader-facing copy
  // (all of /interest), and a gate that does not read the newest renderer has stopped covering the
  // newest copy.
  const FILES = ['site/app.js', 'build/prerender.js', 'server.js', 'build/interest.js'];
  const handle = data.site.x.handle;
  const bad = [];
  // Usernames that belong to a real person and must never be shipped as an example. Felix's own
  // handles are here by name because they are the ones that actually shipped.
  const PERSONAL = [/hyrox[_-]?felix/i, /\bfelix\b/i, new RegExp('\\b' + handle + '\\b', 'i')];
  FILES.forEach((rel) => {
    const src = blankComments(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
    src.split('\n').forEach((raw, i) => {
      const t = raw.trim();
      if (t.startsWith('//') || t.startsWith('*')) return;
      if (new RegExp(handle, 'i').test(raw)) {
        bad.push(`${rel}:${i + 1} — the handle "${handle}" is written into a renderer. It belongs in data/site_config.json and is read from D.site.x.handle (app.js) / D.site.x (prerender.js). …${raw.trim().slice(0, 90)}…`);
      }
      // a placeholder that hands out somebody's username as the example
      const ph = raw.match(/placeholder="([^"]*)"/g) || [];
      ph.forEach((p) => {
        const v = p.slice(13, -1);
        if (PERSONAL.some((re) => re.test(v))) bad.push(`${rel}:${i + 1} — placeholder ${JSON.stringify(v)} hands out a real person's username as the example. Describe the shape of the field instead.`);
      });
    });
  });
  if (bad.length) {
    console.error('\n[parse] HANDLE GATE FAILED — refusing to build. One owner, one place to write the name down:');
    bad.forEach((b) => console.error('  ✗ ' + b));
    process.exit(1);
  }
  console.log('[parse] handle gate OK — @%s appears in data/site_config.json only, 0 copies across %d renderer files.', handle, FILES.length);
})();
