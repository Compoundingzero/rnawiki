/**
 * The copy and the standalone document for an intentionally removed address.
 *
 * Two surfaces render this, and they must not drift apart:
 *
 *  - `app/gone/page.tsx` — the linkable explanation, rendered by React with the
 *    real design system, served 200.
 *  - `middleware.ts` — the body of the `410 Gone` responses for the predecessor
 *    product's removed routes.
 *
 * Middleware runs before any React render, so it cannot use the page component,
 * and the compiled stylesheet's filename is hashed at build time so it cannot be
 * linked either. The 410 body is therefore a self-contained document with its own
 * `<style>`. That block is a deliberate, bounded copy of the handful of rules from
 * `app/globals.css` this notice uses — same tokens, same values. It is duplicated
 * because a response produced outside the render has no other way to be styled;
 * keep the two in step by hand, and keep the subset small.
 *
 * The status code itself is not decided here. `middleware.ts` owns which paths are
 * 301 and which are 410; this module only supplies what a 410 says.
 */

export interface KeyValue {
  readonly key: string
  readonly value: string
}

export interface Destination {
  readonly href: string
  readonly label: string
  readonly note: string
}

export const GONE_EYEBROW = 'Removed page'

export const GONE_TITLE = 'This page was removed'

export const GONE_LEAD =
  'This address belonged to the earlier version of RNAwiki. It was withdrawn on purpose, and nothing here replaces it.'

export const GONE_REASON_HEADING = 'Why it was removed'

/** Describes what the removed pages did. Never restates it as instruction. */
export const GONE_REASON: readonly string[] = [
  'The earlier version answered a symptom questionnaire with a personal regimen. None of that output could be traced back to a study, so those pages were withdrawn rather than rebuilt.',
  'RNAwiki now records what a study measured, what is inferred from it, and where the evidence stops. It does not tell a reader what to take.',
]

export const GONE_DISPOSITION_HEADING = 'What happens to an old address'

export const GONE_DISPOSITIONS: readonly KeyValue[] = [
  { key: 'Renamed', value: 'Redirects to the new address. Nothing to do.' },
  { key: 'Corrected', value: 'Keeps its address. The change is listed under Changes.' },
  { key: 'Removed', value: 'Returns 410 Gone and shows this notice. No replacement exists.' },
]

export const GONE_DESTINATIONS_HEADING = 'Where to go instead'

export const GONE_DESTINATIONS: readonly Destination[] = [
  { href: '/compounds', label: 'All compounds', note: 'Every published compound record.' },
  { href: '/updates', label: 'Changes', note: 'What was corrected, added or reclassified, and when.' },
  { href: '/corrections', label: 'Report a broken link', note: 'If this address should still work, say so.' },
  { href: '/', label: 'RNAwiki home', note: 'Start from the index.' },
]

export const GONE_SEARCH_HEADING = 'Search the reference'

export const SEARCH_LABEL = 'Search a compound, claim or source'

/* -------------------------------------------------------------------------- */
/* standalone document (middleware only)                                       */
/* -------------------------------------------------------------------------- */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Bounded copy of the rules from app/globals.css that this notice uses. */
const STYLES = `
:root{
--canvas:#f4f6f3;--surface:#fff;--surface-sunk:#eef1ed;--ink:#111614;--ink-soft:#343b38;
--muted:#66706b;--border:#d5dcd7;--border-strong:#abb5af;--accent:#1748d1;--accent-hover:#10369f;
--font-serif:'Iowan Old Style',Palatino Linotype,Georgia,serif;
--font-sans:system-ui,-apple-system,Segoe UI,Helvetica Neue,sans-serif;
--font-mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
}
@media (prefers-color-scheme:dark){:root{
--canvas:#12150f;--surface:#171b15;--surface-sunk:#1f241d;--ink:#eef1e8;--ink-soft:#c9cfc3;
--muted:#8e978b;--border:#2f362b;--border-strong:#4a5344;--accent:#8fabff;--accent-hover:#b6c8ff;
}}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--canvas);color:var(--ink);font-family:var(--font-sans);
font-size:1.0625rem;line-height:1.65;-webkit-font-smoothing:antialiased}
main{max-width:44rem;margin-inline:auto;padding:3rem 1.5rem 6rem}
h1,h2{margin:0;font-weight:600;line-height:1.15;text-wrap:balance}
p{margin:0}
a{color:var(--accent);text-decoration-thickness:1px;text-underline-offset:.15em}
a:hover{color:var(--accent-hover)}
:where(a,button,input,summary):focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:2px}
.vh{position:absolute;left:-9999px;top:0}
.eyebrow{font-family:var(--font-mono);font-size:.6875rem;font-weight:500;letter-spacing:.08em;
text-transform:uppercase;color:var(--muted)}
.h1{font-family:var(--font-serif);font-size:clamp(1.75rem,1.3rem + 1.6vw,2.25rem);letter-spacing:-.012em;
margin:.75rem 0 1rem}
.h2{font-family:var(--font-serif);font-size:1.5rem;letter-spacing:-.008em}
.lead{font-size:1.1875rem;line-height:1.5;color:var(--ink-soft)}
.prose{color:var(--ink-soft)}
.prose p+p{margin-top:1rem}
.rule{border:0;border-top:1px solid var(--border);margin:3rem 0}
.section-head{display:flex;align-items:baseline;gap:1rem;margin-bottom:1rem}
.section-head::after{content:'';flex:1;height:1px;background:var(--border)}
.speclabel{display:grid;gap:0;margin:1.5rem 0 0;border-top:1px solid var(--border-strong);
border-bottom:1px solid var(--border-strong)}
.speclabel__row{display:grid;grid-template-columns:9.5rem minmax(0,1fr);gap:1rem;padding:.75rem 0;
align-items:baseline}
.speclabel__row+.speclabel__row{border-top:1px solid var(--border)}
.speclabel__key{font-family:var(--font-mono);font-size:.6875rem;font-weight:500;letter-spacing:.08em;
text-transform:uppercase;color:var(--muted)}
.speclabel__val{margin:0;font-family:var(--font-mono);font-size:.75rem;color:var(--ink);line-height:1.5;
overflow-wrap:anywhere}
@media (max-width:30rem){.speclabel__row{grid-template-columns:minmax(0,1fr);gap:.25rem}}
.rows{list-style:none;margin:0;padding:0;border-top:1px solid var(--border)}
.row{border-bottom:1px solid var(--border)}
.row__link{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:1rem;align-items:center;
padding:1rem .5rem;text-decoration:none;color:inherit;min-height:44px}
.row__link:hover{background:var(--surface-sunk)}
.row__name{font-family:var(--font-serif);font-size:1.0625rem;font-weight:600;color:var(--ink)}
.row__desc{font-size:.8125rem;color:var(--ink-soft);margin-top:.25rem}
.row__chev{font-family:var(--font-mono);color:var(--muted)}
@media (max-width:36rem){.row__link{grid-template-columns:minmax(0,1fr)}.row__chev{display:none}}
.searchform{display:flex;gap:.5rem;max-width:34rem;margin-top:1rem}
.field{font-family:var(--font-sans);font-size:1.0625rem;padding:.7em .9em;border-radius:4px;
border:1px solid var(--border-strong);background:var(--surface);color:var(--ink);width:100%;min-height:44px}
.field::placeholder{color:var(--muted)}
.btn{font-family:var(--font-sans);font-size:.8125rem;font-weight:500;padding:.6em 1.1em;border-radius:4px;
border:1px solid var(--accent);background:var(--accent);color:#fff;cursor:pointer;min-height:44px;flex:none}
.btn:hover{background:var(--accent-hover);border-color:var(--accent-hover)}
.wordmark{display:inline-flex;align-items:center;gap:.5rem;color:var(--ink);text-decoration:none;
font-family:var(--font-serif);font-size:1.15rem;font-weight:600;letter-spacing:-.01em;line-height:1}
.wordmark svg{display:block;flex:none}
@media print{body{background:#fff;color:#000}}
`.trim()

