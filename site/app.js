(function () {
  const D = window.RNAWIKI_DATA;
  const SITE_NAME = 'RNAwiki'; // brand name; domain configured via SITE_URL env at build (prerender)
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
  // Anatomy & physiology reference layer (muscles, energy systems, metabolism)
  const ANAT = D.anatomy || { muscles: [], energy_systems: [], metabolism: [] };
  const muscleById = {}; (ANAT.muscles || []).forEach(m => muscleById[m.id] = m);
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
  // ---------- Unified plan object (the omnichannel spine: web + Telegram + sharing all read this) ----------
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
  function getPlan() { try { return migratePlan(JSON.parse(localStorage.getItem(PLAN_KEY))) || null; } catch (e) { return null; } }
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
    const showed = () => { const key = d.toISOString().slice(0, 10); return planDayStats(M, (plan.log || {})[key], scheduledIds(M, plan, key)).showed; };
    if (!showed()) d.setDate(d.getDate() - 1); // grace — a still-pending today doesn't break the streak
    for (; ;) { if (showed()) { s++; d.setDate(d.getDate() - 1); } else break; }
    return s;
  }
  // 7 cells (last week → today), each miss / partial / full — the "am I consistent?" glance
  function weekStripHtml(plan, M) {
    M = M || mergedPlan(plan); const tk = today(); const cells = [];
    for (let i = 6; i >= 0; i--) {
      const dd = new Date(); dd.setDate(dd.getDate() - i);
      const key = dd.toISOString().slice(0, 10); const st = planDayStats(M, (plan.log || {})[key], scheduledIds(M, plan, key));
      const cls = st.full ? 'full' : (st.done > 0 ? 'partial' : 'miss');
      const lbl = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][dd.getDay()];
      cells.push(`<div class="ws-day ${cls}${key === tk ? ' today' : ''}" title="${key} · ${st.done}/${st.total} done"><span class="ws-dot"></span><span class="ws-lbl">${lbl}</span></div>`);
    }
    return `<div class="week-strip">${cells.join('')}</div>`;
  }
  // ---- Progress-dashboard stats (all derived from plan.log; deterministic) ----
  function dISO(offset) { const d = new Date(); if (offset) d.setDate(d.getDate() - offset); return d.toISOString().slice(0, 10); }
  function planStartDate(plan) { const ps = planProtocols(plan).map(p => p.startedAt).filter(Boolean).sort(); return ps[0] || today(); }
  function daysShown(plan, M, N) { let c = 0; for (let i = 0; i < N; i++) { const key = dISO(i); if (planDayStats(M, (plan.log || {})[key], scheduledIds(M, plan, key)).showed) c++; } return c; }
  function longestStreak(plan, M) {
    const log = plan.log || {}; const keys = Object.keys(log).sort(); if (!keys.length) return 0;
    let best = 0, cur = 0; const end = new Date(today() + 'T00:00:00');
    for (let d = new Date(keys[0] + 'T00:00:00'); d <= end; d.setDate(d.getDate() + 1)) { const key = d.toISOString().slice(0, 10); if (planDayStats(M, log[key], scheduledIds(M, plan, key)).showed) { cur++; best = Math.max(best, cur); } else cur = 0; }
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
  function setStack(a) { localStorage.setItem(STACK_KEY, JSON.stringify(a)); updateStackBadge(); }
  function inStack(id) { return getStack().includes(id); }
  function toggleStack(id) { const s = getStack(); const i = s.indexOf(id); if (i >= 0) s.splice(i, 1); else s.push(id); setStack(s); }
  function updateStackBadge() { const b = document.getElementById('stack-badge'); const n = getStack().length; if (b) { b.textContent = n; b.hidden = n === 0; } }

  // ---------- helpers ----------
  const starStr = n => { const m = Math.min(5, Math.max(0, n | 0)); return '★'.repeat(m) + '☆'.repeat(5 - m); };
  const STAR_LEGEND = 'Human-evidence strength, 1–5 stars (★). Animal-only data is capped low.';
  const rxBadge = c => c && c.isRx ? '<span class="pill rx" title="A prescription or controlled drug — a doctor has to assess you and prescribe it. It is not a supplement you can buy and take on your own.">Prescription only — see a doctor</span>' : '';
  // Approval pills carry the legal status accurately (e.g. 🟡 OTC · 🔵 Prescription); a compact
  // "℞" cue flags anything needing a doctor without the old verbose, contradictory block.
  const approvalPills = c => c.approvals.map(a => `<span class="pill ${APPROVAL_CLASS[a] || 'k'}">${a} ${D.approvalLabels[a] || ''}</span>`).join('') + (c && c.isRx ? '<span class="rx-note" title="Prescription or controlled — needs a doctor to assess and prescribe.">℞ needs a doctor</span>' : '');
  const badgeRow = c => `<div class="badges"><span class="stars" title="${esc(c.stars)}/5 · ${STAR_LEGEND}">${starStr(c.stars)}</span>${approvalPills(c)}</div>`;
  // Singapore availability, derived from approval status — the localisation moat, accurate for all
  // compounds, and a safety + (future) monetisation surface. Curated cost detail layers on top.
  function sgAvailability(c) {
    const ap = c.approvals || [];
    if (ap.includes('⚫')) return { tag: 'Controlled substance', cls: 'danger', body: 'A controlled substance in most countries — illegal to buy, sell or possess without authorisation (in Singapore: HSA / CNB). Listed for education only, not as a purchase option.' };
    if (c.isRx) return { tag: 'Prescription only', cls: 'rx', body: 'Prescription-only — a doctor must assess and prescribe it. Not sold over the counter or on supplement sites. (In Singapore: HSA-regulated.)' };
    if (ap.includes('🔴')) return { tag: 'Not widely approved', cls: 'warn', body: 'Not approved for general sale in most markets (Singapore included) — only grey-market, where dose, purity and legality are uncertain. Approach with real caution.' };
    if (ap.includes('🟡') || ap.includes('🟢')) return { tag: 'Available over the counter', cls: 'ok', body: 'Widely available OTC — e.g. <b>iHerb</b> (ships worldwide); in Singapore also <b>Guardian</b>, <b>Watsons</b>, <b>GNC</b>, <b>Shopee / Lazada</b>. Look for a third-party-tested / GMP mark and check the actual dose per serving.' };
    return { tag: 'Check locally', cls: '', body: 'Availability and legal status vary by country — check your national regulator (in Singapore, the HSA) before buying.' };
  }
  // Compounds that share a pathway — plausible synergy partners (the site's existing "⚡ Synergy" concept).
  function derivedStacks(c) {
    const pw = new Set(c.pathwayIds || []); if (!pw.size) return [];
    return D.compounds.filter(o => o.id !== c.id && !o.isNote && (o.pathwayIds || []).some(i => pw.has(i))).sort((a, b) => b.stars - a.stars).slice(0, 4);
  }
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
  function mdInline(s) {
    if (!s) return '';
    const links = [];
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, t, u) => { links.push(`<a href="${u}" target="_blank" rel="noopener">${t}</a>`); return `  ${links.length - 1}  `; });
    s = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/ (\d+) /g, (m, i) => links[+i]);
    return s;
  }
  const stripNum = t => t.replace(/^(MODULE|PATHWAY)\s*\d+\s*[—-]\s*/i, '').replace(/^\d+\s*[—-]\s*/, '');
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const userText = s => esc(s).replace(/\n/g, '<br>');
  const ago = ts => { const d = (Date.now() - new Date(ts).getTime()) / 1000; if (d < 60) return 'just now'; if (d < 3600) return Math.floor(d / 60) + 'm ago'; if (d < 86400) return Math.floor(d / 3600) + 'h ago'; if (d < 2592000) return Math.floor(d / 86400) + 'd ago'; return new Date(ts).toLocaleDateString(); };

  // ---------- accounts + API ----------
  let ME = null;
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
    telegramAttach(token) { return this.call('POST', '/api/telegram/attach', { token }); },
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
    rootcauseOverlay() { return this.call('GET', '/api/rootcause-overlay').then(d => d.overlay || []).catch(() => []); },
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
    myExperiment(pid, rcid) { return this.call('GET', `/api/experiments/mine?problem=${encodeURIComponent(pid)}&rc=${encodeURIComponent(rcid)}&voterKey=${encodeURIComponent(VOTER_KEY)}`).catch(() => ({ experiment: null, streak: 0, checkedToday: false })); },
    startExperiment(pid, rcid) { return this.call('POST', '/api/experiments/start', { problemId: pid, rootCauseId: rcid, voterKey: VOTER_KEY, ref: localStorage.getItem('rnawiki_ref') || undefined }); },
    checkinExperiment(pid, rcid) { return this.call('POST', '/api/experiments/checkin', { problemId: pid, rootCauseId: rcid, voterKey: VOTER_KEY }); },
    reportOutcome(pid, rcid, outcome) { return this.call('POST', '/api/experiments/outcome', { problemId: pid, rootCauseId: rcid, outcome, voterKey: VOTER_KEY }); },
    stats() { return this.call('GET', '/api/stats').catch(() => null); },
  };
  // Tier-1 voting: a stable anonymous voter key so votes need no account.
  const VOTER_KEY = (() => { let k = localStorage.getItem('rnawiki_voter'); if (!k) { k = 'v' + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('rnawiki_voter', k); } return k; })();
  // Referral first-touch: remember the first ?ref token a visitor arrives with; compute my own share key.
  (function () { try { const rf = new URL(location.href).searchParams.get('ref'); if (rf && rf.length < 90 && !localStorage.getItem('rnawiki_ref') && rf !== 'v:' + VOTER_KEY) localStorage.setItem('rnawiki_ref', rf); } catch (e) {} })();
  function myRefKey() { return ME ? 'u:' + ME.username : 'v:' + VOTER_KEY; }
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
        <label>Username<input name="username" autocomplete="username" required placeholder="e.g. hyrox_felix"></label>
        ${login ? '' : '<label>Email <span class="opt">(optional, for recovery)</span><input name="email" type="email" autocomplete="email" placeholder="you@example.com"></label>'}
        <label>Password<input name="password" type="password" autocomplete="${login ? 'current-password' : 'new-password'}" required placeholder="${login ? 'Your password' : 'At least 8 characters'}"></label>
        ${login ? '' : `<div class="auth-demo"><label>Age <select name="age_band"><option value="">—</option>${AGE_OPTS.map(o => `<option value="${o[0]}">${o[1]}</option>`).join('')}</select></label><label>Sex <select name="sex"><option value="">—</option>${SEX_OPTS.map(o => `<option value="${o[0]}">${o[1]}</option>`).join('')}</select></label></div><p class="auth-demo-why">Optional — so we can show you what actually works for people like you.</p>`}
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
        closeModal(); renderAccount(); route(); syncPlanOnLogin(); loadConsent(); tgSyncConsume();
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
          ME = (await api.me()) || d.user; closeModal(); renderAccount(); route(); syncPlanOnLogin(); loadConsent(); tgSyncConsume();
        } catch (ex) { if (errEl) { errEl.textContent = ex.message; errEl.hidden = false; } }
      },
    });
    window.google.accounts.id.renderButton(container, { theme: 'outline', size: 'large', width: 320, text: 'continue_with' });
  }
  function requireAuth(then) { if (ME) return then(); openAuth('login'); }
  // Finish a Telegram → account sync: the user opened ?tgsync=<token> from the bot. If signed in, bind the
  // chat to this account; if not, stash the token and prompt sign-in, then complete right after login.
  async function tgSyncConsume() {
    const m = location.search.match(/[?&]tgsync=([\w-]+)/);
    const token = m ? m[1] : sessionStorage.getItem('tgsync');
    if (!token) return;
    if (m) history.replaceState(null, '', location.pathname + (location.hash || '')); // clean the URL either way
    if (!ME) { sessionStorage.setItem('tgsync', token); toast('Sign in to connect your Telegram plan'); openAuth('login'); return; }
    try { await api.telegramAttach(token); sessionStorage.removeItem('tgsync'); toast('✅ Telegram connected — your plan syncs both ways'); }
    catch (e) { sessionStorage.removeItem('tgsync'); toast(e.message || 'That sync link expired — try again from the bot'); }
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
    const box = document.getElementById('goal-comments'); if (!box) return;
    const composer = ME
      ? `<form id="cm-form" class="comment-form"><textarea id="cm-body" maxlength="2000" rows="3" placeholder="Tried it? Share what worked, a question, or a tip about ${esc(label)}…"></textarea><div class="cm-actions"><span class="cm-hint">Be kind and useful. Not medical advice.</span><button class="btn-primary" id="cm-post">Post comment</button></div></form>`
      : `<div class="comment-signin"><b>💬 Join the discussion.</b> <a href="#" id="cm-signin">Sign in or create a free account</a> to share your experience or ask a question.</div>`;
    box.innerHTML = `<div class="discuss-head"><h2>💬 Community discussion</h2><p class="discuss-sub">Share your experience or ask a question about ${esc(label)} — verified experts and stewards reply here.</p></div>${composer}<div id="cm-list" class="comment-list"><div class="empty">Loading…</div></div>`;
    const si = document.getElementById('cm-signin'); if (si) si.onclick = e => { e.preventDefault(); openAuth('login'); };
    if (ME) {
      const form = document.getElementById('cm-form'), body = document.getElementById('cm-body'), btn = document.getElementById('cm-post');
      form.onsubmit = async e => {
        e.preventDefault(); const v = body.value.trim(); if (!v) return; btn.disabled = true;
        try { await api.postComment(key, v); body.value = ''; await loadComments(key); } catch (ex) { alert(ex.message); } finally { btn.disabled = false; }
      };
    }
    loadComments(key);
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
    const box = document.getElementById('home-comments'); if (!box) return;
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
      else btn.onclick = () => { if (!ME) return openAuth('login'); alert('Compound pages are maintained by verified pharmacology experts (pharmacist / MD / biomedical researcher). Apply for that role in your Pro dashboard.'); };
    }
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
    const ids = (c.pathwayIds || []).slice(0, 2);
    const tgtBlocks = (c.targets || []).map(t => {
      const ex = targetBySym[tkey(t.sym)];
      if (!ex || !ex.explainer) return '';
      return `<div class="deeper-block">
        <div class="deeper-name">The molecule it targets — <a href="#/target/${tkey(t.sym)}">${t.sym}</a></div>
        <p class="deeper-one">${mdInline(ex.explainer.oneLine)}</p>
        <a class="deeper-link" href="#/target/${tkey(t.sym)}">Learn what ${t.sym} is →</a>
      </div>`;
    }).filter(Boolean).join('');
    const pathBlocks = ids.map(i => {
      const p = D.pathways[i];
      return `<div class="deeper-block">
        <div class="deeper-name">The system it works through — <a href="#/pathway/${i}">${p.shortLabel}</a></div>
        ${p.oneLine ? `<p class="deeper-one">${mdInline(p.oneLine)}</p>` : ''}
        ${pathwayDiagram(p.diagram, p.shortLabel)}
        <a class="deeper-link" href="#/pathway/${i}">Read the full ${p.shortLabel} lesson →</a>
      </div>`;
    }).join('');
    if (!tgtBlocks && !pathBlocks) return '';
    return `<div class="deeper"><h2 class="deeper-h">Go deeper — how ${esc(c.name)} works in your body</h2>
      <p class="deeper-intro">No science background needed. ${esc(c.name)} does its job by acting on the molecule(s) and body system(s) below. Tap any box to explore, or follow the links for the full plain-English lesson.</p>${tgtBlocks}${pathBlocks}</div>`;
  }

  // ---------- views ----------
  // ---------- landing funnel: match a typed query to a protocol problem ----------
  let _protoSuggest = null; // lazy: GRAPH is declared further down the IIFE
  function protoSuggestIndex() {
    if (!_protoSuggest) _protoSuggest = (GRAPH.problems || []).map(p => ({
      id: p.id, name: p.name, icon: p.icon || '•', kind: p.kind, category: p.category,
      rcCount: p.root_causes.length,
      hay: (p.name + ' ' + p.category + ' ' + p.root_causes.map(rc => rc.name + ' ' + (rc.diagnostic || '')).join(' ')).toLowerCase(),
    }));
    return _protoSuggest;
  }
  function suggestProtocols(q) {
    q = q.trim().toLowerCase(); if (!q) return [];
    const terms = q.split(/\s+/);
    return protoSuggestIndex().map(p => {
      let s = 0; const t = p.name.toLowerCase();
      terms.forEach(x => { if (t === x) s += 14; else if (t.startsWith(x)) s += 10; else if (t.includes(x)) s += 7; else if (p.hay.includes(x)) s += 2; });
      return { p, s };
    }).filter(x => x.s > 0).sort((a, b) => b.s - a.s || a.p.name.length - b.p.name.length).slice(0, 7).map(x => x.p);
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
          box.innerHTML = `<div class="assess-top"><button class="assess-back" data-back>←</button><span></span><button class="assess-x" data-x aria-label="Close">✕</button></div>
            <div class="assess-result redflag"><div class="assess-rf-ic">⚠️</div><h2>See a clinician first</h2>
              <p>${esc(rf.message || 'Please get this assessed in person before starting a self-care plan.')}</p>
              <div class="assess-actions"><button class="assess-go2" data-anyway>Show the protocol for background</button><button class="assess-close2" data-x>Close</button></div></div>`;
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

  function home() {
    const cc = D.meta.counts;
    const cards = D.goals.map(g => {
      const n = D.compounds.filter(c => c.goalIds.includes(g.id)).length;
      return `<a class="goal-card" href="#/goal/${g.id}"><span class="ico">${g.icon}</span><span><span class="lbl">${g.label}</span><br><span class="n">${n} compounds</span></span></a>`;
    }).join('');
    // a few high-intent example chips to seed the funnel
    const seeds = ['Knee Pain', 'Trouble Falling Asleep', 'Brain Fog', 'Belly / Visceral Fat', 'Low Testosterone', 'Longevity / Healthspan']
      .map(n => (GRAPH.problems || []).find(p => p.name.toLowerCase() === n.toLowerCase())).filter(Boolean)
      .map(p => `<button class="seed-chip" data-pid="${p.id}">${p.icon} ${esc(p.name)}</button>`).join('');
    // Daily fact — one per day, deterministic by date, cycling the RNAWIKI_FACTS series.
    // Each links to the page that teaches it; feeds the same one sequence (read → learn → solve).
    const F = (window.RNAWIKI_FACTS || []);
    const fct = F.length ? F[Math.floor(Date.now() / 864e5) % F.length] : null;
    const factHtml = fct ? `
    <section class="daily-fact reveal">
      <div class="df-card">
        <div class="df-top"><span class="df-kicker">💡 Did you know?</span><span class="df-meta">a new fact every day</span></div>
        <p class="df-text">${fct.t}</p>
        <a class="df-link" href="#${fct.href}">${esc(fct.label)}</a>
      </div>
    </section>` : '';
    return `
    <section class="hero funnel-hero reveal in">
      <div class="kicker">The open protocol engine</div>
      <h1>DNA is the idea that<br>never came to life.<br><span class="lead">RNA is the action.</span></h1>
      <p class="hero-lead">DNA is a blueprint locked in a vault. <b>RNA is the messenger, the architect, and the builder</b> — it reads the code and makes it real. RNAwiki is the RNA for your health: name a problem or a goal, and we build the exact movement, food, and supplements that fix its root cause — with every supplement broken down to its <b>compounds, pathways, and molecular targets</b>, and every food to the nutrients that matter, all in plain English.</p>
      <div class="funnel">
        <div class="funnel-search">
          <span class="fs-ico">🔍</span>
          <input id="hero-solve-input" type="text" autocomplete="off" placeholder="What do you want to fix or improve?" aria-label="What do you want to fix or improve?">
          <div id="hero-solve-out" class="funnel-out" hidden></div>
        </div>
        <button id="hero-solve-btn" class="cta-primary funnel-btn">Build my protocol →</button>
      </div>
      <div class="seed-row">${seeds}<a class="seed-all" href="#/solve">or see all ${cc.problems || GRAPH.problems.length} →</a></div>
      <p class="hero-note">Free · evidence-ranked · honest · no bro-science</p>
      <div id="home-stat" class="home-stat" hidden></div>
    </section>
    ${factHtml}
    <section class="scrolly" id="scrolly-how">
      <div class="scrolly-track">
        <div class="scrolly-copy">
          <div class="section-title">How it works</div>
          <div class="sy-step on" data-step="0"><span class="s3-tag mv">Step 1 · Diagnose</span><h3>Find the real driver</h3><p>Name your problem or goal and answer one clinical question. We pinpoint the root cause — not the symptom.</p></div>
          <div class="sy-step" data-step="1"><span class="s3-tag st">Step 2 · Get your protocol</span><h3>Move · Stack · Fuel</h3><p>The exact exercises with sets, reps and easier/harder options; evidence-ranked supplements broken down to their compounds and pathways; and the food targets to hit.</p></div>
          <div class="sy-step" data-step="2"><span class="s3-tag fl">Step 3 · Track</span><h3>See it working</h3><p>Log your local meals and watch the nutrient bars fill toward the biological targets your protocol is built around.</p></div>
        </div>
        <div class="scrolly-stage">
          <div class="phone"><div class="phone-notch"></div><div class="phone-screen">
            <div class="pf-eg">Example</div>
            <div class="sy-frame on" data-frame="0">
              <div class="pf-bar"><span>🔍</span> knee pain going downstairs</div>
              <div class="pf-q">Which fits you best?</div>
              <div class="pf-opt pf-hi">Aches under the kneecap on stairs<span class="pf-pick">✓</span></div>
              <div class="pf-opt">Sharp pain on the inner side</div>
              <div class="pf-opt">Swelling after activity</div>
              <div class="pf-root">→ Likely root cause: <b>weak VMO / patellar tracking</b></div>
            </div>
            <div class="sy-frame" data-frame="1">
              <div class="pf-proto"><span class="pf-l mv">💪 Move</span><b>Spanish squat</b><small>3 × 45s · easier / harder</small></div>
              <div class="pf-proto"><span class="pf-l st">💊 Stack</span><b>Collagen + Vit C</b><small>compounds · pathways · legal status</small></div>
              <div class="pf-proto"><span class="pf-l fl">🍚 Fuel</span><b>Protein 1.6 g/kg</b><small>targets from local meals</small></div>
              <div class="pf-cap">Your full protocol, built from the root cause</div>
            </div>
            <div class="sy-frame" data-frame="2">
              <div class="pf-track-h">Today’s targets</div>
              <div class="pf-nut"><span>Protein</span><div class="sy-bar"><i style="--w:82%"></i></div><em>82%</em></div>
              <div class="pf-nut"><span>Collagen</span><div class="sy-bar"><i style="--w:64%"></i></div><em>64%</em></div>
              <div class="pf-nut"><span>Vitamin C</span><div class="sy-bar"><i style="--w:95%"></i></div><em>95%</em></div>
              <div class="pf-nut"><span>Fibre</span><div class="sy-bar"><i style="--w:71%"></i></div><em>71%</em></div>
              <div class="pf-cap">From the local meals you logged</div>
            </div>
          </div></div>
          <div class="sy-dots"><i data-dot="0" class="on"></i><i data-dot="1"></i><i data-dot="2"></i></div>
        </div>
      </div>
    </section>
    <div class="how-cta center scrolly-cta"><a class="cta-primary" href="#/solve">See every problem &amp; goal →</a></div>

    <section class="trust reveal">
      <div class="section-title center">Open, and honest</div>
      <h2 class="wr-head">Not a wiki of opinions.<br>An <span class="lead">open, evidence-ranked</span> engine.</h2>
      <p class="trust-lead">Every protocol here is ranked by the strength of real human evidence — hype earns nothing, and it’s free to read and use today. The information is overseen by verified Singapore GPs who stand behind its accuracy and credibility.</p>
      <div class="trust-row">
        <div class="trust-pill"><b>${cc.compounds}</b> compounds, evidence-ranked</div>
        <div class="trust-pill"><b>${GRAPH.problems.length}</b> problems, mapped to root causes</div>
        <div class="trust-pill">open · evidence-first · free</div>
      </div>
    </section>

    <section class="gp-home reveal">
      <div class="gp-home-inner">
        <div class="gp-home-txt"><div class="gp-eyebrow">For Singapore GPs</div><h2>Are you a doctor? Turn your expertise into a clinic patients seek out.</h2><p>Feature your clinic, build recurring patient programs, and join a free alliance that cuts your cost of goods — by overseeing the information you already know best.</p></div>
        <a class="cta-primary" href="#/gp">See how it works →</a>
      </div>
    </section>

    <section class="browse-sec reveal">
      <div class="section-title center">Or just browse what helps</div>
      <div class="goal-grid">${cards}</div>
      <p class="browse-more">Want the deep science? <a href="#/learn">Foundations</a> · <a href="#/pathways">Pathways</a> · <a href="#/az">A–Z of compounds</a></p>
    </section>`;
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
    els.forEach(e => io.observe(e));
  }

  // Scroll-driven "scrollytelling": a pinned stage whose frames advance as the
  // user scrolls through a tall section. Progress (0..1) drives the active step,
  // the mock-up frame, the nutrient bars and the progress dots — the module is
  // literally moved by the scrollbar, not just revealed once.
  function initScrolly(id) {
    const sec = document.getElementById(id); if (!sec) return;
    const steps = [...sec.querySelectorAll('.sy-step')];
    const frames = [...sec.querySelectorAll('.sy-frame')];
    const dots = [...sec.querySelectorAll('[data-dot]')];
    const bars = [...sec.querySelectorAll('.sy-bar > i')];
    const n = frames.length; if (!n) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { steps.forEach(s => s.classList.add('on')); return; }
    let raf = 0, lastIdx = -1;
    const update = () => {
      if (!document.body.contains(sec)) { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); return; }
      const rect = sec.getBoundingClientRect();
      const total = sec.offsetHeight - window.innerHeight;
      const progress = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0;
      // idx: which of n frames is active; sub: progress within that frame (0..1)
      const raw = progress * n;
      const idx = Math.min(n - 1, Math.floor(raw));
      const sub = Math.min(1, Math.max(0, raw - idx));
      if (idx !== lastIdx) {
        lastIdx = idx;
        frames.forEach((f, i) => f.classList.toggle('on', i === idx));
        steps.forEach((s, i) => s.classList.toggle('on', i === idx));
        dots.forEach((dt, i) => dt.classList.toggle('on', i === idx));
      }
      // last frame's nutrient bars fill as you scroll through it
      if (idx === n - 1) bars.forEach(b => { const w = parseFloat(b.style.getPropertyValue('--w')) || 100; b.style.width = (w * (0.25 + 0.75 * sub)) + '%'; });
    };
    const onScroll = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; update(); }); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  // wire the landing funnel (autosuggest + intake routing)
  async function mountHomeLeaderboard() {
    const el = document.getElementById('home-leaderboard'); if (!el) return;
    let d; try { d = await api.contributors(); } catch (e) { return; }
    const top = (d.top || []).filter(x => x.reputation_points > 0);
    if (!top.length) return;
    el.innerHTML = `<div class="section-title center">Top contributors</div>
      <div class="lb-row">${top.map((u, i) => `<a class="lb-card" href="#/u/${encodeURIComponent(u.username)}">
        <span class="lb-rank">#${i + 1}</span>
        <span class="lb-name">@${esc(u.username)}</span>
        ${u.domain ? `<span class="sb-dom ${u.domain}">${esc((GRAPH.domains[u.domain] || {}).label || u.domain)}${u.domain_verified ? ' ✓' : ''}</span>` : ''}
        <span class="lb-pts">✦ ${u.reputation_points}</span></a>`).join('')}</div>`;
    revealOnScroll();
  }
  // Resolve a comment key (goal_id) into a human label + link, using client data.
  function pulseCommentRef(key) {
    const seg = String(key || '').split(':');
    if (seg[0] === 'p' && seg[1]) return { label: protocolName(seg[1], seg[2]), href: `#/protocol/${seg[1]}/${seg[2]}` };
    if (seg[0] === 'c' && byId[seg[1]]) return { label: byId[seg[1]].name, href: `#/c/${slug(byId[seg[1]].name)}` };
    if (seg[0] === 'pw' && D.pathways[+seg[1]]) return { label: D.pathways[+seg[1]].shortLabel + ' pathway', href: `#/pathway/${+seg[1]}` };
    if (seg[0] === 'mu' && muscleById[seg[1]]) return { label: muscleById[seg[1]].name, href: `#/muscle/${seg[1]}` };
    if (seg[0] === 'ex') return { label: 'an exercise', href: `#/exercise/${seg[1]}` };
    if (seg[0] === 'en' && energyById[seg[1]]) return { label: energyById[seg[1]].name, href: `#/energy/${seg[1]}` };
    if (seg[0] === 'ph' && physioById[seg[1]]) return { label: physioById[seg[1]].name, href: `#/physiology/${seg[1]}` };
    const g = goalById[key]; if (g) return { label: g.label, href: `#/goal/${key}` };
    return { label: 'the wiki', href: '#/' };
  }
  // Community pulse: a live feed of recent activity — social proof the wiki is alive + discovery.
  async function mountPulse() {
    const el = document.getElementById('home-pulse'); if (!el) return;
    let items = []; try { items = await api.pulse(); } catch (e) {}
    if (!items.length) {
      // Phase 2 (public forking/editing) isn't live yet, so don't invite it. Hide the empty strip.
      el.style.display = 'none';
      return;
    }
    const dom = d => d ? `<span class="pl-dom ${d}">${esc((GRAPH.domains[d] || {}).label || d)}</span>` : '';
    const row = it => {
      const actor = `<a class="pl-actor" href="#/u/${encodeURIComponent(it.actor)}">@${esc(it.actor)}</a>${it.domain && it.verified ? ' ✓' : ''}`;
      const p = problemById[it.problem_id]; const pName = p ? p.name : it.problem_id;
      if (it.type === 'fork') return `<div class="pl-item"><span class="pl-ic">🍴</span><div>${actor} forked <a href="#/fork/${it.id}">${esc(it.title)}</a> <small>· a take on ${esc(pName)}</small><span class="pl-t">${ago(it.at)}</span></div></div>`;
      if (it.type === 'edit') return `<div class="pl-item"><span class="pl-ic">✎</span><div>${actor} ${dom(it.domain)} improved the <b>${esc(it.layer || '')}</b> of <a href="#/protocol/${it.problem_id}/${it.root_cause_id}">${esc(pName)}</a><span class="pl-t">${ago(it.at)}</span></div></div>`;
      if (it.type === 'comment') { const r = pulseCommentRef(it.goal_id); return `<div class="pl-item"><span class="pl-ic">💬</span><div>${actor} ${dom(it.domain)} joined the discussion on <a href="${r.href}">${esc(r.label)}</a><span class="pl-t">${ago(it.at)}</span></div></div>`; }
      if (it.type === 'food') return `<div class="pl-item"><span class="pl-ic">🍽️</span><div>${actor} added <b>${esc(it.name)}</b> to the food database<span class="pl-t">${ago(it.at)}</span></div></div>`;
      return '';
    };
    el.innerHTML = `<div class="section-title center">🟢 Happening now</div>
      <p class="muted center" style="font-size:.85rem;margin-top:-.4rem">A living, community-built wiki — here's the latest.</p>
      <div class="pulse-feed">${items.map(row).join('')}</div>`;
    revealOnScroll();
  }
  function bindHome() {
    revealOnScroll();
    mountHomeLeaderboard();
    mountPulse();
    initScrolly('scrolly-how');
    const inp = document.getElementById('hero-solve-input');
    const out = document.getElementById('hero-solve-out');
    const btn = document.getElementById('hero-solve-btn');
    if (!inp) return;
    let active = -1, current = [];
    const paint = list => {
      current = list; active = -1;
      if (!list.length) {
        if (inp.value.trim().length >= 3) {
          out.innerHTML = `<button class="funnel-hit funnel-req" id="hero-req"><span class="fh-i">✨</span><span class="fh-b"><b>Don’t see it? Request this protocol</b><small>A verified expert will build it — takes 10 seconds</small></span></button>`;
          out.hidden = false;
          const rb = document.getElementById('hero-req'); if (rb) rb.onclick = () => { out.hidden = true; openRequestModal(inp.value.trim()); };
        } else { out.hidden = true; out.innerHTML = ''; }
        return;
      }
      out.innerHTML = list.map((p, i) => `<button class="funnel-hit" data-pid="${p.id}" data-i="${i}">
        <span class="fh-i">${p.icon}</span>
        <span class="fh-b"><b>${esc(p.name)}</b><small>${esc(p.category)} · ${p.kind === 'want' ? 'goal' : 'problem'}${p.rcCount > 1 ? ' · ' + p.rcCount + ' root causes' : ''}</small></span></button>`).join('');
      out.hidden = false;
      out.querySelectorAll('.funnel-hit').forEach(h => h.onclick = () => { out.hidden = true; openIntake(h.dataset.pid); });
    };
    const go = () => {
      const list = current.length ? current : suggestProtocols(inp.value);
      if (list.length) openIntake((active >= 0 ? list[active] : list[0]).id);
      else navigate('/solve');
    };
    inp.addEventListener('input', () => paint(suggestProtocols(inp.value)));
    inp.addEventListener('focus', () => { if (inp.value) paint(suggestProtocols(inp.value)); });
    inp.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, current.length - 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(active - 1, 0); }
      else if (e.key === 'Enter') { e.preventDefault(); go(); return; }
      else return;
      out.querySelectorAll('.funnel-hit').forEach((h, i) => h.classList.toggle('on', i === active));
    });
    btn.onclick = go;
    // close the dropdown on outside click — bind the document listener once, resolve the element live
    if (!bindHome._clickBound) {
      bindHome._clickBound = true;
      document.addEventListener('click', e => {
        const o = document.getElementById('hero-solve-out');
        if (o && !e.target.closest('.funnel-search')) o.hidden = true;
      });
    }
    document.querySelectorAll('.seed-chip').forEach(c => c.onclick = () => openIntake(c.dataset.pid));
  }

  // ---------- legend (what the stars & colours mean) ----------
  function legendBlock() {
    const ev = [
      ['★★★★★', 'Multiple large human trials, consistent'],
      ['★★★★', 'Good human trials, minor gaps'],
      ['★★★', 'Moderate — some trials, mixed or small'],
      ['★★', 'Mostly animal data or one small study'],
      ['★', 'Theoretical or anecdotal only'],
    ];
    return `<div class="legend">
      <div class="legend-col">
        <div class="legend-h">⭐ Evidence rating <span>— strength of <b>human</b> evidence</span></div>
        ${ev.map(([s, t]) => `<div class="legend-row"><span class="stars">${s}</span><span>${t}</span></div>`).join('')}
      </div>
      <div class="legend-col">
        <div class="legend-h">🏷️ Legal status <span>— colour = how you can (legally) get it</span></div>
        ${Object.entries(D.approvalLabels).map(([e, l]) => `<div class="legend-row"><span class="pill ${{ '🟢': 'g', '🟡': 'y', '🔵': 'b', '🟠': 'o', '🔴': 'r', '⚫': 'k' }[e]}">${e} ${l}</span></div>`).join('')}
      </div>
    </div>`;
  }
  function legendPage() {
    return `${crumbs([{ label: 'Home', href: '#/' }, { label: 'Legend' }])}
      <h1>What the ratings mean</h1>
      <p style="color:var(--muted)">Two things appear on every compound: a star rating for how good the evidence is, and a coloured label for its legal status.</p>
      ${legendBlock()}
      <p style="color:var(--faint);margin-top:1.5rem">Animal-only compounds are capped at ★★, because what works in mice often doesn't work in people. "OTC supplement" means it's legal to buy — not that it's proven to work.</p>`;
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
      const ap = chip.dataset.ap; const f = ap ? list.filter(c => c.approvals.includes(ap)) : list;
      document.getElementById('goal-list').innerHTML = f.length ? f.map(cpdCard).join('') : '<div class="empty">None with that status for this goal.</div>';
    });
  }

  // Plain-text FAQ (visible) that mirrors the prerendered FAQPage schema, so the structured data always
  // matches the rendered DOM after hydration. Same source fields as build/prerender.js.
  function faqStrip(t) { return String(t == null ? '' : t).replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`>#]+/g, '').replace(/\s+/g, ' ').trim(); }
  function faqSnip(t, max) { max = max || 300; const s = faqStrip(t); if (s.length <= max) return s; const cut = s.slice(0, max); return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:]$/, '') + '…'; }
  function faqRender(qas) { const items = qas.filter(x => x && x.q && x.a && String(x.a).trim().length > 8); if (items.length < 2) return ''; return `<div class="section-title">Common questions</div><div class="faq">${items.map(x => `<details class="faq-q"><summary>${esc(x.q)}</summary><p>${esc(x.a)}</p></details>`).join('')}</div>`; }

  function detail(s) {
    const c = bySlug[s]; if (!c) return notFound();
    setTimeout(() => {
      const b = document.getElementById('stack-btn'); if (b) b.onclick = () => { toggleStack(c.id); route(); };
      const mh = document.querySelector('[data-mechhelp]'); if (mh) mh.onclick = () => { const g = document.getElementById('mech-guide'); if (g) { g.hidden = !g.hidden; mh.classList.toggle('open', !g.hidden); } };
      enhanceDetail(c);
    }, 0);
    const callout = (key, k, v, cls) => v ? `<div class="callout ${cls || ''}"><span class="k">${k}</span><span id="field-${key}" class="field-val">${mdInline(v)}</span></div>` : '';
    const related = D.compounds.filter(x => x.id !== c.id && (x.category === c.category || x.goalIds.some(g => c.goalIds.includes(g)))).sort((a, b) => b.stars - a.stars).slice(0, 6);
    const goalTags = c.goalIds.map(g => `<a class="chip" href="#/goal/${g}">${goalById[g].icon} ${goalById[g].label}</a>`).join('');
    const added = inStack(c.id);
    return `<div class="detail">
      ${crumbs([{ label: 'Home', href: '#/' }, { label: c.category }, { label: c.name }])}
      <div class="detail-head">
        <div><h1>${c.name}</h1>${badgeRow(c)}</div>
        <div class="detail-actions">
          ${PHASE2 ? '<button id="edit-btn" class="edit-btn" title="Improve this page">✎ Edit page</button>' : ''}
          <button id="stack-btn" class="stack-btn-lg ${added ? 'in' : ''}">${added ? '✓ In your stack' : '+ Add to stack'}</button>
        </div>
      </div>
      <div id="edit-meta" class="edit-meta"></div>
      ${explodedDiagram(c)}
      <div class="toolbar" style="margin-top:1rem">${goalTags}</div>
      ${(() => { const f = (window.RNAWIKI_FACTS || []).find(x => x.href === '/c/' + s); return f ? `<div class="cpd-fact"><span class="cf-k">💡 Did you know?</span> <span class="cf-t">${f.t}</span></div>` : ''; })()}
      ${callout('plain', 'In plain English — start here', c.plain)}
      ${callout('mechanism', 'How it works — the science', c.mechanism)}
      ${callout('target', 'Molecular / gene target', c.target)}
      ${callout('protocol', 'Protocol', c.protocol)}
      ${callout('watch', 'Watch out', c.watch, 'warn')}
      ${callout('bottom', 'Bottom line', c.bottom)}
      ${c.evidence ? `<details class="evidence-block"><summary>🔬 The human evidence <span class="ev-hint">— the actual trials, for the sceptical</span></summary><div class="ev-body">${mdInline(c.evidence)}</div></details>` : ''}
      ${(() => {
        const sg = sgAvailability(c); const derived = derivedStacks(c);
        return `${c.stacksWith || derived.length ? `<div class="section-title">🔗 Stacks with</div>
            ${c.stacksWith ? `<p class="field-val">${mdInline(c.stacksWith)}</p>` : ''}
            ${derived.length ? `<p class="muted" style="font-size:.88rem">Shares a pathway — often paired with: ${derived.map(o => `<a href="#/c/${slug(o.name)}">${esc(o.name)}</a>`).join(' · ')}.</p>` : ''}` : ''}
          ${c.avoid ? `<div class="section-title">⚠️ Avoid combining with</div><div class="sg-buy warn">${mdInline(c.avoid)}</div>` : ''}
          <div class="section-title">🌐 Availability &amp; where to buy</div>
          <div class="sg-buy ${sg.cls}"><b>${esc(sg.tag)}.</b> ${sg.body}${c.cost ? `<div class="sg-cost">💲 ${mdInline(c.cost)}</div>` : ''}</div>`;
      })()}
      ${c.brief && !c.mechanism ? `<div class="body">${c.bodyHtml}</div>` : ''}
      ${goDeeper(c)}
      ${(() => { const ps = protocolsForCompound(c); return ps.length ? `<div class="section-title">🧭 Used in these protocols</div><p style="color:var(--muted);margin-top:-.4rem">Where ${esc(c.name)} is part of a full Move · Fuel · Stack plan.</p><div class="solve-grid">${ps.slice(0, 6).map(x => protoLink(x.p, x.rc)).join('')}</div>` : ''; })()}
      ${faqRender([
        (c.bottom || c.plain) ? { q: `Does ${c.name} actually work?`, a: `Human-evidence rating: ${c.stars} of 5. ${faqSnip(c.bottom || c.plain, 240)}` } : null,
        c.protocol ? { q: `How do you take ${c.name}?`, a: faqSnip(c.protocol, 300) } : null,
        c.watch ? { q: `What are the risks or side effects of ${c.name}?`, a: faqSnip(c.watch, 300) } : null,
        (c.approvalLabels || []).length ? { q: `Is ${c.name} legal or approved?`, a: `Regulatory status: ${(c.approvalLabels || []).join(', ')}.` } : null,
      ])}
      ${related.length ? `<div class="section-title">Related compounds</div><div class="related">${related.map(cpdCard).join('')}</div>` : ''}
      ${solveCta('See the problems &amp; goals this fits — build a protocol →')}
      <div id="goal-comments" class="page-discuss"></div>
    </div>`;
  }

  function targetPage(sym) {
    const t = targetBySym[tkey(decodeURIComponent(sym))]; if (!t) return notFound();
    const list = t.compoundIds.map(id => byId[id]).filter(Boolean).sort((a, b) => b.stars - a.stars);
    // which pathways involve compounds that hit this target
    const pw = {}; list.forEach(c => (c.pathwayIds || []).forEach(i => pw[i] = (pw[i] || 0) + 1));
    const pwChips = Object.keys(pw).sort((a, b) => pw[b] - pw[a]).slice(0, 4).map(i => `<a class="ex-node p" href="#/pathway/${i}">${D.pathways[i].shortLabel}</a>`).join('');
    return `<div class="detail">
      ${crumbs([{ label: 'Home', href: '#/' }, { label: 'Browse targets', href: '#/browse' }, { label: t.sym }])}
      <div class="target-hero">
        <div class="tsym">${t.sym}</div>
        <div>
          <h1>${t.name.replace(new RegExp('^' + t.sym + '\\s*', 'i'), '') || t.sym}</h1>
          <p style="color:var(--muted);margin:.3rem 0"><b>${list.length} compound${list.length > 1 ? 's' : ''}</b> in the wiki act${list.length > 1 ? '' : 's'} on this target. Learn what it does once, and every compound below makes sense.</p>
          <p><a href="${t.url}" target="_blank" rel="noopener">Official NCBI Gene record →</a></p>
          ${pwChips ? `<div class="ex-nodes" style="margin-top:.6rem">${pwChips}</div>` : ''}
        </div>
      </div>
      ${t.explainer ? `<div class="target-explainer">${t.explainer.html}</div>` : ''}
      <div class="suggest-row"><button class="linkbtn" data-suggest="analogy" data-ref="${esc(t.sym)}">💡 Suggest a plain-English analogy</button></div>
      <div class="section-title">Compounds acting on ${t.sym}</div>
      <div class="card-grid">${list.map(cpdCard).join('')}</div>
    </div>`;
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
        rows5([['Approval badge', 'legal status — OTC, Rx or banned', C.amber], ['Evidence stars', 'how strong the human proof is', C.teal], ['Technical mechanism', 'the gene / receptor it acts on', C.blue], ['Molecular target', 'an official link to verify it', C.slate], ['In plain English', 'what it actually means for you', C.green]])]
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
    return `<div class="article"><div class="learn-progress">Foundations · Module ${i + 1} of ${D.modules.length}</div>${crumbs([{ label: 'Home', href: '#/' }, { label: 'Foundations', href: '#/learn' }, { label: 'Module ' + (i + 1) }])}${foundationsDiagram(i)}${m.html}${learnScaffold(m)}<div class="prevnext">${prev}${next}</div></div>`;
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
    const cpdSection = cpds.length ? `<div class="section-title">Compounds that pull this pathway (${cpds.length})</div><div class="card-grid">${cpds.map(cpdCard).join('')}</div>` : '';
    const pwFact = (window.RNAWIKI_FACTS || []).find(x => x.href === '/pathway/' + i);
    const pwFactHtml = pwFact ? `<div class="cpd-fact"><span class="cf-k">💡 Did you know?</span> <span class="cf-t">${pwFact.t}</span></div>` : '';
    return `<div class="article">${crumbs([{ label: 'Home', href: '#/' }, { label: 'Pathways', href: '#/pathways' }, { label: p.shortLabel }])}<h1>${p.shortLabel}</h1>${pwFactHtml}${pathwayDiagram(p.diagram, p.shortLabel)}${p.html}<div class="suggest-row"><button class="linkbtn" data-suggest="simplify" data-ref="${esc(p.shortLabel)} pathway">✨ Too technical? Suggest a simpler version</button></div>${cpdSection}${solveCta('Build a protocol that uses this pathway →')}<div id="goal-comments" class="page-discuss"></div><div class="prevnext">${prev}${next}</div></div>`;
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
  function moveScienceStrip(P) {
    const ids = new Set();
    [...(P.strengthen || []), ...(P.stretch || [])].forEach(e => ((e && e.primaryMuscles) || []).forEach(mn => { if (muscleByName[mn]) ids.add(muscleByName[mn].id); }));
    if (!ids.size) return '';
    const muscleLinks = [...ids].slice(0, 6).map(id => `<a class="tag-chip" href="#/muscle/${id}">${esc(muscleById[id].name)}</a>`).join('');
    const energy = (ANAT.energy_systems || []).map(e => `<a class="tag-chip" href="#/energy/${e.id}">⚡ ${esc(e.name.split('(')[0].trim())}</a>`).join('');
    return `<div class="sci-strip"><div class="sci-h">🔬 The science behind these movements</div>
      <div class="sci-row"><span class="sci-k">Muscles worked</span>${muscleLinks}</div>
      <div class="sci-row"><span class="sci-k">How they're fuelled</span>${energy}</div></div>`;
  }
  function fuelScienceStrip(problem, rc) {
    const hay = ((problem.name || '') + ' ' + (problem.category || '') + ' ' + (rc.name || '')).toLowerCase();
    let picks;
    if (/fat|weight|lean|lose|obes/.test(hay)) picks = ['fat-management', 'insulin-blood-sugar'];
    else if (/muscle|strength|mass|sarcopenia|hypertrophy|build/.test(hay)) picks = ['protein-muscle-turnover', 'insulin-blood-sugar'];
    else if (/endur|cardio|run|vo2|energy|fatigue|stamina/.test(hay)) picks = ['glucose-conversion', 'fat-management'];
    else if (/sugar|glucose|diabet|metabolic|insulin/.test(hay)) picks = ['insulin-blood-sugar', 'glucose-conversion'];
    else picks = ['insulin-blood-sugar', 'glucose-conversion'];
    const links = picks.filter(id => physioById[id]).map(id => `<a class="tag-chip" href="#/physiology/${id}">${esc(physioById[id].name)}</a>`).join('');
    return links ? `<div class="sci-strip"><div class="sci-h">🔬 The physiology this fuel targets</div><div class="sci-row">${links}</div></div>` : '';
  }
  // Temporal stacking: bucket a compound into a time-of-day slot from its dosing text.
  function timingBucket(c) {
    const t = ((c.protocol || '') + ' ' + (c.plain || '')).toLowerCase();
    if (/weekly|monthly|every \d+ ?days|\d+ (consecutive )?days? (a |per )?month|pulse|intermittent(ly)?|\bcycle\b|2 days monthly/.test(t)) return 'periodic';
    if (/pre-?\s?(workout|exercise|train)|before (a |your )?(workout|exercise|train)|post-?\s?(workout|exercise|train)|after (a |your )?(workout|exercise|train)/.test(t)) return 'training';
    if (/before bed|bedtime|at night|\bevening\b|\bnight\b|before sleep/.test(t)) return 'evening';
    if (/\bmorning\b|on waking|empty stomach|with breakfast|\bam\b/.test(t)) return 'morning';
    return 'meals'; // default: with a meal / anytime in the day
  }
  // The "Your day" plan — a layman-friendly 24h checklist; each item expands to the "why".
  function dayPlanHtml(problem, rc, P) {
    const BLOCKS = [
      { k: 'morning', icon: '☀️', label: 'Morning' },
      { k: 'training', icon: '🏋️', label: 'Around training' },
      { k: 'meals', icon: '🍽️', label: 'With meals / anytime' },
      { k: 'evening', icon: '🌙', label: 'Evening & bedtime' },
      { k: 'periodic', icon: '🔁', label: 'Periodic (not daily)' },
    ];
    const bucket = {}; BLOCKS.forEach(b => bucket[b.k] = []);
    (P.stack || []).forEach(c => { bucket[timingBucket(c)].push({ name: c.name, href: '#/c/' + slug(c.name), detail: c.protocol || '', rx: c.isRx }); });
    // exercises go around training
    const moves = [...(P.strengthen || []), ...(P.stretch || [])];
    if (moves.length) bucket.training.unshift({ name: (rc.prescription && rc.prescription.scheme) || (moves.length + ' exercises'), href: '', detail: (rc.prescription && rc.prescription.detail) || 'See the Move section below.', move: true });
    const activeBlocks = BLOCKS.filter(b => bucket[b.k].length);
    if (!activeBlocks.length) return '';
    const item = it => `<div class="dp-item">${it.href ? `<a class="dp-name" href="${it.href}">${esc(it.name)}</a>` : `<b class="dp-name">${it.move ? '💪 ' : ''}${esc(it.name)}</b>`}${it.rx ? '<span class="pill rx">Prescription</span>' : ''}${it.detail ? `<details class="dp-why"><summary>why &amp; how</summary><p>${esc(it.detail)}</p></details>` : ''}</div>`;
    return `<div class="day-plan">
      <div class="section-title" style="margin-top:0">📅 Your day <span class="lp-tag">when to take what</span></div>
      <p class="muted" style="font-size:.85rem;margin-top:-.3rem">The whole protocol as a simple daily plan. Tap “why &amp; how” on any item for the dose and the reason for the timing.</p>
      <div class="dp-blocks">${activeBlocks.map(b => `<div class="dp-block ${b.k}"><div class="dp-head">${b.icon} ${b.label}</div>${bucket[b.k].map(item).join('')}</div>`).join('')}</div>
      <p class="muted" style="font-size:.82rem">Plus: hit your food targets across the day — log meals in the <b class="fl">Fuel</b> section below.</p>
    </div>`;
  }
  function musclePage(id) {
    const m = muscleById[id]; if (!m) return notFound();
    const a = m.anatomy || {};
    const exList = arr => arr && arr.length ? `<div class="anat-exlist">${arr.map(e => `<a class="anat-ex" href="#/exercise/${esc(e.id)}"><b>${esc(e.name)}</b>${e.level ? `<em>${esc(e.level)}</em>` : ''}</a>`).join('')}</div>` : '<p class="muted">None catalogued yet.</p>';
    const model = m.model_embed
      ? `<div class="section-title">This muscle in 3D</div><div class="anat-3d"><iframe title="${esc(m.name)} — interactive 3D anatomy" src="${esc(m.model_embed)}" allow="autoplay; fullscreen; xr-spatial-tracking" allowfullscreen loading="lazy"></iframe></div><p class="fig-credit">Drag to rotate · scroll to zoom — see the shape, origin and insertion of the ${esc(m.name.toLowerCase())}. 3D model via Sketchfab (CC-BY); the ℹ button credits the author. Origin, insertion and action are detailed just below.</p>`
      : `<div class="section-title">This muscle in 3D</div><div class="anat-3d-soon"><span class="a3d-ico">🧊</span><p>A 3D model specific to the <b>${esc(m.name.toLowerCase())}</b> is being added. Its origin, insertion and action are detailed just below — and a verified physiotherapist can attach a model via ✎ Edit.</p></div>`;
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
        <ul class="anat-actions">${(a.actions || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
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
      ${solveCta('Build a protocol that trains this system →')}
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
      ${solveCta('See the protocols this powers →')}
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

  function azPage() {
    setTimeout(() => {
      const bar = document.getElementById('az-cats'); if (!bar) return;
      bar.querySelectorAll('.chip').forEach(chip => chip.onclick = () => { bar.querySelectorAll('.chip').forEach(c => c.classList.remove('active')); chip.classList.add('active'); renderAz(chip.dataset.cat); });
      renderAz('');
    }, 0);
    return `${crumbs([{ label: 'Home', href: '#/' }, { label: 'A–Z' }])}<h1>A–Z Index</h1>
      <div class="toolbar" id="az-cats"><span class="chip active" data-cat="">All (${D.compounds.length})</span>${D.categories.map(c => `<span class="chip" data-cat="${c}">${c}</span>`).join('')}</div>
      <div id="az-body"></div>`;
  }
  function renderAz(cat) {
    let list = (cat ? D.compounds.filter(c => c.category === cat) : D.compounds.slice()).sort((a, b) => a.name.localeCompare(b.name));
    const groups = {}; list.forEach(c => { const L0 = c.name[0].toUpperCase(); const L = /[A-Z]/.test(L0) ? L0 : '#'; (groups[L] = groups[L] || []).push(c); });
    let html = '';
    Object.keys(groups).sort().forEach(L => { html += `<div class="az-letter">${L}</div><div class="az-list">` + groups[L].map(c => `<a href="#/c/${slug(c.name)}">${c.name} <span class="stars" style="font-size:.7rem">${'★'.repeat(c.stars)}</span></a>`).join('') + `</div>`; });
    document.getElementById('az-body').innerHTML = html || '<div class="empty">None.</div>';
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
    const rc = p && p.root_causes.find(r => r.id === rcid);
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
        <p class="hero-lead">Pick the protocol you're following. We load its supplement stack — yours to tweak — and a food tracker set to its exact biological targets, so every meal moves you toward fixing the root cause.</p>
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
    const p = problemById[pid]; const rc = p && p.root_causes.find(r => r.id === rcid);
    if (!p || !rc) return;
    const P = generateProtocol(rc);
    // auto-populate the stack with this protocol's compounds
    const ids = (P.stack || []).map(c => c.id).filter(Boolean);
    const cur = getStack(); const added = ids.filter(id => !cur.includes(id));
    if (added.length) setStack(cur.concat(added));
    renderFuelStack(P);
    loadUserFoods().then(() => mountFuelTracker(p, rc));
    mountFuelTracker(p, rc);
  }
  function renderFuelStack(P) {
    const el = document.getElementById('fuel-stack'); if (!el) return;
    const list = P.stack || [];
    if (!list.length) { el.innerHTML = '<p class="muted">No supplements mapped for this protocol — focus on the food targets below.</p>'; return; }
    el.innerHTML = `<div class="fuel-stack-grid">${list.map(c => {
      const on = inStack(c.id);
      return `<div class="fs-item"><a class="fs-main" href="#/c/${slug(c.name)}"><b>${esc(c.name)}</b><span class="stars" title="${c.stars}/5 human evidence">${starStr(c.stars)}</span></a>
        <button class="fs-toggle ${on ? 'in' : ''}" data-add="${c.id}">${on ? '✓ In stack' : '+ Add'}</button></div>`;
    }).join('')}</div>`;
    el.querySelectorAll('[data-add]').forEach(b => b.onclick = () => { toggleStack(b.dataset.add); const on = inStack(b.dataset.add); b.classList.toggle('in', on); b.textContent = on ? '✓ In stack' : '+ Add'; });
  }
  // ---------- Supplement interaction engine (data: window.RNAWIKI_INTERACTIONS) ----------
  const RXN = window.RNAWIKI_INTERACTIONS || { catTags: {}, nameTags: [], rules: [], synergies: [] };
  function compoundTags(c) {
    const s = new Set(RXN.catTags[c.category] || []);
    const nm = (c.name || '').toLowerCase();
    (RXN.nameTags || []).forEach(r => { if (nm.indexOf(r.m) >= 0) r.t.forEach(t => s.add(t)); });
    return s;
  }
  function stackInteractions(list) {
    const byTag = {};
    list.forEach(c => compoundTags(c).forEach(t => (byTag[t] = byTag[t] || []).push(c.name)));
    const flags = [];
    (RXN.rules || []).forEach(rule => {
      if (!rule.need.every(n => (byTag[n[0]] || []).length >= n[1])) return;
      const involved = {};
      rule.need.forEach(n => (byTag[n[0]] || []).forEach(nm => { involved[nm] = 1; }));
      flags.push({ tier: rule.tier, title: rule.title, why: rule.why, action: rule.action, pathway: rule.pathway, involved: Object.keys(involved) });
    });
    const syn = [];
    (RXN.synergies || []).forEach(g => {
      const A = list.find(c => (c.name || '').toLowerCase().indexOf(g.a) >= 0);
      const B = list.find(c => (c.name || '').toLowerCase().indexOf(g.b) >= 0);
      if (A && B && A !== B) syn.push({ title: g.title, why: g.why });
    });
    return { flags, synergies: syn };
  }
  function interactionPanel(list, opts) {
    if (list.length < 2) return '';
    const r = stackInteractions(list);
    if (opts && opts.tiers) r.flags = r.flags.filter(f => opts.tiers.indexOf(f.tier) >= 0);
    const nDanger = r.flags.filter(f => f.tier === 'danger').length;
    const icon = { danger: '☠️', blunt: '🔻', timing: '⏰' };
    const order = { danger: 0, blunt: 1, timing: 2 };
    r.flags.sort((a, b) => order[a.tier] - order[b.tier]);
    const parts = [];
    parts.push(nDanger
      ? `<span class="ixn-verdict bad">☠️ ${nDanger} dangerous combination${nDanger > 1 ? 's' : ''} — read below</span>`
      : (r.flags.length ? `<span class="ixn-verdict warn">⚠️ ${r.flags.length} thing${r.flags.length > 1 ? 's' : ''} to review</span>`
        : `<span class="ixn-verdict ok">✅ No dangerous interactions flagged</span>`));
    if (r.synergies.length) parts.push(`<span class="ixn-verdict good">✅ ${r.synergies.length} good pairing${r.synergies.length > 1 ? 's' : ''}</span>`);
    const rows = r.flags.map(f => `<div class="ixn ${f.tier}">
        <div class="ixn-h">${icon[f.tier]} <b>${esc(f.title)}</b> <span class="ixn-who">${f.involved.map(esc).join(' + ')}</span></div>
        <p class="ixn-why">${esc(f.why)}</p>
        <p class="ixn-act"><b>What to do:</b> ${esc(f.action)}${f.pathway ? ` · <a href="#${f.pathway}">the biology →</a>` : ''}</p></div>`).join('');
    const syn = r.synergies.map(s => `<div class="ixn good">
        <div class="ixn-h">✅ <b>${esc(s.title)}</b> — works well together</div>
        <p class="ixn-why">${esc(s.why)}</p></div>`).join('');
    return `<div class="ixn-panel">
      <div class="ixn-top"><b>Interaction check</b> ${parts.join(' ')}</div>
      ${rows}${syn}
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
    const overlaps = Object.keys(paths).filter(i => paths[i].length > 1);
    const rows = list.map(c => `<div class="stack-row"><a href="#/c/${slug(c.name)}"><b>${c.name}</b></a> <span class="stars" style="font-size:.75rem">${'★'.repeat(c.stars)}</span> <span style="color:var(--faint);font-size:.82rem">${c.category}</span> <button class="stack-x" data-id="${c.id}">remove</button></div>`).join('');
    const sharedTargets = Object.values(tgts).filter(t => t.who.length > 1);
    out.innerHTML = `
      ${interactionPanel(list)}
      <div class="stack-grid">
        <div class="stack-list">${rows}</div>
        <div class="stack-summary">
          <div class="ss-block"><div class="ss-h">Goals covered (${Object.keys(goals).length})</div>${Object.keys(goals).map(g => `<a class="chip" href="#/goal/${g}">${goalById[g].icon} ${goalById[g].label}</a>`).join(' ') || '—'}</div>
          <div class="ss-block"><div class="ss-h">Pathways hit (${Object.keys(paths).length})</div>${Object.keys(paths).map(i => `<a class="ex-node p" href="#/pathway/${i}">${D.pathways[i].shortLabel}${paths[i].length > 1 ? ' ×' + paths[i].length : ''}</a>`).join(' ') || '—'}</div>
          ${overlaps.length ? `<div class="ss-block warn-block"><div class="ss-h">⚠ Overlapping pathways</div><p>Two or more of your compounds push the same pathway: ${overlaps.map(i => D.pathways[i].shortLabel).join(', ')}. That can mean synergy — or redundancy and additive side-effects. Check for stacked risk.</p></div>` : ''}
          ${sharedTargets.length ? `<div class="ss-block"><div class="ss-h">Shared molecular targets</div>${sharedTargets.map(t => `<a class="ex-node t" href="#/target/${tkey(t.sym)}">${t.sym} ×${t.who.length}</a>`).join(' ')}</div>` : ''}
          <div class="ss-block"><div class="ss-h">This is not medical advice</div><p style="color:var(--faint);font-size:.85rem">Combined pathway/target overlap is an educational signal, not a safety clearance. Interactions require a clinician.</p></div>
        </div>
      </div>`;
    out.querySelectorAll('.stack-x').forEach(b => b.onclick = () => { const s = getStack(); const i = s.indexOf(b.dataset.id); if (i >= 0) s.splice(i, 1); setStack(s); renderStack(); });
  }

  // honest, data-driven verdict — never fabricates a winner; higher stars = stronger human evidence
  function comparisonVerdict(A, B) {
    if (A.stars === B.stars) return `Both carry a comparable human-evidence rating (${A.stars} of 5). Choose on mechanism fit, side-effects, availability and cost rather than evidence strength alone — they work through different mechanisms.`;
    const hi = A.stars > B.stars ? A : B, lo = A.stars > B.stars ? B : A;
    return `${hi.name} has the stronger human-evidence rating (${hi.stars} vs ${lo.stars} of 5), but the right choice still depends on your goal, tolerance and budget.`;
  }
  // static comparison view for /compare/a-vs-b — mirrors the prerendered page so the FAQ schema matches after hydration
  function renderComparison(pair) {
    const idx = (pair || '').indexOf('-vs-');
    if (idx < 0) return comparePage();
    const A = bySlug[pair.slice(0, idx)], B = bySlug[pair.slice(idx + 4)];
    if (!A || !B) return comparePage();
    const shared = (A.goalIds || []).find(g => (B.goalIds || []).includes(g));
    const gl = (shared && goalById[shared] ? goalById[shared].label : 'this goal').toLowerCase();
    const verdict = comparisonVerdict(A, B);
    const row = (k, va, vb) => `<tr><th>${k}</th><td>${va || '—'}</td><td>${vb || '—'}</td></tr>`;
    const faq = faqRender([
      { q: `Is ${A.name} or ${B.name} better for ${gl}?`, a: verdict },
      { q: `What's the difference between ${A.name} and ${B.name}?`, a: `${A.name}: ${faqSnip(A.bottom || A.plain, 130)} — ${B.name}: ${faqSnip(B.bottom || B.plain, 130)}` },
    ]);
    return `${crumbs([{ label: 'Home', href: '#/' }, { label: 'Compare', href: '#/compare' }, { label: `${A.name} vs ${B.name}` }])}
      <div class="detail"><h1>${esc(A.name)} vs ${esc(B.name)}</h1>
      <p>How they compare on human evidence, mechanism, safety and availability — in plain English.</p>
      <div class="cmp-wrap"><table class="cmp-table"><thead><tr><th></th><th><a href="#/c/${slug(A.name)}">${esc(A.name)}</a></th><th><a href="#/c/${slug(B.name)}">${esc(B.name)}</a></th></tr></thead><tbody>
        ${row('Human evidence', `<span class="stars">${starStr(A.stars)}</span>`, `<span class="stars">${starStr(B.stars)}</span>`)}
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

  function comparePage() {
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
          row('Human evidence', `<span class="stars">${starStr(A.stars)}</span>`, `<span class="stars">${starStr(B.stars)}</span>`) +
          row('Targets', (A.targets || []).map(t => t.sym).join(', '), (B.targets || []).map(t => t.sym).join(', ')) +
          row('Mechanism', mdInline(A.mechanism), mdInline(B.mechanism)) +
          row('Plain English', mdInline(A.plain), mdInline(B.plain)) +
          row('Bottom line', mdInline(A.bottom), mdInline(B.bottom));
      };
      a.onchange = render; b.onchange = render; if (D.compounds[1]) b.value = D.compounds[1].id; render();
    }, 0);
    return `${crumbs([{ label: 'Home', href: '#/' }, { label: 'Compare' }])}<h1>Compare</h1>
      <div class="compare-cols"><div class="compare-col"><select id="cmpA">${opts}</select></div><div class="compare-col"><select id="cmpB">${opts}</select></div></div>
      <div class="compare-table" id="cmp-out"></div>`;
  }

  function aboutPage() {
    const c = D.meta.counts;
    return `<div class="article">${crumbs([{ label: 'Home', href: '#/' }, { label: 'About' }])}<h1>About RNAwiki</h1>
      <div class="disclaimer"><strong>Not medical advice.</strong> Educational content only. Nothing here recommends using any substance. Non-approved and controlled substances are documented for completeness and harm-reduction, not endorsement. Consult a clinician before taking anything.</div>
      <h2>Why RNA — the blueprint vs. the builder</h2>
      <p>Most people idolise DNA — they treat it as destiny, the master code that dictates how strong they can get and how long they'll live. But there's a flaw in that thinking: <b>DNA does nothing on its own.</b> It's a blueprint locked inside a vault. A blueprint can't pour concrete, frame a wall, or build a house. It's pure, static potential.</p>
      <p><b>RNA is the action.</b> RNA is the messenger, the architect, and the builder. It reads the static code of your DNA, leaves the vault, and actively builds the proteins, tissues, and enzymes that make up your physical reality. Every adaptation you force — lifting heavy, recovering from DOMS, running a longevity protocol — is a wave of RNA translating your genes into a stronger, longer-lived you. DNA is your starting line; RNA is the work you put in.</p>
      <p>RNAwiki is built on this exact first principle. We're not a static encyclopedia of facts — we're the messenger. This platform takes the foundational code of human performance and translates it into actionable, real-world results you can use today. It cuts through the noise: start from the thing you want to improve, and you get the compounds that genuinely help — ranked honestly by how strong the human evidence is, with the real mechanism and the real catch. No hype, no affiliate spin. Just what works, what doesn't, and why.</p>
      <h2>What's inside</h2>
      <p><strong>${c.compounds} compounds</strong> across <strong>${c.categories} categories</strong> — supplements, prescription drugs, and non-approved research compounds — each with a plain-English explanation, the science behind it, and a link to the official record. Plus <strong>${c.targets} molecular targets</strong> and <strong>${c.pathways} pathways</strong> that connect them.</p>
      <h2>How to use it</h2>
      <ol><li>Pick <a href="#/">a goal</a> and browse what helps, best-evidence first.</li><li>Read any compound for the honest verdict.</li><li>Want the deeper science? Start with <a href="#/learn">Foundations</a> and the <a href="#/pathways">pathways</a>.</li></ol>
      <p><a href="#/legend">What do the stars and colours mean? →</a></p>
      <h2>Contribute</h2>
      <p>RNAwiki is a community wiki — spotted a missing compound, an error, or new evidence? Create an account and edit any page, vote on protocols, or join a protocol's <b>Stewardship</b> tab. Clinicians (physio, dietitian, pharmacist/MD) can steward protocols within their exact domain and get a verified badge. See the <a href="/contributors">Contributors</a> page, or <a href="mailto:felix360506@gmail.com?subject=RNAwiki%20suggestion">email a suggestion</a>.</p></div>`;
  }

  function notFound() { return `<div class="empty"><h1>Not found</h1><p><a href="#/">← Home</a></p></div>`; }

  // ---------- contributors showcase ----------
  // ---------- public expert profile / portfolio (/u/:handle) ----------
  const BADGE_LABEL = { 'verified-expert': '✓ Verified Expert' };
  function profileSocials(s) {
    s = s || {}; const items = [];
    if (s.instagram) items.push(['Instagram', 'https://instagram.com/' + s.instagram]);
    if (s.twitter) items.push(['X', 'https://x.com/' + s.twitter]);
    if (s.linkedin) items.push(['LinkedIn', s.linkedin]);
    if (s.website) items.push(['Website', s.website]);
    if (s.booking_link) items.push(['📅 Book an appointment', s.booking_link, 'book']);
    return items.map(([label, href, cls]) => `<a class="prof-social${cls ? ' ' + cls : ''}" href="${esc(href)}" target="_blank" rel="noopener nofollow">${esc(label)}</a>`).join('');
  }
  function profileLoading(handle) { return `<div class="empty"><h1>Loading @${esc(handle)}…</h1></div>`; }
  async function renderProfile(handle) {
    let d;
    try { d = await api.profile(handle); }
    catch (e) { app.innerHTML = `<div class="empty"><h1>No such member</h1><p>@${esc(handle)} wasn’t found. <a href="#/">← Home</a></p></div>`; return; }
    const u = d.user, c = d.counts || {};
    const dom = GRAPH.domains[u.domain] || null;
    const isMe = ME && ME.username.toLowerCase() === u.username.toLowerCase();
    const badges = (u.badges || []).map(b => `<span class="prof-badge">${esc(BADGE_LABEL[b] || b)}</span>`).join('');
    const purl = (location.origin || 'https://rnawiki.com') + '/u/' + encodeURIComponent(u.username);
    const socials = profileSocials(u.socials);
    const protoName = (pid, rcid) => {
      const p = problemById[pid]; const rc = p && p.root_causes.find(r => r.id === rcid);
      return p ? p.name + (rc ? ' — ' + rc.name.split('(')[0].trim() : '') : pid;
    };
    const stewarded = (d.stewarded || []).map(sp => `<a class="prof-steward" href="#/protocol/${sp.problem_id}/${sp.root_cause_id}">🩺 ${esc(protoName(sp.problem_id, sp.root_cause_id))}</a>`).join('');
    const accepted = (d.accepted || []).map(a => {
      const dl = (GRAPH.domains[a.domain] || {}).label || a.domain;
      return `<a class="prof-contrib" href="#/protocol/${a.problem_id}/${a.root_cause_id}">
        <span class="pc-dom ${a.domain}">${esc(dl)}</span>
        <span class="pc-body"><b>${esc(protoName(a.problem_id, a.root_cause_id))}</b><small>${esc(a.change.slice(0, 130))}</small></span></a>`;
    }).join('');
    app.innerHTML = `${crumbs([{ label: 'Home', href: '#/' }, { label: 'Contributors', href: '#/contributors' }, { label: '@' + u.username }])}
      <section class="prof-head">
        <div class="prof-avatar">${esc(u.username.slice(0, 1).toUpperCase())}</div>
        <div class="prof-id">
          <h1>@${esc(u.username)}</h1>
          <div class="prof-badges">${dom ? `<span class="prof-domain ${u.domain}">${esc(dom.label)}${u.domain_verified ? ' ✓' : ''}</span>` : ''}${badges}</div>
          <div class="prof-rep">✦ <b>${u.reputation_points || 0}</b> reputation · ${c.accepted || 0} accepted edits · ${c.proposals || 0} proposals · ${c.comments || 0} comments</div>
        </div>
        ${isMe ? '<button class="cta-ghost" id="prof-edit">Edit profile</button>' : ''}
      </section>
      ${socials ? `<div class="prof-socials">${socials}</div>` : (isMe ? '<p class="muted" style="text-align:center">Add your Instagram, LinkedIn, website & booking link so patients can reach you — tap “Edit profile”.</p>' : '')}
      ${isMe ? `<div class="prof-share">
        <b>🔗 Backlink your expertise</b>
        <p>Add this link to your Instagram bio, LinkedIn, and clinic staff page to verify your clinical contributions to Singapore’s protocol engine:</p>
        <div class="prof-share-row"><input readonly value="${esc(purl)}" id="prof-url"><button id="prof-copy">Copy</button></div>
      </div>` : ''}
      ${stewarded ? `<div class="section-title">Featured on</div><div class="prof-stewarded">${stewarded}</div>` : ''}
      <div class="section-title">Accepted contributions</div>
      <div class="prof-contribs">${accepted || '<p class="muted">No peer-reviewed contributions yet — open any protocol in your field and tap <b>Refine</b> to improve it.</p>'}</div>`;
    if (isMe) {
      const eb = document.getElementById('prof-edit'); if (eb) eb.onclick = () => openEditProfile(u);
      const cp = document.getElementById('prof-copy'); if (cp) cp.onclick = () => {
        const i = document.getElementById('prof-url'); try { i.select(); } catch (e) {}
        if (navigator.clipboard) navigator.clipboard.writeText(i.value).catch(() => {}); else { try { document.execCommand('copy'); } catch (e) {} }
        cp.textContent = 'Copied ✓';
      };
    }
  }
  function openEditProfile(u) {
    const s = u.socials || {};
    const m = modal(`<div class="edit-profile">
      <h2>Edit profile</h2>
      <p class="muted">These appear on your public profile — how clinics and patients reach you.</p>
      <label>Instagram handle</label><input id="ep-ig" placeholder="yourhandle" value="${esc(s.instagram || '')}">
      <label>X / Twitter handle</label><input id="ep-tw" placeholder="yourhandle" value="${esc(s.twitter || '')}">
      <label>LinkedIn URL</label><input id="ep-li" placeholder="https://linkedin.com/in/…" value="${esc(s.linkedin || '')}">
      <label>Website / clinic URL</label><input id="ep-web" placeholder="https://…" value="${esc(s.website || '')}">
      <label>Booking link</label><input id="ep-book" placeholder="https://… (appointment link)" value="${esc(s.booking_link || '')}">
      <button class="cta-primary" id="ep-save" style="border:none;cursor:pointer;width:100%;margin-top:1rem">Save</button>
    </div>`);
    m.querySelector('#ep-save').onclick = async () => {
      const socials = {
        instagram: document.getElementById('ep-ig').value, twitter: document.getElementById('ep-tw').value,
        linkedin: document.getElementById('ep-li').value, website: document.getElementById('ep-web').value,
        booking_link: document.getElementById('ep-book').value,
      };
      try { const r = await api.saveProfile(socials); if (ME) ME.socials = r.socials; closeModal(); renderProfile(u.username); }
      catch (e) { alert(e.message); }
    };
  }

  function contribLoading() { return `<div class="empty"><h1>Loading contributors…</h1></div>`; }
  async function renderContributors() {
    let d = { experts: [], leaderboard: [] }; try { d = await api.contributors(); } catch (e) {}
    const experts = d.experts.length ? d.experts.map(e => `<a class="expert-card" href="#/u/${encodeURIComponent(e.username)}"><div class="ex-verified">✓ Verified ${esc((GRAPH.domains[e.domain] || {}).label || e.domain)}</div><b>@${esc(e.username)}</b>${e.credential ? `<small>${esc(e.credential)}</small>` : ''}</a>`).join('')
      : '<p class="muted">No verified experts yet. Are you a movement, nutrition, or pharmacology professional (physio, chiro, dietitian, nutritionist, pharmacist, or biomedical researcher)? Contribute on any protocol’s Stewardship tab and get verified.</p>';
    const board = d.leaderboard.length ? `<table class="board"><thead><tr><th>Contributor</th><th>Edits</th><th>Proposals</th><th>Comments</th></tr></thead><tbody>${d.leaderboard.map(r => `<tr><td><a href="#/u/${encodeURIComponent(r.username)}">@${esc(r.username)}</a></td><td>${r.edits}</td><td>${r.proposals}</td><td>${r.comments}</td></tr>`).join('')}</tbody></table>`
      : '<p class="muted">No contributions yet — be the first.</p>';
    app.innerHTML = `${crumbs([{ label: 'Home', href: '#/' }, { label: 'Contributors' }])}
      <h1>Contributors</h1>
      <p style="color:var(--muted)">RNAwiki is built by its community. Verified clinicians steward the protocols within their exact domain; everyone can improve compound pages, vote, and discuss. Every contribution carries permanent attribution.</p>
      <div class="section-title">Domain-verified experts</div>
      <div class="expert-grid">${experts}</div>
      <div class="section-title">Top contributors</div>
      ${board}
      <p class="muted" style="margin-top:1.2rem">Want to be listed? <a href="/about">How to contribute →</a></p>`;
  }

  // ---------- admin: verify expert credentials ----------
  function adminLoading() { return `<div class="empty"><h1>Loading…</h1></div>`; }
  // Founding-clinician recruitment page (Phase-2 marketplace demand capture). A separate,
  // quiet surface for a different audience — it never clutters the patient's core loop.
  function forClinicians() {
    return `${crumbs([{ label: 'Home', href: '#/' }, { label: 'For clinicians' }])}
      <div class="clin-wrap">
        <p class="eyebrow">For physios · dietitians · pharmacists · doctors · clinics &amp; health businesses</p>
        <h1>Help build &amp; peer-review the protocols your patients already follow.</h1>
        <p class="lead">RNAwiki turns root causes into evidence-ranked <b>Move · Fuel · Stack</b> protocols people run and report back on. We're opening a first group of <b>founding clinicians</b> to sharpen the clinical logic in their field — the assessment questions, the safety flags, the protocol itself — attributed to the patients following it.</p>
        <div class="clin-grid">
          <div class="clin-card"><h3>Attribution, not data entry</h3><p>Your name on protocols people are actively running — with real outcomes proving they work.</p></div>
          <div class="clin-card"><h3>Own your specialty's logic</h3><p>Physios shape movement, dietitians shape fuel, pharmacists shape the stack — differential questions and red-flags included.</p></div>
          <div class="clin-card"><h3>Founding status</h3><p>The first 50 are named as founding contributors. Early, credible, permanent.</p></div>
          <div class="clin-card"><h3>Warm leads, later</h3><p>Patients running your protocol are pre-qualified for your clinic when the marketplace opens.</p></div>
        </div>
        <form id="clin-form" class="clin-form" novalidate>
          <h3>Join the founding list <span class="muted" style="font-weight:400">· two minutes, no account</span></h3>
          <div class="clin-row">
            <input name="name" placeholder="Your name" autocomplete="name" required>
            <input name="email" type="email" placeholder="Email" autocomplete="email" required>
          </div>
          <div class="clin-row">
            <select name="discipline">
              <option value="">I'm a…</option>
              <option>Physiotherapist</option><option>Dietitian / Nutritionist</option>
              <option>Pharmacist</option><option>Doctor (MD)</option>
              <option>S&amp;C coach / trainer</option>
              <option>Clinic / gym / studio</option><option>Supplement / health brand</option>
              <option>Other clinician or business</option>
            </select>
            <input name="note" placeholder="What would you improve first? (optional)">
          </div>
          <button type="submit" class="clin-btn">Join the founding list</button>
          <p class="clin-consent muted">We'll only email you about the founding-clinician programme. No spam — unsubscribe anytime.</p>
          <div id="clin-msg" class="clin-msg" hidden></div>
        </form>
      </div>`;
  }
  function bindForClinicians() {
    const f = document.getElementById('clin-form'); if (!f) return;
    const val = n => (f.querySelector('[name="' + n + '"]').value || '').trim();
    f.onsubmit = async e => {
      e.preventDefault();
      const b = { name: val('name'), email: val('email'), discipline: f.querySelector('[name="discipline"]').value, note: val('note') };
      const msg = document.getElementById('clin-msg'), btn = f.querySelector('.clin-btn');
      if (!b.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(b.email)) { msg.hidden = false; msg.className = 'clin-msg err'; msg.textContent = 'Please add your name and a valid email.'; return; }
      btn.disabled = true; btn.textContent = 'Sending…';
      try {
        await api.submitClinicianInterest(b);
        f.innerHTML = `<div class="clin-done"><div class="clin-tick">✓</div><h3>You're on the founding list.</h3><p class="muted">We'll be in touch as the founding-clinician programme opens. Thank you for helping build the honest version of this.</p></div>`;
      } catch (ex) {
        msg.hidden = false; msg.className = 'clin-msg err'; msg.textContent = ex.message || 'Could not save — please try again.';
        btn.disabled = false; btn.textContent = 'Join the founding list';
      }
    };
  }

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
    const nameOf = (pid, rcid) => { const p = GRAPH.problems.find(x => x.id === pid); const rc = p && p.root_causes.find(r => r.id === rcid); return { pn: p ? p.name : pid, rn: rc ? rc.name.split('(')[0].trim() : rcid, icon: p ? (p.icon || '') : '' }; };
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
    async function renderDataset() {
      const view = app.querySelector('#cr-view'); view.innerHTML = `<div class="muted" style="padding:1rem 0">Loading outcomes…</div>`;
      let O; try { O = await getOutcomes(); } catch (e) { view.innerHTML = '<p class="muted">Could not load outcomes.</p>'; return; }
      const rows = (O.rows || []).map(r => { const nm = nameOf(r.pid, r.rcid);
        const p30 = r.d30_n ? Math.round(r.d30_imp / r.d30_n * 100) : null, p90 = r.d90_n ? Math.round(r.d90_imp / r.d90_n * 100) : null; const dlt = r.symptom_delta;
        return `<tr><td>${nm.icon} <b>${esc(nm.pn)}</b> <span class="muted">${esc(nm.rn)}</span></td><td>${r.baseline_n}</td><td>${r.d30_n}${p30 != null ? ` · <b>${p30}%</b>↑` : ''}</td><td>${r.d90_n}${p90 != null ? ` · <b>${p90}%</b>↑` : ''}</td><td>${dlt != null ? (dlt > 0 ? '▼ ' + dlt : dlt < 0 ? '▲ ' + Math.abs(dlt) : '0') + ' pts' : '—'}</td><td>${r.avg_adh != null ? r.avg_adh + '%' : '—'}</td></tr>`;
      }).join('') || '<tr><td colspan="6" class="muted">No outcome data yet — it accrues as consented users complete their 30- and 90-day check-ins.</td></tr>';
      view.innerHTML = `<div class="cr-sec-h"><h2>Outcome dataset</h2></div>
        <div class="ao-table-wrap"><table class="board"><thead><tr><th>Protocol</th><th>Baseline</th><th>30-day</th><th>90-day</th><th>Symptom Δ</th><th>Adherence</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    }
    // ---- Insights view: high-value signals + research cuts ----
    function renderInsights() { app.querySelector('#cr-view').innerHTML = `<div id="adm-datasets"><div class="muted" style="padding:1rem 0">Loading datasets…</div></div>`; loadDatasets(); }
    function opsMenuHtml() {
      // GP-only model: all provider queues merged into GP/Clinics; feedback + requests merged.
      const OPS = [
        ['members', '👥', 'Members', 'Everyone who signed up — emails, join dates & roles'],
        ['gps', '🩺', 'GP & clinic applications', 'Singapore GPs registering interest + clinics to feature'],
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
        const ciRows = ci.length ? ci.map(c => `<tr><td>${esc(c.name)}</td><td>${esc(c.email)}</td><td>${esc(c.note || c.discipline || '—')}</td><td>${c.created_at ? esc(String(c.created_at).slice(0, 10)) : '—'}</td></tr>`).join('') : '<tr><td colspan="4" class="muted">No GP interest yet — share the <a href="#/gp">/gp</a> landing page.</td></tr>';
        const ex = OV.experts || [];
        const exRows = ex.length ? ex.map(e => { const status = e.domain_verified ? '✓ verified' : (e.application_status || 'none'); const actions = e.domain_verified ? `<button class="admin-btn" data-verify="${esc(e.username)}" data-to="0">Revoke</button>` : `<button class="admin-btn ok" data-verify="${esc(e.username)}" data-to="1">Approve</button> <button class="admin-btn" data-verify="${esc(e.username)}" data-to="0">Reject</button>`; return `<tr><td>@${esc(e.username)}</td><td>${esc(e.credential || '—')}${e.role_backlink ? ` · <a href="${esc(e.role_backlink)}" target="_blank" rel="noopener nofollow">backlink↗</a>` : ''}</td><td>${esc(status)}</td><td>${actions}</td></tr>`; }).join('') : '<tr><td colspan="4" class="muted">No badge applications.</td></tr>';
        const pt = OV.partners || [];
        const ptRows = pt.length ? pt.map(p => `<tr><td>${esc(p.name)}</td><td>${p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">site</a>` : '—'}${p.backlink_url ? ` · <a href="${esc(p.backlink_url)}" target="_blank" rel="noopener">backlink↗</a>` : ''}</td><td>${esc(p.status)}</td><td>${p.status !== 'active' ? `<button class="admin-btn ok" data-partner="${p.id}" data-to="active">Approve</button> ` : ''}${p.status !== 'rejected' ? `<button class="admin-btn" data-partner="${p.id}" data-to="rejected">Reject</button>` : ''}</td></tr>`).join('') : '<tr><td colspan="4" class="muted">No clinics listed yet.</td></tr>';
        body.innerHTML = `<p class="muted">Singapore GPs &amp; clinics only. <a class="admin-btn ok" href="/api/admin/export?type=clinicians" download>⤓ Export GP interest (CSV)</a></p>
          <h3 class="adm-sub-h">🩺 GP interest — from the /gp page</h3><div class="ao-table-wrap"><table class="board"><thead><tr><th>Name</th><th>Email</th><th>Clinic / note</th><th>When</th></tr></thead><tbody>${ciRows}</tbody></table></div>
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
        }).join('') : '<tr><td colspan="5" class="muted">No section edits waiting. When a verified expert edits a Move / Fuel / Stack section, it holds here until you or a relevant-domain expert approves it.</td></tr>';
        const ce = OV.compoundEdits || [];
        const ceHtml = ce.length ? `<h3 style="margin:1.5rem 0 .5rem">Recent compound edits</h3><table class="board"><thead><tr><th>Compound</th><th>Note</th><th>By</th></tr></thead><tbody>${ce.map(e => `<tr><td><b>${esc(e.compound_name || e.compound_id)}</b></td><td>${esc(e.note || '—')}</td><td>@${esc(e.by_user)}</td></tr>`).join('')}</tbody></table>` : '';
        body.innerHTML = `<p class="muted">A verified expert edits a section directly; the change waits here until a relevant-domain expert or you (superadmin) approves it. <b>Approve &amp; publish</b> makes it public; <b>Reject</b> removes it from the queue.</p>
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
        body.innerHTML = `<p class="muted">An expert requests a change to a problem’s root causes. A second relevant expert reviews and approves it — then it waits here for <b>your final approval</b> before it goes live. Rows marked <b>✅ peer-approved · awaiting you</b> are the ones on your desk.</p>
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
      const nm = (pid, rcid) => { const p = GRAPH.problems.find(x => x.id === pid); const rc = p && p.root_causes.find(r => r.id === rcid); return { pn: p ? p.name : pid, rn: rc ? rc.name.split('(')[0].trim() : rcid, icon: p ? (p.icon || '') : '' }; };
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
    q = q.trim().toLowerCase(); if (!q) { searchOut.hidden = true; return; }
    const terms = q.split(/\s+/);
    const scored = index.map(it => { let s = 0; const t = it.title.toLowerCase(); terms.forEach(x => { if (t === x) s += 14; else if (t.startsWith(x)) s += 10; else if (t.includes(x)) s += 6; else if (it.hay.includes(x)) s += 2; }); return { it, s }; })
      .filter(x => x.s > 0).sort((a, b) => b.s - a.s || a.it.title.length - b.it.title.length).slice(0, 12);
    searchOut.innerHTML = scored.length ? scored.map(x => `<a href="${x.it.href}"><span class="sr-kind">${x.it.kind}</span> ${x.it.title} <span style="color:var(--faint);font-size:.82rem">· ${x.it.sub}</span></a>`).join('') : '<a>No matches</a>';
    searchOut.hidden = false;
  }
  searchBox.addEventListener('input', () => runSearch(searchBox.value));
  searchBox.addEventListener('focus', () => { if (searchBox.value) runSearch(searchBox.value); });
  document.addEventListener('click', e => { if (!e.target.closest('.search-wrap')) searchOut.hidden = true; });
  searchOut.addEventListener('click', () => { searchOut.hidden = true; searchBox.value = ''; });

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
    const terms = Object.keys(GLOSSARY).filter(t => t.trim()).sort((a, b) => b.length - a.length);
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
        if (!GLOSSARY[term] || seen.has(term)) continue;
        seen.add(term);
        const start = match.index, end = start + match[1].length;
        const span = document.createElement('span'); span.className = 'gloss'; span.textContent = text.slice(start, end); span.setAttribute('data-def', GLOSSARY[term]); span.setAttribute('title', GLOSSARY[term]);
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
    if (kind === 'c' && bySlug[key]) { const c = bySlug[key]; return { badge: 'Compound', cls: 'st', title: c.name, extra: `<span class="stars">${starStr(c.stars)}</span>${c.isRx ? '<span class="ep-rx">Prescription</span>' : ''}`, sub: (c.plain || c.bottom || c.mechanism || '').slice(0, 150) }; }
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
  function localPartners(problem) {
    const B = window.RNAWIKI_BUSINESSES;
    if (!B || !B.businesses) return '';
    const matches = B.businesses.filter(b => (b.serves || []).includes(problem.category)).slice(0, 3);
    if (!matches.length) return '';
    const TYPE_ICON = { physio: '🧑‍⚕️', gym: '🏋️', supplement: '💊', clinic: '🏥', dietitian: '🥗' };
    return `<section class="local-partners">
      <div class="section-title">Local partners for ${esc(problem.name)} <span class="lp-tag">Singapore</span></div>
      <div class="lp-grid">${matches.map(b => `<a class="lp-card" href="${esc(b.link)}" target="_blank" rel="noopener nofollow">
        <span class="lp-ico">${TYPE_ICON[b.type] || '📍'}</span>
        <span class="lp-body"><b>${esc(b.name)}</b><small>${esc(b.type)} · ${esc(b.location)}</small><span class="lp-blurb">${esc(b.blurb || '')}</span></span></a>`).join('')}
      </div>
      <p class="lp-note">${esc(B.disclaimer || '')} <a href="mailto:felix360506@gmail.com?subject=RNAwiki%20local%20partner">List your business →</a></p>
    </section>`;
  }
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
  function protocolName(pid, rcid) {
    const p = problemById[pid]; const rc = p && p.root_causes.find(r => r.id === rcid);
    return p ? p.name + (rc ? ' — ' + rc.name.split('(')[0].trim() : '') : pid;
  }
  function findRootCause(pid, rcid) {
    const p = problemById[pid]; if (!p) return null;
    const rc = p.root_causes.find(r => r.id === rcid) || p.root_causes[0];
    return rc ? { problem: p, rc } : null;
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
      const inRegion = e => !rel || (e.primaryMuscles || []).some(m => rel.has(m));
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
      (rc.anchor_exercises || []).forEach(id => { const e = exById[id]; if (e && !seen.has(id) && strengthen.length < cap) { seen.add(id); strengthen.push(e); } });
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
        .sort((a, b) => (b.f.sg_local - a.f.sg_local) || (b.hits - a.hits))
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

  // ---------- Solve / intake ----------
  function solvePage() {
    const cats = GRAPH.categories;
    const filterBtns = `<div class="solve-filter" id="solve-filter">
        <button data-k="all" class="on">All</button>
        <button data-k="need">Fix a problem</button>
        <button data-k="want">Reach a goal</button>
      </div>`;
    const sections = cats.map(cat => {
      const ps = GRAPH.problems.filter(p => p.category === cat);
      const cards = ps.map(p => {
        const rc0 = p.root_causes[0];
        return `<a class="solve-card" data-kind="${p.kind}" href="#/protocol/${p.id}/${rc0.id}">
          <span class="s-ico">${p.icon || '•'}</span>
          <span class="s-body"><b>${esc(p.name)}</b>
          <small>${p.root_causes.length} root cause${p.root_causes.length > 1 ? 's' : ''} · ${p.kind === 'want' ? 'goal' : 'problem'}</small></span></a>`;
      }).join('');
      return `<div class="solve-section"><h2>${esc(cat)}</h2><div class="solve-grid">${cards}</div></div>`;
    }).join('');
    return `${crumbs([{ label: 'Home', href: '#/' }, { label: 'Solve' }])}
      <section class="solve-hero">
        <div class="kicker">Protocol engine</div>
        <h1>Stop guessing. Start solving.</h1>
        <p>Tell us the problem you want to fix or the goal you want to reach. We identify the likely root cause and build you one protocol: the <b class="mv">movement</b> to fix it, the <b class="fl">food</b> to fuel it (with a tracker that hits your biological targets), and the evidence-ranked <b class="st">compounds</b> to support it.</p>
      </section>
      ${filterBtns}
      <div id="solve-list">${sections}</div>
      <div class="request-cta">
        <div><b>Don’t see your problem or goal?</b> <span>Request it and we’ll have a verified expert build the protocol.</span></div>
        <button class="cta-primary" id="req-proto">Request a protocol →</button>
      </div>
      <div id="requests-board"></div>`;
  }
  // Anyone can suggest an improvement or flag something wrong — collected for the admin.
  function openFeedbackModal() {
    const page = location.pathname + location.hash;
    const m = modal(`<div class="partner-modal"><h2>Help us improve RNAwiki</h2>
      <p class="muted">Spotted something wrong, confusing, or missing? Have an idea? Tell us — it goes straight to the team.</p>
      <label>What kind of feedback?</label>
      <select id="fb-kind"><option value="idea">💡 An idea / suggestion</option><option value="wrong">⚠️ Something looks wrong</option><option value="other">💬 Something else</option></select>
      <label>Your feedback</label><textarea id="fb-body" rows="4" maxlength="2000" placeholder="What would make RNAwiki better?"></textarea>
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
      <p class="muted">Your contribution is live. Post this to your socials to build your profile — every view is a potential lead. The link isn’t clickable on most platforms, so we’ve added a search hint too.</p>
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
  function openForkModal(problem, rc) {
    if (!ME) return openAuth('login');
    let P = {}; try { P = generateProtocol(rc); } catch (e) {}
    const protoIds = (P.stack || []).map(c => c.id);
    const extra = getStack().filter(id => !protoIds.includes(id)).map(id => byId[id]).filter(Boolean);
    const items = (P.stack || []).concat(extra);
    const rows = items.map(c => `<label class="fork-item"><input type="checkbox" value="${c.id}" checked> <b>${esc(c.name)}</b> <span class="stars">${starStr(c.stars)}</span>${c.isRx ? ' <span class="pill rx">Prescription</span>' : ''}</label>`).join('');
    const m = modal(`<div class="partner-modal"><h2>🍴 Fork this protocol</h2>
      <p class="muted">Make your own take on <b>${esc(problem.name)}</b> — keep what suits you, drop what doesn't. It's saved as a <b>community variation</b> (clearly not the reviewed protocol). When others clone it, you earn reputation.</p>
      <label>Name your variation</label><input id="fk-title" maxlength="80" placeholder="e.g. My SG longevity stack — no rapamycin">
      <label>What did you change &amp; why? (optional)</label><textarea id="fk-note" rows="2" maxlength="500" placeholder="Dropped X (couldn't source it in SG), added Y for sleep…"></textarea>
      <label>Your stack (${items.length})</label>
      <div class="fork-items">${rows || '<p class="muted">This protocol has no supplements to fork.</p>'}</div>
      <button class="cta-primary" id="fk-save" style="border:none;cursor:pointer;width:100%;margin-top:1rem">Save my variation</button></div>`);
    m.querySelector('#fk-save').onclick = async () => {
      const title = (document.getElementById('fk-title') || {}).value || ''; if (!title.trim()) return alert('Name your variation first.');
      const stack = [...m.querySelectorAll('.fork-items input:checked')].map(i => i.value);
      try { await api.createFork({ problem_id: problem.id, root_cause_id: rc.id, title, note: (document.getElementById('fk-note') || {}).value || '', stack }); closeModal(); alert('Saved! It’s now a community fork. +10 points — every clone earns you more.'); mountForks(problem, rc); }
      catch (e) { alert(e.message); }
    };
  }
  async function mountForks(problem, rc) {
    const el = document.getElementById('community-forks'); if (!el) return;
    // Phase 2 feature (public forking). Until it launches, render nothing.
    if (!PHASE2) { el.style.display = 'none'; return; }
    let forks = []; try { forks = await api.forksFor(problem.id, rc.id); } catch (e) {}
    const forkBtn = `<button class="linkbtn" id="fk-new">🍴 Fork this protocol →</button>`;
    if (!forks.length) { el.innerHTML = `<div class="fork-empty">No community variations yet. Made a tweak that works for you? ${forkBtn}</div>`; }
    else {
      el.innerHTML = `<div class="section-title">🍴 Community variations <span class="lp-tag">not reviewed · ${forks.length}</span></div>
        <p class="muted" style="font-size:.85rem;margin-top:-.3rem">Real people's takes on this protocol — not the official, expert-maintained one. Clone one to load its stack, or ${forkBtn}</p>
        <div class="fork-list">${forks.map(f => {
        const names = (f.stack || []).map(id => byId[id]).filter(Boolean).slice(0, 5).map(c => esc(c.name)).join(', ');
        return `<div class="fork-card"><div class="fork-head"><a class="fork-title" href="#/fork/${f.id}"><b>${esc(f.title)}</b></a><span class="fork-by">${f.by_user ? '@' + esc(f.by_user) : 'someone'}${f.domain && f.domain_verified ? ' ✓' : ''} · ${f.clones} clone${f.clones !== 1 ? 's' : ''}</span></div>
          ${f.note ? `<p class="fork-note">${esc(f.note)}</p>` : ''}
          <p class="fork-stack">${names || '—'}${(f.stack || []).length > 5 ? ' +' + ((f.stack || []).length - 5) + ' more' : ''}</p>
          <button class="fork-clone" data-clone="${f.id}">Clone this stack →</button></div>`;
      }).join('')}</div>`;
    }
    const nb = document.getElementById('fk-new'); if (nb) nb.onclick = () => openForkModal(problem, rc);
    el.querySelectorAll('[data-clone]').forEach(b => b.onclick = () => cloneForkTo(b.dataset.clone));
  }
  async function mountForkPage(id) {
    const f = await api.getFork(id);
    if (!f) { app.innerHTML = notFound(); return; }
    const p = problemById[f.problem_id];
    const cpds = (f.stack || []).map(x => byId[x]).filter(Boolean);
    const base = '#/protocol/' + f.problem_id + '/' + f.root_cause_id;
    app.innerHTML = `<div class="article">${crumbs([{ label: 'Home', href: '#/' }, { label: p ? p.name : 'Protocol', href: p ? base : '#/' }, { label: 'Variation' }])}
      <span class="anat-region">🍴 Community variation · not reviewed</span>
      <h1>${esc(f.title)}</h1>
      <p class="muted">by ${f.by_user ? '@' + esc(f.by_user) : 'someone'}${f.domain && f.domain_verified ? ' ✓' : ''} · ${f.clones} clone${f.clones !== 1 ? 's' : ''} · a take on <a href="${base}">${esc(p ? p.name : f.problem_id)}</a></p>
      ${f.note ? `<p class="anat-lead">${esc(f.note)}</p>` : ''}
      <div class="section-title">The stack (${cpds.length})</div>
      <div class="fuel-stack-grid">${cpds.map(c => `<div class="fs-item${c.isRx ? ' rx' : ''}"><a class="fs-main" href="#/c/${slug(c.name)}"><b>${esc(c.name)}</b><span class="stars">${starStr(c.stars)}</span></a>${c.isRx ? '<span class="pill rx">Prescription</span>' : ''}</div>`).join('') || '<p class="muted">No compounds.</p>'}</div>
      <div style="margin-top:1.2rem"><button class="cta-primary" id="fork-clone-btn" style="border:none;cursor:pointer">Clone this stack →</button></div>
      <p class="lp-note" style="margin-top:1.2rem">A community-made variation, not the official reviewed protocol. See the <a href="${base}">official ${esc(p ? p.name : '')} protocol →</a></p></div>`;
    const cb = document.getElementById('fork-clone-btn'); if (cb) cb.onclick = () => cloneForkTo(f.id);
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
      <p class="muted">Tell us the problem or goal you want solved. Others can upvote it, and a verified expert can pick it up and build it.</p>
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
    const f = document.getElementById('solve-filter'); if (!f) return;
    f.querySelectorAll('button').forEach(b => b.onclick = () => {
      f.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on');
      const k = b.dataset.k;
      document.querySelectorAll('#solve-list .solve-card').forEach(c => { c.style.display = (k === 'all' || c.dataset.kind === k) ? '' : 'none'; });
      document.querySelectorAll('#solve-list .solve-section').forEach(sec => {
        const any = [...sec.querySelectorAll('.solve-card')].some(c => c.style.display !== 'none');
        sec.style.display = any ? '' : 'none';
      });
    });
  }

  // ---------- Protocol view ----------
  function protocolLoading() {
    return `<div class="empty"><h1>Building your protocol…</h1><p class="muted">Loading movement & food data.</p></div>`;
  }
  // (Removed the old ownership banner — protocols belong to no one; contributing experts are
  // featured via mountProtocolContributors instead.)
  // Contextual leads: the steward sits in the column of their domain (physio→Move, dietitian→
  // Fuel, pharmacist→Stack); a supplement partner sits by Stack, a gym/clinic by Move. No
  // standalone "deals" block — a lead only appears next to the thing it fulfils.
  // Local businesses that have earned a place (backlink-verified partners). No expert "owns"
  // the protocol — the featured experts appear via mountProtocolContributors instead.
  async function mountContextPartners(problem, rc) {
    let partners = [];
    try { partners = await api.partners(problem.category); } catch (e) {}
    const fill = (id, html) => { const el = document.getElementById(id); if (el && !el.innerHTML) el.innerHTML = html; };
    const supp = partners.find(p => p.type === 'supplement');
    if (supp) fill('stack-context', `<a class="ctx-card ext" href="${esc(supp.link)}" target="_blank" rel="noopener nofollow"><span class="ctx-ico">🏬</span><span class="ctx-body"><b>Get these in Singapore</b><small>${esc(supp.name)}${supp.location ? ' · ' + esc(supp.location) : ''}</small></span></a>`);
    const gym = partners.find(p => p.type === 'gym' || p.type === 'physio' || p.type === 'clinic');
    if (gym) fill('move-context', `<a class="ctx-card ext" href="${esc(gym.link)}" target="_blank" rel="noopener nofollow"><span class="ctx-ico">🏋️</span><span class="ctx-body"><b>Train this near you</b><small>${esc(gym.name)}${gym.location ? ' · ' + esc(gym.location) : ''}</small></span></a>`);
    document.querySelectorAll('.ctx-book').forEach(b => b.addEventListener('click', () => { try { if (navigator.sendBeacon) navigator.sendBeacon('/api/track?e=booking&u=' + encodeURIComponent(b.dataset.h)); } catch (e) {} }));
  }
  // This protocol belongs to no one. The experts who contribute most to it (comments + edits)
  // are FEATURED here — attribution. Their profile links out to their work and details.
  async function mountProtocolContributors(problem, rc) {
    const el = document.getElementById('proto-contributors'); if (!el) return;
    let list = []; try { list = await api.protocolContributors(problem.id, rc.id); } catch (e) {}
    // Per-section "who says?" trust stamp — the reviewer credit the "not medical advice" footer can't give.
    if (PHASE2) ['move', 'fuel', 'stack'].forEach(layer => {
      const t = document.getElementById('trust-' + layer); if (!t) return;
      const dom = LAYER_DOMAIN && Object.keys(LAYER_DOMAIN).find(d => LAYER_DOMAIN[d] === layer) ? layer : layer; // guard
      const needed = { move: 'physio', fuel: 'dietitian', stack: 'pharmacist' }[layer];
      const rev = list.find(u => u.domain === needed && u.domain_verified);
      const domLabel = (GRAPH.domains[needed] || {}).label || needed;
      t.innerHTML = rev
        ? `<a class="sec-trust-l ok" href="#/u/${encodeURIComponent(rev.username)}" title="Reviewed & maintained by a verified expert">✓ Reviewed by @${esc(rev.username)}</a>`
        : `<span class="sec-trust-l" title="No verified ${esc(domLabel)} has reviewed this section yet — be the first">🛡️ Open for ${esc(domLabel)} review</span>`;
    });
    if (!list.length) return;
    el.innerHTML = `<div class="pc-title">🏅 Experts who keep this protocol accurate</div>
      <p class="pc-sub">No one owns a protocol — these experts have contributed most to it. See their work.</p>
      <div class="pc-row">${list.map(u => {
        const n = (u.comments || 0) + (u.edits || 0);
        return `<a class="pc-chip pc-chip-l" href="#/u/${encodeURIComponent(u.username)}">
          <span class="pc-u">@${esc(u.username)}</span>${u.domain ? `<span class="sb-dom ${u.domain}">${esc((GRAPH.domains[u.domain] || {}).label || u.domain)}${u.domain_verified ? ' ✓' : ''}</span>` : ''}
          <span class="pc-n">${n} contribution${n !== 1 ? 's' : ''}</span></a>`;
      }).join('')}</div>`;
  }
  // Root-cause governance panel (verified experts + admin): request adding/removing a root
  // cause for this problem, and approve others' requests. Flow: one relevant peer approves a
  // request, then the superadmin gives the final sign-off before it goes live. A freshly-added
  // root cause shows a "being built" note until its protocol is filled in.
  async function mountRcGovernance(problem, rc) {
    const el = document.getElementById('rc-governance'); if (!el) return;
    if (!PHASE2) return; // expert root-cause governance is Phase 2 — not launched
    const canPropose = ME && (ME.role === 'admin' || ME.domain_verified);
    let html = '';
    if (rc._stub) html += `<div class="rc-stub">🧩 This root cause was added by the expert panel — its full protocol is being built. ${canPropose ? 'Add the Move, Fuel and Stack above.' : 'Check back soon, or join the discussion below.'}</div>`;
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
  function outcomeLabel(o) { return o === 'better' ? 'Better' : o === 'same' ? 'No change' : 'Worse'; }
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
  function openOutcome(problem, rc, done) {
    const m = modal(`<div class="outcome-modal">
      <h2>How's your ${esc(problem.name.toLowerCase())}?</h2>
      <p class="muted">Honest answers make this useful for the next person — including “no change”.</p>
      <div class="outcome-btns">
        <button class="oc-choice better" data-o="better"><span class="oc-emo">📈</span> Better</button>
        <button class="oc-choice same" data-o="same"><span class="oc-emo">➖</span> No change</button>
        <button class="oc-choice worse" data-o="worse"><span class="oc-emo">📉</span> Worse</button>
      </div>
      <p class="assess-disclaimer">Your report is anonymous in the results.</p></div>`);
    m.querySelectorAll('[data-o]').forEach(b => b.onclick = async () => {
      const o = b.dataset.o; m.querySelectorAll('[data-o]').forEach(x => x.disabled = true);
      try {
        await api.reportOutcome(problem.id, rc.id, o);
        if (done) done();
        if (o === 'better') { closeModal(); celebrateOutcome(problem, rc); }
        else {
          m.querySelector('.outcome-modal').innerHTML = `<div class="outcome-thanks"><div class="oc-emo big">🙏</div><h2>Thank you — logged.</h2><p class="muted">Honest “${outcomeLabel(o).toLowerCase()}” reports are exactly what keep this ledger trustworthy.</p><button class="exp-btn primary" data-close>Done</button></div>`;
          m.querySelector('[data-close]').onclick = () => closeModal();
        }
      } catch (e) { alert(e.message); m.querySelectorAll('[data-o]').forEach(x => x.disabled = false); }
    });
  }
  function celebrateOutcome(problem, rc) {
    const m = modal(`<div class="outcome-celebrate"><div class="oc-emo big">🎉</div>
      <h2>That's a win worth sharing.</h2>
      <p>You ran the ${esc(problem.name)} protocol and it worked. Share it — someone with the same problem is looking for exactly this.</p>
      <button class="exp-btn primary" data-share>🔗 Copy my result + link</button>
      <button class="exp-link" data-close>Maybe later</button></div>`);
    m.querySelector('[data-share]').onclick = () => shareResult(problem, rc, 'better');
    m.querySelector('[data-close]').onclick = () => closeModal();
  }
  // every shared link carries my ref key so a start from it credits me ("builders brought in")
  function protoShareUrl(problem, rc) { return (location.origin || 'https://rnawiki.com') + '/protocol/' + problem.id + '/' + rc.id + '?ref=' + encodeURIComponent(myRefKey()); }
  async function doShare(title, text, url) {
    try { if (navigator.share) { await navigator.share({ title, text, url }); return; } }
    catch (e) { if (e && e.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(text); toast('Copied — paste it anywhere 🎉'); }
    catch (e) { prompt('Copy this:', text); }
  }
  // bake the live ledger stat into the shared text (only when it's real: ≥3 outcomes) — the credible bit
  function ledgerStatText(ledger) {
    if (!ledger) return '';
    const o = (ledger.better || 0) + (ledger.same || 0) + (ledger.worse || 0);
    if (o < 3) return '';
    return ` — ${Math.round((ledger.better || 0) / o * 100)}% of ${o} people who tried it got better`;
  }
  async function shareResult(problem, rc, outcome) {
    const url = protoShareUrl(problem, rc);
    const verb = outcome === 'better' ? 'it worked' : 'I tried it';
    await doShare('RNAwiki — ' + problem.name, `I ran the RNAwiki ${problem.name} protocol — ${verb}. Here's exactly what I did: ${url}`, url);
  }
  // general "share this protocol" hub — socials text (with stat), plain link, and a blog/embed HTML snippet
  function shareModal(problem, rc, ledger, mine) {
    const url = protoShareUrl(problem, rc);
    const social = `RNAwiki has an evidence-ranked protocol for ${problem.name}${ledgerStatText(ledger)}: ${url}`;
    const blogHtml = `<a href="${url}">Evidence-ranked ${esc(problem.name)} protocol — RNAwiki</a>`;
    const ob = (mine && mine.onboarded) || 0;
    const m = modal(`<div class="share-modal">
      <h2>Share this protocol</h2>
      <p class="muted">The most helpful thing to paste when someone asks about ${esc(problem.name.toLowerCase())} — it carries the real result data.</p>
      <div class="share-preview">${esc(social)}</div>
      <div class="share-actions">
        <button class="exp-btn primary" data-social>${navigator.share ? 'Share' : 'Copy for socials'}</button>
        <button class="exp-btn" data-link>Copy link</button>
        <button class="exp-btn" data-blog>Copy blog HTML</button>
      </div>
      <p class="share-onboard">${ob ? `🌱 You've brought <b>${ob}</b> ${ob === 1 ? 'builder' : 'builders'} in so far. Every share grows the data.` : `Every person who starts from your link makes the results stronger — you'll see how many you've brought in.`}</p></div>`);
    m.querySelector('[data-social]').onclick = () => doShare('RNAwiki — ' + problem.name, social, url);
    m.querySelector('[data-link]').onclick = async () => { try { await navigator.clipboard.writeText(url); toast('Link copied 🔗'); } catch (e) { prompt('Copy link:', url); } };
    m.querySelector('[data-blog]').onclick = async () => { try { await navigator.clipboard.writeText(blogHtml); toast('Blog HTML copied — paste into your site'); } catch (e) { prompt('Copy HTML:', blogHtml); } };
  }
  // Movement heartbeat on the home page. Hidden until there's real activity — never shows a fake or zero count.
  async function mountHomeStat() {
    const el = document.getElementById('home-stat'); if (!el) return;
    const s = await api.stats(); if (!s || !s.experiments) return;
    const n = Number(s.experiments);
    const next = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000].find(m => m > n);
    const bar = next ? `<div class="home-stat-bar"><span style="width:${Math.max(3, Math.round(n / next * 100))}%"></span></div><div class="home-stat-sub">${(next - n).toLocaleString()} to go until the community hits ${next.toLocaleString()}</div>` : '';
    el.innerHTML = `🧪 <b>${n.toLocaleString()}</b> experiment${n === 1 ? '' : 's'} run by the community${s.improved ? ` · <b>${Number(s.improved).toLocaleString()}</b> reported better` : ''}${bar}`;
    el.hidden = false;
  }

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
  // The Telegram-coach CTA appears at every stage of building + tracking.
  function tgCoachRow(problem, rc) {
    return `<div class="plan-tg"><button class="tg-coach" data-tg-pid="${problem.id}" data-tg-rc="${rc.id}">📲 Coach me on Telegram — daily nudges for this</button><p class="tg-sync-note">🔗 Sign in first and your keystone, food, tools &amp; progress sync both ways.</p></div>`;
  }
  function wireTgCoach() {
    app.querySelectorAll('.tg-coach').forEach(b => { if (b._tgWired) return; b._tgWired = true; b.onclick = async () => {
      const orig = b.dataset.tgLabel || b.textContent; b.dataset.tgLabel = orig; b.disabled = true; b.textContent = 'Opening Telegram…';
      try {
        const r = await fetch('/api/telegram/link?pid=' + encodeURIComponent(b.dataset.tgPid) + '&rcid=' + encodeURIComponent(b.dataset.tgRc));
        const j = await r.json().catch(() => ({}));
        b.textContent = (j && j.url) ? '✓ Opened — tap to reopen' : orig;
        if (j && j.url) window.open(j.url, '_blank');
      } catch (e) { b.textContent = orig; }
      b.disabled = false; // always re-enable so it can be opened again
    }; });
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
  // `tg:true` = also available in the Telegram bot; `tgOnly:true` = notification-based, Telegram only.
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
      match: ['sleep', 'insomnia', 'circadian', 'tired', 'wake', 'jet lag'], tg: true, tgOnly: true },
    { id: 'sunlight', icon: '☀️', name: 'Morning-sunlight reminder', kind: 'reminder',
      desc: '10 minutes of morning light sets your clock and lifts daytime mood.',
      how: 'The bot reminds you to get outside within an hour of waking.',
      match: ['mood', 'vitamin d', 'seasonal', 'depress', 'low energy', 'winter'], tg: true, tgOnly: true },
  ];
  function fnById(id) { return PLAN_FUNCTIONS.find(f => f.id === id); }
  function defaultFunctionFor(problem, rc) {
    const hay = [problem.category, problem.name, rc.name, rc.keystone && rc.keystone.one, rc.keystone && rc.keystone.why].filter(Boolean).join(' ').toLowerCase();
    const hit = PLAN_FUNCTIONS.find(f => f.match.some(k => hay.includes(k)));
    return (hit || fnById('hydration')).id; // hydration is the universal fallback
  }
  // ISO-ish week key for weekly counters (year + week number)
  function weekKey() { const d = new Date(); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); return d.toISOString().slice(0, 10); }
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
  function sleepEff7(plan) { const log = plan.log || {}; const tk = today(); let sum = 0, n = 0; for (let i = 0; i < 7; i++) { const d = new Date(); d.setDate(d.getDate() - i); const dl = log[d.toISOString().slice(0, 10)]; if (dl && dl.sleep && dl.sleep.se != null) { sum += dl.sleep.se; n++; } } return { avg: n ? Math.round(sum / n) : 0, nights: n }; }
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
    const ixn = step.kind === 'supp' ? `<div id="build-ixn">${sSel.length > 1 ? interactionPanel((P.stack || []).filter(c => sSel.includes(c.id)), { tiers: ['danger', 'timing'] }) : ''}</div>` : '';
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
      ${tgCoachRow(problem, rc)}`;
    wireTgCoach();
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
      const ix = document.getElementById('build-ixn'); if (ix) ix.innerHTML = cur.length > 1 ? interactionPanel((P.stack || []).filter(c => cur.includes(c.id)), { tiers: ['danger', 'timing'] }) : '';
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
          <div class="fn-head"><div class="fn-name">${esc(f.name)}${isDef ? '<span class="fn-def">★ Matched to your goal</span>' : ''}${f.tgOnly ? '<span class="fn-tg">Telegram only</span>' : ''}</div>
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
          <button class="tg-coach" data-tg-pid="${problem.id}" data-tg-rc="${rc.id}">📲 Coach me on Telegram</button>
        </div>
        <p class="shared-note">You'll get your own copy to track daily.${ME ? '' : ' Create a free account to keep it across devices.'}</p>
      </section>`;
    wireTgCoach();
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
  function consentCardHtml() { return ''; }   // no opt-in card — capture by default; withdrawal lives in "Your data"
  function wireConsentCard() {
    const a = document.getElementById('consent-open'); if (a) a.onclick = openConsentModal;
    const b = document.getElementById('consent-skip'); if (b) b.onclick = () => { localStorage.setItem('rnawiki_consent_dismiss', '1'); const c = document.querySelector('.consent-card'); if (c) c.remove(); };
  }
  function openConsentModal() {
    const m = modal(`<button class="modal-x" data-close aria-label="Close">×</button>
      <h2>Share your progress — anonymously</h2>
      <div class="consent-notice">
        <p>RNAwiki will use your protocol, symptom check-ins and adherence — and, if you add them, blood markers and wearable data — to build <b>anonymous, aggregated</b> insight into which protocols work, for whom.</p>
        <ul><li>Never shown to other users, never sold.</li><li>Aggregates appear only when ≥20 people are in a group — no one is identifiable.</li><li>View, export, delete your data, or withdraw, anytime.</li><li>We never collect NRIC or any national ID.</li></ul>
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
        <p class="muted">So we can show what works for people like you. All optional, all anonymous.</p>
        <div class="pf-grid"><label>Age ${sel('age', AGE_OPTS, p.age_band)}</label><label>Sex ${sel('sex', SEX_OPTS, p.sex)}</label><label>Ethnicity ${sel('eth', ETH_OPTS, p.ethnicity)}</label><label>Height <input id="pf-ht" class="pf-in" type="number" min="80" max="250" value="${p.height_cm != null ? esc(String(p.height_cm)) : ''}" placeholder="cm"></label></div>
        <div class="pf-conds"><span class="pf-conds-h">Any of these? <span class="muted" style="font-weight:400">(optional)</span></span><div class="pf-chips">${COND_OPTS.map(o => `<label class="pf-chip"><input type="checkbox" value="${o[0]}"${(p.conditions || []).includes(o[0]) ? ' checked' : ''}>${esc(o[1])}</label>`).join('')}</div></div>
        <div class="pf-conds"><span class="pf-conds-h">💊 Anything else you take regularly? <span class="muted" style="font-weight:400">(meds &amp; supplements — helps us spot interactions)</span></span><input id="pf-meds" class="pf-in" style="width:100%" value="${esc((p.meds || []).join(', '))}" placeholder="e.g. metformin, omega-3, statin, magnesium"></div>
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
        try { await api.setEmailReminders({ enabled, hour: +hr.value, tzOffset }); hint.textContent = enabled ? `On — we'll email your plan at ${hr.options[hr.selectedIndex].text} daily.` : 'Off.'; if (typeof toast === 'function') toast('Saved ✓'); } catch (e) { hint.textContent = e.message; on.checked = !enabled; }
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
      <div id="ci-stop-wrap" style="display:none"><label class="ci-q">What made you stop? <span class="muted" style="font-weight:400">(this is the most useful thing you can tell us)</span>
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
        if (f.tgOnly) return `<div class="fn-w tgonly"><div class="fn-w-h"><span class="fn-ico">${f.icon}</span><b>${esc(f.name)}</b><span class="fn-tg">Telegram</span></div><p class="fn-w-sub">${esc(f.how)}</p><button class="fn-w-tg tg-coach" data-tg-pid="${esc(tg.pid || '')}" data-tg-rc="${esc(tg.rcid || '')}">📲 Set up in Telegram</button></div>`;
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
      wireTgCoach(); // wire the Telegram set-up buttons (they carry .tg-coach)
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
    const danger = M.supps.length > 1 ? interactionPanel(M.supps, { tiers: ['danger'] }) : '';
    const keystoneCards = M.keystones.map(k => keystoneCardHtml(k.rc, !!dayLog.keystones[k.key], k.key, multi ? k.problem.name : '')).join('');
    const subtitle = multi ? `${M.resolved.length} protocols · ${esc(M.resolved.map(r => r.problem.name).join(' · '))}` : esc(M.resolved[0].rc.name);
    const hasFuel = Object.keys(M.fuel).length > 0; // hide Fuel entirely when no protocol has food targets
    const firstTg = M.protos[0];
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
    const planPanel = `${manage}${firstTg ? tgCoachRow(M.resolved[0].problem, M.resolved[0].rc) : ''}`;
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
    if (hasFuel) mountFuelTracker(null, null, M.fuel);
    mountPlanFunctions();
    wireTgCoach();
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

  async function renderProtocol(pid, rcid, clinicHandle) {
    try { await ensureProtocolData(); } catch (e) { app.innerHTML = `<div class="empty"><h1>Couldn’t load protocol data</h1><p><a href="#/solve">← Back</a></p></div>`; return; }
    const found = findRootCause(pid, rcid);
    if (!found) { app.innerHTML = notFound(); return; }
    const { problem, rc } = found;
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

    // Journey rail — frames the protocol as one connected sequence (Assessed ✓ → Move · Stack · Fuel → Track).
    // Scroll buttons (not #anchors) so the hash router isn't hijacked.
    const journeyRail = `<nav class="journey-rail" aria-label="Your protocol journey">
      <span class="jr-step done">✓ Assessed</span><span class="jr-sep">→</span>
      <button class="jr-step" data-scroll="p-move">Move</button>
      <button class="jr-step" data-scroll="p-stack">Stack</button>
      <button class="jr-step" data-scroll="p-fuel">Fuel</button>
      <span class="jr-sep">→</span>
      <button class="jr-step track" data-scroll="p-fuel">Track daily</button>
    </nav>`;

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
      <div class="start-plan-row"><button class="cta-primary start-plan" id="start-plan">▶ Start building my plan</button><span class="start-plan-note">Browse the movements &amp; supplements, keep what fits you, then track it daily on <b>My Plan</b>.</span></div>
      ${rcSwitch}
      ${rc.keystone ? `<div class="keystone-card">
        <div class="ks-badge">⭐ Your one keystone</div>
        <p class="ks-one">${esc(rc.keystone.one)}</p>
        <p class="ks-why">${esc(rc.keystone.why)}</p>
        <p class="ks-note">The highest-impact, lowest-effort habit for this. Nail this one thing and the rest compounds.</p>
        <button class="tg-coach" data-tg-pid="${problem.id}" data-tg-rc="${rc.id}">📲 Coach me on Telegram — a daily nudge for this</button>
      </div>` : ''}
      <div class="proto-after">
        ${voteFoot(problem.id, rc.id, 'protocol')}
        ${pfaq}
        <div id="goal-comments" class="page-discuss"></div>
        <p class="proto-foot muted">Educational protocol, not medical advice. Nutrient targets are general adult guidance with a stated reason. · <button class="linkbtn" id="cite-proto">Cite this protocol</button></p>
      </div>`;
    mountAdoption(problem, rc);
    mountPublicOutcome(problem, rc);
    if (clinicHandle) mountClinicHeader(clinicHandle, problem, rc);
    else mountSharedProgress(problem, rc);
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
    wireTgCoach();
    const assessBtn = document.getElementById('assess-trigger');
    if (assessBtn) assessBtn.onclick = () => openAssessment(problem);
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
  function stackCard(c) {
    return `<div class="st-card${c.isRx ? ' rx' : ''}">
      <a class="st-main" href="#/c/${slug(c.name)}"><b>${esc(c.name)}</b>
      <span class="stars" title="${esc(c.stars)}/5 · ${STAR_LEGEND}">${starStr(c.stars)}</span></a>
      <div class="st-meta">${approvalPills(c)}${c._synergy ? '<span class="pill syn" title="Shares a pathway with another item in this stack">⚡ Synergy</span>' : ''}</div>
      <p class="st-plain">${esc(mdStrip(c.plain || c.bottom || c.mechanism || '').slice(0, 150))}</p>
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
      <h2>${esc(c.name)} <span class="stars" title="${esc(c.stars)}/5">${starStr(c.stars)}</span></h2>
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
  function today() { return new Date().toISOString().slice(0, 10); }
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
        window.__foodOverrides[data.corrects] = Object.assign(o, { serving: f.serving || undefined, verified: true, corrected: true });
        return;
      }
      const id = 'u' + f.id;
      const fo = Object.assign({ id, name: f.name, serving: f.serving || '', sg_local: true, verified: true, tags: [], hay: (f.name || '').toLowerCase() }, data);
      if (data.photo || data.photo_file_id || data.photo_data) fo.photo = '/api/foodphoto?id=' + f.id; // served via proxy (bot token / inline data stays server-side)
      window.__userFoods[id] = fo;
    });
  }
  // apply an approved correction (if any) over a base food's values
  function withOverride(f) { if (!f) return f; const o = window.__foodOverrides && window.__foodOverrides[f.id]; return o ? Object.assign({}, f, o) : f; }
  function openAddFoodModal(onDone, prefill) {
    if (!ME) return openAuth('login');
    const pf = prefill || {};
    const editing = !!prefill;
    const va = x => (x === 0 || x) ? ` value="${esc(String(x))}"` : '';   // pre-fill helper
    const m = modal(`<div class="partner-modal"><h2>${editing ? 'Fix this food’s nutrition' : 'Add a food'}</h2>
      <p class="muted">${editing ? 'Correct any wrong numbers below. A verified dietitian checks the change, then everyone sees the corrected values.' : 'Add a missing dish — only the name is required, everything else is optional. It goes live instantly for everyone.'} Leave a field blank if you don’t know it. +20 reputation.</p>
      <label>Food name</label><input id="uf-name" placeholder="Chicken rice (roasted)"${va(pf.name)}>
      <label>Serving</label><input id="uf-serv" placeholder="1 plate (~300g)"${va(pf.serving)}>
      <label>Macros (per serving)</label>
      <div class="uf-grid"><input id="uf-kcal" type="number" placeholder="kcal"${va(pf.kcal)}><input id="uf-pro" type="number" placeholder="protein g"${va(pf.protein_g)}><input id="uf-carb" type="number" placeholder="carbs g"${va(pf.carbs_g)}><input id="uf-sug" type="number" placeholder="sugar g"${va(pf.sugar_g)}><input id="uf-fat" type="number" placeholder="fat g"${va(pf.fat_g)}><input id="uf-fib" type="number" placeholder="fiber g"${va(pf.fiber_g)}></div>
      <details class="uf-micros"${editing && (pf.sodium_mg != null || pf.calcium_mg != null || pf.iron_mg != null) ? ' open' : ''}><summary>${editing ? 'Vitamins & minerals' : '＋ Add vitamins & minerals (optional)'}</summary>
        <p class="muted" style="font-size:.8rem;margin:.4rem 0">Per serving — fill in any you know.</p>
        <div class="uf-grid uf-micro-grid">
          <input id="uf-sodium" type="number" placeholder="sodium mg"${va(pf.sodium_mg)}><input id="uf-potassium" type="number" placeholder="potassium mg"${va(pf.potassium_mg)}><input id="uf-calcium" type="number" placeholder="calcium mg"${va(pf.calcium_mg)}>
          <input id="uf-magnesium" type="number" placeholder="magnesium mg"${va(pf.magnesium_mg)}><input id="uf-iron" type="number" placeholder="iron mg"${va(pf.iron_mg)}><input id="uf-zinc" type="number" placeholder="zinc mg"${va(pf.zinc_mg)}>
          <input id="uf-vitc" type="number" placeholder="vitamin C mg"${va(pf.vitamin_c_mg)}><input id="uf-vitd" type="number" placeholder="vitamin D IU"${va(pf.vitamin_d_iu)}><input id="uf-omega3" type="number" placeholder="omega-3 mg"${va(pf.omega3_mg)}>
          <input id="uf-choline" type="number" placeholder="choline mg"${va(pf.choline_mg)}><input id="uf-glycine" type="number" placeholder="glycine g"${va(pf.glycine_g)}>
        </div></details>
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
        const r = await api.submitFood({
          name: v('uf-name'), serving: v('uf-serv'),
          kcal: v('uf-kcal'), protein_g: v('uf-pro'), carbs_g: v('uf-carb'), sugar_g: v('uf-sug'), fat_g: v('uf-fat'), fiber_g: v('uf-fib'),
          sodium_mg: v('uf-sodium'), potassium_mg: v('uf-potassium'), calcium_mg: v('uf-calcium'), magnesium_mg: v('uf-magnesium'), iron_mg: v('uf-iron'), zinc_mg: v('uf-zinc'),
          vitamin_c_mg: v('uf-vitc'), vitamin_d_iu: v('uf-vitd'), omega3_mg: v('uf-omega3'), choline_mg: v('uf-choline'), glycine_g: v('uf-glycine'),
          photo_data: photoData || undefined,
          corrects: pf.id || '',
        });
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
      <p class="fd-serv">${esc(food.serving || '1 serving')}${food.sg_local ? ' · <span class="sg">SG</span>' : ''}${food.verified ? ' · <span class="uf-badge">✓ verified</span>' : ''}</p>
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
  function mountFuelTracker(problem, rc, targetsOverride) {
    const root = document.getElementById('fuel-tracker'); if (!root) return;
    const FO = window.RNAWIKI_FOODS;
    const targets = targetsOverride || (rc && rc.nutrient_targets) || {};
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
        <p class="fuel-contribute">💡 Anyone can help: spotted a missing dish or a wrong nutrition number? <button class="linkbtn" id="add-food-2">Add or fix it →</button> A dietitian checks it, then everyone can log it. You earn +20 points.</p>
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
          hits.innerHTML = matched.map(f => `<div class="food-hit"><button data-food="${f.id}">${f.photo ? `<img class="food-thumb" src="${esc(f.photo)}" alt="" loading="lazy">` : ''}<b>${esc(f.name)}</b>${f.sg_local ? ' <span class="sg">SG</span>' : ''}${f.verified ? ' <span class="uf-badge">✓</span>' : ''}${giBadge(f.gi)} <small>${esc(f.serving || '')}</small></button><button class="food-edit" data-edit="${f.id}" title="Fix this food’s nutrition">✎</button></div>`).join('') || `<span class="no-hit">No match — <button class="linkbtn" id="add-food-inline">add it →</button></span>`;
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
      if (note) { note.hidden = false; note.innerHTML = `✓ Noted, thank you. <b>${n}</b> ${n === 1 ? 'person wants' : 'people want'} snap-a-photo food logging — we build it when enough of you do.`; }
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
  function voteFoot(pid, rcid, layer) {
    return `<div class="vote-foot" data-target="${pid}:${rcid}:${layer}"><span class="vote-q">Did this help you?</span>
      <span class="vote-btns"><button class="vt up" data-v="1">👍 <span class="c">·</span></button>
      <button class="vt down" data-v="-1">👎 <span class="c">·</span></button></span>
      <span class="vote-badge" hidden>⚠ Expert review needed</span></div>`;
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

  // ---------- Tier 2: domain-isolated stewardship hub ----------
  function stewardLoading() { return `<div class="empty"><h1>Loading the Stewardship roundtable…</h1></div>`; }
  async function renderStewardship(pid, rcid) {
    const found = findRootCause(pid, rcid);
    if (!found) { app.innerHTML = notFound(); return; }
    const { problem, rc } = found;
    let proposals = [];
    try { proposals = await api.proposals(pid, rcid); } catch (e) {}
    const dom = GRAPH.domains;
    const LAYERS = [['move', 'physio'], ['fuel', 'dietitian'], ['stack', 'pharmacist']];
    const cols = LAYERS.map(([layer, domainKey]) => {
      const d = dom[domainKey] || {};
      const list = proposals.filter(p => p.layer === layer);
      const items = list.length ? list.map(p => proposalCard(p)).join('') : '<p class="muted sm">No proposals yet in this domain.</p>';
      const canPropose = ME && ME.domain === domainKey;
      return `<div class="steward-col" style="--dc:${d.color || '#888'}">
        <div class="steward-col-h"><b>${d.layer || layer}</b><small>${d.label || domainKey} only</small></div>
        ${items}
        ${canPropose ? `<button class="propose-btn" data-layer="${layer}" data-domain="${domainKey}">+ Propose a ${d.layer} change</button>`
          : `<div class="locked">${ME ? (ME.domain ? `Locked — you are registered as ${dom[ME.domain] ? dom[ME.domain].label : ME.domain}. Only a ${d.label} can edit here.` : 'Set your expert domain below to contribute.') : 'Sign in as a verified expert to contribute.'}</div>`}
      </div>`;
    }).join('');

    app.innerHTML = `${crumbs([{ label: 'Home', href: '#/' }, { label: 'Solve', href: '#/solve' }, { label: problem.name, href: `#/protocol/${pid}/${rcid}` }, { label: 'Stewardship' }])}
      <section class="steward-head">
        <div class="kicker">Protocol stewardship · clinical roundtable</div>
        <h1>${esc(problem.name)} — ${esc(rc.name)}</h1>
        <p>Experts collaborate here, but each is <b>locked to their domain</b>: a physio edits <b class="mv">Move</b>, a dietitian edits <b class="fl">Fuel</b>, a pharmacist/MD edits <b class="st">Stack</b>. A proposal is verified only when <b>another expert in the same domain</b> endorses it. Cross-domain experts can flag conflicts, not approve them. This is the anti-bro-science moat.</p>
      </section>
      ${domainBar()}
      <div class="steward-grid">${cols}</div>`;
    bindStewardship(pid, rcid, problem, rc);
    try { glossarize(app); } catch (e) {}
  }
  function proposalCard(p) {
    const credVerified = !!p.domain_verified;          // credential checked by a maintainer
    const peerEndorsed = p.status === 'endorsed';       // endorsed by a same-domain peer
    const flagged = p.status === 'flagged';
    const canEndorse = ME && ME.domain === p.domain && ME.username !== p.username;
    const canFlag = ME && ME.domain && ME.domain !== p.domain;
    const dname = (GRAPH.domains[p.domain] || {}).label || p.domain;
    return `<div class="prop ${(peerEndorsed || credVerified) ? 'ok' : ''} ${flagged ? 'flag' : ''}" data-id="${p.id}">
      ${credVerified ? `<div class="prop-verified">✓ Verified ${esc(dname)}</div>` : ''}
      ${peerEndorsed ? `<div class="prop-endorsed">✓ Peer-endorsed by another ${esc(dname)}</div>` : ''}
      ${flagged ? `<div class="prop-flagged">⚑ Cross-domain conflict flagged</div>` : ''}
      <p class="prop-change">${esc(p.change)}</p>
      ${p.evidence ? `<a class="prop-ev" href="${esc(p.evidence)}" target="_blank" rel="noopener">🔗 Evidence</a>` : ''}
      <div class="prop-meta"><span>by <b>@${esc(p.username)}</b>${p.credential ? ' · ' + esc(p.credential) : ''}</span>
        <span class="prop-counts">${p.endorsements ? '👥 ' + p.endorsements : ''} ${p.flags ? '⚑ ' + p.flags : ''}</span></div>
      <div class="prop-actions">
        ${canEndorse ? `<button class="p-endorse" data-id="${p.id}">Endorse (same-domain)</button>` : ''}
        ${canFlag ? `<button class="p-flag" data-id="${p.id}">Flag conflict</button>` : ''}
        <a class="p-gh" target="_blank" rel="noopener" href="${ghIssueUrl(p)}">Open as GitHub issue ↗</a>
      </div></div>`;
  }
  function ghIssueUrl(p) {
    const title = `[Steward Proposal] ${p.domain} · ${p.layer}`;
    const body = `**Domain:** ${p.domain}\n**Layer:** ${p.layer}\n**Proposed change:** ${p.change}\n**Evidence:** ${p.evidence || 'n/a'}\n**By:** @${p.username}`;
    const labels = `domain-${p.domain},needs-peer-review`;
    return `https://github.com/Compoundingzero/rnawiki/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}&labels=${encodeURIComponent(labels)}`;
  }
  // ---------- Micro-bounty Board (global stewardship hub) ----------
  const BOUNTY_DOMAIN = { scaling: 'physio', 'food-verify': 'dietitian', safety: 'pharmacist' };
  const BOUNTY_VERB = { scaling: 'Add an easier + harder variation', 'food-verify': 'Verify the macros & micros', safety: 'Add safety / interaction notes' };
  function computeBounties() {
    const out = [], exSeen = new Set(), cpSeen = new Set();
    (GRAPH.problems || []).forEach(p => p.root_causes.forEach(rc => {
      let P; try { P = generateProtocol(rc); } catch (e) { return; }
      (P.strengthen || []).forEach(e => {
        if (e && e.needs_scaling_bounty && !exSeen.has(e.id)) {
          exSeen.add(e.id);
          out.push({ type: 'scaling', domain: 'physio', title: e.name, sub: (e.primaryMuscles || []).join(', '), ctx: `${p.name} → ${rc.name.split('(')[0].trim()}`, ref: e.id });
        }
      });
      (P.stack || []).forEach(c => {
        if (c && !c.watch && !cpSeen.has(c.id)) {
          cpSeen.add(c.id);
          out.push({ type: 'safety', domain: 'pharmacist', title: c.name, sub: c.category || '', ctx: `${p.name} → ${rc.name.split('(')[0].trim()}`, ref: c.id });
        }
      });
    }));
    const FO = window.RNAWIKI_FOODS;
    (FO ? FO.foods : []).filter(f => f.sg_local).forEach(f => {
      out.push({ type: 'food-verify', domain: 'dietitian', title: f.name, sub: f.serving || '', ctx: 'Singapore food database', ref: f.id });
    });
    return out;
  }
  function stewardHubLoading() { return `<div class="empty"><h1>Loading the bounty board…</h1></div>`; }
  async function renderStewardHub() {
    try { await ensureProtocolData(); } catch (e) {}
    const all = computeBounties();
    const dom = GRAPH.domains || {};
    const counts = { physio: 0, dietitian: 0, pharmacist: 0 };
    all.forEach(b => counts[b.domain]++);
    const CAP = 24;
    const tabs = ['all', 'physio', 'dietitian', 'pharmacist'].map(k =>
      `<button class="bnt-tab${k === 'all' ? ' on' : ''}" data-dom="${k}">${k === 'all' ? `All · ${all.length}` : `${(dom[k] || {}).label || k} · ${counts[k]}`}</button>`).join('');
    const card = b => `<div class="bnt-card" data-dom="${b.domain}">
      <div class="bnt-top"><span class="bnt-badge ${b.domain}">${(dom[b.domain] || {}).label || b.domain}</span><span class="bnt-min">~2 min</span></div>
      <b>${BOUNTY_VERB[b.type]}</b>
      <div class="bnt-title">${esc(b.title)}${b.sub ? ` <small>${esc(b.sub)}</small>` : ''}</div>
      <div class="bnt-ctx">Appears in: ${esc(b.ctx)}</div>
      <button class="bnt-solve" data-solve="${esc(b.type)}|${esc(b.ref)}|${esc(b.title)}">Solve & get attribution →</button>
    </div>`;
    // interleave domains so the capped view shows a mix, not 24 of one kind
    const byDom = { physio: [], dietitian: [], pharmacist: [] };
    all.forEach(b => byDom[b.domain].push(b));
    const interleaved = [];
    for (let i = 0; interleaved.length < all.length; i++) {
      let any = false;
      for (const d of ['physio', 'dietitian', 'pharmacist']) { if (byDom[d][i]) { interleaved.push(byDom[d][i]); any = true; } }
      if (!any) break;
    }
    const shown = interleaved.slice(0, CAP);
    app.innerHTML = `${crumbs([{ label: 'Home', href: '#/' }, { label: 'Bounty board' }])}
      <section class="hero" style="text-align:left;padding:1.4rem 0 .6rem">
        <div class="kicker">Expert micro-bounties</div>
        <h1 style="font-size:2rem">Low-hanging fruit. Permanent credit.</h1>
        <p style="margin:.5rem 0 0">Don't write a whole protocol — solve one specific, ~2-minute task inside your exact domain. A physio adds an exercise variation; a dietitian verifies a local dish; a pharmacist adds a safety note. Every solve carries your attribution.</p>
      </section>
      <div class="bnt-tabs">${tabs}</div>
      <div class="bnt-grid">${shown.map(card).join('')}</div>
      ${all.length > CAP ? `<p class="muted" style="text-align:center;margin-top:1rem">Showing ${CAP} of ${all.length} open bounties. Filter by your domain to see yours.</p>` : ''}
      <p class="proto-foot muted">Proposals are domain-isolated: you can only solve bounties in your verified domain, and a same-domain peer must endorse before a change goes live.</p>`;
    app.querySelectorAll('.bnt-tab').forEach(t => t.onclick = () => {
      app.querySelectorAll('.bnt-tab').forEach(x => x.classList.remove('on')); t.classList.add('on');
      const k = t.dataset.dom;
      app.querySelectorAll('.bnt-card').forEach(c => { c.style.display = (k === 'all' || c.dataset.dom === k) ? '' : 'none'; });
    });
    app.querySelectorAll('[data-solve]').forEach(b => b.onclick = () => {
      const [type, ref, title] = b.dataset.solve.split('|');
      openBountyModal({ type, ref, title, domain: BOUNTY_DOMAIN[type] });
    });
  }
  function bountyGhUrl(b, change, evidence, handle) {
    const dom = (GRAPH.domains[b.domain] || {}).label || b.domain;
    const title = `[Micro-bounty] ${b.domain} · ${BOUNTY_VERB[b.type]}: ${b.title}`;
    const body = `**Domain:** ${dom}\n**Task:** ${BOUNTY_VERB[b.type]} for **${b.title}** (ref: ${b.ref})\n**Proposed:** ${change || '(fill in)'}\n**Evidence:** ${evidence || 'n/a'}\n**By:** @${handle || 'anonymous'}`;
    return `https://github.com/Compoundingzero/rnawiki/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}&labels=${encodeURIComponent('micro-bounty,domain-' + b.domain)}`;
  }
  function openBountyModal(b) {
    const dom = GRAPH.domains[b.domain] || { label: b.domain };
    const locked = ME && ME.domain && ME.domain !== b.domain;
    const m = modal(`<div class="bounty-modal">
      <span class="bnt-badge ${b.domain}">${dom.label} only</span>
      <h2>${BOUNTY_VERB[b.type]}</h2>
      <p class="bm-target">${esc(b.title)}</p>
      ${locked ? `<div class="bm-block">Your registered domain is <b>${(GRAPH.domains[ME.domain] || {}).label || ME.domain}</b>. Only a <b>${dom.label}</b> can solve this bounty — this keeps edits inside each expert's circle of competence.</div>`
        : `<label class="bm-l">Your proposed ${b.type === 'scaling' ? 'easier & harder variations' : b.type === 'food-verify' ? 'verified values (per serving)' : 'safety / interaction note'}</label>
        <textarea id="bm-change" rows="3" placeholder="${b.type === 'scaling' ? 'e.g. Easier: Wall sit. Harder: Deficit Bulgarian split squat.' : b.type === 'food-verify' ? 'e.g. 320 kcal, 18g protein, 45g carb…' : 'e.g. Avoid with anticoagulants; GI upset common at >2g.'}"></textarea>
        <label class="bm-l">Evidence link (PubMed / openFDA / official)</label>
        <input id="bm-ev" type="url" placeholder="https://pubmed.ncbi.nlm.nih.gov/…">
        <label class="bm-l">Attribution handle</label>
        <input id="bm-handle" type="text" value="${ME ? esc(ME.username) : ''}" placeholder="@yourhandle">
        <button id="bm-submit" class="cta-primary" style="border:none;cursor:pointer;width:100%;margin-top:.9rem">Submit for peer review →</button>
        <p class="bm-note">Opens a pre-filled GitHub issue tagged for same-domain review. ${ME ? '' : 'Tip: sign in to also post it in-app with your profile.'}</p>`}
    </div>`);
    if (!locked) m.querySelector('#bm-submit').onclick = () => {
      const change = (m.querySelector('#bm-change').value || '').trim();
      const ev = (m.querySelector('#bm-ev').value || '').trim();
      const handle = (m.querySelector('#bm-handle').value || '').trim().replace(/^@/, '');
      window.open(bountyGhUrl(b, change, ev, handle), '_blank', 'noopener');
      closeModal();
    };
  }

  function domainBar() {
    if (!ME) return `<div class="domain-bar muted">Sign in to apply for an expert role and contribute.</div>`;
    const dom = GRAPH.domains;
    // Already granted — no self-service change (an admin owns role assignment).
    if (ME.domain_verified && ME.domain) return `<div class="domain-bar"><span class="domain-you"><b class="dv-ok">✓ Verified ${esc((dom[ME.domain] || {}).label || ME.domain)}</b> — you can improve the ${esc((dom[ME.domain] || {}).layer)} of any protocol and get featured on it. To change roles, contact the admin.</span></div>`;
    // Application pending admin review.
    if (ME.application_status === 'pending') return `<div class="domain-bar"><span class="dv-pending">⏳ Your application for <b>${esc((dom[ME.requested_domain] || {}).label || ME.requested_domain)}</b> is with the admin. Once your credential and rnawiki.com backlink are checked, you’ll get the ✓ and can edit &amp; get featured.</span></div>`;
    // Apply / re-apply.
    const opts = Object.keys(dom).map(k => `<option value="${k}">${dom[k].label} (${dom[k].layer}) — ${(dom[k].roles || []).slice(0, 3).join(', ')}…</option>`).join('');
    const rolesHint = Object.keys(dom).map(k => `<span><b>${dom[k].label}</b> — ${(dom[k].roles || []).join(', ')}</span>`).join('');
    return `<div class="domain-bar">
      <label>Apply for an expert role:
        <select id="domain-sel"><option value="">— choose —</option>${opts}</select></label>
      <input id="cred-inp" placeholder="Your registration / credential (MOH reg. no. / SNRC / registry ID)" value="${esc(ME.credential || '')}">
      <label class="bl-label">Attribution — required: add a link to <b>rnawiki.com</b> from your clinic website or one of your socials, then paste that page here. It’s how we verify you’re real, and how you credit the wiki you contribute to.</label>
      <input id="backlink-inp" placeholder="e.g. https://yourclinic.sg/about  (must contain a link to rnawiki.com)">
      <button id="domain-save">Apply for verification</button>
      ${ME.application_status === 'rejected' ? '<span class="dv-pending">Your last application wasn’t approved — re-apply with a valid credential.</span>' : ''}
      <div class="domain-roles">${rolesHint}</div>
      <p class="muted" style="font-size:.78rem;margin:.4rem 0 0">You can’t assign your own role — an admin verifies your credential and grants it, so every expert badge is earned.</p>
    </div>`;
  }
  function bindStewardship(pid, rcid, problem, rc) {
    const save = document.getElementById('domain-save');
    if (save) save.onclick = async () => {
      const domain = document.getElementById('domain-sel').value;
      const credential = document.getElementById('cred-inp').value;
      const backlink_url = (document.getElementById('backlink-inp') || {}).value || '';
      try { const r = await api.setDomain({ domain, credential, backlink_url }); ME.application_status = r.application_status; ME.requested_domain = r.requested_domain; ME.credential = credential; renderStewardship(pid, rcid); }
      catch (e) { alert(e.message); }
    };
    app.querySelectorAll('.propose-btn').forEach(b => b.onclick = () => openProposeModal(pid, rcid, b.dataset.layer, b.dataset.domain, () => renderStewardship(pid, rcid)));
    app.querySelectorAll('.p-endorse').forEach(b => b.onclick = async () => { try { await api.endorse(b.dataset.id); renderStewardship(pid, rcid); } catch (e) { alert(e.message); } });
    app.querySelectorAll('.p-flag').forEach(b => b.onclick = async () => { const note = prompt('Describe the cross-domain conflict:') || ''; try { await api.flag(b.dataset.id, note); renderStewardship(pid, rcid); } catch (e) { alert(e.message); } });
  }
  // Shared gate: only verified experts of `needed` domain (or admin) may edit. Otherwise show a
  // modal explaining that + a CTA to become a verified expert. Runs onAllowed() when permitted.
  function expertGate(needed, title, onAllowed) {
    const domLabel = (GRAPH.domains[needed] || {}).label || needed;
    if (ME && (ME.role === 'admin' || (ME.domain === needed && ME.domain_verified))) { onAllowed(); return; }
    const m = modal(`<div class="partner-modal"><h2>${esc(title)}</h2>
      <p class="muted">This is kept accurate by <b>verified ${esc(domLabel)} experts</b> — every change is peer-reviewed before it goes live, so what you read here stays trustworthy.</p>
      ${!ME
        ? `<p>Sign in to continue, then apply to become a verified expert.</p>
           <button class="cta-primary" id="es-signin" style="border:none;cursor:pointer;width:100%">Sign in / create account</button>`
        : (ME.domain === needed && !ME.domain_verified
          ? `<p>You’ve applied as a ${esc(domLabel)} — once an admin verifies your credential and rnawiki.com backlink, you’ll be able to edit this.</p>`
          : `<p>You’re signed in as <b>@${esc(ME.username)}</b>${ME.domain ? ` (${esc((GRAPH.domains[ME.domain] || {}).label || ME.domain)})` : ''}. Only verified <b>${esc(domLabel)}</b> experts can edit this.</p>`)}
      <a class="cta-primary" href="#/pros" id="es-become" style="display:block;text-align:center;text-decoration:none;${!ME ? 'background:#fff;color:var(--accent);border:1px solid var(--accent);margin-top:.6rem' : 'border:none'}">Become a verified expert →</a></div>`);
    const si = m.querySelector('#es-signin'); if (si) si.onclick = () => { closeModal(); openAuth('login'); };
    const be = m.querySelector('#es-become'); if (be) be.onclick = () => closeModal();
  }
  function openEditSection(pid, rcid, layer, onDone) {
    const needed = LAYER_DOMAIN[layer] || 'physio';
    expertGate(needed, '✎ Edit the ' + layer + ' section', () => openProposeModal(pid, rcid, layer, ME.role === 'admin' ? needed : ME.domain, onDone || (() => {})));
  }
  // Edit affordance for content pages (exercises, muscles). Verified experts of `domain` submit a
  // correction to the review queue; anyone else gets the become-an-expert gate.
  function openEditContent(what, refLabel, domain) {
    const needed = domain || 'physio';
    expertGate(needed, '✎ Suggest an edit', () => {
      const m = modal(`<div class="partner-modal"><h2>✎ Suggest an edit</h2>
        <p class="muted">Editing <b>${esc(refLabel)}</b>. Your edit is held until a relevant-domain expert or the RNAwiki admin approves it, then it goes live. Describe the correction or addition, and cite a source where you can.</p>
        <textarea id="ec-body" rows="5" maxlength="2000" placeholder="e.g. The primary mover is really the gluteus medius; the cue should be…"></textarea>
        <button class="cta-primary" id="ec-save" style="border:none;cursor:pointer;width:100%;margin-top:.8rem">Submit for review</button></div>`);
      m.querySelector('#ec-save').onclick = async () => {
        const body = (document.getElementById('ec-body') || {}).value || '';
        if (!body.trim()) return alert('Describe the edit first.');
        try { await api.submitFeedback({ body: `[EDIT · ${what}: ${refLabel}] ${body}`, kind: 'wrong', page: location.pathname + location.hash }); closeModal(); alert('Thank you — your edit is queued for review. +2 points.'); }
        catch (e) { alert(e.message); }
      };
    });
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
  function openProposeModal(pid, rcid, layer, domain, onDone) {
    const d = GRAPH.domains[domain] || {};
    const m = modal(`<h2>Propose a ${esc(d.layer || layer)} change</h2>
      <p class="muted sm">As a ${esc(d.label || domain)} you may only edit the <b>${esc(d.layer || layer)}</b> layer. Proposals need a same-domain endorsement to be verified.</p>
      <label class="fld">Proposed change<textarea id="prop-change" rows="4" placeholder="What should change, and why (mechanism / dosing / contraindication)…"></textarea></label>
      <label class="fld">Evidence link (PubMed / openFDA / guideline)<input id="prop-ev" placeholder="https://pubmed.ncbi.nlm.nih.gov/..."></label>
      <div class="modal-actions"><button id="prop-cancel" class="ghost">Cancel</button><button id="prop-submit" class="primary">Submit proposal</button></div>`);
    m.querySelector('#prop-cancel').onclick = closeModal;
    m.querySelector('#prop-submit').onclick = async () => {
      const change = m.querySelector('#prop-change').value.trim();
      const evidence = m.querySelector('#prop-ev').value.trim();
      if (!change) return;
      try { await api.addProposal({ problemId: pid, rootCauseId: rcid, layer, change, evidence }); closeModal(); onDone(); }
      catch (e) { alert(e.message); }
    };
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

  // ---------- Branded patient protocol link: a clinic-branded protocol page (/clinic/:handle/:pid/:rcid) ----------
  async function mountClinicHeader(handle, problem, rc) {
    const el = document.getElementById('clinic-header'); if (!el) return;
    let p; try { p = await api.profile(handle); } catch (e) { return; }
    const s = (p.user && p.user.socials) || {};
    const cta = s.booking_link ? `<a class="cta-primary" href="${esc(s.booking_link)}" target="_blank" rel="noopener nofollow">📅 Book an appointment</a>`
      : (s.website ? `<a class="cta-primary" href="${esc(s.website)}" target="_blank" rel="noopener nofollow">Visit clinic →</a>` : '');
    const dl = (GRAPH.domains[p.user.domain] || {}).label || '';
    el.innerHTML = `<div class="clinic-header">
      <div class="ch-l"><span class="ch-tag">Your home-care protocol from</span>
        <a class="ch-name" href="#/u/${encodeURIComponent(p.user.username)}">@${esc(p.user.username)}</a>
        ${dl ? `<span class="sb-dom ${p.user.domain}">${esc(dl)}${p.user.domain_verified ? ' ✓' : ''}</span>` : ''}</div>
      ${cta}</div>`;
  }

  // ---------- Local partners (DB-approved, backlink-verified) + submit ----------
  const PARTNER_TYPE_ICON = { physio: '🧑‍⚕️', gym: '🏋️', supplement: '💊', clinic: '🏥', dietitian: '🥗' };
  async function mountLocalPartners(problem) {
    const el = document.getElementById('local-partners'); if (!el) return;
    let live = []; try { live = await api.partners(problem.category); } catch (e) {}
    const B = window.RNAWIKI_BUSINESSES;
    const samples = (B && B.businesses ? B.businesses.filter(b => (b.serves || []).includes(problem.category)) : []);
    const list = (live.length ? live : samples).slice(0, 3);
    const card = b => `<a class="lp-card" href="${esc(b.link)}" target="_blank" rel="noopener nofollow">
      <span class="lp-ico">${PARTNER_TYPE_ICON[b.type] || '📍'}</span>
      <span class="lp-body"><b>${esc(b.name)}</b><small>${esc(b.type || '')}${b.location ? ' · ' + esc(b.location) : ''}</small>${b.blurb ? `<span class="lp-blurb">${esc(b.blurb)}</span>` : ''}</span></a>`;
    el.innerHTML = `<div class="section-title">Local partners for ${esc(problem.name)} <span class="lp-tag">Singapore</span></div>
      <div class="lp-grid">${list.map(card).join('') || '<p class="muted">No partners here yet.</p>'}</div>
      <p class="lp-note">${live.length ? 'Backlink-verified local partners.' : (B ? esc(B.disclaimer || '') : '')} <button class="linkbtn" id="lp-list">List your business (free — link exchange) →</button></p>`;
    const lb = document.getElementById('lp-list'); if (lb) lb.onclick = () => openPartnerModal(problem);
  }
  function openPartnerModal(problem) {
    const cats = (GRAPH.categories || []);
    const catField = problem ? '' : `<label>Category to appear in</label><select id="pm-cat">${cats.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}</select>`;
    const m = modal(`<div class="partner-modal"><h2>List your business</h2>
      <p class="muted">${problem ? `Free lead-gen on the <b>${esc(problem.name)}</b> protocol.` : 'Free lead-gen on the protocols in your category.'} The deal: add a link to rnawiki.com on your site, we send you local patients. Remove the link and the listing goes.</p>
      <label>Business name</label><input id="pm-name" placeholder="Core Physio SG">
      <label>Type</label><select id="pm-type"><option value="clinic">Clinic</option><option value="physio">Physio</option><option value="gym">Gym</option><option value="supplement">Supplement store</option><option value="dietitian">Dietitian</option></select>
      ${catField}
      <label>Location</label><input id="pm-loc" placeholder="Tanjong Pagar">
      <label>Your website</label><input id="pm-link" placeholder="https://yourclinic.sg">
      <label>Page where you linked to RNAwiki</label><input id="pm-back" placeholder="https://yourclinic.sg/resources">
      <button class="cta-primary" id="pm-save" style="border:none;cursor:pointer;width:100%;margin-top:1rem">Submit for review</button>
      <p class="bm-note">We verify the backlink, then list you.</p></div>`);
    const v = (id) => (document.getElementById(id) || {}).value || '';
    m.querySelector('#pm-save').onclick = async () => {
      try { await api.submitPartner({ name: v('pm-name'), type: v('pm-type'), location: v('pm-loc'), link: v('pm-link'), backlink_url: v('pm-back'), serves: problem ? problem.category : v('pm-cat') }); closeModal(); alert('Thanks! We’ll verify your backlink and list you shortly.'); }
      catch (e) { alert(e.message); }
    };
  }
  // ---------- Pro dashboard (/pro): the one place experts/businesses manage their presence ----------
  function proLoading() { return `<div class="empty"><h1>Loading your Pro dashboard…</h1></div>`; }
  async function renderPro() {
    if (!PHASE2) {
      app.innerHTML = `${crumbs([{ label: 'Home', href: '#/' }, { label: 'For pros' }])}
        <div class="empty"><h1>The contributor programme is opening soon</h1><p class="muted">We're not accepting expert edits yet — we're assembling a first group of founding clinicians and partner businesses to shape the protocols. Register your interest and you'll be first in.</p>
        <a class="cta-primary" href="#/for-clinicians">Join the founding list →</a></div>`;
      return;
    }
    if (!ME) {
      app.innerHTML = `${crumbs([{ label: 'Home', href: '#/' }, { label: 'Pro' }])}
        <div class="empty"><h1>Pro dashboard</h1><p class="muted">For physios, chiros, dietitians, nutritionists, pharmacists, researchers, gyms & clinics — manage your profile, see your leads, and get your name on the protocols you own.</p>
        <button class="cta-primary" id="pro-signin">Sign in / create account</button></div>`;
      const b = document.getElementById('pro-signin'); if (b) b.onclick = () => openAuth();
      return;
    }
    try { await ensureProtocolData(); } catch (e) {}
    let prof; try { prof = await api.profile(ME.username); } catch (e) { prof = { user: ME, stewarded: [], accepted: [], counts: {} }; }
    const dom = GRAPH.domains[ME.domain] || null;
    const verified = ME.domain_verified;
    const stewarded = (prof.stewarded || []).map(sp => `<div class="pro-row"><a href="#/protocol/${sp.problem_id}/${sp.root_cause_id}">🩺 ${esc(protocolName(sp.problem_id, sp.root_cause_id))}</a> <span class="pro-row-acts">${verified ? `<button class="linkbtn" data-refine="${sp.problem_id}|${sp.root_cause_id}">Refine</button> ` : ''}<button class="linkbtn" data-rx="${sp.problem_id}|${sp.root_cause_id}">Copy patient link</button></span></div>`).join('')
      || '<p class="muted">You haven’t contributed to a protocol yet. Open any protocol in your field and tap <b>Refine</b> — no adoption needed. The more you contribute, the higher you’re featured on it.</p>';
    app.innerHTML = `${crumbs([{ label: 'Home', href: '#/' }, { label: 'Pro dashboard' }])}
      <section class="pro-hd">
        <div class="prof-avatar">${esc(ME.username.slice(0, 1).toUpperCase())}</div>
        <div class="pro-hd-id"><h1>@${esc(ME.username)}</h1>
          <div>${dom ? `<span class="prof-domain ${ME.domain}">${esc(dom.label)}${verified ? ' ✓' : ' · pending'}</span>` : '<span class="muted">No domain set yet</span>'} · <a href="#/u/${encodeURIComponent(ME.username)}">public profile ↗</a></div></div>
        <button class="cta-ghost" id="pro-editprof">Edit profile</button>
      </section>
      <div class="pro-stats">
        <div class="pro-stat"><b>${ME.profile_views || 0}</b><span>profile views</span></div>
        <div class="pro-stat"><b>${ME.booking_clicks || 0}</b><span>booking clicks</span></div>
        <div class="pro-stat"><b>${ME.reputation_points || 0}</b><span>reputation</span></div>
      </div>
      ${!verified ? `<div class="pro-card"><b>Get verified to contribute &amp; get featured for leads</b>${domainBar()}</div>` : ''}
      <div class="pro-card"><div class="section-title">Protocols you’re featured on</div>${stewarded}
        <p class="muted" style="margin-top:.6rem;font-size:.82rem">No one owns a protocol. As a verified ${verified ? esc((dom || {}).label || 'expert') : 'expert'} you can improve the ${verified ? esc((dom || {}).layer || '') + ' layer of' : ''} <b>any</b> protocol in your field — <a href="#/solve">browse protocols →</a>. Your edits feature you on each one, with your profile and booking link.</p></div>
      ${verified ? `<div class="pro-card"><div class="section-title">📣 Share your work</div>
        <p class="muted">Every edit you make gets you featured. When a contribution is approved, post it — we’ll write the caption (with a link to your profile) so people can find all your work. <button class="linkbtn" id="pro-share">Get a share caption →</button></p></div>` : ''}
      <div class="pro-card"><div class="section-title">List your business</div>
        <p class="muted">Gyms, clinics & supplement stores — get featured next to the protocol you fulfil. Strict link exchange. <button class="linkbtn" id="pro-partner">Submit your business →</button></p></div>
      ${(verified && ME.domain === 'dietitian') || ME.role === 'admin' ? '<div class="pro-card" id="food-queue"><div class="section-title">Foods to verify</div><p class="muted">Loading…</p></div>' : ''}`;
    const ep = document.getElementById('pro-editprof'); if (ep) ep.onclick = () => openEditProfile(prof.user || ME);
    const ds = document.getElementById('domain-save');
    if (ds) ds.onclick = async () => { try { const r = await api.setDomain({ domain: document.getElementById('domain-sel').value, credential: document.getElementById('cred-inp').value, backlink_url: (document.getElementById('backlink-inp') || {}).value || '' }); ME.application_status = r.application_status; ME.requested_domain = r.requested_domain; ME.credential = document.getElementById('cred-inp').value; renderPro(); } catch (e) { alert(e.message); } };
    app.querySelectorAll('[data-rx]').forEach(b => b.onclick = () => { const [pid, rcid] = b.dataset.rx.split('|'); const link = (location.origin || 'https://rnawiki.com') + '/clinic/' + encodeURIComponent(ME.username) + '/' + pid + '/' + rcid; if (navigator.clipboard) navigator.clipboard.writeText(link).catch(() => {}); alert('Patient protocol link copied:\n' + link); });
    app.querySelectorAll('[data-refine]').forEach(b => b.onclick = () => {
      const [pid, rcid] = b.dataset.refine.split('|');
      if (!ME.domain) return alert('You need a verified domain to edit.');
      openProposeModal(pid, rcid, DOMAIN_LAYER[ME.domain], ME.domain, () => {});
    });
    const pp = document.getElementById('pro-partner'); if (pp) pp.onclick = () => openPartnerModal(null);
    const psh = document.getElementById('pro-share'); if (psh) psh.onclick = () => openSharePrompt('');
    mountFoodQueue();
  }
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

  // ---------- /gp — emotional, scroll-driven landing page to recruit Singapore GPs (indication of interest) ----------
  // Features shown here are a DEMO of the vision (not yet built) — the goal is to convert doctors to register interest.
  function renderGpLanding() {
    app.innerHTML = `${crumbs([{ label: 'Home', href: '#/' }, { label: 'For GPs' }])}
      <section class="gp-hero">
        <div class="gp-eyebrow">For Singapore GPs &amp; clinics</div>
        <h1 class="gp-h1">You trained for years to <span class="lead">heal people</span>.<br>Not to fight for the next one-off sale.</h1>
        <p class="gp-sub">Turn your expertise into a clinic patients <b>seek out</b> — and programs they <b>stay in</b>. Free, for Singapore's founding clinics.</p>
        <a class="cta-primary gp-cta" href="#gp-apply">Register your clinic's interest →</a>
        <div class="gp-hero-note">Takes 60 seconds · no cost · no obligation</div>
        <div class="gp-scrollhint">Scroll to see how ↓</div>
      </section>

      <section class="gpx" id="gpx-1">
        <div class="gpx-sticky">
          <div class="gpx-art">
            <svg class="gpx-svg" viewBox="0 0 400 210" role="img" aria-label="Your clinic rising above the crowd">
              <defs>
                <radialGradient id="glow1" cx="50%" cy="45%" r="55%"><stop offset="0%" stop-color="#fbbf24" stop-opacity=".6"/><stop offset="100%" stop-color="#fbbf24" stop-opacity="0"/></radialGradient>
                <linearGradient id="beam1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fde68a" stop-opacity="0"/><stop offset="100%" stop-color="#fde68a" stop-opacity=".4"/></linearGradient>
              </defs>
              <line x1="0" y1="182" x2="400" y2="182" stroke="var(--line)" stroke-width="2"/>
              <ellipse class="gpx-glow" cx="200" cy="140" rx="130" ry="78" fill="url(#glow1)"/>
              <path class="gpx-beam" d="M200 0 L146 182 L254 182 Z" fill="url(#beam1)"/>
              <g class="gpx-others" fill="#94a3b8">
                <g transform="translate(24,124)"><rect width="46" height="58" rx="4"/><path d="M-5 0 L23 -18 L51 0 Z" fill="#cbd5e1"/><rect x="18" y="16" width="10" height="10" fill="#f1f5f9"/></g>
                <g transform="translate(88,134)"><rect width="40" height="48" rx="4"/><path d="M-5 0 L20 -15 L45 0 Z" fill="#cbd5e1"/><rect x="15" y="14" width="9" height="9" fill="#f1f5f9"/></g>
                <g transform="translate(270,132)"><rect width="42" height="50" rx="4"/><path d="M-5 0 L21 -16 L47 0 Z" fill="#cbd5e1"/><rect x="16" y="14" width="9" height="9" fill="#f1f5f9"/></g>
                <g transform="translate(330,126)"><rect width="46" height="56" rx="4"/><path d="M-5 0 L23 -18 L51 0 Z" fill="#cbd5e1"/><rect x="18" y="15" width="10" height="10" fill="#f1f5f9"/></g>
              </g>
              <g class="gpx-you">
                <rect x="166" y="94" width="68" height="88" rx="5" fill="#cbd5e1"/>
                <rect class="gpx-you-gold" x="166" y="94" width="68" height="88" rx="5" fill="#f59e0b"/>
                <path d="M160 94 L200 66 L240 94 Z" fill="#cbd5e1"/>
                <path class="gpx-you-gold" d="M160 94 L200 66 L240 94 Z" fill="#d97706"/>
                <rect x="193" y="112" width="14" height="14" rx="2" fill="#fff"/>
                <path d="M200 114 v10 M195 119 h10" stroke="#ef4444" stroke-width="2.6"/>
                <rect x="176" y="140" width="15" height="15" rx="2" fill="#fff" opacity=".7"/><rect x="209" y="140" width="15" height="15" rx="2" fill="#fff" opacity=".7"/>
              </g>
              <g class="gpx-badge" transform="translate(200,60)"><circle r="17" fill="#f59e0b"/><path d="M0 -9 l2.6 5.3 5.8 .8 -4.2 4.1 1 5.8 -5.2 -2.7 -5.2 2.7 1 -5.8 -4.2 -4.1 5.8 -.8 z" fill="#fff"/></g>
              <g class="gpx-cd-wrap" fill="#64748b">
                <circle class="gpx-cd" style="--x:-165" cx="200" cy="198" r="5"/><circle class="gpx-cd" style="--x:-110" cx="200" cy="204" r="5"/><circle class="gpx-cd" style="--x:150" cx="200" cy="198" r="5"/><circle class="gpx-cd" style="--x:95" cx="200" cy="204" r="5"/><circle class="gpx-cd" style="--x:-55" cx="200" cy="200" r="5"/><circle class="gpx-cd" style="--x:55" cx="200" cy="200" r="5"/>
              </g>
            </svg>
          </div>
          <div class="gpx-cap">
            <div class="gpx-cap-l gpx-cap-pain">
              <span class="gpx-name gpx-name-pain">Lost in the crowd</span>
              <h3>You're one clinic among dozens.</h3>
              <p>Patients scroll straight past. There's nothing to pick you for but price. You did the training, you have the skill — and still, you're invisible.</p>
            </div>
            <div class="gpx-cap-l gpx-cap-fix">
              <span class="gpx-name gpx-name-fix">The name they trust</span>
              <h3>Now you're the name they <span class="lead">seek out</span>.</h3>
              <p>Your reliable contributions lift your clinic to the top of what patients see nearby. They choose you for credibility — not the cheapest price.</p>
            </div>
          </div>
          <div class="gpx-cue">keep scrolling ↓</div>
        </div>
      </section>

      <section class="gpx" id="gpx-2">
        <div class="gpx-sticky">
          <div class="gpx-art">
            <svg class="gpx-svg" viewBox="0 0 400 210" role="img" aria-label="One-off patients versus a returning program">
              <g class="gpx-s2pain">
                <line x1="16" y1="105" x2="384" y2="105" stroke="var(--line)" stroke-width="2" stroke-dasharray="3 7"/>
                <path d="M368 98 l12 7 -12 7" fill="none" stroke="var(--faint)" stroke-width="2"/>
                <g fill="#64748b"><circle cx="70" cy="105" r="10"/><circle cx="170" cy="105" r="10" opacity=".8"/><circle cx="280" cy="105" r="10" opacity=".45"/><circle cx="360" cy="105" r="10" opacity=".12"/></g>
                <text x="200" y="165" text-anchor="middle" class="gpx-lbl">consult → prescribe → gone</text>
              </g>
              <g class="gpx-s2fix">
                <circle class="gpx-stag" style="--d:.26" cx="200" cy="100" r="62" fill="none" stroke="var(--line)" stroke-width="3"/>
                <circle class="gpx-arc" cx="200" cy="100" r="62" fill="none" stroke="#22c55e" stroke-width="5" stroke-linecap="round" pathLength="100" stroke-dasharray="100" transform="rotate(-90 200 100)"/>
                <g class="gpx-stag" style="--d:.3" transform="translate(182,82)"><rect width="36" height="34" rx="4" fill="#16a34a"/><rect x="13" y="8" width="10" height="10" rx="2" fill="#fff"/><path d="M18 10 v6 M15 13 h6" stroke="#16a34a" stroke-width="2.2"/></g>
                <g class="gpx-orbit"><circle class="gpx-stag" style="--d:.44" cx="200" cy="38" r="8" fill="#16a34a"/><circle class="gpx-stag" style="--d:.54" cx="200" cy="38" r="8" fill="#16a34a" transform="rotate(120 200 100)"/><circle class="gpx-stag" style="--d:.64" cx="200" cy="38" r="8" fill="#16a34a" transform="rotate(240 200 100)"/></g>
                <text x="200" y="190" text-anchor="middle" class="gpx-lbl gpx-lbl-good gpx-stag" style="--d:.7">week 3 of 12 · your program</text>
              </g>
            </svg>
          </div>
          <div class="gpx-cap">
            <div class="gpx-cap-l gpx-cap-pain">
              <span class="gpx-name gpx-name-pain">Here today, gone forever</span>
              <h3>Consult. Prescribe. Gone.</h3>
              <p>Every patient is a one-time transaction. They walk out and you may never see them again. Tomorrow you start back at zero. Again.</p>
            </div>
            <div class="gpx-cap-l gpx-cap-fix">
              <span class="gpx-name gpx-name-fix">Patients who stay</span>
              <h3>They join <span class="lead">your</span> program — and stay.</h3>
              <p>From the protocols you maintain, patients enrol in programs you built — buying supplements and prescriptions through your clinic, month after month.</p>
            </div>
          </div>
          <div class="gpx-cue">keep scrolling ↓</div>
        </div>
      </section>

      <section class="gpx" id="gpx-3">
        <div class="gpx-sticky">
          <div class="gpx-art">
            <svg class="gpx-svg" viewBox="0 0 400 210" role="img" aria-label="A squeezed margin lifted by an alliance">
              <g class="gpx-lines" stroke="#22c55e" stroke-width="2.5" fill="none" stroke-linecap="round">
                <line class="gpx-ln" style="--d:.2" x1="200" y1="72" x2="86" y2="34" pathLength="100"/><line class="gpx-ln" style="--d:.3" x1="200" y1="72" x2="330" y2="40" pathLength="100"/><line class="gpx-ln" style="--d:.4" x1="200" y1="72" x2="60" y2="96" pathLength="100"/><line class="gpx-ln" style="--d:.5" x1="200" y1="72" x2="346" y2="100" pathLength="100"/><line class="gpx-ln" style="--d:.6" x1="200" y1="72" x2="130" y2="122" pathLength="100"/><line class="gpx-ln" style="--d:.7" x1="200" y1="72" x2="280" y2="124" pathLength="100"/>
              </g>
              <g class="gpx-sats" fill="#16a34a">
                <g transform="translate(86,34)" class="gpx-sat" style="--d:.24"><circle r="15" fill="#dcfce7"/><text x="0" y="5" text-anchor="middle" font-size="15">🏥</text></g>
                <g transform="translate(330,40)" class="gpx-sat" style="--d:.34"><circle r="15" fill="#dcfce7"/><text x="0" y="5" text-anchor="middle" font-size="15">🏥</text></g>
                <g transform="translate(60,96)" class="gpx-sat" style="--d:.44"><circle r="15" fill="#dcfce7"/><text x="0" y="5" text-anchor="middle" font-size="15">🏥</text></g>
                <g transform="translate(346,100)" class="gpx-sat" style="--d:.54"><circle r="15" fill="#dcfce7"/><text x="0" y="5" text-anchor="middle" font-size="15">🏥</text></g>
                <g transform="translate(130,122)" class="gpx-sat" style="--d:.64"><circle r="15" fill="#dcfce7"/><text x="0" y="5" text-anchor="middle" font-size="15">🏥</text></g>
                <g transform="translate(280,124)" class="gpx-sat" style="--d:.74"><circle r="15" fill="#dcfce7"/><text x="0" y="5" text-anchor="middle" font-size="15">🏥</text></g>
              </g>
              <g transform="translate(200,72)"><circle r="26" class="gpx-center-halo" fill="#22c55e" opacity="0"/><circle r="21" fill="#16a34a"/><rect x="-9" y="-9" width="18" height="18" rx="3" fill="#fff"/><path d="M0 -6 v12 M-6 0 h12" stroke="#16a34a" stroke-width="3"/></g>
              <text x="200" y="168" text-anchor="middle" class="gpx-lbl">Your margin on a box of medicine</text>
              <g transform="translate(70,178)">
                <rect x="0" y="0" width="260" height="20" rx="6" fill="#fecaca"/>
                <rect class="gpx-keep" x="0" y="0" width="260" height="20" rx="6" fill="#22c55e"/>
              </g>
            </svg>
          </div>
          <div class="gpx-cap">
            <div class="gpx-cap-l gpx-cap-pain">
              <span class="gpx-name gpx-name-pain">The margin trap</span>
              <h3>The medicine sells. You barely keep a cent.</h3>
              <p>Drug costs devour the margin on every box. You became a doctor to change lives — and the business turned you into a dispensary running on fumes.</p>
            </div>
            <div class="gpx-cap-l gpx-cap-fix">
              <span class="gpx-name gpx-name-fix">Stronger together</span>
              <h3>A network that <span class="lead">lifts every clinic</span>.</h3>
              <p>The alliance buys in bulk, so your cost of goods drops — and clinics share stock through consignment. Your margin grows. And it costs you nothing.</p>
            </div>
          </div>
          <div class="gpx-cue">keep scrolling ↓</div>
        </div>
      </section>

      <section class="gpj" id="gpj">
        <div class="gpj-head"><div class="gp-eyebrow">How it works — from your chair</div><h2>You already have the expertise.<br>Here's how it <span class="lead">compounds</span>.</h2></div>
        <div class="gpj-track">
          <div class="gpj-line"><div class="gpj-fill" id="gpj-fill"></div></div>
          <div class="gpj-steps">
            <div class="gpj-step"><div class="gpj-node">✍️</div><div class="gpj-body"><h4>You share what you know</h4><p>Review and sharpen the clinical information in your field — a few minutes when you have them. Your name and clinic ride on every trusted contribution.</p></div></div>
            <div class="gpj-step"><div class="gpj-node">⭐</div><div class="gpj-body"><h4>Trust compounds</h4><p>Every patient your expertise helps adds to your clinic's standing. Credibility you build once keeps working for you.</p></div></div>
            <div class="gpj-step"><div class="gpj-node">📍</div><div class="gpj-body"><h4>Your clinic gets featured</h4><p>You rise on “Top trusted clinics near you.” The people in your neighbourhood discover you first — for credibility, not price.</p></div></div>
            <div class="gpj-step"><div class="gpj-node">🧬</div><div class="gpj-body"><h4>You build the programs</h4><p>Turn the reliable protocols you maintain into programs patients enrol in — your name, your care, your standards.</p></div></div>
            <div class="gpj-step"><div class="gpj-node">🔁</div><div class="gpj-body"><h4>Patients stay — and buy through you</h4><p>Supplements and prescriptions flow through your clinic, month after month. A recurring relationship that compounds — all of it free to you.</p></div></div>
          </div>
        </div>
      </section>

      <section class="gp-aspire reveal">
        <h2>Imagine being the clinic your neighbourhood <span class="lead">names first</span>.</h2>
        <p>Not the cheapest. Not the closest. The one they <b>trust</b> — with patients who stay, and the respect you earned the day you qualified.</p>
      </section>

      <section class="gp-faq reveal">
        <div class="section-title center">Straight answers</div>
        <div class="gp-faq-list">
          <details class="gp-q"><summary>Is it really free?</summary><p>Completely. No fees, no lock-in, no card. We grow only when your clinic does.</p></details>
          <details class="gp-q"><summary>What's the catch?</summary><p>There isn't one. We're building the trusted health layer for Singapore — and credible GPs are what make it real. Featuring your clinic is simply how patients find that credibility.</p></details>
          <details class="gp-q"><summary>How much of my time does this take?</summary><p>As little as you like. Review the occasional protocol in your field when you have a spare moment — even small, trusted contributions lift your clinic.</p></details>
          <details class="gp-q"><summary>Do I have to sell supplements?</summary><p>No obligation at all. The programs and purchases are opt-in — a new recurring revenue stream if you want it, quietly ignored if you don't.</p></details>
          <details class="gp-q"><summary>Is my information safe?</summary><p>Your details are used solely to contact you about the founding network. Never sold, never shared.</p></details>
        </div>
      </section>

      <section class="gp-join" id="gp-apply">
        <div class="gp-join-inner">
          <div class="gp-join-head">
            <div class="gp-eyebrow">Founding clinics · Singapore</div>
            <h2>Be one of the <span class="lead">first clinics we feature</span>.</h2>
            <p>We're hand-picking the founding GPs to shape this network — and to be featured first when patients start searching. It's free, with no obligation. Tell us about your clinic and we'll reach out personally.</p>
          </div>
          <div class="gp-form-card">
            <form id="gp-form" class="gp-form">
              <div class="gp-2col"><label>Your name<input name="name" required placeholder="Dr …"></label><label>Clinic name<input name="clinic" placeholder="e.g. Tan Family Clinic"></label></div>
              <div class="gp-2col"><label>Email<input name="email" type="email" required placeholder="you@clinic.sg"></label><label>Phone <span class="opt">optional</span><input name="phone" placeholder="+65 …"></label></div>
              <div class="gp-2col"><label>Area / region<input name="area" placeholder="e.g. Tampines"></label><label>MCR no. <span class="opt">optional</span><input name="mcr" placeholder="M…"></label></div>
              <label>Anything you'd like us to know? <span class="opt">optional</span><textarea name="message" rows="2" placeholder="What would make this worth your time?"></textarea></label>
              <div class="auth-err" id="gp-err" hidden></div>
              <button type="submit" class="cta-primary lg" id="gp-submit">Register my interest →</button>
              <p class="gp-fineprint">🔒 Singapore-registered GPs &amp; clinics only. Your details are used solely to contact you about the founding network — never sold or shared.</p>
            </form>
            <div class="gp-done" id="gp-done" hidden><div class="gp-done-ic">🎉</div><h3>You're on the founding list.</h3><p>Thank you — we'll reach out personally. Watch your inbox.</p></div>
          </div>
        </div>
      </section>`;
    bindGpLanding();
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
  function bindGpLanding() {
    revealOnScroll();
    initGpScroll('gpx-1'); initGpScroll('gpx-2'); initGpScroll('gpx-3'); initGpJourney('gpj');
    const form = document.getElementById('gp-form'); if (!form) return;
    const err = document.getElementById('gp-err'), btn = document.getElementById('gp-submit');
    form.onsubmit = async (e) => {
      e.preventDefault(); err.hidden = true; btn.disabled = true; btn.textContent = 'Sending…';
      const b = Object.fromEntries(new FormData(form));
      const note = [b.clinic && ('Clinic: ' + b.clinic), b.area && ('Area: ' + b.area), b.phone && ('Phone: ' + b.phone), b.mcr && ('MCR: ' + b.mcr), b.message].filter(Boolean).join(' · ');
      try {
        await api.submitClinicianInterest({ name: b.name, email: b.email, discipline: 'GP', note });
        form.hidden = true; const done = document.getElementById('gp-done'); if (done) done.hidden = false;
      } catch (ex) { err.textContent = ex.message; err.hidden = false; btn.disabled = false; btn.textContent = 'Register my interest'; }
    };
  }

  // ---------- /pros — the marketing landing page for professionals (separate from the dashboard) ----------
  function renderPros() {
    app.innerHTML = `${crumbs([{ label: 'Home', href: '#/' }, { label: 'For professionals' }])}
      <section class="hero funnel-hero reveal in" style="padding-top:2rem">
        <div class="kicker">For clinicians &amp; local businesses</div>
        <h1>Contribute your expertise.<br><span class="lead">Get featured. Get local leads.</span></h1>
        <p class="hero-lead">RNAwiki is where people come to fix a problem or reach a goal. No one owns a protocol — but the verified experts who keep each one accurate get featured on it, with a link to their profile and booking. Contribute in your field and the leads come to you.</p>
        <div class="how-cta"><a class="cta-primary" href="#/for-clinicians">Join the founding list →</a></div>
      </section>
      <section class="scrolly" id="scrolly-pros">
        <div class="scrolly-track">
          <div class="scrolly-copy">
            <div class="section-title">How it works for you</div>
            <div class="sy-step on" data-step="0"><span class="s3-tag mv">Step 1 · Get verified</span><h3>Apply once</h3><p>Prove your credential and link us from your site. We verify you as a movement, nutrition, or pharmacology expert — every badge is earned, never self-assigned.</p></div>
            <div class="sy-step" data-step="1"><span class="s3-tag st">Step 2 · Contribute</span><h3>Improve a protocol</h3><p>Edit a condition in your field — correct the movement, nutrition or compounds. The more you contribute, the higher you’re featured on that protocol, with your profile and booking link.</p></div>
            <div class="sy-step" data-step="2"><span class="s3-tag fl">Step 3 · Get leads</span><h3>Track &amp; convert</h3><p>See who’s viewing your profile and clicking through to book. Every protocol you’re featured on links straight to your clinic — a high-authority backlink that lifts <b>your</b> Google ranking. And you can hand each patient a clean, branded protocol page to take home and share.</p></div>
          </div>
          <div class="scrolly-stage">
            <div class="phone"><div class="phone-notch"></div><div class="phone-screen">
              <div class="sy-frame on" data-frame="0">
                <div class="pf-eg">Example</div>
                <div class="pf-verify"><div class="pf-av">🩺</div><b>Dr. Tan, Physiotherapist</b><small>AHPC-registered · linked from clinic site</small><span class="pf-badge">✓ Verified · Movement</span></div>
                <div class="pf-cap">Credential + backlink checked by an admin</div>
              </div>
              <div class="sy-frame" data-frame="1">
                <div class="pf-clinic"><div class="pf-av">🩺</div><div><b>Dr Tan · The Knee Clinic</b><small>Top contributor · Patellofemoral pain</small></div></div>
                <button class="pf-book">Book an appointment</button>
                <div class="pf-proto2"><span class="pf-l mv">💪 Move</span> you edited the movement</div>
                <div class="pf-cap">Your profile is featured on the protocol</div>
              </div>
              <div class="sy-frame" data-frame="2">
                <div class="pf-track-h">Your last 30 days</div>
                <div class="pf-nut"><span>Views</span><div class="sy-bar"><i style="--w:88%"></i></div><em>1.2k</em></div>
                <div class="pf-nut"><span>Clicks</span><div class="sy-bar"><i style="--w:54%"></i></div><em>96</em></div>
                <div class="pf-nut"><span>Rep</span><div class="sy-bar"><i style="--w:72%"></i></div><em>340</em></div>
                <div class="pf-cap">Real leads — plus a backlink to your clinic that lifts your ranking</div>
              </div>
            </div></div>
            <div class="sy-dots"><i data-dot="0" class="on"></i><i data-dot="1"></i><i data-dot="2"></i></div>
          </div>
        </div>
      </section>
      <section class="trust reveal">
        <div class="section-title center">Why it’s worth your time</div>
        <div class="pros-grid">
          <div class="pros-card"><b>🩺 Free lead-gen</b><p>Your clinic in front of high-intent locals — the exact people already looking to fix what you treat.</p></div>
          <div class="pros-card"><b>🔗 A backlink that lifts your SEO</b><p>Your public profile and every protocol you’re featured on link out to your clinic — high-authority backlinks that lift your own Google ranking.</p></div>
          <div class="pros-card"><b>📋 A branded protocol page</b><p>Stop printing handouts. Give each patient a branded link to their exact home protocol — your name and booking button on top — that they can save and share.</p></div>
          <div class="pros-card"><b>🏅 Authority &amp; attribution</b><p>Every edit and answer carries your name, forever — a public, verifiable record of your clinical work.</p></div>
        </div>
      </section>
      <div id="pros-leaderboard" class="reveal"></div>
      <section class="pro-strip reveal">
        <div class="ps-copy"><h2>Ready?</h2><p>Physio · chiro · dietitian · nutritionist · pharmacist · researcher · gym · clinic — it’s free.</p></div>
        <a class="cta-ghost" href="#/for-clinicians">Join the founding list →</a>
      </section>`;
    revealOnScroll();
    initScrolly('scrolly-pros');
    (async () => {
      let d; try { d = await api.contributors(); } catch (e) { return; }
      const top = (d.top || []).filter(x => x.reputation_points > 0);
      const el = document.getElementById('pros-leaderboard');
      if (el && top.length) el.innerHTML = `<div class="section-title center">Experts already building here</div>
        <div class="lb-row">${top.map((u, i) => `<a class="lb-card" href="#/u/${encodeURIComponent(u.username)}"><span class="lb-rank">#${i + 1}</span><span class="lb-name">@${esc(u.username)}</span><span class="lb-pts">✦ ${u.reputation_points}</span></a>`).join('')}</div>`;
    })();
  }

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
  function setPageMeta(parts) {
    const site = SITE_NAME;
    let title = 'RNAwiki — translate the code of human performance into real results';
    let desc = 'DNA is the blueprint; RNA is the builder. Turn the foundational code of strength, health and longevity into protocols you can use today — ranked by human evidence, in plain English.';
    const t = (s) => `${s} · ${site}`;
    if (parts[0] === 'c' && bySlug[parts[1]]) { const c = bySlug[parts[1]]; title = t(`${c.name}: dosage, evidence & uses`); desc = (c.plain || c.bottom || c.mechanism || '').slice(0, 155); }
    else if (parts[0] === 'goal' && goalById[parts[1]]) { const g = goalById[parts[1]]; title = t(`${g.label} — what actually helps`); desc = `Compounds that help you ${g.label.toLowerCase()}, ranked by strength of human evidence. Plain English, honest verdicts.`; }
    else if (parts[0] === 'protocol' && problemById[parts[1]]) { const p = problemById[parts[1]]; const rc = p.root_causes.find(r => r.id === parts[2]) || p.root_causes[0]; title = t(`${p.name}${parts[3] === 'stewardship' ? ' — expert stewardship' : ' protocol — Move, Fuel & Stack'}`); desc = `${p.name} (${rc.name}): the exercises to fix it, foods to fuel it, and evidence-ranked compounds — a full protocol. Not medical advice.`; }
    else if (parts[0] === 'target' && targetBySym[tkey(decodeURIComponent(parts[1] || ''))]) { const tg = targetBySym[tkey(decodeURIComponent(parts[1]))]; title = t(`${tg.sym} — the molecular target and every compound that hits it`); desc = `${tg.sym}: ${(tg.name || '').slice(0, 120)}`; }
    else if (parts[0] === 'pathway' && D.pathways[+parts[1]]) { title = t(`${D.pathways[+parts[1]].shortLabel} pathway explained`); }
    else if (parts[0] === 'compare' && parts[1]) { const i = parts[1].indexOf('-vs-'); const A = i >= 0 && bySlug[parts[1].slice(0, i)], B = i >= 0 && bySlug[parts[1].slice(i + 4)]; if (A && B) { title = t(`${A.name} vs ${B.name} — which works better?`); desc = `${A.name} vs ${B.name}: human evidence, mechanism, safety and availability compared. Plain English, honest verdict.`; } }
    else if (parts[0] === 'solve') { title = t('Solve a problem or reach a goal — protocol engine'); desc = 'Tell us the problem or goal. Get a full Move · Fuel · Stack protocol for the root cause.'; }
    else if (parts[0] === 'stewardship') { title = t('Expert micro-bounties — the bounty board'); desc = 'Solve a 2-minute clinical micro-bounty in your domain — add an exercise variation, verify a local dish, or add a safety note. Permanent attribution.'; }
    else if (parts[0] === 'pros') { title = t('For health professionals — contribute, get featured, get leads'); desc = 'Physiotherapists, dietitians, nutritionists and pharmacists: improve the protocols in your field and get featured on them — profile, booking link and local leads. Free.'; }
    else if (parts[0] === 'pro') { title = t('Pro dashboard — contribute & get featured on RNAwiki'); desc = 'For clinicians and businesses: improve protocols, track your leads, and manage your branded patient protocol links on RNAwiki.'; }
    else if (parts[0] === 'u' && parts[1]) { title = t('@' + parts[1] + ' — contribution portfolio'); desc = `@${parts[1]}'s clinical contribution portfolio on RNAwiki — reputation, accepted edits, and professional links.`; }
    else if (parts[0] === 'clinic' && problemById[parts[2]]) { const p = problemById[parts[2]]; title = t(`${p.name} — home-care protocol from @${parts[1]}`); desc = `A clinician-issued ${p.name} home-care protocol from @${parts[1]} on RNAwiki — movement, stack, and Singapore food targets.`; }
    document.title = title;
    let m = document.querySelector('meta[name="description"]'); if (!m) { m = document.createElement('meta'); m.setAttribute('name', 'description'); document.head.appendChild(m); }
    m.setAttribute('content', desc);
    let l = document.querySelector('link[rel="canonical"]'); if (!l) { l = document.createElement('link'); l.setAttribute('rel', 'canonical'); document.head.appendChild(l); }
    l.setAttribute('href', location.origin + '/' + parts.join('/'));
  }
  function route() {
    const raw = currentRoute();
    const [pathPart, queryPart] = raw.split('?');
    // shared stack link
    if (queryPart && queryPart.indexOf('ids=') === 0) { const ids = queryPart.slice(4).split(',').filter(Boolean); if (ids.length) setStack(ids); }
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
    else if (parts[0] === 'muscle') html = musclePage(parts[1]);
    else if (parts[0] === 'exercise') html = '<div class="empty"><h1>Loading exercise…</h1></div>';
    else if (parts[0] === 'fork') html = '<div class="empty"><h1>Loading variation…</h1></div>';
    else if (parts[0] === 'energy') html = energyPage(parts[1]);
    else if (parts[0] === 'physiology') html = physiologyPage(parts[1]);
    else if (parts[0] === 'az') html = azPage();
    else if (parts[0] === 'compare') html = parts[1] ? renderComparison(parts[1]) : comparePage();
    else if (parts[0] === 'stack') html = stackPage();
    else if (parts[0] === 'fuel') html = fuelPage(parts[1], parts[2]);
    else if (parts[0] === 'plan') html = planLoading();
    else if (parts[0] === 'progress') html = planLoading();
    else if (parts[0] === 'legend') html = legendPage();
    else if (parts[0] === 'for-clinicians') html = forClinicians();
    else if (parts[0] === 'about') { history.replaceState(null, '', '/'); parts.length = 0; html = home(); }
    else if (['pros', 'pro', 'stewardship', 'contributors', 'for-clinicians', 'clinic', 'u'].indexOf(parts[0]) >= 0) { history.replaceState(null, '', '/'); parts.length = 0; html = home(); } // retired expert/community system → home
    else if (parts[0] === 'solve') html = solvePage();
    else if (parts[0] === 'stewardship') html = stewardHubLoading();
    else if (parts[0] === 'pro') html = proLoading();
    else if (parts[0] === 'pros') html = '<div class="empty"><h1>Loading…</h1></div>';
    else if (parts[0] === 'u' && parts[1]) html = profileLoading(parts[1]);
    else if (parts[0] === 'contributors') html = contribLoading();
    else if (parts[0] === 'admin') html = adminLoading();
    else if (parts[0] === 'protocol') html = protocolLoading();
    else if (parts[0] === 'clinic' && parts[3]) html = protocolLoading();
    else if (parts[0] === 's' && parts[1]) html = '<div class="empty"><h1>Loading shared protocol…</h1></div>';
    else html = notFound();
    app.innerHTML = html; window.scrollTo(0, 0);
    setPageMeta(parts);
    closeGlossPop();
    try { glossarize(app); } catch (e) { }
    const nav = document.querySelector('.topnav'); if (nav) nav.classList.remove('open');
    if (!parts.length) { bindHome(); renderHomeComments(); mountHomeStat(); }
    if (parts[0] === 'solve') bindSolve();
    if (parts[0] === 'for-clinicians') bindForClinicians();
    if (parts[0] === 'fuel') bindFuel(parts[1], parts[2]);
    if (parts[0] === 'plan') renderPlan();
    if (parts[0] === 'progress') renderProgress();
    if (parts[0] === 'stewardship') renderStewardHub();
    if (parts[0] === 'pro') renderPro();
    if (parts[0] === 'pros') renderPros();
    if (parts[0] === 'gp') renderGpLanding();
    if (parts[0] === 'u' && parts[1]) renderProfile(parts[1]);
    if (parts[0] === 'contributors') renderContributors();
    if (parts[0] === 'admin') renderAdmin();
    if (parts[0] === 'protocol') renderProtocol(parts[1], parts[2]);
    if (parts[0] === 'clinic' && parts[3]) renderProtocol(parts[2], parts[3], parts[1]);
    if (parts[0] === 's' && parts[1]) renderSharedPlan(parts[1]);
    // community discussion on compound + pathway pages
    if (parts[0] === 'c' && bySlug[parts[1]]) renderComments('c:' + bySlug[parts[1]].id, bySlug[parts[1]].name);
    if (parts[0] === 'pathway' && D.pathways[+parts[1]]) renderComments('pw:' + (+parts[1]), D.pathways[+parts[1]].shortLabel || 'this pathway');
    if (parts[0] === 'muscle' && muscleById[parts[1]]) { renderComments('mu:' + parts[1], muscleById[parts[1]].name); const mb = document.getElementById('mu-edit'); if (mb) mb.onclick = () => openEditContent('muscle', muscleById[parts[1]].name, 'physio'); }
    if (parts[0] === 'exercise' && parts[1]) mountExercise(parts[1]);
    if (parts[0] === 'fork' && parts[1]) mountForkPage(parts[1]);
    if (parts[0] === 'energy' && energyById[parts[1]]) renderComments('en:' + parts[1], energyById[parts[1]].name);
    if (parts[0] === 'physiology' && physioById[parts[1]]) renderComments('ph:' + parts[1], physioById[parts[1]].name);
  }
  // intercept internal link clicks -> pushState navigation (keeps #/ links working)
  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const a = e.target.closest('a'); if (!a) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
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
  route();
  api.me().then(u => { ME = u; renderAccount(); if (u) { syncPlanOnLogin(); loadConsent().then(() => { if (location.hash.startsWith('#/plan')) renderPlan(); }); } tgSyncConsume(); }).catch(() => { renderAccount(); tgSyncConsume(); });
  api.config().then(c => { if (c) CFG = c; });
  api.rootcauseOverlay().then(ov => { if (applyRcOverlay(ov)) route(); }).catch(() => {});
  // Always-available feedback button, bottom-right.
  const fbBtn = document.createElement('button');
  fbBtn.className = 'feedback-fab'; fbBtn.type = 'button'; fbBtn.title = 'Suggest an improvement';
  fbBtn.innerHTML = '💬 Feedback';
  fbBtn.onclick = () => openFeedbackModal();
  document.body.appendChild(fbBtn);
  bindEntityPopovers();
  document.addEventListener('click', e => { const b = e.target.closest('[data-suggest]'); if (b) { e.preventDefault(); openSuggestModal(b.dataset.suggest, b.dataset.ref); } });
})();
