import { isIP } from 'node:net'

import { ApiError } from '@/lib/api-response'

export function normalizeIdentityCorrectionSourceUrl(value: string): string {
  if (/\s|[\u0000-\u001f\u007f]/u.test(value)) {
    throw new ApiError(
      422,
      'Enter a complete public source URL without spaces or control characters.',
      'invalid_source_url',
    )
  }

  let parsed: URL
  try {
    parsed = new URL(value)
  } catch {
    throw new ApiError(422, 'Enter a complete public source URL.', 'invalid_source_url')
  }

  if (
    (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') ||
    parsed.hostname.length === 0
  ) {
    throw new ApiError(
      422,
      'The source must be a public web page beginning with http:// or https://.',
      'invalid_source_url',
    )
  }
  if (parsed.username || parsed.password) {
    throw new ApiError(
      422,
      'Source URLs cannot contain a username or password.',
      'invalid_source_url',
    )
  }

  const host = parsed.hostname
    .toLowerCase()
    .replace(/^\[|\]$/g, '')
    .replace(/\.+$/u, '')
  if (isNonPublicSourceHost(host)) {
    throw new ApiError(
      422,
      'Use a source on a public website, not a local or private-network address.',
      'invalid_source_url',
    )
  }

  const normalized = parsed.toString()
  if (normalized.length > 2048) {
    throw new ApiError(422, 'The source URL is too long.', 'invalid_source_url')
  }
  return normalized
}

function isNonPublicSourceHost(host: string): boolean {
  const ipVersion = isIP(host)
  if (ipVersion === 4) {
    const octets = host.split('.').map(Number)
    const [a = 0, b = 0, c = 0] = octets
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 0) ||
      (a === 192 && b === 88 && c === 99) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19)) ||
      (a === 198 && b === 51 && c === 100) ||
      (a === 203 && b === 0 && c === 113) ||
      a >= 224
    )
  }
  if (ipVersion === 6) {
    const hextets = expandIpv6Hextets(host)
    const first = hextets?.[0] ?? Number.parseInt(host.split(':')[0] || '0', 16)
    return (
      host === '::' ||
      host === '::1' ||
      host.startsWith('::ffff:') ||
      host.startsWith('2001:db8:') ||
      // 100::/64 is reserved for discard-only traffic and is not a public source host.
      (hextets !== null &&
        hextets[0] === 0x0100 &&
        hextets[1] === 0 &&
        hextets[2] === 0 &&
        hextets[3] === 0) ||
      (first & 0xfe00) === 0xfc00 ||
      (first & 0xffc0) === 0xfe80 ||
      // fec0::/10 is the deprecated site-local range. It remains non-public even though modern
      // software should no longer assign it.
      (first & 0xffc0) === 0xfec0 ||
      (first & 0xff00) === 0xff00
    )
  }

  return (
    !host.includes('.') ||
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.localdomain') ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host.endsWith('.home.arpa') ||
    host.endsWith('.test') ||
    host.endsWith('.invalid') ||
    host.endsWith('.example') ||
    host === 'example.com' ||
    host === 'example.net' ||
    host === 'example.org'
  )
}

/** Expands a valid IPv6 literal so prefix checks also work with `::` compression. */
function expandIpv6Hextets(host: string): number[] | null {
  const halves = host.split('::')
  if (halves.length > 2) return null

  const parseSide = (side: string): number[] | null => {
    if (side.length === 0) return []
    const parsed = side.split(':').map((part) => Number.parseInt(part, 16))
    return parsed.every((part) => Number.isInteger(part) && part >= 0 && part <= 0xffff)
      ? parsed
      : null
  }

  const left = parseSide(halves[0] ?? '')
  const right = parseSide(halves[1] ?? '')
  if (left === null || right === null) return null

  if (halves.length === 1) return left.length === 8 ? left : null
  const omitted = 8 - left.length - right.length
  if (omitted < 1) return null
  return [...left, ...Array<number>(omitted).fill(0), ...right]
}
