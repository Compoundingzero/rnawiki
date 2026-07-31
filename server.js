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
// The default cap is deliberately small. Most POST handlers take the default and every one of them
// validates down to a few hundred bytes of allow-listed fields (longest: proposals.change 4000,
// feedback.body 2000, comments.body 2000) — but the old 1e5 default let each buffer 100 KB, so the
// write guard's own 15-request burst allowed 1.5 MB of in-memory string per IP per burst on
// endpoints that then throw 99% of it away. Handlers that genuinely need more pass an explicit cap
// (edits 5e4, foods 8e4, plan 2e5, scan 4e5, clinician-interest 1.6e6, share-plan 2e4).
// OVER-CAP BEHAVIOUR, corrected 2026-08-01 after measuring it. The old code called req.destroy()
// the moment the cap was passed. That kills the connection, so the caller never receives the
// handler's `400 Bad request` — in Chrome the fetch() rejects with an opaque "TypeError: Failed to
// fetch", measured. With the default coming down from 1e5 to 1.6e4 that path gets hit far more
// often, so it now has to behave. Two thresholds instead of one:
//   over `cap`      -> stop accumulating and DROP what we have (this is the memory control, and it
//                      is the whole point), but keep draining so 'end' fires and the handler can
//                      answer a real 400 that a human can read;
//   over `HARD_CAP` -> a genuine flood, not a fat form. Kill the socket.
const BODY_HARD_CAP = 8e6;
function readBody(req, maxBytes) {
  const cap = maxBytes || 1.6e4;
  return new Promise((resolve) => {
    let data = ''; let seen = 0; let tooBig = false;
    // Check BEFORE appending. The old order appended first, so one socket chunk could carry the
    // buffer up to ~64 KB past the cap before the check fired.
    req.on('data', c => {
      seen += c.length;
      if (seen > BODY_HARD_CAP) { tooBig = true; data = ''; return req.destroy(); }
      if (tooBig) return;
      if (data.length + c.length > cap) { tooBig = true; data = ''; return; }   // drain, do not destroy
      data += c;
    });
    req.on('end', () => { if (tooBig) return resolve(null); try { resolve(data ? (/x-www-form-urlencoded/i.test(req.headers['content-type']||'') ? ((q)=>Object.fromEntries(new URLSearchParams(q))) : JSON.parse)(data) : {}); } catch (e) { resolve(null); } });
    req.on('error', () => resolve(null));
    req.on('aborted', () => resolve(null));
  });
}
function json(res, code, obj, headers) {
  res.writeHead(code, Object.assign({ 'Content-Type': 'application/json' }, headers || {}));
  res.end(JSON.stringify(obj));
}
function clean(s, max) { return String(s == null ? '' : s).trim().slice(0, max || 4000); }
// Strict positive-integer path segment. parseInt() is wrong for route ids in two directions:
// parseInt('abc') is NaN, which Postgres rejects with a 500, and parseInt('20x') is 20, which
// silently serves record 20 from a URL that was never a valid id. Returns 0 on anything that
// is not purely digits, so the existing `if (!id) return 400` guards do the right thing.
function pathId(s) { return /^\d{1,9}$/.test(String(s == null ? '' : s)) ? parseInt(s, 10) : 0; }
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
// participant = the signed-in user, else a SERVER-MINTED anonymous id carried in a signed, httpOnly,
// SameSite=Lax cookie. It is NEVER read from the request body.
//
// WHAT WAS BROKEN (measured 2026-08-01, hydrated Chrome against a real Postgres): the key was
// `clean(extra.voterKey, 64)` straight from the POST body, so ONE browser session posting 12
// made-up voterKeys to /api/experiments/start created 12 rows in the public ledger, and a fresh
// paint of /protocol/knee-pain/patellofemoral-pain then rendered
// `🧬 12 people are building this plan` (app.js:3927, shown once running >= 3). Same forged keys
// moved /api/stats and minted reputation: 25 points per distinct 'ob:'+key (referral award) and
// 5 per distinct 'forkclone:'+id+':'+key, both idempotent only on the caller's own string.
// app.js records that the previous `N people helped` counter was DELETED on 2026-07-28 for exactly
// this reason. Product constraint 5 (never fabricate counts) is the binding rule.
//
// CONSTRAINT 3 (anonymous-first) is preserved exactly: no account, no email, no fingerprint — an
// opaque random id the server hands out. It is minted ONLY when the reader chooses to participate
// (a write); pure reading never sets it, so a crawler or a casual reader is never tagged.
//
// MIGRATION: the client's localStorage key (app.js VOTER_KEY) is simply ignored from now on.
// app.js still sends it in five calls; that is harmless dead weight, not a coordinated release.
const ANON_COOKIE = 'rw_pid';
const ANON_MAX_AGE = 2 * 365 * 86400;
function anonSign(id) { return crypto.createHmac('sha256', SECRET).update('anon:' + id).digest('base64url').slice(0, 27); }
function anonRead(req) {
  const raw = parseCookies(req)[ANON_COOKIE]; if (!raw) return null;
  const i = raw.lastIndexOf('.'); if (i <= 0) return null;
  const id = raw.slice(0, i), sig = raw.slice(i + 1);
  if (!/^[A-Za-z0-9_-]{16,32}$/.test(id)) return null;
  const want = Buffer.from(anonSign(id)), got = Buffer.from(sig);
  if (want.length !== got.length || !crypto.timingSafeEqual(want, got)) return null;
  return id;
}
// Never clobber another Set-Cookie already on the response (the session cookie).
function appendCookie(res, c) {
  const cur = res.getHeader('Set-Cookie');
  res.setHeader('Set-Cookie', cur ? [].concat(cur, c) : [c]);
}
function anonMint(res) {
  const id = crypto.randomBytes(16).toString('base64url');
  appendCookie(res, `${ANON_COOKIE}=${id}.${anonSign(id)}; HttpOnly; Path=/; Max-Age=${ANON_MAX_AGE}; SameSite=Lax; Secure`);
  return id;
}
async function resolveParticipant(req, res, opts) {
  const u = await currentUser(req);
  if (u) return { key: 'u:' + u.id, user: u };
  let id = anonRead(req);
  if (!id && res && !(opts && opts.readOnly)) id = anonMint(res);
  return { key: id ? 'v:' + id : null, user: null };
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
// verify accounts / approve root-cause changes.
//
// SECURITY (fixed 2026-07-28): this used to compare users.email against a literal address.
// users.email is user-supplied, is never verified at /api/register, and had no UNIQUE index —
// so `POST /api/register {"email":"<the literal>"}` minted a super-admin session in one request.
// Super-admin is now decided on immutable identifiers only: the SERIAL primary key, or the
// Google subject. Neither can be chosen by a registrant. NEVER key this on email again.
const SUPERADMIN_ID = parseInt(process.env.SUPERADMIN_ID || '3', 10) || 0;
const SUPERADMIN_GOOGLE_SUB = String(process.env.SUPERADMIN_GOOGLE_SUB || '');
const isSuper = u => !!(u && (
  (SUPERADMIN_ID && Number(u.id) === SUPERADMIN_ID) ||
  (SUPERADMIN_GOOGLE_SUB && u.google_sub && String(u.google_sub) === SUPERADMIN_GOOGLE_SUB)
));
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
  const r = await db.query('SELECT u.id, u.username, u.email, u.google_sub, u.role, u.domain, u.credential, u.domain_verified, u.requested_domain, u.application_status, u.reputation_points, u.socials, u.badges, u.profile_views, u.booking_clicks FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token=$1 AND s.expires_at > now()', [sid]);
  const u = r.rows[0];
  if (u && ADMIN_USER && u.username.toLowerCase() === ADMIN_USER) u.role = 'admin';
  if (u && isSuper(u)) u.role = 'admin';           // the superadmin always has admin powers
  if (u) u.is_super = isSuper(u);
  return u || null;
}
function setSessionCookie(res, token) {
  const days = 30;
  // appendCookie, not setHeader: a response may already carry the anonymous participant cookie,
  // and raw setHeader would silently drop whichever of the two was set first.
  appendCookie(res, `sid=${token}; HttpOnly; Path=/; Max-Age=${days * 86400}; SameSite=Lax; Secure`);
}
// simple same-origin guard for mutations
function sameOrigin(req) {
  const o = req.headers.origin;
  if (!o) return true; // non-browser or same-origin fetch without Origin
  try { return new URL(o).host === req.headers.host; } catch (e) { return false; }
}

