import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin login', robots: { index: false, follow: false } }

const ERROR_MESSAGES: Record<string, string> = {
  invalid: 'Incorrect email or password.',
  rate_limited: 'Too many attempts. Wait a few minutes and try again.',
  input: 'Enter a valid email and password.',
}

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function AdminLoginPage({ searchParams }: Props) {
  const { error } = await searchParams
  const message = error ? (ERROR_MESSAGES[error] ?? 'Something went wrong. Try again.') : null

  return (
    <div className="admin-page admin-page--narrow" style={{ paddingBlock: 'var(--s9)' }}>
      <p className="eyebrow">RNAwiki · Editorial</p>
      <h1 className="h1" style={{ marginBlock: 'var(--s3) var(--s3)' }}>
        Sign in
      </h1>
      <p className="prose" style={{ fontSize: 'var(--size-small)' }}>
        Administrator, editor, and scientific reviewer accounts only.
      </p>

      <hr className="rule" style={{ marginBlock: 'var(--s5)' }} />

      {message && (
        <div className="callout" data-tone="danger" role="alert" style={{ marginBottom: 'var(--s5)' }}>
          <p className="callout__title">Sign-in failed</p>
          <p style={{ fontSize: 'var(--size-small)' }}>{message}</p>
        </div>
      )}

      <form action="/api/admin/login" method="POST" className="admin-form">
        <div className="admin-field">
          <label htmlFor="email" className="admin-label">
            Email
          </label>
          <input id="email" name="email" type="email" autoComplete="username" required className="field" />
        </div>
        <div className="admin-field">
          <label htmlFor="password" className="admin-label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="field"
          />
        </div>
        <div className="admin-actions">
          <button type="submit" className="btn btn--primary">
            Log in
          </button>
        </div>
      </form>
    </div>
  )
}
