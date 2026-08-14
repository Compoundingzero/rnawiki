#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const db = read('db.js');
const server = read('server.js');
const app = read('site/app.js');
const safety = read('studio-safety.js');
const prerender = read('build/prerender.js');
const between = (text, start, end) => {
  const a = text.indexOf(start), b = text.indexOf(end, a + start.length);
  assert.ok(a >= 0 && b > a, `missing contract block: ${start}`);
  return text.slice(a, b);
};

// Existing published rows predate discovery consent. They must stay link-only after migration.
assert.match(db, /ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'unlisted'/);
assert.match(db, /CHECK \(visibility IN \('unlisted','public'\)\)/);
assert.match(db, /OLD\.visibility='public' AND NEW\.visibility='unlisted'/,
  'the immutable trigger must permit the privacy-reducing public → unlisted transition');
assert.doesNotMatch(db, /OLD\.visibility='unlisted' AND NEW\.visibility='public'/,
  'an old or link-only version must never become discoverable in place');

// Discovery fails closed independently from discussions, profiles and direct links.
assert.match(server, /creatorDiscovery:\s*process\.env\.CREATOR_DISCOVERY === '1'/);
assert.match(server, /creatorDiscovery:\s*FEATURES\.creatorDiscovery/);
assert.match(server, /!FEATURES\.creatorDiscovery && seg\[0\] === 'protocols' && discoveryRoutes\.has\(seg\[1\]\)/);
assert.match(app, /if \(!topicId \|\| !featureOn\('creatorDiscovery'\)\) return;/);

// One canonical, batched route query. No legacy alias or N-per-route request may enter this path.
const routeIndex = between(server,
  '// ---- CREATOR BRANCHES FOR CANONICAL TOPIC ROUTES',
  '// ---- CREATOR VARIANTS FOR ONE ROOT CAUSE');
assert.match(routeIndex, /qp\.getAll\('route_id'\)/);
assert.match(routeIndex, /meta\.routeId !== routeId/);
assert.match(routeIndex, /p\.status='published' AND p\.visibility='public'/);
assert.match(routeIndex, /p\.topic_id=\$1 AND p\.route_id=ANY\(\$2::text\[\]\)/);
assert.doesNotMatch(routeIndex, /p\.base_pid\s*=|p\.base_rcid\s*=/,
  'canonical discovery must not borrow a legacy root alias');
