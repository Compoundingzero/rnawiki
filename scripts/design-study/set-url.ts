/** Record a verified index/content URL for one site: `--site <key> --content <url> [--index <url>] [--note <text>]`. */
import { loadState, updateSite } from './state.js'

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}

async function main(): Promise<void> {
  const key = arg('site')
  if (!key) throw new Error('--site <key> is required')
  const state = await loadState()
  const current = state.sites[key]
  if (!current) throw new Error(`Unknown site ${key}`)
  const urls = {
    index: arg('index') ?? current.urls?.index ?? '',
    content: arg('content') ?? current.urls?.content ?? '',
    ...(arg('note')
      ? { contentNote: arg('note') }
      : current.urls?.contentNote
        ? { contentNote: current.urls.contentNote }
        : {}),
  }
  await updateSite(key, { urls })
  console.log(
    `${key}: index=${urls.index} content=${urls.content}${urls.contentNote ? ` (${urls.contentNote})` : ''}`,
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
