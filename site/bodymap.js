// site/bodymap.js — RNAwiki 3D anatomy engine (ES module, lazily import()-ed by app.js).
//
// WHY THIS FILE, AND WHAT IT IS NOT
// This is the FULL BodyParts3D / Three.js engine (Felix's directive), NOT the Sketchfab shortcut.
// It is a *view* over the structures registry (window.RNAWIKI_DATA.structures, keyed by FMA id) and
// carries ZERO content of its own — every label, origin, insertion and action string it shows is
// looked up from that registry. Mesh nodes inside the region GLBs are named by their FMA id, which
// is the single join key between geometry, facts, and the crawlable /muscle pages.
//
// LOADING MODEL (fits the vanilla, static, $0, no-bundler stack)
//   - app.js is a classic IIFE script; it calls `import('/bodymap.js')` ONLY when the body route
//     mounts, so nothing here is in the main bundle and the ~90% no-JS path is untouched.
//   - Three.js is SELF-HOSTED under /vendor/three/ (script-src 'self' → no CSP change needed).
//   - Region GLBs (leg.glb, arm.glb, …) are static assets fetched from '/anatomy/<region>.glb'
//     (connect-src 'self' → no CSP change). They are lazy: only the region you open is downloaded.
//
// DEGRADATION
//   canRun3D() gates everything. If WebGL is missing, memory is low, Save-Data is on, or the user
//   prefers reduced motion, the caller must fall back to the crawlable 2D twin / static hero image.
//   The 3D is a progressive enhancement for capable devices, never the floor.

import * as THREE from '/vendor/three/three.module.js';
import { GLTFLoader } from '/vendor/three/GLTFLoader.js';
import { OrbitControls } from '/vendor/three/OrbitControls.js';
import { MeshoptDecoder } from '/vendor/three/meshopt_decoder.module.js';

// ---- capability gate -------------------------------------------------------------------------
export function canRun3D() {
  try {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    const c = navigator.connection || {};
    if (c.saveData) return false;
    if (typeof navigator.deviceMemory === 'number' && navigator.deviceMemory < 3) return false;
    const cv = document.createElement('canvas');
    const gl = cv.getContext('webgl2') || cv.getContext('webgl');
    return !!gl;
  } catch (e) { return false; }
}

// ---- registry lookup (the ONLY source of content) --------------------------------------------
// parse.js exposes RNAWIKI_DATA.structures as an ARRAY (+ structuresByGroup). The engine keys on FMA,
// so build+cache an fma->structure index from whatever shape is present (array or already-keyed object).
//
// ⚠ THE JOIN KEY MUST BE NORMALISED. three.js's GLTFLoader SANITISES node names — it strips the colon,
// so a GLB node named "FMA:22430" arrives as mesh.name "FMA22430". The registry key is "FMA:22430".
// Comparing them raw NEVER matches, which silently disables every pick, highlight and animation (the
// model then shows a lone muscle with no bones and no movement). normFma() reduces any spelling —
// "FMA:22430", "FMA22430", "FMA_22430", "fma:22430", 22430 — to the canonical "FMA:22430", and BOTH
// sides of every comparison go through it. Do not remove this; it is the fix for that exact bug.
function normFma(v) {
  const m = String(v == null ? '' : v).match(/(\d+)/);
  return m ? 'FMA:' + m[1] : '';
}
let _fmaIndex = null;
function structures() {
  if (_fmaIndex) return _fmaIndex;
  const raw = (window.RNAWIKI_DATA && window.RNAWIKI_DATA.structures) || [];
  _fmaIndex = {};
  (Array.isArray(raw) ? raw : Object.values(raw)).forEach((s) => { if (s && s.fma) _fmaIndex[normFma(s.fma)] = s; });
  return _fmaIndex;
}
function structureByFma(fma) { return structures()[normFma(fma)] || null; }

