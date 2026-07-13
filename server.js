// RNAwiki server: serves the static site AND a small JSON API for accounts,
// community edits, and comments (Postgres via db.js). Zero web framework.
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const db = require('./db');

const DIR = path.join(__dirname, 'site');
// Cache-busting: a short hash of the built assets, recomputed on each boot (i.e. each deploy).
// Injected as ?v=<hash> into every HTML response so browsers always fetch the current build —
// no hard-refresh needed — while HTML/JS/CSS are served no-cache so the CDN can't pin them.
const ASSET_VER = (() => {
  try {
    const h = crypto.createHash('sha1');
    for (const f of ['app.js', 'styles.css', 'data.js', 'facts.js', 'interactions.js', 'foods.js', 'exercises.js', 'businesses.js']) { try { h.update(fs.readFileSync(path.join(DIR, f))); } catch (e) {} }
    return h.digest('hex').slice(0, 10);
  } catch (e) { return String(Date.now()); }
})();
function versionAssets(html) {
  // expose the version so app.js can cache-bust the lazy-loaded datasets (foods/exercises/businesses.js)
  html = String(html).replace('</head>', `<script>window.__V="${ASSET_VER}"</script></head>`);
  return html.replace(/((?:src|href)=")(\/?(?:app\.js|styles\.css|data\.js|facts\.js|interactions\.js))(?:\?v=[^"]*)?(")/g, (m, a, b, c) => a + b + '?v=' + ASSET_VER + c);
}
function endHtml(res, html, code) {
  res.writeHead(code || 200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
  res.end(versionAssets(html));
}
const PORT = process.env.PORT || 3000;
const SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me';
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.png': 'image/png',
};
const EDITABLE = ['mechanism', 'target', 'plain', 'protocol', 'watch', 'bottom'];
// Hard domain isolation for stewardship: each expert domain owns exactly one layer.
const DOMAIN_LAYER = { physio: 'move', dietitian: 'fuel', pharmacist: 'stack' };
const DOMAIN_LABEL = { physio: 'Movement', dietitian: 'Nutrition', pharmacist: 'Pharmacology' };
const SITE_URL = (process.env.SITE_URL || 'https://rnawiki.com').replace(/\/$/, '');
// AI food-photo scanner (opt-in: does nothing until ANTHROPIC_API_KEY is set).
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';   // enables Gmail sign-in when set
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const SCAN_CAP = Number(process.env.SCAN_CAP || 25);          // scans/user/day — cost control
const SCAN_MODEL = process.env.SCAN_MODEL || 'claude-haiku-4-5-20251001'; // cheapest vision tier

async function scanFood(imageB64, mediaType) {
  const prompt = `You are a nutrition estimator. Identify the single food or dish in this photo (include Singapore hawker dishes and packaged foods). Estimate ONE typical serving. Respond with ONLY a JSON object — no prose, no markdown fences:
{"name": string, "serving": string, "kcal": number, "protein_g": number, "carbs_g": number, "sugar_g": number, "fat_g": number, "fiber_g": number, "sodium_mg": number, "confidence": "low"|"medium"|"high"}
If there is no identifiable food, return {"name": null}. Values are plain numbers with no units.`;
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: SCAN_MODEL, max_tokens: 400,
      messages: [{ role: 'user', content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageB64 } },
        { type: 'text', text: prompt },
      ] }],
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!r.ok) throw new Error('anthropic ' + r.status);
  const j = await r.json();
  let text = ((j.content && j.content[0] && j.content[0].text) || '').trim().replace(/```json|```/g, '');
  const mm = text.match(/\{[\s\S]*\}/); if (!mm) throw new Error('no json in response');
  const d = JSON.parse(mm[0]);
  if (!d.name) return { name: null };
  const num = (x) => (x === 0 || x) && isFinite(x) ? Number(x) : null;
  return {
    name: String(d.name).slice(0, 80), serving: String(d.serving || 'estimated serving').slice(0, 60),
    scanned: true, sg_local: false, tags: [],
    kcal: num(d.kcal), protein_g: num(d.protein_g), carbs_g: num(d.carbs_g), sugar_g: num(d.sugar_g),
    fat_g: num(d.fat_g), fiber_g: num(d.fiber_g), sodium_mg: num(d.sodium_mg),
    _note: d.confidence ? `${d.confidence} confidence` : null,
  };
}

// ---------- helpers ----------
function hashPassword(pw, salt) {
  salt = salt || crypto.randomBytes(16).toString('hex');
  const h = crypto.scryptSync(pw, salt, 64).toString('hex');
  return salt + ':' + h;
}
function verifyPassword(pw, stored) {
  const [salt, h] = String(stored).split(':');
  if (!salt || !h) return false;
  const cand = crypto.scryptSync(pw, salt, 64);
  const known = Buffer.from(h, 'hex');
  return cand.length === known.length && crypto.timingSafeEqual(cand, known);
}
function parseCookies(req) {
  const out = {}; const c = req.headers.cookie; if (!c) return out;
  c.split(';').forEach(p => { const i = p.indexOf('='); if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); });
  return out;
}
function readBody(req, maxBytes) {
  const cap = maxBytes || 1e5;
  return new Promise((resolve) => {
    let data = ''; let tooBig = false;
    req.on('data', c => { data += c; if (data.length > cap) { tooBig = true; req.destroy(); } });
    req.on('end', () => { if (tooBig) return resolve(null); try { resolve(data ? JSON.parse(data) : {}); } catch (e) { resolve(null); } });
    req.on('error', () => resolve(null));
  });
}
function json(res, code, obj, headers) {
  res.writeHead(code, Object.assign({ 'Content-Type': 'application/json' }, headers || {}));
  res.end(JSON.stringify(obj));
}
function clean(s, max) { return String(s == null ? '' : s).trim().slice(0, max || 4000); }
// CSV export helpers for the super-admin control room (member + waitlist extraction).
function csvCell(v) { const s = v == null ? '' : String(v); return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
function csvExport(res, filename, headers, rows) {
  const lines = [headers.map(csvCell).join(',')];
  for (const r of rows) lines.push(r.map(csvCell).join(','));
  const body = '﻿' + lines.join('\r\n'); // UTF-8 BOM so Excel opens it cleanly
  res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` });
  res.end(body);
}

// ---------- reputation ----------
// Points per action. Idempotent via rep_events UNIQUE(user,kind,ref): the same action can never
// award twice (re-voting, re-sharing the same day, re-merging the same proposal, etc.).
const REWARDS = { vote: 2, comment: 3, edit: 10, proposal: 50, merged: 200, food_log: 5, share: 10 };
async function award(userId, kind, ref, pts) {
  if (!userId || !db.enabled) return;
  const points = pts != null ? pts : (REWARDS[kind] || 0);
  if (!points) return;
  try {
    const r = await db.query(
      `INSERT INTO rep_events(user_id,kind,ref,points) VALUES($1,$2,$3,$4)
       ON CONFLICT (user_id,kind,ref) DO NOTHING RETURNING id`, [userId, kind, String(ref), points]);
    if (r.rows[0]) await db.query('UPDATE users SET reputation_points = reputation_points + $1 WHERE id=$2', [points, userId]);
  } catch (e) { console.error('[award]', e.message); }
}
async function addBadge(userId, badge) {
  try { await db.query(`UPDATE users SET badges = (CASE WHEN badges ? $2 THEN badges ELSE badges || to_jsonb($2::text) END) WHERE id=$1`, [userId, badge]); }
  catch (e) { console.error('[badge]', e.message); }
}
function safeUrl(s, max) {
  const v = clean(s, max || 200);
  if (!v) return '';
  return /^https?:\/\/[^\s]+$/i.test(v) ? v : '';
}

// ---------- outcome loop helpers ----------
function todayUTC() { return new Date().toISOString().slice(0, 10); }
// A streak stays alive through today until a full day is missed: if today isn't checked yet, count
// back from yesterday; otherwise from today. Uses UTC day boundaries consistently.
function streakFromDays(daySet) {
  const iso = d => d.toISOString().slice(0, 10);
  let d = new Date(todayUTC() + 'T00:00:00Z'), streak = 0;
  if (!daySet.has(iso(d))) d.setUTCDate(d.getUTCDate() - 1);
  while (daySet.has(iso(d))) { streak++; d.setUTCDate(d.getUTCDate() - 1); }
  return streak;
}
// participant = the signed-in user, else their anonymous voter key (so anyone can take part and the
// ledger still dedupes to one row per person per protocol).
async function resolveParticipant(req, extra) {
  const u = await currentUser(req);
  if (u) return { key: 'u:' + u.id, user: u };
  const vk = clean((extra && extra.voterKey) || '', 64);
  return { key: vk ? 'v:' + vk : null, user: null };
}
async function getOrCreateExperiment(part, pid, rcid) {
  const r = await db.query(`INSERT INTO experiments(participant,user_id,problem_id,root_cause_id)
    VALUES($1,$2,$3,$4) ON CONFLICT (participant,problem_id,root_cause_id) DO UPDATE SET participant=EXCLUDED.participant
    RETURNING id,status,outcome`, [part.key, part.user ? part.user.id : null, pid, rcid]);
  return r.rows[0];
}
async function checkinDays(expId) {
  const cr = await db.query("SELECT to_char(day,'YYYY-MM-DD') AS day FROM experiment_checkins WHERE experiment_id=$1 ORDER BY day DESC LIMIT 90", [expId]);
  return new Set(cr.rows.map(x => x.day));
}
// Builder identity (Phase 5). Level is a pure function of experiments the participant has run to an
// outcome — no new state, just a view of the loop data. Same ladder used everywhere.
const LEVELS = [{ key: 'builder', name: 'Builder', min: 0 }, { key: 'experimenter', name: 'Experimenter', min: 1 }, { key: 'veteran', name: 'Veteran', min: 3 }, { key: 'architect', name: 'Architect', min: 10 }];
function levelFor(completed) {
  let cur = LEVELS[0], next = null;
  for (let i = 0; i < LEVELS.length; i++) { if (completed >= LEVELS[i].min) cur = LEVELS[i]; else { next = LEVELS[i]; break; } }
  return { key: cur.key, name: cur.name, next: next ? { name: next.name, at: next.min } : null };
}
// Monday (UTC) of the current week — for the weekly check-in goal.
function weekStartUTC() { const d = new Date(todayUTC() + 'T00:00:00Z'); const dow = (d.getUTCDay() + 6) % 7; d.setUTCDate(d.getUTCDate() - dow); return d.toISOString().slice(0, 10); }

const ADMIN_USER = (process.env.ADMIN_USER || '').toLowerCase();
// The single super-admin: only this account sees the consolidated control room and can
// verify accounts / approve root-cause changes. Locked to Felix's email by default.
const SUPERADMIN_EMAIL = (process.env.SUPERADMIN_EMAIL || 'felix360506@gmail.com').toLowerCase();
const isSuper = u => !!(u && u.email && u.email.toLowerCase() === SUPERADMIN_EMAIL);
// Outcome-data moat: consent-notice version + validation allow-lists (reject anything off-list)
const CONSENT_VERSION = 'v1-2026-07';
const AGE_BANDS = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
const SEXES = ['male', 'female', 'other', 'prefer_not'];
const ETHNICITIES = ['chinese', 'malay', 'indian', 'other', 'prefer_not'];
const CHECKIN_PHASES = ['baseline', 'd30', 'd90'];
const BLOOD_MARKERS = ['hba1c', 'fasting_glucose', 'ldl', 'hdl', 'triglycerides', 'total_chol', 'bp_sys', 'bp_dia', 'testosterone', 'shbg', 'tsh', 'ft4', 'ferritin', 'crp', 'vit_d', 'hscrp', 'a1c',
  'apob', 'lpa', 'fasting_insulin', 'estradiol', 'dhea_s', 'egfr', 'alt', 'uric_acid', 'homa_ir'];   // high-value adds: metabolic, cardiovascular, hormonal, longevity
const STOP_REASONS = ['didnt_work', 'side_effects', 'too_hard', 'cost', 'got_better', 'other'];   // why a user discontinued (persistence data)
const EXTRA_KEYS = ['mood_freq', 'sleep_quality', 'vitality', 'pain_interference'];               // category-specific outcome items, each an int 0..10
const inList = (v, list) => list.includes(v) ? v : null;
const intOr = (v, lo, hi) => { const n = parseInt(v, 10); return (Number.isFinite(n) && n >= lo && n <= hi) ? n : null; };
// keep only whitelisted extra keys with sane int values → safe JSONB, no injection of arbitrary shape
function cleanExtra(o) { if (!o || typeof o !== 'object') return null; const out = {}; for (const k of EXTRA_KEYS) { const n = intOr(o[k], 0, 10); if (n != null) out[k] = n; } return Object.keys(out).length ? out : null; }
// how many relevant-panel peer approvals move a change to 'peer_approved' (awaiting the
// superadmin's final approval before it goes live). Peer approval never publishes on its own.
const PANEL_THRESHOLD = 1;
async function currentUser(req) {
  const sid = parseCookies(req).sid;
  if (!sid || !db.enabled) return null;
  const r = await db.query('SELECT u.id, u.username, u.email, u.role, u.domain, u.credential, u.domain_verified, u.requested_domain, u.application_status, u.reputation_points, u.socials, u.badges, u.profile_views, u.booking_clicks FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token=$1 AND s.expires_at > now()', [sid]);
  const u = r.rows[0];
  if (u && ADMIN_USER && u.username.toLowerCase() === ADMIN_USER) u.role = 'admin';
  if (u && isSuper(u)) u.role = 'admin';           // the superadmin always has admin powers
  if (u) u.is_super = isSuper(u);
  return u || null;
}
function setSessionCookie(res, token) {
  const days = 30;
  res.setHeader('Set-Cookie', `sid=${token}; HttpOnly; Path=/; Max-Age=${days * 86400}; SameSite=Lax; Secure`);
}
// simple same-origin guard for mutations
function sameOrigin(req) {
  const o = req.headers.origin;
  if (!o) return true; // non-browser or same-origin fetch without Origin
  try { return new URL(o).host === req.headers.host; } catch (e) { return false; }
}

// ---------- Telegram coach (@rnawikibot) ----------
// Dormant until BOT_TOKEN is set. A per-user, per-protocol keystone coach: link from a protocol
// page, get the one keystone habit, tap "Did it today" to build a streak. All content is authored
// (keystones/protocol names) — no AI, nothing generated at runtime.
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const BOT_USERNAME = process.env.BOT_USERNAME || 'rnawikibot';
const TG_SECRET = crypto.createHmac('sha256', SECRET).update('tg-webhook').digest('hex').slice(0, 40);
// ---- Email nudges (Resend) — activates when RESEND_API_KEY is set; otherwise the "due" list still shows in Control Room ----
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'RNAwiki <hello@rnawiki.com>';
const TG_HELP = 'What I can do:\n<b>/build</b> — build your own plan here (pick problem + supplements)\n<b>/keystone</b> — your one keystone habit · <b>/done</b> — mark it done (builds your streak)\n<b>type any food</b> (e.g. “2 eggs”, “chicken rice”) — I log it against your protocol’s targets\n<b>/today</b> — keystone + food progress · <b>/progress</b> — your streak &amp; consistency · <b>/tools</b> — your protocol’s tools (counters, timers, reminders) · <b>/stack</b> — supplements + safety · <b>/schedule</b> — what to take when\n<b>ask about any supplement by name</b> (e.g. “magnesium”) — I’ll explain + link the full page\n<b>/nudge</b> — a daily check-in at your time · <b>/streak</b> · <b>/reset</b> (clear food) · <b>/plan</b> · <b>/help</b>';
let TG_PROTO = {};
try {
  const g = require('./data/clinical_graph.json'); const ks = require('./data/keystones.json');
  g.problems.forEach(p => p.root_causes.forEach(rc => {
    TG_PROTO[p.id + '/' + rc.id] = { problem: p.name, rc: rc.name.replace(/\s*\([^)]*\)/, ''), keystone: ks[rc.id] || null, nt: rc.nutrient_targets || {} };
  }));
} catch (e) { console.error('[tg] proto load failed:', e.message); }
// Food database (same source as the web fuel tracker) for logging in chat.
let TG_FOODS = [];
try {
  const ff = require('./data/foods.json'); const arr = Array.isArray(ff) ? ff : (ff.foods || []);
  TG_FOODS = arr.map(f => ({ id: f.id, name: f.name, serving: f.serving || '', sg: !!f.sg_local, hay: (f.hay || f.name || '').toLowerCase(), n: f }));
} catch (e) { console.error('[tg] foods load failed:', e.message); }
// Full compound catalogue + interaction engine (same as the site) — for /stack safety advice
// and "ask about X" lookups. Loaded once, in an isolated context.
let TG_DATA = null, TG_RXN = null;
try {
  const vm = require('vm');
  const load = (file, key) => { const sb = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, file), 'utf8'), sb); return sb.window[key]; };
  TG_DATA = load('data.js', 'RNAWIKI_DATA'); TG_RXN = load('interactions.js', 'RNAWIKI_INTERACTIONS');
} catch (e) { console.error('[tg] data/rxn load failed:', e.message); }
// compound id -> {name, isRx, badge} — used to attribute reported side-effects to specific compounds in the Control Room
const COMPOUND_BY_ID = {};
if (TG_DATA && Array.isArray(TG_DATA.compounds)) TG_DATA.compounds.forEach(c => { COMPOUND_BY_ID[c.id] = { name: c.name, isRx: !!c.isRx, badge: c.badge || '' }; });
const tgSlug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
function tgResolveStack(rc) {
  if (!TG_DATA) return [];
  const frags = (rc.compounds || []).map(f => String(f).toLowerCase());
  return TG_DATA.compounds.filter(c => { const nm = c.name.toLowerCase(); const words = nm.split(/[^a-z0-9]+/); return frags.some(f => nm === f || words.includes(f)); })
    .map(c => ({ id: c.id, name: c.name, isRx: c.isRx, approvals: c.approvals, category: c.category, slug: tgSlug(c.name), stars: c.stars, plain: c.plain, protocol: c.protocol }));
}
// Time-of-day bucketing — ported verbatim from the site's timingBucket (parses each
// compound's own dosing text; no invented rules).
function tgTimingBucket(c) {
  const t = ((c.protocol || '') + ' ' + (c.plain || '')).toLowerCase();
  if (/weekly|monthly|every \d+ ?days|\d+ (consecutive )?days? (a |per )?month|pulse|intermittent(ly)?|\bcycle\b|2 days monthly/.test(t)) return 'periodic';
  if (/pre-?\s?(workout|exercise|train)|before (a |your )?(workout|exercise|train)|post-?\s?(workout|exercise|train)|after (a |your )?(workout|exercise|train)/.test(t)) return 'training';
  if (/before bed|bedtime|at night|\bevening\b|\bnight\b|before sleep/.test(t)) return 'evening';
  if (/\bmorning\b|on waking|empty stomach|with breakfast|\bam\b/.test(t)) return 'morning';
  return 'meals';
}
async function tgSendSchedule(chatId, row) {
  const p = TG_PROTO[(row.pid || '') + '/' + (row.rcid || '')]; if (!p) return tgSend(chatId, `Link or /build a protocol first.`);
  let stack = p.stack || []; const sel = row.sel && row.sel.supps; if (Array.isArray(sel)) stack = stack.filter(c => sel.includes(c.id));
  const buckets = { morning: [], training: [], meals: [], evening: [], periodic: [] };
  stack.forEach(c => buckets[tgTimingBucket(c)].push(c.name + (c.isRx ? ' 🔵' : '')));
  const order = [['morning', '☀️ Morning / on waking'], ['training', '🏋️ Around training'], ['meals', '🍽️ With meals / anytime'], ['evening', '🌙 Evening & bedtime'], ['periodic', '🔁 Periodic (not daily)']];
  const parts = order.filter(([k]) => buckets[k].length).map(([k, label]) => `<b>${label}</b>\n${buckets[k].map(n => '• ' + tgEsc(n)).join('\n')}`);
  const kline = p.keystone ? `⭐ <b>Keystone (do this daily):</b> ${tgEsc(p.keystone.one)}\n\n` : '';
  const body = `🗓️ <b>Your ${tgEsc(p.problem)} day — what to take when</b>\n\n${kline}${parts.length ? parts.join('\n\n') : 'Food-only — no supplements to time.'}\n\n💪 Your movements (with how-to) → ${SITE_URL}/protocol/${row.pid}/${row.rcid}\n\n<i>Timing is from each supplement's own guidance — not a prescription.</i>`;
  return tgSend(chatId, body);
}
// ---- Opt-in daily nudges (each user's own time + timezone) ----
function tgHourLabel(h) { return (h % 12 || 12) + (h < 12 ? 'am' : 'pm'); }
function tgParseTime(s) {
  const m = String(s).toLowerCase().replace(/\s+/g, '').match(/^(\d{1,2})(?::(\d{2}))?(am|pm)?$/); if (!m) return null;
  let h = +m[1]; const min = m[2] ? +m[2] : 0; const ap = m[3];
  if (ap === 'pm' && h < 12) h += 12; if (ap === 'am' && h === 12) h = 0;
  if (h > 23 || min > 59) return null; return h * 60 + min;
}
async function tgNudgeStart(chatId) {
  const row = await tgGet(chatId); if (!row || !row.pid) return tgSend(chatId, `Build a plan first (/build), then I can nudge you daily.`);
  const times = [['7 AM', 7], ['8 AM', 8], ['9 AM', 9], ['12 PM', 12], ['6 PM', 18], ['9 PM', 21]]; const kb = [];
  for (let i = 0; i < times.length; i += 2) kb.push(times.slice(i, i + 2).map(([l, h]) => ({ text: l, callback_data: 'nh:' + h })));
  kb.push([{ text: '🔕 Turn nudges off', callback_data: 'noff' }]);
  return tgSend(chatId, `⏰ <b>Daily check-in</b> — when should I nudge you (your local time)?`, { reply_markup: { inline_keyboard: kb } });
}
async function tgSendNudge(r) {
  const p = TG_PROTO[(r.pid || '') + '/' + (r.rcid || '')]; const k = p && p.keystone;
  const today = new Date().toISOString().slice(0, 10); const done = Array.isArray(r.keystone_days) && r.keystone_days.includes(today);
  const streak = r.streak || 0;
  // reminder-type functions the user selected show up as their daily nudge lines
  const reminders = (Array.isArray(r.functions) ? r.functions : []).map(id => tgFnById(id)).filter(f => f && f.kind === 'reminder');
  const remLines = reminders.length ? '\n\n' + reminders.map(f => `${f.icon} ${tgEsc(f.how)}`).join('\n') : '';
  const riskLine = (!done && streak >= 3) ? `\n\n🔥 You're on a <b>${streak}-day streak</b> — one keystone keeps it alive.` : '';
  // Once a week (their local Sunday) add a glanceable 7-day summary — proactive value the site can't push.
  const set = new Set(Array.isArray(r.keystone_days) ? r.keystone_days : []);
  const localDow = new Date(Date.now() + (r.tz_offset ?? 480) * 60000).getUTCDay();
  let weekLine = '';
  if (localDow === 0) { const grid = []; let n = 0; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const has = set.has(d.toISOString().slice(0, 10)); grid.push(has ? '🟩' : '⬜'); if (has) n++; } weekLine = `\n\n📊 <b>This week:</b> ${grid.join('')}  ${n}/7 days`; }
  const body = (done
    ? `👋 Keystone already done today ✅ — nice. Log your meals as you eat (just type them). 🔥 ${streak}-day streak.`
    : `👋 <b>Daily check-in.</b>\n⭐ Today's keystone: ${k ? tgEsc(k.one) : '—'}\n\nTap ✅ when you've done it, and log your meals by typing them (e.g. “2 eggs”).`) + riskLine + remLines + weekLine;
  const res = await tgSend(r.chat_id, body, { reply_markup: { inline_keyboard: [[{ text: done ? '✅ Done' : '✅ Mark keystone done', callback_data: 'done' }, { text: '📋 Today', callback_data: 'today' }]] } });
  if (res && res.ok === false && res.error_code === 403) await db.query('UPDATE telegram_users SET active=false WHERE chat_id=$1', [r.chat_id]).catch(() => { });
  return res;
}
let TG_NUDGE_TIMER = null;
function tgStartScheduler() {
  if (!BOT_TOKEN || !db.enabled || TG_NUDGE_TIMER) return;
  TG_NUDGE_TIMER = setInterval(async () => {
    try {
      const now = new Date(); const nowUtcMin = now.getUTCHours() * 60 + now.getUTCMinutes(); const today = now.toISOString().slice(0, 10);
      const rows = (await db.query('SELECT * FROM telegram_users WHERE active AND nudge_hour IS NOT NULL AND pid IS NOT NULL AND (last_nudge IS NULL OR last_nudge <> $1)', [today])).rows;
      for (const r of rows) {
        const localMin = (((nowUtcMin + (r.tz_offset ?? 480)) % 1440) + 1440) % 1440;  // ?? not || — a real 0 (UTC) must stay 0
        if (Math.floor(localMin / 60) === r.nudge_hour) { await db.query('UPDATE telegram_users SET last_nudge=$2 WHERE chat_id=$1', [r.chat_id, today]); await tgSendNudge(r).catch(() => { }); }
      }
    } catch (e) { console.error('[tg] nudge tick:', e.message); }
  }, 5 * 60 * 1000);
  console.log('[tg] nudge scheduler started (5-min tick).');
}

