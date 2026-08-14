#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const db = fs.readFileSync(path.join(root, 'db.js'), 'utf8');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const app = fs.readFileSync(path.join(root, 'site/app.js'), 'utf8');
const backup = fs.readFileSync(path.join(root, 'scripts/backup-community.js'), 'utf8');
const fail = (message) => { throw new Error(message); };

for (const table of ['protocol_memberships', 'protocol_posts', 'protocol_community_events']) {
  if (!new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`).test(db)) fail(`missing ${table}`);
}
for (const field of ['protocol_code', 'version_code', 'context_kind', 'context_key', 'parent_id']) {
  if (!new RegExp(`\\b${field}\\b`).test(db)) fail(`protocol discussion lost ${field}`);
}
if (!/protocolCommunity:\s*process\.env\.PROTOCOL_COMMUNITY\s*===\s*'1'/.test(server)) fail('protocol community is not fail-closed behind its own flag');
if (!/seg\[2\]\s*===\s*'community'/.test(server)) fail('missing branch community endpoint');
if (!/version\s*!==\s*code/.test(server)) fail('posting does not refuse version drift');
if (!/Start this plan before posting/.test(server)) fail('posting does not require branch membership');
if (!/role_granted/.test(server) || !/role_revoked/.test(server) || !/post_removed/.test(server)) fail('moderation actions are not audited');
const block = (server.match(/Branch discussion is a narrow accountability surface[\s\S]*?\/\/ One clone per browser/) || [''])[0];
if (/award\s*\(/.test(block)) fail('posting or moderation mints reputation directly');
const clone = (server.match(/\/\/ One clone per browser[\s\S]*?\/\/ Read one\./) || [''])[0];
if (/INSERT INTO protocol_memberships/.test(clone)) fail('starting a health plan silently exposes account membership to its creator or moderators');
const joinAt = block.indexOf("seg[3] === 'join'");
const leaveAt = block.indexOf("seg[3] === 'leave'", joinAt);
const joinBlock = joinAt >= 0 && leaveAt > joinAt ? block.slice(joinAt, leaveAt) : '';
if (!joinBlock) fail('discussion has no separate, explicit join boundary');
if (!/seg\[3\]\s*===\s*'leave'[\s\S]*?method\s*===\s*'DELETE'/.test(block)) fail('discussion has no explicit Leave boundary');
if (!/role === 'owner'[\s\S]*?cannot leave it/.test(block)) fail('the creator-owner Leave behavior is not explicit');
if (!/disclosure_version\s*!==\s*'protocol-community-v1'/.test(joinBlock)) fail('discussion join does not require the current privacy disclosure');
if (!/const joined = await db\.transaction\(async \(q\) =>/.test(joinBlock)) fail('discussion join checks and membership write are not atomic');
if (!/SELECT 1 FROM studio_clones WHERE code=\$1 AND voter_key=\$2/.test(joinBlock)) fail('discussion join does not require an exact Start record');
if (!/Start this exact plan before joining its discussion/.test(joinBlock)) fail('discussion join does not explain the exact Start boundary');
if (!/SELECT code FROM studio_protocols WHERE code=\$1 AND status='published' FOR UPDATE[\s\S]*?SELECT 1 FROM studio_clones[\s\S]*?INSERT INTO protocol_memberships/.test(joinBlock)) {
  fail('live-version, exact Start, and membership checks are not ordered inside the join boundary');
}
if (!/disclosure_version TEXT/.test(db)) fail('membership does not retain which privacy disclosure the member accepted');
if (!/creator and moderators will see your username and that you joined this health plan/.test(app)) fail('the client does not disclose the health-context visibility before joining');
if (!/Everyone can read your username, message, and that it belongs to this plan version/.test(app)) fail('the composer omits the just-in-time public posting disclosure');
if (!/response\.status === 'published'/.test(app) || !/This branch was withdrawn\./.test(app)) fail('a withdrawn discussion can still render a Join/post path');
if (!/branch-community-leave/.test(app) || !/leaveProtocolCommunity/.test(app)) fail('discussion membership has no client Leave control');
if (!/branch-members-manage/.test(app) || !/Make moderator/.test(app) || !/Remove moderator/.test(app)) fail('the creator cannot promote and demote discussion moderators');
if (!/COALESCE\(u\.public_profile_enabled,false\) AS profile_visible/.test(block)) fail('discussion posts do not carry separate profile visibility consent');
if (!/p\.profile_visible[\s\S]*?<a class="comment-user"/.test(app)) fail('discussion handles are linked without checking profile visibility');
if (!/db\.transaction\(async \(q\) => \{[\s\S]*?post_removed/.test(block)) fail('moderator removal and its audit event are not atomic');
if (!/db\.transaction\(async \(q\) => \{[\s\S]*?role_granted/.test(block)) fail('role changes and their audit events are not atomic');
if (!/actor_user_id (?:INTEGER|BIGINT) REFERENCES users\(id\) ON DELETE SET NULL/.test(db)) fail('account deletion erases moderation history instead of anonymising its actor');
if (!/DELETE FROM protocol_likes WHERE voter_key=\$1/.test(server)) fail('account erasure leaves the account participant key in protocol likes');
if (/protocol_posts\s*:/.test(backup) || /protocol_memberships\s*:/.test(backup) || /protocol_community_events\s*:/.test(backup)) {
  fail('health discussion bodies, memberships or moderation events are copied into permanent Git history');
}

console.log('[protocol community] contract OK — explicit disclosed join, exact branch/version context, transactional moderation audit, erasable health discussions, no post-for-points path.');
