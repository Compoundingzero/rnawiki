/**
 * Bundle the corpus document's one client script.
 *
 * `/d/*` and `/h/*` are served as plain HTML documents with no React Server Components stream
 * behind them (docs/specs/deployment-plan.md, "The corpus document"), so Next.js builds no client
 * chunk for them. This step builds the single island those documents load, from the same TypeScript
 * modules the React shell imports for the search route, the medicine-type label and the analytics
 * policy, so the two renderers cannot drift apart on any of the three.
 *
 *   node scripts/build-island.mjs
 *
 * It runs from `prebuild` and `predev`, and writes `public/island/rnawiki-document.js`, which is a
 * build artefact and is not committed.
 */
import { mkdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { build } from 'esbuild'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outfile = path.join(root, 'public', 'island', 'rnawiki-document.js')

mkdirSync(path.dirname(outfile), { recursive: true })

await build({
  absWorkingDir: root,
  entryPoints: [path.join(root, 'lib', 'island', 'index.ts')],
  outfile,
  bundle: true,
  minify: true,
  format: 'iife',
  platform: 'browser',
  // The browsers the site's own Playwright run and Railway's readers use; anything older is served
  // a working document without the island, which is the no-script state the document is built for.
  target: ['es2020'],
  legalComments: 'none',
  alias: { '@': root },
})

const { size } = statSync(outfile)
console.log(`island -> public/island/rnawiki-document.js (${size} bytes)`)
