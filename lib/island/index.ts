/**
 * The one script a corpus document loads (step 6.1).
 *
 * `/d/*` and `/h/*` are served as plain HTML with no React Server Components stream behind them, so
 * this file is the whole of their client behaviour: the header's search field, the contents rail's
 * active marker, and the analytics choice. It is handed the search field's state and nothing of the
 * record on the page — the record is in the HTML once and is never sent a second time as data.
 *
 * `scripts/build-island.mjs` bundles it to `public/island/rnawiki-document.js` before every build.
 */
import { startAnalytics } from './analytics'
import { startContentsRail } from './rail'
import { startSearch } from './search'

function start(): void {
  // `document.currentScript` is null inside a deferred script, so the id is a meta tag the document
  // paints. An empty or absent tag means analytics is not configured for this deployment.
  const meta = document.querySelector('meta[name="rnawiki-analytics"]')
  startSearch()
  startContentsRail()
  startAnalytics(meta instanceof HTMLMetaElement ? meta.content : null)
}

// `defer` guarantees the document is parsed, so there is nothing to wait for.
start()
