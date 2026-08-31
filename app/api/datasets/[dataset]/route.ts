import { NextResponse } from 'next/server'
import { z } from 'zod'

import { ApiError, rateLimited, rateLimitKey, withHandler } from '@/lib/api-response'
import {
  isPublicDatasetId,
  PUBLIC_DATASET_MAX_LIMIT,
  PUBLIC_DATASET_MAX_OFFSET,
  PUBLIC_DATASET_MAX_QUERY_LENGTH,
  publicDatasetAllowedParameters,
  publicDatasetPageToCsv,
  queryPublicDataset,
} from '@/lib/public-datasets'
import { PUBLIC_API } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface DatasetContext {
  params: Promise<{ dataset: string }>
}

const querySchema = z.object({
  q: z.string().max(PUBLIC_DATASET_MAX_QUERY_LENGTH).optional(),
  state: z.string().max(64).optional(),
  meaning: z.string().max(64).optional(),
  field: z.string().max(64).optional(),
  role: z.string().max(64).optional(),
  counterparty: z.string().max(80).optional(),
  route: z.string().max(80).optional(),
  module: z.string().max(80).optional(),
  limit: z.coerce.number().int().positive().max(PUBLIC_DATASET_MAX_LIMIT).optional(),
  offset: z.coerce.number().int().min(0).max(PUBLIC_DATASET_MAX_OFFSET).optional(),
  format: z.enum(['json', 'csv']).optional(),
})

const CACHE_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
} as const

function pageHref(requestUrl: URL, offset: number | null, format = 'json'): string | null {
  if (offset === null) return null
  const url = new URL(requestUrl)
  url.searchParams.set('offset', String(offset))
  url.searchParams.set('format', format)
  return `${url.pathname}${url.search}`
}

export const GET = withHandler(async (req: Request, context: DatasetContext) => {
  const { dataset } = await context.params
  if (!isPublicDatasetId(dataset)) {
    throw new ApiError(404, 'No public dataset with that identifier.', 'dataset_not_found')
  }

  const url = new URL(req.url)
  const allowedParameters = publicDatasetAllowedParameters(dataset)
  for (const parameter of url.searchParams.keys()) {
    if (!allowedParameters.has(parameter)) {
      throw new ApiError(
        422,
        'That query parameter is not supported for this dataset.',
        'unsupported_dataset_parameter',
      )
    }
    if (url.searchParams.getAll(parameter).length > 1) {
      throw new ApiError(
        422,
        'A dataset query parameter must not be repeated.',
        'duplicate_dataset_parameter',
      )
    }
  }

  const parsed = querySchema.parse({
    q: url.searchParams.get('q') || undefined,
    state: url.searchParams.get('state') || undefined,
    meaning: url.searchParams.get('meaning') || undefined,
    field: url.searchParams.get('field') || undefined,
    role: url.searchParams.get('role') || undefined,
    counterparty: url.searchParams.get('counterparty') || undefined,
    route: url.searchParams.get('route') || undefined,
    module: url.searchParams.get('module') || undefined,
    limit: url.searchParams.get('limit') || undefined,
    offset: url.searchParams.get('offset') || undefined,
    format: url.searchParams.get('format') || undefined,
  })

  const limited = rateLimited(PUBLIC_API, rateLimitKey(req))
  if (limited) return limited

  const page = await queryPublicDataset(dataset, parsed)
  if (parsed.format === 'csv') {
    const first = page.query.offset + 1
    const last = page.query.offset + page.rows.length
    return new NextResponse(publicDatasetPageToCsv(page), {
      status: 200,
      headers: {
        ...CACHE_HEADERS,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="rnawiki-${dataset}-${page.query.offset}.csv"`,
        'Content-Range': `rows ${page.rows.length === 0 ? '*' : `${first}-${last}`}/${page.total}`,
        'X-Total-Count': String(page.total),
      },
    })
  }

  return NextResponse.json(
    {
      dataset: page.dataset,
      query: page.query,
      page: {
        total: page.total,
        returned: page.rows.length,
        limit: page.query.limit,
        offset: page.query.offset,
        next: pageHref(url, page.nextOffset),
        previous: pageHref(url, page.previousOffset),
        csv: pageHref(url, page.query.offset, 'csv'),
      },
      rows: page.rows,
    },
    { status: 200, headers: CACHE_HEADERS },
  )
})
