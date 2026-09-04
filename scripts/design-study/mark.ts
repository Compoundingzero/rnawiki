/**
 * Mark a site's viewing progress in state.json (the viewer and verifier agents call this; it
 * never fetches or captures anything).
 *
 *   npx tsx scripts/design-study/mark.ts --site <key> --viewed --findings data/design-study/findings/<dir>.md
 *   npx tsx scripts/design-study/mark.ts --site <key> --verified [--note "<text>"]
 */
import { updateSite } from './state.js'

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}

async function main(): Promise<void> {
  const key = arg('site')
  if (!key) throw new Error('--site <key> is required')
  const now = new Date().toISOString()
  const patch: Record<string, unknown> = {}
  if (process.argv.includes('--viewed')) {
    patch.viewed = true
    patch.viewedAt = now
    const findings = arg('findings')
    if (findings) patch.findingsFile = findings
  }
  if (process.argv.includes('--verified')) {
    patch.verified = true
    patch.verifiedAt = now
  }
  if (process.argv.includes('--unverified')) {
    patch.verified = false
    patch.verifiedAt = now
  }
  const note = arg('note')
  if (note) patch.note = note
  const captured = arg('captured')
  if (captured === 'true' || captured === 'false') patch.captured = captured === 'true'
  const captureNote = arg('capture-note')
  if (captureNote) patch.captureNote = captureNote
  if (Object.keys(patch).length === 0)
    throw new Error(
      'nothing to mark: pass --viewed, --verified, --captured true|false, --note or --capture-note',
    )
  await updateSite(key, patch)
  console.log(`${key}: ${JSON.stringify(patch)}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
