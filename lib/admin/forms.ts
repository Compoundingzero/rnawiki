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