// ---- action → joint movement, ported from build/figures.js classify() ------------------------
// We reuse the SAME joint+direction vocabulary the 2D animated figures use, so the 3D movement of a
// muscle's action tells the identical story the muscle page already tells in SVG. For the leg spike
// only knee/hip/ankle are needed; the map is extended per region as regions ship.
function classifyAction(txt) {
  const t = String(txt || '').toLowerCase();
  const dir = /extension|extends|extend|straighten/.test(t) ? 'extension'
    : /abduct/.test(t) ? 'abduction'
    : /adduct/.test(t) ? 'adduction'
    : /dorsiflex/.test(t) ? 'dorsiflexion'
    : /plantarflex|plantar/.test(t) ? 'plantarflexion'
    : /rotat/.test(t) ? 'rotation'
    : 'flexion';
  let joint = null;
  if (/\bknee|patell/.test(t)) joint = 'knee';
  else if (/\bankle|calf|heel|toe|plantar|dorsiflex/.test(t)) joint = 'ankle';
  else if (/\bhip|thigh|femur|pelvi/.test(t)) joint = 'hip';
  return { joint, dir };
}

// Per-region joint rig. pivot/axis are in the GLB's local space and MUST be calibrated in the leg
// spike against the actual mesh coordinates (see scripts/anatomy/README.md → "Calibrate the rig").
// `distal` lists the FMA ids of the meshes that move with the segment; everything else stays put.
// `range` is [restDeg, endDeg] the segment swings through for a given direction.
// LEG RIG — first-pass calibration (2026-07). pivots are in the model's NATIVE (Z-up) space, derived
// from the raw OBJ vertex ranges: femur Z 403..843 (knee..hip), tibia Z 60..406 (ankle..knee),
// talus Z 35..70. So knee joint ~Z403, hip ~Z820 (femoral head), ankle ~Z62. `axis` [1,0,0] = the
// native mediolateral axis (femur's widest horizontal span is X) → flexion/extension. `distal` lists
// the FMA ids that swing with the segment (explicit, so the world-vs-local belowPivot fallback is not
// used). ⚠ The joint X/Y centres and the axis handedness are BEST-GUESS and need a real-device visual
// pass to look anatomically exact — see NEEDS FELIX. The distal membership + Z-levels are grounded.
const LEG_SHIN = ['FMA:24476', 'FMA:24479', 'FMA:24485', 'FMA:9708', 'FMA:22541', 'FMA:22542', 'FMA:22532']; // tibia,fibula,patella,talus,gastroc,soleus,tib-ant
const LEG_THIGH = ['FMA:9611', 'FMA:22430', 'FMA:22432', 'FMA:22431', 'FMA:22433', 'FMA:22356', 'FMA:22357', 'FMA:22438']; // femur + 4 quads + 3 hams
const RIGS = {
  leg: {
    knee: {
      pivot: [-84, -100, 403], axis: [1, 0, 0],
      distal: LEG_SHIN,
      range: { flexion: [0, 120], extension: [120, 0] },
    },
    hip: {
      pivot: [-40, -60, 820], axis: [1, 0, 0],
      distal: LEG_THIGH.concat(LEG_SHIN),
      range: { flexion: [0, 75], extension: [0, -25], abduction: [0, 40], adduction: [0, -25] },
    },
    ankle: {
      pivot: [-77, -70, 62], axis: [1, 0, 0],
      distal: ['FMA:9708'],
      range: { plantarflexion: [0, 40], dorsiflexion: [0, -25] },
    },
  },
};

// ---- the engine ------------------------------------------------------------------------------
// mountBodyMap(container, opts) -> a controller { focus(fma), playAction(fma, action), setLayer,
//   sliceAt, snapshot(), dispose() }. opts: { region='leg', focusFma, autoplayAction, onSelect }.
// Write a red-belly -> pale-ends colour ramp into a muscle geometry, along its own longest axis.
// A muscle's tendons are at its two extremities, so position along the long axis is a reasonable
// stand-in for "how tendinous is this part". Returns false if the geometry has no positions, so the
// caller can fall back to a flat colour rather than render an untinted grey mesh.
function tendonRamp(geom, muscle, tendon) {
  const pos = geom && geom.attributes && geom.attributes.position;
  if (!pos || !pos.count) return false;
  if (!geom.boundingBox) geom.computeBoundingBox();
  const bb = geom.boundingBox;
  const span = [bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z];
  const ax = span.indexOf(Math.max(...span));            // the muscle's long axis
  const lo = [bb.min.x, bb.min.y, bb.min.z][ax], hi = [bb.max.x, bb.max.y, bb.max.z][ax];
  const len = (hi - lo) || 1;
  const m = muscle || MUSCLE_RED_S, t = tendon || TENDON_PEARL_S;
  const col = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const v = ax === 0 ? pos.getX(i) : ax === 1 ? pos.getY(i) : pos.getZ(i);
    const u = (v - lo) / len;                             // 0..1 along the muscle
    // Distance from the nearest end, remapped so the middle ~64% is fully muscle and each outer
    // ~18% fades to tendon. smoothstep keeps the transition from reading as a hard painted band.
    let e = Math.min(u, 1 - u) / 0.18; if (e > 1) e = 1;
    const k = e * e * (3 - 2 * e);
    col[i * 3] = t.r + (m.r - t.r) * k;
    col[i * 3 + 1] = t.g + (m.g - t.g) * k;
    col[i * 3 + 2] = t.b + (m.b - t.b) * k;
  }
  geom.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return true;
}
// Module-scope copies so tendonRamp can run without being handed the palette every call.
const MUSCLE_RED_S = new THREE.Color(0xb3453c);
const TENDON_PEARL_S = new THREE.Color(0xe4ddcd);