/**
 * The mark from components/brand/Wordmark.tsx, inlined. Same 24-unit grid and
 * same paths — a middleware response cannot import the React component, and a
 * text-only wordmark here would make the 410 page look like a different site
 * from /gone.
 */
const MARK_SVG =
  '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">' +
  '<path d="M4 3 V21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
  '<path d="M4 5.5 H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
  '<path d="M4 11 H15.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
  '<path d="M4 16.5 H12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
  '<path d="M4 21.5 H8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
  'stroke-dasharray="0.5 3" opacity="0.6"/></svg>'

function specRow(key: string, value: string): string {
  return `<div class="speclabel__row"><dt class="speclabel__key">${escapeHtml(key)}</dt><dd class="speclabel__val">${escapeHtml(value)}</dd></div>`
}

function destinationRow(d: Destination): string {
  return `<li class="row"><a class="row__link" href="${escapeHtml(d.href)}"><span><span class="row__name">${escapeHtml(
    d.label
  )}</span><span class="row__desc" style="display:block">${escapeHtml(
    d.note
  )}</span></span><span class="row__chev" aria-hidden="true">&rarr;</span></a></li>`
}

/**
 * The full `410 Gone` body. `requestedPath` is echoed back so the reader can see
 * which address is closed; it is escaped because it comes from the request.
 */
export function renderGoneDocument(requestedPath: string): string {
  return `<!doctype html>
<html lang="en-SG">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, follow">
<title>${escapeHtml(GONE_TITLE)} — RNAwiki</title>
<style>${STYLES}</style>
</head>
<body>
<main>
<a class="wordmark" href="/" aria-label="RNAwiki, home">${MARK_SVG}<span>RNAwiki</span></a>
<p class="eyebrow" style="margin-top:2rem">${escapeHtml(GONE_EYEBROW)}</p>
<h1 class="h1">${escapeHtml(GONE_TITLE)}</h1>
<p class="lead">${escapeHtml(GONE_LEAD)}</p>
<dl class="speclabel">
${specRow('Address', requestedPath)}
${specRow('Status', '410 Gone. Permanent, not a temporary error.')}
${specRow('Replacement', 'None recorded for this address.')}
</dl>
<hr class="rule">
<div class="section-head"><h2 class="h2">${escapeHtml(GONE_REASON_HEADING)}</h2></div>
<div class="prose">${GONE_REASON.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}</div>
<hr class="rule">
<div class="section-head"><h2 class="h2">${escapeHtml(GONE_DISPOSITION_HEADING)}</h2></div>
<dl class="speclabel" style="margin-top:0">
${GONE_DISPOSITIONS.map((d) => specRow(d.key, d.value)).join('\n')}
</dl>
<hr class="rule">
<div class="section-head"><h2 class="h2">${escapeHtml(GONE_SEARCH_HEADING)}</h2></div>
<form class="searchform" role="search" action="/search" method="get">
<label class="vh" for="gone-search">${escapeHtml(SEARCH_LABEL)}</label>
<input class="field" id="gone-search" name="q" type="search" placeholder="${escapeHtml(SEARCH_LABEL)}">
<button class="btn" type="submit">Search</button>
</form>
<hr class="rule">
<div class="section-head"><h2 class="h2">${escapeHtml(GONE_DESTINATIONS_HEADING)}</h2></div>
<ul class="rows">
${GONE_DESTINATIONS.map(destinationRow).join('\n')}
</ul>
</main>
</body>
</html>`
}
