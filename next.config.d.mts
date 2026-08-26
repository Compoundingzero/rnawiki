import type { NextConfig } from 'next'

import type { CanonicalProductionEnvironment } from './lib/seo/canonical-production-origin.mjs'

export interface ResponseHeader {
  key: string
  value: string
}

export function responseHeadersForEnvironment(
  environment?: CanonicalProductionEnvironment,
): ResponseHeader[]

declare const nextConfig: NextConfig
export default nextConfig
