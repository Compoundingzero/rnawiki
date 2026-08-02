(function () {
  const D = window.RNAWIKI_DATA;
  const SITE_NAME = 'RNAwiki'; // brand name; domain configured via SITE_URL env at build (prerender)
  // W4 (2026-08-02): the owner's X handle, read from data/site_config.json via build/parse.js.
  // NEVER type it here — assertHandleFromConfig() fails the build on any copy of it in this file,
  // build/prerender.js or server.js. The fallback is empty on purpose: a missing config must make
  // the X surfaces disappear, not print "@undefined" or somebody else's name.
  const OWNER = (D.site && D.site.x) ? D.site.x : { handle: '', profile: '' };
  const AT = OWNER.handle ? '@' + OWNER.handle : '';
  const app = document.getElementById('app');

  // One-time migration of a visitor's own browser-local data from the old pbswiki_* key
  // names to rnawiki_* — so the rebrand loses nobody's saved stack, fuel log, or votes.
  (function migrateLocalKeys() {
    try {
      const map = { pbswiki_stack: 'rnawiki_stack', pbswiki_fuel_log: 'rnawiki_fuel_log', pbswiki_voter: 'rnawiki_voter', pbswiki_myvotes: 'rnawiki_myvotes' };
      for (const oldK in map) { const newK = map[oldK], v = localStorage.getItem(oldK); if (v != null && localStorage.getItem(newK) == null) localStorage.setItem(newK, v); }
    } catch (e) {}
  })();

  const APPROVAL_CLASS = { '🟢': 'g', '🟡': 'y', '🔵': 'b', '🟠': 'o', '🔴': 'r', '⚫': 'k' };
  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const byId = {}; D.compounds.forEach(c => byId[c.id] = c);
  const bySlug = {}; D.compounds.forEach(c => bySlug[slug(c.name)] = c);
  // Resolve a loose compound reference (e.g. "Omega-3") to a real compound, tolerating short/partial names.
  //
  // FIXED 2026-07-28. This used to OR four clauses inside a single D.compounds.find(), so the
  // FIRST compound in array order matching ANY clause won -- the weakest clause (bare substring
  // containment) beat an exact match that appeared later in the array. Live consequences:
  //   "Vitamin C"      -> Collagen Peptides (+ Vitamin C)   instead of Vitamin C (Ascorbate)
  //   "Calcium"        -> Ca-AKG (a longevity compound)     instead of Calcium (+ D3 + K2)
  //   "Zinc-Carnosine" -> Zinc                              instead of Zinc-Carnosine ...
  // i.e. a calcium recommendation for bone health linked to a longevity compound, on every
  // JS-executing page. The prerendered document was already correct -- prerender.js:findCpt is a
  // different, ordered resolver. Running the same four clauses as four ORDERED PASSES makes an
  // exact match unbeatable, and only falls through to containment when nothing better exists.
  // PASS 5 LINKED THE WRONG MOLECULE (fixed 2026-08-01). The last-resort pass flattened both slugs
  // (dropped every hyphen) and asked for a bare substring, so a ref could match a fragment INSIDE a
  // longer chemical word. Measured hydrated at 390x844 on /protocol/gut-health/dysbiosis: the plan
  // item "Daily fermented foods (yoghurt, kefir, kimchi) … oral butyrate is an optional adjunct"
  // (ref "Butyrate") linked to #/c/hmb-hydroxy-methylbutyrate — because "hmbhydroxymethylbutyrate"
  // contains "butyrate". HMB is a leucine metabolite for muscle; butyrate is a short-chain fatty
  // acid the gut makes from fibre. Different molecules, and the site has a page whose own name
  // carries the word: "Prebiotics (Inulin, GOS, PHGG) & Butyrate". The prerendered document got
  // this right by accident — prerender.js:findCpt has no substring pass, so it rendered the item as
  // plain text — which is why the two documents disagreed on exactly this item.
  // The replacement asks for WHOLE NAME WORDS in order, not letters: the ref's tokens must appear
  // as a contiguous run of complete tokens in the compound's name. "butyrate" is not a token of
  // [hmb, hydroxy, methylbutyrate], so HMB can no longer be reached; it IS a token of
  // [prebiotics, inulin, gos, phgg, butyrate], which is the page the item is about. And an
  // ambiguous run (2+ compounds) resolves to NOTHING rather than to whichever compound happens to
  // sit earliest in the array — the same array-order bug the 2026-07-28 fix above removed.
  // MEASURED over all 544 compound references in the corpus (180 distinct): exactly one resolution
  // changes, the one above. Pass 5 is the only pass that fires for just 2 refs — "B12", which is a
  // whole token of "B-Complex / B12 / Methylfolate / B6" and still resolves, and "Butyrate".
  function resolveCompound(ref) {
    if (!ref) return null; const s = slug(ref); if (!s) return null;
    if (bySlug[s]) return bySlug[s];                                     // pass 1: exact slug
    const hit = D.compounds.find(c => slug(c.name) === s)                // pass 2: exact name
      || D.compounds.find(c => slug(c.name).startsWith(s + '-'))         // pass 3: ref is a prefix
      || D.compounds.find(c => s.startsWith(slug(c.name) + '-'));        // pass 4: name is a prefix
    if (hit) return hit;
    const want = s.split('-');                                           // pass 5: whole-word run
    const runIn = hay => {
      for (let i = 0; i + want.length <= hay.length; i++) {
        let ok = true;
        for (let j = 0; j < want.length; j++) if (hay[i + j] !== want[j]) { ok = false; break; }
        if (ok) return true;
      }
      return false;
    };
    const hits = D.compounds.filter(c => runIn(slug(c.name).split('-')));
    return hits.length === 1 ? hits[0] : null;                           // ambiguous → link nothing
  }
  // Anatomy & physiology reference layer (muscles, energy systems, metabolism)
  const ANAT = D.anatomy || { muscles: [], energy_systems: [], metabolism: [] };
  const muscleById = {}; (ANAT.muscles || []).forEach(m => muscleById[m.id] = m);
  // Granular sub-muscles (structures.json) indexed by their parent group id — powers the
  // "individual muscles in this group" section on /muscle pages and the 3D body-map lookup.
  const structuresByGroup = {}; (D.structures || []).forEach(s => { (structuresByGroup[s.groupId] = structuresByGroup[s.groupId] || []).push(s); });
  // exercise-DB muscle strings (e.g. "middle back") → muscle, so exercise cards can link
  const muscleByName = {}; (ANAT.muscles || []).forEach(m => muscleByName[m.db_name || m.id] = m);
  const energyById = {}; (ANAT.energy_systems || []).forEach(e => energyById[e.id] = e);
  const physioById = {}; (ANAT.metabolism || []).forEach(p => physioById[p.id] = p);
  const goalById = {}; D.goals.forEach(g => goalById[g.id] = g);
  const goalByLabel = {}; D.goals.forEach(g => goalByLabel[g.label.toLowerCase()] = g);
  const cptByName = {}; D.compounds.forEach(c => cptByName[c.name.toLowerCase()] = c);
  function findCpt(label) {
    const l = label.toLowerCase().trim();
    if (cptByName[l]) return cptByName[l];
    for (const c of D.compounds) { const n = c.name.toLowerCase(); if (n.startsWith(l + ' ') || n.startsWith(l + ' (') || (l.length > 4 && n.startsWith(l))) return c; }
    return null;
  }
  const tkey = s => s.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
  const targetBySym = {}; (D.targets || []).forEach(t => targetBySym[tkey(t.sym)] = t);
  const compoundsByPathway = {}; D.pathways.forEach((p, i) => compoundsByPathway[i] = []);
  D.compounds.forEach(c => (c.pathwayIds || []).forEach(i => compoundsByPathway[i].push(c)));

  // ---- reverse links between the protocol engine and the wiki ----
  function protocolsForGoal(goalId) {
    return (D.graph.problems || []).filter(p => p.root_causes.some(rc => (rc.goal_ids || []).includes(goalId)));
  }
  function protocolsForCompound(c) {
    const out = [], seen = new Set();
    (D.graph.problems || []).forEach(p => p.root_causes.forEach(rc => {
      if (seen.has(p.id)) return;
      if ((rc.compounds || []).some(n => { const m = findCpt(n); return m && m.id === c.id; })) { out.push({ p, rc }); seen.add(p.id); }
    }));
    return out;
  }
  function protoLink(p, rc) {
    rc = rc || p.root_causes[0];
    return `<a class="solve-card" data-kind="${p.kind}" href="#/protocol/${p.id}/${rc.id}">
      <span class="s-ico">${p.icon || '•'}</span>
      <span class="s-body"><b>${esc(p.name)}</b><small>${esc(p.category)} · ${p.kind === 'want' ? 'goal' : 'problem'}</small></span></a>`;
  }

  // ---------- stack (localStorage + URL share) ----------
  // ---------- Unified plan object (the spine: the web tracker and sharing both read this) ----------
  // v2 shape — ONE plan holds every protocol the user runs, merged into one daily experience:
  //   { v:2, protocols:[{pid,rcid,moves,supps,functions,startedAt}], draft:{pid,rcid,moves,supps,functions,extra,step}|null,
  //     log:{ [date]:{ keystones:{"pid/rcid":bool}, done:[itemId], sets:{exId:[{w,reps}]}, food:[], fn:{fid:n} } },
  //     fnWeek:{[wk]:{fid:n}}, tools:{...} }
  const PLAN_KEY = 'rnawiki_plan';
  function newPlan() { return { v: 2, protocols: [], draft: null, log: {}, fnWeek: {}, tools: {} }; }
  // Upgrade any older single-protocol plan to v2 without losing tracking history.
  function migratePlan(p) {
    if (!p || p.v === 2) return p;
    const np = newPlan();
    np.log = p.log || {}; np.fnWeek = p.fnWeek || {}; np.tools = p.tools || {};
    const key = p.pid ? (p.pid + '/' + p.rcid) : null;
    if (p.pid && p.built) np.protocols.push({ pid: p.pid, rcid: p.rcid, moves: p.moves, supps: p.supps, functions: Array.isArray(p.functions) ? p.functions : [], startedAt: p.startedAt || today() });
    else if (p.pid) np.draft = { pid: p.pid, rcid: p.rcid, moves: p.moves, supps: p.supps, functions: p.functions, extra: p.extra, step: p.step || 0 };
    // old day log used a single keystone bool → move it under this protocol's key
    Object.keys(np.log).forEach(d => { const dl = np.log[d]; if (!dl) return; if (typeof dl.keystone === 'boolean') { dl.keystones = dl.keystones || {}; if (key) dl.keystones[key] = dl.keystone; delete dl.keystone; } dl.keystones = dl.keystones || {}; dl.done = dl.done || []; dl.sets = dl.sets || {}; dl.food = dl.food || []; dl.fn = dl.fn || {}; });
    return np;
  }
  // GUARD 1 — shape coercion (added 2026-07-28). getPlan() returned whatever was in localStorage,
  // so a plan that had become structurally malformed (protocols not an array, log not an object —
  // a half-written save, an older schema, a sync that lost a field) flowed straight into the
  // renderer, which then found no protocols and told the user "You haven't started a plan yet"
  // OVER AN INTACT PLAN. That is the product lying about the user's own data, and it is
  // unrecoverable from the UI. Coerce the shape instead: keep every field that is usable, discard
  // only what is structurally wrong, and never let a bad shape read as "no plan".
  function coercePlan(p) {
    if (!p || typeof p !== 'object' || Array.isArray(p)) return null;
    const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v)) ? v : {};
    p.protocols = Array.isArray(p.protocols)
      ? p.protocols.filter((x) => x && typeof x === 'object' && x.pid)
      : [];
    p.log = obj(p.log); p.tools = obj(p.tools); p.fnWeek = obj(p.fnWeek);
    if (p.draft && (typeof p.draft !== 'object' || Array.isArray(p.draft))) delete p.draft;
    // a log keyed by anything that is not a YYYY-MM-DD date can hang date loops downstream
    Object.keys(p.log).forEach((k) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(k) || isNaN(Date.parse(k + 'T00:00:00'))) delete p.log[k];
      else if (!p.log[k] || typeof p.log[k] !== 'object') delete p.log[k];
    });
    return p;
  }
  function getPlan() {
    try { return coercePlan(migratePlan(JSON.parse(localStorage.getItem(PLAN_KEY)))) || null; }
    catch (e) { console.warn('[plan] unreadable, treating as empty:', e && e.message); return null; }
  }
  let _planSaveTimer = null;
  function setPlan(p) {
    if (p) localStorage.setItem(PLAN_KEY, JSON.stringify(p)); else localStorage.removeItem(PLAN_KEY);
    // localStorage is the immediate source of truth; debounce the account mirror so rapid ticks don't spam the server
    if (ME && p) { clearTimeout(_planSaveTimer); _planSaveTimer = setTimeout(() => api.savePlan(p), 700); }
  }
  function planProtocols(plan) { return (plan && Array.isArray(plan.protocols)) ? plan.protocols : []; }
  function getDraft() { const p = getPlan(); return p ? p.draft : null; }
  function setDraft(dr) { const p = getPlan() || newPlan(); p.draft = dr; setPlan(p); }
  // On login: the account's saved plan is the source of truth; if none exists, push the local one up.
  async function syncPlanOnLogin() {
    try {
      const serverPlan = await api.getPlan();
      const local = getPlan();
      if (serverPlan) localStorage.setItem(PLAN_KEY, JSON.stringify(migratePlan(serverPlan)));
      else if (local) api.savePlan(local);
    } catch (e) {}
  }
  function planDay(plan) { plan.log = plan.log || {}; const k = today(); const d = plan.log[k] = plan.log[k] || {}; d.keystones = d.keystones || {}; d.done = d.done || []; d.sets = d.sets || {}; d.food = d.food || []; d.fn = d.fn || {}; return d; }
  // ---- Weekly structure: strength trains on chosen days; keystone/mobility/supps/tools stay daily ----
  function planTrainingDays(plan) { return (plan && Array.isArray(plan.trainingDays)) ? plan.trainingDays : [1, 3, 5]; } // default Mon/Wed/Fri
  function isTrainingDay(plan, date) { const wd = new Date(date + 'T00:00:00').getDay(); return planTrainingDays(plan).includes(wd); }
  // items actually scheduled on `date`: stretches + supps every day; strength only on training days
  function scheduledIds(M, plan, date) {
    const training = isTrainingDay(plan, date);
    return M.moves.filter(e => e.kind === 'stretch' || training).map(e => e.id).concat(M.supps.map(c => c.id));
  }
  function nextTrainingLabel(plan) {
    const days = planTrainingDays(plan); if (!days.length) return null;
    for (let i = 1; i <= 7; i++) { const d = new Date(); d.setDate(d.getDate() + i); if (days.includes(d.getDay())) return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()]; }
    return null;
  }
  // ---- Completion & streak: a day "counts" when you show up (against what's scheduled THAT day) ----
  function planDayStats(M, dl, ids) {
    dl = dl || {}; ids = ids || [];
    const ksTotal = M.keystones.length;
    const ksDone = M.keystones.filter(k => dl.keystones && dl.keystones[k.key]).length;
    const itemDone = ids.filter(id => (dl.done || []).includes(id)).length;
    const total = ksTotal + ids.length; const done = ksDone + itemDone;
    const pct = total ? done / total : 0;
    return { total, done, pct, showed: ksDone > 0 || pct >= 0.5, full: total > 0 && done >= total };
  }
  function planStreak(plan) {
    const M = mergedPlan(plan);
    if (!M.keystones.length && !M.moves.length && !M.supps.length) return 0;
    let s = 0; const d = new Date();
    const showed = () => { const key = localISO(d); return planDayStats(M, (plan.log || {})[key], scheduledIds(M, plan, key)).showed; };
    if (!showed()) d.setDate(d.getDate() - 1); // grace — a still-pending today doesn't break the streak
    for (; ;) { if (showed()) { s++; d.setDate(d.getDate() - 1); } else break; }
    return s;
  }
  // 7 cells (last week → today), each miss / partial / full — the "am I consistent?" glance
  function weekStripHtml(plan, M) {
    M = M || mergedPlan(plan); const tk = today(); const cells = [];
    for (let i = 6; i >= 0; i--) {
      const dd = new Date(); dd.setDate(dd.getDate() - i);
      const key = localISO(dd); const st = planDayStats(M, (plan.log || {})[key], scheduledIds(M, plan, key));
      const cls = st.full ? 'full' : (st.done > 0 ? 'partial' : 'miss');
      const lbl = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][dd.getDay()];
      cells.push(`<div class="ws-day ${cls}${key === tk ? ' today' : ''}" title="${key} · ${st.done}/${st.total} done"><span class="ws-dot"></span><span class="ws-lbl">${lbl}</span></div>`);
    }
    return `<div class="week-strip">${cells.join('')}</div>`;
  }
  // ---- Progress-dashboard stats (all derived from plan.log; deterministic) ----
  function dISO(offset) { const d = new Date(); if (offset) d.setDate(d.getDate() - offset); return localISO(d); }
  function planStartDate(plan) { const ps = planProtocols(plan).map(p => p.startedAt).filter(Boolean).sort(); return ps[0] || today(); }
  function daysShown(plan, M, N) { let c = 0; for (let i = 0; i < N; i++) { const key = dISO(i); if (planDayStats(M, (plan.log || {})[key], scheduledIds(M, plan, key)).showed) c++; } return c; }
  function longestStreak(plan, M) {
    const log = plan.log || {}; const keys = Object.keys(log).sort(); if (!keys.length) return 0;
    let best = 0, cur = 0; const end = new Date(today() + 'T00:00:00');
    // GUARD 2 — error boundary on the streak walk (added 2026-07-28). This walks day by day from
    // the first logged date to today. If either bound is an invalid Date the comparison never
    // advances sanely, and the render hangs — an unrecoverable spinner on the user's own plan
    // page. Bail on invalid bounds and hard-cap the iterations at ~10 years.
    if (isNaN(new Date(keys[0] + 'T00:00:00')) || isNaN(end)) return 0;   // longestStreak returns a number
    let _guard = 0;
    for (let d = new Date(keys[0] + 'T00:00:00'); d <= end && _guard++ < 3700; d.setDate(d.getDate() + 1)) { const key = localISO(d); if (planDayStats(M, log[key], scheduledIds(M, plan, key)).showed) { cur++; best = Math.max(best, cur); } else cur = 0; }
    return best;
  }
  function adherencePct(plan, M, N) {
    const start = new Date(planStartDate(plan) + 'T00:00:00'); const t0 = new Date(today() + 'T00:00:00');
    const daysSince = Math.floor((t0 - start) / 86400000) + 1; const denom = Math.min(N, Math.max(1, daysSince));
    return Math.round(daysShown(plan, M, denom) / denom * 100);
  }
  function dayVolume(dl) { if (!dl || !dl.sets) return 0; let v = 0; Object.keys(dl.sets).forEach(k => (dl.sets[k] || []).forEach(s => { if (s && s.reps) v += (s.w || 0) * s.reps; })); return v; }
  // ---- Retention hooks (deterministic) ----
  const STREAK_MILESTONES = [3, 7, 14, 30, 60, 90, 180, 365];
  function milestoneMsg(m) { return ({ 3: "3 days — it's becoming a habit.", 7: 'a full week! 🎉', 14: 'two weeks strong 💪', 30: '30 days — this is who you are now.', 60: '60 days. Unstoppable.', 90: '90 days — a real streak.', 180: 'half a year!', 365: 'one year. Legendary.' })[m] || m + ' days!'; }
  // tiny inline bar sparkline (values → bars scaled to max)
  function sparkline(vals) {
    const max = Math.max(1, ...vals);
    return `<div class="spark">${vals.map(v => `<span class="spark-bar" style="height:${Math.max(6, Math.round(v / max * 100))}%" title="${v}"></span>`).join('')}</div>`;
  }

  const STACK_KEY = 'rnawiki_stack';
  function getStack() { try { return JSON.parse(localStorage.getItem(STACK_KEY)) || []; } catch (e) { return []; } }
  function setStack(a) { localStorage.setItem(STACK_KEY, JSON.stringify(a)); updateStackBadge(); if (a && a.length && !window._rnaHelpedPinged) { window._rnaHelpedPinged = true; try { api.helped(); } catch (e) {} } }
  function inStack(id) { return getStack().includes(id); }
  function toggleStack(id) { const s = getStack(); const i = s.indexOf(id); if (i >= 0) s.splice(i, 1); else s.push(id); setStack(s); }
  function updateStackBadge() { const b = document.getElementById('stack-badge'); const n = getStack().length; if (b) { b.textContent = n; b.hidden = n === 0; } }

  // ---------- helpers ----------
  // ---- W5a (2026-08-02): THE RATING IS CARRIED BY ITS TEXT --------------------------------------
  // The evidence chip used to render `${'★'.repeat(c.stars)}<span class="sc-dim">${'★'.repeat(5 -
  // c.stars)}</span>` — five FILLED stars, the empty ones told apart only by a paler colour.
  // Measured hydrated at 390x844 on /c/bpc-157, a ONE-star compound, 0 pageerrors: innerText
  // "EVIDENCE\n★★★★★ Minimal", .sc-dim computed rgb(233,237,242) on rgb(246,248,250) = 1.10:1.
  // 148 of 171 compounds carried dim glyphs, so every screen reader, text extractor, LLM crawler
  // and copy-paste read the site's weakest evidence claim as its strongest.
  // The table is NOT defined here — build/parse.js owns it and emits it into data.js, and
  // assertRatingIsTextCarried() fails the build if this file stops reading it, if the empty half of
  // a rating is ever padded with ★ again, or if two ratings become the same string once the glyphs
  // are stripped. Every star on the site goes through starHTML().
  const rateIdx = n => Math.min(5, Math.max(0, n | 0));
  const starStr = n => D.ratings.glyphs[rateIdx(n)];
  const rateText = n => D.ratings.text[rateIdx(n)];
  const rateAria = n => D.ratings.aria[rateIdx(n)];
  // `scale` shows the full 5-slot scale plus the number in words; `compact` shows filled stars only
  // (already unambiguous in text — ★★★ is not ★★★★) and carries the number in the accessible name.
  // Both give the badge role="img" and a real accessible name: 171 star badges shipped with
  // aria-label = null and role = null, described only by a `title` on a bare <span>, which is not
  // an accessible name and never surfaces on touch.
  function starHTML(n, opt) {
    const o = opt || {}, i = rateIdx(n);
    const glyph = o.compact ? D.ratings.compact[i] : D.ratings.glyphs[i];
    const aria = D.ratings.aria[i];
    const num = i === 0 || o.compact ? '' : ` <b class="stars-n">${esc(D.ratings.text[i])}</b>`;
    const body = i === 0 ? `<b class="stars-n unrated">${esc(D.ratings.text[0])}</b>` : `${glyph}${num}`;
    return `<span class="stars${o.cls ? ' ' + o.cls : ''}" role="img" aria-label="${esc(aria)}" title="${esc(aria)}"${o.style ? ` style="${o.style}"` : ''}>${body}</span>`;
  }
  const STAR_LEGEND = 'Human-evidence strength, 1–5 stars (★). Animal-only data is capped low.';
  // Regulatory class, authored per compound in data/regulatory_class.json and merged into data.js
  // by build/parse.js (2026-07-28). Before that merge existed, every regulatory decision in the SPA
  // keyed on `c.isRx`, which MISSES statins, SSRIs, PDE-5 inhibitors, finasteride, tretinoin,
  // minoxidil and Contrave (all badged green "FDA approved") and wrongly flags vitamin D3 and iron.
  // A green badge means "a regulator approved this molecule", NOT "buy it off a shelf". Reading it
  // as the latter is what printed "available over the counter -- Guardian, Watsons" on seven
  // prescription-only medicines. The authored class wins; the badge is only a fallback.
  const regClass = (c) => {
    if (!c) return 'unknown';
    if (c.regulatory_class) return c.regulatory_class;
    const ap = c.approvals || [];
    if (ap.includes('\u26ab')) return 'controlled';
    if (ap.includes('\ud83d\udd35') || c.isRx) return 'prescription';
    if (ap.includes('\ud83d\udd34')) return 'unapproved';
    if (ap.includes('\ud83d\udfe1')) return 'supplement';
    if (ap.includes('\ud83d\udfe2')) return 'otc';
    return 'unknown';
  };
  const needsDoctor = (c) => ['prescription', 'controlled', 'pharmacy'].includes(regClass(c));
  const rxBadge = c => needsDoctor(c) ? '<span class="pill rx" data-axis="supply" aria-label="How you get it: needs a doctor" title="A prescription or controlled drug \u2014 a doctor has to assess you and prescribe it. It is not a supplement.">\u211e Needs a doctor</span>' : '';
  // ---- W5a (2026-08-02): TWO AXES, ONE ANSWER EACH ---------------------------------------------
  // Felix's decision: a colour on this site is the REGULATOR'S current call on that molecule — the
  // FDA's or the relevant global regulator's. It never implies that anyone on this project reviewed
  // it. How you actually GET the thing is a different question with a different, single carrier.
  //
  // This row used to answer "how do you get it" TWICE, from two sources that disagreed on 24 of 171
  // compounds (measured hydrated at 390x844, visible `.pill` text vs `c.regulatory_class`):
  //   · /c/vitamin-d3-k2 and /c/iron are authored `supplement` and rendered "🔵 Prescription";
  //     /c/yohimbine is `unapproved` and rendered BOTH 🔵 Prescription and 🟡 OTC Supplement.
  //   · 21 compounds with a prescription/pharmacy class rendered only 🟢 FDA Approved or 🟠
  //     Off-Label — /c/ssris-…, /c/statins-…, /c/pde-5-inhibitors-…, /c/minoxidil and 17 more.
  //   · The one supply cue that did exist, `.rx-note`, printed "Prescription — needs a doctor" on
  //     /c/minoxidil, whose authored class is `pharmacy`. Wrong word, and a second carrier.
  // build/parse.js reconciles the two at BUILD time — it withdraws any badge whose supply claim the
  // authored class denies, records the withdrawal on the compound, and emits exactly one supply
  // statement — so this renderer cannot reintroduce the contradiction. All 197 approval pills also
  // shipped with aria-label = null and title = null; every pill now names its own axis.
  const supplyPill = (c) => {
    const s = c.supply || { tag: 'Status varies — check your regulator', cls: 'unknown', why: '' };
    const ico = { prescription: '℞', pharmacy: '℞', controlled: '⛔', unapproved: '⛔', supplement: '🛒', otc: '🛒' }[s.cls] || '•';
    // The axis is named in the accessible name, not just implied by the styling: a screen-reader
    // user hears "Regulator status: FDA Approved" and then "How you get it: prescription only".
    return `<span class="pill supply s-${esc(s.cls)}" data-axis="supply" aria-label="How you get it: ${esc(String(s.tag).toLowerCase())}" title="${esc(s.why || s.tag)}">${ico} ${esc(s.tag)}</span>`;
  };
  const approvalPills = c => (c.badges || []).map(a =>
    `<span class="pill ${APPROVAL_CLASS[a] || 'k'}" data-axis="regulator" aria-label="Regulator status: ${esc(D.approvalLabels[a] || '')}" title="What a regulator has decided about this molecule — not where you can buy it.">${a} ${esc(D.approvalLabels[a] || '')}</span>`
  ).join('') + supplyPill(c);
  const badgeRow = c => `<div class="badges">${starHTML(c.stars)}${approvalPills(c)}</div>`;
  // Singapore availability, derived from approval status — the localisation moat, accurate for all
  // compounds, and a safety + (future) monetisation surface. Curated cost detail layers on top.
  // W5a: the TAG is no longer written here. It comes from c.supply, which build/parse.js derives
  // from the same authored regulatory_class this switch reads — so the badge row and this section
  // print the identical words, and a change to one cannot leave the other behind. The long bodies
  // stay, and where the compound has an authored `sg_hsa_status` sentence it is now shown too,
  // because it is the most specific and most local thing the corpus knows about this question.
  function sgAvailability(c) {
    const t = (o) => Object.assign(o, { tag: ((c || {}).supply || {}).tag || o.tag, sg: ((c || {}).supply || {}).why || '' });
    switch (regClass(c)) {
      case 'controlled': return t({ tag: 'Controlled substance', cls: 'danger', body: 'A controlled substance in most countries, including Singapore (HSA / CNB) \u2014 illegal to buy, sell or possess without authorisation almost everywhere, though the exact schedule differs by country. Listed here for completeness only.' });
      case 'prescription': return t({ tag: 'Prescription only', cls: 'rx', body: 'A prescription-only medicine in most countries: dispensed by a licensed pharmacy against a doctor\'s prescription, not sold over the counter. Buying it from an online marketplace or an overseas seller is unsafe, and in many countries unlawful. Classification varies \u2014 check the rules where you live, and speak to a doctor.' });
      case 'pharmacy': return t({ tag: 'Pharmacy medicine', cls: 'rx', body: 'A pharmacy-only medicine \u2014 sold from behind the counter after a pharmacist\'s advice, not off the open shelf.' });
      case 'unapproved': return t({ tag: 'Not approved', cls: 'warn', body: 'Not approved for human use in most markets, Singapore included. Grey-market supply only: dose, purity and legality are all uncertain wherever you are.' });
      case 'supplement':
      case 'otc': return t({ tag: 'Available over the counter', cls: 'ok', body: 'Widely available over the counter. Look for a third-party-tested / GMP mark and check the dose per serving.' });
      default: return t({ tag: 'Check locally', cls: '', body: 'Availability and legal status vary by country \u2014 check your national regulator (in Singapore, the HSA) before buying.' });
    }
  }

  // Compounds that share a pathway. NOT a suggestion to combine them — see the W3.5 note at the
  // stacksBlock in detail(), where 63 of these were rendered as recommendations while the site's
  // own interaction checker rated the same pair ☠️ danger.
  function derivedStacks(c) {
    const pw = new Set(c.pathwayIds || []); if (!pw.size) return [];
    return D.compounds.filter(o => o.id !== c.id && !o.isNote && (o.pathwayIds || []).some(i => pw.has(i))).sort((a, b) => b.stars - a.stars).slice(0, 4);
  }
  // The checker's verdict on a pathway-sibling pair, precomputed at build time by
  // assertInteractionCoverage() in build/parse.js so this document and the prerendered one cannot
  // print different answers about the same two molecules.
  const TIER_ICON = { danger: '☠️', blunt: '🔻', timing: '⏰' };
  function pairFlag(a, b) { const P = D.pairFlags || {}; return P[a.id + '|' + b.id] || P[b.id + '|' + a.id] || null; }
  // Strip markdown to clean plain text for card snippets (bold/italic/links/code → text).
  function mdStrip(s) { return String(s || '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/(^|[^*])\*(?!\*)(.+?)\*(?!\*)/g, '$1$2').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/`([^`]+)`/g, '$1'); }
  function cpdCard(c) {
    return `<a class="cpd-card" href="#/c/${slug(c.name)}">
      <div class="cat">${c.category || ''}</div>
      <h3>${c.name}</h3>
      <p class="mech">${esc(mdStrip(c.mechanism || c.plain || c.bottom || ''))}</p>
      ${badgeRow(c)}
      ${c.targets && c.targets.length ? `<div class="mini-targets">${c.targets.slice(0, 4).map(t => `<span class="mini-t">${t.sym}</span>`).join('')}</div>` : ''}
    </a>`;
  }
  function crumbs(items) { return `<div class="crumbs">${items.map((it, i) => it.href ? `<a href="${it.href}">${it.label}</a>` : `<span>${it.label}</span>`).join('<span class="sep">›</span>')}</div>`; }
  // ---- BLOCK RENDERER (2026-07-28) ----------------------------------------------------------
  // Two measured defects in how authored prose reaches the page, both presentation-only:
  //
  //   1. MARKDOWN LISTS RENDERED AS PROSE. 87 blocks in learn_expand.json (8,721 words) are authored
  //      as "- item\n\n- item". Both renderers wrapped the whole thing in one <p>, and HTML collapses
  //      the newlines — so /pathway/6 shipped a 558-word wall of text with literal dashes in it. The
  //      longest "paragraphs" on the site were never paragraphs.
  //   2. SLABS. 913 blocks run past 90 words; the reader gets no landing place. Splitting at sentence
  //      boundaries takes the 90th percentile from 215 words to 93 with zero re-authoring.
  //
  // This changes not one word of content — it only decides where a block ends. Verified lossless
  // across all 45 courses (0 words added or lost).
  // `inline` is passed in because the two documents escape differently: app.js formats-then-escapes
  // (mdInline), prerender.js escapes-then-formats (mdSafe). Do not hardcode either one here.
  const MD_ABBR = /(?:\b(?:et al|vs|i\.e|e\.g|cf|approx|Dr|Prof|Mr|Mrs|Ms|St|Fig|No|ca|resp|incl|max|min|avg|ie|eg)\.)$/i;
  function mdSentences(text) {
    const out = []; let buf = '';
    // Judged in context: a decimal (p<0.05), an abbreviation (et al.), an initial (J. Smith) and a
    // real full stop are indistinguishable to a naive /[.!?]\s/ split.
    for (let i = 0; i < text.length; i++) {
      buf += text[i];
      if (!/[.!?]/.test(text[i])) continue;
      const next = text.slice(i + 1);
      if (!/^\s/.test(next)) continue;
      if (/^\s*$/.test(next)) break;
      if (!/^\s+["'“(]?[A-Z0-9]/.test(next)) continue;
      if (MD_ABBR.test(buf.trimEnd())) continue;
      if (/\b[A-Z]\.$/.test(buf.trimEnd())) continue;
      out.push(buf.trim()); buf = '';
    }
    if (buf.trim()) out.push(buf.trim());
    return out;
  }
  const mdWc = (s) => (s.trim() ? s.trim().split(/\s+/).length : 0);
  function mdChunk(block, MAX, TARGET) {
    if (mdWc(block) <= MAX) return [block];
    const sents = mdSentences(block);
    if (sents.length < 2) return [block];         // one giant sentence — leave it whole, don't maim it
    const out = []; let cur = [];
    for (const s of sents) {
      // Close the current chunk BEFORE the sentence that would burst it, not after. Appending first
      // and checking after let a 64-word chunk plus a 70-word sentence ship as 134 words — which is
      // how /learn/0 kept a 135-word paragraph through the first pass of this fix.
      if (cur.length && mdWc(cur.join(' ') + ' ' + s) > MAX) { out.push(cur.join(' ')); cur = []; }
      cur.push(s);
      if (mdWc(cur.join(' ')) >= TARGET) { out.push(cur.join(' ')); cur = []; }
    }
    if (cur.length) {
      // A stranded tail of a few words reads as a mistake, so fold it back — but ONLY if the merged
      // paragraph still respects MAX. Without that guard this rule defeated the limit it sits inside:
      // biceps mechStep[4] is 5 sentences of 4/24/27/34/12 words, the first four flush at exactly 89,
      // and folding the 12-word tail back produced a 101-word paragraph. Every "why is this still
      // over 90?" I chased today traced to here, not to the sentence splitter.
      const tail = cur.join(' ');
      if (mdWc(tail) < 25 && out.length && mdWc(out[out.length - 1] + ' ' + tail) <= MAX) {
        out[out.length - 1] += ' ' + tail;
      } else out.push(tail);
    }
    return out;
  }
  function mdBlocks(text, inline, MAX, TARGET) {
    MAX = MAX || 90; TARGET = TARGET || 65;
    const src = String(text || '').trim();
    if (!src) return '';
    const out = [];
    let list = null;      // { ord: bool, items: [] }
    const flushList = () => {
      if (!list) return;
      const tag = list.ord ? 'ol' : 'ul';
      out.push(`<${tag} class="md-list">${list.items.map((it) => `<li>${inline(it)}</li>`).join('')}</${tag}>`);
      list = null;
    };
    // Split on blank lines first, then walk each block line by line so a list authored with single
    // newlines and a list authored with blank lines between items both come out as one <ul>.
    for (const block of src.split(/\n\n+/)) {
      const lines = block.split('\n');
      let para = [];
      const flushPara = () => {
        const t = para.join(' ').trim(); para = [];
        if (!t) return;
        flushList();
        mdChunk(t, MAX, TARGET).forEach((c) => out.push(`<p>${inline(c)}</p>`));
      };
      for (const raw of lines) {
        const m = raw.match(/^\s*(?:([-*•])|(\d+)[.)])\s+(.*)$/);
        if (m) {
          flushPara();
          const ord = !!m[2];
          if (!list || list.ord !== ord) { flushList(); list = { ord, items: [] }; }
          list.items.push(m[3]);
        } else if (list && /^\s+\S/.test(raw) && raw.trim()) {
          list.items[list.items.length - 1] += ' ' + raw.trim();   // indented continuation of an item
        } else if (raw.trim()) {
          if (list) flushList();
          para.push(raw.trim());
        }
      }
      flushPara();
    }
    flushList();
    return out.join('');
  }
  function mdInline(s) {
    if (!s) return '';
    const links = [];
    // SECURITY (2026-07-28): this interpolated the URL RAW, before the escape pass below ran, so a
    // URL could close the href and add its own attributes:
    //   [x](" onmouseover="alert(1))   ->   <a href="" onmouseover="alert(1" ...>x</a>
    //   [click](javascript:alert(1))   ->   <a href="javascript:alert(1" ...>click</a>
    // NOT exploitable by a visitor today -- every user-supplied surface goes through esc(), and
    // mdInline is fed only authored sidecar content. It was a LATENT sink: one future feature that
    // piped user text through it (a community note, a comment, a shared-plan description) would
    // have made it live, silently. Now the scheme is allowlisted and quotes/brackets escaped, so no
    // URL can break out of the attribute regardless of what feeds it.
    const safeUrl = (u) => /^(https?:|mailto:|\/|#)/i.test(String(u).trim())
      ? String(u).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      : '#';
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, t, u) => { links.push(`<a href="${safeUrl(u)}" target="_blank" rel="noopener">${t}</a>`); return `  ${links.length - 1}  `; });
    s = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // Authored content: restore a safe allowlist of inline tags the escape turned into text.
    s = s.replace(/&lt;(\/?)(b|i|sub|sup|em|strong)&gt;/gi, '<$1$2>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>');
    // single-asterisk *italic* (asterisks must hug non-space text so lone markers/multiplication do not match)
    s = s.replace(/(^|[^*])\*(?!\*)(\S(?:[^*\n]*\S)?)\*(?!\*)/g, "$1<em>$2</em>");
    s = s.replace(/ (\d+) /g, (m, i) => links[+i]);
    return s;
  }
  const stripNum = t => t.replace(/^(MODULE|PATHWAY)\s*\d+\s*[—-]\s*/i, '').replace(/^\d+\s*[—-]\s*/, '');
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const userText = s => esc(s).replace(/\n/g, '<br>');
  const ago = ts => { const d = (Date.now() - new Date(ts).getTime()) / 1000; if (d < 60) return 'just now'; if (d < 3600) return Math.floor(d / 60) + 'm ago'; if (d < 86400) return Math.floor(d / 3600) + 'h ago'; if (d < 2592000) return Math.floor(d / 86400) + 'd ago'; return new Date(ts).toLocaleDateString(); };

  // ---------- accounts + API ----------
  let ME = null;
  let FUEL_TARGETS = null; // the current protocol's nutrient_targets — lets "add a food" highlight what THIS protocol tracks
  // Super-admin (Control Room) access — robust: is_super from the server OR the owner's own email
  // (both come from /api/me). The email fallback guarantees the button can never silently vanish.
  const SUPER_EMAIL = 'felix360506@gmail.com';
  function canAdmin() { return !!(ME && (ME.is_super || (ME.email || '').toLowerCase() === SUPER_EMAIL)); }
  let CFG = { googleClientId: null };
  const api = {
    async call(method, url, body) {
      const opt = { method, headers: {} };
      if (body) { opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(body); }
      const r = await fetch(url, opt);
      let d = {}; try { d = await r.json(); } catch (e) {}
      if (!r.ok) throw new Error(d.error || 'Something went wrong');
      return d;
    },
    me() { return this.call('GET', '/api/me').then(d => d.user).catch(() => null); },
    getPlan() { return this.call('GET', '/api/plan').then(d => d.plan).catch(() => null); },
    savePlan(plan) { return this.call('POST', '/api/plan', { plan }).catch(() => null); },
    config() { return this.call('GET', '/api/config').catch(() => ({ googleClientId: null })); },
    googleAuth(credential) { return this.call('POST', '/api/auth/google', { credential }); },
    register(b) { return this.call('POST', '/api/register', b); },
    login(b) { return this.call('POST', '/api/login', b); },
    logout() { return this.call('POST', '/api/logout'); },
    comments(goal) { return this.call('GET', '/api/comments?goal=' + encodeURIComponent(goal)).then(d => d.comments); },
    recentComments() { return this.call('GET', '/api/comments/recent').then(d => d.comments).catch(() => []); },
    postComment(goalId, body) { return this.call('POST', '/api/comments', { goalId, body }); },
    delComment(id) { return this.call('DELETE', '/api/comments/' + id); },
    edits(cid) { return this.call('GET', '/api/edits/' + encodeURIComponent(cid)).catch(() => ({ current: null, history: [] })); },
    saveEdit(b) { return this.call('POST', '/api/edits', b); },
    votes(ids) { return this.call('GET', '/api/votes?ids=' + encodeURIComponent(ids.join(','))).then(d => d.scores).catch(() => ({})); },
    vote(b) { return this.call('POST', '/api/votes', b); },
    setDomain(b) { return this.call('POST', '/api/profile/domain', b); },
    proposals(pid, rcid) { return this.call('GET', `/api/proposals?problem=${encodeURIComponent(pid)}&rc=${encodeURIComponent(rcid)}`).then(d => d.proposals).catch(() => []); },
    addProposal(b) { return this.call('POST', '/api/proposals', b); },
    endorse(id) { return this.call('POST', `/api/proposals/${id}/endorse`); },
    flag(id, note) { return this.call('POST', `/api/proposals/${id}/flag`, { note }); },
    contributors() { return this.call('GET', '/api/contributors').catch(() => ({ experts: [], leaderboard: [] })); },
    protocolContributors(pid, rcid) { return this.call('GET', `/api/protocol-contributors?problem=${encodeURIComponent(pid)}&rc=${encodeURIComponent(rcid)}`).then(d => d.contributors).catch(() => []); },
    profile(handle) { return this.call('GET', '/api/u/' + encodeURIComponent(handle)); },
    saveProfile(socials) { return this.call('POST', '/api/profile', { socials }); },
    rep(kind) { return this.call('POST', '/api/rep', { kind }).catch(() => null); },
    steward(pid, rcid) { return this.call('GET', `/api/steward?problem=${encodeURIComponent(pid)}&rc=${encodeURIComponent(rcid)}`).then(d => d.steward).catch(() => null); },
    adoptProtocol(problemId, rootCauseId) { return this.call('POST', '/api/steward/adopt', { problemId, rootCauseId }); },
    releaseProtocol(problemId, rootCauseId) { return this.call('POST', '/api/steward/release', { problemId, rootCauseId }); },
    partners(category) { return this.call('GET', '/api/partners' + (category ? '?category=' + encodeURIComponent(category) : '')).then(d => d.partners).catch(() => []); },
    submitPartner(b) { return this.call('POST', '/api/partners', b); },
    protocolRequests() { return this.call('GET', '/api/protocol-requests').then(d => d.requests).catch(() => []); },
    submitProtocolRequest(b) { return this.call('POST', '/api/protocol-requests', b); },
    voteProtocolRequest(id, voterKey) { return this.call('POST', `/api/protocol-requests/${id}/vote`, { voterKey }); },
    userFoods() { return this.call('GET', '/api/foods').then(d => d.foods).catch(() => []); },
    submitFood(b) { return this.call('POST', '/api/foods', b); },
    pendingFoods() { return this.call('GET', '/api/foods/pending').then(d => d.foods).catch(() => []); },
    verifyFood(id, status) { return this.call('POST', '/api/foods/' + id + '/verify', { status }); },
    adminExperts() { return this.call('GET', '/api/admin/experts').then(d => d.experts); },
    adminVerify(username, verified) { return this.call('POST', '/api/admin/verify-domain', { username, verified }); },
    adminPartners() { return this.call('GET', '/api/admin/partners').then(d => d.partners); },
    adminSetPartner(id, status) { return this.call('POST', '/api/admin/partners/' + id, { status }); },
    adminOverview() { return this.call('GET', '/api/admin/overview'); },
    adminOutcomes() { return this.call('GET', '/api/admin/outcomes'); },
    adminSignals() { return this.call('GET', '/api/admin/signals'); },
    adminResearch() { return this.call('GET', '/api/admin/research'); },
    publicOutcomes(pid, rcid) { return this.call('GET', '/api/outcomes/public?pid=' + encodeURIComponent(pid) + '&rcid=' + encodeURIComponent(rcid)).then(d => d.stat).catch(() => null); },
    setRequestStatus(id, status) { return this.call('POST', '/api/admin/requests/' + id, { status }); },
    rootcauseChanges(problem) { return this.call('GET', '/api/rootcause-changes' + (problem ? '?problem=' + encodeURIComponent(problem) : '')).then(d => d); },
    submitRootcauseChange(b) { return this.call('POST', '/api/rootcause-changes', b); },
    endorseRootcauseChange(id) { return this.call('POST', '/api/rootcause-changes/' + id + '/endorse', {}); },
    setRootcauseChange(id, status) { return this.call('POST', '/api/admin/rootcause-changes/' + id, { status }); },
    // Resolves to null (not []) when the request fails. "The server answered and there is nothing
    // to apply" and "we could not ask" are different facts about the page, and the second one is
    // now shown to the reader instead of being swallowed. See mountRcOverlayNotice().
    rootcauseOverlay() { return this.call('GET', '/api/rootcause-overlay').then(d => d.overlay || []).catch(() => null); },
    createFork(b) { return this.call('POST', '/api/forks', b); },
    forksFor(pid, rcid) { return this.call('GET', `/api/forks?problem=${encodeURIComponent(pid)}&rc=${encodeURIComponent(rcid)}`).then(d => d.forks || []).catch(() => []); },
    popularForks() { return this.call('GET', '/api/forks/popular').then(d => d.forks || []).catch(() => []); },
    pulse() { return this.call('GET', '/api/pulse').then(d => d.pulse || []).catch(() => []); },
    getFork(id) { return this.call('GET', '/api/forks/' + id).then(d => d.fork).catch(() => null); },
    cloneFork(id) { return this.call('POST', `/api/forks/${id}/clone`, { voterKey: VOTER_KEY }); },
    submitFeedback(b) { return this.call('POST', '/api/feedback', b); },
    setFeedback(id, status) { return this.call('POST', '/api/admin/feedback/' + id, { status }); },
    submitClinicianInterest(b) { return this.call('POST', '/api/clinician-interest', b); },
    sharePlan(pid, rcid, plan) { return this.call('POST', '/api/share-plan', { pid, rcid, plan }); },
    sharedPlan(code) { return this.call('GET', '/api/shared-plan?code=' + encodeURIComponent(code)).catch(() => null); },
    // outcome-data moat
    getConsent() { return this.call('GET', '/api/consent').catch(() => null); },
    setConsent(research) { return this.call('POST', '/api/consent', { research }); },
    getProfile() { return this.call('GET', '/api/profile').then(d => d.profile).catch(() => null); },
    saveProfile(p) { return this.call('POST', '/api/profile', p); },
    checkinsDone(pid, rcid) { return this.call('GET', '/api/checkin?pid=' + encodeURIComponent(pid) + '&rcid=' + encodeURIComponent(rcid)).then(d => d.done || []).catch(() => []); },
    submitCheckin(b) { return this.call('POST', '/api/checkin', b); },
    getMarkers() { return this.call('GET', '/api/markers').then(d => d.markers || []).catch(() => []); },
    addMarker(b) { return this.call('POST', '/api/markers', b); },
    saveWearable(b) { return this.call('POST', '/api/wearable', b); },
    getWearables() { return this.call('GET', '/api/wearable').then(d => d.wearables || []).catch(() => []); },
    exportMyData() { return this.call('GET', '/api/mydata'); },
    deleteMyData() { return this.call('DELETE', '/api/mydata'); },
    getEmailReminders() { return this.call('GET', '/api/email-reminders').catch(() => null); },
    setEmailReminders(b) { return this.call('POST', '/api/email-reminders', b); },
    ledger(pid, rcid) { return this.call('GET', `/api/ledger?problem=${encodeURIComponent(pid)}&rc=${encodeURIComponent(rcid)}`).catch(() => null); },
    // W4.5: &voterKey= removed from the URL. server.js:1736-1739 already refuses to read it —
    // "read the cookie, never the ?voterKey query param … so: proxy logs, Referer headers" — but
    // the client was still putting a stable device id in a URL next to the reader's problem id.
    // That is logger rule 2 (no health state in any URL) applied to a fetch instead of location.
    // This method has 0 call sites today; the point is that the next caller inherits a clean one.
    myExperiment(pid, rcid) { return this.call('GET', `/api/experiments/mine?problem=${encodeURIComponent(pid)}&rc=${encodeURIComponent(rcid)}`).catch(() => ({ experiment: null, streak: 0, checkedToday: false })); },
    // W4.5: `ref` and `voterKey` were REMOVED, and the choice was between removing them and
    // rewriting the consent copy to admit them. Removing wins: `ref` is the only field that
    // creates a link between this browser and another account (server.js wrote
    // referrals(referrer, participant) and awarded the referrer 25 points), and NOTHING in this
    // file or in build/prerender.js has ever produced a ?ref= link — 0 producers, 1 consumer —
    // so the feature was unreachable except from a hand-typed URL. `voterKey` was already dead
    // weight: server.js resolves the participant from the signed rw_pid cookie and never reads
    // the body (its own comment, server.js:373). Both were on the wire on 100% of opt-ins.
    // Fields here are fixed by SYNC_MANIFEST; the smoke gate fails the build on any other key.
    startExperiment(pid, rcid) { return this.call('POST', '/api/experiments/start', { problemId: pid, rootCauseId: rcid }); },
    checkinExperiment(pid, rcid) { return this.call('POST', '/api/experiments/checkin', { problemId: pid, rootCauseId: rcid }); },
    reportOutcome(pid, rcid, outcome) { return this.call('POST', '/api/experiments/outcome', { problemId: pid, rootCauseId: rcid, outcome }); },
    stats() { return this.call('GET', '/api/stats').catch(() => null); },
    helped() { return this.call('POST', '/api/helped', { voterKey: VOTER_KEY }).catch(() => null); },
    subscribe(email, source, website) { return this.call('POST', '/api/subscribe', { email, source, website }); },
  };
  // ---- W4.5 · THE SYNC MANIFEST ---------------------------------------------------------------
  // MEASURED, hydrated, real browser at 390x844 on /protocol/insomnia/circadian-misalign
  // (out/w45_consent.json): opting into "anonymous sync" put FOUR fields on the wire —
  // {problemId, rootCauseId, voterKey, ref} — under copy that read "Sends two things … nothing
  // else" and "nothing links it to you". `ref` is the one that made it a lie rather than an
  // omission: server.js:1770-1779 turns it into INSERT INTO referrals(referrer, participant) and a
  // 25-point award to the referrer. The one control on this site whose entire job is to state what
  // is shared understated it, and the field it omitted was the one that creates a link to another
  // account.
  //
  // ONE LIST, TWO CONSUMERS. Every field below is (a) the complete set of keys the consented sync
  // may put in a request body and (b) named in plain words by BOTH consent sentences. The smoke
  // assertion syncSendsExactlyWhatTheConsentCopySays captures the real POST bodies from a driven
  // browser and fails on any key not listed here, on any listed key missing from a body, and on
  // any `plain` phrase missing from either sentence. This is the same rule as the receipt guard:
  // the list is PUBLISHED rather than retyped, because a second hand-kept copy of a rule is exactly
  // the drift that produced this defect.
  //
  // ADDING A FIELD IS A CONSENT CHANGE. Add it here, add its `plain` to both sentences, in the same
  // commit — or the build fails.
  const SYNC_MANIFEST = [
    { field: 'problemId', plain: 'which protocol this is' },
    { field: 'rootCauseId', plain: 'which protocol this is' },
  ];
  window.RNAWIKI_SYNC_MANIFEST = SYNC_MANIFEST;
  // Tier-1 voting: a stable anonymous voter key so votes need no account.
  const VOTER_KEY = (() => { let k = localStorage.getItem('rnawiki_voter'); if (!k) { k = 'v' + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('rnawiki_voter', k); } return k; })();
  // W4.5: the ?ref first-touch capture was REMOVED, not disabled. It read a token out of the URL
  // into localStorage, startExperiment put it on the wire, and server.js turned it into a row in
  // referrals(referrer, participant) plus a 25-point award — under consent copy that said "nothing
  // links it to you". The comment that used to sit here promised to "compute my own share key";
  // nothing ever did. grep -a over site/app.js and build/prerender.js: 0 producers of a ?ref= link,
  // 1 consumer. The whole path was reachable only from a hand-typed URL.
  // If share-with-attribution is ever built, it comes back here AND in SYNC_MANIFEST AND in both
  // consent sentences, in one commit — syncSendsExactlyWhatTheConsentCopySays fails otherwise.
  function myVote(targetId) { try { return (JSON.parse(localStorage.getItem('rnawiki_myvotes')) || {})[targetId] || 0; } catch (e) { return 0; } }
  function setMyVote(targetId, v) { let m = {}; try { m = JSON.parse(localStorage.getItem('rnawiki_myvotes')) || {}; } catch (e) {} if (v) m[targetId] = v; else delete m[targetId]; localStorage.setItem('rnawiki_myvotes', JSON.stringify(m)); }
  const DOMAIN_LAYER = { physio: 'move', dietitian: 'fuel', pharmacist: 'stack' };
  const LAYER_DOMAIN = { move: 'physio', fuel: 'dietitian', stack: 'pharmacist' };
  // Phase 2 (the expert marketplace: verified-expert editing, the /pro dashboard, adopt/steward,
  // "open for review" strips) is NOT launched yet — there are no verified experts. Gate all of that
  // UI on this flag so nothing implies the wiki is expert-editable. Flip to true when Phase 2 ships.
  const PHASE2 = false;
  // Default 3D muscle viewer (verified embeddable, CC) — a physio can override per-muscle via model_embed.
  const MUSCLE_MODEL_DEFAULT = 'https://sketchfab.com/models/75cc6aa94b5c4ed88f9810770d614ac1/embed?ui_theme=dark&autospin=0.15&ui_infos=0&ui_watermark=0&ui_hint=0&transparent=0';
  // Inline SVG: relative power of the three energy systems over time; highlights the page's own system.
  const ENERGY_CURVES = { labels: ['0s', '10s', '30s', '1m', '2m', '5m+'], x: [70, 165, 260, 355, 470, 600], systems: [
    { id: 'atp-pcr', name: 'ATP–PCr', color: '#f59e0b', p: [100, 78, 24, 8, 3, 1] },
    { id: 'glycolytic', name: 'Glycolytic', color: '#ef4444', p: [18, 74, 80, 58, 26, 8] },
    { id: 'oxidative', name: 'Oxidative', color: '#38bdf8', p: [8, 16, 30, 44, 52, 54] } ] };
  function energyChartSvg(activeId) {
    const C = ENERGY_CURVES, y0 = 250, py = v => y0 - v * 2.05;
    const grid = C.x.map((x, i) => `<line x1="${x}" y1="40" x2="${x}" y2="${y0}" stroke="#1e293b" stroke-width="1"/><text x="${x}" y="${y0 + 22}" text-anchor="middle" font-size="13" fill="#64748b">${C.labels[i]}</text>`).join('');
    const curves = C.systems.map(s => { const on = s.id === activeId; const pts = s.p.map((v, i) => `${C.x[i]},${py(v)}`).join(' ');
      return `${on ? `<polygon points="${C.x[0]},${y0} ${pts} ${C.x[C.x.length - 1]},${y0}" fill="${s.color}" opacity="0.12"/>` : ''}<polyline points="${pts}" fill="none" stroke="${s.color}" stroke-width="${on ? 4 : 2}" stroke-linecap="round" stroke-linejoin="round" opacity="${on ? 1 : 0.45}"/>`; }).join('');
    const legend = C.systems.map((s, i) => `<rect x="${72 + i * 190}" y="300" width="26" height="4" rx="2" fill="${s.color}" opacity="${s.id === activeId ? 1 : 0.45}"/><text x="${104 + i * 190}" y="305" font-size="13" font-weight="${s.id === activeId ? 700 : 400}" fill="${s.id === activeId ? '#e2e8f0' : '#94a3b8'}">${s.name}${s.id === activeId ? ' — this page' : ''}</text>`).join('');
    return `<figure class="learn-fig"><svg viewBox="0 0 660 340" role="img" aria-label="Relative power of the three energy systems over time; ${esc(activeId)} highlighted."><text x="70" y="26" font-size="14" font-weight="700" fill="#cbd5e1">Relative power output over time</text><line x1="70" y1="${y0}" x2="620" y2="${y0}" stroke="#334155" stroke-width="1.5"/><line x1="70" y1="40" x2="70" y2="${y0}" stroke="#334155" stroke-width="1.5"/><text x="30" y="150" font-size="12" fill="#64748b" transform="rotate(-90 30 150)" text-anchor="middle">power →</text>${grid}${curves}${legend}</svg></figure><p class="fig-credit">Every all-out effort recruits all three at once — this shows which one <em>dominates</em> as the seconds tick by.</p>`;
  }
  function renderAccount() {
    const slot = document.getElementById('account-slot'); if (!slot) return;
    if (ME) slot.innerHTML = `<span class="acct"><span class="acct-name">👤 ${esc(ME.username)}</span>${canAdmin() ? ' <a class="acct-btn super" href="#/admin" title="Super-admin control room">⚙ Control room</a>' : ''} <button class="acct-btn" id="logout-btn">Sign out</button></span>`;
    else slot.innerHTML = `<button class="acct-btn primary" id="signin-btn">Sign in</button>`;
    const lo = document.getElementById('logout-btn'); if (lo) lo.onclick = async () => { await api.logout(); ME = null; CONSENT = null; renderAccount(); route(); };
    const si = document.getElementById('signin-btn'); if (si) si.onclick = () => openAuth('login');
  }

  // ---------- auth modal ----------
  function modal(html) {
    closeModal();
    const m = document.createElement('div'); m.className = 'modal-bg'; m.id = 'modal-bg';
    m.innerHTML = `<div class="modal">${html}</div>`;
    m.addEventListener('click', e => { if (e.target === m) closeModal(); });
    document.body.appendChild(m);
    return m;
  }
  function closeModal() { const m = document.getElementById('modal-bg'); if (m) m.remove(); }
  function toast(msg) {
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2400);
  }
  function openAuth(mode) {
    const m = modal(authHtml(mode));
    wireAuth(m, mode);
  }
  function authHtml(mode) {
    const login = mode === 'login';
    const google = CFG.googleClientId ? `<div id="gbtn" class="gbtn-wrap"></div><div class="auth-or"><span>or</span></div>` : '';
    return `<button class="modal-x" onclick="void 0" id="modal-close">✕</button>
      <h2>${login ? 'Welcome back' : 'Join RNAwiki'}</h2>
      <p class="modal-sub">${login ? 'Sign in to log food, comment and edit pages.' : 'Create an account to log your meals, comment, and improve any page. Free, takes 10 seconds.'}</p>
      ${google}
      <form id="auth-form" class="auth-form">
        <label>Username<input name="username" autocomplete="username" required placeholder="Letters, numbers, underscores"></label>
        ${login ? '' : '<label>Email <span class="opt">(optional, for recovery)</span><input name="email" type="email" autocomplete="email" placeholder="you@example.com"></label>'}
        <label>Password<input name="password" type="password" autocomplete="${login ? 'current-password' : 'new-password'}" required placeholder="${login ? 'Your password' : 'At least 8 characters'}"></label>
        ${login ? '' : `<div class="auth-demo"><label>Age <select name="age_band"><option value="">—</option>${AGE_OPTS.map(o => `<option value="${o[0]}">${o[1]}</option>`).join('')}</select></label><label>Sex <select name="sex"><option value="">—</option>${SEX_OPTS.map(o => `<option value="${o[0]}">${o[1]}</option>`).join('')}</select></label></div><p class="auth-demo-why">Optional — so I can show you what actually works for people like you.</p>`}
        <div class="auth-err" id="auth-err" hidden></div>
        <button type="submit" class="btn-primary" id="auth-submit">${login ? 'Sign in' : 'Create account'}</button>
      </form>
      <div class="auth-switch">${login ? `New here? <a href="#" id="auth-switch">Create an account</a>` : `Already have one? <a href="#" id="auth-switch">Sign in</a>`}</div>`;
  }
  function wireAuth(m, mode) {
    m.querySelector('#modal-close').onclick = closeModal;
    m.querySelector('#auth-switch').onclick = (e) => { e.preventDefault(); openAuth(mode === 'login' ? 'register' : 'login'); };
    const form = m.querySelector('#auth-form'), err = m.querySelector('#auth-err'), btn = m.querySelector('#auth-submit');
    form.onsubmit = async (e) => {
      e.preventDefault(); err.hidden = true; btn.disabled = true; btn.textContent = 'Please wait…';
      const b = Object.fromEntries(new FormData(form));
      try {
        const d = mode === 'login' ? await api.login(b) : await api.register(b);
        // Re-fetch the full user (login/register responses omit is_super) so the super-admin
        // Control room link never disappears after signing in.
        ME = (await api.me()) || d.user;
        // seed demographics captured at sign-up (fire-and-forget; session cookie is already set)
        if (mode !== 'login' && (b.age_band || b.sex)) api.saveProfile({ age_band: b.age_band || null, sex: b.sex || null }).catch(() => {});
        closeModal(); renderAccount(); route(); syncPlanOnLogin(); loadConsent();
      } catch (ex) { err.textContent = ex.message; err.hidden = false; btn.disabled = false; btn.textContent = mode === 'login' ? 'Sign in' : 'Create account'; }
    };
    if (CFG.googleClientId) mountGoogleButton(m.querySelector('#gbtn'), err);
    setTimeout(() => { const i = form.querySelector('input'); if (i) i.focus(); }, 30);
  }
  // Google (Gmail) sign-in via Google Identity Services
  let _gisPromise = null;
  function loadGis() {
    return _gisPromise || (_gisPromise = new Promise((resolve, reject) => {
      if (window.google && window.google.accounts) return resolve();
      const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.defer = true;
      s.onload = resolve; s.onerror = () => { _gisPromise = null; reject(new Error('gis')); };
      document.head.appendChild(s);
    }));
  }
  async function mountGoogleButton(container, errEl) {
    if (!container) return;
    try { await loadGis(); } catch (e) { container.remove(); return; }
    window.google.accounts.id.initialize({
      client_id: CFG.googleClientId,
      callback: async (resp) => {
        try {
          const d = await api.googleAuth(resp.credential);
          ME = (await api.me()) || d.user; closeModal(); renderAccount(); route(); syncPlanOnLogin(); loadConsent();
        } catch (ex) { if (errEl) { errEl.textContent = ex.message; errEl.hidden = false; } }
      },
    });
    window.google.accounts.id.renderButton(container, { theme: 'outline', size: 'large', width: 320, text: 'continue_with' });
  }
  // ---------- comments ----------
  function commentItem(c) {
    const canDel = ME && (ME.username === c.username || ME.role === 'admin');
    return `<div class="comment" data-id="${c.id}">
      <div class="comment-head"><a class="comment-user" href="#/u/${encodeURIComponent(c.username)}">👤 ${esc(c.username)}</a><span class="comment-time">${ago(c.created_at)}</span>${canDel ? `<button class="comment-del" data-del="${c.id}">delete</button>` : ''}</div>
      <div class="comment-body">${userText(c.body)}</div>
    </div>`;
  }
  function renderGoalComments(goalId) { return renderComments(goalId, goalById[goalId] ? goalById[goalId].label : goalId); }
  async function renderComments(key, label) {
    // Comments were removed in c154f86. The body below this line has been unreachable ever
    // since, and it still described a discussion where "verified experts and stewards reply" —
    // a claim about people who never existed. Deleted 2026-07-30 rather than left to be found.
    const box = document.getElementById('goal-comments'); if (box) box.innerHTML = '';
  }
  async function loadComments(key) {
    const list = document.getElementById('cm-list'); if (!list) return;
    try {
      const cs = await api.comments(key);
      list.innerHTML = cs.length ? cs.map(commentItem).join('') : '<div class="empty">No comments yet — be the first.</div>';
      list.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => { if (confirm('Delete this comment?')) { await api.delComment(b.dataset.del); loadComments(key); } });
    } catch (ex) { list.innerHTML = `<div class="empty">${esc(ex.message)}</div>`; }
  }
  async function renderHomeComments() {
    const box = document.getElementById('home-comments'); if (box) box.innerHTML = ''; return; // comments removed
    const cs = await api.recentComments();
    if (!cs.length) return;
    box.innerHTML = `<div class="section-title">Latest from the community</div><div class="recent-comments">${cs.map(c => `<a class="rc" href="#/goal/${esc(c.goal_id)}"><div class="rc-head"><span class="comment-user">👤 ${esc(c.username)}</span><span class="rc-goal">${goalById[c.goal_id] ? goalById[c.goal_id].icon + ' ' + goalById[c.goal_id].label : c.goal_id}</span><span class="comment-time">${ago(c.created_at)}</span></div><div class="rc-body">${userText(c.body).slice(0, 240)}</div></a>`).join('')}</div>`;
  }

  // ---------- editing ----------
  const FIELD_LABELS = { mechanism: 'How it works — technical', target: 'Molecular / gene target', plain: 'In plain English', protocol: 'Protocol', watch: 'Watch out', bottom: 'Bottom line' };
  async function enhanceDetail(c) {
    const btn = document.getElementById('edit-btn');
    let currentFields = {}, meta = null;
    try { const d = await api.edits(c.id); if (d.current) { currentFields = d.current.fields || {}; meta = d.current; } window.__editHistory = d.history || []; } catch (e) {}
    // apply community edits over the base for each field
    for (const k of Object.keys(FIELD_LABELS)) {
      const node = document.getElementById('field-' + k);
      if (node && currentFields[k] != null) node.innerHTML = userText(currentFields[k]);
    }
    const metaBox = document.getElementById('edit-meta');
    if (metaBox && meta) metaBox.innerHTML = `✎ Last edited by <b>${esc(meta.username)}</b> ${ago(meta.created_at)}${(window.__editHistory && window.__editHistory.length > 1) ? ` · <a href="#" id="hist-link">${window.__editHistory.length} edits</a>` : ''}`;
    const hl = document.getElementById('hist-link'); if (hl) hl.onclick = e => { e.preventDefault(); openHistory(c); };
    if (btn) {
      const canEdit = ME && (ME.role === 'admin' || (ME.domain === 'pharmacist' && ME.domain_verified));
      if (canEdit) btn.onclick = () => openEditor(c, currentFields);
      else btn.onclick = () => { if (!ME) return openAuth('login'); alert('Compound pages are edited by the site maintainer. Use the Feedback button to send a correction — corrections are welcome and wanted.'); };
    }
    wireCompoundLearning(c);
  }
  // Wire all the learning-first interactions on a compound page (depth toggle, 3D, glossary, learned, PubChem specs, ToC)
  function wireCompoundLearning(c) {
    const root = document.getElementById('cpd-detail'); if (!root) return;
    // Chapter mastery spine — each click SWAPS the whole reading area; steps check off as you visit them,
    // and visiting all of them auto-marks the compound mastered (the reward for finishing the course).
    const chapters = document.getElementById('cpd-chapters');
    const allSteps = [...root.querySelectorAll('.ch-step')];
    const visited = new Set();
    const markComplete = () => {
      if (visited.size >= allSteps.length && allSteps.length && !isLearned(c.id)) {
        toggleLearned(c.id); const lb2 = document.getElementById('learned-btn'); if (lb2) { lb2.classList.add('on'); lb2.textContent = '✓ Learned'; }
        root.querySelector('.ch-steps') && root.querySelector('.ch-steps').classList.add('mastered');
        if (typeof toast === 'function') toast('🎓 ' + c.name + ' — mastered! Added to your knowledge map.');
      }
    };
    const showChapter = (n, scroll) => {
      root.querySelectorAll('.chapter').forEach(sec => sec.classList.toggle('active', sec.getAttribute('data-chapter') === String(n)));
      allSteps.forEach(t => { const on = t.dataset.ch === String(n); t.classList.toggle('active', on); if (on) { t.classList.add('done'); visited.add(n); } });
      markComplete();
      if (scroll && chapters) chapters.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    allSteps.forEach(t => t.onclick = () => showChapter(t.dataset.ch, true));
    if (allSteps[0]) { allSteps[0].classList.add('done'); visited.add(allSteps[0].dataset.ch); }
    root.querySelectorAll('[data-chgo]').forEach(b => b.onclick = () => { if (b.dataset.chgo === 'journey') { const j = document.getElementById('journey'); if (j) j.scrollIntoView({ behavior: 'smooth', block: 'center' }); } else showChapter(b.dataset.chgo, true); });
    // Predict-then-reveal (mechanism) + before-you-go checks — active recall
    root.querySelectorAll('.mc-reveal').forEach(b => b.onclick = () => { const a = b.closest('.mc-body') && b.closest('.mc-body').querySelector('.mc-answer'); if (a) { a.hidden = false; b.closest('.mc-predict').classList.add('revealed'); b.remove(); } });
    root.querySelectorAll('.cc-reveal').forEach(b => b.onclick = () => { const a = b.closest('.ch-check') && b.closest('.ch-check').querySelector('.cc-a'); if (a) { a.hidden = false; b.remove(); } });
    // Feynman "explain it back" — reveal the model answer + share to the community discussion
    wireFeynman();
    // Dose & clearance simulator
    if (c.sim && document.getElementById('dosesim')) wireDoseSim(c.sim);
    // Glossary hover-defs across the readable body (skips links/headings; first mention only)
    resetGlossary();
    root.querySelectorAll('.field-val, .takeaways, .cpd-fact .cf-t, .evg-body, .mc-body p, .pk-note, .analogy p, .biotech .bt-sb, .biotech .bt-lead, .biotech .bt-tg-role, .biotech .bt-adme-row div, .evidence-deep .evd-b, .deeper-one, .framework .fw-a, .myth-t, .contrast p, .whenuse li, .mj-stage-d, .hook-payoff p, .bigidea p').forEach(applyGlossary);
    // Self-test — reveal answers (active recall)
    root.querySelectorAll('.st-reveal').forEach(b => b.onclick = () => { const card = b.closest('.st-card'); const a = card && card.querySelector('.st-a'); if (a) { a.hidden = false; b.remove(); } });
    root.querySelectorAll('.gloss').forEach(g => { g.onclick = e => { e.stopPropagation(); document.querySelectorAll('.gloss.open').forEach(o => o !== g && o.classList.remove('open')); g.classList.toggle('open'); }; });
    document.addEventListener('click', () => root.querySelectorAll('.gloss.open').forEach(o => o.classList.remove('open')), { once: true });
    // Ribbon → jump to the journey card
    const jc = document.getElementById('journey');
    const jr = root.querySelector('.j-ribbon'); if (jr && jc) { jr.style.cursor = 'pointer'; jr.onclick = () => jc.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    // Learned tracking
    const lb = document.getElementById('learned-btn'); if (lb) lb.onclick = () => {
      const on = toggleLearned(c.id); lb.classList.toggle('on', on); lb.textContent = on ? '✓ Learned' : '＋ Mark learned';
      if (on && typeof toast === 'function') toast('Marked learned ✓ — building your knowledge map');
    };
    // 3D molecule — lazy-load the PubChem structure viewer only on tap
    const cid = root.getAttribute('data-cid');
    const b3d = document.getElementById('mol-3d-btn');
    if (b3d && cid) b3d.onclick = () => { const wrap = document.getElementById('mol-3d-wrap'); if (!wrap) return; if (wrap.hasChildNodes()) { wrap.hidden = !wrap.hidden; return; } wrap.innerHTML = `<iframe title="3D structure" loading="lazy" src="https://pubchem.ncbi.nlm.nih.gov/compound/${cid}#section=3D-Conformer&embed=true" allowfullscreen></iframe>`; wrap.hidden = false; b3d.textContent = '🔄 3D structure ↓'; };
    // Molecular formula + weight from PubChem REST (real data, fetched lazily; degrades silently)
    // W5a: `Title` added. On the 13 multi-compound bundle pages the formula belongs to ONE member,
    // and PubChem's own record title is the only non-invented way to say which.
    if (cid) fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/MolecularFormula,MolecularWeight,Title/JSON`).then(r => r.ok ? r.json() : null).then(j => {
      const p = j && j.PropertyTable && j.PropertyTable.Properties && j.PropertyTable.Properties[0]; if (!p) return;
      const setChip = (id, vid, val) => { const el = document.getElementById(id), v = document.getElementById(vid); if (el && v && val) { v.textContent = val; el.hidden = false; } };
      if (p.MolecularFormula) { const mf = document.getElementById('mol-formula'); if (mf) mf.innerHTML = 'Formula <b>' + esc(p.MolecularFormula) + '</b>'; setChip('spec-formula', 'spec-formula-v', p.MolecularFormula); }
      if (p.MolecularWeight) setChip('spec-mw', 'spec-mw-v', Math.round(+p.MolecularWeight) + ' g/mol');
      if (p.Title) {
        const of = document.getElementById('spec-mol-of'); if (of) of.textContent = p.Title;
        const mo = document.getElementById('mol-of'); if (mo) mo.innerHTML = 'This structure is <b>' + esc(p.Title) + '</b> only — one of the compounds named in the title of this page, not the page as a whole.';
      }
    }).catch(() => {});
  }
  // Feynman "explain it back" — a PRIVATE active-recall self-test. The reader writes their own
  // explanation, then "Compare with the expert answer" reveals the model answer. No sharing, no
  // community thread (all commenting removed) — nothing they write leaves the page.
  function wireFeynman() {
    const box = document.querySelector('.feynman'); if (!box) return;
    const btn = document.getElementById('fy-check'); if (!btn) return;
    btn.onclick = () => {
      const m = document.getElementById('fy-model'); if (m) m.hidden = false;
      btn.textContent = 'Model answer shown ↓'; btn.disabled = true;
    };
  }
  // Interactive dose & clearance simulator — the clearance curve is real (exponential decay at the drug's
  // half-life); the ergogenic window and jitter framing are the established teaching shapes.
  function wireDoseSim(s) {
    const doseEl = document.getElementById('ds-dose'), bwEl = document.getElementById('ds-bw'), timeEl = document.getElementById('ds-time');
    const chart = document.getElementById('ds-chart'), readout = document.getElementById('ds-readout');
    if (!doseEl || !chart || !readout) return;
    const fmtHr = h => (h % 12 || 12) + (h < 12 ? 'am' : 'pm');
    const draw = () => {
      const dose = +doseEl.value, bw = +bwEl.value, dt = +timeEl.value;
      document.getElementById('ds-dose-v').textContent = dose;
      document.getElementById('ds-bw-v').textContent = bw;
      document.getElementById('ds-time-v').textContent = fmtHr(dt);
      const perKg = bw ? dose / bw : 0;
      const W = 320, H = 150, pad = 10, hrs = 18; let path = '';
      for (let t = 0; t <= hrs; t += 0.5) { const rem = dose * Math.pow(0.5, t / s.halfLifeH); const x = pad + (t / hrs) * (W - 2 * pad); const y = H - pad - (rem / s.maxDose) * (H - 2 * pad); path += (t === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1); }
      let bedH = 23 - dt; if (bedH < 0) bedH += 24;
      const pctBed = dose ? Math.round(Math.pow(0.5, bedH / s.halfLifeH) * 100) : 0;
      const bedX = pad + (Math.min(bedH, hrs) / hrs) * (W - 2 * pad);
      chart.innerHTML = `<path d="${path}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round"/><line x1="${bedX}" y1="8" x2="${bedX}" y2="${H - 8}" stroke="#7c3aed" stroke-width="1.5" stroke-dasharray="3 3"/><text x="${bedX}" y="16" font-size="12" text-anchor="middle">🌙</text>`;
      const zone = perKg < s.ergoLow ? `<b class="ds-under">below the effective window</b> — likely too little for a real performance boost` : perKg <= s.ergoHigh ? `<b class="ds-good">right in the ergogenic sweet spot</b> — the well-proven zone` : perKg < 9 ? `<b class="ds-over">above the sweet spot</b> — no extra benefit, just more jitter` : `<b class="ds-over">very high</b> — risk territory, zero added upside`;
      const sleep = pctBed >= 25 ? `<b class="ds-over">${pctBed}% is still in you at 11pm</b> — this will likely hurt your sleep` : pctBed >= 10 ? `about ${pctBed}% lingers at bedtime — may lightly disturb sleep` : `only ~${pctBed}% remains by bedtime — sleep should be fine`;
      readout.innerHTML = `That's <b>${perKg.toFixed(1)} mg/kg</b> — ${zone}.<br>${sleep}.`;
    };
    [doseEl, bwEl, timeEl].forEach(el => el.oninput = draw); draw();
  }
  function baseField(c, k) { return k === 'target' ? c.target : c[k]; }
  function openEditor(c, currentFields) {
    const val = k => currentFields[k] != null ? currentFields[k] : (baseField(c, k) || '');
    const rows = Object.entries(FIELD_LABELS).map(([k, lbl]) => `<label class="ed-field"><span>${lbl}</span><textarea data-k="${k}" rows="${k === 'mechanism' || k === 'plain' ? 4 : 2}">${esc(val(k))}</textarea></label>`).join('');
    const m = modal(`<button class="modal-x" id="modal-close">✕</button>
      <h2>Edit: ${esc(c.name)}</h2>
      <p class="modal-sub">Improve the plain-language explanation, fix an error, or add nuance. Your edit is saved with your name and shown to everyone. Keep it factual and cite sources where you can.</p>
      <div class="editor">${rows}
        <label class="ed-field"><span>Edit summary <span class="opt">(optional)</span></span><input id="ed-note" maxlength="200" placeholder="e.g. clarified the dosing, added a 2025 study"></label>
        <div class="auth-err" id="ed-err" hidden></div>
        <div class="ed-actions"><button class="chip" id="ed-cancel">Cancel</button><button class="btn-primary" id="ed-save">Save changes</button></div>
      </div>`);
    m.querySelector('#modal-close').onclick = closeModal;
    m.querySelector('#ed-cancel').onclick = closeModal;
    const err = m.querySelector('#ed-err'), save = m.querySelector('#ed-save');
    save.onclick = async () => {
      const fields = {}; m.querySelectorAll('textarea[data-k]').forEach(t => fields[t.dataset.k] = t.value);
      save.disabled = true; save.textContent = 'Saving…'; err.hidden = true;
      try { await api.saveEdit({ compoundId: c.id, compoundName: c.name, fields, note: m.querySelector('#ed-note').value }); closeModal(); route(); }
      catch (ex) { err.textContent = ex.message; err.hidden = false; save.disabled = false; save.textContent = 'Save changes'; }
    };
  }
  function openHistory(c) {
    const h = window.__editHistory || [];
    modal(`<button class="modal-x" id="modal-close">✕</button><h2>Edit history — ${esc(c.name)}</h2>
      <div class="hist-list">${h.map(e => `<div class="hist-row"><span class="comment-user">👤 ${esc(e.username)}</span><span class="comment-time">${ago(e.created_at)}</span><div class="hist-note">${e.note ? esc(e.note) : '<i>no summary</i>'}</div></div>`).join('') || '<div class="empty">No history.</div>'}</div>`).querySelector('#modal-close').onclick = closeModal;
  }

  // ---------- the mechanism chain: compound → target → pathway → goal ----------
  function explodedDiagram(c) {
    const tgts = (c.targets || []).map(t => `<a class="mnode t" href="#/target/${tkey(t.sym)}" title="${esc(t.name)}">${t.sym}</a>`).join('');
    const paths = (c.pathwayIds || []).map(i => `<a class="mnode p" href="#/pathway/${i}">${D.pathways[i].shortLabel}</a>`).join('');
    const goals = (c.goalIds || []).map(g => `<a class="mnode g" href="#/goal/${g}">${goalById[g].icon} ${goalById[g].label}</a>`).join('');
    if (!tgts && !paths && !goals) return '';
    const stage = (kind, lbl, sub, nodes) => nodes ? `<div class="mstage" data-k="${kind}"><div class="mstage-lbl">${lbl}${sub ? ` <em>${sub}</em>` : ''}</div><div class="mstage-row">${nodes}</div></div>` : '';
    const conn = word => `<div class="mconn"><span class="mconn-word">${word}</span></div>`;
    const parts = [stage('c', 'The compound', '', `<span class="mnode c">${esc(c.name)}</span>`)];
    if (tgts) { parts.push(conn('latches onto')); parts.push(stage('t', 'Its molecular target', 'the exact molecule it grabs in your cells', tgts)); }
    if (paths) { parts.push(conn('which switches')); parts.push(stage('p', 'The pathway', 'the body system it turns up or down', paths)); }
    if (goals) { parts.push(conn('to help your')); parts.push(stage('g', 'Your goal', '', goals)); }
    return `<div class="mech">
      <div class="mech-top"><span class="mech-title">How it works — follow the chain</span>
        <button class="mech-help-btn" data-mechhelp>ⓘ How do I read this?</button></div>
      <div class="mech-guide" id="mech-guide" hidden>Read it top to bottom. <b>${esc(c.name)}</b> latches onto a specific molecule in your cells — its <b>target</b>. That flips a whole body system — a <b>pathway</b> — up or down. And that change is what pushes your <b>goal</b>. Tap any box to explore it in depth.</div>
      <div class="mech-chain">${parts.join('')}</div>
    </div>`;
  }

  // ---------- interactive pathway diagram ----------
  function pathwayDiagram(spec, hub) {
    if (!spec) return '';
    const chip = (label, cls) => { const c = findCpt(label); return c ? `<a class="pd-chip ${cls}" href="#/c/${slug(c.name)}">${esc(label)}</a>` : `<span class="pd-chip ${cls} static">${esc(label)}</span>`; };
    const eff = (label, dir) => `<span class="pd-eff ${dir}"><span class="pd-arrow">${dir === 'up' ? '▲' : '▼'}</span>${esc(label)}</span>`;
    const goalChip = (label) => { const g = goalByLabel[label.toLowerCase()]; return g ? `<a class="pd-goal" href="#/goal/${g.id}">${g.icon} ${g.label}</a>` : `<span class="pd-goal static">${esc(label)}</span>`; };
    const on = (spec.on || []).map(x => chip(x, 'on')).join('');
    const off = (spec.off || []).map(x => chip(x, 'off')).join('');
    const up = (spec.up || []).map(x => eff(x, 'up')).join('');
    const down = (spec.down || []).map(x => eff(x, 'down')).join('');
    const goals = (spec.goals || []).map(goalChip).join('');
    return `<div class="pdiagram">
      <div class="pd-legend"><b>How to read this map.</b> Left = what flips this system on or off. Middle = the system itself. Right = what it changes in your body — <span class="pd-eff up"><span class="pd-arrow">▲</span>more</span> or <span class="pd-eff down"><span class="pd-arrow">▼</span>less</span>. Tap anything highlighted to explore it.</div>
      <div class="pd-flow">
        <div class="pd-col">
          ${on ? `<div class="pd-coltitle green">Switches it ON</div><div class="pd-chips">${on}</div>` : ''}
          ${off ? `<div class="pd-coltitle red">Switches it OFF</div><div class="pd-chips">${off}</div>` : ''}
        </div>
        <div class="pd-arrowcol"><span class="pd-flowarrow"></span></div>
        <div class="pd-hubwrap"><div class="pd-hub">${esc(hub)}</div></div>
        <div class="pd-arrowcol"><span class="pd-flowarrow"></span></div>
        <div class="pd-col">
          ${up ? `<div class="pd-coltitle">Turns UP</div><div class="pd-chips">${up}</div>` : ''}
          ${down ? `<div class="pd-coltitle">Turns DOWN</div><div class="pd-chips">${down}</div>` : ''}
        </div>
      </div>
      ${goals ? `<div class="pd-goals"><span class="pd-goalslbl">Helps with</span>${goals}</div>` : ''}
    </div>`;
  }

  // ---------- "go deeper" on compound pages: pull in the pathway lesson ----------
  function goDeeper(c) {
    // Anchor on ONE pathway (the compound's primary system) — guide the reader on what a "pathway" even is,
    // so the label isn't confusing, and keep the onward link quiet (the chapter's "Next →" is the real CTA).
    const i = (c.pathwayIds || [])[0]; if (i == null || !D.pathways[i]) return '';
    const p = D.pathways[i];
    return `<div class="deeper">
      <div class="deeper-block">
        <div class="deeper-name">🧬 The bigger picture — the <a href="#/pathway/${i}">${p.shortLabel}</a> system</div>
        <p class="deeper-one">Here's the way to think about it: a <b>pathway</b> is one of your body's master control levers — turn it up or down and lots of things shift at once. Everything above is <i>how ${esc(c.name)} grabs this lever</i>; the map below is the lever itself.${p.oneLine ? ` In short: ${mdInline(p.oneLine)}` : ''}</p>
        ${pathwayDiagram(p.diagram, p.shortLabel)}
        <a class="deeper-link quiet" href="#/pathway/${i}">Explore the full ${p.shortLabel} pathway when you're ready →</a>
      </div>
    </div>`;
  }

  // ---------- views ----------
  // ---------- landing funnel: match a typed query to a protocol problem ----------
  // W4.5 (2026-08-02): THE HERO TYPEAHEAD AND THE PAGE IT SUBMITS TO ARE NOW ONE RANKING.
  // What used to be here was `protoSuggestIndex()` + `suggestProtocols()` — a THIRD scoring loop,
  // over a THIRD index, with its own weights (14/10/7/2, unanchored `includes`, no stopwords, no
  // authored aliases, top 7 with no relative cut). W2.5b took it off the destination path and left
  // it as the typeahead with the note "a typeahead that is sometimes wrong costs a glance, not a
  // diagnosis". Measured, that is not what it cost.
  // MEASURED HYDRATED, real browser at 390x844, 10 real queries, 0 pageerrors
  // (qa/out/w45c_before.json): the hero dropdown and /solve?q=<the same words> returned
  // DIFFERENT LISTS ON 10 OF 10, and disagreed on the TOP HIT on 2 of 10 —
  //   "high blood sugar"  hero: Blood Pressure, Cravings, Cholesterol …  /solve: Insulin Resistance
  //   "tired after lunch" hero: Burnout, Knee Pain, Brain Fog …          /solve: Chronic Fatigue
  // The reader types once. The list under the box and the page the same keystroke submits to are
  // the same question asked twice, and the site gave two answers — with the worse one on top,
  // because the hero index has no stopword list and no data/solve_aliases.json.
  // rankProblems() is the one loop: server.js searchSolve() is pinned to it by the solve-q-parity
  // gate and both are held to 20 real queries by solveBattery, so unifying here inherits both.
  // The typeahead needs three fields the raw problem record does not name, so they are derived
  // here — causeCount is the AUTHORED cause count (why.causes), not root_causes.length: 31 of 41
  // problems ship exactly one root cause while describing 4-7 causes, which is precisely the set
  // where the differential matters.
  function suggestProtocols(q) {
    return rankProblems(q).map(({ p }) => ({
      id: p.id, name: p.name, icon: p.icon || '•', kind: p.kind, category: p.category,
      causeCount: ((p.why && p.why.causes) || []).length,
    }));
  }

  // ---------- intake: route to the guided assessment when the problem has one ----------
  function openIntake(pid) {
    const p = problemById[pid]; if (!p) { navigate('/solve'); return; }
    // single root cause -> no question needed, go straight in
    if (p.root_causes.length === 1) { navigate('/protocol/' + p.id + '/' + p.root_causes[0].id); return; }
    // a clinician-authored triage (data/assessments.json) takes precedence over the plain picker
    if (p.assessment && p.assessment.questions && p.assessment.questions.length) return openAssessment(p);
    return openIntakeBasic(p);
  }

  // sum option weights across answered questions -> ranked root-cause ids
  function assessScore(A, answers) {
    const sc = {};
    A.questions.forEach(q => { const ai = answers[q.id]; if (ai == null) return; const w = (q.options[ai] || {}).weights || {}; for (const rc in w) sc[rc] = (sc[rc] || 0) + w[rc]; });
    return { sc, ranked: Object.keys(sc).sort((a, b) => sc[b] - sc[a]) };
  }

  // ---------- guided clinical assessment (physio-style triage in the modal) ----------
  // Steps: differentiator questions -> red-flag safety screen -> result (recommend + reasoning, or refer out).
  function openAssessment(p) {
    const A = p.assessment;
    if (!A || !A.questions || !A.questions.length) return openIntakeBasic(p);
    const answers = {}; const flagsOn = new Set();
    const Q = A.questions.length; let step = 0; // 0..Q-1 questions · Q red-flags · Q+1 result
    const m = modal(''); const box = m.querySelector('.modal'); box.classList.add('assess-modal');
    const dots = active => `<div class="assess-dots">${Array.from({ length: Q + 1 }, (_, i) => `<span class="${i === active ? 'on' : i < active ? 'done' : ''}"></span>`).join('')}</div>`;
    const top = (active, backable) => `<div class="assess-top"><button class="assess-back" ${backable ? '' : 'disabled'} data-back>←</button>${dots(active)}<button class="assess-x" data-x aria-label="Close">✕</button></div>`;
    function render() {
      if (step < Q) {
        const q = A.questions[step];
        box.innerHTML = `${top(step, step > 0)}
          <div class="assess-kicker">${p.icon || ''} ${esc(p.name)} · quick check</div>
          <h2 class="assess-q">${esc(q.q)}</h2>
          <div class="assess-opts">${q.options.map((o, i) => `<button class="assess-opt ${answers[q.id] === i ? 'sel' : ''}" data-opt="${i}">${esc(o.label)}<span class="ao-go">→</span></button>`).join('')}</div>`;
        box.querySelectorAll('[data-opt]').forEach(b => b.onclick = () => { answers[q.id] = +b.dataset.opt; step++; render(); });
      } else if (step === Q) {
        const rf = A.redFlags || { flags: [] };
        box.innerHTML = `${top(step, true)}
          <div class="assess-kicker">${esc(p.name)} · safety check</div>
          <h2 class="assess-q">${esc(rf.q || 'Any of these?')}</h2>
          ${rf.sub ? `<p class="assess-sub">${esc(rf.sub)}</p>` : ''}
          <div class="assess-flags">${(rf.flags || []).map((f, i) => `<label class="assess-flag ${flagsOn.has(i) ? 'on' : ''}"><input type="checkbox" data-flag="${i}" ${flagsOn.has(i) ? 'checked' : ''}><span>${esc(f)}</span></label>`).join('')}</div>
          <button class="assess-continue" data-result>See my result →</button>`;
        box.querySelectorAll('[data-flag]').forEach(cb => cb.onchange = () => { const i = +cb.dataset.flag; cb.checked ? flagsOn.add(i) : flagsOn.delete(i); cb.closest('.assess-flag').classList.toggle('on', cb.checked); });
        box.querySelector('[data-result]').onclick = () => { step++; render(); };
      } else {
        if (flagsOn.size) {
          const rf = A.redFlags || {};
          // Emergency tier (added 2026-07-28). Some red flags are not "see someone soon", they are
          // "this could be happening right now". The neck-shoulder page's own reassess prose opens
          // with referred cardiac pain as *call emergency services now*, yet the quiz -- which is
          // the entry point most readers actually tap -- did not carry that flag at all, so someone
          // with anginal-equivalent symptoms could pass straight through into a stretching plan.
          // These flags now escalate to 995 / A&E instead of the generic "see a clinician" card,
          // and the option to continue to the protocol anyway is withheld.
          const emerg = Array.isArray(rf.emergencyIdx) && rf.emergencyIdx.some(i => flagsOn.has(i));
          box.innerHTML = `<div class="assess-top"><button class="assess-back" data-back>←</button><span></span><button class="assess-x" data-x aria-label="Close">✕</button></div>
            <div class="assess-result redflag${emerg ? ' emergency' : ''}"><div class="assess-rf-ic">${emerg ? '🚨' : '⚠️'}</div>
              <h2>${emerg ? 'This needs emergency care now' : 'See a clinician first'}</h2>
              <p>${esc(emerg ? (rf.emergencyMessage || 'Call your local emergency number now — 999, 911, 112, 995 or 000 depending on where you are.') : (rf.message || 'Please get this assessed in person before starting a self-care plan.'))}</p>
              ${emerg ? '<p class="assess-emerg-num"><b>Call your local emergency number</b> — 999 · 911 · 112 · 995 · 000 — or go straight to an emergency department</p>' : ''}
              <div class="assess-actions">${emerg ? '' : '<button class="assess-go2" data-anyway>Show the protocol for background</button>'}<button class="assess-close2" data-x>Close</button></div></div>`;
        } else {
          const { sc, ranked } = assessScore(A, answers);
          const topId = ranked[0] || p.root_causes[0].id;
          const rc = p.root_causes.find(r => r.id === topId) || p.root_causes[0];
          const second = ranked[1] && p.root_causes.find(r => r.id === ranked[1]);
          const nearTie = second && (sc[ranked[0]] - sc[ranked[1]] <= 1);
          const chosen = A.questions.map(q => answers[q.id] != null ? q.options[answers[q.id]].label : null).filter(Boolean);
          box.innerHTML = `<div class="assess-top"><button class="assess-back" data-back>←</button><span></span><button class="assess-x" data-x aria-label="Close">✕</button></div>
            <div class="assess-result"><div class="assess-kicker">Your quick check</div>
              <h2>Most likely: ${esc(rc.name.replace(/\s*\([^)]*\)\s*$/, ''))}</h2>
              ${chosen.length ? `<p class="assess-why">Based on your answers — <b>${chosen.map(esc).join('</b> · <b>')}</b> — this most closely matches ${esc(rc.name)}.</p>` : ''}
              ${rc.plain ? `<p class="assess-plain">${esc(rc.plain)}</p>` : ''}
              ${nearTie ? `<p class="assess-alt">It could also be <b>${esc(second.name)}</b> — you can switch on the next screen.</p>` : ''}
              <div class="assess-actions"><button class="assess-go2 primary" data-go="${rc.id}">See your protocol →</button><button class="assess-switch" data-switch>Show me the other causes</button></div>
              <p class="assess-disclaimer">${esc(A.notMedicalAdvice || 'Educational self-check, not a diagnosis.')}</p></div>`;
        }
        const go = box.querySelector('[data-go]'); if (go) go.onclick = () => { closeModal(); navigate('/protocol/' + p.id + '/' + go.dataset.go); };
        const anyway = box.querySelector('[data-anyway]'); if (anyway) anyway.onclick = () => { const { ranked } = assessScore(A, answers); closeModal(); navigate('/protocol/' + p.id + '/' + (ranked[0] || p.root_causes[0].id)); };
        const sw = box.querySelector('[data-switch]'); if (sw) sw.onclick = () => openIntakeBasic(p);
      }
      const back = box.querySelector('[data-back]'); if (back && !back.disabled) back.onclick = () => { if (step > 0) { step--; render(); } };
      box.querySelectorAll('[data-x]').forEach(x => x.onclick = () => closeModal());
    }
    render();
  }

  // ---------- basic intake: the plain "which sounds like you" picker (fallback) ----------
  function openIntakeBasic(p) {
    // Lead with the plain-English "this sounds like me" symptom line; keep the clinical
    // label as a small secondary tag so the question is answerable by anyone.
    const clinTag = rc => { const n = (rc.name || '').replace(/\s*\([^)]*\)\s*$/, '').trim(); return n ? `<span class="io-clin">${esc(n)}</span>` : ''; };
    const opts = p.root_causes.map((rc, i) => `
      <button class="intake-opt" data-rc="${rc.id}">
        <span class="io-i">${i + 1}</span>
        <span class="io-b"><b>${esc(rc.plain || rc.diagnostic || rc.name)}</b>${rc.plain && rc.diagnostic ? `<small>${esc(rc.diagnostic)}</small>` : ''}${clinTag(rc)}</span>
        <span class="io-go">→</span>
      </button>`).join('');
    const m = modal(`
      <div class="intake">
        <div class="intake-head">
          <span class="kicker">${p.kind === 'want' ? 'Reach a goal' : 'Fix a problem'} · ${esc(p.category)}</span>
          <h2>${p.icon} ${esc(p.name)}</h2>
          <p>Which sounds most like you? Pick the closest — it just points your protocol at ${p.kind === 'want' ? 'the <b>right lever</b>' : 'the <b>root cause</b>'}, and you can switch anytime.</p>
        </div>
        <div class="intake-opts">${opts}</div>
        <button class="intake-skip" data-rc="${p.root_causes[0].id}">Not sure — show me the most common one</button>
      </div>`);
    m.querySelectorAll('[data-rc]').forEach(b => b.onclick = () => { closeModal(); navigate('/protocol/' + p.id + '/' + b.dataset.rc); });
  }

  // ---------- universal cause-finder: EVERY protocol gets a "which cause is yours" step ----------
  // Prefers a hand-authored clinical assessment (scores root_causes). Otherwise builds a symptom
  // picker from the educational why.causes and opens the matching cause (its fixes = its default plan).
  // Scored "find your cause" quiz over why.causes — a few discriminating questions → opens the winning cause.
  function openCauseQuiz(p) {
    const quiz = p.causeQuiz; const causes = (p.why && p.why.causes || []).slice().sort((a, b) => (a.rank || 9) - (b.rank || 9));
    if (!quiz || !Array.isArray(quiz.questions) || !quiz.questions.length || !causes.length) return goToCause(p, 0);
    const Q = quiz.questions.length; let step = 0; const answers = {};
    const m = modal(''); const box = m.querySelector('.modal'); box.classList.add('assess-modal');
    const dots = a => `<div class="assess-dots">${Array.from({ length: Q }, (_, i) => `<span class="${i === a ? 'on' : i < a ? 'done' : ''}"></span>`).join('')}</div>`;
    function render() {
      if (step < Q) {
        const q = quiz.questions[step];
        box.innerHTML = `<div class="assess-top">${step > 0 ? '<button class="assess-back" data-back>←</button>' : '<span></span>'}${dots(step)}<button class="assess-x" data-x aria-label="Close">✕</button></div>
          <div class="assess-kicker">${p.icon || ''} ${esc(p.name)} · find your cause</div>
          <h2 class="assess-q">${esc(q.q)}</h2>
          <div class="assess-opts">${(q.options || []).map((o, i) => `<button class="assess-opt ${answers[step] === i ? 'sel' : ''}" data-opt="${i}">${esc(o.label)}<span class="ao-go">→</span></button>`).join('')}</div>`;
        box.querySelectorAll('[data-opt]').forEach(b => b.onclick = () => { answers[step] = +b.dataset.opt; step++; render(); });
      } else {
        const sc = causes.map(() => 0);
        quiz.questions.forEach((q, qi) => { const oi = answers[qi]; if (oi == null) return; ((q.options[oi] || {}).causes || []).forEach(ci => { if (sc[ci] != null) sc[ci]++; }); });
        const ranked = sc.map((s, i) => ({ i, s })).sort((a, b) => b.s - a.s);
        const top = (ranked[0] && ranked[0].s > 0) ? ranked[0].i : 0;
        const c = causes[top]; const near = ranked[1] && ranked[1].s > 0 && (ranked[0].s - ranked[1].s <= 1);
        // THE QUIZ USED TO CONTRADICT THE PAGE IT WAS ON (measured hydrated 2026-08-01, all 52
        // protocol routes x2 answer paths). It called openCauseInAccordion(top), which only sets
        // `open` on a <details>: the URL, the tab title, the h1 sub-line and the entire
        // Move/Fuel/Stack plan below still belonged to the URL's cause. On 39 of 52 routes the
        // accordion jumped to a DIFFERENT cause with the h1 unchanged on 39/39 -- e.g.
        // /protocol/knee-pain/patellar-tendinopathy, sub-line "Patellar tendinopathy (tendon
        // overload)", quiz says "This looks most like: Hip & quad weakness with patellofemoral
        // pain", accordion jumps to index 0, URL unmoved. That is the D3 contradiction class,
        // rebuilt inside the one control that exists to resolve it.
        // A quiz result is a DESTINATION, so it is a real <a href>: shareable, middle-clickable,
        // gate-able, and it cannot desync a page it is leaving.
        const dest = causeDestination(p, top);
        const nat = dest.indexOf('/problem/') === 0 ? ' data-native' : '';
        box.innerHTML = `<div class="assess-top"><button class="assess-back" data-back>←</button><span></span><button class="assess-x" data-x aria-label="Close">✕</button></div>
          <div class="assess-result"><div class="assess-kicker">Your quick check</div>
            <h2>This looks most like: ${esc(c.name)}</h2>
            ${causeHook(c) ? `<p class="assess-plain">${mdInline(causeHook(c))}</p>` : ''}
            ${near ? `<p class="assess-alt">It could also be <b>${esc(causes[ranked[1].i].name)}</b> — worth reading both.</p>` : ''}
            <div class="assess-actions"><a class="assess-go2 primary" href="${dest}"${nat} data-go="${top}">Read this cause &amp; its plan →</a><a class="assess-switch" href="/problem/${esc(p.id)}" data-native data-all>Show me all the causes</a></div>
            <p class="assess-disclaimer">A quick self-check to point you to the likely cause — not a diagnosis.</p></div>`;
        // The /protocol destination is an in-app navigation, so the modal has to be dismissed by
        // hand; the /problem one is a real page load and takes the modal with it. Not
        // preventDefault-ed: the global interceptor (or the browser, for data-native) does the
        // navigating, and this only closes the overlay in front of it.
        box.querySelectorAll('[data-go], [data-all]').forEach(a => a.addEventListener('click', () => closeModal()));
      }
      const back = box.querySelector('[data-back]'); if (back) back.onclick = () => { if (step > 0) { step--; render(); } };
      box.querySelectorAll('[data-x]').forEach(x => x.onclick = () => closeModal());
    }
    render();
  }
  function openCauseFinder(problem) {
    if (problem.causeQuiz && problem.causeQuiz.questions && problem.causeQuiz.questions.length) return openCauseQuiz(problem);
    if (problem.assessment && problem.assessment.questions && problem.assessment.questions.length) return openAssessment(problem);
    if (problem.root_causes && problem.root_causes.length > 1) return openIntakeBasic(problem);
    const w = problem.why; const causes = (w && Array.isArray(w.causes)) ? w.causes.slice().sort((a, b) => (a.rank || 9) - (b.rank || 9)) : [];
    if (!causes.length) return openIntakeBasic(problem);
    const opts = causes.map((c, i) => `<button class="intake-opt" data-cause="${i}"><span class="io-i">${c.rank || i + 1}</span><span class="io-b"><b>${esc(causeHook(c) || c.name)}</b><small>${esc(c.name)}</small></span><span class="io-go">→</span></button>`).join('');
    modal(`<div class="intake">
      <div class="intake-head"><span class="kicker">${esc(problem.category)} · quick check</span>
        <h2>${problem.icon || ''} Which sounds most like you?</h2>
        <p>Your ${esc(problem.name.toLowerCase())} can come from any of these — sometimes more than one. Pick the symptoms that fit and it opens that cause and its plan. Nothing here is a diagnosis.</p></div>
      <div class="intake-opts">${opts}</div>
      <button class="intake-skip" data-cause="0">Not sure — start with the highest-leverage cause</button>
    </div>`).querySelectorAll('[data-cause]').forEach(b => b.onclick = () => { closeModal(); goToCause(problem, +b.dataset.cause); });
  }
  // openCauseInAccordion() DELETED 2026-08-01. It set `open` on one <details> and nothing else, so
  // every caller left the URL, the tab title, the h1 sub-line and the whole Move/Fuel/Stack plan
  // belonging to a cause the reader had just been told was not theirs — measured on 39 of 52
  // protocol routes. Its three callers now use goToCause(), which navigates to a route that
  // actually serves that cause. If you are about to re-add it, the thing you want is a link.

  // ---- THE HOME PAGE HAS EXACTLY ONE SOURCE (2026-07-30) ---------------------------------------
  // build/prerender.js -> site/home.html. app.js does NOT render the home page any more. It
  // captures the server-rendered markup at boot and replays that exact string for client-side
  // navigations back to "/".
  //
  // What this replaces: a ~150-line second renderer that had drifted into a different page from the
  // prerendered one -- the prerendered home had no search input and no seed chips, so the ~90% of
  // traffic that never runs JavaScript could not use the page's FIRST call to action; the SPA had no
  // problem list and no crawlable goal labels. Sixth recorded instance of this exact failure on this
  // project ("build a prerendered page, forget the hydrated twin" -- see the note above nlForm()).
  //
  // WHY CAPTURE, AND NOT A SHARED RENDERER MODULE. A shared module is the obvious answer and it is
  // the wrong one: every block of this page is a function of D -- goal counts, regulatory_class
  // splits, seed chips, the worked example's root-cause record. Sharing the renderer means two
  // callers, each building a D and each needing to be kept in step, which is the same drift surface
  // one level down. Capture has no call site to keep in step, and no second copy of anything.
  //
  // WHY IT IS SAFE. package.json prestart is `node build/parse.js && node build/prerender.js` with
  // no `|| echo`, so a prerender failure stops the deploy and site/home.html is guaranteed present
  // at boot (CLAUDE.md still describes the old swallowing behaviour; it is stale). server.js serves
  // it for "/".
  let HOME_HTML = '';
  let _firstPaint = true;
  let _homeFetching = false;
  function home() {
    if (HOME_HTML) return HOME_HTML;
    // Only reachable when the first paint was some OTHER route and the reader then navigated to "/"
    // client-side. The tempting fix is a small hand-written stand-in hero -- but that is precisely
    // the second copy this change exists to delete, and a degraded twin drifts just as happily as a
    // full one. So: fetch the one source, and show a loading stub for the ~100ms in between. That is
    // already this router's pattern for /protocol, /plan, /pro, /fork and /s.
    if (!_homeFetching) {
      _homeFetching = true;
      fetch('/', { credentials: 'same-origin' })
        .then((r) => r.text())
        .then((t) => {
          const m = t.match(/<main id="app">([\s\S]*)<\/main>/);
          if (!m) return;
          HOME_HTML = m[1];
          // Still on "/"? Swap it in. If the reader has moved on, keep the cache and do nothing.
          if (!currentRoute().split('?')[0].split('/').filter(Boolean).length) {
            app.innerHTML = HOME_HTML;
            bindHome();
          }
        })
        .catch(() => { })
        .then(() => { _homeFetching = false; });
    }
    return '<div class="empty"><h1>Loading…</h1></div>';
  }

  // The prerendered daily fact is stamped at deploy time, the fact is date-derived, and a container
  // can run for days -- so a build-stamped fact goes stale. This is the one legitimate reason for JS
  // to change home markup, and it does so IN PLACE: two text nodes and an href. Patching nodes is
  // not a second renderer. Re-emitting the card would be, so the card, its kicker and its structure
  // stay in build/prerender.js.
  function refreshDailyFact() {
    const F = window.RNAWIKI_FACTS || [];
    const card = document.querySelector('.daily-fact .df-card');
    if (!card || !F.length) return;
    const f = F[Math.floor(Date.now() / 864e5) % F.length];
    const t = card.querySelector('.df-text');
    const a = card.querySelector('.df-link');
    if (t) t.innerHTML = f.t;
    if (a) { a.textContent = f.label; a.setAttribute('href', f.href); }
  }

  // The newsletter's completion state. The MESSAGE is authored once, in build/prerender.js, hidden
  // by default; server.js un-hides it for readers without JS when it serves "/?subscribed=1".
  // Here we set it from the query on every bind, so a stale "you're in" cannot survive a
  // client-side navigation back to "/" via the captured string.
  function syncNlNotice() {
    const q = new URLSearchParams(location.search);
    const ok = q.get('subscribed');
    const err = q.get('suberr');
    document.querySelectorAll('.nl-done').forEach((e) => { e.style.display = ok ? 'block' : 'none'; });
    document.querySelectorAll('.nl-bad').forEach((e) => {
      if (err) e.textContent = err;
      e.style.display = err ? 'block' : 'none';
    });
  }

  // scroll-triggered reveal for landing sections (respects reduced-motion; degrades to visible)
  function revealOnScroll() {
    const els = app.querySelectorAll('.reveal');
    if (!els.length) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); obs.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    // `.armed` is what actually applies opacity:0 (see the note on `.reveal` in styles.css). It is
    // added HERE, one statement before the observer starts watching, so an element can only ever be
    // hidden when the thing that un-hides it already exists. Previously the CSS hid every `.reveal`
    // unconditionally and this observer was the only way back -- so no JS, a JS error above this
    // line, or a `.reveal` class pasted into a prerendered page all meant permanently blank content
    // for the ~90% of readers who never run JavaScript.
    els.forEach(e => { e.classList.add('armed'); io.observe(e); });
  }

  // Scroll-driven "scrollytelling": a pinned stage whose frames advance as the
  // user scrolls through a tall section. Progress (0..1) drives the active step,
  // the mock-up frame, the nutrient bars and the progress dots — the module is
  // literally moved by the scrollbar, not just revealed once.
  // initScrolly() removed 2026-07-30 — unreachable, see the /pros note in route().

  // wire the landing funnel (autosuggest + intake routing)
  // REMOVED 2026-07-30: mountHomeStacks(). It rendered `#home-stacks` from GET /api/forks/popular,
  // which filters `WHERE f.clones > 0`; the 21 demo forks were deleted in round 5 and no real ones
  // exist, so the endpoint returns [] and the renderer's first act was `el.style.display='none'`.
  // Measured 0px tall on the live page. The section and its container are gone from the home markup.
  // `api.popularForks()` is KEPT -- mountPopularForks() still uses it elsewhere.

  // bindHome() IS BIND-ONLY. It must never create markup: the home page's markup has exactly one
  // source, build/prerender.js. Everything below attaches behaviour to nodes that are already in the
  // document, or patches a value that is genuinely time-dependent (the daily fact, the newsletter
  // notice). If you find yourself writing HTML in here, the change belongs in build/prerender.js.
  function bindHome() {
    refreshDailyFact();
    syncNlNotice();
    // Deliberately NOT called here any more, each with the block it served:
    //   revealOnScroll()           -- the home page emits no `.reveal` at all now. Kept for /gp,
    //                                 /pros and the other SPA-only landing pages that still use it.
    //   mountHomeStacks()          -- deleted, see above.
    //   initScrolly('scrolly-how') -- the scrollytelling block is replaced by the static `.wex`
    //                                 worked example. initScrolly() itself STAYS: /pros calls it.
    // `const form` is gone with the submit handler below — nothing binds the hero form any more.
    const inp = document.getElementById('hero-solve-input');
    const out = document.getElementById('hero-solve-out');
    if (!inp) return;
    let active = -1, current = [];
    const paint = list => {
      current = list; active = -1;
      if (!list.length) {
        if (inp.value.trim().length >= 3) {
          // type="button" is load-bearing: these buttons now live inside a real <form>, and a
          // <button> with no type defaults to type="submit" -- so without this, clicking a
          // suggestion would submit the form to /solve instead of opening the triage modal.
          out.innerHTML = `<button type="button" class="funnel-hit funnel-req" id="hero-req"><span class="fh-i">✨</span><span class="fh-b"><b>Don’t see it? Request this protocol</b><small>Tell me what you need — takes 10 seconds</small></span></button>`;
          out.hidden = false;
          const rb = document.getElementById('hero-req'); if (rb) rb.onclick = () => { out.hidden = true; openRequestModal(inp.value.trim()); };
        } else { out.hidden = true; out.innerHTML = ''; }
        return;
      }
      // Anchors, not buttons (W2.5b, 2026-08-01). These used to call openIntake(), which jumps
      // straight to /protocol/<p>/<root_causes[0]> whenever a problem has ONE root cause -- 31 of
      // 41 problems, every one of which describes 4-7 authored causes. A real link to the
      // differential is the same one tap, and it is shareable, middle-clickable and honest about
      // where it goes. data-native because /problem is prerender-only (KEEP_PRERENDERED): an
      // intercepted click would land on notFound().
      out.innerHTML = list.map((p, i) => `<a class="funnel-hit" href="/problem/${p.id}" data-native data-pid="${p.id}" data-i="${i}">
        <span class="fh-i">${p.icon}</span>
        <span class="fh-b"><b>${esc(p.name)}</b><small>${esc(p.category)} · ${p.kind === 'want' ? 'goal' : 'problem'}${p.causeCount ? ` · ${p.causeCount} possible cause${p.causeCount === 1 ? '' : 's'}` : ''}</small></span></a>`).join('');
      out.hidden = false;
    };
    // CTA #1 NOW GOES WHERE THE FUNNEL GOES (W2.5b, 2026-08-01).
    // What this replaces: go() called openIntake(list[0]) -- it picked the reader's problem AND,
    // for the 31 of 41 problems with a single root cause, their diagnosis, then navigated to the
    // protocol. Measured hydrated on 10 real queries: 5 landed on a protocol having been asked
    // nothing, 4 opened a modal, 1 reached /solve. That is the exact sequencing defect W2 removed
    // from /solve, alive on the site's FIRST call to action.
    // It also ran a THIRD ranking loop. suggestProtocols() here, rankProblems() on /solve,
    // searchSolve() in server.js -- and they disagree: "hair falling out" returned Hair Loss here
    // and insomnia on /solve. Letting the form submit deletes this loop as an arbiter of
    // destination and leaves ONE ranking for both documents.
    // W4.5 (2026-08-02): and now as an arbiter of the LIST too. suggestProtocols() is a thin
    // adapter over rankProblems(); the third index and the third set of weights are deleted. The
    // W2.5b note here read "a typeahead that is sometimes wrong costs a glance, not a diagnosis" --
    // measured hydrated on 10 real queries, it cost more than a glance: the dropdown and
    // /solve?q=<the same words> returned different lists on 10 of 10 and different TOP HITS on 2,
    // "high blood sugar" showing Blood Pressure here and Insulin Resistance there. See
    // heroTypeaheadIsTheSolveRanking in scripts/smoke.mjs.
    // Returns true when it handled the key, so the caller knows whether to preventDefault.
    const go = () => {
      if (active >= 0 && current[active]) { location.assign('/problem/' + current[active].id); return true; }
      return false;   // fall through: the real <form action="/solve" method="get"> submits
    };
    inp.addEventListener('input', () => paint(suggestProtocols(inp.value)));
    inp.addEventListener('focus', () => { if (inp.value) paint(suggestProtocols(inp.value)); });
    inp.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, current.length - 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(active - 1, 0); }
      else if (e.key === 'Enter') { if (go()) e.preventDefault(); return; }   // no selection -> let the form submit to /solve
      else return;
      out.querySelectorAll('.funnel-hit').forEach((h, i) => h.classList.toggle('on', i === active));
    });
    // NO submit handler. The hero is a real <form action="/solve" method="get"> and it now submits
    // for everyone, so a JS reader and a no-JS reader land on the same page, ranked by the same
    // loop. This line used to be `e.preventDefault(); go();`, which meant W2's /solve?q= work
    // benefited only the ~90% who never run JavaScript -- the ~10% who do were routed past it into
    // a protocol page (5 of 10 measured queries) or a modal (4 of 10).
    // close the dropdown on outside click — bind the document listener once, resolve the element live
    if (!bindHome._clickBound) {
      bindHome._clickBound = true;
      document.addEventListener('click', e => {
        const o = document.getElementById('hero-solve-out');
        if (o && !e.target.closest('.funnel-search')) o.hidden = true;
      });
    }
    // The seed chips are real links and now simply work. This handler used to preventDefault them
    // into openIntake(), i.e. into the same skip-the-differential path as the hero submit: for a
    // single-root-cause problem openIntake navigates straight to /protocol/<p>/<rc0>. With
    // prerender.js pointing the chip at /problem/<id> (same commit), the JS reader and the no-JS
    // reader now follow the same link to the same page.
    // The worked example's closing link returns the reader to CTA #1. href="#top" + data-scroll
    // (an existing handler) does the scrolling in both documents; this only adds the focus, so the
    // caret is already in the search box when the scroll lands.
    document.querySelectorAll('[data-focus-search]').forEach(a => a.addEventListener('click', () => {
      setTimeout(() => { const i = document.getElementById('hero-solve-input'); if (i) i.focus({ preventScroll: true }); }, 450);
    }));
  }

  // ---------- legend (what the stars & colours mean) ----------
  // W5a (2026-08-02) — FELIX'S DECISION, APPLIED. This page said one thing to a crawler and the
  // opposite to a reader, and the reader's version broke the site's own hardest constraint.
  //   HYDRATED (what every human got):     "🏷️ Legal status — colour = how you can (legally) get it"
  //   PRERENDERED (what crawlers got):     "A badge says who has approved a molecule. It is not a
  //                                         statement about where you can buy it. A medicine can be
  //                                         approved and still be prescription-only."
  // app.js's own comment at regClass() records that exactly this misreading once printed "available
  // over the counter — Guardian, Watsons" on seven prescription-only medicines. Under the Medicines
  // Act 1975 s.51 and the Medicines (Medical Advertisements) Regulations — prior permit, no
  // educational exemption — telling the public that a colour tells them how to obtain a
  // prescription-only medicine is the exposure. /legend is the page every star and badge points at,
  // so the wrong version was the one every human read. Hydrated was also 128 words against 257
  // prerendered: the missing half was the Availability section and the method link.
  //
  // THE RULE NOW, in one sentence a reader can hold: a colour is what a REGULATOR has decided about
  // the molecule; how you get it is a separate line; and NOTHING here is a person's opinion — no
  // clinician has reviewed these pages and the page says so in its own words rather than leaving
  // the reader to assume. That last part is why the "who decides" block exists at all.
  function legendBlock() {
    const ev = [5, 4, 3, 2, 1].map((n) => [n, {
      5: 'Consistent, replicated human trials',
      4: 'Good human evidence, some inconsistency',
      3: 'Mixed or limited human trials',
      2: 'Early, small, or animal-only evidence',
      1: 'Mechanistic or anecdotal only',
    }[n]]);
    const supply = [
      ['supplement', 'No prescription needed', 'Sold as a dietary supplement. Legal to buy is not the same as proven to work — that is what the stars are for.'],
      ['otc', 'Available over the counter', 'A medicine you can buy without seeing anyone.'],
      ['pharmacy', 'Pharmacy medicine — ask the pharmacist', 'Sold from behind the counter after a pharmacist’s advice, not off the open shelf.'],
      ['prescription', 'Prescription only — needs a doctor', 'A doctor has to assess you and prescribe it. No page here gives you a way to obtain one.'],
      ['controlled', 'Controlled substance', 'Illegal to buy, sell or possess without authorisation in most countries, Singapore included.'],
      ['unapproved', 'Not approved for human use', 'No regulator has approved it for people. Grey-market supply only: dose, purity and legality are all uncertain.'],
    ];
    return `<div class="legend">
      <div class="legend-col">
        <div class="legend-h">⭐ Evidence rating <span>— strength of <b>human</b> evidence</span></div>
        ${ev.map(([n, t]) => `<div class="legend-row">${starHTML(n)}<span>${esc(t)}</span></div>`).join('')}
        <div class="legend-row"><span class="lg-note">Animal-only evidence is capped at two stars and has to say “animal”. A build check refuses to publish a page that breaks that.</span></div>
      </div>
      <div class="legend-col">
        <div class="legend-h">🏷️ Regulator status <span>— what a regulator has decided about the <b>molecule</b></span></div>
        ${Object.entries(D.approvalLabels).map(([e, l]) => `<div class="legend-row"><span class="pill ${{ '🟢': 'g', '🟡': 'y', '🔵': 'b', '🟠': 'o', '🔴': 'r', '⚫': 'k' }[e]}" data-axis="regulator" aria-label="Regulator status: ${esc(l)}">${e} ${esc(l)}</span></div>`).join('')}
        <div class="legend-row"><span class="lg-note"><b>A colour is not a shopping instruction.</b> It says what the FDA — or the relevant regulator for that molecule — currently calls it. A medicine can be approved and still be prescription-only.</span></div>
      </div>
      <div class="legend-col">
        <div class="legend-h">🛒 How you get it <span>— the separate question, answered separately</span></div>
        ${supply.map(([cls, tag, why]) => `<div class="legend-row"><span class="pill supply s-${cls}" data-axis="supply" aria-label="How you get it: ${esc(tag.toLowerCase())}">${({ prescription: '℞', pharmacy: '℞', controlled: '⛔', unapproved: '⛔' })[cls] || '🛒'} ${esc(tag)}</span><span>${esc(why)}</span></div>`).join('')}
        <div class="legend-row"><span class="lg-note">Where a compound needs a doctor, the page says so and gives no dose. The classification shown is Singapore’s, because that is the one regulator tracked here in full — check your own country’s rules before assuming.</span></div>
      </div>
    </div>`;
  }
  function legendPage() {
    return `${crumbs([{ label: 'Home', href: '#/' }, { label: 'Legend' }])}
      <h1>How to read RNAwiki</h1>
      <p class="lede">Three things appear on a compound page, and they answer three different
      questions. Mixing them up is the mistake this page exists to prevent: <b>how strong the
      evidence is</b>, <b>what a regulator has decided</b>, and <b>how you would actually get it</b>.</p>
      ${legendBlock()}
      <h2>Who decides any of this</h2>
      <p>No clinician has reviewed these pages. Nothing on this site is a professional’s opinion,
      an endorsement, or medical advice, and no colour or star here should be read as one. The stars
      are an editorial rating of the published <b>human</b> evidence, applied by one consistent rule
      across every compound. The colours are not a judgement at all — they are the current call of
      the <b>FDA or the relevant global regulator</b> on that molecule, recorded, not formed here.
      Where the two disagree, they are shown disagreeing rather than reconciled quietly: a compound
      can be approved by a regulator and still have weak evidence for what you want it for, and the
      reverse.</p>
      <p><a href="/methodology" data-native>How a page here is made →</a> ·
      <a href="/corrections" data-native>Corrections →</a> ·
      <a href="#/about">About RNAwiki →</a></p>`;
  }

  function goalPage(id) {
    const g = goalById[id]; if (!g) return notFound();
    let list = D.compounds.filter(c => c.goalIds.includes(id)).sort((a, b) => b.stars - a.stars || a.name.localeCompare(b.name));
    setTimeout(() => { bindGoalFilters(list); renderGoalComments(id); }, 0);
    const approvals = ['🟢', '🟡', '🔵', '🟠', '🔴', '⚫'];
    const protos = protocolsForGoal(id);
    const protoBlock = protos.length ? `<div class="goal-protos">
      <div class="section-title">🧭 Get a full protocol <a class="see-all" href="#/solve">all protocols →</a></div>
      <p style="color:var(--muted);margin-top:-.4rem">Not just what to take — the movement, food, and stack for a specific root cause.</p>
      <div class="solve-grid">${protos.slice(0, 6).map(p => protoLink(p)).join('')}</div></div>` : '';
    return `${crumbs([{ label: 'Home', href: '#/' }, { label: g.label }])}
    <h1>${g.icon} ${g.label}</h1>
    <p style="color:var(--muted)">${list.length} compounds, ranked by strength of human evidence. Filter by legal status:</p>
    <div class="toolbar" id="goal-filters"><span class="chip active" data-ap="">All</span>${approvals.map(a => `<span class="chip" data-ap="${a}">${a} ${D.approvalLabels[a]}</span>`).join('')}</div>
    <div class="card-grid" id="goal-list">${list.map(cpdCard).join('')}</div>
    ${protoBlock}
    <div id="goal-comments"></div>`;
  }
  function bindGoalFilters(list) {
    const bar = document.getElementById('goal-filters'); if (!bar) return;
    bar.querySelectorAll('.chip').forEach(chip => chip.onclick = () => {
      bar.querySelectorAll('.chip').forEach(c => c.classList.remove('active')); chip.classList.add('active');
      // W5a: filters on c.badges (what the page actually renders), not c.approvals (the raw
      // markdown badge line) — otherwise the "🔵 Prescription" filter returns Vitamin D3, whose
      // blue badge was withdrawn because its authored class is `supplement`.
      const ap = chip.dataset.ap; const f = ap ? list.filter(c => (c.badges || []).includes(ap)) : list;
      document.getElementById('goal-list').innerHTML = f.length ? f.map(cpdCard).join('') : '<div class="empty">None with that status for this goal.</div>';
    });
  }

  // Plain-text FAQ (visible) that mirrors the prerendered FAQPage schema, so the structured data always
  // matches the rendered DOM after hydration. Same source fields as build/prerender.js.
  function faqStrip(t) { return String(t == null ? '' : t).replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`>#]+/g, '').replace(/\s+/g, ' ').trim(); }
  function faqSnip(t, max) { max = max || 300; const s = faqStrip(t); if (s.length <= max) return s; const cut = s.slice(0, max); return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:]$/, '') + '…'; }
  function faqRender(qas) { const items = qas.filter(x => x && x.q && x.a && String(x.a).trim().length > 8); if (items.length < 2) return ''; return `<div class="section-title">Common questions</div><div class="faq">${items.map(x => `<details class="faq-q"><summary>${esc(x.q)}</summary><p>${esc(x.a)}</p></details>`).join('')}</div>`; }

  // ===== Compound page — learning-first components (all from real data; nothing fabricated) =====
  // Curated core pharmacology glossary (authored textbook definitions; mirrors FOUNDATIONS.md).
  const CPD_GLOSSARY = {
    agonist: 'A molecule that switches a receptor ON.', antagonist: 'A molecule that blocks a receptor — stops it firing.',
    ligand: 'Any molecule that binds a receptor (agonists and antagonists are both ligands).',
    receptor: 'A protein a molecule docks onto to send a signal into the cell.',
    enzyme: 'A protein that speeds up a specific chemical reaction in the body.',
    cofactor: 'A helper molecule (often a mineral) an enzyme needs to work — e.g. magnesium.',
    substrate: 'The raw material an enzyme acts on.', kinase: 'An enzyme that adds a phosphate to switch other proteins on or off.',
    phosphorylation: 'Adding a phosphate group — the body’s main on/off switch for proteins.',
    transcription: 'Copying a gene’s DNA into RNA — the first step of making a protein.',
    translation: 'Building a protein from the RNA copy of a gene.',
    'half-life': 'The time for half the dose to leave your body — sets how long it lasts and how often to dose.',
    bioavailability: 'The fraction of a dose that actually reaches your bloodstream.',
    pharmacokinetics: 'What the body does to a drug — absorb, distribute, metabolise, excrete.',
    pharmacodynamics: 'What the drug does to the body — its effects and how strong they are.',
    'therapeutic index': 'The gap between an effective dose and a toxic one — bigger is safer.',
    cyp450: 'Liver enzymes that break down most drugs — the source of many interactions.',
    rct: 'Randomised controlled trial — the gold standard for proving a human effect.',
    'meta-analysis': 'A study that pools many trials for the strongest overall answer.',
    'placebo': 'An inert dummy treatment used to see if an effect is real.',
    tolerance: 'Needing more over time for the same effect, as the body adapts.',
    selectivity: 'How specifically a molecule hits its intended target and not others.',
    affinity: 'How tightly a molecule binds its target.', 'gpcr': 'G-protein-coupled receptor — the biggest receptor family; many drugs act here.',
    mtor: 'A master growth switch — on = build (muscle), off = repair/cleanup (autophagy).',
    ampk: 'A cellular “low-fuel” sensor that boosts fat-burning and mitochondria.',
    autophagy: 'The cell’s recycling of damaged parts — a key longevity process.',
    mitochondria: 'The cell’s power plants that make ATP energy.', atp: 'The body’s energy currency, spent and remade constantly.',
    'nmda receptor': 'A glutamate receptor central to learning, memory and excitation.',
    gaba: 'The brain’s main calming (inhibitory) neurotransmitter.', glutamate: 'The brain’s main excitatory neurotransmitter.',
    dopamine: 'A neurotransmitter for motivation, focus and reward.', serotonin: 'A neurotransmitter for mood, calm and sleep.',
    cortisol: 'The main stress hormone; follows a daily rhythm.', 'hpa axis': 'The brain–adrenal stress circuit that controls cortisol.',
    glycation: 'Sugar sticking to proteins and stiffening them — ages collagen and vessels.',
    'nitric oxide': 'A gas that widens blood vessels to improve blood flow.',
    'shbg': 'A blood protein that binds sex hormones; more SHBG = less free testosterone.',
    inflammation: 'The immune system’s response to damage — helpful acutely, harmful when chronic.',
  };
  const GLOSSARY_TERMS = Object.keys(CPD_GLOSSARY).sort((a, b) => b.length - a.length);
  const GLOSSARY_RE = new RegExp('\\b(' + GLOSSARY_TERMS.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b', 'i');
  function glossDef(term) { const t = term.toLowerCase(); return CPD_GLOSSARY[t] || CPD_GLOSSARY[t.replace(/s$/, '')] || null; }
  // Wrap the first mention of each glossary term inside the given root (skips links/headings; DOM-safe).
  // A page-level set, not a per-call one. `applyGlossary` is invoked once per matching element
  // (app.js:726 iterates a selector list), and `seen` used to be declared inside — so every
  // element got its own "first occurrence" and the same word was glossed again and again.
  // Measured on /c/creatine-monohydrate: 25 spans for ~14 distinct terms — receptor x5, atp x5,
  // kinase x3. A definition repeated five times on one page is noise, not help.
  let _glossSeen = new Set();
  function resetGlossary() { _glossSeen = new Set(); }
  function applyGlossary(root, shared) {
    // `shared` must be a Set. Array.prototype.forEach passes (element, index, array), so any
    // `.forEach(applyGlossary)` call site hands the INDEX in here — truthy from the second element
    // on, and `seen.has` is not a function on a number. Type-check rather than trust the caller.
    if (!root) return; const seen = (shared instanceof Set) ? shared : _glossSeen;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => (n.nodeValue.trim().length > 2 && n.parentElement && !n.parentElement.closest('a,.gloss,code,h1,h2,h3,summary,.badge,.chip,.spec-strip')) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT });
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => {
      const t = n.nodeValue; const m = GLOSSARY_RE.exec(t); if (!m) return;
      const term = m[1].toLowerCase(); if (seen.has(term)) return; const def = glossDef(term); if (!def) return;
      seen.add(term);
      const span = document.createElement('span');
      span.innerHTML = esc(t.slice(0, m.index)) + `<span class="gloss" tabindex="0" role="button" aria-label="${esc(term)}: ${esc(def)}" data-def="${esc(def)}">${esc(m[1])}</span>` + esc(t.slice(m.index + m[1].length));
      n.replaceWith(span);
    });
  }
  function pubchemCID(c) { const src = (c.target || '') + ' ' + (c.raw || ''); const m = src.match(/pubchem\.ncbi\.nlm\.nih\.gov\/compound\/(\d+)/i) || src.match(/PubChem CID\s*(\d+)/i); return m ? m[1] : null; }
  // Evidence tier from the human-evidence star rating (consistent, editorial mapping — on-brand honesty).
  const EV_TIER = { 5: ['Strong', 'consistent human RCTs / meta-analyses'], 4: ['Good', 'multiple human trials, some limits'], 3: ['Moderate', 'human data, modest or mixed effect'], 2: ['Early', 'limited or animal-only data'], 1: ['Minimal', 'mechanistic or anecdotal'] };
  function moleculeViewer(c) {
    const cid = pubchemCID(c); if (!cid) return '';
    return `<div class="mol-viewer" data-lvl="1" id="sec-molecule" data-cid="${cid}">
      <div class="mol-2d"><img loading="lazy" alt="2D structure of ${esc(c.name)}" src="https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG"></div>
      <div class="mol-side">
        <div class="mol-title">${(c.members || []).length ? 'One molecule on this page' : 'The actual molecule'} <span class="mol-cid">PubChem CID ${cid}</span></div>
        ${(c.members || []).length ? `<div class="mol-of" id="mol-of">This structure is <b>one</b> of the ${c.members.length} compounds named in the title — the record below says which.</div>` : ''}
        <div class="mol-formula" id="mol-formula">—</div>
        <button class="mol-3d-btn" data-lvl="3" id="mol-3d-btn">🔄 Rotate in 3D</button>
        <div class="mol-3d-wrap" id="mol-3d-wrap" hidden></div>
        <a class="mol-link" href="https://pubchem.ncbi.nlm.nih.gov/compound/${cid}" target="_blank" rel="noopener">Full PubChem record →</a>
      </div>
    </div>`;
  }
  function specStrip(c) {
    const tier = EV_TIER[c.stars] || EV_TIER[2];
    const chips = [];
    chips.push(`<span class="spec-chip"><span class="sc-k">Class</span><span class="sc-v">${esc((c.category || '').split('/')[0].trim().toLowerCase())}</span></span>`);
    // W5a: was `${'★'.repeat(c.stars)}<span class="sc-dim">${'★'.repeat(5 - c.stars)}</span>` —
    // five filled stars on every compound, the empty ones separated by colour alone. This chip is
    // the single string measured hydrated on /c/bpc-157 as "EVIDENCE\n★★★★★ Minimal" for a
    // ONE-star compound. It now reads "★☆☆☆☆ 1 of 5 · Minimal", and the number survives a strip.
    chips.push(`<span class="spec-chip"><span class="sc-k">Evidence</span><span class="sc-v">${starHTML(c.stars)}${c.stars ? ` · ${esc(tier[0])}` : ''}</span></span>`);
    // W5a / D31: this chip rendered EVERY approval dot and exactly ONE caption — `approvalLabels[0]`.
    // Measured hydrated at 390x844 on /c/vitamin-d3-k2, whose innerText was "STATUS\n🟡🔵 OTC
    // Supplement": two coloured dots, one caption, and the caption was the one that omitted the
    // other badge. 38 of 171 compounds render two or more badges, so 38 pages showed a colour with
    // no words anywhere. Every badge now carries its own words, and the chip ends with the single
    // supply statement so the strip and the badge row cannot disagree.
    if ((c.badgeLabels || []).length || (c.supply || {}).tag) {
      const reg = (c.badges || []).map(a => `${a} ${esc(D.approvalLabels[a] || '')}`).join(' · ');
      chips.push(`<span class="spec-chip"><span class="sc-k">Status</span><span class="sc-v">${reg ? reg + ' · ' : ''}${esc((c.supply || {}).tag || '')}</span></span>`);
    }
    // W5a: on a bundle page these chips showed ONE member's chemistry under an h1 naming several —
    // /c/agmatine-glycerol-theacrine-brief printed "FORMULA C5H14N4 · MOL. WEIGHT 130 g/mol ·
    // PubChem CID 199", which is agmatine alone. The chip key now names the molecule, and the name
    // comes from PubChem's OWN record title (fetched with the formula), not from a guess about
    // which member of the bundle the CID belongs to.
    const molK = (c.members || []).length ? '<span id="spec-mol-of">one compound here</span>' : '';
    chips.push(`<span class="spec-chip" id="spec-formula" hidden><span class="sc-k">Formula${molK ? ' — ' + molK : ''}</span><span class="sc-v" id="spec-formula-v"></span></span>`);
    chips.push(`<span class="spec-chip" id="spec-mw" hidden><span class="sc-k">Mol. weight</span><span class="sc-v" id="spec-mw-v"></span></span>`);
    if (c.cost) { const cm = String(c.cost).match(/S?\$[\d,]+(?:[–-]\$?[\d,]+)?\s*(?:\/\s*month|\/mo|per month|a month)?/i); if (cm) chips.push(`<span class="spec-chip"><span class="sc-k">Cost</span><span class="sc-v">${esc(cm[0])}</span></span>`); }
    return `<div class="spec-strip" data-lvl="1">${chips.join('')}</div>`;
  }
  function evidenceGlance(c) {
    // W5a: the second colour-only star pad on the page. It rendered `${'★'.repeat(c.stars)}<span
    // class="evg-dim">${'★'.repeat(5 - c.stars)}</span>` with `.evg-dim{color:var(--line)}` — the
    // identical defect to the spec chip, on the block whose whole job is to state the evidence.
    const tier = EV_TIER[c.stars];
    const body = tier
      ? `<b>${esc(tier[0])} human evidence</b> — ${esc(tier[1])}.`
      : `<b>Not yet rated.</b> This entry covers several compounds together and has no single human-evidence rating; read each one's own page for its evidence.`;
    return `<div class="ev-glance" data-lvl="2" id="sec-evidence-glance">
      <div class="evg-stars">${starHTML(c.stars)}</div>
      <div class="evg-body">${body}<span class="evg-note"> Stars measure <b>human</b> evidence only; animal-only data is capped at ★★.</span></div>
    </div>`;
  }
  function takeawaysBox(c) {
    const pts = [];
    if (c.bottom) pts.push(faqSnip(c.bottom, 150));
    if (c.protocol) pts.push('Dose: ' + faqSnip(c.protocol, 120));
    if (c.watch) pts.push('Watch: ' + faqSnip(c.watch, 120));
    if (pts.length < 2) return '';
    return `<div class="takeaways" data-lvl="1"><div class="tk-h">⚡ The 30-second version</div><ul>${pts.slice(0, 3).map(p => `<li>${mdInline(p)}</li>`).join('')}</ul></div>`;
  }
  // Safety/framing tier — mirrors the authoring manifest. Drives tab labels, the protocol heading,
  // the "when to use" header and the add-to-stack control so the page never invites use of a
  // prescription, controlled/non-approved, or outright lethal compound.
  function compoundTier(c) {
    if (c.brief) return 'brief';
    const L = (c.approvalLabels || []).join(',');
    if (/death|fatal|lethal|deadly|do not use/i.test((c.watch || '') + (c.bottom || ''))) return 'DANGER';
    if (/Not Approved|Controlled/.test(L)) return 'RESEARCH';
    if (needsDoctor(c) || /Prescription|Off-Label/.test(L)) return 'RX';
    return 'OTC';
  }
  const TIER_UI = {
    OTC: { icon: '💊', label: 'How to use it', protoH: 'How to take it', wuH: '🎯 When should <i>you</i> take it?' },
    RX: { icon: '💊', label: "How it's used", protoH: "How it’s prescribed & used", wuH: '🩺 How it’s used clinically' },
    RESEARCH: { icon: '⚠️', label: 'Use & risks', protoH: 'What people do — and the risks (not an endorsement)', wuH: '⚠️ Why people use it — and what it costs' },
    DANGER: { icon: '☠️', label: 'The danger', protoH: 'Why the dose is a death-trap', wuH: '☠️ Why it’s so dangerous' },
    brief: { icon: '💊', label: 'How to use it', protoH: 'How to take it', wuH: '🎯 When should <i>you</i> take it?' },
  };
  function tierUI(c) { return TIER_UI[compoundTier(c)] || TIER_UI.OTC; }
  function learnedBtn(c) { const done = isLearned(c.id); return `<button id="learned-btn" class="learned-btn ${done ? 'on' : ''}">${done ? '✓ Learned' : '＋ Mark learned'}</button>`; }
  function getLearned() { try { return JSON.parse(localStorage.getItem('rnawiki_learned') || '[]'); } catch (e) { return []; } }
  function isLearned(id) { return getLearned().includes(id); }
  function toggleLearned(id) { const l = getLearned(); const i = l.indexOf(id); if (i >= 0) l.splice(i, 1); else l.push(id); localStorage.setItem('rnawiki_learned', JSON.stringify(l)); return l.includes(id); }
  // ================= ONE master learning journey across the WHOLE /learn web =================
  // A single ordered curriculum: Foundations (modules) → how the body is fuelled (energy/physiology)
  // → each master pathway, then the compounds that pull it → any remaining compounds. From ANY
  // educational page, "Continue" walks this one sequence — so the reader can go newbie → expert through
  // everything, and always sees how the next thing connects.
  const isFoundational = x => /foundational/i.test(x.category || '');
  const byLearnOrder = (a, b) => (isFoundational(b) - isFoundational(a)) || (b.stars - a.stars) || a.name.localeCompare(b.name);
  const T_META = { module: ['📗', 'Foundation'], energy: ['⚡', 'Energy system'], physiology: ['🫀', 'Physiology'], pathway: ['🧬', 'Pathway'], compound: ['💊', 'Compound'] };
  let _MASTER = null;
  function buildMasterJourney() {
    if (_MASTER) return _MASTER;
    const nodes = []; const push = (type, id, title, href, section) => nodes.push({ type, id, title, href, section });
    (D.modules || []).forEach((m, i) => push('module', i, (typeof stripNum === 'function' ? stripNum(m.title) : m.title), '#/learn/' + i, 'Foundations'));
    ((typeof ANAT !== 'undefined' && ANAT.energy_systems) || []).forEach(e => push('energy', e.id, (e.name || '').split('(')[0].trim(), '#/energy/' + e.id, 'How the body runs'));
    ((typeof ANAT !== 'undefined' && ANAT.metabolism) || []).forEach(p => push('physiology', p.id, p.name, '#/physiology/' + p.id, 'How the body runs'));
    const seen = new Set();
    (D.pathways || []).forEach((p, i) => {
      push('pathway', i, p.shortLabel, '#/pathway/' + i, p.shortLabel + ' pathway');
      (compoundsByPathway[i] || []).filter(c => !c.isNote).slice().sort(byLearnOrder).forEach(c => { if (!seen.has(c.id)) { seen.add(c.id); push('compound', c.id, c.name, '#/c/' + slug(c.name), p.shortLabel + ' pathway'); } });
    });
    D.compounds.filter(c => !c.isNote && !seen.has(c.id)).sort(byLearnOrder).forEach(c => { seen.add(c.id); push('compound', c.id, c.name, '#/c/' + slug(c.name), 'More compounds'); });
    _MASTER = nodes; return nodes;
  }
  function masterState(type, id) { const M = buildMasterJourney(); const idx = M.findIndex(n => n.type === type && String(n.id) === String(id)); return idx < 0 ? null : { M, idx, node: M[idx], next: M[idx + 1] || null, total: M.length }; }
  function nextHook(n) {
    if (n.type === 'compound') { const c = byId[n.id]; return c ? (c.analogy || faqSnip(c.plain || c.bottom || '', 112)) : ''; }
    if (n.type === 'pathway') { const p = D.pathways[n.id]; return p && p.oneLine ? faqSnip(p.oneLine, 118) : ''; }
    if (n.type === 'module') { const m = (D.modules || [])[n.id]; return m && m.intro ? faqSnip(m.intro, 112) : ''; }
    return '';
  }
  function masterConnect(cur, next) {
    const p = cur.type, n = next.type, same = cur.section === next.section;
    if (p === 'pathway' && n === 'compound') return `<b>Why this next →</b> now meet a molecule that pulls the <b>${esc(cur.title)}</b> lever you just learned — knowing the mechanism first makes every compound on it click instantly.`;
    if (p === 'compound' && n === 'compound' && same) return `<b>Why this next →</b> <b>${esc(next.title)}</b> works through the same <b>${esc(cur.section)}</b> — you're mapping one system, molecule by molecule.`;
    if (p === 'compound' && n === 'pathway') return `<b>Why this next →</b> you've mapped that system's molecules; the <b>${esc(next.title)}</b> pathway is the next connected mechanism to master.`;
    if (p === 'compound' && n === 'compound' && !same) return `<b>Why this next →</b> onward to a new system — <b>${esc(next.title)}</b> opens up <b>${esc(next.section)}</b>.`;
    if (p === 'module' && n === 'module') return `<b>Why this next →</b> the next building block of the foundation — each one makes the mechanisms and molecules ahead far easier to understand.`;
    if (p === 'module' && (n === 'energy' || n === 'physiology')) return `<b>Why this next →</b> with the biology basics down, see how your body actually runs on fuel — the ground every compound later acts on.`;
    if ((p === 'energy' || p === 'physiology')) return `<b>Why this next →</b> keep building the base — this is the machinery the compounds ahead will tune.`;
    if (p === 'pathway' && n === 'pathway') return `<b>Why this next →</b> a connected mechanism — molecules often pull both at once.`;
    return `<b>Why this next →</b> the next step in mastering how your biology works.`;
  }
  // Your living mastery map — a modal showing the whole 198-step web, learned lessons filled in.
  function masteryMapModal() {
    const M = buildMasterJourney(); const learned = new Set(getLearned());
    const groups = []; const seen = {}; M.forEach(n => { if (!(n.section in seen)) { seen[n.section] = groups.length; groups.push([n.section, []]); } groups[seen[n.section]][1].push(n); });
    const compounds = M.filter(n => n.type === 'compound'); const doneC = compounds.filter(n => learned.has(n.id)).length;
    const html = `<button class="modal-x" id="modal-close">✕</button><h2>🗺️ Your mastery map</h2>
      <p class="modal-sub"><b>${doneC}</b> of ${compounds.length} compounds mastered. Finish a lesson (read all its tabs) and its dot fills in. Tap any dot to jump there.</p>
      <div class="mmap">${groups.map(([sec, nodes]) => { const d = nodes.filter(n => learned.has(n.id)).length; return `<div class="mmap-row"><div class="mmap-sec">${esc(sec)}<span class="mmap-count">${d}/${nodes.length}</span></div><div class="mmap-dots">${nodes.map(n => `<a class="mmap-dot${learned.has(n.id) ? ' done' : ''}" href="${n.href}" title="${esc(n.title)}"></a>`).join('')}</div></div>`; }).join('')}</div>`;
    const m = modal(html); const x = m.querySelector('#modal-close'); if (x) x.onclick = closeModal;
    m.querySelectorAll('.mmap-dot').forEach(a => a.addEventListener('click', () => closeModal()));
  }
  // The one journey card — works on ANY educational page (compound, pathway, module, energy, physiology).
  function journeyBlock(type, id) {
    const s = masterState(type, id); if (!s || !s.next) return '';
    const next = s.next; const meta = T_META[next.type] || ['📘', '']; const hook = nextHook(next);
    const pct = Math.max(1, Math.round((s.idx + 1) / s.total * 100)); const learnedN = getLearned().length;
    return `<div class="journey-card" id="journey" data-jnode="${type}:${esc(String(id))}">
      <div class="j-head"><span class="j-ico">🧭</span><div><div class="j-title">Your learning journey</div><div class="j-sub">${esc(s.node.section)} · step ${s.idx + 1} of ${s.total}</div></div></div>
      <div class="jr-bar big"><i style="width:${pct}%"></i></div>
      <div class="j-connect">${masterConnect(s.node, next)}</div>
      <a class="j-next" href="${next.href}"><div class="jn-l"><div class="jn-lbl">Next · ${meta[1]}</div><div class="jn-name">${meta[0]} ${esc(next.title)}</div>${hook ? `<div class="jn-hook">${esc(hook)}</div>` : ''}</div><span class="jn-go">Continue →</span></a>
      <div class="j-foot"><span>🎓 <b>${learnedN}</b> mastered</span><button class="j-map-btn" data-mastery-map>🗺️ Your mastery map</button></div>
    </div>`;
  }
  function journeyRibbon(type, id) {
    const s = masterState(type, id); if (!s) return '';
    const pct = Math.max(1, Math.round((s.idx + 1) / s.total * 100));
    return `<div class="j-ribbon" data-lvl="1"><span class="jr-ico">🧭</span><span class="jr-txt">Learning journey · <b>${esc(s.node.section)}</b> · ${s.idx + 1} of ${s.total}</span><span class="jr-bar"><i style="width:${pct}%"></i></span></div>`;
  }
  // ---- authored learning-layer components (render only when the sidecar data exists) ----
  function analogyBox(c) { if (!c.analogy) return ''; return `<div class="analogy" data-lvl="1"><span class="an-ico">💡</span><div><div class="an-h">The one-line mental model</div>${mdBlocks(c.analogy, mdInline)}</div></div>`; }
  function mechanismCascade(c, shareId) {
    if (!Array.isArray(c.mechSteps) || !c.mechSteps.length) return '';
    // The animated cascade goes FIRST — the map before the detail. Precomputed by build/figures.js
    // and shared verbatim with the prerendered document, so the two cannot drift.
    const casc = c.cascade || '';
    const anyPredict = c.mechSteps.some(s => s.predict);
    const steps = c.mechSteps.map(s => {
      const link = s.tag ? ` <a class="mc-tag" href="#/target/${tkey(s.tag)}">${esc(s.tag)}</a>` : '';
      const fx = s.fx ? `<span class="mc-fx ${/▲/.test(s.fx) ? 'up' : /▼/.test(s.fx) ? 'down' : ''}">${esc(s.fx)}</span>` : '';
      const answer = `<div class="mc-t">${esc(s.t)}${link} ${fx}</div><p>${mdInline(s.d)}</p>`;
      if (s.predict) return `<li class="mc-step predictable"><span class="mc-n">${s.n}</span><div class="mc-body"><div class="mc-t mc-t-vis">${esc(s.t)}${link} ${fx}</div><div class="mc-predict"><span class="mc-p-q">🤔 ${esc(s.predict)}</span><button class="mc-reveal">Reveal the answer →</button></div><div class="mc-answer" hidden>${mdBlocks(s.d, mdInline)}</div></div></li>`;
      return `<li class="mc-step"><span class="mc-n">${s.n}</span><div class="mc-body">${answer}</div></li>`;
    }).join('');
    return `<div class="callout mcascade" id="sec-mechanism"><span class="k">How it works — step by step</span>${casc}${anyPredict ? `<p class="mc-hint">Try to answer each question <i>before</i> you reveal it — guessing first is what makes it stick.</p>` : ''}<ol class="mc-list">${steps}</ol>${shareId ? shareBtn('mechanism:' + shareId) : ''}</div>`;
  }
  function pkTimeline(c) {
    const p = c.pk; if (!p) return '';
    const cells = [['⏱️', 'Onset', p.onset], ['📈', 'Peak', p.peak], ['⏳', 'Half-life', p.halfLife], ['🌙', 'Lasts', p.duration]].filter(x => x[2]);
    if (!cells.length) return '';
    return `<div class="pk" data-lvl="2" id="sec-pk"><div class="k">⏳ In your body — timing</div>
      <div class="pk-row">${cells.map(([i, l, v]) => `<div class="pk-cell"><div class="pk-ico">${i}</div><div class="pk-l">${l}</div><div class="pk-v">${esc(v)}</div></div>`).join('<span class="pk-arrow">→</span>')}</div>
      ${p.note ? `<p class="pk-note">${mdInline(p.note)}</p>` : ''}</div>`;
  }
  function selfTestBox(c) {
    if (!Array.isArray(c.selfTest) || !c.selfTest.length) return '';
    const cards = c.selfTest.map((q, i) => `<div class="st-card"><div class="st-q"><b>Q${i + 1}.</b> ${esc(q.q)}</div><div class="st-a" hidden>${mdInline(q.a)}</div><button class="st-reveal" data-streveal="${i}">Show answer</button></div>`).join('');
    return `<div class="selftest" data-lvl="1"><div class="st-h">🧠 Test yourself <span class="st-sub">— recalling it beats re-reading it</span></div>${cards}</div>`;
  }
  function positioningPlot(c) {
    const peers = D.compounds.filter(x => x.category === c.category && !x.isNote).sort((a, b) => b.stars - a.stars || a.name.localeCompare(b.name));
    if (peers.length < 3) return '';
    const top = peers.slice(0, 8); const list = top.some(x => x.id === c.id) ? top : top.slice(0, 7).concat([c]);
    const rows = list.map(x => { const me = x.id === c.id; return `<div class="pos-row ${me ? 'me' : ''}"><a class="pos-name" href="#/c/${slug(x.name)}">${esc(x.name.split('(')[0].trim())}</a><div class="pos-bar"><i style="width:${x.stars / 5 * 100}%"></i></div><span class="pos-stars">${'★'.repeat(x.stars)}</span></div>`; }).join('');
    const rank = peers.findIndex(x => x.id === c.id) + 1;
    return `<div class="positioning" data-lvl="2"><div class="section-title">📊 How it ranks on evidence <span class="pos-sub">in ${esc(c.category.split('/')[0].trim().toLowerCase())} · ${rank} of ${peers.length}</span></div><div class="pos-list">${rows}</div></div>`;
  }
  // The Technical layer: an exhaustive, structured pharmacology write-up (only rendered at 🔬 depth).
  // Official-source chips. Prefer the agent-verified `refs` (each link checked to resolve + be relevant);
  // fall back to parsing the curated `target` field ("[Label](url) · [PubChem](url) · …").
  function officialLinks(c) {
    if (Array.isArray(c.refs) && c.refs.length) return c.refs.filter(r => r && r.url && r.label);
    const out = []; const re = /\[([^\]]+)\]\(([^)]+)\)/g; let m;
    while ((m = re.exec(c.target || '')) !== null) { const label = m[1].replace(/\s*\([^)]*\)\s*$/, '').trim(); out.push({ label, url: m[2] }); }
    return out;
  }
  function biotechDeepDive(c) {
    const t = c.tech; if (!t) return '';
    const sec = (icon, title, body) => body ? `<div class="bt-sec"><div class="bt-st">${icon} ${title}</div><div class="bt-sb">${body}</div></div>` : '';
    // Visual: the actual 2D molecular structure (small molecules with a PubChem CID)
    const cid = pubchemCID(c);
    const structFig = cid ? `<figure class="bt-struct"><img loading="lazy" alt="2D chemical structure of ${esc(c.name)}" src="https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG?record_type=2d&image_size=320x320"><figcaption>The 2D structure — how the atoms actually connect. <a href="https://pubchem.ncbi.nlm.nih.gov/compound/${cid}" target="_blank" rel="noopener">Open in PubChem ↗</a></figcaption></figure>` : '';
    const chem = (t.chem || structFig) ? `<div class="bt-sec"><div class="bt-st">🧪 Chemistry &amp; structure</div><div class="bt-sb bt-chem">${structFig}${t.chem ? `<div>${mdInline(t.chem)}</div>` : ''}</div></div>` : '';
    let targets = '';
    if (Array.isArray(t.targets) && t.targets.length) targets = `<div class="bt-sec"><div class="bt-st">🎯 Molecular targets &amp; binding</div><div class="bt-targets">${t.targets.map(x => `<div class="bt-tg"><div class="bt-tg-h">${x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.sym)}</a>` : esc(x.sym)}${x.action ? ` <span class="bt-tg-act">${esc(x.action)}</span>` : ''}</div>${x.affinity ? `<div class="bt-tg-aff">${mdInline(x.affinity)}</div>` : ''}${x.role ? `<div class="bt-tg-role">${mdInline(x.role)}</div>` : ''}</div>`).join('')}</div></div>`;
    // Visual ADME: a left-to-right pipeline (Absorption → Distribution → Metabolism → Excretion)
    let adme = '';
    if (t.adme) { const a = t.adme; const rows = [['💊', 'Absorption', 'how it gets in', a.absorb], ['🩸', 'Distribution', 'where it goes', a.distribute], ['🔬', 'Metabolism', 'how it\'s broken down', a.metabolise], ['🚽', 'Excretion', 'how it leaves', a.excrete]].filter(r => r[3]); adme = rows.length ? `<div class="bt-sec"><div class="bt-st">🧬 ADME — the round trip through your body</div><div class="bt-adme-flow">${rows.map(([ic, l, sub, v], i) => `<div class="bt-adme-step"><div class="bt-adme-top"><span class="bt-adme-ic">${ic}</span><div><b>${l}</b><span class="bt-adme-sub">${sub}</span></div>${i < rows.length - 1 ? '<span class="bt-adme-arrow">→</span>' : ''}</div><div class="bt-adme-v">${mdInline(v)}</div></div>`).join('')}</div></div>` : ''; }
    const links = officialLinks(c);
    const refs = links.length ? `<div class="bt-sec bt-refs"><div class="bt-st">📎 Verify it yourself — official records</div><div class="bt-ref-chips">${links.map(l => `<a class="bt-ref-chip" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join('')}</div></div>` : '';
    return `<div class="biotech" id="sec-biotech">
      <div class="bt-head"><span class="bt-badge">🔬 The biotech deep-dive</span><span class="bt-sub">how a pharmacologist reads this molecule</span></div>
      <p class="bt-lead">This is the expert layer — the same facts a pharmacologist would want. Don't worry if a term is new; each one is defined on hover, and the point is simply to see <i>how</i> a scientist reasons about a molecule: what it binds, how tightly, what your body does to it, and why people respond differently.</p>
      ${chem}
      ${targets}
      ${sec('🔀', 'Signal transduction', t.signaling ? mdInline(t.signaling) : '')}
      ${adme}
      ${sec('🧬', 'Pharmacogenomics — why response differs', t.pgx ? mdInline(t.pgx) : '')}
      ${sec('📐', 'Dose–response &amp; window', t.dose ? mdInline(t.dose) : '')}
      ${sec('🔁', 'Tolerance &amp; withdrawal', t.tolerance ? mdInline(t.tolerance) : '')}
      ${refs}
    </div>`;
  }
  // ---- Pedagogy components (render only when authored; each teaches, not just informs) ----
  function hookBox(c) { const h = c.hook; if (!h || !Array.isArray(h.questions) || !h.questions.length) return ''; return `<div class="hook"><div class="hook-h">First — could you answer these?</div><ol class="hook-qs">${h.questions.map(q => `<li>${esc(q)}</li>`).join('')}</ol><p class="hook-sub">Probably not yet. By the end of this page you'll answer all three without thinking — that's the whole point.</p></div>`; }
  function hookPayoff(c) { const h = c.hook; if (!h || !h.payoff) return ''; return `<div class="hook-payoff"><div class="hp-h">🎯 Remember those three questions?</div>${mdBlocks(h.payoff, mdInline)}</div>`; }
  function bigIdeaBanner(c) { if (!c.bigIdea) return ''; return `<div class="bigidea"><span class="bi-tag">THE ONE IDEA TO REMEMBER</span>${mdBlocks(c.bigIdea, mdInline)}</div>`; }
  function stakesLine(c) { return c.stakes ? `<p class="stakes">🌍 ${mdInline(c.stakes)}</p>` : ''; }
  function expertFramework(c) {
    const f = c.framework; if (!f) return '';
    const rows = [['What does it grab?', 'the target', f.target], ['Does a real dose reach it?', 'affinity vs concentration', f.affinity], ['What does your body do to it?', 'ADME', f.adme], ['Why do people differ?', 'genetics', f.genetics], ['How good is the proof?', 'evidence', f.evidence]].filter(r => r[2]);
    if (!rows.length) return '';
    return `<div class="framework"><div class="fw-head"><span class="fw-badge">🧠 How a pharmacologist reads any molecule</span></div>
      <p class="fw-lead">Here's the real secret of expertise: you don't memorise compounds — you ask the <b>same five questions</b> of every one. Learn the questions and you can size up anything. Here they are for ${esc(c.name)}:</p>
      <ol class="fw-list">${rows.map(([q, tag, a], i) => `<li class="fw-q"><div class="fw-qh"><span class="fw-n">${i + 1}</span><b>${esc(q)}</b> <span class="fw-tag">${esc(tag)}</span></div><div class="fw-a">${mdInline(a)}</div></li>`).join('')}</ol></div>`;
  }
  // The claim and its correction were printed together, so the reader never had to decide whether
  // they believed it — and deciding is most of what makes a myth stick. Matches the prerendered
  // document, which got this fix first.
  function mythsBox(c, shareId) { if (!Array.isArray(c.myths) || !c.myths.length) return ''; return `<div class="myths"><div class="myths-h">🚫 Myths to unlearn — do you believe any of these?</div>${c.myths.map(m => `<details class="myth"><summary class="myth-x">“${esc(m.myth)}”</summary><div class="myth-t"><b>Actually →</b> ${mdInline(m.truth)}</div></details>`).join('')}${shareId ? shareBtn('myths:' + shareId) : ''}</div>`; }
  function contrastBlock(c) {
    if (!Array.isArray(c.contrasts) || !c.contrasts.length) return '';
    // W5c (2026-08-02): D39 CORRECTED AND FIXED. The brief said "14 images with no alt attribute"
    // on 7 compound routes. Re-measured hydrated at 390x844 over all 568 routes, every <details>
    // and .chapter expanded: images with `getAttribute('alt') === null` = 0 of 568. The 14 are
    // real, but they carry `alt=""` — which is a positive claim that the image is DECORATIVE, and
    // that claim is wrong here. These are the two 2D structures in a "⚖️ how these differ" block;
    // the entire point of the block is that the two structures differ, and the figcaption below
    // each one says only "caffeine" / "adenosine". Every other structure image on the same page
    // already carries alt="2D chemical structure of <name>". These now match it.
    const ctStruct = (cid, cap) => `<figure><img loading="lazy" alt="2D chemical structure of ${esc(cap || 'this molecule')}" src="https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG">${cap ? `<figcaption>${esc(cap)}</figcaption>` : ''}</figure>`;
    return `<div class="contrasts">${c.contrasts.map(ct => { const structs = (ct.cidA && ct.cidB) ? `<div class="ct-structs">${ctStruct(ct.cidA, ct.capA)}<span class="ct-vs">vs</span>${ctStruct(ct.cidB, ct.capB)}</div>` : ''; return `<div class="contrast"><div class="ct-h">⚖️ ${esc(ct.title)}</div>${structs}<p>${mdInline(ct.point)}</p></div>`; }).join('')}</div>`;
  }
  function whenToUseBox(c) { const w = c.whenToUse; if (!w || !Array.isArray(w.items) || !w.items.length) return ''; const t = compoundTier(c); const ui = TIER_UI[t] || TIER_UI.OTC; return `<div class="whenuse${t === 'DANGER' ? ' danger' : (t === 'RESEARCH' ? ' caution' : '')}"><div class="wu-h">${ui.wuH}</div>${w.intro ? `<p class="wu-intro">${mdInline(w.intro)}</p>` : ''}<ul class="wu-list">${w.items.map(i => `<li>${mdInline(i)}</li>`).join('')}</ul></div>`; }
  function moleculeJourney(c, shareId) { if (!Array.isArray(c.journey) || !c.journey.length) return ''; return `<div class="mjourney"><div class="mj-h">🧭 Follow one molecule — from mug to memory</div><div class="mj-track">${c.journey.map((s, i) => `<div class="mj-stage"><div class="mj-num">${i + 1}</div><div class="mj-body"><div class="mj-stage-t">${esc(s.stage)}</div><div class="mj-stage-d">${mdInline(s.d)}</div></div></div>`).join('')}</div>${shareId ? shareBtn('journey:' + shareId) : ''}</div>`; }
  // W3.5 (2026-08-02) — the model answer is not "the expert answer". The text this box reveals is
  // `c.bigIdea || c.analogy`, i.e. this site's own authored copy: AI-assisted, human-edited, and
  // "Not yet reviewed by a clinician", which is what the foot of every page says. Calling it the
  // EXPERT answer attributes it to a professional who does not exist on this project, on the five
  // templates that call feynmanBox() — /c (171), /target (103), /muscle (17), /pathway (16) and
  // the /learn courses. Measured hydrated at 390x844 before the change, 15 of 17 sampled routes
  // across all five templates rendered the button "Compare with the expert answer" and the reveal
  // lead "A clean expert answer:". The teaching device is untouched; only the attribution goes.
  function feynmanBox(c) { return `<div class="feynman" data-slug="${esc(slug(c.name))}"><div class="fy-h">🧑‍🏫 The real test — explain it back</div><p class="fy-sub">In a sentence or two, explain to an imaginary friend what ${esc(c.name)} does and how. Writing it in your own words is the single best way to find out whether it actually stuck — then compare with the answer below.</p><textarea class="fy-input" id="fy-input" rows="3" placeholder="e.g. It blocks the tiredness signal in my brain, so…"></textarea><button class="fy-check" id="fy-check">Compare with a clean answer</button><div class="fy-model" id="fy-model" hidden><b>A clean answer:</b> ${mdInline(c.bigIdea || c.analogy || '')}</div></div>`; }
  function graduationBlock(c) { const canEx = Array.isArray(c.canExplain) && c.canExplain.length ? `<div class="grad-can"><div class="gc-h">✓ You can now explain</div><ul>${c.canExplain.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''; const payoff = hookPayoff(c); if (!canEx && !payoff) return ''; return `<div class="graduation">${payoff}${canEx}</div>`; }
  function chapterCheck(c, key) { const ch = c.checks && c.checks[key]; if (!ch) return ''; return `<div class="ch-check"><div class="cc-q">🔎 Before you go on — ${esc(ch.q)}</div><button class="cc-reveal">Show answer</button><div class="cc-a" hidden>${mdInline(ch.a)}</div></div>`; }
  function doseSimulator(c) {
    const s = c.sim; if (!s) return '';
    return `<div class="dosesim" id="dosesim">
      <div class="ds-h">🎛️ Try it yourself — the dose &amp; clearance simulator</div>
      <p class="ds-sub">Drag the sliders. Watch the dose land in the effective window (or overshoot), and see how much is still in you at bedtime.</p>
      <div class="ds-controls">
        <label>Your dose <b><span id="ds-dose-v">${s.defaultDose}</span> mg</b><input type="range" id="ds-dose" min="0" max="${s.maxDose}" step="10" value="${s.defaultDose}"></label>
        <label>Your bodyweight <b><span id="ds-bw-v">${s.bodyweightKg}</span> kg</b><input type="range" id="ds-bw" min="40" max="120" step="1" value="${s.bodyweightKg}"></label>
        <label>Time you drink it <b><span id="ds-time-v">8am</span></b><input type="range" id="ds-time" min="5" max="20" step="1" value="8"></label>
      </div>
      <div class="ds-readout" id="ds-readout"></div>
      <svg class="ds-chart" id="ds-chart" viewBox="0 0 320 150"></svg>
      <div class="ds-legend"><span class="ds-swatch"></span> caffeine in your system through the day · <span class="ds-bed">🌙 = bedtime 11pm</span></div>
      <p class="ds-note">${mdInline(s.note)}</p>
    </div>`;
  }
  // Rich, contextual evidence chapter (renders when the authored `evi` block exists; teaches HOW to read it).
  function evidenceDeep(c) {
    const e = c.evi; if (!e) return '';
    const sec = (icon, title, body) => body ? `<div class="evd-sec"><div class="evd-t">${icon} ${title}</div><div class="evd-b">${mdInline(body)}</div></div>` : '';
    const trials = (Array.isArray(e.trials) && e.trials.length) ? `<div class="evd-sec"><div class="evd-t">📚 The key trials</div><ul class="bt-trials">${e.trials.map(x => `<li>${mdInline(x.finding)}${x.ref ? ` <span class="bt-ref">— ${esc(x.ref)}</span>` : ''}${x.pmid ? ` <a class="bt-pmid" href="https://pubmed.ncbi.nlm.nih.gov/${esc(x.pmid)}/" target="_blank" rel="noopener" title="Open this paper on PubMed — checked against the claim by a human on ${esc(x.pmid_verified_on || '')}">PMID ${esc(x.pmid)} ↗</a>` : ''}</li>`).join('')}</ul></div>` : '';
    return `<div class="evidence-deep">
      ${sec('🎯', 'How strong is the evidence?', e.howStrong)}
      ${sec('📈', 'What the studies actually show', e.whatItShows)}
      ${sec('📐', 'The effect, in plain numbers', e.effect)}
      ${sec('👤', 'Who benefits most — and least', e.whoBenefits)}
      ${sec('⚖️', 'The honest caveats', e.caveats)}
      ${trials}
    </div>`;
  }

  // ---- Biohacker / nutritionist layer (c.bio): form, biomarkers, cofactors, food-first, cost/dose,
  // per-kg dosing, timing, cycling, contraindications, quality, non-responders, synergy. Omit-if-absent. ----
  const BIO_TIER_LBL = ['', 'emerging', 'good evidence', 'well established'];
  function bioTierChip(t) { if (!t) return ''; return `<span class="bio-tier bt${t}" title="Evidence strength: ${BIO_TIER_LBL[t] || ''}">${'●'.repeat(t)}${'○'.repeat(3 - t)}</span>`; }
  function bioCard(ico, title, html, tier) { if (!html) return ''; return `<div class="bio-card"><div class="bio-card-h"><span class="bio-ico">${ico}</span><h4>${esc(title)}</h4>${tier ? bioTierChip(tier) : ''}</div><div class="bio-card-b">${html}</div></div>`; }
  // These fields are already wrapped in <b>; strip any **markdown** the author added so asterisks don't show literally.
  const stripB = s => String(s == null ? '' : s).replace(/\*\*/g, '');
  // Prescription-only / not-approved compounds get a prominent status banner and a restricted, safe card set —
  // never a self-directed dose calculator or a "where to buy" line. Educational, not medical advice.
  function bioBanner(b) {
    // Strip a leading repeat of the bold label the author may have included in accessNote.
    const dedupe = s => String(s == null ? '' : s).replace(/^\s*(prescription[- ]only|not approved for human use)[.:]?\s*/i, '').trim();
    if (b.access === 'prescription') return `<div class="bio-banner bio-banner-rx">💊 <b>Prescription only.</b> ${mdInline(dedupe(b.accessNote) || 'This medicine must be prescribed and monitored by a certified doctor. Everything below is educational, not medical advice, and not a recommendation to take it.')}</div>`;
    if (b.access === 'unapproved') return `<div class="bio-banner bio-banner-danger">⛔ <b>Not approved for human use.</b> ${mdInline(dedupe(b.accessNote) || 'Sold only as a research chemical, with no certified-safe dose. The documented harms are below. This is educational, not a recommendation to use it.')}</div>`;
    return '';
  }
  function bioBiomarkersCard(b, title) { if (!Array.isArray(b.biomarkers) || !b.biomarkers.length) return ''; return bioCard('🩸', title || 'Biomarkers to track', `<div class="bio-tbl-wrap"><table class="bio-tbl"><thead><tr><th>Marker</th><th>What it tells you</th><th>Target / note</th></tr></thead><tbody>${b.biomarkers.map(m => `<tr><td><b>${esc(stripB(m.marker))}</b>${m.when ? `<div class="bio-when">${esc(m.when)}</div>` : ''}${bioTierChip(m.tier)}</td><td>${mdInline(m.why)}</td><td>${mdInline(m.range || '')}</td></tr>`).join('')}</tbody></table></div>`); }
  function bioContraCard(b, ico, title) { if (!Array.isArray(b.contra) || !b.contra.length) return ''; return bioCard(ico || '⚠️', title || 'Personalized cautions', `<ul class="bio-contra">${b.contra.map(x => `<li><b>${esc(stripB(x.flag))}:</b> ${mdInline(x.advice)} ${bioTierChip(x.tier)}</li>`).join('')}</ul>`); }
  function bioSection(c) {
    const b = c.bio; if (!b) return '';
    // Restricted path: prescription-only or not-approved compounds.
    if (b.access === 'prescription' || b.access === 'unapproved') {
      const rx = b.access === 'prescription';
      const rc = [];
      if (rx && b.typicalDose) rc.push(bioCard('⚖️', 'Typical dose — set by a doctor', `<div class="bio-line">${mdInline(b.typicalDose.line)}</div><div class="bio-note">The usual prescribed range, shown for reference only — not a dose to take on your own. Only a certified doctor can decide if and how much you should take.</div>`, b.typicalDose.tier));
      if (b.overdose) rc.push(bioCard('☠️', 'Overdose — signs & dangers', mdInline(b.overdose.line), b.overdose.tier));
      if (b.misuse) rc.push(bioCard('⚠️', rx ? 'Dangers of not taking it as prescribed' : 'Why there is no safe DIY dose', mdInline(b.misuse.line), b.misuse.tier));
      rc.push(bioBiomarkersCard(b, rx ? 'What a doctor monitors' : 'What harm shows up in labs'));
      rc.push(bioContraCard(b, '⛔', 'Who must not take it'));
      const cards = rc.filter(Boolean);
      const banner = bioBanner(b);
      if (!banner && !cards.length) return '';
      return `<section class="bio-section" id="sec-bio"><div class="bio-head"><h2>🛡️ Using it safely — what to know</h2><p class="bio-sub">This is a ${rx ? 'prescription medicine' : 'compound not approved for human use'}. The notes below are educational, not medical advice — always follow a qualified professional.</p></div>${banner}<div class="bio-cards">${cards.join('')}</div></section>`;
    }
    const cards = [];
    if (b.form) cards.push(bioCard('💊', 'Form & bioavailability', [
      b.form.buy ? `<div class="bio-line bio-buy"><b>Buy:</b> ${mdInline(b.form.buy)}</div>` : '',
      b.form.avoid ? `<div class="bio-line bio-avoid"><b>Skip:</b> ${mdInline(b.form.avoid)}</div>` : '',
      b.form.withFood ? `<div class="bio-line"><b>With food:</b> ${mdInline(b.form.withFood)}</div>` : '',
      b.form.bioavailability ? `<div class="bio-line bio-muted"><b>Absorption:</b> ${mdInline(b.form.bioavailability)}</div>` : '',
    ].join(''), b.form.tier));
    if (Array.isArray(b.biomarkers) && b.biomarkers.length) cards.push(bioCard('🩸', 'Biomarkers to track', `<div class="bio-tbl-wrap"><table class="bio-tbl"><thead><tr><th>Marker</th><th>What it tells you</th><th>Target / note</th></tr></thead><tbody>${b.biomarkers.map(m => `<tr><td><b>${esc(stripB(m.marker))}</b>${m.when ? `<div class="bio-when">${esc(m.when)}</div>` : ''}${bioTierChip(m.tier)}</td><td>${mdInline(m.why)}</td><td>${mdInline(m.range || '')}</td></tr>`).join('')}</tbody></table></div>`));
    if (b.cofactors) { const co = b.cofactors; const grp = (t, arr, ic) => (arr && arr.length) ? `<div class="bio-co-grp"><div class="bio-co-h">${ic} ${t}</div><ul>${arr.map(x => `<li><b>${esc(stripB(x.nutrient))}</b> — ${mdInline(x.role)} ${bioTierChip(x.tier)}</li>`).join('')}</ul></div>` : ''; const html = grp('Needs / cofactors', co.needs, '➕') + grp('Depletes', co.depletes, '➖') + grp('Antagonists', co.antagonists, '⛔'); if (html) cards.push(bioCard('🔗', 'Cofactors, depletions & antagonists', html)); }
    if (b.foodFirst) cards.push(bioCard('🥗', 'Food first', `<div class="bio-line">${mdInline(b.foodFirst.line)}</div>${b.foodFirst.note ? `<div class="bio-note">${mdInline(b.foodFirst.note)}</div>` : ''}`, b.foodFirst.tier));
    if (b.cost) cards.push(bioCard('💲', 'Cost per effective dose', `<div class="bio-cost-big">${esc(b.cost.perDose || '')}</div>${b.cost.math ? `<div class="bio-note">${mdInline(b.cost.math)}</div>` : ''}${b.cost.note ? `<div class="bio-line">${mdInline(b.cost.note)}</div>` : ''}<div class="bio-line muted">Singapore retail, as an order-of-magnitude guide \u2014 about 0.75 of this in US dollars, and cheaper in bulk almost everywhere.</div>`, b.cost.tier));
    if (b.dosing) { const d = b.dosing; const calc = d.perKg ? `<div class="bio-dose" data-perkg="${esc(String(d.perKg))}" data-unit="${esc(d.unit || 'g')}"${d.capValue != null ? ` data-cap-value="${esc(String(d.capValue))}"` : ''}${d.capPerKg != null ? ` data-cap-perkg="${esc(String(d.capPerKg))}"` : ''}${d.molecule ? ` data-molecule="${esc(d.molecule)}"` : ''}${d.flat ? ` data-flat="${esc(d.flat)}"` : ''}${d.schedule ? ` data-schedule="${esc(d.schedule)}"` : ''}><label>Your body weight <input type="number" class="bio-dose-w" placeholder="70" min="30" max="250" inputmode="numeric"> kg</label><div class="bio-dose-out">— enter your weight —</div></div>` : ''; const cap = d.cap ? `<div class="bio-line bio-muted"><b>Upper limit:</b> ${mdInline(d.cap)}</div>` : ''; const note = d.note ? `<div class="bio-note">${mdInline(d.note)}</div>` : ''; const inner = calc + cap + note; if (inner) cards.push(bioCard('⚖️', d.perKg ? 'Personalized dose' : 'Dose', inner, d.tier)); }
    if (b.timing) cards.push(bioCard('⏰', 'Timing', mdInline(b.timing.line), b.timing.tier));
    if (b.cycling) cards.push(bioCard('🔄', 'Cycling & tolerance', mdInline(b.cycling.line), b.cycling.tier));
    if (Array.isArray(b.contra) && b.contra.length) cards.push(bioCard('⚠️', 'Personalized cautions', `<ul class="bio-contra">${b.contra.map(x => `<li><b>${esc(stripB(x.flag))}:</b> ${mdInline(x.advice)} ${bioTierChip(x.tier)}</li>`).join('')}</ul>`));
    if (b.quality) cards.push(bioCard('🔬', 'Quality & sourcing', mdInline(b.quality.line), b.quality.tier));
    if (b.nonResponders) cards.push(bioCard('🧬', 'Are you a non-responder?', mdInline(b.nonResponders.line), b.nonResponders.tier));
    if (Array.isArray(b.synergy) && b.synergy.length) cards.push(bioCard('🤝', 'Goes well with — and why', `<ul class="bio-syn">${b.synergy.map(x => { const cs = slug(x.with); const link = bySlug[cs] ? `<a href="#/c/${cs}">${esc(stripB(x.with))}</a>` : esc(stripB(x.with)); return `<li><b>${link}</b> — ${mdInline(x.why)} ${bioTierChip(x.tier)}</li>`; }).join('')}</ul>`));
    if (!cards.length) return '';
    return `<section class="bio-section" id="sec-bio"><div class="bio-head"><h2>🎯 Dial it in — the biohacker layer</h2><p class="bio-sub">Form, dose, timing, biomarkers and quality — how to actually get the result, not just swallow the molecule. Each card is tagged by how strong the evidence is.</p></div><div class="bio-cards">${cards.join('')}</div></section>`;
  }

  function detail(s) {
    const c = bySlug[s]; if (!c) return notFound();
    setTimeout(() => {
      const b = document.getElementById('stack-btn'); if (b) b.onclick = () => { toggleStack(c.id); route(); };
      const mh = document.querySelector('[data-mechhelp]'); if (mh) mh.onclick = () => { const g = document.getElementById('mech-guide'); if (g) { g.hidden = !g.hidden; mh.classList.toggle('open', !g.hidden); } };
      enhanceDetail(c);
    }, 0);
    const callout = (key, k, v, cls) => v ? `<div class="callout ${cls || ''}" id="sec-${key}"><span class="k">${k}</span><span id="field-${key}" class="field-val">${mdInline(v)}</span></div>` : '';
    const related = D.compounds.filter(x => x.id !== c.id && (x.category === c.category || x.goalIds.some(g => c.goalIds.includes(g)))).sort((a, b) => b.stars - a.stars).slice(0, 6);
    const goalTags = c.goalIds.map(g => `<a class="chip" href="#/goal/${g}">${goalById[g].icon} ${goalById[g].label}</a>`).join('');
    const added = inStack(c.id);
    // ---- content grouped into flowing chapters (each tab swaps the whole reading area) ----
    const chainHtml = explodedDiagram(c);
    const fact = (window.RNAWIKI_FACTS || []).find(x => x.href === '/c/' + s);
    const didYouKnow = fact ? `<div class="cpd-fact"><span class="cf-k">💡 Did you know?</span> <span class="cf-t">${fact.t}</span> ${shareBtn('fact:' + s)}</div>` : '';
    // ---- W3.5 (2026-08-02): THE PAGE RECOMMENDED PAIRINGS ITS OWN CHECKER CALLS DANGEROUS ----
    // derivedStacks() takes every compound sharing a pathway, sorts by star count and keeps four.
    // Nobody wrote those pairings; the machine inferred them from a shared pathway id — the same
    // shape of inference as the category-default tag this wave has just finished deleting from
    // site/interactions.js. It was then printed under the heading "🔗 Stacks with" as "Shares a
    // pathway — often paired with: …", which is an empirical claim about what people do that no
    // one on this project has measured.
    //
    // MEASURED 2026-08-02 over the shipped corpus with the site's own stackInteractions()
    // (out/w35h_contra.mjs, out/w35h_contra.json) — a record of what W3.5 found on that date, not a
    // live figure: 133 of 171 compound pages printed 523 such recommendations, and the
    // site's own interaction checker flags 80 of them — 63 at DANGER tier, 10 blunt, 7 timing,
    // across 38 pages and 64 distinct molecule pairs. /c/l-citrulline-citrulline-malate recommended
    // PDE-5 Inhibitors two lines above its own "⚠️ Avoid combining with … can drop blood pressure
    // dangerously", and /stack renders that same pair as "☠️ 1 dangerous combination". Six GLP-1
    // pages recommended each other under "duplicate therapy"; the DNP page recommended four
    // compounds under a rule whose title is "DNP — do not use".
    //
    // TWO CHANGES, both of which keep the honest half. (1) The computed list gets its own heading
    // and states only the fact it is computed from — these compounds act on the same pathway —
    // with the pairing advice removed. (2) Every entry is run through stackInteractions() and any
    // the checker flags carries that flag inline, at its own tier. Nothing is hidden: a flagged
    // pair still appears, because dropping it would turn a warning into a silent absence and imply
    // the rest were checked and cleared. The checker's coverage is stated ELSEWHERE and is not
    // repeated here. As of 2026-08-02 this comment said "covers 92 of 171 compounds", which was
    // already wrong by two when W5a read it (the live figure is site/interactions.js
    // `coverage.reachable`, which
    // assertInteractionCoverage() recomputes from the corpus on every build and refuses to build if
    // it drifts). A number copied into a comment has no gate on it and goes stale silently — the
    // same defect class as every other one on this project, two records of one fact with nothing
    // checking them. Read the gated field, not this line. This list makes no safety claim either way.
    const stacksBlock = (() => {
      const sg = sgAvailability(c);
      const derived = derivedStacks(c);
      const derivedHtml = derived.map(o => {
        const f = pairFlag(c, o);
        const link = `<a href="#/c/${slug(o.name)}">${esc(o.name)}</a>`;
        return f ? `${link} <span class="ds-flag ${f.tier}">${TIER_ICON[f.tier]} ${esc(f.title)}</span>` : link;
      }).join(' · ');
      return `${c.stacksWith ? `<div class="section-title">🔗 Stacks with</div><p class="field-val">${mdInline(c.stacksWith)}</p>` : ''}${derived.length ? `<div class="section-title">🧬 Acts on the same pathway</div><p class="muted" style="font-size:.88rem">Computed from shared pathways, not a suggestion to combine them: ${derivedHtml}.</p>` : ''}${c.avoid ? `<div class="section-title">⚠️ Avoid combining with</div><div class="sg-buy warn">${mdInline(c.avoid)}</div>` : ''}<div class="section-title">🌐 Availability &amp; where to buy</div><div class="sg-buy ${sg.cls}"><b>${esc(sg.tag)}.</b> ${sg.body}${sg.sg ? `<div class="sg-local"><b>Singapore:</b> ${esc(sg.sg)}</div>` : ''}${c.cost ? `<div class="sg-cost">💲 ${mdInline(c.cost)}</div>` : ''}</div>`;
    })();
    const usedIn = (() => { const ps = protocolsForCompound(c); return ps.length ? `<div class="cpd-sec"><div class="section-title">🧭 Used in these protocols</div><p style="color:var(--muted);margin-top:-.4rem">Where ${esc(c.name)} is part of a full Move · Fuel · Stack plan.</p><div class="solve-grid">${ps.slice(0, 6).map(x => protoLink(x.p, x.rc)).join('')}</div></div>` : ''; })();
    const evidenceBlock = evidenceGlance(c) + (c.evi ? evidenceDeep(c) : (c.evidence ? `<details class="evidence-block" id="sec-evidence"><summary>🔬 The human evidence <span class="ev-hint">— the actual trials, for the sceptical</span></summary><div class="ev-body">${mdInline(c.evidence)}</div></details>` : ''));
    const exploreBlock = (() => {
      const cmpPeers = D.compounds.filter(x => x.id !== c.id && !x.isNote && Array.isArray(x.goalIds) && x.goalIds.some(g => c.goalIds.includes(g)))
        .map(x => ({ x, n: x.goalIds.filter(g => c.goalIds.includes(g)).length })).sort((a, b) => b.n - a.n || b.x.stars - a.x.stars).slice(0, 3).map(o => o.x);
      const cmpCards = cmpPeers.map(o => `<a class="cmp-card" href="#/compare/${slug(c.name)}-vs-${slug(o.name)}"><span class="cmp-vs">vs</span><span class="cmp-name">${esc(o.name.split('(')[0].trim())}</span>${starHTML(o.stars, { compact: true, cls: 'cmp-stars' })}</a>`).join('');
      const myStack = getStack().map(id => byId[id]).filter(Boolean); let chk = '';
      if (myStack.length) { const withThis = myStack.some(x => x.id === c.id) ? myStack : myStack.concat([c]); const pan = interactionPanel(withThis); chk = pan ? `<div class="section-title">⚠️ With your current stack (${myStack.length})</div>${pan}` : `<div class="stack-ok">❔ ${esc(c.name)} is the only thing in your stack, so there is nothing to cross-check it against yet. Add a second compound and this becomes an interaction check.</div>`; }
      return (cmpCards || chk) ? `<div class="cpd-explore">${cmpCards ? `<div class="section-title">⚖️ Compare with alternatives</div><div class="cmp-grid">${cmpCards}</div>` : ''}${chk}</div>` : '';
    })();
    const ch1 = hookBox(c) + stakesLine(c) + bigIdeaBanner(c) + analogyBox(c) + takeawaysBox(c) + callout('plain', 'In plain English — start here', c.plain) + moleculeViewer(c) + mythsBox(c, s) + didYouKnow + (!chainHtml && goalTags ? `<div class="toolbar" style="margin-top:1rem">${goalTags}</div>` : '') + (c.brief && !c.mechanism ? `<div class="body">${c.bodyHtml}</div>` : '');
    const ch2 = moleculeJourney(c, s) + (c.mechSteps ? mechanismCascade(c, s) : callout('mechanism', 'How it works — the science', c.mechanism)) + contrastBlock(c) + (chainHtml ? `<div class="mech-chain-wrap">${chainHtml}</div>` : '') + goDeeper(c);
    const _tui = tierUI(c);
    const ch3 = callout('protocol', _tui.protoH, c.protocol) + pkTimeline(c) + doseSimulator(c) + whenToUseBox(c) + callout('watch', 'Watch out', c.watch, 'warn') + stacksBlock + usedIn;
    const ch4 = evidenceBlock + positioningPlot(c) + exploreBlock + callout('bottom', 'Bottom line', c.bottom);
    const ch5 = expertFramework(c) + (c.mechSteps && c.mechanism ? callout('mechanism-full', 'The full mechanism — the original technical write-up', c.mechanism) : '') + biotechDeepDive(c);
    const ch6 = selfTestBox(c) + feynmanBox(c) + graduationBlock(c) + journeyBlock('compound', c.id);
    const chBio = bioSection(c);
    const _bioAccess = c.bio && (c.bio.access === 'prescription' || c.bio.access === 'unapproved');
    const chapterDefs = [
      { n: 1, icon: '🌱', label: 'Start here', html: ch1, check: 'start' }, { n: 2, icon: '⚙️', label: 'How it works', html: ch2, check: 'how' },
      { n: 3, icon: _tui.icon, label: _tui.label, html: ch3, check: 'use' },
      { n: 7, icon: _bioAccess ? '🛡️' : '🎯', label: _bioAccess ? 'Using it safely' : 'Dial it in', html: chBio },
      { n: 4, icon: '📊', label: 'The evidence', html: ch4, check: 'evidence' },
      { n: 5, icon: '🔬', label: 'Deep dive', html: ch5 }, { n: 6, icon: '🎓', label: 'Prove it', html: ch6 },
    ].filter(ch => ch.html && ch.html.trim());
    // Numbered mastery spine — a course stepper that checks off as you read
    const tabs = `<div class="ch-steps" role="tablist">${chapterDefs.map((ch, i) => `<button class="ch-step${i === 0 ? ' active' : ''}" data-ch="${ch.n}"><span class="cs-num">${i + 1}</span><span class="cs-label">${ch.icon} ${esc(ch.label)}</span></button>`).join('')}</div>`;
    const sections = `<div class="chapters" id="cpd-chapters">${chapterDefs.map((ch, i) => { const nx = chapterDefs[i + 1]; const nav = nx ? `<button class="ch-next-btn" data-chgo="${nx.n}">Next: ${nx.icon} ${esc(nx.label)} →</button>` : ''; return `<section class="chapter${i === 0 ? ' active' : ''}" data-chapter="${ch.n}">${ch.html}${ch.check ? chapterCheck(c, ch.check) : ''}${nav ? `<div class="ch-nav">${nav}</div>` : ''}</section>`; }).join('')}</div>`;
    const faq = faqRender([
      // See the note in build/prerender.js: the star is a whole-compound summary, not an
      // indication-specific grade, so it does not belong inside a structured-data efficacy claim.
      (c.bottom || c.plain) ? { q: `Does ${c.name} actually work?`, a: `${faqSnip(c.bottom || c.plain, 260)}` } : null,
      c.protocol ? { q: `How do you take ${c.name}?`, a: faqSnip(c.protocol, 300) } : null,
      c.watch ? { q: `What are the risks or side effects of ${c.name}?`, a: faqSnip(c.watch, 300) } : null,
      (c.approvalLabels || []).length ? { q: `Is ${c.name} legal or approved?`, a: `Regulatory status: ${(c.approvalLabels || []).join(', ')}.` } : null,
    ]);
    return `<div class="detail" id="cpd-detail" data-cid="${pubchemCID(c) || ''}">
      ${crumbs([{ label: 'Home', href: '#/' }, { label: c.category }, { label: c.name }])}
      <div class="detail-head">
        <div><h1>${c.name}</h1>${badgeRow(c)}</div>
        <div class="detail-actions">
          ${learnedBtn(c)}
          ${PHASE2 ? '<button id="edit-btn" class="edit-btn" title="Improve this page">✎ Edit page</button>' : ''}
          ${compoundTier(c) === 'DANGER' ? '<span class="stack-btn-lg danger-chip" title="Not for human use">⚠️ Not for use</span>' : `<button id="stack-btn" class="stack-btn-lg ${added ? 'in' : ''}">${added ? '✓ In your stack' : '+ Add to stack'}</button>`}
        </div>
      </div>
      ${specStrip(c)}
      ${journeyRibbon('compound', c.id)}
      <p class="ch-lead">A step-by-step lesson — tap through from beginner to expert. Each tab teaches the next layer.</p>
      ${tabs}
      <div id="edit-meta" class="edit-meta"></div>
      ${sections}
      <div class="cpd-faq-wrap" hidden>${faq}</div>
      ${related.length ? `<details class="related-fold"><summary>Or branch off — related compounds</summary><div class="related">${related.map(cpdCard).join('')}</div></details>` : ''}
      <div id="goal-comments" class="page-discuss"></div>
    </div>`;
  }

  function targetPage(sym) {
    const t = targetBySym[tkey(decodeURIComponent(sym))]; if (!t) return notFound();
    const list = t.compoundIds.map(id => byId[id]).filter(Boolean).sort((a, b) => b.stars - a.stars);
    const pw = {}; list.forEach(c => (c.pathwayIds || []).forEach(i => pw[i] = (pw[i] || 0) + 1));
    const pwChips = Object.keys(pw).sort((a, b) => pw[b] - pw[a]).slice(0, 4).map(i => `<a class="ex-node p" href="#/pathway/${i}">${D.pathways[i].shortLabel}</a>`).join('');
    const cleanName = t.name.replace(new RegExp('^' + t.sym + '\\s*', 'i'), '') || t.sym;
    const crumb = crumbs([{ label: 'Home', href: '#/' }, { label: 'Browse targets', href: '#/browse' }, { label: t.sym }]);
    const cpdSection = list.length ? `<div class="section-title">Compounds acting on ${esc(t.sym)} (${list.length})</div><div class="card-grid">${list.map(cpdCard).join('')}</div>` : '';
    // The prescription notice is generated in parse.js and MUST render in both documents — this is
    // the regulatory surface, and a notice that only reaches the prerendered page is not a notice.
    const pomHtml = t.pomNotice
      ? `<div class="pom-notice"><b>⚕️ Prescription-only medicines are named on this page.</b> ${esc(t.pomNotice.text)}</div>` : '';
    const explainerHtml = (t.explainer && t.explainer.html) ? `${pomHtml}<div class="target-explainer">${t.explainer.html}</div>` : pomHtml;
    // Legacy render until the learning layer is authored (graceful degradation)
    if (!(t.hook || t.bigIdea || t.mechSteps)) {
      return `<div class="detail">${crumb}
        <div class="target-hero"><div class="tsym">${t.sym}</div><div><h1>${cleanName}</h1>
          <p style="color:var(--muted);margin:.3rem 0"><b>${list.length} compound${list.length > 1 ? 's' : ''}</b> in the wiki act${list.length > 1 ? '' : 's'} on this target. Learn what it does once, and every compound below makes sense.</p>
          <p><a href="${t.url}" target="_blank" rel="noopener">Official record →</a></p>${pwChips ? `<div class="ex-nodes" style="margin-top:.6rem">${pwChips}</div>` : ''}</div></div>
        ${explainerHtml}<div class="suggest-row"><button class="linkbtn" data-suggest="analogy" data-ref="${esc(t.sym)}">💡 Suggest a plain-English analogy</button></div>
        <div class="section-title">Compounds acting on ${t.sym}</div><div class="card-grid">${list.map(cpdCard).join('')}</div></div>`;
    }
    // Chaptered lesson — reuse the pedagogy components via a pseudo-compound
    const pc = Object.assign({}, t, { name: t.sym, id: 'tg-' + tkey(t.sym) });
    const ch1 = hookBox(pc) + stakesLine(pc) + bigIdeaBanner(pc) + analogyBox(pc) + explainerHtml;
    const ch2 = mechanismCascade(pc) + mythsBox(pc);
    const ch3 = (cpdSection || '<p class="muted">Compounds that act here are being added.</p>') + `<p class="pw-cpd-note">Every compound here acts on ${esc(t.sym)} — open any to see whether it switches this target on or off, then come back.</p>` + (pwChips ? `<div class="section-title">Pathways this feeds into</div><div class="ex-nodes">${pwChips}</div>` : '');
    const ch4 = selfTestBox(pc) + feynmanBox(pc) + graduationBlock(pc);
    const chapterDefs = [
      { n: 1, icon: '🌱', label: 'What it is', html: ch1 }, { n: 2, icon: '⚙️', label: 'How it works', html: ch2 },
      { n: 3, icon: '💊', label: 'What acts on it', html: ch3 }, { n: 4, icon: '🎓', label: 'Prove it', html: ch4 },
    ].filter(ch => ch.html && ch.html.trim());
    const tabs = `<div class="ch-steps" role="tablist">${chapterDefs.map((ch, k) => `<button class="ch-step${k === 0 ? ' active' : ''}" data-ch="${ch.n}"><span class="cs-num">${k + 1}</span><span class="cs-label">${ch.icon} ${esc(ch.label)}</span></button>`).join('')}</div>`;
    // ---- W5b (2026-08-02): D16 — THE STRUCTURE THE CRAWLER GETS AND THE READER DOES NOT --------
    // Measured on all 103 /target routes: the prerendered document carries 8 <h2 id> plus an
    // "On this page · N min read" contents card; the hydrated one carried h2 = 0 and h4 = 0 on
    // 103/103, an H1 -> H3 heading skip on 103/103 (the compound cards below are <h3>), no contents
    // card and no read-time. 77 of 103 had exactly TWO headings for a 1,340-word page.
    // The chapters were always the section structure — they were just never headings. Naming each
    // one <h2> costs no new copy, restores H1 -> H2 -> H3, and gives anchorizeHeadings() something
    // to name, so the chapter links below are real addresses.
    // The minutes are computed from THIS document's own words, at 230 wpm — the same rate
    // build/prerender.js uses on its own. The two documents hold different amounts of text, so the
    // two numbers legitimately differ; each is true of the page it is printed on, and neither is
    // copied from the other.
    const chTitle = (ch) => `<h2 class="ch-title" id="${headSlug(ch.label)}">${ch.icon} ${esc(ch.label)}</h2>`;
    const _tgWords = chapterDefs.map((ch) => ch.html).join(' ').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    const _tgMins = Math.max(1, Math.round(_tgWords / 230));
    const toc = chapterDefs.length > 1 ? `<nav class="cpd-toc pagetoc" aria-label="Contents">
      <span class="toc-lbl">On this page · ${_tgMins} min read</span>
      ${chapterDefs.map((ch) => `<a href="#${headSlug(ch.label)}">${ch.icon} ${esc(ch.label)}</a>`).join('')}
    </nav>` : '';
    const sections = `<div class="chapters" id="cpd-chapters">${chapterDefs.map((ch, k) => { const nx = chapterDefs[k + 1]; const nav = nx ? `<button class="ch-next-btn" data-chgo="${nx.n}">Next: ${nx.icon} ${esc(nx.label)} →</button>` : ''; return `<section class="chapter${k === 0 ? ' active' : ''}" data-chapter="${ch.n}">${chTitle(ch)}${ch.html}${nav ? `<div class="ch-nav">${nav}</div>` : ''}</section>`; }).join('')}</div>`;
    setTimeout(() => { wirePathwayLearning(pc); }, 0);
    return `<div class="detail lesson-detail" id="tg-detail">${crumb}
      <div class="target-hero"><div class="tsym">${t.sym}</div><div><h1>${cleanName}</h1><span class="pw-badge">🎯 Molecular target · ${list.length} compound${list.length > 1 ? 's' : ''}</span><p><a href="${t.url}" target="_blank" rel="noopener">Official record ↗</a></p></div></div>
      <p class="ch-lead">Learn this target once — then every compound that acts on it makes sense. Tap through from beginner to expert.</p>
      ${toc}${tabs}${sections}</div>`;
  }

  function browsePage() {
    const targets = (D.targets || []);
    const tcards = targets.map(t => `<a class="part-card" href="#/target/${tkey(t.sym)}">
      <div class="part-count">${t.compoundIds.length}</div>
      <div class="part-sym">${t.sym}</div>
      <div class="part-name">${t.name.replace(new RegExp('^' + t.sym + '\\s*', 'i'), '').slice(0, 42) || t.name}</div>
    </a>`).join('');
    const pcards = D.pathways.map((p, i) => `<a class="learn-card" href="#/pathway/${i}"><span class="step">${compoundsByPathway[i].length} compounds</span><h3>${p.shortLabel}</h3></a>`).join('');
    return `${crumbs([{ label: 'Home', href: '#/' }, { label: 'Browse' }])}
      <h1>Browse by target &amp; pathway</h1>
      <p style="color:var(--muted)">Every molecular target, sized by how many compounds act on it. The bigger ones are shared by many compounds — click any to see them all.</p>
      <div class="section-title">Molecular targets (${targets.length})</div>
      <div class="part-grid">${tcards}</div>
      <div class="section-title">Pathways (${D.pathways.length})</div>
      <div class="learn-grid">${pcards}</div>`;
  }

  // one consistent "next step" CTA for pages that would otherwise dead-end
  function solveCta(label) { return `<div class="page-cta"><a class="cta-primary" href="#/solve">${label || 'Build my protocol →'}</a></div>`; }
  function learnIndex() {
    const cards = D.modules.map((m, i) => `<a class="learn-card" href="#/learn/${i}"><span class="step">Module ${i + 1}</span><h3>${stripNum(m.title)}</h3></a>`).join('');
    const energy = (ANAT.energy_systems || []).map(e => `<a class="anat-tile energy" href="#/energy/${e.id}"><b>⚡ ${esc(e.name.split('(')[0].trim())}</b><small>${esc(e.duration)}</small></a>`).join('');
    const physio = (ANAT.metabolism || []).map(p => `<a class="anat-tile physio" href="#/physiology/${p.id}"><b>${esc(p.name)}</b><small>${esc((p.plain || '').slice(0, 52))}…</small></a>`).join('');
    const musc = (ANAT.muscles || []).map(m => `<a class="learn-muscle" href="#/muscle/${m.id}">${esc(m.name)}</a>`).join('');
    return `<div class="article">${crumbs([{ label: 'Home', href: '#/' }, { label: 'Learn' }])}
      <h1>Learn</h1>
      <p style="color:var(--muted)">The science behind every protocol, in plain English — from how a compound reaches its target to how a muscle contracts and which energy system fuels it.</p>

      <div class="section-title">📚 Foundations</div>
      <p class="muted" style="font-size:.9rem">Start here if the science feels over your head — then every entry on the site becomes easy to read.</p>
      <div class="learn-grid">${cards}</div>

      <div class="section-title">🧬 The 16 master pathways</div>
      <p class="muted" style="font-size:.9rem">The molecular “latticework” — the signalling routes every compound pulls. <a href="#/pathways">Browse all pathways →</a></p>

      <div class="section-title">⚡ Energy systems</div>
      <p class="muted" style="font-size:.9rem">How muscles are powered, from a one-second max effort to an all-day walk.</p>
      <div class="anat-cards">${energy}</div>

      <div class="section-title">🔬 Metabolism &amp; physiology</div>
      <p class="muted" style="font-size:.9rem">How the body makes and manages its fuel — the science under every nutrition and supplement protocol.</p>
      <div class="anat-cards">${physio}</div>

      <div class="section-title">💪 Muscle anatomy</div>
      <p class="muted" style="font-size:.9rem">The anatomy, mechanics and training of every major muscle group — each linked from the exercises that train it.</p>
      <div class="learn-muscles">${musc}</div>

      ${solveCta('Know your goal already? Build your protocol →')}</div>`;
  }
  // Hero diagram for each Foundations module — the classic visual for its topic.
  function foundationsDiagram(i) {
    const C = { blue: '#2563eb', teal: '#0d9488', slate: '#475569', red: '#b3261e', amber: '#d97706', line: '#64748b', mut: '#94a3b8', green: '#059669' };
    const box = (x, y, w, h, label, fill, sub) => `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${fill}" fill-opacity="0.12" stroke="${fill}" stroke-width="1.5"/><text x="${x + w / 2}" y="${sub ? y + h / 2 - 2 : y + h / 2 + 4}" text-anchor="middle" font-size="13" font-weight="700" fill="${fill}">${label}</text>${sub ? `<text x="${x + w / 2}" y="${y + h / 2 + 14}" text-anchor="middle" font-size="10" fill="${C.line}">${sub}</text>` : ''}</g>`;
    const arr = (x1, y1, x2, y2, col) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col || C.line}" stroke-width="2.2" marker-end="url(#fd-a)"/>`;
    const t = (x, y, txt, col, size, anchor, ital) => `<text x="${x}" y="${y}" font-size="${size || 10.5}" fill="${col || C.line}" text-anchor="${anchor || 'middle'}"${ital ? ' font-style="italic"' : ''}>${txt}</text>`;
    const dash = (x1, y1, x2, y2, col) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col || C.mut}" stroke-width="1.3" stroke-dasharray="5 4"/>`;
    const rows5 = (data) => data.map((r, k) => { const y = 20 + k * 56; return box(40, y, 290, 44, r[0], r[2]) + arr(330, y + 22, 398, y + 22) + box(400, y, 320, 44, r[1], C.slate); }).join('');
    const D = [
      ['760 300', 'From gene to protein — and the four protein types a drug targets.',
        box(120, 24, 140, 48, 'DNA', C.slate, 'the blueprint') + box(310, 24, 140, 48, 'RNA', C.teal, 'the builder') + box(500, 24, 140, 48, 'Protein', C.blue, 'the machine') +
        arr(260, 48, 310, 48) + t(285, 40, 'transcribe', C.mut, 9, 'middle', true) + arr(450, 48, 500, 48) + t(475, 40, 'translate', C.mut, 9, 'middle', true) +
        arr(380, 72, 380, 104) + t(380, 124, 'Most proteins are one of 4 types a drug can target:', C.line, 11) +
        box(20, 140, 170, 60, 'Receptor', C.blue, 'receives signals') + box(210, 140, 160, 60, 'Enzyme', C.teal, 'speeds reactions') +
        box(390, 140, 170, 60, 'Transporter', C.slate, 'moves molecules') + box(580, 140, 160, 60, 'Ion channel', C.red, 'gates charge') +
        box(150, 236, 460, 44, 'Bind the right protein → change what the cell does', C.amber)],
      ['760 400', 'ADME — and how a dose rises, peaks, then halves (its half-life).',
        box(20, 18, 160, 48, 'Absorption', C.teal, 'into the blood') + box(215, 18, 160, 48, 'Distribution', C.slate, 'to the tissues') +
        box(410, 18, 160, 48, 'Metabolism', C.blue, 'liver breaks it down') + box(605, 18, 150, 48, 'Excretion', C.red, 'kidney clears it') +
        arr(180, 42, 215, 42) + arr(375, 42, 410, 42) + arr(570, 42, 605, 42) +
        `<line x1="80" y1="130" x2="80" y2="330" stroke="${C.mut}" stroke-width="1.4"/><line x1="80" y1="330" x2="710" y2="330" stroke="${C.mut}" stroke-width="1.4"/>` +
        `<path d="M80,328 C 150,328 190,170 235,160 C 330,140 470,270 700,312" fill="none" stroke="${C.teal}" stroke-width="2.6"/>` +
        dash(80, 160, 235, 160) + t(86, 153, 'peak level (Cmax)', C.line, 10, 'start') +
        dash(80, 245, 395, 245) + dash(395, 245, 395, 330) + t(395, 348, 'one half-life', C.amber, 10) +
        t(400, 372, 'time after the dose →', C.mut, 10.5) + t(96, 120, 'drug in blood', C.mut, 10, 'start')],
      ['780 360', 'The dose–response curve: potency (EC50), efficacy (the ceiling), agonist vs antagonist.',
        `<line x1="90" y1="70" x2="90" y2="300" stroke="${C.mut}" stroke-width="1.4"/><line x1="90" y1="300" x2="560" y2="300" stroke="${C.mut}" stroke-width="1.4"/>` +
        `<path d="M100,294 C 210,292 240,270 300,195 C 340,140 380,108 450,102 C 520,97 545,96 555,95" fill="none" stroke="${C.blue}" stroke-width="2.6"/>` +
        dash(90, 195, 300, 195) + dash(300, 195, 300, 300) + t(300, 316, 'EC50 · potency', C.amber, 10) +
        dash(90, 100, 555, 100) + t(96, 93, 'ceiling · efficacy', C.line, 10, 'start') +
        t(96, 60, 'effect', C.mut, 10, 'start') + t(330, 338, 'dose →', C.mut, 10.5) +
        box(600, 78, 165, 58, 'Agonist', C.green, 'turns the target ON') + box(600, 156, 165, 58, 'Antagonist', C.red, 'blocks it — flattens') +
        box(600, 234, 165, 54, 'Partial agonist', C.amber, 'lower ceiling')],
      ['760 370', 'The evidence hierarchy — the higher the tier, the more the stars.',
        `<polygon points="380,34 660,330 100,330" fill="${C.teal}" fill-opacity="0.06" stroke="${C.mut}" stroke-width="1.4"/>` +
        dash(318, 100, 442, 100) + dash(263, 158, 497, 158) + dash(208, 216, 552, 216) + dash(153, 274, 607, 274) +
        t(380, 74, 'Meta-analyses', C.green, 12) + t(380, 132, 'Randomised trials (RCTs)', C.teal, 12) +
        t(380, 190, 'Cohort / observational', C.slate, 11.5) + t(380, 248, 'Case reports & series', C.slate, 11.5) +
        t(380, 304, 'Anecdote · opinion · mechanism', C.mut, 11) +
        arr(64, 322, 64, 52, C.green) + t(64, 44, 'stronger', C.green, 10) + t(64, 340, 'weaker', C.mut, 10) + t(700, 190, '↑ earns more stars', C.line, 10, 'middle', true)],
      ['760 310', 'What every entry shows you — and what each part means.',
        rows5([['Approval badge', 'legal status — over-the-counter, prescription, or banned', C.amber], ['Evidence stars', 'how strong the human proof is', C.teal], ['Technical mechanism', 'the gene / receptor it acts on', C.blue], ['Molecular target', 'an official link to verify it', C.slate], ['In plain English', 'what it actually means for you', C.green]])]
    ];
    const d = D[i]; if (!d) return '';
    return `<figure class="learn-fig pd-fig"><svg viewBox="0 0 ${d[0]}" role="img" aria-label="${esc(d[1])}"><defs><marker id="fd-a" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="${C.line}"/></marker></defs>${d[2]}</svg><figcaption class="fig-credit">${esc(d[1])}</figcaption></figure>`;
  }
  // "Learn & master" scaffold: a takeaways summary + an active-recall quiz (native <details> reveal).
  // Content is authored in FOUNDATIONS.md ```learn blocks — no science invented here, just recall.
  function learnScaffold(m) {
    if (!m.learn) return '';
    const l = m.learn;
    const takeaways = (l.takeaways || []).length ? `<div class="learn-takeaways"><div class="lt-h">✅ Key takeaways</div><ul>${l.takeaways.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>` : '';
    const quiz = (l.quiz || []).length ? `<div class="learn-quiz"><div class="lq-h">🧠 Check yourself</div><p class="lq-sub">Answer in your head first, then reveal — active recall is how it sticks.</p>${l.quiz.map((q, i) => `<details class="lq-item"><summary><span class="lq-n">Q${i + 1}</span> ${esc(q.q)}</summary><div class="lq-a">${esc(q.a)}</div></details>`).join('')}</div>` : '';
    return takeaways + quiz;
  }
  function learnModule(i) {
    i = +i; const m = D.modules[i]; if (!m) return notFound();
    const prev = i > 0 ? `<a href="#/learn/${i - 1}">← ${stripNum(D.modules[i - 1].title)}</a>` : `<a href="#/learn">← All modules</a>`;
    const next = i < D.modules.length - 1 ? `<a href="#/learn/${i + 1}">${stripNum(D.modules[i + 1].title)} →</a>` : `<a href="#/pathways">The 16 Pathways →</a>`;
    const crumb = crumbs([{ label: 'Home', href: '#/' }, { label: 'Foundations', href: '#/learn' }, { label: 'Module ' + (i + 1) }]);
    if (m.expand) return learnCourse(m.expand, { name: stripNum(m.title), key: 'module-' + i, crumb, progress: `<div class="learn-progress">Foundations · Module ${i + 1} of ${D.modules.length}</div>`, badge: '<span class="pw-badge">📘 Foundations course</span>', prevnext: prev + next, journey: journeyBlock('module', i) });
    return `<div class="article"><div class="learn-progress">Foundations · Module ${i + 1} of ${D.modules.length}</div>${crumb}${foundationsDiagram(i)}${m.html}${learnScaffold(m)}${journeyBlock('module', i)}<div class="prevnext">${prev}${next}</div></div>`;
  }

  function pathwaysIndex() {
    const cards = D.pathways.map((p, i) => `<a class="learn-card" href="#/pathway/${i}"><span class="step">Pathway ${i + 1} · ${compoundsByPathway[i].length} compounds</span><h3>${p.shortLabel}</h3></a>`).join('');
    return `<div class="article">${crumbs([{ label: 'Home', href: '#/' }, { label: 'Pathways' }])}
      <h1>The 16 Pathways</h1>
      <p style="color:var(--muted)">Almost every compound works by turning one of these systems up or down. Learn the 16, and the whole wiki gets a lot simpler.</p>
      <div class="learn-grid" style="margin-top:1.4rem">${cards}</div></div>`;
  }
  function pathwayPage(i) {
    i = +i; const p = D.pathways[i]; if (!p) return notFound();
    const prev = i > 0 ? `<a href="#/pathway/${i - 1}">← ${D.pathways[i - 1].shortLabel}</a>` : `<a href="#/pathways">← All pathways</a>`;
    const next = i < D.pathways.length - 1 ? `<a href="#/pathway/${i + 1}">${D.pathways[i + 1].shortLabel} →</a>` : `<a href="#/pathways">All pathways →</a>`;
    const cpds = (compoundsByPathway[i] || []).slice().sort((a, b) => b.stars - a.stars);
    const cpdSection = cpds.length ? `<div class="section-title">Compounds that pull this lever (${cpds.length})</div><div class="card-grid">${cpds.map(cpdCard).join('')}</div>` : '';
    const pwFact = (window.RNAWIKI_FACTS || []).find(x => x.href === '/pathway/' + i);
    const pwFactHtml = pwFact ? `<div class="cpd-fact"><span class="cf-k">💡 Did you know?</span> <span class="cf-t">${pwFact.t}</span></div>` : '';
    const crumb = crumbs([{ label: 'Home', href: '#/' }, { label: 'Pathways', href: '#/pathways' }, { label: p.shortLabel }]);
    // Deep-expanded course (full fundamentals/deep-dive/expert-lens) — route through the course renderer,
    // injecting a "compounds that pull this lever" chapter that the generic renderer doesn't have.
    if (p.expand) {
      // pathwayDiagram() sat in the LEGACY branch BELOW this early return, and every one of the 16
      // pathways has p.expand — so an authored diagram existed on 16 of 16 pages and rendered on
      // zero of them. Same for p.html. Hoisted into the lede so both finally appear, at the top.
      const payoff = (p.expand.hook && p.expand.hook.payoff) ? `<div class="lc-why"><span class="lc-why-k">Why this one matters</span>${mdBlocks(p.expand.hook.payoff, mdInline)}</div>` : '';
      const oneLine = p.oneLine ? `<p class="pw-oneline"><b>In one line:</b> ${mdInline(p.oneLine)}</p>` : '';
      // ---- LEDE ORDER (2026-07-30) --------------------------------------------------------------
      // Measured against /muscle/biceps, the page the owner calls perfect: biceps opens with a
      // 34-word line and a draggable 3D model, then the hook. The pathway page opened with the
      // 120-word `hook.payoff` — the longest single paragraph on the page, first thing, above the
      // fold — then a one-liner, then the diagram. 223 words of prose above the hook versus 75.
      // Two different code paths produced that: `pathwayPage` prepends lc-why, `musclePage` never
      // did, even though muscle:biceps has a 76-word payoff authored and available.
      // So: lead with the SHORT concrete line and the picture, exactly like the page that works.
      // The payoff is not deleted — it moves below, where the hook's questions have created the
      // need it answers, and reads as a promise rather than a preamble.
      const lede = oneLine + pathwayDiagram(p.diagram, p.shortLabel);
      const cpdChapter = { icon: '💊', label: 'The compounds', at: 3, html: (cpdSection || '<p class="muted">Compounds that act here are being added.</p>') + `<p class="pw-cpd-note">Each of these pulls this exact lever — open any compound to see how it does, then come back. That's how the whole map connects.</p>` };
      return learnCourse(p.expand, { name: p.shortLabel, key: 'pathway-' + i, crumb, lede, postHook: payoff, badge: '<span class="pw-badge">🧬 Master-pathway course</span>', prevnext: prev + next, journey: journeyBlock('pathway', i), extraChapters: [cpdChapter] });
    }
    // Legacy render until the learning layer is authored (graceful degradation)
    if (!(p.hook || p.bigIdea || p.mechSteps)) {
      return `<div class="article">${crumb}<h1>${p.shortLabel}</h1>${pwFactHtml}${pathwayDiagram(p.diagram, p.shortLabel)}${p.html}<div class="suggest-row"><button class="linkbtn" data-suggest="simplify" data-ref="${esc(p.shortLabel)} pathway">✨ Too technical? Suggest a simpler version</button></div>${cpdSection}${journeyBlock('pathway', i)}<div id="goal-comments" class="page-discuss"></div><div class="prevnext">${prev}${next}</div></div>`;
    }
    // Chaptered lesson — reuse the compound pedagogy components via a pseudo-compound object
    const pc = Object.assign({}, p, { name: p.shortLabel, id: 'pw-' + i });
    const ch1 = hookBox(pc) + stakesLine(pc) + bigIdeaBanner(pc) + analogyBox(pc) + (p.oneLine ? `<p class="pw-oneline">${mdInline(p.oneLine)}</p>` : '') + pathwayDiagram(p.diagram, p.shortLabel);
    const ch2 = mechanismCascade(pc) + mythsBox(pc) + (p.html ? `<div class="body pw-source"><div class="section-title">The full technical write-up</div>${p.html}</div>` : '');
    const ch3 = (cpdSection || '<p class="muted">Compounds that act here are being added.</p>') + `<p class="pw-cpd-note">Each of these pulls this exact lever — open any compound to see how, then come back. That's how the whole map connects.</p>`;
    const ch4 = selfTestBox(pc) + feynmanBox(pc) + graduationBlock(pc) + journeyBlock('pathway', i);
    const chapterDefs = [
      { n: 1, icon: '🌱', label: 'Start here', html: ch1 }, { n: 2, icon: '⚙️', label: 'The cascade', html: ch2 },
      { n: 3, icon: '💊', label: 'The compounds', html: ch3 }, { n: 4, icon: '🎓', label: 'Prove it', html: ch4 },
    ].filter(ch => ch.html && ch.html.trim());
    const tabs = `<div class="ch-steps" role="tablist">${chapterDefs.map((ch, k) => `<button class="ch-step${k === 0 ? ' active' : ''}" data-ch="${ch.n}"><span class="cs-num">${k + 1}</span><span class="cs-label">${ch.icon} ${esc(ch.label)}</span></button>`).join('')}</div>`;
    const sections = `<div class="chapters" id="cpd-chapters">${chapterDefs.map((ch, k) => { const nx = chapterDefs[k + 1]; const nav = nx ? `<button class="ch-next-btn" data-chgo="${nx.n}">Next: ${nx.icon} ${esc(nx.label)} →</button>` : ''; return `<section class="chapter${k === 0 ? ' active' : ''}" data-chapter="${ch.n}">${ch.html}${nav ? `<div class="ch-nav">${nav}</div>` : ''}</section>`; }).join('')}</div>`;
    setTimeout(() => { wirePathwayLearning(pc); }, 0);
    return `<div class="detail lesson-detail" id="pw-detail">${crumb}
      <div class="detail-head"><div><h1>${esc(p.shortLabel)}</h1><span class="pw-badge">🧬 Master pathway</span></div></div>
      ${pwFactHtml}${journeyRibbon('pathway', i)}
      <p class="ch-lead">A step-by-step lesson on this master control system — tap through from beginner to expert.</p>
      ${tabs}${sections}
      <div class="prevnext">${prev}${next}</div>
      <div id="goal-comments" class="page-discuss"></div></div>`;
  }
  function wirePathwayLearning(pc) {
    const root = document.querySelector('.lesson-detail'); if (!root) return;
    const chapters = document.getElementById('cpd-chapters');
    const allSteps = [...root.querySelectorAll('.ch-step')];
    const showChapter = (n, scroll) => {
      root.querySelectorAll('.chapter').forEach(sec => sec.classList.toggle('active', sec.getAttribute('data-chapter') === String(n)));
      allSteps.forEach(t => { const on = t.dataset.ch === String(n); t.classList.toggle('active', on); if (on) t.classList.add('done'); });
      if (scroll && chapters) chapters.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    allSteps.forEach(t => t.onclick = () => showChapter(t.dataset.ch, true));
    if (allSteps[0]) allSteps[0].classList.add('done');
    root.querySelectorAll('[data-chgo]').forEach(b => b.onclick = () => showChapter(b.dataset.chgo, true));
    root.querySelectorAll('.mc-reveal').forEach(b => b.onclick = () => { const a = b.closest('.mc-body') && b.closest('.mc-body').querySelector('.mc-answer'); if (a) { a.hidden = false; b.closest('.mc-predict').classList.add('revealed'); b.remove(); } });
    root.querySelectorAll('.st-reveal').forEach(b => b.onclick = () => { const card = b.closest('.st-card'); const a = card && card.querySelector('.st-a'); if (a) { a.hidden = false; b.remove(); } });
    wireFeynman();
  }
  // Full-course renderer for an expanded /learn module (Foundations, energy, metabolism, muscle).
  // Reuses the chaptered pedagogy; adds fundamentals / deep-dive / expert-lens / connections sections.
  const paras = (s) => mdBlocks(s, mdInline);

  // ---- SECTION SPLIT + CHECKPOINT (2026-07-28) -------------------------------------------------
  // Felix: "in each of the broken up sections, add visual interactions or something to help the user
  // synthesize the information better."
  //
  // What I tested and REJECTED first, so the reasoning is on the record:
  //  - Linking the ALL-CAPS terms: only 3% of the 2,076 distinct terms resolve to a page, and the
  //    most frequent are AND / NOT / THE / BOTH — emphasis, not vocabulary. No link layer exists.
  //  - Pairing each section with its authored "you can now explain X" statement: the counts are
  //    almost exactly 1:1 (491 sections, 510 statements) and keyword matching hits 85%, but the
  //    arrays are only 20% ORDER-ALIGNED, so a specific claim would be attached to the wrong
  //    section most of the time. A visibly wrong "you can now explain this" costs more trust than
  //    the device buys.
  //
  // What survives is honest and covers every section: split the rendered prose so a reader meets one
  // idea at a time, and end each section with a checkpoint that forces the "do I actually have this?"
  // decision. Nothing is hidden from crawlers (<details> keeps content in the DOM) and no word moves.
  function splitSection(html, keep) {
    const s = String(html || '');
    // Paragraph boundaries first — the common case.
    const parts = s.split(/(?<=<\/p>)/).filter((x) => x.trim());
    if (parts.length > keep + 1) {
      return { head: parts.slice(0, keep).join(''), rest: parts.slice(keep).join(''), n: parts.length - keep };
    }
    // LIST FALLBACK (2026-07-28). Measured: 35% of /pathway/6's deep-dive words sit inside a single
    // <ul> — section 5 is 91% list, 558 of 612 words — versus 6% on /muscle/biceps. Counting only
    // </p> meant the splitter did nothing at all on exactly the sections the owner kept calling
    // walls, while appearing to work everywhere else. Same treatment, 6x different effect: that is
    // why one page felt fixed and the other did not.
    const m = s.match(/^([\s\S]*?)<(ul|ol)([^>]*)>([\s\S]*?)<\/\2>([\s\S]*)$/);
    if (m) {
      const [, before, tag, attrs, inner, after] = m;
      const items = inner.split(/(?<=<\/li>)/).filter((x) => x.trim());
      if (items.length > keep + 1) {
        return {
          head: `${before}<${tag}${attrs}>${items.slice(0, keep).join('')}</${tag}>`,
          rest: `<${tag}${attrs}>${items.slice(keep).join('')}</${tag}>${after}`,
          n: items.length - keep,
        };
      }
    }
    return { head: s, rest: '', n: 0 };
  }

  function sectionCheckpoint(id, label) {
    return `<div class="dd-check"><label><input type="checkbox" class="ddc"><span>I've got this</span></label>` +
      `<span class="ddc-hint">${label}</span></div>`;
  }

  function learnCourse(entry, ctx) {
    const pc = Object.assign({}, entry, { name: ctx.name, id: 'lc-' + ctx.key });
    const fundamentals = entry.fundamentals ? `<div class="lc-fund"><div class="lc-h">🌱 Start from zero — the ground truth</div>${paras(entry.fundamentals)}${(entry.widgets || {}).fundamentals || ''}</div>` : '';
    // ---- THE DECK, AND A JUMP LIST (2026-07-28) ----------------------------------------------
    // I built this for the prerendered document and shipped NOTHING to the app, which is what the
    // owner actually reads. He screenshotted the deep-dive tab: 9-11 cards of 300-600 words each,
    // no entry point, no way in but to read. Same treatment as prerender now: the section's own
    // first sentence promoted to larger type (it MOVES, nothing is duplicated, nothing hidden),
    // plus a jump list so 11 sections are skimmable in one screen instead of 3,000 words.
    const ddDeck = (body) => {
      const t = String(body || '').trim();
      const sents = mdSentences(t);
      if (sents.length < 2) return { deck: '', rest: t };
      const first = sents[0];
      if (mdWc(first) > 32) return { deck: '', rest: t };
      return { deck: first, rest: t.slice(t.indexOf(first) + first.length).trim() };
    };
    const ddN = (entry.deepDive || []).length;
    const ddJump = ddN > 3
      ? `<nav class="lc-jump" aria-label="Sections in this chapter"><span class="lcj-l">${ddN} sections</span>${
          entry.deepDive.map((d, i) => {
            // Break at a WORD boundary. Slicing at 34 chars produced chips reading "The gabapentin
            // lie, and other name" — a truncation that looks like a rendering bug, not a label.
            const raw = String(d.h || '').split(/[:—]/)[0].trim();
            let lab = raw;
            if (lab.length > 30) { lab = lab.slice(0, 30); lab = lab.slice(0, Math.max(lab.lastIndexOf(' '), 12)).replace(/[,;\s]+$/, '') + '…'; }
            return `<a href="#dd-${ctx.key}-${i}" title="${esc(raw)}">${esc(lab)}</a>`;
          }).join('')}</nav>`
      : '';
    const deep = (Array.isArray(entry.deepDive) && entry.deepDive.length) ? `<div class="lc-dd-wrap"><p class="lc-dd-lead">The core of the course — work through each section. This is where a curious beginner becomes genuinely expert.</p>${ddJump}${entry.deepDive.map((d, i) => { const { deck, rest } = ddDeck(d.body); return `<section class="lc-dd" id="dd-${ctx.key}-${i}"><p class="dd-eyebrow">Deep dive · ${i + 1} of ${ddN}</p><h3 class="lc-dd-h">${esc(d.h)}</h3>${deck ? `<p class="dd-deck">${mdInline(deck)}</p>` : ''}${((entry.widgets || {})[String(i)]) || ''}<div class="lc-dd-b">${(() => { const sp = splitSection(paras(rest), 2); return sp.rest ? `${sp.head}<details class="dd-more"><summary>Keep going — ${sp.n} more ${sp.n === 1 ? 'part' : 'parts'} of this idea</summary>${sp.rest}</details>` : sp.head; })()}</div>${sectionCheckpoint(String(i), 'Ticked sections fade, so the page shows you what is left')}</section>`; }).join('')}</div>` : '';
    const expert = entry.expertLens ? `<div class="lc-expert"><div class="lc-h">🧠 How an expert actually reasons with this</div>${paras(entry.expertLens)}${(entry.widgets || {}).expertLens || ''}</div>` : '';
    const conns = (Array.isArray(entry.connections) && entry.connections.length) ? `<div class="lc-conn"><div class="lc-h">🕸️ How this connects to the rest of the body</div><ul>${entry.connections.map(c => `<li><b>${esc(c.to)}</b> — ${mdInline(c.why)}</li>`).join('')}</ul></div>` : '';
    // `lede` (added 2026-07-28) — the 30-second answer, the map, and the WHY, ahead of the
    // exposition. A design review measured that on these pages hook.payoff (the "why should I
    // care") rendered as segment 69 OF 69, the authored pathway diagram never rendered at all
    // (dead below an early return), and p.html's one-line summary was dropped entirely. The reader
    // met ~7,500 words before meeting a single reason to read them.
    // `postHook` lands the "why this matters" promise AFTER the hook's questions, so it answers a
    // need the reader now has instead of being a 120-word preamble above the fold.
    const ch1 = (ctx.lede || '') + hookBox(pc) + (ctx.postHook || '') + bigIdeaBanner(pc) + analogyBox(pc) + fundamentals;
    const ch2 = mechanismCascade(pc);
    const ch3 = deep;
    const ch4 = expert + conns;
    const ch5 = mythsBox(pc) + selfTestBox(pc) + feynmanBox(pc) + graduationBlock(pc);
    let chapterDefs = [
      { icon: '🌱', label: 'The big picture', html: ch1 }, { icon: '⚙️', label: 'The mechanism', html: ch2 },
      { icon: '🔬', label: 'Deep dive', html: ch3 }, { icon: '🧠', label: 'Think like an expert', html: ch4 },
      { icon: '🎓', label: 'Prove it', html: ch5 },
    ];
    (ctx.extraChapters || []).forEach(ec => chapterDefs.splice(ec.at != null ? ec.at : chapterDefs.length, 0, ec));
    chapterDefs = chapterDefs.filter(ch => ch.html && ch.html.trim()).map((ch, k) => Object.assign(ch, { n: k + 1 }));
    const tabs = `<div class="ch-steps" role="tablist">${chapterDefs.map((ch, k) => `<button class="ch-step${k === 0 ? ' active' : ''}" data-ch="${ch.n}"><span class="cs-num">${k + 1}</span><span class="cs-label">${ch.icon} ${esc(ch.label)}</span></button>`).join('')}</div>`;
    const sections = `<div class="chapters" id="cpd-chapters">${chapterDefs.map((ch, k) => { const nx = chapterDefs[k + 1]; const nav = nx ? `<button class="ch-next-btn" data-chgo="${nx.n}">Next: ${nx.icon} ${esc(nx.label)} →</button>` : ''; return `<section class="chapter${k === 0 ? ' active' : ''}" data-chapter="${ch.n}">${ch.html}${nav ? `<div class="ch-nav">${nav}</div>` : ''}</section>`; }).join('')}</div>`;
    setTimeout(() => { wirePathwayLearning(pc); }, 0);
    return `<div class="detail lesson-detail" id="lc-detail">${ctx.crumb || ''}${ctx.progress || ''}
      <div class="detail-head"><div><h1>${esc(ctx.name)}</h1>${ctx.badge || ''}</div></div>
      <p class="ch-lead">A full course — from zero to genuinely expert. Five chapters; tap through in order.</p>
      ${tabs}${sections}${ctx.journey || ''}
      ${ctx.prevnext ? `<div class="prevnext">${ctx.prevnext}</div>` : ''}
      <div id="goal-comments" class="page-discuss"></div></div>`;
  }

  // ---------- Anatomy & physiology reference pages ----------
  function anatomyCrumb(label) { return crumbs([{ label: 'Home', href: '#/' }, { label: 'Learn', href: '#/learn' }, { label }]); }
  function energyChips(ids) {
    return (ids || []).map(id => { const e = energyById[id]; return e ? `<a class="tag-chip" href="#/energy/${id}">⚡ ${esc(e.name.split('(')[0].trim())}</a>` : ''; }).join('');
  }
  function pathwayChips(labels) {
    return (labels || []).map(lbl => { const i = D.pathways.findIndex(p => (p.shortLabel || '').toLowerCase().includes(String(lbl).toLowerCase()) || (p.title || '').toLowerCase().includes(String(lbl).toLowerCase())); return i >= 0 ? `<a class="tag-chip" href="#/pathway/${i}">${esc(D.pathways[i].shortLabel)}</a>` : ''; }).join('');
  }
  // Weave the anatomy layer into a protocol: which muscles the Move work trains + how they're
  // fuelled (energy systems), and which metabolism the Fuel targets.
  // Temporal stacking: bucket a compound into a time-of-day slot from its dosing text.
  // The "Your day" plan — a layman-friendly 24h checklist; each item expands to the "why".
  // ---------- 3D body map (Move 7): the full BodyParts3D/Three.js engine, lazy-loaded ----------
  // "Where does it hurt?" — the reverse funnel. SVG + text index are prebuilt in parse.js (D.bodyWhereSvg /
  // D.bodyWhereIndex) so both documents match. The text index is the crawlable + accessible core; the SVG
  // is an aria-hidden visual map that scrolls to the matching section on tap. Cause-finder handoff reuses
  // the global [data-find-cause] handler.
  function whereShell() {
    return `${crumbs([{ label: 'Home', href: '#/' }, { label: 'Where does it hurt?' }])}
      <section class="where-page">
        <div class="kicker">Start from your body</div>
        <h1>Where does it hurt?</h1>
        <p class="where-lead">Tap the spot — or pick it from the list — and see what's likely going on and the plan. Not sure which one? Answer three quick questions.</p>
        <div class="where-wrap">
          <div class="body-where">${D.bodyWhereSvg || ''}</div>
          ${D.bodyWhereIndex || ''}
        </div>
        <p class="where-foot"><a class="cta-ghost" href="#/body">Or explore the muscles in 3D →</a></p>
      </section>`;
  }
  function bindWhere() {
    const svg = document.querySelector('.body-where-svg'); if (!svg) return;
    // W5c (2026-08-02): 90 real Tab presses at 390x844 focused a .bw-zone ZERO times. The hotspots
    // were bare <ellipse> elements with a click listener — no tabindex, no role, no key handler —
    // inside an <svg role="img">, which prunes its children from the accessibility tree entirely.
    // build/parse.js now emits role="button" + tabindex="0" + an aria-label on the first shape of
    // each zone (one focus stop per zone, not per drawn ellipse; the symmetric twin is
    // aria-hidden). This is the other half: a role="button" that does not answer Enter and Space
    // is a lie told to a screen reader. Focus also MOVES to the section, because a smooth scroll
    // that leaves focus on the map is invisible to the person who triggered it — .bw-zone-sec
    // carries tabindex="-1" for exactly that.
    const go = (z) => {
      const id = z.getAttribute('data-zone');
      const sec = document.getElementById('zone-' + id); if (!sec) return;
      svg.querySelectorAll('[data-zone].on').forEach((e) => e.classList.remove('on'));
      svg.querySelectorAll('[data-zone="' + id + '"]').forEach((e) => e.classList.add('on'));
      document.querySelectorAll('.bw-zone-sec.on').forEach((s) => s.classList.remove('on'));
      sec.classList.add('on');
      sec.setAttribute('tabindex', '-1');
      sec.scrollIntoView({ behavior: 'smooth', block: 'center' });
      try { sec.focus({ preventScroll: true }); } catch (e) { }
    };
    // `.bw-hit`, not `.bw-zone`: the drawn shape is decorative and pointer-events:none, and the
    // invisible hit layer above it is the control (see build/parse.js and the .bw-hit CSS).
    svg.querySelectorAll('.bw-hit').forEach((z) => {
      z.style.cursor = 'pointer';
      z.addEventListener('click', () => go(z));
      if (z.getAttribute('role') !== 'button') return;   // the aria-hidden twin gets no key handler
      z.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
        e.preventDefault();   // Space would otherwise scroll the page out from under the reader
        go(z);
      });
    });
  }
  // bodyShell() is the crawlable page (a real muscle index — what Google + the ~90% no-JS traffic get).
  // mountBody() lazy-imports site/bodymap.js ONLY here and upgrades the shell to the interactive canvas
  // on capable devices; renderStructurePanel() shows a picked muscle's facts from the SAME registry.
  function bodyShell(region) {
    region = region || 'leg';
    // tibialis-anterior is the one anterior-shin muscle with a mesh but no group page of its own;
    // include it so it is browsable in 3D (its full-page link is guarded below, since /muscle/
    // tibialis-anterior does not exist and a dead link would fail the assertLinkGraph build gate).
    const legGroups = ['quadriceps', 'hamstrings', 'glutes', 'calves', 'tibialis-anterior'];
    const legSubs = legGroups.flatMap(g => (structuresByGroup[g] || [])).filter(s => s.fma);
    const twin = legSubs.map(s => `<li><a href="#/body/${esc(region)}?fma=${encodeURIComponent(s.fma)}">${esc(s.name)}</a>${s.plainName ? ` — ${esc(s.plainName)}` : ''}${muscleById[s.groupId] ? ` <a class="muted" href="#/muscle/${esc(s.groupId)}">(full page)</a>` : ''}</li>`).join('');
    return `<div class="body-shell">
      <h1>🧍 Interactive 3D body — the ${esc(region)}</h1>
      <p class="muted bm-intro">Spin the model and tap any muscle to see the bones it attaches to — <b class="bm-o-word">origin in blue</b>, <b class="bm-i-word">insertion in amber</b> — and watch it move. Best on a laptop or a recent phone; the muscle list below is the full no-3D version.</p>
      <div class="bm-stage"><div class="bm-canvas-wrap"><div id="bm-canvas" class="bm-canvas"></div><div id="bm-hud" class="bm-hud" hidden></div></div><aside id="bm-panel" class="bm-panel"><p class="muted">Tap a muscle on the model, or pick one from the list below.</p></aside></div>
      <!-- Legend added 2026-07-31. Without it the colours are decoration; with it they are the
           lesson. The tendon shading is honestly labelled as indicative, because BodyParts3D has no
           separate tendon meshes and the pale ends are computed from the muscle's own long axis. -->
      <ul class="bm-key">
        <li><i class="bm-sw bm-sw-muscle"></i>Muscle belly — the part that shortens</li>
        <li><i class="bm-sw bm-sw-tendon"></i>Tendon end <span class="muted">(indicative shading, not a measured boundary)</span></li>
        <li><i class="bm-sw bm-sw-bone"></i>Bone</li>
        <li><i class="bm-sw bm-sw-origin"></i>Origin — the anchored end, tap a muscle to see it</li>
        <li><i class="bm-sw bm-sw-insert"></i>Insertion — the end that gets pulled</li>
      </ul>
      <div class="section-title">The ${esc(region)} muscles</div>
      <ul class="body-twin">${twin}</ul>
      <p><a class="proto-more" href="#/anatomy">← All muscle groups</a></p>
    </div>`;
  }
  function mountBody(region) {
    region = region || 'leg';
    const canvas = document.getElementById('bm-canvas'); if (!canvas) return;
    const fail = (msg) => { canvas.innerHTML = `<div class="bm-fallback"><p>${msg}</p></div>`; }; // replaces the loading state wholesale
    // A loading state, added 2026-07-31 because Felix reported the model "does not load on the
    // laptop/desktop version". It does load — but it is an 800 KB model plus the Three.js modules
    // behind a lazy import, and until the first frame renders the box was simply EMPTY. An empty
    // box and a broken page look identical, so on any connection slower than a fast one the honest
    // reading of the screen was "this is broken". Removed the moment the canvas is inserted.
    canvas.innerHTML = '<div class="bm-loading"><span class="bm-spin" aria-hidden="true"></span>'
      + '<p>Loading the 3D model — about 800&nbsp;KB.</p>'
      + '<p class="muted">The full muscle list below works without it.</p></div>';
    const clearLoading = () => { const l = canvas.querySelector('.bm-loading'); if (l) l.remove(); };
    // The muscle-page button deep-links via ?fma= in the PATH query (/body/leg?fma=FMA:x); the twin
    // list links via the hash (#/body/leg?fma=). Read either, so both actually focus the muscle.
    const fma = new URLSearchParams(location.search).get('fma') || new URLSearchParams(location.hash.split('?')[1] || '').get('fma');
    const ctrlRef = {};
    // On a phone the info panel + "Replay the movement" button sit far below the fold, so a reader
    // taps a muscle and can neither see the movement nor reach replay without scrolling the model
    // off-screen. This compact HUD is pinned to the bottom of the canvas: name + action + a big
    // Replay button live WITH the model, so selection, explanation and replay share one screen.
    const hud = document.getElementById('bm-hud');
    const updateHud = (f, st) => {
      if (!hud || !st) return;
      const act = (st.actions && st.actions[0] || '').replace(/\s*\(.*$/, '').replace(/;.*$/, '').trim();
      hud.innerHTML = `<div class="bm-hud-txt"><span class="bm-hud-name">${esc(st.name)}</span>${act ? `<span class="bm-hud-act">${esc(act)}</span>` : ''}</div>`
        + `<button type="button" class="bm-hud-replay" aria-label="Replay the movement">▶ Replay</button>`;
      hud.hidden = false;
      const rb = hud.querySelector('.bm-hud-replay');
      if (rb) rb.onclick = () => { if (ctrlRef.c) ctrlRef.c.playAction(f); };
    };
    import('/bodymap.js').then(m => {
      if (!m.canRun3D()) return fail('<b>Your device can’t show the interactive 3D model</b> (older browser, low memory, data-saver, or reduced-motion is on). The muscle list below has everything, and each muscle page carries an animated 2D figure of the action.');
      m.mountBodyMap(canvas, { region, focusFma: fma || undefined, autoplayAction: !!fma, onSelect: (f, st) => { renderStructurePanel(st, f, ctrlRef); updateHud(f, st); } })
        .then((c) => { ctrlRef.c = c; clearLoading(); })
        .catch(() => fail('The 3D model couldn’t load. The muscle list below still works, and each muscle page has an animated 2D figure.'));
    }).catch(() => fail('The 3D model couldn’t load. The muscle list below still works.'));
  }
  // Map an in-model muscle NAME (lowercased) -> its fma, so a muscle's "works with"/"opposes"
  // chips can deep-link to that muscle on the same 3D model. Built once from the registry.
  let _legNameFma = null;
  function legNameToFma() {
    if (_legNameFma) return _legNameFma;
    _legNameFma = {};
    (D.structures || []).forEach(s => { if (s.fma) _legNameFma[String(s.name || '').toLowerCase().trim()] = s.fma; });
    return _legNameFma;
  }
  // Render a comma/paren list of muscle names as chips, deep-linking any that exist on the model.
  function relChips(list, cls) {
    if (!list || !list.length) return '';
    const map = legNameToFma();
    return list.map(name => {
      const key = String(name || '').toLowerCase().trim();
      const fma = map[key];
      return fma
        ? `<a class="bm-rel-chip ${cls} is-link" href="#/body/leg?fma=${encodeURIComponent(fma)}">${esc(name)}</a>`
        : `<span class="bm-rel-chip ${cls}">${esc(name)}</span>`;
    }).join('');
  }
  function renderStructurePanel(st, fma, ctrlRef) {
    const el = document.getElementById('bm-panel'); if (!el || !st) return;
    const oTech = (st.origin && st.origin.attachTo) || '—';
    const iTech = (st.insertion && st.insertion.attachTo) || '—';
    // Plain-language attachment leads; the technical Latin follows in muted type. A general reader
    // learns "your heel bone" first, then meets "calcaneus" — instead of only the jargon.
    const attRow = (cls, kind, plain, tech) => `<div class="bm-att ${cls}"><span class="bm-att-dot"></span><span class="bm-att-k">${kind}</span><span class="bm-att-v">${plain ? `${esc(plain)}<span class="bm-att-tech">${esc(tech)}</span>` : esc(tech)}</span></div>`;
    // The leg model has no separate foot bones, so a calf/shin insertion is pinned to the nearest
    // ankle bone (talus). Say so, rather than let the amber pin silently assert the wrong location.
    const footApprox = /calcaneus|calcaneal|heel|achilles|cuneiform|metatars|navicular|tarsal|\bfoot\b/i.test(iTech);
    const actions = (st.actions || []);
    el.innerHTML = `<div class="bm-card">
      <h2 class="bm-name">${esc(st.name)}</h2>
      ${st.plainName ? `<p class="bm-plain">${esc(st.plainName)}</p>` : ''}
      ${st.everydayUse ? `<p class="bm-why">${esc(st.everydayUse)}</p>` : ''}
      <div class="bm-attach">
        ${attRow('bm-att-o', 'Origin', st.plainOrigin, oTech)}
        ${attRow('bm-att-i', 'Insertion', st.plainInsertion, iTech)}
      </div>
      ${footApprox ? `<p class="bm-approx muted">The model has no separate foot bones, so the heel/foot attachment is pinned to the nearest ankle bone — the real attachment is where the plain description says.</p>` : ''}
      ${actions.length ? `<div class="bm-field"><span class="bm-field-k">What it does</span><p class="bm-field-v">${esc(actions.join('; '))}</p></div>` : ''}
      ${(fma && ctrlRef) ? `<button type="button" class="bm-replay" id="bm-replay">▶ Replay the movement</button>` : ''}
      ${(st.synergists && st.synergists.length) ? `<div class="bm-field"><span class="bm-field-k">Works with</span><div class="bm-rel">${relChips(st.synergists, 'is-syn')}</div></div>` : ''}
      ${(st.antagonists && st.antagonists.length) ? `<div class="bm-field"><span class="bm-field-k">Opposes</span><div class="bm-rel">${relChips(st.antagonists, 'is-ant')}</div></div>` : ''}
      ${st.locate ? `<div class="bm-field"><span class="bm-field-k">Find it on yourself</span><p class="bm-field-v">${esc(st.locate)}</p></div>` : ''}
      ${(st.groupId && muscleById[st.groupId]) ? `<p class="bm-fullpage"><a class="proto-more" href="#/muscle/${esc(st.groupId)}">Full ${esc(st.groupId)} page →</a></p>` : ''}
      <p class="bm-legend muted"><b>In the model:</b> the muscle keeps its red belly and pale tendon ends; its <span class="bm-dot-o"></span> origin bone turns blue and its <span class="bm-dot-i"></span> insertion bone amber, each with a labelled pin; and the joint moves through the muscle's action.</p>
    </div>`;
    const rb = document.getElementById('bm-replay');
    if (rb && ctrlRef) rb.onclick = () => { if (ctrlRef.c) ctrlRef.c.playAction(fma); };
  }
  function musclePage(id) {
    const m = muscleById[id]; if (!m) return notFound();
    const a = m.anatomy || {};
    const exList = arr => arr && arr.length ? `<div class="anat-exlist">${arr.map(e => `<a class="anat-ex" href="#/exercise/${esc(e.id)}"><b>${esc(e.name)}</b>${e.level ? `<em>${esc(e.level)}</em>` : ''}</a>`).join('')}</div>` : '<p class="muted">None catalogued yet.</p>';
    // The four LEG groups have a first-party BodyParts3D model that lights this muscle's origin/insertion
    // bones and animates its action — a better teacher than a generic stock render, and FMA-keyed to this
    // page. Lead with it. Other groups keep the Sketchfab viewer (it works) or the "being added" note.
    const subs = structuresByGroup[id] || [];
    const LEG3D = { quadriceps: 1, hamstrings: 1, glutes: 1, calves: 1 };
    const legFocus = LEG3D[id] ? (subs.find(s => s.fma) || null) : null;
    const model = legFocus
      ? `<div class="section-title">This muscle in 3D</div><a class="cta-3d cta-3d-hero" href="#/body/leg?fma=${encodeURIComponent(legFocus.fma)}"><span class="cta-3d-hero-ico" aria-hidden="true">🦿</span><span class="cta-3d-hero-txt"><b>Open the interactive 3D leg</b><span>Opens on the ${esc(legFocus.name.toLowerCase())} — its origin and insertion bones light up and it moves through its action. Every ${esc(m.name.toLowerCase())} muscle is tappable there too.</span></span><span class="cta-3d-hero-go" aria-hidden="true">▶</span></a><p class="fig-credit">A first-party 3D model built from BodyParts3D (© DBCLS, CC-BY-SA), FMA-keyed to the anatomy on this page — not a generic render.</p>`
      : (m.model_embed
        ? `<div class="section-title">This muscle in 3D</div><div class="anat-3d"><iframe title="${esc(m.name)} — interactive 3D anatomy" src="${esc(m.model_embed)}" allow="autoplay; fullscreen; xr-spatial-tracking" allowfullscreen loading="lazy"></iframe></div><p class="fig-credit">Drag to rotate · scroll to zoom — see the shape, origin and insertion of the ${esc(m.name.toLowerCase())}. 3D model via Sketchfab (CC-BY); the ℹ button credits the author. Origin, insertion and action are detailed just below.</p>`
        : `<div class="section-title">This muscle in 3D</div><div class="anat-3d-soon"><span class="a3d-ico">🧊</span><p>A 3D model specific to the <b>${esc(m.name.toLowerCase())}</b> is being added. Its origin, insertion and action are detailed just below.</p></div>`);
    // ---- THE COURSE SHORT-CIRCUIT USED TO EAT THIS WHOLE PAGE (fixed 2026-07-28) ----
    // `if (m.expand) return learnCourse(...)` sat at the TOP of this function, and all 17 muscles
    // have `.expand`. So on every muscle page the SPA silently dropped the 3D model, the anatomy
    // card, the origin/insertion, the exercises and the stretches — while the PRERENDERED page kept
    // all of it. The two documents disagreed and the app was the degraded one, which is the reverse
    // of the usual assumption. Identical bug to the pathway diagram that rendered on 0 of 16 pages:
    // an early return above the visual content. When you add a `return learnCourse(...)`, check what
    // is BELOW it.
    // subs/legFocus computed above; the first-party 3D now leads the page (muscle `model`), so the
    // submuscle list no longer repeats a "see it in 3D" button.
    const subMuscles = subs.length ? `<div class="section-title">The individual muscles in this group</div>
        <p class="muted" style="font-size:.88rem;margin-top:-.3rem">“${esc(m.group || m.name)}” is really several separate muscles. Here is each one — where it runs, what it does, and how to find it on your own body.</p>
        <div class="submuscle-list">${subs.map(s => `<div class="submuscle">
          <h3>${esc(s.name)}${s.plainName ? ` <span class="sm-plain">${esc(s.plainName)}</span>` : ''}</h3>
          <p class="sm-oi"><span class="sm-k">Runs from</span> ${esc((s.origin && s.origin.attachTo) || '—')} <span class="sm-k">to</span> ${esc((s.insertion && s.insertion.attachTo) || '—')}</p>
          ${(s.actions && s.actions.length) ? `<p class="sm-act"><span class="sm-k">What it does</span> ${esc(s.actions.join('; '))}</p>` : ''}
          ${s.locate ? `<p class="sm-locate"><span class="sm-k">Find it on yourself</span> ${esc(s.locate)}</p>` : ''}
          ${(s.fma && LEG3D[id]) ? `<p class="sm-3d"><a href="#/body/leg?fma=${encodeURIComponent(s.fma)}">See the ${esc(s.name.toLowerCase())} in the interactive 3D leg →</a></p>` : ''}
        </div>`).join('')}</div>` : '';
    const anatChapter = {
      icon: '🦴', label: 'Anatomy & training', at: 1, html: `
      <div class="anat-card"><h2>Anatomy</h2>
        <div class="anat-oi"><div><span class="anat-k">Muscles</span>${esc(m.group)}</div>
          <div><span class="anat-k">Origin</span>${esc(a.origin || '—')}</div>
          <div><span class="anat-k">Insertion</span>${esc(a.insertion || '—')}</div></div>
        <div class="anat-k" style="margin-top:.8rem">What it does</div>
        <p class="muted" style="font-size:.88rem;margin:.2rem 0 .5rem">Grey stays still; teal is what this muscle moves.</p>
        <div class="afig-grid">${(a.action_figures || []).join('') || (a.actions || []).map(x => `<p>${esc(x)}</p>`).join('')}</div></div>
      ${subMuscles}
      <div class="anat-grid">
        <div class="anat-mini"><h3>Fibre-type bias</h3><p>${esc(m.fiber_bias)}</p></div>
        <div class="anat-mini"><h3>Functional role</h3><p>${esc(m.functional_role)}</p></div>
      </div>
      <div class="section-title">Energy systems it relies on</div>
      <div class="tag-row">${energyChips(m.energy_systems)}</div>
      <div class="anat-grid">
        <div class="anat-mini"><h3>💪 Exercises that train it${m.exercise_count ? ` <span class="muted">(${m.exercise_count})</span>` : ''}</h3>${exList(m.exercises)}<p class="anat-hint">${esc(m.training || '')}</p></div>
        <div class="anat-mini"><h3>🧘 Stretches${m.stretch_count ? ` <span class="muted">(${m.stretch_count})</span>` : ''}</h3>${exList(m.stretches)}<p class="anat-hint">${esc(m.stretching || '')}</p></div>
      </div>
      <div class="section-title">How the muscle works</div><p>${esc(m.mechanism || '')}</p>
      ${(m.common_problems || []).length ? `<div class="section-title">Common problems</div><ul class="anat-probs">${m.common_problems.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
      ${(m.problems || []).length ? `<div class="section-title">🎯 Fix or train this</div>
        <div class="tag-row">${m.problems.map(pid => { const pr = problemById[pid]; return pr ? `<a class="tag-chip" href="#/protocol/${pid}/${pr.root_causes[0].id}">${esc(pr.name)} →</a>` : ''; }).join('')}</div>` : ''}` };
    // ^ mechanism / common_problems / the protocol CTA were left behind when I moved the anatomy
    // into a chapter this morning. They existed ONLY below the `return learnCourse(...)`, so the
    // app silently dropped the three named clinical problems (tendinopathy, Popeye tear, distal
    // rupture) and the route to a protocol — the page's entire conversion path. The prerendered
    // page kept them, so the two documents disagreed again. FIFTH instance of this early-return
    // pattern; the rule stands: when you add a `return learnCourse(...)`, read what is BELOW it.
    if (m.expand) return learnCourse(m.expand, { name: m.name, key: 'muscle-' + id, crumb: anatomyCrumb(m.name),
      lede: `<p class="anat-lead">${esc(m.overview)}</p>${model}`,
      badge: '<span class="pw-badge">💪 Muscle course</span>', extraChapters: [anatChapter] });
    return `<div class="article">${anatomyCrumb(m.name)}
      <div class="anat-head"><span class="anat-region">${esc(m.region)}</span>
        <div class="lyr-head"><h1>${esc(m.name)}</h1>${PHASE2 ? '<button class="sec-edit" id="mu-edit" title="Suggest an edit">✎ Edit</button>' : ''}</div>
        ${m.aka && m.aka.length ? `<p class="anat-aka">${m.aka.map(esc).join(' · ')}</p>` : ''}</div>
      <p class="anat-lead">${esc(m.overview)}</p>
      ${model}
      <div class="anat-card"><h2>Anatomy</h2>
        <div class="anat-oi"><div><span class="anat-k">Muscles</span>${esc(m.group)}</div>
          <div><span class="anat-k">Origin</span>${esc(a.origin || '—')}</div>
          <div><span class="anat-k">Insertion</span>${esc(a.insertion || '—')}</div></div>
        <div class="anat-k" style="margin-top:.8rem">What it does</div>
        <p class="muted" style="font-size:.88rem;margin:.2rem 0 .5rem">Grey stays still; teal is what this muscle moves.</p>
        <div class="afig-grid">${(a.action_figures || []).join('') || (a.actions || []).map(x => `<p>${esc(x)}</p>`).join('')}</div></div>
      <div class="section-title">How the muscle works</div><p>${esc(m.mechanism)}</p>
      <div class="anat-grid">
        <div class="anat-mini"><h3>Fibre-type bias</h3><p>${esc(m.fiber_bias)}</p></div>
        <div class="anat-mini"><h3>Functional role</h3><p>${esc(m.functional_role)}</p></div>
      </div>
      <div class="section-title">Energy systems it relies on</div>
      <p class="muted" style="font-size:.9rem">How this muscle is fuelled, from explosive to enduring:</p>
      <div class="tag-row">${energyChips(m.energy_systems)}</div>
      <div class="section-title">Common problems</div>
      <ul class="anat-probs">${(m.common_problems || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      <div class="anat-grid">
        <div class="anat-mini"><h3>💪 Exercises that train it${m.exercise_count ? ` <span class="muted">(${m.exercise_count})</span>` : ''}</h3>${exList(m.exercises)}<p class="anat-hint">${esc(m.training || '')}</p></div>
        <div class="anat-mini"><h3>🧘 Stretches${m.stretch_count ? ` <span class="muted">(${m.stretch_count})</span>` : ''}</h3>${exList(m.stretches)}<p class="anat-hint">${esc(m.stretching || '')}</p></div>
      </div>
      ${(m.problems || []).length ? `<div class="section-title">🎯 Fix or train this</div>
        <p class="muted" style="font-size:.9rem">Pain or a goal involving the ${esc(m.name.toLowerCase())}? Jump straight to the protocol — the movement, food and supplements that fix the root cause:</p>
        <div class="tag-row">${m.problems.map(pid => { const p = problemById[pid]; return p ? `<a class="tag-chip" href="#/protocol/${pid}/${p.root_causes[0].id}">${esc(p.name)} →</a>` : ''; }).join('')}</div>` : solveCta('Find a protocol that trains this →')}
      <div id="goal-comments" class="page-discuss"></div></div>`;
  }
  // The "metabolic mill": how fats, carbohydrates and protein are broken down and fed into ATP
  // production — with the active energy system's route lit and the rest dimmed.
  function metabolicMillSvg(active) {
    const C = { fat: '#b5533a', carb: '#475569', prot: '#2563eb', mito: '#0d9488', atp: '#d97706', line: '#64748b' };
    const op = z => z === 'out' ? 1 : z === 'imm' ? (active === 'atp-pcr' ? 1 : .32) : z === 'ana' ? (active === 'glycolytic' ? 1 : .32) : z === 'glyc' ? ((active === 'glycolytic' || active === 'oxidative') ? 1 : .32) : (active === 'oxidative' ? 1 : .32);
    const box = (x, y, w, h, label, fill, z, sub) => `<g opacity="${op(z)}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="${fill}" fill-opacity="0.12" stroke="${fill}" stroke-width="1.5"/><text x="${x + w / 2}" y="${sub ? y + h / 2 - 1 : y + h / 2 + 4}" text-anchor="middle" font-size="12.5" font-weight="700" fill="${fill}">${label}</text>${sub ? `<text x="${x + w / 2}" y="${y + h / 2 + 13}" text-anchor="middle" font-size="9.5" fill="${C.line}">${sub}</text>` : ''}</g>`;
    const arr = (x1, y1, x2, y2, z, col) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col || C.line}" stroke-width="2" marker-end="url(#mm-a)" opacity="${op(z)}"/>`;
    const lbl = (x, y, t, z, col) => `<text x="${x}" y="${y}" font-size="10" font-style="italic" fill="${col || C.line}" opacity="${op(z)}" text-anchor="middle">${t}</text>`;
    const nm = { 'atp-pcr': 'ATP–PCr (phosphagen)', glycolytic: 'anaerobic glycolytic', oxidative: 'aerobic oxidative' }[active] || active;
    return `<figure class="learn-fig mm-fig"><svg viewBox="0 0 760 590" role="img" aria-label="Metabolic pathways: how fats, carbohydrates and protein become ATP, with the ${esc(nm)} route highlighted.">
      <defs><marker id="mm-a" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="${C.line}"/></marker></defs>
      ${box(40, 14, 190, 36, 'FATS · triglyceride', C.fat, 'fat')}${box(285, 14, 190, 36, 'CARBOHYDRATE', C.carb, 'glyc')}${box(530, 14, 190, 36, 'PROTEIN', C.prot, 'prot')}
      ${arr(135, 50, 135, 66, 'fat')}${arr(380, 50, 380, 66, 'glyc')}${arr(625, 50, 625, 66, 'prot')}
      ${box(40, 66, 190, 30, 'Fatty acids + glycerol', C.fat, 'fat')}${box(285, 66, 190, 30, 'Glucose', C.carb, 'glyc')}${box(530, 66, 190, 30, 'Amino acids', C.prot, 'prot')}
      ${arr(380, 96, 380, 116, 'glyc')}${box(285, 116, 190, 40, 'Glycolysis', C.carb, 'glyc', 'net +2 ATP · fast')}
      ${arr(380, 156, 380, 172, 'glyc')}${box(320, 172, 120, 30, 'Pyruvate', C.carb, 'glyc')}
      ${box(120, 172, 120, 30, 'Lactate', C.carb, 'ana')}${arr(320, 187, 244, 187, 'ana')}${lbl(283, 166, 'no O₂ → fatigue', 'ana', C.fat)}
      <line x1="20" y1="250" x2="740" y2="250" stroke="#94a3b8" stroke-width="1.4" stroke-dasharray="6 5"/><text x="738" y="244" font-size="10.5" fill="#94a3b8" text-anchor="end">↑ Cytosol (sarcoplasm) — no oxygen needed</text><text x="738" y="268" font-size="10.5" fill="#94a3b8" text-anchor="end">↓ Mitochondria — needs oxygen (O₂)</text>
      ${arr(135, 96, 135, 300, 'fat')}${box(40, 300, 190, 32, 'β-oxidation', C.fat, 'fat')}
      ${arr(625, 96, 625, 118, 'prot')}${box(530, 118, 190, 32, 'Deamination', C.prot, 'prot')}${lbl(625, 168, '→ into glycolysis or Krebs', 'prot')}
      ${arr(380, 202, 380, 304, 'glyc')}${arr(230, 320, 318, 320, 'fat')}${box(318, 304, 124, 34, 'Acetyl-CoA', C.mito, 'mito')}
      ${arr(442, 320, 560, 320, 'mito')}${box(560, 305, 150, 30, 'Ketone bodies', C.prot, 'mito')}
      ${arr(380, 338, 380, 386, 'mito')}${box(285, 386, 190, 40, 'Krebs cycle', C.mito, 'mito', 'citric-acid cycle')}
      ${arr(380, 426, 380, 452, 'mito')}${box(262, 452, 236, 32, 'Electron transport chain', C.mito, 'mito')}
      ${arr(380, 484, 380, 516, 'mito')}${box(302, 516, 158, 48, '⚡ ATP', C.atp, 'out')}
      ${box(540, 408, 200, 78, 'Creatine phosphate → ATP', C.atp, 'imm', 'instant · 0–10s · skips the mill')}${arr(540, 470, 462, 522, 'imm', C.atp)}
    </svg><figcaption class="fig-credit">The metabolic mill — how each fuel is broken down and fed into ATP. Lit path: the <b>${esc(nm)}</b> system.</figcaption></figure>`;
  }
  function energyPage(id) {
    const e = energyById[id]; if (!e) return notFound();
    // Same early-return bug as musclePage — all 3 energy systems have `.expand`, so the two SVG
    // diagrams (the effort curve and the metabolic mill) rendered on ZERO of them in the app while
    // the prerendered page kept both. Hand them to the course instead of returning above them.
    if (e.expand) return learnCourse(e.expand, { name: e.name, key: 'energy-' + id, crumb: anatomyCrumb(e.name),
      lede: `<div class="energy-meta">
        <div><span class="anat-k">Duration</span>${esc(e.duration)}</div>
        <div><span class="anat-k">Intensity</span>${esc(e.intensity)}</div>
        <div><span class="anat-k">Fuel</span>${esc(e.fuel)}</div>
        <div><span class="anat-k">Oxygen</span>${esc(e.oxygen)}</div>
      </div>
      <p class="anat-lead">${esc(e.overview)}</p>
      ${e.plain ? `<div class="anat-callout">💡 ${esc(e.plain)}</div>` : ''}
      ${energyChartSvg(e.id)}`,
      badge: '<span class="pw-badge">⚡ Energy-system course</span>',
      extraChapters: [{ icon: '🔥', label: 'The fuel pathway', at: 1, html: `
        <div class="section-title">The metabolic pathway — where the energy comes from</div>
        ${metabolicMillSvg(e.id)}
        <div class="section-title">How it works, step by step</div>
        <ol class="anat-steps">${(e.steps || []).map(x => `<li>${esc(x)}</li>`).join('')}</ol>
        <div class="anat-grid">
          <div class="anat-mini"><h3>What it powers</h3><ul>${(e.powers || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
          <div class="anat-mini"><h3>Byproduct &amp; recovery</h3><p><b>Byproduct:</b> ${esc(e.byproduct)}</p><p><b>Recovery:</b> ${esc(e.recovery)}</p></div>
        </div>
        <div class="section-title">How to train it</div><p>${esc(e.training)}</p>` }] });
    return `<div class="article">${anatomyCrumb(e.name)}
      <div class="anat-head"><span class="anat-region">Energy system</span><h1>${esc(e.name)}</h1>${e.aka && e.aka.length ? `<p class="anat-aka">${e.aka.map(esc).join(' · ')}</p>` : ''}</div>
      <div class="energy-meta">
        <div><span class="anat-k">Duration</span>${esc(e.duration)}</div>
        <div><span class="anat-k">Intensity</span>${esc(e.intensity)}</div>
        <div><span class="anat-k">Fuel</span>${esc(e.fuel)}</div>
        <div><span class="anat-k">Oxygen</span>${esc(e.oxygen)}</div>
      </div>
      <p class="anat-lead">${esc(e.overview)}</p>
      <div class="anat-callout">💡 ${esc(e.plain)}</div>
      ${energyChartSvg(e.id)}
      <div class="section-title">The metabolic pathway — where the energy comes from</div>
      ${metabolicMillSvg(e.id)}
      <div class="section-title">How it works, step by step</div>
      <ol class="anat-steps">${(e.steps || []).map(s => `<li>${esc(s)}</li>`).join('')}</ol>
      <div class="anat-grid">
        <div class="anat-mini"><h3>What it powers</h3><ul>${(e.powers || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
        <div class="anat-mini"><h3>Byproduct & recovery</h3><p><b>Byproduct:</b> ${esc(e.byproduct)}</p><p><b>Recovery:</b> ${esc(e.recovery)}</p></div>
      </div>
      <div class="section-title">How to train it</div><p>${esc(e.training)}</p>
      ${(e.muscles || []).length ? `<div class="section-title">💪 Muscles that rely on it</div><div class="tag-row">${e.muscles.map(m => `<a class="tag-chip" href="#/muscle/${m.id}">${esc(m.name)}</a>`).join('')}</div>` : ''}
      ${e.related_pathways && e.related_pathways.length ? `<div class="section-title">Related pathways</div><div class="tag-row">${pathwayChips(e.related_pathways)}</div>` : ''}
      ${journeyBlock('energy', e.id)}
      <div id="goal-comments" class="page-discuss"></div></div>`;
  }
  // Hero diagram for each physiology page — visualises that page's core mechanism.
  function physioDiagram(id) {
    const C = { glu: '#475569', ins: '#0d9488', mito: '#0d9488', fat: '#b5533a', prot: '#2563eb', atp: '#d97706', line: '#64748b', up: '#059669', down: '#b3261e', mut: '#94a3b8' };
    const box = (x, y, w, h, label, fill, sub) => `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${fill}" fill-opacity="0.12" stroke="${fill}" stroke-width="1.5"/><text x="${x + w / 2}" y="${sub ? y + h / 2 - 2 : y + h / 2 + 4}" text-anchor="middle" font-size="13" font-weight="700" fill="${fill}">${label}</text>${sub ? `<text x="${x + w / 2}" y="${y + h / 2 + 14}" text-anchor="middle" font-size="10.5" fill="${C.line}">${sub}</text>` : ''}</g>`;
    const arr = (x1, y1, x2, y2, col) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col || C.line}" stroke-width="2.2" marker-end="url(#pd-a)"/>`;
    const t = (x, y, txt, col, size, anchor, ital) => `<text x="${x}" y="${y}" font-size="${size || 10.5}" fill="${col || C.line}" text-anchor="${anchor || 'middle'}"${ital ? ' font-style="italic"' : ''}>${txt}</text>`;
    const D = {
      'insulin-blood-sugar': ['760 400', 'How insulin is released, and what it tells your body to do.',
        box(280, 16, 200, 44, 'Blood glucose ↑', C.glu, 'after a meal') + arr(380, 60, 380, 80) +
        box(240, 80, 280, 52, 'Pancreas β-cell senses it', C.ins, 'glucose → ATP↑ → Ca²⁺ → release') +
        t(534, 110, '← GLP-1 / GIP (gut) amplify it', C.line, 10.5, 'start', true) + arr(380, 132, 380, 152) +
        box(300, 152, 160, 44, 'INSULIN', C.ins, 'released into blood') +
        arr(380, 196, 140, 232) + arr(380, 196, 380, 232) + arr(380, 196, 620, 232) +
        box(30, 232, 220, 62, 'Muscle & fat', C.glu, 'GLUT4 opens → glucose in') +
        box(270, 232, 220, 62, 'Liver', C.glu, 'store glycogen · stop new glucose') +
        box(510, 232, 220, 62, 'Fat', C.fat, 'store fat · block fat-burning') +
        arr(380, 294, 380, 330) + box(180, 330, 400, 46, 'Fed state → store & build, pause fat-burning', C.atp)],
      'glucose-conversion': ['810 380', 'Blood glucose is held in a tight range by four conversions.',
        box(300, 150, 170, 66, 'Blood glucose', C.ins, 'kept in a tight range') +
        box(605, 150, 185, 66, 'Glycogen store', C.glu, 'liver + muscle') +
        box(20, 150, 185, 66, 'New glucose', C.glu, 'gluconeogenesis') +
        box(300, 300, 170, 56, 'Burned for energy', C.atp, 'glycolysis → ATP') +
        arr(470, 170, 605, 170) + t(537, 162, 'store (insulin)', C.up, 10) +
        arr(605, 200, 470, 200) + t(537, 218, 'release (glucagon)', C.down, 10) +
        arr(205, 183, 300, 183) + t(112, 240, 'from lactate · amino acids · glycerol', C.mut, 9, 'middle', true) +
        arr(385, 216, 385, 300)],
      'fat-management': ['900 300', 'Fat is stored when insulin is high and burned when it is low.',
        box(20, 110, 160, 64, 'Glucose + dietary fat', C.glu, 'fed · high insulin') +
        box(250, 100, 160, 84, 'FAT CELL', C.fat, 'triglyceride store') +
        box(490, 110, 160, 64, 'Fatty acids + glycerol', C.fat, 'released to blood') +
        box(720, 110, 160, 64, 'Muscle mitochondria', C.mito, 'β-oxidation → ATP') +
        arr(180, 142, 250, 142) + t(215, 128, 'store', C.up, 10) + t(215, 160, 'lipogenesis', C.mut, 9, 'middle', true) +
        arr(410, 142, 490, 142) + t(450, 126, 'burn · lipolysis', C.down, 9.5) + t(450, 160, 'low insulin', C.mut, 9, 'middle', true) +
        arr(650, 142, 720, 142) + t(685, 128, 'travel', C.mut, 9.5, 'middle', true) + t(685, 160, '+ carnitine', C.mut, 9, 'middle', true) +
        box(230, 230, 440, 46, 'Insulin is the gate — you burn fat mainly when insulin is LOW', C.atp)],
      'protein-muscle-turnover': ['760 400', 'Muscle grows when building outpaces breakdown.',
        box(40, 20, 300, 40, 'BUILD — synthesis (MPS)', C.up) + box(420, 20, 300, 40, 'BREAK DOWN — (MPB)', C.down) +
        box(40, 78, 300, 40, 'Resistance training', C.up) + box(40, 126, 300, 40, 'Protein + leucine → mTOR ↑', C.up) +
        box(40, 174, 300, 40, 'Testosterone · growth hormone', C.up) + box(40, 222, 300, 40, 'Insulin — blocks breakdown', C.up) +
        box(420, 78, 300, 40, 'Fasting / low energy → AMPK ↑', C.down) + box(420, 126, 300, 40, 'Cortisol', C.down) +
        `<line x1="380" y1="72" x2="380" y2="268" stroke="${C.mut}" stroke-width="1.4" stroke-dasharray="5 5"/>` +
        box(150, 320, 460, 52, 'Net muscle GAIN when build > break down', C.up)]
    };
    const d = D[id]; if (!d) return '';
    return `<figure class="learn-fig pd-fig"><svg viewBox="0 0 ${d[0]}" role="img" aria-label="${esc(d[1])}"><defs><marker id="pd-a" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="${C.line}"/></marker></defs>${d[2]}</svg><figcaption class="fig-credit">${esc(d[1])}</figcaption></figure>`;
  }
  function physiologyPage(id) {
    const p = physioById[id]; if (!p) return notFound();
    const steps = p.how_it_works || p.how_insulin_is_made || p.steps || [];
    // Same early-return bug again — all 4 physiology entries have `.expand`, so physioDiagram()
    // (this page's only visual) plus the mechanism steps, hormones/organs and the compound links
    // rendered on ZERO of them in the app. Third instance of this pattern; see musclePage.
    if (p.expand) return learnCourse(p.expand, { name: p.name, key: 'metabolism-' + id, crumb: anatomyCrumb(p.name),
      lede: `<p class="anat-lead">${esc(p.overview)}</p>
        ${p.plain ? `<div class="anat-callout">💡 ${esc(p.plain)}</div>` : ''}
        ${physioDiagram(id)}`,
      badge: '<span class="pw-badge">🔥 Physiology course</span>',
      extraChapters: [{ icon: '🔬', label: 'The process', at: 1, html: `
        ${p.how_insulin_is_made ? `<div class="section-title">How insulin is made</div><ol class="anat-steps">${p.how_insulin_is_made.map(x => `<li>${esc(x)}</li>`).join('')}</ol><div class="section-title">What insulin does</div><ul class="anat-probs">${(p.what_insulin_does || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : `<div class="section-title">How it works</div><ol class="anat-steps">${steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol>`}
        ${p.when_it_matters ? `<div class="anat-card2"><h3>Why it matters for your protocol</h3><p>${esc(p.when_it_matters)}</p></div>` : ''}
        <div class="anat-grid">
          <div class="anat-mini"><h3>Key hormones</h3><ul>${(p.hormones || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
          <div class="anat-mini"><h3>Key organs</h3><ul>${(p.organs || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
        </div>
        ${(() => {
          const cpds = (p.compounds || []).map(n => findCpt(n)).filter(Boolean);
          const seen = new Set(); const uniq = cpds.filter(c => !seen.has(c.id) && seen.add(c.id));
          return uniq.length ? `<div class="section-title">🧪 Compounds that act on this</div>
            <div class="tag-row">${uniq.map(c => `<a class="tag-chip" href="#/c/${slug(c.name)}">${esc(c.name)}</a>`).join('')}</div>` : '';
        })()}` }] });
    return `<div class="article">${anatomyCrumb(p.name)}
      <div class="anat-head"><span class="anat-region">Physiology</span><h1>${esc(p.name)}</h1></div>
      <p class="anat-lead">${esc(p.overview)}</p>
      <div class="anat-callout">💡 ${esc(p.plain)}</div>
      ${physioDiagram(id)}
      ${p.how_insulin_is_made ? `<div class="section-title">How insulin is made</div><ol class="anat-steps">${p.how_insulin_is_made.map(x => `<li>${esc(x)}</li>`).join('')}</ol><div class="section-title">What insulin does</div><ul class="anat-probs">${(p.what_insulin_does || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : `<div class="section-title">How it works</div><ol class="anat-steps">${steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol>`}
      ${p.when_it_matters ? `<div class="anat-card2"><h3>Why it matters for your protocol</h3><p>${esc(p.when_it_matters)}</p></div>` : ''}
      <div class="anat-grid">
        <div class="anat-mini"><h3>Key hormones</h3><ul>${(p.hormones || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
        <div class="anat-mini"><h3>Key organs</h3><ul>${(p.organs || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
      </div>
      ${(() => {
        const cpds = (p.compounds || []).map(n => findCpt(n)).filter(Boolean);
        const seen = new Set(); const uniq = cpds.filter(c => !seen.has(c.id) && seen.add(c.id));
        return uniq.length ? `<div class="section-title">🧪 Compounds that act on this</div>
          <p class="muted" style="font-size:.9rem">The molecular side of this process — supplements and drugs that target it:</p>
          <div class="tag-row">${uniq.map(c => `<a class="tag-chip" href="#/c/${slug(c.name)}">${esc(c.name)}</a>`).join('')}</div>` : '';
      })()}
      ${(p.energy || []).length ? `<div class="section-title">⚡ Energy systems it feeds</div><div class="tag-row">${p.energy.map(id => energyById[id] ? `<a class="tag-chip" href="#/energy/${id}">⚡ ${esc(energyById[id].name.split('(')[0].trim())}</a>` : '').join('')}</div>` : ''}
      ${p.related_pathways && p.related_pathways.length ? `<div class="section-title">Related pathways</div><div class="tag-row">${pathwayChips(p.related_pathways)}</div>` : ''}
      ${journeyBlock('physiology', id)}
      <div id="goal-comments" class="page-discuss"></div></div>`;
  }
  function anatomyIndex() {
    const region = {}; (ANAT.muscles || []).forEach(m => { (region[m.region] = region[m.region] || []).push(m); });
    const muscleCards = Object.keys(region).map(r => `<div class="anat-region-group"><h3>${esc(r)}</h3><div class="anat-cards">${region[r].map(m => `<a class="anat-tile" href="#/muscle/${m.id}"><b>${esc(m.name)}</b><small>${m.exercise_count || 0} exercises · ${m.stretch_count || 0} stretches</small></a>`).join('')}</div></div>`).join('');
    const energyCards = (ANAT.energy_systems || []).map(e => `<a class="anat-tile energy" href="#/energy/${e.id}"><b>⚡ ${esc(e.name.split('(')[0].trim())}</b><small>${esc(e.duration)} · ${esc(e.intensity)}</small></a>`).join('');
    const physioCards = (ANAT.metabolism || []).map(p => `<a class="anat-tile physio" href="#/physiology/${p.id}"><b>${esc(p.name)}</b><small>${esc((p.plain || '').slice(0, 60))}…</small></a>`).join('');
    return `<div class="article">${crumbs([{ label: 'Home', href: '#/' }, { label: 'Anatomy' }])}
      <h1>Anatomy &amp; physiology</h1>
      <p class="anat-lead">The body behind the protocol. Every movement traces back to a muscle, every muscle to the energy systems that fuel it, and every food and supplement to the metabolism it acts on — explained in plain English.</p>
      <div class="section-title">⚡ Energy systems</div>
      <p class="muted" style="font-size:.9rem">How muscles are powered, from a one-second max effort to an all-day walk.</p>
      <div class="anat-cards">${energyCards}</div>
      <div class="section-title">🔬 Metabolism &amp; physiology</div>
      <p class="muted" style="font-size:.9rem">How the body makes and manages its fuel — the science under every nutrition and supplement protocol.</p>
      <div class="anat-cards">${physioCards}</div>
      <div class="section-title">💪 Muscles</div>
      <p class="muted" style="font-size:.9rem">The anatomy, mechanics and training of every major muscle group.</p>
      ${muscleCards}
      ${solveCta('Turn this into a protocol →')}</div>`;
  }

  // The site's WebSite JSON-LD has always declared a SearchAction pointing at /az?q={term}, but
  // nothing read that parameter: /az, /az?q=magnesium and /az?q=zzzznonsense returned byte-identical
  // documents. So the structured data promised Google a search box that would drop the user's query
  // on arrival. Reading ?q= here is what makes that declaration true. Also gives the A-Z page the
  // filter a 171-entry index needs, and makes a search shareable as a URL.
  function azQuery() { try { return (new URL(location.href).searchParams.get('q') || '').slice(0, 80); } catch (e) { return ''; } }
  function azPage() {
    const q0 = azQuery();
    setTimeout(() => {
      const bar = document.getElementById('az-cats'), box = document.getElementById('az-q');
      if (!bar) return;
      const cur = () => (bar.querySelector('.chip.active') || {}).dataset ? bar.querySelector('.chip.active').dataset.cat : '';
      bar.querySelectorAll('.chip').forEach(chip => chip.onclick = () => { bar.querySelectorAll('.chip').forEach(c => c.classList.remove('active')); chip.classList.add('active'); renderAz(chip.dataset.cat, box ? box.value : ''); });
      if (box) {
        box.oninput = () => {
          renderAz(cur(), box.value);
          // Keep the URL in step so a filtered view can be copied and shared, without adding a
          // history entry per keystroke.
          try { const u = new URL(location.href); box.value ? u.searchParams.set('q', box.value) : u.searchParams.delete('q'); history.replaceState(null, '', u); } catch (e) {}
        };
        if (q0) box.value = q0;
      }
      renderAz('', q0);
    }, 0);
    return `${crumbs([{ label: 'Home', href: '#/' }, { label: 'A–Z' }])}<h1>A–Z Index</h1>
      <div class="toolbar"><input id="az-q" type="search" placeholder="Filter ${D.compounds.length} compounds by name…" aria-label="Filter compounds by name" value="${esc(q0)}" style="flex:1;min-width:12rem;padding:.5rem .7rem;border-radius:.5rem;border:1px solid var(--line);background:var(--card);color:inherit;font:inherit"></div>
      <div class="toolbar" id="az-cats"><span class="chip active" data-cat="">All (${D.compounds.length})</span>${D.categories.map(c => `<span class="chip" data-cat="${c}">${c}</span>`).join('')}</div>
      <div id="az-body"></div>`;
  }
  function renderAz(cat, q) {
    const needle = String(q || '').trim().toLowerCase();
    let list = (cat ? D.compounds.filter(c => c.category === cat) : D.compounds.slice());
    if (needle) list = list.filter(c => c.name.toLowerCase().includes(needle) || String(c.category || '').toLowerCase().includes(needle));
    list.sort((a, b) => a.name.localeCompare(b.name));
    const groups = {}; list.forEach(c => { const L0 = c.name[0].toUpperCase(); const L = /[A-Z]/.test(L0) ? L0 : '#'; (groups[L] = groups[L] || []).push(c); });
    let html = '';
    Object.keys(groups).sort().forEach(L => { html += `<div class="az-letter">${L}</div><div class="az-list">` + groups[L].map(c => `<a href="#/c/${slug(c.name)}">${c.name} ${starHTML(c.stars, { compact: true, style: 'font-size:.7rem' })}</a>`).join('') + `</div>`; });
    const body = document.getElementById('az-body'); if (!body) return;
    // A no-match state must say what was searched and offer a way out, not just "None."
    body.innerHTML = html || `<div class="empty">No compound matches “${esc(needle)}”. <a href="#/az" onclick="var b=document.getElementById('az-q');if(b){b.value='';b.oninput();}">Clear the filter</a> to see all ${D.compounds.length}.</div>`;
  }

  function stackPage() {
    setTimeout(bindStack, 0);
    return `${crumbs([{ label: 'Home', href: '#/' }, { label: 'Stack Builder' }])}
      <h1>Stack Builder</h1>
      <p style="color:var(--muted)">Add compounds from any page (the <b>+ Add to stack</b> button), or below. See combined goal coverage, the pathways you're hitting, and shared targets. Your stack saves locally and is shareable by link.</p>
      <div class="toolbar"><select id="stack-add" class="stack-select"><option value="">+ Add a compound…</option>${D.compounds.slice().sort((a, b) => a.name.localeCompare(b.name)).map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select>
      <button id="stack-share" class="chip">🔗 Share link</button>
      <button id="stack-wrapped" class="chip">📊 Share as image</button>
      <button id="stack-clear" class="chip">Clear</button></div>
      <div id="stack-out"></div>
      <div id="popular-forks"></div>`;
  }
  async function mountPopularForks() {
    const el = document.getElementById('popular-forks'); if (!el) return;
    let forks = []; try { forks = await api.popularForks(); } catch (e) {}
    if (!forks.length) return;
    el.innerHTML = `<div class="section-title">🍴 Popular community stacks</div>
      <p class="muted" style="font-size:.85rem;margin-top:-.3rem">Variations other people built and cloned most. Not reviewed — but a fast way to start.</p>
      <div class="fork-list">${forks.map(f => { const p = problemById[f.problem_id]; return `<div class="fork-card"><div class="fork-head"><a class="fork-title" href="#/fork/${f.id}"><b>${esc(f.title)}</b></a><span class="fork-by">${f.by_user ? '@' + esc(f.by_user) : 'someone'} · ${f.clones} clone${f.clones !== 1 ? 's' : ''}</span></div>${p ? `<p class="fork-stack">for ${esc(p.name)}</p>` : ''}<button class="fork-clone" data-clone="${f.id}">Clone →</button></div>`; }).join('')}</div>`;
    el.querySelectorAll('[data-clone]').forEach(b => b.onclick = () => cloneForkTo(b.dataset.clone));
  }
  function bindStack() {
    const add = document.getElementById('stack-add');
    if (add) add.onchange = () => { if (add.value) { const s = getStack(); if (!s.includes(add.value)) { s.push(add.value); setStack(s); } add.value = ''; renderStack(); } };
    mountPopularForks();
    const wrapped = document.getElementById('stack-wrapped');
    if (wrapped) wrapped.onclick = () => { if (!getStack().length) { alert('Add a compound to your stack first.'); return; } openWrapped(); };
    const share = document.getElementById('stack-share');
    if (share) share.onclick = async () => {
      if (!getStack().length) { alert('Add a compound to your stack first.'); return; }
      const url = location.origin + location.pathname + '#/stack?ids=' + getStack().join(',');
      const text = 'My supplement stack on RNAwiki — see the goals, pathways and overlaps it covers.';
      try { if (navigator.share) await navigator.share({ title: 'My RNAwiki stack', text, url }); else { await navigator.clipboard.writeText(url); share.textContent = '✓ Copied'; setTimeout(() => share.textContent = '🔗 Share my stack', 1500); } } catch (e) {}
      if (ME) api.rep('share');
    };
    const clr = document.getElementById('stack-clear');
    if (clr) clr.onclick = () => { setStack([]); renderStack(); };
    renderStack();
  }

  // ---------- Fuel (a main function: pick a protocol → personalised tracker + auto-stack) ----------
  function fuelPage(pid, rcid) {
    const p = pid && problemById[pid];
    const rc = resolveRc(p, rcid);
    if (p && rc) {
      return `${crumbs([{ label: 'Home', href: '#/' }, { label: 'Fuel', href: '#/fuel' }, { label: p.name }])}
        <section class="fuel-page">
          <div class="fuel-page-hd">
            <div><div class="kicker">Personalised fuel</div><h1>${p.icon || '🍚'} ${esc(p.name)}</h1>
            <p class="muted">${esc(rc.plain || rc.name)}</p></div>
            <a class="cta-ghost" href="#/fuel">Change protocol</a>
          </div>
          <div class="section-title">💊 Your supplement stack for this protocol</div>
          <p class="muted" style="font-size:.9rem">Auto-added to your stack — remove any that don't suit you, or add more. Your stack saves on this device.</p>
          <div id="fuel-stack"><p class="muted">Loading…</p></div>
          <a class="proto-more" href="#/stack">Open the full Stack Builder →</a>
          <div class="section-title">🍚 Fuel tracker — hit this protocol's targets</div>
          <p class="muted" style="font-size:.9rem">Log local meals and watch the bars fill toward the biological targets this protocol is built around.</p>
          <div id="fuel-tracker" data-rc="${p.id}:${rc.id}"><p class="muted">Loading…</p></div>
        </section>`;
    }
    const opts = GRAPH.problems.map(pp => `<optgroup label="${esc(pp.name)}">${pp.root_causes.map(r => `<option value="${pp.id}|${r.id}">${esc(pp.name)} — ${esc((r.plain || r.name).slice(0, 64))}</option>`).join('')}</optgroup>`).join('');
    return `${crumbs([{ label: 'Home', href: '#/' }, { label: 'Fuel' }])}
      <section class="fuel-picker">
        <div class="kicker">Personalised nutrition</div>
        <h1>🍚 Fuel your protocol</h1>
        <p class="hero-lead">Pick the protocol you're following. Its supplement stack loads here — yours to tweak — with a food tracker set to its exact biological targets, so every meal moves you toward fixing the root cause.</p>
        <label class="fuel-sel-l">Which protocol are you following?</label>
        <select id="fuel-sel" class="fuel-sel"><option value="">— choose a problem or goal —</option>${opts}</select>
        <p class="muted" style="font-size:.85rem;margin-top:.9rem">Not sure yet? <a href="#/solve">Find your root cause first →</a></p>
      </section>`;
  }
  function bindFuel(pid, rcid) {
    const sel = document.getElementById('fuel-sel');
    if (sel) { sel.onchange = () => { if (sel.value) { const [pp, rr] = sel.value.split('|'); navigate('/fuel/' + pp + '/' + rr); } }; }
    if (pid && rcid) mountFuel(pid, rcid);
  }
  async function mountFuel(pid, rcid) {
    try { await ensureProtocolData(); } catch (e) {}
    const p = problemById[pid]; const rc = resolveRc(p, rcid);
    if (!p || !rc) return;
    const P = generateProtocol(rc);
    // REMOVED 2026-07-28: merely OPENING /fuel used to silently write this protocol's compounds
    // into the user's saved stack -- no click, no confirmation, no interaction check. On the LDL
    // protocol that wrote in Statins (a prescription medicine) AND Red Yeast Rice, a pairing the
    // site's own interaction rules forbid; elsewhere it wrote in Semaglutide. Adding to a stack
    // must be an explicit act by the reader. The page still displays the protocol's compounds
    // below -- it just no longer decides for them.
    renderFuelStack(P);
    const inStackList = () => (P.stack || []).filter(c => inStack(c.id)); // compounds the user actually has in their stack
    loadUserFoods().then(() => mountFuelTracker(p, rc, null, inStackList()));
    mountFuelTracker(p, rc, null, inStackList());
  }
  function renderFuelStack(P) {
    const el = document.getElementById('fuel-stack'); if (!el) return;
    const list = P.stack || [];
    if (!list.length) { el.innerHTML = '<p class="muted">No supplements mapped for this protocol — focus on the food targets below.</p>'; return; }
    el.innerHTML = `<div class="fuel-stack-grid">${list.map(c => {
      const on = inStack(c.id);
      return `<div class="fs-item"><a class="fs-main" href="#/c/${slug(c.name)}"><b>${esc(c.name)}</b>${starHTML(c.stars, { compact: true })}</a>
        <button class="fs-toggle ${on ? 'in' : ''}" data-add="${c.id}">${on ? '✓ In stack' : '+ Add'}</button></div>`;
    }).join('')}</div>`;
    el.querySelectorAll('[data-add]').forEach(b => b.onclick = () => { toggleStack(b.dataset.add); const on = inStack(b.dataset.add); b.classList.toggle('in', on); b.textContent = on ? '✓ In stack' : '+ Add'; });
  }
  // ---------- Supplement interaction engine (data: window.RNAWIKI_INTERACTIONS) ----------
  const RXN = window.RNAWIKI_INTERACTIONS || { catTags: {}, nameTags: [], rules: [], synergies: [] };
  // ---- W3 (2026-08-01): the panel must know what it CANNOT check ------------------------------
  // The set of tags some rule actually consumes. A compound whose tags miss this set entirely can
  // never produce a flag, so "nothing flagged" about it is an absence of data, not a clearance.
  // MEASURED hydrated at 390x844 on /stack (out/w3i/before.json): 171 compounds, 77 of them carry
  // no tag any rule consumes — 35 of those prescription, controlled or unapproved — and a stack of
  // five such compounds rendered "Interaction check ✅ No dangerous interactions flagged" with zero
  // rows. That is a negative safety claim issued from an empty knowledge base.
  // W3.5 (2026-08-02): only rules that CAN FIRE against this corpus count as coverage. `double_5ar`
  // needs two distinct carriers of `5ar_inhibitor`; the corpus carries it exactly once (the bundled
  // "Finasteride / Dutasteride" page), so that rule can never produce a flag — yet its tag made this
  // panel count the compound as checked. MEASURED hydrated at 390x844 before the change:
  // /stack?ids=c39,c120 rendered "✅ Nothing flagged between the 2 of 2 I have pharmacology for".
  // It is 1 of 2, and the honest render is the ❔ state naming the compound.
  // This is the same arithmetic as coverage.reachable in site/interactions.js, which
  // assertInteractionCoverage() in build/parse.js recomputes and gates — keep the two definitions
  // identical or the number the build publishes stops matching what the panel tells the reader.
  // The rule is NOT deleted: it becomes firable the moment the corpus carries a second
  // 5-alpha-reductase inhibitor. What changes is that its single carrier stops counting as covered.
  const RULE_TAGS = (function () {
    const carriers = {};
    (D.compounds || []).forEach(c => compoundTags(c).forEach(t => { carriers[t] = (carriers[t] || 0) + 1; }));
    const s = new Set();
    (RXN.rules || []).forEach(r => {
      if (!(r.need || []).every(n => (carriers[n[0]] || 0) >= n[1])) return;
      (r.need || []).forEach(n => s.add(n[0]));
    });
    return s;
  })();
  function compoundTags(c) {
    // W3.6 (2026-08-02): TAGS ARE ASSIGNED BY COMPOUND ID, NEVER BY NAME SUBSTRING.
    // `nm.indexOf(r.m)` asserted a mechanism for every current AND FUTURE compound whose name
    // happened to contain the letters — the catTags fabrication engine one level down. It was
    // live seven times; measured hydrated at 390x844 on /stack, "myoSTATIN" put a ☠️ "Double
    // statin" row on Follistatin / Myostatin inhibitors, "NIACINamide" put ☠️ "Statin + high-dose
    // niacin" on a page that says "Choose niacinamide, NOT niacin/nicotinic acid", and "provIRON"
    // put "⏰ Minerals compete" on mesterolone. `r.m` survives in site/interactions.js only as the
    // tripwire assertNameTagAllowlist() runs at build time; nothing at runtime reads it.
    // The identical predicate lives in build/parse.js tagsOf(). Change both or the published
    // coverage number stops matching what this panel prints — which the build gates.
    const s = new Set(RXN.catTags[c.category] || []);
    (RXN.nameTags || []).forEach(r => { if ((r.ids || []).indexOf(c.id) >= 0) r.t.forEach(t => s.add(t)); });
    return s;
  }
  // ---- W4.5 (2026-08-02): A `need` COUNT IS A COUNT OF SUBSTANCES, NOT OF PAGES ---------------
  // Some molecules have two pages here because they are written for two different readers, and
  // this function counted the second page as a second drug. Measured hydrated at 390x844:
  //   /stack?ids=c1,c24    "☠️ Stacked stimulants — cardiovascular strain · Caffeine + Caffeine
  //                         (thermogenic) · Each drives the same fight-or-flight system."
  //   /stack?ids=c132,c133 "☠️ Additive low-blood-sugar risk · Insulin (prescribed) + Insulin
  //                         (anabolic misuse)" — the most dangerous pair on the site, fabricated.
  // The groups live in site/interactions.js `duplicates` and are build-gated there.
  // A COMPOUND IN MORE THAN ONE GROUP IS NEVER COLLAPSED: c148 is a bundle page supplying both
  // calcium AND iron, so Ca-AKG + c148 is a real calcium-against-iron competition and keeps its
  // row. Collapsing it would delete a true warning to satisfy a rule about duplicates.
  const DUPE_OF = (function () {
    const m = {};
    (RXN.duplicates || []).forEach(g => (g.ids || []).forEach(id => (m[id] = m[id] || []).push(g)));
    return m;
  })();
  function sameSubstance(a, b) {
    const ga = DUPE_OF[a.id] || [], gb = DUPE_OF[b.id] || [];
    return ga.length === 1 && gb.length === 1 && ga[0] === gb[0];
  }
  // "n DISTINCT substances carry this tag". Exact for n ≤ 2, which is the largest count any rule
  // needs — for 2 it asks whether some pair of carriers is not two pages of one substance.
  function distinctCarriers(cs, n) {
    if (cs.length < n) return false;
    if (n <= 1) return cs.length >= 1;
    for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) if (!sameSubstance(cs[i], cs[j])) return true;
    return false;
  }
  function stackInteractions(list) {
    const byTag = {};
    list.forEach(c => compoundTags(c).forEach(t => (byTag[t] = byTag[t] || []).push(c)));
    const fired = [], collapsed = [];
    (RXN.rules || []).forEach(rule => {
      if (!rule.need.every(n => (byTag[n[0]] || []).length >= n[1])) return;
      const inv = [];
      rule.need.forEach(n => (byTag[n[0]] || []).forEach(c => { if (inv.indexOf(c) < 0) inv.push(c); }));
      const row = { id: rule.id, notIf: rule.notIf, tier: rule.tier, title: rule.title, why: rule.why, action: rule.action, pathway: rule.pathway, involved: inv.map(c => c.name), members: inv };
      // Satisfied by pages but not by substances: the rule does not get to claim an interaction,
      // and the honest row about what actually happened is built below.
      (rule.need.every(n => distinctCarriers(byTag[n[0]] || [], n[1])) ? fired : collapsed).push(row);
    });
    // `notIf` — a broad rule stands down when the specific rule for the same physiology already
    // fired, so one interaction is never counted twice. Added 2026-08-01 with the hypotensive
    // rules: beetroot + a PDE-5 inhibitor is ONE blood-pressure interaction, and the verdict line
    // counts danger rows, so without this it would have read "2 dangerous combinations" for it.
    const firedIds = {}; fired.forEach(f => { firedIds[f.id] = 1; });
    // W4.5: the honest replacement row. It is NOT silence — a reader who has two pages of one
    // molecule in a stack is doing something worth naming, they are just not doing what the rule
    // said. Tier is inherited from the strongest rule the duplication collapsed, so
    // /stack?ids=c132,c133 stays a ☠️ danger row and the verdict still counts it; only the
    // sentence changes, from "two glucose-lowering agents" to "the same one, counted twice".
    // The text is authored per group in site/interactions.js and quotable against those pages.
    const dupeRows = (RXN.duplicates || []).map(g => {
      const members = list.filter(c => (g.ids || []).indexOf(c.id) >= 0 && (DUPE_OF[c.id] || []).length === 1);
      if (members.length < 2) return null;
      const ids = {}; members.forEach(c => { ids[c.id] = 1; });
      const from = collapsed.filter(r => r.members.every(c => ids[c.id]));
      const tier = from.some(r => r.tier === 'danger') ? 'danger' : from.some(r => r.tier === 'blunt') ? 'blunt' : 'timing';
      return { id: 'dupe:' + g.substance, tier, title: g.title, why: g.why, action: g.action, involved: members.map(c => c.name), members };
    }).filter(Boolean);
    const flags = dupeRows.concat(fired.filter(f => !(f.notIf || []).some(id => firedIds[id])));
    const syn = [];
    (RXN.synergies || []).forEach(g => {
      // W3.6 (2026-08-02): id allowlists here too. Substring matching on a SYNERGY is worse than
      // on a rule, because the output is a green "works well together". Measured hydrated at
      // 390x844 on /stack: c63+c11 printed "✅ Statin + CoQ10 — Statins deplete CoQ10" for a
      // myostatin inhibitor, directly above "❔ I hold no interaction pharmacology for CoQ10";
      // c134+c120 printed "✅ Iron + Vitamin C" for Proviron; c14+c9 printed "✅ Glycine + NAC"
      // for Betaine (trimethylGLYCINE). The same change also fixes a MISS: `find` matched both
      // "collagen" and "vitamin c" to c109, so the A !== B guard dropped this site's own authored
      // Collagen + Vitamin C pairing on the one stack where it matters.
      const A = list.find(c => (g.aIds || []).indexOf(c.id) >= 0);
      const B = list.find(c => (g.bIds || []).indexOf(c.id) >= 0);
      if (A && B && A !== B) syn.push({ title: g.title, why: g.why });
    });
    return { flags, synergies: syn };
  }
  function interactionPanel(list) {
    if (list.length < 2) return '';
    const r = stackInteractions(list);
    // ---- W3.5 (2026-08-02): ONE VERDICT, THE SAME ON ALL FIVE SURFACES -----------------------
    // An `opts.tiers` filter stood here and removed rows BEFORE the verdict counted them, so a
    // page that hid a row also silently promoted its own verdict from ⚠️ to ✅. The `opts`
    // parameter is gone entirely, because a per-call-site display option that can change the
    // verdict is a defect class, not a setting. MEASURED hydrated at 390x844 before the change:
    //   NAC + Vitamin C         /stack  "⚠️ 1 thing to review" + 🔻 May blunt training adaptation
    //                           /c/vitamin-c-ascorbate  "✅ Nothing flagged between the 2 of 2 I
    //                                                    have pharmacology for", zero rows
    //                           /c/n-acetylcysteine-nac  the same green string
    //   bone-density/low-bmd    /plan tracker "✅ Nothing flagged between the 5 of 6 …"
    //                           same 6 on /stack "⚠️ 2 things to review" + ⏰ Minerals compete
    //   skin-aging/uv-oxidative /plan builder "✅ Nothing flagged between the 5 of 6 …"
    //                           same 6 on /stack "⚠️ 2 things to review" + 🔻 May blunt training
    // The tracker filtered to tiers:['danger'] — the daily-checklist surface, the one place a
    // mineral-timing warning would actually change behaviour. If the panel is ever too heavy
    // there, collapse the panel; never hide a row the verdict counted.
    const nDanger = r.flags.filter(f => f.tier === 'danger').length;
    const icon = { danger: '☠️', blunt: '🔻', timing: '⏰' };
    const order = { danger: 0, blunt: 1, timing: 2 };
    r.flags.sort((a, b) => order[a.tier] - order[b.tier]);
    // ---- W3 (2026-08-01): THE VERDICT MUST STATE ITS OWN COVERAGE ----------------------------
    // Three things this fixes, each measured hydrated at 390x844 before the change:
    //  1. FALSE CLEAR. L-Citrulline + PDE-5 Inhibitors rendered "✅ No dangerous interactions
    //     flagged" (.ixn-verdict.ok) with 0 rule rows, while the same pair's own compendium entry
    //     says "citrulline + beetroot + ED drugs (PDE-5) + nitrates together can drop blood
    //     pressure dangerously" (content/COMPENDIUM.md:233). Same for melatonin + valerian, and
    //     for a five-item stack of prescription/controlled compounds the engine holds nothing on.
    //  2. NO "I DON'T KNOW" STATE. The panel had exactly two negatives — flagged, or clear. There
    //     was no way to say "I have no pharmacology for these", which is the true answer for 77 of
    //     171 compounds. A green tick over an empty knowledge base is the worst of the three.
    //  3. ORDERING. The "⚠ Overlapping pathways" warning lived in the stack summary at y=1053 on a
    //     844px screen — 209px BELOW the fold — while the green tick sat at y=486, inside it. The
    //     reassurance was visible and the warning was not. Overlap now renders inside this panel,
    //     directly under the verdict, and forces the verdict off green.
    const covered = list.filter(c => { let ok = false; compoundTags(c).forEach(t => { if (RULE_TAGS.has(t)) ok = true; }); return ok; });
    const uncovered = list.filter(c => covered.indexOf(c) < 0);
    // Pathway overlap is computed HERE, not passed in. It used to arrive only from renderStack()
    // below, which is why it forced the verdict off green on /stack and nowhere else: hydrated at
    // 390x844, /stack?ids=c13,c116 rendered "🔻 Overlapping pathways · Nitric oxide / cGMP" while
    // /c/l-citrulline-citrulline-malate with the same pair in the stack rendered no overlap row at
    // all. Same data, one surface. The `&& D.pathways[i]` guard is new: a stale pathway id now
    // yields no row instead of a TypeError.
    const overlaps = (function () {
      const paths = {};
      list.forEach(c => (c.pathwayIds || []).forEach(i => (paths[i] = (paths[i] || []).concat(c.name))));
      return Object.keys(paths).filter(i => paths[i].length > 1 && D.pathways[i])
        .map(i => ({ label: D.pathways[i].shortLabel, n: paths[i].length }));
    })();
    const nReview = r.flags.length + (overlaps.length ? 1 : 0);
    // True exactly when the verdict below takes its ❔ branch: nothing dangerous, nothing to
    // review, and fewer than two of these compounds are checkable at all. Kept in step with the
    // ternary by construction — if that ternary changes, this line changes with it.
    const notEnough = !nDanger && !nReview && covered.length < 2;
    const parts = [];
    parts.push(nDanger
      ? `<span class="ixn-verdict bad">☠️ ${nDanger} dangerous combination${nDanger > 1 ? 's' : ''} — read below</span>`
      : (nReview ? `<span class="ixn-verdict warn">⚠️ ${nReview} thing${nReview > 1 ? 's' : ''} to review</span>`
        : (covered.length < 2
          ? `<span class="ixn-verdict warn">❔ Not enough to check — I have interaction pharmacology for ${covered.length} of these ${list.length}</span>`
          : `<span class="ixn-verdict ok">✅ Nothing flagged between the ${covered.length} of ${list.length} I have pharmacology for</span>`)));
    // W3.5 (2026-08-02): this is a VERDICT chip — same shape, same row, same weight as the ✅/⚠️/☠️
    // chip beside it. In the ❔ state it puts a green tick next to an explicit statement that
    // nothing could be checked. MEASURED hydrated: /stack?ids=c0,c12 (Creatine + Beta-Alanine)
    // rendered "❔ Not enough to check — I have interaction pharmacology for 0 of these 2" and
    // "✅ 1 good pairing" on the SAME LINE at 1280x900 (both chips y=333) and 52px apart at
    // 390x844 (y=486 / y=538), both above the fold. The synergy is authored data and stays — it
    // still renders as an .ixn good ROW below, where it reads as information rather than as a
    // clearance. What goes is the chip that reads as a second verdict.
    if (r.synergies.length && !notEnough) parts.push(`<span class="ixn-verdict good">✅ ${r.synergies.length} good pairing${r.synergies.length > 1 ? 's' : ''}</span>`);
    const lap = overlaps.length ? `<div class="ixn blunt">
        <div class="ixn-h">🔻 <b>Overlapping pathways</b> <span class="ixn-who">${overlaps.map(o => esc(o.label)).join(' · ')}</span></div>
        <p class="ixn-why">Two or more of these push the same pathway: ${overlaps.map(o => `${esc(o.label)} ×${o.n}`).join(', ')}. That can mean synergy — or the same effect delivered twice, which is how side-effects add up without the dose on the label going up.</p>
        <p class="ixn-act"><b>What to do:</b> Treat compounds sharing a pathway as one lever, not two. Add them one at a time so you can tell which is doing what.</p></div>` : '';
    const rows = r.flags.map(f => `<div class="ixn ${f.tier}">
        <div class="ixn-h">${icon[f.tier]} <b>${esc(f.title)}</b> <span class="ixn-who">${f.involved.map(esc).join(' + ')}</span></div>
        <p class="ixn-why">${esc(f.why)}</p>
        <p class="ixn-act"><b>What to do:</b> ${esc(f.action)}${f.pathway ? ` · <a href="#${f.pathway}">the biology →</a>` : ''}</p></div>`).join('');
    const syn = r.synergies.map(s => `<div class="ixn good">
        <div class="ixn-h">✅ <b>${esc(s.title)}</b> — works well together</div>
        <p class="ixn-why">${esc(s.why)}</p></div>`).join('');
    return `<div class="ixn-panel">
      <div class="ixn-top"><b>Interaction check</b> ${parts.join(' ')}</div>
      ${rows}${lap}${syn}
      ${uncovered.length ? `<p class="ixn-foot ixn-gap">❔ I hold no interaction pharmacology for ${uncovered.map(c => esc(c.name)).join(', ')} — nothing flagged against ${uncovered.length > 1 ? 'those' : 'that'} is an absence of data, not a clearance.</p>` : ''}
      <p class="ixn-foot">Educational signal from known pharmacology — not a safety clearance. Confirm anything you're unsure of with a pharmacist or doctor.</p>
    </div>`;
  }

  function renderStack() {
    const out = document.getElementById('stack-out'); if (!out) return;
    const list = getStack().map(id => byId[id]).filter(Boolean);
    if (!list.length) { out.innerHTML = '<div class="empty">Your stack is empty. Add compounds to see combined coverage.</div>'; return; }
    // aggregate
    const goals = {}, paths = {}, tgts = {};
    list.forEach(c => {
      c.goalIds.forEach(g => (goals[g] = (goals[g] || []).concat(c.name)));
      (c.pathwayIds || []).forEach(i => (paths[i] = (paths[i] || []).concat(c.name)));
      (c.targets || []).forEach(t => { const k = t.sym.toUpperCase(); (tgts[k] = tgts[k] || { sym: t.sym, who: [] }).who.push(c.name); });
    });
    // Overlapping pathways moved INTO the interaction panel (W3, 2026-08-01). Measured hydrated at
    // 390x844: this warning rendered at y=1053 inside .stack-summary — 209px below the 844px fold —
    // while the "✅ No dangerous interactions flagged" tick sat at y=486, in the first screenful.
    // On mobile the reassurance was visible and the warning was not. It is one warning, so it is
    // rendered once, at the top, and it now forces the verdict off green.
    // W3.5 (2026-08-02): the overlap computation itself moved INTO interactionPanel(), so all five
    // surfaces get it and not just this one. `paths` is still used by the Pathways-hit block below.
    const rows = list.map(c => `<div class="stack-row"><a href="#/c/${slug(c.name)}"><b>${c.name}</b></a> ${starHTML(c.stars, { compact: true, style: 'font-size:.75rem' })} <span style="color:var(--faint);font-size:.82rem">${c.category}</span> <button class="stack-x" data-id="${c.id}">remove</button></div>`).join('');
    const sharedTargets = Object.values(tgts).filter(t => t.who.length > 1);
    out.innerHTML = `
      ${interactionPanel(list)}
      <div class="stack-grid">
        <div class="stack-list">${rows}</div>
        <div class="stack-summary">
          <div class="ss-block"><div class="ss-h">Goals covered (${Object.keys(goals).length})</div>${Object.keys(goals).map(g => `<a class="chip" href="#/goal/${g}">${goalById[g].icon} ${goalById[g].label}</a>`).join(' ') || '—'}</div>
          <div class="ss-block"><div class="ss-h">Pathways hit (${Object.keys(paths).length})</div>${Object.keys(paths).map(i => `<a class="ex-node p" href="#/pathway/${i}">${D.pathways[i].shortLabel}${paths[i].length > 1 ? ' ×' + paths[i].length : ''}</a>`).join(' ') || '—'}</div>
          ${sharedTargets.length ? `<div class="ss-block"><div class="ss-h">Shared molecular targets</div>${sharedTargets.map(t => `<a class="ex-node t" href="#/target/${tkey(t.sym)}">${t.sym} ×${t.who.length}</a>`).join(' ')}</div>` : ''}
          <div class="ss-block"><div class="ss-h">This is not medical advice</div><p style="color:var(--faint);font-size:.85rem">Combined pathway/target overlap is an educational signal, not a safety clearance. Interactions require a clinician.</p></div>
        </div>
      </div>`;
    out.querySelectorAll('.stack-x').forEach(b => b.onclick = () => { const s = getStack(); const i = s.indexOf(b.dataset.id); if (i >= 0) s.splice(i, 1); setStack(s); renderStack(); });
  }

  // honest, data-driven verdict — never fabricates a winner; higher stars = stronger human evidence
  // Kept in step with build/prerender.js (see the note there). The star is a whole-compound
  // summary across everything a compound has been studied for, not a grade for the specific use
  // this page asks about, so it cannot name a winner "for {goal}" — and the prerendered twin was
  // emitting exactly that into FAQPage JSON-LD. Both documents now decline to rank.
  function comparisonVerdict(A, B) {
    return `I do not publish an indication-specific evidence grade for ${A.name} or ${B.name} for this use, so I am not going to name a winner. `
      + `The star ratings are whole-compound summaries across everything each has been studied for — not a grade for this use. `
      + `What actually differs is mechanism, side-effect profile, interactions, availability and cost, compared in full below.`;
  }

  // static comparison view for /compare/a-vs-b — mirrors the prerendered page so the FAQ schema matches after hydration
  function renderComparison(pair) {
    const idx = (pair || '').indexOf('-vs-');
    if (idx < 0) return comparePage();
    const A = bySlug[pair.slice(0, idx)], B = bySlug[pair.slice(idx + 4)];
    if (!A || !B) return comparePage();
    const shared = (A.goalIds || []).find(g => (B.goalIds || []).includes(g));
    // W5b (2026-08-02): D33 — THE PARAGRAPH GOOGLE QUOTES AND THE PARAGRAPH ON THE PAGE.
    // Measured across all 123 pairs: the verdict was string-equal between the two documents on
    // 0/123, and on the HYDRATED page the FAQPage JSON-LD answer (which survives in <head>, since
    // hydration only replaces #app) equalled the visible verdict on 0/123. The prerendered text
    // names the goal and says "comparing them here would be misleading"; the copy below said "for
    // this use" and dropped that clause. The goal LABEL itself disagreed on 4/123, because this
    // renderer re-derives it from the first shared goalId while build/prerender.js uses the pair's
    // own authored goal. Both are now read from the generated map (site/head.js), which
    // build/prerender.js writes from the string it actually emitted. comparisonVerdict() stays as
    // the fallback for an ad-hoc pair the generator never published — a pair a reader assembled in
    // the picker has no prerendered document and so cannot have a prerendered verdict.
    const _v = (window.RNAWIKI_VERDICT || {})['/compare/' + pair];
    const gl = _v ? _v[1] : (shared && goalById[shared] ? goalById[shared].label : 'this goal').toLowerCase();
    const goalHref = _v && _v[2] ? _v[2] : shared;
    const verdict = _v ? _v[0] : comparisonVerdict(A, B);
    // W5c (2026-08-02): D6 — COLUMN B WAS ENTIRELY OFF-SCREEN ON A PHONE, SILENTLY.
    // Measured hydrated at 390x844 on all 123 published pairs, 0 pageerrors
    // (qa/out/w5cdi/before-390.json): `.cmp-wrap` scrollWidth 520 against clientWidth 350 on
    // 123/123, and `thead th:nth-child(3)` — the whole second compound — had a right edge with a
    // median of 597px against a 390px viewport, on 123/123. `overflow-x:auto` means it scrolls,
    // but `document.documentElement.scrollWidth` stayed 390, so the page gives no sign that half
    // of a two-thing comparison is missing.
    // The fix is CSS (the table stacks below 600px) plus the one thing CSS cannot do: once the
    // rows are stacked, a value needs to say WHICH COMPOUND IT IS ABOUT. `.cmp-who` is that label.
    // It is aria-hidden and display:none on desktop, because for AT the association already comes
    // from the column header — which is why the stacked layout hides <thead> by clipping it rather
    // than with display:none, so it stays in the accessibility tree. The explicit ARIA roles are
    // load-bearing for the same reason: `display:block` on a table strips its implicit roles.
    const who = (n) => `<span class="cmp-who" aria-hidden="true">${esc(n)}</span>`;
    // W5d (2026-08-02): D40 — see the note in build/prerender.js. `|| '—'` printed a bare em-dash
    // as a cell's entire content on 11 of 123 pairs, always the BOTTOM LINE row, always Iron or
    // Vitamin C. An em-dash in one column of a two-column comparison reads as a fact about that
    // compound; it is a fact about the corpus. Both renderers now say which.
    const blank = '<span class="cmp-none">Not written up yet</span>';
    const has = (v) => !!(v && String(v).replace(/<[^>]*>/g, '').replace(/[—\s]/g, ''));
    const row = (k, va, vb) => (!has(va) && !has(vb)) ? '' : `<tr role="row"><th role="rowheader" scope="row">${k}</th><td role="cell">${who(A.name)}${has(va) ? va : blank}</td><td role="cell">${who(B.name)}${has(vb) ? vb : blank}</td></tr>`;
    const faq = faqRender([
      { q: `Is ${A.name} or ${B.name} better for ${gl}?`, a: verdict },
      { q: `What's the difference between ${A.name} and ${B.name}?`, a: `${A.name}: ${faqSnip(A.bottom || A.plain, 130)} — ${B.name}: ${faqSnip(B.bottom || B.plain, 130)}` },
    ]);
    return `${crumbs([{ label: 'Home', href: '#/' }, { label: 'Compare', href: '#/compare' }, { label: `${A.name} vs ${B.name}` }])}
      <div class="detail"><h1>${esc(A.name)} vs ${esc(B.name)}</h1>
      <p>${goalHref ? `Both are used for <a href="#/goal/${esc(goalHref)}">${esc(gl)}</a>. ` : ''}How they compare on human evidence, mechanism, safety and availability — in plain English.</p>
      <div class="cmp-wrap"><table class="cmp-table" role="table"><thead><tr role="row"><th role="columnheader"></th><th role="columnheader" scope="col"><a href="#/c/${slug(A.name)}">${esc(A.name)}</a></th><th role="columnheader" scope="col"><a href="#/c/${slug(B.name)}">${esc(B.name)}</a></th></tr></thead><tbody>
        ${row('Human evidence', starHTML(A.stars), starHTML(B.stars))}
        ${row('Legal status', approvalPills(A), approvalPills(B))}
        ${row('How it works', mdInline(A.mechanism), mdInline(B.mechanism))}
        ${row('In plain English', mdInline(A.plain), mdInline(B.plain))}
        ${row('Bottom line', mdInline(A.bottom), mdInline(B.bottom))}
      </tbody></table></div>
      <h2>Which is better for ${esc(gl)}?</h2><p>${esc(verdict)}</p>
      ${faq}
      <p>Full breakdowns: <a href="#/c/${slug(A.name)}">${esc(A.name)}</a> · <a href="#/c/${slug(B.name)}">${esc(B.name)}</a> · <a href="#/compare">Compare others →</a></p>
      ${solveCta('🎯 Build your own Move · Fuel · Stack protocol →')}</div>`;
  }

  // Split out of comparePage (2026-07-30) so the picker can be mounted INTO the prerendered
  // /compare index instead of replacing it. The index lists all 119 ready-made comparison pages;
  // the picker builds an ad-hoc one. A JS reader should get both, and used to get only the picker.
  function comparePicker() {
    const opts = D.compounds.slice().sort((a, b) => a.name.localeCompare(b.name)).map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    setTimeout(() => {
      const a = document.getElementById('cmpA'), b = document.getElementById('cmpB');
      const render = () => {
        const A = byId[a.value], B = byId[b.value];
        const row = (k, va, vb) => `<div class="compare-row"><div class="rk">${k}</div><div>${va || '—'}</div><div>${vb || '—'}</div></div>`;
        document.getElementById('cmp-out').innerHTML =
          row('Compound', `<strong>${A.name}</strong>`, `<strong>${B.name}</strong>`) +
          row('Category', A.category, B.category) +
          row('Legal status', approvalPills(A), approvalPills(B)) +
          row('Human evidence', starHTML(A.stars), starHTML(B.stars)) +
          row('Targets', (A.targets || []).map(t => t.sym).join(', '), (B.targets || []).map(t => t.sym).join(', ')) +
          row('Mechanism', mdInline(A.mechanism), mdInline(B.mechanism)) +
          row('Plain English', mdInline(A.plain), mdInline(B.plain)) +
          row('Bottom line', mdInline(A.bottom), mdInline(B.bottom));
      };
      a.onchange = render; b.onchange = render; if (D.compounds[1]) b.value = D.compounds[1].id; render();
    }, 0);
    return `<div class="compare-cols"><div class="compare-col"><select id="cmpA">${opts}</select></div><div class="compare-col"><select id="cmpB">${opts}</select></div></div>
      <div class="compare-table" id="cmp-out"></div>`;
  }
  function comparePage() {
    return `${crumbs([{ label: 'Home', href: '#/' }, { label: 'Compare' }])}<h1>Compare</h1>${comparePicker()}`;
  }

  // Kept in step with build/prerender.js's /about body (see the note there). Three times today a
  // page was fixed in one document and not the other; this is the same page, not a variant.
  function aboutPage() {
    const c = D.meta.counts;
    const nP = (GRAPH.problems || []).length;
    const nR = (GRAPH.problems || []).reduce((n, p) => n + ((p.root_causes || []).length), 0);
    return `<div class="article">${crumbs([{ label: 'Home', href: '#/' }, { label: 'About' }])}<h1>About RNAwiki</h1>
      <div class="disclaimer"><strong>Not medical advice.</strong> Everything here is educational. Nothing on this site recommends taking any substance. Prescription, controlled and non-approved compounds are documented for completeness, and documenting something is not endorsing it. If you have a health problem, see a clinician. In an emergency, call your local emergency number — <b>999</b>, <b>911</b>, <b>112</b>, <b>995</b> or <b>000</b> depending on where you are — or go to an emergency department.</div>

      <h2>What is inside</h2>
      <p><strong>${c.compounds} compounds</strong> across <strong>${c.categories} categories</strong>, <strong>${nP} problems</strong> broken down into <strong>${nR} root-cause protocols</strong>, and ${(D.pathways || []).length} master pathways with their molecular targets. Free, no paywall, no account needed.</p>

      <h2>How to use this site — start here</h2>
      <p><strong>Start from what you want to change, not from a compound.</strong> That is the one instruction that matters. Searching "ashwagandha" tells you about a plant. Starting from "I can't fall asleep" tells you which of the several different things causing that you actually have — and the fix is different for each.</p>
      <ol class="about-steps">
        <li><strong>Name the problem or goal.</strong> Go to <a href="#/solve">Solve</a> and pick it.</li>
        <li><strong>Pick your root cause.</strong> Every problem lists 1–5. This is the step most health advice skips, and it is why most health advice fails: insomnia from a late body clock and insomnia from night-time cortisol need opposite interventions. If the description does not sound like you, open a sibling cause.</li>
        <li><strong>Read the protocol in order: Move → Fuel → Stack.</strong> That order is deliberate. Movement and food change more, more cheaply and more safely, than any supplement. The Stack is last because it should be.</li>
        <li><strong>Check "When to reassess or see a doctor" before you start.</strong> It is on every protocol page. Some things here are not self-treatable and the page will say so.</li>
        <li><strong>Follow the science down as far as you want.</strong> Each compound links to the <a href="#/pathways">pathway</a> it works through and the targets it acts on — learn one pathway and you have explained a whole family of compounds at once.</li>
      </ol>

      <h2>How to read the signals</h2>
      <ul class="about-key">
        <li><strong>★ Stars</strong> rate <em>human</em> evidence for a compound <em>overall</em> — not a grade for your goal, not a prediction for you. Animal-only evidence is capped at two stars and labelled. <a href="#/legend">Full key →</a></li>
        <li><strong>Badges</strong> say who <em>approved</em> a molecule. A badge is <em>not</em> a statement about where you can buy it.</li>
        <li><strong>Availability</strong> is shown separately, for Singapore.</li>
        <li><strong>Prescription medicines sit in a separate block</strong> headed "Medical options — discuss with a doctor". Never in the Stack, never ranked, never dosed here.</li>
        <li><strong>Where the evidence is thin or contested, the page says so.</strong> An unhedged claim is the thing to distrust.</li>
      </ul>

      <h2>What this site will not do</h2>
      <ul class="about-key">
        <li>It will not tell you what to buy, or name a brand to buy. Nothing is for sale; no affiliate links.</li>
        <li>It will not give doses for prescription medicines.</li>
        <li>It will not diagnose you. The root-cause quiz narrows your reading; it is not a clinical assessment.</li>
        <li>It will not pretend to certainty it does not have.</li>
      </ul>

      <h2>How it is made, and its limits</h2>
      <p>Pages are drafted with AI assistance and edited by a human. <strong>They are not reviewed by a clinician.</strong></p>
      <p><strong>Found something wrong?</strong> That is the most useful thing you can send. Errors here should be fixed rather than defended.</p>

      <h2>Where to go next</h2>
      <ul><li><a href="#/solve">Solve a problem or reach a goal</a></li><li><a href="#/az">Every compound, A–Z</a></li><li><a href="#/browse">Browse by category</a></li><li><a href="#/pathways">The master pathways</a></li><li><a href="#/newsletter">The weekly newsletter</a></li></ul>
    </div>`;
  }

  // ---------- /newsletter ----------
  // ADDED 2026-07-28. The prerendered page shipped without a matching SPA route, so a hard load of
  // /newsletter worked (curl 200) while CLICKING the footer link from anywhere inside the app fell
  // through route() to notFound(). Third instance today of the same class: build a prerendered page,
  // forget the hydrated twin. Rule of thumb — if prerender.js gains an add('/x'), app.js needs a
  // route for 'x' in the same commit.
  function nlForm(source, cta) {
    return `<form class="nl-form" data-nl data-source="${esc(source)}" novalidate>
      <label class="sr-only" for="nl-e-${esc(source)}">Your email address</label>
      <input id="nl-e-${esc(source)}" class="nl-input" type="email" name="email" required autocomplete="email" inputmode="email" placeholder="you@example.com">
      <input class="nl-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button class="nl-btn" type="submit">${esc(cta)}</button>
      <p class="nl-status" data-nl-status role="status" aria-live="polite"></p>
      <p class="nl-note">One email a week. Unsubscribe in one click. No spam, ever.</p>
    </form>`;
  }
  // newsletterPage() removed 2026-07-30 — the /newsletter route was folded into the home page
  // and this function had ZERO call sites (verified: one occurrence in the file, its own
  // definition). Its loss-framed copy lives on in the home newsletter block.
  function notFound() { return `<div class="empty"><h1>Not found</h1><p><a href="#/">← Home</a></p></div>`; }

  // ---------- contributors showcase ----------
  // ---------- public expert profile / portfolio (/u/:handle) ----------


  // ---------- admin: verify expert credentials ----------
  function adminLoading() { return `<div class="empty"><h1>Loading…</h1></div>`; }

  // The consolidated super-admin control room — every admin power in one place.
  // Gated to the single super-admin account (Felix); the server enforces this too.
  async function renderAdmin() {
    if (!canAdmin()) {
      app.innerHTML = `${crumbs([{ label: 'Home', href: '#/' }, { label: 'Admin' }])}<div class="empty"><h1>Super-admin only</h1><p class="muted">This control room is restricted to the site owner’s account.</p></div>`;
      return;
    }
    app.innerHTML = `${crumbs([{ label: 'Home', href: '#/' }, { label: 'Control room' }])}
      <div class="cr-head"><h1>Control Room</h1></div>
      <div class="cr-metrics" id="cr-metrics"></div>
      <div class="cr-seg" id="cr-seg">
        <button data-v="insights" class="on">📊 Data &amp; insights</button>
        <button data-v="operations">🗂 Operations</button>
      </div>
      <div id="cr-view" class="cr-view"></div>`;
    const nameOf = (pid, rcid) => { const p = GRAPH.problems.find(x => x.id === pid); const rc = resolveRc(p, rcid); return { pn: p ? p.name : pid, rn: rc ? rc.name.split('(')[0].trim() : rcid, icon: p ? (p.icon || '') : '' }; };
    let _oc = null; const getOutcomes = () => _oc || (_oc = api.adminOutcomes());
    async function loadMetrics() {
      const host = app.querySelector('#cr-metrics'); if (!host) return;
      let O = {}, members = 0;
      try { O = await getOutcomes(); } catch (e) {}
      try { const ov = await api.adminOverview(); members = ov.memberCount || (ov.members || []).length || 0; } catch (e) {}
      const t = O.totals || {};
      host.innerHTML = [['👥', members, 'members'], ['✅', t.consented || 0, 'consented'], ['📋', t.checkins || 0, 'check-ins'], ['🧬', t.protocols || 0, 'protocols with data']].map(m => `<div class="cr-metric"><span class="cr-m-n">${m[1]}</span><span class="cr-m-l">${m[0]} ${m[2]}</span></div>`).join('');
    }
    // ---- Dataset view: the outcome table + raw-data CSV export ----
    // ---- Insights view: high-value signals + research cuts ----
    function renderInsights() { app.querySelector('#cr-view').innerHTML = `<div id="adm-datasets"><div class="muted" style="padding:1rem 0">Loading datasets…</div></div>`; loadDatasets(); }
    function opsMenuHtml() {
      // GP-only model: all provider queues merged into GP/Clinics; feedback + requests merged.
      const OPS = [
        ['members', '👥', 'Members', 'Everyone who signed up — emails, join dates & roles'],
        ['gps', '🩺', 'Professional applications', 'Health professionals worldwide applying to contribute + clinics to feature'],
        ['feedback', '💬', 'Feedback & requests', 'Ideas, bug reports and features users asked for'],
        ['foods', '🥗', 'Food submissions', 'User-submitted foods awaiting your approval'],
      ];
      if (PHASE2) OPS.push(['edits', '✎', 'Pending edits', 'Proposed edits to compound pages'], ['rootcauses', '🧬', 'Root-cause changes', 'Proposed changes to protocol root causes']);
      return OPS.map((o, i) => `<button data-tab="${o[0]}" class="ops-item${i === 0 ? ' on' : ''}"><span class="ops-ico">${o[1]}</span><span class="ops-txt"><span class="ops-title">${esc(o[2])} <span class="adm-c" id="c-${o[0]}"></span></span><span class="ops-desc">${esc(o[3])}</span></span></button>`).join('');
    }
    // ---- Operations view: the action queues ----
    function renderOperations() {
      const view = app.querySelector('#cr-view');
      view.innerHTML = `<div class="cr-sec-h"><h2>Operations</h2><p class="muted">Pick an area to review — red badges are waiting on you.</p></div>
        <div class="ops-menu" id="adm-tabs">${opsMenuHtml()}</div>
        <div id="adm-body"><div class="muted" style="padding:2rem">Select an area above.</div></div>`;
      const tabs = view.querySelector('#adm-tabs');
      tabs.querySelectorAll('button').forEach(b => b.onclick = () => { tabs.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on'); paintAdmin(b.dataset.tab); });
      load();
    }
    function showView(v) { if (v === 'operations') renderOperations(); else renderInsights(); }
    const segEl = app.querySelector('#cr-seg');
    segEl.querySelectorAll('button').forEach(b => b.onclick = () => { segEl.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on'); showView(b.dataset.v); });
    let OV = null;
    const load = async () => { const bodyEl = app.querySelector('#adm-body'); try { OV = await api.adminOverview(); } catch (e) { if (bodyEl) bodyEl.innerHTML = `<div class="empty"><h1>${esc(e.message)}</h1></div>`; return; }
      // pending counts on the tab chips (GP-only: gps = clinician interest + expert apps + partners; feedback = feedback + open requests)
      const gpPending = (OV.experts.filter(e => e.application_status === 'pending').length) + (OV.partners.filter(p => p.status === 'pending').length) + ((OV.clinicians || []).length);
      const pend = { gps: gpPending, feedback: ((OV.feedback || []).length) + (OV.requests.filter(r => r.status === 'open').length), edits: (OV.proposals || []).length, rootcauses: OV.rootcauseChanges.filter(c => c.status === 'pending').length, foods: OV.foods.length };
      for (const k in pend) { const el = document.getElementById('c-' + k); if (el) el.textContent = pend[k] || ''; if (el) el.classList.toggle('hot', pend[k] > 0); }
      const cm = document.getElementById('c-members'); if (cm) cm.textContent = OV.memberCount || (OV.members || []).length || '';
      const active = app.querySelector('#adm-tabs button.on'); if (active) paintAdmin(active.dataset.tab);
    };
    const act = async (fn) => { try { await fn(); await load(); } catch (e) { alert(e.message); } };
    function paintAdmin(tab) {
      const body = app.querySelector('#adm-body'); if (!OV) return;
      if (tab === 'gps') {   // GP-only: interest (from /gp) + verified-badge applications + clinics to feature
        const ci = OV.clinicians || [];
        const ciRows = ci.length ? ci.map(c => `<tr><td>${esc(c.name)}<br><span class="muted" style="font-size:.8rem">${esc(c.email)}</span>${c.note ? `<br><span class="muted" style="font-size:.78rem">“${esc(c.note)}”</span>` : ''}</td><td>${esc(c.discipline || '—')}</td><td>${esc(c.country || '—')}</td><td>${esc(c.license_no || '—')}</td><td>${c.has_proof ? `<a class="admin-btn" href="/api/clinician-photo?id=${c.id}" target="_blank" rel="noopener">View proof↗</a>` : '<span class="muted">none</span>'}</td><td>${c.created_at ? esc(String(c.created_at).slice(0, 10)) : '—'}</td></tr>`).join('') : '<tr><td colspan="6" class="muted">No applications — the clinician recruitment page was removed on 2026-07-30.</td></tr>';
        const ex = OV.experts || [];
        const exRows = ex.length ? ex.map(e => { const status = e.domain_verified ? '✓ verified' : (e.application_status || 'none'); const actions = e.domain_verified ? `<button class="admin-btn" data-verify="${esc(e.username)}" data-to="0">Revoke</button>` : `<button class="admin-btn ok" data-verify="${esc(e.username)}" data-to="1">Approve</button> <button class="admin-btn" data-verify="${esc(e.username)}" data-to="0">Reject</button>`; return `<tr><td>@${esc(e.username)}</td><td>${esc(e.credential || '—')}${e.role_backlink ? ` · <a href="${esc(e.role_backlink)}" target="_blank" rel="noopener nofollow">backlink↗</a>` : ''}</td><td>${esc(status)}</td><td>${actions}</td></tr>`; }).join('') : '<tr><td colspan="4" class="muted">No badge applications.</td></tr>';
        const pt = OV.partners || [];
        const ptRows = pt.length ? pt.map(p => `<tr><td>${esc(p.name)}</td><td>${p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">site</a>` : '—'}${p.backlink_url ? ` · <a href="${esc(p.backlink_url)}" target="_blank" rel="noopener">backlink↗</a>` : ''}</td><td>${esc(p.status)}</td><td>${p.status !== 'active' ? `<button class="admin-btn ok" data-partner="${p.id}" data-to="active">Approve</button> ` : ''}${p.status !== 'rejected' ? `<button class="admin-btn" data-partner="${p.id}" data-to="rejected">Reject</button>` : ''}</td></tr>`).join('') : '<tr><td colspan="4" class="muted">No clinics listed yet.</td></tr>';
        body.innerHTML = `<p class="muted">Health professionals worldwide. <a class="admin-btn ok" href="/api/admin/export?type=clinicians" download>⤓ Export applications (CSV)</a></p>
          <h3 class="adm-sub-h">🩺 Contributor applications — from the /gp page</h3><div class="ao-table-wrap"><table class="board"><thead><tr><th>Name</th><th>Profession</th><th>Country</th><th>Licence no.</th><th>Proof</th><th>When</th></tr></thead><tbody>${ciRows}</tbody></table></div>
          <h3 class="adm-sub-h">✅ Verified-badge applications</h3><div class="ao-table-wrap"><table class="board"><thead><tr><th>User</th><th>Credential</th><th>Status</th><th></th></tr></thead><tbody>${exRows}</tbody></table></div>
          <h3 class="adm-sub-h">🏥 Clinics to feature</h3><div class="ao-table-wrap"><table class="board"><thead><tr><th>Clinic</th><th>Links</th><th>Status</th><th></th></tr></thead><tbody>${ptRows}</tbody></table></div>`;
        body.querySelectorAll('[data-verify]').forEach(b => b.onclick = () => act(() => api.adminVerify(b.dataset.verify, b.dataset.to === '1')));
        body.querySelectorAll('[data-partner]').forEach(b => b.onclick = () => act(() => api.adminSetPartner(b.dataset.partner, b.dataset.to)));
      } else if (tab === 'accounts') {
        const rows = OV.experts.length ? OV.experts.map(e => {
          const dom = e.domain || e.requested_domain; const label = (GRAPH.domains[dom] || {}).label || dom || '—';
          const status = e.domain_verified ? '✓ verified' : (e.application_status || 'none');
          const actions = e.domain_verified
            ? `<button class="admin-btn" data-verify="${esc(e.username)}" data-to="0">Revoke</button>`
            : `<button class="admin-btn ok" data-verify="${esc(e.username)}" data-to="1">Approve</button> <button class="admin-btn" data-verify="${esc(e.username)}" data-to="0">Reject</button>`;
          return `<tr><td>@${esc(e.username)}</td><td>${esc(label)}${e.requested_domain && !e.domain_verified ? ' <em>(requested)</em>' : ''}</td><td>${esc(e.credential || '—')}${e.role_backlink ? ` · <a href="${esc(e.role_backlink)}" target="_blank" rel="noopener nofollow">backlink↗</a>` : ''}</td><td>${esc(status)}</td><td>${actions}</td></tr>`;
        }).join('') : '<tr><td colspan="5" class="muted">No role applications yet.</td></tr>';
        body.innerHTML = `<p class="muted">Open the backlink and confirm the credential before approving. Only your account can do this.</p>
          <table class="board"><thead><tr><th>User</th><th>Domain</th><th>Stated credential</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
        body.querySelectorAll('[data-verify]').forEach(b => b.onclick = () => act(() => api.adminVerify(b.dataset.verify, b.dataset.to === '1')));
      } else if (tab === 'members') {
        const ms = OV.members || [];
        const rows = ms.length ? ms.map(m => `<tr><td>${esc(m.email || '—')}</td><td>@${esc(m.username)}</td><td>${m.created_at ? esc(String(m.created_at).slice(0, 10)) : '—'}</td><td>${m.domain ? esc(m.domain) + (m.domain_verified ? ' ✓' : '') : (m.role === 'admin' ? 'admin' : 'member')}</td><td>✦ ${m.reputation_points || 0}</td></tr>`).join('') : '<tr><td colspan="5" class="muted">No members yet.</td></tr>';
        body.innerHTML = `<p class="muted">Everyone who signed up. <b>${OV.memberCount || ms.length}</b> total${ms.length >= 500 ? ' (showing latest 500 — export for the full list)' : ''}. <a class="admin-btn ok" href="/api/admin/export?type=members" download>⤓ Export all as CSV</a></p>
          <table class="board"><thead><tr><th>Email</th><th>User</th><th>Joined</th><th>Role</th><th>Rep</th></tr></thead><tbody>${rows}</tbody></table>`;
      } else if (tab === 'clinicians') {
        const cs = OV.clinicians || [];
        const rows = cs.length ? cs.map(c => `<tr><td>${esc(c.name)}</td><td>${esc(c.email)}</td><td>${esc(c.discipline || '—')}</td><td>${esc(c.note || '—')}</td><td>${c.created_at ? esc(String(c.created_at).slice(0, 10)) : '—'}</td></tr>`).join('') : '<tr><td colspan="5" class="muted">No clinician sign-ups yet. Share the “For clinicians” page to start the founding list.</td></tr>';
        body.innerHTML = `<p class="muted">Founding-clinician waitlist — <b>${cs.length}</b> so far. <a class="admin-btn ok" href="/api/admin/export?type=clinicians" download>⤓ Export as CSV</a></p>
          <table class="board"><thead><tr><th>Name</th><th>Email</th><th>Discipline</th><th>Would improve first</th><th>Joined</th></tr></thead><tbody>${rows}</tbody></table>`;
      // W3.5 (2026-08-02) — the copy in these two queues described a verified-expert review
      // programme in the present tense ("A verified expert edits a section directly"; "An expert
      // requests a change … A second relevant expert reviews and approves it"). Both tabs are
      // pushed onto OPS only when PHASE2 is true, and PHASE2 is false — so the wording was a
      // description of a programme that has never existed, sitting in the console of the one
      // person who would have had to build it. The plumbing is kept, because Phase 2 may still
      // ship; the claim is not, because the copy for a real programme should be written against
      // a real programme. Same rule as the corpus: state what is, never what would be.
      } else if (tab === 'edits') {
        const props = OV.proposals || [];
        const layerLabel = { move: '🏃 Move', fuel: '🥗 Fuel', stack: '💊 Stack' };
        const rows = props.length ? props.map(p => {
          const prob = (GRAPH.problems.find(x => x.id === p.problem_id) || {}).name || p.problem_id;
          return `<tr><td><span class="rcc-act add">${esc(layerLabel[p.layer] || p.layer)}</span></td>
            <td><b>${esc(prob)}</b>${p.change ? `<div class="rcc-why">${esc(p.change)}</div>` : ''}${p.evidence ? `<div class="muted" style="font-size:.8rem">Evidence: ${esc(p.evidence)}</div>` : ''}</td>
            <td><small>${esc((GRAPH.domains[p.domain] || {}).label || p.domain || '—')}</small></td>
            <td>${p.endorsements || 0} · ${p.by_user ? '@' + esc(p.by_user) : '—'}</td>
            <td><button class="admin-btn ok" data-endorse="${p.id}">Approve &amp; publish</button> <button class="admin-btn" data-reject="${p.id}">Reject</button></td></tr>`;
        }).join('') : '<tr><td colspan="5" class="muted">Nothing here, and nothing can arrive: section editing is Phase 2 and is not launched.</td></tr>';
        const ce = OV.compoundEdits || [];
        const ceHtml = ce.length ? `<h3 style="margin:1.5rem 0 .5rem">Recent compound edits</h3><table class="board"><thead><tr><th>Compound</th><th>Note</th><th>By</th></tr></thead><tbody>${ce.map(e => `<tr><td><b>${esc(e.compound_name || e.compound_id)}</b></td><td>${esc(e.note || '—')}</td><td>@${esc(e.by_user)}</td></tr>`).join('')}</tbody></table>` : '';
        body.innerHTML = `<p class="muted">This queue is plumbing for Phase 2, which is not launched (PHASE2 = false, so this tab is not even offered). No account can edit a section today and nobody has been through any verification, so nothing can land here. <b>Approve &amp; publish</b> makes a row public; <b>Reject</b> removes it. Who may edit and who may approve gets written when there is a real answer.</p>
          <table class="board"><thead><tr><th>Section</th><th>Problem · proposed change</th><th>Domain</th><th>Endorse · by</th><th></th></tr></thead><tbody>${rows}</tbody></table>${ceHtml}`;
        body.querySelectorAll('[data-endorse]').forEach(b => b.onclick = () => act(() => api.endorse(b.dataset.endorse)));
        body.querySelectorAll('[data-reject]').forEach(b => b.onclick = () => act(() => api.flag(b.dataset.reject, 'Rejected by admin')));
      } else if (tab === 'rootcauses') {
        const rows = OV.rootcauseChanges.length ? OV.rootcauseChanges.map(c => {
          const prob = (GRAPH.problems.find(p => p.id === c.problem_id) || {}).name || c.problem_id;
          const panel = (c.domains || []).map(d => (GRAPH.domains[d] || {}).label || d).join(', ') || 'any expert';
          const awaiting = c.status === 'pending' || c.status === 'peer_approved';
          const statusLabel = { pending: '⏳ awaiting a peer', peer_approved: '✅ peer-approved · awaiting you', approved: '🟢 live', rejected: '✖ rejected' }[c.status] || c.status;
          const actions = awaiting ? `<button class="admin-btn ok" data-rcc="${c.id}" data-to="approved">Approve &amp; publish</button> <button class="admin-btn" data-rcc="${c.id}" data-to="rejected">Reject</button>` : `<button class="admin-btn" data-rcc="${c.id}" data-to="pending">Reopen</button>`;
          return `<tr><td><span class="rcc-act ${c.action}">${c.action === 'add' ? '➕ add' : '➖ remove'}</span></td>
            <td><b>${esc(c.action === 'add' ? (c.name || c.root_cause_id) : c.root_cause_id)}</b><small class="muted"> in ${esc(prob)}</small>${c.rationale ? `<div class="rcc-why">${esc(c.rationale)}</div>` : ''}${c.diagnostic ? `<div class="muted" style="font-size:.8rem">“${esc(c.diagnostic)}”</div>` : ''}</td>
            <td><small>${esc(panel)}</small></td>
            <td>${c.endorsements}/${OV.threshold} · ${c.by_user ? '@' + esc(c.by_user) : '—'}</td>
            <td>${statusLabel}</td><td>${actions}</td></tr>`;
        }).join('') : '<tr><td colspan="6" class="muted">No root-cause changes proposed yet.</td></tr>';
        body.innerHTML = `<p class="muted">This queue is plumbing for Phase 2, which is not launched (PHASE2 = false, so this tab is not even offered). Nothing can be proposed here today. A row that did arrive would still need <b>your final approval</b> before it went live.</p>
          <table class="board"><thead><tr><th>Change</th><th>Root cause</th><th>Panel</th><th>Endorse · by</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
        body.querySelectorAll('[data-rcc]').forEach(b => b.onclick = () => act(() => api.setRootcauseChange(b.dataset.rcc, b.dataset.to)));
      } else if (tab === 'requests') {
        const rows = OV.requests.length ? OV.requests.map(r => `<tr><td><b>${esc(r.request)}</b>${r.detail ? `<div class="muted" style="font-size:.82rem">${esc(r.detail)}</div>` : ''}</td><td>▲ ${r.votes}</td><td>${esc(r.status)}</td>
          <td>${['open', 'building', 'done', 'declined'].filter(s => s !== r.status).map(s => `<button class="admin-btn${s === 'building' ? ' ok' : ''}" data-req="${r.id}" data-to="${s}">${s}</button>`).join(' ')}</td></tr>`).join('') : '<tr><td colspan="4" class="muted">No protocol requests yet.</td></tr>';
        body.innerHTML = `<p class="muted">What people want built, ranked by upvotes. Mark one “building” when an expert picks it up, or “done” once the protocol exists.</p>
          <table class="board"><thead><tr><th>Request</th><th>Votes</th><th>Status</th><th>Set</th></tr></thead><tbody>${rows}</tbody></table>`;
        body.querySelectorAll('[data-req]').forEach(b => b.onclick = () => act(() => api.setRequestStatus(b.dataset.req, b.dataset.to)));
      } else if (tab === 'partners') {
        const rows = OV.partners.length ? OV.partners.map(p => `<tr><td>${esc(p.name)}</td><td>${esc(p.type || '—')} · ${esc(p.serves || '—')}</td><td><a href="${esc(p.link || '#')}" target="_blank" rel="noopener">site</a> · <a href="${esc(p.backlink_url || '#')}" target="_blank" rel="noopener">backlink↗</a></td><td>${esc(p.status)}</td><td>${p.status !== 'active' ? `<button class="admin-btn ok" data-partner="${p.id}" data-to="active">Approve</button> ` : ''}${p.status !== 'rejected' ? `<button class="admin-btn" data-partner="${p.id}" data-to="rejected">Reject</button>` : ''}</td></tr>`).join('') : '<tr><td colspan="5" class="muted">No partner submissions yet.</td></tr>';
        body.innerHTML = `<p class="muted">Confirm each backlink page links to rnawiki.com before approving.</p>
          <table class="board"><thead><tr><th>Business</th><th>Type · Serves</th><th>Links</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
        body.querySelectorAll('[data-partner]').forEach(b => b.onclick = () => act(() => api.adminSetPartner(b.dataset.partner, b.dataset.to)));
      } else if (tab === 'foods') {
        const rows = OV.foods.length ? OV.foods.map(f => { const d = f.data || {}; return `<tr><td><b>${esc(f.name)}</b>${f.serving ? `<small class="muted"> · ${esc(f.serving)}</small>` : ''}<div class="muted" style="font-size:.8rem">${['kcal', 'protein_g', 'carbs_g', 'fat_g'].filter(k => d[k] != null).map(k => k.replace('_g', '') + ' ' + d[k]).join(' · ')}</div></td><td>${f.by_user ? '@' + esc(f.by_user) : '—'}</td><td><button class="admin-btn ok" data-food="${f.id}" data-to="active">Approve</button> <button class="admin-btn" data-food="${f.id}" data-to="rejected">Reject</button></td></tr>`; }).join('') : '<tr><td colspan="3" class="muted">No foods waiting — the queue is clear.</td></tr>';
        body.innerHTML = `<p class="muted">Crowd-submitted foods awaiting a nutrition check. Dietitians can also clear these from their dashboard.</p>
          <table class="board"><thead><tr><th>Food</th><th>By</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
        body.querySelectorAll('[data-food]').forEach(b => b.onclick = () => act(() => api.verifyFood(b.dataset.food, b.dataset.to)));
      } else if (tab === 'feedback') {   // merged: feature/protocol requests + all feedback types
        const fb = OV.feedback || [];
        const ico = { idea: '💡', wrong: '⚠️', other: '💬' }; const klbl = { idea: 'Idea / suggestion', wrong: 'Something wrong', other: 'Something else' };
        const rows = fb.length ? fb.map(f => `<tr><td><span class="fb-type">${ico[f.kind] || '💬'} ${esc(klbl[f.kind] || 'Feedback')}</span></td><td><div>${esc(f.body)}</div>${f.page ? `<small class="muted">on ${esc(f.page)}</small>` : ''}${f.contact ? `<small class="muted"> · ${esc(f.contact)}</small>` : ''}</td><td>${f.by_user ? '@' + esc(f.by_user) : 'guest'}</td><td><button class="admin-btn ok" data-fb="${f.id}" data-to="done">Done</button> <button class="admin-btn" data-fb="${f.id}" data-to="archived">Archive</button></td></tr>`).join('') : '<tr><td colspan="4" class="muted">No open feedback. 🎉</td></tr>';
        const reqRows = OV.requests.length ? OV.requests.map(r => `<tr><td><b>${esc(r.request)}</b>${r.detail ? `<div class="muted" style="font-size:.82rem">${esc(r.detail)}</div>` : ''}</td><td>▲ ${r.votes}</td><td>${esc(r.status)}</td><td>${['open', 'building', 'done', 'declined'].filter(s => s !== r.status).map(s => `<button class="admin-btn${s === 'building' ? ' ok' : ''}" data-req="${r.id}" data-to="${s}">${s}</button>`).join(' ')}</td></tr>`).join('') : '<tr><td colspan="4" class="muted">No requests yet.</td></tr>';
        body.innerHTML = `<h3 class="adm-sub-h">💡 Requests — what people want built (ranked by upvotes)</h3><div class="ao-table-wrap"><table class="board"><thead><tr><th>Request</th><th>Votes</th><th>Status</th><th>Set</th></tr></thead><tbody>${reqRows}</tbody></table></div>
          <h3 class="adm-sub-h">💬 Feedback — ideas, bug reports &amp; other</h3><div class="ao-table-wrap"><table class="board"><thead><tr><th>Type</th><th>Feedback</th><th>By</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
        body.querySelectorAll('[data-req]').forEach(b => b.onclick = () => act(() => api.setRequestStatus(b.dataset.req, b.dataset.to)));
        body.querySelectorAll('[data-fb]').forEach(b => b.onclick = () => act(() => api.setFeedback(b.dataset.fb, b.dataset.to)));
      }
    }
    // One clean, self-explanatory card per data asset: what it is · who it's for · why it's valuable · how it's collected · live number.
    async function loadDatasets() {
      const host = document.getElementById('adm-datasets'); if (!host) return;
      let S = {}, R = {}, O = {};
      try { S = await api.adminSignals(); } catch (e) {}
      try { R = await api.adminResearch(); } catch (e) {}
      try { O = await getOutcomes(); } catch (e) {}
      const nm = (pid, rcid) => { const p = GRAPH.problems.find(x => x.id === pid); const rc = resolveRc(p, rcid); return { pn: p ? p.name : pid, rn: rc ? rc.name.split('(')[0].trim() : rcid, icon: p ? (p.icon || '') : '' }; };
      // outcomes-by-protocol table (folded in from the old Dataset tab)
      const oRows = (O.rows || []).map(r => { const o = nm(r.pid, r.rcid); const p30 = r.d30_n ? Math.round(r.d30_imp / r.d30_n * 100) : null, p90 = r.d90_n ? Math.round(r.d90_imp / r.d90_n * 100) : null; const dlt = r.symptom_delta;
        return `<tr><td>${o.icon} <b>${esc(o.pn)}</b> <span class="muted">${esc(o.rn)}</span></td><td>${r.baseline_n}</td><td>${r.d30_n}${p30 != null ? ` · <b>${p30}%</b>↑` : ''}</td><td>${r.d90_n}${p90 != null ? ` · <b>${p90}%</b>↑` : ''}</td><td>${dlt != null ? (dlt > 0 ? '▼ ' + dlt : dlt < 0 ? '▲ ' + Math.abs(dlt) : '0') + ' pts' : '—'}</td><td>${r.avg_adh != null ? r.avg_adh + '%' : '—'}</td></tr>`;
      }).join('') || '<tr><td colspan="6" class="muted">No outcome data yet — it accrues as users complete their 30- and 90-day check-ins.</td></tr>';
      const outcomeTable = `<div class="cr-sec-h"><h2>Outcomes by protocol</h2></div><div class="ao-table-wrap" style="margin-bottom:1.6rem"><table class="board"><thead><tr><th>Protocol</th><th>Baseline</th><th>30-day</th><th>90-day</th><th>Symptom Δ</th><th>Adherence</th></tr></thead><tbody>${oRows}</tbody></table></div>`;
      const nameP = pid => { const p = GRAPH.problems.find(x => x.id === pid); return p ? p.name : pid; };
      const pct = (b, n) => n ? Math.round(b / n * 100) : 0;
      const STOP_LBL = { didnt_work: "wasn't working", side_effects: 'side effects', too_hard: 'too hard to keep up', cost: 'cost', got_better: 'got better', other: 'other' };
      const EXTRA_LBL = { mood_freq: 'Mood / anxiety / focus', sleep_quality: 'Sleep quality', vitality: 'Energy / libido', pain_interference: 'Pain interference' };
      const DIM_LBL = { age: 'Age', sex: 'Sex', ethnicity: 'Ethnicity' };
      const none = t => `<span class="ds-empty">${t}</span>`;
      const pills = arr => `<div class="sig-pills">${arr.join('')}</div>`;
      // --- live stat per dataset ---
      const stopN = (S.stopReasons || []).reduce((a, x) => a + x.n, 0);
      const statStop = () => stopN ? `<div class="ds-big">${stopN}</div><div class="ds-sub">discontinuations · ${(S.stopReasons || []).map(x => `${x.n} ${esc(STOP_LBL[x.stop_reason] || x.stop_reason)}`).join(' · ')}</div>` : none('No one has stopped yet — fills as users report.');
      const sfx = S.sideFx || {}; const adv = R.adverseByCompound || [];
      const statAdverse = () => (sfx.n ? `<div class="ds-big">${sfx.n}</div><div class="ds-sub">reports from ${sfx.users || 0} users</div>` + (adv.length ? pills(adv.slice(0, 8).map(x => `<span class="sig-pill">${esc(x.compound)}${x.isRx ? ' ℞' : ''} <b>${x.n}</b></span>`)) : '') : none('No side-effects reported yet.'));
      const bio = (R.biomarkerDeltas || []).filter(x => x.users >= 1);
      const statBio = () => bio.length ? `<ul class="ds-list">${bio.map(x => { const d = +x.avg_delta; const dir = d < 0 ? `<b style="color:var(--accent)">▼ ${Math.abs(d)}</b>` : d > 0 ? `<b>▲ ${d}</b>` : '→'; return `<li>${esc(MARKER_LABEL[x.marker] || x.marker)} ${dir} <span class="muted">(${x.users}${x.users === 1 ? ' person' : ' ppl'})</span></li>`; }).join('')}</ul>` : none('Needs 2+ readings of a marker per user — the re-lab prompt drives this.');
      const ph = R.phenotype || []; const dims = {}; ph.forEach(r => { (dims[r.dim] = dims[r.dim] || []).push(r); });
      const statPheno = () => { const blocks = Object.keys(dims).map(dim => `<div class="ds-phrow"><span class="ds-phk">${DIM_LBL[dim] || dim}</span> ${dims[dim].map(r => `${esc(r.k)} <b>${pct(r.better, r.n)}%</b>`).join(' · ')}</div>`).join(''); const cond = (R.byCondition || []).length ? `<div class="ds-phrow"><span class="ds-phk">Condition</span> ${(R.byCondition).map(r => `${esc(r.k)} <b>${pct(r.better, r.n)}%</b>`).join(' · ')}</div>` : ''; return (blocks || cond) ? blocks + cond : none('Needs demographics + follow-up check-ins.'); };
      const w = S.whtr || {};
      const statWhtr = () => w.n ? `<div class="ds-big">${w.avg_whtr}</div><div class="ds-sub">avg waist-to-height · ${w.at_risk}/${w.n} at metabolic risk (≥0.5)</div>` : none(`${S.waistN || 0} waist logs — needs height + waist to compute risk.`);
      const statMeds = () => (S.topMeds || []).length ? `<div class="ds-sub"><b>${S.medsUsers || 0}</b> users reported concurrent treatments</div>${pills((S.topMeds).slice(0, 10).map(x => `<span class="sig-pill">${esc(x.med)} <b>${x.n}</b></span>`))}` : none('No concurrent treatments reported yet.');
      const statExtra = () => (S.extras || []).length ? `<ul class="ds-list">${(S.extras).map(x => `<li>${esc(EXTRA_LBL[x.key] || x.key)}: avg <b>${x.avg}</b> <span class="muted">(n=${x.n})</span></li>`).join('')}</ul>` : none('Fills as users answer the per-condition item at check-in.');
      const neg = (R.negativeResults || []).filter(x => x.didnt_work > 0 || x.no_improve > 0);
      const statNeg = () => neg.length ? `<ul class="ds-list">${neg.slice(0, 6).map(x => { const o = nm(x.pid, x.rcid); return `<li>${o.icon} ${esc(o.pn)} <span class="muted">— ${x.didnt_work} quit, ${x.no_improve} no gain (n=${x.n})</span></li>`; }).join('')}</ul>` : none('Fills as follow-ups come in — the failures matter as much as the wins.');
      const EXP_LBL = { checkins: 'Check-ins + demographics', markers: 'Blood markers', wearables: 'Wearables' };
      const extractBtn = exp => `<a class="admin-btn ok" href="/api/admin/export?type=${exp}" download>⤓ Extract ${EXP_LBL[exp]} (CSV)</a>`;
      const DATASETS = [
        { icon: '📉', title: 'Persistence — why people quit', who: 'Pharma & digital-health retention teams', why: 'The #1 thing the health system never sees: why people abandon a treatment.', how: 'One tap in the check-in when a user marks they’ve stopped.', stat: statStop, exp: 'checkins' },
        { icon: '⚠️', title: 'Adverse events by compound', who: 'Drug-safety / HSA · supplement brands', why: 'Real-world side-effects — including compounds with zero official monitoring (peptides, longevity drugs).', how: 'One-tap “I had side effects” at check-in, linked to the user’s stack.', stat: statAdverse, exp: 'checkins' },
        { icon: '🩸', title: 'Biomarker before → after', who: 'Pharma real-world-evidence · longevity clinics', why: 'Within-person proof an intervention actually moved a lab value — what buyers pay most for.', how: 'Blood markers over time + a re-lab prompt in the health tracker.', stat: statBio, exp: 'markers' },
        { icon: '🧑‍🤝‍🧑', title: 'Who responds (phenotypes)', who: 'Pharma precision-medicine teams', why: '“Which kind of person responds to what” — medicine’s single most valuable question.', how: 'Age/sex/ethnicity/condition (from sign-up) × outcome check-ins.', stat: statPheno, exp: 'checkins' },
        { icon: '📏', title: 'Metabolic risk', who: 'Insurers · Healthier SG · weight-loss cos', why: 'Waist-to-height is the cheapest, best at-home predictor of diabetes & heart risk.', how: 'Waist + height in the health tracker.', stat: statWhtr, exp: 'wearables' },
        { icon: '💊', title: 'Concurrent treatments', who: 'Pharma (interactions) · HSA', why: 'What else people take — incl. GLP-1s & TRT — for interaction & real-world combination data.', how: '“Anything else you take regularly?” in the profile.', stat: statMeds, exp: 'checkins' },
        { icon: '📊', title: 'Condition-specific outcomes', who: 'Condition-focused brands & researchers', why: 'A standardized symptom signal per condition, comparable across users.', how: 'One quick self-report item at check-in, matched to the protocol.', stat: statExtra, exp: 'checkins' },
        { icon: '🚫', title: 'What’s NOT working', who: 'Everyone — saves wasted spend', why: 'Failures are invisible in published research; knowing what to skip is rare.', how: 'Outcome check-ins flagging no improvement / “didn’t work”.', stat: statNeg, exp: 'checkins' },
      ];
      const nd = S.nudges || {};
      const nudgeLine = `<p class="ds-nudge">📬 <b>${nd.due || 0}</b> check-ins due now · nudge email ${nd.emailConfigured ? `<b style="color:var(--accent)">on</b> (${nd.sent || 0} sent)` : '<b>off</b>'}.</p>`;
      host.innerHTML = `${outcomeTable}
        <div class="cr-sec-h"><h2>Your data assets</h2><p class="muted">Each card is one dataset — <b>what</b> it is, <b>who</b> it’s for, <b>why</b> it’s valuable, <b>how</b> it’s collected. Tap a card to open it full-screen and extract the raw data.</p></div>
        ${nudgeLine}
        <div class="ds-grid">${DATASETS.map((d, i) => `
          <button class="ds-card" data-ds="${i}">
            <div class="ds-head"><span class="ds-ico">${d.icon}</span><h4>${esc(d.title)}</h4><span class="ds-expand">⤢</span></div>
            <div class="ds-stat">${d.stat()}</div>
            <dl class="ds-meta">
              <div><dt>For</dt><dd>${esc(d.who)}</dd></div>
              <div><dt>Why</dt><dd>${esc(d.why)}</dd></div>
              <div><dt>How</dt><dd>${esc(d.how)}</dd></div>
            </dl>
          </button>`).join('')}</div>`;
      host.querySelectorAll('[data-ds]').forEach(b => b.onclick = () => {
        const d = DATASETS[+b.dataset.ds];
        modal(`<button class="modal-x" data-close aria-label="Close">✕</button>
          <div class="dsm-head"><span class="dsm-ico">${d.icon}</span><h2>${esc(d.title)}</h2></div>
          <div class="dsm-stat">${d.stat()}</div>
          <dl class="dsm-meta">
            <div><dt>Who it's for</dt><dd>${esc(d.who)}</dd></div>
            <div><dt>Why it's valuable</dt><dd>${esc(d.why)}</dd></div>
            <div><dt>How it's collected</dt><dd>${esc(d.how)}</dd></div>
          </dl>
          <div class="dsm-actions">${extractBtn(d.exp)}</div>`).querySelector('[data-close]').onclick = closeModal;
      });
    }
    loadMetrics();
    showView('insights');
  }

  // ---------- analytics (W1) — see docs/EVENT_SCHEMA.md ----------
  // That document is the spec, this is the implementation, and build/parse.js fails the build if
  // they disagree. Read it before adding an event.
  //
  // WHY THIS IS NOT A THIRD-PARTY <script> TAG. GoatCounter's own count.js builds its payload in
  // get_data(): `p` (path), `r` (referrer) and `t` (title) are all overridable, but `q:
  // location.search` is set unconditionally with NO hook, and get_path() returns
  // `loc.pathname + loc.search`. On this site all four channels carry a health disclosure: the home
  // hero is a real <form action="/solve" method="get" name="q">, so /solve?q=<the reader's own
  // words> is a URL the site's own primary CTA generates; titles read "Bremelanotide (PT-141):
  // dosage, evidence…"; and a same-origin document.referrer is the full previous URL. There is no
  // configuration of count.js that withholds them. So we call the endpoint ourselves and send only
  // what is in the vocabulary below.
  //
  // TRANSPORT is an <img> GET, which the existing CSP `img-src 'self' data: https:` already
  // permits — this install needs no CSP change and adds no script origin. Do NOT "upgrade" it to
  // navigator.sendBeacon without first adding the host to connect-src: sendBeacon is governed by
  // connect-src, would be blocked, and would fail silently (the exact way Cloudflare Web Analytics
  // and the PubChem fetch both failed before — see the CSP comments in server.js).
  const A_CODE = null; // ← set to the GoatCounter site code (e.g. 'rnawiki') to switch this on. null = fully inert.
  // ALLOWLIST, not blocklist. Verbatim paths are only the routes that encode no health interest.
  // A route template added tomorrow and forgotten here fails CLOSED to /t/other; it can never leak
  // a health-encoding URL by omission.
  const A_PUBLIC = ['/', '/about', '/anatomy', '/az', '/body', '/browse', '/compare', '/corrections',
    '/learn', '/legend', '/methodology', '/pathways', '/plan', '/solve', '/stack', '/where'];
  const A_TPL = {
    c: 'compound', compare: 'compare-pair', target: 'target', pathway: 'pathway',
    protocol: 'protocol', clinic: 'protocol', problem: 'problem', goal: 'goal', muscle: 'muscle',
    learn: 'learn-module', energy: 'energy', physiology: 'physiology', body: 'body-region',
    fuel: 'fuel', exercise: 'exercise', fork: 'fork', progress: 'progress', s: 'shared-plan',
    admin: 'admin',
  };
  const A_TPLV = Object.keys(A_TPL).map(k => A_TPL[k]).concat('other');
  // Search-result kinds, mapped from the index's own `kind` strings to the closed vocabulary.
  const A_KIND = {
    Compound: 'compound', Target: 'target', Pathway: 'pathway', Learn: 'learn-module',
    Muscle: 'muscle', 'Energy system': 'energy', Physiology: 'physiology', Protocol: 'protocol',
  };
  // Every event REQUIRES a suffix drawn from a closed array. ev() fails shut on anything else, so
  // "a compound name can never be sent" is a property of this data structure, not a promise.
  const A_EVENTS = {
    'search-issued': ['hit', 'miss'],
    'search-chosen': A_TPLV,
    'citation-outbound': ['pubmed', 'pmc', 'ncbi', 'pubchem', 'fda', 'other'],
  };
  function aTemplate(parts) {
    const p = '/' + (parts || []).join('/');
    if (A_PUBLIC.indexOf(p) >= 0) return p;
    if (!parts || !parts.length) return '/';
    return '/t/' + (A_TPL[parts[0]] || 'other');
  }
  function aRef() {
    // Only the ORIGIN of an EXTERNAL referrer. A same-origin referrer is the reader's previous
    // RNAwiki URL — exactly the health disclosure this module exists to withhold. An external
    // referrer's PATH is dropped too: a link from a forum thread whose URL names a condition
    // discloses the reader's health state just as effectively as our own URL would.
    try {
      if (!document.referrer) return '';
      const u = new URL(document.referrer);
      if (u.host === location.host) return '';
      return '&r=' + encodeURIComponent(u.origin);
    } catch (e) { return ''; }
  }
  function aSend(p, isEvent) {
    if (!A_CODE) return;
    if (navigator.webdriver) return;              // headless Chrome / the QA harness must not move the counts
    try {
      new Image().src = 'https://' + A_CODE + '.goatcounter.com/count'
        + '?p=' + encodeURIComponent(p)
        + '&t=' + encodeURIComponent(p)           // the template name, NEVER document.title
        + (isEvent ? '&e=1' : '')
        + '&s=' + ((window.screen && screen.width) || 0)
        + '&rnd=' + Date.now()
        + aRef();
    } catch (e) { }
  }
  const RNA_A = {
    pv(parts) { aSend(aTemplate(parts), false); },
    ev(name, suffix) {
      const allowed = A_EVENTS[name];
      if (!allowed || allowed.indexOf(String(suffix)) < 0) return;  // closed vocabulary, fails shut
      aSend('e/' + name + '/' + suffix, true);
    },
  };
  // ONE delegated listener for outbound citation clicks. app.js emits PubMed links from many
  // target="_blank" rel="noopener" call sites; a listener cannot drift the way N edits can, and
  // because those links open a new tab the page is not unloaded, so an Image() beacon completes.
  // Only the HOST CLASS travels. The PMID is withheld: a paper identifies a condition.
  document.addEventListener('click', e => {
    const a = e.target && e.target.closest && e.target.closest('a[href^="http"]');
    if (!a) return;
    let h; try { h = new URL(a.href).host; } catch (err) { return; }
    if (h === location.host) return;
    RNA_A.ev('citation-outbound',
      /pubmed\.ncbi/.test(h) ? 'pubmed' : /pmc\.ncbi/.test(h) ? 'pmc'
        : /pubchem/.test(h) ? 'pubchem' : /ncbi/.test(h) ? 'ncbi'
          : /fda\.gov/.test(h) ? 'fda' : 'other');
  }, true);

  // ---------- search ----------
  const searchBox = document.getElementById('search');
  const searchOut = document.getElementById('search-results');
  const index = [
    ...D.compounds.map(c => ({ kind: 'Compound', title: c.name, sub: c.category, href: '#/c/' + slug(c.name), hay: (c.name + ' ' + c.goals.join(' ') + ' ' + c.mechanism + ' ' + c.plain + ' ' + (c.targets || []).map(t => t.sym).join(' ')).toLowerCase() })),
    ...(D.targets || []).map(t => ({ kind: 'Target', title: t.sym, sub: t.name + ' · ' + t.compoundIds.length + ' compounds', href: '#/target/' + tkey(t.sym), hay: (t.sym + ' ' + t.name).toLowerCase() })),
    ...D.pathways.map((p, i) => ({ kind: 'Pathway', title: p.shortLabel, sub: 'Master pathway', href: '#/pathway/' + i, hay: p.title.toLowerCase() + ' ' + p.html.toLowerCase() })),
    ...D.modules.map((m, i) => ({ kind: 'Learn', title: stripNum(m.title), sub: 'Foundations', href: '#/learn/' + i, hay: m.title.toLowerCase() + ' ' + m.html.toLowerCase() })),
    ...(ANAT.muscles || []).map(m => ({ kind: 'Muscle', title: m.name, sub: m.region, href: '#/muscle/' + m.id, hay: (m.name + ' ' + (m.aka || []).join(' ') + ' ' + m.group + ' ' + m.overview + ' ' + (m.common_problems || []).join(' ')).toLowerCase() })),
    ...(ANAT.energy_systems || []).map(e => ({ kind: 'Energy system', title: e.name.split('(')[0].trim(), sub: e.duration, href: '#/energy/' + e.id, hay: (e.name + ' ' + (e.aka || []).join(' ') + ' ' + e.overview).toLowerCase() })),
    ...(ANAT.metabolism || []).map(p => ({ kind: 'Physiology', title: p.name, sub: 'Metabolism', href: '#/physiology/' + p.id, hay: (p.name + ' ' + p.overview + ' ' + (p.plain || '')).toLowerCase() })),
    ...(D.graph.problems || []).map(p => ({ kind: 'Protocol', title: p.name, sub: p.category + ' · ' + (p.kind === 'want' ? 'goal' : 'problem'), href: '#/protocol/' + p.id + '/' + p.root_causes[0].id, hay: (p.name + ' ' + p.category + ' ' + p.root_causes.map(rc => rc.name + ' ' + rc.diagnostic).join(' ')).toLowerCase() })),
  ];
  function runSearch(q) {
    const rawQ = q.trim(); q = rawQ.toLowerCase(); if (!q) { searchOut.hidden = true; return; }
    const terms = q.split(/\s+/);
    const scored = index.map(it => { let s = 0; const t = it.title.toLowerCase(); terms.forEach(x => { if (t === x) s += 14; else if (t.startsWith(x)) s += 10; else if (t.includes(x)) s += 6; else if (it.hay.includes(x)) s += 2; }); return { it, s }; })
      .filter(x => x.s > 0).sort((a, b) => b.s - a.s || a.it.title.length - b.it.title.length).slice(0, 12);
    searchOut.innerHTML = scored.length
      ? scored.map(x => `<a href="${x.it.href}" data-k="${A_KIND[x.it.kind] || 'other'}"><span class="sr-kind">${x.it.kind}</span> ${x.it.title} <span style="color:var(--faint);font-size:.82rem">· ${x.it.sub}</span></a>`).join('')
      : `<div class="sr-empty">Can’t find <b>“${esc(rawQ)}”</b>? <button type="button" class="sr-request">Request it or leave feedback →</button></div>`;
    searchOut.hidden = false;
    const rq = searchOut.querySelector('.sr-request');
    if (rq) rq.onclick = e => { e.preventDefault(); e.stopPropagation(); searchOut.hidden = true; openFeedbackModal('Requesting: "' + rawQ + '" — '); };
  }
  // search-issued fires on a 900 ms IDLE, not per keystroke. Per-keystroke would emit a prefix
  // series — one hit per character — which is a timing side channel that reconstructs the length
  // and rhythm of what the reader typed even though the text itself is never sent. The only thing
  // that travels is whether the search matched anything. See docs/EVENT_SCHEMA.md.
  let _aSearchT = null;
  searchBox.addEventListener('input', () => {
    runSearch(searchBox.value);
    clearTimeout(_aSearchT);
    if (!searchBox.value.trim()) return;
    _aSearchT = setTimeout(() => {
      RNA_A.ev('search-issued', searchOut.querySelector('a') ? 'hit' : 'miss');
    }, 900);
  });
  searchBox.addEventListener('focus', () => { if (searchBox.value) runSearch(searchBox.value); });
  document.addEventListener('click', e => { if (!e.target.closest('.search-wrap')) searchOut.hidden = true; });
  searchOut.addEventListener('click', (e) => {
    // Only the KIND CLASS of the chosen result — never its title, href or position. Which
    // compound a reader picked out of a search is the same disclosure as the URL itself.
    const a = e.target && e.target.closest && e.target.closest('a[data-k]');
    if (a) RNA_A.ev('search-chosen', a.getAttribute('data-k'));
    searchOut.hidden = true; searchBox.value = '';
  });

  // ---------- glossary: tap any jargon term to get a plain definition ----------
  const GLOSSARY = {
    'receptor': 'A protein a signal plugs into — like a lock that a specific key fits.',
    'ligand': 'Any molecule that plugs into a receptor.',
    'agonist': 'Something that switches a receptor ON.',
    'antagonist': 'Something that blocks a receptor so it can\'t switch on.',
    'enzyme': 'A protein that speeds up one specific chemical reaction in the body.',
    'transporter': 'A doorway in the cell wall that moves a substance in or out.',
    'hormone': 'A chemical messenger that travels in the blood to act on distant parts of the body.',
    'neurotransmitter': 'A chemical messenger that carries signals between nerve cells.',
    'mitochondria': 'Tiny power plants inside cells that turn food and oxygen into energy.',
    'mitochondrial': 'Relating to mitochondria, the cell\'s power plants.',
    'autophagy': 'The cell\'s recycling program — it breaks down and reuses damaged parts.',
    'senescent': 'A worn-out "zombie" cell that won\'t die and leaks inflammation.',
    'senescence': 'When cells become worn-out "zombies" that won\'t die and leak inflammation.',
    'senolytic': 'A compound that clears out worn-out "zombie" cells.',
    'transcription': 'Copying a gene so the cell can use its instructions.',
    'gene expression': 'How much a particular gene is being used by the cell.',
    'upregulate': 'To make more of something (turn it up).',
    'upregulates': 'Makes more of something (turns it up).',
    'downregulate': 'To make less of something (turn it down).',
    'phosphorylation': 'Attaching a tiny chemical tag that switches a protein on or off.',
    'kinase': 'An enzyme that switches other proteins on or off by tagging them.',
    'half-life': 'The time it takes for half of a substance to clear from your blood.',
    'bioavailability': 'How much of a dose actually reaches your bloodstream.',
    'first-pass': 'The liver breaking down much of a swallowed dose before it reaches the body.',
    'cortisol': 'The main stress hormone — useful in short bursts, harmful when high for long.',
    'insulin': 'The hormone that moves sugar and nutrients from blood into cells.',
    'insulin sensitivity': 'How well your cells respond to insulin; higher is healthier.',
    'testosterone': 'The main male sex hormone; drives muscle, libido, and more.',
    'oestrogen': 'A key sex hormone — important in both women and men.',
    'estrogen': 'A key sex hormone — important in both women and men.',
    'estradiol': 'The main form of oestrogen, a key sex hormone.',
    'dht': 'A stronger form of testosterone that drives hair loss and prostate growth.',
    'aromatase': 'The enzyme that turns testosterone into oestrogen.',
    'glutathione': 'Your cells\' master antioxidant — their built-in rust protection.',
    'antioxidant': 'A molecule that neutralises cell-damaging "free radicals".',
    'inflammation': 'The body\'s defence-and-repair response; harmful when it\'s constant.',
    'anti-inflammatory': 'Something that reduces inflammation.',
    'lipolysis': 'The release of stored fat to be burned for energy.',
    'thermogenesis': 'Producing body heat, which burns calories.',
    'thermogenic': 'Something that makes the body produce heat and burn more calories.',
    'gluconeogenesis': 'The liver making new sugar from scratch.',
    'glycogen': 'The stored form of carbohydrate in your muscles and liver.',
    'triglycerides': 'A type of fat that circulates in your blood.',
    'vasodilation': 'Widening of blood vessels, which increases blood flow.',
    'sirtuins': 'Repair-crew enzymes that switch on longevity programs (they run on NAD+).',
    'telomeres': 'The protective caps on the ends of your DNA that shorten with age.',
    'peptide': 'A short chain of amino acids — essentially a mini-protein.',
    'amino acid': 'A building block of protein.',
    'catabolic': 'Breaking tissue down — the opposite of building.',
    'anabolic': 'Building tissue up, especially muscle.',
    'pituitary': 'A gland in the brain that controls many hormones, including growth hormone.',
    'adrenal': 'Glands on your kidneys that release stress hormones like cortisol and adrenaline.',
    'leydig': 'The cells in the testicles that make testosterone.',
    'gluconeogenesis ': 'The liver making new sugar.',
    'protein synthesis': 'The process of building new protein, such as muscle.',
    'growth factor': 'A signal that tells cells to grow, divide, or repair.',
    'nuclear receptor': 'A receptor inside the cell that changes which genes are active.',
    'nitric oxide': 'A gas your body makes that relaxes blood vessels so more blood flows.',
    'randomised controlled trial': 'The gold-standard experiment: people randomly get the real thing or a dummy.',
    'in vitro': 'An experiment done in a dish, not in a living body.',
    'in vivo': 'An experiment done in a living body.',
    'acetylcholine': 'The brain chemical central to memory, focus, and muscle contraction.',
    'cholinergic': 'Relating to acetylcholine, the memory-and-focus chemical.',
    'adrenergic': 'Relating to adrenaline and noradrenaline — the fight-or-flight chemicals.',
    'dopamine': 'The brain chemical behind motivation, reward, and focus.',
    'serotonin': 'The brain chemical behind calm, mood, and contentment.',
    'noradrenaline': 'An alertness-and-arousal brain chemical (also called norepinephrine).',
    'gaba': 'The brain\'s main calming, "brake" chemical.',
    'glutamate': 'The brain\'s main activating, "accelerator" chemical.',
    'myostatin': 'A protein that limits how much muscle you can build — the body\'s "stop growing" brake.',
    'carnosine': 'A molecule in muscle that soaks up the acid ("the burn") during hard effort.',
    'adenosine': 'The molecule that builds up during the day and makes you feel tired.',
    'ghrelin': 'The hunger hormone — it makes you feel hungry.',
    'amylin': 'A gut hormone that signals fullness, working alongside insulin.',
    'prolactin': 'A hormone that, when too high, lowers libido.',
    'methylation': 'Background chemistry the body uses to run DNA, mood, and detox.',
    'homocysteine': 'A molecule that\'s harmful to blood vessels when it builds up too high.',
    'cytokines': 'Messenger molecules the immune system uses to drive inflammation.',
    'leukotrienes': 'Inflammatory messengers that drive some joint pain.',
    'beta-glucans': 'Special sugars from mushrooms and yeast that "train" the immune system.',
    'satellite cells': 'Muscle stem cells that repair and grow muscle fibres.',
    'aromatisation': 'The conversion of testosterone into oestrogen.',
    'osteoarthritis': 'The common "wear-and-tear" form of joint arthritis.',
  };
  function glossarize(root) {
    if (!root) return;
    // Prefer the shared 214-term glossary from data.js — the same object prerender.js glosses the
    // static pages with — and fall back to the two in-file lists if it is absent. Without this the
    // SPA overwrites the static glosses on first paint with its own smaller set, so a JS reader got
    // 18 definitions on /pathway/6 where a no-JS reader got 35.
    const SHARED = (D && D.glossary) || null;
    const SRC = SHARED ? Object.assign({}, GLOSSARY, SHARED) : GLOSSARY;
    const terms = Object.keys(SRC).filter(t => t.trim()).sort((a, b) => b.length - a.length);
    const rxSrc = '\\b(' + terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b';
    const seen = new Set();
    const SKIPTAG = { A: 1, H1: 1, H2: 1, H3: 1, H4: 1, CODE: 1, BUTTON: 1, INPUT: 1, TEXTAREA: 1, SELECT: 1, LABEL: 1 };
    const SKIPCLASS = ['gloss', 'mnode', 'pd-chip', 'pd-goal', 'pd-eff', 'pd-coltitle', 'crumbs', 'mconn-word', 'mstage-lbl', 'stars', 'pill', 'counter', 'tchip', 'mini-t', 'part-sym', 'part-count', 'tsym', 'stack-badge', 'acct', 'ex-node', 'section-title', 'kicker'];
    const skip = (node) => { let el = node.parentElement; while (el && el !== root.parentElement) { if (el.namespaceURI === 'http://www.w3.org/2000/svg') return true; if (SKIPTAG[el.tagName]) return true; if (el.classList) for (const c of SKIPCLASS) if (el.classList.contains(c)) return true; el = el.parentElement; } return false; };
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const nodes = []; let nn; while (nn = walker.nextNode()) { if (nn.nodeValue.trim().length > 3 && !skip(nn)) nodes.push(nn); }
    const process = (node) => {
      const text = node.nodeValue; const gx = new RegExp(rxSrc, 'ig'); let match;
      while ((match = gx.exec(text))) {
        const term = match[1].toLowerCase();
        if (!SRC[term] || seen.has(term)) continue;
        seen.add(term);
        const start = match.index, end = start + match[1].length;
        const span = document.createElement('span'); span.className = 'gloss'; span.textContent = text.slice(start, end); const _gdef = typeof SRC[term] === 'string' ? SRC[term] : ((SRC[term] && SRC[term].d) || ''); span.setAttribute('data-def', _gdef); span.setAttribute('title', _gdef);
        const afterNode = document.createTextNode(text.slice(end));
        node.nodeValue = text.slice(0, start);
        node.parentNode.insertBefore(span, node.nextSibling);
        node.parentNode.insertBefore(afterNode, span.nextSibling);
        process(afterNode); return;
      }
    };
    nodes.forEach(process);
  }
  function closeGlossPop() { const p = document.getElementById('gloss-pop'); if (p) p.remove(); }

  // ---------- Progressive disclosure: rich popover on internal cross-reference links ----------
  // Hover (or tap) a compound / target / pathway / muscle link and see its one-line summary in a
  // card — so you learn what SIRT1 is without leaving the NMN page and losing your place.
  const ENTITY_SEL = 'a[href^="#/c/"],a[href^="#/target/"],a[href^="#/pathway/"],a[href^="#/muscle/"],a[href^="#/energy/"],a[href^="#/physiology/"]';
  const isTouch = () => (window.matchMedia && window.matchMedia('(hover: none)').matches) || ('ontouchstart' in window);
  function entityInfo(href) {
    const seg = href.replace(/^#/, '').split('?')[0].split('/').filter(Boolean);
    const kind = seg[0], key = decodeURIComponent(seg[1] || '');
    const strip = h => String(h || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (kind === 'c' && bySlug[key]) { const c = bySlug[key]; return { badge: 'Compound', cls: 'st', title: c.name, extra: `${starHTML(c.stars, { compact: true })}${c.isRx ? '<span class="ep-rx">Prescription</span>' : ''}`, sub: (c.plain || c.bottom || c.mechanism || '').slice(0, 150) }; }
    if (kind === 'target') { const t = targetBySym[tkey(key)]; if (t) return { badge: 'Molecular target', cls: 'tg', title: t.sym, sub: (t.name || '') + (t.compoundIds ? ` · ${t.compoundIds.length} compound${t.compoundIds.length !== 1 ? 's' : ''}` : '') }; }
    if (kind === 'pathway' && D.pathways[+key]) { const p = D.pathways[+key]; return { badge: 'Pathway', cls: 'pw', title: p.shortLabel, sub: (p.oneLine || strip(p.html)).slice(0, 160) }; }
    if (kind === 'muscle' && muscleById[key]) { const m = muscleById[key]; return { badge: 'Muscle', cls: 'mv', title: m.name, sub: (m.overview || '').slice(0, 150) }; }
    if (kind === 'energy' && energyById[key]) { const e = energyById[key]; return { badge: 'Energy system', cls: 'en', title: e.name.split('(')[0].trim(), sub: (e.plain || e.overview || '').slice(0, 150) }; }
    if (kind === 'physiology' && physioById[key]) { const p = physioById[key]; return { badge: 'Physiology', cls: 'ph', title: p.name, sub: (p.plain || p.overview || '').slice(0, 150) }; }
    return null;
  }
  function closeEntityPop() { const p = document.getElementById('entity-pop'); if (p) p.remove(); }
  function showEntityPop(a) {
    const info = entityInfo(a.getAttribute('href') || ''); if (!info) return;
    closeEntityPop();
    const pop = document.createElement('div'); pop.id = 'entity-pop'; pop.className = 'entity-pop';
    pop.innerHTML = `<span class="ep-badge ${info.cls}">${esc(info.badge)}</span>
      <div class="ep-title">${esc(info.title)}${info.extra || ''}</div>
      <p class="ep-sub">${esc(info.sub)}${info.sub && info.sub.length >= 150 ? '…' : ''}</p>
      <span class="ep-go">Open ${esc(info.title)} →</span>`;
    document.body.appendChild(pop);
    const r = a.getBoundingClientRect(); const pr = pop.getBoundingClientRect();
    let left = r.left + window.scrollX + r.width / 2 - pr.width / 2;
    left = Math.max(8, Math.min(left, window.scrollX + document.documentElement.clientWidth - pr.width - 8));
    let top = r.bottom + window.scrollY + 8;
    if (top + pr.height > window.scrollY + window.innerHeight - 8 && r.top - pr.height - 8 > 0) top = r.top + window.scrollY - pr.height - 8;
    pop.style.left = left + 'px'; pop.style.top = top + 'px';
    pop.onmouseenter = () => { pop._hover = true; }; pop.onmouseleave = () => { closeEntityPop(); };
  }
  function bindEntityPopovers() {
    if (bindEntityPopovers._bound) return; bindEntityPopovers._bound = true;
    let hideT;
    document.addEventListener('mouseover', e => { if (isTouch()) return; const a = e.target.closest(ENTITY_SEL); if (a) { clearTimeout(hideT); showEntityPop(a); } });
    document.addEventListener('mouseout', e => { if (isTouch()) return; const a = e.target.closest(ENTITY_SEL); if (a) hideT = setTimeout(() => { const p = document.getElementById('entity-pop'); if (p && !p._hover) closeEntityPop(); }, 160); });
    // touch: first tap shows the card (with an Open button), tap the card to navigate
    document.addEventListener('click', e => {
      if (!isTouch()) return;
      const a = e.target.closest(ENTITY_SEL);
      const pop = document.getElementById('entity-pop');
      if (pop && (e.target.closest('#entity-pop'))) return; // let the card's link/tap through
      if (a && (!pop || pop._for !== a)) { e.preventDefault(); showEntityPop(a); const p2 = document.getElementById('entity-pop'); if (p2) { p2._for = a; p2.querySelector('.ep-go').onclick = () => { closeEntityPop(); navigate(a.getAttribute('href').replace(/^#/, '')); }; } return; }
      if (!a) closeEntityPop();
    }, true);
    window.addEventListener('scroll', () => { const p = document.getElementById('entity-pop'); if (p && !p._hover) closeEntityPop(); }, { passive: true });
  }
  function showGlossPop(el) {
    closeGlossPop();
    const pop = document.createElement('div'); pop.id = 'gloss-pop'; pop.className = 'gloss-pop'; pop.textContent = el.getAttribute('data-def');
    document.body.appendChild(pop);
    const r = el.getBoundingClientRect(); const pr = pop.getBoundingClientRect();
    let left = r.left + window.scrollX + r.width / 2 - pr.width / 2;
    left = Math.max(8, Math.min(left, window.scrollX + document.documentElement.clientWidth - pr.width - 8));
    pop.style.left = left + 'px'; pop.style.top = (r.bottom + window.scrollY + 8) + 'px';
  }
  document.addEventListener('click', e => { const g = e.target.closest && e.target.closest('.gloss'); if (g) { e.preventDefault(); e.stopPropagation(); showGlossPop(g); } else if (!e.target.closest || !e.target.closest('#gloss-pop')) closeGlossPop(); });
  window.addEventListener('scroll', closeGlossPop, { passive: true });

  // ================= PROTOCOL ENGINE (Move · Stack · Fuel) =================
  // Lazy-load the big exercise/food datasets only when a protocol route is visited.
  const _lazy = {};
  function loadScript(src) {
    const vsrc = src + (window.__V ? (src.includes('?') ? '&' : '?') + 'v=' + window.__V : '');
    return _lazy[src] || (_lazy[src] = new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = vsrc;
      s.onload = res; s.onerror = () => { delete _lazy[src]; rej(new Error('load ' + src)); };
      document.head.appendChild(s);
    }));
  }
  async function ensureProtocolData() {
    const jobs = [];
    if (!window.RNAWIKI_EXERCISES) jobs.push(loadScript('/exercises.js'));
    if (!window.RNAWIKI_FOODS) jobs.push(loadScript('/foods.js'));
    if (!window.RNAWIKI_BUSINESSES) jobs.push(loadScript('/businesses.js').catch(() => {}));
    await Promise.all(jobs);
  }
  // Local Partners: sample SG businesses relevant to a problem's category.
  const GRAPH = D.graph || { problems: [], categories: [], domains: {} };
  const problemById = {}; GRAPH.problems.forEach(p => problemById[p.id] = p);
  // Approved root-cause changes are applied as a runtime overlay onto the static graph,
  // so an added cause appears everywhere (a "_stub" awaiting protocol content) and a
  // removed one disappears — no rebuild needed. Returns true if anything changed.
  function applyRcOverlay(overlay) {
    if (!Array.isArray(overlay) || !overlay.length) return false;
    let changed = false;
    overlay.forEach(o => {
      const p = problemById[o.problem_id]; if (!p) return;
      if (o.action === 'remove') { const before = p.root_causes.length; p.root_causes = p.root_causes.filter(rc => rc.id !== o.root_cause_id); if (p.root_causes.length !== before) changed = true; }
      else if (o.action === 'add' && !p.root_causes.some(rc => rc.id === o.root_cause_id)) {
        p.root_causes.push({ id: o.root_cause_id, name: o.name || o.root_cause_id, diagnostic: o.diagnostic || '', move_tags: [], strengthen_tags: [], stretch_tags: [], fuel_tags: [], pathway_ids: [], goal_ids: [], compounds: [], nutrient_targets: [], prescription: {}, required_expert_domains: o.domains || [], _stub: true });
        changed = true;
      }
    });
    return changed;
  }
  // VISIBLE DEGRADATION (W1, 2026-08-01). The overlay carries the approved additions and removals to
  // a problem's root causes. Its only call site swallowed every failure with .catch(() => []), which
  // is indistinguishable from "nothing to apply" -- so when the endpoint fails the protocol page
  // silently shows the built-in cause list. Measured hydrated on /protocol/knee-pain/knee-oa:
  // 503 GET /api/rootcause-overlay, and nothing on the page. Three outcomes are now distinguished,
  // and the state is driven by the RESPONSE, never by an assumption about the environment -- so this
  // is correct whether or not production also fails:
  //   'pending' -> not settled yet: say nothing
  //   'live'    -> the request succeeded, empty overlay included: say nothing, the list is current
  //   'offline' -> the request failed: state the absence, on the section the overlay would have changed
  let RC_OVERLAY_STATE = 'pending';
  function mountRcOverlayNotice() {
    const stale = document.getElementById('rc-overlay-absent'); if (stale) stale.remove();
    const sec = document.getElementById('p-causes');
    if (!sec || RC_OVERLAY_STATE !== 'offline') return;
    const n = document.createElement('div');
    n.id = 'rc-overlay-absent';
    n.className = 'callout warn';          // existing component; no styles.css change
    n.setAttribute('role', 'status');
    n.setAttribute('data-api-absent', 'rootcause-overlay');  // scripts/smoke.mjs asserts on this
    n.innerHTML = '<strong>Community updates to this cause list could not be loaded.</strong> ' +
      'You are reading the built-in root causes. A cause the community has since added or retired ' +
      'would not appear here. Nothing else on this page depends on it.';
    sec.insertBefore(n, sec.firstChild);
  }
  function protocolName(pid, rcid) {
    const p = problemById[pid]; const rc = resolveRc(p, rcid);
    return p ? p.name + (rc ? ' — ' + rc.name.split('(')[0].trim() : '') : pid;
  }
  // ITEM 2 — per-cause protocols: synthesize a why.cause into a root-cause the whole engine understands.
  // Move/Fuel scaffolding is borrowed from the best-matching real root_cause; Stack (and identity) come
  // from the cause itself, so each cause you identify gets its own Move·Fuel·Stack plan.
  // Map a why.cause to the real root_cause whose Move/Fuel scaffolding fits best (scored on shared clinical
  // words + a few synonyms). Returns null when nothing matches well, so the caller falls back to the primary rc.
  function alignRootCause(cause, rcs) {
    if (!rcs || !rcs.length) return null;
    const hay = (String(cause.name) + ' ' + (cause.hook || '') + ' ' + ((cause.tell && cause.tell.symptoms) || '')).toLowerCase();
    let best = null, bestScore = 0;
    rcs.forEach(r => {
      const toks = (r.id + ' ' + r.name).toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length > 2);
      let sc = 0; toks.forEach(t => { if (hay.includes(t)) sc += t.length; });
      const rk = (r.id + ' ' + r.name).toLowerCase();
      if (/osteoarthritis|cartilage/.test(hay) && /\boa\b|osteoarthritis/.test(rk)) sc += 8;
      if (/iliotibial|it band/.test(hay) && /\bit\b|iliotibial|lateral/.test(rk)) sc += 6;
      if (sc > bestScore) { bestScore = sc; best = r; }
    });
    return bestScore >= 4 ? best : null;
  }
  function causeAsRc(problem, ci) {
    const causes = (problem.why && problem.why.causes || []).slice().sort((a, b) => (a.rank || 9) - (b.rank || 9));
    const cause = causes[ci]; const rcs = problem.root_causes || [];
    if (!cause) return rcs[0];
    let base = alignRootCause(cause, rcs);                              // best clinical-name match
    if (!base && rcs.length === causes.length) base = rcs[ci];          // else align by index when counts match
    base = base || rcs[0] || {};                                       // else the primary root_cause
    const compNames = (cause.fixes || []).filter(f => f.kind === 'compound' && f.ref).map(f => { const cc = resolveCompound(f.ref); return cc ? cc.name : f.ref; });
    return Object.assign({}, base, {
      id: 'wc' + ci, name: cause.name,
      diagnostic: cause.hook || (cause.tell && cause.tell.symptoms) || base.diagnostic || '',
      compounds: compNames.length ? compNames : (base.compounds || []),
      // A per-cause protocol (the /protocol/<problem>/wc<n> route the cause quiz and the cause
      // finder seed) IS this cause — so it carries its own join key, and never the one it would
      // otherwise inherit from `base` through the Object.assign above. build/parse.js writes
      // `cause_key` onto every real root cause from data/cause_map.json; without this line a wc
      // route would claim to be about whichever cause its borrowed scaffolding root cause is
      // about. Overwriting it here means the quiz's exact answer wins over the inherited guess,
      // whatever order a consumer checks `_causeIndex` and `cause_key` in.
      cause_key: cause.name,
      _causeIndex: ci, _cause: cause,
    });
  }
  // Which of the page's `why.causes` is THIS url's root cause? The join itself is authored in
  // data/cause_map.json and folded onto each root cause as `cause_key` by build/parse.js (which
  // fails the build if a root cause is unmapped without a reason, or names a cause that does not
  // exist). This is the only thing that reads it. It exists because the two taxonomies share no
  // key: clinical_graph.json's 52 root_causes and cause_learn.json's 224 why.causes give 0 id
  // matches, so before this the accordion was hard-coded open on index 0 and 20 of 52 protocol
  // URLs named one cause in the header and expanded a different one below it.
  //
  // ORDER IS LOAD-BEARING: a synthesized `wc<n>` cause-protocol carries its own exact index and
  // must win, because causeAsRc() Object.assigns over a real root cause. Unmapped -> 0, which is
  // exactly the old behaviour, so the 5 deliberately-unmapped root causes are unchanged.
  // The inverse of causeIndexForRc: where does an authored why.cause actually LIVE?
  // 47 of the 224 authored causes have a root-cause protocol of their own (data/cause_map.json
  // binds 47 of 52 root causes to a cause name, folded on as `cause_key` by build/parse.js). The
  // other 177 do not, and there is no protocol URL to send anyone to.
  // DO NOT synthesize /protocol/<p>/wc<n> here. causeAsRc() mints that id for in-memory use, but
  // it is not a servable route -- measured, `curl /protocol/knee-pain/wc3` returns 404, because
  // server.js routes /protocol/* through GENERATED_ROUTES -> serveMissing. A quiz result the
  // reader reloads or shares would be a dead page.
  // The 177 have a real destination: the prerendered /problem document carries id="cause-N" on
  // every cause (build/prerender.js:918, N = sorted position + 1). Verified hydrated:
  // /problem/knee-pain#cause-3 lands with the target present.
  function causeDestination(problem, ci) {
    const causes = (problem.why && problem.why.causes || []).slice().sort((a, b) => (a.rank || 9) - (b.rank || 9));
    const c = causes[ci];
    const rc = c && (problem.root_causes || []).find(r => r.cause_key === c.name);
    return rc ? '/protocol/' + problem.id + '/' + rc.id : '/problem/' + problem.id + '#cause-' + (ci + 1);
  }
  // /problem is prerender-only, so it needs a REAL navigation -- the same reason every inbound
  // /problem link on the site carries data-native.
  function goToCause(problem, ci) {
    const url = causeDestination(problem, ci);
    if (url.indexOf('/problem/') === 0) location.assign(url); else navigate(url);
  }
  function causeIndexForRc(problem, rc) {
    if (!rc) return 0;
    if (rc._causeIndex != null) return rc._causeIndex;
    if (!rc.cause_key) return 0;
    const causes = (problem.why && problem.why.causes || []).slice().sort((a, b) => (a.rank || 9) - (b.rank || 9));
    const i = causes.findIndex(c => c.name === rc.cause_key);
    return i >= 0 ? i : 0;
  }
  function findRootCause(pid, rcid) {
    const p = problemById[pid]; if (!p) return null;
    if (/^wc\d+$/.test(rcid || '')) { const rc = causeAsRc(p, +rcid.slice(2)); return rc ? { problem: p, rc } : null; }
    const rc = p.root_causes.find(r => r.id === rcid) || p.root_causes[0];
    return rc ? { problem: p, rc } : null;
  }
  // Resolve a root-cause id (real OR a 'wc<n>' cause key) to its rc object — for name lookups everywhere.
  function resolveRc(p, rcid) {
    if (!p) return null;
    if (/^wc\d+$/.test(rcid || '')) return causeAsRc(p, +rcid.slice(2));
    return (p.root_causes || []).find(r => r.id === rcid) || null;
  }
  const NUTRIENT_LABEL = {
    kcal: 'Calories', protein_g: 'Protein', carbs_g: 'Carbs', sugar_g: 'Sugar', fat_g: 'Fat',
    fiber_g: 'Fiber', sodium_mg: 'Sodium', vitamin_c_mg: 'Vitamin C', vitamin_d_iu: 'Vitamin D',
    calcium_mg: 'Calcium', magnesium_mg: 'Magnesium', zinc_mg: 'Zinc', iron_mg: 'Iron',
    potassium_mg: 'Potassium', omega3_mg: 'Omega-3', glycine_g: 'Glycine', choline_mg: 'Choline',
  };
  // Glycemic index → band + coloured badge. GI is a property of the carbohydrate (published values).
  function giBand(gi) { return gi >= 70 ? 'high' : gi >= 56 ? 'med' : 'low'; }
  function giBadge(gi) { return gi == null ? '' : ` <span class="gi-badge gi-${giBand(gi)}" title="Glycemic index — how fast this raises blood sugar (low ≤55 · medium 56–69 · high ≥70)">GI ${gi}</span>`; }
  // Nutritionist-authored healthier swaps for common Singapore hawker/market foods (shown on the food-detail screen).
  const FOOD_SUBS = [
    ['char kway teow', 'Fried Hokkien mee (ask for less dark sauce) or Yong Tau Foo soup', 'CKT is very high in oil, lard and sodium — a soup bowl cuts the fat and salt sharply.'],
    ['fried hokkien', 'Sliced-fish bee hoon soup', 'A clear soup noodle has a fraction of the oil.'],
    ['nasi lemak', 'Thosai with sambar, or nasi lemak with half the rice + skip fried sides', 'Coconut rice with fried chicken is calorie- and fat-dense; halving the rice helps a lot.'],
    ['white rice', 'Brown rice, or add more vegetables and lean protein', 'Brown rice has a lower GI and more fibre — steadier energy and better fullness.'],
    ['fried rice', 'Steamed rice with a stir-fried dish on the side', 'Fried rice soaks up a lot of oil and salt; steamed rice lets you control it.'],
    ['chicken rice', 'Steamed chicken (skin off) with plain rice + extra veg', 'The rice is cooked in chicken fat — plain rice and no skin cut the saturated fat.'],
    ['duck rice', 'Braised duck (skin off) with plain rice + greens', 'Duck skin and flavoured rice are fat-heavy.'],
    ['char siew', 'Steamed or soup-based meats', 'Char siew is glazed with sugar and higher in fat.'],
    ['roti prata', 'Thosai or chapati', 'Prata is fried in ghee/oil; thosai and chapati are far lower in fat.'],
    ['nasi briyani', 'Plain rice with the curry on the side + more veg', 'Briyani rice is cooked in ghee and oil.'],
    ['laksa', 'Sliced-fish bee hoon soup, or laksa yong tau foo (clear)', 'Laksa gravy is coconut-rich — high in saturated fat and sodium.'],
    ['curry', 'A clear-soup dish or dhal', 'Coconut curries are high in saturated fat.'],
    ['mee goreng', 'A soup noodle (mee soto or sliced-fish)', 'Fried noodles absorb a lot of oil.'],
    ['mee rebus', 'Sliced-fish bee hoon soup', 'The gravy is starchy and sweet; a clear soup is lighter.'],
    ['economic rice', 'Pick 2 veg + 1 lean protein, less gravy, smaller rice', 'The gravies and fried dishes add hidden oil, sugar and salt.'],
    ['cai fan', 'Pick 2 veg + 1 steamed/lean protein, less gravy', 'Skip the fried and gravy-heavy dishes.'],
    ['instant noodle', 'Wholegrain noodles + egg and veg, use half the seasoning', 'Instant noodles are refined and very high in sodium.'],
    ['maggi', 'Add egg and veg, use half the seasoning packet', 'Cuts the sodium and adds protein and fibre.'],
    ['kaya toast', 'Wholemeal toast with less kaya and butter', 'Wholemeal raises blood sugar more gently and adds fibre.'],
    ['bubble tea', 'Order 0% sugar (kosong) and skip or halve the pearls', 'A regular cup can hit 40–60 g of sugar.'],
    ['kopi', 'Kopi-o kosong or siu dai (less sweet)', 'Default kopi has 2–3 tsp of sugar and condensed milk.'],
    ['teh', 'Teh-o kosong or siu dai (less sweet)', 'Default teh is sweetened with condensed milk and sugar.'],
    ['ice kacang', 'Fresh cut fruit, or tau huay with less syrup', 'Ice kacang is mostly sugar syrup and condensed milk.'],
    ['chendol', 'Tau huay (less syrup) or fresh fruit', 'Chendol is coconut milk + gula melaka syrup — very sugary.'],
    ['french fries', 'Baked potato or a side of greens', 'Deep-frying roughly doubles the calories.'],
    ['fried chicken', 'Steamed, roasted (skin off) or grilled chicken', 'The batter and deep-frying add a lot of fat.'],
    ['fried', 'The steamed, soup or grilled version', 'Deep-frying adds oil and oxidised fats.'],
    ['satay', 'Ask for less peanut sauce; pair with cucumber, skip the rice cake', 'The sauce and ketupat are where most of the sugar and calories hide.'],
  ];
  function foodSub(name) { const n = (name || '').toLowerCase(); const m = FOOD_SUBS.find(([kw]) => n.includes(kw)); return m ? { sub: m[1], why: m[2] } : null; }

  // Core "brain": resolve a root cause into Move / Stack / Fuel.
  function generateProtocol(rc) {
    const EX = window.RNAWIKI_EXERCISES, FO = window.RNAWIKI_FOODS;
    // --- MOVE: split into STRENGTHEN (weak tissue) and STRETCH (tight tissue) ---
    let strengthen = [], stretch = [];
    const strengthenTags = rc.strengthen_tags || rc.move_tags || [];
    const stretchTags = rc.stretch_tags || rc.move_tags || [];
    if (EX) {
      const exById = {}; EX.exercises.forEach(e => exById[e.id] = e);
      // Constrain to the muscles that actually belong to this problem, so a generic tag (e.g.
      // "low_impact_deload") can't pull a chest exercise into a knee protocol. Null for non-MSK
      // problems (no mapping) -> no filter, preserving prior behaviour.
      const rel = (rc.relevant_muscles && rc.relevant_muscles.length) ? new Set(rc.relevant_muscles) : null;
      // Contraindicated movements (added 2026-07-28). The computed tag join could surface an
      // exercise the cause's OWN prescription tells you to avoid: rotator-cuff impingement says
      // "avoid painful overhead loading until controlled" and the #1 rendered movement was an
      // overhead cable press. The tag join knows which muscles an exercise trains; it has no idea
      // which movements the condition cannot tolerate. `avoid_movements` is authored per cause and
      // build/parse.js asserts that any cause whose prescription names a movement to avoid has one.
      const avoid = (rc.avoid_movements || []).map(a => String(a).toLowerCase());
      const notContra = (e) => {
        if (!avoid.length || !e) return true;
        const hay = ((e.name || '') + ' ' + (e.id || '')).toLowerCase().replace(/_/g, ' ');
        return !avoid.some(a => hay.includes(a));
      };
      const inRegion = e => (!rel || (e.primaryMuscles || []).some(m => rel.has(m))) && notContra(e);
      // STRENGTHEN: round-robin across the loading tags, taking loading (non-stretch) exercises
      const seen = new Set();
      const lists = strengthenTags.map(t => (EX.byTag[t] || []).filter(id => { const e = exById[id]; return e && e.kind !== 'stretch' && inRegion(e); }));
      // For strength / hypertrophy GOALS (experienced lifters, not rehab), rank each tag's candidates so
      // heavy compound, intermediate/expert, free-weight lifts come first — no beginner-isolation "newbie"
      // moves at the top. Rehab/pain protocols keep their specific corrective picks (no strength tag).
      const strengthGoal = strengthenTags.some(t => /hypertrophy|_strength|compound_strength|power|bone_loading/.test(t));
      if (strengthGoal) {
        // Favour the hypertrophy STAPLES — compound, plain 'strength' category (not olympic/plyo
        // specialties), intermediate over beginner, on a barbell/dumbbell/cable/machine.
        const q = id => { const e = exById[id] || {}; let s = 0;
          if (e.mechanic === 'compound') s += 3;
          if (e.category === 'strength') s += 2; else if (['olympic weightlifting', 'powerlifting', 'strongman', 'plyometrics'].includes(e.category)) s -= 2;
          s += e.level === 'intermediate' ? 2 : e.level === 'expert' ? 1 : -1;
          if (['barbell', 'dumbbell', 'cable', 'machine'].includes(e.equipment)) s += 1;
          return s; };
        lists.forEach(list => list.sort((a, b) => q(b) - q(a)));
      }
      const cap = (rc.anchor_exercises && rc.anchor_exercises.length) ? rc.anchor_exercises.length : (strengthGoal ? 4 : 3);
      // curated anchor lifts (the flagship compounds for this goal) take the first slots
      (rc.anchor_exercises || []).forEach(id => { const e = exById[id]; if (e && notContra(e) && !seen.has(id) && strengthen.length < cap) { seen.add(id); strengthen.push(e); } });
      let added = true;
      while (added && strengthen.length < cap) {
        added = false;
        for (const list of lists) {
          const id = list.shift();
          if (id == null || seen.has(id)) continue;
          seen.add(id); strengthen.push(exById[id]); added = true;
          if (strengthen.length >= cap) break;
        }
      }
      // STRETCH: stretches are muscle-tagged, not clinically tagged — match by the target muscles
      // implied by this root cause's tags (data-driven; no fabricated region mapping).
      const TM = EX.tag_muscles || {};
      const muscles = new Set();
      strengthenTags.concat(stretchTags).forEach(t => (TM[t] || []).forEach(m => muscles.add(m)));
      if (muscles.size) {
        stretch = EX.exercises
          .filter(e => e.kind === 'stretch' && (e.primaryMuscles || []).some(m => muscles.has(m)))
          .map(e => ({ e, overlap: (e.primaryMuscles || []).filter(m => muscles.has(m)).length }))
          .sort((a, b) => b.overlap - a.overlap)
          .slice(0, 2).map(x => x.e);
      }
      if (!stretch.length) stretch = (EX.byTag['mobility_stretch'] || []).map(id => exById[id]).filter(e => e && inRegion(e)).slice(0, 2);
    }
    // --- FUEL: foods whose tags match, SG-local first, ranked by match count ---
    let fuel = [];
    if (FO) {
      const wanted = new Set(rc.fuel_tags || []);
      fuel = FO.foods
        .map(f => ({ f, hits: (f.tags || []).filter(t => wanted.has(t)).length }))
        .filter(x => x.hits > 0)
        // Ranked by nutrient fit first, not by Singapore-list membership — see the note on
        // protoFuel() in build/prerender.js. Keeps the two documents telling the same story.
        .sort((a, b) => (b.hits - a.hits) || (b.f.sg_local - a.f.sg_local) || a.f.name.localeCompare(b.f.name))
        .slice(0, 6).map(x => x.f);
    }
    // --- STACK: resolve hero compounds by name, backfill from goals/pathways, rank by evidence ---
    const picked = [], pickedIds = new Set();
    const add = c => { if (c && !pickedIds.has(c.id)) { pickedIds.add(c.id); picked.push(c); } };
    (rc.compounds || []).forEach(name => add(findCpt(name)));
    // backfill pool: compounds sharing a goal or pathway, best evidence first
    const pool = D.compounds.filter(c =>
      (rc.goal_ids || []).some(g => (c.goalIds || []).includes(g)) ||
      (rc.pathway_ids || []).some(p => (c.pathwayIds || []).includes(p)));
    pool.sort((a, b) => b.stars - a.stars);
    pool.forEach(add);
    const stack = picked.slice(0, 6);
    // synergy: compounds sharing a pathway with another in the stack
    const pathCount = {};
    stack.forEach(c => (c.pathwayIds || []).forEach(p => pathCount[p] = (pathCount[p] || 0) + 1));
    stack.forEach(c => { c._synergy = (c.pathwayIds || []).some(p => pathCount[p] > 1); });
    return { stretch, strengthen, fuel, stack };
  }

  // ---- /solve?q= RANKING (2026-08-01, W2/D11) --------------------------------------------------
  // The SAME scoring loop exists in server.js (searchSolve) for the ~90% of readers who never run
  // JavaScript. Both read graph.solveHay / graph.solveStopwords, authored once in build/parse.js.
  // If you change a weight here, change it there.
  // The scoring is deliberately dumb and name-weighted. It was tuned against 25 realistic queries;
  // the one property that is asserted, not eyeballed, is that all 41 problems rank #1 for their
  // own name. It never hides the full 41-item list, so a scoring miss costs a scroll, not a page.
  function solveTokens(q) {
    const stop = GRAPH.solveStopwords || [];
    return [...new Set(String(q || '').toLowerCase().replace(/[^a-z0-9']+/g, ' ').split(' ')
      .filter(t => t.length >= 3 && stop.indexOf(t) < 0))].slice(0, 8);
  }
  function rankProblems(q) {
    const T = solveTokens(q);
    if (!T.length) return [];
    const nq = ' ' + String(q || '').toLowerCase().replace(/[^a-z0-9']+/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
    const sc = GRAPH.problems.map(p => {
      const n = p.solveName || '', h = p.solveHay || '', al = p.solveAlias || '';
      let s = 0;
      // Tier 0 — an authored alias PHRASE (data/solve_aliases.json) inside the query. Scored ONCE,
      // not per phrase, so a problem with a long alias list cannot buy rank with volume. 40 puts a
      // phrase match above any single name word (18) but below a full name match plus a word.
      if ((p.solvePhrases || []).some(ph => nq.indexOf(ph.slice(1, -1)) >= 0)) s += 40;
      T.forEach(t => {
        const st = t.length >= 6 ? t.slice(0, 5) : null;
        if (n === ' ' + t + ' ') s += 30;                       // the whole name
        else if (n.indexOf(' ' + t + ' ') >= 0) s += 18;        // a whole word of the name
        else if (al.indexOf(' ' + t + ' ') >= 0) s += 14;       // a whole word of an authored alias
        // WORD-PREFIX, not substring. This was `n.indexOf(t) >= 0`, which matched anywhere inside
        // any word: "out" scored 10 against "Burnout" and "Pre-Workout Energy", which is most of
        // why "hair falling out" returned insomnia.
        else if (n.indexOf(' ' + t) >= 0) s += 10;              // the start of a word of the name
        else if (h.indexOf(' ' + t + ' ') >= 0) s += 4;         // a whole word anywhere on the page
        else if (h.indexOf(t) >= 0) s += 1;
        else if (st && (n.indexOf(st) >= 0 || al.indexOf(st) >= 0 || h.indexOf(st) >= 0)) s += 1;   // crude stem
      });
      return { p, s };
      // Tie-break on solveName.length, NOT p.name.length: server.js only has the normalised form,
      // and normalising "Belly / Visceral Fat" changes its length, so the two runtimes would order
      // ties differently. One field, one rule.
    }).filter(x => x.s > 0).sort((a, b) => b.s - a.s || (a.p.solveName || '').length - (b.p.solveName || '').length);
    if (!sc.length) return [];
    const cut = sc[0].s * 0.34;   // relative, so one strong hit suppresses a weak tail
    return sc.filter(x => x.s >= cut).slice(0, 6);
  }

  // ---------- Solve / intake ----------
  // /solve IS THE FUNNEL ENTRANCE, and it was broken three ways, all measured hydrated 2026-08-01:
  //   D10 — every card linked to `#/protocol/{pid}/{root_causes[0].id}`. The 10 multi-cause
  //         problems therefore exposed only their FIRST cause: 41 of the 52 protocol URLs and
  //         ZERO /problem links, against 52 distinct protocol hrefs in the prerendered document.
  //         11 protocol URLs were unreachable for a JS reader.
  //   D11 — ?q= was split off in route() and thrown away.
  //   Sequencing — a protocol answers "what do I do about cause X"; it cannot answer "which cause
  //         do I have". 31 of 41 problems describe 4-7 causes and ship exactly ONE protocol, so
  //         sending a reader straight to a protocol silently picks their diagnosis for them.
  // So the PRIMARY destination of a card is /problem/{id} -- the differential. The root causes are
  // still one click away as chips, under a label that states the precondition they assume.
  //
  // data-native on the /problem link is LOAD-BEARING, not decoration. /problem is in
  // KEEP_PRERENDERED, so route() returns the KEEP sentinel and never writes #app. Measured: an
  // intercepted click on /problem/knee-pain from a hydrated /solve leaves location.pathname at
  // /problem/knee-pain while #app still holds the solve page. With data-native the browser
  // navigates and the real /problem document loads.
  function solveCard(p, hit) {
    // Counts are computed from the shipped data at render time. Never hard-code either number:
    // they are the honest statement of the gap between 224 authored causes and 52 protocols.
    const nc = ((p.why && p.why.causes) || []).length;
    const nr = p.root_causes.length;
    const chips = p.root_causes.map(rc =>
      `<a class="s-rc" href="/protocol/${p.id}/${rc.id}">${esc(rc.name.replace(/\s*\([^)]*\)/, ''))}</a>`).join('');
    return `<div class="solve-card${hit ? ' is-hit' : ''}" data-kind="${p.kind}" data-pid="${p.id}">
      <a class="s-main" href="/problem/${p.id}" data-native>
        <span class="s-ico" aria-hidden="true">${p.icon || '•'}</span>
        <span class="s-body"><b>${esc(p.name)}</b>
          <small>${esc(p.category)} · ${p.kind === 'want' ? 'goal' : 'problem'}</small>
          <span class="s-diff">${nc} possible cause${nc === 1 ? '' : 's'} · ${nr} with a protocol</span>
          <span class="s-go">See which one fits you →</span></span></a>
      <div class="s-rcs"><span class="s-rcs-k">Already know the cause?</span>${chips}</div>
    </div>`;
  }
  function solveQPanel(q, hits) {
    if (!q) return '';
    const t = esc(q);
    const n = GRAPH.problems.length;
    if (!hits.length) {
      return `<section class="q-panel q-empty" id="q-hits" data-on>
        <h2>Nothing here matches “${t}”</h2>
        <p>RNAwiki covers ${n} problems and goals. Yours is not one of them yet. Tell me what it is and it goes on the list of what to build next — or point to where it hurts and work back from the body.</p>
        <p class="q-acts"><button class="cta-primary" id="q-req">Request “${t}”</button>
        <a class="q-alt" href="#/where">🧍 Point to where it hurts →</a></p>
        <p class="q-all"><a href="#solve-all">Or read all ${n} below ↓</a></p></section>`;
    }
    const strong = hits[0].s >= 18;   // matched the problem's NAME, not just its body text
    return `<section class="q-panel" id="q-hits" data-on>
      <h2>${strong ? `Closest match for “${t}”` : `Nothing is named “${t}” — these mention it`}</h2>
      <div class="solve-grid q-list">${hits.map(h => solveCard(h.p, true)).join('')}</div>
      <p class="q-all"><a href="#solve-all">Not it? All ${n} problems and goals ↓</a></p></section>`;
  }
  function solvePage(q) {
    q = String(q || '').slice(0, 120);
    const cats = GRAPH.categories;
    const hits = rankProblems(q);
    const filterBtns = `<div class="solve-filter" id="solve-filter">
        <button data-k="all" class="on">All</button>
        <button data-k="need">Fix a problem</button>
        <button data-k="want">Reach a goal</button>
      </div>`;
    const sections = cats.map(cat => {
      const ps = GRAPH.problems.filter(p => p.category === cat);
      return `<div class="solve-section"><h2>${esc(cat)}</h2><div class="solve-grid">${ps.map(p => solveCard(p, false)).join('')}</div></div>`;
    }).join('');
    return `${crumbs([{ label: 'Home', href: '#/' }, { label: 'Solve' }])}
      <section class="solve-hero">
        <div class="kicker">Protocol engine</div>
        <h1>Stop guessing. Start solving.</h1>
        <p>Name the problem you want to fix or the goal you want to reach. You get the likely causes first — because the same symptom has different causes and they need different fixes — then one protocol for the cause you pick: the <b class="mv">movement</b> to fix it, the <b class="fl">food</b> to fuel it, and the evidence-ranked <b class="st">compounds</b> to support it.</p>
        <form class="solve-q" action="/solve" method="get" role="search">
          <label class="sr-only" for="solve-q">Describe the problem or goal in your own words</label>
          <input id="solve-q" name="q" type="search" value="${esc(q)}" autocomplete="off" spellcheck="false"
                 placeholder="In your own words — “sore knee going downstairs”">
          <button class="cta-primary" type="submit">Find it →</button>
        </form>
        <p class="where-cta"><a href="#/where">🧍 Not sure what it's called? <b>Point to where it hurts →</b></a></p>
      </section>
      ${solveQPanel(q, hits)}
      <h2 class="solve-all-h" id="solve-all">All ${GRAPH.problems.length} problems and goals</h2>
      ${filterBtns}
      <div id="solve-list">${sections}</div>
      <div class="request-cta">
        <div><b>Don’t see your problem or goal?</b> <span>Tell me, and it goes on the list of what to build next.</span></div>
        <button class="cta-primary" id="req-proto">Request a protocol →</button>
      </div>
      <div id="requests-board"></div>`;
  }
  // Anyone can suggest an improvement or flag something wrong — collected for the admin.
  function openFeedbackModal(prefill) {
    const page = location.pathname + location.hash;
    const m = modal(`<div class="partner-modal"><h2>Help me improve RNAwiki</h2>
      <p class="muted">Spotted something wrong, confusing, or missing? Want something added? Tell me — it comes straight to me.</p>
      <label>What kind of feedback?</label>
      <select id="fb-kind"><option value="idea">💡 A request / suggestion</option><option value="wrong">⚠️ Something looks wrong</option><option value="other">💬 Something else</option></select>
      <label>Your feedback</label><textarea id="fb-body" rows="4" maxlength="2000" placeholder="What would make RNAwiki better?">${prefill ? esc(prefill) : ''}</textarea>
      ${ME ? '' : '<label>Email (optional — if you’d like a reply)</label><input id="fb-contact" type="email" placeholder="you@example.com">'}
      <button class="cta-primary" id="fb-save" style="border:none;cursor:pointer;width:100%;margin-top:1rem">Send feedback</button></div>`);
    m.querySelector('#fb-save').onclick = async () => {
      const body = (document.getElementById('fb-body') || {}).value || '';
      if (!body.trim()) return alert('Please write your feedback first.');
      try {
        await api.submitFeedback({ body, kind: (document.getElementById('fb-kind') || {}).value, page, contact: (document.getElementById('fb-contact') || {}).value || '' });
        closeModal(); alert('Thank you — your feedback helps everyone. 🙏' + (ME ? ' +2 points.' : ''));
      } catch (e) { alert(e.message); }
    };
  }
  // After an expert's edit is approved, prompt them to share it — with a ready caption that
  // drops a (non-clickable) link to their RNAwiki profile, where all their work is visible.
  function openSharePrompt(what) {
    if (!ME) return;
    const profile = (location.origin || 'https://rnawiki.com') + '/u/' + ME.username;
    const dom = (GRAPH.domains[ME.domain] || {}).label || 'health';
    const caption = `Just contributed to an open, evidence-based health protocol on RNAwiki${what ? ' — ' + what : ''}. 🧬\n\nI'm helping keep the ${dom.toLowerCase()} guidance accurate so people can fix the root cause, not just the symptom.\n\nSee all my contributions 👉 ${profile}\n(search "${ME.username} rnawiki")\n\n#RNAwiki #Health`;
    const m = modal(`<div class="partner-modal"><h2>📣 Nice work — share it</h2>
      <p class="muted">Your contribution is live. Post this to your socials to build your profile — every view is a potential lead. The link isn’t clickable on most platforms, so there is a search hint too.</p>
      <textarea id="sp-cap" rows="8" style="font-size:.9rem">${esc(caption)}</textarea>
      <div class="sp-row"><button class="cta-primary" id="sp-copy" style="border:none;cursor:pointer">Copy caption</button><button class="linkbtn" id="sp-share">Share…</button></div>
      <p class="muted" style="font-size:.78rem;margin-top:.6rem">Tip: add a screenshot of the protocol you improved for more reach.</p></div>`);
    m.querySelector('#sp-copy').onclick = () => { const t = document.getElementById('sp-cap'); if (navigator.clipboard) navigator.clipboard.writeText(t.value).then(() => alert('Caption copied — paste it into Instagram, LinkedIn or X.')).catch(() => {}); };
    const sh = m.querySelector('#sp-share'); if (sh) sh.onclick = async () => { try { if (navigator.share) await navigator.share({ title: 'RNAwiki', text: document.getElementById('sp-cap').value }); } catch (e) {} };
  }
  // Low-barrier community readability: any signed-in user can suggest a plain-English analogy
  // or a simpler wording. Goes to the review queue; if accepted it's credited to them.
  function openSuggestModal(kind, ref) {
    if (!ME) return openAuth('login');
    const isA = kind === 'analogy';
    const m = modal(`<div class="partner-modal"><h2>${isA ? '💡 Suggest a plain-English analogy' : '✨ Simplify this'}</h2>
      <p class="muted">${isA ? `Explain <b>${esc(ref)}</b> in one vivid, everyday sentence a total beginner would get. The best analogy gets featured — credited to you.` : `Rewrite <b>${esc(ref)}</b> in plainer words without losing the meaning. Accepted simplifications are credited to you.`}</p>
      <textarea id="sg-body" rows="4" maxlength="600" placeholder="${isA ? 'e.g. SIRT1 is the cell’s maintenance foreman — it walks the floor and switches the repair crews on…' : 'Your clearer version…'}"></textarea>
      <button class="cta-primary" id="sg-save" style="border:none;cursor:pointer;width:100%;margin-top:.8rem">Submit for review</button></div>`);
    m.querySelector('#sg-save').onclick = async () => {
      const body = (document.getElementById('sg-body') || {}).value || '';
      if (!body.trim()) return alert('Write your suggestion first.');
      try { await api.submitFeedback({ body: `[${isA ? 'ANALOGY' : 'SIMPLIFY'} · ${ref}] ${body}`, kind: 'idea', page: location.pathname + location.hash }); closeModal(); alert('Thank you — it’s in the review queue. If accepted it’s credited to you. +2 points.'); }
      catch (e) { alert(e.message); }
    };
  }
  // ---------- Fork a protocol: community variations (UGC engine) ----------
  async function mountForkPage(id) {
    const f = await api.getFork(id);
    if (!f) { app.innerHTML = notFound(); return; }
    const p = problemById[f.problem_id];
    const cpds = (f.stack || []).map(x => byId[x]).filter(Boolean);
    const base = '#/protocol/' + f.problem_id + '/' + f.root_cause_id;
    let likes = 0; try { const s = await api.votes(['fork:' + f.id]); likes = (s['fork:' + f.id] || {}).up || 0; } catch (e) {}
    const liked = myVote('fork:' + f.id) === 1;
    app.innerHTML = `<div class="article">${crumbs([{ label: 'Home', href: '#/' }, { label: p ? p.name : 'Protocol', href: p ? base : '#/' }, { label: 'Stack' }])}
      <span class="anat-region">💬 Community stack · not reviewed</span>
      <h1>${esc(f.title)}</h1>
      <p class="muted">by ${f.by_user ? '@' + esc(f.by_user) : 'someone'}${f.clones ? ' · ' + f.clones + ' using' : ''} · a take on <a href="${base}">${esc(p ? p.name : f.problem_id)}</a></p>
      ${f.note ? `<p class="anat-lead">${esc(f.note)}</p>` : ''}
      <div class="section-title">The stack (${cpds.length})</div>
      <div class="fuel-stack-grid">${cpds.map(c => `<div class="fs-item${needsDoctor(c) ? ' rx' : ''}"><a class="fs-main" href="#/c/${slug(c.name)}"><b>${esc(c.name)}</b>${starHTML(c.stars, { compact: true })}</a>${c.isRx ? `<span class="pill rx" data-axis="supply" aria-label="How you get it: ${esc(String((c.supply || {}).tag || 'needs a doctor').toLowerCase())}">${esc((c.supply || {}).tag || 'Prescription')}</span>` : ''}</div>`).join('') || '<p class="muted">No compounds.</p>'}</div>
      <div class="cstack-actions" style="margin-top:1.2rem">
        <button class="cta-primary cstack-use" id="fork-clone-btn" style="border:none;cursor:pointer">Use this stack →</button>
        <button class="cstack-like${liked ? ' on' : ''}" data-like="${f.id}" title="Like this stack"><span class="cstack-heart">${liked ? '❤️' : '🤍'}</span> <span class="cstack-likec">${likes}</span></button>
        <button class="cstack-share" id="fork-share-btn" title="Share this stack">🔗 Share</button>
      </div>
      <p class="lp-note" style="margin-top:1.2rem">A community-made stack, not the official reviewed protocol. See the <a href="${base}">official ${esc(p ? p.name : '')} protocol →</a></p></div>`;
    const cb = document.getElementById('fork-clone-btn'); if (cb) cb.onclick = () => cloneForkTo(f.id);
    const sb = document.getElementById('fork-share-btn'); if (sb) sb.onclick = () => shareFork(f);
    bindLikeBtn(app, app);
    try { glossarize(app); } catch (e) {}
  }
  async function cloneForkTo(id) {
    try {
      const r = await api.cloneFork(id); const forkStack = (r.stack || []).filter(Boolean);
      const cur = getStack(); const added = forkStack.filter(x => !cur.includes(x));
      setStack(cur.concat(added));   // merge, never wipe the user's existing stack
      alert(added.length ? `Added ${added.length} compound${added.length !== 1 ? 's' : ''} to your stack. Opening the Stack Builder…` : 'You already have all of these — opening your stack.');
      navigate('/stack');
    } catch (e) { alert(e.message); }
  }
  // ---------- Community stacks (real people's takes on a protocol's cause) ----------
  // Reuses the existing fork infrastructure (protocol_forks) for the stacks themselves,
  // and the frictionless votes table (keyed `fork:<id>`) for likes — no account needed to like.
  async function shareFork(f) {
    if (!f) return;
    const url = (location.origin || 'https://rnawiki.com') + '/fork/' + f.id;
    const p = problemById[f.problem_id];
    const text = `“${f.title}” — a community stack for ${p ? p.name : 'this'} on RNAwiki (Singapore).`;
    try {
      if (navigator.share) await navigator.share({ title: 'RNAwiki stack', text, url });
      else { await navigator.clipboard.writeText(text + '\n' + url); alert('Link copied — paste it into WhatsApp / Telegram / X.'); }
    } catch (e) {}
    if (ME) api.rep('share');
  }
  function bindLikeBtn(el, root) {
    root.querySelectorAll('[data-like]').forEach(b => b.onclick = async () => {
      const t = 'fork:' + b.dataset.like, next = myVote(t) === 1 ? 0 : 1;
      setMyVote(t, next);
      b.classList.toggle('on', next === 1);
      const h = b.querySelector('.cstack-heart'); if (h) h.textContent = next === 1 ? '❤️' : '🤍';
      try { const r = await api.vote({ targetId: t, voterKey: VOTER_KEY, value: next }); const c = b.querySelector('.cstack-likec'); if (c) c.textContent = r.score.up || 0; }
      catch (e) {}
    });
  }
  // Section-level share unit: the smallest self-contained nugget worth sending to a friend.
  async function shareSection(layer, problem, rc) {
    let P = {}; try { P = generateProtocol(rc); } catch (e) {}
    const url = (location.origin || 'https://rnawiki.com') + '/protocol/' + problem.id + '/' + rc.id;
    let insight;
    if (layer === 'move') insight = (rc.prescription && rc.prescription.scheme) ? 'Move — ' + rc.prescription.scheme : 'the exact movement to fix it';
    else if (layer === 'stack') insight = 'Stack — ' + ((P.stack || []).slice(0, 3).map(c => c.name).join(', ') || 'evidence-ranked supplements');
    else insight = 'Fuel — hit ' + Object.keys(rc.nutrient_targets || {}).length + ' biological targets from local food';
    const text = `${problem.name} · ${insight}. From a full root-cause protocol on RNAwiki (Singapore).`;
    try { if (navigator.share) await navigator.share({ title: 'RNAwiki', text, url }); else { await navigator.clipboard.writeText(text + '\n' + url); alert('Copied — paste it into WhatsApp / Telegram / X.'); } } catch (e) {}
  }
  function openRequestModal(prefill) {
    if (!ME) return openAuth('login');
    const m = modal(`<div class="partner-modal"><h2>Request a protocol</h2>
      <p class="muted">Tell me the problem or goal you want solved. Others can upvote it, and the most-wanted ones get built first.</p>
      <label>Problem or goal</label><input id="rq-title" maxlength="120" placeholder="e.g. Plantar fasciitis, Perimenopause sleep, Marathon recovery" value="${esc(prefill || '')}">
      <label>Anything specific? (optional)</label><textarea id="rq-detail" rows="3" maxlength="1000" placeholder="Symptoms, what you’ve tried, your goal…"></textarea>
      <button class="cta-primary" id="rq-save" style="border:none;cursor:pointer;width:100%;margin-top:1rem">Submit request</button></div>`);
    m.querySelector('#rq-save').onclick = async () => {
      const request = (document.getElementById('rq-title') || {}).value || '';
      const detail = (document.getElementById('rq-detail') || {}).value || '';
      try { await api.submitProtocolRequest({ request, detail }); closeModal(); alert('Thanks! Your request is on the board — others can upvote it. +5 reputation.'); if (currentRoute().split('?')[0] === '#/solve' || currentRoute() === '/solve') mountRequestsBoard(); }
      catch (e) { alert(e.message); }
    };
  }
  async function mountRequestsBoard() {
    const el = document.getElementById('requests-board'); if (!el) return;
    let reqs = []; try { reqs = await api.protocolRequests(); } catch (e) { return; }
    if (!reqs.length) return;
    el.innerHTML = `<div class="section-title">Most-requested protocols <span class="lp-tag">community</span></div>
      <div class="req-list">${reqs.map(r => `<div class="req-row"><button class="req-vote" data-req="${r.id}">▲ <span class="rv-n">${r.votes}</span></button>
        <div class="req-b"><b>${esc(r.request)}</b>${r.detail ? `<small>${esc(r.detail.slice(0, 120))}</small>` : ''}${r.status === 'building' ? '<span class="req-status">an expert is building this</span>' : ''}</div></div>`).join('')}</div>`;
    el.querySelectorAll('[data-req]').forEach(b => b.onclick = async () => {
      try { const r = await api.voteProtocolRequest(b.dataset.req, VOTER_KEY); const n = b.querySelector('.rv-n'); if (n) n.textContent = r.votes; b.classList.add('voted'); }
      catch (e) {}
    });
  }
  function bindSolve() {
    const rq = document.getElementById('req-proto'); if (rq) rq.onclick = () => openRequestModal();
    mountRequestsBoard();
    // The zero-match state's only action.
    bindSolve._reqOnly();

    // Live refinement. The form is a REAL <form action="/solve" method="get">, so pressing Enter
    // with JS off does a server round-trip that server.js answers (see searchSolve there). With JS
    // we re-render in place and replaceState the URL, so the result stays shareable and the Back
    // button is not filled with keystrokes.
    const qin = document.getElementById('solve-q');
    const qform = qin && qin.closest('form');
    const applyQ = (v, focusOut) => {
      const q = String(v || '').slice(0, 120);
      const url = '/solve' + (q.trim() ? '?q=' + encodeURIComponent(q.trim()) : '');
      history.replaceState({}, '', url);
      const panel = document.getElementById('q-hits');
      const fresh = document.createElement('div');
      fresh.innerHTML = solveQPanel(q, rankProblems(q));
      const node = fresh.firstElementChild;
      if (panel && node) panel.replaceWith(node);
      else if (panel && !node) panel.remove();
      else if (node) document.querySelector('.solve-hero').after(node);
      bindSolve._reqOnly();
      if (focusOut && node) node.scrollIntoView({ block: 'start' });
    };
    if (qform) qform.addEventListener('submit', e => { e.preventDefault(); applyQ(qin.value, true); });
    if (qin) {
      let t = null;
      qin.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => applyQ(qin.value, false), 220); });
    }

    // ONE hide mechanism. The old code juggled style.display, then read `!== 'none'` back off it to
    // decide whether a section was empty -- which is false for a card the kind filter had just RESET
    // to ''. A class plus `display:none!important` in styles.css also survives .solve-card's own
    // display rule, which a bare [hidden] attribute would not.
    const f = document.getElementById('solve-filter'); if (!f) return;
    f.querySelectorAll('button').forEach(b => b.onclick = () => {
      f.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on');
      const k = b.dataset.k;
      document.querySelectorAll('#solve-list .solve-card').forEach(c => c.classList.toggle('is-off', !(k === 'all' || c.dataset.kind === k)));
      document.querySelectorAll('#solve-list .solve-section').forEach(sec => {
        sec.classList.toggle('is-off', ![...sec.querySelectorAll('.solve-card')].some(c => !c.classList.contains('is-off')));
      });
    });
  }
  // Re-bind only the control that a re-rendered #q-hits destroys.
  bindSolve._reqOnly = function () {
    const qreq = document.getElementById('q-req');
    if (qreq) qreq.onclick = () => openRequestModal((document.getElementById('solve-q') || {}).value || '');
  };

  // ---------- Protocol view ----------
  function protocolLoading() {
    return `<div class="empty"><h1>Building your protocol…</h1><p class="muted">Loading movement & food data.</p></div>`;
  }
  // (Removed the old ownership banner — protocols belong to no one; contributing experts are
  // featured on the protocol page instead.)
  // Contextual leads: the steward sits in the column of their domain (physio→Move, dietitian→
  // Fuel, pharmacist→Stack); a supplement partner sits by Stack, a gym/clinic by Move. No
  // standalone "deals" block — a lead only appears next to the thing it fulfils.
  // Local businesses that have earned a place (backlink-verified partners). No expert "owns"
  // the protocol.
  // This protocol belongs to no one. The experts who contribute most to it (comments + edits)
  // are FEATURED here — attribution. Their profile links out to their work and details.
  // Root-cause governance panel (verified experts + admin): request adding/removing a root
  // cause for this problem, and approve others' requests. Flow: one relevant peer approves a
  // request, then the superadmin gives the final sign-off before it goes live. A freshly-added
  // root cause shows a "being built" note until its protocol is filled in.
  async function mountRcGovernance(problem, rc) {
    const el = document.getElementById('rc-governance'); if (!el) return;
    if (!PHASE2) return; // expert root-cause governance is Phase 2 — not launched
    const canPropose = ME && (ME.role === 'admin' || ME.domain_verified);
    let html = '';
    if (rc._stub) html += `<div class="rc-stub">🧩 This root cause does not have its full protocol yet. ${canPropose ? 'Add the Move, Fuel and Stack above.' : 'Check back soon, or join the discussion below.'}</div>`;
    if (!canPropose) { el.innerHTML = html; return; }
    let data = { changes: [], threshold: 2 };
    try { data = await api.rootcauseChanges(problem.id); } catch (e) {}
    const open = (data.changes || []).filter(c => c.status === 'pending' || c.status === 'peer_approved');
    const pendHtml = open.length ? open.map(c => {
      const label = c.action === 'add' ? `➕ Add “${esc(c.name || c.root_cause_id)}”` : `➖ Remove “${esc(c.root_cause_id)}”`;
      const mine = +c.mine > 0;
      const peerDone = c.status === 'peer_approved';
      const state = peerDone ? '✅ Approved by a peer · awaiting the admin’s final sign-off' : ((c.by_user ? 'Requested by @' + esc(c.by_user) + ' · ' : '') + 'needs one peer’s approval');
      const btn = peerDone ? '<button class="rcg-endorse done" disabled>Awaiting final approval</button>' : `<button class="rcg-endorse${mine ? ' done' : ''}" data-endorse="${c.id}"${mine ? ' disabled' : ''}>${mine ? '✓ You approved' : 'Approve'}</button>`;
      return `<div class="rcg-row"><div><b>${label}</b>${c.rationale ? `<small>${esc(c.rationale)}</small>` : ''}<em>${state}</em></div>${btn}</div>`;
    }).join('') : '<p class="muted" style="font-size:.85rem;margin:.4rem 0">No open requests for this problem.</p>';
    html += `<div class="rcg-card">
      <div class="rcg-head">🧭 Root-cause governance <span class="rcg-tag">experts</span></div>
      <p class="muted" style="font-size:.85rem;margin:.2rem 0 .6rem">Request adding or removing a root cause for <b>${esc(problem.name)}</b>. One other relevant expert approves your request, then the admin gives the final sign-off before it goes live.</p>
      ${pendHtml}
      <div class="rcg-actions"><button class="admin-btn ok" id="rcg-add">➕ Propose a root cause</button> <button class="admin-btn" id="rcg-remove">➖ Flag “${esc(rc.name.split('(')[0].trim())}” for removal</button></div>
    </div>`;
    el.innerHTML = html;
    el.querySelectorAll('[data-endorse]').forEach(b => b.onclick = async () => {
      try { const r = await api.endorseRootcauseChange(b.dataset.endorse); b.textContent = '✓ You approved'; b.disabled = true; b.classList.add('done');
        if (r.status === 'peer_approved') { alert('Thanks — your approval is in. It now goes to the admin for the final sign-off before it’s live.'); mountRcGovernance(problem, rc); } }
      catch (e) { alert(e.message); }
    });
    const addB = document.getElementById('rcg-add'); if (addB) addB.onclick = () => openRcChangeModal(problem, 'add', rc);
    const rmB = document.getElementById('rcg-remove'); if (rmB) rmB.onclick = () => openRcChangeModal(problem, 'remove', rc);
  }
  function openRcChangeModal(problem, action, rc) {
    if (!ME) return openAuth('login');
    const isAdd = action === 'add';
    const relevant = rc && rc.required_expert_domains && rc.required_expert_domains.length ? rc.required_expert_domains : Object.keys(GRAPH.domains);
    const domOptions = Object.keys(GRAPH.domains).map(d => `<label class="rcg-dom"><input type="checkbox" value="${d}"${relevant.includes(d) ? ' checked' : ''}> ${esc((GRAPH.domains[d] || {}).label || d)}</label>`).join('');
    const m = modal(`<div class="partner-modal"><h2>${isAdd ? 'Propose a root cause' : 'Flag for removal'}</h2>
      <p class="muted">${isAdd ? `Request a new root cause for <b>${esc(problem.name)}</b>. Once a relevant peer approves and the admin signs off, its protocol can be built.` : `Request removing <b>${esc(rc.name)}</b> from ${esc(problem.name)} — a relevant peer approves, then the admin signs off.`}</p>
      ${isAdd ? `<label>Root cause name</label><input id="rcc-name" maxlength="120" placeholder="e.g. Iliotibial band friction">
        <label>How would someone know it’s this? (diagnostic)</label><textarea id="rcc-diag" rows="2" maxlength="400" placeholder="Pain on the outer knee, worse running downhill…"></textarea>` : ''}
      <label>Why? (rationale for the reviewing expert)</label><textarea id="rcc-why" rows="3" maxlength="800" placeholder="Evidence, clinical reasoning…"></textarea>
      <label>Which expert should review this?</label><div class="rcg-doms">${domOptions}</div>
      <button class="cta-primary" id="rcc-save" style="border:none;cursor:pointer;width:100%;margin-top:1rem">Request this change</button></div>`);
    m.querySelector('#rcc-save').onclick = async () => {
      const domains = [...m.querySelectorAll('.rcg-doms input:checked')].map(i => i.value);
      const body = { problem_id: problem.id, action, domains, rationale: (m.querySelector('#rcc-why') || {}).value || '' };
      if (isAdd) { body.name = (m.querySelector('#rcc-name') || {}).value || ''; body.diagnostic = (m.querySelector('#rcc-diag') || {}).value || ''; if (!body.name.trim()) return alert('Name the root cause you want to add.'); }
      else body.root_cause_id = rc.id;
      try { await api.submitRootcauseChange(body); closeModal(); alert('Change requested. +15 reputation. Once a relevant expert approves it, the admin gives the final sign-off — then it’s live.'); mountRcGovernance(problem, rc); }
      catch (e) { alert(e.message); }
    };
  }
  // ---------- the outcome loop UI: Results Ledger + start / check-in / streak / report ----------
  // Adoption is measured by the build action, not a separate "experiment" commitment.
  // We reuse the ledger's running count purely as quiet social proof — shown only when credible.
  async function mountAdoption(problem, rc) {
    const host = document.getElementById('adoption-panel'); if (!host) return;
    let ledger;
    try { ledger = await api.ledger(problem.id, rc.id); } catch (e) { host.innerHTML = ''; return; }
    if (!ledger) { host.innerHTML = ''; return; } // DB off → hide silently
    const n = ledger.running || ledger.total || 0;
    if (n < 3) { host.innerHTML = ''; return; } // don't show weak/zero counts
    host.innerHTML = `<div class="adopt-inner">🧬 <b>${n}</b> ${n === 1 ? 'person is' : 'people are'} building this plan</div>`;
  }
  // Public, k-anonymised cohort outcome (only renders when ≥20 people have a 30/90-day result)
  async function mountPublicOutcome(problem, rc) {
    const host = document.getElementById('outcome-stat'); if (!host) return;
    let stat; try { stat = await api.publicOutcomes(problem.id, rc.id); } catch (e) { return; }
    if (!stat || !stat.n) { host.innerHTML = ''; return; }
    host.innerHTML = `<div class="outcome-proof">🔬 <b>${stat.pct}%</b> of <b>${stat.n}</b> people who tracked this reported their ${esc(problem.name.toLowerCase())} improved. <span class="muted">Real, anonymous outcomes from RNAwiki users.</span></div>`;
  }
  // every shared link carries my ref key so a start from it credits me ("builders brought in")
  // bake the live ledger stat into the shared text (only when it's real: ≥3 outcomes) — the credible bit
  // general "share this protocol" hub — socials text (with stat), plain link, and a blog/embed HTML snippet
  // REMOVED 2026-07-28 (fabrication cluster, v3 Phase -1.4): the "N people helped" counter.
  // `helped` counted people who STARTED a protocol or built a stack. outcome_checkins is 0 —
  // nobody has ever reported an outcome — so "helped" asserted a result the data cannot support,
  // and most of the counted keys were the audit's own driven sessions. Do not reinstate this
  // without an outcome measure behind it.
  // REMOVED 2026-07-30: mountHomeStat(). It was `async function mountHomeStat() { }` -- an empty
  // stub -- and the `#home-stat` div it was meant to fill was rendered with the `hidden` attribute.
  // Dead in both directions, in both documents. The div is gone from the home markup and the call
  // is gone from route().

  // ---------- My Plan — the personal execution page (the "kitchen") ----------
  function planLoading() { return `<div class="empty"><h1>Loading your plan…</h1></div>`; }
  function emptyPlan() {
    return `${crumbs([{ label: 'Home', href: '#/' }, { label: 'My Plan' }])}
      <section class="plan-empty">
        <div class="plan-empty-ico">🧪</div>
        <h1>You haven't started a plan yet</h1>
        <p class="hero-lead">Find your root cause, then tap <b>“Start this plan”</b> — this is where you'll pick your movements and supplements and track your food, day by day. One place, one plan.</p>
        <a class="cta-primary" href="#/solve">Find my root cause →</a>
      </section>`;
  }
  // done = is this protocol's keystone done today; key = "pid/rcid"; label = protocol name (shown only when >1 protocol)
  function keystoneCardHtml(rc, done, key, label) {
    if (!rc.keystone) return '';
    return `<div class="keystone-card"><div class="ks-badge">⭐ ${label ? esc(label) + ' — keystone' : 'Your one keystone'}</div><p class="ks-one">${esc(rc.keystone.one)}</p>
      <div class="plan-streak"><button class="ks-done-btn ${done ? 'done' : ''}" data-ks="${esc(key)}">${done ? '✅ Done today' : 'Mark done today'}</button></div></div>`;
  }
  function buildSteps(P) {
    const s = [];
    if ((P.strengthen || []).length) s.push({ title: 'Movements', icon: '💪', kind: 'move', bucket: 'strengthen', items: P.strengthen });
    if ((P.stretch || []).length) s.push({ title: 'Stretches', icon: '🧘', kind: 'move', bucket: 'stretch', items: P.stretch });
    if ((P.stack || []).length) s.push({ title: 'Supplements', icon: '💊', kind: 'supp', bucket: 'stack', items: P.stack });
    return s;
  }
  // Look up a catalogue item by id for a build bucket (used when a user adds their own item)
  function catalogItem(bucket, id) {
    if (bucket === 'stack') return byId[id];
    const EX = window.RNAWIKI_EXERCISES; return EX && EX.exercises.find(e => e.id === id);
  }
  // Search the full catalogue for a build section, excluding what's already listed
  function catalogSearch(bucket, q, excludeIds) {
    q = (q || '').trim().toLowerCase(); if (q.length < 2) return [];
    const ex = new Set(excludeIds);
    if (bucket === 'stack') {
      return D.compounds.filter(c => !ex.has(c.id) && (c.name.toLowerCase().includes(q) || (c.category || '').toLowerCase().includes(q)))
        .sort((a, b) => (b.stars || 0) - (a.stars || 0)).slice(0, 6);
    }
    const EX = window.RNAWIKI_EXERCISES; if (!EX) return [];
    const wantStretch = bucket === 'stretch';
    return EX.exercises.filter(e => !ex.has(e.id) && (wantStretch ? e.kind === 'stretch' : e.kind !== 'stretch')
      && ((e.name || '').toLowerCase().includes(q) || (e.primaryMuscles || []).join(' ').toLowerCase().includes(q))).slice(0, 6);
  }

  // ---- Protocol functions: small interactive tools, each matched to a root problem ----
  // Every protocol gets ONE default (best keyword match); users add more at the end of building.
  const PLAN_FUNCTIONS = [
    { id: 'walk', icon: '🚶', name: 'Post-meal walk timer', kind: 'timer', target: 10, unit: 'min',
      desc: 'A 10-minute walk after your biggest meal blunts the glucose spike.',
      how: 'Tap start after eating — it counts down 10 minutes. Done when it hits zero.',
      match: ['glucose', 'insulin', 'blood sugar', 'metabolic', 'diabet', 'a1c'], tg: true },
    { id: 'breath', icon: '🌬️', name: 'Box-breathing timer', kind: 'timer', target: 4, unit: 'min',
      desc: 'Slow box breathing shifts you into the calm, parasympathetic state.',
      how: 'Follow the 4-4-4-4 pace for 4 minutes whenever stress or racing thoughts hit.',
      match: ['anx', 'stress', 'cortisol', 'panic', 'overwhelm', 'nervous'], tg: true },
    { id: 'plants', icon: '🥦', name: 'Plant-diversity counter', kind: 'counter', target: 30, unit: 'plants', period: 'week',
      desc: '30+ different plants a week is the strongest lever for microbiome diversity.',
      how: 'Add each unique plant you eat. Resets weekly — aim for 30.',
      match: ['gut', 'microbiome', 'fiber', 'digest', 'bloat', 'ibs', 'constipat'], tg: true },
    // NB: progressive-overload logging is now built into every strength movement in the tracker (per-exercise
    // set/rep logging), so it's no longer a separate selectable tool. Old plans that picked 'overload' just ignore it.
    { id: 'steps', icon: '👟', name: 'Daily step counter', kind: 'counter', target: 8000, unit: 'steps', period: 'day',
      desc: 'Daily steps drive fat loss and a cardio base more reliably than cardio blocks.',
      how: 'Log your step count as you go. Target 8,000 a day.',
      match: ['fat', 'weight', 'cardio', 'endur', 'sedentary', 'circulation'], tg: true },
    { id: 'hydration', icon: '💧', name: 'Hydration counter', kind: 'counter', target: 8, unit: 'glasses', period: 'day',
      desc: 'Even mild dehydration drops energy, focus and training output.',
      how: 'Tap + for each glass. Target 8 a day.',
      match: ['energy', 'skin', 'headache', 'focus', 'fatigue', 'kidney'], tg: true },
    { id: 'protein', icon: '🥩', name: 'Protein-per-meal', kind: 'counter', target: 4, unit: 'protein meals', period: 'day',
      desc: 'Protein at each meal triggers muscle repair and kills appetite — the lever for muscle, fat loss and cravings.',
      how: 'Tap + for each meal with a palm-sized protein serving. Aim for 3–4 a day — no weighing, just the portion.',
      match: ['muscle', 'strength', 'hypertrophy', 'sarcopenia', 'lean mass', 'menopause', 'craving', 'appetite', 'satiety'], tg: true },
    { id: 'fermented', icon: '🥬', name: 'Fermented-foods counter', kind: 'counter', target: 3, unit: 'servings', period: 'day',
      desc: 'Fermented foods raise gut-microbiome diversity even more than fibre (Stanford RCT).',
      how: 'Tap + for each serving — yoghurt, kefir, kimchi, sauerkraut, kombucha. A few a day.',
      match: ['gut', 'microbiome', 'digest', 'bloat', 'ibs', 'immun', 'inflamm'], tg: true },
    { id: 'pain', icon: '🚦', name: 'Pain traffic-light', kind: 'triage',
      desc: 'The hurt-vs-harm rule: load the joint enough to heal without flaring it — the #1 reason people quit rehab.',
      how: 'After each rehab session, tap how it felt. I tell you whether to progress, hold, or back off.',
      match: ['pain', 'knee', 'back', 'neck', 'shoulder', 'hip', 'tendin', 'tendon', 'joint', 'stiff', 'ache', 'rehab', 'sciatic', 'plantar'], tg: true },
    { id: 'sigh', icon: '🌬️', name: 'Physiological sigh', kind: 'timer', target: 2, unit: 'min',
      desc: 'The fastest way to drop acute anxiety — a double inhale then a long exhale.',
      how: 'Tap start: two inhales through the nose, one long exhale through the mouth — repeat for 2 min. In a spike: sigh ×3 · name 3 things you see · sip water.',
      match: ['anx', 'panic', 'cortisol', 'overwhelm', 'nervous', 'racing'], tg: true },
    { id: 'craving', icon: '🌊', name: 'Craving-surf timer', kind: 'timer', target: 10, unit: 'min',
      desc: 'Cravings peak then fade in about 10 minutes — ride it out instead of fighting it.',
      how: 'When a craving hits, tap start and do something else for 10 minutes. It almost always passes.',
      match: ['craving', 'appetite', 'sugar', 'snack', 'binge'], tg: true },
    { id: 'focus', icon: '🎯', name: 'Focus blocks', kind: 'counter', target: 4, unit: 'blocks', period: 'day',
      desc: 'Deep-work blocks beat scattered hours — and the hard part is starting.',
      how: 'Write your ONE next step, do a 25-min block, tap +. Before each break, jot the next step so restarting is easy. Aim for 4 a day.',
      match: ['focus', 'adhd', 'concentration', 'brain fog', 'procrastin', 'distract', 'productivity'], tg: true },
    { id: 'zone2', icon: '🏃', name: 'Zone-2 minutes', kind: 'counter', target: 150, unit: 'min', period: 'week', step: 10,
      desc: 'Easy conversational cardio builds the aerobic base — the strongest evidence-backed longevity lever.',
      how: 'Log easy-pace minutes (you can still hold a conversation). Aim for 150 a week.',
      match: ['endur', 'longevity', 'healthspan', 'vo2', 'vascular', 'stamina', 'aerobic'], tg: true },
    { id: 'eatwin', icon: '⏳', name: 'Eating-window (close the kitchen)', kind: 'window', target: 10,
      desc: 'Time-restricted eating lowers fasting insulin and trims visceral fat — the win is closing the kitchen, not counting calories.',
      how: 'Tap when you take your first bite and when you close the kitchen. Aim to keep eating inside a 10-hour window.',
      match: ['insulin', 'glucose', 'visceral', 'belly', 'fat', 'metabolic', 'fasting', 'blood sugar'] },
    { id: 'bp', icon: '🩺', name: 'Home blood-pressure log', kind: 'bp',
      desc: 'Home readings predict outcomes better than the clinic — and seeing the number is what drives it down.',
      how: 'Log a reading (rest 5 min first). I show your 7-day average and flag when it needs a doctor.',
      match: ['blood pressure', 'hypertension', 'bp', 'cardiovascular', 'cholesterol'] },
    { id: 'deload', icon: '🔄', name: 'Deload advisor', kind: 'deload',
      desc: 'Planned recovery weeks are how you break plateaus — 3 weeks push, 1 week back off.',
      how: "I track your training block and tell you which weeks to push and when to deload. Nothing to log.",
      match: ['plateau', 'strength', 'hypertrophy', 'muscle', 'overtrain', 'stall'] },
    { id: 'adhere', icon: '📅', name: 'Daily-dose adherence', kind: 'adherence',
      desc: 'Slow treatments only work with near-perfect daily use over months — this keeps you on it and shows the proof.',
      how: 'Tap ✅ each day you apply it. I track your streak and remind you to snap a monthly progress photo (kept privately in your own album).',
      match: ['hair', 'minoxidil', 'finasteride', 'tretinoin', 'acne', 'skin', 'hormonal treatment', 'thyroid'] },
    { id: 'win', icon: '🌟', name: 'One small win', kind: 'log',
      desc: 'Naming one tiny win a day is a proven lever against low mood (behavioural activation).',
      how: 'Each day, jot one small thing you did. That is the whole exercise.',
      match: ['depress', 'low mood', 'anhedonia', 'burnout', 'motivation'] },
    { id: 'symptom', icon: '📈', name: 'Symptom check', kind: 'scale', trend: true,
      scale: [{ v: 1, e: '😣' }, { v: 2, e: '😕' }, { v: 3, e: '😐' }, { v: 4, e: '🙂' }, { v: 5, e: '😄' }],
      desc: 'A 5-second daily read so you can actually see what moves your symptoms.',
      how: "Tap how you feel today. Over time you'll see the trend and what precedes your good days.",
      match: ['menopause', 'hot flash', 'migraine', 'headache', 'acne', 'breakout', 'brain fog', 'fog', 'inflamm', 'flare', 'ibs', 'mood'], tg: true },
    { id: 'readiness', icon: '🔋', name: 'Readiness check', kind: 'scale',
      scale: [{ v: 1, e: '😴', label: 'Wiped', g: "Take it easy or rest today — you'll gain more by recovering." }, { v: 2, e: '😐', label: 'OK', g: 'Train as planned.' }, { v: 3, e: '💪', label: 'Fresh', g: 'Good day to push a little harder.' }],
      desc: 'A 5-second morning read: push hard today, or recover.',
      how: "Tap how recovered you feel. I'll tell you whether to push or back off.",
      match: ['overtrain', 'recovery', 'under-recover', 'fatigue', 'plateau', 'burnout'], tg: true },
    { id: 'sleepwin', icon: '🛏️', name: 'Sleep-window tracker', kind: 'sleep',
      desc: 'The core insomnia fix (CBT-I sleep restriction): match your time in bed to time actually asleep, and sleep gets deeper and faster.',
      how: 'Each morning, log when you got in bed, roughly fell asleep, and woke. It tracks your sleep efficiency and tells you when to shift your bedtime.',
      match: ['sleep', 'insomnia', 'fall asleep', 'waking', 'awake', 'circadian', 'tired', 'jet lag', 'restless'], tg: true },
    { id: 'wake', icon: '⏰', name: 'Fixed wake-time reminder', kind: 'reminder',
      desc: 'A constant wake time anchors your body clock — the biggest lever for sleep.',
      how: 'Set one wake time; the bot nudges you nightly to protect your wind-down.',
      match: ['sleep', 'insomnia', 'circadian', 'tired', 'wake', 'jet lag'] },
    { id: 'sunlight', icon: '☀️', name: 'Morning-sunlight reminder', kind: 'reminder',
      desc: '10 minutes of morning light sets your clock and lifts daytime mood.',
      how: 'The bot reminds you to get outside within an hour of waking.',
      match: ['mood', 'vitamin d', 'seasonal', 'depress', 'low energy', 'winter'] },
  ];
  function fnById(id) { return PLAN_FUNCTIONS.find(f => f.id === id); }
  function defaultFunctionFor(problem, rc) {
    const hay = [problem.category, problem.name, rc.name, rc.keystone && rc.keystone.one, rc.keystone && rc.keystone.why].filter(Boolean).join(' ').toLowerCase();
    const hit = PLAN_FUNCTIONS.find(f => f.match.some(k => hay.includes(k)));
    return (hit || fnById('hydration')).id; // hydration is the universal fallback
  }
  // ISO-ish week key for weekly counters (year + week number)
  function weekKey() { const d = new Date(); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); return localISO(d); }
  // ---- Sleep-window (CBT-I sleep restriction) helpers ----
  function slpToMin(t) { if (!t || !/^\d{1,2}:\d{2}$/.test(t)) return null; const [h, m] = t.split(':').map(Number); return h * 60 + m; }
  function nowHM() { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
  // From in-bed / asleep / woke clock times (spanning midnight) → time in bed, time asleep, sleep efficiency %
  function computeSleep(s) {
    const ib = slpToMin(s.inBed), as = slpToMin(s.asleep), wk = slpToMin(s.woke);
    if (ib == null || as == null || wk == null) return null;
    const norm = x => x < ib ? x + 1440 : x; // times after the in-bed clock time roll into the next day
    const tib = norm(wk) - ib, tst = norm(wk) - norm(as);
    if (tib <= 0 || tst <= 0 || tst > tib) return null;
    return { tib, tst, se: Math.min(100, Math.round(tst / tib * 100)) };
  }
  function sleepEff7(plan) { const log = plan.log || {}; const tk = today(); let sum = 0, n = 0; for (let i = 0; i < 7; i++) { const d = new Date(); d.setDate(d.getDate() - i); const dl = log[localISO(d)]; if (dl && dl.sleep && dl.sleep.se != null) { sum += dl.sleep.se; n++; } } return { avg: n ? Math.round(sum / n) : 0, nights: n }; }
  // CBT-I guidance: SE≥90 extend window, 85–90 hold, <85 tighten (later bedtime, fixed wake)
  function sleepRec(avg, nights) {
    if (nights < 3) return 'Log 3+ nights for your sleep-window guidance.';
    if (avg >= 90) return 'Efficient — try going to bed 15 min earlier tonight.';
    if (avg >= 85) return 'Dialed in. Hold this window and keep your wake time fixed.';
    return 'Tighten your window: go to bed 15 min later, keep the same wake time.';
  }

  async function renderPlan() {
    try { await ensureProtocolData(); } catch (e) { app.innerHTML = emptyPlan(); return; }
    const plan = getPlan();
    if (!plan) { app.innerHTML = emptyPlan(); return; }
    // A protocol is being built → show the builder for the draft
    if (plan.draft && plan.draft.pid) {
      const found = findRootCause(plan.draft.pid, plan.draft.rcid);
      if (!found) { plan.draft = null; setPlan(plan); return renderPlan(); }
      const { problem, rc } = found; const P = generateProtocol(rc);
      return renderPlanBuilder(plan, problem, rc, P);
    }
    // Otherwise the merged daily tracker across every protocol they run
    if (planProtocols(plan).length) return renderPlanTracking(plan);
    app.innerHTML = emptyPlan();
  }

  // ---- Builder: browse → learn → select each category, then confirm. Operates on plan.draft only. ----
  function renderPlanBuilder(plan, problem, rc, P) {
    const dr = plan.draft;
    const steps = buildSteps(P);
    const allMoves = [...(P.strengthen || []), ...(P.stretch || [])].map(e => e.id);
    const allSupp = (P.stack || []).map(c => c.id);
    // The final wizard stage is the Functions picker (index === steps.length), even if there are no item steps.
    if ((dr.step || 0) >= steps.length) return renderPlanFunctions(plan, problem, rc, P, steps);
    const si = Math.max(0, Math.min(dr.step || 0, steps.length - 1));
    const step = steps[si]; const isLast = si === steps.length - 1;
    const selMoves = () => { const d = getDraft(); return d && Array.isArray(d.moves) ? d.moves : allMoves; };
    const selSupps = () => { const d = getDraft(); const s = d && d.supps; return s === 'none' ? [] : (Array.isArray(s) ? s : allSupp); };
    const mSel = selMoves(), sSel = selSupps();
    const bucket = step.bucket;
    // user-added items for this section (that aren't already in the default list)
    const extraIds = (((dr.extra || {})[bucket]) || []).filter(id => !step.items.some(it => it.id === id));
    const extraItems = extraIds.map(id => catalogItem(bucket, id)).filter(Boolean);
    const dispItems = step.items.concat(extraItems);
    const items = dispItems.map(it => {
      const custom = extraIds.includes(it.id) ? '<span class="build-custom">Your pick</span>' : '';
      if (step.kind === 'move') { const on = mSel.includes(it.id); return `<div class="build-item ${on ? 'sel' : ''}"><input type="checkbox" class="build-cb" data-move="${esc(it.id)}" ${on ? 'checked' : ''} aria-label="Include ${esc(it.name)}">${exerciseCard(it)}${custom}</div>`; }
      const on = sSel.includes(it.id); return `<div class="build-item ${on ? 'sel' : ''}"><input type="checkbox" class="build-cb" data-supp="${it.id}" ${on ? 'checked' : ''} aria-label="Include ${esc(it.name)}">${stackCard(it)}${custom}</div>`;
    }).join('');
    const chips = steps.map((s, i) => `<span class="bstep ${i === si ? 'on' : i < si ? 'done' : ''}">${s.icon} ${s.title}</span>`).join('<span class="bsep">›</span>') + '<span class="bsep">›</span><span class="bstep">🧩 Tools</span><span class="bsep">›</span><span class="bstep">🍽️ Fuel</span>';
    const count = dispItems.filter(it => (step.kind === 'move' ? mSel : sSel).includes(it.id)).length;
    const foodOnly = step.kind === 'supp' ? `<button class="chip food-only ${dr.supps === 'none' ? 'on' : ''}" id="food-only">🍚 ${dr.supps === 'none' ? '✓ ' : ''}I'll go food-only — no supplements</button>` : '';
    const ixn = step.kind === 'supp' ? `<div id="build-ixn">${sSel.length > 1 ? interactionPanel((P.stack || []).filter(c => sSel.includes(c.id))) : ''}</div>` : '';
    const addWord = step.title.toLowerCase().replace(/s$/, '');
    app.innerHTML = `${crumbs([{ label: 'Home', href: '#/' }, { label: 'Build my plan' }])}
      <section class="plan-hd"><div><div class="kicker">Build your plan · ${esc(problem.name)}</div><h1>${step.icon} ${esc(step.title)}</h1>
        <p class="muted">Browse each one, read what it does, and keep what you'll actually do — this becomes <b>your</b> protocol.</p></div></section>
      <div class="build-steps">${chips}</div>
      ${foodOnly}
      <div class="build-list">${items}</div>
      <div class="build-add">
        <label class="build-add-lbl" for="build-search">＋ Add your own ${esc(addWord)}</label>
        <input type="text" id="build-search" class="build-search" placeholder="Search the full library…" autocomplete="off">
        <div id="build-results" class="build-results"></div>
      </div>
      ${ixn}
      <div class="build-nav">
        ${si > 0 ? '<button class="cta-ghost" id="build-back">← Back</button>' : `<a class="cta-ghost" href="#/protocol/${problem.id}/${rc.id}">← Cancel</a>`}
        <span class="build-count"><b>${count}</b> of ${dispItems.length} kept</span>
        <button class="cta-primary" id="build-next">${isLast ? 'Next: Tools →' : 'Next: ' + steps[si + 1].title + ' →'}</button>
      </div>
`;
    // Learning about an item opens a mini-window over the builder — never navigates away.
    const byExId = {}; [...(P.strengthen || []), ...(P.stretch || [])].forEach(e => byExId[e.id] = e); extraItems.forEach(x => { if (bucket !== 'stack') byExId[x.id] = x; });
    const byCId = {}; (P.stack || []).forEach(c => byCId[c.id] = c); extraItems.forEach(x => { if (bucket === 'stack') byCId[x.id] = x; });
    wireItemModals('.build-list', byExId, byCId);
    // Search-to-add: pull any item from the full library into this section
    const addExtra = id => {
      const d = getDraft(); if (!d) return; d.extra = d.extra || {}; d.extra[bucket] = d.extra[bucket] || [];
      if (!d.extra[bucket].includes(id)) d.extra[bucket].push(id);
      if (bucket === 'stack') { const cur = d.supps === 'none' ? [] : (Array.isArray(d.supps) ? d.supps.slice() : allSupp.slice()); if (!cur.includes(id)) cur.push(id); d.supps = cur; }
      else { const cur = Array.isArray(d.moves) ? d.moves.slice() : allMoves.slice(); if (!cur.includes(id)) cur.push(id); d.moves = cur; }
      setDraft(d); renderPlan();
    };
    const search = document.getElementById('build-search'); const results = document.getElementById('build-results');
    if (search) search.oninput = () => {
      const hits = catalogSearch(bucket, search.value, dispItems.map(x => x.id));
      if (!hits.length) { results.innerHTML = search.value.trim().length >= 2 ? '<p class="build-nohit">No matches — try another name.</p>' : ''; return; }
      results.innerHTML = hits.map(h => `<button class="build-res" data-add-id="${esc(h.id)}"><span class="br-name">${esc(h.name)}</span><span class="br-meta">${bucket === 'stack' ? esc(h.category || '') : esc((h.primaryMuscles || []).slice(0, 2).join(', '))}</span><span class="br-add">+ Add</span></button>`).join('');
      results.querySelectorAll('[data-add-id]').forEach(b => b.onclick = () => addExtra(b.dataset.addId));
    };
    const updCount = () => { const el = app.querySelector('.build-count'); if (!el) return; const n = dispItems.filter(it => (step.kind === 'move' ? selMoves() : selSupps()).includes(it.id)).length; el.innerHTML = '<b>' + n + '</b> of ' + dispItems.length + ' kept'; };
    app.querySelectorAll('[data-move]').forEach(cb => cb.onchange = () => {
      const d = getDraft(); if (!d) return; const cur = Array.isArray(d.moves) ? d.moves.slice() : allMoves.slice(); const id = cb.dataset.move;
      const i = cur.indexOf(id); if (cb.checked && i < 0) cur.push(id); else if (!cb.checked && i >= 0) cur.splice(i, 1);
      d.moves = cur; setDraft(d); cb.closest('.build-item').classList.toggle('sel', cb.checked); updCount();
    });
    app.querySelectorAll('[data-supp]').forEach(cb => cb.onchange = () => {
      const d = getDraft(); if (!d) return; const cur = d.supps === 'none' ? [] : (Array.isArray(d.supps) ? d.supps.slice() : allSupp.slice()); const id = cb.dataset.supp;
      const i = cur.indexOf(id); if (cb.checked && i < 0) cur.push(id); else if (!cb.checked && i >= 0) cur.splice(i, 1);
      d.supps = cur; setDraft(d); cb.closest('.build-item').classList.toggle('sel', cb.checked);
      const ix = document.getElementById('build-ixn'); if (ix) ix.innerHTML = cur.length > 1 ? interactionPanel((P.stack || []).filter(c => cur.includes(c.id))) : '';
      updCount();
    });
    const fo = document.getElementById('food-only'); if (fo) fo.onclick = () => { const d = getDraft(); if (!d) return; d.supps = d.supps === 'none' ? allSupp.slice() : 'none'; setDraft(d); renderPlan(); };
    const back = document.getElementById('build-back'); if (back) back.onclick = () => { const d = getDraft(); if (!d) return; d.step = Math.max(0, (d.step || 0) - 1); setDraft(d); renderPlan(); };
    const next = document.getElementById('build-next'); if (next) next.onclick = () => { const d = getDraft(); if (!d) return; d.step = (d.step || 0) + 1; setDraft(d); renderPlan(); }; // last item step advances to the Tools picker
  }

  // ---- Functions picker: the final build stage — default (matched) + optional add-ons ----
  function renderPlanFunctions(plan, problem, rc, P, steps) {
    const defId = defaultFunctionFor(problem, rc);
    // auto-assign the matched default the first time we reach this step (keeps user choices on return)
    if (!Array.isArray((getDraft() || {}).functions)) { const d = getDraft(); if (d) { d.functions = [defId]; setDraft(d); } }
    const sel = (getDraft() && getDraft().functions) || [];
    const ordered = [fnById(defId), ...PLAN_FUNCTIONS.filter(f => f.id !== defId)].filter(Boolean);
    const fnCard = f => {
      const on = sel.includes(f.id); const isDef = f.id === defId;
      return `<div class="fn-card ${on ? 'on' : ''}">
        <div class="fn-top"><span class="fn-ico">${f.icon}</span>
          <div class="fn-head"><div class="fn-name">${esc(f.name)}${isDef ? '<span class="fn-def">★ Matched to your goal</span>' : ''}</div>
          <p class="fn-desc">${esc(f.desc)}</p></div></div>
        <p class="fn-how"><b>How it works:</b> ${esc(f.how)}</p>
        <button class="fn-toggle ${on ? 'on' : ''}" data-fn="${f.id}">${on ? '✓ Added' : '+ Add'}</button>
      </div>`;
    };
    const chips = steps.map(s => `<span class="bstep done">${s.icon} ${s.title}</span>`).join('<span class="bsep">›</span>') + (steps.length ? '<span class="bsep">›</span>' : '') + '<span class="bstep on">🧩 Tools</span><span class="bsep">›</span><span class="bstep">🍽️ Fuel</span>';
    app.innerHTML = `${crumbs([{ label: 'Home', href: '#/' }, { label: 'Build my plan' }])}
      <section class="plan-hd"><div><div class="kicker">Build your plan · ${esc(problem.name)}</div><h1>🧩 Your tools</h1>
        <p class="muted">Small tools that make the plan stick. One's already matched to your goal — add any others you'll use. Change them anytime.</p></div></section>
      <div class="build-steps">${chips}</div>
      <div class="fn-list">${ordered.map(fnCard).join('')}</div>
      <div class="build-nav">
        <button class="cta-ghost" id="fn-back">← Back</button>
        <span class="build-count"><b>${sel.length}</b> tool${sel.length === 1 ? '' : 's'} added</span>
        <button class="cta-primary" id="fn-confirm">✓ Confirm — build my protocol</button>
      </div>`;
    app.querySelectorAll('[data-fn]').forEach(b => b.onclick = () => {
      const d = getDraft(); if (!d) return; const cur = Array.isArray(d.functions) ? d.functions.slice() : []; const id = b.dataset.fn;
      const i = cur.indexOf(id); if (i < 0) cur.push(id); else cur.splice(i, 1);
      d.functions = cur; setDraft(d); renderPlan();
    });
    const back = document.getElementById('fn-back'); if (back) back.onclick = () => { const d = getDraft(); if (!d) return; if (!steps.length) { const p = getPlan(); p.draft = null; setPlan(p); navigate('/protocol/' + problem.id + '/' + rc.id); return; } d.step = steps.length - 1; setDraft(d); renderPlan(); };
    // Confirm: fold the draft into the plan's protocol list (replacing any existing copy of the same protocol) — never overwrites others
    const conf = document.getElementById('fn-confirm'); if (conf) conf.onclick = () => {
      const p = getPlan(); const d = p.draft; if (!d) return;
      // respect the user's exact tool choice: if they removed all tools, keep it empty (don't force the matched default back).
      // The default is only used when they never touched the Tools step (functions still unset).
      const fns = Array.isArray(d.functions) ? d.functions : [defId];
      const prev = planProtocols(p).find(x => x.pid === d.pid && x.rcid === d.rcid);
      const entry = { pid: d.pid, rcid: d.rcid, moves: d.moves, supps: d.supps, functions: fns, startedAt: (prev && prev.startedAt) || today() };
      p.protocols = planProtocols(p).filter(x => !(x.pid === d.pid && x.rcid === d.rcid)).concat(entry);
      p.draft = null; p.justBuilt = prev ? null : { pid: d.pid, rcid: d.rcid }; // celebrate a new protocol only, not an edit
      setPlan(p); renderPlan();
    };
  }

  // ---- Tracking: the finalised protocol — selected items + Fuel (revealed here only) ----
  // Share a self-built protocol (used by the discreet button + the completion popup)
  async function sharePlan(problem, rc) {
    const pl = getPlan();
    let url = (location.origin || 'https://rnawiki.com') + '/protocol/' + problem.id + '/' + rc.id;
    // Share the exact built selections so a client gets THIS plan (mints a share code)
    const entry = planProtocols(pl).find(x => x.pid === problem.id && x.rcid === rc.id);
    if (entry) {
      try { const r = await api.sharePlan(problem.id, rc.id, { moves: entry.moves, supps: entry.supps, functions: entry.functions }); if (r && r.url) url = r.url; } catch (e) {}
    }
    const txt = 'I built a ' + problem.name + ' protocol on RNAwiki 💪 — here it is, ready to use:';
    if (navigator.share) navigator.share({ title: 'RNAwiki', text: txt, url }).catch(() => {});
    else { if (navigator.clipboard) navigator.clipboard.writeText(txt + ' ' + url); if (typeof toast === 'function') toast('Link copied — send it to anyone 🔗'); }
  }
  // A client opening a shared protocol (e.g. from their trainer): preview the exact plan, then adopt it
  async function renderSharedPlan(code) {
    try { await ensureProtocolData(); } catch (e) { app.innerHTML = emptyPlan(); return; }
    const data = await api.sharedPlan(code);
    if (!data || !data.pid) { app.innerHTML = `<div class="empty"><h1>This shared link isn't valid</h1><p>It may have expired. <a href="#/solve">Browse protocols →</a></p></div>`; return; }
    const found = findRootCause(data.pid, data.rcid);
    if (!found) { app.innerHTML = `<div class="empty"><h1>Protocol not found</h1><p><a href="#/solve">Browse protocols →</a></p></div>`; return; }
    const { problem, rc } = found; const P = generateProtocol(rc); const plan = data.plan || {};
    const allMoves = [...(P.strengthen || []), ...(P.stretch || [])];
    const mSel = Array.isArray(plan.moves) ? plan.moves : allMoves.map(e => e.id);
    const foodOnly = plan.supps === 'none';
    const sSel = foodOnly ? [] : (Array.isArray(plan.supps) ? plan.supps : (P.stack || []).map(c => c.id));
    const fns = Array.isArray(plan.functions) && plan.functions.length ? plan.functions : [defaultFunctionFor(problem, rc)];
    const moveNames = allMoves.filter(e => mSel.includes(e.id)).map(e => e.name);
    const suppNames = (P.stack || []).filter(c => sSel.includes(c.id)).map(c => c.name);
    const toolNames = fns.map(id => { const f = fnById(id); return f ? f.icon + ' ' + f.name : null; }).filter(Boolean);
    const who = data.author ? esc(data.author) : 'Someone';
    app.innerHTML = `${crumbs([{ label: 'Home', href: '#/' }, { label: 'Shared protocol' }])}
      <section class="shared-hero">
        <div class="shared-badge">📋 Shared with you</div>
        <h1>${esc(problem.name)} protocol</h1>
        <p class="muted">${who} built this ${esc(problem.name.toLowerCase())} plan and shared it with you — ${esc(rc.name)}.</p>
        <div class="shared-summary">
          ${moveNames.length ? `<div class="ss-block"><b>💪 Movements</b><span>${moveNames.slice(0, 6).map(esc).join(', ')}${moveNames.length > 6 ? ', +' + (moveNames.length - 6) + ' more' : ''}</span></div>` : ''}
          ${suppNames.length ? `<div class="ss-block"><b>💊 Supplements</b><span>${suppNames.slice(0, 6).map(esc).join(', ')}</span></div>` : '<div class="ss-block"><b>🍚 Food-only</b><span>no supplements</span></div>'}
          ${toolNames.length ? `<div class="ss-block"><b>🧩 Tools</b><span>${toolNames.map(esc).join(', ')}</span></div>` : ''}
        </div>
        <div class="shared-cta">
          <button class="cta-primary" id="use-shared">Use this protocol →</button>
        </div>
        <p class="shared-note">You'll get your own copy to track daily.${ME ? '' : ' Create a free account to keep it across devices.'}</p>
      </section>`;
    const use = document.getElementById('use-shared');
    if (use) use.onclick = () => {
      const p = getPlan() || newPlan();
      const entry = { pid: problem.id, rcid: rc.id, moves: mSel, supps: foodOnly ? 'none' : sSel, functions: fns, startedAt: today() };
      // add to the user's plan (merging with any existing protocols) — never wipes their other goals
      p.protocols = planProtocols(p).filter(x => !(x.pid === problem.id && x.rcid === rc.id)).concat(entry);
      p.draft = null; setPlan(p); navigate('/plan');
      if (!ME) setTimeout(() => { if (typeof openAuth === 'function') openAuth('signup'); }, 500); // client makes an account to keep it
    };
  }

  // ===== Outcome-data moat: consent + profile + PDPA data rights =====
  const CONSENT_NOTICE_VERSION = 'v1-2026-07';
  const AGE_OPTS = [['18-24', '18–24'], ['25-34', '25–34'], ['35-44', '35–44'], ['45-54', '45–54'], ['55-64', '55–64'], ['65+', '65+']];
  const SEX_OPTS = [['male', 'Male'], ['female', 'Female'], ['other', 'Other'], ['prefer_not', 'Prefer not to say']];
  const ETH_OPTS = [['chinese', 'Chinese'], ['malay', 'Malay'], ['indian', 'Indian'], ['other', 'Other'], ['prefer_not', 'Prefer not to say']];
  const COND_OPTS = [['diabetes', 'Diabetes / pre-diabetes'], ['hypertension', 'High blood pressure'], ['high_cholesterol', 'High cholesterol'], ['pcos', 'PCOS'], ['thyroid', 'Thyroid condition'], ['heart', 'Heart condition'], ['autoimmune', 'Autoimmune condition'], ['none', 'None of these']];
  let CONSENT = null; // null unknown · true tracked (default) · false explicitly withdrawn
  // Tracking is ON by default (users can withdraw/delete anytime via "Your data"). Only an explicit withdrawal turns it off.
  async function loadConsent() { if (!ME) { CONSENT = null; return; } try { const d = await api.getConsent(); CONSENT = (d && d.consent && d.consent.consent_research === false) ? false : true; } catch (e) { CONSENT = true; } }
   // no opt-in card — capture by default; withdrawal lives in "Your data"
  function wireConsentCard() {
    const a = document.getElementById('consent-open'); if (a) a.onclick = openConsentModal;
    const b = document.getElementById('consent-skip'); if (b) b.onclick = () => { localStorage.setItem('rnawiki_consent_dismiss', '1'); const c = document.querySelector('.consent-card'); if (c) c.remove(); };
  }
  function openConsentModal() {
    const m = modal(`<button class="modal-x" data-close aria-label="Close">×</button>
      <h2>Share your progress — anonymously</h2>
      <div class="consent-notice">
        <p>RNAwiki will use your protocol, symptom check-ins and adherence — and, if you add them, blood markers and wearable data — to build <b>anonymous, aggregated</b> insight into which protocols work, for whom.</p>
        <ul><li>Never shown to other users, never sold.</li><li>Aggregates appear only when ≥20 people are in a group — no one is identifiable.</li><li>View, export, delete your data, or withdraw, anytime.</li><li>I never collect NRIC or any national ID.</li></ul>
        <p class="muted">Not medical advice. Consent version ${CONSENT_NOTICE_VERSION}.</p>
      </div>
      <div class="consent-acts"><button class="cta-primary" id="cm-yes">✓ I consent — share anonymously</button><button class="cta-ghost" id="cm-no">Decline</button></div>`);
    m.querySelector('[data-close]').onclick = closeModal;
    m.querySelector('#cm-yes').onclick = async () => { try { await api.setConsent(true); CONSENT = true; closeModal(); if (typeof toast === 'function') toast('Thank you — your progress helps everyone 🙏'); openProfileModal(); } catch (e) { alert(e.message); } };
    m.querySelector('#cm-no').onclick = async () => { try { await api.setConsent(false); } catch (e) {} CONSENT = false; localStorage.setItem('rnawiki_consent_dismiss', '1'); closeModal(); const c = document.querySelector('.consent-card'); if (c) c.remove(); };
  }
  function openProfileModal() {
    api.getProfile().then(p => {
      p = p || {};
      const sel = (name, opts, cur) => `<select id="pf-${name}" class="pf-in"><option value="">—</option>${opts.map(o => `<option value="${o[0]}"${cur === o[0] ? ' selected' : ''}>${esc(o[1])}</option>`).join('')}</select>`;
      const m = modal(`<button class="modal-x" data-close aria-label="Close">×</button>
        <h2>A little about you <span class="muted" style="font-size:.8rem;font-weight:400">optional</span></h2>
        <p class="muted">So I can show what works for people like you. All optional, all anonymous.</p>
        <div class="pf-grid"><label>Age ${sel('age', AGE_OPTS, p.age_band)}</label><label>Sex ${sel('sex', SEX_OPTS, p.sex)}</label><label>Ethnicity ${sel('eth', ETH_OPTS, p.ethnicity)}</label><label>Height <input id="pf-ht" class="pf-in" type="number" min="80" max="250" value="${p.height_cm != null ? esc(String(p.height_cm)) : ''}" placeholder="cm"></label></div>
        <div class="pf-conds"><span class="pf-conds-h">Any of these? <span class="muted" style="font-weight:400">(optional)</span></span><div class="pf-chips">${COND_OPTS.map(o => `<label class="pf-chip"><input type="checkbox" value="${o[0]}"${(p.conditions || []).includes(o[0]) ? ' checked' : ''}>${esc(o[1])}</label>`).join('')}</div></div>
        <div class="pf-conds"><span class="pf-conds-h">💊 Anything else you take regularly? <span class="muted" style="font-weight:400">(meds &amp; supplements — so the interaction check can see them)</span></span><input id="pf-meds" class="pf-in" style="width:100%" value="${esc((p.meds || []).join(', '))}" placeholder="e.g. metformin, omega-3, statin, magnesium"></div>
        <div class="consent-acts"><button class="cta-primary" id="pf-save">Save</button><button class="cta-ghost" id="pf-skip">Skip</button></div>`);
      m.querySelector('[data-close]').onclick = closeModal; m.querySelector('#pf-skip').onclick = closeModal;
      m.querySelector('#pf-save').onclick = async () => { const conditions = [...m.querySelectorAll('.pf-chip input:checked')].map(c => c.value); const ht = m.querySelector('#pf-ht').value; const meds = (m.querySelector('#pf-meds').value || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 30); try { await api.saveProfile({ age_band: m.querySelector('#pf-age').value || null, sex: m.querySelector('#pf-sex').value || null, ethnicity: m.querySelector('#pf-eth').value || null, conditions, height_cm: ht === '' ? null : +ht, meds }); closeModal(); if (typeof toast === 'function') toast('Saved ✓'); } catch (e) { alert(e.message); } };
    });
  }
  function openDataModal() {
    const hrs = []; for (let h = 5; h <= 22; h++) { const lbl = h === 12 ? '12 pm' : h < 12 ? h + ' am' : (h - 12) + ' pm'; hrs.push(`<option value="${h}">${lbl}</option>`); }
    const m = modal(`<button class="modal-x" data-close aria-label="Close">×</button>
      <h2>Your data & privacy</h2>
      <p class="muted">You're in control. Everything is anonymised in aggregate; here's your own copy.</p>
      <div class="dm-remind" id="md-remind" style="display:none">
        <label class="dm-rem-top"><input type="checkbox" id="md-rem-on"> 📧 <b>Email me my daily plan reminder</b></label>
        <div class="dm-rem-when" id="md-rem-when" style="display:none">Send it at <select id="md-rem-hr" class="pf-in">${hrs.join('')}</select> <span class="muted">your time</span></div>
        <p class="dm-rem-hint muted" id="md-rem-hint"></p>
        <label class="dm-rem-off"><input type="checkbox" id="md-rem-alloff"> 🔕 Turn off <b>all</b> RNAwiki emails</label>
      </div>
      <div class="consent-acts" style="flex-direction:column;align-items:stretch">
        <button class="cta-ghost" id="md-export">⤓ Export my data (JSON)</button>
        <button class="cta-ghost" id="md-profile">✎ Edit my profile</button>
        <button class="cta-ghost danger" id="md-delete">🗑 Delete my research data</button>
      </div>`);
    // daily-reminder opt-in (only shown to signed-in users with an email on file)
    (async () => {
      const st = await api.getEmailReminders(); if (!st) return;
      const box = m.querySelector('#md-remind'), on = m.querySelector('#md-rem-on'), when = m.querySelector('#md-rem-when'), hr = m.querySelector('#md-rem-hr'), hint = m.querySelector('#md-rem-hint'), allOff = m.querySelector('#md-rem-alloff');
      box.style.display = 'block';
      allOff.checked = !!st.emailOff;
      const applyOffState = () => { const off = allOff.checked; on.disabled = off || !st.hasEmail; when.style.display = (on.checked && !off) ? 'block' : 'none'; };
      if (!st.hasEmail) { on.disabled = true; hint.textContent = 'Add an email to your account to turn on reminders.'; }
      else if (!st.emailReady) hint.textContent = 'Reminders are being switched on — you can set your time now.';
      on.checked = !!st.enabled; if (st.hour != null) hr.value = st.hour; applyOffState();
      const save = async () => {
        const enabled = on.checked; when.style.display = enabled ? 'block' : 'none';
        const tzOffset = -new Date().getTimezoneOffset();   // minutes east of UTC (SGT = +480)
        try { await api.setEmailReminders({ enabled, hour: +hr.value, tzOffset }); hint.textContent = enabled ? `On — your plan arrives by email at ${hr.options[hr.selectedIndex].text} daily.` : 'Off.'; if (typeof toast === 'function') toast('Saved ✓'); } catch (e) { hint.textContent = e.message; on.checked = !enabled; }
      };
      on.onchange = save; hr.onchange = () => { if (on.checked) save(); };
      allOff.onchange = async () => { try { await api.setEmailReminders({ allOff: allOff.checked }); applyOffState(); hint.textContent = allOff.checked ? 'All RNAwiki emails are off.' : 'Emails on.'; if (typeof toast === 'function') toast('Saved ✓'); } catch (e) { allOff.checked = !allOff.checked; hint.textContent = e.message; } };
    })();
    m.querySelector('[data-close]').onclick = closeModal;
    m.querySelector('#md-profile').onclick = () => { closeModal(); openProfileModal(); };
    m.querySelector('#md-export').onclick = async () => { try { const d = await api.exportMyData(); const blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'rnawiki-my-data.json'; a.click(); } catch (e) { alert(e.message); } };
    m.querySelector('#md-delete').onclick = async () => { if (!confirm('Delete your research data (check-ins, markers, wearables, profile) and withdraw consent? Your account and tracker stay.')) return; try { await api.deleteMyData(); CONSENT = false; closeModal(); if (typeof toast === 'function') toast('Deleted — consent withdrawn'); } catch (e) { alert(e.message); } };
  }
  const MARKERS = [['hba1c', 'HbA1c', '%'], ['fasting_glucose', 'Fasting glucose', 'mmol/L'], ['ldl', 'LDL cholesterol', 'mmol/L'], ['hdl', 'HDL cholesterol', 'mmol/L'], ['triglycerides', 'Triglycerides', 'mmol/L'], ['total_chol', 'Total cholesterol', 'mmol/L'], ['bp_sys', 'Blood pressure (systolic)', 'mmHg'], ['bp_dia', 'Blood pressure (diastolic)', 'mmHg'], ['testosterone', 'Testosterone', 'nmol/L'], ['shbg', 'SHBG', 'nmol/L'], ['tsh', 'TSH', 'mIU/L'], ['ft4', 'Free T4', 'pmol/L'], ['ferritin', 'Ferritin', 'µg/L'], ['crp', 'CRP', 'mg/L'], ['vit_d', 'Vitamin D', 'nmol/L'], ['apob', 'ApoB', 'g/L'], ['lpa', 'Lipoprotein(a)', 'nmol/L'], ['fasting_insulin', 'Fasting insulin', 'mIU/L'], ['homa_ir', 'HOMA-IR', ''], ['estradiol', 'Estradiol', 'pmol/L'], ['dhea_s', 'DHEA-S', 'µmol/L'], ['uric_acid', 'Uric acid', 'µmol/L'], ['alt', 'ALT (liver)', 'U/L'], ['egfr', 'eGFR (kidney)', 'mL/min']];
  const MARKER_LABEL = {}, MARKER_UNIT = {}; MARKERS.forEach(m => { MARKER_LABEL[m[0]] = m[1]; MARKER_UNIT[m[0]] = m[2]; });
  // tiny inline SVG trend line from a numeric series (nulls skipped); returns {svg, delta, last} or null
  function sparkline(series) {
    const vals = series.filter(v => v != null && isFinite(v));
    if (vals.length < 2) return null;
    const w = 180, h = 34, min = Math.min(...vals), max = Math.max(...vals), rng = (max - min) || 1, step = w / (vals.length - 1);
    const pts = vals.map((v, i) => `${(i * step).toFixed(1)},${(h - ((v - min) / rng) * (h - 6) - 3).toFixed(1)}`).join(' ');
    return { svg: `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none" class="spark"><polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`, delta: +(vals[vals.length - 1] - vals[0]).toFixed(1), last: vals[vals.length - 1] };
  }
  async function openHealthModal() {
    const [markers, wearables] = await Promise.all([api.getMarkers().catch(() => []), api.getWearables().catch(() => [])]);
    const opts = MARKERS.map(m => `<option value="${m[0]}">${esc(m[1])} (${esc(m[2])})</option>`).join('');
    const recent = markers.slice(0, 8).map(x => `<li>${esc(MARKER_LABEL[x.marker] || x.marker)}: <b>${esc(String(x.value))}</b> ${esc(x.unit || MARKER_UNIT[x.marker] || '')} <span class="muted">${x.taken_on ? esc(String(x.taken_on).slice(0, 10)) : ''}</span></li>`).join('') || '<li class="muted">No results logged yet.</li>';
    // your-own-trend: reward loop from the metrics you've logged
    const chrono = wearables.slice().reverse();
    const trend = (label, unit, series, goodDown) => { const s = sparkline(series); if (!s) return ''; const dir = s.delta === 0 ? '→' : (s.delta < 0) === goodDown ? '<span style="color:var(--accent)">▼ ' + Math.abs(s.delta) + '</span>' : '▲ ' + Math.abs(s.delta); return `<div class="hm-trend"><div class="hm-trend-h"><span>${label}</span><b>${s.last}${unit} <span class="muted">${dir}</span></b></div>${s.svg}</div>`; };
    const trends = [trend('Weight', 'kg', chrono.map(x => x.weight_kg != null ? +x.weight_kg : null), true), trend('Waist', 'cm', chrono.map(x => x.waist_cm != null ? +x.waist_cm : null), true), trend('Resting HR', 'bpm', chrono.map(x => x.resting_hr != null ? +x.resting_hr : null), true)].filter(Boolean).join('');
    const trendSec = trends ? `<div class="hm-sec"><b>📈 Your trend</b><div class="hm-trends">${trends}</div></div>` : '';
    // re-lab prompt: if a marker's latest reading is >75 days old, nudge a recheck (pairs before/after → proves what worked)
    const now = Date.now(); const seenMk = new Set(); let dueMk = null;
    for (const x of markers) { if (!x.marker || seenMk.has(x.marker)) continue; seenMk.add(x.marker); if (!dueMk && x.taken_on && (now - Date.parse(String(x.taken_on).slice(0, 10))) > 75 * 86400000) dueMk = x.marker; }
    const relabSec = dueMk ? `<div class="hm-relab">📊 <b>Time to recheck your ${esc(MARKER_LABEL[dueMk] || dueMk)}.</b> Re-testing and logging it now pairs with your earlier reading — that before/after is the strongest proof your protocol is working.</div>` : '';
    const m = modal(`<button class="modal-x" data-close aria-label="Close">×</button>
      <h2>Track your health data</h2>
      <p class="muted">Optional &amp; anonymous. Blood results and weigh-ins help prove what actually works.</p>
      ${relabSec}
      ${trendSec}
      <div class="hm-sec"><b>🩸 Blood marker</b>
        <div class="hm-row"><select id="hm-marker" class="pf-in">${opts}</select><input id="hm-val" class="pf-in hm-num" type="number" step="any" placeholder="value"><input id="hm-date" class="pf-in" type="date"><button class="fn-step add" id="hm-add">Add</button></div>
        <ul class="hm-list" id="hm-list">${recent}</ul></div>
      <div class="hm-sec"><b>⚖️ Body metrics (today)</b>
        <div class="hm-row"><input id="hm-wt" class="pf-in hm-num" type="number" step="0.1" placeholder="weight kg"><input id="hm-waist" class="pf-in hm-num" type="number" step="0.1" placeholder="waist cm"><input id="hm-rhr" class="pf-in hm-num" type="number" placeholder="resting HR"><input id="hm-steps" class="pf-in hm-num" type="number" placeholder="steps"><input id="hm-sleep" class="pf-in hm-num" type="number" step="0.1" placeholder="sleep hrs"><button class="fn-step add" id="hm-save">Save</button></div>
        <p class="muted" style="font-size:.76rem;margin:.4rem 0 0">Waist is the single best at-home marker of metabolic risk — measure at the belly button, relaxed.</p></div>`);
    m.querySelector('[data-close]').onclick = closeModal;
    m.querySelector('#hm-add').onclick = async () => { const marker = m.querySelector('#hm-marker').value; const value = m.querySelector('#hm-val').value; const taken_on = m.querySelector('#hm-date').value || undefined; if (value === '') return; try { await api.addMarker({ marker, value: +value, unit: MARKER_UNIT[marker], taken_on }); const list = m.querySelector('#hm-list'); const li = document.createElement('li'); li.innerHTML = `${esc(MARKER_LABEL[marker])}: <b>${esc(value)}</b> ${esc(MARKER_UNIT[marker])} <span class="muted">${esc(taken_on || 'today')}</span>`; if (list.querySelector('.muted')) list.innerHTML = ''; list.insertBefore(li, list.firstChild); m.querySelector('#hm-val').value = ''; if (typeof toast === 'function') toast('Logged ✓'); } catch (e) { alert(e.message); } };
    m.querySelector('#hm-save').onclick = async () => { const wt = m.querySelector('#hm-wt').value, wst = m.querySelector('#hm-waist').value, rhr = m.querySelector('#hm-rhr').value, stp = m.querySelector('#hm-steps').value, slp = m.querySelector('#hm-sleep').value; if (wt === '' && wst === '' && rhr === '' && stp === '' && slp === '') return; try { await api.saveWearable({ day: today(), weight_kg: wt === '' ? undefined : +wt, waist_cm: wst === '' ? undefined : +wst, resting_hr: rhr === '' ? undefined : +rhr, steps: stp === '' ? undefined : +stp, sleep_min: slp === '' ? undefined : Math.round(+slp * 60), source: 'manual' }); closeModal(); if (typeof toast === 'function') toast('Saved ✓'); } catch (e) { alert(e.message); } };
  }

  // ===== Outcome check-ins (baseline / 30d / 90d) — the feedback loop =====
  async function mountCheckins(M, dayLog) {
    const host = document.getElementById('checkin-slot'); if (!host || !ME || !CONSENT) return;
    // find the most-pressing due check-in across the user's protocols
    for (const r of M.resolved) {
      const days = Math.max(0, Math.round((new Date(today() + 'T00:00:00') - new Date((r.pr.startedAt || today()) + 'T00:00:00')) / 86400000));
      let done; try { done = await api.checkinsDone(r.pr.pid, r.pr.rcid); } catch (e) { done = []; }
      let phase = null;
      if (!done.includes('baseline')) phase = 'baseline';
      else if (days >= 90 && !done.includes('d90')) phase = 'd90';
      else if (days >= 30 && !done.includes('d30')) phase = 'd30';
      if (!phase) continue;
      const label = phase === 'baseline' ? 'Set your starting point' : phase === 'd30' ? "You're 30 days in — how's it going?" : "90 days in — how did it go?";
      host.innerHTML = `<div class="checkin-banner"><span>📋 <b>${esc(r.problem.name)}:</b> ${label} <span class="muted">(20 sec, anonymous)</span></span><button class="cta-primary sm" id="ci-open">Answer</button></div>`;
      document.getElementById('ci-open').onclick = () => openCheckinModal(r, phase, dayLog);
      return; // one at a time
    }
  }
  // Per-category quick self-report item — adds a condition-specific signal on top of the generic 0–10 symptom.
  // Wording is inspired by (not a copy of) public-domain screeners' response scales (PHQ/GAD frequency, PEG pain);
  // treat as a lightweight trend signal, not a validated diagnostic instrument.
  const PROTOCOL_OUTCOME = {
    'Cognitive': { key: 'mood_freq', q: 'Over the last 2 weeks, how often have you felt down, anxious, or unable to focus?', opts: [[0, 'Not at all'], [1, 'Several days'], [2, 'More than half the days'], [3, 'Nearly every day']] },
    'Sleep': { key: 'sleep_quality', q: 'How would you rate your sleep lately?', opts: [[0, 'Very good'], [1, 'Fairly good'], [2, 'Fairly poor'], [3, 'Very poor']] },
    'Hormonal': { key: 'vitality', q: 'How are your energy and libido lately?', opts: [[0, 'Strong / normal'], [1, 'Slightly low'], [2, 'Noticeably low'], [3, 'Very low']] },
    'Musculoskeletal': { key: 'pain_interference', q: 'In the past week, how much did pain interfere with your normal activities?', opts: [[0, 'Not at all'], [3, 'A little'], [6, 'Moderately'], [10, 'A lot']] },
  };
  const STOP_REASON_OPTS = [['didnt_work', "It wasn't working"], ['side_effects', 'Side effects'], ['too_hard', 'Too hard to keep up'], ['cost', 'Cost'], ['got_better', 'I got better 🎉'], ['other', 'Other']];
  function openCheckinModal(r, phase, dayLog) {
    const isBaseline = phase === 'baseline';
    // prefill adherence from today's completion where we can
    const M = mergedPlan(getPlan()); const ids = scheduledIds(M, getPlan(), today());
    const st = planDayStats(M, dayLog, ids); const adhPrefill = st.total ? Math.round(st.done / st.total * 100) : '';
    const oc = PROTOCOL_OUTCOME[r.problem.category];
    const extraRow = oc ? `<label class="ci-q">${esc(oc.q)}
      <select id="ci-extra" class="pf-in"><option value="">—</option>${oc.opts.map(o => `<option value="${o[0]}">${esc(o[1])}</option>`).join('')}</select></label>` : '';
    const impRow = isBaseline ? '' : `<label class="ci-q">Compared to when you started, your ${esc(r.problem.name.toLowerCase())} is:
      <select id="ci-imp" class="pf-in"><option value="">—</option><option value="3">Much better</option><option value="2">Better</option><option value="1">A little better</option><option value="0">No change</option><option value="-1">A little worse</option><option value="-2">Worse</option><option value="-3">Much worse</option></select></label>
      <label class="ci-q">Roughly how well did you stick to it? <input id="ci-adh" class="pf-in" type="number" min="0" max="100" value="${adhPrefill}" placeholder="%"> %</label>
      <label class="ci-q"><input type="checkbox" id="ci-on" checked> Still following this protocol</label>
      <div id="ci-stop-wrap" style="display:none"><label class="ci-q">What made you stop? <span class="muted" style="font-weight:400">(this is the most useful thing you can tell me)</span>
        <select id="ci-stop" class="pf-in"><option value="">—</option>${STOP_REASON_OPTS.map(o => `<option value="${o[0]}">${esc(o[1])}</option>`).join('')}</select></label></div>
      <label class="ci-q"><input type="checkbox" id="ci-sfx-on"> I had side effects <span class="muted" style="font-weight:400">(optional)</span></label>
      <div id="ci-sfx-wrap" style="display:none"><input id="ci-sfx" class="pf-in" style="width:100%" maxlength="300" placeholder="e.g. nausea, headache, trouble sleeping…"></div>`;
    const m = modal(`<button class="modal-x" data-close aria-label="Close">×</button>
      <h2>${isBaseline ? 'Your starting point' : 'Your progress'}</h2>
      <p class="muted">${esc(r.problem.name)} · anonymous · helps everyone with the same problem.</p>
      <label class="ci-q">Right now, how bad is it? <span class="muted">(0 none — 10 worst)</span>
        <input id="ci-sym" type="range" min="0" max="10" value="5" class="ci-range"><output id="ci-symv">5</output></label>
      ${extraRow}
      ${impRow}
      <label class="ci-q">Anything you'd add? <span class="muted" style="font-weight:400">(optional)</span><textarea id="ci-note" class="pf-in" rows="2" maxlength="500" placeholder="e.g. what helped most, side effects…"></textarea></label>
      <div class="consent-acts"><button class="cta-primary" id="ci-save">${isBaseline ? 'Save starting point' : 'Submit'}</button><button class="cta-ghost" id="ci-skip">Skip</button></div>`);
    m.querySelector('[data-close]').onclick = closeModal; m.querySelector('#ci-skip').onclick = closeModal;
    const rng = m.querySelector('#ci-sym'), out = m.querySelector('#ci-symv'); rng.oninput = () => out.textContent = rng.value;
    if (!isBaseline) {
      const onBox = m.querySelector('#ci-on'), stopWrap = m.querySelector('#ci-stop-wrap');
      onBox.onchange = () => { stopWrap.style.display = onBox.checked ? 'none' : 'block'; };
      const sfxBox = m.querySelector('#ci-sfx-on'), sfxWrap = m.querySelector('#ci-sfx-wrap');
      sfxBox.onchange = () => { sfxWrap.style.display = sfxBox.checked ? 'block' : 'none'; };
    }
    m.querySelector('#ci-save').onclick = async () => {
      const body = { pid: r.pr.pid, rcid: r.pr.rcid, phase, symptom_0_10: +rng.value, note: (m.querySelector('#ci-note').value || '').trim() || null };
      if (oc) { const ev = m.querySelector('#ci-extra').value; if (ev !== '') body.extra = { [oc.key]: +ev }; }
      if (!isBaseline) {
        const imp = m.querySelector('#ci-imp').value; body.improvement = imp === '' ? null : +imp;
        const adh = m.querySelector('#ci-adh').value; body.adherence_pct = adh === '' ? null : +adh;
        body.still_on = m.querySelector('#ci-on').checked;
        if (!body.still_on) { const sr = m.querySelector('#ci-stop').value; if (sr) body.stop_reason = sr; }
        if (m.querySelector('#ci-sfx-on').checked) { const sf = (m.querySelector('#ci-sfx').value || '').trim(); if (sf) body.side_effects = sf; }
      }
      try { await api.submitCheckin(body); closeModal(); if (typeof toast === 'function') toast('Thank you 🙏 logged anonymously'); const host = document.getElementById('checkin-slot'); if (host) host.innerHTML = ''; } catch (e) { alert(e.message); }
    };
  }

  // The share MOMENT — a celebratory popup shown once, right after the protocol is built
  function buildCelebrateModal(problem, rc) {
    const m = modal(`<div class="build-celebrate">
      <div class="bc-emo">🎉</div>
      <h2>Your protocol is built.</h2>
      <p class="modal-sub">You chose exactly what you'll do for ${esc(problem.name.toLowerCase())}. From here it's just tracking — one day at a time.</p>
      <div class="bc-actions">
        <button class="cta-primary" data-share>🔗 I built my own protocol — share it</button>
        <button class="cta-ghost" data-close>Start tracking →</button>
      </div>
      <p class="bc-hint">Someone with the same problem is looking for exactly this.</p>
    </div>`);
    m.querySelector('[data-close]').onclick = () => closeModal();
    m.querySelector('[data-share]').onclick = () => sharePlan(problem, rc);
  }

  // ---- Render the selected protocol functions as live, deterministic widgets in the tracker ----
  function mountPlanFunctions() {
    const host = document.getElementById('plan-functions'); if (!host) return;
    const render = () => {
      const plan = getPlan(); const M = mergedPlan(plan); const sel = M.functions; if (!sel.length) { host.innerHTML = ''; return; }
      const tg = M.protos[0] || {}; const wk = weekKey();
      const widget = f => {
        if (f.kind === 'reminder') return `<div class="fn-w"><div class="fn-w-h"><span class="fn-ico">${f.icon}</span><b>${esc(f.name)}</b></div><p class="fn-w-sub">${esc(f.how)}</p></div>`;
        if (f.kind === 'counter') {
          const store = f.period === 'week' ? ((plan.fnWeek || {})[wk] || {}) : (planDay(plan).fn || {});
          const v = store[f.id] || 0; const pct = Math.min(100, Math.round(v / f.target * 100));
          const stepBy = f.step || (f.unit === 'steps' ? 500 : 1);
          return `<div class="fn-w"><div class="fn-w-h"><span class="fn-ico">${f.icon}</span><b>${esc(f.name)}</b><span class="fn-w-val">${v}/${f.target} ${esc(f.unit)}${f.period === 'week' ? ' this week' : ''}</span></div>
            <div class="fn-w-bar"><span style="width:${pct}%"></span></div>
            <div class="fn-w-btns"><button class="fn-step" data-fn-dec="${f.id}">−</button><button class="fn-step add" data-fn-inc="${f.id}">+ ${stepBy}</button></div></div>`;
        }
        if (f.kind === 'timer') {
          const done = !!(planDay(plan).fn || {})[f.id];
          return `<div class="fn-w"><div class="fn-w-h"><span class="fn-ico">${f.icon}</span><b>${esc(f.name)}</b>${done ? '<span class="fn-w-done">✓ Done today</span>' : ''}</div>
            <p class="fn-w-sub">${esc(f.how)}</p>
            <div class="fn-timer"><button class="fn-step add" data-timer-start="${f.id}">▶ Start ${f.target} min</button><span class="fn-timer-disp"></span></div></div>`;
        }
        if (f.kind === 'log') {
          const entries = ((plan.tools || {})[f.id] || {}).entries || [];
          const last = entries[entries.length - 1];
          return `<div class="fn-w"><div class="fn-w-h"><span class="fn-ico">${f.icon}</span><b>${esc(f.name)}</b></div>
            <p class="fn-w-sub">${last ? 'Last: <b>' + esc(last.text) + '</b> · ' + esc(last.date) : esc(f.how)}</p>
            <div class="fn-log-row"><input class="fn-log-in" data-fn-log="${f.id}" placeholder="e.g. 60kg × 8" autocomplete="off"><button class="fn-step add" data-log-save="${f.id}">Log</button></div></div>`;
        }
        if (f.kind === 'bp') {
          const b = planDay(plan).bp || {};
          // 7-day average (readings stored per day)
          let ss = 0, ds = 0, n = 0; for (let i = 0; i < 7; i++) { const dl = (plan.log || {})[dISO(i)]; if (dl && dl.bp && dl.bp.sys) { ss += dl.bp.sys; ds += dl.bp.dia || 0; n++; } }
          const avgS = n ? Math.round(ss / n) : 0, avgD = n ? Math.round(ds / n) : 0;
          const guide = !n ? '' : (avgS >= 160 || avgD >= 100) ? '🔴 High — please see a doctor soon.' : (avgS >= 140 || avgD >= 90) ? '🟠 Above target — keep at the plan; recheck weekly.' : (avgS >= 130 || avgD >= 80) ? '🟡 Slightly raised — you\'re on the right track.' : '🟢 In a healthy range — nice.';
          return `<div class="fn-w"><div class="fn-w-h"><span class="fn-ico">${f.icon}</span><b>${esc(f.name)}</b>${n ? `<span class="fn-w-val">7-day avg ${avgS}/${avgD}</span>` : ''}</div>
            <p class="fn-w-sub">${esc(f.how)}</p>
            <div class="bp-row"><input class="ex-in" type="number" inputmode="numeric" placeholder="sys" value="${b.sys != null ? esc(String(b.sys)) : ''}" data-bp="sys" aria-label="Systolic"><span class="ex-x">/</span><input class="ex-in" type="number" inputmode="numeric" placeholder="dia" value="${b.dia != null ? esc(String(b.dia)) : ''}" data-bp="dia" aria-label="Diastolic"><span class="bp-unit">mmHg</span></div>
            ${guide ? `<p class="triage-guide ${avgS >= 140 ? 'red' : avgS >= 130 ? 'yellow' : 'green'}">${guide}</p>` : ''}</div>`;
        }
        if (f.kind === 'deload') {
          const days = Math.max(0, Math.round((new Date(today() + 'T00:00:00') - new Date(planStartDate(plan) + 'T00:00:00')) / 86400000));
          const wk = Math.floor(days / 7); const pos = wk % 4; const isDeload = pos === 3;
          return `<div class="fn-w"><div class="fn-w-h"><span class="fn-ico">${f.icon}</span><b>${esc(f.name)}</b><span class="fn-w-val">Week ${pos + 1} of 4</span></div>
            <p class="fn-w-sub">${isDeload ? '' : esc(f.how)}</p>
            <p class="triage-guide ${isDeload ? 'yellow' : 'green'}">${isDeload ? '🔄 <b>Deload week</b> — cut your volume ~40% (lighter loads / fewer sets). Recover and you\'ll come back stronger.' : '💪 <b>Push week</b> — train hard and try to beat last session. Deload in ' + (3 - pos) + ' week' + (3 - pos === 1 ? '' : 's') + '.'}</p></div>`;
        }
        if (f.kind === 'adherence') {
          const doneToday = !!(planDay(plan).fn || {})[f.id];
          const store = (plan.tools || {})[f.id] || {}; const lastPhoto = store.lastPhoto;
          const daysSincePhoto = lastPhoto ? Math.round((new Date(today() + 'T00:00:00') - new Date(lastPhoto + 'T00:00:00')) / 86400000) : 999;
          const photoDue = daysSincePhoto >= 30;
          // applied-day streak
          let s = 0; for (let i = 0; ; i++) { const dl = (plan.log || {})[dISO(i)]; if (dl && dl.fn && dl.fn[f.id]) s++; else if (i === 0) continue; else break; }
          return `<div class="fn-w"><div class="fn-w-h"><span class="fn-ico">${f.icon}</span><b>${esc(f.name)}</b><span class="fn-w-val">🔥 ${s}-day</span></div>
            <div class="fn-w-btns"><button class="fn-step ${doneToday ? 'add' : ''}" data-adhere="${f.id}">${doneToday ? '✅ Applied today' : 'Mark applied'}</button></div>
            <p class="fn-w-sub ${photoDue ? 'over' : ''}">${photoDue ? '📸 Time for a monthly progress photo — snap one, keep it in your album, then tap done.' : (lastPhoto ? 'Next progress photo in ' + (30 - daysSincePhoto) + ' days.' : '📸 Take a baseline progress photo to see your before/after.')}</p>
            ${(photoDue || !lastPhoto) ? `<button class="fn-step" data-photo="${f.id}">📸 Took my photo</button>` : ''}</div>`;
        }
        if (f.kind === 'window') {
          const e = planDay(plan).eat || {}; let status = '';
          if (e.first && e.last) { let dur = slpToMin(e.last) - slpToMin(e.first); if (dur < 0) dur += 1440; const h = Math.floor(dur / 60), m = dur % 60; const within = dur <= f.target * 60; status = `<p class="fn-w-sub ${within ? '' : 'over'}">Eating window: <b>${h}h${m ? m + 'm' : ''}</b> (target ${f.target}h) — ${within ? '✓ nice, inside your window' : '⚠️ over — close it earlier tomorrow'}</p>`; }
          else if (e.first) status = `<p class="fn-w-sub">🍽️ Kitchen open since <b>${esc(e.first)}</b> — aim to close by ${f.target}h later.</p>`;
          return `<div class="fn-w"><div class="fn-w-h"><span class="fn-ico">${f.icon}</span><b>${esc(f.name)}</b></div>
            <p class="fn-w-sub">${esc(f.how)}</p>
            <div class="win-btns"><button class="fn-step ${e.first ? 'add' : ''}" data-eat="first">🍽️ First bite${e.first ? ' · ' + esc(e.first) : ''}</button><button class="fn-step ${e.last ? 'add' : ''}" data-eat="last">🌙 Kitchen closed${e.last ? ' · ' + esc(e.last) : ''}</button></div>${status}</div>`;
        }
        if (f.kind === 'scale') {
          const v = (planDay(plan).fn || {})[f.id]; const opt = (f.scale || []).find(o => o.v === v);
          const btns = (f.scale || []).map(o => `<button class="scl-btn ${v === o.v ? 'on' : ''}" data-scl="${f.id}" data-sclv="${o.v}">${o.e}${o.label ? `<span>${esc(o.label)}</span>` : ''}</button>`).join('');
          let extra = '';
          if (opt && opt.g) extra = `<p class="triage-guide yellow">${esc(opt.g)}</p>`;
          else if (f.trend) { const vals = []; for (let i = 13; i >= 0; i--) vals.push(((plan.log || {})[dISO(i)] || {}).fn ? (plan.log[dISO(i)].fn[f.id] || 0) : 0); if (vals.some(x => x)) extra = `<p class="fn-w-sub">Last 14 days</p>${sparkline(vals)}`; }
          return `<div class="fn-w"><div class="fn-w-h"><span class="fn-ico">${f.icon}</span><b>${esc(f.name)}</b></div>
            <p class="fn-w-sub">${esc(f.how)}</p><div class="scl-btns">${btns}</div>${extra}</div>`;
        }
        if (f.kind === 'triage') {
          const v = (planDay(plan).fn || {})[f.id];
          const guide = { green: 'Fine — progress. Add a rep or a little load next session.', yellow: "Sore but it settled — hold this level, don't push today.", red: 'Sharp, or worse next morning — back off: drop load/reps or rest a day. Lingering pain = too much.' };
          return `<div class="fn-w"><div class="fn-w-h"><span class="fn-ico">${f.icon}</span><b>${esc(f.name)}</b></div>
            <p class="fn-w-sub">${esc(f.how)}</p>
            <div class="triage-btns">
              <button class="tri-btn green ${v === 'green' ? 'on' : ''}" data-tri="${f.id}" data-triv="green">🟢 Fine</button>
              <button class="tri-btn yellow ${v === 'yellow' ? 'on' : ''}" data-tri="${f.id}" data-triv="yellow">🟡 Sore</button>
              <button class="tri-btn red ${v === 'red' ? 'on' : ''}" data-tri="${f.id}" data-triv="red">🔴 Sharp</button>
            </div>${v ? `<p class="triage-guide ${v}">${esc(guide[v])}</p>` : ''}</div>`;
        }
        if (f.kind === 'sleep') {
          const s = planDay(plan).sleep || {}; const e7 = sleepEff7(plan);
          return `<div class="fn-w"><div class="fn-w-h"><span class="fn-ico">${f.icon}</span><b>${esc(f.name)}</b>${s.se != null ? `<span class="fn-w-val">${s.se}% last night</span>` : ''}</div>
            <p class="fn-w-sub">Last night — log when you got in bed, roughly fell asleep, and woke:</p>
            <div class="sleep-inputs">
              <label>🛏️ In bed<input class="slp-in" type="time" data-slp="inBed" value="${esc(s.inBed || '')}"></label>
              <label>😴 Asleep ~<input class="slp-in" type="time" data-slp="asleep" value="${esc(s.asleep || '')}"></label>
              <label>☀️ Woke<input class="slp-in" type="time" data-slp="woke" value="${esc(s.woke || '')}"></label>
            </div>
            <p class="fn-w-sub sleep-rec">${e7.nights ? `7-night efficiency <b>${e7.avg}%</b> · ` : ''}${esc(sleepRec(e7.avg, e7.nights))}</p></div>`;
        }
        return '';
      };
      host.innerHTML = `<section class="trk-tools"><h2>🧩 Your tools</h2><div class="fn-w-list">${sel.map(id => { const f = fnById(id); return f ? widget(f) : ''; }).join('')}</div></section>`;
      host.querySelectorAll('[data-fn-inc]').forEach(b => b.onclick = () => bumpCounter(fnById(b.dataset.fnInc), +1, wk, render));
      host.querySelectorAll('[data-fn-dec]').forEach(b => b.onclick = () => bumpCounter(fnById(b.dataset.fnDec), -1, wk, render));
      host.querySelectorAll('[data-timer-start]').forEach(b => b.onclick = () => startFnTimer(fnById(b.dataset.timerStart), b, render));
      host.querySelectorAll('[data-log-save]').forEach(b => b.onclick = () => {
        const id = b.dataset.logSave; const inp = host.querySelector('[data-fn-log="' + id + '"]'); const txt = (inp && inp.value || '').trim(); if (!txt) return;
        const pl = getPlan(); pl.tools = pl.tools || {}; pl.tools[id] = pl.tools[id] || { entries: [] }; pl.tools[id].entries.push({ date: today(), text: txt }); setPlan(pl); if (typeof toast === 'function') toast('Logged ✓'); render();
      });
      // pain traffic-light: one tap → store today's read + guidance
      host.querySelectorAll('[data-tri]').forEach(b => b.onclick = () => { const pl = getPlan(); const d = planDay(pl); d.fn = d.fn || {}; d.fn[b.dataset.tri] = b.dataset.triv; setPlan(pl); render(); });
      // scale (symptom / readiness): one tap → store numeric value
      host.querySelectorAll('[data-scl]').forEach(b => b.onclick = () => { const pl = getPlan(); const d = planDay(pl); d.fn = d.fn || {}; d.fn[b.dataset.scl] = +b.dataset.sclv; setPlan(pl); render(); });
      // eating-window: stamp the current local time for first bite / kitchen closed
      host.querySelectorAll('[data-eat]').forEach(b => b.onclick = () => { const pl = getPlan(); const d = planDay(pl); d.eat = d.eat || {}; d.eat[b.dataset.eat] = nowHM(); setPlan(pl); render(); });
      // blood pressure: store today's reading, refresh the 7-day average + guidance
      host.querySelectorAll('[data-bp]').forEach(inp => inp.onchange = () => { const pl = getPlan(); const d = planDay(pl); d.bp = d.bp || {}; const n = parseInt(inp.value, 10); d.bp[inp.dataset.bp] = (n > 0 && n < 300) ? n : null; setPlan(pl); render(); });
      // daily-dose adherence tap + monthly photo stamp
      host.querySelectorAll('[data-adhere]').forEach(b => b.onclick = () => { const pl = getPlan(); const d = planDay(pl); d.fn = d.fn || {}; d.fn[b.dataset.adhere] = !d.fn[b.dataset.adhere]; setPlan(pl); render(); });
      host.querySelectorAll('[data-photo]').forEach(b => b.onclick = () => { const pl = getPlan(); pl.tools = pl.tools || {}; pl.tools[b.dataset.photo] = pl.tools[b.dataset.photo] || {}; pl.tools[b.dataset.photo].lastPhoto = today(); setPlan(pl); if (typeof toast === 'function') toast('📸 Logged — keep it in your album'); render(); });
      // sleep-window time inputs → recompute efficiency and re-render the recommendation
      host.querySelectorAll('.slp-in').forEach(inp => inp.onchange = () => {
        const pl = getPlan(); const d = planDay(pl); d.sleep = d.sleep || {}; d.sleep[inp.dataset.slp] = inp.value || '';
        const c = computeSleep(d.sleep); d.sleep.se = c ? c.se : null; d.sleep.tib = c ? c.tib : null; d.sleep.tst = c ? c.tst : null;
        setPlan(pl); render();
      });
    };
    render();
  }
  function bumpCounter(f, dir, wk, render) {
    if (!f) return; const pl = getPlan(); const step = f.step || (f.unit === 'steps' ? 500 : 1); const delta = dir * step;
    if (f.period === 'week') { pl.fnWeek = pl.fnWeek || {}; pl.fnWeek[wk] = pl.fnWeek[wk] || {}; pl.fnWeek[wk][f.id] = Math.max(0, (pl.fnWeek[wk][f.id] || 0) + delta); }
    else { const d = planDay(pl); d.fn = d.fn || {}; d.fn[f.id] = Math.max(0, (d.fn[f.id] || 0) + delta); }
    setPlan(pl); render();
  }
  function startFnTimer(f, btn, render) {
    if (!f) return; const disp = btn.parentElement.querySelector('.fn-timer-disp'); let s = f.target * 60;
    btn.disabled = true; btn.textContent = 'Running…';
    const tick = () => {
      const m = Math.floor(s / 60), ss = String(s % 60).padStart(2, '0'); if (disp) disp.textContent = ' ' + m + ':' + ss;
      if (s <= 0) { clearInterval(iv); const pl = getPlan(); const d = planDay(pl); d.fn = d.fn || {}; d.fn[f.id] = true; setPlan(pl); if (typeof toast === 'function') toast(f.name + ' done ✓'); render(); return; }
      s--;
    };
    tick(); const iv = setInterval(tick, 1000);
  }

  // ---- Tracking: a focused, Apple-simple daily tracker — only your selected items, nothing to browse ----
  // Merge every protocol the user runs into one daily view (deduped items, unioned tools, combined food targets)
  function mergedPlan(plan) {
    const protos = planProtocols(plan);
    const keystones = []; const movesMap = {}; const suppsMap = {}; const fnSet = new Set(); const fuel = {}; const resolved = [];
    protos.forEach(pr => {
      const found = findRootCause(pr.pid, pr.rcid); if (!found) return;
      const { problem, rc } = found; const P = generateProtocol(rc); resolved.push({ pr, problem, rc, P });
      if (rc.keystone) keystones.push({ key: pr.pid + '/' + pr.rcid, problem, rc });
      const allMovesArr = [...(P.strengthen || []), ...(P.stretch || [])];
      const mSel = Array.isArray(pr.moves) ? pr.moves : allMovesArr.map(e => e.id);
      allMovesArr.filter(e => mSel.includes(e.id)).forEach(e => { movesMap[e.id] = e; });
      const allSupp = (P.stack || []).map(c => c.id);
      const sSel = pr.supps === 'none' ? [] : (Array.isArray(pr.supps) ? pr.supps : allSupp);
      (P.stack || []).filter(c => sSel.includes(c.id)).forEach(c => { suppsMap[c.id] = c; });
      (pr.functions || []).forEach(f => fnSet.add(f));
      const nt = rc.nutrient_targets || {}; Object.keys(nt).forEach(k => { if (!fuel[k] || (nt[k].target || 0) > (fuel[k].target || 0)) fuel[k] = nt[k]; });
    });
    return { protos, resolved, keystones, moves: Object.values(movesMap), supps: Object.values(suppsMap), functions: [...fnSet], fuel };
  }

  // ---- Set/rep logging helpers (progressive overload built into the checklist) ----
  function prescribedSets(e) { const n = parseInt((e.prescription || {}).sets, 10); return n > 0 ? n : (e.kind === 'stretch' ? 2 : 3); }
  // most recent PRIOR day that has logged sets for this exercise — the number to beat
  function lastSets(plan, exId) {
    const log = plan.log || {}; const tk = today();
    const days = Object.keys(log).filter(d => d < tk && log[d].sets && Array.isArray(log[d].sets[exId]) && log[d].sets[exId].some(s => s && s.reps != null)).sort();
    const d = days[days.length - 1]; return d ? { date: d, sets: log[d].sets[exId] } : null;
  }
  function setsSummary(sets) {
    const done = (sets || []).filter(s => s && s.reps != null); if (!done.length) return '';
    const w = done[0].w; const sameW = done.every(s => s.w === w);
    if (w != null && sameW) return w + 'kg × ' + done.map(s => s.reps).join(', ');
    return done.map(s => (s.w != null ? s.w + 'kg×' : '') + s.reps).join(', ');
  }

  // ---- Tracking: one merged, Apple-simple daily view across every protocol the user runs ----
  function renderPlanTracking(plan) {
    const M = mergedPlan(plan);
    if (!M.resolved.length) { app.innerHTML = emptyPlan(); return; }
    const dayLog = planDay(plan); const streak = planStreak(plan); const multi = M.resolved.length > 1;
    // Milestone celebration — once ever, per milestone crossed
    (function () { const rec = Array.isArray(plan.milestones) ? plan.milestones : []; const hit = STREAK_MILESTONES.filter(m => streak >= m && rec.indexOf(m) < 0); if (hit.length) { const pl = getPlan(); pl.milestones = Array.from(new Set(rec.concat(hit))); setPlan(pl); const top = Math.max.apply(null, hit); setTimeout(() => { if (typeof toast === 'function') toast('🔥 ' + top + '-day streak — ' + milestoneMsg(top)); }, 500); } })();
    // Gentle non-guilt nudge if yesterday was a scheduled miss (and today's not done yet)
    const yKey = dISO(1);
    const beenAround = new Date(planStartDate(plan) + 'T00:00:00') <= new Date(yKey + 'T00:00:00');
    const yShowed = planDayStats(M, (plan.log || {})[yKey], scheduledIds(M, plan, yKey)).showed;
    const todayShowed = planDayStats(M, dayLog, scheduledIds(M, plan, today())).showed;
    const missBanner = (beenAround && !yShowed && !todayShowed && plan.dismissedNudge !== today())
      ? `<div class="miss-banner">🌱 You missed yesterday — no stress. Do today's keystone and you're right back on track. <button class="miss-x" id="miss-dismiss" aria-label="Dismiss">✕</button></div>` : '';
    // Once-a-week recap of the last 7 days
    let rShown = 0, rSessions = 0; for (let i = 1; i <= 7; i++) { const key = dISO(i); const dl = (plan.log || {})[key]; if (planDayStats(M, dl, scheduledIds(M, plan, key)).showed) rShown++; if (dl && dl.sets && Object.keys(dl.sets).some(k => (dl.sets[k] || []).some(s => s && s.reps != null))) rSessions++; }
    const hasPriorWeek = new Date(planStartDate(plan) + 'T00:00:00') <= new Date(dISO(7) + 'T00:00:00');
    const recapCard = (plan.recapWeek !== weekKey() && hasPriorWeek)
      ? `<div class="recap-card">📊 <b>Last 7 days:</b> you showed up <b>${rShown}/7</b> days${rSessions ? ` and logged <b>${rSessions}</b> strength session${rSessions === 1 ? '' : 's'}` : ''}. ${rShown >= 5 ? 'Strong week — keep it rolling.' : rShown >= 3 ? "Solid — let's build on it." : 'Fresh start this week. 💪'} <button class="miss-x" id="recap-dismiss" aria-label="Dismiss">✕</button></div>` : '';
    const moveRow = e => {
      const on = dayLog.done.includes(e.id); const cue = (e.prescription || {}).cue; const sub = [rxLine(e), cue].filter(Boolean).join(' · ');
      const label = `<label class="trk-row"><input type="checkbox" class="plan-cb" data-done="${esc(e.id)}" ${on ? 'checked' : ''} aria-label="Mark ${esc(e.name)} done"><span class="trk-txt"><span class="trk-name">${e.kind === 'stretch' ? '🧘' : '💪'} ${esc(e.name)}</span>${sub ? `<span class="trk-sub">${sub}</span>` : ''}</span><a class="trk-i" href="#/exercise/${esc(e.id)}" aria-label="Details about ${esc(e.name)}">Details</a></label>`;
      // stretches: simple checkbox. strength: add an optional set/rep logger for progressive overload.
      if (e.kind === 'stretch') return `<div class="trk-item ${on ? 'done' : ''}">${label}</div>`;
      const nSets = prescribedSets(e); const todaySets = (dayLog.sets && dayLog.sets[e.id]) || []; const last = lastSets(plan, e.id);
      const setRows = Array.from({ length: nSets }, (_, i) => { const s = todaySets[i] || {};
        return `<div class="ex-setrow"><span class="ex-setn">Set ${i + 1}</span><input class="ex-in" type="number" inputmode="decimal" placeholder="kg" value="${s.w != null ? esc(String(s.w)) : ''}" data-ex="${esc(e.id)}" data-i="${i}" data-field="w" aria-label="Set ${i + 1} weight"><span class="ex-x">×</span><input class="ex-in" type="number" inputmode="numeric" placeholder="reps" value="${s.reps != null ? esc(String(s.reps)) : ''}" data-ex="${esc(e.id)}" data-i="${i}" data-field="r" aria-label="Set ${i + 1} reps"></div>`; }).join('');
      return `<div class="trk-item ${on ? 'done' : ''}">${label}
        <button class="ex-logtoggle" data-logtoggle="${esc(e.id)}">📝 Log sets${last ? ` · <span class="ex-lasthint">last ${esc(setsSummary(last.sets))}</span>` : ''}</button>
        <div class="ex-log" data-exlog="${esc(e.id)}" hidden>${last ? `<div class="ex-last">Last time (${esc(last.date)}): <b>${esc(setsSummary(last.sets))}</b> — beat it 💪</div>` : ''}<div class="ex-setrows">${setRows}</div></div>
      </div>`;
    };
    const suppRow = c => { const on = dayLog.done.includes(c.id); const sub = mdStrip(c.protocol || c.plain || c.bottom || '').slice(0, 60);
      return `<div class="trk-item ${on ? 'done' : ''}"><label class="trk-row"><input type="checkbox" class="plan-cb" data-done="${esc(c.id)}" ${on ? 'checked' : ''} aria-label="Mark ${esc(c.name)} taken"><span class="trk-txt"><span class="trk-name">💊 ${esc(c.name)}</span>${sub ? `<span class="trk-sub">${esc(sub)}</span>` : ''}</span><a class="trk-i" href="#/c/${slug(c.name)}" aria-label="Details about ${esc(c.name)}">Details</a></label></div>`; };
    // Weekly structure: strength only shows on training days; stretches + supps are daily
    const training = isTrainingDay(plan, today());
    const hasStrength = M.moves.some(e => e.kind !== 'stretch');
    const todayMoves = M.moves.filter(e => e.kind === 'stretch' || training);
    const rows = [...todayMoves.map(moveRow), ...M.supps.map(suppRow)].join('');
    const totalItems = todayMoves.length + M.supps.length;
    const doneItems = [...todayMoves, ...M.supps].filter(x => dayLog.done.includes(x.id)).length;
    const restBanner = (hasStrength && !training) ? `<div class="rest-banner">😴 <b>Rest day</b> — recovery. Your keystone, mobility${M.supps.length ? ' and supplements' : ''} still count.${nextTrainingLabel(plan) ? ` Next session: <b>${nextTrainingLabel(plan)}</b>.` : ''}</div>` : '';
    const daysEditor = hasStrength ? `<details class="train-days"><summary>🗓️ Training days · ${planTrainingDays(plan).length}×/week</summary><div class="td-chips">${[0, 1, 2, 3, 4, 5, 6].map(wd => `<button class="td-chip ${planTrainingDays(plan).includes(wd) ? 'on' : ''}" data-td="${wd}">${['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][wd]}</button>`).join('')}</div><p class="td-hint">Strength trains on these days. Keystone, mobility &amp; supplements stay daily.</p></details>` : '';
    const danger = M.supps.length > 1 ? interactionPanel(M.supps) : '';
    const keystoneCards = M.keystones.map(k => keystoneCardHtml(k.rc, !!dayLog.keystones[k.key], k.key, multi ? k.problem.name : '')).join('');
    const subtitle = multi ? `${M.resolved.length} protocols · ${esc(M.resolved.map(r => r.problem.name).join(' · '))}` : esc(M.resolved[0].rc.name);
    const hasFuel = Object.keys(M.fuel).length > 0; // hide Fuel entirely when no protocol has food targets
    // Per-protocol manage list + "add another goal" — the merged plan's control centre
    const manage = `<section class="trk-sec trk-manage"><div class="trk-sec-h"><h2>Your protocols</h2></div>${M.resolved.map(r => `
      <div class="tpm-row"><span class="tpm-name">${r.problem.icon || ''} ${esc(r.problem.name)} <em>${esc(r.rc.name.split('(')[0].trim())}</em></span>
        <span class="tpm-acts"><button class="linkbtn" data-edit-proto="${r.pr.pid}/${r.pr.rcid}">Edit</button> · <button class="linkbtn" data-share-proto="${r.pr.pid}/${r.pr.rcid}">Share</button> · <button class="linkbtn danger" data-remove-proto="${r.pr.pid}/${r.pr.rcid}">Remove</button></span></div>`).join('')}
      <a class="tpm-add" href="#/solve">＋ Add another goal</a>${ME && CONSENT ? ' · <button class="linkbtn" id="health-link">🩸 Track health data</button> · <button class="linkbtn" id="mydata-link">🔒 Your data</button>' : ''}</section>`;
    // Tabbed layout — one focused panel at a time (Apple: reduce what's on screen; progressive disclosure).
    // interaction/safety check is reference info — collapse it so it doesn't crowd the primary action
    const ixWrap = danger ? `<details class="trk-fold"><summary><span class="trk-fold-t">🔬 Interaction &amp; safety check</span><span class="trk-fold-hint">tap to view</span></summary><div class="trk-fold-body">${danger}</div></details>` : '';
    // Priority order: the keystone (the ONE action) is the hero, then the checklist; check-in prompt + interaction check sit below.
    const todayPanel = `${keystoneCards}
      ${totalItems ? `<div class="trk-sec-h"><h3>Today's checklist</h3><span class="trk-prog">${doneItems}/${totalItems}</span></div>` : ''}
      ${restBanner}
      ${totalItems ? `<div class="trk-list">${rows}</div>` : ''}
      ${daysEditor}
      <div id="checkin-slot"></div>
      ${ixWrap}
      ${recapCard}${missBanner}`;
    const fuelPanel = hasFuel ? `<p class="pt-sub">Log what you eat — your protocol's targets fill as you go.</p><div id="fuel-tracker"></div>` : '';
    const toolsPanel = `<div id="plan-functions"></div>`;
    const planPanel = `${manage}`;
    const T = [['today', '☀️ Today', todayPanel]];
    if (hasFuel) T.push(['fuel', '🍽️ Fuel', fuelPanel]);
    if (M.functions.length) T.push(['tools', '🧩 Tools', toolsPanel]);
    T.push(['plan', '⚙️ Plan', planPanel]);
    app.innerHTML = `${crumbs([{ label: 'Home', href: '#/' }, { label: 'My Plan' }])}
      <section class="plan-hd trk-hd"><div><div class="kicker">My Plan</div><h1>Today</h1><p class="muted">${subtitle}</p></div>
        <div class="plan-hd-actions"><a class="cta-ghost" href="#/progress">📊 Progress</a></div></section>
      <section class="plan-pulse"><div class="pulse-streak">🔥 <b>${streak}</b>-day streak</div>${weekStripHtml(plan, M)}</section>
      <div class="pt-seg" id="pt-seg">${T.map((t, i) => `<button data-pt="${t[0]}" class="pt-${t[0]}${i === 0 ? ' on' : ''}">${t[1]}</button>`).join('')}</div>
      ${T.map((t, i) => `<div class="pt-panel" data-panel="${t[0]}"${i === 0 ? '' : ' hidden'}>${t[2]}</div>`).join('')}`;
    if (hasFuel) mountFuelTracker(null, null, M.fuel, M.supps);
    mountPlanFunctions();
    wireConsentCard();
    const mdl = document.getElementById('mydata-link'); if (mdl) mdl.onclick = openDataModal;
    const hl = document.getElementById('health-link'); if (hl) hl.onclick = openHealthModal;
    mountCheckins(M, dayLog);
    // tab switching — panels stay in the DOM (all wiring below keeps working), we just show one
    const ptseg = app.querySelector('#pt-seg');
    if (ptseg) ptseg.querySelectorAll('button').forEach(b => b.onclick = () => {
      ptseg.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on');
      app.querySelectorAll('.pt-panel').forEach(p => { p.hidden = p.dataset.panel !== b.dataset.pt; });
    });
    const byExId = {}; M.moves.forEach(e => byExId[e.id] = e);
    const byCId = {}; M.supps.forEach(c => byCId[c.id] = c);
    wireItemModals('.trk-list', byExId, byCId);
    // keystone toggles (one per protocol)
    app.querySelectorAll('[data-ks]').forEach(b => b.onclick = () => { const pl = getPlan(); const d = planDay(pl); const key = b.dataset.ks; d.keystones[key] = !d.keystones[key]; setPlan(pl); renderPlan(); });
    // training-days editor: toggle which weekdays strength is scheduled
    app.querySelectorAll('[data-td]').forEach(b => b.onclick = e => { e.preventDefault(); const pl = getPlan(); const wd = +b.dataset.td; const days = planTrainingDays(pl).slice(); const i = days.indexOf(wd); if (i >= 0) days.splice(i, 1); else days.push(wd); days.sort(); pl.trainingDays = days; setPlan(pl); renderPlan(); });
    // dismiss retention banners
    const md = document.getElementById('miss-dismiss'); if (md) md.onclick = () => { const pl = getPlan(); pl.dismissedNudge = today(); setPlan(pl); const b = md.closest('.miss-banner'); if (b) b.remove(); };
    const rd = document.getElementById('recap-dismiss'); if (rd) rd.onclick = () => { const pl = getPlan(); pl.recapWeek = weekKey(); setPlan(pl); const b = rd.closest('.recap-card'); if (b) b.remove(); };
    const refreshProg = () => { const d = planDay(getPlan()); const pr = app.querySelector('.trk-prog'); if (pr) { const dn = [...M.moves, ...M.supps].filter(x => d.done.includes(x.id)).length; pr.textContent = dn + '/' + totalItems + ' done'; } };
    const refreshPulse = d => {
      const st = planDayStats(M, d, scheduledIds(M, plan, today()));
      const tc = app.querySelector('.week-strip .today'); if (tc) { tc.classList.remove('miss', 'partial', 'full'); tc.classList.add(st.full ? 'full' : (st.done > 0 ? 'partial' : 'miss')); tc.title = today() + ' · ' + st.done + '/' + st.total + ' done'; }
      const ps = app.querySelector('.pulse-streak b'); if (ps) ps.textContent = planStreak(getPlan());
    };
    app.querySelectorAll('.trk-list [data-done]').forEach(cb => cb.onchange = () => { const pl = getPlan(); const d = planDay(pl); const id = cb.dataset.done; const i = d.done.indexOf(id); if (cb.checked && i < 0) d.done.push(id); else if (!cb.checked && i >= 0) d.done.splice(i, 1); setPlan(pl); const item = cb.closest('.trk-item'); if (item) item.classList.toggle('done', cb.checked); refreshProg(); refreshPulse(d); });
    // Expand/collapse the per-exercise set logger
    app.querySelectorAll('[data-logtoggle]').forEach(b => b.onclick = () => { const id = b.dataset.logtoggle; const p = app.querySelector('.ex-log[data-exlog="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]'); if (p) { p.hidden = !p.hidden; b.classList.toggle('open', !p.hidden); } });
    // Log weight × reps; auto-complete the exercise once all prescribed sets have reps
    app.querySelectorAll('.ex-log .ex-in').forEach(inp => inp.onchange = () => {
      const pl = getPlan(); const d = planDay(pl); const ex = inp.dataset.ex; const idx = +inp.dataset.i; const field = inp.dataset.field;
      d.sets[ex] = d.sets[ex] || []; d.sets[ex][idx] = d.sets[ex][idx] || {};
      const raw = inp.value.trim(); const num = raw === '' ? null : parseFloat(raw);
      if (field === 'w') d.sets[ex][idx].w = (num != null && !isNaN(num)) ? num : null;
      else d.sets[ex][idx].reps = (num != null && !isNaN(num)) ? Math.round(num) : null;
      const e = byExId[ex]; const need = e ? prescribedSets(e) : 3;
      const filled = (d.sets[ex] || []).filter(s => s && s.reps != null).length;
      const item = inp.closest('.trk-item'); const cb = item && item.querySelector('[data-done]');
      if (filled >= need && !d.done.includes(ex)) { d.done.push(ex); if (cb) cb.checked = true; if (item) item.classList.add('done'); }
      setPlan(pl); refreshProg(); refreshPulse(d);
    });
    // per-protocol manage actions
    app.querySelectorAll('[data-edit-proto]').forEach(b => b.onclick = () => { const [pid, rcid] = b.dataset.editProto.split('/'); const pl = getPlan(); const pr = planProtocols(pl).find(x => x.pid === pid && x.rcid === rcid); if (!pr) return; pl.draft = { pid, rcid, moves: pr.moves, supps: pr.supps, functions: pr.functions, extra: {}, step: 0 }; setPlan(pl); renderPlan(); });
    app.querySelectorAll('[data-share-proto]').forEach(b => b.onclick = () => { const [pid, rcid] = b.dataset.shareProto.split('/'); const found = findRootCause(pid, rcid); if (found) sharePlan(found.problem, found.rc); });
    app.querySelectorAll('[data-remove-proto]').forEach(b => b.onclick = () => { const [pid, rcid] = b.dataset.removeProto.split('/'); const found = findRootCause(pid, rcid); const nm = found ? found.problem.name : 'this protocol'; if (!confirm('Remove ' + nm + ' from your plan? Your tracking history stays.')) return; const pl = getPlan(); pl.protocols = planProtocols(pl).filter(x => !(x.pid === pid && x.rcid === rcid)); setPlan(pl); renderPlan(); });
    // The share moment — celebration popup, once, right after a protocol is built
    if (plan.justBuilt && plan.justBuilt.pid) { const pl = getPlan(); const jb = pl.justBuilt; delete pl.justBuilt; setPlan(pl); const f = findRootCause(jb.pid, jb.rcid); if (f) buildCelebrateModal(f.problem, f.rc); }
  }

  // ---- Progress: the consistency dashboard — showing up, adherence, strength & tool trends ----
  async function renderProgress() {
    try { await ensureProtocolData(); } catch (e) { app.innerHTML = emptyPlan(); return; }
    const plan = getPlan();
    if (!plan || !planProtocols(plan).length) { app.innerHTML = emptyPlan(); return; }
    const M = mergedPlan(plan);
    const streak = planStreak(plan); const longest = longestStreak(plan, M);
    const wk = daysShown(plan, M, 7); const adh = adherencePct(plan, M, 30);
    const hasStrength = M.moves.some(e => e.kind !== 'stretch');
    const stats = `<div class="prog-stats">
      <div class="pstat"><span class="pstat-n">🔥 ${streak}</span><span class="pstat-l">Current streak</span></div>
      <div class="pstat"><span class="pstat-n">🏆 ${longest}</span><span class="pstat-l">Longest streak</span></div>
      <div class="pstat"><span class="pstat-n">📅 ${wk}/7</span><span class="pstat-l">Days this week</span></div>
      <div class="pstat"><span class="pstat-n">✅ ${adh}%</span><span class="pstat-l">30-day adherence</span></div>
    </div>`;
    // 30-day heat-map, weekday-aligned
    let hmCells = ''; const start = new Date(); start.setDate(start.getDate() - 29);
    for (let i = 0; i < start.getDay(); i++) hmCells += '<span class="hm-cell empty"></span>';
    for (let i = 29; i >= 0; i--) { const key = dISO(i); const st = planDayStats(M, (plan.log || {})[key], scheduledIds(M, plan, key)); const cls = st.full ? 'full' : (st.done > 0 ? 'partial' : 'miss'); hmCells += `<span class="hm-cell ${cls}${key === today() ? ' today' : ''}" title="${key} · ${st.done}/${st.total} done"></span>`; }
    const heatmap = `<section class="prog-sec"><h2>Last 30 days</h2><div class="hm-head">${['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(x => `<span>${x}</span>`).join('')}</div><div class="heatmap">${hmCells}</div><div class="hm-legend"><span class="hm-cell miss"></span> missed <span class="hm-cell partial"></span> partial <span class="hm-cell full"></span> full</div></section>`;
    // Strength: sessions + volume trend
    let strengthSec = '';
    if (hasStrength) {
      const vols = []; for (let i = 13; i >= 0; i--) vols.push(dayVolume((plan.log || {})[dISO(i)]));
      let sessions = 0; for (let i = 0; i < 30; i++) { const dl = (plan.log || {})[dISO(i)]; if (dl && dl.sets && Object.keys(dl.sets).some(k => (dl.sets[k] || []).some(s => s && s.reps != null))) sessions++; }
      const anyVol = vols.some(v => v > 0);
      strengthSec = `<section class="prog-sec"><h2>Strength</h2><p class="prog-line"><b>${sessions}</b> session${sessions === 1 ? '' : 's'} logged in the last 30 days.</p>${anyVol ? `<p class="prog-sub">Volume (weight × reps) · last 14 days</p>${sparkline(vols)}` : `<p class="prog-sub">Log your sets in Today and your progression shows up here.</p>`}</section>`;
    }
    // Tools: 7-day summary per counter tool
    const toolLines = M.functions.map(id => { const f = fnById(id); if (!f || f.kind !== 'counter') return '';
      if (f.period === 'week') { const v = ((plan.fnWeek || {})[weekKey()] || {})[id] || 0; return `<div class="ptool">${f.icon} <b>${esc(f.name)}</b> — ${v}/${f.target} ${esc(f.unit)} this week</div>`; }
      let sum = 0, days = 0; for (let i = 0; i < 7; i++) { const dl = (plan.log || {})[dISO(i)]; const v = dl && dl.fn && dl.fn[id]; if (v != null) { sum += v; days++; } }
      return `<div class="ptool">${f.icon} <b>${esc(f.name)}</b> — avg ${days ? Math.round(sum / days) : 0}/${f.target} ${esc(f.unit)}/day (7d)</div>`;
    }).filter(Boolean).join('');
    const toolsSec = toolLines ? `<section class="prog-sec"><h2>Your tools</h2>${toolLines}</section>` : '';
    app.innerHTML = `${crumbs([{ label: 'Home', href: '#/' }, { label: 'My Plan', href: '#/plan' }, { label: 'Progress' }])}
      <section class="plan-hd"><div><div class="kicker">My Plan · Progress</div><h1>Your progress</h1><p class="muted">Across ${M.resolved.length} protocol${M.resolved.length === 1 ? '' : 's'} · since ${esc(planStartDate(plan))}</p></div>
        <div class="plan-hd-actions"><a class="cta-ghost" href="#/plan">← Today</a></div></section>
      ${stats}
      ${heatmap}
      ${strengthSec}
      ${toolsSec}`;
  }

  // Resolve a causal-chain mediator symbol (e.g. 'AR', 'mTOR', 'cortisol') to a target/pathway page.
  function mediatorLink(ref) {
    if (!ref) return null;
    const k = tkey(ref);
    if (typeof targetBySym !== 'undefined' && targetBySym[k]) return `#/target/${k}`;
    const low = ref.toLowerCase();
    const pi = (D.pathways || []).findIndex(p => ((p.shortLabel || '') + ' ' + (p.title || '')).toLowerCase().includes(low));
    if (pi >= 0) return `#/pathway/${pi}`;
    return null;
  }
  // Move 3B: a `structure` chain node links into the body — a structures.json id → its group's muscle
  // page, or an anatomy group id → that page. Mirrors mediatorLink; returns null if the ref is unknown.
  function structureLink(ref) {
    if (!ref) return null;
    const s = (D.structures || []).find(x => x.id === ref);
    if (s) return `#/muscle/${s.groupId}`;
    if ((((D.anatomy || {}).muscles) || []).some(m => m.id === ref)) return `#/muscle/${ref}`;
    return null;
  }
  const CC_TYPE = { trigger: '⚡ trigger', mediator: '⚙️ mediator', tissue: '🧬 tissue', symptom: '💥 symptom' };
  const TIER_LABEL = ['', 'emerging / associative', 'strong association', 'established mechanism — effect size varies by person'];
  function causeTier(t) { t = t || 1; return `<span class="cause-tier t${t}" title="Strength of the causal link">${'●'.repeat(t)}${'○'.repeat(3 - t)} <span class="ct-lbl">${TIER_LABEL[t] || ''}</span></span>`; }
  // ---- Apple-style scroll-reveal biological journey: the chain becomes moments you move through ----
  const CC_ICON = { trigger: '⚡', mediator: '⚙️', tissue: '🧬', symptom: '💥' };
  const CC_WORD = { trigger: 'Trigger', mediator: 'Signal', tissue: 'Response', symptom: 'Outcome' };
  function bioJourney(chain) {
    if (!Array.isArray(chain) || !chain.length) return '';
    const steps = chain.map(n => {
      const link = n.type === 'mediator' && n.ref ? mediatorLink(n.ref) : (n.type === 'structure' && n.ref ? structureLink(n.ref) : null);
      const sciLbl = n.type === 'structure' ? 'the anatomy' : 'the science';
      // Lead with plain English (n.lay); show the technical name (n.node) only as a subtle, linkable tag.
      const head = n.lay ? esc(n.lay) : (link ? `<a href="${link}">${esc(n.node)}</a>` : esc(n.node));
      const sci = n.lay ? `<div class="bj-sci"><span class="bj-sci-k">${sciLbl}</span> ${link ? `<a href="${link}">${esc(n.node)}</a>` : esc(n.node)}</div>` : '';
      const say = n.say ? `<div class="bj-say">${mdInline(n.say)}</div>` : '';
      return `<div class="bj-step bj-${esc(n.type)}"><div class="bj-rail"><span class="bj-dot">${CC_ICON[n.type] || '•'}</span></div><div class="bj-content"><div class="bj-kind">${esc(CC_WORD[n.type] || n.type)}</div><div class="bj-node">${head}</div>${sci}${say}</div></div>`;
    }).join('');
    return `<div class="bio-journey">${steps}</div>`;
  }
  function keyInsightBlock(c) { if (!c.keyInsight) return ''; return `<div class="key-insight"><span class="ki-mark">“</span>${mdBlocks(c.keyInsight, mdInline)}</div>`; }
  // CONFIDENCE METER — REWRITTEN 2026-07-28 (Phase 1 item 9).
  // This rendered a percentage BAR whose tier-3 state was 100% FULL. A full bar reads as
  // "certain", and it sat on causes whose own evidence field openly hedges — so every cause read
  // as settled at the point of consumption. Worse, `causeTier()` directly below already existed,
  // already styled, rendering an honest discrete ●●○ indicator — and had ZERO call sites. The
  // honest control was written and the overconfident one shipped.
  // Now: call causeTier(), relabel the question to what the tier actually measures (how well
  // established the MECHANISM is, not how well it will work for you), and render the authored
  // evidence prose inline instead of hiding it inside a closed <details>.
  function confidenceMeter(c) {
    const t = c.evidenceTier || 1;
    const ev = c.evidence ? `<div class="conf-ev">${mdInline(c.evidence)}</div>` : '';
    return `<div class="conf"><div class="cbl">How well established is the mechanism?</div>`
      + causeTier(t)
      + `<div class="conf-note">This rates how well the CAUSAL LINK is established — not how much it will help you. Effect size varies from person to person.</div>`
      + ev + `</div>`;
  }

  // Scroll-reveal for the biological journeys: each step eases up as it enters the viewport.
  function initCauseMotion() {
    const journeys = document.querySelectorAll('.bio-journey'); if (!journeys.length) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) return; // graceful: steps stay fully visible
    journeys.forEach(j => j.classList.add('bj-animate'));
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.28, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.bio-journey .bj-step').forEach(s => io.observe(s));
  }
  // Fix-the-cause hierarchy — try cheapest/safest first: behaviour → food → supplement → prescription.
  const FIX_ORDER = { behavior: 1, food: 2, compound: 3, rx: 4 };
  const FIX_ICO = { behavior: '🔁', food: '🥗', compound: '💊', rx: '🩺' };
  const FIX_LBL = { behavior: 'Behaviour', food: 'Food', compound: 'Supplement', rx: 'Prescription' };
  function sortedFixes(c) { return (c.fixes || []).slice().sort((a, b) => (FIX_ORDER[a.kind] || 5) - (FIX_ORDER[b.kind] || 5)); }
  // The single highest-leverage action, surfaced at the top of a protocol.
  function theOneThingHead(problem) {
    const w = problem.why; if (!w || !w.theOneThing) return '';
    // W3.6/W4 (2026-08-02): this badge read "⭐ Start here — the one thing". MEASURED HYDRATED at
    // 390x844 in the DEFAULT DOM state on all 52 protocol routes: the phrase "one thing" appeared
    // a MEDIAN OF 3 TIMES per page, in three different senses, on 52/52 — "📏 THE ONE THING TO
    // TRACK" (y median 1,387), "⭐ START HERE — THE ONE THING" (y median 1,967) and "⭐ YOUR ONE
    // KEYSTONE … Nail this one thing and the rest compounds" (y median 17,687). Phase 1 made it 4
    // (median 4, min 4, max 6, on 52/52). Phase 1 is now the one thing to DO, and this block is
    // orientation prose, so it says what it is instead of competing for the same words.
    return `<div class="one-thing-head"><span class="oth-badge">⭐ Before you start — what actually matters in this cause</span>${mdBlocks(w.theOneThing, mdInline)}<a class="oth-jump" data-scroll="p-causes">See the full cause-by-cause plan ↓</a></div>`;
  }
  // Short symptom teaser for the accordion header — authored `hook`, else the first clause of the symptoms.
  function causeHook(c) {
    if (c.hook) return c.hook;
    const s = String((c.tell && c.tell.symptoms) || '').replace(/\s*Honest tiering:.*$/i, '').split(/[.;]/)[0].trim();
    return s.length > 96 ? s.slice(0, 94).trim() + '…' : s;
  }
  // W5 (2026-08-02): `rc` ADDED as a third parameter. causeIndexForRc() returns 0 for a root cause
  // with no `cause_key` — correct behaviour, and until now completely silent. Measured hydrated at
  // 390x844 on all 52 /protocol routes, 0 pageerrors: 47 open the cause data/cause_map.json names
  // (47/47 exact), and the 5 deliberately-unmapped ones opened index 0 with nothing said. On 3 of
  // those 5 the opened cause makes a materially different claim from the URL's root cause —
  // /protocol/thyroid/subclinical-hypothyroid displays "Sluggish thyroid / nutrient deficits" and
  // opens "Hashimoto's autoimmune thyroiditis"; /protocol/brain-fog/neuroinflammation displays
  // "Neuroinflammation / poor metabolic control" and opens "Sleep debt & circadian disruption";
  // /protocol/low-mood/monoamine-inflammation displays "Low monoamines + inflammation" and opens
  // "Chronic stress / HPA-axis dysregulation". The section now says that it is a default, and quotes
  // the authored reason build/parse.js already required and now exports as `cause_unmapped`.
  // The parameter is optional: every other caller keeps working and simply gets no note.
  function causesSection(problem, openIdx, rc) {
    const w = problem.why; if (!w) return '';
    const ladder = (Array.isArray(w.ladder) && w.ladder.length) ? `<details class="cause-bigpic"><summary>🧭 The big picture — how one spot forms, surface → root</summary><ol class="cause-ladder">${w.ladder.map(l => `<li>${mdInline(l)}</li>`).join('')}</ol></details>` : '';
    const causes = (w.causes || []).slice().sort((a, b) => (a.rank || 9) - (b.rank || 9));
    // EXACTLY ONE of these may carry `open`. `name="p-cause-acc"` makes them an HTML exclusive
    // accordion group, and when the parser meets two `open` in one group it keeps the FIRST and
    // silently drops the rest — so a fix that opened "several" would quietly regress to index 0.
    // Clamped, so an out-of-range index opens the highest-leverage cause rather than nothing:
    // any future data or routing bug degrades to the old behaviour, not to an all-closed accordion.
    const _open = (Number.isInteger(openIdx) && openIdx >= 0 && openIdx < causes.length) ? openIdx : 0;
    const items = causes.map((c, i) => {
      const _fixArr = sortedFixes(c);
      const fixes = _fixArr.map(f => { const ic = FIX_ICO[f.kind] || '•'; const cc = (f.kind === 'compound' && f.ref) ? resolveCompound(f.ref) : null; const inner = cc ? `<a href="#/c/${slug(cc.name)}">${mdInline(f.what)}</a>` : mdInline(f.what); return `<li><span class="fix-kind fk-${esc(f.kind || 'x')}">${ic} ${esc(FIX_LBL[f.kind] || 'Other')}</span> ${inner}</li>`; }).join('');
      const suppIds = [...new Set(_fixArr.filter(f => f.kind === 'compound' && f.ref).map(f => { const cc = resolveCompound(f.ref); return cc ? cc.id : null; }).filter(Boolean))];
      const symptoms = mdInline(String((c.tell && c.tell.symptoms) || '').replace(/\s*Honest tiering:.*$/i, '').trim());
      const goDeeper = (c.plain || c.confusedWith) ? `<details class="cause-deeper"><summary>Go deeper — the full mechanism</summary>${c.plain ? `${mdBlocks(c.plain, mdInline)}` : ''}${c.confusedWith ? `<div class="cause-confused">↔️ <b>Often confused with:</b> ${mdInline(c.confusedWith)}</div>` : ''}</details>` : '';
      return `<details class="cause-acc lev-${esc(c.leverage || 'med')}" name="p-cause-acc" data-cause-index="${i}"${i === _open ? ' open' : ''}>
        <summary class="cause-sum"><span class="cause-rank">${c.rank || i + 1}</span><span class="cs-main"><span class="cs-name">${esc(c.name)}</span>${causeHook(c) ? `<span class="cs-hook">${mdInline(causeHook(c))}</span>` : ''}</span><span class="cs-meta"><span class="cause-lev">${esc(c.leverage || '')} leverage</span></span></summary>
        <div class="cause-body">
          ${keyInsightBlock(c)}
          ${c.chain && c.chain.length ? `<div class="bj-lead"><span class="cbl">The pathway — step by step</span></div>${bioJourney(c.chain)}` : ''}
          ${symptoms ? `<div class="cause-tell"><span class="cbl">Is this you?</span> ${symptoms}</div>` : ''}
          ${confidenceMeter(c)}
          ${(c.tell && c.tell.labMarker) ? `<div class="cause-lab">🩸 <b>Confirm it:</b> ${mdInline(c.tell.labMarker)}</div>` : ''}
          ${fixes ? `<div class="cause-fix"><div class="cf-plan-h"><span class="cbl">✅ Your plan if this is your cause</span><span class="fix-order-note">work down the list — cheapest &amp; safest first</span></div><ul class="fix-list">${fixes}</ul><div class="cause-plan-cta"><button class="cta-primary build-cause-btn" data-build-cause="${esc(problem.id)}#${i}">▶ Build my plan for this cause →</button>${suppIds.length ? `<button class="adopt-plan" data-adopt="${suppIds.join(',')}">＋ Just add the ${suppIds.length === 1 ? 'supplement' : suppIds.length + ' supplements'} to my stack</button>` : ''}</div></div>` : ''}
          ${goDeeper}
        </div>
      </details>`;
    }).join('');
    const nC = causes.length;
    return `<section class="causes-section" id="p-causes">
      <div class="cause-h"><div class="cause-step">STEP 1 · FIND YOUR CAUSE</div><h2>🔍 What’s actually causing your ${esc(problem.name.toLowerCase())}?</h2>${w.intro ? `<p class="cause-sub">${mdInline(w.intro)}</p>` : ''}</div>
      ${ladder}
      <div class="cause-finder">
        <div class="cf-txt"><b>There are ${nC} common causes${nC > 1 ? ' — and often more than one is at play' : ''}.</b> The right fix depends entirely on which is yours. Answer a few quick questions and I’ll point you to it.</div>
        <button class="cta-primary cf-btn" data-find-cause="${esc(problem.id)}">🔍 Find my cause — 20-second check</button>
      </div>
      <div class="cause-list-label"><span class="cll-h">The ${nC} possible cause${nC !== 1 ? 's' : ''}</span> · ranked by leverage (#1 fixes the most) — <b>open the one that sounds like you</b>. Each is a self-contained explanation and plan; fixes run behaviour → food → supplement → prescription.</div>
      ${(rc && rc.cause_unmapped && !rc.cause_key) ? `<p class="cause-fallback"><b>Nothing below is selected for you.</b> This page’s root cause — “${esc(rc.name)}” — is an umbrella that no single cause below matches, so I have opened #${_open + 1}, the highest-leverage one, as a starting point and not as an answer. Why there is no match: ${esc(rc.cause_unmapped)} <b>Open the one that sounds like you.</b></p>` : ''}
      <div class="cause-accordion">${items}</div>
      <!-- The cascade now has a canonical page of its own (/problem/<id>) — the prerendered
           root-cause pages link there instead of repeating 7,000 words each. The SPA renders
           the causes inline as before, but must still offer the route, or the two documents
           disagree about whether that page exists. data-native: it is prerender-only. -->
      <p class="cause-allpage"><a href="/problem/${esc(problem.id)}" data-native>Read all ${nC} cause${nC !== 1 ? 's' : ''} of ${esc(problem.name.toLowerCase())} on one page →</a></p>
      <div class="cause-foot"><button class="share-short-btn" data-share-short="cause:${esc(problem.id)}">📱 Make a short — TikTok / Reel</button></div>
      ${'' /* REMOVED 2026-07-28: duplicate. theOneThingHead() already prints this exact string
             higher up the same page, so every protocol page said the same ~515 characters twice. */}
    </section>`;
  }
  // ---- Stage 4: protocol action-plan (timeline · working signals · reassess · context · troubleshooting) ----
  function planSection(problem) {
    const pl = problem.plan; if (!pl) return '';
    // D2 (2026-08-01) — these four section titles were <div>s, so a 9,000-word protocol page
    // hydrated to exactly one h1 and two h2 and nothing else: measured 52/52, h3 count 0. The
    // prerendered twin marks the same four as <h3>. Promoted to real headings, with the margin the
    // class does not set carried inline so the rendered geometry is unchanged (h3 has a UA
    // margin-block-start; .plan-h/.plan-ch set margin-bottom only).
    const tl = (Array.isArray(pl.timeline) && pl.timeline.length) ? `<div class="plan-block"><h3 class="plan-h" style="margin:0 0 .5rem">📆 What to expect — and when</h3><ol class="plan-timeline">${pl.timeline.map(t => `<li><span class="pt-when">${esc(t.when)}</span><span class="pt-what">${mdInline(t.what)}</span></li>`).join('')}</ol></div>` : '';
    const wk = pl.working ? `<div class="plan-card plan-working"><h3 class="plan-ch" style="margin:0 0 .35rem">✅ What “it’s working” looks like</h3>${mdBlocks(pl.working, mdInline)}</div>` : '';
    // The escalation block used to render HERE, inside the plan section. It is now the first thing
    // on the page — see safetyFirstSection(). It was MOVED, not copied: printing the same
    // escalation text twice would train a reader to skip it.
    const ctx = (Array.isArray(pl.context) && pl.context.length) ? `<div class="plan-block"><h3 class="plan-h" style="margin:0 0 .5rem">👥 Does your situation change it?</h3><div class="plan-ctx">${pl.context.map(c => `<div class="pctx"><b>${esc(c.who)}</b><span>${mdInline(c.mod)}</span></div>`).join('')}</div></div>` : '';
    const tr = (Array.isArray(pl.troubleshooting) && pl.troubleshooting.length) ? `<details class="plan-trouble"><summary>🔧 Troubleshooting — if it’s not working</summary>${pl.troubleshooting.map(t => `<div class="ptr"><div class="ptr-q">${mdInline(t.issue)}</div><div class="ptr-a">${mdInline(t.fix)}</div></div>`).join('')}</details>` : '';
    if (!tl && !wk && !ctx && !tr) return '';
    return `<section class="plan-section" id="p-plan"><h2>🗺️ Your plan — timeline, signals &amp; troubleshooting</h2><p class="plan-sub">Educational, not medical advice. Timelines are typical, not promises.</p><div class="plan-grid">${wk}</div>${tl}${ctx}${tr}</section>`;
  }
  // ---- W2 (2026-08-01): THE SAFETY STRUCTURE, ABOVE THE RECOMMENDATIONS ------------------------
  // MEASURED HYDRATED at 390x844 in the DEFAULT DOM state (nothing expanded, nothing clicked) on all
  // 52 /protocol/* routes before this — out/w2safe_before.json:
  //   · a labelled stop-rule element:            0/52
  //   · a named primary tracking metric element: 0/52
  //   · the 🚩 reassess card BELOW the page's first supplement recommendation on 52/52. Median y:
  //     first supplement 8,914 px, red flags 11,023 px, on an 18,430 px page.
  // Note WHERE the first recommendation is: not the Stack section, but the "💊 Supplement" fix line
  // inside the open cause accordion (DOM index 144 against the red flags' 691 on
  // /protocol/knee-pain/patellofemoral-pain). So this has to sit above causesSection(), not merely
  // above protocolLayers(), and above theOneThingHead() too — that block is authored prose and is
  // free to name a compound.
  //
  // NOTHING HERE IS WRITTEN BY THE RENDERER. `problem.safety` is promoted from this page's own
  // authored plan by data/protocol_safety.json and gated by assertProtocolSafety() in
  // build/parse.js: the quote must be verbatim, the checkpoint must be one of the problem's own
  // timeline steps, and the stop rule's action is that troubleshooting entry's own authored `fix`.
  // The label is a condensation, so the sentence it was condensed from is printed under it.
  //
  // ---- W2.5 (2026-08-01): THE STOP RULE'S HEADER NAMES THE RULE'S OWN HORIZON ------------------
  // It used to print `checkpoint`, which is a rung on the problem's TIMELINE — the last one on
  // 41 of 41 — and had nothing to do with the rule underneath it. MEASURED HYDRATED at 390x844 on
  // all 52 routes: /protocol/skin-aging/collagen-loss-glycation and /uv-oxidative headed
  // "⏱️ THE STOP RULE · MONTHS 6–12" over "No visible change after 12 weeks";
  // /protocol/burnout/hpa-dysregulation headed "WEEKS 6–8" over "after 3–4 weeks";
  // /protocol/chronic-fatigue/* headed "WEEKS 4-12" over "Two weeks". On 9 of 52 the header told
  // the reader to wait LONGER than the rule says before seeking help.
  // `stopHorizon` is a verbatim substring of the rule it heads, gated in build/parse.js. It is
  // never synthesised: if a rule names no horizon, this renders a bare "The stop rule" and says
  // nothing, which is the only honest thing to render. build/prerender.js:1134 renders the same
  // field from the same object, and assertProtocolSpine checks the rendered page on 52/52.
  // The metric card still reads "compare against at {checkpoint}" — that IS a timeline rung and
  // that use is correct, so on the 13 problems where the two differ the cards name different
  // times on purpose: a baseline recheck and a stop rule are not the same date.
  function safetyFirstSection(problem) {
    const pl = problem.plan || {}, s = problem.safety;
    if (!pl.reassess && !s) return '';
    const red = pl.reassess ? `<div class="plan-card plan-reassess">
        <h2 class="plan-ch" style="margin:0 0 .35rem">🚩 First — when this is not a self-care problem</h2>
        ${mdBlocks(pl.reassess, mdInline)}
        <p class="esc-note" style="margin:.6rem 0 0">If something is severe, sudden, or getting rapidly worse, do not work through a protocol — <b>call your local emergency number</b> and go to an emergency department. (It is 995 in Singapore, 999 in the UK and much of Asia, 911 in North America, 112 across Europe, 000 in Australia.) For anything persistent, a family doctor or polyclinic is the right first stop.</p>
        <p class="esc-note" style="margin:.4rem 0 0"><b>This page is information, not medical advice.</b> No clinician has reviewed it, and nothing on it is a diagnosis.</p>
      </div>` : '';
    const struct = s ? `<div class="safety-grid">
        <div class="sf-card track-metric" data-primary-metric="${esc(s.metric)}">
          <span class="sf-k">📏 The one thing to track</span>
          <b class="sf-v">${esc(s.metric)}</b>
          <p class="sf-src">${mdInline(s.metricSource)}</p>
          <p class="sf-base">Write down where it is <b>today</b> — that is the baseline you will compare against at ${esc(s.checkpoint)}.</p>
        </div>
        <div class="sf-card stop-rule" data-stop-rule data-horizon="${esc(s.stopHorizon || '')}">
          <span class="sf-k">⏱️ The stop rule${s.stopHorizon ? ' · ' + esc(s.stopHorizon) : ''}</span>
          <b class="sf-v">${esc(s.stopIssue)}</b>
          <p class="sf-src">${mdInline(s.stopFix)}</p>
        </div>
      </div>` : '';
    return `<section class="safety-first" id="red-flags">${red}${struct}</section>`;
  }
  // ---- W4 (2026-08-02): PHASE 1 — ONE FREE THING, FOR 7 DAYS ---------------------------------
  // MEASURED HYDRATED at 390x844 in the DEFAULT DOM state (nothing clicked, nothing expanded) on
  // all 52 /protocol/* routes before this — out/w4int_before.json:
  //   · "Phase 1" / "Phase 2" anywhere on the page                 0/52
  //   · "$0" / "zero-cost" anywhere on the page                    1/52
  //   · any instruction to hold everything else constant           0/52
  //   · the ⭐ keystone card — this page's own free single habit —  median y 17,687 px = 94% of a
  //     median 18,939 px page on 52/52, and 7,732 px BELOW the page's first supplement link
  //     (median y 9,698 px, 54%) on 52/52. A median gap of 9.2 phone screens.
  // The cheapest thing on the page was the last thing on the page.
  //
  // NOTHING HERE IS WRITTEN BY THE RENDERER. `rc.phase1` is SELECTED from this root cause's own
  // keystone / prescription / behaviour fix by data/protocol_phase1.json and gated by
  // assertPhase1() in build/parse.js. The metric is NOT authored twice — it is
  // `problem.safety.metric`, the same W2 structure the card above prints, reused. The horizon is
  // `problem.phase1Signal`, which is timeline[1].when verbatim. On 39 of the 44 routes that have a
  // Phase 1 that window ends AFTER day 7, so this says the 7 days test whether you can do it
  // rather than promising a result the timeline does not promise.
  // On the 8 root causes with no free lever the section says so and gives the authored reason;
  // inventing one for hair-loss/dht-sensitivity (finasteride and minoxidil) is the fabrication
  // class W3.5 closed.
  // build/prerender.js emits the identical markup, and assertProtocolSpine checks the rendered
  // page on 52/52 — D2/D33 is the class where the two documents say different things.
  const PHASE1_KEY = 'rnawiki_phase1';
  // localStorage only. Constraint 3 (anonymous-first): reading, logging and the $0 protocol must
  // work with no account, and /api/me 503s in the local read-only run mode, so nothing here may
  // depend on a server. A private-mode browser that throws is caught — Phase 2 still opens for the
  // session, it just is not remembered.
  function phase1State(problem, rc) {
    try { return (JSON.parse(localStorage.getItem(PHASE1_KEY) || '{}'))[`${problem.id}/${rc.id}`] || null; } catch (e) { return null; }
  }
  // ---- W4 · LOOP C (2026-08-02): COHORTS ------------------------------------------------------
  // "A protocol page must accept a ?cohort=<slug> parameter that sets a shared start date and shows
  // Day N of 7 aligned to the cohort. $0 protocols only. No leaderboard, no competition, no ranking
  // of participants. It is a shared start date, nothing more." Measured hydrated before this:
  // "Day N of 7" from a cohort, 0/4 routes; the parameter was split off in route() and dropped.
  //
  // THE SLUG CARRIES ITS OWN DATE — `2026-08-04-knees` — and there is no registry. That is a
  // deliberate choice with one safety property that a registry would not have given for free:
  //
  //   A COHORT LINK CAN NEVER HAND YOU A FINISHED WEEK.
  //
  // The start must fall in [today − 6, today + 28]. A link dated further back is refused, by name,
  // because accepting it would put a reader straight into day 8+ of a week they never did — and
  // the Research Receipt unlocks on day 7. A link could otherwise mint a write-up out of a URL.
  // That is the whole reason for the lower bound; the upper bound is only "too far ahead to be
  // real". Joining late is normal and works: a cohort that began 3 days ago puts you on day 4 with
  // days 1–3 empty, which is the truth.
  //
  // $0 ONLY, enforced by the SAME receiptGuard() the receipt uses — not a second copy of the rule.
  // A cohort on a prescription protocol is a group of strangers being told to start a medicine on
  // a date, from a URL. It is refused with the reason printed.
  //
  // NOTHING ABOUT ANYBODY ELSE. This code cannot count participants, rank them or reach a server;
  // there is no cohort endpoint and no cohort table. The strip says so in as many words, and the
  // gate fails on any wording that implies otherwise. Brief §0.3: no aggregate efficacy statistic
  // renders anywhere, and the owner discussing his own observations on X is not the site asserting
  // group efficacy.
  //
  // The crawler's document has no cohort: build/prerender.js renders routes, not query strings, and
  // setPageMeta() keeps the canonical query-free. A shared start date is not a page.
  const COHORT_RE = /^(\d{4}-\d{2}-\d{2})-([a-z0-9][a-z0-9-]{0,23})$/;
  const COHORT_BACK = 6, COHORT_AHEAD = 28;
  function cohortParse(slug, rc) {
    if (!slug) return null;
    const s = String(slug).trim().toLowerCase().slice(0, 64);
    const m = s.match(COHORT_RE);
    if (!m) return { error: 'A cohort link looks like ?cohort=2026-08-04-knees — a start date, then a short name. This one does not, so it has been ignored and nothing on this page has changed.' };
    const start = m[1], name = m[2];
    if (!TRACK_DAY_RE.test(start)) return { error: `“${start}” is not a real date, so this cohort link has been ignored.` };
    const since = dayGap(start, isoDay());          // days from the cohort's start to today
    if (since > COHORT_BACK) return { error: `That cohort started ${since} days ago, so its ${TRACK_DAYS} days are already over. A cohort link is never allowed to hand you a finished week — that would be a write-up for days you did not do.` };
    if (since < -COHORT_AHEAD) return { error: `That cohort starts more than ${COHORT_AHEAD} days from now, which is too far ahead to be a real start date. Ignored.` };
    const g = receiptGuard(rc);
    if (!g.ok) return { error: `No cohort runs on this protocol. ${g.why} A cohort is only ever run on a week that costs nothing — never on a supplement and never on a prescription.` };
    return { slug: s, start, name, since, ahead: since < 0 ? -since : 0, live: since >= 0 };
  }
  function cohortStripHTML(problem, rc, cohort) {
    if (!cohort) return '';
    if (cohort.error) return `<p class="p1-cohort p1-cohort-no" data-cohort="refused">🗓 ${esc(cohort.error)}</p>`;
    const log = trackGet(problem, rc);
    const mine = log && log.started;
    const dayN = Math.min(TRACK_DAYS, cohort.since + 1);
    return `<div class="p1-cohort" data-cohort="ok" data-cohort-start="${esc(cohort.start)}">
      <p class="p1-co-head">🗓 Cohort <b>${esc(cohort.name)}</b> — everyone in it starts on <b>${esc(cohort.start)}</b>.</p>
      <p class="p1-co-day">${cohort.live
        ? `That makes today <b>day ${dayN} of ${TRACK_DAYS}</b> for this cohort.${cohort.since > 0 ? ` You are joining on day ${dayN}, so days 1–${cohort.since} will stay empty — they are days you did not do.` : ''}`
        : `It has not started yet — that is <b>${cohort.ahead} day${cohort.ahead === 1 ? '' : 's'}</b> from now. You can still start on your own today; the cohort only shares a date.`}</p>
      ${mine ? `<p class="p1-co-note">You already started this on <b>${esc(log.started)}</b>, and a link cannot move a log you have begun. Your day count stays your own.</p>` : ''}
      <p class="p1-co-note">A shared start date and nothing else. There is no leaderboard, no ranking and no count of anyone else — this page cannot see another person's week, and nothing about yours is published anywhere.</p>
    </div>`;
  }
  function phase1Section(problem, rc, cohort) {
    const p1 = rc.phase1;
    if (!p1 && !rc.phase1None) return '';
    if (!p1) {
      return `<section class="phase1 phase1-none" id="phase-1" data-phase1-none>
        <div class="p1-badge p1-badge-none">Phase 1 · there is no $0 version of this one</div>
        <p class="p1-action">This protocol has no free first step.</p>
        <p class="p1-quote">${esc(rc.phase1None)}</p>
        <p class="p1-constant">Every other protocol here opens with one thing that costs nothing. This one does not, and saying otherwise would mean inventing a lever this page’s own sources do not contain. Read the rest, and take it to a doctor or pharmacist before you buy anything.</p>
        ${cohortStripHTML(problem, rc, cohort)}
      </section>`;
    }
    const sig = problem.phase1Signal || '', within = !!problem.phase1SignalWithin7;
    const metric = (problem.safety || {}).metric || '';
    const st = phase1State(problem, rc);
    return `<section class="phase1" id="phase-1" data-phase1-action="${esc(p1.action)}" data-phase1-cost="${esc(p1.cost)}" data-phase1-class="${esc(p1.class)}">
      <div class="p1-badge">Phase 1 · 7 days · $0 · one thing</div>
      <p class="p1-action">${esc(p1.action)}</p>
      <p class="p1-quote">Selected from this protocol’s own plan: “${esc(p1.quote)}”</p>
      <dl class="p1-facts">
        <div class="p1-fact"><dt>Watch</dt><dd>${metric ? esc(metric) : 'the one thing this protocol is judged by'} <a href="#red-flags">— why this one ↑</a></dd></div>
        <div class="p1-fact"><dt>When it moves</dt><dd>${within
          ? `This protocol’s own timeline puts the first change at <b>${esc(sig)}</b>, inside these 7 days.`
          : `This protocol’s own timeline does not expect a change until <b>${esc(sig)}</b> — after these 7 days end. So the week is a test of whether you can do it daily, not of whether it works.`}</dd></div>
        <div class="p1-fact"><dt>A partial result</dt><dd>You did it on most of the 7 days${metric ? ` and the thing you are tracking — “${esc(metric)}” —` : ' and the thing you are tracking'} has not moved. ${within
          ? `That is a weak signal rather than a failure — ${esc(sig)} is the very end of this week.`
          : `That is the expected result, because ${esc(sig)} is after this week ends.`} If you could not do it on most days, that is the useful answer too: make it smaller and run the week again.</dd></div>
      </dl>
      <p class="p1-constant"><b>Change nothing else for the 7 days.</b> Not the supplements you already take, not your training, not your diet. One variable at a time — change two things and you will not know which one did it, and the week tells you nothing.</p>
      ${cohortStripHTML(problem, rc, cohort)}
      <div class="p1-actions">
        <button class="cta-primary p1-start" id="phase1-start"${(st && st.started) ? ' disabled' : ''}>${(st && st.started) ? `✓ Started ${esc(st.started)} on this device` : (cohort && !cohort.error && cohort.live ? `▶ Join the cohort — start on ${esc(cohort.start)}` : '▶ Start day 1')}</button>
        <button class="p1-skip" id="phase1-skip">I already do this — open Phase 2</button>
      </div>
      <div class="p1-log" id="p1-log"></div>
    </section>`;
  }
  // ---- W4 (2026-08-02): THE 1-TAP LOGGER --------------------------------------------------------
  // MEASURED HYDRATED at 390x844 in the DEFAULT DOM state, on /protocol/knee-pain/patellofemoral-pain,
  // /protocol/hair-loss/dht-sensitivity and /protocol/insomnia/circadian-misalign
  // (out/w4log_before.json):
  //   · #p1-log                                    0/3
  //   · a day counter ("Day N of 7")               0/3
  //   · a sparkline                                0/3
  //   · an export or a restore control             0/3
  //   · input[type=range] anywhere on the page     0/3 — the site's only 0–10 symptom slider lives
  //     inside openCheckinModal(), which mountCheckins() gates on `!ME || !CONSENT` (app.js:5013).
  //     So the whole symptom loop was unreachable without an account, which is a constraint-3 breach:
  //     reading, LOGGING and the $0 protocol must all work with no account.
  //   · localStorage held 40 B (rnawiki_voter) on a fresh protocol page — nothing on this site
  //     recorded what the reader actually did.
  // Phase 1 tells a reader to do one free thing every day for 7 days and then gave them nowhere to
  // put the 7 days.
  //
  // FIVE RULES, each of which is asserted in scripts/smoke.mjs (phase1LoggerIsOneTapAndLeaksNothing):
  //  1. TAP-ONLY. Every control is a <button>. Zero input[type=range|text|number] and zero <textarea>
  //     inside #p1-log. A slider is a precision claim that seven self-reports cannot support.
  //  2. NO HEALTH STATE IN ANY URL. location.href is byte-identical before and after logging a day.
  //     The export is a Blob object URL on an <a download>, minted on tap and revoked — never
  //     navigated to, and deliberately never a data: URI, which would put the reader's own log into
  //     a string that lands in history, Referer headers and proxy logs.
  //  3. NO ACCOUNT. localStorage only, under `rnawiki_track`. Everything below works signed out.
  //  4. POLARITY-NEUTRAL. The direction question is "better / no change / worse COMPARED WITH YOUR
  //     OWN DAY 1", never "how bad is it". Measured from data/clinical_graph.json: 27 of the 41
  //     problems are `need` and 14 are `want`; across the 52 protocol routes that is 34 need and 18
  //     want. A severity scale asks the wrong question on 18 of 52 routes. A change-from-your-own-
  //     baseline reads correctly on both.
  //  5. IT IS A DIARY, NOT EVIDENCE. Seven self-reported taps. The panel says exactly that, and it
  //     never computes a percentage, an effect size or an average — it prints counts of taps.
  //
  // The optional sync REUSES the existing endpoints verbatim — POST /api/experiments/start and
  // POST /api/experiments/checkin. No new table, no new column, no new route. It sends the protocol
  // id and the fact that a check-in happened today. It does NOT send the direction: the only endpoint
  // that would take one is /api/experiments/outcome, which feeds the public aggregate ledger, and a
  // 7-day compliance week is not an outcome. It is OFF until the reader turns it on, because turning
  // it on is what makes the server mint the anonymous participant cookie (server.js:393 anonMint).
  //
  // VERIFIED AGAINST W1'S WRITE GUARD FROM A REAL BROWSER, not assumed (out/w4log_before.json): a
  // page-context POST to /api/experiments/start returns 503 {"error":"Accounts are not available
  // right now."} — it CLEARS the cross-origin guard and reaches the db.enabled branch. The identical
  // POST by curl with no Origin returns 403 {"error":"Cross-origin writes are not accepted."}. The
  // guard is live and this path passes it.
  const TRACK_KEY = 'rnawiki_track';
  const TRACK_DAYS = 7;
  const TRACK_V = 1;
  const TRACK_DIRS = ['better', 'same', 'worse'];
  const TRACK_DAY_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  // LOCAL calendar days, not UTC: a reader's "today" is the date on their own phone, and a UTC day
  // boundary would silently move the log across a day for everyone east of Greenwich — which is
  // everyone this site is written for. Date.UTC() is used only to DIFFERENCE two already-local
  // dates, where it is exact and immune to daylight saving.
  const isoDay = (d) => { const x = d || new Date(), p = (n) => String(n).padStart(2, '0'); return `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}`; };
  const dayNum = (iso) => { const a = iso.split('-').map(Number); return Date.UTC(a[0], a[1] - 1, a[2]) / 864e5; };
  const dayGap = (a, b) => dayNum(b) - dayNum(a);          // days from a to b; negative if b is earlier
  const isFuture = (d, today) => dayNum(d) > dayNum(today); // named, because dayGap's argument order
                                                            // was inverted here twice and the smoke
                                                            // gate caught it by letting day 7 be
                                                            // logged on day 1 — inventing data
  const dayPlus = (iso, n) => { const a = iso.split('-').map(Number), x = new Date(a[0], a[1] - 1, a[2]); x.setDate(x.getDate() + n); return isoDay(x); };
  // W5 · THE ELAPSED-DAY RULE, IN THE MODEL. A day that has not happened is not a tap, whatever
  // localStorage or a restored file says. Every count, every chip, every sparkline bar and every
  // receipt row reads a day through this one function, so the panel can no longer say two things
  // about the same day. MEASURED HYDRATED before it (qa/out/w5r_repro.json b_chips, b_spark): the
  // day-7 chip carried aria-label "Day 7, not yet" AND class "did" in the same element, and the
  // sparkline's text equivalent read "day 7 did it, better" on day 1.
  // This is defence in depth, not the primary guard: trackValidate() now refuses such a file,
  // but devices that restored one before this shipped still hold it, and a guard that only runs
  // at the door does nothing for what is already inside.
  const tapOn = (log, d, today) => (isFuture(d, today) ? null : ((log.days || {})[d] || null));
  function trackRead() {
    try { const o = JSON.parse(localStorage.getItem(TRACK_KEY) || 'null'); if (o && o.v === TRACK_V && o.logs && typeof o.logs === 'object') return o; } catch (e) {}
    return { v: TRACK_V, logs: {} };
  }
  function trackWrite(o) { try { localStorage.setItem(TRACK_KEY, JSON.stringify(o)); return true; } catch (e) { return false; } }
  const trackKey = (problem, rc) => `${problem.id}/${rc.id}`;
  // W5 · THE MODEL READ BOUNDARY. Every renderer, every count and the receipt itself read the log
  // through here, so this is the one place a log that this page could not have written has to stop.
  // It returns a COPY with the unreadable parts removed and it NEVER writes: a reader's stored bytes
  // are not deleted by being read, and trackEdit() still sees the raw object.
  // MEASURED HYDRATED (qa/out/w5r_repro.json a_visible): with started:"not-a-date" the panel
  // rendered "Day NaN of 7", "7 of 7 days tapped" and a downloadable card. A day key that is not a
  // date can never be produced by dayPlus() and can never be selected by a chip, so dropping it
  // removes nothing a real log shows.
  function trackUsable(L) {
    if (!L || typeof L !== 'object' || !TRACK_DAY_RE.test(String(L.started || ''))) return null;
    const days = {};
    Object.keys(L.days || {}).forEach((d) => { if (TRACK_DAY_RE.test(d) && L.days[d]) days[d] = L.days[d]; });
    return Object.assign({}, L, { days });
  }
  function trackGet(problem, rc) { return trackUsable(trackRead().logs[trackKey(problem, rc)]); }
  function trackEdit(problem, rc, fn) {
    const o = trackRead(), k = trackKey(problem, rc), next = fn(o.logs[k] || null);
    if (next) o.logs[k] = next; else delete o.logs[k];
    return { log: next, saved: trackWrite(o) };
  }
  function trackStart(problem, rc, startedOn, cohortSlug, openedOn) {
    // W5: `cur.started` alone tested for PRESENCE, not readability. Once trackGet() refuses a log
    // whose start date is not a date (above), the panel correctly offers "Start day 1" again — and
    // this line handed the same broken object straight back, so the reader could never get out. A
    // log whose start date is not a date is not a week; Start replaces it.
    return trackEdit(problem, rc, (cur) => (cur && TRACK_DAY_RE.test(String(cur.started || ''))) ? cur : {
      started: (startedOn && TRACK_DAY_RE.test(startedOn)) ? startedOn : isoDay(),
      action: (rc.phase1 || {}).action || '',
      metric: ((problem.safety || {}).metric) || '',
      // W4 · Loop C: the cohort is recorded so the day count stays aligned once the ?cohort= query
      // is gone from the URL. It is a label on the reader's OWN log — nothing reads it back from a
      // server, because there is no server side to a cohort.
      cohort: cohortSlug || null,
      // W5 · THE DAY THIS LOG WAS OPENED ON THIS DEVICE. `started` is not that fact: a ?cohort= link
      // can legitimately backdate it by up to 6 days (COHORT_BACK) or push it 28 days forward, and
      // the pre-logger migration seeds it from a date months old. `opened` is the reader's own clock
      // at the moment they tapped Start, and it is the only thing that makes "days that actually
      // elapsed while this log existed here" checkable at all. Nothing renders it; receiptReady()
      // is its only reader.
      opened: (openedOn && TRACK_DAY_RE.test(openedOn)) ? openedOn : isoDay(),
      sync: false,
      days: {},
    }).log;
  }
  // A restore file is UNTRUSTED INPUT. It is read from the reader's own disk, but it can be any file
  // they tap, so every field is checked before a byte of it reaches localStorage — and the reason a
  // file is rejected is printed, so "nothing happened" is never the answer.
  function trackValidate(raw) {
    // W5: the device's own date, read once, so every day key in the file is judged against the same
    // "now". A restore that spans midnight must not accept a day on one line and refuse it on the next.
    const TODAY = isoDay();
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { error: 'That file is not a log this page wrote.' };
    if (raw.v !== TRACK_V) return { error: `That file says format version ${JSON.stringify(raw.v)}. This page writes version ${TRACK_V}.` };
    const logs = raw.logs;
    if (!logs || typeof logs !== 'object' || Array.isArray(logs)) return { error: 'That file has no logs block.' };
    let days = 0;
    const keys = Object.keys(logs);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i], L = logs[k];
      if (!L || typeof L !== 'object') return { error: `Entry “${k}” is not a log.` };
      if (!TRACK_DAY_RE.test(L.started || '')) return { error: `Entry “${k}” has no valid start date.` };
      // W5: `opened` is the day the log was created on the device that wrote it, and receiptReady()
      // refuses a card for a week the log was not open for all of. It is untrusted here like every
      // other field: it must be a date, and it cannot be a day that has not happened.
      if (typeof L.opened !== 'undefined' && L.opened !== null) {
        if (!TRACK_DAY_RE.test(String(L.opened))) return { error: `Entry “${k}” has an opened date that is not a date: ${JSON.stringify(L.opened)}` };
        if (isFuture(L.opened, TODAY)) return { error: `Entry “${k}” says it was opened on ${L.opened}, which has not happened yet.` };
      }
      if (!L.days || typeof L.days !== 'object') return { error: `Entry “${k}” has no days block.` };
      const dk = Object.keys(L.days);
      for (let j = 0; j < dk.length; j++) {
        const d = dk[j], e = L.days[d];
        if (!TRACK_DAY_RE.test(d)) return { error: `Entry “${k}” has a day key that is not a date: ${JSON.stringify(d)}` };
        // W5 · A DAY THAT HAS NOT HAPPENED IS NOT A TAP. This loop checked the FORMAT of every key
        // and never whether the day had occurred. MEASURED HYDRATED at 390x844, real file through
        // the real <input type=file> (qa/out/w5r_repro.json b_say, b_visible, b_chips, b_spark): a
        // file whose seven day keys were all in the future restored cleanly — "Restored 7 logged
        // days across 1 protocol" — and the panel then read "7 of 7 days tapped · did it on 7 · 7
        // better" on Day 1 of 7, while the chips for days 2–7 carried aria-label "Day N, not yet"
        // AND class "did" at the same time and the sparkline announced "day 7 did it, better".
        // The receipt lock did not hold, it DEFERRED: six days later, with nothing further tapped,
        // the same device rendered data-receipt="ready" and wrote
        // rnawiki-7-day-log-cravings-glycemic-swings-2026-08-08.png, headline row "DID THE ONE THING
        // ON 7 of the 7 days" (qa/out/w5r_repro2.json b7, b7_files).
        // NO FILE THIS PAGE WRITES CAN CONTAIN TOMORROW: future chips render disabled and the click
        // handler re-derives the day from `days`, so this refuses nothing a reader could have made.
        if (isFuture(d, TODAY)) return { error: `Entry “${k}” records ${d}, which has not happened yet. A log cannot contain a day that is still in the future.` };
        if (!e || typeof e !== 'object') return { error: `Entry “${k}” · ${d} is not a record.` };
        // `did` is 1, 0 or null - null being "gave a direction, never answered the one thing". This
        // MUST accept null or the reader's own export stops restoring, and null is the only value a
        // direction-only tap now writes.
        if (e.did !== 0 && e.did !== 1 && e.did !== null && typeof e.did !== 'undefined') return { error: `Entry “${k}” · ${d} carries a value this page cannot read for whether it was done: ${JSON.stringify(e.did)}` };
        // A record that says nothing is not a record. This page never writes one, and accepting one
        // from a file would add a day to the receipt's "days tapped" count that carries no fact.
        if ((e.did === null || typeof e.did === 'undefined') && !e.dir) return { error: `Entry “${k}” · ${d} records nothing — no answer on the one thing and no direction.` };
        if (e.dir != null && TRACK_DIRS.indexOf(e.dir) < 0) return { error: `Entry “${k}” · ${d} carries a direction this page cannot read: ${JSON.stringify(e.dir)}` };
        days++;
      }
    }
    return { logs, days, protocols: keys.length };
  }
  // The sparkline is SEVEN TAPS DRAWN, nothing more. Height is the direction the reader chose, fill
  // is whether they did the thing, and a day with no tap draws a flat rule rather than a zero — a
  // gap and a bad day are different facts and a chart that conflates them is lying quietly. Every
  // bar is also stated in words underneath, because a colour-and-height-only signal is D1, the worst
  // defect on this site.
  const TRACK_H = { better: 30, same: 18, worse: 8 };
  function trackSpark(days, log, today) {
    const CW = 20, H = 44, BASE = 40, BW = 14;
    const bars = days.map((d, i) => {
      const x = i * CW + (CW - BW) / 2, e = tapOn(log, d, today);   // W5: a future day draws the flat "no tap" rule, which is what it is
      if (!e) return `<rect class="sp-none" x="${x}" y="${BASE - 1}" width="${BW}" height="2"><title>Day ${i + 1} — no tap${isFuture(d, today) ? ' yet' : ''}</title></rect>`;
      const h = e.dir ? TRACK_H[e.dir] : 4;
      // THREE STATES. `did` is 1 (said yes), 0 (said no) or null (never answered). `e.did ? ... :
      // 'missed it'` announced and drew "missed it" for a day the reader only gave a direction for -
      // the mirror image of the did:1 default, and the same class of invented fact.
      const didWord = e.did === 1 ? 'did it' : e.did === 0 ? 'missed it' : 'no answer on the one thing';
      const didCls = e.did === 1 ? 'sp-did' : e.did === 0 ? 'sp-miss' : 'sp-unsaid';
      const lbl = `Day ${i + 1} — ${didWord}${e.dir ? ', ' + (e.dir === 'same' ? 'no change' : e.dir) : ', no direction given'}`;
      return `<rect class="sp-bar sp-${e.dir || 'nodir'} ${didCls}" x="${x}" y="${BASE - h}" width="${BW}" height="${h}" rx="2"><title>${esc(lbl)}</title></rect>`;
    }).join('');
    return `<svg class="p1-spark" viewBox="0 0 ${TRACK_DAYS * CW} ${H}" width="${TRACK_DAYS * CW}" height="${H}" role="img" aria-label="Seven days. ${esc(days.map((d, i) => { const e = tapOn(log, d, today); return `day ${i + 1} ${e ? (e.did === 1 ? 'did it' : e.did === 0 ? 'missed it' : 'no answer on the one thing') + (e.dir ? ', ' + (e.dir === 'same' ? 'no change' : e.dir) : '') : 'no tap'}`; }).join('; '))}.">
      <line class="sp-axis" x1="0" y1="${BASE + 1}" x2="${TRACK_DAYS * CW}" y2="${BASE + 1}"></line>${bars}
    </svg>`;
  }
  function phase1LogHTML(problem, rc, focus) {
    const p1 = rc.phase1;
    if (!p1) return '';
    const log = trackGet(problem, rc);
    if (!log || !log.started) {
      // THE FILE THE COPY TELLS THEM TO KEEP HAS TO OPEN SOMEWHERE. The export copy reads
      // "Clearing your browser data deletes it and there is no copy anywhere - so if it matters to
      // you, export it." MEASURED HYDRATED on a device with no log (qa/out/w45log_bde.json d_noLog):
      // #p1-log rendered one paragraph and nothing else - 0 buttons, no #p1-file, and the word
      // "restore" appeared 0 times in #p1-log AND 0 times on the whole page. The reader who did
      // exactly what the copy told them to do could not use the file.
      // Restore is the ONLY control here: nothing that RECORDS a day may exist before Start is
      // tapped, which is what phase1LoggerIsOneTapAndLeaksNothing asserts.
      // #p1-sync-state is load-bearing, not decoration: every restore message - including
      // "Not restored - <reason>" - is written into it, so without it a rejected file fails silently,
      // which is the one outcome trackValidate() exists to prevent.
      return `<p class="p1-log-pre">Tap <b>Start day 1</b> and this becomes a 7-day log: <b>one tap a day</b>. No account, no typing, no sliders. It is kept on this device only, and nothing is sent anywhere unless you switch on the anonymous sync inside it.</p>
      <div class="p1-log-foot">
        <button type="button" class="p1-mini" data-p1="restore">⤒ Restore from a file</button>
        <input type="file" id="p1-file" accept="application/json,.json" hidden>
      </div>
      <p class="p1-log-note">Ran this week on another device, or cleared this browser? Restore the JSON file you exported and the log opens where you left off. The file is read in this browser and nothing is uploaded.</p>
      <p class="p1-sync-state" id="p1-sync-state" role="status"></p>`;
    }
    const today = isoDay();
    const days = [];
    for (let i = 0; i < TRACK_DAYS; i++) days.push(dayPlus(log.started, i));
    const elapsed = dayGap(log.started, today);
    const dayN = Math.min(TRACK_DAYS, Math.max(1, elapsed + 1));
    const over = elapsed + 1 > TRACK_DAYS;
    const sel = (focus && days.indexOf(focus) >= 0 && !isFuture(focus, today)) ? focus : days[dayN - 1];
    const selI = days.indexOf(sel);
    const e = tapOn(log, sel, today);
    // W5: read through tapOn(), so a day that has not happened cannot be counted as tapped. Measured
    // before this (qa/out/w5r_repro.json b_visible): "7 of 7 days tapped · did it on 7 · 7 better"
    // printed under a header reading "Day 1 of 7".
    const loggedN = days.filter(d => tapOn(log, d, today)).length;
    const didN = days.filter(d => { const x = tapOn(log, d, today); return x && x.did === 1; }).length;
    // Days carrying a direction and no answer on the one thing. They used to be counted as "did it";
    // counting them as "missed it" would be the same lie inverted, so they are counted as themselves.
    const unsaidN = days.filter(d => { const x = tapOn(log, d, today); return x && x.did !== 0 && x.did !== 1; }).length;
    // DAY 1 IS THE COMPARISON, so it cannot be compared with itself. The copy said "leave it blank"
    // and the three buttons were live anyway - and the copy was gated on TODAY, not on the SELECTED
    // day. MEASURED HYDRATED (qa/out/w45log_c.json): on day 5, tapping the day-1 chip showed the
    // question with the sentence GONE, 0 of 3 buttons disabled, and a tap stored
    // {"did":1,"dir":"better"} against day 1 - a day-1-vs-day-1 comparison plus the did:1 default.
    // Locked on selI. A direction recorded on day 1 by an older build keeps its buttons live so it
    // can be cleared; a lock that traps existing data is a second defect.
    const dirLocked = selI === 0 && !(e && e.dir), dirDis = dirLocked ? ' disabled' : '';
    const dirN = { better: 0, same: 0, worse: 0 };
    days.forEach(d => { const x = tapOn(log, d, today); if (x && x.dir) dirN[x.dir]++; });   // W5: elapsed days only
    const metric = log.metric || ((problem.safety || {}).metric) || '';
    const dirWords = TRACK_DIRS.filter(k => dirN[k]).map(k => `${dirN[k]} ${k === 'same' ? 'no change' : k}`).join(' · ');
    const chips = days.map((d, i) => {
      const future = isFuture(d, today), x = tapOn(log, d, today);   // W5: one source for the class AND the label — before this, day 7 rendered class "did" under aria-label "Day 7, not yet"
      const xc = !x ? '' : x.did === 1 ? ' did' : x.did === 0 ? ' miss' : ' unsaid';
      const xa = future ? ', not yet' : !x ? ', no tap' : x.did === 1 ? ', did it' : x.did === 0 ? ', missed it' : ', direction only, you did not say whether you did it';
      return `<button type="button" class="p1-chip${d === sel ? ' on' : ''}${xc}" data-p1="day" data-v="${d}"${future ? ' disabled' : ''} aria-pressed="${d === sel}" aria-label="Day ${i + 1}${xa}">${i + 1}</button>`;
    }).join('');
    return `<div class="p1-log-head">
        <b class="p1-day">Day ${dayN} of ${TRACK_DAYS}</b>
        <span class="p1-log-sum">${loggedN ? `${loggedN} of ${TRACK_DAYS} days tapped · did it on ${didN}${unsaidN ? ` · ${unsaidN} with no answer on that` : ''}${dirWords ? ' · ' + esc(dirWords) : ''}` : 'nothing tapped yet'}</span>
      </div>
      ${trackSpark(days, log, today)}
      <p class="p1-spark-cap">Seven taps of your own, drawn. Bar height is the direction you chose, a dashed hollow bar is a day you missed, a plain outlined bar is a day you gave a direction for without saying whether you did the thing, and a flat line is a day with no tap. It is a diary of what you did — not evidence that it worked.</p>
      <div class="p1-chips" role="group" aria-label="Pick a day to log">${chips}</div>
      ${over ? `<p class="p1-log-over">The 7 days ended on ${esc(days[TRACK_DAYS - 1])}. You can still fill in a day you missed — and then read Phase 2, which is now open.</p>` : ''}
      <div class="p1-log-day">
        <p class="p1-log-q">Day ${selI + 1}${sel === today ? ' · today' : ' · ' + esc(sel)} — <b>${esc(log.action || p1.action)}</b>. Did you do it?</p>
        <div class="p1-log-btns">
          <button type="button" class="p1-tap${e && e.did === 1 ? ' on' : ''}" data-p1="did" data-v="1" aria-pressed="${!!(e && e.did === 1)}">✔ Did it</button>
          <button type="button" class="p1-tap${e && e.did === 0 ? ' on' : ''}" data-p1="did" data-v="0" aria-pressed="${!!(e && e.did === 0)}">✗ Missed it</button>
        </div>
        <p class="p1-log-q">${metric ? `“${esc(metric)}”` : 'How it is'}, compared with your own day 1 <span class="p1-log-opt">${dirLocked ? '(off on day 1)' : '(optional)'}</span></p>
        <div class="p1-log-btns">
          <button type="button" class="p1-tap${e && e.dir === 'better' ? ' on' : ''}" data-p1="dir" data-v="better"${dirDis} aria-pressed="${!!(e && e.dir === 'better')}">↑ Better</button>
          <button type="button" class="p1-tap${e && e.dir === 'same' ? ' on' : ''}" data-p1="dir" data-v="same"${dirDis} aria-pressed="${!!(e && e.dir === 'same')}">→ No change</button>
          <button type="button" class="p1-tap${e && e.dir === 'worse' ? ' on' : ''}" data-p1="dir" data-v="worse"${dirDis} aria-pressed="${!!(e && e.dir === 'worse')}">↓ Worse</button>
        </div>
        <p class="p1-log-note">The question is always <b>compared with your own day 1</b>, never “how bad is it” — that way it reads the same whether you are trying to reduce something or build something. ${selI === 0 ? (dirLocked ? 'Day 1 <b>is</b> the comparison, so there is nothing to compare it with and these three are off.' : 'Day 1 is the comparison, so there is nothing to compare it with. A direction was recorded here by an older version — tap the one that is on to clear it.') : ''}</p>
      </div>
      ${receiptBlockHTML(problem, rc, log, days, today, dayN)}
      <div class="p1-log-foot">
        <button type="button" class="p1-mini" data-p1="export">⤓ Export my log</button>
        <button type="button" class="p1-mini" data-p1="restore">⤒ Restore from a file</button>
        <button type="button" class="p1-mini p1-del" data-p1="delete">🗑 Delete this log</button>
        <input type="file" id="p1-file" accept="application/json,.json" hidden>
      </div>
      <p class="p1-log-store">Stored on this device only, in this browser. Clearing your browser data deletes it and there is no copy anywhere — so if it matters to you, export it. The file is plain JSON you can read.</p>
      <div class="p1-sync">
        <button type="button" class="p1-mini p1-sync-btn${log.sync ? ' on' : ''}" data-p1="sync" aria-pressed="${!!log.sync}">${log.sync ? '☁️ Anonymous sync is ON' : '☁️ Also save this anonymously — off'}</button>
        <p class="p1-log-note">${log.sync
          ? 'Sends two things when you tap a day: which protocol this is, and that you checked in today. Not the direction, not any number, no email and no account. It is filed under a random id the site puts in a cookie on this browser, and that id is the only thing in the record — it names nobody and points at nobody else. Your IP address reaches the server the way it does on every page you read.'
          : 'Off. Nothing about this log has left this device. Turning it on sends which protocol this is and that you checked in today — nothing else, and still no account.'}</p>
        <p class="p1-sync-state" id="p1-sync-state" role="status"></p>
      </div>`;
  }
  // ---- W4 · LOOP B (2026-08-02): THE STACK-AUDIT HOOK ------------------------------------------
  // build/prerender.js:stackAuditCallout() emits the IDENTICAL markup and copy. If only one of the
  // two documents carried it, a crawler and a reader would get different pages — the D2/D33 defect
  // class this branch has fixed four times already, and the reason the two functions are kept
  // character-for-character the same rather than "roughly the same".
  //
  // It sits OUTSIDE the collapsed Phase 2 drawer, immediately after it. Inside, it would be
  // invisible until the reader opened Phase 2 — and this is aimed at somebody who already takes a
  // stack, i.e. exactly the reader who does not need to be sold Phase 2.
  //
  // One person, no credential, nothing to buy. assertSingleVoice() and assertNoCredentialClaims()
  // in build/parse.js fail the build on the opposite. The handle comes from data/site_config.json;
  // with none configured this renders nothing rather than a link to nowhere.
  function stackAuditCallout() {
    const h = OWNER.handle, url = OWNER.profile;
    if (!h || !url) return '';
    return `<aside class="stack-audit">
    <h3>Taking a complex supplement stack right now?</h3>
    <p>I go through stacks by hand and look for the same three things: two compounds doing the same job, fillers you are paying for, and doses too low to do anything. Post yours in a reply to me on X and I will break it down, free.</p>
    <p><a class="sa-x" href="${esc(url)}" rel="noopener">𝕏 @${esc(h)} on X →</a></p>
    <p class="sa-scope">I am not a clinician and this is not medical advice. It is one person reading labels against the evidence already on this site — and if something on your list needs a prescription, that conversation belongs with a doctor or pharmacist, not with me.</p>
  </aside>`;
  }
  // ---- W4 (2026-08-02): THE RESEARCH RECEIPT ---------------------------------------------------
  // MEASURED HYDRATED at 390x844 in the default DOM state before this, on
  // /protocol/knee-pain/patellofemoral-pain, /protocol/insomnia/circadian-misalign,
  // /protocol/hair-loss/dht-sensitivity and /protocol/low-testosterone/primary-hypogonadism
  // (out/w4rl_before.json): the word "receipt" 0/4, any share affordance 0/4, any link to x.com or
  // twitter.com 0/4. A reader who tapped seven days finished the week and the page said nothing.
  //
  // THE $0 RULE IS ENFORCED HERE, IN CODE, NOT IN COPY. receiptGuard() re-runs THIS BUILD'S OWN two
  // patterns — data.phase1Guard, published by assertPhase1() in build/parse.js — against the
  // action, plus a scan for every compound name the corpus knows, and refuses to produce a model at
  // all if any of them hits. Three things follow from that:
  //   · the refusal is not a hidden button, it is the absence of a model, so nothing downstream
  //     (the card, the PNG, the share text) can be reached by a reader who pokes at the DOM;
  //   · the word list is PUBLISHED rather than retyped, because a second hand-kept copy of a rule
  //     is exactly the drift that made the interaction coverage number a lie in W3.6;
  //   · it FAILS CLOSED. No data.phase1Guard, no receipt. A receipt that cannot prove the week was
  //     free is precisely the receipt the rule exists to stop.
  // The build gate proves the DATA is $0; this proves the CARD is. Measured: 44 of 52 root causes
  // carry a Phase 1 and all 44 pass the guard, so the refusal branch is unreachable from the
  // shipped corpus — which is why scripts/smoke.mjs plants a prescription action into the live
  // rc.phase1 and asserts the receipt still refuses. A gate over an empty set always passes.
  //
  // WHAT IT DOES NOT DO, and the brief asked for one of them:
  //   · NO 1–10 numbers. The brief's mock shows "Baseline discomfort 8/10 → Day 7 3/10". This
  //     logger deliberately collects no scale (rule 1, tap-only; rule 4, polarity-neutral), so
  //     those numbers do not exist. Printing them would be inventing data. The card shows the two
  //     things that were actually recorded: how many of the 7 days the reader did the thing, and
  //     what they tapped on day 7 compared with their own day 1.
  //   · NO percentage, NO effect size, NO "-62% pain", NO aggregate of any kind. It counts taps.
  //   · NO html2canvas. The brief says "the site already loads html2canvas". IT DOES NOT — measured
  //     in a real browser (out/w4rl_csp.json): the shipped CSP is
  //     `script-src 'self' 'wasm-unsafe-eval' 'unsafe-inline' https://accounts.google.com
  //     https://static.cloudflareinsights.com`, and appending the cdnjs script tag fires
  //     "Loading the script … violates the following Content Security Policy directive" with
  //     window.html2canvas still undefined. loadHtml2canvas() elsewhere in this file has therefore
  //     been dead since the headers shipped. The card is drawn on a first-party <canvas> instead,
  //     which also means the reader's own protocol never appears in a Referer header sent to a CDN.
  const P1G = D.phase1Guard || null;
  const P1_BUY = P1G && P1G.purchase ? new RegExp(P1G.purchase, 'i') : null;
  const P1_RX = P1G && P1G.rx ? new RegExp(P1G.rx, 'i') : null;
  // Every compound the corpus knows, so a "free mechanic" can never turn out to be a molecule.
  let _cpdNames = null;
  function corpusCompoundNames() {
    if (_cpdNames) return _cpdNames;
    const s = new Set();
    (D.compounds || []).forEach((c) => { if (c.name) s.add(String(c.name).toLowerCase()); });
    ((D.graph || {}).problems || []).forEach((p) => (p.root_causes || []).forEach((r) => (r.compounds || []).forEach((n) => s.add(String(n).toLowerCase()))));
    _cpdNames = [...s].filter((n) => n.length > 3);
    return _cpdNames;
  }
  function receiptGuard(rc) {
    const p1 = rc.phase1;
    if (!p1) return { ok: false, why: 'This protocol has no $0 first step, so there is no free week to write up.' };
    if (!P1_BUY || !P1_RX) return { ok: false, why: 'This build published no $0 rule, so nothing here can show that the week cost nothing.' };
    if (p1.cost !== 'none') return { ok: false, why: `This Phase 1 is recorded as costing “${String(p1.cost)}”. A write-up is only ever made for a week that cost nothing.` };
    const a = String(p1.action || '');
    let m = a.match(P1_RX);
    if (m) return { ok: false, why: `“${m[0]}” is a prescription, a dose or a clinician. No write-up is made for a prescription, controlled or toxic protocol — take that one to a doctor or pharmacist instead.` };
    m = a.match(P1_BUY);
    if (m) return { ok: false, why: `“${m[0]}” is something you buy. A write-up is only ever made for a week that cost nothing.` };
    const named = corpusCompoundNames().filter((n) => new RegExp('(^|[^a-z])' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z]|$)', 'i').test(a));
    if (named.length) return { ok: false, why: `This Phase 1 names ${named.slice(0, 3).join(', ')} — a compound, not a free mechanic.` };
    return { ok: true };
  }
  // THE DAY-7 LOCK, IN THE MODEL. It used to live only in receiptBlockHTML(), i.e. it decided what to
  // DRAW and nothing else. MEASURED in a real browser, fresh profile (qa/out/w45log_bde.json): a log
  // started 2026-08-02, clock at day 3, visible state entirely correct - "Day 3 of 7",
  // data-receipt="pending", no download control, no share control - and an injected
  // <button data-p1="receipt-png"> reached the delegated handler, ran receiptDownload(), fired the
  // download anchor and wrote rnawiki-7-day-log-cravings-glycemic-swings-2026-08-08.png to disk: a
  // card titled "7-day self-observation log" for the window 2026-08-02 -> 2026-08-08, ending four
  // days after the device's own date. A guard that only chooses markup is painted, not enforced.
  function receiptReady(log, today) {
    if (!log || !log.started) return { ok: false, why: 'There is no 7-day log on this device.' };
    // W5 · FAIL CLOSED ON A DATE THIS PAGE COULD NOT HAVE WRITTEN. dayNum() of anything that is not
    // a calendar date is NaN, and EVERY comparison against NaN is false — so `dayN < TRACK_DAYS`
    // was false for a broken start date and the lock returned ok:true. MEASURED HYDRATED at 390x844
    // on /protocol/cravings/glycemic-swings with started:"not-a-date" in rnawiki_track, fresh
    // profile (qa/out/w5r_repro.json a_visible): the panel read "Day NaN of 7", the block read
    // data-receipt="ready", and the card asserted "DID THE ONE THING ON 7 of the 7 days" — from ONE
    // stored record, because dayPlus('not-a-date', i) returns the identical string 'NaN-NaN-NaN' for
    // all seven days. Tapping download wrote a real file to disk:
    // rnawiki-7-day-log-cravings-glycemic-swings-NaN-NaN-NaN.png.
    // Both tests below are POSITIVE requirements. A guard that asks "is it too early?" passes on
    // NaN; a guard that asks "have seven days gone by?" does not.
    if (!TRACK_DAY_RE.test(String(log.started)) || !TRACK_DAY_RE.test(String(today))) {
      return { ok: false, why: 'This log’s start date is not a date this page could have written, so no day can be counted from it. Delete the log and start a fresh week.' };
    }
    // W5 · A URL MAY NOT SHORTEN THE WEEK. The cohort block above states the rule in capitals —
    // "A COHORT LINK CAN NEVER HAND YOU A FINISHED WEEK" — and COHORT_BACK = 6 breaks it by exactly
    // one day. MEASURED HYDRATED at 390x844, fresh profile, NO devtools and no file
    // (qa/out/w5r_repro.json d_strip, d_afterTap, d_clicks):
    // /protocol/cravings/glycemic-swings?cohort=2026-07-27-w5probe printed "That makes today day 7
    // of 7 for this cohort" and a button reading "Join the cohort — start on 2026-07-27". Join, then
    // ONE tap on "✔ Did it", gave data-receipt="ready", a card headed "7-day self-observation log"
    // dated "2026-07-27 → 2026-08-02", an X share link reading "7-day $0 trial … Did it on 1 of the
    // 7 days", and a written file, rnawiki-7-day-log-cravings-glycemic-swings-2026-08-02.png.
    // N=7 is refused BY NAME; N=6 was not.
    // THE BOUNDARY IS NOT THE FIX. Measured across ages (qa/out/w5r_repro2.json d_ages): N=3 arrives
    // on day 4, N=5 on day 6, N=6 on day 7. Lowering COHORT_BACK buys one tap. The rule that closes
    // it is that a card may only be made for a week this log was open for ALL of. A late joiner
    // still joins, still gets the shared date and the aligned day count, still sees the empty days;
    // what they do not get is a 7-day write-up for days that were over before their log existed.
    // `opened` is absent on every log written before W5. Those cannot be judged, and refusing them
    // would delete real readers' finished weeks, so they pass — the field is written from now on.
    // THIS TEST RUNS BEFORE THE DAY COUNT, and the order is the point. MEASURED HYDRATED with the
    // two the other way round: a reader joining a 3-day-old cohort saw, on day 4,
    // data-receipt="pending" over "On day 7 this becomes a card you can keep" — a promise the same
    // predicate would refuse three days later. `opened` is known on day 1 and never changes; the day
    // count changes daily. A permanent refusal has to be stated the moment it is known, or the page
    // spends the week making an offer it will not honour.
    if (log.opened && TRACK_DAY_RE.test(String(log.opened)) && dayNum(log.opened) > dayNum(log.started)) {
      const late = dayGap(log.started, log.opened) + 1;
      return { ok: false, why: `This log opened on day ${late} of its own ${TRACK_DAYS} days — the first ${late - 1} were over before it existed on this device. No write-up is made for days you were not here for. Start your own week today and the card is yours on day ${TRACK_DAYS}.` };
    }
    const dayN = Math.min(TRACK_DAYS, Math.max(1, dayGap(log.started, today) + 1));
    if (!(dayN >= TRACK_DAYS)) return { ok: false, dayN, why: `This is day ${dayN} of ${TRACK_DAYS}. The write-up is only made once the ${TRACK_DAYS} days are over — a card dated into the future would be a record of days nobody has lived yet.` };
    return { ok: true, dayN };
  }
  // ONE model, two renderers. The card on the page and the PNG are drawn from this same object, so
  // they cannot say different things — the D33 defect class, one level down.
  function receiptModel(problem, rc) {
    const g = receiptGuard(rc);
    if (!g.ok) return null;
    const log = trackGet(problem, rc);
    if (!log || !log.started) return null;
    // The lock, on the ONLY path that can produce a card, a share text or a PNG. dayN < 7 also covers
    // a start date in the future (a cohort may legitimately start up to 28 days ahead, app.js:5738),
    // and once it passes, days[6] <= today by construction, so no counted day can be in the future.
    const today = isoDay();
    if (!receiptReady(log, today).ok) return null;
    const days = [];
    for (let i = 0; i < TRACK_DAYS; i++) days.push(dayPlus(log.started, i));
    // W5: every row on the card is counted through tapOn(), so no day the reader has not lived can
    // reach the PNG or the share text even if the day-7 lock above is ever weakened again. Once
    // receiptReady() passes, days[6] <= today by construction and this filter removes nothing — it
    // is here so that stops being an argument and starts being a check.
    const loggedN = days.filter((d) => tapOn(log, d, today)).length;
    if (!loggedN) return null;                     // nothing was tapped; there is nothing to write up
    const didN = days.filter((d) => { const x = tapOn(log, d, today); return x && x.did === 1; }).length;
    // Days tapped for direction only, with no answer on the one thing. These used to be counted as
    // "did it" (the did:1 default), so the headline row asserted days nobody claimed.
    const unsaidN = days.filter((d) => { const x = tapOn(log, d, today); return x && x.did !== 0 && x.did !== 1; }).length;
    const dirN = { better: 0, same: 0, worse: 0 };
    days.forEach((d) => { const x = tapOn(log, d, today); if (x && x.dir) dirN[x.dir]++; });
    const word = (k) => (k === 'same' ? 'no change' : k);
    const last = tapOn(log, days[TRACK_DAYS - 1], today);   // W5: the one row that quotes a specific day must not quote a future one
    const rows = [
      ['Did the one thing on', `${didN} of the 7 days`],
      ['Days tapped', `${loggedN} of 7`],
      // Printed only when it is not zero, and never folded into either count above: a day with no
      // answer is neither a "did it" nor a "missed it", and the card has to be able to say so. A
      // lower honest number beats a higher false one.
      ...(unsaidN ? [['Days you did not answer that', `${unsaidN} of the ${loggedN} you tapped`]] : []),
      ['Day 1', 'your own starting point — nothing to compare it with yet'],
      ['Day 7, compared with day 1', last && last.dir ? word(last.dir) : 'not recorded'],
      ['Every direction you tapped', TRACK_DIRS.filter((k) => dirN[k]).map((k) => `${dirN[k]} ${word(k)}`).join(' · ') || 'none tapped'],
    ];
    return {
      pid: problem.id, rcid: rc.id,
      title: '7-day self-observation log',
      target: problem.name,
      cause: rc.name.replace(/\s*\([^)]*\)/g, '').trim(),
      action: log.action || rc.phase1.action,
      metric: log.metric || ((problem.safety || {}).metric) || '',
      from: days[0], to: days[TRACK_DAYS - 1],
      didN, loggedN, unsaidN, dirN, lastDir: last && last.dir ? word(last.dir) : null,
      rows,
      // Never efficacy. One person, seven days, no control, no comparison group — and this site
      // publishes no aggregate of anybody's weeks (brief §0.3, and the cohort feature stays dark).
      disclaimer: 'A personal observation, not a clinical result. One person, seven days, no control group and nothing here is compared with anyone else.',
      foot: AT ? `rnawiki.com/protocol/${problem.id}/${rc.id} · a free wiki by ${AT}` : `rnawiki.com/protocol/${problem.id}/${rc.id}`,
    };
  }
  function receiptRowsHTML(m) {
    return m.rows.map(([k, v]) => `<div class="rcpt-row"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
  }
  function receiptCardHTML(m) {
    return `<div class="rcpt-card" id="rcpt-card">
      <div class="rcpt-brand"><span>🧬 RNAwiki</span><span class="rcpt-free">$0 · no purchase</span></div>
      <h3 class="rcpt-title">${esc(m.title)}</h3>
      <p class="rcpt-target">${esc(m.target)} — ${esc(m.cause)}</p>
      <p class="rcpt-action">${esc(m.action)}</p>
      ${m.metric ? `<p class="rcpt-metric">Watched: ${esc(m.metric)}</p>` : ''}
      <p class="rcpt-dates">${esc(m.from)} → ${esc(m.to)}</p>
      <dl class="rcpt-rows">${receiptRowsHTML(m)}</dl>
      <p class="rcpt-disc">${esc(m.disclaimer)}</p>
      <p class="rcpt-foot">${esc(m.foot)}</p>
    </div>`;
  }
  function receiptBlockHTML(problem, rc, log, days, today, dayN) {
    const g = receiptGuard(rc);
    if (!g.ok) {
      return `<div class="rcpt" data-receipt="refused"><p class="rcpt-refused"><b>No write-up for this one.</b> ${esc(g.why)}</p></div>`;
    }
    // ONE predicate, called from two places, so what is DRAWN and what can be MINTED can never
    // disagree again. This was the whole defect: this line was correct and it was the only copy.
    // W5: two different closed states, and promising a card for the second one would be a new lie in
    // place of an old one. A week that is simply not over yet still reads "on day 7 this becomes a
    // card". A week that can NEVER produce one — a log opened after its own day 1 (a cohort link
    // dated back), or a start date this page could not have written — has to say so, in the words
    // receiptReady() returns. receiptReady() carries `dayN` only for the first case, so that is the
    // branch, and it is the same predicate the mint path uses: no second copy of the rule.
    const rr = receiptReady(log, today);
    if (!rr.ok) {
      return rr.dayN
        ? `<div class="rcpt" data-receipt="pending"><p class="rcpt-pending">On day ${TRACK_DAYS} this becomes a card you can keep — what you did, on how many days, and what you tapped on the last day against your own first one. Nothing else, because nothing else was recorded.</p></div>`
        : `<div class="rcpt" data-receipt="closed"><p class="rcpt-pending">${esc(rr.why)}</p></div>`;
    }
    const m = receiptModel(problem, rc);
    if (!m) return `<div class="rcpt" data-receipt="empty"><p class="rcpt-pending">The 7 days are up and no day was tapped, so there is nothing to write up. Fill in a day above and this becomes a card.</p></div>`;
    return `<div class="rcpt" data-receipt="ready">
      <p class="rcpt-lede"><b>Your 7 days.</b> Only what you actually tapped is on it.</p>
      ${receiptCardHTML(m)}
      <div class="rcpt-actions">
        <button type="button" class="p1-mini rcpt-dl" data-p1="receipt-png">⤓ Download as an image</button>
        ${receiptShareHTML(m)}
      </div>
      <p class="rcpt-note">The image is drawn in this browser and never leaves it until you send it somewhere. It carries no percentage, no effect size and no comparison with anybody else — seven taps of your own are not evidence that anything works, and a card that implied otherwise would be the most shareable false claim on this site.</p>
    </div>`;
  }
  // ---- W4 · LOOP A: the proof-of-work share ---------------------------------------------------
  // Measured hydrated at 390x844 before this, on 4 protocol routes (out/w4rl_before.json): links to
  // x.com or twitter.com, 0/4. There was no way to say you had done the week.
  //
  // FOUR RULES, all asserted in scripts/smoke.mjs (loopAShareIsEditableAndClaimsNothing):
  //  1. NEVER AUTO-POST. It is an <a> to X's own intent composer, which opens with the text filled
  //     in and the reader's finger still required. Nothing is posted by this site, ever.
  //  2. THE TEXT IS BUILT FROM THE SAME MODEL AS THE CARD, so it can carry no claim the card does
  //     not. No percentage, no effect size, no "it worked" — the reader's own two counts and the
  //     direction they themselves tapped, and the sentence that says what that is worth.
  //  3. rel="noreferrer" IS LOAD-BEARING, not boilerplate. Without it x.com receives the protocol
  //     URL as the Referer, and that URL names the reader's problem. The reader chose to post the
  //     text; they did not choose to tell X which page they came from.
  //  4. IT IS NEVER A PRECONDITION. It sits beside the download, not in front of it, and the whole
  //     block only exists when receiptGuard() has already passed — so a prescription protocol has
  //     no share button for the same reason it has no card.
  // The handle comes from data/site_config.json (assertHandleFromConfig fails the build on a copy).
  //
  // NOT INCLUDED, deliberately: the brief's suggested closing line "Tagging @<handle> for the
  // Phase 2 stack review". That puts a promise that somebody will review your stack inside a
  // stranger's own post, where the person making the promise never sees it. The same offer is made
  // in the owner's own voice, on the page, where he can actually stand behind it.
  const RCPT_MAX = 240;   // 280 minus X's fixed 23-char t.co URL and a space, with room to spare
  function receiptShareText(m) {
    const dir = m.lastDir ? `day 7 vs my own day 1: ${m.lastDir}` : 'day 7 was not recorded';
    const t = `7-day $0 trial for ${m.target} on RNAwiki. One free thing, nothing bought. Did it on ${m.didN} of the 7 days; ${dir}. A personal observation, not a result.${AT ? ' ' + AT : ''}`;
    return t.length <= RCPT_MAX ? t : t.slice(0, RCPT_MAX - 1).replace(/\s+\S*$/, '') + '…';
  }
  function receiptShareHTML(m) {
    if (!AT) return '';       // no configured handle, no share surface — never "@undefined"
    const url = 'https://x.com/intent/post?text=' + encodeURIComponent(receiptShareText(m))
      + '&url=' + encodeURIComponent((location.origin || 'https://rnawiki.com') + '/protocol/' + m.pid + '/' + m.rcid);
    return `<a class="p1-mini rcpt-x" href="${esc(url)}" target="_blank" rel="noopener noreferrer">𝕏 Share on X — you can edit it first</a>`;
  }
  // The PNG. Drawn on a first-party <canvas> — see the note above: html2canvas is CSP-blocked on
  // this origin, measured, so the "already loaded" renderer has never run here.
  const RCPT_W = 1080, RCPT_H = 1080;
  function receiptWrap(ctx, text, maxW) {
    const words = String(text).split(/\s+/), out = [];
    let line = '';
    words.forEach((w) => {
      const t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t;
    });
    if (line) out.push(line);
    return out;
  }
  // TWO PASSES. The first measures, the second draws, and the canvas is sized from the measurement.
  // The first version pinned the disclaimer to a fixed offset from the bottom, which is fine until
  // a longer action or metric wraps one line further and the rows walk into the footer. A card that
  // silently overlaps its own disclaimer is worse than one that is a little taller.
  function receiptDraw(x, m, dry) {
    const PAD = 72, W = RCPT_W - PAD * 2;
    const F = (px, w) => `${w || 400} ${px}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
    const put = (s, px, weight, color, lead) => {
      x.font = F(px, weight);
      receiptWrap(x, s, W).forEach((l) => { if (!dry) { x.fillStyle = color; x.fillText(l, PAD, y); } y += lead; });
    };
    let y = PAD + 34;
    x.font = F(30, 700);
    if (!dry) {
      x.fillStyle = '#0f766e'; x.fillRect(0, 0, RCPT_W, 10);
      x.fillStyle = '#5eead4'; x.fillText('🧬 RNAwiki', PAD, y);
      x.textAlign = 'right'; x.fillStyle = '#99f6e4'; x.font = F(26, 700); x.fillText('$0 · NO PURCHASE', RCPT_W - PAD, y); x.textAlign = 'left';
    }
    y += 62;
    put(m.title, 52, 800, '#f4fbfa', 60);
    y += 8;
    put(m.target + ' — ' + m.cause, 30, 500, '#9fb4c0', 40);
    y += 26;
    if (!dry) { x.fillStyle = '#12262b'; x.fillRect(PAD, y - 12, W, 4); }
    y += 44;
    put(m.action, 40, 700, '#e6fffa', 50);
    y += 6;
    if (m.metric) { put('Watched: ' + m.metric, 26, 400, '#9fb4c0', 34); }
    put(m.from + '  →  ' + m.to, 26, 400, '#7f97a4', 34);
    y += 22;
    m.rows.forEach(([k, v]) => {
      put(String(k).toUpperCase(), 24, 700, '#5eead4', 34);
      put(v, 34, 500, '#f4fbfa', 42);
      y += 14;
    });
    y += 22;
    if (!dry) { x.fillStyle = '#12262b'; x.fillRect(PAD, y - 12, W, 2); }
    y += 26;
    put(m.disclaimer, 24, 400, '#9fb4c0', 32);
    y += 12;
    put(m.foot, 24, 600, '#5eead4', 32);
    return y + PAD;
  }
  function receiptPNG(m) {
    const probe = document.createElement('canvas').getContext('2d');
    const h = Math.max(RCPT_H, Math.ceil(receiptDraw(probe, m, true)));
    const c = document.createElement('canvas');
    c.width = RCPT_W; c.height = h;
    const x = c.getContext('2d');
    x.fillStyle = '#0a1218'; x.fillRect(0, 0, RCPT_W, h);
    receiptDraw(x, m, false);
    return c;
  }
  function receiptDownload(problem, rc, say) {
    const m = receiptModel(problem, rc);
    // Second refusal, at the point of writing the file. The button cannot exist without a model, so
    // reaching this is either a corrupted log or somebody driving the DOM by hand; either way the
    // answer is no card.
    if (!m) {
      const g = receiptGuard(rc), r = receiptReady(trackGet(problem, rc), isoDay());
      say('No write-up was made. ' + (!g.ok ? g.why : (!r.ok ? r.why : 'Nothing has been tapped yet, so there is nothing to write up.')));
      return;
    }
    let url = '';
    try {
      const canvas = receiptPNG(m);
      canvas.toBlob((blob) => {
        if (!blob) { say('This browser would not draw the image. Nothing was lost.'); return; }
        // A blob: object URL on a download anchor, exactly like the JSON export — never a data:
        // URI, which would put the reader's own week inside a URL string.
        url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `rnawiki-7-day-log-${m.pid}-${m.rcid}-${m.to}.png`;
        document.body.appendChild(a); a.click(); a.remove();
        say('Saved as an image. It was drawn in this browser and has not been sent anywhere.');
        setTimeout(() => { try { URL.revokeObjectURL(url); } catch (e) {} }, 8000);
      }, 'image/png');
    } catch (e) { say('This browser would not draw the image. Nothing was lost.'); }
  }
  function phase1LogDraw(problem, rc, focus) {
    const host = document.getElementById('p1-log');
    if (!host) return;
    host.dataset.p1day = focus || '';
    host.innerHTML = phase1LogHTML(problem, rc, focus || null);
  }
  function trackSyncNow(problem, rc) {
    const log = trackGet(problem, rc);
    const say = (s) => { const el = document.getElementById('p1-sync-state'); if (el) el.textContent = s; };
    if (!log || !log.sync) return;
    say('Sending…');
    api.startExperiment(problem.id, rc.id)
      .then(() => (log.days[isoDay()] ? api.checkinExperiment(problem.id, rc.id) : null))
      .then(() => say('Saved to the site anonymously.'))
      // Failing to reach the server must never look like losing the log, because it is not the same
      // thing: the tap is already in localStorage before this ever runs.
      .catch(() => say('Could not reach the site. Nothing left this device — your log is safe here.'));
  }
  // TWO KEYS, ONE STATE - the rule the delete path already follows, applied everywhere.
  // `rnawiki_phase1` holds "this week is started" (it disables the Start button, prints its date and
  // opens Phase 2); `rnawiki_track` holds the week itself. RESTORE wrote only the second.
  // MEASURED (qa/out/w45log_bde.json): tap Start on 2026-08-02, then restore a file whose week began
  // 2026-07-27 -> the log correctly read "Day 7 of 7" over "2026-07-27 -> 2026-08-02" while the
  // button above it read "Started 2026-08-02 on this device". One week, two start dates, six days
  // apart, with the receipt already minted from the earlier one.
  function phase1Sync(problem, rc) {
    const log = trackGet(problem, rc);
    if (!log || !log.started) return;
    const k = `${problem.id}/${rc.id}`;
    try {
      const s = JSON.parse(localStorage.getItem(PHASE1_KEY) || '{}');
      if (!s[k] || s[k].started !== log.started) {
        // Object.assign, not a fresh object: `skipped` is a different fact about this protocol and is
        // not ours to drop.
        s[k] = Object.assign({}, s[k], { started: log.started });
        localStorage.setItem(PHASE1_KEY, JSON.stringify(s));
      }
    } catch (e) { /* private mode: the log still works, it is just not remembered */ }
    const sb = document.getElementById('phase1-start');
    if (sb) { sb.disabled = true; sb.textContent = `✓ Started ${log.started} on this device`; }
    const p2 = document.getElementById('phase-2'); if (p2) p2.open = true;
  }
  function mountPhase1Log(problem, rc) {
    const host = document.getElementById('p1-log');
    if (!host || !rc.phase1) return;
    // MIGRATION, and the same two-keys-one-state fix from the other direction: readers who tapped
    // Start before the logger existed carry `rnawiki_phase1` and no `rnawiki_track`. Their Start
    // button is already disabled, so without this the log could never open for them. Seeded with the
    // date they actually started, never today — inventing a start date is inventing data. `skipped`
    // is deliberately not seeded: they said they already do this.
    const st0 = phase1State(problem, rc);
    if (st0 && st0.started && !trackGet(problem, rc)) trackStart(problem, rc, st0.started, null, st0.started);   // W5: these readers DID tap Start on that day, in the pre-logger UI — stamping `opened` as today would refuse them a card for a week they actually began
    // ...and the same reconciliation in the other direction, for devices a pre-W4.5 restore already
    // split. phase1Section() rendered the Start button from `rnawiki_phase1` before this ran, so the
    // DOM is corrected here too, not only the storage.
    phase1Sync(problem, rc);
    phase1LogDraw(problem, rc, null);
    host.onclick = (ev) => {
      const b = ev.target.closest('button[data-p1]');
      if (!b || b.disabled) return;
      const act = b.dataset.p1, v = b.dataset.v || '';
      let focus = host.dataset.p1day || null;
      if (act === 'day') { phase1LogDraw(problem, rc, v); return; }
      const log = trackGet(problem, rc);
      if (!log) return;
      const today = isoDay();
      const days = [];
      for (let i = 0; i < TRACK_DAYS; i++) days.push(dayPlus(log.started, i));
      const dayN = Math.min(TRACK_DAYS, Math.max(1, dayGap(log.started, today) + 1));
      const sel = (focus && days.indexOf(focus) >= 0 && !isFuture(focus, today)) ? focus : days[dayN - 1];
      if (act === 'did' || act === 'dir') {
        trackEdit(problem, rc, (cur) => {
          if (!cur) return cur;
          // `did` DEFAULTS TO null - "not said" - never to 1. MEASURED HYDRATED, real taps, fresh
          // profile, /protocol/cravings/glycemic-swings (qa/out/w45log_a.json): tapping ONLY
          // "down Worse" on day 1 wrote {"did":1,"dir":"worse"}, flipped "Did it" to
          // aria-pressed="true", printed "1 of 7 days tapped, did it on 1, 1 worse", and on day 7 the
          // card's headline row read "DID THE ONE THING ON 1 of the 7 days" and the X share text read
          // "Did it on 1 of the 7 days". The reader said it got worse and never claimed they did the
          // intervention.
          const e = Object.assign({ did: null, dir: null }, cur.days[sel] || {});
          // Both answers retractable: tapping the one already on clears it. The only way back from a
          // mis-tap; without it the receipt asserts the mis-tap for ever.
          if (act === 'did') { const n = v === '1' ? 1 : 0; e.did = (e.did === n) ? null : n; }
          // Tapping the direction you already chose clears it. There is no other way back to "I did
          // not say", and a control you cannot undo teaches people to guess.
          // W5 · AND DAY 1 CAN NEVER RECEIVE ONE. phase1LogHTML() renders these three buttons with
          // `disabled` beside the words "(off on day 1)", and the delegated handler above asks only
          // `if (!b || b.disabled) return;` — it never re-derives dirLocked. So the lock was paint.
          // MEASURED HYDRATED at 390x844 on /protocol/cravings/glycemic-swings, day 1, fresh profile
          // (qa/out/w5r_repro.json c_before, c_after): the three buttons rendered disabled:true, and
          // removing the attribute and clicking "↑ Better" stored {"did":null,"dir":"better"} against
          // 2026-08-02 and printed "1 of 7 days tapped · did it on 0 · 1 with no answer on that ·
          // 1 better" — a comparison of day 1 with itself, which is the one thing the whole polarity-
          // neutral question is built to prevent.
          // A direction left on day 1 by an older build must still be CLEARABLE, so any tap here
          // resolves to null: on day 1 this control can only ever remove one, never set one. The
          // record is then deleted by the line below, so nothing enters loggedN.
          else e.dir = (sel === days[0] || e.dir === v) ? null : v;
          // Neither answer given = the day was never recorded. An empty record would sit in loggedN
          // and put a day on the receipt that carries no fact.
          if (e.did === null && e.dir === null) delete cur.days[sel];
          else cur.days[sel] = e;
          return cur;
        });
        phase1LogDraw(problem, rc, sel);
        trackSyncNow(problem, rc);
        return;
      }
      if (act === 'sync') {
        const next = !log.sync;
        trackEdit(problem, rc, (cur) => { if (cur) cur.sync = next; return cur; });
        phase1LogDraw(problem, rc, sel);
        if (next) trackSyncNow(problem, rc);
        return;
      }
      if (act === 'delete') {
        if (!confirm('Delete this 7-day log from this device? There is no copy anywhere else.')) return;
        trackEdit(problem, rc, () => null);
        // Deleting the log also clears the Phase-1 start flag, and it has to. FOUND BY DRIVING THE
        // REAL UI (out/w4log_after.mjs), not by reading the code: the start flag lives in
        // `rnawiki_phase1` and the log in `rnawiki_track`, so clearing only the log left
        // #phase1-start DISABLED with no log on screen — the reader was locked out of their own
        // protocol with no way back. Two keys, one state: they move together.
        try {
          const s = JSON.parse(localStorage.getItem(PHASE1_KEY) || '{}');
          delete s[`${problem.id}/${rc.id}`];
          localStorage.setItem(PHASE1_KEY, JSON.stringify(s));
        } catch (err) {}
        const sb = document.getElementById('phase1-start');
        if (sb) { sb.disabled = false; sb.textContent = '▶ Start day 1'; }
        phase1LogDraw(problem, rc, null);
        return;
      }
      if (act === 'export') {
        // A Blob object URL, revoked after the download. NOT a data: URI — a data: URI carries the
        // reader's own log inside a URL string, which is exactly what rule 2 forbids. location.href
        // is untouched either way; this never navigates.
        const all = trackRead();
        const one = { v: TRACK_V, exported: today, logs: {} };
        one.logs[trackKey(problem, rc)] = all.logs[trackKey(problem, rc)];
        let url = '';
        try {
          url = URL.createObjectURL(new Blob([JSON.stringify(one, null, 2)], { type: 'application/json' }));
          const a = document.createElement('a');
          a.href = url; a.download = `rnawiki-log-${problem.id}-${rc.id}-${today}.json`;
          document.body.appendChild(a); a.click(); a.remove();
          const el = document.getElementById('p1-sync-state');
          if (el) el.textContent = 'Exported. That file is the only copy that is not in this browser.';
        } catch (err) {
          const el = document.getElementById('p1-sync-state');
          if (el) el.textContent = 'This browser would not create the file. Nothing was lost.';
        }
        if (url) setTimeout(() => { try { URL.revokeObjectURL(url); } catch (err) {} }, 8000);
        return;
      }
      if (act === 'restore') { const f = document.getElementById('p1-file'); if (f) f.click(); return; }
      if (act === 'receipt-png') {
        receiptDownload(problem, rc, (s) => { const el = document.getElementById('p1-sync-state'); if (el) el.textContent = s; });
        return;
      }
    };
    host.onchange = (ev) => {
      const f = ev.target;
      if (!f || f.id !== 'p1-file' || !f.files || !f.files[0]) return;
      const say = (s) => { const el = document.getElementById('p1-sync-state'); if (el) el.textContent = s; };
      const r = new FileReader();
      r.onerror = () => say('That file could not be read.');
      r.onload = () => {
        let parsed = null;
        try { parsed = JSON.parse(String(r.result)); } catch (err) { say('That file is not readable JSON, so nothing was changed.'); return; }
        const v = trackValidate(parsed);
        if (v.error) { say('Not restored — ' + v.error + ' Nothing on this device was changed.'); return; }
        const o = trackRead();
        Object.keys(v.logs).forEach((k) => {
          const inc = v.logs[k], cur = o.logs[k];
          if (!cur) { o.logs[k] = inc; return; }
          cur.days = Object.assign({}, cur.days, inc.days);
          if (dayNum(inc.started) < dayNum(cur.started)) cur.started = inc.started;
          // W5: `opened` moves with `started`, earliest wins. A week begun on a phone and continued on
          // a laptop was open, somewhere the reader was, from the earlier of the two dates — and if
          // this line is missing, the merged log looks like one opened after its own day 1 and the
          // reader loses a card they earned. This is the mirror of the two-keys-one-state fix above.
          if (inc.opened && (!cur.opened || dayNum(inc.opened) < dayNum(cur.opened))) cur.opened = inc.opened;
        });
        if (!trackWrite(o)) { say('This browser refused to save. Nothing was changed.'); return; }
        // Both keys move together, or the Start button and the log print two different start dates
        // for one week (qa/out/w45log_bde.json).
        phase1Sync(problem, rc);
        phase1LogDraw(problem, rc, null);
        // A file can hold another protocol's week. Saying "restored" over an unchanged panel reads as
        // a failure; naming it is the difference between quiet and honest.
        const mine = Object.prototype.hasOwnProperty.call(v.logs, trackKey(problem, rc));
        say(`Restored ${v.days} logged day${v.days === 1 ? '' : 's'} across ${v.protocols} protocol${v.protocols === 1 ? '' : 's'}.` + (mine ? '' : ' None of them is this protocol, so the log on this page has not changed.'));
      };
      r.readAsText(f.files[0]);
    };
  }
  // ---- D2 (2026-08-01): MOVE · FUEL · STACK, restored to the HYDRATED document -----------------
  // MEASURED BEFORE THIS, hydrated at 390x844 with every <details> expanded and every .chapter
  // activated, on all 52 /protocol/* routes (out/w2d2_measure.json): "Move —" 0/52, "Fuel —" 0/52,
  // "Stack —" 0/52, "Daily nutrient targets" 0/52, "call your local emergency number" 2/52, the
  // Singapore emergency number 995 0/52 — against 52/52 for every one of those in the PRERENDERED
  // document. Meanwhile the hydrated footer printed "Nutrient targets are general adult guidance
  // with a stated reason" on 52/52 pages showing zero nutrient targets, and the tab said
  // "… protocol — Move, Fuel & Stack". The page promised three things it had deleted.
  // The layers were removed on 2026-07-09 when item-picking moved into the /plan builder. What the
  // builder never took over is the part that is not picking: the prescription, the 189 authored
  // nutrient targets, the food list, and the compound list with its regulatory status.
  //
  // THREE THINGS THIS DELIBERATELY DOES NOT RENDER:
  //  1. generateProtocol()'s exercise list. build/prerender.js:protoMove rejected that same tag
  //     join because it contradicted the page's own prescription on 48 of the 49 protocols that
  //     rendered one, and `protocol_exercise` is authored on 0 of 52 root causes (measured), so the
  //     crawler's Move block IS the prescription prose. This matches it. The builder still uses
  //     P.strengthen / P.stretch to let a reader pick movements.
  //  2. generateProtocol()'s `stack`. That list backfills from a goal/pathway pool up to six and
  //     applies no regulatory filter: it adds Statins to /protocol/knee-pain/patellofemoral-pain,
  //     and BPC-157, MK-677 or clomiphene elsewhere, to root causes that never authored them.
  //     Printing that under "supplements" would advertise prescription-only medicines to the public
  //     (Medicines Act 1975 s.51). The Stack here is the AUTHORED rc.compounds only, filtered to
  //     supplement/OTC by the REGULATOR's classification (regClass), exactly like protoStack().
  //     Authored items that are not consumer-class are not dropped — they render in their own
  //     non-recommending block, which is what the crawler already gets.
  //  3. Any dose for any compound.
  const isConsumerCpd = (c) => ['supplement', 'otc'].includes(regClass(c));
  function authoredCompounds(rc) {
    const out = [], ids = new Set();
    (rc.compounds || []).forEach(n => { const c = resolveCompound(n); if (c && !ids.has(c.id)) { ids.add(c.id); out.push(c); } });
    return out;
  }
  function protocolLayers(problem, rc, P) {
    const rx = rc.prescription || {};
    const authored = authoredCompounds(rc);
    const stack = authored.filter(isConsumerCpd);
    const med = authored.filter(c => !isConsumerCpd(c));
    const foods = P.fuel || [];
    const tg = Object.entries(rc.nutrient_targets || {});
    // W4 (2026-08-02): Phase 2 is COLLAPSED until Phase 1 is started or explicitly skipped, and it
    // is open from the first paint on the 8 root causes that have no Phase 1 — hiding the only
    // thing those pages have behind a step the reader cannot take would be worse than the defect.
    // Computed here, not after innerHTML, so the <details> renders in its final state.
    const p2open = (phase1State(problem, rc) || !rc.phase1) ? ' open' : '';
    return `<section class="plan-section" id="p-move">
        <div class="cause-step">THE PROTOCOL · MOVE</div>
        <h2>🏃 Move — the mechanics that fix it${rx.scheme ? ': ' + esc(rx.scheme) : ''}</h2>
        <p class="p-maint-note">The full programme, for after the 7 days. Phase 1 is one piece of this, done alone.</p>
        ${rx.detail ? `<p>${esc(rx.detail)}</p>` : '<p>No movement prescription is authored for this root cause yet — that is a gap, not a judgement that movement does not matter here.</p>'}
        <p class="muted">Pick and track individual movements in the plan builder below. This page gives the prescription, not a fixed exercise list.</p>
      </section>
      <section class="plan-section" id="p-fuel">
        <div class="cause-step">MAINTENANCE · NOT PART OF THE 7 DAYS</div>
        <h2>🥗 Fuel — what to keep eating anyway</h2>
        <p class="p-maint-note">This is background, not the experiment. Keep eating the way you already eat during Phase 1 — changing your food and your one Phase 1 habit in the same week means the week tells you nothing.</p>
        ${foods.length ? `<div class="fuel-stack-grid">${foods.map(f => `<div class="fs-item"><span><b>${esc(f.name)}</b>${f.serving ? ` <small>${esc(f.serving)}</small>` : ''}</span>${f.sg_local ? '<span class="sg">SG</span>' : ''}</div>`).join('')}</div>` : ''}
        ${tg.length ? `<h3 class="plan-h" style="margin:.9rem 0 .5rem">Daily nutrient targets</h3>
          <div class="fuel-stack-grid">${tg.map(([k, t]) => `<div class="fs-item"><span><b>${esc(NUTRIENT_LABEL[k] || k)}</b>${t.why ? `<br><small>${esc(t.why)}</small>` : ''}</span><span><b>${esc(String(t.target))}${esc(t.unit || '')}</b>${t.type ? ` <small>(${esc(t.type)})</small>` : ''}</span></div>`).join('')}</div>
          <p class="muted">General adult guidance with a stated reason, not a personal prescription. <a href="/fuel/${esc(problem.id)}/${esc(rc.id)}">Open the Fuel Tracker — targets, foods and why each one →</a></p>` : ''}
      </section>
      <details class="phase2" id="phase-2"${p2open}>
        <summary><span class="p2-k">Phase 2 · optional</span> The targeted stack — only after Phase 1</summary>
        <div class="p2-body">
      <section class="plan-section" id="p-stack">
        <div class="cause-step">THE PROTOCOL · STACK</div>
        <h2>💊 Stack — supplements with human trial evidence for this use</h2>
        <p class="muted">★ = strength of the human evidence for this use. Nothing here is a recommendation to take anything.</p>
        ${stack.length ? stack.map(stackCard).join('')
          : '<p>No supplement has human trial evidence specific to this root cause that belongs on this page. That is the honest answer, not an omission.</p>'}
      </section>
      ${med.length ? `<section class="plan-section" id="p-medical">
        <div class="cause-step">THE PROTOCOL · MEDICAL OPTIONS</div>
        <h2>🩺 Medical options — discuss with a doctor</h2>
        <p>These are prescription, pharmacy-only or non-approved medicines. They are listed so you know they exist and can raise them with a clinician — they are not recommendations, they are not ranked, and no doses for them appear here.</p>
        <div class="fuel-stack-grid">${med.map(c => `<div class="fs-item"><span><a href="#/c/${slug(c.name)}"><b>${esc(c.name)}</b></a><br><span class="pill rx" data-axis="supply" aria-label="How you get it: ${esc(String(sgAvailability(c).tag).toLowerCase())}">${esc(sgAvailability(c).tag)}</span></span></div>`).join('')}</div>
      </section>` : ''}
        </div>
      </details>`;
  }
  // ---- Short-form / TikTok export engine: 9:16 screenshot-ready card + auto-generated script ----
  // Generalized across content types (causes, myths, mechanism cascade, molecule journey, did-you-know).
  const stripMd = s => String(s || '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/<[^>]+>/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
  const clipTxt = (s, n) => { s = stripMd(s); return s.length > n ? s.slice(0, n - 1).trim() + '…' : s; };
  const scDisclaimer = ['', '— Not medical advice. Educational.'];
  // A share button any content section can drop in. `ref` = "type:id".
  const shareBtn = (ref, label) => `<button class="share-short-btn" data-share-short="${esc(ref)}">📱 ${esc(label || 'Make a short — TikTok / Reel')}</button>`;
  // Each builder returns { name, spec, script }. spec drives the 9:16 card.
  const SHARE = {
    cause(problem) {
      const w = problem.why; if (!w) return null;
      const causes = (w.causes || []).slice().sort((a, b) => (a.rank || 9) - (b.rank || 9));
      const top = causes[0];
      const nodes = top ? (top.chain || []).map(n => ({ ico: { trigger: '⚡', mediator: '⚙️', tissue: '🧬', symptom: '💥' }[n.type] || '', cls: 'sc-' + n.type, text: stripMd(n.node) })) : [];
      const L = [`🎬 HOOK (0–3s):`, `"${causes.length} real reasons you have ${problem.name.toLowerCase()} — and the one almost everyone misses."`, ''];
      causes.forEach((c, i) => {
        const chain = (c.chain || []).map(n => stripMd(n.node)).join(' → ');
        L.push(`▶ CAUSE ${i + 1} — ${stripMd(c.name)}${c.evidenceTier ? ` (${['', 'emerging', 'likely', 'proven'][c.evidenceTier]})` : ''}:`);
        if (chain) L.push(`   ${chain}`);
        const fix = (c.fixes || [])[0]; if (fix) L.push(`   Fix: ${stripMd(fix.what)}`);
        L.push('');
      });
      if (w.theOneThing) { L.push(`⭐ THE ONE THING:`, `"${stripMd(w.theOneThing).split('. ').slice(0, 2).join('. ')}."`, ''); }
      L.push(`📣 CTA: "Find which one is yours — full breakdown at rnawiki.com."`, ...scDisclaimer);
      return {
        name: problem.name,
        spec: { kicker: problem.kind === 'want' ? 'THE REAL DRIVERS OF' : 'WHY YOU HAVE', title: problem.name, count: `${causes.length} cause${causes.length !== 1 ? 's' : ''} — here's #1`, nodes, arrows: true, fix: (top && top.fixes && top.fixes[0]) ? '✅ ' + stripMd(top.fixes[0].what) : '', foot: 'Find yours →' },
        script: L.join('\n'),
      };
    },
    myths(c) {
      const M = c.myths || []; if (!M.length) return null;
      const first = M[0];
      const nodes = [{ ico: '✗', cls: 'sc-myth', text: '“' + stripMd(first.myth) + '”' }, { ico: '✓', cls: 'sc-truth', text: stripMd(first.truth) }];
      const L = [`🎬 HOOK (0–3s):`, `"${M.length} thing${M.length !== 1 ? 's' : ''} you still believe about ${c.name} that ${M.length !== 1 ? 'are' : 'is'} flat wrong."`, ''];
      M.forEach((m, i) => { L.push(`❌ MYTH ${i + 1}: "${stripMd(m.myth)}"`, `✅ TRUTH: ${stripMd(m.truth)}`, ''); });
      L.push(`📣 CTA: "The real science on ${c.name} — rnawiki.com."`, ...scDisclaimer);
      return { name: c.name, spec: { kicker: 'MYTHS ABOUT', title: c.name, count: `${M.length} myth${M.length !== 1 ? 's' : ''} to unlearn`, nodes, arrows: false, foot: 'The real science →', grad: 'linear-gradient(160deg,#0f172a,#7c2d12 60%,#b91c1c)' }, script: L.join('\n') };
    },
    mechanism(c) {
      const S = c.mechSteps || []; if (!S.length) return null;
      const nodes = S.slice(0, 4).map(s => ({ ico: '▸', text: stripMd(s.t) }));
      const L = [`🎬 HOOK (0–3s):`, `"How ${c.name} actually works — in ${S.length} step${S.length !== 1 ? 's' : ''}."`, ''];
      S.forEach(s => { L.push(`▶ STEP ${s.n}: ${stripMd(s.t)}${s.fx ? ` (${stripMd(s.fx)})` : ''}`); if (s.d) L.push(`   ${stripMd(s.d)}`); L.push(''); });
      L.push(`📣 CTA: "The full mechanism — rnawiki.com."`, ...scDisclaimer);
      return { name: c.name, spec: { kicker: 'HOW IT WORKS', title: c.name, count: `${S.length} step${S.length !== 1 ? 's' : ''}, trigger → effect`, nodes, arrows: true, foot: 'Full mechanism →', grad: 'linear-gradient(160deg,#0f172a,#1e3a8a 60%,#0e7490)' }, script: L.join('\n') };
    },
    journey(c) {
      const J = c.journey || []; if (!J.length) return null;
      const nodes = J.slice(0, 5).map((s, i) => ({ ico: (i + 1) + '.', text: stripMd(s.stage) }));
      const L = [`🎬 HOOK (0–3s):`, `"Follow one molecule of ${c.name} through your body."`, ''];
      J.forEach((s, i) => { L.push(`▶ ${i + 1}. ${stripMd(s.stage)}`); if (s.d) L.push(`   ${stripMd(s.d)}`); L.push(''); });
      L.push(`📣 CTA: "The whole journey — rnawiki.com."`, ...scDisclaimer);
      return { name: c.name, spec: { kicker: 'FOLLOW ONE MOLECULE', title: c.name, count: `${J.length} stage${J.length !== 1 ? 's' : ''}, dose → target`, nodes, arrows: true, foot: 'The full journey →', grad: 'linear-gradient(160deg,#0f172a,#155e75 60%,#0d9488)' }, script: L.join('\n') };
    },
    fact(c, id) {
      const f = (window.RNAWIKI_FACTS || []).find(x => x.href === '/c/' + id); if (!f) return null;
      const L = [`🎬 HOOK (0–3s):`, `"Bet you didn't know this about ${c.name}."`, '', `💡 ${stripMd(f.t)}`, ''];
      if (c.plain) L.push(`WHY IT MATTERS:`, clipTxt(c.plain, 220), '');
      L.push(`📣 CTA: "More on ${c.name} — rnawiki.com."`, ...scDisclaimer);
      return { name: c.name, spec: { kicker: 'DID YOU KNOW', title: c.name, big: stripMd(f.t), foot: 'More surprising facts →', grad: 'linear-gradient(160deg,#0f172a,#3730a3 60%,#7e22ce)' }, script: L.join('\n') };
    },
  };
  function shareCardFromSpec(sp) {
    const nodes = (sp.nodes || []).map((n, i) => `<div class="sc-node ${n.cls || ''}"><span>${n.ico || ''}</span> ${esc(clipTxt(n.text, 88))}</div>${(sp.arrows && i < sp.nodes.length - 1) ? '<div class="sc-down">↓</div>' : ''}`).join('');
    return `<div class="share-card" id="share-card"${sp.grad ? ` style="background:${sp.grad}"` : ''}>
      <div class="sc-brand">🧬 RNAwiki</div>
      <div class="sc-kicker">${esc(sp.kicker || '')}</div>
      <div class="sc-title">${esc(sp.title || '')}</div>
      ${sp.count ? `<div class="sc-count">${esc(sp.count)}</div>` : ''}
      ${nodes ? `<div class="sc-chain">${nodes}</div>` : ''}
      ${sp.big ? `<div class="sc-big">${esc(clipTxt(sp.big, 190))}</div>` : ''}
      ${sp.fix ? `<div class="sc-fix">${esc(clipTxt(sp.fix, 96))}</div>` : ''}
      <div class="sc-foot">${esc(sp.foot || 'Full breakdown →')} <b>rnawiki.com</b></div>
    </div>`;
  }
  // ---- Native-SVG rasterizer: exports the card as a real PNG, no external libs. ----
  // Rendered from `spec` as pure SVG shapes+text (NOT an <foreignObject> image), so the
  // canvas is not tainted and toBlob() yields a downloadable file. Graceful alert fallback.
  const SC_NODE_FILL = { '': 'rgba(255,255,255,0.14)', 'sc-symptom': 'rgba(251,191,36,0.28)', 'sc-trigger': 'rgba(56,189,248,0.24)', 'sc-mediator': 'rgba(168,85,247,0.24)', 'sc-tissue': 'rgba(52,211,153,0.22)', 'sc-myth': 'rgba(239,68,68,0.28)', 'sc-truth': 'rgba(34,197,94,0.26)' };
  const SC_FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  const _measCtx = (() => { try { return document.createElement('canvas').getContext('2d'); } catch (e) { return null; } })();
  function _wrap(text, fontPx, weight, maxW) {
    text = String(text == null ? '' : text);
    if (!_measCtx) return [text];
    _measCtx.font = `${weight} ${fontPx}px ${SC_FONT}`;
    const words = text.split(/\s+/).filter(Boolean); const lines = []; let cur = '';
    for (const w of words) { const t = cur ? cur + ' ' + w : w; if (_measCtx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
    if (cur) lines.push(cur); return lines.length ? lines : [''];
  }
  function _gradStops(grad) {
    grad = grad || 'linear-gradient(160deg,#0f172a,#4c1d95 60%,#be185d)';
    const m = grad.match(/linear-gradient\(\s*([\-\d.]+)deg\s*,(.+)\)\s*$/);
    let angle = 160, gbody = '#0f172a,#4c1d95 60%,#be185d';
    if (m) { angle = parseFloat(m[1]); gbody = m[2]; }
    const parts = gbody.split(',').map(s => s.trim());
    const stops = parts.map((p, i) => { const mm = p.match(/(#[0-9a-fA-F]{3,8})\s*(?:([\d.]+)%)?/); const color = mm ? mm[1] : '#000'; const off = (mm && mm[2] != null) ? parseFloat(mm[2]) : (i / Math.max(1, parts.length - 1)) * 100; return { color, off }; });
    return { angle, stops };
  }
  function shareCardSvg(spec, scale) {
    scale = scale || 3;
    const W = 288, H = 512, padX = 19, padY = 21, cw = W - padX * 2;
    const esc2 = s => esc(String(s == null ? '' : s));
    const g = _gradStops(spec.grad);
    const a = g.angle * Math.PI / 180, gx = Math.sin(a), gy = -Math.cos(a);
    const x1 = (0.5 - gx / 2).toFixed(4), y1 = (0.5 - gy / 2).toFixed(4), x2 = (0.5 + gx / 2).toFixed(4), y2 = (0.5 + gy / 2).toFixed(4);
    let body = ''; let y = padY;
    const line = (txt, size, weight, opacity, extra) => { body += `<text x="${padX}" y="${(y + size).toFixed(1)}" font-family="${SC_FONT}" font-size="${size}" font-weight="${weight}" fill="#fff"${opacity != null ? ` opacity="${opacity}"` : ''}${extra || ''}>${esc2(txt)}</text>`; y += size * 1.18; };
    line('🧬 RNAwiki', 12.8, 800, 0.92); y += 4;
    if (spec.kicker) { line(String(spec.kicker).toUpperCase(), 10.9, 700, 0.75, ' letter-spacing="1.1"'); y += 2; }
    _wrap(spec.title, 27.2, 800, cw).slice(0, 3).forEach(tl => { body += `<text x="${padX}" y="${(y + 24).toFixed(1)}" font-family="${SC_FONT}" font-size="27.2" font-weight="800" fill="#fff">${esc2(tl)}</text>`; y += 28.5; });
    y += 3;
    if (spec.count) { line(spec.count, 13.1, 500, 0.85); y += 4; }
    (spec.nodes || []).forEach((n, i) => {
      const label = (n.ico ? n.ico + ' ' : '') + n.text;
      const fw = (n.cls === 'sc-truth' || n.cls === 'sc-symptom') ? 700 : 400;
      const nl = _wrap(label, 13.1, fw, cw - 20).slice(0, 4);
      const ph = nl.length * 16 + 12;
      body += `<rect x="${padX}" y="${y.toFixed(1)}" width="${cw}" height="${ph.toFixed(1)}" rx="9" fill="${SC_NODE_FILL[n.cls] || SC_NODE_FILL['']}"/>`;
      let ty = y + 10; nl.forEach(l => { body += `<text x="${padX + 10}" y="${(ty + 11).toFixed(1)}" font-family="${SC_FONT}" font-size="13.1" font-weight="${fw}" fill="#fff">${esc2(l)}</text>`; ty += 16; });
      y += ph;
      if (spec.arrows && i < spec.nodes.length - 1) { body += `<text x="${W / 2}" y="${(y + 11).toFixed(1)}" text-anchor="middle" font-family="${SC_FONT}" font-size="12" fill="#fff" opacity="0.6">↓</text>`; y += 15; } else { y += 3; }
    });
    if (spec.big) {
      const bl = _wrap(spec.big, 16.3, 600, cw - 22).slice(0, 7);
      const bh = bl.length * 21 + 20;
      body += `<rect x="${padX}" y="${y.toFixed(1)}" width="${cw}" height="${bh.toFixed(1)}" rx="11" fill="rgba(255,255,255,0.14)"/>`;
      let ty = y + 12; bl.forEach(l => { body += `<text x="${padX + 11}" y="${(ty + 14).toFixed(1)}" font-family="${SC_FONT}" font-size="16.3" font-weight="600" fill="#fff">${esc2(l)}</text>`; ty += 21; });
      y += bh + 6;
    }
    if (spec.fix) {
      const fl = _wrap(spec.fix, 13.1, 600, cw - 20).slice(0, 3);
      const fh = fl.length * 17 + 14;
      body += `<rect x="${padX}" y="${y.toFixed(1)}" width="${cw}" height="${fh.toFixed(1)}" rx="9" fill="rgba(34,197,94,0.25)"/>`;
      let ty = y + 11; fl.forEach(l => { body += `<text x="${padX + 10}" y="${(ty + 11).toFixed(1)}" font-family="${SC_FONT}" font-size="13.1" font-weight="600" fill="#fff">${esc2(l)}</text>`; ty += 17; });
    }
    body += `<text x="${W / 2}" y="${H - padY - 4}" text-anchor="middle" font-family="${SC_FONT}" font-size="12.8" fill="#fff" opacity="0.92">${esc2((spec.foot || 'Full breakdown →') + ' rnawiki.com')}</text>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W * scale}" height="${H * scale}" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="scg" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${g.stops.map(s => `<stop offset="${s.off}%" stop-color="${s.color}"/>`).join('')}</linearGradient><clipPath id="scc"><rect x="0" y="0" width="${W}" height="${H}" rx="20"/></clipPath></defs><g clip-path="url(#scc)"><rect x="0" y="0" width="${W}" height="${H}" fill="url(#scg)"/>${body}</g></svg>`;
  }
  function shareDownloadPng(spec, name, btn) {
    const fail = () => { if (btn) { btn.textContent = 'Screenshot the card instead'; setTimeout(() => btn.textContent = '⬇ Download PNG', 2600); } };
    try {
      const blob = new Blob([shareCardSvg(spec, 3)], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas'); canvas.width = 288 * 3; canvas.height = 512 * 3;
          canvas.getContext('2d').drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          canvas.toBlob(b => { if (!b) return fail(); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = (name || 'rnawiki-short') + '.png'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); if (btn) { btn.textContent = '✓ Saved'; setTimeout(() => btn.textContent = '⬇ Download PNG', 1800); } }, 'image/png');
        } catch (e) { URL.revokeObjectURL(url); fail(); }
      };
      img.onerror = () => { URL.revokeObjectURL(url); fail(); };
      img.src = url;
    } catch (e) { fail(); }
  }
  function shareShortModal(ref) {
    // ref = "type:id". Back-compat: a bare id (no ":") is treated as a cause problem id.
    let type, id;
    if (ref.indexOf(':') === -1) { type = 'cause'; id = ref; }
    else { const i = ref.indexOf(':'); type = ref.slice(0, i); id = ref.slice(i + 1); }
    let built = null;
    if (type === 'cause') { const p = (D.graph.problems || []).find(p => p.id === id); if (p) built = SHARE.cause(p); }
    else if (SHARE[type]) { const c = bySlug[id]; if (c) built = SHARE[type](c, id); }
    if (!built) return;
    const ov = document.createElement('div'); ov.className = 'modal-ov share-ov';
    ov.innerHTML = `<div class="modal share-modal"><button class="modal-x" aria-label="Close">×</button>
      <h3 class="share-h">📱 Make a short — ${esc(built.name)}</h3>
      <p class="share-sub">Download the card as a PNG (or screenshot it) for your cover, then film — voice-over or captions — with the script. No face needed.</p>
      <div class="share-grid">
        <div class="share-card-wrap">${shareCardFromSpec(built.spec)}<button class="cta-primary share-dl">⬇ Download PNG</button></div>
        <div class="share-script-wrap"><label>Ready-to-film script</label><textarea class="share-script" readonly rows="16">${esc(built.script)}</textarea>
          <button class="cta-primary share-copy">Copy script</button></div>
      </div></div>`;
    document.body.appendChild(ov);
    const close = () => ov.remove();
    ov.querySelector('.modal-x').onclick = close;
    ov.onclick = e => { if (e.target === ov) close(); };
    ov.querySelector('.share-dl').onclick = () => { const b = ov.querySelector('.share-dl'); b.textContent = 'Rendering…'; shareDownloadPng(built.spec, slug(built.name) + '-' + type, b); };
    ov.querySelector('.share-copy').onclick = () => { const t = ov.querySelector('.share-script'); t.select(); try { navigator.clipboard.writeText(t.value); } catch (e) { document.execCommand('copy'); } const b = ov.querySelector('.share-copy'); b.textContent = '✓ Copied'; setTimeout(() => b.textContent = 'Copy script', 1600); };
  }
  async function renderProtocol(pid, rcid, clinicHandle, cohortSlug) {
    try { await ensureProtocolData(); } catch (e) { app.innerHTML = `<div class="empty"><h1>Couldn’t load protocol data</h1><p><a href="#/solve">← Back</a></p></div>`; return; }
    const found = findRootCause(pid, rcid);
    if (!found) { app.innerHTML = notFound(); return; }
    const { problem, rc } = found;
    // W4 · Loop C: ?cohort=<YYYY-MM-DD>-<name>. Parsed here, once, and refused with a stated
    // reason rather than silently dropped — a link that does nothing and says nothing is how a
    // reader ends up believing they joined something.
    const cohort = cohortParse(cohortSlug, rc);
    const P = generateProtocol(rc);
    const others = problem.root_causes.filter(r => r.id !== rc.id);
    const _mv = [...(P.strengthen || []), ...(P.stretch || [])].slice(0, 5).map(e => e.name).filter(Boolean).join(', ');
    const _fl = (P.fuel || []).slice(0, 5).map(f => f.name).filter(Boolean).join(', ');
    const _stk = (P.stack || []).slice(0, 5).map(c => c.name).filter(Boolean).join(', ');
    const pfaq = faqRender([
      rc.diagnostic ? { q: `What causes ${problem.name.toLowerCase()}?`, a: `${rc.name}. ${faqSnip(rc.diagnostic, 240)}` } : null,
      _mv ? { q: `What exercises help ${problem.name.toLowerCase()}?`, a: `Key movements: ${_mv}.` } : null,
      _fl ? { q: `What should you eat for ${problem.name.toLowerCase()}?`, a: `Foods that support it: ${_fl}.` } : null,
      _stk ? { q: `What supplements help ${problem.name.toLowerCase()}?`, a: `Evidence-ranked options: ${_stk}.` } : null,
    ]);
    const rcSwitch = problem.root_causes.length > 1
      ? `<div class="rc-switch"><span>Which fits you?</span>${problem.root_causes.map(r =>
        `<a class="${r.id === rc.id ? 'on' : ''}" title="${esc(r.diagnostic || '')}" href="#/protocol/${problem.id}/${r.id}">${esc(r.name.split('(')[0].trim())}</a>`).join('')}
        <span class="rc-hint">Hover a root cause to see who it fits.</span>${problem.assessment ? `<button class="rc-assess" id="assess-trigger">🔍 Not sure? Take the 30-second check</button>` : ''}</div>` : '';

    // REMOVED 2026-07-28: `journeyRail` was constructed on every protocol render and never
    // interpolated anywhere — it rendered on 0 of 52 pages, and its scroll anchors did not exist
    // either. The .oth-jump button still uses the data-scroll handler, so that stays.

    app.innerHTML = `${crumbs([{ label: 'Home', href: '#/' }, { label: 'Solve', href: '#/solve' }, { label: problem.name }])}
      <div id="clinic-header"></div>
      <div id="shared-progress"></div>
      <section class="proto-head">
        <span class="proto-ico">${problem.icon || ''}</span>
        <div><div class="kicker">${esc(problem.category)} · ${problem.kind === 'want' ? 'goal' : 'problem'}</div>
        <h1>${esc(problem.name)}</h1>
        <p class="rc-name">${esc(rc.name)}</p>
        ${rc.diagnostic ? `<p class="rc-diag">${esc(rc.diagnostic)}</p>` : ''}</div>
      </section>
      <div id="adoption-panel" class="adopt-panel"></div>
      <div id="outcome-stat"></div>
      ${(() => {
        const pw = (rc.pathway_ids || []).map(i => D.pathways[i]).filter(Boolean)[0];
        const pwI = (rc.pathway_ids || [])[0];
        const moveN = (P.strengthen || []).length + (P.stretch || []).length;
        const ntN = Object.keys(rc.nutrient_targets || {}).length;
        return `<div class="proto-summary">
          <div class="ps-cell"><span class="ps-k">🎯 Goal</span><b>${esc(problem.kind === 'want' ? 'Reach: ' + problem.name : 'Fix: ' + problem.name)}</b></div>
          ${pw ? `<div class="ps-cell"><span class="ps-k">Mechanism</span><a href="#/pathway/${pwI}">${esc(pw.shortLabel)} pathway →</a></div>` : ''}
          <div class="ps-cell"><span class="ps-k">This protocol</span><b>${moveN ? moveN + ' move' + (moveN !== 1 ? 's' : '') + ' · ' : ''}${P.stack.length} supplement${P.stack.length !== 1 ? 's' : ''}${ntN ? ' · ' + ntN + ' food target' + (ntN !== 1 ? 's' : '') : ''}</b></div>
        </div>`;
      })()}
      ${safetyFirstSection(problem)}
      ${phase1Section(problem, rc, cohort)}
      ${theOneThingHead(problem)}
      ${causesSection(problem, causeIndexForRc(problem, rc), rc)}
      ${planSection(problem)}
      ${protocolLayers(problem, rc, P)}
      ${stackAuditCallout()}
      <div class="start-plan-row"><button class="cta-primary start-plan" id="start-plan">▶ Start building my plan</button><span class="start-plan-note">This is Phase 2 — the full programme. Do Phase 1 first: it is one free thing for 7 days, and it is the only way to know what actually moved.</span></div>
      ${rcSwitch}
      ${'' /* W4/W3.6 (2026-08-02): the keystone card is SUPPRESSED on the 38 of 52 routes whose
             Phase 1 was SELECTED FROM THIS VERY KEYSTONE. MEASURED HYDRATED at 390x844, default
             DOM, 52/52: this card renders at median y 17,687 px = 94% of a median 18,939 px page,
             and Phase 1 now renders at median y 1,967 px = 10% — so it was printing the same
             authored sentence twice, ~19 phone screens apart, under two different "one thing"
             headings. Where the Phase 1 came from somewhere else (a behaviour fix on 5, the
             movement prescription on 1) the card still earns its place — it is a DIFFERENT habit
             — so it renders, minus the phrase that now belongs to Phase 1. build/prerender.js
             carries the identical condition; if the two drift, the crawler and the reader
             disagree about whether the card exists, which is the D33 defect class. */}
      ${(rc.keystone && !(rc.phase1 && rc.phase1.from === 'keystone')) ? `<div class="keystone-card">
        <div class="ks-badge">⭐ Your one keystone</div>
        <p class="ks-one">${esc(rc.keystone.one)}</p>
        <p class="ks-why">${esc(rc.keystone.why)}</p>
        <p class="ks-note">The highest-impact, lowest-effort habit for this — for after the 7 days, not instead of them.</p>
      </div>` : ''}
      ${'' /* REMOVED 2026-07-28: #community-stacks. It rendered a 232-char empty state on 42 of 52
             protocol pages, and on the other 10 it rendered SEEDED DEMO FORKS attributed to a
             fabricated "verified physiotherapist" — the FTC fake-expert surface. Those forks and
             credentials were deleted in Phase -1, so this now renders an empty state on 52 of 52.
             The feature is still reachable in its own right; it just no longer sits on a protocol
             page pretending a community exists. */}
      <div class="proto-after">
        ${voteFoot(problem.id, rc.id, 'protocol')}
        ${pfaq}
        <div id="goal-comments" class="page-discuss"></div>
        <p class="review-state">Written with AI assistance and edited by a human. <b>Not yet reviewed by a clinician.</b> <a href="/methodology" data-native>How this page was made</a> · <a href="/corrections" data-native>Corrections</a></p>
        <p class="proto-foot muted">Educational protocol, not medical advice. Nutrient targets are general adult guidance with a stated reason. · <button class="linkbtn" id="cite-proto">Cite this protocol</button></p>
      </div>`;
    mountAdoption(problem, rc);
    mountPublicOutcome(problem, rc);
    mountSharedProgress(problem, rc);
    // W4: the 1-tap logger lives inside the Phase 1 section, so the place that tells you to do one
    // free thing for 7 days is the same place you record the 7 days. No account, no server.
    mountPhase1Log(problem, rc);
    // W4: both Phase-1 buttons reveal Phase 2. State is localStorage only — constraint 3
    // (anonymous-first): reading, logging and the $0 protocol must work with no account, and
    // /api/me 503s in the local read-only run mode, so nothing here may depend on a server.
    // The <details> open state for the FIRST paint is computed inside protocolLayers(), before
    // app.innerHTML, so Phase 2 never flashes open; these handlers only handle the click.
    const p1Set = (st) => {
      try {
        const s = JSON.parse(localStorage.getItem(PHASE1_KEY) || '{}');
        s[`${problem.id}/${rc.id}`] = st;
        localStorage.setItem(PHASE1_KEY, JSON.stringify(s));
      } catch (e) { /* private mode: Phase 2 still opens for the session, it just is not remembered */ }
      const d = document.getElementById('phase-2'); if (d) d.open = true;
    };
    const p1StartBtn = document.getElementById('phase1-start');
    if (p1StartBtn) p1StartBtn.onclick = () => {
      // W4 · Loop C: joining a LIVE cohort adopts its start date, which is what aligns "Day N of 7"
      // across everyone in it. cohortParse() has already refused anything that would put the reader
      // past day 7 on arrival, so this can never begin a week that is already finished.
      const started = (cohort && !cohort.error && cohort.live) ? cohort.start : isoDay();
      p1Set({ started });
      // W4: the EXPLICIT start. Nothing is logged until this tap — starting is not doing, so day 1
      // opens empty and the reader still has to say whether they did it.
      trackStart(problem, rc, started, (cohort && !cohort.error) ? cohort.slug : null);
      phase1LogDraw(problem, rc, null);
      p1StartBtn.textContent = (cohort && !cohort.error && cohort.live && started !== isoDay())
        ? `✓ Joined — the cohort's log is open below`
        : '✓ Day 1 — the 7-day log is open below';
      p1StartBtn.disabled = true;
    };
    const p1SkipBtn = document.getElementById('phase1-skip');
    if (p1SkipBtn) p1SkipBtn.onclick = () => {
      p1Set({ skipped: true });
      const d = document.getElementById('phase-2'); if (d) d.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const startBtn = document.getElementById('start-plan');
    if (startBtn) startBtn.onclick = () => {
      const pl = getPlan() || newPlan();
      // If they already run this protocol, open it for editing; otherwise start a fresh draft with all selected.
      const existing = planProtocols(pl).find(x => x.pid === problem.id && x.rcid === rc.id);
      pl.draft = existing
        ? { pid: problem.id, rcid: rc.id, moves: existing.moves, supps: existing.supps, functions: existing.functions, extra: {}, step: 0 }
        : { pid: problem.id, rcid: rc.id, moves: [...(P.strengthen || []), ...(P.stretch || [])].map(e => e.id), supps: (P.stack || []).map(c => c.id), functions: undefined, extra: {}, step: 0 };
      // adoption is tracked by the build action (idempotent per voterKey), not a separate "experiment" button
      api.startExperiment(problem.id, rc.id).catch(() => {});
      setPlan(pl); navigate('/plan');
    };
    const assessBtn = document.getElementById('assess-trigger');
    if (assessBtn) assessBtn.onclick = () => openAssessment(problem);
    initCauseMotion();
    const citeBtn = document.getElementById('cite-proto');
    if (citeBtn) citeBtn.onclick = () => citeModal(`${problem.name} — ${rc.name.split('(')[0].trim()} protocol`, (location.origin || 'https://rnawiki.com') + '/protocol/' + problem.id + '/' + rc.id);
    mountVotes([`${problem.id}:${rc.id}:protocol`]);
    app.querySelectorAll('[data-share-sec]').forEach(b => b.onclick = () => shareSection(b.dataset.shareSec, problem, rc));
    renderComments(`p:${problem.id}:${rc.id}`, problem.name);
    app.querySelectorAll('[data-add]').forEach(b => b.onclick = () => {
      toggleStack(b.dataset.add);
      const on = inStack(b.dataset.add);
      b.classList.toggle('in', on); b.textContent = on ? '✓ In stack' : '+ Add to stack';
    });
    // Easier/Harder: swap the card in place to the linked variation exercise.
    // Re-bind after every swap — the replacement card carries fresh buttons that
    // would otherwise have no handler (this was the "Easier does nothing" bug).
    const bindScale = () => app.querySelectorAll('[data-scale]').forEach(b => b.onclick = () => {
      const EX = window.RNAWIKI_EXERCISES; if (!EX) return;
      const target = EX.exercises.find(e => e.id === b.dataset.scale); if (!target) return;
      const card = b.closest('.ex-card');
      if (card) { card.insertAdjacentHTML('beforebegin', exerciseCard(target)); card.remove(); bindScale(); }
    });
    bindScale();
    try { glossarize(app); } catch (e) {}
  }
  function rxLine(e) {
    const rx = e.prescription || {};
    if (e.kind === 'stretch') return `${rx.sets || 2} × ${rx.hold || '30s'} hold · rest ${rx.rest || '20s'}`;
    return `${rx.sets || 3} sets × ${rx.reps || '8–12'} reps${rx.tempo ? ' · tempo ' + rx.tempo : ''} · rest ${rx.rest || '90s'}`;
  }
  function exerciseCard(e) {
    if (!e) return '';
    const muscles = (e.primaryMuscles || []).slice(0, 2).join(', ');
    // link the exercise to the anatomy pages of the muscles it trains
    const muscleLinks = (e.primaryMuscles || []).filter(mn => muscleByName[mn]).slice(0, 3)
      .map(mn => { const m = muscleByName[mn]; return `<a class="ex-muscle" href="#/muscle/${m.id}">${esc(m.name)} →</a>`; }).join('');
    const rx = e.prescription || {};
    // Easier/Harder only appear when a real variation exists (a patient-facing swap). Adding
    // missing variations is a Pro action, moved to /pro — not shown here.
    const easier = e.kind !== 'stretch' && e.regression_id ? `<button class="ex-sc easier" data-scale="${esc(e.regression_id)}">← Easier</button>` : '';
    const harder = e.kind !== 'stretch' && e.progression_id ? `<button class="ex-sc harder" data-scale="${esc(e.progression_id)}">Harder →</button>` : '';
    const scale = (easier || harder) ? `<div class="ex-scale">${easier}${harder}</div>` : '';
    return `<div class="ex-card" data-exid="${esc(e.id)}">
      ${e.image ? `<img loading="lazy" src="${e.image}" alt="${esc(e.name)}" onerror="this.onerror=null;this.style.display='none'">` : '<div class="ex-noimg">🏋️</div>'}
      <div class="ex-body"><a class="ex-name" href="#/exercise/${esc(e.id)}">${esc(e.name)}</a>
      <div class="ex-rx">${rxLine(e)}${rx.cue ? ` · <i>${esc(rx.cue)}</i>` : ''}</div>
      ${muscleLinks ? `<div class="ex-muscles"><span class="ex-mk">${e.kind === 'stretch' ? 'Stretches' : 'Works'}:</span> ${muscleLinks}</div>` : ''}
      ${scale}
      ${(e.instructions || []).length ? `<details><summary>How to do it${muscles ? ' · ' + esc(muscles) : ''}</summary><ol>${e.instructions.slice(0, 5).map(i => `<li>${esc(i)}</li>`).join('')}</ol></details>` : ''}</div>
    </div>`;
  }
  // Card snippet. `.slice(0, 150)` cut the text dead at 150 characters with no ellipsis: measured
  // on the 178 stack cards the 52 protocol pages now render, 106 ended mid-sentence and several
  // mid-WORD — "…especially glycinate at night — reliabl", "…recover fas" — so the card read as if
  // the sentence had finished there. (Same defect class as D8's mid-word meta descriptions, which
  // truncate cleanly in the prerendered document and not in the hydrated one.) Cut at the last word
  // boundary and say it was cut. Strip → slice → escape, in that order, so the cut can never land
  // inside an HTML entity.
  const cardSnip = (s, n) => {
    const t = mdStrip(s || '');
    if (t.length <= n) return esc(t);
    const cut = t.slice(0, n), i = cut.lastIndexOf(' ');
    return esc((i > n * 0.6 ? cut.slice(0, i) : cut).replace(/[\s,;:—–-]+$/, '')) + '…';
  };
  function stackCard(c) {
    return `<div class="st-card${needsDoctor(c) ? ' rx' : ''}">
      <a class="st-main" href="#/c/${slug(c.name)}"><b>${esc(c.name)}</b>
      ${starHTML(c.stars, { compact: true })}</a>
      <div class="st-meta">${approvalPills(c)}${c._synergy ? '<span class="pill syn" aria-label="Shares a pathway with another item in this stack" title="Shares a pathway with another item in this stack">⚡ Synergy</span>' : ''}</div>
      <p class="st-plain">${cardSnip(c.plain || c.bottom || c.mechanism, 150)}</p>
      <button class="st-add ${inStack(c.id) ? 'in' : ''}" data-add="${c.id}">${inStack(c.id) ? '✓ In stack' : '+ Add to stack'}</button>
    </div>`;
  }

  // ---- Mini-window (modal) detail — used inside the builder & tracker so learning never navigates away ----
  function exModalHtml(e) {
    const muscles = (e.primaryMuscles || []).join(', ');
    const rx = e.prescription || {};
    return `<div class="item-modal">
      <button class="modal-x" data-close aria-label="Close">×</button>
      <div class="im-kind">${e.kind === 'stretch' ? '🧘 Stretch' : '💪 Movement'}</div>
      <h2>${esc(e.name)}</h2>
      <div class="im-rx">${rxLine(e)}${rx.cue ? ` · <i>${esc(rx.cue)}</i>` : ''}</div>
      ${muscles ? `<p class="im-line"><b>${e.kind === 'stretch' ? 'Stretches' : 'Works'}:</b> ${esc(muscles)}</p>` : ''}
      ${(e.instructions || []).length ? `<div class="im-how"><b>How to do it</b><ol>${e.instructions.slice(0, 6).map(i => `<li>${esc(i)}</li>`).join('')}</ol></div>` : ''}
      <a class="im-full" href="#/exercise/${esc(e.id)}" data-closenav>Open full page →</a>
    </div>`;
  }
  function cpdModalHtml(c) {
    const cal = (k, v, cls) => v ? `<div class="im-cal ${cls || ''}"><b>${k}</b> <span>${mdInline(v)}</span></div>` : '';
    return `<div class="item-modal">
      <button class="modal-x" data-close aria-label="Close">×</button>
      <div class="im-kind">💊 Supplement</div>
      <h2>${esc(c.name)} ${starHTML(c.stars, { compact: true })}</h2>
      <div class="im-meta">${approvalPills(c)}</div>
      ${cal('In plain English', c.plain)}
      ${cal('How it works', c.mechanism)}
      ${cal('Protocol', c.protocol)}
      ${cal('Watch out', c.watch, 'warn')}
      <a class="im-full" href="#/c/${slug(c.name)}" data-closenav>Open full page →</a>
    </div>`;
  }
  function openItemModal(html) {
    const m = modal(html);
    m.querySelectorAll('[data-close]').forEach(b => b.onclick = () => closeModal());
    m.querySelectorAll('[data-closenav]').forEach(a => a.onclick = () => closeModal()); // let the hash link navigate, just tidy up
    return m;
  }
  // Intercept clicks on a card's internal links within a builder/tracker list so they open the mini-window
  // instead of leaving the page. byExId/byCId are the current protocol's items (that's all the list can show).
  function wireItemModals(scopeSel, byExId, byCId) {
    const host = app.querySelector(scopeSel); if (!host) return;
    host.addEventListener('click', ev => {
      const a = ev.target.closest('a[href^="#/"]'); if (!a || !host.contains(a)) return;
      const href = a.getAttribute('href');
      const card = a.closest('.build-item, .plan-item, .trk-row');
      const cb = card && card.querySelector('.build-cb, .plan-cb');
      if (href.startsWith('#/exercise/')) { const e = byExId[href.split('/')[2]]; if (e) { ev.preventDefault(); openItemModal(exModalHtml(e)); } }
      else if (href.startsWith('#/c/')) { const sl = href.split('/')[2]; const c = Object.values(byCId).find(x => slug(x.name) === sl); if (c) { ev.preventDefault(); openItemModal(cpdModalHtml(c)); } }
      else if (href.startsWith('#/muscle/')) { const id = cb && cb.dataset.move; const e = id && byExId[id]; if (e) { ev.preventDefault(); openItemModal(exModalHtml(e)); } }
    });
  }

  // ---------- Fuel Tracker (localStorage, per-day log) ----------
  const FUEL_KEY = 'rnawiki_fuel_log';
  // LOCAL date, not UTC (fixed 2026-07-28). today() used toISOString(), which is UTC — and
  // Singapore is UTC+8, so between midnight and 08:00 local time the app believed it was still
  // YESTERDAY. A user ticking their keystone at 07:55 on Monday had it recorded against Sunday;
  // the morning's "8 of 8 done" became "0 of 12" in the afternoon and the day then read as a miss.
  // Every date key in the tracker has to agree, so the six sibling call sites that built their own
  // UTC key were converted with it.
  const localISO = (d) => {
    const x = d || new Date();
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  };
  function today() { return localISO(); }
  function getFuelLog() {
    try { const l = JSON.parse(localStorage.getItem(FUEL_KEY)); if (l && l.date === today()) return l; } catch (e) {}
    return { date: today(), items: [] };
  }
  function setFuelLog(l) { l.date = today(); localStorage.setItem(FUEL_KEY, JSON.stringify(l)); }
  function foodById(id) { const FO = window.RNAWIKI_FOODS; const f = (FO && FO.foods.find(x => x.id === id)) || (window.__userFoods && window.__userFoods[id]); return f && f.id && window.__foodOverrides && window.__foodOverrides[f.id] ? Object.assign({}, f, window.__foodOverrides[f.id]) : f; }
  // crowd-submitted, dietitian-verified foods (loaded on demand, merged into the tracker search)
  window.__userFoods = window.__userFoods || {};
  window.__foodOverrides = window.__foodOverrides || {};   // baseFoodId -> corrected fields (approved edits)
  async function loadUserFoods() {
    if (window.__userFoodsLoaded) return;
    window.__userFoodsLoaded = true;
    window.__userFoods = {}; window.__foodOverrides = {};
    let list = []; try { list = await api.userFoods(); } catch (e) { return; }
    list.forEach(f => {
      const data = f.data || {};
      // an approved correction to an existing food overrides that food rather than adding a duplicate
      if (data.corrects) {
        const o = Object.assign({}, data); delete o.corrects;
        // No `verified: true` here (removed 2026-07-30). This is the submitter's own edit, held for
        // review — flagging it verified client-side asserted a check that nobody performs.
        window.__foodOverrides[data.corrects] = Object.assign(o, { serving: f.serving || undefined, corrected: true });
        return;
      }
      const id = 'u' + f.id;
      const fo = Object.assign({ id, name: f.name, serving: f.serving || '', sg_local: true, tags: [], hay: (f.name || '').toLowerCase() }, data);
      if (data.photo || data.photo_file_id || data.photo_data) fo.photo = '/api/foodphoto?id=' + f.id; // served via proxy (bot token / inline data stays server-side)
      window.__userFoods[id] = fo;
    });
  }
  // apply an approved correction (if any) over a base food's values
  function withOverride(f) { if (!f) return f; const o = window.__foodOverrides && window.__foodOverrides[f.id]; return o ? Object.assign({}, f, o) : f; }
  // Nutrient metadata — the SAME 17-field model as the bot & foods.json. Label + unit for rendering.
  const NUT_META = {
    kcal: ['Calories', 'kcal'], protein_g: ['Protein', 'g'], carbs_g: ['Carbs', 'g'], sugar_g: ['Sugar', 'g'], fat_g: ['Fat', 'g'], fiber_g: ['Fiber', 'g'],
    sodium_mg: ['Sodium', 'mg'], potassium_mg: ['Potassium', 'mg'], calcium_mg: ['Calcium', 'mg'], magnesium_mg: ['Magnesium', 'mg'], iron_mg: ['Iron', 'mg'], zinc_mg: ['Zinc', 'mg'],
    vitamin_c_mg: ['Vitamin C', 'mg'], vitamin_d_iu: ['Vitamin D', 'IU'], omega3_mg: ['Omega-3', 'mg'], choline_mg: ['Choline', 'mg'], glycine_g: ['Glycine', 'g'],
  };
  const MACRO_KEYS = ['kcal', 'protein_g', 'carbs_g', 'sugar_g', 'fat_g', 'fiber_g'];
  const MICRO_KEYS = ['sodium_mg', 'potassium_mg', 'calcium_mg', 'magnesium_mg', 'iron_mg', 'zinc_mg', 'vitamin_c_mg', 'vitamin_d_iu', 'omega3_mg', 'choline_mg', 'glycine_g'];
  function openAddFoodModal(onDone, prefill) {
    if (!ME) return openAuth('login');
    const pf = prefill || {};
    const editing = !!prefill;
    const va = x => (x === 0 || x) ? ` value="${esc(String(x))}"` : '';   // pre-fill helper
    const inp = k => `<input id="uf-${k}" type="number" placeholder="${NUT_META[k][0].toLowerCase()} ${NUT_META[k][1]}"${va(pf[k])}>`;
    // The nutrients THIS protocol actually tracks (so we ask for the crucial ones, not all 17)
    const tgt = FUEL_TARGETS || {};
    const trackedMicros = MICRO_KEYS.filter(k => tgt[k]);
    const otherMicros = MICRO_KEYS.filter(k => !tgt[k]);
    const trackedHtml = trackedMicros.length ? `<div class="uf-tracked"><div class="uf-tracked-h">⭐ Your plan tracks these — add them so your fuel counts them</div>
      ${trackedMicros.map(k => `<label class="uf-tk"><span class="uf-tk-l">${NUT_META[k][0]} <small>${esc(tgt[k].why || '')}</small></span>${inp(k)}</label>`).join('')}</div>` : '';
    const otherLabel = trackedMicros.length ? 'Other vitamins & minerals' : 'Vitamins & minerals';
    const otherHtml = otherMicros.length ? `<details class="uf-micros"${editing && otherMicros.some(k => pf[k] != null) ? ' open' : ''}><summary>＋ ${otherLabel} (optional)</summary>
        <p class="muted" style="font-size:.8rem;margin:.4rem 0">Per serving — fill in any you know.</p>
        <div class="uf-grid uf-micro-grid">${otherMicros.map(inp).join('')}</div></details>` : '';
    const m = modal(`<div class="partner-modal"><h2>${editing ? 'Fix this food’s nutrition' : 'Add a food'}</h2>
      <p class="muted">${editing ? 'Correct any wrong numbers below. Your correction is held for review before it replaces the published values.' : 'Add a missing dish — only the name is required, everything else is optional. It goes live instantly for everyone.'} Leave a field blank if you don’t know it. +20 reputation.</p>
      <label>Food name</label><input id="uf-name" placeholder="Chicken rice (roasted)"${va(pf.name)}>
      <label>Serving</label><input id="uf-serv" placeholder="1 plate (~300g)"${va(pf.serving)}>
      <label>Macros (per serving)</label>
      <div class="uf-grid">${MACRO_KEYS.map(inp).join('')}</div>
      ${trackedHtml}
      ${otherHtml}
      <label>Photo (optional)</label>
      <input id="uf-photo" type="file" accept="image/*">
      <div id="uf-photo-prev">${pf.photo ? `<img src="${esc(pf.photo)}" alt="" style="max-height:80px;border-radius:8px;margin-top:.5rem">` : ''}</div>
      <button class="cta-primary" id="uf-save" style="border:none;cursor:pointer;width:100%;margin-top:1rem">${editing ? 'Submit correction' : 'Add food'}</button></div>`);
    const v = id => (document.getElementById(id) || {}).value || '';
    let photoData = null;
    const pin = m.querySelector('#uf-photo'), pprev = m.querySelector('#uf-photo-prev');
    if (pin) pin.onchange = () => { const f = pin.files && pin.files[0]; if (!f) return; resizeImage(f, 256, url => { photoData = url; if (pprev) pprev.innerHTML = `<img src="${url}" alt="" style="max-height:80px;border-radius:8px;margin-top:.5rem">`; }); };
    m.querySelector('#uf-save').onclick = async () => {
      try {
        const payload = { name: v('uf-name'), serving: v('uf-serv'), photo_data: photoData || undefined, corrects: pf.id || '' };
        [...MACRO_KEYS, ...MICRO_KEYS].forEach(k => { payload[k] = v('uf-' + k); });
        await api.submitFood(payload);
        closeModal();
        alert(editing ? 'Thanks! Your correction is queued for a dietitian to verify.' : 'Added — it’s live now and searchable for everyone. 🙏');
        window.__userFoodsLoaded = false; // refresh the local cache so the new food appears immediately
        if (onDone) onDone();
      } catch (e) { alert(e.message); }
    };
  }
  // Resize an image file to a small JPEG data URL (keeps the stored photo tiny)
  function resizeImage(file, max, cb) {
    const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      try { cb(c.toDataURL('image/jpeg', 0.8)); } catch (e) { cb(null); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); cb(null); };
    img.src = url;
  }
  // Edit an existing food already in the database — opens the modal pre-filled with its current
  // values; the submission carries `corrects` so an approved change overrides that food.
  function openEditFood(id, onDone) {
    if (!ME) return openAuth('login');
    const f = foodById(id); if (!f) return;
    openAddFoodModal(onDone, f);
  }
  function resolveItem(it) { return it.food || foodById(it.id); }   // scanned foods carry it.food inline

  // ---------- Proof-of-Progress: shareable log link + "Target crushed" card ----------
  function encodeLog(items) { try { const c = (items || []).filter(it => it.id).map(it => [it.id, it.n]).slice(0, 25); return c.length ? btoa(unescape(encodeURIComponent(JSON.stringify(c)))) : ''; } catch (e) { return ''; } }
  function decodeLog(str) { try { return JSON.parse(decodeURIComponent(escape(atob(str)))).map(x => ({ id: x[0], n: x[1] })); } catch (e) { return null; } }
  async function shareProgress(problem, rc) {
    const enc = encodeLog(getFuelLog().items);
    const handle = ME ? ME.username : '';
    const url = (location.origin || 'https://rnawiki.com') + '/protocol/' + problem.id + '/' + rc.id + (handle ? '?by=' + encodeURIComponent(handle) : '?s=1') + (enc ? '&log=' + encodeURIComponent(enc) : '');
    const text = `My ${problem.name} protocol on RNAwiki — my exact stack & Singapore food log.`;
    try { if (navigator.share) await navigator.share({ title: 'RNAwiki', text, url }); else { await navigator.clipboard.writeText(url); alert('Progress link copied — paste it in WhatsApp / Telegram.'); } } catch (e) {}
    if (ME) api.rep('share');
  }
  function loadHtml2canvas() { return window.html2canvas ? Promise.resolve() : loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'); }
  const CELEB_KEY = 'rnawiki_celebrated';
  function wasCelebrated(k) { try { return (JSON.parse(localStorage.getItem(CELEB_KEY)) || {})[k] === today(); } catch (e) { return false; } }
  function markCelebrated(k) { let m = {}; try { m = JSON.parse(localStorage.getItem(CELEB_KEY)) || {}; } catch (e) {} m[k] = today(); localStorage.setItem(CELEB_KEY, JSON.stringify(m)); }
  function progressCard(problem, rc, hitLabel) {
    const P = generateProtocol(rc);
    const foods = getFuelLog().items.map(resolveItem).filter(Boolean).slice(0, 5);
    const stack = (P.stack || []).slice(0, 3);
    const handle = ME ? '@' + ME.username : 'me';
    return `<div id="pcard" class="pcard">
      <div class="pcard-top"><span class="pcard-brand">🧬 RNAwiki</span><span class="pcard-loc">Singapore</span></div>
      <div class="pcard-hit">${hitLabel ? 'I crushed my ' + esc(hitLabel) + ' target 🎯' : 'My protocol today 🎯'}</div>
      <div class="pcard-prob">${esc(problem.name)}<small>${esc(rc.name.split('(')[0].trim())}</small></div>
      <div class="pcard-sec"><b>STACK</b><div>${stack.map(c => `<span>${esc(c.name)}</span>`).join('') || '<span>—</span>'}</div></div>
      <div class="pcard-sec"><b>FUEL</b><div>${foods.map(f => `<span>${esc(f.name)}</span>`).join('') || '<span>—</span>'}</div></div>
      <div class="pcard-foot">${esc(handle)} · Stop guessing. Start solving.</div>
    </div>`;
  }
  function openProgressCard(problem, rc, hitLabel) {
    const m = modal(`<div class="celebrate">
      <h2>🎯 ${hitLabel ? esc(hitLabel) + ' target crushed!' : 'Nice progress!'}</h2>
      <p class="muted">Share it — premium look, one tap, no cheese.</p>
      <div class="pcard-wrap">${progressCard(problem, rc, hitLabel)}</div>
      <div class="celebrate-btns">
        <button class="cta-primary" id="pc-img" style="border:none;cursor:pointer">📸 Share as image</button>
        <button class="cta-ghost" id="pc-link">🔗 Copy progress link</button>
      </div>
      <p class="bm-note">Sharing earns +10 reputation.</p>
    </div>`);
    m.querySelector('#pc-img').onclick = async () => {
      const el = document.getElementById('pcard'); if (!el) return;
      try { await loadHtml2canvas(); } catch (e) { alert('Could not load the image renderer.'); return; }
      try {
        const canvas = await window.html2canvas(el, { scale: 2, backgroundColor: null, useCORS: true });
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], 'rnawiki-progress.png', { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: 'RNAwiki', text: `My ${problem.name} protocol` }); } catch (e) {} }
          else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'rnawiki-progress.png'; a.click(); }
          if (ME) api.rep('share');
        }, 'image/png');
      } catch (e) { alert('Could not generate the card.'); }
    };
    m.querySelector('#pc-link').onclick = () => shareProgress(problem, rc);
  }
  // "Wrapped" — a clean, share-worthy card of the user's saved stack (Spotify-Wrapped style).
  function wrappedCardHtml() {
    const cpds = getStack().map(id => byId[id]).filter(Boolean);
    const gc = {}; cpds.forEach(c => (c.goalIds || []).forEach(g => gc[g] = (gc[g] || 0) + 1));
    const topGoals = Object.keys(gc).sort((a, b) => gc[b] - gc[a]).slice(0, 4).map(g => (goalById[g] || {}).label).filter(Boolean);
    const avg = cpds.length ? (cpds.reduce((a, c) => a + c.stars, 0) / cpds.length).toFixed(1) : '0';
    return `<div id="wrapped" class="wrapped-card">
      <div class="wr-top"><span class="wr-brand">🧬 RNAwiki</span><span class="wr-loc">Singapore</span></div>
      <div class="wr-title">My stack</div>
      <div class="wr-chips">${cpds.length ? cpds.slice(0, 8).map(c => `<span>${esc(c.name)}</span>`).join('') : '<span>Add compounds to your stack first…</span>'}</div>
      <div class="wr-stats"><div><b>${cpds.length}</b><span>compounds</span></div><div><b>${avg}★</b><span>avg evidence</span></div><div><b>${topGoals.length}</b><span>goals</span></div></div>
      ${topGoals.length ? `<div class="wr-goals">Built for: ${topGoals.map(esc).join(' · ')}</div>` : ''}
      <div class="wr-foot">rnawiki.com · name a problem, get the protocol</div></div>`;
  }
  function openWrapped() {
    const m = modal(`<div class="celebrate"><h2>📊 Your stack, wrapped</h2>
      <p class="muted">A clean card of your stack — share it and look optimised.</p>
      <div class="pcard-wrap">${wrappedCardHtml()}</div>
      <div class="celebrate-btns"><button class="cta-primary" id="wr-img" style="border:none;cursor:pointer">📸 Share as image</button></div></div>`);
    m.querySelector('#wr-img').onclick = async () => {
      const el = document.getElementById('wrapped'); if (!el) return;
      try { await loadHtml2canvas(); } catch (e) { alert('Could not load the image renderer.'); return; }
      try {
        const canvas = await window.html2canvas(el, { scale: 2, backgroundColor: null, useCORS: true });
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], 'rnawiki-stack.png', { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: 'RNAwiki', text: 'My supplement stack' }); } catch (e) {} }
          else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'rnawiki-stack.png'; a.click(); }
          if (ME) api.rep('share');
        });
      } catch (e) { alert('Could not generate the card.'); }
    };
  }
  // Shared-progress banner: someone opened this protocol via a friend's ?by=&log= link.
  function mountSharedProgress(problem, rc) {
    const el = document.getElementById('shared-progress'); if (!el) return;
    const qp = new URLSearchParams((currentRoute().split('?')[1] || ''));
    const logStr = qp.get('log'); const by = qp.get('by');
    if (!logStr && !qp.get('s')) return;
    const items = logStr ? decodeLog(logStr) : [];
    const foods = (items || []).map(it => foodById(it.id)).filter(Boolean);
    el.innerHTML = `<div class="shared-prog">
      <div class="sp-l"><b>📤 ${by ? '@' + esc(by) : 'Someone'} shared their ${esc(problem.name)} progress</b>
        <span>${foods.length ? 'Their food log: ' + foods.slice(0, 4).map(f => esc(f.name)).join(', ') + (foods.length > 4 ? '…' : '') + '. ' : ''}This is the exact protocol they followed — start yours below.</span></div>
      <a class="cta-primary" href="#/protocol/${problem.id}/${rc.id}">Start my own →</a></div>`;
  }

  let _fuelRerender = null;
  // Called by the scanner: add a food object (from barcode/AI) to today's log.
  function addScannedFood(food) {
    const log = getFuelLog(); log.items.push({ food, n: 1 }); setFuelLog(log);
    if (_fuelRerender) _fuelRerender();
  }
  // Food detail sheet — confirm the right item/portion/brand (with image if we have one), pick servings, then add.
  function openFoodDetail(food, onAdd) {
    let qty = 1;
    const gi = food.gi;
    const giLine = gi != null ? `<div class="fd-gi gi-${giBand(gi)}">GI ${gi} · ${giBand(gi) === 'high' ? 'High — raises blood sugar fast' : giBand(gi) === 'med' ? 'Medium impact' : 'Low — gentle on blood sugar'}</div>` : '';
    const img = food.image ? `<img class="fd-img" src="${esc(food.image)}" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : '';
    const sub = foodSub(food.name);
    const subHtml = sub ? `<div class="fd-sub"><div class="fd-sub-h">🥗 Healthier swap</div><div class="fd-sub-body"><b>${esc(sub.sub)}</b><p>${esc(sub.why)}</p></div></div>` : '';
    const NUTRI = [['kcal', 'Calories', ''], ['carbs_g', 'Carbs', 'g'], ['protein_g', 'Protein', 'g'], ['fat_g', 'Fat', 'g'], ['sugar_g', 'Sugar', 'g'], ['fiber_g', 'Fiber', 'g']];
    const m = modal(`<button class="modal-x" data-close aria-label="Close">✕</button>
      ${img}
      <h2 class="fd-name">${esc(food.name)}</h2>
      <p class="fd-serv">${esc(food.serving || '1 serving')}${food.sg_local ? ' · <span class="sg">SG</span>' : ''}</p>
      ${giLine}
      ${subHtml}
      <div class="fd-nutri" id="fd-nutri"></div>
      <div class="fd-qtyrow"><span>Servings</span><div class="fd-qty"><button class="fd-qbtn" data-q="-1" aria-label="Fewer">−</button><span class="fd-qn" id="fd-q">1</span><button class="fd-qbtn" data-q="1" aria-label="More">＋</button></div></div>
      <button class="cta-primary fd-add" id="fd-add">＋ Add ${food.serving ? esc(food.serving.replace(/^1\s+/, '')) : 'to today'}</button>
      <p class="fd-confirm">Double-check it’s the right item, brand &amp; portion before adding.</p>`);
    const paint = () => {
      document.getElementById('fd-q').textContent = qty;
      const cells = NUTRI.filter(([k]) => food[k] != null).map(([k, l, u]) => `<div class="fd-n"><span class="fd-nv">${Math.round(food[k] * qty * 10) / 10}${u}</span><span class="fd-nl">${l}</span></div>`).join('');
      document.getElementById('fd-nutri').innerHTML = cells || '<span class="muted" style="font-size:.85rem">No nutrition data yet — tap edit in the search to add it.</span>';
    };
    paint();
    m.querySelector('[data-close]').onclick = closeModal;
    m.querySelectorAll('[data-q]').forEach(b => b.onclick = () => { qty = Math.max(1, Math.min(20, qty + (+b.dataset.q))); paint(); });
    m.querySelector('#fd-add').onclick = () => { closeModal(); onAdd(qty); };
  }
  // Which stacked supplement (by name) plainly supplies a tracked nutrient — so the fuel bar can note
  // "also in your stack" without inventing amounts (doses are free-text; we never sum them).
  const NUTRIENT_IN_SUPP = {
    magnesium_mg: /magnesium/i, calcium_mg: /calcium/i, potassium_mg: /potassium/i, sodium_mg: /electrolyte/i,
    zinc_mg: /\bzinc\b/i, iron_mg: /\biron\b|ferrous|ferric/i, omega3_mg: /omega[- ]?3|fish oil|\bepa\b|\bdha\b|krill|cod liver/i,
    vitamin_c_mg: /vitamin c\b|ascorb/i, vitamin_d_iu: /vitamin d\b|cholecalciferol|\bd3\b/i,
    choline_mg: /choline|alpha-?gpc|cdp-?choline|citicoline/i, glycine_g: /glycine|collagen/i, fiber_g: /psyllium|inulin|glucomannan|\bfib(er|re)\b/i,
  };
  function mountFuelTracker(problem, rc, targetsOverride, stackList) {
    const root = document.getElementById('fuel-tracker'); if (!root) return;
    const FO = window.RNAWIKI_FOODS;
    const targets = targetsOverride || (rc && rc.nutrient_targets) || {};
    FUEL_TARGETS = targets; // so "add a food" can highlight exactly what THIS protocol tracks
    const stack = Array.isArray(stackList) ? stackList : [];
    // exclude combo/summary entries (·, /, ",", "(brief)") and non-source lookalikes (calcium-d-glucarate isn't dietary calcium)
    const suppFor = k => (NUTRIENT_IN_SUPP[k] ? stack.filter(c => c && c.name && !/[·/,]|\(brief\)|glucarate/i.test(c.name) && NUTRIENT_IN_SUPP[k].test(c.name)).map(c => c.name) : []);
    function totals() {
      const log = getFuelLog(); const sum = {}, missing = {};
      Object.keys(targets).forEach(k => { sum[k] = 0; missing[k] = 0; });
      log.items.forEach(it => {
        const f = resolveItem(it); if (!f) return;
        Object.keys(targets).forEach(k => {
          if (f[k] == null) missing[k] += it.n; else sum[k] += f[k] * it.n;
        });
      });
      return { log, sum, missing };
    }
    function render(celebrate) {
      const { log, sum, missing } = totals();
      const hitGoals = Object.keys(targets).filter(k => targets[k].type !== 'limit' && sum[k] >= targets[k].target);
      const bars = Object.keys(targets).map(k => {
        const t = targets[k]; const val = Math.round(sum[k]); const pct = Math.min(100, Math.round(val / t.target * 100));
        const isLimit = t.type === 'limit';
        const done = isLimit ? val <= t.target : val >= t.target;
        const over = isLimit && val > t.target;
        const cls = over ? 'over' : done ? 'done' : (isLimit ? 'limit' : '');
        return `<div class="fbar ${cls}">
          <div class="fbar-top"><span>${NUTRIENT_LABEL[k] || k}${isLimit ? ' <em>(limit)</em>' : ''}</span>
            <span class="fbar-val">${val} / ${t.target} ${t.unit}${done && !isLimit ? ' ✓' : ''}${over ? ' ⚠' : ''}</span></div>
          <div class="fbar-track"><i style="width:${pct}%"></i></div>
          <div class="fbar-why">${esc(t.why || '')}${missing[k] ? ` · <span class="miss">${missing[k]} logged food${missing[k] > 1 ? 's' : ''} missing ${NUTRIENT_LABEL[k] || k} data</span>` : ''}</div>
          ${(() => { const s = suppFor(k); return s.length && !isLimit ? `<div class="fbar-supp">🔵 also in your stack: ${s.map(esc).join(', ')} — food target is on top of what your supplement covers</div>` : ''; })()}
        </div>`;
      }).join('');
      const logHtml = log.items.length ? log.items.map((it, i) => {
        const f = resolveItem(it); if (!f) return '';
        return `<li><span>${esc(f.name)}${f.sg_local ? ' <span class="sg">SG</span>' : ''}${giBadge(f.gi)} <small>${esc(f.serving || '')}</small></span>
          <span class="qty"><button data-dec="${i}">−</button>${it.n}<button data-inc="${i}">+</button><button class="rm" data-rm="${i}">✕</button></span></li>`;
      }).join('') : '<li class="empty-log">No food logged yet today.</li>';
      // daily glycemic load — Σ (GI × carbs × servings / 100) over logged foods that have a published GI
      let gl = 0, glFoods = 0; log.items.forEach(it => { const f = resolveItem(it); if (f && f.gi != null && f.carbs_g != null) { gl += f.gi * f.carbs_g * it.n / 100; glFoods++; } });
      gl = Math.round(gl); const glBand = gl >= 120 ? 'high' : gl >= 80 ? 'med' : 'low'; const glWord = glBand === 'high' ? 'High' : glBand === 'med' ? 'Moderate' : 'Low';
      const glHtml = glFoods ? `<div class="gl-summary gi-${glBand}"><div class="gl-top"><span>🩸 Glycemic load today</span><b>${gl} · ${glWord}</b></div><div class="gl-why">How much your day spikes blood sugar (carbs × how fast they hit). Lower is steadier energy — key for fat loss, insulin resistance &amp; diabetes. <span class="muted">Low &lt;80 · Moderate 80–120 · High &gt;120.</span></div></div>` : '';
      // General macros — separate from the protocol targets; the same food log feeds both.
      let mKcal = 0, mP = 0, mC = 0, mF = 0, mAny = false;
      log.items.forEach(it => { const f = resolveItem(it); if (!f) return; if (f.kcal != null) { mKcal += f.kcal * it.n; mAny = true; } if (f.protein_g != null) { mP += f.protein_g * it.n; mAny = true; } if (f.carbs_g != null) { mC += f.carbs_g * it.n; mAny = true; } if (f.fat_g != null) { mF += f.fat_g * it.n; mAny = true; } });
      const macroCals = mP * 4 + mC * 4 + mF * 9;
      const mpct = g => macroCals ? Math.round(g / macroCals * 100) : 0;
      const macroHtml = mAny ? `<div class="macro-card">
        <div class="macro-h">🔢 Today's macros <span class="muted">— all foods you logged (separate from protocol targets)</span></div>
        <div class="macro-stats">
          <div class="macro-s"><span class="macro-n">${Math.round(mKcal)}</span><span class="macro-l">calories</span></div>
          <div class="macro-s macro-p"><span class="macro-n">${Math.round(mP)}g</span><span class="macro-l">Protein</span></div>
          <div class="macro-s macro-c"><span class="macro-n">${Math.round(mC)}g</span><span class="macro-l">Carbs</span></div>
          <div class="macro-s macro-f"><span class="macro-n">${Math.round(mF)}g</span><span class="macro-l">Fat</span></div>
        </div>
        ${macroCals ? `<div class="macro-split" title="Share of calories from protein / carbs / fat"><i class="ms-p" style="width:${mpct(mP * 4)}%"></i><i class="ms-c" style="width:${mpct(mC * 4)}%"></i><i class="ms-f" style="width:${mpct(mF * 9)}%"></i></div><div class="macro-leg"><span class="macro-p">● ${mpct(mP * 4)}% protein</span><span class="macro-c">● ${mpct(mC * 4)}% carbs</span><span class="macro-f">● ${mpct(mF * 9)}% fat</span></div>` : ''}</div>` : '';
      const interestBtn = ''; // removed: unshipped "AI logging" teaser (no clear function yet)
      const controls = ME ? `
        <div class="fuel-search">
          <input id="food-q" type="search" placeholder="Log a food… e.g. chicken rice, salmon, kiwi" autocomplete="off">
          <div id="food-hits" class="food-hits" hidden></div>
        </div>
        <div class="scan-row">
          <button class="scan-btn" id="scan-barcode" type="button">🔖 Scan barcode</button>
          <button class="scan-btn" id="add-food" type="button">＋ Add or fix a food</button>
        </div>
        ${interestBtn}
        <p class="fuel-contribute">💡 Anyone can help: spotted a missing dish or a wrong nutrition number? <button class="linkbtn" id="add-food-2">Add or fix it →</button> It goes into a queue and is approved before everyone can log it. You earn +20 points.</p>
        <ul class="fuel-log">${logHtml}</ul>`
        : `<div class="fuel-signin"><b>🔒 Sign in to log your meals.</b> Logging is for members — track what you eat against this protocol's biological targets. It's free and takes ten seconds.
             <button class="btn-primary" id="fuel-signin-btn">Sign in / create account</button></div>`;
      root.innerHTML = `${controls}
        ${glHtml}
        <div class="fuel-bars">${bars || '<p class="muted">No targets for this protocol.</p>'}</div>
        ${macroHtml}
        <div id="ai-interest-note" class="ai-interest" hidden></div>
        ${ME && log.items.length ? `<div class="fuel-foot">
          <button id="fuel-share" class="fuel-share-btn">📸 Share ${hitGoals.length ? `— ${hitGoals.length} target${hitGoals.length > 1 ? 's' : ''} hit today 🎯` : 'my day'}</button>
          <button id="fuel-reset" class="fuel-clear-btn" title="Remove everything you logged today and start over">Clear today's log</button>
        </div>` : ''}`;
      wire();
      if (celebrate) {
        const fresh = hitGoals.find(k => !wasCelebrated(problem.id + ':' + rc.id + ':' + k));
        if (fresh) { markCelebrated(problem.id + ':' + rc.id + ':' + fresh); setTimeout(() => openProgressCard(problem, rc, NUTRIENT_LABEL[fresh] || fresh), 300); }
      }
    }
    function wire() {
      const q = document.getElementById('food-q'); const hits = document.getElementById('food-hits');
      if (q) {
        q.oninput = () => {
          const v = q.value.toLowerCase().trim();
          if (!v) { hits.hidden = true; return; }
          const pool = FO.foods.map(withOverride).concat(Object.values(window.__userFoods || {}));
          const matched = pool.filter(f => f.hay.includes(v)).sort((a, b) => (b.sg_local - a.sg_local)).slice(0, 8);
          const reloadFoods = () => { window.__userFoodsLoaded = false; loadUserFoods().then(() => render()); };
          hits.innerHTML = matched.map(f => `<div class="food-hit"><button data-food="${f.id}">${f.photo ? `<img class="food-thumb" src="${esc(f.photo)}" alt="" loading="lazy">` : ''}<b>${esc(f.name)}</b>${f.sg_local ? ' <span class="sg">SG</span>' : ''}${giBadge(f.gi)} <small>${esc(f.serving || '')}</small></button><button class="food-edit" data-edit="${f.id}" title="Fix this food’s nutrition">✎</button></div>`).join('') || `<span class="no-hit">No match — <button class="linkbtn" id="add-food-inline">add it →</button></span>`;
          const afi = document.getElementById('add-food-inline'); if (afi) afi.onclick = () => openAddFoodModal(reloadFoods);
          hits.querySelectorAll('[data-edit]').forEach(b => b.onmousedown = e => { e.preventDefault(); openEditFood(b.dataset.edit, reloadFoods); });
          hits.hidden = false;
        };
        q.onblur = () => setTimeout(() => { if (hits) hits.hidden = true; }, 200);
      }
      // Delegated: the food-hit buttons are created dynamically on keystroke, so bind on the container (not the buttons that don't exist yet).
      if (hits) hits.onclick = (e) => {
        const b = e.target.closest('button[data-food]'); if (!b) return;
        const id = b.dataset.food;
        const pool = FO.foods.map(withOverride).concat(Object.values(window.__userFoods || {}));
        const food = pool.find(f => f.id === id) || foodById(id); if (!food) return;
        if (q) { q.value = ''; } hits.hidden = true;
        openFoodDetail(food, (qty) => {   // confirm the item/portion, then log
          const log = getFuelLog(); const ex = log.items.find(i => i.id === id); if (ex) ex.n += qty; else log.items.push({ id, n: qty });
          setFuelLog(log); render(true); // render(true) → celebrate a freshly-hit target
          if (ME) api.rep('food_log'); // +5/day for logging (server dedupes per day)
        });
      };
      const shareBtn = document.getElementById('fuel-share'); if (shareBtn) shareBtn.onclick = () => openProgressCard(problem, rc, null);
      root.querySelectorAll('[data-inc]').forEach(b => b.onclick = () => { const log = getFuelLog(); log.items[+b.dataset.inc].n++; setFuelLog(log); render(true); });
      root.querySelectorAll('[data-dec]').forEach(b => b.onclick = () => { const log = getFuelLog(); const it = log.items[+b.dataset.dec]; it.n--; if (it.n <= 0) log.items.splice(+b.dataset.dec, 1); setFuelLog(log); render(); });
      root.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { const log = getFuelLog(); log.items.splice(+b.dataset.rm, 1); setFuelLog(log); render(); });
      const rs = document.getElementById('fuel-reset'); if (rs) rs.onclick = () => { if (!confirm("Clear everything you logged today? This can't be undone.")) return; setFuelLog({ date: today(), items: [] }); render(); };
      const sb = document.getElementById('scan-barcode'); if (sb) sb.onclick = () => openBarcodeScanner();
      const reload = () => { window.__userFoodsLoaded = false; loadUserFoods().then(() => render()); };
      const af = document.getElementById('add-food'); if (af) af.onclick = () => openAddFoodModal(reload);
      const af2 = document.getElementById('add-food-2'); if (af2) af2.onclick = () => openAddFoodModal(reload);
      const si = document.getElementById('fuel-signin-btn'); if (si) si.onclick = () => openAuth('login');
      const ib = document.getElementById('scan-interest'); if (ib) ib.onclick = () => registerAiInterest();
    }
    _fuelRerender = render;
    render();
    loadUserFoods().then(() => { if (document.getElementById('fuel-tracker')) render(); });
  }

  // ---------- Food logging: barcode + AI-interest ----------
  // Barcode = free & scales to any volume (on-device detection + OpenFoodFacts,
  // no server/AI cost). AI photo-logging is not shipped yet — users signal demand.
  async function registerAiInterest() {
    if (!ME) return openAuth('register');
    const note = document.getElementById('ai-interest-note');
    const b = document.getElementById('scan-interest');
    try {
      const r = await api.vote({ targetId: 'feature:ai-food-scan', voterKey: VOTER_KEY, value: 1 });
      const n = (r && r.score && r.score.up) || 1;
      if (note) { note.hidden = false; note.innerHTML = `✓ Noted, thank you. <b>${n}</b> ${n === 1 ? 'person wants' : 'people want'} snap-a-photo food logging — I build it when enough of you do.`; }
    } catch (e) { if (note) { note.hidden = false; note.textContent = '✓ Thanks — your interest is noted.'; } }
    if (b) { b.disabled = true; b.textContent = '✓ Interest registered'; }
  }
  function offToFood(p) {
    const n = p.nutriments || {}; const num = x => (x === 0 || x) && isFinite(x) ? +x : null; const g2mg = x => { const v = num(x); return v == null ? null : Math.round(v * 1000); };
    const name = (p.product_name || 'Scanned product').trim();
    return {
      name: p.brands ? `${name} (${p.brands.split(',')[0].trim()})` : name, serving: '100 g', scanned: true, sg_local: false, tags: [],
      brand: p.brands ? p.brands.split(',')[0].trim() : '', image: p.image_front_small_url || p.image_front_url || p.image_url || null,
      kcal: num(n['energy-kcal_100g']), protein_g: num(n.proteins_100g), carbs_g: num(n.carbohydrates_100g), sugar_g: num(n.sugars_100g),
      fat_g: num(n.fat_100g), fiber_g: num(n.fiber_100g), sodium_mg: g2mg(n.sodium_100g), vitamin_c_mg: g2mg(n['vitamin-c_100g']),
      calcium_mg: g2mg(n.calcium_100g), iron_mg: g2mg(n.iron_100g), potassium_mg: g2mg(n.potassium_100g),
    };
  }
  async function openBarcodeScanner() {
    const supported = ('BarcodeDetector' in window);
    const m = modal(`<button class="modal-x" id="bc-x">✕</button><h2>Scan a barcode</h2>
      ${supported ? `<video id="bc-video" playsinline muted style="width:100%;border-radius:12px;background:#000;max-height:48vh"></video><p class="muted sm" id="bc-status">Point your camera at a product barcode…</p>` : `<p class="muted sm">Live scanning isn’t supported in this browser (common on iPhone). Enter the barcode number instead:</p>`}
      <label class="fld">Barcode number<input id="bc-manual" inputmode="numeric" placeholder="e.g. 8888196012345"></label>
      <p class="muted sm">Free — looks up OpenFoodFacts, no account or AI needed.</p>
      <div class="modal-actions"><button class="ghost" id="bc-cancel">Cancel</button><button class="primary" id="bc-lookup">Look up</button></div>`);
    let stream = null, timer = null;
    function stop() { if (timer) clearInterval(timer); if (stream) stream.getTracks().forEach(t => t.stop()); closeModal(); }
    m.querySelector('#bc-x').onclick = stop; m.querySelector('#bc-cancel').onclick = stop;
    m.querySelector('#bc-lookup').onclick = () => { const v = m.querySelector('#bc-manual').value.trim(); if (v) lookup(v); };
    async function lookup(code) {
      const st = m.querySelector('#bc-status'); if (st) st.textContent = 'Looking up ' + code + '…';
      try {
        const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,brands,nutriments,serving_size`);
        const j = await r.json();
        if (j.status !== 1 || !j.product || !j.product.product_name) { if (st) st.textContent = 'Not found in OpenFoodFacts. Try the photo scanner.'; return; }
        stop(); addScannedFood(offToFood(j.product));
      } catch (e) { if (st) st.textContent = 'Lookup failed. Check your connection.'; }
    }
    if (supported) {
      try {
        const det = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'] });
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        const v = m.querySelector('#bc-video'); if (!v) { stream.getTracks().forEach(t => t.stop()); return; }
        v.srcObject = stream; await v.play();
        timer = setInterval(async () => { try { const codes = await det.detect(v); if (codes && codes.length) { const c = codes[0].rawValue; clearInterval(timer); lookup(c); } } catch (e) {} }, 500);
      } catch (e) { const st = m.querySelector('#bc-status'); if (st) st.textContent = 'Camera unavailable — enter the barcode below.'; }
    }
  }
  // ---------- Tier 1: frictionless voting ----------
  // W3.5 (2026-08-02) — THE DORMANT EXPERT-REVIEW BADGE. This span read "⚠ Expert review needed"
  // and shipped in the DOM of all 52 /protocol routes (measured hydrated at 390x844: 52 of 52
  // render exactly one .vote-badge; revealed it is 150x20 at rgb(194,65,12)). It was `hidden`
  // only until four readers voted and fewer than half said the page helped — a data condition,
  // not a decision, so nobody had to approve the claim for it to appear.
  //
  // The claim is that an expert review exists and is pending. It does not. There is no verified
  // expert on this project, no review queue that consumes this signal (grep: the only consumers of
  // /api/votes are this function and the fork like-count), and no person the badge could be
  // addressed to. It was the last surviving piece of the expert-marketplace wording that
  // /methodology already tells readers was removed — a badge that dressed up "some readers said
  // no" as "a professional is looking at this".
  //
  // The replacement states only what was measured — the vote tally that triggered it — and
  // promises nothing. Same trigger, same element, no credential.
  function voteFoot(pid, rcid, layer) {
    return `<div class="vote-foot" data-target="${pid}:${rcid}:${layer}"><span class="vote-q">Did this help you?</span>
      <span class="vote-btns"><button class="vt up" data-v="1">👍 <span class="c">·</span></button>
      <button class="vt down" data-v="-1">👎 <span class="c">·</span></button></span>
      <span class="vote-badge" hidden>⚠ More readers said this did not help than said it did</span></div>`;
  }
  async function mountVotes(targets) {
    const scores = await api.votes(targets);
    targets.forEach(t => {
      const el = app.querySelector(`.vote-foot[data-target="${t}"]`); if (!el) return;
      paintVote(el, t, scores[t] || { up: 0, down: 0 });
      el.querySelectorAll('.vt').forEach(b => b.onclick = async () => {
        const v = +b.dataset.v; const cur = myVote(t); const next = cur === v ? 0 : v;
        setMyVote(t, next);
        try { const r = await api.vote({ targetId: t, voterKey: VOTER_KEY, value: next }); paintVote(el, t, r.score); }
        catch (e) { /* DB off — still reflect my local vote */ paintVote(el, t, { up: 0, down: 0 }); }
      });
    });
  }
  function paintVote(el, t, score) {
    const mine = myVote(t);
    const up = el.querySelector('.up'), down = el.querySelector('.down');
    up.querySelector('.c').textContent = score.up || 0; down.querySelector('.c').textContent = score.down || 0;
    up.classList.toggle('on', mine === 1); down.classList.toggle('on', mine === -1);
    const total = (score.up || 0) + (score.down || 0);
    const badge = el.querySelector('.vote-badge');
    badge.hidden = !(total >= 4 && (score.up || 0) / total < 0.5);
  }

  // ---------- Micro-bounty Board (global stewardship hub) ----------
  const BOUNTY_DOMAIN = { scaling: 'physio', 'food-verify': 'dietitian', safety: 'pharmacist' };
  const BOUNTY_VERB = { scaling: 'Add an easier + harder variation', 'food-verify': 'Verify the macros & micros', safety: 'Add safety / interaction notes' };

  // Edit affordance for content pages (exercises, muscles). Rewritten 2026-07-30: this used to run
  // through expertGate(), which told the reader the page was "kept accurate by verified physio
  // experts" and every change "peer-reviewed before it goes live", then offered to let them apply
  // to become one. None of that existed — no verified expert, no peer review, no application to
  // approve it. The button is on every exercise page, so that was the most-served fake-credential
  // surface on the site. It now does what it always actually did: file the suggestion in the
  // feedback queue, open to anyone, described honestly.
  function openEditContent(what, refLabel, domain) {
    {
      const m = modal(`<div class="partner-modal"><h2>✎ Suggest an edit</h2>
        <p class="muted">Editing <b>${esc(refLabel)}</b>. Your suggestion goes to the maintainer, who checks it against the source before anything changes. Describe the correction or addition, and cite a source if you have one — a link to the paper is the most useful thing you can send.</p>
        <textarea id="ec-body" rows="5" maxlength="2000" placeholder="e.g. The primary mover is really the gluteus medius; the cue should be…"></textarea>
        <button class="cta-primary" id="ec-save" style="border:none;cursor:pointer;width:100%;margin-top:.8rem">Submit for review</button></div>`);
      m.querySelector('#ec-save').onclick = async () => {
        const body = (document.getElementById('ec-body') || {}).value || '';
        if (!body.trim()) return alert('Describe the edit first.');
        try { await api.submitFeedback({ body: `[EDIT · ${what}: ${refLabel}] ${body}`, kind: 'wrong', page: location.pathname + location.hash }); closeModal(); alert('Thank you — that has gone to the maintainer.'); }
        catch (e) { alert(e.message); }
      };
    }
  }
  // ---------- Per-exercise / per-stretch page (animated demo + muscles worked) ----------
  async function mountExercise(id) {
    try { await ensureProtocolData(); } catch (e) {}
    const EX = window.RNAWIKI_EXERCISES;
    const e = EX && EX.exercises.find(x => x.id === id);
    if (!e) { app.innerHTML = notFound(); return; }
    const img0 = e.image || '';
    const img1 = img0.replace(/\/0\.jpg$/i, '/1.jpg');
    const hasAnim = img1 && img1 !== img0;
    const ytUrl = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(e.name + ' exercise proper form');
    const demo = (img0
      ? `<div class="ex-demo${hasAnim ? ' anim' : ''}">
           <img class="exd exd-0" src="${img0}" alt="${esc(e.name)} — start position" loading="lazy" onerror="this.style.display='none';this.closest('.ex-demo').classList.add('noimg')">
           ${hasAnim ? `<img class="exd exd-1" src="${img1}" alt="${esc(e.name)} — end position" loading="lazy" onerror="this.remove();this.closest('.ex-demo').classList.remove('anim')">` : ''}
           ${hasAnim ? '<span class="ex-demo-cap">▶ the movement (start ⇄ end)</span>' : ''}
         </div>`
      : '<div class="ex-demo noimg">🏋️</div>')
      + `<a class="ex-yt" href="${ytUrl}" target="_blank" rel="noopener">▶ Watch a form tutorial on YouTube</a>`;
    const mLink = mn => muscleByName[mn] ? `<a class="tag-chip" href="#/muscle/${muscleByName[mn].id}">${esc(muscleByName[mn].name)}</a>` : `<span class="tag-chip static">${esc(mn)}</span>`;
    const prim = (e.primaryMuscles || []).map(mLink).join('');
    const sec = (e.secondaryMuscles || []).map(mLink).join('');
    const scale = [];
    if (e.regression_id) scale.push(`<a class="tag-chip" href="#/exercise/${esc(e.regression_id)}">← Easier variation</a>`);
    if (e.progression_id) scale.push(`<a class="tag-chip" href="#/exercise/${esc(e.progression_id)}">Harder variation →</a>`);
    const kindLabel = e.kind === 'stretch' ? 'Stretch / mobility' : 'Strengthening';
    app.innerHTML = `<div class="article">${crumbs([{ label: 'Home', href: '#/' }, { label: 'Learn', href: '#/learn' }, { label: e.name }])}
      <div class="anat-head"><span class="anat-region">${esc(kindLabel)}${e.level ? ' · ' + esc(e.level) : ''}</span>
        <div class="lyr-head"><h1>${esc(e.name)}</h1><button class="sec-edit" id="ex-edit" title="Suggest an edit">✎ Edit</button></div></div>
      ${demo}
      <div class="ex-rx-line">${rxLine(e)}${e.equipment ? ' · ' + esc(e.equipment) : ''}${e.mechanic ? ' · ' + esc(e.mechanic) : ''}${e.force ? ' · ' + esc(e.force) : ''}</div>
      ${scale.length ? `<div class="tag-row">${scale.join('')}</div>` : ''}
      <div class="section-title">Muscles worked</div>
      <p class="muted" style="font-size:.9rem">Tap a muscle for its anatomy, how it contracts, and the energy systems that fuel it.</p>
      ${prim ? `<div class="ex-mgroup"><span class="ex-mk">Primary</span><div class="tag-row">${prim}</div></div>` : ''}
      ${sec ? `<div class="ex-mgroup"><span class="ex-mk">Secondary</span><div class="tag-row">${sec}</div></div>` : ''}
      ${(e.instructions || []).length ? `<div class="section-title">How to do it</div><ol class="anat-steps">${e.instructions.map(i => `<li>${esc(i)}</li>`).join('')}</ol>` : ''}
      ${solveCta('Find a protocol that uses this →')}
      <div id="goal-comments" class="page-discuss"></div></div>`;
    const eb = document.getElementById('ex-edit'); if (eb) eb.onclick = () => openEditContent('exercise', e.name, 'physio');
    renderComments('ex:' + e.id, e.name);
    try { glossarize(app); } catch (e2) {}
  }

  // ---------- Cite this (APA) — frictionless backlink for students/bloggers ----------
  function citeModal(title, url, author) {
    const cite = `${author || 'RNAwiki'}. (${new Date().getFullYear()}). ${title}. RNAwiki. ${url}`;
    const m = modal(`<div class="cite-modal"><h2>Cite this</h2>
      <p class="muted">APA-style — for students, bloggers, and forum posts.</p>
      <textarea id="cite-text" rows="3" readonly>${esc(cite)}</textarea>
      <button class="cta-primary" id="cite-copy" style="border:none;cursor:pointer;width:100%;margin-top:.7rem">Copy citation</button></div>`);
    m.querySelector('#cite-copy').onclick = () => { const t = document.getElementById('cite-text'); try { t.select(); } catch (e) {} if (navigator.clipboard) navigator.clipboard.writeText(t.value); m.querySelector('#cite-copy').textContent = 'Copied ✓'; };
  }


  // ---------- Local partners (DB-approved, backlink-verified) + submit ----------
  const PARTNER_TYPE_ICON = { physio: '🧑‍⚕️', gym: '🏋️', supplement: '💊', clinic: '🏥', dietitian: '🥗' };
  async function mountFoodQueue() {
    const el = document.getElementById('food-queue'); if (!el) return;
    let foods = []; try { foods = await api.pendingFoods(); } catch (e) { el.remove(); return; }
    if (!foods.length) { el.innerHTML = '<div class="section-title">Foods to verify</div><p class="muted">Nothing pending — nice.</p>'; return; }
    el.innerHTML = `<div class="section-title">Foods to verify (${foods.length})</div>
      <p class="muted" style="font-size:.82rem">Check the macros look sane, then approve so everyone can log it.</p>
      ${foods.map(f => { const d = f.data || {}; return `<div class="pro-row"><div><b>${esc(f.name)}</b> <small class="muted">${esc(f.serving || '')} · ${d.kcal != null ? d.kcal + ' kcal · ' : ''}${d.protein_g != null ? d.protein_g + 'g protein' : ''}${f.by ? ' · by @' + esc(f.by) : ''}</small></div><span class="pro-row-acts"><button class="admin-btn" data-food-ok="${f.id}">Approve</button> <button class="admin-btn" data-food-no="${f.id}">Reject</button></span></div>`; }).join('')}`;
    el.querySelectorAll('[data-food-ok]').forEach(b => b.onclick = async () => { try { await api.verifyFood(b.dataset.foodOk, 'active'); mountFoodQueue(); } catch (e) { alert(e.message); } });
    el.querySelectorAll('[data-food-no]').forEach(b => b.onclick = async () => { try { await api.verifyFood(b.dataset.foodNo, 'rejected'); mountFoodQueue(); } catch (e) { alert(e.message); } });
  }

  // Scroll-driven: --t (0→1) morphs the SVG scene; the caption text crossfades pain→fix a beat later.
  function initGpScroll(id) {
    const sec = document.getElementById(id); if (!sec) return;
    const cp = sec.querySelector('.gpx-cap-pain'), cf = sec.querySelector('.gpx-cap-fix'), cue = sec.querySelector('.gpx-cue');
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { sec.style.setProperty('--t', 1); if (cp) cp.style.opacity = 0; if (cf) cf.style.opacity = 1; return; }
    const onScroll = () => {
      if (!document.body.contains(sec)) { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); return; }
      const rect = sec.getBoundingClientRect(); const total = sec.offsetHeight - window.innerHeight;
      const progress = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0;
      const t = Math.min(1, Math.max(0, (progress - 0.1) / 0.8));     // scene morph — spans almost the whole pin; per-element --d delays stage the build within it
      sec.style.setProperty('--t', t.toFixed(3));
      const tc = Math.min(1, Math.max(0, (progress - 0.34) / 0.42));  // text swap — dissolves in step with the visual build, not before it
      if (cp) cp.style.opacity = 1 - tc;
      if (cf) cf.style.opacity = tc;
      if (cue) cue.style.opacity = progress > 0.82 ? 0 : (1 - tc) * 0.85;
    };
    window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll); onScroll();
  }
  // Different mechanism: a journey line that fills as you scroll, lighting each waypoint in sequence.
  function initGpJourney(id) {
    const sec = document.getElementById(id); if (!sec) return;
    const fill = sec.querySelector('.gpj-fill'), track = sec.querySelector('.gpj-line');
    const steps = [...sec.querySelectorAll('.gpj-step')]; if (!steps.length) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { steps.forEach(s => s.classList.add('on')); if (fill) fill.style.height = '100%'; return; }
    const onScroll = () => {
      if (!document.body.contains(sec)) { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); return; }
      const line = window.innerHeight * 0.58;   // activation line, 58% down the viewport
      const tr = track.getBoundingClientRect();
      if (fill) fill.style.height = Math.min(tr.height, Math.max(0, line - tr.top)) + 'px';
      steps.forEach(s => { const n = s.querySelector('.gpj-node').getBoundingClientRect(); s.classList.toggle('on', (n.top + n.height / 2) < line); });
    };
    window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll); onScroll();
  }

  // ---------- /pros — the marketing landing page for professionals (separate from the dashboard) ----------
  // renderPros() removed 2026-07-30 — unreachable, see the /pros note in route().

  // ---------- router (path-based + crawlable, legacy #/ still works) ----------
  function currentRoute() {
    // Real path wins (crawlable, prerendered). Fall back to legacy hash links.
    let p = (location.pathname || '/').replace(/\.html$/, '');
    if (p && p !== '/') return p + (location.search || '');
    const h = location.hash || '';
    return (h.startsWith('#/') ? h.slice(1) : '/');
  }
  function navigate(path) {
    if (path.startsWith('#/')) path = path.slice(1);
    if (path === location.pathname + location.search) { route(); return; }
    history.pushState({}, '', path);
    route();
  }
  // W5b (2026-08-02): THE HEAD IS GENERATED ONCE, BY THE PRERENDERER, AND READ HERE.
  // This function used to derive its own titles from the corpus, in parallel with build/prerender.js
  // deriving them from the same corpus. Two generators, one string. Measured over all 620 served
  // routes in headless Chrome at 1280x900 with a 900 ms settle, 0 pageerrors, 0 non-200:
  //   · 135 routes finished hydration with document.title === the site default and 151 with the
  //     homepage description, on pages whose prerendered <title> was correct on 620 of 620 — pure
  //     hydration loss. Every /problem (41), every /muscle (17), every /fuel (52), /az, /legend,
  //     /about, /browse, /anatomy, /stack, /plan, /compare, /methodology, /corrections.
  //   · document.title === the prerendered title on 127/620; description on 69/620.
  //   · document.title !== og:title IN THE SAME DOCUMENT on 493/620. /target/AR carried three
  //     different strings at once: <title> "AR — the molecular target and every compound that hits
  //     it", og:title "AR: the compounds that hit it", and description "AR: AR androgen receptor",
  //     a hard .slice(0,120) that stopped mid-sentence against an og:description that did not.
  // window.RNAWIKI_HEAD (site/head.js) is written by build/prerender.js by parsing the <title> and
  // <meta name=description> back out of the bytes it just wrote for each route, so what is set here
  // is definitionally what the crawler was served. assertHeadParity() fails the build if the map
  // loses a route, if app.js stops reading it, or if head.js stops loading before app.js.
  // og:* and twitter:* are set from the same two strings, because otherwise they keep the LANDING
  // page's values through every SPA navigation — which is the second half of the defect above.
  // (A /protocol/…?by= share link is the one case where server.js deliberately writes a different
  // og:title at send time; that rewrite is for scrapers, which never hydrate, so it is unaffected.)
  const HEAD = (typeof window !== 'undefined' && window.RNAWIKI_HEAD) || {};
  function setPageMeta(parts) {
    const site = SITE_NAME;
    let title = 'RNAwiki — translate the code of human performance into real results';
    let desc = 'DNA is the blueprint; RNA is the builder. Turn the foundational code of strength, health and longevity into protocols you can use today — ranked by human evidence, in plain English.';
    const t = (s) => `${s} · ${site}`;
    const generated = HEAD['/' + parts.join('/')];
    if (generated && generated[0]) { title = generated[0]; desc = generated[1] || desc; }
    else
    // W5a: `|| c.metaSummary` — the 13 "(brief)" bundles have no plain/bottom/mechanism, so this
    // line produced `content=""` on exactly those 13 hydrated and on 0 of the other 158. An empty
    // description is not a shorter description; it is a page with nothing to say about itself in
    // a search result or a share card. build/parse.js derives the fallback from the page's own
    // members and category so both renderers print the identical string.
    if (parts[0] === 'c' && bySlug[parts[1]]) { const c = bySlug[parts[1]]; title = t(`${c.name}: dosage, evidence & uses`); desc = (c.plain || c.bottom || c.mechanism || c.metaSummary || '').slice(0, 300); }
    else if (parts[0] === 'goal' && goalById[parts[1]]) { const g = goalById[parts[1]]; title = t(`${g.label} — what actually helps`); desc = `Compounds that help you ${g.label.toLowerCase()}, ranked by strength of human evidence. Plain English, honest verdicts.`; }
    // D2 (2026-08-01) — the tab title said "<problem> protocol — Move, Fuel & Stack" on every root
    // cause of a problem. Two defects in one string: it named three sections the hydrated page had
    // deleted (0/52), and it did not name the root cause, so the 3 knee-pain URLs, the 2
    // low-testosterone URLs and so on shared one tab title — 41 distinct titles across 52 routes,
    // and 0/52 matched the prerendered <title>. Now it names the root cause, in the prerendered
    // document's own form (`<problem>: <root cause>`), so a bookmark, a share and a tab all say
    // which cause the page is about. It is NOT run through prerender.js:seoTitle's 60-char cap:
    // that cap truncates 27 of these mid-phrase, 10 of them onto a dangling "/" or "+"
    // ("Lower Back Pain: weak posterior chain / · RNAwiki"). Copying a truncation to score a parity
    // metric would put a broken string in the reader's tab. The prerender-side truncation is D8.
    else if (parts[0] === 'protocol' && problemById[parts[1]]) { const p = problemById[parts[1]]; const rc = p.root_causes.find(r => r.id === parts[2]) || p.root_causes[0]; title = t(parts[3] === 'stewardship' ? `${p.name} — expert stewardship` : `${p.name}: ${rc.name.replace(/\s*\([^)]*\)/, '').toLowerCase()}`); desc = `${p.name} (${rc.name}): the exercises to fix it, foods to fuel it, and evidence-ranked compounds — a full protocol. Not medical advice.`; }
    else if (parts[0] === 'target' && targetBySym[tkey(decodeURIComponent(parts[1] || ''))]) { const tg = targetBySym[tkey(decodeURIComponent(parts[1]))]; title = t(`${tg.sym} — the molecular target and every compound that hits it`); desc = `${tg.sym}: ${(tg.name || '').slice(0, 120)}`; }
    else if (parts[0] === 'pathway' && D.pathways[+parts[1]]) { title = t(`${D.pathways[+parts[1]].shortLabel} pathway explained`); }
    else if (parts[0] === 'compare' && parts[1]) { const i = parts[1].indexOf('-vs-'); const A = i >= 0 && bySlug[parts[1].slice(0, i)], B = i >= 0 && bySlug[parts[1].slice(i + 4)]; if (A && B) { title = t(`${A.name} vs ${B.name} — which works better?`); desc = `${A.name} vs ${B.name}: human evidence, mechanism, safety and availability compared. Plain English, honest verdict.`; } }
    else if (parts[0] === 'solve') { title = t('Solve a problem or reach a goal — protocol engine'); desc = 'Tell me the problem or goal. Get a full Move · Fuel · Stack protocol for the root cause.'; }
    else if (parts[0] === 'stewardship') { title = t('Expert micro-bounties — the bounty board'); desc = 'Solve a 2-minute clinical micro-bounty in your domain — add an exercise variation, verify a local dish, or add a safety note. Permanent attribution.'; }
    else if (parts[0] === 'pros') { title = t('For health professionals — contribute, get featured, get leads'); desc = 'Physiotherapists, dietitians, nutritionists and pharmacists: improve the protocols in your field and get featured on them — profile, booking link and local leads. Free.'; }
    else if (parts[0] === 'pro') { title = t('Pro dashboard — contribute & get featured on RNAwiki'); desc = 'For clinicians and businesses: improve protocols, track your leads, and manage your branded patient protocol links on RNAwiki.'; }
    else if (parts[0] === 'u' && parts[1]) { title = t('@' + parts[1] + ' — contribution portfolio'); desc = `@${parts[1]}'s clinical contribution portfolio on RNAwiki — reputation, accepted edits, and professional links.`; }
    else if (parts[0] === 'body') { title = t('Interactive 3D body — see the muscles and how they move'); desc = 'Rotate a 3D anatomical model and tap any muscle to see the bones it attaches to — origin and insertion — and watch it perform its action, on the body.'; }
    else if (parts[0] === 'where') { title = t('Where does it hurt? Find the likely cause and the fix'); desc = 'Point to where it hurts — knee, lower back, neck, hip, shoulder, ankle, elbow — and get the likely cause, the protocol, and a 3-question cause-finder. Free.'; }
    else if (parts[0] === 'clinic' && problemById[parts[2]]) { const p = problemById[parts[2]]; title = t(`${p.name} — home-care protocol from @${parts[1]}`); desc = `A clinician-issued ${p.name} home-care protocol from @${parts[1]} on RNAwiki — movement, stack, and Singapore food targets.`; }
    document.title = title;
    let m = document.querySelector('meta[name="description"]'); if (!m) { m = document.createElement('meta'); m.setAttribute('name', 'description'); document.head.appendChild(m); }
    m.setAttribute('content', desc);
    // W5b: keep the share tags on the same two strings. Before this they held whatever the LANDING
    // route's prerendered head said and never moved again, so after one SPA navigation a document
    // carried a title for one page and an og:title for another (493/620 measured at boot alone).
    [['meta[property="og:title"]', title], ['meta[property="og:description"]', desc],
      ['meta[name="twitter:title"]', title], ['meta[name="twitter:description"]', desc]]
      .forEach(([sel, val]) => { const el = document.querySelector(sel); if (el) el.setAttribute('content', val); });
    let l = document.querySelector('link[rel="canonical"]'); if (!l) { l = document.createElement('link'); l.setAttribute('rel', 'canonical'); document.head.appendChild(l); }
    l.setAttribute('href', location.origin + '/' + parts.join('/'));
  }
  // ---- W5b (2026-08-02): THE DEEP LINKS GOOGLE PUBLISHES MUST LAND ---------------------------
  // THE DEFECT, measured hydrated at 390x844 over all 620 served routes, 0 pageerrors
  // (qa/out/w5b_anchors_before.json): of 8,080 in-page anchor targets published in the prerendered
  // document — the ones Google turns into "jump to section" links in a result — 7,339 (90.8%)
  // resolved to nothing once the SPA rebuilt #app, on 574 of 620 pages. 13,475 anchor ELEMENTS
  // point at them. /c/caffeine publishes 36 and 36 were dead: #in-plain-english, #how-it-works,
  // #molecular-target-official-sources … Navigating Chrome to /c/creatine-monohydrate#how-it-works
  // left window.scrollY at 0 with document.getElementById('how-it-works') === null.
  // (These are TRUE in-page anchors. "#/target/ATP" is SPA hash-ROUTER navigation and is excluded
  // here — counting those as dead anchors is W0 erratum E1 and it produced a false finding once.)
  //
  // THE DECISION, of the two W0 offered — "stabilise the ids across both renderers, or stop
  // publishing the anchors". STABILISE. Withdrawing them would delete a working feature from the
  // ~90% of readers who never run JavaScript to spare the 10% a broken one, and Google has already
  // indexed these fragments; they would go on being clicked and go on landing nowhere.
  //
  // THE MECHANISM. build/prerender.js anchorHeadings() slugifies each <h2>/<h3>'s own TEXT. The SPA
  // renders the same headings with hand-written ids (sec-mechanism, …) or none at all. Nothing was
  // wrong in either file on its own; they simply never agreed on a name. So the SPA now derives the
  // id the same way, from the same text, using the rule copied verbatim below — including the
  // "-2"/"-3" duplicate numbering, because the prerenderer numbers repeats in document order.
  // It NEVER overwrites an existing id (SPA CSS and query selectors depend on those) and never
  // takes an id already in the document: it attaches an invisible alias anchor instead.
  const headSlug = (text) => String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  // The heading rule cannot reach the compound page's six main sections, because the SPA does not
  // title them with a heading at all — it renders `<div class="callout" id="sec-plain"><span
  // class="k">In plain English — start here</span>…`, so the label is a <span> and its text is not
  // the prerendered heading's text ("In plain English"). The sections ARE there; they answer to a
  // different name. Each pair below is the SAME AUTHORED FIELD in both renderers — that is the
  // whole admission criterion, and it is why this table cannot point a reader at the wrong place:
  //   c.plain     build/prerender.js "<h2>In plain English</h2>"  ·  app.js callout('plain', …)
  //   c.mechanism                    "<h2>How it works</h2>"                 callout('mechanism', …)
  //   c.protocol                     "<h2>Protocol</h2>"                     callout('protocol', …)
  //   c.watch                        "<h2>Watch out</h2>"                    callout('watch', …)
  //   c.bottom                       "<h2>Bottom line</h2>"                  callout('bottom', …)
  //   c.evidence                     "<h2>The human evidence</h2>"           <details id="sec-evidence">
  // assertAnchorAliases() in build/prerender.js fails the build if the prerenderer stops emitting
  // any of these ids, so a heading rename there cannot silently orphan the table.
  // DELIBERATELY NOT INCLUDED: #molecular-target-official-sources -> #sec-molecule. The prerendered
  // section is c.target's prose and official links; #sec-molecule is the PubChem structure viewer.
  // They are near each other and they are not the same section, and an anchor that lands a reader
  // on the wrong one is worse than an anchor that does not move them.
  const ANCHOR_ALIASES = {
    'in-plain-english': 'sec-plain', 'how-it-works': 'sec-mechanism', 'protocol': 'sec-protocol',
    'watch-out': 'sec-watch', 'bottom-line': 'sec-bottom', 'the-human-evidence': 'sec-evidence',
  };
  function anchorizeHeadings(root) {
    if (!root) return 0;
    const seen = new Map(); let added = 0;
    // The prerenderer only slugifies <h2>/<h3>, because that is all its flat article emits. The SPA
    // titles its sections with three other things, measured on /c/caffeine hydrated at 390x844:
    // h2:1 h3:6 h4:12 and 6 `div.section-title` ("🔗 Stacks with", "🧬 Acts on the same pathway",
    // "⚠️ Avoid combining with", "🌐 Availability & where to buy", "🧭 Used in these protocols",
    // "Common questions"). Those six carry the exact TEXT the prerendered slugs were built from —
    // #stacks-with, #acts-on-the-same-pathway, #avoid-combining-with, #availability-where-to-buy,
    // #used-in-these-protocols, #common-questions — and #common-questions alone is published on 333
    // routes. Same rule, wider net; no alias table, so nothing here can name a section that is not
    // actually on the page.
    root.querySelectorAll('h2, h3, h4, .section-title').forEach((h) => {
      const text = (h.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text) return;
      let s = headSlug(text);
      if (!s) return;
      const n = (seen.get(s) || 0) + 1; seen.set(s, n);
      if (n > 1) s = s + '-' + n;
      if (h.id === s || document.getElementById(s)) return;
      if (!h.id) { h.id = s; added++; return; }
      // The heading already answers to another name. Park the crawler's name on a zero-size marker
      // immediately before it, so the fragment resolves and scrolls to the right place without
      // renaming anything the app already queries.
      const a = document.createElement('span');
      a.id = s; a.className = 'anchor-alias'; a.setAttribute('aria-hidden', 'true');
      h.parentNode.insertBefore(a, h); added++;
    });
    Object.keys(ANCHOR_ALIASES).forEach((slug) => {
      if (document.getElementById(slug)) return;
      const el = document.getElementById(ANCHOR_ALIASES[slug]);
      if (!el || !el.parentNode) return;
      const a = document.createElement('span');
      a.id = slug; a.className = 'anchor-alias'; a.setAttribute('aria-hidden', 'true');
      el.parentNode.insertBefore(a, el); added++;
    });
    return added;
  }
  // Resolving a fragment is not the same as scrolling to it. Three things were separately broken:
  //   · the id did not exist (above);
  //   · the id existed but was inside a `.chapter` that is `display:none` until its tab is tapped,
  //     so scrollIntoView on it does nothing — 1 of 7 chapters is visible on a compound page;
  //   · the id existed and was visible and the page still did not move, because the section is
  //     injected AFTER route() returns. Measured: /protocol/knee-pain/knee-oa#red-flags resolves
  //     hydrated and scrollY was still 0, because renderProtocol() is awaited and paints later.
  // So: open every <details> above the target, activate its chapter through the renderer's own tab
  // button (never by toggling the class — the tab carries the "visited/mastered" bookkeeping), and
  // retry on a MutationObserver until the late renderers have painted, with a hard stop.
  function revealAnchor(el) {
    for (let p = el.parentElement; p; p = p.parentElement) {
      if (p.tagName === 'DETAILS' && !p.open) p.open = true;
      if (p.classList && p.classList.contains('chapter') && !p.classList.contains('active')) {
        const n = p.getAttribute('data-chapter');
        // Swap the classes DIRECTLY, then click the tab. Clicking alone is not enough and this is
        // measured, not assumed: route() calls this synchronously, and the tab's onclick is wired
        // by enhanceDetail() -> wireCompoundLearning() inside a setTimeout(…, 0), so at jump time
        // the button exists and does nothing. /c/creatine-monohydrate#bottom-line resolved, stayed
        // in a display:none chapter, and left scrollY at 0. The click still runs afterwards so the
        // renderer's own visited/mastered bookkeeping is not bypassed; it is idempotent.
        const box = p.parentElement;
        if (box) box.querySelectorAll(':scope > .chapter').forEach((sec) => sec.classList.toggle('active', sec === p));
        document.querySelectorAll('.ch-step').forEach((t) => t.classList.toggle('active', t.getAttribute('data-ch') === n));
        const tab = document.querySelector('.ch-step[data-ch="' + (window.CSS && CSS.escape ? CSS.escape(n) : n) + '"]');
        if (tab) tab.click();
      }
    }
  }
  // LANDING IS NOT THE SAME AS STAYING. Half this page arrives after the jump — the evidence plot,
  // the comparison grid, the discussion thread — and every block that lands ABOVE the target pushes
  // it down by its own height. Measured: the same fragment landed 149px from the viewport top on
  // one run and 2,398px on the next, from nothing but timing. So hold the target in place while the
  // page is still growing, and stop the instant the reader takes over — a page that keeps yanking
  // itself back is worse than one that lands short.
  function holdAnchor(el) {
    if (!window.MutationObserver) return;
    const app = document.getElementById('app'); if (!app) return;
    let done = false, queued = false;
    const stop = () => {
      if (done) return; done = true;
      obs.disconnect(); clearTimeout(timer);
      ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach((e) => window.removeEventListener(e, stop, true));
    };
    const obs = new MutationObserver(() => {
      if (done || queued) return; queued = true;
      requestAnimationFrame(() => { queued = false; if (!done && el.isConnected) el.scrollIntoView({ block: 'start' }); });
    });
    obs.observe(app, { childList: true, subtree: true });
    const timer = setTimeout(stop, 2500);
    ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach((e) => window.addEventListener(e, stop, true));
  }
  let _hashWatch = null;
  function jumpToHash(watch) {
    const frag = decodeURIComponent((location.hash || '').replace(/^#/, ''));
    if (!frag || frag.charAt(0) === '/') return false;           // "#/route" is router navigation
    const app = document.getElementById('app');
    if (app) anchorizeHeadings(app);
    const el = document.getElementById(frag);
    if (el) {
      revealAnchor(el);
      // rAF twice: once for the chapter/details reflow the line above just caused, once for the
      // layout that reflow produces. One frame reads a stale offset and lands short.
      requestAnimationFrame(() => requestAnimationFrame(() => { el.scrollIntoView({ block: 'start' }); holdAnchor(el); }));
      return true;
    }
    if (!watch || !app || !window.MutationObserver) return false;
    if (_hashWatch) { _hashWatch.obs.disconnect(); clearTimeout(_hashWatch.timer); }
    const obs = new MutationObserver(() => { if (jumpToHash(false)) { obs.disconnect(); clearTimeout(timer); _hashWatch = null; } });
    obs.observe(app, { childList: true, subtree: true });
    // 4 s covers the slowest observed path (renderProtocol's second data wave). After that the
    // fragment genuinely does not exist on this page and silently retrying forever is worse.
    const timer = setTimeout(() => { obs.disconnect(); _hashWatch = null; }, 4000);
    _hashWatch = { obs, timer };
    return false;
  }
  // Back/forward and in-page "#section" links inside the SPA. Without this a fragment change did
  // nothing at all once the router had already rendered the page.
  window.addEventListener('hashchange', () => { const f = (location.hash || '').replace(/^#/, ''); if (f && f.charAt(0) !== '/') jumpToHash(true); });
  // Section names are an INVARIANT of what is in #app, not a side effect of one render path.
  // route() calls anchorizeHeadings() directly, but half this site paints after route() returns —
  // renderProtocol, renderPlan, mountBody, renderComments, mountExercise — and a heading that
  // arrives in the second wave needs its name just as much. So: one observer for the document's
  // lifetime, debounced to a frame, disconnected while the pass runs so its own inserted markers
  // cannot re-trigger it.
  (function watchHeadings() {
    const app = document.getElementById('app');
    if (!app || !window.MutationObserver) return;
    let queued = false;
    const obs = new MutationObserver(() => {
      if (queued) return; queued = true;
      requestAnimationFrame(() => {
        queued = false;
        obs.disconnect();
        try { anchorizeHeadings(app); } catch (e) { }
        obs.observe(app, { childList: true, subtree: true });
      });
    });
    obs.observe(app, { childList: true, subtree: true });
  })();
  // CHAPTER STATE IN THE URL. Measured before this: tapping chapter 3 on /c/creatine-monohydrate
  // left location.href unchanged, so 6 of a compound page's 7 chapters had no address — they could
  // not be linked to, bookmarked, or returned to by Back. One delegated listener rather than an
  // edit to each of the four renderers that build chapter tabs: it runs after their own onclick has
  // swapped the active section, and names the chapter by its first heading's slug, which is the
  // same name the prerendered document publishes for that section.
  document.addEventListener('click', (e) => {
    const t = e.target.closest && e.target.closest('.ch-step, [data-chgo]');
    if (!t) return;
    setTimeout(() => {
      const sec = document.querySelector('.chapter.active');
      // Not every chapter opens with a heading — measured on /c/creatine-monohydrate, chapter 3
      // ("Practical use") contains no h2/h3 at all, only `<div class="callout" id="sec-protocol">`,
      // so a heading-only lookup left that chapter (and three others) with no address again.
      // Take whichever addressable section comes first, and prefer an id that already exists so the
      // URL that is written is one that resolves when it is pasted back in.
      const h = sec && sec.querySelector('h2, h3, h4, .section-title, [id^="sec-"]');
      const id = h && (h.id || headSlug((h.textContent || '').replace(/\s+/g, ' ').trim()));
      // replaceState, not a hash assignment: assigning would fire hashchange, which would scroll
      // the reader back to the heading they are already looking at, and would push a history entry
      // per tab tap so Back walked the chapters instead of leaving the page.
      if (id) history.replaceState(history.state, '', location.pathname + location.search + '#' + id);
    }, 0);
  }, false);

  // Sentinel meaning "this route's page is the prerendered document — leave #app alone".
  // A plain null/'' would be indistinguishable from a renderer that returned nothing by mistake.
  const KEEP = Symbol('keep-prerendered');
  const KEEP_PRERENDERED = ['methodology', 'corrections', 'problem'];
  // THE BACK BUTTON LIED ON 41 OF 41 /problem ROUTES (measured hydrated 2026-08-01, 390x844).
  // KEEP means "the prerendered document IS the page, do not write #app". That is true at boot and
  // false the moment any SPA render has overwritten #app -- and nothing tracked the difference.
  // Land on /problem/knee-pain, click a protocol link (SPA nav), press Back: popstate fires,
  // route() runs, returns KEEP, and skips the only write to #app. Result on all 41: the URL came
  // back (41/41) and the document did not (0/41). /problem/knee-pain went from h1 "🦵 Why knee pain
  // happens" / 8,490 words / 12 cause anchors to h1 "Knee Pain" / 3,363 words / 0 cause anchors,
  // under the /problem/knee-pain URL. The address bar was lying about what was on screen.
  //
  // So: remember which path the DOM in #app belongs to, and cache that document at boot. The cache
  // is the same trick HOME_HTML uses and it is safe for the same reason -- these three prerendered
  // articles bind nothing at boot (0 inline handlers site-wide, every control is document-
  // delegated), so re-inserting the captured string and letting route() re-run glossarize() gives
  // the page back exactly, with no second renderer anywhere.
  // W5c: true only until the first route() has finished. See the focus block inside route().
  let _firstRender = true;
  let KEEP_PATH = (location.pathname || '/').replace(/\.html$/, '');
  let KEEP_HTML = null;   // the prerendered #app for KEEP_PATH -- captured just before route(), below
  let KEEP_LIVE = true;   // is that document still the one in #app?
  function route() {
    const raw = currentRoute();
    const [pathPart, queryPart] = raw.split('?');
    // Parse the query ONCE. The old code did `queryPart.indexOf('ids=') === 0`, which is both
    // position-dependent (`?x=1&ids=…` was ignored) and the reason /solve?q= went nowhere: nothing
    // downstream of here could see it. Measured before this change: /solve, /solve?q=knee%20pain
    // and /solve?q=zzzznonsense produced a byte-identical #app, innerHTML 11,797 on all three.
    const QS = new URLSearchParams(queryPart || '');
    // shared stack link
    const _ids = (QS.get('ids') || '').split(',').filter(Boolean); if (_ids.length) setStack(_ids);
    const parts = pathPart.split('/').filter(Boolean);
    let html;
    if (!parts.length) html = home();
    else if (parts[0] === 'goal') html = goalPage(parts[1]);
    else if (parts[0] === 'c') html = detail(parts[1]);
    else if (parts[0] === 'target') html = targetPage(parts[1]);
    else if (parts[0] === 'browse') html = browsePage();
    else if (parts[0] === 'learn') html = parts[1] != null ? learnModule(parts[1]) : learnIndex();
    else if (parts[0] === 'pathways') html = pathwaysIndex();
    else if (parts[0] === 'pathway') html = pathwayPage(parts[1]);
    else if (parts[0] === 'anatomy') html = anatomyIndex();
    else if (parts[0] === 'body') html = bodyShell(parts[1]);
    else if (parts[0] === 'where') html = whereShell();
    else if (parts[0] === 'muscle') html = musclePage(parts[1]);
    else if (parts[0] === 'exercise') html = '<div class="empty"><h1>Loading exercise…</h1></div>';
    else if (parts[0] === 'fork') html = '<div class="empty"><h1>Loading variation…</h1></div>';
    else if (parts[0] === 'energy') html = energyPage(parts[1]);
    else if (parts[0] === 'physiology') html = physiologyPage(parts[1]);
    else if (parts[0] === 'az') html = azPage();
    // KEEP = "the prerendered document is the page; do not write over it". These routes are static
    // articles generated by build/prerender.js and have no SPA renderer, so before this existed
    // /methodology and /corrections served ~900 crawlable words to a crawler and the word
    // "Not found" to anyone with JavaScript on. Duplicating the prose into app.js would create the
    // two-sources-of-truth split this codebase keeps getting bitten by; keeping the prerendered DOM
    // is the version that cannot drift. Their inbound links carry data-native (see the click
    // interceptor) so in-app navigation does a real page load and the server serves the article.
    else if (KEEP_PRERENDERED.indexOf(parts[0]) >= 0) html = KEEP;
    // /compare with no pair: the prerendered index lists all ready-made comparisons. Keep it and
    // mount the ad-hoc picker into it, rather than replacing the list with the picker.
    else if (parts[0] === 'compare') html = parts[1] ? renderComparison(parts[1]) : (document.getElementById('cmp-tool') ? KEEP : comparePage());
    else if (parts[0] === 'stack') html = stackPage();
    else if (parts[0] === 'fuel') html = fuelPage(parts[1], parts[2]);
    else if (parts[0] === 'plan') html = planLoading();
    else if (parts[0] === 'progress') html = planLoading();
    else if (parts[0] === 'legend') html = legendPage();
    // /newsletter folded into the home page 2026-07-28; server 301s the old URL.
    // FIXED 2026-07-28: this rewrote the URL bar to "/" and rendered the homepage, discarding the
    // fully authored aboutPage() -- which holds the site's ONLY disclaimer -- and leaving /about
    // worse than a soft-404 for both readers and crawlers.
    else if (parts[0] === 'about') html = aboutPage();
    else if (['pros', 'pro', 'stewardship', 'contributors', 'for-clinicians', 'clinic', 'u', 'gp'].indexOf(parts[0]) >= 0) { history.replaceState(null, '', '/'); parts.length = 0; html = home(); } // retired expert/community system → home
    else if (parts[0] === 'solve') html = solvePage(QS.get('q'));
    // dead: the line above sets parts.length = 0, so parts[0] is undefined by here.
    else if (parts[0] === 'admin') html = adminLoading();
    else if (parts[0] === 'protocol') html = protocolLoading();
    else if (parts[0] === 'clinic' && parts[3]) html = protocolLoading();
    else if (parts[0] === 's' && parts[1]) html = '<div class="empty"><h1>Loading shared protocol…</h1></div>';
    else html = notFound();
    // FIRST PAINT OF "/" (2026-07-30). The prerendered home is already in the DOM and HOME_HTML is
    // byte-identical to it, so writing it again buys nothing and costs a full reflow, any
    // browser-restored form state, and a repaint of every emoji on the page. Every later navigation
    // writes normally. This is also what makes the capture in home() legitimate rather than merely
    // clever: the string in the DOM and the string the SPA replays are the same object.
    // A KEEP route whose prerendered document is no longer in #app has to get it BACK, or the URL
    // and the page disagree (41/41 before this). Restore from the boot capture when it is the same
    // path -- instant, no network, byte-identical. Otherwise the reader reached a DIFFERENT
    // prerender-only article client-side, which is only possible through a legacy #/ link (every
    // inbound link to these three carries data-native), so the server has to serve it:
    // location.replace, not reload, because in that case location.pathname is "/" and reloading
    // would re-enter this branch forever. Scoped to KEEP_PRERENDERED so /compare -- which already
    // self-heals by testing for #cmp-tool -- cannot be reached by this code at all.
    if (html === KEEP && KEEP_PRERENDERED.indexOf(parts[0]) >= 0 && !KEEP_LIVE) {
      if (KEEP_HTML != null && KEEP_PATH === pathPart) { app.innerHTML = KEEP_HTML; KEEP_LIVE = true; }
      else if (location.pathname.replace(/\.html$/, '') === pathPart) { location.reload(); return; }
      else { location.replace(pathPart + (queryPart ? '?' + queryPart : '')); return; }
    }
    if (html !== KEEP) KEEP_LIVE = false;
    if (html !== KEEP && !(_firstPaint && !parts.length && HOME_HTML)) app.innerHTML = html;
    if (html === KEEP && parts[0] === 'compare' && document.getElementById('cmp-tool')) {
      document.getElementById('cmp-tool').innerHTML = comparePicker();
    }
    _firstPaint = false;
    // Do not fight an on-page fragment. This used to be an unconditional window.scrollTo(0, 0),
    // which silently defeated every anchor into a rendered page -- including `/?subscribed=1#newsletter`,
    // the landing spot for the newsletter's own 303, and the `/#newsletter` link in the footer of all
    // 514 pages. Both scrolled to the top of the home page instead of to the form the reader had just
    // used, so the site's MAIN call to action had no visible completion state for JS readers either.
    // `#/...` fragments are router paths, not anchors, and must still scroll to top.
    // rAF so the measurement happens after this write has been laid out -- without it the element's
    // offset is read against a stale layout on first paint. The 60px sticky topbar is cleared by
    // `scroll-margin-top` on the three anchor targets in styles.css, not by arithmetic here.
    // W5b: the ids first, then the jump. anchorizeHeadings() gives every <h2>/<h3> the same name
    // the prerendered document published for it, so the 7,339 fragments a crawler is served can
    // resolve; jumpToHash() then opens the <details> and activates the .chapter the target lives
    // in, and keeps watching #app until the async renderers have painted (a protocol page's
    // "#red-flags" resolved and still left scrollY at 0, because renderProtocol paints after this).
    anchorizeHeadings(app);
    const frag = (location.hash || '').replace(/^#/, '');
    if (frag && frag.charAt(0) !== '/') { if (!jumpToHash(true)) window.scrollTo(0, 0); }
    else window.scrollTo(0, 0);
    setPageMeta(parts);
    document.body.classList.toggle('route-bodymap', parts[0] === 'body'); // hides the Feedback FAB that overlaps the 3D canvas
    // ACCESSIBILITY (2026-07-28). route() replaces the ENTIRE page body on every navigation, and
    // nothing announced it: aria-live 0, role="status" 0, no focus move, no skip link. So a
    // screen-reader user who clicked any in-app link heard NOTHING — focus stayed on the
    // now-destroyed link and the new <h1> was never read. For a single-page app that is the core
    // accessibility failure; it removes the experience rather than degrading it.
    // Announce the new page title, then move focus to the new heading so the next thing read is
    // the content, not the top of the document.
    try {
      const h1 = app.querySelector('h1');
      const live = document.getElementById('route-status');
      if (live) {
        const title = (h1 && h1.textContent.trim()) || document.title.split('·')[0].trim();
        // clear first — re-setting identical text does not re-announce in some screen readers
        live.textContent = '';
        setTimeout(() => { live.textContent = title ? title + ' — page loaded' : 'Page loaded'; }, 60);
      }
      // W5c (2026-08-02): NOT ON THE FIRST RENDER. Moving focus after an in-app navigation is
      // correct and stays; doing it on page LOAD is not the same act. Measured hydrated, 0
      // pageerrors: on arrival at any route the <h1> was document.activeElement and matched
      // :focus-visible, so Chrome painted `outline:2px solid rgb(13,148,136)` around the title
      // with no user interaction of any kind — visible in every W0 screenshot. Two things are
      // wrong with it, and the ring is the smaller one: on load the browser has ALREADY put focus
      // at the top of the document, and moving it into the content skips past the skip link and
      // the whole header, so the first Tab lands in the middle of the page. Measured after a real
      // mouse click on an in-app link at 1440x900, the ring correctly does not paint
      // (:focus-visible false), which is what the existing #app h1[tabindex="-1"] rules already
      // handle — so this is the one case those rules cannot reach.
      // The tabindex is still set: the announcer above needs no focus, but a later route change
      // does, and so does anything that wants to send focus to the heading.
      if (h1) { h1.setAttribute('tabindex', '-1'); if (!_firstRender) h1.focus({ preventScroll: true }); }
      _firstRender = false;
    } catch (e) { }
    closeGlossPop();
    try { glossarize(app); } catch (e) { }
    const nav = document.querySelector('.topnav'); if (nav) nav.classList.remove('open');
    // renderHomeComments() and mountHomeStat() dropped: the first is `{ …; return; // comments
    // removed }` and the second was an empty stub. Neither rendered anything in either document.
    if (!parts.length) bindHome();
    if (parts[0] === 'solve') bindSolve();
    if (parts[0] === 'fuel') bindFuel(parts[1], parts[2]);
    if (parts[0] === 'plan') renderPlan();
    if (parts[0] === 'progress') renderProgress();
    // dead: /pros is retired above and parts is emptied, so this never fires.
    if (parts[0] === 'admin') renderAdmin();
    // .then(mountRcOverlayNotice): #p-causes does not exist until renderProtocol has painted, so the
    // notice has to be re-mounted after every protocol render, not only when the overlay settles.
    if (parts[0] === 'protocol') renderProtocol(parts[1], parts[2], null, QS.get('cohort')).then(mountRcOverlayNotice);
    if (parts[0] === 'clinic' && parts[3]) renderProtocol(parts[2], parts[3], parts[1]).then(mountRcOverlayNotice);
    if (parts[0] === 's' && parts[1]) renderSharedPlan(parts[1]);
    // community discussion on compound + pathway pages
    if (parts[0] === 'c' && bySlug[parts[1]]) renderComments('c:' + bySlug[parts[1]].id, bySlug[parts[1]].name);
    if (parts[0] === 'pathway' && D.pathways[+parts[1]]) renderComments('pw:' + (+parts[1]), D.pathways[+parts[1]].shortLabel || 'this pathway');
    if (parts[0] === 'muscle' && muscleById[parts[1]]) { renderComments('mu:' + parts[1], muscleById[parts[1]].name); const mb = document.getElementById('mu-edit'); if (mb) mb.onclick = () => openEditContent('muscle', muscleById[parts[1]].name, 'physio'); }
    if (parts[0] === 'body') mountBody(parts[1]);
    if (parts[0] === 'where') bindWhere();
    if (parts[0] === 'exercise' && parts[1]) mountExercise(parts[1]);
    if (parts[0] === 'fork' && parts[1]) mountForkPage(parts[1]);
    if (parts[0] === 'energy' && energyById[parts[1]]) renderComments('en:' + parts[1], energyById[parts[1]].name);
    if (parts[0] === 'physiology' && physioById[parts[1]]) renderComments('ph:' + parts[1], physioById[parts[1]].name);
    // Page view LAST, and by TEMPLATE only — aTemplate() collapses /c/ssris-… to /t/compound.
    // `parts` is the router's own already-parsed path with the query string stripped upstream
    // (route() splits on '?'), which is why nothing here can see /solve?q=<symptom>.
    try { RNA_A.pv(parts); } catch (e) { }
  }
  // intercept internal link clicks -> pushState navigation (keeps #/ links working)
  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const a = e.target.closest('a'); if (!a) return;
    // data-native = "let the browser do a real navigation". Used by links to prerender-only
    // articles (/methodology, /corrections): the SPA has no renderer for them, so intercepting the
    // click and routing client-side would land on notFound instead of the page that exists.
    if (a.target === '_blank' || a.hasAttribute('download') || a.hasAttribute('data-native')) return;
    const href = a.getAttribute('href'); if (!href) return;
    let path = null;
    if (href.startsWith('#/')) path = href.slice(1);
    else if (href.startsWith('/') && !href.startsWith('//')) path = href;
    if (path == null) return;
    e.preventDefault(); navigate(path);
  });
  window.addEventListener('popstate', route);
  window.addEventListener('hashchange', route);
  document.getElementById('menu-btn').onclick = () => document.querySelector('.topnav').classList.toggle('open');
  const cc = D.meta.counts;
  document.getElementById('foot-stats').textContent = `${cc.compounds} compounds · ${cc.targets} targets · ${cc.pathways} pathways · ${cc.geneLinks} gene links`;
  updateStackBadge();
  // CAPTURE THE PRERENDERED HOME BEFORE ANYTHING CAN TOUCH IT. This must run before route(), which
  // is the only thing that writes to #app. Nothing above this line writes into #app --
  // updateStackBadge() addresses `#stack-badge` and the footer stats live outside <main> -- so the
  // captured string is exactly what build/prerender.js emitted.
  // currentRoute() returns "/" for the home page in both the path form and the legacy #/ form, so
  // this is exact and does not fire on any other route.
  if (!currentRoute().split('?')[0].split('/').filter(Boolean).length) HOME_HTML = app.innerHTML;
  // Same capture, same reason, for the three prerender-only articles. This is the ONLY moment the
  // document the server sent is guaranteed untouched -- nothing above this line writes into #app.
  // Captured BEFORE route(), so the cached string is the pre-glossarized one; route() runs
  // glossarize(app) on every render including the restore, so a restored page is identical to a
  // freshly-loaded one rather than double-glossarized.
  if (KEEP_PRERENDERED.indexOf((KEEP_PATH.split('/').filter(Boolean)[0] || '')) >= 0) KEEP_HTML = app.innerHTML;
  route();
  api.me().then(u => { ME = u; renderAccount(); if (u) { syncPlanOnLogin(); loadConsent().then(() => { if (location.hash.startsWith('#/plan')) renderPlan(); }); } }).catch(() => { renderAccount(); });
  api.config().then(c => { if (c) CFG = c; });
  api.rootcauseOverlay().then(ov => {
    RC_OVERLAY_STATE = ov === null ? 'offline' : 'live';
    if (applyRcOverlay(ov)) route();
    mountRcOverlayNotice();
  }).catch(() => { RC_OVERLAY_STATE = 'offline'; mountRcOverlayNotice(); });
  // Always-available feedback button, bottom-right.
  const fbBtn = document.createElement('button');
  fbBtn.className = 'feedback-fab'; fbBtn.type = 'button'; fbBtn.title = 'Suggest an improvement';
  fbBtn.innerHTML = '💬 Feedback';
  fbBtn.onclick = () => openFeedbackModal();
  document.body.appendChild(fbBtn);
  bindEntityPopovers();
  document.addEventListener('click', e => { const b = e.target.closest('[data-suggest]'); if (b) { e.preventDefault(); openSuggestModal(b.dataset.suggest, b.dataset.ref); } });
  document.addEventListener('click', e => { if (e.target.closest('[data-mastery-map]')) { e.preventDefault(); masteryMapModal(); } });
  document.addEventListener('click', e => { const b = e.target.closest('[data-share-short]'); if (b) { e.preventDefault(); shareShortModal(b.getAttribute('data-share-short')); } });
  // Smooth-scroll to an on-page section by id (journey rail, "one thing" jump) without hijacking the hash router.
  document.addEventListener('click', e => { const b = e.target.closest('[data-scroll]'); if (b) { e.preventDefault(); const t = document.getElementById(b.getAttribute('data-scroll')); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); } });
  // Universal cause-finder — present on every protocol.
  document.addEventListener('click', e => { const b = e.target.closest('[data-find-cause]'); if (b) { e.preventDefault(); const p = problemById[b.getAttribute('data-find-cause')]; if (p) openCauseFinder(p); } });
  // Adopt a cause's default plan — seed My Plan's stack with that cause's supplements.
  // ---------- newsletter signup ----------
  // The form is prerendered, so it renders and submits meaning even before this runs. This upgrades
  // it to an inline confirmation: navigating away after a signup is the single easiest way to lose
  // the second conversion (the click into the site), so nothing here changes the page.
  document.addEventListener('submit', async (e) => {
    const f = e.target.closest('form[data-nl]'); if (!f) return;
    e.preventDefault();
    const input = f.querySelector('.nl-input');
    const btn = f.querySelector('.nl-btn');
    const out = f.querySelector('[data-nl-status]');
    const email = (input && input.value || '').trim();
    const website = (f.querySelector('.nl-hp') || {}).value || '';   // honeypot
    const say = (msg, cls) => { if (out) { out.textContent = msg; out.className = 'nl-status ' + (cls || ''); } };
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) { say('That email address does not look right.', 'err'); input && input.focus(); return; }
    const orig = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Signing you up…'; }
    try {
      const r = await api.subscribe(email, f.dataset.source || 'newsletter', website);
      f.classList.add('done');
      say(r && r.alreadySubscribed
        ? 'You are already on the list — nothing to do.'
        : 'Done. Check your inbox for a short welcome note.', 'ok');
      if (input) input.value = '';
      if (btn) { btn.textContent = '✓ Subscribed'; }
    } catch (err) {
      say((err && err.message) || 'Could not sign you up just now. Try again shortly.', 'err');
      if (btn) { btn.disabled = false; btn.textContent = orig; }
    }
  });

  document.addEventListener('click', e => { const b = e.target.closest('.adopt-plan'); if (b) { e.preventDefault(); const ids = (b.getAttribute('data-adopt') || '').split(',').filter(Boolean); const s = getStack(); let added = 0; ids.forEach(id => { if (!s.includes(id)) { s.push(id); added++; } }); setStack(s); updateStackBadge(); b.classList.add('adopted'); b.textContent = added ? `✓ Added ${added} to your stack — track them on My Plan` : '✓ Already in your stack'; } });
  // ITEM 2 — build a full Move·Fuel·Stack plan for THIS cause (opens the builder seeded from the cause).
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-build-cause]'); if (!b) return; e.preventDefault();
    const [pid, ciStr] = b.getAttribute('data-build-cause').split('#'); const p = problemById[pid]; if (!p) return;
    b.disabled = true; const orig = b.textContent; b.textContent = 'Loading…';
    ensureProtocolData().then(() => {
      const rc = causeAsRc(p, +ciStr); const P = generateProtocol(rc);
      const pl = getPlan() || newPlan();
      const existing = planProtocols(pl).find(x => x.pid === pid && x.rcid === rc.id);
      pl.draft = existing
        ? { pid, rcid: rc.id, moves: existing.moves, supps: existing.supps, functions: existing.functions, extra: {}, step: 0 }
        : { pid, rcid: rc.id, moves: [...(P.strengthen || []), ...(P.stretch || [])].map(x => x.id), supps: (P.stack || []).map(c => c.id), functions: undefined, extra: {}, step: 0 };
      api.startExperiment(pid, rc.id).catch(() => {});
      setPlan(pl); navigate('/plan');
    }).catch(() => { b.disabled = false; b.textContent = orig; });
  });
  // Personalized per-kg dose calculator (biohacker layer)
  document.addEventListener('input', e => {
    // FIXED 2026-07-28. This used to do `parseFloat(d.cap)` on a human sentence. parseFloat
    // returns NaN unless the string STARTS with a digit, so on 8 of the 11 calculators the cap was
    // silently discarded -- and on the one where it did parse, "3g/day is the standard studied
    // dose" became the number 3, which capped a correct 2,660 mg answer to "3 mg". A 1,000x
    // under-dose, rendered at every bodyweight. Meanwhile l-tyrosine printed 7,000 mg against its
    // own "keep total under ~5-6 g" and the agmatine bundle printed 84 g without saying that the
    // per-kg figure is for GLYCEROL, not agmatine (84 g of agmatine would be a serious overdose).
    // The fix is to stop parsing prose: read the authored capValue/capUnit/capPerKg/molecule/
    // flat/schedule fields instead. build/parse.js asserts they are present and coherent.
    const i = e.target.closest('.bio-dose-w'); if (!i) return;
    const box = i.closest('.bio-dose'); const out = box.querySelector('.bio-dose-out');
    const num = (a) => { const v = parseFloat(box.getAttribute(a)); return isNaN(v) ? null : v; };
    const str = (a) => box.getAttribute(a) || '';
    const pk = num('data-perkg'); const unit = (str('data-unit') || 'g').split('/')[0];
    const w = parseFloat(i.value);
    if (!w || w < 20 || w > 300) { out.textContent = '— enter your weight —'; return; }
    let d = pk * w, capped = false;
    const capPerKg = num('data-cap-perkg'), capValue = num('data-cap-value');
    const hardCap = capPerKg != null ? capPerKg * w : capValue;   // per-kg caps scale with the person
    if (hardCap != null && d > hardCap) { d = hardCap; capped = true; }
    const mol = str('data-molecule'), flat = str('data-flat'), sched = str('data-schedule');
    const round = (x) => x >= 100 ? Math.round(x) : Math.round(x * 10) / 10;
    out.innerHTML =
      `≈ <b>${round(d)} ${esc(unit)}</b> / day`
      + (mol ? ` <span class="bio-dose-mol">of ${esc(mol)}</span>` : '')
      + (capped ? ` <span class="bio-dose-cap">(capped at ${round(hardCap)} ${esc(unit)})</span>` : '')
      + (sched ? `<div class="bio-dose-sched">⚠️ ${esc(sched)}</div>` : '')
      + (flat ? `<div class="bio-dose-flat">In practice most people just use a flat <b>${esc(flat)}</b> — the per-kg figure is what the trials used, not a target to hit.</div>` : '');
  });
})();
