#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const rewards = (src.match(/const REWARDS = \{([^}]*)\}/) || [])[1] || '';
const award = (src.match(/async function award\([^)]*\) \{([\s\S]*?)\n\}/) || [])[1] || '';
const paid = [...rewards.matchAll(/([a-z_]+)\s*:\s*\d+/g)].map((m) => m[1]).sort();
const expected = ['helpful', 'liked', 'merged', 'proposal'];

if (JSON.stringify(paid) !== JSON.stringify(expected)) {
  throw new Error(`reward allowlist drifted: ${paid.join(', ') || '(empty)'}`);
}
if (!/hasOwnProperty\.call\(REWARDS,\s*kind\)/.test(award)) {
  throw new Error('award() does not reject an event kind outside REWARDS before accepting caller-supplied points');
}
const guard = award.indexOf('hasOwnProperty.call(REWARDS, kind)');
const explicit = award.indexOf('pts != null');
if (guard < 0 || explicit < 0 || guard > explicit) {
  throw new Error('award() reads caller-supplied points before enforcing the reward allowlist');
}

console.log(`[rewards] confinement OK — ${paid.join(', ')} only; explicit point values cannot mint a new event kind.`);
