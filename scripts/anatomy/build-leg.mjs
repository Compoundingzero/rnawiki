// scripts/anatomy/build-leg.mjs — region-GLB pipeline for the RNAwiki 3D anatomy engine.
//
// PIPELINE (leg first; same script serves arm/trunk once their manifests exist):
//   1. read <region>.manifest.json  → the FMA-keyed part list (muscles + bones + layer)
//   2. obj2gltf each part's BodyParts3D OBJ  → a one-mesh glb
//   3. NAME each part's node by its FMA id + tag node.extras.layer   ← the join + the layer slider
//   4. gltf-transform merge → weld → simplify(~4k faces) → meshopt   ← the size + perf budget
//   5. write assets/anatomy/<region>.glb  (+ <region>.meshmap.json for QA)
//
// This is BUILD-TIME dev tooling. It runs from scripts/anatomy/ against its OWN package.json so the
// server's runtime deps stay pg + resvg. Output GLBs are committed under assets/anatomy/ and copied
// into the ephemeral site/ by the prestart step documented in README.md. Nothing here runs on Railway.
//
// SETUP:  cd scripts/anatomy && npm install
// RUN:    npm run build:leg     (or: node build-leg.mjs leg)
//
// BEFORE IT WILL PRODUCE ANYTHING you must (a) download the BodyParts3D archive and (b) fill each
// part's `src` (its OBJ filename) and confirm its `fma` against the official FMAID↔name map. The
// script fails LOUDLY listing exactly what is missing rather than emitting an empty model — a model
// built from an empty part list would "succeed" and ship nothing, the gate-over-an-empty-set trap
// this codebase documents.

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';
import obj2gltf from 'obj2gltf';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const region = process.argv[2] || 'leg';

// Where the BodyParts3D OBJ files live once downloaded (see README → "Get the geometry").
const BP3D_DIR = process.env.BP3D_DIR || path.join(HERE, 'bodyparts3d');
const TMP = path.join(HERE, '.tmp', region);
const OUT_DIR = path.join(REPO, 'assets', 'anatomy');

const die = (msg) => { console.error(`\n✗ ${msg}\n`); process.exit(1); };

async function main() {
  const manifestPath = path.join(HERE, `${region}.manifest.json`);
  if (!existsSync(manifestPath)) die(`no manifest: ${manifestPath}`);
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const parts = (manifest.parts || []).filter((p) => p.fma);

  const missing = parts.filter((p) => !p.src || !existsSync(path.join(BP3D_DIR, p.src)));
  if (missing.length) {
    console.error(`\n${missing.length} of ${parts.length} parts have no downloaded OBJ. Fill \`src\` and place the file under ${BP3D_DIR}:`);
    missing.forEach((p) => console.error(`   ${p.fma}  ${p.name}   src="${p.src || '???'}"`));
    die('nothing to build until the geometry is present — see scripts/anatomy/README.md → "Get the geometry".');
  }

  await rm(TMP, { recursive: true, force: true });
  await mkdir(TMP, { recursive: true });
  await mkdir(OUT_DIR, { recursive: true });
  const io = new NodeIO();

  // 2+3: OBJ → glb, then name the node by FMA and tag its layer.
  const partFiles = [];
  const meshmap = {};
  for (const p of parts) {
    const objPath = path.join(BP3D_DIR, p.src);
    const glb = await obj2gltf(objPath, { binary: true, separate: false, unlit: false });
    const raw = path.join(TMP, `${p.fma.replace(/[:]/g, '_')}.raw.glb`);
    await writeFile(raw, Buffer.from(glb));
    // rename node + set layer extras so the engine reads mesh.name === fma and userData.layer
    const doc = await io.read(raw);
    const nodes = doc.getRoot().listNodes();
    const meshNode = nodes.find((n) => n.getMesh()) || nodes[0];
    if (!meshNode) die(`converted ${p.name} has no mesh node`);
    meshNode.setName(p.fma);
    meshNode.setExtras({ ...(meshNode.getExtras() || {}), layer: p.layer || 'superficial', fma: p.fma });
    const named = path.join(TMP, `${p.fma.replace(/[:]/g, '_')}.glb`);
    await io.write(named, doc);
    partFiles.push(named);
    meshmap[p.fma] = { name: p.name, layer: p.layer || 'superficial' };
  }

  // 4: merge → optimize (weld + simplify to ~4k faces/mesh + meshopt). Use the CLI so the exact
  // extension/encoder wiring is handled by gltf-transform itself (version-pinned in package.json).
  const merged = path.join(TMP, `${region}.merged.glb`);
  const gt = (args) => execFileSync('npx', ['--yes', '@gltf-transform/cli', ...args], { stdio: 'inherit', cwd: HERE });
  gt(['merge', ...partFiles, merged]);

  const simplified = path.join(TMP, `${region}.simplified.glb`);
  // ratio 0.25 with a small error target ≈ the ~4k-faces/mesh budget the BodyExplorer reference used.
  gt(['weld', merged, merged]);
  gt(['simplify', merged, simplified, '--ratio', '0.25', '--error', '0.001']);

  const outGlb = path.join(OUT_DIR, `${region}.glb`);
  gt(['meshopt', simplified, outGlb, '--level', 'medium']);

  await writeFile(path.join(OUT_DIR, `${region}.meshmap.json`), JSON.stringify(meshmap, null, 2));

  const bytes = (await readFile(outGlb)).length;
  const mb = (bytes / 1048576).toFixed(2);
  console.log(`\n✓ ${region}.glb written: ${mb} MB, ${parts.length} parts.`);
  if (bytes > 6 * 1048576) console.warn(`⚠ ${mb} MB exceeds the ≤6 MB/region wire budget — raise --ratio decimation or split the region.`);
  console.log(`✓ ${region}.meshmap.json written (${parts.length} fma→layer rows for QA).`);
  console.log(`Next: verify each mesh.name === fma resolves in window.RNAWIKI_DATA.structures, then run the leg perf spike (README → GO/NO-GO).`);
}

main().catch((e) => die(e.stack || String(e)));
