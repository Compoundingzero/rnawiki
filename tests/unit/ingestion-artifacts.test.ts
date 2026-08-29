import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  PUBLIC_PLACEHOLDER_MEDICINE_SLUGS,
  isPlaceholderMedicineIdentity,
} from '@/lib/public-data-integrity'

/**
 * A CSV header line reached production as a medicine.
 *
 * `data/drugs` held a row with slug `header` and name `Header` — 24 fields, every content field
 * empty — and RNAWiki served a page for it at /d/header. Eight independent sources were asked about
 * it and none recognised it. The placeholder guard that exists to catch exactly this had `unnamed`
 * and `tbd` on its list but not the word that actually got through.
 *
 * Removing the row fixes the symptom. These tests fix the cause: the vocabulary now covers words
 * that describe a table rather than a substance, and nothing that could name a real one.
 */

function corpusRows(): { slug: string; name: string }[] {
  const dir = join(process.cwd(), 'data', 'drugs')
  const rows: { slug: string; name: string }[] = []
  for (const file of readdirSync(dir).filter((name) => name.endsWith('.ndjson'))) {
    for (const line of readFileSync(join(dir, file), 'utf8').split('\n')) {
      if (!line.trim()) continue
      const record = JSON.parse(line) as { id?: string; name?: string }
      if (record.id && record.name) rows.push({ slug: record.id, name: record.name })
    }
  }
  return rows
}

describe('spreadsheet vocabulary never reaches the corpus', () => {
  const rows = corpusRows()

  it('recognises the header row that got through', () => {
    expect(isPlaceholderMedicineIdentity({ slug: 'header', name: 'Header' })).toBe(true)
  })

  it('holds no row the guard would now reject', () => {
    const offenders = rows.filter((row) => isPlaceholderMedicineIdentity(row))
    expect(
      offenders.map((row) => `${row.slug} (${row.name})`),
      'these rows are ingestion artifacts rather than medicines',
    ).toEqual([])
  })

  it('lets through a word that looks like a column heading and is a plant', () => {
    // "Date" was flagged by the same scan that found the header row. The supplement database files
    // it as Date Palm and FDA's registry resolves it to Phoenix dactylifera. A guard that rejected
    // it would delete a real botanical, which is why the vocabulary is checked against the live
    // corpus before anything joins it.
    expect(isPlaceholderMedicineIdentity({ slug: 'date', name: 'Date' })).toBe(false)
    expect(rows.some((row) => row.slug === 'date')).toBe(true)
  })

  it('names each placeholder slug once and in lower case', () => {
    const slugs = [...PUBLIC_PLACEHOLDER_MEDICINE_SLUGS]
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const slug of slugs) expect(slug).toBe(slug.toLowerCase())
  })
})