// ---- Email nudges (Resend) — activates when RESEND_API_KEY is set; otherwise the "due" list still shows in Control Room ----
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'RNAwiki <hello@rnawiki.com>';
// Full compound catalogue, loaded once in an isolated context. Kept after the Telegram
// removal because the Control Room attributes reported side-effects to specific compounds
// through COMPOUND_BY_ID below. The interaction engine (interactions.js) was only ever read
// by the bot's /stack command and is no longer loaded here.
let SITE_DATA = null;
try {
  const vm = require('vm');
  const sb = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(DIR, 'data.js'), 'utf8'), sb);
  SITE_DATA = sb.window.RNAWIKI_DATA;
} catch (e) { console.error('[data] catalogue load failed:', e.message); }
// compound id -> {name, isRx, badge} — used to attribute reported side-effects in the Control Room
const COMPOUND_BY_ID = {};
if (SITE_DATA && Array.isArray(SITE_DATA.compounds)) SITE_DATA.compounds.forEach(c => { COMPOUND_BY_ID[c.id] = { name: c.name, isRx: !!c.isRx, badge: c.badge || '' }; });
// ===== Email nudge engine — milestone check-ins and the daily reminder digest =====
const PROBLEM_NAME = (() => { try { const g = require('./data/clinical_graph.json'); const m = {}; (g.problems || []).forEach(p => { m[p.id] = p.name; }); return m; } catch (e) { return {}; } })();
// HTML escape for email bodies. (Was tgEsc, shared with the bot; the bot is gone, the emails remain.)
function htmlEsc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
// problem/root-cause index + keystone, keyed "pid/rcid".
// NOTE: this was named PROTO_INDEX and lived in the Telegram block, but it is NOT bot-specific —
// buildReminderLines() reads it to compose the daily reminder EMAIL. Deleting it with the bot
// would have silently emptied every reminder email. Kept, renamed.
const PROTO_INDEX = {};
try {
  const g = require('./data/clinical_graph.json'); const ks = require('./data/keystones.json');
  g.problems.forEach(p => p.root_causes.forEach(rc => {
    PROTO_INDEX[p.id + '/' + rc.id] = { problem: p.name, rc: rc.name.replace(/\s*\([^)]*\)/, ''), keystone: ks[rc.id] || null, nt: rc.nutrient_targets || {} };
  }));
} catch (e) { console.error('[proto] index load failed:', e.message); }
// ---- Protocol functions (mirrors site/app.js PLAN_FUNCTIONS — keep the two in sync) ----
// Same story: read by the reminder email, not only by the bot. The two entries that used to
// carry `tgOnly: true` ('wake', 'sunlight') are reminder-kind functions; email now delivers
// them, so the flag is gone rather than the functions.
const PLAN_FUNCTIONS = [
  { id: 'walk', icon: '🚶', name: 'Post-meal walk timer', kind: 'timer', target: 10, unit: 'min', how: 'A 10-min walk after your biggest meal blunts the glucose spike.', match: ['glucose', 'insulin', 'blood sugar', 'metabolic', 'diabet', 'a1c'] },
  { id: 'breath', icon: '🌬️', name: 'Box-breathing timer', kind: 'timer', target: 4, unit: 'min', how: '4 minutes of 4-4-4-4 breathing when stress hits.', match: ['anx', 'stress', 'cortisol', 'panic', 'overwhelm', 'nervous'] },
  { id: 'plants', icon: '🥦', name: 'Plant-diversity counter', kind: 'counter', target: 30, unit: 'plants', period: 'week', how: '30+ different plants a week feeds a diverse microbiome.', match: ['gut', 'microbiome', 'fiber', 'digest', 'bloat', 'ibs', 'constipat'] },
  { id: 'steps', icon: '👟', name: 'Daily step counter', kind: 'counter', target: 8000, unit: 'steps', period: 'day', how: 'Log steps toward 8,000/day.', match: ['fat', 'weight', 'cardio', 'endur', 'sedentary', 'circulation'] },
  { id: 'hydration', icon: '💧', name: 'Hydration counter', kind: 'counter', target: 8, unit: 'glasses', period: 'day', how: 'Target 8 glasses a day.', match: ['energy', 'skin', 'headache', 'focus', 'fatigue', 'kidney'] },
  { id: 'protein', icon: '🥩', name: 'Protein-per-meal', kind: 'counter', target: 4, unit: 'protein meals', period: 'day', how: 'A palm of protein per meal. Aim for 3–4 a day — no weighing.', match: ['muscle', 'strength', 'hypertrophy', 'sarcopenia', 'lean mass', 'menopause', 'craving', 'appetite', 'satiety'] },
  { id: 'fermented', icon: '🥬', name: 'Fermented-foods counter', kind: 'counter', target: 3, unit: 'servings', period: 'day', how: 'Yoghurt, kefir, kimchi, sauerkraut, kombucha.', match: ['gut', 'microbiome', 'digest', 'bloat', 'ibs', 'immun', 'inflamm'] },
  { id: 'pain', icon: '🚦', name: 'Pain traffic-light', kind: 'triage', how: 'After rehab: 🟢 fine / 🟡 sore / 🔴 sharp — progress, hold or back off.', match: ['pain', 'knee', 'back', 'neck', 'shoulder', 'hip', 'tendin', 'tendon', 'joint', 'stiff', 'ache', 'rehab', 'sciatic', 'plantar'] },
  { id: 'eatwin', icon: '⏳', name: 'Eating-window', kind: 'window', target: 10, how: 'First bite to kitchen closed, against a 10h target.', match: ['insulin', 'glucose', 'visceral', 'belly', 'fat', 'metabolic', 'fasting', 'blood sugar'] },
  { id: 'bp', icon: '🩺', name: 'Home blood-pressure', kind: 'bp', how: 'Log your readings and see when they need a doctor.', match: ['blood pressure', 'hypertension', 'bp', 'cardiovascular', 'cholesterol'] },
  { id: 'adhere', icon: '📅', name: 'Daily-dose adherence', kind: 'adherence', how: 'Mark each day you apply it — track your streak.', match: ['hair', 'minoxidil', 'finasteride', 'tretinoin', 'acne', 'skin', 'hormonal treatment', 'thyroid'] },
  { id: 'win', icon: '🌟', name: 'One small win', kind: 'log', how: 'Naming one tiny win a day lifts low mood.', match: ['depress', 'low mood', 'anhedonia', 'burnout', 'motivation'] },
  { id: 'symptom', icon: '📈', name: 'Symptom check', kind: 'scale', trend: true, scale: [{ v: 1, e: '😣' }, { v: 2, e: '😕' }, { v: 3, e: '😐' }, { v: 4, e: '🙂' }, { v: 5, e: '😄' }], how: 'How you feel today — see the trend over time.', match: ['menopause', 'hot flash', 'migraine', 'headache', 'acne', 'breakout', 'brain fog', 'fog', 'inflamm', 'flare', 'ibs', 'mood'] },
  { id: 'readiness', icon: '🔋', name: 'Readiness check', kind: 'scale', scale: [{ v: 1, e: '😴', label: 'Wiped', g: 'take it easy or rest today' }, { v: 2, e: '😐', label: 'OK', g: 'train as planned' }, { v: 3, e: '💪', label: 'Fresh', g: 'good day to push' }], how: 'How recovered you feel — push or back off.', match: ['overtrain', 'recovery', 'under-recover', 'fatigue', 'plateau', 'burnout'] },
  { id: 'sigh', icon: '🌬️', name: 'Physiological sigh', kind: 'timer', target: 2, unit: 'min', how: 'Two inhales through the nose, one long exhale. Repeat 2 min.', match: ['anx', 'panic', 'cortisol', 'overwhelm', 'nervous', 'racing'] },
  { id: 'craving', icon: '🌊', name: 'Craving-surf timer', kind: 'timer', target: 10, unit: 'min', how: 'When a craving hits, do something else for 10 min — it almost always passes.', match: ['craving', 'appetite', 'sugar', 'snack', 'binge'] },
  { id: 'focus', icon: '🎯', name: 'Focus blocks', kind: 'counter', target: 4, unit: 'blocks', period: 'day', how: 'Write your ONE next step, do a 25-min block. Aim for 4/day.', match: ['focus', 'adhd', 'concentration', 'brain fog', 'procrastin', 'distract', 'productivity'] },
  { id: 'zone2', icon: '🏃', name: 'Zone-2 minutes', kind: 'counter', target: 150, unit: 'min', period: 'week', step: 10, match: ['endur', 'longevity', 'healthspan', 'vo2', 'vascular', 'stamina', 'aerobic'], how: 'Easy conversational-pace minutes. Aim for 150 a week.' },
  { id: 'sleepwin', icon: '🛏️', name: 'Sleep-window tracker', kind: 'sleep', how: 'CBT-I sleep restriction — track sleep efficiency and when to shift your bedtime.', match: ['sleep', 'insomnia', 'fall asleep', 'waking', 'awake', 'circadian', 'tired', 'jet lag', 'restless'] },
  { id: 'wake', icon: '⏰', name: 'Fixed wake-time reminder', kind: 'reminder', how: 'A constant wake time anchors your body clock — a nightly nudge to protect wind-down.', match: ['sleep', 'insomnia', 'circadian', 'tired', 'wake', 'jet lag'] },
  { id: 'sunlight', icon: '☀️', name: 'Morning-sunlight reminder', kind: 'reminder', how: '10 min of morning light sets your clock — a reminder within an hour of waking.', match: ['mood', 'vitamin d', 'seasonal', 'depress', 'low energy', 'winter'] },
];
function fnById(id) { return PLAN_FUNCTIONS.find(f => f.id === id); }
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
// When someone replies to a shared "explain it back" post, ping the original author on their
// linked Telegram chat and by email (whichever they have). Never notifies a user of their own reply.
async function notifyReply(parentId, slug, replier, body) {
  try {
    const p = (await db.query('SELECT user_id, handle FROM explain_posts WHERE id=$1', [parentId])).rows[0];
    if (!p || !p.user_id) return;                              // parent was anonymous — nobody to notify
    if (replier && replier.id === p.user_id) return;           // don't notify yourself
    const eh = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const name = (replier && replier.username) ? replier.username : 'Someone';
    const nameSlug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const cname = (SITE_DATA && Array.isArray(SITE_DATA.compounds) && (SITE_DATA.compounds.find(x => nameSlug(x.name) === slug) || {}).name) || slug;
    const snippet = String(body || '').slice(0, 220);
    const link = `${SITE_URL}/#/c/${slug}`;
    // (The Telegram notification branch was removed 2026-07-28 with the bot. Email is now the
    // only reply notification channel.)
    const usr = (await db.query('SELECT email, email_off FROM users WHERE id=$1', [p.user_id])).rows[0];
    if (usr && usr.email && !usr.email_off) {
      sendEmail(usr.email, `${name} replied to your explanation of ${cname}`,
        `<div style="font-family:system-ui,sans-serif;max-width:520px"><p><b>${eh(name)}</b> replied to the explanation of <b>${eh(cname)}</b> you shared on RNAwiki:</p><blockquote style="border-left:3px solid #10b981;margin:0;padding:.4rem 0 .4rem 1rem;color:#334">${eh(snippet)}</blockquote><p style="margin-top:1rem"><a href="${link}" style="background:#10b981;color:#fff;padding:.5rem 1rem;border-radius:8px;text-decoration:none">Read the discussion →</a></p></div>`
      ).catch(() => {});
    }
  } catch (e) { console.error('[explain] notify:', e.message); }
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
    <h2 style="font-size:20px">How's it going with ${htmlEsc(name)}?</h2>
    <p style="font-size:15px;line-height:1.5">You've been at it for <b>${wk}</b>. A 20-second check-in tells you whether it's working — and helps everyone with the same problem.</p>
    <p><a href="${link}" style="display:inline-block;background:#2f6f4f;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;font-size:15px">Log my ${htmlEsc(wk)} check-in →</a></p>
    <p style="font-size:12px;color:#888;line-height:1.5">Anonymous &amp; optional. You're getting this because you consented to help RNAwiki learn what works. Manage or withdraw anytime in your account.</p>
  </div>`;
  return sendEmail(d.user.email, subject, html);
}
// ---- Daily reminder email — bundles EVERY nudge the user selected (keystone + tools), web parity of the TG daily nudge ----
// Reads the saved plan: keystone(s) from PROTO_INDEX + each selected tool from PLAN_FUNCTIONS. Returns [] if nothing to remind.
function buildReminderLines(plan) {
  const protos = (plan && Array.isArray(plan.protocols)) ? plan.protocols : [];
  const lines = [], seen = new Set();
  for (const pr of protos) {
    const info = PROTO_INDEX[(pr.pid || '') + '/' + (pr.rcid || '')];
    if (info && info.keystone && info.keystone.one && !seen.has('k:' + pr.pid + pr.rcid)) {
      seen.add('k:' + pr.pid + pr.rcid);
      lines.push({ icon: '⭐', label: info.keystone.one, sub: info.keystone.why || '' });
    }
    const fns = Array.isArray(pr.functions) ? pr.functions : [];
    for (const fid of fns) { const f = fnById(fid); if (f && !seen.has(fid)) { seen.add(fid); lines.push({ icon: f.icon, label: f.name, sub: f.how || '' }); } }
  }
  return lines;
}
function buildReminderEmail(plan, due) {
  const lines = buildReminderLines(plan);
  if (!lines.length && !due) return null;
  const link = `${SITE_URL}/#/plan`;
  const items = lines.map(l => `<li style="margin:0 0 10px;font-size:15px;line-height:1.45"><span style="font-size:17px">${l.icon}</span> <b>${htmlEsc(l.label)}</b>${l.sub ? `<br><span style="color:#666;font-size:13px">${htmlEsc(l.sub)}</span>` : ''}</li>`).join('');
  const ci = due ? `<div style="margin:18px 0;padding:12px 14px;background:#f0f7f3;border-radius:10px;font-size:14px">📋 You're <b>${due.phase === 'd90' ? '90 days' : '30 days'}</b> into your ${htmlEsc(PROBLEM_NAME[due.pr.pid] || 'protocol')} — a 20-second check-in is due. It's in your tracker.</div>` : '';
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
// Daily reminder digest — TZ-aware 5-min tick: fires once/day at each user's chosen local hour.
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
    <p style="font-size:15px;line-height:1.5">It's been about <b>${days} days</b> since you last worked on your ${htmlEsc(name)} protocol. Your plan, streak history and progress are all still saved — you can jump straight back in.</p>
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
        AND (u.last_checkin_email IS NULL OR u.last_checkin_email < $2)`,
      // The removed clause was: AND NOT EXISTS (SELECT 1 FROM telegram_users t WHERE
      // t.user_id=u.id AND t.last_active > now() - interval '10 days'). Its intent was "do not
      // win back someone who is active on another channel". With the bot gone there is no other
      // channel, and web activity is already covered by `p.updated_at < now() - interval
      // '10 days'` above, so the condition is subsumed rather than dropped. Verified before
      // removal: the audience count was identical with and without it (1 row either way).
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
// ===== Newsletter (2026-07-28) =================================================================
// Subscribers are stored locally AND pushed to a Resend audience. Both, deliberately:
//  - Resend is what the weekly broadcast actually sends from, so the contact has to exist there;
//  - the local row is the auditable record of consent (timestamp + which page it came from), which
//    is what PDPA cares about, and it means a Resend outage cannot silently lose a signup.
// If the Resend push fails the row is still written with resend_contact_id NULL, so it is
// retryable rather than lost.
const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || '';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

async function resendAddContact(email) {
  if (!RESEND_API_KEY || !RESEND_AUDIENCE_ID) return null;
  try {
    const r = await fetch(`https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, unsubscribed: false }),
      signal: AbortSignal.timeout(10000),
    });
    const j = await r.json().catch(() => ({}));
    return (j && j.id) ? j.id : null;
  } catch (e) { console.error('[newsletter] resend add failed:', e.message); return null; }
}
async function resendUnsubscribe(email) {
  if (!RESEND_API_KEY || !RESEND_AUDIENCE_ID) return false;
  try {
    await fetch(`https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts/${encodeURIComponent(email)}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ unsubscribed: true }),
      signal: AbortSignal.timeout(10000),
    });
    return true;
  } catch (e) { console.error('[newsletter] resend unsub failed:', e.message); return false; }
}
function welcomeEmail(unsubUrl) {
  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:540px;margin:0 auto;color:#1a1a1a">
    <p style="font-size:17px;line-height:1.5">You're in.</p>
    <p style="font-size:15px;line-height:1.6">Once a week I'll send you one thing from RNAwiki — a mechanism worth understanding, a claim that turned out to be weaker than it looked, or a protocol broken down to its root cause. Written the way the site is: what the evidence actually says, and where it runs out.</p>
    <p style="font-size:15px;line-height:1.6">No supplement of the month. No affiliate links. If something is uncertain, it will say so.</p>
    <p style="font-size:15px;line-height:1.6"><a href="${SITE_URL}/solve" style="color:#10b981">Start with a problem you actually have →</a></p>
    <hr style="border:none;border-top:1px solid #e5e5e5;margin:22px 0">
    <p style="font-size:12px;color:#777;line-height:1.5">You're getting this because you subscribed at rnawiki.com. Educational only, not medical advice.<br>
    <a href="${unsubUrl}" style="color:#777">Unsubscribe</a> — one click, no questions.</p>
  </div>`;
}

function emailStartScheduler() {
  if (!db.enabled || EMAIL_TIMER) return;
  if (!RESEND_API_KEY) { console.log('[email] RESEND_API_KEY not set — nudge emails dormant (due list still visible in Control Room).'); return; }
  EMAIL_TIMER = setInterval(email6hTick, 6 * 60 * 60 * 1000);      // milestone check-ins + inactivity win-back — every 6h
  setTimeout(() => email6hTick().catch(() => {}), 60 * 1000);      // and once shortly after boot
  EMAIL_REMIND_TIMER = setInterval(emailReminderTick, 5 * 60 * 1000);  // daily reminder digest — TZ-aware 5-min tick
  console.log('[email] check-in+winback (6h) + daily-reminder (5-min) schedulers started.');
}
// ---------- unauthenticated write hardening ----------
// Every unauthenticated POST was forgeable: resolveParticipant() USED TO trust a body-supplied
// voterKey (closed 2026-08-01 — the id is now server-minted in the signed rw_pid cookie), and two
// curl calls could move the public counters. Three cheap layers, no dependencies, applied at
// the single api() chokepoint so a new endpoint cannot forget to opt in.
const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const RL_BUCKETS = new Map();          // ip -> { tokens, ts }
const RL_BURST = 15;                   // burst allowance per IP
const RL_REFILL_MS = 4000;             // +1 token per 4s (~15/min sustained)
const RL_MAX_KEYS = 5000;              // bound memory; evict oldest when exceeded

function clientIp(req) {
  const xf = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return xf || (req.socket && req.socket.remoteAddress) || 'unknown';
}
function rateAllow(ip) {
  const now = Date.now();
  let b = RL_BUCKETS.get(ip);
  if (!b) {
    if (RL_BUCKETS.size >= RL_MAX_KEYS) {              // cheap sweep of the stalest half
      const stale = [...RL_BUCKETS.entries()].sort((a, c) => a[1].ts - c[1].ts).slice(0, RL_MAX_KEYS / 2);
      stale.forEach(([k]) => RL_BUCKETS.delete(k));
    }
    b = { tokens: RL_BURST, ts: now }; RL_BUCKETS.set(ip, b);
  }
  b.tokens = Math.min(RL_BURST, b.tokens + Math.floor((now - b.ts) / RL_REFILL_MS));
  b.ts = now;
  if (b.tokens <= 0) return false;
  b.tokens -= 1;
  return true;
}
// A browser always sends Origin on a cross-document POST. Requiring it (or a matching Referer)
// blocks both CSRF and the trivial `curl -d` forgery that moved the counters.
function sameOrigin(req) {
  const host = String(req.headers.host || '').toLowerCase();
  if (!host) return false;
  const originOf = (v) => { try { return new URL(v).host.toLowerCase(); } catch (e) { return null; } };
  const o = req.headers.origin ? originOf(req.headers.origin) : null;
  if (o) return o === host;
  const r = req.headers.referer ? originOf(req.headers.referer) : null;
  if (r) return r === host;
  return false;                                        // no Origin and no Referer on a write → refuse
}
// Speed bump only — the rate limit and origin check are the real controls.
function looksAutomated(req) {
  const ua = String(req.headers['user-agent'] || '');
  if (!ua) return true;
  return /\b(curl|wget|python-requests|python-urllib|libwww|httpie|scrapy|go-http-client|java|okhttp|axios\/|node-fetch|postman)\b/i.test(ua);
}
// ---- GET-side counters ----
// The chokepoint above guards WRITE_METHODS only, which is correct — reads must stay anonymous and
// unthrottled. But three GET handlers perform an UPDATE ... + 1: /api/track (booking_clicks),
// /api/shared-plan (shared_plans.clicks) and /api/u/:handle (profile_views). All three are numbers
// RNAwiki shows to the expert they describe, and all three move for a bare `curl` with no Origin
// and no browser UA — measured, 21 consecutive curl GETs of /api/track all returned 204 and all
// reached the UPDATE. A count anyone can inflate from a shell loop — or that a crawler or a
// link-prefetcher inflates by accident — is a fabricated count under product constraint 5.
// Count each (ip, counter, target) at most once per 6h and never count something that announces
// itself as automated. Deliberately its OWN map, NOT rateAllow(): sharing the write bucket would
// let a crawler exhaust a real user's write budget.
const CT_SEEN = new Map();                 // 'ip|kind|target' -> ts
const CT_TTL_MS = 6 * 60 * 60 * 1000;
const CT_MAX_KEYS = 20000;
function countOnce(req, kind, target) {
  if (looksAutomated(req)) return false;
  const now = Date.now(), k = clientIp(req) + '|' + kind + '|' + String(target);
  const prev = CT_SEEN.get(k);
  if (prev && now - prev < CT_TTL_MS) return false;
  if (CT_SEEN.size >= CT_MAX_KEYS) {
    for (const [kk, ts] of CT_SEEN) if (now - ts >= CT_TTL_MS) CT_SEEN.delete(kk);
    if (CT_SEEN.size >= CT_MAX_KEYS) CT_SEEN.clear();
  }
  CT_SEEN.set(k, now);
  return true;
}
// Returns true if the request was blocked (and the response already sent).
function writeBlocked(req, res) {
  if (!sameOrigin(req)) { json(res, 403, { error: 'Cross-origin writes are not accepted.' }); return true; }
  if (looksAutomated(req)) { json(res, 403, { error: 'Automated writes are not accepted.' }); return true; }
  if (!rateAllow(clientIp(req))) { json(res, 429, { error: 'Too many writes — slow down a moment.' }, { 'Retry-After': '10' }); return true; }
  return false;
}

// ---------- API ----------
async function api(req, res, url) {
  // Harden every write at one place. GET/HEAD are untouched, so reading stays fully anonymous.
  if (WRITE_METHODS.has(req.method) && writeBlocked(req, res)) return;
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
    // The single easiest number on the site to fabricate: per-username, caller-chosen, no dedupe of
    // any kind, and it is the lead-gen metric shown to the expert whose booking link it counts.
    // NOTE the definition change: genuine repeat clicks by the same person inside 6h now count once,
    // which is what a click-THROUGH metric should mean anyway. Say so wherever it is displayed.
    if (db.enabled && e === 'booking' && handle && countOnce(req, 'booking', handle)) db.query('UPDATE users SET booking_clicks = booking_clicks + 1 WHERE lower(username)=lower($1)', [handle]).catch(() => {});
    res.writeHead(204); return res.end();
  }
  // Public photo proxy for user-submitted food images: serves the inline data-URL upload. (The
  // bot token is never exposed in a public URL. <img src="/api/foodphoto?id=123"> works on the website.
  if (seg[0] === 'foodphoto' && req.method === 'GET') {
    if (!db.enabled) { res.writeHead(404); return res.end(); }
    const id = +clean(new URL('http://x/' + url).searchParams.get('id'), 12);
    if (!id) { res.writeHead(404); return res.end(); }
    try {
      const fr = (await db.query('SELECT data FROM user_foods WHERE id=$1', [id])).rows[0]; const d = fr && fr.data;
      // web-uploaded photo: a data URL stored inline — decode and serve directly
      if (d && typeof d.photo_data === 'string') {
        const mm = d.photo_data.match(/^data:(image\/[\w+.-]+);base64,(.*)$/);
        if (!mm) { res.writeHead(404); return res.end(); }
        const buf = Buffer.from(mm[2], 'base64');
        res.writeHead(200, { 'Content-Type': mm[1], 'Cache-Control': 'public, max-age=86400' });
        return res.end(buf);
      }
      // Bot photo uploads are gone with the Telegram integration (removed 2026-07-28).
      // Only web-uploaded photos (stored inline as a data URL above) are served.
      res.writeHead(404); return res.end();
    } catch (e) { res.writeHead(404); return res.end(); }
  }
  if (!db.enabled) return json(res, 503, { error: 'Accounts are not available right now.' });
  const method = req.method;

  if (method !== 'GET' && !sameOrigin(req)) return json(res, 403, { error: 'Bad origin' });

  // --- "Explain it back" community discussion (compound / pathway pages) ---
  if (seg[0] === 'explain') {
    const q = new URL('http://x/' + url).searchParams;
    if (method === 'GET') {
      const slug = clean(q.get('slug'), 80);
      if (!slug) return json(res, 400, { error: 'No slug' });
      const u = await currentUser(req).catch(() => null);
      const rows = (await db.query('SELECT id, parent_id, user_id, handle, body, created_at FROM explain_posts WHERE slug=$1 ORDER BY created_at ASC LIMIT 400', [slug])).rows;
      const byId = {};
      rows.forEach(r => { byId[r.id] = { id: r.id, user: r.handle || 'Someone', anon: !r.handle, mine: !!(u && r.user_id === u.id), body: r.body, ts: r.created_at, replies: [] }; });
      const top = [];
      rows.forEach(r => { const n = byId[r.id]; if (r.parent_id && byId[r.parent_id]) byId[r.parent_id].replies.push(n); else if (!r.parent_id) top.push(n); });
      top.reverse(); // newest explanations first
      return json(res, 200, { posts: top, total: rows.length, signedIn: !!u });
    }
    if (method === 'POST') {
      const b = await readBody(req, 1e4); if (!b) return json(res, 400, { error: 'Bad request' });
      const slug = clean(b.slug, 80);
      const body = String(b.body || '').replace(/\s+\n/g, '\n').trim().slice(0, 1500);
      const parentId = b.parent_id ? Math.max(0, parseInt(b.parent_id, 10)) || null : null;
      if (!slug) return json(res, 400, { error: 'No slug' });
      if (body.length < 4) return json(res, 400, { error: 'Write a little more first.' });
      const u = await currentUser(req).catch(() => null);
      // Light anti-spam. The "(or per anonymous IP burst)" half of the old comment described
      // protection that did not exist: the whole check sat inside `if (u)`, so the ONE path with no
      // account — the one that writes a public row rendered on compound and pathway pages — was the
      // only unthrottled one. Its sole limiter was the chokepoint bucket, i.e. ~900 posts/hour/IP.
      // Anonymous posts are now capped by volume rather than by IP (IP is unreliable behind
      // Railway's proxy), the same shape /api/subscribe already uses. 20/10min is set well above
      // real demand — there are ~20 JS-executing sessions per day sitewide.
      if (u) {
        const rc = (await db.query("SELECT count(*)::int n FROM explain_posts WHERE user_id=$1 AND created_at > now() - interval '10 minutes'", [u.id])).rows[0];
        if (rc && rc.n >= 12) return json(res, 429, { error: 'Slow down a moment — you have posted a lot just now.' });
      } else {
        const ac = (await db.query("SELECT count(*)::int n FROM explain_posts WHERE user_id IS NULL AND created_at > now() - interval '10 minutes'")).rows[0];
        if (ac && ac.n >= 20) return json(res, 429, { error: 'A lot of anonymous posts just arrived — try again in a few minutes, or sign in to post now.' });
      }
      // parent_id was taken on trust: any integer was accepted, and notifyReply() looks the row up
      // by id alone — it never checks the parent is on the slug being replied to. So an
      // unauthenticated caller could aim a reply at ANY post id and have the server email that
      // post's author 220 attacker-chosen characters, repeatedly, from RNAwiki's own sending
      // domain. The body is htmlEsc'd, so the exposure is volume, content and sender reputation
      // rather than injection. Resolving the parent against the slug closes both that amplifier and
      // the mis-threading; `parent_id IS NULL` additionally enforces the one level of nesting the
      // renderer above actually displays.
      let parent = null;
      if (parentId) {
        parent = (await db.query('SELECT id FROM explain_posts WHERE id=$1 AND slug=$2 AND parent_id IS NULL', [parentId, slug])).rows[0] || null;
        if (!parent) return json(res, 400, { error: 'That discussion has moved — reload the page and try again.' });
      }
      const ins = (await db.query('INSERT INTO explain_posts(slug, parent_id, user_id, handle, body) VALUES($1,$2,$3,$4,$5) RETURNING id', [slug, parent ? parent.id : null, u ? u.id : null, u ? u.username : null, body])).rows[0];
      if (parent) notifyReply(parent.id, slug, u, body).catch(() => {});
      return json(res, 200, { ok: true, id: ins.id, signedIn: !!u });
    }
    return json(res, 405, { error: 'Method not allowed' });
  }

  // --- auth ---
  if (seg[0] === 'register' && method === 'POST') {
    // SECURITY (2026-07-28): password registration is closed by default. It accepted an
    // arbitrary unverified email, had no confirmation step and no password-reset path, and was
    // the entry point for the super-admin escalation above. Google sign-in (/api/auth/google)
    // remains open and still creates accounts, so signup is not blocked — only this path is.
    // Set ALLOW_PASSWORD_REGISTRATION=1 to re-open it (existing accounts can still log in).
    if (process.env.ALLOW_PASSWORD_REGISTRATION !== '1') {
      return json(res, 403, { error: 'Password sign-up is closed. Please use "Continue with Google".' });
    }
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
    const b = await readBody(req, 2e4); const pid = clean(b && b.pid, 64), rcid = clean(b && b.rcid, 64);
    if (!pid || !rcid) return json(res, 400, { error: 'Missing protocol' });
    const u = await currentUser(req);
    const sel = (b && b.plan && typeof b.plan === 'object') ? b.plan : {};
    // Bound the CONTENT, not only the count. slice(0,100) capped how many entries were stored but
    // not how big each one was, and every entry is echoed verbatim to anyone holding the code
    // (GET /api/shared-plan) — i.e. an unauthenticated, publicly-readable arbitrary-text store:
    // one 100 KB POST bought one permanent 100 KB public blob, repeatable at the burst rate.
    // These are ids (move/compound/function slugs), so 80 chars is generous. Cleaning each element
    // also drops the non-string case, which survived Array.isArray + slice.
    const ids = (a, n) => Array.isArray(a) ? a.filter(x => typeof x === 'string').map(x => clean(x, 80)).filter(Boolean).slice(0, n) : undefined;
    const plan = { moves: ids(sel.moves, 100), supps: sel.supps === 'none' ? 'none' : ids(sel.supps, 100), functions: ids(sel.functions, 20) };
    const code = crypto.randomBytes(6).toString('base64url');
    await db.query('INSERT INTO shared_plans(code,author_user_id,pid,rcid,plan) VALUES($1,$2,$3,$4,$5)', [code, u ? u.id : null, pid, rcid, JSON.stringify(plan)]);
    return json(res, 200, { code, url: `${SITE_URL}/#/s/${code}` });
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
    // A share code is a public URL, so every preview-unfurl (WhatsApp, Telegram, Slack) and every
    // reload counted as a click. This is the number a trainer would use to judge whether sharing
    // works — instrumentation, which is what W1 exists to make trustworthy.
    if (countOnce(req, 'shareclick', code)) db.query('UPDATE shared_plans SET clicks=clicks+1 WHERE code=$1', [code]).catch(() => {});
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
      // SECURITY (2026-07-28): this matched `google_sub OR email` with an unordered LIMIT 1.
      // Because a password account could be registered with anyone's email address, a matching
      // email row could win the race and bind a victim's verified Google identity to an
      // attacker-created account. Always prefer the google_sub match; email is only a
      // first-time link hint.
      let u = (await db.query(
        `SELECT id,username,role,domain,credential,domain_verified,google_sub FROM users
          WHERE google_sub=$1 OR (email=$2 AND email IS NOT NULL)
          ORDER BY (google_sub=$1) DESC, id ASC LIMIT 1`, [sub, email || '\x00'])).rows[0];
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
    const id = pathId(seg[1]); if (!id) return json(res, 400, { error: 'bad id' });
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
    // 6 EDITABLE fields x 6000 chars + note ~= 36 KB — the one default-cap handler that legitimately
    // exceeds the 16 KB default. Authenticated and role-gated, so a larger ceiling is acceptable.
    const b = await readBody(req, 5e4); if (!b) return json(res, 400, { error: 'Bad request' });
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
    const b = await readBody(req, 2048); if (!b) return json(res, 400, { error: 'Bad request' });
    // voter_key is server-issued ('u:<id>' or 'v:<cookie id>'), so UNIQUE(target_id,voter_key)
    // actually means one vote per person instead of one vote per string the caller invented.
    const part = await resolveParticipant(req, res);
    const targetId = clean(b.targetId, 120), voterKey = part.key;
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
    // /u/:handle is DELIBERATELY crawlable — serveProfileShell injects Person JSON-LD and OG tags
    // precisely so search engines fetch it — so this number was dominated by bots, and the SPA
    // called this API again on every route into the profile.
    if (countOnce(req, 'profileview', uu.id)) db.query('UPDATE users SET profile_views = profile_views + 1 WHERE id=$1', [uu.id]).catch(() => {});
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
    // Strip the heavy photo data URL from the bulk list (served lazily via /api/foodphoto); keep a light `photo` flag.
    const foods = r.rows.map(f => { const d = Object.assign({}, f.data); const has = !!(d.photo_data || d.photo_file_id); delete d.photo_data; delete d.photo_file_id; if (has) d.photo = 1; return { id: f.id, name: f.name, serving: f.serving, data: d }; });
    return json(res, 200, { foods });
  }
  if (seg[0] === 'foods' && seg[1] === 'pending' && method === 'GET') {
    const u = await currentUser(req); if (!u || !(u.role === 'admin' || (u.domain === 'dietitian' && u.domain_verified))) return json(res, 403, { error: 'Verified dietitians only' });
    const r = await db.query("SELECT f.id,f.name,f.serving,f.data,f.created_at,uu.username AS by FROM user_foods f LEFT JOIN users uu ON uu.id=f.submitted_by WHERE f.status='pending' ORDER BY f.created_at ASC LIMIT 100");
    return json(res, 200, { foods: r.rows });
  }
  if (seg[0] === 'foods' && !seg[1] && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in to add a food' });
    // 8e4, sized from a MEASUREMENT rather than from the 400000 literal below. app.js's own
    // resizeImage(file, 256) is the only producer of photo_data; driven in Chrome against a
    // worst-case 4032x3024 pure-noise photo (JPEG-incompressible) it emits a 35,131-char data URL.
    // 8e4 is >2x that, plus the ~30 numeric nutrient fields. This handler must NOT take the 1.6e4
    // default — that would reject every photo upload with a bare 'Bad request'.
    const b = await readBody(req, 8e4); if (!b) return json(res, 400, { error: 'Bad request' });
    const name = clean(b.name, 80), serving = clean(b.serving, 60);
    if (!name) return json(res, 400, { error: 'Food name is required' });
    const num = (x) => (x === 0 || x) && isFinite(x) ? Number(x) : null;
    const data = { kcal: num(b.kcal), protein_g: num(b.protein_g), carbs_g: num(b.carbs_g), sugar_g: num(b.sugar_g), fat_g: num(b.fat_g), fiber_g: num(b.fiber_g) };
    // optional micronutrients — the SAME 17-field model as foods.json and the Telegram bot (allowlist)
    const MICROS = ['sodium_mg', 'potassium_mg', 'calcium_mg', 'magnesium_mg', 'iron_mg', 'zinc_mg', 'vitamin_c_mg', 'vitamin_d_iu', 'omega3_mg', 'choline_mg', 'glycine_g'];
    MICROS.forEach((k) => { const val = num(b[k]); if (val != null) data[k] = val; });
    // optional photo — a small client-resized data URL; capped so it can't bloat the row.
    // 60000, was 400000. The 400 KB allowance never described anything real: the only producer is
    // app.js resizeImage(file, 256), measured at 35,131 chars on a worst-case 12 MP noise photo,
    // so the old literal was 11x larger than the largest payload the client can emit and admitted
    // 365 KB of anything-else straight into the row's JSONB.
    const photo = typeof b.photo_data === 'string' && /^data:image\/(png|jpe?g|webp);base64,/.test(b.photo_data) && b.photo_data.length < 60000 ? b.photo_data : null;
    if (photo) data.photo_data = photo;
    // a correction to an existing food carries its id — once approved it overrides that food
    const corrects = clean(b.corrects, 40); if (corrects) data.corrects = corrects;
    // new foods go live instantly (like the bot); corrections stay pending so a dietitian confirms the change before it overrides an existing food
    const status = corrects ? 'pending' : 'active';
    const r = await db.query('INSERT INTO user_foods(name,serving,data,submitted_by,status) VALUES($1,$2,$3,$4,$5) RETURNING id', [name, serving || null, JSON.stringify(data), u.id, status]);
    await award(u.id, 'food_submit', 'food:' + r.rows[0].id, 20);
    return json(res, 200, { ok: true, id: r.rows[0].id, status });
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
    await readBody(req, 512); const id = pathId(seg[1]);
    const part = await resolveParticipant(req, res); const voterKey = part.key;
    if (!voterKey || !id) return json(res, 400, { error: 'Missing vote' });
    const ins = await db.query("INSERT INTO votes(target_id,voter_key,value) VALUES($1,$2,1) ON CONFLICT (target_id,voter_key) DO NOTHING RETURNING id", ['req:' + id, voterKey]);
    if (ins.rows[0]) await db.query('UPDATE protocol_requests SET votes=votes+1 WHERE id=$1', [id]);
    const r = await db.query('SELECT votes FROM protocol_requests WHERE id=$1', [id]);
    return json(res, 200, { votes: r.rows[0] ? r.rows[0].votes : 0 });
  }
  if (seg[0] === 'admin' && seg[1] === 'requests' && seg[2] && method === 'POST') {
    const u = await currentUser(req); if (!u || u.role !== 'admin') return json(res, 403, { error: 'Admin only' });
    const id = pathId(seg[2]); const b = await readBody(req) || {};
    const status = ['open', 'building', 'done', 'declined'].includes(b.status) ? b.status : 'open';
    await db.query('UPDATE protocol_requests SET status=$1 WHERE id=$2', [status, id]);
    return json(res, 200, { ok: true });
  }
  // --- protocol forks (community variations — UGC engine) ---
  if (seg[0] === 'forks' && seg[1] === 'popular' && method === 'GET') {
    // real stacks rank above demo fixtures; as real ones accumulate they push demos past the limit
    const r = await db.query("SELECT f.id,f.title,f.problem_id,f.root_cause_id,f.clones,u.username AS by_user FROM protocol_forks f LEFT JOIN users u ON u.id=f.user_id WHERE f.clones > 0 ORDER BY f.is_demo ASC, f.clones DESC, f.created_at DESC LIMIT 12");
    return json(res, 200, { forks: r.rows });
  }
  if (seg[0] === 'forks' && !seg[1] && method === 'GET') {
    const q = new URL('http://x/' + url).searchParams;
    const problem = clean(q.get('problem'), 80), rc = clean(q.get('rc'), 80);
    if (!problem || !rc) return json(res, 200, { forks: [] });
    // Auto-swap: show demo/seed stacks only while NO real stack exists for this exact problem+cause.
    // The moment a real user shares one here, every demo for this cause drops out automatically.
    const r = await db.query("SELECT f.id,f.title,f.note,f.stack,f.clones,f.created_at,u.username AS by_user,u.domain,u.domain_verified FROM protocol_forks f LEFT JOIN users u ON u.id=f.user_id WHERE f.problem_id=$1 AND f.root_cause_id=$2 AND (f.is_demo = false OR NOT EXISTS (SELECT 1 FROM protocol_forks r WHERE r.problem_id=$1 AND r.root_cause_id=$2 AND r.is_demo = false)) ORDER BY f.clones DESC, f.created_at DESC LIMIT 30", [problem, rc]);
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
    // Two public effects per call: the `clones` sort key for /api/forks/popular, and
    // award(..., 'forkclone:'+id+':'+voterKey, 5). award() is idempotent only on UNIQUE(user,kind,ref)
    // and ref embedded the CALLER's string, so reputation into the public leaderboard was unbounded.
    const id = pathId(seg[1]); await readBody(req, 512);
    const part = await resolveParticipant(req, res); const voterKey = part.key;
    if (!id || !voterKey) return json(res, 400, { error: 'Missing' });
    const fr = await db.query('SELECT * FROM protocol_forks WHERE id=$1', [id]); const f = fr.rows[0]; if (!f) return json(res, 404, { error: 'No such fork' });
    const ins = await db.query('INSERT INTO fork_clones(fork_id,voter_key) VALUES($1,$2) ON CONFLICT (fork_id,voter_key) DO NOTHING RETURNING id', [id, voterKey]);
    if (ins.rows[0]) { await db.query('UPDATE protocol_forks SET clones=clones+1 WHERE id=$1', [id]); if (f.user_id) await award(f.user_id, 'fork_clone', 'forkclone:' + id + ':' + voterKey, 5); }
    return json(res, 200, { ok: true, stack: f.stack, problem_id: f.problem_id, root_cause_id: f.root_cause_id, title: f.title });
  }
  if (seg[0] === 'forks' && seg[1] && method === 'GET') {
    const id = pathId(seg[1]); if (!id) return json(res, 404, { error: 'No such fork' });
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
    // 1.6e6 (was 6e6) ~= a 1.2 MB image once base64-expanded — ample for a phone photo of a licence,
    // and now the largest body any UNAUTHENTICATED endpoint accepts. At 6e6 a single IP could push
    // ~90 MB of base64 through Node's string buffer and into Postgres inside one 15-request burst,
    // on a path with no account and no email verification. The three size limits also disagreed with
    // each other: 6e6 read cap, a 5e6 store slice, and a message saying "~4 MB". Now two, and they
    // agree. Verified no UX cost: `submitClinicianInterest` is declared at app.js:499 and CALLED
    // NOWHERE — there is no intake form in the client today, so nothing can bounce.
    const b = await readBody(req, 1.6e6); if (!b) return json(res, 400, { error: 'That was too large — please attach a smaller photo (under ~1 MB).' });
    const name = clean(b.name, 120), email = clean(b.email, 160).toLowerCase();
    const discipline = clean(b.discipline, 60), note = clean(b.note, 600);
    const country = clean(b.country, 60), license_no = clean(b.license_no, 100);
    const proof = (typeof b.proof_photo === 'string' && /^data:image\/[\w+.-]+;base64,/.test(b.proof_photo)) ? b.proof_photo.slice(0, 5e6) : null;
    if (!name) return json(res, 400, { error: 'Please add your name' });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json(res, 400, { error: 'Please add a valid email' });
    try {
      await db.query(`INSERT INTO clinician_interest(name,email,discipline,note,country,license_no,proof_photo) VALUES($1,$2,$3,$4,$5,$6,$7)
        ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, discipline=EXCLUDED.discipline, note=EXCLUDED.note, country=EXCLUDED.country, license_no=EXCLUDED.license_no, proof_photo=COALESCE(EXCLUDED.proof_photo, clinician_interest.proof_photo)`,
        [name, email, discipline || null, note || null, country || null, license_no || null, proof]);
      return json(res, 200, { ok: true });
    } catch (e) { console.error('[clinician-interest]', e.message); return json(res, 500, { error: 'Could not save — please try again' }); }
  }
  // super-admin only: view a professional's uploaded credential proof (data URL stored on the row)
  if (seg[0] === 'clinician-photo' && method === 'GET') {
    const u = await currentUser(req); if (!isSuper(u)) { res.writeHead(403); return res.end(); }
    const id = +clean(new URL('http://x/' + url).searchParams.get('id'), 12); if (!id) { res.writeHead(404); return res.end(); }
    const row = (await db.query('SELECT proof_photo FROM clinician_interest WHERE id=$1', [id])).rows[0];
    const m = row && row.proof_photo && String(row.proof_photo).match(/^data:(image\/[\w+.-]+);base64,(.*)$/);
    if (!m) { res.writeHead(404); return res.end(); }
    const buf = Buffer.from(m[2], 'base64');
    res.writeHead(200, { 'Content-Type': m[1], 'Cache-Control': 'private, max-age=60' });
    return res.end(buf);
  }
  // ---------- the outcome loop: experiments · check-ins · results ledger ----------
  // collective counter for the home page (movement heartbeat)
  if (seg[0] === 'stats' && method === 'GET') {
    const r = await db.query("SELECT count(*)::int AS experiments, count(*) FILTER (WHERE outcome='better')::int AS improved FROM experiments");
    // "people helped" = distinct people who started a protocol OR built a stack
    let helped = 0;
    try {
      const h = await db.query("SELECT count(*)::int AS n FROM (SELECT participant AS k FROM experiments UNION SELECT voter_key FROM helped_people) t");
      helped = (h.rows[0] && h.rows[0].n) || 0;
    } catch (e) { helped = (r.rows[0] && r.rows[0].experiments) || 0; }
    return json(res, 200, Object.assign({ experiments: 0, improved: 0 }, r.rows[0] || {}, { helped }));
  }
  // record a "stack built" engagement (idempotent per person) for the people-helped counter
  // --- newsletter ---
  if (seg[0] === 'subscribe' && method === 'POST') {
    const b = await readBody(req, 4096); if (!b) return json(res, 400, { error: 'Bad request' });
    // ---- NO-JS COMPLETION STATE (2026-07-30) --------------------------------------------------
    // The newsletter is the home page's MAIN call to action, and for the ~90% of traffic that never
    // runs JavaScript it had no completion state at all: the browser POSTs the form natively, this
    // endpoint answers application/json, and the subscriber lands on a white page reading
    // {"ok":true,"alreadySubscribed":false}. They did subscribe — they just have no way to know it,
    // and no way back. A native form post must end in a redirect, not a payload.
    const wantsHtml = /x-www-form-urlencoded/i.test(req.headers['content-type'] || '');
    const done = (ok, msg) => {
      if (!wantsHtml) return null;
      const q = ok ? 'subscribed=1' : `suberr=${encodeURIComponent(String(msg || '').slice(0, 120))}`;
      res.writeHead(303, { Location: `/?${q}#newsletter` });
      res.end();
      return true;
    };
    // Honeypot: a field no human sees and every naive bot fills. Return 200 so the bot believes it
    // worked and does not retry with a different shape.
    if (clean(b.website, 80)) return done(true) || json(res, 200, { ok: true });
    const email = clean(b.email, 160).toLowerCase();
    if (!EMAIL_RE.test(email)) return done(false, 'That email address does not look right.') || json(res, 400, { error: 'That email address does not look right.' });
    const source = clean(b.source, 60) || 'newsletter';
    try {
      // Rate limit by volume, not by IP (which is unreliable behind Railway's proxy): if this many
      // signups have arrived in a minute, something automated is happening.
      const burst = (await db.query("SELECT count(*)::int n FROM newsletter_subscribers WHERE created_at > now() - interval '1 minute'")).rows[0];
      if (burst && burst.n > 20) return json(res, 429, { error: 'Too many signups right now — try again in a minute.' });

      const tok = crypto.randomBytes(16).toString('base64url');
      const ins = await db.query(
        `INSERT INTO newsletter_subscribers(email, source, unsub_token) VALUES($1,$2,$3)
           ON CONFLICT (lower(email)) DO UPDATE SET unsubscribed = false
           RETURNING id, unsub_token, (xmax = 0) AS is_new`,
        [email, source, tok]);
      const row = ins.rows[0];
      const isNew = row && row.is_new;
      // Push to Resend regardless — a returning subscriber may have been unsubscribed there.
      const cid = await resendAddContact(email);
      if (cid) await db.query('UPDATE newsletter_subscribers SET resend_contact_id=$2 WHERE id=$1', [row.id, cid]).catch(() => {});
      if (isNew) {
        const unsubUrl = `${SITE_URL}/api/unsubscribe?t=${encodeURIComponent(row.unsub_token || tok)}`;
        sendEmail(email, 'Welcome to RNAwiki', welcomeEmail(unsubUrl)).catch(() => {});
      }
      return done(true) || json(res, 200, { ok: true, alreadySubscribed: !isNew });
    } catch (e) { console.error('[newsletter]', e.message); return done(false, 'Could not sign you up just now. Try again shortly.') || json(res, 500, { error: 'Could not sign you up just now. Try again shortly.' }); }
  }
  if (seg[0] === 'unsubscribe' && method === 'GET') {
    const t = clean(new URL('http://x/' + url).searchParams.get('t'), 64);
    let ok = false, email = null;
    if (t) {
      const r = await db.query('UPDATE newsletter_subscribers SET unsubscribed=true WHERE unsub_token=$1 RETURNING email', [t]).catch(() => ({ rows: [] }));
      if (r.rows[0]) { ok = true; email = r.rows[0].email; await resendUnsubscribe(email); }
    }
    return endHtml(res, `<!doctype html><html lang="en-SG"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>${ok ? 'Unsubscribed' : 'Link not recognised'} · RNAwiki</title><link rel="stylesheet" href="/styles.css"></head>
<body><main class="article" style="max-width:38rem;margin:4rem auto;padding:0 1.25rem">
<h1>${ok ? 'You\'re unsubscribed' : 'That link is not recognised'}</h1>
<p>${ok ? 'You won\'t get the weekly email again. Nothing else changes — the site stays free and open.' : 'It may already have been used. If you keep receiving emails, reply to one and it will be sorted manually.'}</p>
<p><a href="/">Back to RNAwiki</a></p></main></body></html>`, ok ? 200 : 404);
  }
  if (seg[0] === 'helped' && method === 'POST') {
    // helped_people.voter_key is the PRIMARY KEY and feeds the `helped` figure in GET /api/stats —
    // one forged key was one more "person helped". Nothing in the body is trusted; drain and drop.
    await readBody(req, 512);
    const part = await resolveParticipant(req, res); const voterKey = part.key;
    if (!voterKey) return json(res, 400, { error: 'Missing' });
    try { await db.query('INSERT INTO helped_people(voter_key) VALUES($1) ON CONFLICT (voter_key) DO NOTHING', [voterKey]); } catch (e) {}
    return json(res, 200, { ok: true });
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
    // GET: read the cookie, never the ?voterKey query param, and never mint on a read. Before this,
    // anyone could read back any participant's streak, level and referral count by replaying a key
    // that app.js puts in the query string (so: proxy logs, Referer headers). readOnly:true is the
    // line that keeps "reading is fully anonymous" literally true.
    const part = await resolveParticipant(req, res, { readOnly: true });
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
    const part = await resolveParticipant(req, res);
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
    const part = await resolveParticipant(req, res);
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
    // Highest-consequence of the three: `outcome` is caller-chosen from {better,same,worse} and
    // lands in the aggregate served by GET /api/ledger. An efficacy claim assembled from forged
    // rows is precisely what product constraint 5 forbids.
    const part = await resolveParticipant(req, res);
    if (!part.key || !pid || !rcid) return json(res, 400, { error: 'Missing protocol' });
    const exp = await getOrCreateExperiment(part, pid, rcid);
    await db.query("UPDATE experiments SET outcome=$1, status='completed', outcome_at=now() WHERE id=$2", [outcome, exp.id]);
    if (part.user) await award(part.user.id, 'outcome', 'oc:' + exp.id, 15);
    return json(res, 200, { ok: true, outcome });
  }
  // --- one-click CSV export of members / waitlist (super-admin only) ---
  if (seg[0] === 'admin' && seg[1] === 'export' && method === 'GET') {
    const u = await currentUser(req); if (!isSuper(u)) return json(res, 403, { error: 'Super-admin only' });
    const type = clean(new URL('http://x/' + url).searchParams.get('type'), 20);
    if (type === 'clinicians') {
      const r = await db.query('SELECT name,email,discipline,country,license_no,note,(proof_photo IS NOT NULL) AS has_proof,created_at FROM clinician_interest ORDER BY created_at DESC');
      return csvExport(res, 'rnawiki-professionals.csv', ['name', 'email', 'profession', 'country', 'licence_no', 'proof_uploaded', 'note', 'joined'],
        r.rows.map(x => [x.name, x.email, x.discipline, x.country, x.license_no, x.has_proof ? 'yes' : 'no', x.note, x.created_at && x.created_at.toISOString()]));
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
    const id = pathId(seg[2]); const b = await readBody(req) || {};
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
    const id = pathId(seg[1]);
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
    const id = pathId(seg[2]); const b = await readBody(req) || {};
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
      db.query('SELECT id,name,email,discipline,country,license_no,note,(proof_photo IS NOT NULL) AS has_proof,created_at FROM clinician_interest ORDER BY created_at DESC LIMIT 500'),
    ]);
    return json(res, 200, { experts: experts.rows, partners: partners.rows, foods: foods.rows, requests: requests.rows, rootcauseChanges: rcc.rows, feedback: feedback.rows, proposals: proposals.rows, compoundEdits: cedits.rows, members: members.rows, memberCount: memberCount.rows[0].n, clinicians: clinicians.rows, threshold: PANEL_THRESHOLD });
  }
  if (seg[0] === 'foods' && seg[1] && seg[2] === 'verify' && method === 'POST') {
    const u = await currentUser(req); if (!u || !(u.role === 'admin' || (u.domain === 'dietitian' && u.domain_verified))) return json(res, 403, { error: 'Verified dietitians only' });
    const id = pathId(seg[1]); const b = await readBody(req) || {};
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
    const id = pathId(seg[2]); const b = await readBody(req) || {};
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
    const id = pathId(seg[1]); if (!id) return json(res, 400, { error: 'bad id' });
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
    const id = pathId(seg[1]); if (!id) return json(res, 400, { error: 'bad id' });
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
      if (e) return sendFile(res, path.join(DIR, 'index.html'));
      // ---- NO-JS COMPLETION STATE, PART 2 (2026-07-30) ----------------------------------------
      // /api/subscribe already 303s a native form post to /?subscribed=1#newsletter. That fixed the
      // white page reading {"ok":true} -- but it landed the reader on a home page with no
      // confirmation on it, because the "you're in" message existed only inside site/app.js, i.e.
      // only for the ~10% who never needed the redirect in the first place. So the MAIN call to
      // action still had no completion state for the ~90%: they were returned to a page that looked
      // exactly as it had before they subscribed.
      // The message itself is authored ONCE, in build/prerender.js, hidden by `.nl-done{display:none}`.
      // All this does is un-hide it. app.js does the same from location.search on hydration, so the
      // two paths agree and neither owns a copy of the words.
      const nl = qp.get('subscribed') ? 'done' : (qp.has('suberr') ? 'bad' : '');
      if (nl) {
        html = String(html).replace(`class="nl-${nl}"`, `class="nl-${nl}" style="display:block"`);
      }
      endHtml(res, html);
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
        return serveMissing(res, safe);
      });
    }
    serveMissing(res, safe);
  });
}

