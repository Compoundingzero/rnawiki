/**
 * The stylesheets a plain corpus document links.
 *
 * `/d/*` and `/h/*` are served as documents this application writes itself rather than as App
 * Router pages (docs/specs/deployment-plan.md, "The corpus document"), so nothing puts the
 * `<link rel="stylesheet">` elements in their heads. They are read from the build's own app
 * manifest, under the root layout's entry, which is where `app/layout.tsx`'s imports land:
 * `globals.css` with the two self-hosted faces `next/font` generated, then the corpus tokens and
 * the dossier stylesheet. Reading the manifest rather than naming files means the document links
 * exactly what the React shell links, at the same content hashes, with one copy of each in the
 * build.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

const LAYOUT_ENTRY = '/layout'

interface AppBuildManifest {
  pages?: Record<string, string[]>
}

let cached: string[] | null = null

function readManifest(): AppBuildManifest {
  const file = path.join(process.cwd(), '.next', 'app-build-manifest.json')
  return JSON.parse(readFileSync(file, 'utf8')) as AppBuildManifest
}

/**
 * Absolute paths, in the manifest's own order, which is the cascade order the React shell uses.
 *
 * A build that cannot be read is a broken deployment, not a page to serve unstyled, so the failure
 * is raised with the file that was missing rather than swallowed into a document with no styles.
 */
export function documentStylesheetHrefs(): string[] {
  if (cached) return cached
  let manifest: AppBuildManifest
  try {
    manifest = readManifest()
  } catch (cause) {
    throw new Error(
      `.next/app-build-manifest.json could not be read, so a corpus document cannot link the ` +
        `build's stylesheets. Run \`npm run build\` before serving.`,
      { cause },
    )
  }
  const entry = manifest.pages?.[LAYOUT_ENTRY] ?? []
  const hrefs = entry.filter((asset) => asset.endsWith('.css')).map((asset) => `/_next/${asset}`)
  if (hrefs.length === 0) {
    throw new Error(
      `.next/app-build-manifest.json lists no stylesheet for the ${LAYOUT_ENTRY} entry. ` +
        `app/layout.tsx must import the corpus stylesheets for the plain document to link them.`,
    )
  }
  cached = hrefs
  return hrefs
}
