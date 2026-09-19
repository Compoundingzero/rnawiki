/**
 * A public identity that the old redirect ledger merged into a different molecule.
 * Keep this small and evidence-backed. The corpus identity pipeline still needs correction;
 * these exceptions stop a known wrong medical redirect while that repair is prepared.
 */
export const PUBLIC_IDENTITY_PROTECTIONS = {
  'magnesium-glycinate': {
    wrongTarget: 'glycine',
    reason:
      'Magnesium glycinate contains magnesium and glycine; glycine alone is not the same substance.',
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
