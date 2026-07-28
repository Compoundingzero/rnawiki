// build/figures.js — ANIMATED ANATOMY FIGURES for muscle action strings.
//
// WHY THIS EXISTS
// Felix, reading /muscle/biceps: "the viewer of the page has no way to visualise or understand what
// elbow flexion is." He was right, and it is the single worst gap on the anatomy pages. The site
// listed 61 action strings across 17 muscles — "Elbow flexion", "Forearm supination (palm-up
// rotation)", "Scapular retraction" — as bare text. Anyone who already knows the vocabulary needs no
// help; anyone who doesn't gets nothing. That is the exact opposite of who this site is for.
//
// HOW IT WORKS, AND WHY THIS WAY
// Every figure is an inline <svg> animated with CSS keyframes. No JavaScript, no library, no image
// files. That matters here more than usual:
//   - it renders in the PRERENDERED document, so the ~90% of traffic that never runs JS sees the
//     animation too. A JS-driven canvas or a Sketchfab viewer API call would reach almost nobody.
//   - it costs zero network requests and survives the CSP untouched.
//   - Sketchfab's embed cannot be driven per-action without their JS viewer API, which would mean a
//     third-party script, a CSP hole, and a hard dependency on someone else's uptime for the single
//     most important explanatory element on the page.
// Each figure carries a real ARIA label describing the movement, so the meaning survives for a
// screen reader and in the accessibility tree, not just visually.
//
// The figures are computed ONCE at build time by parse.js and stored in site/data.js as
// `muscle.anatomy.action_figures[i]`, aligned by index with `anatomy.actions[i]`. Both renderers
// then just print a string. That is deliberate: this codebase already carries several
// hand-maintained "twin" functions across app.js and prerender.js (mdSafe/mdInline,
// pathwayDiagram/pathwayDiagramHtml) and every one of them has drifted at least once. A precomputed
// string cannot drift.

const C = {
  bone: '#94a3b8',      // the part that stays put
  move: '#0d9488',      // the part the muscle moves — always teal, consistently, on every figure
  arrow: '#d97706',
  ghost: '#cbd5e1',     // start-position ghost, so the range of motion is legible even when paused
  text: '#475569',
};

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---- primitives ------------------------------------------------------------------------------
const seg = (x1, y1, x2, y2, col, w) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${w || 7}" stroke-linecap="round"/>`;
const joint = (x, y) => `<circle cx="${x}" cy="${y}" r="4.2" fill="#fff" stroke="${C.bone}" stroke-width="2.2"/>`;
const head = (x, y, r, col) => `<circle cx="${x}" cy="${y}" r="${r || 11}" fill="none" stroke="${col || C.bone}" stroke-width="3"/>`;

// A curved arrow showing the DIRECTION of travel — without it a paused figure is ambiguous about
// which way the movement goes.
function arc(cx, cy, r, a0, a1, col) {
  const p = (a) => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)];
  const [x0, y0] = p(a0); const [x1, y1] = p(a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const sweep = a1 > a0 ? 1 : 0;
  return `<path d="M${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 ${large} ${sweep} ${x1.toFixed(1)},${y1.toFixed(1)}"
    fill="none" stroke="${col || C.arrow}" stroke-width="2.4" marker-end="url(#afig-ar)" opacity=".85"/>`;
}

// The moving group. `a0`->`a1` are degrees about (ox,oy); CSS interpolates them. Custom properties
// are read inside the shared @keyframes in styles.css, so one keyframe rule drives every figure.
const swing = (inner, ox, oy, a0, a1, dur) =>
  `<g class="afig-move" style="--ox:${ox}px;--oy:${oy}px;--a0:${a0}deg;--a1:${a1}deg;--dur:${dur || 2.6}s">${inner}</g>`;

const flip = (inner, ox, oy, dur) =>
  `<g class="afig-flip" style="--ox:${ox}px;--oy:${oy}px;--dur:${dur || 2.8}s">${inner}</g>`;