// Added 2026-07-28. Every unknown path used to fall through to index.html at HTTP 200. For a
// generated content route that is WORSE than a soft-404: index.html uses relative script srcs, so
// /compare/gone resolves data.js to /compare/data.js and the visitor gets a BLANK WHITE PAGE at
// HTTP 200, which a crawler reads as a real, thin page. This matters now because tightening the
// compare generator (no prescription/controlled/unapproved pairs) took /compare from 404 URLs to
// 107 -- 297 URLs that were previously indexed no longer exist.
//
// Content routes are fully enumerated by the prerenderer, so "no file" means "no such page":
//   /compare/*  -> 410 Gone      (deliberately withdrawn; tells Google to drop it and stop retrying)
//   other route -> 404 Not Found
// Anything else still gets the SPA shell, so client-side routing keeps working.
// /newsletter was folded into the home page (2026-07-28). Redirect rather than 404: the link is
// in the footer of every prerendered page already in Google's index, and in the welcome email.
const LEGACY_REDIRECTS = { '/newsletter': '/#newsletter' };

// ---- COMPOUND SHORT-NAME ALIASES (2026-07-30) ------------------------------------------------
// "do not ever leave a page as an error." /c/creatine, /c/collagen, /c/testosterone and /c/insulin
// all 404'd, because the entries are named "Creatine Monohydrate", "Collagen Peptides" and so on —
// and the short form is exactly what a reader types. Built at parse time from each compound's own
// name; only unambiguous aliases are kept, plus a small curated set where the automatic rule has to
// be overruled (see ALIAS_OVERRIDE in build/parse.js — "insulin" must reach the medicine, not the
// anabolic-misuse entry). 257 aliases, so this whole class of dead end is gone.
let COMPOUND_ALIASES = {};
try {
  const dj = fs.readFileSync(path.join(__dirname, 'site', 'data.js'), 'utf8');
  const m = dj.match(/^window\.RNAWIKI_DATA = ([\s\S]*);\s*$/);
  if (m) COMPOUND_ALIASES = (JSON.parse(m[1]).compoundAliases) || {};
  console.log('[server] compound aliases loaded:', Object.keys(COMPOUND_ALIASES).length);
} catch (e) { console.warn('[server] no compound aliases:', e.message); }