const routeMount = between(app, 'async function mountCreatorRouteIndex', '// Mirrors overlapWarnings()');
assert.equal((routeMount.match(/api\.creatorRouteIndex\(/g) || []).length, 1,
  'one topic page must make one batched discovery call');
assert.match(routeMount, /No plan yet\./);
assert.match(routeMount, /Create one/);
assert.match(routeMount, /branch\.profile_visible\s*\?/,
  'a handle may become a profile link only with separate profile consent');

// Every public index filters on visibility. The direct document deliberately does not.
for (const marker of [
  "seg[1] === 'variants'", "seg[1] === 'new'", "seg[1] === 'used'",
]) {
  const at = server.indexOf(marker);
  assert.ok(at >= 0 && /visibility='public'/.test(server.slice(at, at + 5000)), `${marker} exposes link-only rows`);
}
const readOne = between(server, '// Read one. Resolves the remix chain', '// --- protocol forks');
assert.match(readOne, /WHERE p\.code=\$1/);
assert.doesNotMatch(readOne, /visibility='public'/,
  'direct /p/<code> reads must keep working for unlisted published rows');

// Publish and remix require an explicit, initially empty choice and persist it. Discovery consent
// can later be withdrawn without withdrawing or breaking the direct plan document.
const visibilitySheet = between(app, '<fieldset class="st-vis">', '</fieldset>');
assert.match(visibilitySheet, /value="unlisted"/);
assert.match(visibilitySheet, /value="public"/);
assert.doesNotMatch(visibilitySheet, /checked/);
assert.match(app, /status: 'published', visibility/);
assert.ok((server.match(/b\.visibility !== 'unlisted' && b\.visibility !== 'public'/g) || []).length >= 2,
  'both fresh publish and remix must reject an omitted visibility choice');
assert.match(server, /seg\[2\] === 'visibility'[\s\S]*?b\.visibility !== 'unlisted'/);
assert.match(app, /Remove from topic/);
assert.match(app, /api\.unlistProtocol/);
assert.match(app, /Published[\s\S]*Continue in Studio[\s\S]*View plan/,
  'publishing one route must offer an in-Studio continuation instead of ejecting the creator');
assert.match(app, /#st-pstay[\s\S]*stPaint\(\)/);
assert.match(app, /#st-pview[\s\S]*navigate\('\/p\/' \+ r\.code\)/,
  'viewing the published plan must remain a deliberate second action');
assert.ok((app.match(/f\.rule === 'interaction-unknown'/g) || []).length >= 3,
  'Studio must render, prioritize and explain the current unknown-pair refusal rule');
assert.doesNotMatch(app, /f\.rule === 'interaction-coverage'/,
  'Studio still handles the deleted interaction-coverage rule name');

// Row + owner and idempotency row + counter are single commits. Likes and starts lock a still-live
// source immediately before their dependent insert, so withdrawal cannot split the invariant.
const freshPublish = between(server,
  "if (seg[0] === 'protocols' && !seg[1] && method === 'POST')",
  '// A REMIX STORES ONLY ITS DIFFERENCES');
assert.match(freshPublish, /db\.transaction\(async \(q\)/);
assert.match(freshPublish, /INSERT INTO protocol_memberships/);
const remix = between(server, '// A REMIX STORES ONLY ITS DIFFERENCES', '// MOST USED. Never');
assert.match(remix, /db\.transaction\(async \(q\)/);
assert.match(remix, /INSERT INTO protocol_memberships/);
const like = between(server, '// One like per browser per protocol', '// Recently published protocols');
assert.match(like, /db\.transaction\(async \(q\)/);
assert.match(like, /status='published' FOR UPDATE/);
assert.match(like, /INSERT INTO protocol_likes[\s\S]*UPDATE studio_protocols SET likes=likes\+1/);
const clone = between(server, '// One clone per browser, no account', '// Read one. Resolves the remix chain');
assert.match(clone, /db\.transaction\(async \(q\)/);
assert.match(clone, /status='published' FOR UPDATE/);
assert.match(clone, /INSERT INTO studio_clones[\s\S]*UPDATE studio_protocols SET clones=clones\+1/);

// Official starts freeze only route-authored material and content-address it. No generated
// movement/supplement catalogue may enter the exact Today snapshot.
const official = between(app, 'function officialExactSnapshot', 'function creatorStepSnapshot');
for (const authored of ['phase1', 'keystone', 'prescription', 'anchor_exercises', 'compounds', 'nutrient_targets']) {
  assert.match(official, new RegExp(authored), `official snapshot lost authored ${authored}`);
}
assert.match(official, /exactContentHash/);
assert.match(official, /snapshot_hash/);
assert.doesNotMatch(official, /generateProtocol|buildSteps|PLAN_FUNCTIONS/);
const exactToday = between(app, 'function renderExactToday', 'async function renderPlan');
assert.doesNotMatch(exactToday, /mergedPlan|generateProtocol|buildSteps/);
assert.match(exactToday, /exactSourceValid !== '1'/,
  'review-required creator actions must stay unable to record completion');
assert.match(app, /old\.snapshot_hash && lx\.snapshot_hash && old\.snapshot_hash !== lx\.snapshot_hash/);
assert.match(app, /sx\[at\] = Object\.assign\(\{\}, old, \{ log:/,
  'a same-tuple hash conflict must preserve the server snapshot and merge only logs');
assert.match(app, /exactSyncConflicts/);
assert.match(safety, /Set both movement sets and reps before publishing/);

// The generator stamps every one of the 229 canonical routes, including routes with no official
// root. The generated pages are checked because a correct helper that is never emitted is not a UI.
assert.match(prerender, /function creatorRouteSlot/);
const context = vm.createContext({ window: {}, console });
vm.runInContext(read('site/data.js'), context, { filename: 'site/data.js' });
const problems = context.window.RNAWIKI_DATA.graph.problems || [];
const expected = new Set(problems.flatMap((problem) => (problem.routes || []).map((route) => `${problem.id}/${route.id}`)));
assert.equal(expected.size, 229);
const actual = new Set(); let mounts = 0;
for (const problem of problems) {
  const html = read(`site/problem/${problem.id}.html`);
  for (const match of html.matchAll(/class="creator-route-index"[^>]*data-topic-id="([^"]+)"[^>]*data-route-id="([^"]+)"/g)) {
    mounts++; actual.add(`${match[1]}/${match[2]}`);
  }
}
assert.equal(mounts, expected.size, 'each canonical route needs exactly one discovery mount');
assert.deepEqual(actual, expected, 'generated problem pages must cover every canonical topic/route pair');

console.log('[creator discovery] contract OK — explicit listing consent, public-only canonical index, reversible unlisting, exact content-addressed starts, atomic counters, 229 route mounts.');