// ---- the poses -------------------------------------------------------------------------------
// Each returns { svg, alt }. Keep every canvas 200x150 so figures tile evenly in a grid.
const POSES = {
  elbow: (dir) => {
    const shoulder = [66, 26], elbow = [66, 80];
    const fore = seg(0, 0, 0, 52, C.move, 8) + `<circle cx="0" cy="52" r="5.5" fill="${C.move}"/>`;
    const a1 = dir === 'extension' ? 0 : -138, a0 = dir === 'extension' ? -138 : 0;
    return {
      svg: head(66, 12, 9) + seg(shoulder[0], shoulder[1], elbow[0], elbow[1], C.bone, 8) +
        `<g opacity=".28">${seg(elbow[0], elbow[1], elbow[0], elbow[1] + 52, C.ghost, 8)}</g>` +
        `<g transform="translate(${elbow[0]},${elbow[1]})">${swing(fore, 0, 0, a0, a1)}</g>` +
        joint(elbow[0], elbow[1]) + arc(elbow[0], elbow[1], 40, 88, dir === 'extension' ? 20 : 4),
      alt: `The upper arm stays still while the forearm swings at the elbow — ${dir === 'extension' ? 'straightening the arm' : 'bending the arm up towards the shoulder'}.`,
    };
  },
  shoulder: (dir) => {
    const sh = [78, 42];
    const arm = seg(0, 0, 0, 58, C.move, 8) + `<circle cx="0" cy="58" r="5.5" fill="${C.move}"/>`;
    const rng = dir === 'abduction' ? [0, -95] : dir === 'adduction' ? [-95, 0]
      : dir === 'extension' ? [0, 38] : [0, -110];
    return {
      svg: head(78, 20, 10) + seg(78, 32, 78, 108, C.bone, 9) +
        `<g opacity=".28">${seg(sh[0], sh[1], sh[0], sh[1] + 58, C.ghost, 8)}</g>` +
        `<g transform="translate(${sh[0]},${sh[1]})">${swing(arm, 0, 0, rng[0], rng[1])}</g>` +
        joint(sh[0], sh[1]) + arc(sh[0], sh[1], 46, 84, rng[1] < 0 ? 6 : 120),
      alt: `The torso stays still while the whole arm swings at the shoulder (${dir}).`,
    };
  },
  hip: (dir) => {
    const hp = [80, 58];
    const leg = seg(0, 0, 0, 62, C.move, 8) + seg(0, 62, 14, 62, C.move, 6);
    const rng = dir === 'extension' ? [0, 30] : dir === 'abduction' ? [0, -42]
      : dir === 'adduction' ? [-42, 0] : [0, -78];
    return {
      svg: head(80, 20, 9) + seg(80, 30, 80, 58, C.bone, 9) +
        `<g opacity=".28">${seg(hp[0], hp[1], hp[0], hp[1] + 62, C.ghost, 8)}</g>` +
        `<g transform="translate(${hp[0]},${hp[1]})">${swing(leg, 0, 0, rng[0], rng[1])}</g>` +
        joint(hp[0], hp[1]) + arc(hp[0], hp[1], 50, 84, rng[1] < 0 ? 20 : 116),
      alt: `The trunk stays still while the whole leg swings at the hip (${dir}).`,
    };
  },
  knee: (dir) => {
    const kn = [80, 74];
    const shin = seg(0, 0, 0, 48, C.move, 8) + seg(0, 48, 15, 48, C.move, 6);
    const rng = dir === 'extension' ? [118, 0] : [0, 118];
    return {
      svg: seg(80, 18, 80, 74, C.bone, 9) +
        `<g opacity=".28">${seg(kn[0], kn[1], kn[0], kn[1] + 48, C.ghost, 8)}</g>` +
        `<g transform="translate(${kn[0]},${kn[1]})">${swing(shin, 0, 0, rng[0], rng[1])}</g>` +
        joint(kn[0], kn[1]) + arc(kn[0], kn[1], 40, 86, dir === 'extension' ? 86 : 176),
      alt: `The thigh stays still while the lower leg swings at the knee — ${dir === 'extension' ? 'straightening the knee' : 'bending the heel back towards the buttock'}.`,
    };
  },
  ankle: (dir) => {
    const an = [86, 86];
    const foot = seg(0, 0, 34, 0, C.move, 8);
    const rng = dir === 'dorsiflexion' ? [0, -32] : [0, 40];
    return {
      svg: seg(86, 22, 86, 86, C.bone, 9) +
        `<g opacity=".28">${seg(an[0], an[1], an[0] + 34, an[1], C.ghost, 8)}</g>` +
        `<g transform="translate(${an[0]},${an[1]})">${swing(foot, 0, 0, rng[0], rng[1])}</g>` +
        joint(an[0], an[1]) + arc(an[0], an[1], 44, 4, rng[1] < 0 ? -34 : 40),
      alt: dir === 'dorsiflexion'
        ? 'The shin stays still while the foot pulls the toes up towards the shin.'
        : 'The shin stays still while the foot points the toes down, as in rising onto tiptoe.',
    };
  },
  // Supination/pronation is a rotation about the forearm's LONG axis, so a swinging segment cannot
  // show it. Flip a palm glyph instead — the thumb marker is what makes the direction readable.
  supination: (dir) => {
    // NO TEXT INSIDE THE FLIPPING GROUP. scaleX(-1) mirrors glyphs too, so the first version of
    // this animated the word "palm" into "mlaq" — a nonsense string, on the page, twice per cycle.
    // The thumb marker carries the direction instead; it is what a reader actually tracks.
    const palm = `<ellipse cx="0" cy="0" rx="26" ry="17" fill="${C.move}" fill-opacity=".2" stroke="${C.move}" stroke-width="3"/>` +
      `<circle cx="-20" cy="10" r="6" fill="${C.move}"/>` +
      `<path d="M-20,10 L-30,2" stroke="${C.move}" stroke-width="3.5" stroke-linecap="round"/>`;
    return {
      svg: seg(100, 14, 100, 68, C.bone, 8) + joint(100, 68) +
        `<g transform="translate(100,96)">${flip(palm, 0, 0)}</g>` +
        arc(100, 96, 40, 200, 340) +
        `<text x="100" y="134" text-anchor="middle" font-size="11" font-weight="700" fill="${C.move}">${dir === 'pronation' ? 'palm turns DOWN' : 'palm turns UP'}</text>` +
        `<text x="100" y="147" text-anchor="middle" font-size="9" fill="${C.text}">dot = thumb</text>`,
      alt: dir === 'pronation'
        ? 'The forearm rotates about its own long axis so the palm turns to face downwards.'
        : 'The forearm rotates about its own long axis so the palm turns to face upwards — the movement that drives a screwdriver or turns a doorknob.',
    };
  },
  rotation: (dir) => {
    const inner = `<ellipse cx="0" cy="0" rx="26" ry="9" fill="none" stroke="${C.move}" stroke-width="3"/>` +
      `<circle cx="26" cy="0" r="5.5" fill="${C.move}"/>`;
    return {
      svg: head(100, 26, 10) + seg(100, 38, 100, 104, C.bone, 9) +
        `<g transform="translate(100,70)">${flip(inner, 0, 0, 3.2)}</g>` +
        arc(100, 70, 36, 200, 340) +
        `<text x="100" y="132" text-anchor="middle" font-size="10.5" fill="${C.text}">turns ${dir === 'external' ? 'outward' : dir === 'internal' ? 'inward' : 'about its own axis'}</text>`,
      alt: `The segment turns about its own long axis (${dir || ''} rotation) rather than bending at a joint.`,
    };
  },
  trunk: (dir) => {
    // Side-bending is drawn FROM THE FRONT and flexion/extension from the SIDE. Drawn in the same
    // view they were three near-identical tilted sticks — the reader could not tell which was
    // which, which is the same as having no figure.
    if (dir === 'side') {
      const body = `<path d="M0,0 Q14,30 8,60" fill="none" stroke="${C.move}" stroke-width="8" stroke-linecap="round"/>` +
        `<circle cx="-2" cy="-16" r="11" fill="none" stroke="${C.move}" stroke-width="3"/>` +
        `<line x1="-22" y1="6" x2="22" y2="6" stroke="${C.move}" stroke-width="5" stroke-linecap="round"/>`;
      return {
        svg: `<g opacity=".25"><path d="M100,34 L100,94" fill="none" stroke="${C.ghost}" stroke-width="8" stroke-linecap="round"/>` +
          `<circle cx="100" cy="18" r="11" fill="none" stroke="${C.ghost}" stroke-width="3"/></g>` +
          `<g transform="translate(100,34)">${swing(body, 0, 0, -14, 14, 3.4)}</g>` +
          seg(74, 100, 126, 100, C.bone, 7) +
          `<text x="100" y="126" text-anchor="middle" font-size="10.5" fill="${C.text}">bends side to side (front view)</text>`,
        alt: 'Seen from the front, the spine bends over to one side and back — the trunk itself is the moving part.',
      };
    }
    const back = dir === 'extension';
    // A pronounced C, not a near-straight Q — the curve IS the information.
    const spine = back
      ? `<path d="M0,0 C-18,22 -18,44 -4,66" fill="none" stroke="${C.move}" stroke-width="8" stroke-linecap="round"/>`
      : `<path d="M0,0 C22,20 24,44 8,66" fill="none" stroke="${C.move}" stroke-width="8" stroke-linecap="round"/>`;
    const hd = back ? `<circle cx="-4" cy="-16" r="11" fill="none" stroke="${C.move}" stroke-width="3"/>`
      : `<circle cx="10" cy="-14" r="11" fill="none" stroke="${C.move}" stroke-width="3"/>`;
    return {
      svg: `<g opacity=".25"><path d="M100,32 L100,96" fill="none" stroke="${C.ghost}" stroke-width="8" stroke-linecap="round"/>` +
        `<circle cx="100" cy="16" r="11" fill="none" stroke="${C.ghost}" stroke-width="3"/></g>` +
        `<g transform="translate(100,32)">${swing(spine + hd, 0, 0, 0, back ? -14 : 16, 3)}</g>` +
        seg(74, 100, 126, 100, C.bone, 7) +
        arc(100, 62, 44, back ? 200 : -20, back ? 170 : 20) +
        `<text x="100" y="126" text-anchor="middle" font-size="10.5" fill="${C.text}">${back ? 'arches back (side view)' : 'curls forward (side view)'}</text>`,
      alt: `Seen from the side, the spine ${back ? 'arches backwards' : 'curls forwards into a C'} — the trunk itself is the moving part.`,
    };
  },
  scapula: (dir) => {
    const blade = (x) => `<rect x="${x}" y="-16" width="20" height="32" rx="4" fill="${C.move}" fill-opacity=".25" stroke="${C.move}" stroke-width="2.6"/>`;
    const d = dir === 'protraction' ? 16 : dir === 'elevation' ? 0 : -16;
    const dy = dir === 'elevation' ? -14 : 0;
    return {
      svg: `<ellipse cx="100" cy="70" rx="42" ry="46" fill="none" stroke="${C.bone}" stroke-width="3"/>` +
        `<g class="afig-slide" style="--dx:${d}px;--dy:${dy}px;--dur:2.8s"><g transform="translate(52,70)">${blade(0)}</g></g>` +
        `<g class="afig-slide" style="--dx:${-d}px;--dy:${dy}px;--dur:2.8s"><g transform="translate(128,70)">${blade(0)}</g></g>` +
        `<text x="100" y="132" text-anchor="middle" font-size="10.5" fill="${C.text}">shoulder blades ${dir === 'protraction' ? 'spread apart' : dir === 'elevation' ? 'lift' : 'pinch together'}</text>`,
      alt: `The shoulder blades slide across the ribcage — ${dir === 'protraction' ? 'spreading apart' : dir === 'elevation' ? 'lifting towards the ears' : 'pinching together behind the back'}.`,
    };
  },
  neck: () => ({
    svg: seg(100, 60, 100, 108, C.bone, 9) +
      `<g opacity=".28">${head(100, 34, 13, C.ghost)}</g>` +
      `<g transform="translate(100,60)">${swing(head(0, -26, 13, C.move), 0, 0, -20, 20, 3.2)}</g>` +
      `<text x="100" y="132" text-anchor="middle" font-size="10.5" fill="${C.text}">head tilts / turns</text>`,
    alt: 'The head tilts and turns on top of a still torso.',
  }),
  // "Anti-extension", "resist rotation", "segmental stability" — the core's real job. The whole
  // point is that NOTHING moves, so animating the segment would teach the opposite of the truth.
  // Animate the FORCE instead, and hold the body rigid.
  brace: (where) => {
    // A trunk silhouette is simply wrong for "stabilise the elbow in pressing". Draw the segment
    // that is actually being held, with the force arrows either side of THAT joint.
    const RIG = {
      elbow: seg(66, 26, 66, 80, C.bone, 8) + seg(66, 80, 110, 96, C.move, 8) + joint(66, 80),
      knee: seg(80, 18, 80, 74, C.bone, 9) + seg(80, 74, 112, 112, C.move, 8) + joint(80, 74),
      shoulder: head(78, 20, 10) + seg(78, 32, 78, 104, C.bone, 9) + seg(78, 42, 128, 60, C.move, 8) + joint(78, 42),
      pelvis: head(100, 20, 9) + seg(100, 30, 100, 62, C.bone, 9) + seg(76, 62, 124, 62, C.move, 9) + seg(100, 62, 100, 120, C.bone, 8),
      neck: seg(100, 56, 100, 108, C.bone, 9) + head(100, 32, 12, C.move) + joint(100, 56),
    };
    if (RIG[where]) {
      return {
        svg: RIG[where] +
          `<g class="afig-push" style="--dur:1.5s">${arc(100, 62, 44, 172, 205)}</g>` +
          `<g class="afig-push" style="--dur:1.5s;--delay:.75s">${arc(100, 62, 44, 8, -25)}</g>` +
          `<text x="100" y="140" text-anchor="middle" font-size="10.5" font-weight="700" fill="${C.move}">holds position</text>`,
        alt: `Force pushes from both sides while the ${where} is held steady — this muscle works by resisting movement, not producing it.`,
      };
    }
    return {
    svg: head(100, 22, 10) + seg(100, 34, 100, 96, C.move, 9) + seg(74, 96, 126, 96, C.bone, 7) +
      `<g class="afig-push" style="--dur:1.5s">${arc(100, 62, 40, 170, 205)}` +
      `<text x="30" y="66" font-size="10" fill="${C.arrow}">force</text></g>` +
      `<g class="afig-push" style="--dur:1.5s;--delay:.75s">${arc(100, 62, 40, 10, -25)}` +
      `<text x="150" y="66" font-size="10" fill="${C.arrow}">force</text></g>` +
      `<text x="100" y="130" text-anchor="middle" font-size="10.5" font-weight="700" fill="${C.move}">stays still</text>`,
    alt: 'Force pushes from both sides while the trunk does not move — the muscle works by resisting movement, not producing it.',
    };
  },
  ribs: () => ({
    svg: `<g class="afig-breathe" style="--dur:3.4s">` +
      [0, 1, 2, 3].map((i) => `<path d="M72,${44 + i * 15} Q100,${52 + i * 15} 128,${44 + i * 15}" fill="none" stroke="${C.move}" stroke-width="4" stroke-linecap="round"/>`).join('') +
      `</g><line x1="100" y1="34" x2="100" y2="106" stroke="${C.bone}" stroke-width="7" stroke-linecap="round"/>` +
      `<text x="100" y="130" text-anchor="middle" font-size="10.5" fill="${C.text}">ribcage lifts and widens</text>`,
    alt: 'The ribs lift and the ribcage widens to draw air in.',
  }),
  generic: (label) => ({
    svg: head(100, 24, 10) + seg(100, 36, 100, 96, C.move, 9) + seg(76, 96, 124, 96, C.bone, 7) +
      seg(100, 52, 74, 74, C.bone, 7) + seg(100, 52, 126, 74, C.bone, 7) +
      `<text x="100" y="126" text-anchor="middle" font-size="10.5" fill="${C.text}">${esc(label).slice(0, 30)}</text>`,
    alt: 'Diagram of the body region this action involves.',
  }),
};

