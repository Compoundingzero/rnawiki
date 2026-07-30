// scripts/anatomy/stl2obj.mjs — convert BodyParts3D binary STL → OBJ for the build-leg pipeline.
//
// The Moerman BodyParts3D mirror ships per-part BINARY STL (FMA<id>.stl). build-leg.mjs feeds OBJ to
// obj2gltf, so this is the "convert STL→OBJ first" step the README calls out. It also MERGES multiple
// inputs into one OBJ (biceps femoris = long+short head, gastrocnemius = medial+lateral head — the
// registry treats each as a single muscle, so its two BodyParts3D heads become one mesh/one FMA node).
//
// Vertices are deduplicated (rounded key) so obj2gltf gets clean indexed geometry; the pipeline's
// `weld` pass tidies whatever remains. Output is a flat single-object OBJ (no groups/materials) so
// obj2gltf emits exactly ONE mesh node — which build-leg.mjs then renames to the part's FMA id.
//
// USAGE: node stl2obj.mjs <out.obj> <in1.stl> [in2.stl ...]

import { readFileSync, writeFileSync } from 'node:fs';

function readBinarySTL(buf) {
  // 80-byte header, uint32 triangle count, then 50 bytes/triangle (normal[3]+v0[3]+v1[3]+v2[3]+attr16)
  const nTri = buf.readUInt32LE(80);
  const tris = [];
  let off = 84;
  for (let i = 0; i < nTri; i++) {
    const p = off + 12; // skip normal
    const v = [];
    for (let k = 0; k < 3; k++) {
      const b = p + k * 12;
      v.push([buf.readFloatLE(b), buf.readFloatLE(b + 4), buf.readFloatLE(b + 8)]);
    }
    tris.push(v);
    off += 50;
  }
  return tris;
}

function main() {
  const [out, ...inputs] = process.argv.slice(2);
  if (!out || !inputs.length) {
    console.error('usage: node stl2obj.mjs <out.obj> <in1.stl> [in2.stl ...]');
    process.exit(1);
  }
  const key = (c) => `${Math.round(c[0] * 1e4)},${Math.round(c[1] * 1e4)},${Math.round(c[2] * 1e4)}`;
  const index = new Map();
  const verts = [];
  const faces = [];
  let totalTri = 0;
  for (const inp of inputs) {
    const buf = readFileSync(inp);
    if (buf.length < 84) { console.error(`✗ ${inp}: too small to be a binary STL`); process.exit(1); }
    const tris = readBinarySTL(buf);
    if (!tris.length) { console.error(`✗ ${inp}: 0 triangles`); process.exit(1); }
    totalTri += tris.length;
    for (const t of tris) {
      const idx = t.map((c) => {
        const k = key(c);
        let id = index.get(k);
        if (id === undefined) { verts.push(c); id = verts.length; index.set(k, id); }
        return id;
      });
      faces.push(idx);
    }
  }
  const lines = [`# converted from ${inputs.map((s) => s.split('/').pop()).join(' + ')}  (${totalTri} tris, ${verts.length} verts)`];
  for (const v of verts) lines.push(`v ${v[0]} ${v[1]} ${v[2]}`);
  for (const f of faces) lines.push(`f ${f[0]} ${f[1]} ${f[2]}`);
  writeFileSync(out, lines.join('\n') + '\n');
  console.log(`✓ ${out.split('/').pop()}: ${totalTri} tris → ${verts.length} verts (from ${inputs.length} STL)`);
}

main();
