// build/glossify.js — shared, DOM-free, string-level inline glossing.
// Used by build/prerender.js directly and shipped to the browser inside site/data.js for app.js.
'use strict';

// Elements whose text must never be glossed. Nested interactive content is invalid HTML
// (<label> inside <a> or <button>), headings are landmarks, <summary> is a control, and
// <dt> / <code> are already terms.
const SKIP_EL = new Set(['a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'summary', 'code', 'pre', 'kbd',
  'abbr', 'dfn', 'label', 'button', 'select', 'textarea', 'option', 'svg', 'script', 'style',
  'nav', 'dt', 'figcaption', 'th', 'caption']);
// Class names that mark furniture, chrome or already-terse text.
const SKIP_CLASS = ['pgl', 'crumbs', 'cpd-toc', 'pagetoc', 'badge', 'chip', 'pill', 'stars',
  'tag-row', 'dd-eyebrow', 'ddc-hint', 'dd-check', 'sr-only', 'spec-strip', 'counter', 'kicker',
  'section-title', 'ep-badge', 'stack-badge', 'mnode', 'tchip', 'tsym', 'lf-conn'];
// Void elements never push a scope.
const VOID_EL = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link',
  'meta', 'param', 'source', 'track', 'wbr']);

const RX_ESC = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Build the matcher once per glossary, not per page. Longest surface form first so
// "positive allosteric modulator" wins over "modulator" and "nmda receptor" over "receptor".
function compile(glossary) {
  const byForm = new Map();          // surface form (lowercase) -> canonical key
  for (const key of Object.keys(glossary)) {
    const e = glossary[key];
    if (!e || !e.d) continue;
    const forms = [key].concat(e.also || []);
    for (const f0 of forms) {
      const f = String(f0).toLowerCase().trim();
      if (!f) continue;
      byForm.set(f, key);
      // Mechanical plurals. Only added when they do not collide with another authored term.
      if (/[^s]$/.test(f)) { if (!byForm.has(f + 's')) byForm.set(f + 's', key); }
      if (/(ch|sh|ss|x|z)$/.test(f)) { if (!byForm.has(f + 'es')) byForm.set(f + 'es', key); }
      if (/y$/.test(f)) { const p = f.slice(0, -1) + 'ies'; if (!byForm.has(p)) byForm.set(p, key); }
      if (/is$/.test(f)) { const p = f.slice(0, -2) + 'es'; if (!byForm.has(p)) byForm.set(p, key); }
    }
  }
  const forms = [...byForm.keys()].sort((a, b) => b.length - a.length);
  // Boundaries are hand-rolled, not \b: \b treats "-" as a boundary, so "GABA" would match inside
  // "GABA-A" and "half-life" would match inside "long-half-life". A term may not be preceded or
  // followed by a letter, a digit, a hyphen, or an apostrophe.
  const re = new RegExp('(?<![A-Za-z0-9\\-\'’])(' + forms.map(RX_ESC).join('|') +
    ')(?![A-Za-z0-9\\-\'’])', 'gi');
  return { re, byForm };
}

const escText = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// The emitted unit. A definition is neither a preference nor an action, so it must not be exposed
// as a checkbox or button. The focusable ARIA term points to its adjacent role="definition". CSS
// reveals the definition while the term has focus, which keeps mouse, touch and keyboard use
// working without JavaScript. The per-page id is deterministic and only joins the two parts; it is
// not a public fragment. Every element remains phrasing content, so the unit is legal inside <p>,
// <li>, <dd> and <td>.
function unit(surface, key, def, n) {
  const defId = 'pgl-def-' + n;
  return '<span class="pgl">' +
    '<span class="pgl-t" role="term" tabindex="0" aria-describedby="' + defId + '">' + escText(surface) + '</span>' +
    '<span class="pgl-d" id="' + defId + '" role="definition"><b>' + escText(key) + '</b> — ' + escText(def) + '</span>' +
    '</span>';
}

/**
 * glossify(html, opts) -> { html, links, terms }
 *   opts.glossary   required, { term: {d, r, also} }
 *   opts.compiled   optional, result of compile() — pass it in to reuse across pages
 *   opts.suppress   iterable of canonical keys never to gloss on this page (its own subject)
 *   opts.perSection max glossed terms per section (default 2). A section boundary is any of
 *                   h2 / h3 / h4 / <section> / .section-title — see the note below.
 *   opts.perPage    upper guard, not a quota (default = max(4, words/140))
 *   opts.maxRank    only auto-link terms with r <= this (default 1). Rank 2 and 3 stay in the
 *                   glossary for the page term list and search, but are never auto-linked.
 */