// ===== Email nudge engine — milestone check-ins for users who don't use Telegram =====
const PROBLEM_NAME = (() => { try { const g = require('./data/clinical_graph.json'); const m = {}; (g.problems || []).forEach(p => { m[p.id] = p.name; }); return m; } catch (e) { return {}; } })();
async function sendEmail(to, subject, html) {
  if (!RESEND_API_KEY) return false;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: EMAIL_FROM, to, subject, html }),
    });
    if (!r.ok) { console.error('[email] send failed', r.status, (await r.text().catch(() => '')).slice(0, 200)); return false; }
    return true;
  } catch (e) { console.error('[email]', e.message); return false; }
}
// Pure: given a plan + a done(pid,rcid,phase)->bool predicate, return the most-pressing due milestone or null.
function computeDuePhase(plan, doneHas, today) {
  const protos = (plan && Array.isArray(plan.protocols)) ? plan.protocols : [];
  for (const pr of protos) {
    if (!pr.pid || !pr.rcid || !pr.startedAt) continue;
    const days = Math.floor((Date.parse(today + 'T00:00:00Z') - Date.parse(pr.startedAt + 'T00:00:00Z')) / 86400000);
    if (!Number.isFinite(days)) continue;
    if (days >= 90 && !doneHas(pr.pid, pr.rcid, 'd90')) return { pr, phase: 'd90', days };
    if (days >= 30 && !doneHas(pr.pid, pr.rcid, 'd30')) return { pr, phase: 'd30', days };
  }
  return null;
}
// Which consented users have a milestone check-in due (d30/d90) — computed in 2 queries, then in JS.
async function listDueCheckins() {
  if (!db.enabled) return [];
  const today = new Date().toISOString().slice(0, 10);
  const users = (await db.query(`SELECT u.id, u.email, u.username, u.last_checkin_email, u.email_nudge_hour, p.plan
    FROM users u JOIN user_consent c ON c.user_id=u.id AND c.consent_research
    JOIN user_plans p ON p.user_id=u.id WHERE u.email IS NOT NULL AND u.email_off IS NOT TRUE`)).rows;
  if (!users.length) return [];
  const done = (await db.query('SELECT user_id, pid, rcid, phase FROM outcome_checkins WHERE user_id = ANY($1)', [users.map(u => u.id)])).rows;
  const doneKey = new Set(done.map(d => d.user_id + '|' + d.pid + '|' + d.rcid + '|' + d.phase));
  const out = [];
  for (const u of users) {
    const due = computeDuePhase(u.plan, (pid, rcid, ph) => doneKey.has(u.id + '|' + pid + '|' + rcid + '|' + ph), today);
    if (due) out.push({ user: u, pr: due.pr, phase: due.phase, days: due.days });
  }
  return out;
}
async function sendCheckinEmail(d) {
  const name = PROBLEM_NAME[d.pr.pid] || 'your protocol';
  const wk = d.phase === 'd90' ? '90 days' : '30 days';
  const link = `${SITE_URL}/#/plan`;
  const subject = `You're ${wk} into your ${name} protocol — 2-min check-in?`;
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a">
    <h2 style="font-size:20px">How's it going with ${tgEsc(name)}?</h2>
    <p style="font-size:15px;line-height:1.5">You've been at it for <b>${wk}</b>. A 20-second check-in tells you whether it's working — and helps everyone with the same problem.</p>
    <p><a href="${link}" style="display:inline-block;background:#2f6f4f;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;font-size:15px">Log my ${tgEsc(wk)} check-in →</a></p>
    <p style="font-size:12px;color:#888;line-height:1.5">Anonymous &amp; optional. You're getting this because you consented to help RNAwiki learn what works. Manage or withdraw anytime in your account.</p>
  </div>`;
  return sendEmail(d.user.email, subject, html);
}
// ---- Daily reminder email — bundles EVERY nudge the user selected (keystone + tools), web parity of the TG daily nudge ----
// Reads the saved plan: keystone(s) from TG_PROTO + each selected tool from TG_FUNCTIONS. Returns [] if nothing to remind.
function buildReminderLines(plan) {
  const protos = (plan && Array.isArray(plan.protocols)) ? plan.protocols : [];
  const lines = [], seen = new Set();
  for (const pr of protos) {
    const info = TG_PROTO[(pr.pid || '') + '/' + (pr.rcid || '')];
    if (info && info.keystone && info.keystone.one && !seen.has('k:' + pr.pid + pr.rcid)) {
      seen.add('k:' + pr.pid + pr.rcid);
      lines.push({ icon: '⭐', label: info.keystone.one, sub: info.keystone.why || '' });
    }
    const fns = Array.isArray(pr.functions) ? pr.functions : [];
    for (const fid of fns) { const f = tgFnById(fid); if (f && !seen.has(fid)) { seen.add(fid); lines.push({ icon: f.icon, label: f.name, sub: f.how || '' }); } }
  }
  return lines;
}
function buildReminderEmail(plan, due) {
  const lines = buildReminderLines(plan);
  if (!lines.length && !due) return null;
  const link = `${SITE_URL}/#/plan`;
  const items = lines.map(l => `<li style="margin:0 0 10px;font-size:15px;line-height:1.45"><span style="font-size:17px">${l.icon}</span> <b>${tgEsc(l.label)}</b>${l.sub ? `<br><span style="color:#666;font-size:13px">${tgEsc(l.sub)}</span>` : ''}</li>`).join('');
  const ci = due ? `<div style="margin:18px 0;padding:12px 14px;background:#f0f7f3;border-radius:10px;font-size:14px">📋 You're <b>${due.phase === 'd90' ? '90 days' : '30 days'}</b> into your ${tgEsc(PROBLEM_NAME[due.pr.pid] || 'protocol')} — a 20-second check-in is due. It's in your tracker.</div>` : '';
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a">
    <h2 style="font-size:20px;margin:0 0 4px">Today's plan ⭐</h2>
    <p style="font-size:14px;color:#666;margin:0 0 16px">Your reminders for today — tick them off in the tracker.</p>
    <ul style="list-style:none;padding:0;margin:0">${items}</ul>
    ${ci}
    <p style="margin:20px 0 0"><a href="${link}" style="display:inline-block;background:#2f6f4f;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;font-size:15px">Open my tracker →</a></p>
    <p style="font-size:12px;color:#999;line-height:1.5;margin-top:18px">You turned on daily reminders. Turn them off anytime under "Your data &amp; privacy" in your account.</p>
  </div>`;
  return { subject: 'Your RNAwiki plan for today ⭐', html };
}
let EMAIL_TIMER = null, EMAIL_REMIND_TIMER = null;
async function emailNudgeTick() {
  if (!RESEND_API_KEY || !db.enabled) return;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const cutoff = new Date(Date.now() - 13 * 86400000).toISOString().slice(0, 10);   // ~14-day gap between nudges
    const due = await listDueCheckins();
    for (const d of due) {
      if (d.user.email_nudge_hour != null) continue;                                   // daily-reminder users get the check-in line there — don't double-email
      if (d.user.last_checkin_email && d.user.last_checkin_email > cutoff) continue;   // emailed recently — don't spam
      const ok = await sendCheckinEmail(d);
      if (ok) await db.query('UPDATE users SET last_checkin_email=$2 WHERE id=$1', [d.user.id, today]);
    }
  } catch (e) { console.error('[email] nudge tick:', e.message); }
}
// Daily reminder digest — TZ-aware 5-min tick (mirrors tgStartScheduler): fires once/day at each user's chosen local hour.
async function emailReminderTick() {
  if (!RESEND_API_KEY || !db.enabled) return;
  try {
    const now = new Date(); const nowUtcMin = now.getUTCHours() * 60 + now.getUTCMinutes(); const today = now.toISOString().slice(0, 10);
    const rows = (await db.query(`SELECT u.id, u.email, u.email_nudge_hour, u.email_tz_offset, p.plan
      FROM users u JOIN user_plans p ON p.user_id=u.id
      WHERE u.email IS NOT NULL AND u.email_off IS NOT TRUE AND u.email_nudge_hour IS NOT NULL AND (u.email_last_nudge IS NULL OR u.email_last_nudge <> $1)`, [today])).rows;
    for (const u of rows) {
      const localMin = (((nowUtcMin + (u.email_tz_offset ?? 480)) % 1440) + 1440) % 1440;  // ?? not || — a real 0 (UTC) must stay 0
      if (Math.floor(localMin / 60) !== u.email_nudge_hour) continue;                   // not this user's hour yet
      const done = (await db.query('SELECT pid, rcid, phase FROM outcome_checkins WHERE user_id=$1', [u.id])).rows;
      const doneSet = new Set(done.map(d => d.pid + '|' + d.rcid + '|' + d.phase));
      const due = computeDuePhase(u.plan, (pid, rcid, ph) => doneSet.has(pid + '|' + rcid + '|' + ph), today);
      const mail = buildReminderEmail(u.plan, due);
      const alsoCheckin = (due && mail) ? ', last_checkin_email=$2' : '';
      await db.query(`UPDATE users SET email_last_nudge=$2${alsoCheckin} WHERE id=$1`, [u.id, today]);  // mark before send → never double-fire in a day
      if (mail) await sendEmail(u.email, mail.subject, mail.html);
    }
  } catch (e) { console.error('[email] reminder tick:', e.message); }
}
async function sendWinbackEmail(email, name, days) {
  const link = `${SITE_URL}/#/plan`;
  const subject = `Your ${name} protocol is still here 👋`;
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a">
    <h2 style="font-size:20px;margin:0 0 6px">Pick up where you left off</h2>
    <p style="font-size:15px;line-height:1.5">It's been about <b>${days} days</b> since you last worked on your ${tgEsc(name)} protocol. Your plan, streak history and progress are all still saved — you can jump straight back in.</p>
    <p style="font-size:15px;line-height:1.5">Even one small action today keeps the momentum going.</p>
    <p style="margin:20px 0 0"><a href="${link}" style="display:inline-block;background:#2f6f4f;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;font-size:15px">Back to my protocol →</a></p>
    <p style="font-size:12px;color:#999;line-height:1.5;margin-top:18px">Don't want these? Turn off emails anytime under "Your data &amp; privacy" in your account.</p>
  </div>`;
  return sendEmail(email, subject, html);
}
// Win back users who drifted: no tracking activity for 10+ days, on a started protocol, not on daily reminders,
// not active on Telegram, no check-in email lately — capped once/21 days. (Covers the "inactive user" trigger.)
async function emailWinbackTick() {
  if (!RESEND_API_KEY || !db.enabled) return;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const cutoff21 = new Date(Date.now() - 21 * 86400000).toISOString().slice(0, 10);
    const cutoff7 = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const rows = (await db.query(`SELECT u.id, u.email, p.plan, to_char(p.updated_at,'YYYY-MM-DD') AS last_active
      FROM users u JOIN user_plans p ON p.user_id=u.id
      WHERE u.email IS NOT NULL AND u.email_off IS NOT TRUE AND u.email_nudge_hour IS NULL
        AND p.updated_at < now() - interval '10 days'
        AND (u.last_winback_email IS NULL OR u.last_winback_email < $1)
        AND (u.last_checkin_email IS NULL OR u.last_checkin_email < $2)
        AND NOT EXISTS (SELECT 1 FROM telegram_users t WHERE t.user_id=u.id AND t.last_active > now() - interval '10 days')`,
      [cutoff21, cutoff7])).rows;
    for (const u of rows) {
      const protos = (u.plan && Array.isArray(u.plan.protocols)) ? u.plan.protocols : [];
      if (!protos.length) continue;   // never actually started a protocol
      const name = PROBLEM_NAME[protos[0].pid] || 'your';
      const days = Math.max(10, Math.floor((Date.parse(today + 'T00:00:00Z') - Date.parse(u.last_active + 'T00:00:00Z')) / 86400000));
      await db.query('UPDATE users SET last_winback_email=$2 WHERE id=$1', [u.id, today]);   // mark before send → never double-fire
      await sendWinbackEmail(u.email, name, days);
    }
  } catch (e) { console.error('[email] winback tick:', e.message); }
}
async function email6hTick() { await emailNudgeTick(); await emailWinbackTick(); }   // sequential so milestone marks last_checkin_email before winback checks it
function emailStartScheduler() {
  if (!db.enabled || EMAIL_TIMER) return;
  if (!RESEND_API_KEY) { console.log('[email] RESEND_API_KEY not set — nudge emails dormant (due list still visible in Control Room).'); return; }
  EMAIL_TIMER = setInterval(email6hTick, 6 * 60 * 60 * 1000);      // milestone check-ins + inactivity win-back — every 6h
  setTimeout(() => email6hTick().catch(() => {}), 60 * 1000);      // and once shortly after boot
  EMAIL_REMIND_TIMER = setInterval(emailReminderTick, 5 * 60 * 1000);  // daily reminder digest — TZ-aware 5-min tick
  console.log('[email] check-in+winback (6h) + daily-reminder (5-min) schedulers started.');
}
// Category → problems index, for building a plan inside the chat.
let TG_CATS = {};
try {
  const gc = require('./data/clinical_graph.json');
  gc.problems.forEach(p => { (TG_CATS[p.category] = TG_CATS[p.category] || []).push({ pid: p.id, name: p.name, icon: p.icon || '', rcs: p.root_causes.map(r => ({ id: r.id, plain: (r.plain || r.name), name: r.name })) }); });
} catch (e) { }
const TG_CAT_KEYS = () => Object.keys(TG_CATS);
function tgFindProblem(pid) { for (const c of Object.keys(TG_CATS)) { const p = TG_CATS[c].find(x => x.pid === pid); if (p) return p; } return null; }
function tgCompoundTags(c) { const s = new Set((TG_RXN && TG_RXN.catTags[c.category]) || []); const nm = (c.name || '').toLowerCase(); ((TG_RXN && TG_RXN.nameTags) || []).forEach(r => { if (nm.indexOf(r.m) >= 0) r.t.forEach(t => s.add(t)); }); return s; }
function tgStackFlags(stack) {
  if (!TG_RXN) return [];
  const byTag = {}; stack.forEach(c => tgCompoundTags(c).forEach(t => (byTag[t] = byTag[t] || []).push(c.name)));
  const flags = [];
  (TG_RXN.rules || []).forEach(rule => { if (!rule.need.every(n => (byTag[n[0]] || []).length >= n[1])) return; const inv = {}; rule.need.forEach(n => (byTag[n[0]] || []).forEach(nm => inv[nm] = 1)); flags.push({ tier: rule.tier, title: rule.title, action: rule.action, who: Object.keys(inv) }); });
  return flags.filter(f => f.tier === 'danger' || f.tier === 'timing');
}
async function tgSendStack(chatId, row) {
  const p = TG_PROTO[(row.pid || '') + '/' + (row.rcid || '')];
  const stack = tgUserStackObjs(row); // protocol-selected supps + anything the user added from a compound card
  if (!stack.length) return tgSend(chatId, `You're going food-only on this one — no supplements. /today for your food targets.`);
  const list = stack.map(c => `• <b>${tgEsc(c.name)}</b>${tgGated(c) ? ' 🔵 <i>Rx — see a doctor</i>' : ''}${c.added ? ' <i>· added by you</i>' : ''}\n  ${SITE_URL}/c/${c.slug || tgSlug(c.name)}`).join('\n');
  const flags = tgStackFlags(stack);
  const warn = flags.length ? `\n\n⚠️ <b>If you combine these:</b>\n` + flags.map(f => `${f.tier === 'danger' ? '☠️' : '⏰'} <b>${tgEsc(f.title)}</b> (${f.who.map(tgEsc).join(' + ')}) — ${tgEsc(f.action)}`).join('\n') : `\n\n✅ No dangerous interactions flagged among these.`;
  return tgSend(chatId, `💊 <b>${tgEsc(p ? p.problem : 'Your')} — supplements</b>\n${list}${warn}\n\n<i>Educational, not a prescription. Tap a link to learn about any of them.</i>`);
}
function tgFindCompound(q) { if (!TG_DATA) return null; const t = q.toLowerCase().trim(); return TG_DATA.compounds.find(c => { const nm = c.name.toLowerCase(); return nm === t || nm.split(/[^a-z0-9]+/).includes(t) || (t.length > 3 && nm.indexOf(t) >= 0); }); }
// second pass: attach the resolved supplement stack to each protocol (needs TG_DATA loaded above)
try { const gg = require('./data/clinical_graph.json'); gg.problems.forEach(p => p.root_causes.forEach(rc => { const key = p.id + '/' + rc.id; if (TG_PROTO[key]) TG_PROTO[key].stack = tgResolveStack(rc); })); } catch (e) { }

