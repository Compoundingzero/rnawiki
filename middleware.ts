import { NextResponse, type NextRequest } from 'next/server'

import { legacyPathIsGone } from '@/lib/seo/legacy-routes'

function gone(): NextResponse {
  return new NextResponse('Gone', {
    status: 410,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Robots-Tag': 'noindex',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}

/**
 * Close retired protocol and compound-era route families with a real 410. A single old compound
 * identity continues to its route handler, which can verify an exact current medicine before it
 * redirects; middleware never guesses at a database identity.
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  if (/^\/c\/[^/]+\/?$/.test(pathname) || /^\/t\/compound\/[^/]+\/?$/.test(pathname)) {
    return NextResponse.next()
  }

  return legacyPathIsGone(pathname) ? gone() : NextResponse.next()
}

export const config = {
  matcher: [
    '/c/:path*',
    '/t/compound/:path*',
    '/exercise/:path*',
    '/goal/:path*',
    '/protocol/:path*',
    '/target/:path*',
    '/pathway/:path*',
    '/pathways/:path*',
    '/learn/:path*',
    '/solve/:path*',
    '/solve.html',
    '/plan/:path*',
    '/p/:path*',
    '/p.html',
    '/interest/:path*',
    '/newsletter/:path*',
  ],
}
