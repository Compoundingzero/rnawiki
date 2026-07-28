// build/widgets.js — SECTION SYNTHESIS WIDGETS
//
// Felix: "in each of the broken up sections, add visual interactions or something to help the user
// synthesize the information better… I want a significant change."
//
// ONE renderer, six declarative types. Twelve agents authored specs into data/section_widgets.json
// against a fixed vocabulary; nobody wrote bespoke markup. That is deliberate: this codebase's
// recurring failure is hand-maintained twins drifting apart, and twelve one-off widgets would be
// twelve of them. A spec is data, and data cannot drift from itself.
//
// Everything here is inline SVG/HTML with CSS-only interaction — no JavaScript — so it renders
// identically in the prerendered document and the app, and works for the ~90% of traffic that
// never executes JS. `:has()` and `<details>` are both already proven in site/styles.css.
//
// The `sort` type is the one that matters most: it makes the reader COMMIT to an answer before
// seeing it. Everything else here is presentation; that one is retrieval.

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, Number(n) || 0));

let _uid = 0;
const uid = (k) => `w${(_uid += 1)}${String(k || '').replace(/[^a-z0-9]/gi, '').slice(0, 8)}`;

// ---- 1. scale — items placed along one labelled axis --------------------------------------
function wScale(s) {
  const items = (s.items || []).slice(0, 8);
  if (!items.length) return '';
  const H = 60 + items.length * 30;
  const rows = items.map((it, i) => {
    const x = clamp(it.at, 0, 100);
    const y = 46 + i * 30;
    return `<g class="wsc-item">
      <line x1="${x}%" y1="28" x2="${x}%" y2="${y}" stroke="currentColor" stroke-width="1" opacity=".25"/>
      <circle cx="${x}%" cy="28" r="5.5"/>
      <text x="${x}%" y="${y + 4}" text-anchor="${x > 70 ? 'end' : x < 30 ? 'start' : 'middle'}">
        <tspan class="wsc-l">${esc(it.label)}</tspan>${it.note ? `<tspan class="wsc-n" dx="6">${esc(it.note)}</tspan>` : ''}
      </text></g>`;
  }).join('');
  return `<figure class="w wsc"><svg viewBox="0 0 100 ${H}" preserveAspectRatio="none" style="height:${H}px" role="img"
      aria-label="${esc(s.axis && s.axis.left)} to ${esc(s.axis && s.axis.right)}">
      <line x1="0" y1="28" x2="100%" y2="28" stroke="currentColor" stroke-width="1.5" opacity=".35"/>
      ${rows}</svg>
    <figcaption class="wsc-ends"><span>${esc((s.axis || {}).left)}</span><span>${esc((s.axis || {}).right)}</span></figcaption>
  </figure>`;
}

// ---- 2. compare — a real table, which is what most of these bullet lists always were --------
function wCompare(s) {
  const cols = (s.columns || []).slice(0, 4);
  const rows = (s.rows || []).slice(0, 6);
  if (!cols.length || !rows.length) return '';
  return `<div class="w wcmp"><table>
    <thead><tr><th scope="col"></th>${cols.map((c) => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead>
    <tbody>${rows.map((r) => `<tr><th scope="row">${esc(r.attr)}</th>${
      cols.map((_, i) => `<td>${esc((r.values || [])[i] || '—')}</td>`).join('')}</tr>`).join('')}</tbody>
  </table></div>`;
}

// ---- 3. flow — an ordered chain with an outcome ---------------------------------------------
function wFlow(s) {
  const steps = (s.steps || []).slice(0, 7);
  if (steps.length < 2) return '';
  return `<ol class="w wflow">${steps.map((st) => `<li>
      <span class="wf-l">${esc(st.label)}</span>${st.sub ? `<span class="wf-s">${esc(st.sub)}</span>` : ''}
    </li>`).join('')}${s.outcome ? `<li class="wf-out"><span class="wf-l">${esc(s.outcome)}</span></li>` : ''}</ol>`;
}