// ---- classify a free-text action string ------------------------------------------------------
function classify(txt) {
  const t = String(txt || '').toLowerCase();
  const dir = /extension|extends|extend|straighten/.test(t) ? 'extension'
    : /abduct/.test(t) ? 'abduction'
    : /adduct/.test(t) ? 'adduction'
    : /dorsiflex/.test(t) ? 'dorsiflexion'
    : /plantarflex/.test(t) ? 'plantarflexion'
    : /protract/.test(t) ? 'protraction'
    : /elevat/.test(t) ? 'elevation'
    : /side-bend|side bend|lateral flex/.test(t) ? 'side'
    : 'flexion';

  // Anti-movement first: "resist extension" contains "extension" but is the opposite of it, and
  // reading the verb before the negation gets it exactly backwards.
  // NOTE the \w* on stabilis/stabiliz. `\bstabilis\b` cannot match "stabilisation" — the word does
  // not end there — and that one missing quantifier sent 5 of 61 strings to the wrong figure,
  // including "Stabilise the elbow in pressing", which was drawing an elbow BENDING.
  // `bracing` did not match "brace the spine", so transversus abdominis — a muscle whose entire
  // job is to NOT move the spine — was rendered curling it forward. That is a figure teaching the
  // opposite of the fact. Same class of miss as `\bstabilis\b`: guessing at word endings.
  if (/\b(resist|anti-|anti |stabilis\w*|stabiliz\w*|segmental stability|control|brac\w*|compress\w*|posture|postural|balance|tracking|decelerat\w*|eccentric|isometric)/.test(t)) {
    if (/scapul/.test(t)) return ['scapula', 'retraction'];
    if (/elbow/.test(t)) return ['brace', 'elbow'];
    if (/knee|patell/.test(t)) return ['brace', 'knee'];
    // neck BEFORE shoulder: "hold the head over the shoulders" is a neck action that merely
    // mentions the shoulders, and checking shoulder first drew the wrong joint.
    if (/neck|cervical|\bhead\b/.test(t)) return ['brace', 'neck'];
    if (/shoulder|humerus/.test(t)) return ['brace', 'shoulder'];
    if (/pelvi|hip|single-leg|stance/.test(t)) return ['brace', 'pelvis'];
    return ['brace', null];
  }
  if (/\b(breath|respirat|ribs|ribcage)/.test(t)) return ['ribs', null];
  if (/supinat/.test(t)) return ['supination', 'supination'];
  if (/pronat/.test(t)) return ['supination', 'pronation'];
  if (/scapul/.test(t)) return ['scapula', dir === 'flexion' ? 'retraction' : dir];
  if (/\b(elbow)\b/.test(t)) return ['elbow', dir];
  if (/\b(knee)\b/.test(t)) return ['knee', dir];
  if (/\b(ankle|plantarflex\w*|dorsiflex\w*|calf|heel|toe)/.test(t)) return ['ankle', dir];
  if (/\b(hip|thigh|femur)\b/.test(t)) return ['hip', dir];
  if (/\b(shoulder|humerus|glenohumeral|arm)\b/.test(t)) return ['shoulder', dir];
  if (/\b(neck|head|cervical)\b/.test(t)) return ['neck', null];
  if (/\b(trunk|spine|spinal|lumbar|thoracic|vertebral|back|torso|pelvis)\b/.test(t)) return ['trunk', dir];
  if (/\b(wrist|finger|grip|deviation|forearm)\b/.test(t)) return ['supination', dir === 'extension' ? 'pronation' : 'supination'];
  // Rotation is checked LAST: almost every joint string can also mention rotation, and the joint is
  // the more useful thing to draw when we know it.
  if (/rotat/.test(t)) return ['rotation', /external|posterior/.test(t) ? 'external' : /internal|anterior/.test(t) ? 'internal' : null];
  return ['generic', null];
}

