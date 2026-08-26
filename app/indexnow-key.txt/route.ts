import { indexNowKeyFile } from '@/lib/seo/indexnow'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function response(head: boolean): Response {
  const keyFile = indexNowKeyFile()
  if (!keyFile) {
    return new Response(head ? null : 'Not found', {
      status: 404,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store',
        'x-robots-tag': 'noindex',
      },
    })
  }

  return new Response(head ? null : keyFile.key, {
    status: 200,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600',
      'x-content-type-options': 'nosniff',
      'x-robots-tag': 'noindex',
    },
  })
}

export function GET(): Response {
  return response(false)
}

export function HEAD(): Response {
  return response(true)
}
