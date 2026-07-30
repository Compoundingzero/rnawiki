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
let _fmaIndex = null;
function structures() {
  if (_fmaIndex) return _fmaIndex;
  const raw = (window.RNAWIKI_DATA && window.RNAWIKI_DATA.structures) || [];
  _fmaIndex = {};
  (Array.isArray(raw) ? raw : Object.values(raw)).forEach((s) => { if (s && s.fma) _fmaIndex[s.fma] = s; });
  return _fmaIndex;
}
function structureByFma(fma) { return structures()[fma] || null; }

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
  camera.position.set(0, 0.5, 2.4);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x556070, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 0.8); key.position.set(1, 2, 2); scene.add(key);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.minDistance = 0.4; controls.maxDistance = 6;

  // cross-section clip plane (disabled until sliceAt is called)
  const clip = new THREE.Plane(new THREE.Vector3(0, -1, 0), 100);
  let clipOn = false;

  // interaction plumbing
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const picky = []; // pickable meshes
  const byFma = new Map(); // fma -> mesh
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

  root.traverse((o) => {
    if (!o.isMesh) return;
    // mesh.name is the FMA id (set at build time). userData.layer is skin|superficial|deep|skeleton.
    const fma = o.name;
    o.userData.fma = fma;
    o.userData.layer = o.userData.layer || inferLayer(o);
    o.userData.baseColor = (o.material && o.material.color) ? o.material.color.clone() : new THREE.Color(0xb08a86);
    o.material = o.material.clone();
    o.material.clippingPlanes = [clip];
    o.material.transparent = true;
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
  }
  function resize() {
    const w = container.clientWidth, h = container.clientHeight || Math.round(w * 1.1);
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize); ro.observe(container); resize(); tick();

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

  function select(fma) {
    if (!byFma.has(fma)) return;
    if (state.selected) restore(state.selected);
    state.selected = fma;
    const mesh = byFma.get(fma);
    mesh.material.emissive = highlightMat.emissive; mesh.material.emissiveIntensity = highlightMat.emissiveIntensity;
    // dim the siblings so the selection reads
    picky.forEach((m) => { if (m !== mesh) m.material.opacity = Math.min(m.material.opacity, 0.28); });
    frame(mesh);
    if (typeof opts.onSelect === 'function') opts.onSelect(fma, structureByFma(fma));
  }
  function restore(fma) {
    const mesh = byFma.get(fma); if (!mesh) return;
    mesh.material.emissiveIntensity = 0;
    picky.forEach((m) => { m.material.opacity = state.layers[m.userData.layer] != null ? state.layers[m.userData.layer] : 1; });
  }
  function frame(mesh) {
    const b = new THREE.Box3().setFromObject(mesh); const c = new THREE.Vector3(); b.getCenter(c);
    const rad = b.getSize(new THREE.Vector3()).length() * 0.5 || 0.2;
    const dist = rad / Math.tan((camera.fov * Math.PI / 180) / 2) * 1.8;
    const dir = camera.position.clone().sub(controls.target).normalize();
    controls.target.copy(c);
    tweenCamera(c.clone().add(dir.multiplyScalar(Math.max(0.5, dist))));
  }
  let camTween = null;
  function tweenCamera(to) { camTween = { from: camera.position.clone(), to, t: 0 }; }

  // ---- MOVEMENT DRIVER: animate a muscle's action in 3D ----
  // Given a structure's action string, rotate the distal segment about the joint, oscillating
  // rest↔end so the reader SEES the movement the muscle produces. This is the 3D twin of the SVG
  // action figures — same joint, same direction, same story.
  function playAction(fma, action) {
    const st = structureByFma(fma); if (!st) return;
    const act = action || (st.actions && st.actions[0]); if (!act) return;
    const { joint, dir } = classifyAction(act);
    const jr = rig[joint]; if (!jr) return; // no rig for this joint yet → no-op (safe)
    const range = jr.range[dir] || jr.range.flexion || [0, 40];
    // build a pivot group holding the distal meshes, if not already built
    const group = buildDistalGroup(joint, jr);
    if (!group) return;
    state.animating = { group, axis: new THREE.Vector3().fromArray(jr.axis).normalize(), a0: range[0] * Math.PI / 180, a1: range[1] * Math.PI / 180, phase: 0, label: act };
  }
  const distalGroups = {};
  function buildDistalGroup(joint, jr) {
    if (distalGroups[joint]) return distalGroups[joint];
    const pivot = new THREE.Vector3().fromArray(jr.pivot);
    const g = new THREE.Group(); g.position.copy(pivot); root.add(g);
    const set = new Set(jr.distal);
    picky.forEach((m) => {
      const isDistal = set.size ? set.has(m.userData.fma) : belowPivot(m, pivot);
      if (isDistal) { m.getWorldPosition(new THREE.Vector3()); g.attach(m); }
    });
    if (!g.children.length) { root.remove(g); return null; }
    distalGroups[joint] = g; return g;
  }
  function belowPivot(mesh, pivot) {
    const c = new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3());
    return c.y < pivot.y - 0.02; // limb axis is roughly vertical in BodyParts3D's anatomical pose
  }
  function stepAnimation() {
    const a = state.animating; if (!a) return;
    a.phase += 0.018;
    const k = (Math.sin(a.phase) + 1) / 2; // 0..1..0
    const ang = a.a0 + (a.a1 - a.a0) * k;
    a.group.setRotationFromAxisAngle(a.axis, ang);
  }
  function stopAction() {
    state.animating = null;
    Object.values(distalGroups).forEach((g) => g.setRotationFromAxisAngle(new THREE.Vector3(1, 0, 0), 0));
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
    if (best) { select(best); if (opts.autoplayAction !== false) playAction(best); }
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
  if (opts.focusFma) {
    select(opts.focusFma);
    if (opts.autoplayAction) playAction(opts.focusFma, typeof opts.autoplayAction === 'string' ? opts.autoplayAction : null);
  }

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
