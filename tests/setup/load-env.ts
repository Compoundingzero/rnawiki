// Loads the repo's .env (DATABASE_URL, SESSION_SECRET, SITE_URL, ...) before any test file runs,
// the same way `tsx`/Next already do for scripts and the app. Vitest does not read .env on its
// own. Safe to import multiple times; dotenv no-ops if a variable is already set in the shell.
import { config } from 'dotenv'
import path from 'node:path'

config({ path: path.resolve(__dirname, '../../.env') })