function glossify(html, opts) {
  const o = opts || {};
  const glossary = o.glossary;
  if (!glossary || !html) return { html: html || '', links: 0, terms: [] };
  const C = o.compiled || compile(glossary);
  const perSection = o.perSection == null ? 2 : o.perSection;
  const maxRank = o.maxRank == null ? 1 : o.maxRank;
  // THE PAGE BUDGET IS A GUARD, NOT A QUOTA. Measured on the real corpus: a fixed page cap of 24
  // exhausted itself in the first 60% of every long course — deciles 8, 9 and 10 of /pathway/6
  // received ZERO glosses, which is precisely the reader who most needs them. So the section cap
  // does the work (uniform by construction) and the page number only exists to stop a 500-word
  // compound page with eight <h2> from turning into 16 dotted words. At words/140 it binds on
  // short pages and never on a 9,000-word course, which naturally lands around words/250.
  const wordCount = String(html).replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  const perPage = o.perPage == null ? Math.max(4, Math.ceil(wordCount / 140)) : o.perPage;
  const suppress = new Set([...(o.suppress || [])].map((s) => String(s).toLowerCase()));

  const src = String(html);
  const out = [];
  const scope = [];                 // open element stack: [{tag, skip}]
  let skipDepth = 0;                // >0 means "inside a skipped subtree"
  const seenPage = new Set();
  let seenSection = new Set();
  let nSection = 0, nPage = 0;
  let unitIndex = 0;
  const used = [];

  let i = 0;
  while (i < src.length) {
    const lt = src.indexOf('<', i);
    if (lt < 0) { out.push(transform(src.slice(i))); break; }
    if (lt > i) out.push(transform(src.slice(i, lt)));

    // Comments and doctype pass through untouched.
    if (src.startsWith('<!--', lt)) {
      const end = src.indexOf('-->', lt); const stop = end < 0 ? src.length : end + 3;
      out.push(src.slice(lt, stop)); i = stop; continue;
    }
    const gt = src.indexOf('>', lt);
    if (gt < 0) { out.push(transform(src.slice(lt))); break; }
    const tag = src.slice(lt, gt + 1);
    out.push(tag);
    i = gt + 1;

    const m = tag.match(/^<\s*(\/?)([a-zA-Z][a-zA-Z0-9-]*)/);
    if (!m) continue;
    const closing = m[1] === '/';
    const name = m[2].toLowerCase();
    const selfClose = /\/\s*>$/.test(tag) || VOID_EL.has(name);

    // SECTION BOUNDARY. Measured: /pathway/6 prerendered has 18 <h2> and 0 <h3>; the SAME page
    // hydrated has 0 <h2> and 22 <h3>. Keying the budget on <h2> alone gave 35 glosses in one
    // document and 2 in the other. So the boundary is any of h2/h3/h4, a <section>, or the
    // house .section-title div — the union both renderers actually emit.
    if (!closing && (name === 'h2' || name === 'h3' || name === 'h4' || name === 'section' ||
        / class\s*=\s*["'][^"']*\bsection-title\b/.test(tag))) {
      seenSection = new Set(); nSection = 0;
    }

    if (selfClose) continue;
    if (closing) {
      // Pop to the matching open tag. Tolerates unbalanced markup without corrupting skipDepth.
      for (let k = scope.length - 1; k >= 0; k--) {
        if (scope[k].tag === name) {
          for (let j = scope.length - 1; j >= k; j--) { if (scope[j].skip) skipDepth--; scope.pop(); }
          break;
        }
      }
      continue;
    }
    const cls = (tag.match(/\sclass\s*=\s*"([^"]*)"/i) || tag.match(/\sclass\s*=\s*'([^']*)'/i) || [, ''])[1];
    const classList = cls.split(/\s+/).filter(Boolean);
    const skip = SKIP_EL.has(name) || classList.some((c) => SKIP_CLASS.includes(c));
    scope.push({ tag: name, skip });
    if (skip) skipDepth++;
  }

  function transform(text) {
    if (skipDepth > 0 || !text || text.length < 4) return text;
    if (nPage >= perPage || nSection >= perSection) return text;
    C.re.lastIndex = 0;
    let res = '', last = 0, mm;
    while ((mm = C.re.exec(text))) {
      if (nPage >= perPage || nSection >= perSection) break;
      const surface = mm[1];
      const key = C.byForm.get(surface.toLowerCase());
      if (!key) continue;
      // Never gloss inside an HTML entity ("&amp;", "&nbsp;") — the escaped text is the input.
      const beforeChunk = text.slice(Math.max(0, mm.index - 10), mm.index);
      if (/&[a-zA-Z]{0,8}$/.test(beforeChunk)) continue;
      if (suppress.has(key)) continue;
      if (seenSection.has(key)) continue;   // one gloss per term per SECTION, not per page
      const e = glossary[key];
      if (!e || !e.d) continue;
      if ((e.r || 2) > maxRank) continue;
      res += text.slice(last, mm.index) + unit(surface, key, e.d, ++unitIndex);
      last = mm.index + surface.length;
      seenSection.add(key);
      if (!seenPage.has(key)) { seenPage.add(key); used.push(key); }
      nSection++; nPage++;
    }
    return last ? res + text.slice(last) : text;
  }

  return { html: out.join(''), links: nPage, terms: used };
}

module.exports = { glossify, compile };
