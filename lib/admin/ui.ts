// Shared inline-style objects for the admin screens. Plain style={{}} objects built from the
// design tokens in app/globals.css, matching the rest of the app's approach (no Tailwind, no
// CSS-in-JS library). Admin screens are denser/table-like per the brief, so these run a touch
// smaller and tighter than the public-facing components.

import type { CSSProperties } from 'react'

export const page: CSSProperties = {
  maxWidth: '64rem',
  margin: '0 auto',
  padding: 'var(--space-8) var(--space-6) var(--space-12)',
  fontSize: '0.95rem',
}

export const narrowPage: CSSProperties = {
  ...page,
  maxWidth: '40rem',
}

export const h1: CSSProperties = { fontSize: '1.5rem', margin: '0 0 var(--space-2)' }
export const h2: CSSProperties = { fontSize: '1.1rem', margin: '0 0 var(--space-3)' }

export const sectionCard: CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-surface)',
  padding: 'var(--space-6)',
  marginBottom: 'var(--space-6)',
}

export const label: CSSProperties = {
  display: 'block',
  fontWeight: 600,
  fontSize: '0.85rem',
  marginBottom: 'var(--space-1)',
}

export const helpText: CSSProperties = {
  fontSize: '0.78rem',
  color: 'var(--color-text-faint)',
  margin: 'var(--space-1) 0 0',
}

export const fieldWrap: CSSProperties = { marginBottom: 'var(--space-4)' }

const controlBase: CSSProperties = {
  width: '100%',
  padding: '0.5em 0.65em',
  fontSize: '0.92rem',
  fontFamily: 'var(--font-sans)',
  border: '1px solid var(--color-border-strong)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
}

export const input: CSSProperties = controlBase
export const select: CSSProperties = controlBase
export const textarea: CSSProperties = { ...controlBase, minHeight: '5rem', resize: 'vertical' as const }
export const textareaSmall: CSSProperties = { ...controlBase, minHeight: '2.5rem', resize: 'vertical' as const }

export const checkboxRow: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-2)',
  fontSize: '0.9rem',
}

export const buttonPrimary: CSSProperties = {
  padding: '0.55em 1.1em',
  fontSize: '0.9rem',
  fontWeight: 600,
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--color-accent)',
  color: '#fff',
  cursor: 'pointer',
}

export const buttonSecondary: CSSProperties = {
  padding: '0.55em 1.1em',
  fontSize: '0.9rem',
  fontWeight: 600,
  border: '1px solid var(--color-border-strong)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
  cursor: 'pointer',
}

export const buttonDanger: CSSProperties = {
  ...buttonSecondary,
  color: 'var(--color-unknown)',
  borderColor: 'var(--color-unknown)',
}

export const buttonSmall: CSSProperties = {
  padding: '0.3em 0.7em',
  fontSize: '0.78rem',
  fontWeight: 600,
  border: '1px solid var(--color-border-strong)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
  cursor: 'pointer',
}

export const table: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.88rem',
}

export const th: CSSProperties = {
  textAlign: 'left',
  borderBottom: '2px solid var(--color-border-strong)',
  padding: 'var(--space-2) var(--space-3)',
  color: 'var(--color-text-muted)',
  fontSize: '0.78rem',
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
}

export const td: CSSProperties = {
  borderBottom: '1px solid var(--color-border)',
  padding: 'var(--space-2) var(--space-3)',
  verticalAlign: 'top',
}

export const errorBanner: CSSProperties = {
  border: '1px solid var(--color-unknown)',
  background: 'var(--color-unknown-tint)',
  color: 'var(--color-unknown)',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-3)',
  marginBottom: 'var(--space-4)',
  fontSize: '0.9rem',
}

export const successBanner: CSSProperties = {
  border: '1px solid var(--color-measured)',
  background: 'var(--color-measured-tint)',
  color: 'var(--color-measured)',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-3)',
  marginBottom: 'var(--space-4)',
  fontSize: '0.9rem',
}

export const badge: CSSProperties = {
  display: 'inline-flex',
  padding: '0.15em 0.55em',
  borderRadius: 'var(--radius-sm)',
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.02em',
  border: '1px solid var(--color-border-strong)',
  background: 'var(--color-surface-raised)',
  color: 'var(--color-text-muted)',
  whiteSpace: 'nowrap' as const,
}

export const statusBadge: Record<string, CSSProperties> = {
  published: { ...badge, borderColor: 'var(--color-measured)', color: 'var(--color-measured)', background: 'var(--color-measured-tint)' },
  approved: { ...badge, borderColor: 'var(--color-accent)', color: 'var(--color-accent-strong)', background: 'var(--color-accent-tint)' },
  scientific_review_required: { ...badge, borderColor: 'var(--color-inferred)', color: 'var(--color-inferred)', background: 'var(--color-inferred-tint)' },
  needs_update: { ...badge, borderColor: 'var(--color-unknown)', color: 'var(--color-unknown)', background: 'var(--color-unknown-tint)' },
  re_review: { ...badge, borderColor: 'var(--color-inferred)', color: 'var(--color-inferred)', background: 'var(--color-inferred-tint)' },
}

export function statusBadgeStyle(status: string): CSSProperties {
  return statusBadge[status] ?? badge
}

export const flexRow: CSSProperties = { display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }
export const statGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 'var(--space-4)',
  marginBottom: 'var(--space-8)',
}
export const statTile: CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-4)',
  background: 'var(--color-surface)',
}