// ---- Answer helpers: strip markdown, goal lookup, quantity parsing, compound cards ----
// Everything the bot says about a compound is AUTHORED content echoed verbatim (dose, mechanism,
// safety) — never generated. tgStripMd only removes markdown chrome, it invents nothing.
function tgStripMd(s) {
  return String(s == null ? '' : s)
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')   // [text](url) → text
    .replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').replace(/__([^_]+)__/g, '$1')
    .replace(/[`>#]/g, '').replace(/\s+/g, ' ').trim();
}
// Goal taxonomy (same 16 goals + evidence-star ranking as the website's goal pages)
const TG_GOALS = (TG_DATA && Array.isArray(TG_DATA.goals)) ? TG_DATA.goals : [];
const TG_GOAL_STOP = new Set(['what', 'whats', 'the', 'best', 'good', 'for', 'with', 'help', 'helps', 'and', 'you', 'your', 'can', 'get', 'how', 'does', 'most', 'better', 'more', 'some', 'any', 'thing', 'things', 'take', 'should', 'stuff', 'supplement', 'supplements']);
function tgFindGoal(q) {
  const toks = (q || '').toLowerCase().split(/[^a-z]+/).filter(w => w.length > 2 && !TG_GOAL_STOP.has(w));
  if (!toks.length) return null;
  let best = null, bestScore = 0;
  for (const g of TG_GOALS) {
    const hay = (g.label + ' ' + (g.keys || []).join(' ')).toLowerCase();
    let score = 0; for (const t of toks) if (hay.includes(t)) score++;
    if (score > bestScore) { bestScore = score; best = g; }
  }
  return bestScore > 0 ? best : null;
}
function tgGoalTop(goalId, n) {
  if (!TG_DATA) return [];
  return TG_DATA.compounds.filter(c => Array.isArray(c.goalIds) && c.goalIds.includes(goalId) && !c.isNote)
    .sort((a, b) => (b.stars || 0) - (a.stars || 0) || a.name.localeCompare(b.name)).slice(0, n || 5);
}
// Rank multiple compound matches for a free-text query (for disambiguation)
function tgFindCompounds(q) {
  if (!TG_DATA) return [];
  const t = (q || '').toLowerCase().trim(); if (t.length < 2) return [];
  const scored = [];
  for (const c of TG_DATA.compounds) {
    const nm = c.name.toLowerCase(); const words = nm.split(/[^a-z0-9]+/);
    let s = 0;
    if (nm === t) s = 100; else if (words.includes(t)) s = 80;
    else if (nm.startsWith(t)) s = 60; else if (t.length > 3 && nm.indexOf(t) >= 0) s = 40;
    if (s) scored.push({ c, s });
  }
  return scored.sort((a, b) => b.s - a.s || (b.c.stars || 0) - (a.c.stars || 0)).slice(0, 6).map(x => x.c);
}
function tgStars(n) { n = Math.max(0, Math.min(5, +n || 0)); return n ? ' ' + '⭐'.repeat(n) : ''; }
// A compound is "gated" (off by default, warned) only when it has NO over-the-counter path — i.e. it's
// prescription-only or controlled. Dual-status items (e.g. Vitamin D3, NAC = 🟡+🔵) stay OTC and are not gated.
function tgOtcAvailable(c) { const a = (c && c.approvals) || []; return a.includes('🟢') || a.includes('🟡'); }
function tgGated(c) { return !!(c && c.isRx) && !tgOtcAvailable(c); }
// Build a rich compound card + inline actions. `row` = the user's telegram record (for stack-aware actions).
function tgCompoundCard(c, row) {
  const appr = (c.approvals && c.approvals.length) ? c.approvals.join(' ') : '';
  const apprLbl = (c.approvalLabels && c.approvalLabels[0]) || '';
  const plain = c.plain ? tgEsc(tgStripMd(c.plain)) : '';
  const mech = c.mechanism ? tgEsc(tgStripMd(c.mechanism)) : '';
  const dose = c.protocol ? tgEsc(tgStripMd(c.protocol)) : '';
  const watch = tgStripMd([c.watch, c.avoid].filter(Boolean).join(' ')); // authored safety notes only
  const lines = [`${appr ? appr + ' ' : ''}<b>${tgEsc(c.name)}</b>${tgStars(c.stars)}`];
  if (apprLbl) lines.push(`<i>${tgEsc(apprLbl)}${tgGated(c) ? ' · 🔵 prescription — see a doctor' : ''}</i>`);
  if (plain) lines.push('\n' + plain);
  else if (mech) lines.push('\n' + mech.slice(0, 260) + (mech.length > 260 ? '…' : ''));
  if (dose) lines.push(`\n💊 <b>Dose &amp; timing:</b> ${dose}`);
  if (watch) lines.push(`\n⚠️ <b>Watch:</b> ${tgEsc(watch)}`);
  const slug = c.slug || tgSlug(c.name);
  const kb = [];
  const linked = row && row.pid;
  if (linked) kb.push([{ text: '➕ Add to my plan', callback_data: 'cadd:' + c.id }, { text: '⚠️ Check with my stack', callback_data: 'cchk:' + c.id }]);
  kb.push([{ text: '📖 Full page (evidence, cost, links)', url: `${SITE_URL}/c/${slug}` }]);
  return { text: lines.join('\n'), kb };
}

// ---- Protocol functions (mirrors site/app.js PLAN_FUNCTIONS — keep the two in sync) ----
const TG_FUNCTIONS = [
  { id: 'walk', icon: '🚶', name: 'Post-meal walk timer', kind: 'timer', target: 10, unit: 'min', how: 'A 10-min walk after your biggest meal blunts the glucose spike. Tap ✓ when done.', match: ['glucose', 'insulin', 'blood sugar', 'metabolic', 'diabet', 'a1c'] },
  { id: 'breath', icon: '🌬️', name: 'Box-breathing timer', kind: 'timer', target: 4, unit: 'min', how: '4 minutes of 4-4-4-4 breathing when stress hits. Tap ✓ when done.', match: ['anx', 'stress', 'cortisol', 'panic', 'overwhelm', 'nervous'] },
  { id: 'plants', icon: '🥦', name: 'Plant-diversity counter', kind: 'counter', target: 30, unit: 'plants', period: 'week', how: '30+ different plants a week feeds a diverse microbiome. Tap + for each new plant.', match: ['gut', 'microbiome', 'fiber', 'digest', 'bloat', 'ibs', 'constipat'] },
  // progressive-overload logging now lives per-exercise in the web tracker, so it's no longer a selectable tool here
  { id: 'steps', icon: '👟', name: 'Daily step counter', kind: 'counter', target: 8000, unit: 'steps', period: 'day', how: 'Log steps toward 8,000/day. Tap + to add 500.', match: ['fat', 'weight', 'cardio', 'endur', 'sedentary', 'circulation'] },
  { id: 'hydration', icon: '💧', name: 'Hydration counter', kind: 'counter', target: 8, unit: 'glasses', period: 'day', how: 'Tap + for each glass. Target 8 a day.', match: ['energy', 'skin', 'headache', 'focus', 'fatigue', 'kidney'] },
  { id: 'protein', icon: '🥩', name: 'Protein-per-meal', kind: 'counter', target: 4, unit: 'protein meals', period: 'day', how: 'Tap + for each meal with a palm of protein. Aim for 3–4 a day — no weighing.', match: ['muscle', 'strength', 'hypertrophy', 'sarcopenia', 'lean mass', 'menopause', 'craving', 'appetite', 'satiety'] },
  { id: 'fermented', icon: '🥬', name: 'Fermented-foods counter', kind: 'counter', target: 3, unit: 'servings', period: 'day', how: 'Tap + per serving — yoghurt, kefir, kimchi, sauerkraut, kombucha.', match: ['gut', 'microbiome', 'digest', 'bloat', 'ibs', 'immun', 'inflamm'] },
  { id: 'pain', icon: '🚦', name: 'Pain traffic-light', kind: 'triage', how: 'After rehab, tap 🟢 fine / 🟡 sore / 🔴 sharp — I tell you to progress, hold or back off.', match: ['pain', 'knee', 'back', 'neck', 'shoulder', 'hip', 'tendin', 'tendon', 'joint', 'stiff', 'ache', 'rehab', 'sciatic', 'plantar'] },
  { id: 'eatwin', icon: '⏳', name: 'Eating-window', kind: 'window', target: 10, how: 'Tap first bite / kitchen closed — I track your eating window vs a 10h target.', match: ['insulin', 'glucose', 'visceral', 'belly', 'fat', 'metabolic', 'fasting', 'blood sugar'] },
  { id: 'bp', icon: '🩺', name: 'Home blood-pressure', kind: 'bp', how: 'Send “bp: 120 80” — I log it and flag when it needs a doctor.', match: ['blood pressure', 'hypertension', 'bp', 'cardiovascular', 'cholesterol'] },
  { id: 'adhere', icon: '📅', name: 'Daily-dose adherence', kind: 'adherence', how: 'Tap ✅ each day you apply it — I track your streak.', match: ['hair', 'minoxidil', 'finasteride', 'tretinoin', 'acne', 'skin', 'hormonal treatment', 'thyroid'] },
  { id: 'win', icon: '🌟', name: 'One small win', kind: 'log', how: 'Send “win: …” — naming one tiny win a day lifts low mood.', match: ['depress', 'low mood', 'anhedonia', 'burnout', 'motivation'] },
  { id: 'symptom', icon: '📈', name: 'Symptom check', kind: 'scale', trend: true, scale: [{ v: 1, e: '😣' }, { v: 2, e: '😕' }, { v: 3, e: '😐' }, { v: 4, e: '🙂' }, { v: 5, e: '😄' }], how: 'Tap how you feel today — see the trend over time.', match: ['menopause', 'hot flash', 'migraine', 'headache', 'acne', 'breakout', 'brain fog', 'fog', 'inflamm', 'flare', 'ibs', 'mood'] },
  { id: 'readiness', icon: '🔋', name: 'Readiness check', kind: 'scale', scale: [{ v: 1, e: '😴', label: 'Wiped', g: 'take it easy or rest today' }, { v: 2, e: '😐', label: 'OK', g: 'train as planned' }, { v: 3, e: '💪', label: 'Fresh', g: 'good day to push' }], how: 'Tap how recovered you feel — push or back off.', match: ['overtrain', 'recovery', 'under-recover', 'fatigue', 'plateau', 'burnout'] },
  { id: 'sigh', icon: '🌬️', name: 'Physiological sigh', kind: 'timer', target: 2, unit: 'min', how: 'Two inhales through the nose, one long exhale. Repeat 2 min. In a spike: sigh ×3 · name 3 things you see · sip water.', match: ['anx', 'panic', 'cortisol', 'overwhelm', 'nervous', 'racing'] },
  { id: 'craving', icon: '🌊', name: 'Craving-surf timer', kind: 'timer', target: 10, unit: 'min', how: 'When a craving hits, do something else for 10 min — it almost always passes.', match: ['craving', 'appetite', 'sugar', 'snack', 'binge'] },
  { id: 'focus', icon: '🎯', name: 'Focus blocks', kind: 'counter', target: 4, unit: 'blocks', period: 'day', how: 'Write your ONE next step, do a 25-min block, tap +. Jot the next step before each break. Aim for 4/day.', match: ['focus', 'adhd', 'concentration', 'brain fog', 'procrastin', 'distract', 'productivity'] },
  { id: 'zone2', icon: '🏃', name: 'Zone-2 minutes', kind: 'counter', target: 150, unit: 'min', period: 'week', step: 10, match: ['endur', 'longevity', 'healthspan', 'vo2', 'vascular', 'stamina', 'aerobic'], how: 'Log easy conversational-pace minutes. Aim for 150 a week.' },
  { id: 'sleepwin', icon: '🛏️', name: 'Sleep-window tracker', kind: 'sleep', how: 'CBT-I sleep restriction — send “sleep: 23:30 00:10 07:00” (in bed · asleep · woke) and I track your sleep efficiency and when to shift your bedtime.', match: ['sleep', 'insomnia', 'fall asleep', 'waking', 'awake', 'circadian', 'tired', 'jet lag', 'restless'] },
  { id: 'wake', icon: '⏰', name: 'Fixed wake-time reminder', kind: 'reminder', how: 'A constant wake time anchors your body clock. I nudge you nightly to protect wind-down.', match: ['sleep', 'insomnia', 'circadian', 'tired', 'wake', 'jet lag'], tgOnly: true },
  { id: 'sunlight', icon: '☀️', name: 'Morning-sunlight reminder', kind: 'reminder', how: '10 min of morning light sets your clock. I remind you within an hour of waking.', match: ['mood', 'vitamin d', 'seasonal', 'depress', 'low energy', 'winter'], tgOnly: true },
];
function tgFnById(id) { return TG_FUNCTIONS.find(f => f.id === id); }
function tgDefaultFunction(key) {
  const p = TG_PROTO[key] || {}; const k = p.keystone || {};
  const hay = [p.problem, p.rc, k.one, k.why].filter(Boolean).join(' ').toLowerCase();
  const hit = TG_FUNCTIONS.find(f => f.match.some(m => hay.includes(m)));
  return (hit || tgFnById('hydration')).id;
}
function tgWeekKey() { const d = new Date(); const day = (d.getUTCDay() + 6) % 7; d.setUTCDate(d.getUTCDate() - day); return d.toISOString().slice(0, 10); }
// Normalise the per-day / per-week function state, resetting stale buckets (preserves t.sleep history)
function tgTools(row) {
  const t = (row && row.tools) || {}; const today = new Date().toISOString().slice(0, 10); const wk = tgWeekKey();
  if (!t.d || t.d.date !== today) t.d = { date: today, c: {}, done: {} };
  if (!t.w || t.w.key !== wk) t.w = { key: wk, c: {} };
  return t;
}
// ---- Sleep-window (CBT-I) helpers (mirror site/app.js) ----
function tgSlpMin(t) { if (!t) return null; t = String(t).trim(); let h, m; if (/^\d{3,4}$/.test(t)) { t = t.padStart(4, '0'); h = +t.slice(0, 2); m = +t.slice(2); } else if (/^\d{1,2}:\d{2}$/.test(t)) { [h, m] = t.split(':').map(Number); } else return null; if (h > 23 || m > 59) return null; return h * 60 + m; }
function tgComputeSleep(inBed, asleep, woke) { const ib = tgSlpMin(inBed), as = tgSlpMin(asleep), wk = tgSlpMin(woke); if (ib == null || as == null || wk == null) return null; const norm = x => x < ib ? x + 1440 : x; const tib = norm(wk) - ib, tst = norm(wk) - norm(as); if (tib <= 0 || tst <= 0 || tst > tib) return null; return { tib, tst, se: Math.min(100, Math.round(tst / tib * 100)) }; }
function tgSleepEff7(row) { const t = (row && row.tools && row.tools.sleep) || {}; let sum = 0, n = 0; for (let i = 0; i < 7; i++) { const d = new Date(); d.setDate(d.getDate() - i); const e = t[d.toISOString().slice(0, 10)]; if (e && e.se != null) { sum += e.se; n++; } } return { avg: n ? Math.round(sum / n) : 0, nights: n }; }
function tgSleepRec(avg, nights) { if (nights < 3) return 'Log 3+ nights for your sleep-window guidance.'; if (avg >= 90) return 'Efficient — try bed 15 min earlier tonight.'; if (avg >= 85) return 'Dialed in — hold this window, fixed wake time.'; return 'Tighten: bed 15 min later, keep the same wake time.'; }
// Sync the bot's protocol (supps + functions) into the linked account's v2 web plan — creating it if needed.
async function tgUpsertWebProtocol(row) {
  if (!row || !row.user_id || !db.enabled || !row.pid) return;
  try {
    const r = (await db.query('SELECT plan FROM user_plans WHERE user_id=$1', [row.user_id])).rows[0];
    let plan = (r && r.plan) || { v: 2, protocols: [], draft: null, log: {}, fnWeek: {}, tools: {} };
    if (!Array.isArray(plan.protocols)) plan.protocols = []; plan.v = 2;
    const supps = (row.sel && Array.isArray(row.sel.supps)) ? row.sel.supps : undefined;
    let entry = plan.protocols.find(x => x.pid === row.pid && x.rcid === row.rcid);
    if (!entry) { entry = { pid: row.pid, rcid: row.rcid, startedAt: new Date().toISOString().slice(0, 10) }; plan.protocols.push(entry); }
    if (supps !== undefined) entry.supps = supps;
    entry.functions = row.functions || [];
    if (r) await db.query('UPDATE user_plans SET plan=$2, updated_at=now() WHERE user_id=$1', [row.user_id, JSON.stringify(plan)]);
    else await db.query('INSERT INTO user_plans(user_id,plan,updated_at) VALUES($1,$2,now())', [row.user_id, JSON.stringify(plan)]);
  } catch (e) {}
}
// Mutate today's entry in the linked account's v2 web plan (e.g. mark a keystone / log food) so web stays in sync.
async function tgSyncWebDay(row, mutate) {
  if (!row || !row.user_id || !db.enabled) return;
  try {
    const r = (await db.query('SELECT plan FROM user_plans WHERE user_id=$1', [row.user_id])).rows[0];
    if (!r || !r.plan) return; const plan = r.plan; const tk = new Date().toISOString().slice(0, 10);
    plan.log = plan.log || {}; const d = plan.log[tk] = plan.log[tk] || {};
    d.keystones = d.keystones || {}; d.done = d.done || []; d.sets = d.sets || {}; d.food = d.food || []; d.fn = d.fn || {};
    mutate(d, plan);
    await db.query('UPDATE user_plans SET plan=$2, updated_at=now() WHERE user_id=$1', [row.user_id, JSON.stringify(plan)]);
  } catch (e) {}
}
// Mint a share code for a built plan (so a bot-built protocol can be handed to clients with exact selections)
async function tgMakeShareCode(pid, rcid, sel, userId) {
  if (!db.enabled) return null;
  try { const code = crypto.randomBytes(6).toString('base64url'); await db.query('INSERT INTO shared_plans(code,author_user_id,pid,rcid,plan) VALUES($1,$2,$3,$4,$5)', [code, userId || null, pid, rcid, JSON.stringify(sel)]); return code; } catch (e) { return null; }
}

// ---- Build-a-plan inside the chat (mirrors the site's builder) ----
function tgEdit(chatId, msgId, text, kb) { return tgApi('editMessageText', Object.assign({ chat_id: chatId, message_id: msgId, text, parse_mode: 'HTML', disable_web_page_preview: true }, kb ? { reply_markup: { inline_keyboard: kb } } : {})); }
async function tgBuildStart(chatId) {
  const cats = TG_CAT_KEYS(); if (!cats.length) return tgSend(chatId, `Building isn't available right now — try ${SITE_URL}/solve.`);
  const kb = cats.map((c, i) => [{ text: c, callback_data: 'bc:' + i }]);
  await db.query('UPDATE telegram_users SET flow=$2 WHERE chat_id=$1', [chatId, JSON.stringify({ stage: 'cat' })]);
  return tgSend(chatId, `🧬 <b>Let's build your plan.</b>\nWhat do you want to work on?`, { reply_markup: { inline_keyboard: kb } });
}
function tgBuildCatKb() { return TG_CAT_KEYS().map((c, i) => [{ text: c, callback_data: 'bc:' + i }]); }
function tgBuildCategory(chatId, msgId, catIdx) {
  const cat = TG_CAT_KEYS()[+catIdx]; const probs = TG_CATS[cat] || [];
  const kb = probs.map(p => [{ text: (p.icon ? p.icon + ' ' : '') + p.name, callback_data: 'bp:' + p.pid }]);
  kb.push([{ text: '‹ Back', callback_data: 'bcback' }]);
  return tgEdit(chatId, msgId, `<b>${tgEsc(cat)}</b> — pick your problem:`, kb);
}
async function tgBuildProblem(chatId, msgId, pid) {
  const prob = tgFindProblem(pid); if (!prob) return;
  if (prob.rcs.length === 1) { await tgBuildSetRc(chatId, pid, prob.rcs[0].id); return tgBuildStack(chatId, msgId); }
  await db.query('UPDATE telegram_users SET flow=$2 WHERE chat_id=$1', [chatId, JSON.stringify({ stage: 'rc', pid })]);
  const kb = prob.rcs.map(r => [{ text: r.plain.slice(0, 60), callback_data: 'br:' + r.id }]);
  return tgEdit(chatId, msgId, `<b>${tgEsc(prob.name)}</b> — which sounds most like you?`, kb);
}
async function tgBuildSetRc(chatId, pid, rcid) {
  const stack = (TG_PROTO[pid + '/' + rcid] || {}).stack || [];
  const dflt = stack.filter(c => !tgGated(c)).map(c => c.id);   // prescription-only/controlled supplements start OFF — a deliberate tap enables them
  await db.query('UPDATE telegram_users SET flow=$2 WHERE chat_id=$1', [chatId, JSON.stringify({ stage: 'stack', pid, rcid, supps: dflt })]);
}
async function tgBuildStack(chatId, msgId) {
  const row = await tgGet(chatId); const flow = (row && row.flow) || {};
  const proto = TG_PROTO[(flow.pid || '') + '/' + (flow.rcid || '')]; const stack = (proto && proto.stack) || [];
  if (!proto) return tgSend(chatId, `Something went off-track — /build to start again.`);
  if (!stack.length) return tgBuildConfirm(chatId, msgId);
  const sel = new Set(flow.supps || []);
  // each supplement: a toggle + an ℹ️ that opens its card in a separate message (never disturbs this wizard)
  const kb = stack.map(c => [{ text: (sel.has(c.id) ? '✓ ' : '○ ') + c.name + (tgGated(c) ? ' 🔵' : ''), callback_data: 'bs:' + c.id }, { text: 'ℹ️', callback_data: 'binfo:' + c.id }]);
  kb.push([{ text: (!flow.supps || !flow.supps.length ? '✓ ' : '') + '🍚 Food only', callback_data: 'bfood' }]);
  kb.push([{ text: '⚡ Use recommended plan', callback_data: 'bexpress' }]);
  kb.push([{ text: '🧩 Next: your tools →', callback_data: 'bdone' }]);
  const hasGated = stack.some(c => tgGated(c));
  const text = `<b>${tgEsc(proto.problem)}</b> — keep or drop each supplement, tap ℹ️ to learn about one, then continue.${hasGated ? '\n🔵 = prescription-only (off by default — add only if your doctor prescribed it).' : ''}`;
  return msgId ? tgEdit(chatId, msgId, text, kb) : tgSend(chatId, text, { reply_markup: { inline_keyboard: kb } });
}
// Final build stage: pick the interactive tools. Collapsed by default (just the matched ⭐ tool); "Add more" expands the full list.
async function tgBuildFunctions(chatId, msgId, expanded) {
  const row = await tgGet(chatId); const flow = (row && row.flow) || {};
  if (!flow.pid || !flow.rcid) return tgSend(chatId, `Something went off-track — /build to start again.`);
  const key = flow.pid + '/' + flow.rcid; const defId = tgDefaultFunction(key);
  if (!Array.isArray(flow.functions)) { flow.functions = [defId]; await db.query('UPDATE telegram_users SET flow=$2 WHERE chat_id=$1', [chatId, JSON.stringify(flow)]); }
  const sel = new Set(flow.functions); const def = tgFnById(defId);
  if (!expanded && def) {
    const text = `🧩 <b>Your tool</b> — one small thing that makes it stick.\n\n${def.icon} <b>${tgEsc(def.name)}</b> ⭐\n<i>${tgEsc(def.how)}</i>\n\nThis one's matched to your goal. Add more if you like, or build now.`;
    const kb = [[{ text: '➕ Add more tools', callback_data: 'bmore' }], [{ text: '✅ Build my protocol', callback_data: 'bfin' }]];
    return msgId ? tgEdit(chatId, msgId, text, kb) : tgSend(chatId, text, { reply_markup: { inline_keyboard: kb } });
  }
  const ordered = [def, ...TG_FUNCTIONS.filter(f => f.id !== defId)].filter(Boolean);
  const lines = ordered.map(f => `${f.icon} <b>${tgEsc(f.name)}</b>${f.id === defId ? ' ⭐' : ''}${f.tgOnly ? ' <i>(chat only)</i>' : ''}\n<i>${tgEsc(f.how)}</i>`).join('\n\n');
  const kb = ordered.map(f => [{ text: (sel.has(f.id) ? '✓ ' : '○ ') + f.icon + ' ' + f.name + (f.tgOnly ? ' 📲' : ''), callback_data: 'bt:' + f.id }]);
  kb.push([{ text: '✅ Build my protocol', callback_data: 'bfin' }]);
  const text = `🧩 <b>Your tools</b> — tap any you'll actually use.\n⭐ one's matched to your goal.\n\n${lines}`;
  return msgId ? tgEdit(chatId, msgId, text, kb) : tgSend(chatId, text, { reply_markup: { inline_keyboard: kb } });
}
async function tgBuildFnToggle(chatId, msgId, id) {
  const row = await tgGet(chatId); const flow = (row && row.flow) || {}; const cur = new Set(flow.functions || []);
  if (cur.has(id)) cur.delete(id); else cur.add(id); flow.functions = [...cur];
  await db.query('UPDATE telegram_users SET flow=$2 WHERE chat_id=$1', [chatId, JSON.stringify(flow)]);
  return tgBuildFunctions(chatId, msgId, true); // toggling happens in the expanded view
}
async function tgBuildToggle(chatId, msgId, compId) {
  const row = await tgGet(chatId); const flow = (row && row.flow) || {}; const cur = new Set(flow.supps || []);
  if (cur.has(compId)) cur.delete(compId); else cur.add(compId);
  flow.supps = [...cur]; await db.query('UPDATE telegram_users SET flow=$2 WHERE chat_id=$1', [chatId, JSON.stringify(flow)]);
  return tgBuildStack(chatId, msgId);
}
async function tgBuildFoodOnly(chatId, msgId) {
  const row = await tgGet(chatId); const flow = (row && row.flow) || {};
  const proto = TG_PROTO[(flow.pid || '') + '/' + (flow.rcid || '')]; const stack = (proto && proto.stack) || [];
  flow.supps = (flow.supps && flow.supps.length) ? [] : stack.map(c => c.id);
  await db.query('UPDATE telegram_users SET flow=$2 WHERE chat_id=$1', [chatId, JSON.stringify(flow)]);
  return tgBuildStack(chatId, msgId);
}
async function tgBuildConfirm(chatId, msgId) {
  const row = await tgGet(chatId); const flow = (row && row.flow) || {};
  if (!flow.pid || !flow.rcid) return tgSend(chatId, `Something went off-track — /build to start again.`);
  const fns = (Array.isArray(flow.functions) && flow.functions.length) ? flow.functions : [tgDefaultFunction(flow.pid + '/' + flow.rcid)];
  await db.query('UPDATE telegram_users SET pid=$2, rcid=$3, sel=$4, functions=$5, flow=$6 WHERE chat_id=$1', [chatId, flow.pid, flow.rcid, JSON.stringify({ supps: flow.supps || [] }), JSON.stringify(fns), JSON.stringify({})]);
  const saved = await tgGet(chatId);
  await tgUpsertWebProtocol(saved); // sync this protocol into the linked account's web plan (creates it if needed)
  if (msgId) await tgApi('editMessageReplyMarkup', { chat_id: chatId, message_id: msgId, reply_markup: { inline_keyboard: [] } });
  const p = TG_PROTO[flow.pid + '/' + flow.rcid] || {}; const k = p.keystone;
  // mint a real share code so a client can open THIS exact plan (parity with the web share)
  const code = await tgMakeShareCode(flow.pid, flow.rcid, { supps: flow.supps || [], functions: fns }, saved && saved.user_id);
  const shareLink = code ? `${SITE_URL}/#/s/${code}` : `${SITE_URL}/protocol/${flow.pid}/${flow.rcid}`;
  const toolNames = fns.map(id => { const f = tgFnById(id); return f ? f.icon + ' ' + f.name : null; }).filter(Boolean).join(', ');
  const hasReminder = fns.some(id => { const f = tgFnById(id); return f && f.kind === 'reminder'; });
  const steps = tgKsSteps(k);
  // The keystone is the hero. Multi-action keystones show as a checklist so nothing feels lumped together.
  const ksBlock = steps
    ? `⭐ <b>Your keystone — do these today</b>\n${steps.map(s => `⬜ ${tgEsc(s)}`).join('\n')}`
    : `⭐ <b>Your one keystone</b>\n${k ? tgEsc(k.one) : 'See your full plan on the site.'}`;
  const body = `🎉 <b>Your ${tgEsc(p.problem || 'protocol')} plan is ready.</b>\n\n` +
    ksBlock + (k && k.why ? `\n<i>${tgEsc(k.why)}</i>` : '') +
    `\n\n${steps ? 'Tick each one off in ' : 'Do it today, then tap ✅ below — track it in '}<b>📋 Today</b>. Just type what you eat (e.g. <b>2 eggs</b>) and I'll log it toward your targets.` +
    (toolNames ? `\n\n🧩 <b>Tools:</b> ${toolNames}` : '') +
    (hasReminder && saved.nudge_hour == null ? `\n⏰ Your reminder needs a daily time — set it below.` : '') +
    `\n\nFull plan → ${SITE_URL}/protocol/${flow.pid}/${flow.rcid}`;
  const kb = [steps ? [{ text: '📋 Open today\'s checklist', callback_data: 'today' }] : [{ text: '✅ Did it today', callback_data: 'done' }, { text: '📋 Today', callback_data: 'today' }]];
  const r2 = [{ text: '📤 Share plan', url: shareLink }];
  if (hasReminder && saved.nudge_hour == null) r2.push({ text: '⏰ Set reminder', callback_data: 'gonudge' });
  kb.push(r2);
  if (!saved.user_id) kb.push([{ text: '🔗 Sync to my rnawiki.com account', callback_data: 'syncacct' }]); // Stage 1: optional, never a gate
  return tgSend(chatId, body, { reply_markup: { inline_keyboard: kb } });
}
// ---- Function dashboard (/tools) — counters, timers, reminders ----
function tgToolsView(row) {
  const fns = Array.isArray(row.functions) ? row.functions : []; const t = tgTools(row);
  const kb = []; const lines = [];
  fns.forEach(id => {
    const f = tgFnById(id); if (!f) return;
    if (f.kind === 'counter') {
      const v = (f.period === 'week' ? t.w.c : t.d.c)[id] || 0; const step = f.step || (f.unit === 'steps' ? 500 : 1);
      lines.push(`${f.icon} <b>${tgEsc(f.name)}</b>: ${v}/${f.target} ${f.unit}${f.period === 'week' ? ' this week' : ''}`);
      kb.push([{ text: `${f.icon} +${step} ${f.name}`, callback_data: 'tinc:' + id }]);
    } else if (f.kind === 'timer') {
      const done = !!t.d.done[id];
      lines.push(`${f.icon} <b>${tgEsc(f.name)}</b>: ${done ? '✅ done today' : '▫️ not yet'}`);
      if (!done) kb.push([{ text: `${f.icon} Mark ${f.name} done`, callback_data: 'tdone:' + id }]);
    } else if (f.kind === 'reminder') {
      lines.push(`${f.icon} <b>${tgEsc(f.name)}</b>: ${row.nudge_hour != null ? '🔔 on with your daily nudge' : '⏰ send /nudge to activate'}`);
    } else if (f.kind === 'log') {
      const last = (t.log || [])[(t.log || []).length - 1];
      lines.push(`${f.icon} <b>${tgEsc(f.name)}</b>: ${last ? 'last “' + tgEsc(last.text) + '”' : 'tap below ↓'}`);
      kb.push([{ text: `${f.icon} Add ${f.name}`, callback_data: 'ask:win' }]);
    } else if (f.kind === 'window') {
      const e = t.d.eat || {}; let s = '';
      if (e.first && e.last) { let dur = tgSlpMin(e.last) - tgSlpMin(e.first); if (dur < 0) dur += 1440; const h = Math.floor(dur / 60), mm = dur % 60; s = `${h}h${mm ? mm + 'm' : ''} (target ${f.target}h) ${dur <= f.target * 60 ? '✓' : '⚠️'}`; }
      else if (e.first) s = `open since ${e.first}`;
      lines.push(`${f.icon} <b>${tgEsc(f.name)}</b>: ${s || 'tap below ↓'}`);
      kb.push([{ text: '🍽️ First bite', callback_data: 'eat:' + id + ':first' }, { text: '🌙 Kitchen closed', callback_data: 'eat:' + id + ':last' }]);
    } else if (f.kind === 'bp') {
      const b = t.d.bp || {}; lines.push(`${f.icon} <b>${tgEsc(f.name)}</b>: ${b.sys ? b.sys + '/' + b.dia + ' today' : 'tap below ↓'}`);
      kb.push([{ text: '🩺 Log blood pressure', callback_data: 'ask:bp' }]);
    } else if (f.kind === 'adherence') {
      const done = !!t.d.done[id]; lines.push(`${f.icon} <b>${tgEsc(f.name)}</b>: ${done ? '✅ applied today' : '▫️ not yet'}`);
      if (!done) kb.push([{ text: '✅ Applied today', callback_data: 'adh:' + id }]);
    } else if (f.kind === 'sleep') {
      const e = tgSleepEff7(row);
      lines.push(`${f.icon} <b>${tgEsc(f.name)}</b>: ${e.nights ? e.avg + '% eff (7-night) — ' + tgSleepRec(e.avg, e.nights) : 'tap below ↓'}`);
      kb.push([{ text: '🛏️ Log last night\'s sleep', callback_data: 'ask:sleep' }]);
    } else if (f.kind === 'triage') {
      const v = (t.d.tri || {})[id]; const g = { green: '🟢 fine — progress a little', yellow: '🟡 sore — hold this level', red: '🔴 sharp — back off / rest' };
      lines.push(`${f.icon} <b>${tgEsc(f.name)}</b>: ${v ? g[v] : 'log after rehab ↓'}`);
      kb.push([{ text: '🟢 Fine', callback_data: 'tri:' + id + ':green' }, { text: '🟡 Sore', callback_data: 'tri:' + id + ':yellow' }, { text: '🔴 Sharp', callback_data: 'tri:' + id + ':red' }]);
    } else if (f.kind === 'scale') {
      const v = (t.d.tri || {})[id]; const opt = (f.scale || []).find(o => String(o.v) === String(v));
      lines.push(`${f.icon} <b>${tgEsc(f.name)}</b>: ${opt ? opt.e + (opt.label ? ' ' + opt.label : '') + (opt.g ? ' — ' + opt.g : '') : 'tap below ↓'}`);
      kb.push((f.scale || []).map(o => ({ text: o.e + (o.label ? ' ' + o.label : ''), callback_data: 'scl:' + id + ':' + o.v })));
    }
  });
  return { text: `🧩 <b>Your tools — today</b>\n\n${lines.join('\n')}`, kb };
}
async function tgSendTools(chatId, row) {
  if (!row || !row.pid) return tgSend(chatId, `/build a plan first, then I'll show your tools.`);
  if (!Array.isArray(row.functions) || !row.functions.length) return tgSend(chatId, `No tools on this protocol yet — /build to add some.`);
  const v = tgToolsView(row); return tgSend(chatId, v.text, v.kb.length ? { reply_markup: { inline_keyboard: v.kb } } : {});
}
async function tgToolInc(chatId, msgId, id) {
  const row = await tgGet(chatId); const f = tgFnById(id); if (!row || !f || f.kind !== 'counter') return;
  const t = tgTools(row); const step = f.step || (f.unit === 'steps' ? 500 : 1);
  if (f.period === 'week') t.w.c[id] = (t.w.c[id] || 0) + step; else t.d.c[id] = (t.d.c[id] || 0) + step;
  await db.query('UPDATE telegram_users SET tools=$2 WHERE chat_id=$1', [chatId, JSON.stringify(t)]);
  const newVal = f.period === 'week' ? t.w.c[id] : t.d.c[id];
  await tgSyncWebDay(row, (d, plan) => { if (f.period === 'week') { plan.fnWeek = plan.fnWeek || {}; const wk = tgWeekKey(); plan.fnWeek[wk] = plan.fnWeek[wk] || {}; plan.fnWeek[wk][id] = newVal; } else { d.fn[id] = newVal; } }); // mirror counter into web plan
  const v = tgToolsView(await tgGet(chatId)); return tgEdit(chatId, msgId, v.text, v.kb);
}
async function tgToolDone(chatId, msgId, id) {
  const row = await tgGet(chatId); const f = tgFnById(id); if (!row || !f || f.kind !== 'timer') return;
  const t = tgTools(row); t.d.done[id] = true;
  await db.query('UPDATE telegram_users SET tools=$2 WHERE chat_id=$1', [chatId, JSON.stringify(t)]);
  await tgSyncWebDay(row, d => { d.fn[id] = true; }); // mirror timer completion into web plan
  const v = tgToolsView(await tgGet(chatId)); return tgEdit(chatId, msgId, v.text, v.kb);
}
async function tgToolTriage(chatId, msgId, id, val) {
  const row = await tgGet(chatId); const f = tgFnById(id); if (!row || !f || f.kind !== 'triage') return;
  const t = tgTools(row); t.d.tri = t.d.tri || {}; t.d.tri[id] = val;
  await db.query('UPDATE telegram_users SET tools=$2 WHERE chat_id=$1', [chatId, JSON.stringify(t)]);
  await tgSyncWebDay(row, d => { d.fn[id] = val; }); // mirror into web plan
  const v = tgToolsView(await tgGet(chatId)); return tgEdit(chatId, msgId, v.text, v.kb);
}
async function tgToolScale(chatId, msgId, id, val) {
  const row = await tgGet(chatId); const f = tgFnById(id); if (!row || !f || f.kind !== 'scale') return;
  const t = tgTools(row); t.d.tri = t.d.tri || {}; t.d.tri[id] = val;
  await db.query('UPDATE telegram_users SET tools=$2 WHERE chat_id=$1', [chatId, JSON.stringify(t)]);
  await tgSyncWebDay(row, d => { d.fn[id] = +val; }); // web stores the numeric value
  const v = tgToolsView(await tgGet(chatId)); return tgEdit(chatId, msgId, v.text, v.kb);
}
function tgLocalHM(row) { const d = new Date(); let m = d.getUTCHours() * 60 + d.getUTCMinutes() + (row && row.tz_offset != null ? row.tz_offset : 480); m = ((m % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); }
async function tgToolEat(chatId, msgId, id, which) {
  const row = await tgGet(chatId); const f = tgFnById(id); if (!row || !f || f.kind !== 'window' || (which !== 'first' && which !== 'last')) return;
  const t = tgTools(row); t.d.eat = t.d.eat || {}; t.d.eat[which] = tgLocalHM(row);
  await db.query('UPDATE telegram_users SET tools=$2 WHERE chat_id=$1', [chatId, JSON.stringify(t)]);
  await tgSyncWebDay(row, d => { d.eat = d.eat || {}; d.eat[which] = t.d.eat[which]; });
  const v = tgToolsView(await tgGet(chatId)); return tgEdit(chatId, msgId, v.text, v.kb);
}
async function tgToolAdhere(chatId, msgId, id) {
  const row = await tgGet(chatId); const f = tgFnById(id); if (!row || !f || f.kind !== 'adherence') return;
  const t = tgTools(row); t.d.done[id] = true;
  await db.query('UPDATE telegram_users SET tools=$2 WHERE chat_id=$1', [chatId, JSON.stringify(t)]);
  await tgSyncWebDay(row, d => { d.fn[id] = true; });
  const v = tgToolsView(await tgGet(chatId)); return tgEdit(chatId, msgId, v.text, v.kb);
}
// Read whether this protocol's keystone is already marked done today in the linked web plan (web → bot direction)
async function tgWebKeystoneDone(row) {
  if (!row || !row.user_id || !db.enabled || !row.pid) return false;
  try { const r = (await db.query('SELECT plan FROM user_plans WHERE user_id=$1', [row.user_id])).rows[0]; const tk = new Date().toISOString().slice(0, 10); return !!(r && r.plan && r.plan.log && r.plan.log[tk] && r.plan.log[tk].keystones && r.plan.log[tk].keystones[row.pid + '/' + row.rcid]); } catch (e) { return false; }
}
const TG_NUT_LABEL = { protein_g: 'protein', fiber_g: 'fibre', sugar_g: 'sugar', kcal: 'calories', omega3_mg: 'omega-3', vitamin_c_mg: 'vitamin C', vitamin_d_iu: 'vitamin D', calcium_mg: 'calcium', magnesium_mg: 'magnesium', zinc_mg: 'zinc', iron_mg: 'iron', potassium_mg: 'potassium', sodium_mg: 'sodium', glycine_g: 'glycine', choline_mg: 'choline' };
const TG_NUT_UNIT = { protein_g: 'g', fiber_g: 'g', sugar_g: 'g', kcal: 'kcal', omega3_mg: 'mg', vitamin_c_mg: 'mg', vitamin_d_iu: 'IU', calcium_mg: 'mg', magnesium_mg: 'mg', zinc_mg: 'mg', iron_mg: 'mg', potassium_mg: 'mg', sodium_mg: 'mg', glycine_g: 'g', choline_mg: 'mg' };
function tgFindFoods(q) {
  q = (q || '').toLowerCase().trim(); if (q.length < 2) return [];
  return TG_FOODS.filter(f => f.hay.includes(q)).sort((a, b) => (b.sg - a.sg) || (a.name.length - b.name.length)).slice(0, 6);
}
// "2 eggs" / "2x eggs" / "three eggs" / "half avocado" → {qty, rest}; plain "eggs" → {qty:1, rest:"eggs"}
const TG_NUMWORD = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, half: 0.5 };
function tgParseQty(text) {
  const t = (text || '').trim();
  let m = t.match(/^(\d+(?:\.\d+)?)\s*[x×]?\s+(.+)$/i);              // "2 eggs", "2x eggs", "1.5 cups rice"
  if (m) { const q = parseFloat(m[1]); if (q > 0 && q <= 50) return { qty: q, rest: m[2].trim() }; }
  m = t.match(/^([a-z]+)\s+(.+)$/i);                                  // "three eggs", "half avocado"
  if (m && TG_NUMWORD[m[1].toLowerCase()] != null) return { qty: TG_NUMWORD[m[1].toLowerCase()], rest: m[2].trim() };
  return { qty: 1, rest: t };
}
// Calories + macros summed across the day's logged foods (× qty) — same fields/maths as the web macro card, authored data only.
function tgFoodMacros(items) {
  let kcal = 0, p = 0, c = 0, f = 0, any = false;
  (items || []).forEach(it => { const n = it.n || {}; const q = it.qty || 1; if (n.kcal != null) { kcal += n.kcal * q; any = true; } if (n.protein_g != null) { p += n.protein_g * q; any = true; } if (n.carbs_g != null) { c += n.carbs_g * q; any = true; } if (n.fat_g != null) { f += n.fat_g * q; any = true; } });
  if (!any) return '';
  return `🔥 <b>${Math.round(kcal)} kcal</b> · P ${Math.round(p)}g · C ${Math.round(c)}g · F ${Math.round(f)}g`;
}
function tgFoodProgress(row) {
  const key = (row.pid || '') + '/' + (row.rcid || ''); const proto = TG_PROTO[key];
  const nt = (proto && proto.nt) || {}; const keys = Object.keys(nt);
  const log = row.food_log || {}; const today = new Date().toISOString().slice(0, 10);
  const items = (log.date === today && Array.isArray(log.items)) ? log.items : [];
  if (!keys.length) return { text: items.length ? `Logged ${items.length} food${items.length > 1 ? 's' : ''} today.` : 'No food targets on this protocol.', items };
  const sum = {}; keys.forEach(k => sum[k] = 0);
  items.forEach(it => keys.forEach(k => { const v = it.n && it.n[k]; if (typeof v === 'number') sum[k] += v * (it.qty || 1); }));
  const lines = keys.map(k => {
    const t = nt[k]; const val = Math.round(sum[k]); const unit = TG_NUT_UNIT[k] || ''; const lbl = TG_NUT_LABEL[k] || k;
    if (t.type === 'limit') { const over = val > t.target; return `${over ? '⚠️' : '✅'} ${lbl}: ${val}/${t.target} ${unit} (limit)`; }
    const done = val >= t.target; return `${done ? '✅' : '▫️'} ${lbl}: ${val}/${t.target} ${unit}`;
  });
  return { text: lines.join('\n'), items };
}
async function tgLogFood(chatId, food, qty) {
  const row = await tgGet(chatId); if (!row) return;
  qty = qty && qty > 0 ? Math.min(qty, 50) : 1;
  const today = new Date().toISOString().slice(0, 10);
  let log = row.food_log && row.food_log.date === today ? row.food_log : { date: today, items: [] };
  if (!Array.isArray(log.items)) log.items = [];
  log.items.push({ id: food.id, name: food.name, serving: food.serving, n: food.n, qty });
  await db.query('UPDATE telegram_users SET food_log=$2, last_active=now() WHERE chat_id=$1', [chatId, JSON.stringify(log)]);
  await tgSyncWebDay(row, d => { d.food.push({ id: food.id, n: qty }); }); // mirror food into the v2 web plan (qty carries through)
  const prog = tgFoodProgress({ ...row, food_log: log });
  const macros = tgFoodMacros(log.items);
  const qlabel = qty !== 1 ? `${qty % 1 === 0 ? qty : qty.toFixed(1)}× ` : '';
  const body = `✅ Logged ${qlabel}<b>${tgEsc(food.name)}</b>${food.serving ? ' <i>(' + tgEsc(food.serving) + ')</i>' : ''}.` +
    (macros ? `\n\n${macros} <i>today</i>` : '') +
    `\n\n🍽️ <b>Toward your ${tgEsc((TG_PROTO[(row.pid || '') + '/' + (row.rcid || '')] || {}).problem || 'protocol')} targets:</b>\n${prog.text}\n\nType another food to keep going.`;
  return tgSend(chatId, body, { reply_markup: { inline_keyboard: [[{ text: '↩️ Undo', callback_data: 'foodundo' }, { text: '📋 Today', callback_data: 'today' }]] } });
}
async function tgFoodUndo(chatId) {
  const row = await tgGet(chatId); if (!row) return;
  const today = new Date().toISOString().slice(0, 10);
  const log = row.food_log && row.food_log.date === today ? row.food_log : null;
  if (!log || !Array.isArray(log.items) || !log.items.length) return tgSend(chatId, `Nothing to undo today.`);
  const removed = log.items.pop();
  await db.query('UPDATE telegram_users SET food_log=$2 WHERE chat_id=$1', [chatId, JSON.stringify(log)]);
  await tgSyncWebDay(row, d => { if (Array.isArray(d.food)) { for (let i = d.food.length - 1; i >= 0; i--) { if (d.food[i].id === removed.id) { d.food.splice(i, 1); break; } } } }); // remove the matching web-plan entry
  const prog = tgFoodProgress({ ...row, food_log: log });
  const macros = tgFoodMacros(log.items);
  return tgSend(chatId, `↩️ Removed <b>${tgEsc(removed.name)}</b>.${macros ? `\n\n${macros} <i>today</i>` : ''}\n\n${prog.text}`);
}
// ---- Add-a-food submission (guided) → the SAME user_foods pending queue the website uses ----
const TG_NF_CANCEL = { inline_keyboard: [[{ text: '✖️ Cancel', callback_data: 'nfcancel' }]] };
async function tgFoodSaveFlow(chatId, flow) { return db.query('UPDATE telegram_users SET flow=$2 WHERE chat_id=$1', [chatId, JSON.stringify(flow)]); }
async function tgFoodAddStart(chatId) {
  const row = await tgGet(chatId); const flow = (row && row.flow) || {}; const nf = flow.newfood || {};
  flow.newfood = { name: nf.name || '' };
  if (!flow.newfood.name) { flow.stage = 'nf_name'; await tgFoodSaveFlow(chatId, flow); return tgSend(chatId, `🥗 <b>Add a food</b>\nWhat's it called? (e.g. Filet-O-Fish)`, { reply_markup: TG_NF_CANCEL }); }
  flow.stage = 'nf_serving'; await tgFoodSaveFlow(chatId, flow);
  return tgSend(chatId, `🥗 <b>Add “${tgEsc(flow.newfood.name)}”</b>\nWhat's one serving? (e.g. “1 sandwich”, “100 g”, “1 fillet”)`, { reply_markup: TG_NF_CANCEL });
}
async function tgFoodAddStep(chatId, row, text) {
  const flow = row.flow; const nf = flow.newfood || (flow.newfood = {}); const st = flow.stage;
  const num = s => { const v = parseFloat(String(s).replace(/[^\d.]/g, '')); return isFinite(v) ? v : null; };
  if (/^\/?(cancel|stop)$/i.test(text)) { flow.stage = null; flow.newfood = null; await tgFoodSaveFlow(chatId, flow); return tgSend(chatId, `No worries — cancelled.`); }
  if (st === 'nf_name') { nf.name = text.slice(0, 80); flow.stage = 'nf_serving'; await tgFoodSaveFlow(chatId, flow); return tgSend(chatId, `Serving size? (e.g. “1 sandwich”, “100 g”)`, { reply_markup: TG_NF_CANCEL }); }
  if (st === 'nf_serving') { nf.serving = text.slice(0, 60); flow.stage = 'nf_kcal'; await tgFoodSaveFlow(chatId, flow); return tgSend(chatId, `Calories per serving? (kcal — just a number)`, { reply_markup: TG_NF_CANCEL }); }
  if (st === 'nf_kcal') { const v = num(text); if (v == null) return tgSend(chatId, `Just a number, e.g. <b>380</b>.`, { reply_markup: TG_NF_CANCEL }); nf.kcal = Math.round(v); flow.stage = 'nf_macros'; await tgFoodSaveFlow(chatId, flow); return tgSend(chatId, `Macros in grams — send <b>protein carbs fat</b> together, e.g. <b>26 46 19</b>.`, { reply_markup: { inline_keyboard: [[{ text: '⏭️ Skip macros', callback_data: 'nfskip' }], [{ text: '✖️ Cancel', callback_data: 'nfcancel' }]] } }); }
  if (st === 'nf_macros') {
    const nums = String(text).split(/[^\d.]+/).map(parseFloat).filter(n => isFinite(n));
    if (nums.length) { nf.protein_g = nums[0] != null ? nums[0] : null; nf.carbs_g = nums[1] != null ? nums[1] : null; nf.fat_g = nums[2] != null ? nums[2] : null; }
    flow.stage = 'nf_photo'; await tgFoodSaveFlow(chatId, flow);
    return tgSend(chatId, `Optional: send a <b>photo</b> of it, or skip and submit.`, { reply_markup: { inline_keyboard: [[{ text: '⏭️ Skip photo & submit', callback_data: 'nfsubmit' }], [{ text: '✖️ Cancel', callback_data: 'nfcancel' }]] } });
  }
  if (st === 'nf_photo') { if (/^\/?skip$/i.test(text)) return tgFoodSubmit(chatId, row); return tgSend(chatId, `Send a photo, or tap “Skip photo & submit”.`, { reply_markup: { inline_keyboard: [[{ text: '⏭️ Skip photo & submit', callback_data: 'nfsubmit' }]] } }); }
}
async function tgFoodAddSkip(chatId) {
  const row = await tgGet(chatId); const flow = (row && row.flow) || {};
  if (flow.stage === 'nf_macros') { flow.stage = 'nf_photo'; await tgFoodSaveFlow(chatId, flow); return tgSend(chatId, `Optional: send a <b>photo</b> of it, or skip and submit.`, { reply_markup: { inline_keyboard: [[{ text: '⏭️ Skip photo & submit', callback_data: 'nfsubmit' }], [{ text: '✖️ Cancel', callback_data: 'nfcancel' }]] } }); }
  if (flow.stage === 'nf_photo') return tgFoodSubmit(chatId, row);
}
async function tgFoodSubmit(chatId, row) {
  const flow = (row && row.flow) || {}; const nf = flow.newfood;
  if (!nf || !nf.name) { flow.stage = null; flow.newfood = null; await tgFoodSaveFlow(chatId, flow); return tgSend(chatId, `Nothing to submit — send /start to begin again.`); }
  if (!db.enabled) return tgSend(chatId, `Can't save right now — please try again later.`);
  const data = {}; ['kcal', 'protein_g', 'carbs_g', 'fat_g'].forEach(k => { if (nf[k] != null) data[k] = nf[k]; });
  if (nf.photo_file_id) data.photo_file_id = nf.photo_file_id;
  data.source = 'telegram';
  let id = null;
  try { const r = await db.query('INSERT INTO user_foods(name,serving,data,submitted_by,status) VALUES($1,$2,$3,$4,$5) RETURNING id', [nf.name.slice(0, 80), nf.serving || null, JSON.stringify(data), row.user_id || null, 'pending']); id = r.rows[0].id; if (row.user_id) award(row.user_id, 'food_submit', 'food:' + id, 20).catch(() => {}); }
  catch (e) { console.error('[tg] food submit:', e.message); return tgSend(chatId, `Hmm — couldn't save that. Please try again.`); }
  // log it for the user now (bot-side only — it's pending, not yet a shared food id)
  const today = new Date().toISOString().slice(0, 10);
  let log = (row.food_log && row.food_log.date === today) ? row.food_log : { date: today, items: [] }; if (!Array.isArray(log.items)) log.items = [];
  log.items.push({ name: nf.name, serving: nf.serving, n: data, qty: 1 });
  flow.stage = null; flow.newfood = null;
  await db.query('UPDATE telegram_users SET food_log=$2, flow=$3, last_active=now() WHERE chat_id=$1', [chatId, JSON.stringify(log), JSON.stringify(flow)]);
  const macros = tgFoodMacros(log.items);
  return tgSend(chatId, `✅ Thanks — <b>${tgEsc(nf.name)}</b> is submitted for review and logged for you today.${macros ? `\n\n${macros} <i>today</i>` : ''}\n\nOnce a dietitian approves it, it'll be searchable for everyone — here and on rnawiki.com. 🙏`);
}
function tgEsc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
async function tgApi(method, body) {
  if (!BOT_TOKEN) return null;
  try {
    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return await r.json();
  } catch (e) { console.error('[tg] api', method, e.message); return null; }
}
function tgSend(chatId, text, extra) { return tgApi('sendMessage', Object.assign({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }, extra || {})); }
async function tgGet(chatId) { return (await db.query('SELECT * FROM telegram_users WHERE chat_id=$1', [chatId])).rows[0]; }
function tgComputeStreak(days) {
  const set = new Set(days || []); let s = 0; const d = new Date();
  for (; ;) { const key = d.toISOString().slice(0, 10); if (set.has(key)) { s++; d.setDate(d.getDate() - 1); } else break; }
  return s;
}
async function tgSendKeystone(chatId, pid, rcid) {
  const p = TG_PROTO[(pid || '') + '/' + (rcid || '')];
  if (!p) return tgSend(chatId, `You're linked! Open ${SITE_URL}/solve and pick a protocol, then tap “📲 Coach me on Telegram”.`);
  const row = await tgGet(chatId);
  const v = await tgTodayView(row, { header: `✅ <b>You're set for ${tgEsc(p.problem)}</b> — ${tgEsc(p.rc)}.` });
  return tgSend(chatId, v.text, { reply_markup: { inline_keyboard: v.kb } });
}
async function tgMarkDone(chatId) {
  const row = await tgGet(chatId); if (!row) return;
  const today = new Date().toISOString().slice(0, 10);
  // multi-step keystone: "did it all" ticks every step so the checklist reflects completion
  const p = TG_PROTO[(row.pid || '') + '/' + (row.rcid || '')]; const steps = tgKsSteps(p && p.keystone);
  if (steps) { const t = tgTools(row); t.d.ks = {}; steps.forEach((_, i) => t.d.ks[i] = true); await db.query('UPDATE telegram_users SET tools=$2 WHERE chat_id=$1', [chatId, JSON.stringify(t)]); }
  let days = Array.isArray(row.keystone_days) ? row.keystone_days : [];
  if (days.includes(today)) return tgSend(chatId, `Already logged today ✅ — 🔥 <b>${row.streak}-day streak</b>. See you tomorrow!`);
  const prev = row.streak || 0;
  days = days.concat(today).slice(-120);
  const streak = tgComputeStreak(days);
  await db.query('UPDATE telegram_users SET keystone_days=$2, streak=$3, last_active=now() WHERE chat_id=$1', [chatId, JSON.stringify(days), streak]);
  if (row.pid) await tgSyncWebDay(row, d => { d.keystones[row.pid + '/' + row.rcid] = true; }); // mirror the tick into the web plan
  let msg;
  if (streak === 1 && prev >= 2) msg = `✅ Back on it — that's what matters. Missing a day doesn't undo the work; you just start again. 🔥 <b>Fresh streak: day 1.</b>`; // gentle recovery, never punishing
  else { const cheer = ['Nice.', 'That\'s the one thing.', 'Consistency wins.', 'This is how it compounds.', 'Love it.'][streak % 5]; msg = `✅ Logged! ${cheer} 🔥 <b>${streak}-day streak</b>${streak && streak % 7 === 0 ? ' — a full week 🎉' : ''}.`; }
  return tgSend(chatId, msg);
}
// ---- Shared logging paths (used by both typed prefixes AND the guided-prompt buttons — no memorised syntax required) ----
async function tgLogBp(chatId, row, str) {
  const nums = String(str).trim().split(/[\s/,]+/).map(Number).filter(n => n > 0 && n < 300);
  if (nums.length < 2) return tgSend(chatId, `Send it like <b>120 80</b> — systolic then diastolic.`);
  const sys = nums[0], dia = nums[1]; const t = tgTools(row); t.d.bp = { sys, dia };
  await db.query('UPDATE telegram_users SET tools=$2 WHERE chat_id=$1', [chatId, JSON.stringify(t)]);
  await tgSyncWebDay(row, d => { d.bp = { sys, dia }; });
  const g = (sys >= 160 || dia >= 100) ? '🔴 High — please see a doctor soon.' : (sys >= 140 || dia >= 90) ? '🟠 Above target — keep at the plan.' : (sys >= 130 || dia >= 80) ? '🟡 Slightly raised — on track.' : '🟢 In a healthy range.';
  return tgSend(chatId, `🩺 Logged <b>${sys}/${dia}</b>. ${g}`);
}
async function tgLogSleep(chatId, row, str) {
  const parts = String(str).trim().split(/[\s,]+/);
  const c = parts.length >= 3 ? tgComputeSleep(parts[0], parts[1], parts[2]) : null;
  if (!c) return tgSend(chatId, `Send three times like <b>23:30 00:10 07:00</b> — in bed · roughly asleep · woke.`);
  const tk = new Date().toISOString().slice(0, 10); const t = tgTools(row); t.sleep = t.sleep || {}; t.sleep[tk] = { inBed: parts[0], asleep: parts[1], woke: parts[2], se: c.se };
  await db.query('UPDATE telegram_users SET tools=$2 WHERE chat_id=$1', [chatId, JSON.stringify(t)]);
  await tgSyncWebDay(row, d => { d.sleep = { inBed: parts[0], asleep: parts[1], woke: parts[2], se: c.se, tib: c.tib, tst: c.tst }; });
  const e = tgSleepEff7(await tgGet(chatId));
  return tgSend(chatId, `🛏️ Logged — <b>${c.se}% sleep efficiency</b> last night (${Math.floor(c.tst / 60)}h${c.tst % 60}m asleep of ${Math.floor(c.tib / 60)}h${c.tib % 60}m in bed).\n\n7-night average: <b>${e.avg}%</b>\n${tgSleepRec(e.avg, e.nights)}`);
}
async function tgLogWin(chatId, row, str) {
  const entry = String(str).trim(); if (!entry) return tgSend(chatId, `Type your one small win from today.`);
  const t = tgTools(row); t.log = (t.log || []).concat({ date: new Date().toISOString().slice(0, 10), text: entry }).slice(-50);
  await db.query('UPDATE telegram_users SET tools=$2 WHERE chat_id=$1', [chatId, JSON.stringify(t)]);
  return tgSend(chatId, `🌟 Nice — “<b>${tgEsc(entry)}</b>”. That counts.`);
}
async function tgLogOverload(chatId, row, str) {
  const entry = String(str).trim(); if (!entry) return tgSend(chatId, `Type what you lifted, e.g. <b>squat 60kg x 8</b>.`);
  const t = tgTools(row); t.log = (t.log || []).concat({ date: new Date().toISOString().slice(0, 10), text: entry }).slice(-50);
  await db.query('UPDATE telegram_users SET tools=$2 WHERE chat_id=$1', [chatId, JSON.stringify(t)]);
  return tgSend(chatId, `🏋️ Logged: <b>${tgEsc(entry)}</b>. Beat it next time. /tools to review.`);
}
async function tgAskPrompt(chatId, what) {
  const prompts = { bp: '🩺 Send your reading as <b>systolic diastolic</b> — e.g. <b>120 80</b>.', sleep: '🛏️ Send three times — <b>in bed · asleep · woke</b>, e.g. <b>23:30 00:10 07:00</b>.', win: '🌟 What\'s one small win from today? Just type it.', log: '🏋️ What did you lift? Type it, e.g. <b>squat 60kg x 8</b>.' };
  if (!prompts[what]) return;
  const row = await tgGet(chatId); const flow = (row && row.flow) || {}; flow.stage = 'await_' + what;
  await db.query('UPDATE telegram_users SET flow=$2 WHERE chat_id=$1', [chatId, JSON.stringify(flow)]);
  return tgSend(chatId, prompts[what]);
}
// ---- Personal stack (protocol-selected supps + anything the user added from a compound card) ----
function tgUserStackObjs(row) {
  if (!row) return [];
  const p = TG_PROTO[(row.pid || '') + '/' + (row.rcid || '')];
  let stack = ((p && p.stack) || []).slice();
  const sel = row.sel && row.sel.supps; if (Array.isArray(sel)) stack = stack.filter(c => sel.includes(c.id));
  const saved = (row.tools && Array.isArray(row.tools.saved)) ? row.tools.saved : [];
  const extra = saved.filter(id => !stack.some(s => s.id === id)).map(id => { const c = TG_DATA && TG_DATA.compounds.find(x => x.id === id); return c ? { id: c.id, name: c.name, isRx: c.isRx, approvals: c.approvals, category: c.category, slug: tgSlug(c.name), added: true } : null; }).filter(Boolean);
  return stack.concat(extra);
}
async function tgCompoundAdd(chatId, id) {
  const row = await tgGet(chatId); const c = TG_DATA && TG_DATA.compounds.find(x => x.id === id); if (!row || !c) return;
  const t = tgTools(row); t.saved = Array.isArray(t.saved) ? t.saved : [];
  const already = t.saved.includes(id) || tgUserStackObjs(row).some(s => s.id === id && !s.added);
  if (already) return tgSend(chatId, `<b>${tgEsc(c.name)}</b> is already on your plan.`);
  t.saved.push(id); await db.query('UPDATE telegram_users SET tools=$2 WHERE chat_id=$1', [chatId, JSON.stringify(t)]);
  return tgSend(chatId, `➕ Added <b>${tgEsc(c.name)}</b> to your plan${tgGated(c) ? ' — 🔵 prescription, use only under a doctor' : ''}. It'll show in your /stack.`, { reply_markup: { inline_keyboard: [[{ text: '↩️ Undo', callback_data: 'cdel:' + id }, { text: '💊 My stack', callback_data: 'hub:stack' }]] } });
}
async function tgCompoundDel(chatId, id) {
  const row = await tgGet(chatId); if (!row) return; const t = tgTools(row); t.saved = (t.saved || []).filter(x => x !== id);
  await db.query('UPDATE telegram_users SET tools=$2 WHERE chat_id=$1', [chatId, JSON.stringify(t)]);
  const c = TG_DATA && TG_DATA.compounds.find(x => x.id === id);
  return tgSend(chatId, `↩️ Removed ${c ? '<b>' + tgEsc(c.name) + '</b>' : 'it'} from your plan.`);
}
async function tgCompoundCheck(chatId, id) {
  const row = await tgGet(chatId); const c = TG_DATA && TG_DATA.compounds.find(x => x.id === id); if (!row || !c) return;
  const stackObjs = tgUserStackObjs(row);
  const others = stackObjs.filter(s => s.id !== c.id);
  if (!others.length) return tgSend(chatId, `You've no other supplements on your plan yet to check <b>${tgEsc(c.name)}</b> against. Add a protocol or a few supplements first.`);
  const union = stackObjs.some(s => s.id === c.id) ? stackObjs : stackObjs.concat([{ id: c.id, name: c.name, category: c.category }]);
  const flags = tgStackFlags(union).filter(f => f.who.includes(c.name));
  if (!flags.length) return tgSend(chatId, `✅ No dangerous interactions flagged between <b>${tgEsc(c.name)}</b> and your current stack (${others.map(s => tgEsc(s.name)).join(', ')}).`);
  return tgSend(chatId, `⚠️ <b>${tgEsc(c.name)} + your stack:</b>\n` + flags.map(f => `${f.tier === 'danger' ? '☠️' : '⏰'} <b>${tgEsc(f.title)}</b> (${f.who.map(tgEsc).join(' + ')}) — ${tgEsc(f.action)}`).join('\n') + `\n\n<i>Educational, not a prescription.</i>`);
}
async function tgBuildExpress(chatId, msgId) {
  const row = await tgGet(chatId); const flow = (row && row.flow) || {};
  if (!flow.pid || !flow.rcid) return tgSend(chatId, `Start with /build.`);
  const stack = (TG_PROTO[flow.pid + '/' + flow.rcid] || {}).stack || [];
  flow.supps = stack.filter(c => !tgGated(c)).map(c => c.id);       // recommended = every over-the-counter supplement
  flow.functions = [tgDefaultFunction(flow.pid + '/' + flow.rcid)];  // the one matched tool
  await db.query('UPDATE telegram_users SET flow=$2 WHERE chat_id=$1', [chatId, JSON.stringify(flow)]);
  return tgBuildConfirm(chatId, msgId);
}
// Stage 1 — reverse account sync (bot → web). Mints a token tied to this chat; the site's ?tgsync= hook binds it.
async function tgSyncStart(chatId) {
  const row = await tgGet(chatId);
  if (row && row.user_id) return tgSend(chatId, `🔗 You're already synced to your rnawiki.com account.`);
  if (!db.enabled) return tgSend(chatId, `Sync isn't available right now — everything here still works.`);
  const token = crypto.randomBytes(9).toString('base64url');
  await db.query('INSERT INTO telegram_link_tokens(token, chat_id) VALUES($1,$2)', [token, chatId]);
  db.query("DELETE FROM telegram_link_tokens WHERE created_at < now() - interval '1 day'").catch(() => {});
  return tgSend(chatId, `🔗 <b>Sync to your account</b>\nOpen this link and sign in — your keystone, food, tools and progress will then stay in step across chat and site:\n${SITE_URL}/?tgsync=${token}\n\n<i>Optional — everything here works without it.</i>`);
}
async function tgSendProgress(chatId, row) {
  if (!row || !row.pid) return tgSend(chatId, `/build a plan first, then I can show your progress.`);
  const days = Array.isArray(row.keystone_days) ? row.keystone_days : []; const set = new Set(days);
  const streak = tgComputeStreak(days);
  const grid = []; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); grid.push(set.has(d.toISOString().slice(0, 10)) ? '🟩' : '⬜'); }
  let last30 = 0; for (let i = 0; i < 30; i++) { const d = new Date(); d.setDate(d.getDate() - i); if (set.has(d.toISOString().slice(0, 10))) last30++; }
  const t = tgTools(row); const fns = Array.isArray(row.functions) ? row.functions : [];
  const toolLines = fns.map(id => { const f = tgFnById(id); if (!f || f.kind !== 'counter') return null; const v = (f.period === 'week' ? t.w.c : t.d.c)[id] || 0; return `${f.icon} ${f.name}: ${v}/${f.target} ${f.unit}${f.period === 'week' ? ' this week' : ' today'}`; }).filter(Boolean);
  const body = `📊 <b>Your progress</b>\n\n🔥 <b>${streak}-day streak</b>\n${grid.join('')}  <i>last 7 days</i>\n✅ ${last30}/30 days this month${toolLines.length ? '\n\n' + toolLines.join('\n') : ''}\n\nKeep it going — <b>/done</b> when you've done today's keystone.`;
  return tgSend(chatId, body);
}
async function handleTgUpdate(update) {
  if (update.callback_query) {
    const cb = update.callback_query; const chatId = cb.message && cb.message.chat && cb.message.chat.id;
    const d = cb.data || ''; const msgId = cb.message && cb.message.message_id;
    // Enabling a prescription-only supplement pops a clear safety alert (still lets them proceed — informed choice).
    if (d.indexOf('bs:') === 0 && chatId) {
      const r = await tgGet(chatId); const flow = (r && r.flow) || {}; const comp = TG_DATA && TG_DATA.compounds.find(x => x.id === d.slice(3));
      const enabling = comp && !((flow.supps) || []).includes(comp.id);
      if (comp && tgGated(comp) && enabling) await tgApi('answerCallbackQuery', { callback_query_id: cb.id, text: '🔵 ' + comp.name + ' is prescription-only. Add it only if a doctor has prescribed it for you. Any timing shown is not a prescription.', show_alert: true });
      else await tgApi('answerCallbackQuery', { callback_query_id: cb.id });
      return tgBuildToggle(chatId, msgId, d.slice(3));
    }
    await tgApi('answerCallbackQuery', { callback_query_id: cb.id });
    if (!chatId) return;
    // --- daily hub + core ---
    if (d === 'done' || d === 'hub:done') return tgMarkDone(chatId);
    if (d.indexOf('ksd:') === 0) return tgKsTick(chatId, msgId, +d.slice(4));
    if (d === 'today') { const r = await tgGet(chatId); return r && r.pid ? tgSendToday(chatId, r) : tgSend(chatId, `/build a plan first.`); }
    if (d === 'gobuild') return tgBuildStart(chatId);
    if (d === 'gonudge') return tgNudgeStart(chatId);
    if (d === 'syncacct') return tgSyncStart(chatId);
    if (d === 'havecode') return tgSend(chatId, `Tap the link your clinic or trainer sent you — it opens your exact plan right here. If you were given a short code, send it as <b>/start &lt;code&gt;</b>.`);
    if (d === 'hub:tools') { const r = await tgGet(chatId); return tgSendTools(chatId, r); }
    if (d === 'hub:stack') { const r = await tgGet(chatId); return tgSendStack(chatId, r); }
    if (d === 'hub:sched') { const r = await tgGet(chatId); return tgSendSchedule(chatId, r); }
    if (d === 'hub:prog') { const r = await tgGet(chatId); return tgSendProgress(chatId, r); }
    if (d === 'hub:food') return tgSend(chatId, `🍽️ Just type what you ate — e.g. <b>2 eggs</b>, <b>chicken rice</b>, <b>oats</b>. I'll log it toward your targets.`);
    if (d === 'foodundo') return tgFoodUndo(chatId);
    if (d === 'addfood') return tgFoodAddStart(chatId);
    if (d === 'nfskip') return tgFoodAddSkip(chatId);
    if (d === 'nfsubmit') { const r = await tgGet(chatId); return tgFoodSubmit(chatId, r); }
    if (d === 'nfcancel') { const r = await tgGet(chatId); const fl = (r && r.flow) || {}; fl.stage = null; fl.newfood = null; await tgFoodSaveFlow(chatId, fl); return tgSend(chatId, `Cancelled — no food added.`); }
    if (d.indexOf('food:') === 0) { const r = await tgGet(chatId); const f = TG_FOODS.find(x => x.id === d.slice(5)); const q = (r && r.flow && r.flow.foodQty) || 1; if (r && r.flow && r.flow.foodQty) { const fl = r.flow; delete fl.foodQty; await db.query('UPDATE telegram_users SET flow=$2 WHERE chat_id=$1', [chatId, JSON.stringify(fl)]); } if (f) return tgLogFood(chatId, f, q); return; }
    // --- compound cards & actions ---
    if (d.indexOf('cinfo:') === 0) { const c = TG_DATA && TG_DATA.compounds.find(x => x.id === d.slice(6)); if (c) { const r = await tgGet(chatId); const card = tgCompoundCard(c, r); return tgSend(chatId, card.text, { reply_markup: { inline_keyboard: card.kb } }); } return; }
    if (d.indexOf('binfo:') === 0) { const c = TG_DATA && TG_DATA.compounds.find(x => x.id === d.slice(6)); if (c) { const card = tgCompoundCard(c, null); return tgSend(chatId, card.text, { reply_markup: { inline_keyboard: card.kb } }); } return; }
    if (d.indexOf('cadd:') === 0) return tgCompoundAdd(chatId, d.slice(5));
    if (d.indexOf('cdel:') === 0) return tgCompoundDel(chatId, d.slice(5));
    if (d.indexOf('cchk:') === 0) return tgCompoundCheck(chatId, d.slice(5));
    // --- guided prompts (replace memorised prefixes) ---
    if (d.indexOf('ask:') === 0) return tgAskPrompt(chatId, d.slice(4));
    // --- build wizard ---
    if (d.indexOf('bc:') === 0) return tgBuildCategory(chatId, msgId, d.slice(3));
    if (d === 'bcback') return tgEdit(chatId, msgId, `🧬 <b>Build your plan.</b> What do you want to work on?`, tgBuildCatKb());
    if (d.indexOf('bp:') === 0) return tgBuildProblem(chatId, msgId, d.slice(3));
    if (d.indexOf('br:') === 0) { const r = await tgGet(chatId); const pid = (r && r.flow && r.flow.pid); if (pid) { await tgBuildSetRc(chatId, pid, d.slice(3)); return tgBuildStack(chatId, msgId); } return; }
    if (d === 'bfood') return tgBuildFoodOnly(chatId, msgId);
    if (d === 'bexpress') return tgBuildExpress(chatId, msgId);
    if (d === 'bdone') return tgBuildFunctions(chatId, msgId, false);
    if (d === 'bmore') return tgBuildFunctions(chatId, msgId, true);
    if (d.indexOf('bt:') === 0) return tgBuildFnToggle(chatId, msgId, d.slice(3));
    if (d === 'bfin') return tgBuildConfirm(chatId, msgId);
    // --- tools dashboard ---
    if (d.indexOf('tinc:') === 0) return tgToolInc(chatId, msgId, d.slice(5));
    if (d.indexOf('tdone:') === 0) return tgToolDone(chatId, msgId, d.slice(6));
    if (d.indexOf('tri:') === 0) { const pp = d.split(':'); return tgToolTriage(chatId, msgId, pp[1], pp[2]); }
    if (d.indexOf('scl:') === 0) { const pp = d.split(':'); return tgToolScale(chatId, msgId, pp[1], pp[2]); }
    if (d.indexOf('eat:') === 0) { const pp = d.split(':'); return tgToolEat(chatId, msgId, pp[1], pp[2]); }
    if (d.indexOf('adh:') === 0) return tgToolAdhere(chatId, msgId, d.slice(4));
    // --- nudges ---
    if (d.indexOf('nh:') === 0) { const h = +d.slice(3); const r = await tgGet(chatId); const flow = (r && r.flow) || {}; flow.stage = 'nudge_tz'; flow.nudge_hour = h; await db.query('UPDATE telegram_users SET flow=$2 WHERE chat_id=$1', [chatId, JSON.stringify(flow)]); return tgEdit(chatId, msgId, `Great — I'll check in around <b>${tgHourLabel(h)}</b>. Last thing so I get your timezone right: what's the time where you are <b>right now</b>? Reply like <b>14:30</b> or <b>2:30pm</b>.`); }
    if (d === 'noff') { await db.query('UPDATE telegram_users SET nudge_hour=NULL, flow=$2 WHERE chat_id=$1', [chatId, JSON.stringify({})]); return tgEdit(chatId, msgId, `🔕 Daily nudges are off. /nudge to turn them back on.`); }
    return;
  }
  const msg = update.message; if (!msg || !msg.chat) return;
  const chatId = msg.chat.id; const text = (msg.text || '').trim();
  const first = (msg.from && msg.from.first_name) || msg.chat.first_name || '';
  await db.query(`INSERT INTO telegram_users(chat_id,first_name) VALUES($1,$2)
    ON CONFLICT(chat_id) DO UPDATE SET last_active=now(), active=true, first_name=COALESCE(EXCLUDED.first_name, telegram_users.first_name)`, [chatId, first || null]);
  // Photo during an add-a-food flow → capture the highest-resolution file_id and submit.
  if (msg.photo && Array.isArray(msg.photo) && msg.photo.length) {
    const rowP = await tgGet(chatId);
    if (rowP && rowP.flow && rowP.flow.stage === 'nf_photo') {
      const largest = msg.photo[msg.photo.length - 1]; const flow = rowP.flow; flow.newfood = flow.newfood || {}; flow.newfood.photo_file_id = largest.file_id;
      await db.query('UPDATE telegram_users SET flow=$2 WHERE chat_id=$1', [chatId, JSON.stringify(flow)]);
      return tgFoodSubmit(chatId, await tgGet(chatId));
    }
    return; // stray photo — ignore
  }
  if (text.startsWith('/start')) {
    const param = text.split(/\s+/)[1];
    if (param && param.indexOf('s_') === 0) { // a shared protocol (trainer → client)
      const code = param.slice(2);
      const sp = (await db.query('SELECT pid,rcid,plan FROM shared_plans WHERE code=$1', [code])).rows[0];
      if (sp) {
        db.query('UPDATE shared_plans SET clicks=clicks+1 WHERE code=$1', [code]).catch(() => {});
        const fns = (sp.plan && Array.isArray(sp.plan.functions) && sp.plan.functions.length) ? sp.plan.functions : [tgDefaultFunction(sp.pid + '/' + sp.rcid)];
        const supps = (sp.plan && (sp.plan.supps === 'none' ? [] : (Array.isArray(sp.plan.supps) ? sp.plan.supps : undefined)));
        await db.query('UPDATE telegram_users SET pid=$2, rcid=$3, functions=$4' + (supps !== undefined ? ', sel=$5' : '') + ' WHERE chat_id=$1', supps !== undefined ? [chatId, sp.pid, sp.rcid, JSON.stringify(fns), JSON.stringify({ supps })] : [chatId, sp.pid, sp.rcid, JSON.stringify(fns)]);
        const p = TG_PROTO[sp.pid + '/' + sp.rcid] || {};
        await tgSend(chatId, `📋 Someone shared their <b>${tgEsc(p.problem || 'protocol')}</b> plan with you. It's now yours to run — I'll coach you through it.`);
        return tgSendKeystone(chatId, sp.pid, sp.rcid);
      }
    }
    if (param && param.indexOf('s_') !== 0) {
      const t = (await db.query('SELECT * FROM telegram_link_tokens WHERE token=$1', [param])).rows[0];
      if (t) {
        // pull the web plan's chosen functions for THIS protocol (v2 per-protocol) so the bot mirrors them
        let fns = null;
        try { const pr = t.user_id ? (await db.query('SELECT plan FROM user_plans WHERE user_id=$1', [t.user_id])).rows[0] : null; if (pr && pr.plan) { const pl = pr.plan; if (Array.isArray(pl.protocols)) { const e = pl.protocols.find(x => x.pid === t.pid && x.rcid === t.rcid); if (e && Array.isArray(e.functions)) fns = e.functions; } else if (Array.isArray(pl.functions)) fns = pl.functions; } } catch (e) {}
        if (!fns || !fns.length) fns = [tgDefaultFunction(t.pid + '/' + t.rcid)];
        await db.query('UPDATE telegram_users SET user_id=$2, pid=$3, rcid=$4, functions=$5 WHERE chat_id=$1', [chatId, t.user_id, t.pid, t.rcid, JSON.stringify(fns)]);
        await db.query('DELETE FROM telegram_link_tokens WHERE token=$1', [param]);
        if (t.user_id) await tgSend(chatId, `🔗 <b>Linked to your rnawiki.com account.</b> Your keystone, food, tools and progress now sync both ways — track here or on the site, it stays in step.`);
        return tgSendKeystone(chatId, t.pid, t.rcid);
      }
    }
    return tgSend(chatId, `👋 Hi${first ? ' ' + tgEsc(first) : ''} — I'm your RNAwiki coach.\n\nI'll set you up with <b>one keystone habit</b>, log your food against its targets, and keep your streak going. Takes about a minute.`, { reply_markup: { inline_keyboard: [[{ text: '🧬 Build my plan', callback_data: 'gobuild' }], [{ text: '🔗 I have a link from my clinic', callback_data: 'havecode' }]] } });
  }
  const cmd = text.toLowerCase().replace(/^\//, '');
  const row = await tgGet(chatId);
  if (cmd === 'build' || cmd === 'newplan' || cmd === 'new' || cmd === 'build a plan') return tgBuildStart(chatId);
  if (cmd === 'keystone' || cmd === 'plan') {
    if (!row || !row.pid) return tgSend(chatId, `You haven't linked a protocol yet. Open ${SITE_URL}/solve and tap “📲 Coach me on Telegram”.`);
    return tgSendKeystone(chatId, row.pid, row.rcid);
  }
  if (cmd === 'today' || cmd === 'fuel') {
    if (!row || !row.pid) return tgSend(chatId, `Link a protocol first — open ${SITE_URL}/solve and tap “📲 Coach me on Telegram”.`);
    return tgSendToday(chatId, row);
  }
  if (cmd === 'progress' || cmd === 'stats') {
    if (!row || !row.pid) return tgSend(chatId, `/build a plan first, then I can show your progress.`);
    return tgSendProgress(chatId, row);
  }
  if (cmd === 'stack' || cmd === 'supplements' || cmd === 'supps') {
    if (!row || !row.pid) return tgSend(chatId, `Link a protocol first — ${SITE_URL}/solve → “📲 Coach me on Telegram”.`);
    return tgSendStack(chatId, row);
  }
  if (cmd === 'schedule' || cmd === 'when' || cmd === 'timing' || cmd === 'day') {
    if (!row || !row.pid) return tgSend(chatId, `/build a plan first, then I'll show your day.`);
    return tgSendSchedule(chatId, row);
  }
  if (cmd === 'tools' || cmd === 'dashboard' || cmd === 'functions') {
    if (!row || !row.pid) return tgSend(chatId, `/build a plan first — your tools come with it.`);
    return tgSendTools(chatId, row);
  }
  // Typed prefixes still work (backward compatible); the guided-prompt buttons route to the same helpers.
  if (/^log[:\s]/i.test(text) && row && Array.isArray(row.functions) && row.functions.includes('overload')) return tgLogOverload(chatId, row, text.replace(/^log[:\s]+/i, ''));
  if (/^bp[:\s]/i.test(text) && row) return tgLogBp(chatId, row, text.replace(/^bp[:\s]+/i, ''));
  if (/^win[:\s]/i.test(text) && row) return tgLogWin(chatId, row, text.replace(/^win[:\s]+/i, ''));
  if (/^sleep[:\s]/i.test(text) && row) return tgLogSleep(chatId, row, text.replace(/^sleep[:\s]+/i, ''));
  // Guided-prompt captures (a button set flow.stage; the next message is the value)
  if (row && row.flow && typeof row.flow.stage === 'string' && row.flow.stage.indexOf('await_') === 0 && text && text[0] !== '/') {
    const what = row.flow.stage.slice(6); const flow = row.flow; delete flow.stage;
    await db.query('UPDATE telegram_users SET flow=$2 WHERE chat_id=$1', [chatId, JSON.stringify(flow)]);
    if (what === 'bp') return tgLogBp(chatId, row, text);
    if (what === 'sleep') return tgLogSleep(chatId, row, text);
    if (what === 'win') return tgLogWin(chatId, row, text);
    if (what === 'log') return tgLogOverload(chatId, row, text);
  }
  // Add-a-food guided flow captures (name/serving/kcal/macros/photo-skip)
  if (row && row.flow && typeof row.flow.stage === 'string' && row.flow.stage.indexOf('nf_') === 0 && text) return tgFoodAddStep(chatId, row, text);
  if (cmd === 'nudge' || cmd === 'nudges' || cmd === 'remind' || cmd === 'reminders') return tgNudgeStart(chatId);
  // capturing their local time to set the nudge timezone
  if (row && row.flow && row.flow.stage === 'nudge_tz' && text && text[0] !== '/') {
    const localMin = tgParseTime(text);
    if (localMin == null) return tgSend(chatId, `Hmm, I didn't get that time. Reply like <b>14:30</b> or <b>2:30pm</b>.`);
    const now = new Date(); const nowUtcMin = now.getUTCHours() * 60 + now.getUTCMinutes();
    let off = localMin - nowUtcMin; off = (((off % 1440) + 1440) % 1440); if (off > 720) off -= 1440;
    const h = row.flow.nudge_hour;
    await db.query('UPDATE telegram_users SET nudge_hour=$2, tz_offset=$3, flow=$4 WHERE chat_id=$1', [chatId, h, off, JSON.stringify({})]);
    return tgSend(chatId, `✅ All set — I'll check in each day around <b>${tgHourLabel(h)}</b> your time. /nudge to change it anytime.`);
  }
  if (cmd === 'done' || cmd === 'done ✅' || cmd === '✅' || cmd === 'did it') return tgMarkDone(chatId);
  if (cmd === 'streak') return tgSend(chatId, `🔥 You're on a <b>${(row && row.streak) || 0}-day streak</b>. Keep it going — /done when you've done today's keystone.`);
  if (cmd === 'reset') { const tdy = new Date().toISOString().slice(0, 10); await db.query('UPDATE telegram_users SET food_log=$2 WHERE chat_id=$1', [chatId, JSON.stringify({ date: tdy, items: [] })]); return tgSend(chatId, `🧹 Cleared today's food log. Type a food to start again.`); }
  if (cmd === 'help' || cmd === 'start') return tgSend(chatId, TG_HELP);
  // Any other message → (1) log a food, honouring a leading quantity; (2) answer a supplement by name
  // with a full card; (3) answer a goal query with the evidence-ranked shortlist. All answers are authored data.
  if (text && text[0] !== '/') {
    const { qty, rest } = tgParseQty(text);
    const matches = (row && row.pid) ? tgFindFoods(rest) : [];
    if (matches.length === 1) return tgLogFood(chatId, matches[0], qty);
    if (matches.length > 1) {
      if (row) { const flow = row.flow || {}; flow.foodQty = qty; await db.query('UPDATE telegram_users SET flow=$2 WHERE chat_id=$1', [chatId, JSON.stringify(flow)]); } // remember qty for the picked option (always refresh, avoid stale)
      const kb = matches.slice(0, 5).map(f => [{ text: ((qty !== 1 ? (qty % 1 === 0 ? qty : qty.toFixed(1)) + '× ' : '') + f.name + (f.serving ? ' · ' + f.serving : '')).slice(0, 62), callback_data: 'food:' + f.id }]);
      return tgSend(chatId, `Which one did you have?`, { reply_markup: { inline_keyboard: kb } });
    }
    // supplement lookup — a real card, not a redirect
    const cmps = tgFindCompounds(text);
    if (cmps.length) {
      const t0 = text.toLowerCase().trim();
      if (cmps.length === 1 || cmps[0].name.toLowerCase() === t0) { const card = tgCompoundCard(cmps[0], row); return tgSend(chatId, card.text, { reply_markup: { inline_keyboard: card.kb } }); }
      const kb = cmps.map(c => [{ text: (((c.approvals && c.approvals[0]) ? c.approvals[0] + ' ' : '') + c.name).slice(0, 60), callback_data: 'cinfo:' + c.id }]);
      return tgSend(chatId, `Which one do you mean?`, { reply_markup: { inline_keyboard: kb } });
    }
    // goal query — "what helps sleep?", "best for fat loss"
    const goal = tgFindGoal(text);
    if (goal) {
      const top = tgGoalTop(goal.id, 5);
      if (top.length) {
        const list = top.map((c, i) => `${i + 1}. ${(c.approvals && c.approvals[0]) || ''} <b>${tgEsc(c.name)}</b>${tgStars(c.stars)}`).join('\n');
        const kb = top.map(c => [{ text: c.name.slice(0, 60), callback_data: 'cinfo:' + c.id }]);
        kb.push([{ text: '📖 Full ' + goal.label + ' list', url: `${SITE_URL}/goal/${goal.id}` }]);
        return tgSend(chatId, `${goal.icon} <b>Best for ${tgEsc(goal.label)}</b> — ranked by strength of human evidence:\n${list}\n\nTap one to learn more.`, { reply_markup: { inline_keyboard: kb } });
      }
    }
    // Not a known food/supplement/goal → offer to ADD it to the shared food database.
    if (row) { const fl = row.flow || {}; fl.newfood = { name: text.slice(0, 80) }; await tgFoodSaveFlow(chatId, fl); }
    const addKb = { inline_keyboard: [[{ text: `➕ Add “${text.slice(0, 36)}” as a food`, callback_data: 'addfood' }]] };
    if (!row || !row.pid) return tgSend(chatId, `I can look up any supplement (e.g. “magnesium”) or a goal (e.g. “what helps sleep”).\n\nOr add “${tgEsc(text)}” to the food database so anyone can log it — I'll take its calories &amp; macros:`, { reply_markup: addKb });
    return tgSend(chatId, `I don't have “${tgEsc(text)}” yet. Want to add it? I'll take its serving, calories &amp; macros (and a photo if you like) and submit it — once a dietitian approves, everyone can log it here and on rnawiki.com.`, { reply_markup: addKb });
  }
  return tgSend(chatId, `Type a food to log it, ask about any supplement by name, or tap below:`, { reply_markup: { inline_keyboard: [[{ text: '📋 Today', callback_data: 'today' }, { text: '✅ Done', callback_data: 'done' }]] } });
}
// The single daily home surface — keystone, food + macros, and one-tap access to everything else.
// A keystone's authored sub-steps (only present on genuinely multi-action keystones) — never parsed from text.
function tgKsSteps(k) { return (k && Array.isArray(k.steps) && k.steps.length > 1) ? k.steps : null; }
// The single daily home surface, as a pure view so it can be sent OR edited in place after a step-tick.
async function tgTodayView(row, opts) {
  opts = opts || {};
  const p = TG_PROTO[(row.pid || '') + '/' + (row.rcid || '')]; const k = p && p.keystone;
  const today = new Date().toISOString().slice(0, 10);
  const dayDone = (Array.isArray(row.keystone_days) && row.keystone_days.includes(today)) || await tgWebKeystoneDone(row);
  const steps = tgKsSteps(k);
  const t = tgTools(row); const ksState = (t.d && t.d.ks) || {};
  const prog = tgFoodProgress(row); const macros = tgFoodMacros(prog.items); const streak = row.streak || 0;
  // --- keystone block (checklist for multi-step, single line otherwise) ---
  let ksBlock, ksKb = [];
  if (steps) {
    const doneAt = i => dayDone || !!ksState[i];
    const n = steps.filter((_, i) => doneAt(i)).length;
    ksBlock = `⭐ <b>Keystone — ${n}/${steps.length} today</b>\n` + steps.map((s, i) => `${doneAt(i) ? '✅' : '⬜'} ${tgEsc(s)}`).join('\n');
    ksKb = steps.map((s, i) => [{ text: `${doneAt(i) ? '✅' : '◻️'} ${s}`.slice(0, 58), callback_data: 'ksd:' + i }]);
    if (!dayDone) ksKb.push([{ text: '✅ Did it all today', callback_data: 'done' }]);
  } else {
    ksBlock = `⭐ <b>Keystone:</b> ${k ? tgEsc(k.one) : '—'}\n${dayDone ? '✅ done today' : '▫️ not done yet'}`;
    ksKb = [[{ text: dayDone ? '✅ Keystone done' : '✅ Mark keystone done', callback_data: 'done' }]];
  }
  const header = opts.header ? opts.header + '\n\n' : '';
  const body = `${header}📋 <b>${tgEsc(p ? p.problem : 'Your protocol')} — today</b>${streak ? `   🔥 ${streak}` : ''}\n\n` +
    `${ksBlock}` + (k && k.why ? `\n<i>${tgEsc(k.why)}</i>` : '') +
    `\n\n🍽️ <b>Food targets:</b>\n${prog.text}` + (macros ? `\n\n${macros} <i>today</i>` : '') +
    `\n\nType a food (e.g. <b>2 eggs</b>) to log it.` + (row.user_id ? `\n\n🔗 <i>Synced with rnawiki.com</i>` : '');
  const kb = ksKb.slice();
  const row2 = [];
  if (Array.isArray(row.functions) && row.functions.length) row2.push({ text: '🧩 Tools', callback_data: 'hub:tools' });
  if ((p && p.stack && p.stack.length) || (row.tools && (row.tools.saved || []).length)) row2.push({ text: '💊 Stack', callback_data: 'hub:stack' });
  row2.push({ text: '🗓️ Schedule', callback_data: 'hub:sched' });
  kb.push(row2);
  kb.push([{ text: '📊 Progress', callback_data: 'hub:prog' }, { text: '↩️ Undo food', callback_data: 'foodundo' }]);
  return { text: body, kb };
}
async function tgSendToday(chatId, row) { const v = await tgTodayView(row); return tgSend(chatId, v.text, { reply_markup: { inline_keyboard: v.kb } }); }
// Tick one keystone step; when the last one lands, the day counts as done (streak) — refreshed in place.
async function tgKsTick(chatId, msgId, i) {
  const row = await tgGet(chatId); if (!row) return;
  const p = TG_PROTO[(row.pid || '') + '/' + (row.rcid || '')]; const steps = tgKsSteps(p && p.keystone);
  if (!steps) return tgMarkDone(chatId); // safety: not a multi-step keystone
  const t = tgTools(row); t.d.ks = t.d.ks || {}; t.d.ks[i] = !t.d.ks[i];
  await db.query('UPDATE telegram_users SET tools=$2 WHERE chat_id=$1', [chatId, JSON.stringify(t)]);
  let justCompleted = false;
  if (steps.every((_, idx) => t.d.ks[idx])) {
    const today = new Date().toISOString().slice(0, 10); let days = Array.isArray(row.keystone_days) ? row.keystone_days : [];
    if (!days.includes(today)) { days = days.concat(today).slice(-120); const streak = tgComputeStreak(days); await db.query('UPDATE telegram_users SET keystone_days=$2, streak=$3, last_active=now() WHERE chat_id=$1', [chatId, JSON.stringify(days), streak]); if (row.pid) await tgSyncWebDay(row, d => { d.keystones[row.pid + '/' + row.rcid] = true; }); justCompleted = true; }
  }
  const fresh = await tgGet(chatId); const v = await tgTodayView(fresh); await tgEdit(chatId, msgId, v.text, v.kb);
  if (justCompleted) await tgSend(chatId, `🎉 Keystone complete for today — every part done! 🔥 <b>${fresh.streak}-day streak</b>.`);
}
async function tgSetup() {
  if (!BOT_TOKEN) { console.log('[tg] BOT_TOKEN not set — bot dormant.'); return; }
  tgStartScheduler();
  const r = await tgApi('setWebhook', { url: `${SITE_URL}/api/telegram/webhook`, secret_token: TG_SECRET, allowed_updates: ['message', 'callback_query'] });
  console.log('[tg] setWebhook:', r && r.ok ? 'ok → ' + SITE_URL + '/api/telegram/webhook' : JSON.stringify(r));
  // Native discoverability: the "/" command menu + the blue Menu button (so users tap, never memorise).
  await tgApi('setMyCommands', { commands: [
    { command: 'today', description: 'Your day — keystone, food, tools' },
    { command: 'done', description: 'Mark your keystone done' },
    { command: 'progress', description: 'Your streak & consistency' },
    { command: 'build', description: 'Build or change your plan' },
    { command: 'help', description: 'What I can do' },
  ] });
  await tgApi('setChatMenuButton', { menu_button: { type: 'commands' } });
}

// ---------- API ----------
async function api(req, res, url) {
  // url keeps its query string (handlers parse ?goal=/?ids=/?problem= from it);
  // routing uses the path portion only.
  const parts = url.split('?')[0].split('/').filter(Boolean); // ['api', ...]
  const seg = parts.slice(1);
  // public client config (works even if the DB is down, so the UI can adapt)
  if (seg[0] === 'config' && req.method === 'GET') return json(res, 200, { googleClientId: GOOGLE_CLIENT_ID || null, dbEnabled: db.enabled });
  // lightweight lead tracking (fire-and-forget beacon) — always 204, no-ops without a DB
  if (seg[0] === 'track' && req.method === 'GET') {
    const q = new URL('http://x/' + url).searchParams;
    const e = clean(q.get('e'), 20), handle = clean(q.get('u'), 24);
    if (db.enabled && e === 'booking' && handle) db.query('UPDATE users SET booking_clicks = booking_clicks + 1 WHERE lower(username)=lower($1)', [handle]).catch(() => {});
    res.writeHead(204); return res.end();
  }
  // Public photo proxy for user-submitted food images: streams the Telegram file server-side so the
  // bot token is never exposed in a public URL. <img src="/api/foodphoto?id=123"> works on the website.
  if (seg[0] === 'foodphoto' && req.method === 'GET') {
    if (!db.enabled || !BOT_TOKEN) { res.writeHead(404); return res.end(); }
    const id = +clean(new URL('http://x/' + url).searchParams.get('id'), 12);
    if (!id) { res.writeHead(404); return res.end(); }
    try {
      const fr = (await db.query('SELECT data FROM user_foods WHERE id=$1', [id])).rows[0];
      const fid = fr && fr.data && fr.data.photo_file_id; if (!fid) { res.writeHead(404); return res.end(); }
      const gf = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${encodeURIComponent(fid)}`).then(r => r.json());
      if (!gf || !gf.ok) { res.writeHead(404); return res.end(); }
      const img = await fetch(`https://api.telegram.org/file/bot${BOT_TOKEN}/${gf.result.file_path}`);
      if (!img.ok) { res.writeHead(404); return res.end(); }
      const buf = Buffer.from(await img.arrayBuffer());
      res.writeHead(200, { 'Content-Type': img.headers.get('content-type') || 'image/jpeg', 'Cache-Control': 'public, max-age=86400' });
      return res.end(buf);
    } catch (e) { res.writeHead(404); return res.end(); }
  }
  // Telegram bot — handled before the same-origin/db gates (Telegram posts cross-origin; auth is the secret header)
  if (seg[0] === 'telegram') {
    if (!BOT_TOKEN || !db.enabled) return json(res, 503, { error: 'Bot not enabled' });
    if (seg[1] === 'webhook' && req.method === 'POST') {
      if (req.headers['x-telegram-bot-api-secret-token'] !== TG_SECRET) { res.writeHead(401); return res.end(); }
      const update = await readBody(req, 1e6);
      try { await handleTgUpdate(update || {}); } catch (e) { console.error('[tg] update:', e.message); }
      return json(res, 200, { ok: true });
    }
    if (seg[1] === 'link' && req.method === 'GET') {
      const u = await currentUser(req);
      const q = new URL('http://x/' + url).searchParams;
      const pid = clean(q.get('pid'), 64), rcid = clean(q.get('rcid'), 64);
      const token = crypto.randomBytes(9).toString('base64url');
      await db.query('INSERT INTO telegram_link_tokens(token,user_id,pid,rcid) VALUES($1,$2,$3,$4)', [token, u ? u.id : null, pid || null, rcid || null]);
      db.query("DELETE FROM telegram_link_tokens WHERE created_at < now() - interval '1 day'").catch(() => {});
      return json(res, 200, { url: `https://t.me/${BOT_USERNAME}?start=${token}` });
    }
    // Reverse sync: signed-in user opened ?tgsync=<token> — bind that Telegram chat to their account.
    if (seg[1] === 'attach' && req.method === 'POST') {
      if (!sameOrigin(req)) return json(res, 403, { error: 'Bad origin' });
      const u = await currentUser(req);
      if (!u) return json(res, 401, { error: 'Sign in first' });
      const body = await readBody(req, 1e4); const token = clean(body && body.token, 64);
      if (!token) return json(res, 400, { error: 'No token' });
      const t = (await db.query('SELECT * FROM telegram_link_tokens WHERE token=$1 AND chat_id IS NOT NULL', [token])).rows[0];
      if (!t) return json(res, 404, { error: 'This link has expired — tap “Sync to my account” in the bot again.' });
      await db.query('UPDATE telegram_users SET user_id=$1 WHERE chat_id=$2', [u.id, t.chat_id]);
      await db.query('DELETE FROM telegram_link_tokens WHERE token=$1', [token]);
      const trow = (await db.query('SELECT * FROM telegram_users WHERE chat_id=$1', [t.chat_id])).rows[0];
      if (trow && trow.pid) await tgUpsertWebProtocol(trow); // push the bot's plan up into the web account
      tgSend(t.chat_id, `🔗 <b>Synced to your rnawiki.com account.</b> Your keystone, food, tools and progress now stay in step across chat and site.`).catch(() => {});
      return json(res, 200, { ok: true });
    }
    return json(res, 404, { error: 'Not found' });
  }
  if (!db.enabled) return json(res, 503, { error: 'Accounts are not available right now.' });
  const method = req.method;

  if (method !== 'GET' && !sameOrigin(req)) return json(res, 403, { error: 'Bad origin' });

  // --- auth ---
  if (seg[0] === 'register' && method === 'POST') {
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const username = clean(b.username, 24), email = clean(b.email, 120), password = String(b.password || '');
    if (!/^[a-zA-Z0-9_.-]{3,24}$/.test(username)) return json(res, 400, { error: 'Username: 3–24 letters, numbers, _ . -' });
    if (password.length < 8) return json(res, 400, { error: 'Password must be at least 8 characters' });
    try {
      const r = await db.query('INSERT INTO users(username,email,pass) VALUES($1,$2,$3) RETURNING id,username,role,email', [username, email || null, hashPassword(password)]);
      const u = r.rows[0]; const token = crypto.randomBytes(24).toString('hex');
      await db.query('INSERT INTO sessions(token,user_id,expires_at) VALUES($1,$2, now()+interval \'30 days\')', [token, u.id]);
      // tracking on by default (withdrawable anytime under "Your data")
      await db.query(`INSERT INTO user_consent(user_id,consent_research,version,consented_at) VALUES($1,true,$2,now()) ON CONFLICT(user_id) DO NOTHING`, [u.id, CONSENT_VERSION]).catch(() => {});
      setSessionCookie(res, token);
      return json(res, 200, { user: { id: u.id, username: u.username, role: u.role, email: u.email, is_super: isSuper(u) } });
    } catch (e) {
      if (e.code === '23505') return json(res, 409, { error: 'That username is taken' });
      console.error(e); return json(res, 500, { error: 'Server error' });
    }
  }
  if (seg[0] === 'login' && method === 'POST') {
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const username = clean(b.username, 24), password = String(b.password || '');
    const r = await db.query('SELECT id,username,email,role,pass,domain,credential,domain_verified FROM users WHERE username=$1', [username]);
    const u = r.rows[0];
    if (!u || !verifyPassword(password, u.pass)) return json(res, 401, { error: 'Wrong username or password' });
    const token = crypto.randomBytes(24).toString('hex');
    await db.query('INSERT INTO sessions(token,user_id,expires_at) VALUES($1,$2, now()+interval \'30 days\')', [token, u.id]);
    setSessionCookie(res, token);
    return json(res, 200, { user: { id: u.id, username: u.username, role: u.role, email: u.email, domain: u.domain, credential: u.credential, domain_verified: u.domain_verified, is_super: isSuper(u) } });
  }
  if (seg[0] === 'logout' && method === 'POST') {
    const sid = parseCookies(req).sid; if (sid) await db.query('DELETE FROM sessions WHERE token=$1', [sid]);
    res.setHeader('Set-Cookie', 'sid=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure');
    return json(res, 200, { ok: true });
  }
  if (seg[0] === 'me' && method === 'GET') {
    const u = await currentUser(req); return json(res, 200, { user: u });
  }
  // Unified plan object (the omnichannel spine). GET returns the account's saved plan; POST saves it.
  // Anonymous users keep the plan in localStorage and merge it up here on login (client-side).
  if (seg[0] === 'plan' && method === 'GET') {
    const u = await currentUser(req); if (!u) return json(res, 200, { plan: null });
    const r = await db.query('SELECT plan FROM user_plans WHERE user_id=$1', [u.id]);
    return json(res, 200, { plan: r.rows[0] ? r.rows[0].plan : null });
  }
  if (seg[0] === 'plan' && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Sign in to save your plan' });
    const b = await readBody(req, 2e5); if (!b || typeof b.plan !== 'object') return json(res, 400, { error: 'Bad request' });
    await db.query(`INSERT INTO user_plans(user_id,plan,updated_at) VALUES($1,$2,now())
      ON CONFLICT(user_id) DO UPDATE SET plan=EXCLUDED.plan, updated_at=now()`, [u.id, JSON.stringify(b.plan)]);
    return json(res, 200, { ok: true });
  }
  // Share a built protocol to clients: mint a short code that carries the exact selections
  if (seg[0] === 'share-plan' && method === 'POST') {
    const b = await readBody(req, 1e5); const pid = clean(b && b.pid, 64), rcid = clean(b && b.rcid, 64);
    if (!pid || !rcid) return json(res, 400, { error: 'Missing protocol' });
    const u = await currentUser(req);
    const sel = (b && b.plan && typeof b.plan === 'object') ? b.plan : {};
    const plan = { moves: Array.isArray(sel.moves) ? sel.moves.slice(0, 100) : undefined, supps: sel.supps === 'none' ? 'none' : (Array.isArray(sel.supps) ? sel.supps.slice(0, 100) : undefined), functions: Array.isArray(sel.functions) ? sel.functions.slice(0, 20) : undefined };
    const code = crypto.randomBytes(6).toString('base64url');
    await db.query('INSERT INTO shared_plans(code,author_user_id,pid,rcid,plan) VALUES($1,$2,$3,$4,$5)', [code, u ? u.id : null, pid, rcid, JSON.stringify(plan)]);
    return json(res, 200, { code, url: `${SITE_URL}/#/s/${code}`, tg: BOT_USERNAME ? `https://t.me/${BOT_USERNAME}?start=s_${code}` : null });
  }

  // Public cohort stat for a protocol — k-anonymised (only when >=20 people have a 30/90-day outcome).
  if (seg[0] === 'outcomes' && seg[1] === 'public' && method === 'GET') {
    const q = new URL('http://x/' + url).searchParams; const pid = clean(q.get('pid'), 64), rcid = clean(q.get('rcid'), 64);
    if (!pid || !rcid) return json(res, 400, { error: 'Missing protocol' });
    const r = (await db.query(`SELECT COUNT(DISTINCT user_id) AS n, COUNT(DISTINCT user_id) FILTER (WHERE improvement>=1) AS better
      FROM outcome_checkins WHERE pid=$1 AND rcid=$2 AND phase IN ('d30','d90') AND improvement IS NOT NULL`, [pid, rcid])).rows[0];
    const n = +r.n; if (n < 20) return json(res, 200, { stat: null }); // k-anonymity floor
    return json(res, 200, { stat: { n, pct: Math.round(+r.better / n * 100) } });
  }

  // ===== Outcome-data moat: consent / profile / check-ins / markers / wearables / my-data =====
  if (seg[0] === 'consent') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Sign in' });
    if (method === 'GET') { const r = await db.query('SELECT consent_research, version, consented_at FROM user_consent WHERE user_id=$1', [u.id]); return json(res, 200, { consent: r.rows[0] || null, version: CONSENT_VERSION }); }
    if (method === 'POST') {
      const b = await readBody(req) || {}; const on = !!b.research;
      await db.query(`INSERT INTO user_consent(user_id,consent_research,version,consented_at,withdrawn_at)
        VALUES($1,$2,$3, CASE WHEN $2 THEN now() END, CASE WHEN $2 THEN NULL ELSE now() END)
        ON CONFLICT(user_id) DO UPDATE SET consent_research=$2, version=$3,
          consented_at=CASE WHEN $2 THEN COALESCE(user_consent.consented_at, now()) ELSE user_consent.consented_at END,
          withdrawn_at=CASE WHEN $2 THEN NULL ELSE now() END`, [u.id, on, CONSENT_VERSION]);
      return json(res, 200, { ok: true, research: on });
    }
  }
  // Opt-in daily reminder email (keystone + selected nudge tools) — service feature, no research consent needed
  if (seg[0] === 'email-reminders') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Sign in' });
    if (method === 'GET') {
      const r = await db.query('SELECT email_nudge_hour, email_tz_offset, email_off FROM users WHERE id=$1', [u.id]);
      const row = r.rows[0] || {};
      return json(res, 200, { enabled: row.email_nudge_hour != null, hour: row.email_nudge_hour, tzOffset: row.email_tz_offset, hasEmail: !!u.email, emailReady: !!RESEND_API_KEY, emailOff: !!row.email_off });
    }
    if (method === 'POST') {
      const b = await readBody(req) || {};
      if (typeof b.allOff === 'boolean') {   // global suppress — turns every RNAwiki email off/on
        await db.query('UPDATE users SET email_off=$2 WHERE id=$1', [u.id, b.allOff]);
        return json(res, 200, { ok: true, emailOff: b.allOff });
      }
      if (!u.email) return json(res, 400, { error: 'Add an email to your account first to get reminders' });
      const on = !!b.enabled;
      const hour = on ? intOr(b.hour, 0, 23) : null;
      if (on && hour == null) return json(res, 400, { error: 'Pick an hour (0–23)' });
      const tz = intOr(b.tzOffset, -720, 840);
      await db.query('UPDATE users SET email_nudge_hour=$2, email_tz_offset=COALESCE($3, email_tz_offset) WHERE id=$1', [u.id, hour, tz]);
      return json(res, 200, { ok: true, enabled: on, hour });
    }
  }
  if (seg[0] === 'profile') {
    const u = await currentUser(req); if (!u) return json(res, method === 'GET' ? 200 : 401, method === 'GET' ? { profile: null } : { error: 'Sign in' });
    if (method === 'GET') { const r = await db.query('SELECT age_band, sex, ethnicity, conditions, height_cm, meds FROM user_profile WHERE user_id=$1', [u.id]); return json(res, 200, { profile: r.rows[0] || null }); }
    if (method === 'POST') {
      const b = await readBody(req) || {};
      const age = inList(b.age_band, AGE_BANDS), sex = inList(b.sex, SEXES), eth = inList(b.ethnicity, ETHNICITIES);
      const conds = Array.isArray(b.conditions) ? b.conditions.filter(c => typeof c === 'string').map(c => clean(c, 40)).slice(0, 20) : [];
      const height = intOr(b.height_cm, 80, 250);  // sane human range; null if absent
      const meds = Array.isArray(b.meds) ? b.meds.filter(x => typeof x === 'string' && x.trim()).map(x => clean(x, 60)).slice(0, 30) : [];
      await db.query(`INSERT INTO user_profile(user_id,age_band,sex,ethnicity,conditions,height_cm,meds,updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,now())
        ON CONFLICT(user_id) DO UPDATE SET age_band=$2, sex=$3, ethnicity=$4, conditions=$5,
          height_cm=COALESCE($6, user_profile.height_cm), meds=$7, updated_at=now()`, [u.id, age, sex, eth, JSON.stringify(conds), height, JSON.stringify(meds)]);
      return json(res, 200, { ok: true });
    }
  }
  if (seg[0] === 'checkin') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Sign in' });
    if (method === 'GET') { // which phases are already done for a protocol
      const q = new URL('http://x/' + url).searchParams; const pid = clean(q.get('pid'), 64), rcid = clean(q.get('rcid'), 64);
      const r = await db.query('SELECT phase FROM outcome_checkins WHERE user_id=$1 AND pid=$2 AND rcid=$3', [u.id, pid, rcid]);
      return json(res, 200, { done: r.rows.map(x => x.phase) });
    }
    if (method === 'POST') {
      // Tracking is on by default — only an explicit withdrawal blocks it.
      const cr = await db.query('SELECT consent_research FROM user_consent WHERE user_id=$1', [u.id]);
      if (cr.rows[0] && cr.rows[0].consent_research === false) return json(res, 403, { error: 'Tracking withdrawn' });
      const b = await readBody(req) || {};
      const pid = clean(b.pid, 64), rcid = clean(b.rcid, 64), phase = inList(b.phase, CHECKIN_PHASES);
      if (!pid || !rcid || !phase) return json(res, 400, { error: 'Missing pid/rcid/phase' });
      const stop = (b.still_on === false) ? inList(b.stop_reason, STOP_REASONS) : null;   // only meaningful when they stopped
      const sideFx = clean(b.side_effects, 300) || null;
      const extra = cleanExtra(b.extra);
      await db.query(`INSERT INTO outcome_checkins(user_id,pid,rcid,phase,symptom_0_10,improvement,adherence_pct,still_on,note,stop_reason,side_effects,extra)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        ON CONFLICT(user_id,pid,rcid,phase) DO UPDATE SET symptom_0_10=$5, improvement=$6, adherence_pct=$7, still_on=$8, note=$9, stop_reason=$10, side_effects=$11, extra=$12, created_at=now()`,
        [u.id, pid, rcid, phase, intOr(b.symptom_0_10, 0, 10), intOr(b.improvement, -3, 3), intOr(b.adherence_pct, 0, 100), b.still_on == null ? null : !!b.still_on, clean(b.note, 500) || null, stop, sideFx, extra ? JSON.stringify(extra) : null]);
      return json(res, 200, { ok: true });
    }
  }
  if (seg[0] === 'markers') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Sign in' });
    if (method === 'GET') { const r = await db.query('SELECT id, marker, value, unit, taken_on FROM blood_markers WHERE user_id=$1 ORDER BY taken_on DESC NULLS LAST, id DESC LIMIT 200', [u.id]); return json(res, 200, { markers: r.rows }); }
    if (method === 'POST') {
      const b = await readBody(req) || {}; const marker = inList(b.marker, BLOOD_MARKERS);
      const value = (b.value != null && Number.isFinite(+b.value)) ? +b.value : null;
      if (!marker || value == null) return json(res, 400, { error: 'Missing marker/value' });
      const taken = /^\d{4}-\d{2}-\d{2}$/.test(b.taken_on || '') ? b.taken_on : null;
      await db.query('INSERT INTO blood_markers(user_id,marker,value,unit,taken_on) VALUES($1,$2,$3,$4,$5)', [u.id, marker, value, clean(b.unit, 16) || null, taken]);
      return json(res, 200, { ok: true });
    }
  }
  if (seg[0] === 'wearable' && method === 'GET') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Sign in' });
    const r = await db.query(`SELECT to_char(day,'YYYY-MM-DD') AS day, steps, sleep_min, resting_hr, weight_kg, waist_cm FROM wearable_daily WHERE user_id=$1 ORDER BY day DESC LIMIT 120`, [u.id]);
    return json(res, 200, { wearables: r.rows });
  }
  if (seg[0] === 'wearable' && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Sign in' });
    const b = await readBody(req) || {}; const day = /^\d{4}-\d{2}-\d{2}$/.test(b.day || '') ? b.day : null; if (!day) return json(res, 400, { error: 'Bad day' });
    const waist = (b.waist_cm != null && +b.waist_cm >= 40 && +b.waist_cm <= 200) ? +b.waist_cm : null;
    await db.query(`INSERT INTO wearable_daily(user_id,day,steps,sleep_min,resting_hr,weight_kg,waist_cm,source) VALUES($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT(user_id,day) DO UPDATE SET steps=COALESCE($3,wearable_daily.steps), sleep_min=COALESCE($4,wearable_daily.sleep_min), resting_hr=COALESCE($5,wearable_daily.resting_hr), weight_kg=COALESCE($6,wearable_daily.weight_kg), waist_cm=COALESCE($7,wearable_daily.waist_cm), source=$8`,
      [u.id, day, intOr(b.steps, 0, 100000), intOr(b.sleep_min, 0, 1440), intOr(b.resting_hr, 20, 220), (b.weight_kg != null && +b.weight_kg > 0 && +b.weight_kg < 400) ? +b.weight_kg : null, waist, clean(b.source, 24) || 'manual']);
    return json(res, 200, { ok: true });
  }
  if (seg[0] === 'mydata') { // PDPA access + deletion rights over one's own research data
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Sign in' });
    if (method === 'GET') {
      const [c, p, ck, bm, wd] = await Promise.all([
        db.query('SELECT consent_research,version,consented_at,withdrawn_at FROM user_consent WHERE user_id=$1', [u.id]),
        db.query('SELECT age_band,sex,ethnicity,conditions,height_cm,meds FROM user_profile WHERE user_id=$1', [u.id]),
        db.query('SELECT pid,rcid,phase,symptom_0_10,improvement,adherence_pct,still_on,note,stop_reason,side_effects,extra,created_at FROM outcome_checkins WHERE user_id=$1', [u.id]),
        db.query('SELECT marker,value,unit,taken_on FROM blood_markers WHERE user_id=$1', [u.id]),
        db.query('SELECT day,steps,sleep_min,resting_hr,weight_kg,waist_cm FROM wearable_daily WHERE user_id=$1', [u.id]),
      ]);
      return json(res, 200, { account: { username: u.username, email: u.email }, consent: c.rows[0] || null, profile: p.rows[0] || null, checkins: ck.rows, markers: bm.rows, wearables: wd.rows });
    }
    if (method === 'DELETE') { // erase research data, keep the account + their tracker
      await Promise.all([
        db.query('DELETE FROM outcome_checkins WHERE user_id=$1', [u.id]),
        db.query('DELETE FROM blood_markers WHERE user_id=$1', [u.id]),
        db.query('DELETE FROM wearable_daily WHERE user_id=$1', [u.id]),
        db.query('DELETE FROM user_profile WHERE user_id=$1', [u.id]),
        db.query('UPDATE user_consent SET consent_research=false, withdrawn_at=now() WHERE user_id=$1', [u.id]),
      ]);
      return json(res, 200, { ok: true });
    }
  }
  if (seg[0] === 'shared-plan' && method === 'GET') {
    const q = new URL('http://x/' + url).searchParams; const code = clean(q.get('code'), 32);
    const r = await db.query('SELECT code,author_user_id,pid,rcid,plan FROM shared_plans WHERE code=$1', [code]);
    if (!r.rows[0]) return json(res, 404, { error: 'Not found' });
    db.query('UPDATE shared_plans SET clicks=clicks+1 WHERE code=$1', [code]).catch(() => {});
    const row = r.rows[0]; let author = null;
    if (row.author_user_id) { try { const a = (await db.query('SELECT username FROM users WHERE id=$1', [row.author_user_id])).rows[0]; author = a ? a.username : null; } catch (e) {} }
    return json(res, 200, { pid: row.pid, rcid: row.rcid, plan: row.plan || {}, author });
  }
  if (seg[0] === 'auth' && seg[1] === 'google' && method === 'POST') {
    if (!GOOGLE_CLIENT_ID) return json(res, 503, { error: 'Google sign-in is not enabled on this server.' });
    const b = await readBody(req); if (!b || !b.credential) return json(res, 400, { error: 'Missing Google credential' });
    // Verify the ID token with Google (no crypto lib needed).
    let p;
    try {
      const vr = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(b.credential), { signal: AbortSignal.timeout(10000) });
      if (!vr.ok) throw new Error('tokeninfo ' + vr.status);
      p = await vr.json();
    } catch (e) { return json(res, 401, { error: 'Could not verify Google sign-in' }); }
    if (p.aud !== GOOGLE_CLIENT_ID) return json(res, 401, { error: 'Google token was issued for a different app' });
    if (!(p.iss === 'accounts.google.com' || p.iss === 'https://accounts.google.com')) return json(res, 401, { error: 'Bad token issuer' });
    if (p.email_verified === false || p.email_verified === 'false') return json(res, 401, { error: 'Your Google email is not verified' });
    const sub = String(p.sub), email = String(p.email || '').toLowerCase();
    try {
      let u = (await db.query('SELECT id,username,role,domain,credential,domain_verified FROM users WHERE google_sub=$1 OR (email=$2 AND email IS NOT NULL) LIMIT 1', [sub, email || '\x00'])).rows[0];
      if (u) {
        await db.query('UPDATE users SET google_sub=$1 WHERE id=$2 AND google_sub IS NULL', [sub, u.id]);
      } else {
        let base = (email.split('@')[0] || String(p.name || 'user')).toLowerCase().replace(/[^a-z0-9_.-]/g, '').slice(0, 20) || 'user';
        if (base.length < 3) base = base + 'user';
        let uname = base, tries = 0;
        while (true) {
          try {
            u = (await db.query('INSERT INTO users(username,email,google_sub) VALUES($1,$2,$3) RETURNING id,username,role,domain,credential,domain_verified', [uname, email || null, sub])).rows[0];
            break;
          } catch (e) { if (e.code === '23505' && tries < 8) { tries++; uname = base + Math.floor(1000 + Math.random() * 8999); } else throw e; }
        }
      }
      if (ADMIN_USER && u.username.toLowerCase() === ADMIN_USER) u.role = 'admin';
      const token = crypto.randomBytes(24).toString('hex');
      await db.query('INSERT INTO sessions(token,user_id,expires_at) VALUES($1,$2, now()+interval \'30 days\')', [token, u.id]);
      setSessionCookie(res, token);
      u.email = email; u.is_super = isSuper(u);
      return json(res, 200, { user: u });
    } catch (e) { console.error('[google-auth]', e.message); return json(res, 500, { error: 'Sign-in failed' }); }
  }

  // --- comments ---
  if (seg[0] === 'comments' && seg[1] === 'recent' && method === 'GET') {
    const r = await db.query('SELECT c.id,c.goal_id,c.body,c.created_at,u.username FROM comments c JOIN users u ON u.id=c.user_id ORDER BY c.created_at DESC LIMIT 8');
    return json(res, 200, { comments: r.rows });
  }
  if (seg[0] === 'comments' && method === 'GET') {
    const goal = clean(new URL('http://x/' + url).searchParams.get('goal'), 80);
    if (!goal) return json(res, 400, { error: 'goal required' });
    const r = await db.query('SELECT c.id,c.goal_id,c.body,c.created_at,u.username,c.user_id FROM comments c JOIN users u ON u.id=c.user_id WHERE c.goal_id=$1 ORDER BY c.created_at DESC LIMIT 200', [goal]);
    return json(res, 200, { comments: r.rows });
  }
  if (seg[0] === 'comments' && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in to comment' });
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const goalId = clean(b.goalId, 80), body = clean(b.body, 2000);
    if (!goalId || !body) return json(res, 400, { error: 'Write something first' });
    const r = await db.query('INSERT INTO comments(goal_id,user_id,body) VALUES($1,$2,$3) RETURNING id,goal_id,body,created_at', [goalId, u.id, body]);
    await award(u.id, 'comment', r.rows[0].id);
    return json(res, 200, { comment: Object.assign(r.rows[0], { username: u.username, user_id: u.id }) });
  }
  if (seg[0] === 'comments' && seg[1] && method === 'DELETE') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Not signed in' });
    const id = parseInt(seg[1], 10); if (!id) return json(res, 400, { error: 'bad id' });
    await db.query('DELETE FROM comments WHERE id=$1 AND (user_id=$2 OR $3=\'admin\')', [id, u.id, u.role]);
    return json(res, 200, { ok: true });
  }

  // --- edits ---
  if (seg[0] === 'edits' && seg[1] === 'recent' && method === 'GET') {
    const r = await db.query('SELECT e.compound_id,e.compound_name,e.note,e.created_at,u.username FROM edits e JOIN users u ON u.id=e.user_id ORDER BY e.created_at DESC LIMIT 10');
    return json(res, 200, { edits: r.rows });
  }
  if (seg[0] === 'edits' && seg[1] && method === 'GET') {
    const cid = clean(seg[1], 40);
    const cur = await db.query('SELECT e.fields,e.note,e.created_at,u.username FROM edits e JOIN users u ON u.id=e.user_id WHERE e.compound_id=$1 ORDER BY e.created_at DESC LIMIT 1', [cid]);
    const hist = await db.query('SELECT e.note,e.created_at,u.username FROM edits e JOIN users u ON u.id=e.user_id WHERE e.compound_id=$1 ORDER BY e.created_at DESC LIMIT 20', [cid]);
    return json(res, 200, { current: cur.rows[0] || null, history: hist.rows });
  }
  if (seg[0] === 'edits' && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in to edit' });
    // Compound pages = the pharmacology knowledge base: only verified pharmacist/MD/biomedical
    // researchers (or admin) may edit them.
    if (u.role !== 'admin' && !(u.domain === 'pharmacist' && u.domain_verified)) return json(res, 403, { error: 'Compound pages are maintained by verified pharmacology experts (pharmacist / MD / biomedical researcher). Apply for that role in your Pro dashboard.' });
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const cid = clean(b.compoundId, 40); const name = clean(b.compoundName, 120);
    if (!cid || !b.fields || typeof b.fields !== 'object') return json(res, 400, { error: 'Nothing to save' });
    const fields = {};
    for (const k of EDITABLE) if (b.fields[k] != null) fields[k] = clean(b.fields[k], 6000);
    const note = clean(b.note, 200);
    const er = await db.query('INSERT INTO edits(compound_id,compound_name,user_id,fields,note) VALUES($1,$2,$3,$4,$5) RETURNING id', [cid, name, u.id, JSON.stringify(fields), note || null]);
    await award(u.id, 'edit', er.rows[0].id);
    return json(res, 200, { ok: true, by: u.username });
  }

  // --- Tier 1: frictionless community votes (no account needed) ---
  if (seg[0] === 'votes' && method === 'GET') {
    const ids = clean(new URL('http://x/' + url).searchParams.get('ids'), 500).split(',').map(s => s.trim()).filter(Boolean).slice(0, 30);
    if (!ids.length) return json(res, 200, { scores: {} });
    const r = await db.query(
      `SELECT target_id, SUM(CASE WHEN value>0 THEN 1 ELSE 0 END)::int AS up,
              SUM(CASE WHEN value<0 THEN 1 ELSE 0 END)::int AS down
       FROM votes WHERE target_id = ANY($1) GROUP BY target_id`, [ids]);
    const scores = {}; r.rows.forEach(x => scores[x.target_id] = { up: x.up, down: x.down });
    return json(res, 200, { scores });
  }
  if (seg[0] === 'votes' && method === 'POST') {
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const targetId = clean(b.targetId, 120), voterKey = clean(b.voterKey, 64);
    const value = b.value > 0 ? 1 : b.value < 0 ? -1 : 0;
    if (!targetId || !voterKey) return json(res, 400, { error: 'Missing vote' });
    if (value === 0) { // toggle off
      await db.query('DELETE FROM votes WHERE target_id=$1 AND voter_key=$2', [targetId, voterKey]);
    } else {
      await db.query(`INSERT INTO votes(target_id,voter_key,value) VALUES($1,$2,$3)
        ON CONFLICT (target_id,voter_key) DO UPDATE SET value=$3, created_at=now()`, [targetId, voterKey, value]);
    }
    const r = await db.query(`SELECT SUM(CASE WHEN value>0 THEN 1 ELSE 0 END)::int AS up,
      SUM(CASE WHEN value<0 THEN 1 ELSE 0 END)::int AS down FROM votes WHERE target_id=$1`, [targetId]);
    // reputation: a signed-in voter earns points once per target (idempotent)
    if (value !== 0) { const vu = await currentUser(req); if (vu) await award(vu.id, 'vote', targetId); }
    return json(res, 200, { score: { up: r.rows[0].up || 0, down: r.rows[0].down || 0 } });
  }

  // --- apply for an expert role (you CANNOT self-assign; an admin grants it) ---
  if (seg[0] === 'profile' && seg[1] === 'domain' && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in' });
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const domain = clean(b.domain, 20), credential = clean(b.credential, 200), backlink = safeUrl(b.backlink_url);
    if (u.domain_verified) return json(res, 400, { error: 'You already hold a verified role. Ask the admin to change it.' });
    if (!DOMAIN_LAYER[domain]) return json(res, 400, { error: 'Choose a domain to apply for.' });
    if (!credential) return json(res, 400, { error: 'Add your registration/credential so we can verify you.' });
    if (!backlink) return json(res, 400, { error: 'Add the URL of a page on your site or socials that links back to rnawiki.com — that link exchange is how we verify experts.' });
    // sets a PENDING application only — domain stays null until an admin approves it.
    await db.query("UPDATE users SET requested_domain=$1, credential=$2, role_backlink=$3, application_status='pending' WHERE id=$4", [domain, credential, backlink, u.id]);
    return json(res, 200, { ok: true, application_status: 'pending', requested_domain: domain });
  }
  // --- profile: update your public socials / booking link ---
  if (seg[0] === 'profile' && !seg[1] && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in' });
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const s = b.socials || {};
    const socials = {
      instagram: clean(s.instagram, 40).replace(/^@/, ''),
      twitter: clean(s.twitter, 40).replace(/^@/, ''),
      linkedin: safeUrl(s.linkedin),
      website: safeUrl(s.website),
      booking_link: safeUrl(s.booking_link),
    };
    await db.query('UPDATE users SET socials=$1 WHERE id=$2', [JSON.stringify(socials), u.id]);
    return json(res, 200, { ok: true, socials });
  }
  // --- reputation: client-driven awards (login required, daily-idempotent) ---
  if (seg[0] === 'rep' && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in' });
    const b = await readBody(req) || {};
    const kind = clean(b.kind, 20);
    if (kind !== 'food_log' && kind !== 'share') return json(res, 400, { error: 'unknown action' });
    const day = new Date().toISOString().slice(0, 10); // once per day per kind
    await award(u.id, kind, day);
    const rp = (await db.query('SELECT reputation_points FROM users WHERE id=$1', [u.id])).rows[0];
    return json(res, 200, { ok: true, reputation_points: rp ? rp.reputation_points : 0 });
  }
  // --- public expert profile / portfolio (backlink + prestige asset) ---
  if (seg[0] === 'u' && seg[1] && method === 'GET') {
    const handle = clean(seg[1], 24);
    const ur = await db.query('SELECT id,username,domain,domain_verified,reputation_points,socials,badges,created_at FROM users WHERE lower(username)=lower($1)', [handle]);
    const uu = ur.rows[0];
    if (!uu) return json(res, 404, { error: 'No such user' });
    db.query('UPDATE users SET profile_views = profile_views + 1 WHERE id=$1', [uu.id]).catch(() => {});
    const accepted = await db.query(`SELECT problem_id,root_cause_id,layer,domain,change,created_at
      FROM proposals WHERE user_id=$1 AND status='endorsed' ORDER BY created_at DESC LIMIT 30`, [uu.id]);
    const counts = (await db.query(`SELECT
      (SELECT COUNT(*)::int FROM proposals WHERE user_id=$1) AS proposals,
      (SELECT COUNT(*)::int FROM proposals WHERE user_id=$1 AND status='endorsed') AS accepted,
      (SELECT COUNT(*)::int FROM edits WHERE user_id=$1) AS edits,
      (SELECT COUNT(*)::int FROM comments WHERE user_id=$1) AS comments`, [uu.id])).rows[0];
    const stewarded = await db.query('SELECT problem_id, root_cause_id, adopted_at FROM stewardships WHERE user_id=$1 ORDER BY adopted_at DESC', [uu.id]);
    return json(res, 200, {
      user: {
        username: uu.username, domain: uu.domain, domain_verified: uu.domain_verified,
        reputation_points: uu.reputation_points, socials: uu.socials || {}, badges: uu.badges || [],
        created_at: uu.created_at,
      },
      counts, accepted: accepted.rows, stewarded: stewarded.rows,
    });
  }
  // --- protocol stewardship (adopt-a-protocol lead-gen) ---
  if (seg[0] === 'steward' && !seg[1] && method === 'GET') {
    const q = new URL('http://x/' + url).searchParams;
    const pid = clean(q.get('problem'), 60), rcid = clean(q.get('rc'), 60);
    if (!pid || !rcid) return json(res, 400, { error: 'problem & rc required' });
    const r = await db.query(`SELECT s.adopted_at, s.last_active_at, u.username, u.domain, u.domain_verified, u.socials
      FROM stewardships s JOIN users u ON u.id=s.user_id WHERE s.problem_id=$1 AND s.root_cause_id=$2`, [pid, rcid]);
    const s = r.rows[0];
    const steward = s ? {
      username: s.username, domain: s.domain, domain_verified: s.domain_verified, socials: s.socials || {},
      adopted_at: s.adopted_at, stale: (Date.now() - new Date(s.last_active_at).getTime()) > 60 * 86400000,
    } : null;
    return json(res, 200, { steward });
  }
  if (seg[0] === 'steward' && seg[1] === 'adopt' && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in' });
    if (!u.domain_verified) return json(res, 403, { error: 'Only verified experts can steward a protocol. Set your domain and get verified first.' });
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const pid = clean(b.problemId, 60), rcid = clean(b.rootCauseId, 60);
    if (!pid || !rcid) return json(res, 400, { error: 'protocol required' });
    const cur = (await db.query('SELECT user_id, last_active_at FROM stewardships WHERE problem_id=$1 AND root_cause_id=$2', [pid, rcid])).rows[0];
    if (cur) {
      if (cur.user_id === u.id) return json(res, 200, { ok: true, already: true });
      const stale = (Date.now() - new Date(cur.last_active_at).getTime()) > 60 * 86400000;
      if (!stale) return json(res, 409, { error: 'This protocol already has an active steward. It can only be challenged after 60 days of steward inactivity.' });
      await db.query('UPDATE stewardships SET user_id=$1, domain=$2, adopted_at=now(), last_active_at=now() WHERE problem_id=$3 AND root_cause_id=$4', [u.id, u.domain, pid, rcid]);
    } else {
      await db.query('INSERT INTO stewardships(problem_id,root_cause_id,user_id,domain) VALUES($1,$2,$3,$4) ON CONFLICT (problem_id,root_cause_id) DO NOTHING', [pid, rcid, u.id, u.domain]);
    }
    await award(u.id, 'steward', pid + ':' + rcid, 25);
    return json(res, 200, { ok: true });
  }
  if (seg[0] === 'steward' && seg[1] === 'release' && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in' });
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const pid = clean(b.problemId, 60), rcid = clean(b.rootCauseId, 60);
    await db.query('DELETE FROM stewardships WHERE problem_id=$1 AND root_cause_id=$2 AND user_id=$3', [pid, rcid, u.id]);
    return json(res, 200, { ok: true });
  }
  // --- local partners (backlink-verified lead-gen) ---
  if (seg[0] === 'partners' && method === 'GET') {
    const cat = clean(new URL('http://x/' + url).searchParams.get('category'), 60);
    const r = cat
      ? await db.query("SELECT name,type,location,link,serves FROM partners WHERE status='active' AND serves=$1 ORDER BY created_at DESC LIMIT 6", [cat])
      : await db.query("SELECT name,type,location,link,serves FROM partners WHERE status='active' ORDER BY created_at DESC LIMIT 30");
    return json(res, 200, { partners: r.rows });
  }
  if (seg[0] === 'partners' && method === 'POST') {
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const name = clean(b.name, 80), type = clean(b.type, 20), location = clean(b.location, 60);
    const link = safeUrl(b.link), backlink = safeUrl(b.backlink_url), serves = clean(b.serves, 60);
    if (!name || !link || !backlink) return json(res, 400, { error: 'Business name, your website, and the page where you linked to RNAwiki are all required.' });
    if (!/rnawiki\.com|rnawiki\.ai|rna-wiki\.com/i.test(backlink)) return json(res, 400, { error: 'The backlink page must link to rnawiki.com — that link exchange is how listings stay free.' });
    const u = await currentUser(req);
    const r = await db.query('INSERT INTO partners(name,type,location,link,backlink_url,serves,submitted_by) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id',
      [name, type || null, location || null, link, backlink, serves || null, u ? u.id : null]);
    return json(res, 200, { ok: true, id: r.rows[0].id, status: 'pending' });
  }
  // --- crowdsourced local foods (anyone submits; a verified dietitian verifies) ---
  if (seg[0] === 'foods' && !seg[1] && method === 'GET') {
    const r = await db.query("SELECT id,name,serving,data FROM user_foods WHERE status='active' ORDER BY created_at DESC LIMIT 500");
    return json(res, 200, { foods: r.rows });
  }
  if (seg[0] === 'foods' && seg[1] === 'pending' && method === 'GET') {
    const u = await currentUser(req); if (!u || !(u.role === 'admin' || (u.domain === 'dietitian' && u.domain_verified))) return json(res, 403, { error: 'Verified dietitians only' });
    const r = await db.query("SELECT f.id,f.name,f.serving,f.data,f.created_at,uu.username AS by FROM user_foods f LEFT JOIN users uu ON uu.id=f.submitted_by WHERE f.status='pending' ORDER BY f.created_at ASC LIMIT 100");
    return json(res, 200, { foods: r.rows });
  }
  if (seg[0] === 'foods' && !seg[1] && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in to add a food' });
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const name = clean(b.name, 80), serving = clean(b.serving, 60);
    if (!name) return json(res, 400, { error: 'Food name is required' });
    const num = (x) => (x === 0 || x) && isFinite(x) ? Number(x) : null;
    const data = { kcal: num(b.kcal), protein_g: num(b.protein_g), carbs_g: num(b.carbs_g), sugar_g: num(b.sugar_g), fat_g: num(b.fat_g), fiber_g: num(b.fiber_g) };
    // optional micronutrients — an allowlist so only known keys are stored
    const MICROS = ['sodium_mg', 'potassium_mg', 'calcium_mg', 'iron_mg', 'magnesium_mg', 'zinc_mg', 'vitamin_a_ug', 'vitamin_c_mg', 'vitamin_d_ug', 'vitamin_b12_ug', 'folate_ug'];
    MICROS.forEach((k) => { const val = num(b[k]); if (val != null) data[k] = val; });
    // a correction to an existing food carries its id — once approved it overrides that food
    const corrects = clean(b.corrects, 40); if (corrects) data.corrects = corrects;
    const r = await db.query('INSERT INTO user_foods(name,serving,data,submitted_by) VALUES($1,$2,$3,$4) RETURNING id', [name, serving || null, JSON.stringify(data), u.id]);
    await award(u.id, 'food_submit', 'food:' + r.rows[0].id, 20);
    return json(res, 200, { ok: true, id: r.rows[0].id, status: 'pending' });
  }
  // --- "request a protocol" board ---
  if (seg[0] === 'protocol-requests' && !seg[1] && method === 'GET') {
    const r = await db.query("SELECT id,request,detail,votes,status,created_at FROM protocol_requests WHERE status IN ('open','building') ORDER BY votes DESC, created_at DESC LIMIT 60");
    return json(res, 200, { requests: r.rows });
  }
  if (seg[0] === 'protocol-requests' && !seg[1] && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in to request a protocol' });
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const request = clean(b.request, 120), detail = clean(b.detail, 1000);
    if (!request) return json(res, 400, { error: 'Describe the problem or goal you want a protocol for' });
    const r = await db.query('INSERT INTO protocol_requests(request,detail,submitted_by) VALUES($1,$2,$3) RETURNING id', [request, detail || null, u.id]);
    await award(u.id, 'request', 'req:' + r.rows[0].id, 5);
    return json(res, 200, { ok: true, id: r.rows[0].id });
  }
  if (seg[0] === 'protocol-requests' && seg[1] && seg[2] === 'vote' && method === 'POST') {
    const b = await readBody(req) || {}; const voterKey = clean(b.voterKey, 64); const id = parseInt(seg[1], 10);
    if (!voterKey || !id) return json(res, 400, { error: 'Missing vote' });
    const ins = await db.query("INSERT INTO votes(target_id,voter_key,value) VALUES($1,$2,1) ON CONFLICT (target_id,voter_key) DO NOTHING RETURNING id", ['req:' + id, voterKey]);
    if (ins.rows[0]) await db.query('UPDATE protocol_requests SET votes=votes+1 WHERE id=$1', [id]);
    const r = await db.query('SELECT votes FROM protocol_requests WHERE id=$1', [id]);
    return json(res, 200, { votes: r.rows[0] ? r.rows[0].votes : 0 });
  }
  if (seg[0] === 'admin' && seg[1] === 'requests' && seg[2] && method === 'POST') {
    const u = await currentUser(req); if (!u || u.role !== 'admin') return json(res, 403, { error: 'Admin only' });
    const id = parseInt(seg[2], 10); const b = await readBody(req) || {};
    const status = ['open', 'building', 'done', 'declined'].includes(b.status) ? b.status : 'open';
    await db.query('UPDATE protocol_requests SET status=$1 WHERE id=$2', [status, id]);
    return json(res, 200, { ok: true });
  }
  // --- protocol forks (community variations — UGC engine) ---
  if (seg[0] === 'forks' && seg[1] === 'popular' && method === 'GET') {
    const r = await db.query("SELECT f.id,f.title,f.problem_id,f.root_cause_id,f.clones,u.username AS by_user FROM protocol_forks f LEFT JOIN users u ON u.id=f.user_id WHERE f.clones > 0 ORDER BY f.clones DESC, f.created_at DESC LIMIT 12");
    return json(res, 200, { forks: r.rows });
  }
  if (seg[0] === 'forks' && !seg[1] && method === 'GET') {
    const q = new URL('http://x/' + url).searchParams;
    const problem = clean(q.get('problem'), 80), rc = clean(q.get('rc'), 80);
    if (!problem || !rc) return json(res, 200, { forks: [] });
    const r = await db.query("SELECT f.id,f.title,f.note,f.stack,f.clones,f.created_at,u.username AS by_user,u.domain,u.domain_verified FROM protocol_forks f LEFT JOIN users u ON u.id=f.user_id WHERE f.problem_id=$1 AND f.root_cause_id=$2 ORDER BY f.clones DESC, f.created_at DESC LIMIT 30", [problem, rc]);
    return json(res, 200, { forks: r.rows });
  }
  if (seg[0] === 'forks' && !seg[1] && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in to fork a protocol' });
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const problem_id = clean(b.problem_id, 80), root_cause_id = clean(b.root_cause_id, 80), title = clean(b.title, 80), note = clean(b.note, 500);
    if (!problem_id || !root_cause_id || !title) return json(res, 400, { error: 'Name your variation' });
    const stack = Array.isArray(b.stack) ? b.stack.filter((x) => typeof x === 'string').slice(0, 30) : [];
    const r = await db.query('INSERT INTO protocol_forks(problem_id,root_cause_id,user_id,title,note,stack) VALUES($1,$2,$3,$4,$5,$6) RETURNING id', [problem_id, root_cause_id, u.id, title, note || null, JSON.stringify(stack)]);
    await award(u.id, 'fork', 'fork:' + r.rows[0].id, 10);
    return json(res, 200, { ok: true, id: r.rows[0].id });
  }
  if (seg[0] === 'forks' && seg[1] && seg[2] === 'clone' && method === 'POST') {
    const id = parseInt(seg[1], 10); const b = await readBody(req) || {}; const voterKey = clean(b.voterKey, 64);
    if (!id || !voterKey) return json(res, 400, { error: 'Missing' });
    const fr = await db.query('SELECT * FROM protocol_forks WHERE id=$1', [id]); const f = fr.rows[0]; if (!f) return json(res, 404, { error: 'No such fork' });
    const ins = await db.query('INSERT INTO fork_clones(fork_id,voter_key) VALUES($1,$2) ON CONFLICT (fork_id,voter_key) DO NOTHING RETURNING id', [id, voterKey]);
    if (ins.rows[0]) { await db.query('UPDATE protocol_forks SET clones=clones+1 WHERE id=$1', [id]); if (f.user_id) await award(f.user_id, 'fork_clone', 'forkclone:' + id + ':' + voterKey, 5); }
    return json(res, 200, { ok: true, stack: f.stack, problem_id: f.problem_id, root_cause_id: f.root_cause_id, title: f.title });
  }
  if (seg[0] === 'forks' && seg[1] && method === 'GET') {
    const id = parseInt(seg[1], 10);
    const r = await db.query("SELECT f.id,f.title,f.note,f.stack,f.clones,f.problem_id,f.root_cause_id,f.created_at,u.username AS by_user,u.domain,u.domain_verified FROM protocol_forks f LEFT JOIN users u ON u.id=f.user_id WHERE f.id=$1", [id]);
    if (!r.rows[0]) return json(res, 404, { error: 'No such fork' });
    return json(res, 200, { fork: r.rows[0] });
  }
  // --- community pulse: a live feed of recent activity (forks, expert edits, discussion, foods) ---
  if (seg[0] === 'pulse' && method === 'GET') {
    const q = (sql) => db.query(sql).then((r) => r.rows).catch(() => []);
    const [forks, edits, comments, foods] = await Promise.all([
      q("SELECT f.id, f.title, f.problem_id, f.root_cause_id, f.created_at AS at, u.username AS actor, u.domain, u.domain_verified AS verified FROM protocol_forks f JOIN users u ON u.id=f.user_id ORDER BY f.created_at DESC LIMIT 8"),
      q("SELECT p.problem_id, p.root_cause_id, p.layer, p.created_at AS at, u.username AS actor, u.domain, u.domain_verified AS verified FROM proposals p JOIN users u ON u.id=p.user_id WHERE p.status='endorsed' ORDER BY p.created_at DESC LIMIT 8"),
      q("SELECT c.goal_id, c.created_at AS at, u.username AS actor, u.domain, u.domain_verified AS verified FROM comments c JOIN users u ON u.id=c.user_id ORDER BY c.created_at DESC LIMIT 8"),
      q("SELECT f.name, f.created_at AS at, u.username AS actor FROM user_foods f JOIN users u ON u.id=f.submitted_by WHERE f.status='active' ORDER BY f.created_at DESC LIMIT 5"),
    ]);
    const items = []
      .concat(forks.map((r) => Object.assign({ type: 'fork' }, r)))
      .concat(edits.map((r) => Object.assign({ type: 'edit' }, r)))
      .concat(comments.map((r) => Object.assign({ type: 'comment' }, r)))
      .concat(foods.map((r) => Object.assign({ type: 'food' }, r)))
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .slice(0, 14);
    return json(res, 200, { pulse: items });
  }
  // --- wiki-improvement feedback (open to everyone) ---
  if (seg[0] === 'feedback' && !seg[1] && method === 'POST') {
    const u = await currentUser(req);
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const body = clean(b.body, 2000); if (!body) return json(res, 400, { error: 'Tell us what to improve' });
    const kind = ['idea', 'wrong', 'other'].includes(b.kind) ? b.kind : 'idea';
    await db.query('INSERT INTO feedback(body,page,kind,user_id,contact) VALUES($1,$2,$3,$4,$5)',
      [body, clean(b.page, 200) || null, kind, u ? u.id : null, clean(b.contact, 120) || null]);
    if (u) await award(u.id, 'feedback', 'fb:' + Date.now(), 2);
    return json(res, 200, { ok: true });
  }
  // --- founding-clinician waitlist (public, no account needed) ---
  if (seg[0] === 'clinician-interest' && method === 'POST') {
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const name = clean(b.name, 120), email = clean(b.email, 160).toLowerCase();
    const discipline = clean(b.discipline, 60), note = clean(b.note, 600);
    if (!name) return json(res, 400, { error: 'Please add your name' });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json(res, 400, { error: 'Please add a valid email' });
    try {
      await db.query(`INSERT INTO clinician_interest(name,email,discipline,note) VALUES($1,$2,$3,$4)
        ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, discipline=EXCLUDED.discipline, note=EXCLUDED.note`,
        [name, email, discipline || null, note || null]);
      return json(res, 200, { ok: true });
    } catch (e) { console.error('[clinician-interest]', e.message); return json(res, 500, { error: 'Could not save — please try again' }); }
  }
  // ---------- the outcome loop: experiments · check-ins · results ledger ----------
  // collective counter for the home page (movement heartbeat)
  if (seg[0] === 'stats' && method === 'GET') {
    const r = await db.query("SELECT count(*)::int AS experiments, count(*) FILTER (WHERE outcome='better')::int AS improved FROM experiments");
    return json(res, 200, r.rows[0] || { experiments: 0, improved: 0 });
  }
  // public aggregate for one protocol (the Results Ledger)
  if (seg[0] === 'ledger' && method === 'GET') {
    const q = new URL('http://x/' + url).searchParams;
    const pid = clean(q.get('problem'), 80), rcid = clean(q.get('rc'), 80);
    if (!pid || !rcid) return json(res, 400, { error: 'Missing protocol' });
    const r = await db.query(`SELECT count(*)::int AS total,
        count(*) FILTER (WHERE status='running')::int AS running,
        count(*) FILTER (WHERE outcome='better')::int AS better,
        count(*) FILTER (WHERE outcome='same')::int AS same,
        count(*) FILTER (WHERE outcome='worse')::int AS worse
      FROM experiments WHERE problem_id=$1 AND root_cause_id=$2`, [pid, rcid]);
    return json(res, 200, r.rows[0]);
  }
  // my state for one protocol (running? streak? checked today? outcome?)
  if (seg[0] === 'experiments' && seg[1] === 'mine' && method === 'GET') {
    const q = new URL('http://x/' + url).searchParams;
    const pid = clean(q.get('problem'), 80), rcid = clean(q.get('rc'), 80);
    const part = await resolveParticipant(req, { voterKey: q.get('voterKey') });
    const blank = { experiment: null, streak: 0, checkedToday: false, level: null, completedTotal: 0, runningTotal: 0, checkinsThisWeek: 0, cohortSize: 0, weekLabel: '', onboarded: 0 };
    if (!part.key || !pid || !rcid) return json(res, 200, blank);
    const er = await db.query('SELECT id,status,outcome,started_at FROM experiments WHERE participant=$1 AND problem_id=$2 AND root_cause_id=$3', [part.key, pid, rcid]);
    const exp = er.rows[0];
    // participant-wide identity (across all their protocols) → level
    const tot = await db.query("SELECT count(*) FILTER (WHERE outcome IS NOT NULL)::int AS completed, count(*) FILTER (WHERE status='running')::int AS running FROM experiments WHERE participant=$1", [part.key]);
    const completedTotal = tot.rows[0].completed, runningTotal = tot.rows[0].running, level = levelFor(completedTotal);
    // cohort: people who started THIS protocol in my start week (or the current week if I haven't started)
    const wkExpr = exp ? '(SELECT started_at FROM experiments WHERE id=$3)' : 'now()';
    const cr = await db.query(`SELECT count(*)::int AS n, to_char(date_trunc('week', ${wkExpr}), 'IYYY-"W"IW') AS wk
      FROM experiments WHERE problem_id=$1 AND root_cause_id=$2 AND date_trunc('week', started_at)=date_trunc('week', ${wkExpr})`, exp ? [pid, rcid, exp.id] : [pid, rcid]);
    const cohortSize = cr.rows[0].n, weekLabel = cr.rows[0].wk;
    const onboarded = (await db.query('SELECT count(*)::int AS n FROM referrals WHERE referrer=$1', [part.key])).rows[0].n;
    if (!exp) return json(res, 200, Object.assign({}, blank, { level, completedTotal, runningTotal, cohortSize, weekLabel, onboarded }));
    const set = await checkinDays(exp.id);
    const ws = weekStartUTC();
    const checkinsThisWeek = [...set].filter(d => d >= ws).length;
    return json(res, 200, { experiment: { status: exp.status, outcome: exp.outcome, started_at: exp.started_at }, streak: streakFromDays(set), checkedToday: set.has(todayUTC()), level, completedTotal, runningTotal, checkinsThisWeek, cohortSize, weekLabel, onboarded });
  }
  if (seg[0] === 'experiments' && seg[1] === 'start' && method === 'POST') {
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const pid = clean(b.problemId, 80), rcid = clean(b.rootCauseId, 80);
    const part = await resolveParticipant(req, b);
    if (!part.key) return json(res, 400, { error: 'Could not identify you — enable cookies or sign in' });
    if (!pid || !rcid) return json(res, 400, { error: 'Missing protocol' });
    const exp = await getOrCreateExperiment(part, pid, rcid);
    await db.query("UPDATE experiments SET status='running' WHERE id=$1", [exp.id]);
    if (part.user) await award(part.user.id, 'experiment', 'start:' + exp.id, 10);
    // referral first-touch attribution: credit the sharer whose link brought this participant in
    const ref = clean(b.ref, 80);
    if (ref && ref !== part.key) {
      let referrer = null;
      if (ref.startsWith('u:')) { const uu = await db.query('SELECT id FROM users WHERE lower(username)=lower($1)', [ref.slice(2)]); if (uu.rows[0]) referrer = 'u:' + uu.rows[0].id; }
      else if (ref.startsWith('v:')) referrer = ref;
      if (referrer && referrer !== part.key) {
        const ins = await db.query('INSERT INTO referrals(referrer,participant) VALUES($1,$2) ON CONFLICT (participant) DO NOTHING RETURNING id', [referrer, part.key]);
        if (ins.rows[0] && referrer.startsWith('u:')) await award(parseInt(referrer.slice(2), 10), 'onboard', 'ob:' + part.key, 25);
      }
    }
    return json(res, 200, { ok: true, experimentId: exp.id, streak: 0 });
  }
  if (seg[0] === 'experiments' && seg[1] === 'checkin' && method === 'POST') {
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const pid = clean(b.problemId, 80), rcid = clean(b.rootCauseId, 80);
    const part = await resolveParticipant(req, b);
    if (!part.key || !pid || !rcid) return json(res, 400, { error: 'Missing protocol' });
    const exp = await getOrCreateExperiment(part, pid, rcid);
    const day = todayUTC();
    await db.query('INSERT INTO experiment_checkins(experiment_id,day) VALUES($1,$2) ON CONFLICT (experiment_id,day) DO NOTHING', [exp.id, day]);
    if (part.user) await award(part.user.id, 'checkin', 'ci:' + exp.id + ':' + day, 3);
    const set = await checkinDays(exp.id);
    return json(res, 200, { ok: true, streak: streakFromDays(set), checkedToday: true });
  }
  if (seg[0] === 'experiments' && seg[1] === 'outcome' && method === 'POST') {
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const pid = clean(b.problemId, 80), rcid = clean(b.rootCauseId, 80);
    const outcome = ['better', 'same', 'worse'].includes(b.outcome) ? b.outcome : null;
    if (!outcome) return json(res, 400, { error: 'Pick better, same, or worse' });
    const part = await resolveParticipant(req, b);
    if (!part.key || !pid || !rcid) return json(res, 400, { error: 'Missing protocol' });
    const exp = await getOrCreateExperiment(part, pid, rcid);
    await db.query("UPDATE experiments SET outcome=$1, status='completed', outcome_at=now() WHERE id=$2", [outcome, exp.id]);
    if (part.user) await award(part.user.id, 'outcome', 'oc:' + exp.id, 15);
    return json(res, 200, { ok: true, outcome });
  }
  // --- one-click CSV export of members / waitlist (super-admin only) ---
  if (seg[0] === 'admin' && seg[1] === 'telegram' && method === 'GET') {
    const u = await currentUser(req); if (!isSuper(u)) return json(res, 403, { error: 'Super-admin only' });
    const total = (await db.query('SELECT count(*)::int AS n FROM telegram_users WHERE active')).rows[0].n;
    const linked = (await db.query('SELECT count(*)::int AS n FROM telegram_users WHERE active AND pid IS NOT NULL')).rows[0].n;
    const active7 = (await db.query("SELECT count(*)::int AS n FROM telegram_users WHERE last_active > now() - interval '7 days'")).rows[0].n;
    const done7 = (await db.query("SELECT count(*)::int AS n FROM telegram_users WHERE keystone_days @> to_jsonb(to_char(now(),'YYYY-MM-DD'))")).rows[0].n;
    const top = (await db.query('SELECT pid, count(*)::int AS n FROM telegram_users WHERE pid IS NOT NULL GROUP BY pid ORDER BY n DESC LIMIT 8')).rows;
    return json(res, 200, { activated: total, linkedToProtocol: linked, activeLast7d: active7, doneKeystoneToday: done7, topProtocols: top });
  }
  if (seg[0] === 'admin' && seg[1] === 'export' && method === 'GET') {
    const u = await currentUser(req); if (!isSuper(u)) return json(res, 403, { error: 'Super-admin only' });
    const type = clean(new URL('http://x/' + url).searchParams.get('type'), 20);
    if (type === 'clinicians') {
      const r = await db.query('SELECT name,email,discipline,note,created_at FROM clinician_interest ORDER BY created_at DESC');
      return csvExport(res, 'rnawiki-clinicians.csv', ['name', 'email', 'discipline', 'note', 'joined'],
        r.rows.map(x => [x.name, x.email, x.discipline, x.note, x.created_at && x.created_at.toISOString()]));
    }
    // --- Research dataset exports (anonymous: pseudonymous user_id join key, no name/email) ---
    // Stable, non-reversible pseudonym so the exported dataset can't be joined back to a real identity.
    const anonId = uid => 'S' + crypto.createHmac('sha256', SECRET).update('anon:' + uid).digest('hex').slice(0, 12);
    if (type === 'checkins') {   // the core outcome dataset, joined to demographics — no identity, only pseudonym + demographics + outcomes
      const r = await db.query(`SELECT c.user_id, c.pid, c.rcid, c.phase, c.symptom_0_10, c.improvement, c.adherence_pct, c.still_on, c.stop_reason, c.side_effects, c.extra,
        p.age_band, p.sex, p.ethnicity, p.conditions, p.height_cm, p.meds, to_char(c.created_at,'YYYY-MM-DD"T"HH24:MI:SSZ') AS created_at
        FROM outcome_checkins c LEFT JOIN user_profile p ON p.user_id=c.user_id ORDER BY c.user_id, c.created_at`);
      return csvExport(res, 'rnawiki-checkins.csv',
        ['subject', 'pid', 'rcid', 'phase', 'symptom_0_10', 'improvement', 'adherence_pct', 'still_on', 'stop_reason', 'side_effects', 'extra', 'age_band', 'sex', 'ethnicity', 'conditions', 'height_cm', 'meds', 'created_at'],
        r.rows.map(x => [anonId(x.user_id), x.pid, x.rcid, x.phase, x.symptom_0_10, x.improvement, x.adherence_pct, x.still_on, x.stop_reason, x.side_effects, x.extra ? JSON.stringify(x.extra) : '', x.age_band, x.sex, x.ethnicity, Array.isArray(x.conditions) ? x.conditions.join('|') : '', x.height_cm, Array.isArray(x.meds) ? x.meds.join('|') : '', x.created_at]));
    }
    if (type === 'markers') {
      const r = await db.query(`SELECT user_id, marker, value, unit, to_char(taken_on,'YYYY-MM-DD') AS taken_on FROM blood_markers ORDER BY user_id, marker, taken_on`);
      return csvExport(res, 'rnawiki-markers.csv', ['subject', 'marker', 'value', 'unit', 'taken_on'],
        r.rows.map(x => [anonId(x.user_id), x.marker, x.value, x.unit, x.taken_on]));
    }
    if (type === 'wearables') {
      const r = await db.query(`SELECT user_id, to_char(day,'YYYY-MM-DD') AS day, steps, sleep_min, resting_hr, weight_kg, waist_cm FROM wearable_daily ORDER BY user_id, day`);
      return csvExport(res, 'rnawiki-wearables.csv', ['subject', 'day', 'steps', 'sleep_min', 'resting_hr', 'weight_kg', 'waist_cm'],
        r.rows.map(x => [anonId(x.user_id), x.day, x.steps, x.sleep_min, x.resting_hr, x.weight_kg, x.waist_cm]));
    }
    const r = await db.query('SELECT username,email,role,domain,domain_verified,reputation_points,created_at FROM users ORDER BY created_at DESC');
    return csvExport(res, 'rnawiki-members.csv', ['username', 'email', 'role', 'domain', 'domain_verified', 'reputation', 'joined'],
      r.rows.map(x => [x.username, x.email, x.role, x.domain, x.domain_verified, x.reputation_points, x.created_at && x.created_at.toISOString()]));
  }
  if (seg[0] === 'admin' && seg[1] === 'feedback' && seg[2] && method === 'POST') {
    const u = await currentUser(req); if (!isSuper(u)) return json(res, 403, { error: 'Super-admin only' });
    const id = parseInt(seg[2], 10); const b = await readBody(req) || {};
    const status = ['open', 'done', 'archived'].includes(b.status) ? b.status : 'done';
    await db.query('UPDATE feedback SET status=$1 WHERE id=$2', [status, id]);
    return json(res, 200, { ok: true });
  }
  // --- root-cause governance: experts propose add/remove; the relevant panel endorses ---
  if (seg[0] === 'rootcause-changes' && !seg[1] && method === 'GET') {
    const problem = clean(new URL('http://x/' + url).searchParams.get('problem'), 80);
    const where = problem ? 'WHERE c.problem_id=$1' : "WHERE c.status='pending'";
    const params = problem ? [problem] : [];
    const meId = (await currentUser(req) || {}).id || 0;
    const r = await db.query(`SELECT c.id,c.problem_id,c.action,c.root_cause_id,c.name,c.diagnostic,c.domains,c.rationale,c.status,c.created_at,
      u.username AS by_user,
      (SELECT count(*) FROM rootcause_endorsements e WHERE e.change_id=c.id) AS endorsements,
      (SELECT count(*) FROM rootcause_endorsements e WHERE e.change_id=c.id AND e.user_id=$${params.length + 1}) AS mine
      FROM rootcause_changes c LEFT JOIN users u ON u.id=c.submitted_by ${where} ORDER BY c.created_at DESC LIMIT 100`, [...params, meId]);
    return json(res, 200, { changes: r.rows, threshold: PANEL_THRESHOLD });
  }
  if (seg[0] === 'rootcause-changes' && !seg[1] && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in' });
    if (u.role !== 'admin' && !u.domain_verified) return json(res, 403, { error: 'Only verified experts can propose root-cause changes' });
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const problem_id = clean(b.problem_id, 80), action = b.action === 'remove' ? 'remove' : 'add';
    if (!problem_id) return json(res, 400, { error: 'Missing problem' });
    const domains = Array.isArray(b.domains) ? b.domains.filter(d => typeof d === 'string').slice(0, 5) : [];
    const rationale = clean(b.rationale, 800);
    let root_cause_id = clean(b.root_cause_id, 80), name = clean(b.name, 120), diagnostic = clean(b.diagnostic, 400);
    if (action === 'add') {
      if (!name) return json(res, 400, { error: 'Name the root cause you want to add' });
      root_cause_id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'rc-' + Date.now();
    } else if (!root_cause_id) return json(res, 400, { error: 'Missing root cause to remove' });
    const r = await db.query('INSERT INTO rootcause_changes(problem_id,action,root_cause_id,name,diagnostic,domains,rationale,submitted_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id',
      [problem_id, action, root_cause_id, name || null, diagnostic || null, JSON.stringify(domains), rationale || null, u.id]);
    await award(u.id, 'rc_change', 'rcc:' + r.rows[0].id, 15);
    return json(res, 200, { ok: true, id: r.rows[0].id });
  }
  if (seg[0] === 'rootcause-changes' && seg[1] && seg[2] === 'endorse' && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in' });
    const id = parseInt(seg[1], 10);
    const cr = await db.query('SELECT * FROM rootcause_changes WHERE id=$1', [id]);
    const ch = cr.rows[0]; if (!ch) return json(res, 404, { error: 'No such change' });
    if (ch.status !== 'pending') return json(res, 400, { error: 'Already decided' });
    // the panel = verified experts whose domain is required by this root cause (or a steward of the problem, or the superadmin)
    const panelDomains = Array.isArray(ch.domains) ? ch.domains : [];
    const steward = await db.query('SELECT 1 FROM stewardships WHERE problem_id=$1 AND user_id=$2 LIMIT 1', [ch.problem_id, u.id]);
    const onPanel = isSuper(u) || u.role === 'admin' || steward.rows[0] || (u.domain_verified && (panelDomains.length === 0 || panelDomains.includes(u.domain)));
    if (!onPanel) return json(res, 403, { error: 'Only the relevant expert panel or a steward of this problem can endorse' });
    await db.query('INSERT INTO rootcause_endorsements(change_id,user_id,domain) VALUES($1,$2,$3) ON CONFLICT (change_id,user_id) DO NOTHING', [id, u.id, u.domain || null]);
    await award(u.id, 'rc_endorse', 'rcc:' + id, 5);
    const cnt = await db.query('SELECT count(*)::int AS n FROM rootcause_endorsements WHERE change_id=$1', [id]);
    let status = ch.status;
    // A peer approval never publishes. It moves the change to 'peer_approved' — awaiting the
    // superadmin's final approval, which is the only thing that makes it live.
    if (cnt.rows[0].n >= PANEL_THRESHOLD) { await db.query("UPDATE rootcause_changes SET status='peer_approved' WHERE id=$1 AND status='pending'", [id]); status = 'peer_approved'; }
    return json(res, 200, { ok: true, endorsements: cnt.rows[0].n, status });
  }
  if (seg[0] === 'rootcause-overlay' && method === 'GET') {
    const r = await db.query("SELECT problem_id,action,root_cause_id,name,diagnostic,domains FROM rootcause_changes WHERE status='approved' ORDER BY created_at ASC");
    return json(res, 200, { overlay: r.rows });
  }
  if (seg[0] === 'admin' && seg[1] === 'rootcause-changes' && seg[2] && method === 'POST') {
    const u = await currentUser(req); if (!isSuper(u)) return json(res, 403, { error: 'Super-admin only' });
    const id = parseInt(seg[2], 10); const b = await readBody(req) || {};
    const status = ['approved', 'rejected', 'pending'].includes(b.status) ? b.status : 'approved';
    await db.query('UPDATE rootcause_changes SET status=$1, decided_by=$2 WHERE id=$3', [status, u.id, id]);
    return json(res, 200, { ok: true });
  }
  // --- consolidated super-admin control room: everything the superadmin needs in one call ---
  // Cohort outcomes — the data moat, aggregated (super-admin only).
  if (seg[0] === 'admin' && seg[1] === 'outcomes' && method === 'GET') {
    const u = await currentUser(req); if (!isSuper(u)) return json(res, 403, { error: 'Super-admin only' });
    const rows = (await db.query(`
      SELECT pid, rcid,
        COUNT(*) FILTER (WHERE phase='baseline') AS baseline_n,
        COUNT(*) FILTER (WHERE phase='d30') AS d30_n,
        COUNT(*) FILTER (WHERE phase='d90') AS d90_n,
        COUNT(*) FILTER (WHERE phase='d30' AND improvement>=1) AS d30_imp,
        COUNT(*) FILTER (WHERE phase='d90' AND improvement>=1) AS d90_imp,
        ROUND(AVG(adherence_pct) FILTER (WHERE phase IN ('d30','d90'))) AS avg_adh
      FROM outcome_checkins GROUP BY pid, rcid
      ORDER BY d90_n DESC, d30_n DESC, baseline_n DESC`)).rows;
    const delta = (await db.query(`
      WITH base AS (SELECT user_id,pid,rcid,symptom_0_10 s FROM outcome_checkins WHERE phase='baseline' AND symptom_0_10 IS NOT NULL),
           lastc AS (SELECT DISTINCT ON (user_id,pid,rcid) user_id,pid,rcid,symptom_0_10 s
                     FROM outcome_checkins WHERE phase IN ('d30','d90') AND symptom_0_10 IS NOT NULL
                     ORDER BY user_id,pid,rcid,(phase='d90') DESC)
      SELECT b.pid,b.rcid, ROUND(AVG(b.s-l.s)::numeric,1) AS delta, COUNT(*) AS n
      FROM base b JOIN lastc l USING(user_id,pid,rcid) GROUP BY b.pid,b.rcid`)).rows;
    const dmap = {}; delta.forEach(d => { dmap[d.pid + '/' + d.rcid] = { delta: d.delta, n: d.n }; });
    rows.forEach(r => { const d = dmap[r.pid + '/' + r.rcid]; r.symptom_delta = d ? d.delta : null; r.delta_n = d ? d.n : 0; });
    const totals = (await db.query(`SELECT
      (SELECT COUNT(*) FROM user_consent WHERE consent_research) AS consented,
      (SELECT COUNT(*) FROM outcome_checkins) AS checkins,
      (SELECT COUNT(*) FROM (SELECT DISTINCT pid,rcid FROM outcome_checkins) t) AS protocols`)).rows[0];
    return json(res, 200, { rows, totals });
  }
  // High-value signal breakdowns for the Control Room — super-admin only (owner's own dataset, no k-anon floor)
  if (seg[0] === 'admin' && seg[1] === 'signals' && method === 'GET') {
    const u = await currentUser(req); if (!isSuper(u)) return json(res, 403, { error: 'Super-admin only' });
    const [stopReasons, sideFx, sideFxSamples, whtr, waistN, medsUsers, topMeds, extras] = await Promise.all([
      db.query(`SELECT stop_reason, COUNT(*)::int n FROM outcome_checkins WHERE stop_reason IS NOT NULL GROUP BY stop_reason ORDER BY n DESC`),
      db.query(`SELECT COUNT(*)::int n, COUNT(DISTINCT user_id)::int users FROM outcome_checkins WHERE side_effects IS NOT NULL`),
      db.query(`SELECT pid, side_effects FROM outcome_checkins WHERE side_effects IS NOT NULL ORDER BY created_at DESC LIMIT 15`),
      db.query(`WITH lastw AS (SELECT DISTINCT ON (user_id) user_id, waist_cm FROM wearable_daily WHERE waist_cm IS NOT NULL ORDER BY user_id, day DESC)
        SELECT COUNT(*)::int n, ROUND(AVG(w.waist_cm / p.height_cm)::numeric,3) AS avg_whtr,
          COUNT(*) FILTER (WHERE w.waist_cm / p.height_cm >= 0.5)::int AS at_risk
        FROM lastw w JOIN user_profile p ON p.user_id=w.user_id AND p.height_cm IS NOT NULL`),
      db.query(`SELECT COUNT(DISTINCT user_id)::int n FROM wearable_daily WHERE waist_cm IS NOT NULL`),
      db.query(`SELECT COUNT(*)::int n FROM user_profile WHERE jsonb_array_length(meds) > 0`),
      db.query(`SELECT lower(trim(m.med)) AS med, COUNT(*)::int AS n FROM user_profile p, jsonb_array_elements_text(p.meds) AS m(med) WHERE jsonb_array_length(p.meds) > 0 GROUP BY 1 ORDER BY n DESC LIMIT 15`),
      db.query(`SELECT e.k AS key, ROUND(AVG(e.v::numeric),2) AS avg, COUNT(*)::int AS n FROM outcome_checkins oc, jsonb_each_text(oc.extra) AS e(k,v) WHERE oc.extra IS NOT NULL GROUP BY e.k ORDER BY n DESC`),
    ]);
    const due = await listDueCheckins().catch(() => []);
    const nudgesSent = (await db.query('SELECT COUNT(*)::int n FROM users WHERE last_checkin_email IS NOT NULL')).rows[0].n;
    return json(res, 200, {
      stopReasons: stopReasons.rows, sideFx: sideFx.rows[0], sideFxSamples: sideFxSamples.rows,
      whtr: whtr.rows[0], waistN: waistN.rows[0].n, medsUsers: medsUsers.rows[0].n, topMeds: topMeds.rows, extras: extras.rows,
      nudges: { due: due.length, emailConfigured: !!RESEND_API_KEY, sent: nudgesSent },
    });
  }
  // Research-grade insights — the highest-value analyses, super-admin only (owner's dataset, no k-anon floor)
  if (seg[0] === 'admin' && seg[1] === 'research' && method === 'GET') {
    const u = await currentUser(req); if (!isSuper(u)) return json(res, 403, { error: 'Super-admin only' });
    // 1) Within-person biomarker before→after (needs ≥2 readings of a marker for a user)
    const biomarkerDeltas = (await db.query(`
      WITH pairs AS (
        SELECT user_id, marker,
          (array_agg(value ORDER BY taken_on ASC NULLS FIRST, id ASC))[1] AS v0,
          (array_agg(value ORDER BY taken_on DESC NULLS LAST, id DESC))[1] AS v1
        FROM blood_markers WHERE value IS NOT NULL
        GROUP BY user_id, marker HAVING COUNT(*) >= 2)
      SELECT marker, COUNT(*)::int AS users, ROUND(AVG(v1 - v0)::numeric, 2) AS avg_delta,
        COUNT(*) FILTER (WHERE v1 < v0)::int AS fell, COUNT(*) FILTER (WHERE v1 > v0)::int AS rose
      FROM pairs GROUP BY marker ORDER BY users DESC`)).rows;
    // 2) Responder phenotype — % reporting improvement, split by demographic dimension
    const phenotype = (await db.query(`
      SELECT dim, k, COUNT(*)::int n, COUNT(*) FILTER (WHERE improvement>=1)::int better FROM (
        SELECT 'age' dim, p.age_band k, oc.improvement FROM outcome_checkins oc JOIN user_profile p ON p.user_id=oc.user_id WHERE oc.phase IN ('d30','d90') AND oc.improvement IS NOT NULL AND p.age_band IS NOT NULL
        UNION ALL SELECT 'sex', p.sex, oc.improvement FROM outcome_checkins oc JOIN user_profile p ON p.user_id=oc.user_id WHERE oc.phase IN ('d30','d90') AND oc.improvement IS NOT NULL AND p.sex IS NOT NULL
        UNION ALL SELECT 'ethnicity', p.ethnicity, oc.improvement FROM outcome_checkins oc JOIN user_profile p ON p.user_id=oc.user_id WHERE oc.phase IN ('d30','d90') AND oc.improvement IS NOT NULL AND p.ethnicity IS NOT NULL
      ) t GROUP BY dim, k ORDER BY dim, n DESC`)).rows;
    const byCondition = (await db.query(`
      SELECT cond AS k, COUNT(*)::int n, COUNT(*) FILTER (WHERE oc.improvement>=1)::int better
      FROM outcome_checkins oc JOIN user_profile p ON p.user_id=oc.user_id, jsonb_array_elements_text(p.conditions) AS cond
      WHERE oc.phase IN ('d30','d90') AND oc.improvement IS NOT NULL GROUP BY cond ORDER BY n DESC`)).rows;
    // 3) What's NOT working — negative results by protocol
    const negativeResults = (await db.query(`
      SELECT pid, rcid, COUNT(*)::int n,
        COUNT(*) FILTER (WHERE improvement <= 0)::int no_improve,
        COUNT(*) FILTER (WHERE stop_reason='didnt_work')::int didnt_work,
        ROUND(AVG(improvement)::numeric,2) avg_imp
      FROM outcome_checkins WHERE phase IN ('d30','d90')
      GROUP BY pid, rcid HAVING COUNT(*) >= 1 ORDER BY didnt_work DESC, no_improve DESC LIMIT 20`)).rows;
    // 4) Adverse events attributed to the compounds the user was taking (association, not causation)
    const sfxRows = (await db.query(`SELECT user_id, pid, rcid FROM outcome_checkins WHERE side_effects IS NOT NULL`)).rows;
    const adverseByCompound = [];
    if (sfxRows.length) {
      const uids = [...new Set(sfxRows.map(r => r.user_id))];
      const plans = (await db.query('SELECT user_id, plan FROM user_plans WHERE user_id = ANY($1)', [uids])).rows;
      const planBy = {}; plans.forEach(p => { planBy[p.user_id] = p.plan; });
      const tally = {};
      for (const r of sfxRows) {
        const plan = planBy[r.user_id]; const protos = (plan && Array.isArray(plan.protocols)) ? plan.protocols : [];
        const pr = protos.find(x => x.pid === r.pid && x.rcid === r.rcid) || protos[0];
        const supps = (pr && Array.isArray(pr.supps)) ? pr.supps : [];
        for (const sid of supps) { tally[sid] = (tally[sid] || 0) + 1; }
      }
      for (const sid of Object.keys(tally)) {
        const c = COMPOUND_BY_ID[sid] || { name: sid, isRx: false, badge: '' };
        adverseByCompound.push({ compound: c.name, n: tally[sid], isRx: c.isRx, badge: c.badge });
      }
      adverseByCompound.sort((a, b) => b.n - a.n);
    }
    return json(res, 200, { biomarkerDeltas, phenotype, byCondition, negativeResults, adverseByCompound: adverseByCompound.slice(0, 20) });
  }
  if (seg[0] === 'admin' && seg[1] === 'overview' && method === 'GET') {
    const u = await currentUser(req); if (!isSuper(u)) return json(res, 403, { error: 'Super-admin only' });
    const [experts, partners, foods, requests, rcc, feedback, proposals, cedits, members, memberCount, clinicians] = await Promise.all([
      db.query("SELECT id,username,domain,requested_domain,domain_verified,application_status,credential,role_backlink,reputation_points FROM users WHERE domain IS NOT NULL OR requested_domain IS NOT NULL ORDER BY (application_status='pending') DESC, domain_verified ASC, created_at ASC"),
      db.query('SELECT id,name,type,location,link,backlink_url,serves,status,created_at FROM partners ORDER BY status ASC, created_at DESC LIMIT 200'),
      db.query("SELECT f.id,f.name,f.serving,f.data,f.status,f.created_at,u.username AS by_user FROM user_foods f LEFT JOIN users u ON u.id=f.submitted_by WHERE f.status='pending' ORDER BY f.created_at ASC LIMIT 200"),
      db.query("SELECT id,request,detail,votes,status,created_at FROM protocol_requests ORDER BY (status='open') DESC, votes DESC, created_at DESC LIMIT 100"),
      db.query(`SELECT c.id,c.problem_id,c.action,c.root_cause_id,c.name,c.diagnostic,c.domains,c.rationale,c.status,c.created_at,u.username AS by_user,
        (SELECT count(*)::int FROM rootcause_endorsements e WHERE e.change_id=c.id) AS endorsements
        FROM rootcause_changes c LEFT JOIN users u ON u.id=c.submitted_by ORDER BY (c.status='peer_approved') DESC, (c.status='pending') DESC, c.created_at DESC LIMIT 100`),
      db.query("SELECT f.id,f.body,f.page,f.kind,f.contact,f.status,f.created_at,u.username AS by_user FROM feedback f LEFT JOIN users u ON u.id=f.user_id WHERE f.status='open' ORDER BY f.created_at DESC LIMIT 200"),
      db.query(`SELECT p.id,p.problem_id,p.root_cause_id,p.layer,p.domain,p.change,p.evidence,p.status,p.created_at,u.username AS by_user,
        (SELECT COUNT(*)::int FROM proposal_actions a WHERE a.proposal_id=p.id AND a.action='endorse') AS endorsements
        FROM proposals p JOIN users u ON u.id=p.user_id WHERE p.status='pending' ORDER BY p.created_at ASC LIMIT 100`),
      db.query("SELECT e.id,e.compound_id,e.compound_name,e.note,e.created_at,u.username AS by_user FROM edits e JOIN users u ON u.id=e.user_id ORDER BY e.created_at DESC LIMIT 60"),
      db.query("SELECT username,email,role,domain,domain_verified,reputation_points,created_at FROM users ORDER BY created_at DESC LIMIT 500"),
      db.query('SELECT count(*)::int AS n FROM users'),
      db.query('SELECT name,email,discipline,note,created_at FROM clinician_interest ORDER BY created_at DESC LIMIT 500'),
    ]);
    return json(res, 200, { experts: experts.rows, partners: partners.rows, foods: foods.rows, requests: requests.rows, rootcauseChanges: rcc.rows, feedback: feedback.rows, proposals: proposals.rows, compoundEdits: cedits.rows, members: members.rows, memberCount: memberCount.rows[0].n, clinicians: clinicians.rows, threshold: PANEL_THRESHOLD });
  }
  if (seg[0] === 'foods' && seg[1] && seg[2] === 'verify' && method === 'POST') {
    const u = await currentUser(req); if (!u || !(u.role === 'admin' || (u.domain === 'dietitian' && u.domain_verified))) return json(res, 403, { error: 'Verified dietitians only' });
    const id = parseInt(seg[1], 10); const b = await readBody(req) || {};
    const status = ['active', 'rejected'].includes(b.status) ? b.status : 'active';
    const r = await db.query('UPDATE user_foods SET status=$1, verified_by=$2 WHERE id=$3 RETURNING id,name,status', [status, u.id, id]);
    if (!r.rows[0]) return json(res, 404, { error: 'No such food' });
    return json(res, 200, { ok: true, food: r.rows[0] });
  }
  if (seg[0] === 'admin' && seg[1] === 'partners' && method === 'GET') {
    const u = await currentUser(req); if (!u || u.role !== 'admin') return json(res, 403, { error: 'Admin only' });
    const r = await db.query('SELECT id,name,type,location,link,backlink_url,serves,status,created_at FROM partners ORDER BY status ASC, created_at DESC LIMIT 200');
    return json(res, 200, { partners: r.rows });
  }
  if (seg[0] === 'admin' && seg[1] === 'partners' && seg[2] && method === 'POST') {
    const u = await currentUser(req); if (!u || u.role !== 'admin') return json(res, 403, { error: 'Admin only' });
    const id = parseInt(seg[2], 10); const b = await readBody(req) || {};
    const status = ['active', 'rejected', 'pending'].includes(b.status) ? b.status : 'active';
    const r = await db.query('UPDATE partners SET status=$1 WHERE id=$2 RETURNING id,name,status', [status, id]);
    if (!r.rows[0]) return json(res, 404, { error: 'No such partner' });
    return json(res, 200, { ok: true, partner: r.rows[0] });
  }
  if (seg[0] === 'proposals' && method === 'GET') {
    const sp = new URL('http://x/' + url).searchParams;
    const pid = clean(sp.get('problem'), 60), rcid = clean(sp.get('rc'), 60);
    if (!pid || !rcid) return json(res, 400, { error: 'problem & rc required' });
    const r = await db.query(
      `SELECT p.id,p.layer,p.domain,p.change,p.evidence,p.status,p.created_at,u.username,u.credential,u.domain_verified,
        (SELECT COUNT(*)::int FROM proposal_actions a WHERE a.proposal_id=p.id AND a.action='endorse') AS endorsements,
        (SELECT COUNT(*)::int FROM proposal_actions a WHERE a.proposal_id=p.id AND a.action='flag') AS flags
       FROM proposals p JOIN users u ON u.id=p.user_id
       WHERE p.problem_id=$1 AND p.root_cause_id=$2 ORDER BY p.created_at DESC LIMIT 100`, [pid, rcid]);
    return json(res, 200, { proposals: r.rows });
  }
  if (seg[0] === 'proposals' && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in' });
    if (!u.domain) return json(res, 403, { error: 'Set your expert domain first (physio / dietitian / pharmacist).' });
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const pid = clean(b.problemId, 60), rcid = clean(b.rootCauseId, 60), layer = clean(b.layer, 12);
    const change = clean(b.change, 4000), evidence = clean(b.evidence, 500);
    if (!pid || !rcid || !change) return json(res, 400, { error: 'Describe the change' });
    // Any VERIFIED domain expert may edit their layer on any protocol (dietitian→fuel/nutrition,
    // pharmacist→stack, physio→move); the protocol's steward + a same-domain peer review it.
    if (u.role !== 'admin' && !u.domain_verified) return json(res, 403, { error: 'Get your expert role verified first (Pro dashboard) to edit protocols.' });
    if (u.domain && DOMAIN_LAYER[u.domain] !== layer) return json(res, 403, { error: `A ${(({ physio: 'movement', dietitian: 'nutrition', pharmacist: 'pharmacology' })[u.domain]) || u.domain} expert may only edit the ${DOMAIN_LAYER[u.domain]} layer.` });
    const r = await db.query(
      `INSERT INTO proposals(problem_id,root_cause_id,layer,domain,user_id,change,evidence)
       VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id,created_at`, [pid, rcid, layer, u.domain, u.id, change, evidence || null]);
    await award(u.id, 'proposal', r.rows[0].id);
    return json(res, 200, { ok: true, id: r.rows[0].id });
  }
  if (seg[0] === 'proposals' && seg[1] && seg[2] === 'endorse' && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in' });
    const sup = isSuper(u); // superadmin (Felix) can approve any pending edit, regardless of domain
    if (!sup && !u.domain) return json(res, 403, { error: 'Set your expert domain first.' });
    const id = parseInt(seg[1], 10); if (!id) return json(res, 400, { error: 'bad id' });
    const pr = (await db.query('SELECT domain,user_id FROM proposals WHERE id=$1', [id])).rows[0];
    if (!pr) return json(res, 404, { error: 'Proposal not found' });
    // STRICT peer review: a same-domain expert (not the author) approves — OR the superadmin.
    if (!sup && pr.user_id === u.id) return json(res, 403, { error: 'You cannot endorse your own proposal.' });
    if (!sup && pr.domain !== u.domain) return json(res, 403, { error: `Only another ${pr.domain} or the RNAwiki admin can approve this. Cross-domain experts may Flag instead.` });
    const ins = await db.query(`INSERT INTO proposal_actions(proposal_id,user_id,action) VALUES($1,$2,'endorse')
      ON CONFLICT (proposal_id,user_id,action) DO NOTHING RETURNING id`, [id, u.id]);
    await db.query(`UPDATE proposals SET status='endorsed' WHERE id=$1 AND status!='flagged'`, [id]);
    // merged (peer-reviewed): +200 to both author and endorser, and the Verified Expert badge.
    if (ins.rows[0]) {
      await award(pr.user_id, 'merged', id); await addBadge(pr.user_id, 'verified-expert');
      await award(u.id, 'merged', 'endorse:' + id); await addBadge(u.id, 'verified-expert');
    }
    // reviewing keeps any protocols this expert stewards "active" (challenge clock resets)
    await db.query('UPDATE stewardships SET last_active_at=now() WHERE user_id=$1', [u.id]).catch(() => {});
    return json(res, 200, { ok: true });
  }
  if (seg[0] === 'proposals' && seg[1] && seg[2] === 'flag' && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in' });
    const sup = isSuper(u); // superadmin (Felix) can reject any pending edit
    if (!sup && !u.domain) return json(res, 403, { error: 'Set your expert domain first.' });
    const id = parseInt(seg[1], 10); if (!id) return json(res, 400, { error: 'bad id' });
    const pr = (await db.query('SELECT domain FROM proposals WHERE id=$1', [id])).rows[0];
    if (!pr) return json(res, 404, { error: 'Proposal not found' });
    // Cross-domain conflict review: only a DIFFERENT domain can flag — OR the superadmin.
    if (!sup && pr.domain === u.domain) return json(res, 403, { error: 'Same-domain experts endorse, not flag. Flags are for cross-domain conflicts.' });
    const b = await readBody(req) || {};
    await db.query(`INSERT INTO proposal_actions(proposal_id,user_id,action,note) VALUES($1,$2,'flag',$3)
      ON CONFLICT (proposal_id,user_id,action) DO UPDATE SET note=$3`, [id, u.id, clean(b.note, 500) || null]);
    await db.query(`UPDATE proposals SET status='flagged' WHERE id=$1`, [id]);
    return json(res, 200, { ok: true });
  }

  // --- AI food-photo scan (logged-in, capped, opt-in) ---
  if (seg[0] === 'scan' && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in to scan food photos.' });
    if (!ANTHROPIC_API_KEY) return json(res, 503, { error: 'Photo scanning is not switched on yet. Use the barcode scanner or log by name.' });
    const cnt = await db.query("SELECT COUNT(*)::int AS n FROM scans WHERE user_id=$1 AND created_at > now() - interval '1 day'", [u.id]);
    if (cnt.rows[0].n >= SCAN_CAP) return json(res, 429, { error: `Daily photo-scan limit reached (${SCAN_CAP}/day). Use the free barcode scanner or log by name.` });
    const b = await readBody(req, 4e5); if (!b || !b.image) return json(res, 400, { error: 'No image' });
    const mediaType = /^image\/(jpeg|png|webp|gif)$/.test(b.mediaType || '') ? b.mediaType : 'image/jpeg';
    try {
      const food = await scanFood(b.image, mediaType);
      await db.query('INSERT INTO scans(user_id, kcal) VALUES($1,$2)', [u.id, (food && food.kcal != null) ? Math.round(food.kcal) : null]);
      if (!food || !food.name) return json(res, 200, { food: null });
      const note = food._note; delete food._note;
      return json(res, 200, { food, note });
    } catch (e) { console.error('[scan]', e.message); return json(res, 502, { error: 'Could not analyse the image right now.' }); }
  }

  // --- public contributor showcase (attribution incentive) ---
  if (seg[0] === 'contributors' && method === 'GET') {
    const experts = await db.query("SELECT username, domain, credential FROM users WHERE domain_verified = true ORDER BY username");
    const board = await db.query(`SELECT u.username,
        (SELECT COUNT(*)::int FROM edits e WHERE e.user_id=u.id) AS edits,
        (SELECT COUNT(*)::int FROM comments c WHERE c.user_id=u.id) AS comments,
        (SELECT COUNT(*)::int FROM proposals p WHERE p.user_id=u.id) AS proposals
      FROM users u ORDER BY (
        (SELECT COUNT(*) FROM edits e WHERE e.user_id=u.id) +
        (SELECT COUNT(*) FROM comments c WHERE c.user_id=u.id) +
        (SELECT COUNT(*) FROM proposals p WHERE p.user_id=u.id)) DESC LIMIT 25`);
    const leaderboard = board.rows.filter(r => (r.edits + r.comments + r.proposals) > 0);
    const top = await db.query(`SELECT username, domain, domain_verified, reputation_points, socials
      FROM users WHERE reputation_points > 0 ORDER BY reputation_points DESC, username ASC LIMIT 5`);
    return json(res, 200, { experts: experts.rows, leaderboard, top: top.rows });
  }

  // --- top 3 contributors on a specific protocol (comments + proposals here) ---
  if (seg[0] === 'protocol-contributors' && method === 'GET') {
    const q = new URL('http://x/' + url).searchParams;
    const pid = clean(q.get('problem'), 60), rcid = clean(q.get('rc'), 60);
    if (!pid || !rcid) return json(res, 400, { error: 'problem & rc required' });
    const key = `p:${pid}:${rcid}`;
    const r = await db.query(`SELECT u.username, u.domain, u.domain_verified, u.reputation_points, u.socials,
        (SELECT COUNT(*)::int FROM comments c WHERE c.user_id=u.id AND c.goal_id=$3) AS comments,
        (SELECT COUNT(*)::int FROM proposals p WHERE p.user_id=u.id AND p.problem_id=$1 AND p.root_cause_id=$2) AS edits
      FROM users u
      WHERE u.id IN (SELECT user_id FROM comments WHERE goal_id=$3
                     UNION SELECT user_id FROM proposals WHERE problem_id=$1 AND root_cause_id=$2)
      ORDER BY (comments + edits) DESC, u.reputation_points DESC LIMIT 3`, [pid, rcid, key]);
    return json(res, 200, { contributors: r.rows });
  }

  // --- admin: credential verification for stewardship ---
  if (seg[0] === 'admin' && seg[1] === 'experts' && method === 'GET') {
    const u = await currentUser(req); if (!u || u.role !== 'admin') return json(res, 403, { error: 'Admin only' });
    const r = await db.query("SELECT username, domain, requested_domain, application_status, credential, role_backlink, domain_verified, created_at FROM users WHERE domain IS NOT NULL OR requested_domain IS NOT NULL ORDER BY (application_status='pending') DESC, domain_verified ASC, created_at ASC");
    return json(res, 200, { experts: r.rows });
  }
  if (seg[0] === 'admin' && seg[1] === 'verify-domain' && method === 'POST') {
    const u = await currentUser(req); if (!isSuper(u)) return json(res, 403, { error: 'Super-admin only' });
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const username = clean(b.username, 24); const verified = b.verified !== false;
    // approve = grant the requested (or current) domain + verified; reject/unverify = revoke it.
    const r = verified
      ? await db.query("UPDATE users SET domain=COALESCE(requested_domain, domain), domain_verified=true, application_status='approved', requested_domain=null WHERE username=$1 RETURNING username, domain, domain_verified", [username])
      : await db.query("UPDATE users SET domain_verified=false, domain=null, application_status='rejected' WHERE username=$1 RETURNING username, domain, domain_verified", [username]);
    if (!r.rows[0]) return json(res, 404, { error: 'No such user' });
    return json(res, 200, { ok: true, user: r.rows[0] });
  }

  return json(res, 404, { error: 'Not found' });
}

