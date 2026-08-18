/**
 * The RNAwiki mark: a single-strand backbone with four paired bases, where the
 * fourth pair is deliberately unpaired — the strand runs out before the sequence
 * does. That is the product in one glyph: the evidence stops before the claim.
 *
 * Drawn on a 24-unit grid with 2-unit strokes so it stays legible at 20-24px.
 * Decorative here — the adjacent wordmark carries the accessible name.
 */
export function Mark({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', flex: 'none' }}
    >
      {/* backbone, full height — the spine of the record */}
      <path d="M4 3 V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* four rungs, shortening as support falls away */}
      <path d="M4 5.5 H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 11 H15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 16.5 H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* the last rung is unsupported — the boundary, in the accent */}
      <path
        d="M4 21.5 H8.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="0.5 3"
        opacity="0.6"
      />
    </svg>
  )
}

export function Wordmark({ size = 22 }: { size?: number }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'var(--ink)',
        textDecoration: 'none',
      }}
    >
      <Mark size={size} />
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.15rem',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          lineHeight: 1,
        }}
      >
        RNAwiki
      </span>
    </span>
  )
}
