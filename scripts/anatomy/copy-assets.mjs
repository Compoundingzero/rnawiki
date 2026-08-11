// scripts/anatomy/copy-assets.mjs — stage the 3D anatomy assets into the served tree at boot.
//
// WHY THIS EXISTS
//   server.js serves static files from  path.join(__dirname, 'site')  (DIR, server.js:9).
//   The region GLBs are COMMITTED under assets/anatomy/*.glb (assets/ is git-tracked, so they ship to
//   Railway), but the engine fetches them from '/anatomy/<region>.glb' — i.e. site/anatomy/. That
//   site/ subfolder is build output, not committed, so it must be (re)created on every boot. This
//   script does that copy. It runs in both `build` (so CI/smoke inspect the complete served tree)
//   and `prestart` (so every production boot restages the ignored output directory).
//
//   The vendored Three.js (site/vendor/three/*) is committed source that ALREADY lives inside the
//   served tree (site/), so it needs no copy — it is served in place at /vendor/three/*. This script
//   therefore only ASSERTS those five files exist (fail-loud, matching the codebase's "no empty
//   success" rule) and does not self-copy.
//
// FAIL-LOUD: if assets/anatomy holds no GLB, or a vendored Three.js file is missing, exit(1) so the
// deploy stops rather than shipping a body route that 404s its geometry or its loader.
//
// RUN:  node scripts/anatomy/copy-assets.mjs         (from repo root, as build/prestart do)

import { readdirSync, existsSync, mkdirSync, cpSync, statSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// GATE: read a GLB's JSON chunk and assert its DEFAULT scene actually contains the whole region, with
// FMA-named nodes. This exists because a real bug shipped: the leg build emitted 19 single-node scenes
// (one per part) and the loader shows ONLY the default scene — so the model was a lone muscle with no
// bones and no movement, and every pick/animation silently no-op'd because names didn't match either.
// Prove the gate by pointing it at that old file: default scene had 1 node → this throws. (2026-07-31)
function assertGlbUsable(file, buf) {
  if (buf.readUInt32LE(0) !== 0x46546c67) die(`${file}: not a GLB (bad magic).`);
  const jsonLen = buf.readUInt32LE(12);
  let j;
  try { j = JSON.parse(buf.slice(20, 20 + jsonLen).toString('utf8')); }
  catch (e) { die(`${file}: unreadable JSON chunk (${e.message}).`); }
  const nodes = j.nodes || [];
  const sceneIdx = (typeof j.scene === 'number') ? j.scene : 0;
  const scene = (j.scenes || [])[sceneIdx];
  if (!scene) die(`${file}: no default scene.`);
  const rootCount = (scene.nodes || []).length;
  // a region model is many parts; a default scene with 0–1 roots is the "lone muscle" regression.
  if (rootCount < 2) die(`${file}: default scene has ${rootCount} node(s) — expected the whole region (many meshes). The build likely wrote one scene per part; merge them into a single scene.`);
  const fmaNamed = nodes.filter((n) => /\d{3,}/.test(String(n.name || ''))).length;
  if (fmaNamed < 2) die(`${file}: nodes are not FMA-named (${fmaNamed} with an id) — the engine keys picks on FMA ids in node names.`);
  return { rootCount, nodeCount: nodes.length, fmaNamed };
}

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const SRC_GLB = path.join(REPO, 'assets', 'anatomy');
const DST_GLB = path.join(REPO, 'site', 'anatomy');
const VENDOR = path.join(REPO, 'site', 'vendor', 'three');

const die = (m) => { console.error(`\n✗ copy-assets: ${m}\n`); process.exit(1); };

// 1. GLBs: assets/anatomy/*.glb  ->  site/anatomy/*.glb
if (!existsSync(SRC_GLB)) die(`no ${path.relative(REPO, SRC_GLB)} — build a region GLB first (scripts/anatomy/build-leg.mjs).`);
const glbs = readdirSync(SRC_GLB).filter((f) => f.endsWith('.glb'));
if (!glbs.length) die(`no *.glb in ${path.relative(REPO, SRC_GLB)} — nothing to serve (run npm run build:leg in scripts/anatomy).`);
mkdirSync(DST_GLB, { recursive: true });
for (const f of glbs) {
  const src = path.join(SRC_GLB, f);
  const info = assertGlbUsable(f, readFileSync(src)); // gate BEFORE staging — never serve a broken model
  cpSync(src, path.join(DST_GLB, f));
  const kb = (statSync(path.join(DST_GLB, f)).size / 1024).toFixed(0);
  console.log(`  anatomy/${f}  (${kb} KB, ${info.rootCount} scene-roots / ${info.nodeCount} nodes)  ->  site/anatomy/${f}`);
}

// 2. Vendored Three.js: assert the served-in-place files exist (no copy — they are committed under site/).
const REQUIRED_VENDOR = [
  'three.module.js', 'GLTFLoader.js', 'OrbitControls.js',
  'meshopt_decoder.module.js', 'BufferGeometryUtils.js',
];
const missing = REQUIRED_VENDOR.filter((f) => !existsSync(path.join(VENDOR, f)));
if (missing.length) die(`vendored Three.js missing in site/vendor/three/: ${missing.join(', ')} — the body route's module graph will 404.`);
console.log(`  vendor/three: ${REQUIRED_VENDOR.length} files present (served in place at /vendor/three/).`);

console.log(`✓ copy-assets: ${glbs.length} GLB(s) staged into site/anatomy/, Three.js vendor verified.`);