const GENERATED_ROUTES = ['c', 'compare', 'protocol', 'target', 'pathway', 'muscle', 'goal', 'learn', 'physiology', 'energy'];
function serveMissing(res, safe) {
  const seg = String(safe || '').split('/').filter(Boolean);
  if (seg.length && GENERATED_ROUTES.includes(seg[0])) {
    const gone = seg[0] === 'compare';
    const code = gone ? 410 : 404;
    const title = gone ? 'This comparison has been withdrawn' : 'Page not found';
    const body = gone
      ? 'We removed the head-to-head comparisons that pitted a prescription or controlled medicine against a supplement. Ranking a medicine you cannot buy against one you can was not a comparison worth publishing, so this page is gone for good rather than temporarily unavailable.'
      : 'That page does not exist. It may have been renamed.';
    return endHtml(res, `<!doctype html><html lang="en-SG"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>${title} · RNAwiki</title><link rel="stylesheet" href="/styles.css">
</head><body><main class="article" style="max-width:44rem;margin:4rem auto;padding:0 1.25rem">
<h1>${title}</h1><p>${body}</p>
<p><a href="/solve">Browse problems and goals</a> · <a href="/stack">Compound index</a> · <a href="/">Home</a></p>
</main></body></html>`, code);
  }
  sendFile(res, path.join(DIR, 'index.html'));
}

