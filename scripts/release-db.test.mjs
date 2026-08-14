#!/usr/bin/env node
// Real release-boundary test for the creator journey.
//
// This test deliberately does not fall back to DATABASE_URL. It starts the real server, which
// runs the real idempotent schema initializer, but only after TEST_DATABASE_URL has passed two
// independent guards: its URL must name loopback and the connected database must have the
// dedicated rnawiki_*_test shape. It never connects to Railway or any other remote host.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import vm from 'node:vm';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEST_URL = String(process.env.TEST_DATABASE_URL || '');
const LOOPBACK_NAMES = new Set(['localhost', '127.0.0.1', '::1']);

function refuse(message) {
  throw new Error(`[release db guard] ${message}`);
}

function guardedDatabaseUrl(raw) {
  if (!raw) refuse('TEST_DATABASE_URL is required; DATABASE_URL is never used by this test.');
  let parsed;
  try { parsed = new URL(raw); } catch (_) { refuse('TEST_DATABASE_URL is not a valid URL.'); }
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) refuse('only a PostgreSQL test URL is accepted.');
  if (!LOOPBACK_NAMES.has(parsed.hostname)) refuse(`host ${JSON.stringify(parsed.hostname)} is not loopback.`);
  const name = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
  if (!/^rnawiki_[a-z0-9_]+_test$/i.test(name)) {
    refuse(`database ${JSON.stringify(name)} must match rnawiki_*_test.`);
  }
  return { raw, name };
}

const guarded = guardedDatabaseUrl(TEST_URL);
const pool = new Pool({ connectionString: guarded.raw, ssl: false, max: 3 });
const fixture = `rdb_${crypto.randomBytes(5).toString('hex')}`;
const triggerName = `rnawiki_release_${fixture}`;
const triggerFunction = `${triggerName}_reject_owner`;
const usernames = {
  owner: `${fixture}_owner`,
  member: `${fixture}_member`,
};
const sessions = {
  owner: crypto.randomBytes(24).toString('base64url'),
  member: crypto.randomBytes(24).toString('base64url'),
};
const fixtureUserIds = [];
const protocolCodes = [];
let child = null;
let atomicFailureTriggerInstalled = false;

function loadCorpus() {
  const context = vm.createContext({ window: {}, console });
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'site/data.js'), 'utf8'), context, { filename: 'site/data.js' });
  const data = context.window.RNAWIKI_DATA;
  const topic = (data.graph.problems || []).find((p) => (p.routes || []).some((r) => r.branchable === true));
  const route = topic && topic.routes.find((r) => r.branchable === true);
  const compound = (data.compounds || []).find((c) => c.id === 'c0');
  assert.ok(topic && route && compound, 'fixture needs one governed route and compound c0');
  return { topic, route, compound };
}

function freePort() {
  return new Promise((resolve, reject) => {
    const socket = net.createServer();
    socket.unref();
    socket.on('error', reject);
    socket.listen(0, '127.0.0.1', () => {
      const address = socket.address();
      socket.close((error) => error ? reject(error) : resolve(address.port));
    });
  });
}

function waitForExit(proc, timeoutMs = 5000) {
  if (!proc || proc.exitCode != null) return Promise.resolve();
  return new Promise((resolve) => {
    const timer = setTimeout(() => { if (proc.exitCode == null) proc.kill('SIGKILL'); resolve(); }, timeoutMs);
    proc.once('exit', () => { clearTimeout(timer); resolve(); });
  });
}

async function waitForReady(origin, logs) {
  const deadline = Date.now() + 30000;
  let last = '';
  while (Date.now() < deadline) {
    if (child.exitCode != null) throw new Error(`server exited before readiness (${child.exitCode})\n${logs()}`);
    try {
      const response = await fetch(`${origin}/healthz`, { signal: AbortSignal.timeout(1500) });
      last = await response.text();
      if (response.status === 200) {
        const body = JSON.parse(last);
        assert.equal(body.ok, true);
        return;
      }
    } catch (error) { last = error.message; }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`server did not become ready: ${last}\n${logs()}`);
}

