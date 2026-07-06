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
    for (const f of ['app.js', 'styles.css', 'data.js']) { try { h.update(fs.readFileSync(path.join(DIR, f))); } catch (e) {} }
    return h.digest('hex').slice(0, 10);
  } catch (e) { return String(Date.now()); }
})();
function versionAssets(html) {
  return String(html).replace(/((?:src|href)=")(\/?(?:app\.js|styles\.css|data\.js))(?:\?v=[^"]*)?(")/g, (m, a, b, c) => a + b + '?v=' + ASSET_VER + c);
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
// how many relevant-panel endorsements auto-approve a root-cause change (superadmin can override)
const PANEL_THRESHOLD = 2;
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
      const r = await db.query('INSERT INTO users(username,email,pass) VALUES($1,$2,$3) RETURNING id,username,role', [username, email || null, hashPassword(password)]);
      const u = r.rows[0]; const token = crypto.randomBytes(24).toString('hex');
      await db.query('INSERT INTO sessions(token,user_id,expires_at) VALUES($1,$2, now()+interval \'30 days\')', [token, u.id]);
      setSessionCookie(res, token);
      return json(res, 200, { user: { id: u.id, username: u.username, role: u.role } });
    } catch (e) {
      if (e.code === '23505') return json(res, 409, { error: 'That username is taken' });
      console.error(e); return json(res, 500, { error: 'Server error' });
    }
  }
  if (seg[0] === 'login' && method === 'POST') {
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const username = clean(b.username, 24), password = String(b.password || '');
    const r = await db.query('SELECT id,username,role,pass,domain,credential,domain_verified FROM users WHERE username=$1', [username]);
    const u = r.rows[0];
    if (!u || !verifyPassword(password, u.pass)) return json(res, 401, { error: 'Wrong username or password' });
    const token = crypto.randomBytes(24).toString('hex');
    await db.query('INSERT INTO sessions(token,user_id,expires_at) VALUES($1,$2, now()+interval \'30 days\')', [token, u.id]);
    setSessionCookie(res, token);
    return json(res, 200, { user: { id: u.id, username: u.username, role: u.role, domain: u.domain, credential: u.credential, domain_verified: u.domain_verified } });
  }
  if (seg[0] === 'logout' && method === 'POST') {
    const sid = parseCookies(req).sid; if (sid) await db.query('DELETE FROM sessions WHERE token=$1', [sid]);
    res.setHeader('Set-Cookie', 'sid=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure');
    return json(res, 200, { ok: true });
  }
  if (seg[0] === 'me' && method === 'GET') {
    const u = await currentUser(req); return json(res, 200, { user: u });
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
  if (seg[0] === 'admin' && seg[1] === 'export' && method === 'GET') {
    const u = await currentUser(req); if (!isSuper(u)) return json(res, 403, { error: 'Super-admin only' });
    const type = clean(new URL('http://x/' + url).searchParams.get('type'), 20);
    if (type === 'clinicians') {
      const r = await db.query('SELECT name,email,discipline,note,created_at FROM clinician_interest ORDER BY created_at DESC');
      return csvExport(res, 'rnawiki-clinicians.csv', ['name', 'email', 'discipline', 'note', 'joined'],
        r.rows.map(x => [x.name, x.email, x.discipline, x.note, x.created_at && x.created_at.toISOString()]));
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
    if (cnt.rows[0].n >= PANEL_THRESHOLD) { await db.query("UPDATE rootcause_changes SET status='approved' WHERE id=$1 AND status='pending'", [id]); status = 'approved'; }
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
  if (seg[0] === 'admin' && seg[1] === 'overview' && method === 'GET') {
    const u = await currentUser(req); if (!isSuper(u)) return json(res, 403, { error: 'Super-admin only' });
    const [experts, partners, foods, requests, rcc, feedback, proposals, cedits, members, memberCount, clinicians] = await Promise.all([
      db.query("SELECT id,username,domain,requested_domain,domain_verified,application_status,credential,role_backlink,reputation_points FROM users WHERE domain IS NOT NULL OR requested_domain IS NOT NULL ORDER BY (application_status='pending') DESC, domain_verified ASC, created_at ASC"),
      db.query('SELECT id,name,type,location,link,backlink_url,serves,status,created_at FROM partners ORDER BY status ASC, created_at DESC LIMIT 200'),
      db.query("SELECT f.id,f.name,f.serving,f.data,f.status,f.created_at,u.username AS by_user FROM user_foods f LEFT JOIN users u ON u.id=f.submitted_by WHERE f.status='pending' ORDER BY f.created_at ASC LIMIT 200"),
      db.query("SELECT id,request,detail,votes,status,created_at FROM protocol_requests ORDER BY (status='open') DESC, votes DESC, created_at DESC LIMIT 100"),
      db.query(`SELECT c.id,c.problem_id,c.action,c.root_cause_id,c.name,c.diagnostic,c.domains,c.rationale,c.status,c.created_at,u.username AS by_user,
        (SELECT count(*)::int FROM rootcause_endorsements e WHERE e.change_id=c.id) AS endorsements
        FROM rootcause_changes c LEFT JOIN users u ON u.id=c.submitted_by ORDER BY (c.status='pending') DESC, c.created_at DESC LIMIT 100`),
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
});
