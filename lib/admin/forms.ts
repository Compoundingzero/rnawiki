// Small shared helpers for the plain <form action={serverAction}> pattern used across
// app/admin/**: turn a FormData into a plain object, and redirect back to a form with an
// error/success message in the query string (no client-side state needed to show it).

import { redirect } from 'next/navigation'

export function formToObject(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') out[key] = value
  }
  return out
}

export function redirectWithError(path: string, message: string): never {
  redirect(`${path}${path.includes('?') ? '&' : '?'}error=${encodeURIComponent(message)}`)
}

export function redirectWithSuccess(path: string, message: string): never {
  redirect(`${path}${path.includes('?') ? '&' : '?'}success=${encodeURIComponent(message)}`)
}

/** Empty-string form fields should be stored as SQL NULL for nullable text columns. */
export function nullIfEmpty(value: string | undefined | null): string | null {
  if (value === undefined || value === null) return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export function toIntOrNull(value: string | undefined | null): number | null {
  const n = nullIfEmpty(value)
  if (n === null) return null
  const parsed = Number.parseInt(n, 10)
  return Number.isFinite(parsed) ? parsed : null
}

/** Split a textarea (one URL/item per line, blank lines ignored) into a string[]. */
export function linesToArray(value: string | undefined | null): string[] {
  if (!value) return []
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

/**
 * Parse an `<input type="date">` value ("YYYY-MM-DD") for a NULLABLE timestamp column.
 *
 * Three outcomes, deliberately distinct — do not collapse them:
 *   `null`       the editor left the field blank, which is a legitimate "no date recorded"
 *   `Date`       a real date
 *   `undefined`  a non-empty string that is not a date
 *
 * The third case exists so a caller can reject bad input instead of silently writing an Invalid
 * Date, which Postgres accepts as NULL through some drivers and then reads back as "no date on
 * record" — indistinguishable from a deliberate blank. Callers must test `=== undefined` before
 * testing falsiness, because `null` is a valid stored value here.
 */
export function toDateOrNull(value: string | undefined | null): Date | null | undefined {
  const trimmed = nullIfEmpty(value)
  if (trimmed === null) return null
  const parsed = new Date(trimmed)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

/**
 * Length caps for the three claim-event prose fields, in characters.
 *
 * One source of truth, imported by the Zod schema in
 * app/admin/(protected)/claims/actions.ts (the enforcing check) and by ClaimEventsForm.tsx (the
 * `maxLength` attribute and the help text that tells the editor the cap before they hit it).
 * It lives here rather than in actions.ts because a `'use server'` module may only export async
 * functions, and rather than in the component because the server action must not import a
 * component to validate.
 *
 * These caps are restraint, not formatting. An event's job is to record what a source says did not
 * work, in the source's own bounds; four sentences is already interpretation. Raise a number here
 * only with the same justification docs/writing-style.md demands — and cut the sentence first.
 */
export const CLAIM_EVENT_FIELD_CAPS = {
  plainSummary: 400,
  whatItSuggests: 300,
  whatItDoesNotEstablish: 300,
} as const
