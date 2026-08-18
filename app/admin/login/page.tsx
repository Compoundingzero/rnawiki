import type { Metadata } from 'next'
import * as ui from '@/lib/admin/ui'

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
    <div style={{ ...ui.narrowPage, minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={ui.sectionCard}>
        <h1 style={ui.h1}>RNAwiki editorial admin</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 0 }}>
          Sign in with your administrator, editor, or scientific reviewer account.
        </p>

        {message && (
          <p role="alert" style={ui.errorBanner}>
            {message}
          </p>
        )}

        <form action="/api/admin/login" method="POST">
          <div style={ui.fieldWrap}>
            <label htmlFor="email" style={ui.label}>
              Email
            </label>
            <input id="email" name="email" type="email" autoComplete="username" required style={ui.input} />
          </div>
          <div style={ui.fieldWrap}>
            <label htmlFor="password" style={ui.label}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              style={ui.input}
            />
          </div>
          <button type="submit" style={ui.buttonPrimary}>
            Log in
          </button>
        </form>
      </div>
    </div>
  )
}
