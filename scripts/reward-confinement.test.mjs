#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const app = fs.readFileSync(path.join(root, 'site', 'app.js'), 'utf8');
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

// Accepted-help earning is not a live capability. A contained ledger may remain in the backend,
// but /me must not advertise a balance, a shop, or a progression system nobody can truthfully use.
const profileProgression = [
  ['Your mark', 'the private profile still renders the avatar shop'],
  ['avatar-shop', 'the private profile still mounts the avatar shop'],
  ['points to spend', 'the private profile still advertises a spendable balance'],
  ['The points above', 'the account copy still explains a points total that should not be visible'],
  ['mountAvatarShop', 'dead client code can restore the contained shop without an explicit capability decision'],
  ['/api/avatar', 'the client still calls the contained avatar economy'],
];
for (const [needle, why] of profileProgression) {
  if (app.includes(needle)) throw new Error(why);
}

console.log(`[rewards] confinement OK — ${paid.join(', ')} only; explicit values cannot mint a new event kind; /me exposes no points or avatar shop.`);