// ---- public -----------------------------------------------------------------------------------
function actionFigure(action) {
  const label = String(action || '').trim();
  if (!label) return '';
  const [pose, dir] = classify(label);
  const built = (POSES[pose] || POSES.generic)(pose === 'generic' ? label : dir);
  // The <title> is what a screen reader announces, and it is also what survives if CSS never loads.
  return `<figure class="afig">
    <svg viewBox="0 0 200 150" role="img" focusable="false">
      <title>${esc(label)}: ${esc(built.alt)}</title>
      <defs><marker id="afig-ar" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 z" fill="${C.arrow}"/></marker></defs>
      ${built.svg}
    </svg>
    <figcaption><b>${esc(label)}</b><span>${esc(built.alt)}</span></figcaption>
  </figure>`;
}

module.exports = { actionFigure, classify };

// ================================================================================================
// ANIMATED SIGNAL CASCADE (2026-07-28)
//
// Felix on /pathway/6: "not enough visuals, too many words, more boring than a textbook. Research
// how people make learning such things fun."
//
// The honest finding from that research is that the two things with the strongest evidence behind
// them are not games or gimmicks — they are (1) seeing the process MOVE, and (2) being made to
// PREDICT what happens next before being told. Both were already possible here and neither was
// happening:
//   - every pathway is a sequence of 5-12 mechSteps and the page rendered them as a numbered list
//     of paragraphs. A cascade that does not move does not read as a cascade.
//   - 235 of 340 mechSteps carry an authored `predict` prompt — a written-out prediction question —
//     and `prerender.js` referenced `predict` ZERO times. The single best-evidenced learning device
//     in the corpus was invisible to the ~90% of traffic that never runs JS.
//
// So: draw the chain, run a pulse down it, light each node as the pulse arrives, and let the reader
// step through it. CSS only — the pulse must reach the readers who do not execute JavaScript, which
// is almost all of them.
const CC = { node: '#0d9488', dim: '#cbd5e1', line: '#94a3b8', text: '#334155', tag: '#64748b', fx: '#b5533a' };

