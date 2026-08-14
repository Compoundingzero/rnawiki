#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const {
  EXPECTED_DB_ROLE,
  EXPECTED_VIEW,
  PUBLIC_EXPORTS,
  ROLE_SQL,
  PRIVILEGE_SQL,
  SNAPSHOT_README,
  validateRows,
  exportPublicSnapshot,
  verifySnapshot,
} = require('./backup-community.js');

assert.equal(EXPECTED_DB_ROLE, 'rnawiki_public_snapshot_v1');
assert.equal(EXPECTED_VIEW, 'public_git_vote_snapshot_v1');
assert.deepEqual(Object.keys(PUBLIC_EXPORTS), ['vote_totals'],
  'Git export allowlist must stay narrow and explicit');
assert.match(PUBLIC_EXPORTS.vote_totals, /FROM public\.public_git_vote_snapshot_v1/);
assert.doesNotMatch(PUBLIC_EXPORTS.vote_totals,
  /\b(?:users|votes|comments|edits|studio_protocols|protocol_memberships|protocol_posts|experiments)\b/i,
  'the exporter may read only the dedicated coarse public view');
assert.match(SNAPSHOT_README, /This is not a database backup/i);
assert.match(SNAPSHOT_README, /does not test a Postgres restore/i);

assert.deepEqual(validateRows('vote_totals', [
  { target_id: 'fat-loss:metabolic-adaptation:move', up_bucket: 20, down_bucket: 0 },
]), [
  { target_id: 'fat-loss:metabolic-adaptation:move', up_bucket: 20, down_bucket: 0 },
]);
for (const bad of [
  [{ target_id: 'fatigue:route:move', up_bucket: 10, down_bucket: 0, username: 'leak' }],
  [{ target_id: 'fork:42', up_bucket: 10, down_bucket: 0 }],
  [{ target_id: 'fatigue:route:move', up_bucket: 9, down_bucket: 0 }],
  [{ target_id: 'fatigue:route:move', up_bucket: 10, down_bucket: -10 }],
  [
    { target_id: 'fatigue:route:move', up_bucket: 10, down_bucket: 0 },
    { target_id: 'fatigue:route:move', up_bucket: 20, down_bucket: 0 },
  ],
]) {
  assert.throws(() => validateRows('vote_totals', bad), /fields outside|non-canonical|ten-vote bucket|repeats target/);
}

const source = fs.readFileSync(path.join(root, 'scripts/backup-community.js'), 'utf8');
assert.match(source, /rejectUnauthorized:\s*true/);
assert.match(source, /process\.env\.PUBLIC_SNAPSHOT_DATABASE_URL/);
assert.doesNotMatch(source, /process\.env\.DATABASE_URL/);

const workflow = fs.readFileSync(path.join(root, '.github/workflows/backup-community.yml'), 'utf8');
assert.match(workflow, /run: npm run test:backup/);
assert.match(workflow, /permissions:\s*\n\s*contents: read/);
assert.doesNotMatch(workflow, /schedule:/,
  'no schedule may claim backups exist before the dedicated view and verified destination do');
assert.doesNotMatch(workflow, /BACKUP_DEPLOY_KEY|rnawiki-backups\.git|ssh-keyscan/);
assert.match(workflow, /PUBLIC_SNAPSHOT_DATABASE_URL/);
assert.match(workflow, /PUBLIC_SNAPSHOT_REPO_TOKEN/);
assert.match(workflow, /visibility.*private|private.*visibility/s);
assert.match(workflow, /rnawiki-public-snapshot-v1/);

const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
assert.equal(packageJson.scripts['test:backup'], 'node scripts/backup-contract.test.mjs');
assert.match(packageJson.scripts.gate, /npm run test:backup/,
  'the backup privacy contract must run on every release');

const recoveryDoc = fs.readFileSync(path.join(root, 'docs/BACKUP_RECOVERY.md'), 'utf8');
assert.match(recoveryDoc, /Railway.*point-in-time recovery|point-in-time recovery.*Railway/is);
assert.match(recoveryDoc, /No restore test is claimed/i);
assert.match(recoveryDoc, /legacy.*key.*rotat|rotat.*legacy.*key/is);
assert.match(recoveryDoc, /not enabled|not configured|verify.*enabled/is);