// ---------- static ----------
function sendFile(res, file, code) {
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    const ext = path.extname(file);
    if (ext === '.html') return endHtml(res, data, code);
    const headers = { 'Content-Type': TYPES[ext] || 'application/octet-stream' };
    if (ext === '.js' || ext === '.css' || ext === '.json') headers['Cache-Control'] = 'no-cache';
    res.writeHead(code || 200, headers);
    res.end(data);
  });
}
// /u/:handle — serve the SPA shell but inject profile-specific title/meta/OG + Person JSON-LD,
// so a shared profile link previews well and Google can index the expert (backlink value).
function serveProfileShell(res, handle) {
  const shell = () => sendFile(res, path.join(DIR, 'index.html'));
  if (!db.enabled) return shell();
  db.query('SELECT username,domain,domain_verified,reputation_points FROM users WHERE lower(username)=lower($1)', [clean(handle, 24)])
    .then((r) => {
      const u = r.rows[0];
      if (!u) return shell();
      fs.readFile(path.join(DIR, 'index.html'), 'utf8', (e, html) => {
        if (e) return shell();
        const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        const domLabel = DOMAIN_LABEL[u.domain] || '';
        const title = `${u.username}${domLabel ? ' — ' + domLabel + ' contributor' : ''} · RNAwiki`;
        const desc = `${u.username}'s clinical contribution portfolio on RNAwiki${u.domain_verified ? ' (verified expert)' : ''} — ${u.reputation_points || 0} reputation. Stewarded protocols, accepted edits, and professional links.`;
        const purl = `${SITE_URL}/u/${encodeURIComponent(u.username)}`;
        const ld = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Person', name: u.username, url: purl, description: desc });
        const out = html
          .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
          .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(desc)}">`)
          .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${esc(purl)}">`)
          .replace(/<meta property="og:type"[^>]*>/, `<meta property="og:type" content="profile">`)
          .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(title)}">`)
          .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(desc)}">`)
          .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${esc(purl)}">`)
          .replace('</head>', `<script type="application/ld+json">${ld}</script></head>`);
        endHtml(res, out);
      });
    })
    .catch(() => shell());
}
function serveStatic(req, res, url) {
  let p = decodeURIComponent(url.split('?')[0]);
  const qp = new URLSearchParams(url.split('?')[1] || '');
  // profile pages get server-injected meta for sharing + SEO
  if (/^\/u\/[^/]+\/?$/.test(p)) return serveProfileShell(res, p.split('/')[2]);
  // Proof-of-Progress share links: a protocol opened via ?by=/?log= gets a share-flavoured preview
  if (/^\/protocol\//.test(p) && (qp.get('by') || qp.get('s'))) {
    return fs.readFile(path.join(DIR, p.replace(/^\//, '') + '.html'), 'utf8', (e, html) => {
      if (e) return sendFile(res, path.join(DIR, 'index.html'));
      const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      const by = clean(qp.get('by'), 24);
      const nm = html.match(/<title>([^—<]+)/);
      const problemName = nm ? nm[1].trim() : 'their protocol';
      const t = `${by ? '@' + by : 'Someone'} shared their ${problemName} progress on RNAwiki`;
      const desc = `See the exact movement, stack, and Singapore food log for ${problemName} — then start your own. Stop guessing, start solving.`;
      const out = html
        .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(t)}">`)
        .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(desc)}">`)
        .replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${esc(t)}">`)
        .replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${esc(desc)}">`);
      endHtml(res, out);
    });
  }
  // "/" serves the prerendered crawlable home if present, else the SPA shell
  if (p === '/') {
    return fs.readFile(path.join(DIR, 'home.html'), (e, html) => {
      if (!e) return endHtml(res, html);
      sendFile(res, path.join(DIR, 'index.html'));
    });
  }
  const safe = path.normalize(p).replace(/^(\.\.[/\\])+/, '');
  const file = path.join(DIR, safe);
  if (!file.startsWith(DIR)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, (err, data) => {
    if (!err) {
      const ext = path.extname(file);
      if (ext === '.html') return endHtml(res, data);
      const headers = { 'Content-Type': TYPES[ext] || 'application/octet-stream' };
      if (ext === '.js' || ext === '.css' || ext === '.json') headers['Cache-Control'] = 'no-cache';
      res.writeHead(200, headers);
      return res.end(data);
    }
    // clean-path routing: try the prerendered <path>.html for crawlable SEO pages
    if (!path.extname(file)) {
      return fs.readFile(file + '.html', (e2, html) => {
        if (!e2) return endHtml(res, html);
        // SPA fallback so client-side routing still resolves the view
        sendFile(res, path.join(DIR, 'index.html'));
      });
    }
    sendFile(res, path.join(DIR, 'index.html'));
  });
}

const server = http.createServer((req, res) => {
  const url = req.url;
  if (url.startsWith('/api/')) {
    api(req, res, url).catch(e => { console.error(e); json(res, 500, { error: 'Server error' }); });
    return;
  }
  serveStatic(req, res, url);
});

db.init().catch(e => console.error('[db] init failed:', e.message)).finally(() => {
  server.listen(PORT, () => console.log('RNAwiki serving on :' + PORT + (db.enabled ? ' (accounts on)' : ' (read-only)')));
  if (db.enabled) tgSetup().catch(e => console.error('[tg] setup:', e.message));
  if (db.enabled) emailStartScheduler();
});
