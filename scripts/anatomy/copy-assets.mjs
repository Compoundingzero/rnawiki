// scripts/anatomy/copy-assets.mjs — stage the 3D anatomy assets into the served tree at boot.
//
// WHY THIS EXISTS
//   server.js serves static files from  path.join(__dirname, 'site')  (DIR, server.js:9).
//   The region GLBs are COMMITTED under assets/anatomy/*.glb (assets/ is git-tracked, so they ship to
//   Railway), but the engine fetches them from '/anatomy/<region>.glb' — i.e. site/anatomy/. That
//   site/ subfolder is build output, not committed, so it must be (re)created on every boot. This
//   script does that copy. It is meant to run in `prestart`, alongside parse.js / prerender.js.
//
//   The vendored Three.js (site/vendor/three/*) is committed source that ALREADY lives inside the
//   served tree (site/), so it needs no copy — it is served in place at /vendor/three/*. This script
//   therefore only ASSERTS those five files exist (fail-loud, matching the codebase's "no empty
//   success" rule) and does not self-copy.
//
// FAIL-LOUD: if assets/anatomy holds no GLB, or a vendored Three.js file is missing, exit(1) so the
// deploy stops rather than shipping a body route that 404s its geometry or its loader.
//
// RUN:  node scripts/anatomy/copy-assets.mjs         (from repo root, as prestart does)

import { readdirSync, existsSync, mkdirSync, cpSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
  cpSync(path.join(SRC_GLB, f), path.join(DST_GLB, f));
  const kb = (statSync(path.join(DST_GLB, f)).size / 1024).toFixed(0);
  console.log(`  anatomy/${f}  (${kb} KB)  ->  site/anatomy/${f}`);
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
