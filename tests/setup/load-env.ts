// Vitest loads .env before any test module is imported. db/index.ts throws at import time when
// DATABASE_URL is missing, and lib/session.ts throws when SESSION_SECRET is short, so this has to
// run first — hence setupFiles rather than an import inside a test.
import { config } from 'dotenv'

config()

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  // Tests that never touch a session should still be able to import modules that read this.
  process.env.SESSION_SECRET = 'test-session-secret-that-is-long-enough-32+'
}
