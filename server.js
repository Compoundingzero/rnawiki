// PBswiki server: serves the static site AND a small JSON API for accounts,
// community edits, and comments (Postgres via db.js). Zero web framework.
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const db = require('./db');

const DIR = path.join(__dirname, 'site');
const PORT = process.env.PORT || 3000;
const SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me';
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.png': 'image/png',
};
const EDITABLE = ['mechanism', 'target', 'plain', 'protocol', 'watch', 'bottom'];

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
function readBody(req) {
  return new Promise((resolve) => {
    let data = ''; let tooBig = false;
    req.on('data', c => { data += c; if (data.length > 1e5) { tooBig = true; req.destroy(); } });
    req.on('end', () => { if (tooBig) return resolve(null); try { resolve(data ? JSON.parse(data) : {}); } catch (e) { resolve(null); } });
    req.on('error', () => resolve(null));
  });
}
function json(res, code, obj, headers) {
  res.writeHead(code, Object.assign({ 'Content-Type': 'application/json' }, headers || {}));
  res.end(JSON.stringify(obj));
}
function clean(s, max) { return String(s == null ? '' : s).trim().slice(0, max || 4000); }

async function currentUser(req) {
  const sid = parseCookies(req).sid;
  if (!sid || !db.enabled) return null;
  const r = await db.query('SELECT u.id, u.username, u.role FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token=$1 AND s.expires_at > now()', [sid]);
  return r.rows[0] || null;
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
  if (!db.enabled) return json(res, 503, { error: 'Accounts are not available right now.' });
  const parts = url.split('/').filter(Boolean); // ['api', ...]
  const seg = parts.slice(1);
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
    const r = await db.query('SELECT id,username,role,pass FROM users WHERE username=$1', [username]);
    const u = r.rows[0];
    if (!u || !verifyPassword(password, u.pass)) return json(res, 401, { error: 'Wrong username or password' });
    const token = crypto.randomBytes(24).toString('hex');
    await db.query('INSERT INTO sessions(token,user_id,expires_at) VALUES($1,$2, now()+interval \'30 days\')', [token, u.id]);
    setSessionCookie(res, token);
    return json(res, 200, { user: { id: u.id, username: u.username, role: u.role } });
  }
  if (seg[0] === 'logout' && method === 'POST') {
    const sid = parseCookies(req).sid; if (sid) await db.query('DELETE FROM sessions WHERE token=$1', [sid]);
    res.setHeader('Set-Cookie', 'sid=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure');
    return json(res, 200, { ok: true });
  }
  if (seg[0] === 'me' && method === 'GET') {
    const u = await currentUser(req); return json(res, 200, { user: u });
  }

  // --- comments ---
  if (seg[0] === 'comments' && seg[1] === 'recent' && method === 'GET') {
    const r = await db.query('SELECT c.id,c.goal_id,c.body,c.created_at,u.username FROM comments c JOIN users u ON u.id=c.user_id ORDER BY c.created_at DESC LIMIT 8');
    return json(res, 200, { comments: r.rows });
  }
  if (seg[0] === 'comments' && method === 'GET') {
    const goal = clean(new URL('http://x/' + url).searchParams.get('goal'), 40);
    if (!goal) return json(res, 400, { error: 'goal required' });
    const r = await db.query('SELECT c.id,c.goal_id,c.body,c.created_at,u.username,c.user_id FROM comments c JOIN users u ON u.id=c.user_id WHERE c.goal_id=$1 ORDER BY c.created_at DESC LIMIT 200', [goal]);
    return json(res, 200, { comments: r.rows });
  }
  if (seg[0] === 'comments' && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in to comment' });
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const goalId = clean(b.goalId, 40), body = clean(b.body, 2000);
    if (!goalId || !body) return json(res, 400, { error: 'Write something first' });
    const r = await db.query('INSERT INTO comments(goal_id,user_id,body) VALUES($1,$2,$3) RETURNING id,goal_id,body,created_at', [goalId, u.id, body]);
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
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const cid = clean(b.compoundId, 40); const name = clean(b.compoundName, 120);
    if (!cid || !b.fields || typeof b.fields !== 'object') return json(res, 400, { error: 'Nothing to save' });
    const fields = {};
    for (const k of EDITABLE) if (b.fields[k] != null) fields[k] = clean(b.fields[k], 6000);
    const note = clean(b.note, 200);
    await db.query('INSERT INTO edits(compound_id,compound_name,user_id,fields,note) VALUES($1,$2,$3,$4,$5)', [cid, name, u.id, JSON.stringify(fields), note || null]);
    return json(res, 200, { ok: true, by: u.username });
  }

  return json(res, 404, { error: 'Not found' });
}

// ---------- static ----------
function serveStatic(req, res, url) {
  let p = decodeURIComponent(url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = path.join(DIR, path.normalize(p).replace(/^(\.\.[/\\])+/, ''));
  if (!file.startsWith(DIR)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, (err, data) => {
    if (err) return fs.readFile(path.join(DIR, 'index.html'), (e2, idx) => {
      if (e2) { res.writeHead(404); return res.end('Not found'); }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(idx);
    });
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = req.url;
  if (url.startsWith('/api/')) {
    api(req, res, url.split('?')[0]).catch(e => { console.error(e); json(res, 500, { error: 'Server error' }); });
    return;
  }
  serveStatic(req, res, url);
});

db.init().catch(e => console.error('[db] init failed:', e.message)).finally(() => {
  server.listen(PORT, () => console.log('PBswiki serving on :' + PORT + (db.enabled ? ' (accounts on)' : ' (read-only)')));
});
