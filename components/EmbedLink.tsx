import Link from 'next/link'

export function EmbedLink({ claimId }: { claimId: number }) {
  return (
    <Link
      href={`/embed/claim/${claimId}`}
      style={{
        border: '1px solid var(--color-border-strong)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.3em 0.7em',
        fontSize: '0.82rem',
        color: 'var(--color-text)',
        textDecoration: 'none',
      }}
    >
      Embed
    </Link>
  )
}
