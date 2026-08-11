#!/usr/bin/env node
// Focused, database-free release contracts for identity linking, research consent and erasure.
// These tests guard the exact high-consequence route boundaries; integration tests exercise the
// same SQL against Postgres in deployment, while this suite runs on every build without secrets.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const db = fs.readFileSync(path.join(root, 'db.js'), 'utf8');
const require = createRequire(import.meta.url);
const { clientIp, isCloudflareIp } = require('../request-ip');
const between = (source, start, end) => {
  const a = source.indexOf(start); const b = source.indexOf(end, a + start.length);
  assert.ok(a >= 0 && b > a, `could not isolate contract between ${start} and ${end}`);
  return source.slice(a, b);
};

// A verified Google email is not evidence that the caller owns a legacy password account whose
// email was never verified. Normal sign-in resolves by immutable subject; linking is authenticated.
const google = between(server,
  "if (seg[0] === 'auth' && seg[1] === 'google' && seg[2] === 'link'",
  '// --- comments ---');
assert.match(google, /currentUser\(req\)/);
assert.match(google, /WHERE google_sub=\$1/);
assert.match(google, /explicit_link_required/);
assert.doesNotMatch(google, /google_sub=\$1 OR \(email=/);
assert.doesNotMatch(google, /SET google_sub=\$1 WHERE id=\$2 AND google_sub IS NULL/);

// Consent accepts JSON booleans only and writes the append-only proof + compatibility projection
// atomically. Strings such as "false" must never become true through JavaScript truthiness.
const consent = between(server, "if (seg[0] === 'consent')", '// Opt-in daily reminder email');
assert.match(consent, /typeof b\.research !== 'boolean'/);
assert.match(consent, /db\.transaction\(async q/);
assert.doesNotMatch(consent, /!!b\.research/);

// Every research consumer reads a view derived from the latest append-only decision, never the
// old user_consent projection. Exports additionally disappear while collection is disabled.
for (const view of [
  'current_research_consent', 'research_user_profile', 'research_outcome_checkins',
  'research_blood_markers', 'research_wearable_daily', 'research_experiments',
]) assert.match(db, new RegExp(`CREATE OR REPLACE VIEW ${view}\\b`));
assert.match(db, /ORDER BY user_id, created_at DESC, id DESC/);
const exportsRoute = between(server,
  "if (seg[0] === 'admin' && seg[1] === 'export'",
  "if (seg[0] === 'admin' && seg[1] === 'feedback'");
assert.match(exportsRoute, /researchExportTypes\.has\(type\) && !FEATURES\.researchCollection/);
for (const view of ['research_outcome_checkins', 'research_user_profile', 'research_blood_markers', 'research_wearable_daily']) {
  assert.match(exportsRoute, new RegExp(`\\b${view}\\b`));
}

// Data access includes the personal-observation tables; data erasure and full account erasure are
// transactional and remove both the parent experiment and its cascade-owned daily check-ins.
const mydata = between(server, "if (seg[0] === 'mydata')", "if (seg[0] === 'shared-plan'");
assert.match(mydata, /personalObservations/);
assert.match(mydata, /personalObservationCheckins/);
assert.match(mydata, /consentHistory/);
assert.match(mydata, /db\.transaction\(async q/);
assert.match(mydata, /DELETE FROM experiments WHERE user_id=\$1 OR participant=\$2/);
const accountDelete = between(server,
  "if (seg[0] === 'account' && !seg[1] && method === 'DELETE')",
  '// Unified plan object');
assert.match(accountDelete, /db\.transaction\(async q/);
for (const table of ['experiments', 'explain_posts', 'protocol_forks', 'shared_plans', 'studio_protocols']) {
  assert.match(accountDelete, new RegExp(`(?:DELETE FROM|UPDATE) ${table}\\b`));
}

// Schema setup is atomic, and a failed setup must never fall through to server.listen().
assert.match(db, /await client\.query\('BEGIN'\)/);
assert.match(db, /await client\.query\('COMMIT'\)/);
assert.match(db, /await client\.query\('ROLLBACK'\)/);
assert.match(db, /await transaction\(q => q\(SCHEMA\)\)/);
const boot = server.slice(server.lastIndexOf('db.init()'));
assert.match(boot, /db\.init\(\)\.then/);
assert.match(boot, /init failed; server not started/);
assert.doesNotMatch(boot, /\.finally\(/);

// A sequential food id must never enumerate pending uploads or bypass the community kill switch.
const foodPhoto = between(server, "if (seg[0] === 'foodphoto'", '// ---- /interest');
assert.match(foodPhoto, /!FEATURES\.publicCommunity/);
assert.match(foodPhoto, /status='active'/);
assert.match(foodPhoto, /image\\\/\(\?:png\|jpeg\|webp\)/);
assert.match(foodPhoto, /X-Content-Type-Options/);
assert.doesNotMatch(foodPhoto, /Cache-Control': 'public/);
const foodSubmit = between(server, "if (seg[0] === 'foods' && !seg[1] && method === 'POST')", '// --- "request a protocol" board');
assert.match(foodSubmit, /const status = 'pending'/);
assert.doesNotMatch(foodSubmit, /corrects \? 'pending' : 'active'/);

// Public Studio titles come only from governed corpus labels. Caller-written draft names and notes
// may not turn into unreviewed public health claims.
assert.match(server, /function publicProtocolTitle\(pid, rcid\)/);
const studioCreate = between(server,
  "if (seg[0] === 'protocols' && !seg[1] && method === 'POST')",
  '// A REMIX STORES ONLY ITS DIFFERENCES');
assert.match(studioCreate, /publish \? publicProtocolTitle\(v\.base_pid, v\.base_rcid\) : draftTitle/);
assert.doesNotMatch(studioCreate, /publish[^\n]+\btitle\b[^\n]+clean\(b\.title/);

// Proxy-aware throttling must identify a visitor without trusting a spoofable forwarding header.
// Railway's X-Real-IP is the trust anchor. CF-Connecting-IP is used only when that address is in
// Cloudflare's published proxy ranges; X-Forwarded-For is deliberately irrelevant.
const request = (headers, remoteAddress = '100.64.0.2') => ({ headers, socket: { remoteAddress } });
assert.equal(clientIp(request({}, '::ffff:203.0.113.9'), false), '203.0.113.9');
assert.equal(clientIp(request({ 'x-real-ip': '198.51.100.8', 'cf-connecting-ip': '192.0.2.4' }), true), '198.51.100.8');
assert.equal(clientIp(request({ 'x-real-ip': '172.67.217.127', 'cf-connecting-ip': '192.0.2.4' }), true), '192.0.2.4');
assert.equal(clientIp(request({ 'x-real-ip': '172.67.217.127', 'cf-connecting-ip': 'bad', 'x-forwarded-for': '192.0.2.5' }), true), '172.67.217.127');
assert.equal(clientIp(request({ 'x-forwarded-for': '192.0.2.5' }, '::ffff:198.51.100.7'), true), '198.51.100.7');
assert.equal(isCloudflareIp('2606:4700::1234'), true);
assert.equal(isCloudflareIp('2001:db8::1'), false);

console.log('[privacy-security] identity, consent, erasure, proxy IPs, research views and fail-closed boot contracts OK');
