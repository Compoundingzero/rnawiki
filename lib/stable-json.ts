/**
 * JSON with recursively sorted object keys and original array order. Undefined object properties
 * follow JSON.stringify semantics and are omitted; undefined array entries become null.
 */
export function stableJsonStringify(value: unknown): string {
  const sortKeys = (entry: unknown, inArray = false): unknown => {
    if (entry === undefined) return inArray ? null : undefined
    if (Array.isArray(entry)) return entry.map((item) => sortKeys(item, true))
    if (entry === null || typeof entry !== 'object') return entry
    if (entry instanceof Date) return entry.toISOString()

    const source = entry as Record<string, unknown>
    return Object.fromEntries(
      Object.keys(source)
        .sort()
        .flatMap((key) => {
          const sorted = sortKeys(source[key])
          return sorted === undefined ? [] : [[key, sorted]]
        }),
    )
  }

  return JSON.stringify(sortKeys(value))
}
