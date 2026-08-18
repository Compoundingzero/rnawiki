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

/**
 * Bounded copy of the rules from app/globals.css that this notice uses — same tokens, same
 * values, same class names. Keep it in step with that file by hand, and keep the subset small.
 */
const STYLES = `
:root{
--bg:#fff;--bg-soft:#f5f5f7;--text:#1d1d1f;--text-soft:#6e6e73;--border:#d2d2d7;--border-soft:#e6e6ea;
--action:#0066cc;--action-hover:#0052a6;
--s1:4px;--s2:8px;--s3:12px;--s4:16px;--s5:24px;--s7:48px;--s8:64px;
--radius:12px;--radius-sm:8px;--measure:42rem;--page:70rem;
--font:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--text);font-family:var(--font);font-size:17px;
line-height:1.6;-webkit-font-smoothing:antialiased}
h1,h2{margin:0;line-height:1.2;font-weight:600;letter-spacing:-.015em;text-wrap:balance}
h1{font-size:clamp(2.125rem,1.4rem + 3vw,3.25rem)}
h2{font-size:clamp(1.5rem,1.2rem + 1.2vw,1.875rem)}
p{margin:0}
ul{margin:0;padding:0}
a{color:var(--action);text-underline-offset:.15em}
a:hover{color:var(--action-hover)}
:where(a,button,input):focus-visible{outline:2px solid var(--action);outline-offset:2px;border-radius:4px}
.vh{position:absolute;left:-9999px;top:0}
.page{max-width:var(--page);margin-inline:auto;padding-inline:var(--s5)}
.doc{padding-block:var(--s8)}
.reading{max-width:var(--measure)}
.stack>*+*{margin-top:var(--s4)}
.section{margin-top:var(--s8)}
.section-sm{margin-top:var(--s7)}
.muted{color:var(--text-soft)}
.lead{font-size:1.25rem;line-height:1.5}
.site-header{border-bottom:1px solid var(--border-soft)}
.site-header__inner{display:flex;align-items:center;min-height:60px}
.wordmark{font-size:1.1875rem;font-weight:600;letter-spacing:-.02em;color:var(--text);
text-decoration:none}
.facts{margin:0;max-width:var(--measure)}
.facts>div{padding-block:var(--s4)}
.facts>div+div{border-top:1px solid var(--border-soft)}
.facts dt{font-weight:600}
.facts dd{margin:0;color:var(--text-soft);overflow-wrap:anywhere}
@media (min-width:40rem){.facts>div{display:grid;grid-template-columns:13rem minmax(0,1fr);
gap:var(--s5);align-items:baseline}}
.records{list-style:none}
.records>li+li{border-top:1px solid var(--border-soft)}
.record-link{display:block;padding:var(--s5) var(--s3);margin-inline:calc(var(--s3) * -1);
border-radius:var(--radius-sm);text-decoration:none;color:inherit}
.record-link:hover{background:var(--bg-soft)}
.record-link__name{font-size:1.1875rem;font-weight:600;color:var(--text);margin-bottom:var(--s1)}
.record-link__desc{color:var(--text-soft);font-size:.9375rem}
.search{display:flex;gap:var(--s2);width:100%;max-width:42.5rem;margin-top:var(--s4)}
.search__input{flex:1 1 auto;min-width:0;min-height:44px;padding:0 var(--s4);font-size:.9375rem;
font-family:inherit;color:var(--text);background:var(--bg);border:1px solid var(--border);
border-radius:var(--radius)}
.search__input::placeholder{color:var(--text-soft)}
.search__btn{flex:none;min-height:44px;padding:0 var(--s4);font-size:.9375rem;font-family:inherit;
font-weight:500;color:#fff;background:var(--action);border:1px solid var(--action);
border-radius:var(--radius);cursor:pointer}
.search__btn:hover{background:var(--action-hover);border-color:var(--action-hover)}
@media (max-width:33rem){.search{flex-direction:column}.search__input{flex:none}
.search__btn{width:100%}}
@media print{body{background:#fff;color:#000}}
`.trim()

function factRow(key: string, value: string): string {
  return `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd></div>`
}

function destinationRow(d: Destination): string {
  return `<li><a class="record-link" href="${escapeHtml(d.href)}"><span class="record-link__name" style="display:block">${escapeHtml(
    d.label
  )}</span><span class="record-link__desc" style="display:block">${escapeHtml(d.note)}</span></a></li>`
}

/**
 * The full `410 Gone` body. `requestedPath` is echoed back so the reader can see which address is
 * closed; it is escaped because it comes from the request.
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
<header class="site-header"><div class="page site-header__inner">
<a class="wordmark" href="/">RNAwiki</a>
</div></header>
<main class="page doc">
<header class="reading stack">
<h1>${escapeHtml(GONE_TITLE)}</h1>
<p class="lead muted">${escapeHtml(GONE_LEAD)}</p>
</header>
<div class="section-sm"><dl class="facts">
${factRow('Address', requestedPath)}
${factRow('Status', 'Closed permanently, not a temporary error.')}
${factRow('Replacement', 'None recorded for this address.')}
</dl></div>
<section class="section">
<h2>${escapeHtml(GONE_REASON_HEADING)}</h2>
<div class="reading stack muted" style="margin-top:var(--s4)">${GONE_REASON.map(
    (p) => `<p>${escapeHtml(p)}</p>`
  ).join('')}</div>
</section>
<section class="section">
<h2>${escapeHtml(GONE_DISPOSITION_HEADING)}</h2>
<dl class="facts" style="margin-top:var(--s4)">
${GONE_DISPOSITIONS.map((d) => factRow(d.key, d.value)).join('\n')}
</dl>
</section>
<section class="section">
<h2>${escapeHtml(GONE_SEARCH_HEADING)}</h2>
<form class="search" role="search" action="/search" method="get">
<label class="vh" for="gone-search">${escapeHtml(SEARCH_LABEL)}</label>
<input class="search__input" id="gone-search" name="q" type="search" placeholder="${escapeHtml(SEARCH_LABEL)}">
<button class="search__btn" type="submit">Search</button>
</form>
</section>
<section class="section">
<h2>${escapeHtml(GONE_DESTINATIONS_HEADING)}</h2>
<ul class="records reading" style="margin-top:var(--s4)">
${GONE_DESTINATIONS.map(destinationRow).join('\n')}
</ul>
</section>
</main>
</body>
</html>`
}