function cascadeFigure(steps, title) {
  const S = (steps || []).filter((s) => s && (s.t || s.d));
  if (S.length < 3) return '';                       // 2 boxes and an arrow is not worth the space
  const W = 340, BH = 52, GAP = 26, PAD = 16;
  const H = PAD * 2 + S.length * BH + (S.length - 1) * GAP;
  const cycle = Math.max(6, S.length * 1.15);        // one full trip down the chain
  const wrap = (t, n) => {                           // crude but predictable two-line wrap
    const w = String(t || '').split(/\s+/); const out = []; let cur = '';
    for (const x of w) { if ((cur + ' ' + x).trim().length > n) { out.push(cur.trim()); cur = x; } else cur += ' ' + x; }
    if (cur.trim()) out.push(cur.trim());
    return out.slice(0, 2);
  };
  let body = '';
  S.forEach((s, i) => {
    const y = PAD + i * (BH + GAP);
    const delay = (i * cycle / S.length).toFixed(2);
    const lines = wrap(s.t || s.d, 34);
    body += `<g class="casc-node" style="--d:${delay}s;--cycle:${cycle}s">
      <rect x="34" y="${y}" width="${W - 68}" height="${BH}" rx="10"/>
      <text class="casc-n" x="50" y="${y + BH / 2 + 5}">${i + 1}</text>
      ${lines.map((l, k) => `<text class="casc-t" x="70" y="${y + (lines.length === 1 ? BH / 2 + 4 : 20 + k * 15)}">${esc(l)}</text>`).join('')}
      ${s.tag ? `<text class="casc-tag" x="${W - 44}" y="${y + BH - 8}" text-anchor="end">${esc(String(s.tag).slice(0, 18))}</text>` : ''}
    </g>`;
    if (i < S.length - 1) {
      body += `<line class="casc-link" x1="${W / 2}" y1="${y + BH}" x2="${W / 2}" y2="${y + BH + GAP}"
        stroke="${CC.line}" stroke-width="2.4" marker-end="url(#casc-ar)"/>`;
    }
  });
  // The travelling pulse. It is the thing that makes this read as a signal rather than a flowchart.
  const pulse = `<circle class="casc-pulse" cx="${W / 2}" cy="0" r="7"
    style="--y0:${PAD + BH / 2}px;--y1:${PAD + (S.length - 1) * (BH + GAP) + BH / 2}px;--cycle:${cycle}s"/>`;
  return `<figure class="casc" aria-label="Animated diagram: the ${esc(title || 'pathway')} signal passing through ${S.length} steps in order.">
    <figcaption class="casc-cap"><b>Watch the signal travel</b><span>Each step lights up as the signal reaches it. ${S.length} steps, start to finish.</span></figcaption>
    <svg viewBox="0 0 ${W} ${H}" role="img">
      <title>The ${esc(title || 'pathway')} cascade: ${S.map((s, i) => (i + 1) + '. ' + esc(String(s.t || '').slice(0, 60))).join('; ')}</title>
      <defs><marker id="casc-ar" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 z" fill="${CC.line}"/></marker></defs>
      ${body}${pulse}
    </svg>
  </figure>`;
}

module.exports.cascadeFigure = cascadeFigure;