function browser(origin, session, ipSuffix) {
  const common = {
    Origin: origin,
    Referer: `${origin}/studio`,
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/140 Safari/537.36 release-db-contract',
    'X-Real-IP': `127.0.0.${ipSuffix}`,
  };
  return async (pathname, options = {}) => {
    const headers = { ...common, ...(options.headers || {}) };
    if (session) headers.Cookie = `sid=${session}`;
    if (options.body !== undefined && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
    const response = await fetch(origin + pathname, {
      ...options,
      headers,
      body: options.body === undefined || typeof options.body === 'string' ? options.body : JSON.stringify(options.body),
      redirect: 'manual',
      signal: AbortSignal.timeout(10000),
    });
    const text = await response.text();
    let json = null;
    if ((response.headers.get('content-type') || '').includes('application/json')) {
      try { json = JSON.parse(text); } catch (_) { /* assertion below will show the raw response */ }
    }
    return { status: response.status, headers: response.headers, text, json };
  };
}

function expectStatus(result, status, label) {
  assert.equal(result.status, status, `${label}: ${result.text}`);
  return result.json;
}

async function insertAccount(role) {
  const username = usernames[role];
  const email = `${username}@release.invalid`;
  const user = (await pool.query(
    'INSERT INTO users(username,email,pass) VALUES($1,$2,NULL) RETURNING id',
    [username, email],
  )).rows[0];
  fixtureUserIds.push(user.id);
  await pool.query("INSERT INTO sessions(token,user_id,expires_at) VALUES($1,$2,now()+interval '1 hour')", [sessions[role], user.id]);
  return { ...user, username, email, session: sessions[role] };
}

async function installAtomicFailureTrigger(ownerId) {
  // Force the second statement in publish (owner membership) to fail. If publish and membership
  // are not one transaction, this leaves an orphaned published row and the test catches it.
  await pool.query(`CREATE OR REPLACE FUNCTION ${triggerFunction}() RETURNS trigger AS $$
    BEGIN
      IF NEW.user_id = ${Number(ownerId)} AND NEW.role = 'owner' THEN
        RAISE EXCEPTION 'release integration forced owner edge failure';
      END IF;
      RETURN NEW;
    END;
  $$ LANGUAGE plpgsql`);
  await pool.query(`CREATE TRIGGER ${triggerName}
    BEFORE INSERT OR UPDATE ON protocol_memberships
    FOR EACH ROW EXECUTE FUNCTION ${triggerFunction}()`);
  atomicFailureTriggerInstalled = true;
}

async function removeAtomicFailureTrigger() {
  if (!atomicFailureTriggerInstalled) return;
  await pool.query(`DROP TRIGGER IF EXISTS ${triggerName} ON protocol_memberships`);
  await pool.query(`DROP FUNCTION IF EXISTS ${triggerFunction}()`);
  atomicFailureTriggerInstalled = false;
}

async function cleanup() {
  const errors = [];
  try { await removeAtomicFailureTrigger(); } catch (error) { errors.push(error); }
  try {
    if (protocolCodes.length) await pool.query('DELETE FROM studio_protocols WHERE code=ANY($1::text[])', [protocolCodes]);
    if (fixtureUserIds.length) {
      await pool.query('DELETE FROM studio_protocols WHERE user_id=ANY($1::int[])', [fixtureUserIds]);
      await pool.query('DELETE FROM users WHERE id=ANY($1::int[])', [fixtureUserIds]);
    }
  } catch (error) { errors.push(error); }
  try { await pool.end(); } catch (error) { errors.push(error); }
  if (child && child.exitCode == null) child.kill('SIGTERM');
  await waitForExit(child);
  if (errors.length) throw new AggregateError(errors, 'release DB fixture cleanup failed');
}

let failure = null;
try {
  const identity = (await pool.query('SELECT current_database() AS name, inet_server_addr() AS address')).rows[0];
  assert.equal(identity.name, guarded.name, 'connected database differs from the guarded URL');
  assert.ok(identity.address == null || ['127.0.0.1', '::1'].includes(String(identity.address)),
    `connected server address ${identity.address} is not loopback`);

  const port = await freePort();
  const origin = `http://127.0.0.1:${port}`;
  let stdout = '', stderr = '';
  child = spawn(process.execPath, ['server.js'], {
    cwd: ROOT,
    env: {
      ...process.env,
      DATABASE_URL: guarded.raw,
      PGSSL: '0',
      PORT: String(port),
      SITE_URL: origin,
      SESSION_SECRET: crypto.randomBytes(48).toString('base64url'),
      CREATOR_DISCOVERY: '1',
      PROTOCOL_COMMUNITY: '1',
      PUBLIC_COMMUNITY: '0',
      TRUST_PROXY: '1',
      RESEND_API_KEY: '',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', (chunk) => { stdout += chunk; if (stdout.length > 40000) stdout = stdout.slice(-40000); });
  child.stderr.on('data', (chunk) => { stderr += chunk; if (stderr.length > 40000) stderr = stderr.slice(-40000); });
  const logs = () => `${stdout}\n${stderr}`.trim();
  await waitForReady(origin, logs);

  const owner = await insertAccount('owner');
  const member = await insertAccount('member');
  const ownerHttp = browser(origin, owner.session, 2);
  const memberHttp = browser(origin, member.session, 3);
  const anonymousHttp = browser(origin, null, 4);
  const { topic, route, compound } = loadCorpus();
  const spec = {
    v: 1,
    items: [{ k: 'c', id: compound.id, days: [0, 1, 2, 3, 4, 5, 6] }],
    execution: { v: 1, primary: `c:${compound.id}` },
  };
  const publish = (visibility) => ({
    method: 'POST',
    body: { status: 'published', visibility, topic_id: topic.id, route_id: route.id, spec },
  });

  // Prove the transaction, rather than merely observing its happy path.
  await installAtomicFailureTrigger(owner.id);
  const rowsBeforeFailure = Number((await pool.query(
    "SELECT count(*) AS n FROM studio_protocols WHERE user_id=$1 AND status='published'", [owner.id],
  )).rows[0].n);
  const forced = await ownerHttp('/api/protocols', publish('public'));
  assert.equal(forced.status, 500, `forced owner-edge failure should fail publish: ${forced.text}`);
  const rowsAfterFailure = Number((await pool.query(
    "SELECT count(*) AS n FROM studio_protocols WHERE user_id=$1 AND status='published'", [owner.id],
  )).rows[0].n);
  assert.equal(rowsAfterFailure, rowsBeforeFailure, 'membership failure left an orphaned published protocol');
  await removeAtomicFailureTrigger();

  const unlisted = expectStatus(await ownerHttp('/api/protocols', publish('unlisted')), 200, 'publish unlisted');
  protocolCodes.push(unlisted.code);
  assert.equal(unlisted.visibility, 'unlisted');
  let index = expectStatus(await anonymousHttp(`/api/protocols/route-index?topic_id=${encodeURIComponent(topic.id)}&route_id=${encodeURIComponent(route.id)}`), 200, 'route index after unlisted publish');
  assert.ok(!(index.branches || []).some((branch) => branch.code === unlisted.code),
    'link-only protocol appeared in route discovery');

  const published = expectStatus(await ownerHttp('/api/protocols', publish('public')), 200, 'publish public');
  protocolCodes.push(published.code);
  assert.equal(published.topic_id, topic.id);
  assert.equal(published.route_id, route.id);
  const ownerEdge = (await pool.query(
    'SELECT role FROM protocol_memberships WHERE protocol_code=$1 AND user_id=$2', [published.code, owner.id],
  )).rows[0];
  assert.equal(ownerEdge && ownerEdge.role, 'owner', 'public publish did not create its owner membership');

  index = expectStatus(await anonymousHttp(`/api/protocols/route-index?topic_id=${encodeURIComponent(topic.id)}&route_id=${encodeURIComponent(route.id)}`), 200, 'route index after public publish');
  const publicBranches = index.branches || [];
  assert.ok(publicBranches.some((branch) => branch.code === published.code), 'public exact topic/route is absent from discovery');
  assert.ok(!publicBranches.some((branch) => branch.code === unlisted.code), 'unlisted branch leaked beside a public branch');

  const document = await anonymousHttp(`/p/${published.code}`);
  assert.equal(document.status, 200, `public protocol document: ${document.text.slice(0, 300)}`);
  assert.match(document.headers.get('content-type') || '', /text\/html/);
  assert.match(document.text, /Creator plan/);
  assert.match(document.text, /Start this plan/);
  assert.ok(document.text.includes(compound.name), 'server-readable protocol omitted its exact item');

  const source = expectStatus(await anonymousHttp(`/api/protocols/${published.code}`), 200, 'read published protocol');
  assert.equal(source.status, 'published');
  assert.deepEqual(source.spec, spec);
  assert.equal(source.guide.contract, 'execution-v1');
  assert.equal(source.guide.primary, `c:${compound.id}`);
  assert.equal(source.snapshot_contract, 'execution-safety-v2');
  assert.ok(source.snapshot_safety && Array.isArray(source.snapshot_safety.warn), 'published source omitted its hash-bound warning projection');
  const expectedHash = crypto.createHash('sha256').update(JSON.stringify({
    spec: source.spec, guide: source.guide, safety: source.snapshot_safety,
  })).digest('base64url');
  const expectedLegacyHash = crypto.createHash('sha256').update(JSON.stringify({ spec: source.spec, guide: source.guide })).digest('base64url');
  assert.equal(source.snapshot_hash, expectedHash, 'published enrollment source is not content-addressed over its steps, guide and warnings');
  assert.equal(source.legacy_snapshot_hash, expectedLegacyHash, 'published source omitted the migration witness for existing enrollments');
  assert.notEqual(source.snapshot_hash, source.legacy_snapshot_hash, 'the current warning-bound contract reused the legacy address');

  const joinBeforeStart = await memberHttp(`/api/protocols/${published.code}/community/join`, {
    method: 'POST', body: { version_id: published.code, disclosure_version: 'protocol-community-v1' },
  });
  assert.equal(joinBeforeStart.status, 403, `account joined before starting the exact plan: ${joinBeforeStart.text}`);
  assert.match(joinBeforeStart.text, /Start this exact plan before joining/);
  assert.equal(Number((await pool.query('SELECT count(*) AS n FROM protocol_memberships WHERE protocol_code=$1 AND user_id=$2', [published.code, member.id])).rows[0].n), 0,
    'refused pre-Start join still created a visible community membership');

  const staleStart = await memberHttp(`/api/protocols/${published.code}/clone`, {
    method: 'POST', body: { snapshot_hash: 'stale-read-contract' },
  });
  assert.equal(staleStart.status, 409, `Start accepted a stale read snapshot: ${staleStart.text}`);
  assert.equal((await pool.query('SELECT clones FROM studio_protocols WHERE code=$1', [published.code])).rows[0].clones, 0);
  const firstStart = expectStatus(await memberHttp(`/api/protocols/${published.code}/clone`, {
    method: 'POST', body: { snapshot_hash: source.snapshot_hash },
  }), 200, 'first Start');
  assert.equal(firstStart.counted, true);
  assert.equal(firstStart.clones, 1);
  assert.equal(firstStart.snapshot_hash, source.snapshot_hash, 'Start revalidation returned a different execution snapshot');
  assert.equal(firstStart.snapshot_contract, source.snapshot_contract, 'Start revalidation returned a different snapshot contract');
  const secondStart = expectStatus(await memberHttp(`/api/protocols/${published.code}/clone`, {
    method: 'POST', body: { snapshot_hash: source.snapshot_hash },
  }), 200, 'repeat Start');
  assert.equal(secondStart.counted, false);
  assert.equal(secondStart.clones, 1);
  assert.equal(secondStart.snapshot_hash, source.snapshot_hash, 'repeat Start drifted from the read execution snapshot');
  const cloneRows = Number((await pool.query('SELECT count(*) AS n FROM studio_clones WHERE code=$1 AND voter_key=$2', [published.code, `u:${member.id}`])).rows[0].n);
  assert.equal(cloneRows, 1, 'repeat Start created more than one idempotency row');
  assert.equal((await pool.query('SELECT clones FROM studio_protocols WHERE code=$1', [published.code])).rows[0].clones, 1);

  let community = expectStatus(await memberHttp(`/api/protocols/${published.code}/community`), 200, 'community after private Start');
  assert.equal(community.role, null);
  assert.equal(community.can_post, false);
  assert.equal(Number((await pool.query('SELECT count(*) AS n FROM protocol_memberships WHERE protocol_code=$1 AND user_id=$2', [published.code, member.id])).rows[0].n), 0,
    'Start silently exposed account membership to the plan community');

  const joinDifferentUnstartedBranch = await memberHttp(`/api/protocols/${unlisted.code}/community/join`, {
    method: 'POST', body: { version_id: unlisted.code, disclosure_version: 'protocol-community-v1' },
  });
  assert.equal(joinDifferentUnstartedBranch.status, 403,
    `a Start on ${published.code} authorized joining different branch ${unlisted.code}: ${joinDifferentUnstartedBranch.text}`);
  assert.equal(Number((await pool.query('SELECT count(*) AS n FROM protocol_memberships WHERE protocol_code=$1 AND user_id=$2', [unlisted.code, member.id])).rows[0].n), 0,
    'cross-branch Start created or authorized a community membership');

  const refusedJoin = await memberHttp(`/api/protocols/${published.code}/community/join`, {
    method: 'POST', body: { version_id: published.code, disclosure_version: 'stale-or-missing' },
  });
  assert.equal(refusedJoin.status, 400, `privacy-less join was accepted: ${refusedJoin.text}`);
  const joined = expectStatus(await memberHttp(`/api/protocols/${published.code}/community/join`, {
    method: 'POST', body: { version_id: published.code, disclosure_version: 'protocol-community-v1' },
  }), 200, 'explicit community join');
  assert.equal(joined.role, 'member');
  const joinedRow = (await pool.query('SELECT role,disclosure_version FROM protocol_memberships WHERE protocol_code=$1 AND user_id=$2', [published.code, member.id])).rows[0];
  assert.deepEqual(joinedRow, { role: 'member', disclosure_version: 'protocol-community-v1' });

  const wrongVersion = await memberHttp(`/api/protocols/${published.code}/community`, {
    method: 'POST', body: { version_id: unlisted.code, context_kind: 'checkin', context_key: 'day:1', body: 'First check-in.' },
  });
  assert.equal(wrongVersion.status, 409, `cross-version post was accepted: ${wrongVersion.text}`);
  const posted = expectStatus(await memberHttp(`/api/protocols/${published.code}/community`, {
    method: 'POST', body: { version_id: published.code, context_kind: 'checkin', context_key: 'day:1', body: 'First check-in.' },
  }), 200, 'version-bound post');
  assert.equal(posted.post.version_code, published.code);
  assert.equal(posted.post.context_kind, 'checkin');

  const promoted = expectStatus(await ownerHttp(`/api/protocols/${published.code}/members/${encodeURIComponent(member.username)}/role`, {
    method: 'POST', body: { role: 'moderator' },
  }), 200, 'promote member');
  assert.equal(promoted.role, 'moderator');
  const demoted = expectStatus(await ownerHttp(`/api/protocols/${published.code}/members/${encodeURIComponent(member.username)}/role`, {
    method: 'POST', body: { role: 'member' },
  }), 200, 'demote member');
  assert.equal(demoted.role, 'member');
  const auditKinds = (await pool.query('SELECT kind FROM protocol_community_events WHERE protocol_code=$1 ORDER BY id', [published.code])).rows.map((row) => row.kind);
  assert.deepEqual(auditKinds, ['role_granted', 'role_revoked']);

  const left = expectStatus(await memberHttp(`/api/protocols/${published.code}/community/leave`, { method: 'DELETE', body: {} }), 200, 'leave community');
  assert.equal(left.left, true);
  community = expectStatus(await memberHttp(`/api/protocols/${published.code}/community`), 200, 'community after leaving');
  assert.equal(community.role, null);
  assert.equal(Number((await pool.query('SELECT count(*) AS n FROM protocol_memberships WHERE protocol_code=$1 AND user_id=$2', [published.code, member.id])).rows[0].n), 0);

  // The legacy public like writer belongs to PUBLIC_COMMUNITY, which this release intentionally
  // keeps off. Seed the exact account participant key so erasure is still tested without widening
  // the product surface merely to manufacture the fixture.
  await pool.query('INSERT INTO protocol_likes(code,voter_key) VALUES($1,$2)', [published.code, `u:${member.id}`]);
  assert.equal(Number((await pool.query('SELECT count(*) AS n FROM protocol_likes WHERE code=$1 AND voter_key=$2', [published.code, `u:${member.id}`])).rows[0].n), 1);

  expectStatus(await ownerHttp(`/api/protocols/${published.code}/withdraw`, { method: 'POST', body: {} }), 200, 'withdraw protocol');
  const joinWithdrawn = await memberHttp(`/api/protocols/${published.code}/community/join`, {
    method: 'POST', body: { version_id: published.code, disclosure_version: 'protocol-community-v1' },
  });
  assert.equal(joinWithdrawn.status, 409, `withdrawn branch accepted a new member: ${joinWithdrawn.text}`);
  const postWithdrawn = await memberHttp(`/api/protocols/${published.code}/community`, {
    method: 'POST', body: { version_id: published.code, context_kind: 'general', body: 'Should be closed.' },
  });
  assert.equal(postWithdrawn.status, 409, `withdrawn branch accepted a new post: ${postWithdrawn.text}`);

  expectStatus(await memberHttp('/api/account', { method: 'DELETE', body: { confirm: 'DELETE' } }), 200, 'account erasure');
  assert.equal(Number((await pool.query('SELECT count(*) AS n FROM protocol_likes WHERE voter_key=$1', [`u:${member.id}`])).rows[0].n), 0,
    'account erasure retained the protocol-like participant key');
  assert.equal(Number((await pool.query('SELECT count(*) AS n FROM users WHERE id=$1', [member.id])).rows[0].n), 0);

  console.log(`[release db] OK on ${guarded.name}: atomic publish + owner, explicit discovery, exact SSR/start, private Start, disclosed version-bound community, moderation/leave/withdrawal, voter-key erasure.`);
} catch (error) {
  failure = error;
} finally {
  try { await cleanup(); } catch (cleanupError) {
    failure = failure ? new AggregateError([failure, cleanupError], 'release DB test and cleanup both failed') : cleanupError;
  }
}

if (failure) throw failure;