// ---- 4. sort — THE ONE THAT MATTERS. Commit, then check. Pure CSS. -------------------------
// Each item gets one radio per bucket. The radio matching the authored answer carries .ok, so
// `li:has(.ok:checked)` is "right" and `li:has(input:checked):not(:has(.ok:checked))` is "wrong" —
// evaluated by the browser, with no script and no answer key in the DOM text.
function wSort(s) {
  const buckets = (s.buckets || []).slice(0, 3);
  const items = (s.items || []).slice(0, 8);
  if (buckets.length < 2 || items.length < 2) return '';
  const g = uid('sort');
  return `<form class="w wsort" onsubmit="return false">
    <fieldset><legend class="ws-prompt">${esc(s.prompt || 'Which is which?')}</legend>
    <div class="ws-head"><span></span>${buckets.map((b) => `<span class="ws-bh">${esc(b)}</span>`).join('')}</div>
    <ul class="ws-list">${items.map((it, i) => `<li>
      <span class="ws-item">${esc(it.label)}</span>
      ${buckets.map((b, bi) => `<label class="ws-opt"><input type="radio" name="${g}-${i}"${bi === Number(it.bucket) ? ' class="ok"' : ''}><span class="sr-only">${esc(b)}</span></label>`).join('')}
      <span class="ws-fb"><b class="ws-yes">✓</b><b class="ws-no">✗</b>${it.why ? `<em>${esc(it.why)}</em>` : ''}</span>
    </li>`).join('')}</ul>
    <label class="ws-check"><input type="checkbox" class="wsc-toggle"><span>Check my answers</span></label>
    </fieldset></form>`;
}

// ---- 5. quadrant — two axes ------------------------------------------------------------------
function wQuadrant(s) {
  const items = (s.items || []).slice(0, 8);
  if (!items.length) return '';
  return `<figure class="w wquad"><div class="wq-box" role="img"
      aria-label="${esc((s.x || {}).left)}–${esc((s.x || {}).right)} against ${esc((s.y || {}).bottom)}–${esc((s.y || {}).top)}">
    <span class="wq-yt">${esc((s.y || {}).top)}</span><span class="wq-yb">${esc((s.y || {}).bottom)}</span>
    <span class="wq-xl">${esc((s.x || {}).left)}</span><span class="wq-xr">${esc((s.x || {}).right)}</span>
    ${items.map((it) => `<span class="wq-pt" style="left:${clamp(it.x, 0, 100)}%;bottom:${clamp(it.y, 0, 100)}%"><b>${esc(it.label)}</b></span>`).join('')}
  </div></figure>`;
}

// ---- 6. anatomy — a schematic with hotspots ---------------------------------------------------
const SHAPES = {
  'receptor-ring': '<circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" stroke-width="2.5" opacity=".5"/><circle cx="50" cy="50" r="9" fill="currentColor" opacity=".18"/>',
  synapse: '<rect x="8" y="12" width="84" height="24" rx="8" fill="none" stroke="currentColor" stroke-width="2" opacity=".45"/><rect x="8" y="64" width="84" height="24" rx="8" fill="none" stroke="currentColor" stroke-width="2" opacity=".45"/>',
  'arm-joint': '<line x1="26" y1="12" x2="26" y2="52" stroke="currentColor" stroke-width="4" opacity=".5"/><line x1="26" y1="52" x2="74" y2="76" stroke="currentColor" stroke-width="4" opacity=".5"/><circle cx="26" cy="52" r="5" fill="none" stroke="currentColor" stroke-width="2"/>',
  'cell-membrane': '<path d="M0,38 H100 M0,52 H100" stroke="currentColor" stroke-width="2" opacity=".45"/>',
};
function wAnatomy(s) {
  const hs = (s.hotspots || []).slice(0, 8);
  const base = SHAPES[s.shape] || SHAPES['cell-membrane'];
  if (!hs.length) return '';
  return `<figure class="w wana"><svg viewBox="0 0 100 100" role="img" aria-label="${esc(s.shape || 'schematic')}">
    ${base}${hs.map((h, i) => {
      const [x, y] = h.at || [50, 50];
      return `<g class="wa-hs"><circle cx="${clamp(x, 0, 100)}" cy="${clamp(y, 0, 100)}" r="3.6"/><text x="${clamp(x, 0, 100)}" y="${clamp(y, 0, 100) - 6}" text-anchor="middle">${i + 1}</text></g>`;
    }).join('')}</svg>
    <ol class="wa-key">${hs.map((h) => `<li><b>${esc(h.label)}</b>${h.note ? ` — ${esc(h.note)}` : ''}</li>`).join('')}</ol>
  </figure>`;
}

const RENDER = { scale: wScale, compare: wCompare, flow: wFlow, sort: wSort, quadrant: wQuadrant, anatomy: wAnatomy };

// A widget is an aid, never the content. It always sits BESIDE the prose, never replaces it — the
// owner was explicit that the writing is good and must all stay.
function widgetHtml(w) {
  if (!w || !w.type || w.type === 'none') return '';
  const fn = RENDER[w.type];
  if (!fn) return '';
  const inner = fn(w.spec || {});
  if (!inner) return '';
  return `<aside class="wwrap" aria-label="${esc(w.title || 'Synthesis aid')}">
    <p class="ww-t">${esc(w.title || '')}</p>${inner}</aside>`;
}

module.exports = { widgetHtml, RENDER };
