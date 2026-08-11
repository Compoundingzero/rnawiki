# 3D anatomy engine — build + integration spec (for the lead)

The full BodyParts3D / Three.js engine Felix chose. Every muscle page links to it; it **animates the
muscle's action** in 3D. The engine (`site/bodymap.js`) is a *view* over `window.RNAWIKI_DATA.structures`
(the content macro's `structures.json`, keyed by **FMA id**) — it holds no content of its own. Mesh nodes
inside each region GLB are named by their FMA id: that name is the only join between geometry, the facts
panel, and the crawlable `/muscle` pages.

**Nothing here is wired into the live site yet.** These are new files (`site/bodymap.js`, `scripts/anatomy/*`)
that nothing imports. The lead does the `app.js`/`prerender.js`/`server.js` wiring below, then runs the leg
GO/NO-GO spike **before** scaling to the whole body.

---

## 1. Get the geometry (one-time)

BodyParts3D, CC-BY-SA 2.1 Japan (single male model). Two sources:
- **Official OBJ:** https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html (OBJ; `obj2gltf` reads these).
- **GitHub clone (binary STL, smaller):** https://github.com/Kevin-Mattheus-Moerman/BodyParts3D — `assets/*.txt`
  hold the **FMAID ↔ English-name** map. Use it to fill each part's `fma` in `leg.manifest.json` and to find
  each part's file. (If you take the STL route, convert STL→OBJ first, or swap `obj2gltf` for an STL loader.)

Download into `scripts/anatomy/bodyparts3d/` (or set `BP3D_DIR`). Then in `leg.manifest.json` set each part's
`src` (its OBJ filename) and **confirm its `fma`** against the official map — the manifest's current FMA ids
are best-guess placeholders and MUST be verified (a wrong id = a mesh that resolves to the wrong muscle, or
to nothing).

**Attribution obligation:** add an `/anatomy/attribution` page crediting *"BodyParts3D, © The Database Center
for Life Science, licensed under CC-BY-SA 2.1 Japan."* Derived GLBs inherit share-alike (fine — RNAwiki is free/open).

## 2. Build the region GLB

```bash
cd scripts/anatomy
npm install                 # isolated toolchain (obj2gltf + @gltf-transform/*), NOT the runtime tree
npm run build:leg           # → assets/anatomy/leg.glb  +  assets/anatomy/leg.meshmap.json
```

The script converts each part, **names its node by FMA + tags `extras.layer`**, then merges → welds →
simplifies (`--ratio 0.25`, ≈4k faces/mesh) → meshopt-compresses. It fails loudly if any part's geometry is
missing (no empty-model "success"). Realistic size: the BodyExplorer reference hit **24 MB / 467 meshes** for
the whole body; the **leg alone (~19 parts) should land ~3–6 MB** after decimation + meshopt + brotli — inside
the wire budget.

## 3. Self-host Three.js (no CDN, no CSP change)

`script-src 'self'` blocks CDNs, so vendor Three.js locally. Pin **three r0.160+** and copy these four files
to `site/vendor/three/` (the engine imports exactly these paths):

```
site/vendor/three/three.module.js
site/vendor/three/GLTFLoader.js            # from three/examples/jsm/loaders/
site/vendor/three/OrbitControls.js         # from three/examples/jsm/controls/
site/vendor/three/meshopt_decoder.module.js# from three/examples/jsm/libs/ (matches the meshopt compression)
```
Fix the internal `import 'three'` specifiers in the three addon files to `'./three.module.js'` (or add an
import-map) so they resolve self-hosted. Because everything is `'self'`, **no CSP edit is required** — confirmed
against `server.js` (`script-src 'self'`, `connect-src 'self'`).

## 4. Ship the GLBs (site/ is ephemeral)

`site/` is regenerated at boot, so GLBs can't live there as source. Commit them under `assets/anatomy/*.glb`
and copy them into `site/anatomy/` in both **`build` and `prestart`** (repo-root `package.json`),
alongside the existing `parse.js`/`prerender.js` steps. `build` makes local/CI smoke tests exercise
the complete served tree; `prestart` restages it on every production boot:

```jsonc
// build + prestart, appended:  && node scripts/anatomy/copy-assets.mjs
// (a 3-line cpSync of assets/anatomy/*.glb + site/vendor/**  →  site/)
```
The engine fetches `/anatomy/leg.glb` and `/vendor/three/*` — both then served statically by `server.js`.

## 5. Wire the route + the muscle-page link (lead edits app.js/prerender.js)

**Route (app.js `route()` ~6618):** add a body route that lazy-imports the engine only when mounted:

```js
else if (parts[0] === 'body') html = bodyShell(parts[1]); // parts[1] optional region
// in the post-render bind block (~6727):
if (parts[0] === 'body') import('/bodymap.js').then(m => {
  if (!m.canRun3D()) { document.getElementById('bm-canvas').replaceWith(twoDFallback()); return; }
  const focusFma = new URLSearchParams(location.hash.split('?')[1]||'').get('fma');
  m.mountBodyMap(document.getElementById('bm-canvas'), {
    region: parts[1] || 'leg', focusFma, autoplayAction: !!focusFma,
    onSelect: (fma, st) => renderStructurePanel(st)   // app.js renders the rich panel from the registry
  });
});
```
`bodyShell` renders `<div id="bm-canvas">` + the **crawlable 2D twin beneath it** (the muscle/region index —
this is what Google and the ~90% no-JS traffic get; the canvas is the enhancement). `renderStructurePanel`
reuses the existing muscle-card markup.

**Muscle page "▶ see the movement in 3D" (app.js `musclePage()` ~2182):** for a muscle whose `structures.json`
entry has an `fma`, add:

```js
`<a class="cta-3d" href="#/body/${region}?fma=${encodeURIComponent(fma)}">▶ See the movement in 3D</a>`
```
Opening it focuses that muscle and **autoplays its action** (`autoplayAction:true` → the engine calls
`playAction(fma)`, which classifies the action string with the SAME joint/direction logic as the 2D SVG
figures and swings the distal segment). Keep the existing animated-SVG action figure as the crawlable,
no-JS twin — the 3D is the upgrade, never the only version.

## 6. Calibrate the movement rig (the one thing that needs the real GLB)

`bodymap.js` → `RIGS.leg` has `pivot`/`axis`/`distal` per joint (knee/hip/ankle) that are **placeholders**.
Once `leg.glb` exists, in the spike: read the joint centres from the model (or eyeball in a viewer), set each
`pivot` to the joint centre in the model's local space, and fill `distal` with the FMA ids of the meshes that
move with that segment (tibia+fibula+foot for the knee, etc.). Until `distal` is filled the engine falls back
to "move every mesh whose centroid sits below the pivot," which is roughly right for a vertical limb but not
exact. This is the only calibration the engine needs.

## 7. Leg perf spike — GO / NO-GO gate

Run on a real **mid-range Android + an iPhone-SE-class device**, not just desktop. Ship the whole-body engine
only if the leg passes all of:

- **Wire size** `leg.glb` ≤ ~6 MB (brotli, as Railway serves it).
- **Load-to-interactive** ≤ ~3 s on mid-range 4G.
- **≥30 fps** sustained rotation on mid-range mobile (60 on desktop). Draw calls are the real budget — the leg's
  ~19 pickable meshes ≈ ~19 draw calls, safe; the *whole body* at 400+ is the risk, which is why regions are split.
- **Pick accuracy** on the sub-heads: tapping the inner knee selects **vastus medialis**, not vastus lateralis.
- **No context loss / crash** on a 3 GB-RAM device (handle `webglcontextlost`, dispose on route-leave — the
  engine already disposes).

Fail any → ship the 2D body only (Pillar 2) and defer 3D; the muscle pages keep their crawlable animated-SVG
figures and lose nothing structural.

---

## Files in this deliverable
- `site/bodymap.js` — the engine (canRun3D, mountBodyMap → {focus, playAction, setLayer, sliceAt, search, snapshot, dispose}).
- `scripts/anatomy/package.json` — isolated toolchain.
- `scripts/anatomy/build-leg.mjs` — the region-GLB pipeline.
- `scripts/anatomy/leg.manifest.json` — starter part list (verify fma + fill src).
- `scripts/anatomy/README.md` — this spec.

## Blockers the lead must clear before the spike
1. **Verify the placeholder FMA ids** in `leg.manifest.json` against BodyParts3D's official FMAID↔name map, and
   reconcile them with the `fma` the content macro's `structures.json` is authoring for the same muscles — they
   must be identical strings or picking resolves to nothing.
2. **Fill each part's `src`** after downloading the archive (§1).
3. **Vendor the four Three.js files** and fix their internal import specifiers (§3).
4. **`copy-assets.mjs` + prestart** so the ephemeral `site/` gets the GLBs and vendor JS (§4).
5. **Calibrate `RIGS.leg`** pivots/distal against the built GLB (§6).
