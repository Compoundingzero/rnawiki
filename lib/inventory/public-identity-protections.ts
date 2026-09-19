/** Evidence-backed exceptions to a known incorrect legacy identity merge. */
export const PUBLIC_IDENTITY_PROTECTIONS = {
  'magnesium-glycinate': {
    wrongTarget: 'glycine',
    reason:
      'Magnesium glycinate contains magnesium and glycine; glycine alone is not the compound.',
  },
} as const

export type ProtectedIdentitySlug = keyof typeof PUBLIC_IDENTITY_PROTECTIONS

export function protectedIdentityForQuery(query: string): ProtectedIdentitySlug | null {
  const slug = query
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
  return Object.prototype.hasOwnProperty.call(PUBLIC_IDENTITY_PROTECTIONS, slug)
    ? (slug as ProtectedIdentitySlug)
    : null
}