// Added 2026-07-28. The server set no security headers at all: no CSP, HSTS,
// X-Content-Type-Options or Referrer-Policy anywhere. Five res.setHeader calls, no new dependency
// (helmet would be a third npm dep for this). The CSP is deliberately permissive on inline
// script/style because the SPA and the prerendered pages both inline them; it still blocks
// third-party script origins, framing, and form posts to another host, and it is what would have
// contained the mdInline injection sink had that ever been reachable by user input.
const SECURITY_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    // static.cloudflareinsights.com is Cloudflare Web Analytics, which Cloudflare auto-injects.
    // It was CSP-blocked from the day the headers shipped, so it had collected nothing. Enabled
    // deliberately: Search Console only sees the SEARCH side (impressions, queries, position) and
    // goes blind the moment a reader lands. This is the only source for which pages actually get
    // read and where non-search traffic comes from. Cookieless, so it needs no consent banner.
    // 'wasm-unsafe-eval' lets the self-hosted meshopt decoder (site/vendor/three/meshopt_decoder) run its
    // tiny WASM to decompress the 3D body-map GLBs. It permits WebAssembly only — NOT JS eval() — so it is
    // materially narrower than 'unsafe-eval'. Without it the 3D model never decodes (CSP blocks the decode).
    "script-src 'self' 'wasm-unsafe-eval' 'unsafe-inline' https://accounts.google.com https://static.cloudflareinsights.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    // pubchem.ncbi.nlm.nih.gov is fetched by app.js:744 for the molecular formula / weight chips on
    // every compound page carrying a CID (150 of 170). Blocking it did not throw anything a user
    // could see — the chips are `hidden` until the fetch resolves, so they just never appeared.
    // The *images* from the same host kept working the whole time because img-src allows https:,
    // which is exactly why this looked fine on a visual check.
    "connect-src 'self' https://accounts.google.com https://pubchem.ncbi.nlm.nih.gov",
    // sketchfab.com is the 3D muscle model embedded on all 17 /muscle pages (MUSCLE_MODEL_DEFAULT
    // in both renderers). Shipping this CSP without it silently broke the single most visual
    // element on the site — the page still rendered, the iframe just never loaded, so nothing
    // failed loudly enough to notice. Caught by watching the browser console, not the HTML.
    // If you add another embed, it has to be listed here or it will fail the same quiet way.
    "frame-src https://accounts.google.com https://sketchfab.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), interest-cohort=()',
};