export async function mountBodyMap(container, opts = {}) {
  const region = opts.region || 'leg';
  const rig = RIGS[region] || {};
  const state = { selected: null, animating: null, layers: { skin: 1, superficial: 1, deep: 1, skeleton: 1 } };

  // scene / renderer / camera
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.localClippingEnabled = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label', 'Interactive 3D anatomy model. Use the muscle list or search for a keyboard-accessible alternative.');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 100);
  camera.position.set(0, 0.15, 2.4); // replaced by fitToModel() once the geometry's real bounds are known
  // Lighting rebuilt 2026-07-31. One flat hemisphere plus one key light rendered the model as a
  // silhouette with almost no surface form — muscle bellies looked like the same slab as bone. A
  // key/fill/rim set gives the fibres somewhere to catch light, which is most of what makes an
  // anatomy render legible; the colour ramp does the rest.
  scene.add(new THREE.HemisphereLight(0xffffff, 0x4a5568, 0.75));
  const key = new THREE.DirectionalLight(0xfff6ec, 1.05); key.position.set(1.2, 1.8, 1.6); scene.add(key);
  const fill = new THREE.DirectionalLight(0xdce6ff, 0.42); fill.position.set(-1.6, 0.4, 1.0); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 0.55); rim.position.set(-0.4, 1.0, -2.0); scene.add(rim);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.minDistance = 0.4; controls.maxDistance = 6;

  // cross-section clip plane (disabled until sliceAt is called)
  const clip = new THREE.Plane(new THREE.Vector3(0, -1, 0), 100);
  let clipOn = false;

  // interaction plumbing
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const picky = []; // pickable meshes (catalogued muscles)
  const byFma = new Map(); // fma -> mesh (pickable muscles)
  const byFmaAll = new Map(); // fma -> mesh (ALL meshes incl. bones — for attachment highlighting)
  const boneFmas = new Set(); // fma ids whose layer is 'skeleton'
  // Declared HERE, not next to setAttachMarkers(): tick() starts before that point in the
  // function body, and updateMarkers() reading a `const` from its temporal dead zone threw
  // "Cannot access 'markerEls' before initialization" on every single frame — which killed the
  // whole mount, so the page fell back to "3D model couldn't load".
  const markerEls = [];      // [{el, point}] labelled origin/insertion pins, projected each frame
  const TEAL = new THREE.Color(0x0d9488), BONE_BLUE = new THREE.Color(0x2563eb), BONE_AMBER = new THREE.Color(0xf59e0b);
  // ---- TISSUE PALETTE (2026-07-31) -------------------------------------------------------------
  // Felix, looking at the live model on a laptop: "i am unable to tell apart the muscles from the
  // structure". He was right, and the screenshot showed why — BodyParts3D ships every mesh with the
  // same neutral material, so muscle and bone rendered as one undifferentiated grey mass. Colour is
  // the whole point of an anatomy render: it is the only channel that says "this is a different
  // tissue". These are the colours of every anatomy plate ever drawn.
  const MUSCLE_RED = new THREE.Color(0xb3453c);   // muscle belly
  const TENDON_PEARL = new THREE.Color(0xe4ddcd); // tendon / aponeurosis at the ends
  const BONE_IVORY = new THREE.Color(0xe8dcc0);   // bone
  const WHITE = new THREE.Color(0xffffff);
  const highlightMat = { color: new THREE.Color(0x0d9488), emissive: new THREE.Color(0x0d9488), emissiveIntensity: 0.45 };
  let root = null;

  // ---- load the region GLB ----
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(`/anatomy/${region}.glb`);
  root = gltf.scene;
  scene.add(root);
  // BodyParts3D geometry is Z-up (superior = +Z, confirmed from the OBJ vertex ranges: femur spans
  // Z 403..843 hip->knee); three/glTF is Y-up. Rotate -90deg about X so the model stands upright and
  // the auto-scale below (which measures size.y) is correct. RIGS pivots stay in the model's LOCAL
  // (pre-rotation, Z-up) space because each distal group is a child of root and inherits this rotation.
  // The facing direction may still need a real-device pass — see NEEDS FELIX.
  root.rotation.x = -Math.PI / 2;
  root.updateMatrixWorld(true);
  // centre + scale the model into a ~1.5m-tall view box
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3(); box.getSize(size);
  const centre = new THREE.Vector3(); box.getCenter(centre);
  const s = 1.5 / (size.y || 1);
  root.scale.setScalar(s);
  root.position.sub(centre.multiplyScalar(s));
  // Frame the whole model to the CONTAINER, not to a hard-coded camera distance. The old fixed
  // position.set(0, 0.5, 2.4) was tuned for one viewport; on a laptop the leg overflowed the canvas
  // top and bottom and read as a cropped grey strip. This measures the model and the aspect ratio
  // and backs the camera off far enough for whichever of height/width is the binding constraint.
  function fitToModel(pad) {
    const bb = new THREE.Box3().setFromObject(root);
    const c = bb.getCenter(new THREE.Vector3()), sz = bb.getSize(new THREE.Vector3());
    const aspect = camera.aspect || 1;
    const vfov = camera.fov * Math.PI / 180;
    const distH = (sz.y * 0.5) / Math.tan(vfov / 2);
    const distW = (Math.max(sz.x, sz.z) * 0.5) / Math.tan(Math.atan(Math.tan(vfov / 2) * aspect));
    const d = Math.max(distH, distW) * (pad || 1.18);
    controls.target.copy(c);
    camera.position.set(c.x, c.y + sz.y * 0.04, c.z + d);
    camera.near = Math.max(0.01, d / 100); camera.far = d * 12;
    camera.updateProjectionMatrix();
    controls.update();
  }

  root.traverse((o) => {
    if (!o.isMesh) return;
    // mesh.name is the FMA id (set at build time) — but sanitised by the loader, so normalise it to the
    // canonical "FMA:nnnn" the registry and the rigs use. Everything downstream keys on this value.
    const fma = normFma(o.name);
    o.userData.fma = fma;
    o.userData.layer = o.userData.layer || inferLayer(o);
    o.material = o.material.clone();
    o.material.clippingPlanes = [clip];
    o.material.transparent = true;
    const isBone = (o.userData.layer === 'skeleton');
    if (isBone) {
      o.userData.baseColor = BONE_IVORY.clone();
      o.material.color.copy(BONE_IVORY);
      o.material.roughness = 0.62; o.material.metalness = 0.0;
    } else {
      // Muscle: shade the belly red and let it fade to tendon-pale at BOTH ends. BodyParts3D has no
      // separate tendon meshes — the tendinous portion is baked into the muscle geometry — so the
      // only way to show it is to shade the mesh itself. tendonRamp() writes per-vertex colours and
      // the material multiplies them by white. This is INDICATIVE, not a measured tendon boundary,
      // and the on-page legend says so; the alternative was leaving the reader unable to tell muscle
      // from bone at all, which is what shipped.
      o.userData.hasRamp = tendonRamp(o.geometry);
      o.userData.baseColor = WHITE.clone();
      o.material.color.copy(WHITE);
      o.material.vertexColors = o.userData.hasRamp;
      o.material.roughness = 0.78; o.material.metalness = 0.0;
      o.material.needsUpdate = true;
    }
    byFmaAll.set(fma, o);
    if (o.userData.layer === 'skeleton') boneFmas.add(fma);
    if (structureByFma(fma)) { picky.push(o); byFma.set(fma, o); }
  });

  // ---- rendering loop ----
  let raf = 0, alive = true;
  function tick() {
    if (!alive) return;
    raf = requestAnimationFrame(tick);
    controls.update();
    if (state.animating) stepAnimation();
    renderer.render(scene, camera);
    updateMarkers();
  }
  function resize() {
    const w = container.clientWidth, h = container.clientHeight || Math.round(w * 1.1);
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(() => { resize(); if (!state.selected) fitToModel(); }); ro.observe(container);
  resize();
  fitToModel();   // must run AFTER resize() so camera.aspect is the real one
  tick();

  // ---- picking ----
  function onPointer(ev) {
    const r = renderer.domElement.getBoundingClientRect();
    const cx = (ev.touches ? ev.touches[0].clientX : ev.clientX);
    const cy = (ev.touches ? ev.touches[0].clientY : ev.clientY);
    pointer.x = ((cx - r.left) / r.width) * 2 - 1;
    pointer.y = -((cy - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(picky, false)[0];
    if (hit) select(hit.object.userData.fma);
  }
  renderer.domElement.addEventListener('click', onPointer);

  // Map an origin/insertion attachTo phrase to the FMA of the leg bone it names, so selecting a muscle
  // can highlight the two bones it actually connects to. Order matters (specific → general).
  function resolveBone(text) {
    const t = String(text || '').toLowerCase();
    if (/patella|kneecap/.test(t)) return 'FMA:24485';
    if (/fibula|fibular/.test(t)) return 'FMA:24479';
    if (/calcaneus|calcaneal|\bheel|achilles|metatars|cuneiform|navicular|tarsal|midfoot|\bfoot\b|talus/.test(t)) return 'FMA:9708';
    if (/tibia|tibial|pes anserin|\bshin/.test(t)) return 'FMA:24476';
    if (/femur|femoral|linea aspera|intertrochanteric|supracondylar|\btrochanter|gluteal tuberosity|condyle/.test(t)) return 'FMA:9611';
    if (/ilium|iliac|ischia|ischial|pubis|pubic|acetabul|coxae|pelvi|hip bone|sacr/.test(t)) return 'FMA:16585';
    return null;
  }
  const _bone = (t) => normFma(resolveBone(t)) || null;
  // SELECT is the learning moment (Felix: teach where it connects + how it moves, don't just isolate a
  // lone fibre). Show the muscle bright; its ORIGIN bone tinted blue + INSERTION bone tinted amber and
  // clearly visible; the rest of the skeleton faint (so the movement has context); other muscles nearly
  // gone. Frame the muscle + its two bones, then animate the muscle's action.
  function select(fma) {
    fma = normFma(fma);
    if (!byFma.has(fma)) return;
    stopAction();
    state.selected = fma;
    const st = structureByFma(fma);
    const originB = _bone(st && st.origin && st.origin.attachTo);
    const insertB = _bone(st && st.insertion && st.insertion.attachTo);
    root.traverse((o) => {
      if (!o.isMesh || !o.material) return;
      const f = o.userData.fma;
      o.material.emissiveIntensity = 0;
      if (o.userData.baseColor) o.material.color.copy(o.userData.baseColor); // reset any prior tint
      // The selected muscle KEEPS its anatomical colour and its tendon ramp — repainting it flat
      // teal (what this used to do) threw away the one thing the reader came here to see. Selection
      // is signalled by full opacity plus a warm glow instead.
      if (f === fma) { o.material.emissive.copy(MUSCLE_RED); o.material.emissiveIntensity = 0.22; o.material.opacity = 1; }
      // Colour the two bones outright (not just a faint emissive tint) so it is unmistakable WHERE the
      // muscle attaches: origin bone blue, insertion bone amber. Kept nearly solid so they read as the
      // structural anchors while the muscle moves between them.
      else if (f === originB) { o.material.color.copy(BONE_BLUE); o.material.emissive.copy(BONE_BLUE); o.material.emissiveIntensity = 0.3; o.material.opacity = 0.98; }
      else if (f === insertB) { o.material.color.copy(BONE_AMBER); o.material.emissive.copy(BONE_AMBER); o.material.emissiveIntensity = 0.3; o.material.opacity = 0.98; }
      else if (boneFmas.has(f)) { o.material.opacity = 0.5; }  // rest of the skeleton = ivory context
      else { o.material.opacity = 0.08; }                      // other muscles nearly gone
    });
    setAttachMarkers(fma, originB, insertB);
    frameGroup([fma, originB, insertB]);
    playAction(fma);
    if (typeof opts.onSelect === 'function') opts.onSelect(fma, st);
  }
  // ---- ORIGIN / INSERTION MARKERS --------------------------------------------------------------
  // Felix asked for the textbook diagram: the muscle, with ORIGIN labelled at the fixed end and
  // INSERTION at the moving end. We do not have measured attachment coordinates — structures.json
  // describes each attachment in prose ("lateral condyle of the femur"), not as a point. What we DO
  // have is both meshes, so we take the point on the muscle closest to the origin bone, and the point
  // closest to the insertion bone. That is the real closest approach of the two structures, which is
  // where they attach, to within the resolution of the mesh. Labels are plain DOM projected onto the
  // canvas each frame — no extra Three.js vendor file, and the text stays crisp and selectable.
  function clearMarkers() { markerEls.splice(0).forEach((m) => { if (m.el.parentNode) m.el.parentNode.removeChild(m.el); }); }
  function nearestPointOnMesh(mesh, target) {
    const pos = mesh.geometry.attributes.position; if (!pos) return null;
    const v = new THREE.Vector3(); let best = null, bestD = Infinity;
    // Every 3rd vertex is plenty at ~4k faces/mesh and keeps this well under a frame.
    for (let i = 0; i < pos.count; i += 3) {
      v.fromBufferAttribute(pos, i); mesh.localToWorld(v);
      const d = v.distanceToSquared(target);
      if (d < bestD) { bestD = d; best = v.clone(); }
    }
    return best;
  }
  function setAttachMarkers(fma, originB, insertB) {
    clearMarkers();
    const muscle = byFmaAll.get(fma); if (!muscle) return;
    const mk = (boneFma, label, cls) => {
      const bone = boneFmas.has(boneFma) ? byFmaAll.get(boneFma) : null; if (!bone) return;
      const bc = new THREE.Box3().setFromObject(bone).getCenter(new THREE.Vector3());
      const p = nearestPointOnMesh(muscle, bc); if (!p) return;
      const el = document.createElement('div');
      el.className = 'bm-marker ' + cls;
      el.innerHTML = '<span class="bm-dot"></span><span class="bm-lab">' + label + '</span>';
      container.appendChild(el);
      markerEls.push({ el, point: p });
    };
    mk(originB, 'ORIGIN', 'bm-origin');
    mk(insertB, 'INSERTION', 'bm-insertion');
  }
  // Project each marker to screen space once per frame. Hidden when it falls behind the model's
  // centre depth so a label never floats over geometry it is not attached to.
  function updateMarkers() {
    if (!markerEls.length) return;
    const w = container.clientWidth, h = container.clientHeight || 1;
    markerEls.forEach((m) => {
      const v = m.point.clone().project(camera);
      const vis = v.z < 1 && v.x > -1.2 && v.x < 1.2 && v.y > -1.2 && v.y < 1.2;
      m.el.style.display = vis ? 'flex' : 'none';
      if (!vis) return;
      m.el.style.left = Math.round((v.x * 0.5 + 0.5) * w) + 'px';
      m.el.style.top = Math.round((-v.y * 0.5 + 0.5) * h) + 'px';
    });
  }
  function frameGroup(fmas) {
    const bb = new THREE.Box3(); let any = false;
    fmas.filter(Boolean).forEach((f) => { const m = byFmaAll.get(f); if (m) { bb.expandByObject(m); any = true; } });
    if (!any) return;
    const c = bb.getCenter(new THREE.Vector3());
    const rad = bb.getSize(new THREE.Vector3()).length() * 0.5 || 0.3;
    const dist = rad / Math.tan((camera.fov * Math.PI / 180) / 2) * 1.5;
    const dir = camera.position.clone().sub(controls.target).normalize();
    controls.target.copy(c);
    tweenCamera(c.clone().add(dir.multiplyScalar(Math.max(0.45, dist))));
  }
  let camTween = null;
  function tweenCamera(to) { camTween = { from: camera.position.clone(), to, t: 0 }; }

  // ---- MOVEMENT DRIVER: animate a muscle's action in 3D ----
  // Given a structure's action string, rotate the distal segment about the joint, oscillating
  // rest↔end so the reader SEES the movement the muscle produces. This is the 3D twin of the SVG
  // action figures — same joint, same direction, same story.
  let activeGroup = null;
  function playAction(fma, action) {
    stopAction();
    const st = structureByFma(fma); if (!st) return;
    const act = action || (st.actions && st.actions[0]); if (!act) return;
    const { joint, dir } = classifyAction(act);
    const jr = rig[joint]; if (!jr) return; // no rig for this joint yet → safe no-op
    const range = jr.range[dir] || jr.range.flexion || [0, 40];
    // Reparent the distal segment (its FMA list — bones + muscles) into a fresh pivot group at the joint.
    // THREE.attach preserves world transform, so rotating the group swings the segment about the joint.
    // Rebuilt every play and returned to root on stop, so selecting across joints never breaks.
    const g = new THREE.Group(); g.position.fromArray(jr.pivot); root.add(g);
    new Set(jr.distal).forEach((f) => { const m = byFmaAll.get(f); if (m) g.attach(m); });
    if (!g.children.length) { root.remove(g); return; }
    activeGroup = g;
    state.animating = { group: g, axis: new THREE.Vector3().fromArray(jr.axis).normalize(), a0: range[0] * Math.PI / 180, a1: range[1] * Math.PI / 180, phase: 0, label: act };
  }
  function stepAnimation() {
    const a = state.animating; if (!a) return;
    a.phase += 0.02;
    const k = (Math.sin(a.phase - Math.PI / 2) + 1) / 2; // ease 0..1..0, starting from rest
    a.group.setRotationFromAxisAngle(a.axis, a.a0 + (a.a1 - a.a0) * k);
  }
  function stopAction() {
    state.animating = null;
    if (activeGroup) {
      activeGroup.rotation.set(0, 0, 0); activeGroup.updateMatrixWorld(true);
      activeGroup.children.slice().forEach((m) => root.attach(m)); // return meshes to root at rest
      root.remove(activeGroup); activeGroup = null;
    }
  }

  // camera tween inside the loop
  const _origTick = tick;
  (function patchTween() {
    const step = () => {
      if (camTween) {
        camTween.t = Math.min(1, camTween.t + 0.06);
        const e = 1 - Math.pow(1 - camTween.t, 3);
        camera.position.lerpVectors(camTween.from, camTween.to, e);
        if (camTween.t >= 1) camTween = null;
      }
      requestAnimationFrame(step);
    };
    step();
  })();

  // ---- layers + cross-section ----
  function setLayer(name, opacity) {
    state.layers[name] = opacity;
    picky.forEach((m) => { if (m.userData.layer === name) m.material.opacity = opacity; });
    root.traverse((o) => { if (o.isMesh && o.userData.layer === name && !byFma.has(o.name)) o.material.opacity = opacity; });
  }
  function sliceAt(fraction) { // 0..1 along the vertical axis; null disables
    if (fraction == null) { clip.constant = 100; clipOn = false; return; }
    clipOn = true;
    const b = new THREE.Box3().setFromObject(root);
    clip.constant = b.min.y + (b.max.y - b.min.y) * fraction;
  }

  // ---- search (fly-to by name) ----
  function search(q) {
    q = String(q || '').toLowerCase().trim(); if (!q) return null;
    let best = null;
    for (const [fma, mesh] of byFma) {
      const st = structureByFma(fma); if (!st) continue;
      const hay = [st.name, st.plainName, ...(st.aka || [])].join(' ').toLowerCase();
      if (hay.includes(q)) { best = fma; break; }
    }
    if (best) select(best); // select() frames the bones + auto-plays the action
    return best;
  }

  // ---- share ----
  function snapshot() { try { return renderer.domElement.toDataURL('image/png'); } catch (e) { return null; } }

  // ---- teardown ----
  function dispose() {
    alive = false; cancelAnimationFrame(raf); ro.disconnect();
    renderer.domElement.removeEventListener('click', onPointer);
    scene.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); if (o.material.map) o.material.map.dispose(); o.material.dispose(); } });
    renderer.dispose();
    if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
  }

  // ---- deep-link entry (muscle page "see the movement in 3D") ----
  if (opts.focusFma) select(opts.focusFma); // select() frames the muscle + its two bones and auto-plays

  return { focus: select, playAction, stopAction, setLayer, sliceAt, search, snapshot, dispose, region };
}

// A mesh with no build-time layer tag: infer from whether the registry knows it (a catalogued muscle
// is 'superficial' by default; an unknown mesh is treated as 'skeleton'/scaffold). The build step
// SHOULD set userData.layer explicitly; this is only a safety net.
function inferLayer(mesh) {
  const n = (mesh.name || '').toLowerCase();
  if (/skin|integument/.test(n)) return 'skin';
  if (/bone|skelet|femur|tibia|patella|fibula|pelvis|vertebra/.test(n)) return 'skeleton';
  return structureByFma(mesh.name) ? 'superficial' : 'deep';
}
