export interface AdminBootstrapCliInput {
  email: string
  confirmationEmail: string
  reason: string
}

export const ADMIN_BOOTSTRAP_USAGE = `Usage:
  npm run admin:bootstrap -- \\
    --email owner@example.org \\
    --confirm-email owner@example.org \\
    --reason "Initial production administrator"`

/**
 * Parse only the three explicit bootstrap inputs. Unknown switches are rejected so this one-time
 * privilege path can never grow an accidental signup, password, role or trust-tier shortcut.
 */
export function parseAdminBootstrapArgs(argv: readonly string[]): AdminBootstrapCliInput {
  const values = new Map<string, string>()
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index]
    if (!key || !['--email', '--confirm-email', '--reason'].includes(key)) {
      throw new Error(`Unknown bootstrap argument “${key ?? ''}”.\n${ADMIN_BOOTSTRAP_USAGE}`)
    }
    const value = argv[index + 1]
    if (!value || value.startsWith('--')) {
      throw new Error(`${key} requires a value.\n${ADMIN_BOOTSTRAP_USAGE}`)
    }
    if (values.has(key)) throw new Error(`${key} may be supplied only once.`)
    values.set(key, value.trim())
    index += 1
  }

  const email = values.get('--email') ?? ''
  const confirmationEmail = values.get('--confirm-email') ?? ''
  const reason = values.get('--reason') ?? ''
  if (!email || !confirmationEmail || !reason) {
    throw new Error(`Email, confirmation email and reason are required.\n${ADMIN_BOOTSTRAP_USAGE}`)
  }
  if (email.toLocaleLowerCase('en') !== confirmationEmail.toLocaleLowerCase('en')) {
    throw new Error('The confirmation email must match the target account email exactly.')
  }
  if (reason.length < 8 || reason.length > 500) {
    throw new Error('The bootstrap reason must be between 8 and 500 characters.')
  }

  return { email, confirmationEmail, reason }
}