function fakePool({ failExport = false, roleOverride = {}, privilegeRows } = {}) {
  const queries = [];
  let released = false;
  let ended = false;
  const sampleRows = [{ target_id: 'fatigue:mitochondria:move', up_bucket: 20, down_bucket: 10 }];
  const defaultPrivileges = [{
    schema_name: 'public', relation_name: EXPECTED_VIEW, can_select: true,
    can_insert: false, can_update: false, can_delete: false, can_truncate: false,
    can_references: false, can_trigger: false,
  }];
  const client = {
    async query(sql) {
      queries.push(sql);
      if (sql === ROLE_SQL) return { rows: [{
        role: EXPECTED_DB_ROLE, rolsuper: false, rolcreaterole: false, roldbcreated: false,
        rolcreatedb: false, rolreplication: false, rolbypassrls: false,
        has_memberships: false, ...roleOverride,
      }], rowCount: 1 };
      if (sql === PRIVILEGE_SQL) return { rows: privilegeRows || defaultPrivileges,
        rowCount: (privilegeRows || defaultPrivileges).length };
      if (sql === PUBLIC_EXPORTS.vote_totals) {
        if (failExport) throw new Error('fixture view unavailable');
        return { rows: sampleRows, rowCount: sampleRows.length };
      }
      return { rows: [], rowCount: 0 };
    },
    release() { released = true; },
  };
  const pool = {
    async connect() { return client; },
    async end() { ended = true; },
  };
  return { pool, queries, state: () => ({ released, ended }) };
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'rnawiki-public-snapshot-'));
const outDir = path.join(tempRoot, 'backups');
try {
  const firstFixture = fakePool();
  await exportPublicSnapshot({
    url: 'postgres://fixture', outDir, poolFactory: () => firstFixture.pool,
  });
  const firstManifest = verifySnapshot(outDir);
  assert.equal(firstManifest.counts.vote_totals, 1);
  assert.ok(firstFixture.queries.some((sql) => /^BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY$/.test(sql)));
  assert.ok(firstFixture.queries.includes(ROLE_SQL));
  assert.ok(firstFixture.queries.includes(PRIVILEGE_SQL));
  assert.ok(firstFixture.queries.includes('COMMIT'));
  assert.deepEqual(firstFixture.state(), { released: true, ended: true });
  assert.deepEqual(fs.readdirSync(outDir).sort(), ['README.md', 'manifest.json', 'vote_totals.json']);

  const firstFiles = Object.fromEntries(fs.readdirSync(outDir).map((name) => [
    name, fs.readFileSync(path.join(outDir, name), 'utf8'),
  ]));
  const secondFixture = fakePool();
  await exportPublicSnapshot({
    url: 'postgres://fixture', outDir, poolFactory: () => secondFixture.pool,
  });
  const secondFiles = Object.fromEntries(fs.readdirSync(outDir).map((name) => [
    name, fs.readFileSync(path.join(outDir, name), 'utf8'),
  ]));
  assert.deepEqual(secondFiles, firstFiles, 'unchanged data must produce a byte-stable snapshot');

  const failedFixture = fakePool({ failExport: true });
  await assert.rejects(
    exportPublicSnapshot({ url: 'postgres://fixture', outDir, poolFactory: () => failedFixture.pool }),
    /required export vote_totals failed: fixture view unavailable/,
  );
  assert.ok(failedFixture.queries.includes('ROLLBACK'));
  assert.ok(!failedFixture.queries.includes('COMMIT'));
  assert.deepEqual(failedFixture.state(), { released: true, ended: true });
  const afterFailure = Object.fromEntries(fs.readdirSync(outDir).map((name) => [
    name, fs.readFileSync(path.join(outDir, name), 'utf8'),
  ]));
  assert.deepEqual(afterFailure, firstFiles, 'a failed required export must preserve the last complete snapshot');

  const superFixture = fakePool({ roleOverride: { rolsuper: true } });
  await assert.rejects(
    exportPublicSnapshot({ url: 'postgres://fixture', outDir, poolFactory: () => superFixture.pool }),
    /database role is not the restricted/,
  );
  assert.ok(!superFixture.queries.includes(PUBLIC_EXPORTS.vote_totals));

  const broadFixture = fakePool({ privilegeRows: [
    {
      schema_name: 'public', relation_name: EXPECTED_VIEW, can_select: true,
      can_insert: false, can_update: false, can_delete: false, can_truncate: false,
      can_references: false, can_trigger: false,
    },
    {
      schema_name: 'public', relation_name: 'users', can_select: true,
      can_insert: false, can_update: false, can_delete: false, can_truncate: false,
      can_references: false, can_trigger: false,
    },
  ] });
  await assert.rejects(
    exportPublicSnapshot({ url: 'postgres://fixture', outDir, poolFactory: () => broadFixture.pool }),
    /privileges on exactly one public relation/,
  );
  assert.ok(!broadFixture.queries.includes(PUBLIC_EXPORTS.vote_totals));

  let poolCreated = false;
  await assert.rejects(
    exportPublicSnapshot({ url: '', outDir, poolFactory: () => { poolCreated = true; } }),
    /PUBLIC_SNAPSHOT_DATABASE_URL is required/,
  );
  await assert.rejects(
    exportPublicSnapshot({
      url: 'postgres://fixture?sslmode=no-verify', outDir,
      poolFactory: () => { poolCreated = true; },
    }),
    /must not weaken TLS verification/,
  );
  assert.equal(poolCreated, false);

  fs.writeFileSync(path.join(outDir, 'users.json'), '[]\n');
  assert.throws(() => verifySnapshot(outDir), /file set is not allowlisted/);
  fs.rmSync(path.join(outDir, 'users.json'));
  fs.writeFileSync(path.join(outDir, 'vote_totals.json'), '[]\n');
  assert.throws(() => verifySnapshot(outDir), /count does not match|checksum does not match/);
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

console.log('[backup contract] coarse public view only, restricted role, verified TLS, atomic completeness and fail-closed export OK');