const server = http.createServer((req, res) => {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.setHeader(k, v);
  const url = req.url;
  const _redir = LEGACY_REDIRECTS[url.split('?')[0].replace(/\/+$/, '') || '/'];
  if (_redir) { res.writeHead(301, { Location: _redir }); res.end(); return; }
  const _cm = url.split('?')[0].match(/^\/c\/([^/]+)\/?$/);
  if (_cm) {
    const _target = COMPOUND_ALIASES[decodeURIComponent(_cm[1]).toLowerCase()];
    if (_target) { res.writeHead(301, { Location: '/c/' + _target }); res.end(); return; }
  }
  if (url.startsWith('/api/')) {
    api(req, res, url).catch(e => { console.error(e); json(res, 500, { error: 'Server error' }); });
    return;
  }
  serveStatic(req, res, url);
});

db.init().catch(e => console.error('[db] init failed:', e.message)).finally(() => {
  // The anonymous participant cookie is only as good as SECRET. With the built-in default, the
  // HMAC key is a public constant in a public repo, anyone can forge `rw_pid`, and the fix above
  // is theatre. Same key also pseudonymises the research export, so an unset value makes that
  // "non-reversible" id reversible by anyone with the repo. Say so loudly at boot.
  if (db.enabled && SECRET === 'dev-secret-change-me') {
    console.warn('[security] SESSION_SECRET is UNSET — participant cookies are forgeable and the research-export pseudonym is reversible. Set a 32-byte random value.');
  }
  server.listen(PORT, () => console.log('RNAwiki serving on :' + PORT + (db.enabled ? ' (accounts on)' : ' (read-only)')));
  if (db.enabled) emailStartScheduler();
});
