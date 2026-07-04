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
// Hard domain isolation for stewardship: each expert domain owns exactly one layer.
const DOMAIN_LAYER = { physio: 'move', dietitian: 'fuel', pharmacist: 'stack' };
// AI food-photo scanner (opt-in: does nothing until ANTHROPIC_API_KEY is set).
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

const ADMIN_USER = (process.env.ADMIN_USER || '').toLowerCase();
async function currentUser(req) {
  const sid = parseCookies(req).sid;
  if (!sid || !db.enabled) return null;
  const r = await db.query('SELECT u.id, u.username, u.role, u.domain, u.credential, u.domain_verified FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token=$1 AND s.expires_at > now()', [sid]);
  const u = r.rows[0];
  if (u && ADMIN_USER && u.username.toLowerCase() === ADMIN_USER) u.role = 'admin';
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
  if (!db.enabled) return json(res, 503, { error: 'Accounts are not available right now.' });
  // url keeps its query string (handlers parse ?goal=/?ids=/?problem= from it);
  // routing uses the path portion only.
  const parts = url.split('?')[0].split('/').filter(Boolean); // ['api', ...]
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
    return json(res, 200, { score: { up: r.rows[0].up || 0, down: r.rows[0].down || 0 } });
  }

  // --- Tier 2: domain-isolated stewardship ---
  if (seg[0] === 'profile' && seg[1] === 'domain' && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in' });
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const domain = clean(b.domain, 20), credential = clean(b.credential, 200);
    if (!DOMAIN_LAYER[domain] && domain !== '') return json(res, 400, { error: 'Unknown domain' });
    await db.query('UPDATE users SET domain=$1, credential=$2 WHERE id=$3', [domain || null, credential || null, u.id]);
    return json(res, 200, { ok: true, domain: domain || null, credential: credential || null });
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
    // HARD domain isolation: you may only propose on the layer your domain owns.
    if (DOMAIN_LAYER[u.domain] !== layer) return json(res, 403, { error: `A ${u.domain} may only edit the ${DOMAIN_LAYER[u.domain]} layer.` });
    const r = await db.query(
      `INSERT INTO proposals(problem_id,root_cause_id,layer,domain,user_id,change,evidence)
       VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id,created_at`, [pid, rcid, layer, u.domain, u.id, change, evidence || null]);
    return json(res, 200, { ok: true, id: r.rows[0].id });
  }
  if (seg[0] === 'proposals' && seg[1] && seg[2] === 'endorse' && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in' });
    if (!u.domain) return json(res, 403, { error: 'Set your expert domain first.' });
    const id = parseInt(seg[1], 10); if (!id) return json(res, 400, { error: 'bad id' });
    const pr = (await db.query('SELECT domain,user_id FROM proposals WHERE id=$1', [id])).rows[0];
    if (!pr) return json(res, 404, { error: 'Proposal not found' });
    // STRICT peer review: endorsement must come from the SAME domain, not the author.
    if (pr.user_id === u.id) return json(res, 403, { error: 'You cannot endorse your own proposal.' });
    if (pr.domain !== u.domain) return json(res, 403, { error: `Only another ${pr.domain} can endorse this. Cross-domain experts may Flag instead.` });
    await db.query(`INSERT INTO proposal_actions(proposal_id,user_id,action) VALUES($1,$2,'endorse')
      ON CONFLICT (proposal_id,user_id,action) DO NOTHING`, [id, u.id]);
    await db.query(`UPDATE proposals SET status='endorsed' WHERE id=$1 AND status!='flagged'`, [id]);
    return json(res, 200, { ok: true });
  }
  if (seg[0] === 'proposals' && seg[1] && seg[2] === 'flag' && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in' });
    if (!u.domain) return json(res, 403, { error: 'Set your expert domain first.' });
    const id = parseInt(seg[1], 10); if (!id) return json(res, 400, { error: 'bad id' });
    const pr = (await db.query('SELECT domain FROM proposals WHERE id=$1', [id])).rows[0];
    if (!pr) return json(res, 404, { error: 'Proposal not found' });
    // Cross-domain conflict review: only a DIFFERENT domain can flag.
    if (pr.domain === u.domain) return json(res, 403, { error: 'Same-domain experts endorse, not flag. Flags are for cross-domain conflicts.' });
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
    return json(res, 200, { experts: experts.rows, leaderboard });
  }

  // --- admin: credential verification for stewardship ---
  if (seg[0] === 'admin' && seg[1] === 'experts' && method === 'GET') {
    const u = await currentUser(req); if (!u || u.role !== 'admin') return json(res, 403, { error: 'Admin only' });
    const r = await db.query('SELECT username, domain, credential, domain_verified, created_at FROM users WHERE domain IS NOT NULL ORDER BY domain_verified ASC, created_at ASC');
    return json(res, 200, { experts: r.rows });
  }
  if (seg[0] === 'admin' && seg[1] === 'verify-domain' && method === 'POST') {
    const u = await currentUser(req); if (!u || u.role !== 'admin') return json(res, 403, { error: 'Admin only' });
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const username = clean(b.username, 24); const verified = b.verified !== false;
    const r = await db.query('UPDATE users SET domain_verified=$1 WHERE username=$2 RETURNING username, domain, domain_verified', [verified, username]);
    if (!r.rows[0]) return json(res, 404, { error: 'No such user' });
    return json(res, 200, { ok: true, user: r.rows[0] });
  }

  return json(res, 404, { error: 'Not found' });
}

// ---------- static ----------
function sendFile(res, file, code) {
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(code || 200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}
function serveStatic(req, res, url) {
  let p = decodeURIComponent(url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const safe = path.normalize(p).replace(/^(\.\.[/\\])+/, '');
  const file = path.join(DIR, safe);
  if (!file.startsWith(DIR)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, (err, data) => {
    if (!err) {
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      return res.end(data);
    }
    // clean-path routing: try the prerendered <path>.html for crawlable SEO pages
    if (!path.extname(file)) {
      return fs.readFile(file + '.html', (e2, html) => {
        if (!e2) { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); return res.end(html); }
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
  server.listen(PORT, () => console.log('PBswiki serving on :' + PORT + (db.enabled ? ' (accounts on)' : ' (read-only)')));
});
