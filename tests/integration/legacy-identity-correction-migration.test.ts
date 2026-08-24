import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { Client } from 'pg'
import { describe, expect, it } from 'vitest'

const connectionString = process.env.DATABASE_URL
const localHosts = new Set(['localhost', '127.0.0.1', '::1', '[::1]'])
const mayCreateDisposableDatabase = (() => {
  if (!connectionString) return false
  try {
    return localHosts.has(new URL(connectionString).hostname.toLowerCase())
  } catch {
    return false
  }
})()

async function applyMigration(client: Client, migrationName: string): Promise<void> {
  const sql = await readFile(path.join(process.cwd(), 'db', 'migrations', migrationName), 'utf8')
  const statements = sql
    .split('--> statement-breakpoint')
    .map((statement) => statement.trim())
    .filter(Boolean)

  for (const [index, statement] of statements.entries()) {
    try {
      await client.query(statement)
    } catch (error) {
      throw new Error(`${migrationName} statement ${index + 1} failed`, { cause: error })
    }
  }
}

const migrationsThrough0010 = [
  '0000_rnawiki_reference_overhaul.sql',
  '0001_drug_aliases.sql',
  '0002_controlled_and_withdrawn_statuses.sql',
  '0003_programme_evidence_model.sql',
  '0004_programme_publication_hardening.sql',
  '0005_programme_contribution_proposals.sql',
  '0006_programme_contribution_reviews.sql',
  '0007_programme_contribution_hardening.sql',
  '0008_programme_publication_bundles.sql',
  '0009_canonical_publication_bridge.sql',
  '0010_programme_presentation_bundle.sql',
]

describe.skipIf(!mayCreateDisposableDatabase)('0011 legacy identity correction migration', () => {
  it(
    'quarantines unsafe pending rows without changing history and installs append-only guards',
    { timeout: 90_000 },
    async () => {
      if (!connectionString) throw new Error('DATABASE_URL is required')

      const databaseName = `rnawiki_legacy_${randomUUID().replaceAll('-', '').slice(0, 16)}`
      if (!/^rnawiki_legacy_[a-f0-9]{16}$/.test(databaseName)) {
        throw new Error('Refusing to use an unexpected disposable database identifier')
      }

      const baseUrl = new URL(connectionString)
      const adminUrl = new URL(baseUrl)
      adminUrl.pathname = '/postgres'
      const disposableUrl = new URL(baseUrl)
      disposableUrl.pathname = `/${databaseName}`
      const admin = new Client({ connectionString: adminUrl.toString() })
      const client = new Client({ connectionString: disposableUrl.toString() })

      await admin.connect()
      try {
        await admin.query(`CREATE DATABASE "${databaseName}"`)
        await client.connect()
        try {
          for (const migration of migrationsThrough0010) await applyMigration(client, migration)

          await client.query(
            `INSERT INTO users (
               id, email, password_hash, name, handle, trust_tier, accepted_edit_count
             ) VALUES
               ('legacy-author', 'legacy-author@example.test', 'unused', 'Legacy author',
                'legacy-author', 'new', 0),
               ('legacy-reviewer', 'legacy-reviewer@example.test', 'unused', 'Legacy reviewer',
                'legacy-reviewer', 'trusted', 20)`,
          )
          await client.query(
            `INSERT INTO drugs (id, slug, name, modality, approval_status)
             VALUES (
               'legacy-drug', 'legacy-drug', 'Legacy medicine', 'Small Molecule',
               'Pre-clinical / Open Source'
             )`,
          )
          await client.query(
            `INSERT INTO revisions (
               id, drug_id, author_user_id, author_name, author_trust_tier, status, summary,
               changed_fields, proposed_payload, engine_report, machine_verified,
               verification_hash, created_at
             ) VALUES
               (
                 'unsafe-pending', 'legacy-drug', 'legacy-author', 'Legacy author', 'new',
                 'pending_review', 'Old medicine-wide pending edit',
                 '[{"field":"efficacy","label":"Efficacy","before":"Old","after":"New"}]',
                 '{"efficacy":"Unsupported replacement"}', '{"legacy":true}', true,
                 '0123456789abcdef0123456789abcdef', TIMESTAMPTZ '2025-01-02 03:04:05+00'
               ),
               (
                 'old-terminal', 'legacy-drug', 'legacy-author', 'Legacy author', 'new',
                 'rejected', 'Old terminal edit', '[]', '{}', NULL, false, NULL,
                 TIMESTAMPTZ '2025-02-03 04:05:06+00'
               )`,
          )

          const before = await client.query<{ row: Record<string, unknown> }>(
            `SELECT to_jsonb(revision_row) AS row
             FROM revisions AS revision_row
             WHERE id = 'unsafe-pending'`,
          )
          const migrationStartedAt = new Date()
          await applyMigration(client, '0011_legacy_identity_corrections.sql')

          const after = await client.query<{ row: Record<string, unknown> }>(
            `SELECT to_jsonb(revision_row) AS row
             FROM revisions AS revision_row
             WHERE id = 'unsafe-pending'`,
          )
          expect(after.rows[0]?.row).toEqual(before.rows[0]?.row)

          const quarantine = await client.query<{
            reasonCode: string
            systemReason: string
            quarantinedAt: Date
          }>(
            `SELECT reason_code AS "reasonCode", system_reason AS "systemReason",
                    quarantined_at AS "quarantinedAt"
             FROM legacy_revision_quarantines
             WHERE revision_id = 'unsafe-pending'`,
          )
          expect(quarantine.rows[0]?.reasonCode).toBe('pre_0011_unsafe_pending')
          expect(quarantine.rows[0]?.systemReason).toContain('original entry remains in history')
          expect(quarantine.rows[0]?.quarantinedAt.getTime()).toBeGreaterThanOrEqual(
            migrationStartedAt.getTime() - 1000,
          )

          const liveQueue = await client.query<{ id: string }>(
            `SELECT revision.id
             FROM revisions AS revision
             INNER JOIN legacy_identity_correction_details AS detail
               ON detail.revision_id = revision.id
             LEFT JOIN legacy_revision_quarantines AS quarantine
               ON quarantine.revision_id = revision.id
             WHERE revision.status = 'pending_review'
               AND quarantine.revision_id IS NULL`,
          )
          expect(liveQueue.rows).toEqual([])

          await expect(
            client.query(
              `UPDATE revisions
               SET status = 'published', reviewed_by_user_id = 'legacy-reviewer',
                   reviewed_by_name = 'Legacy reviewer'
               WHERE id = 'unsafe-pending'`,
            ),
          ).rejects.toThrow(/quarantined legacy revisions cannot be reviewed or changed/)
          await expect(
            client.query(`UPDATE revisions SET summary = 'Changed' WHERE id = 'old-terminal'`),
          ).rejects.toThrow(/terminal legacy revision history is immutable/)
          await expect(
            client.query(`DELETE FROM revisions WHERE id = 'old-terminal'`),
          ).rejects.toThrow(/append-only/)
          await expect(
            client.query(`DELETE FROM users WHERE id = 'legacy-author'`),
          ).rejects.toThrow()
          await expect(client.query(`DELETE FROM drugs WHERE id = 'legacy-drug'`)).rejects.toThrow()

          await client.query('BEGIN')
          try {
            await client.query(`SET LOCAL session_replication_role = 'replica'`)
            await client.query(
              `INSERT INTO revisions (
                 id, drug_id, author_user_id, author_name, author_trust_tier, status, summary,
                 changed_fields, proposed_payload, created_at
               ) VALUES (
                 'clock-quarantine', 'legacy-drug', 'legacy-author', 'Legacy author', 'new',
                 'pending_review', 'Direct legacy quarantine fixture', '[]', '{}',
                 TIMESTAMPTZ '2001-01-01 00:00:00+00'
               )`,
            )
            await client.query('COMMIT')
          } catch (error) {
            await client.query('ROLLBACK').catch(() => undefined)
            throw error
          }

          const quarantineInsertStartedAt = new Date()
          const directQuarantine = await client.query<{ quarantinedAt: Date }>(
            `INSERT INTO legacy_revision_quarantines (
               revision_id, reason_code, system_reason, quarantined_at
             ) VALUES (
               'clock-quarantine', 'pre_0011_unsafe_pending',
               'Synthetic direct quarantine clock test.', TIMESTAMPTZ '1998-01-01 00:00:00+00'
             )
             RETURNING quarantined_at AS "quarantinedAt"`,
          )
          expect(directQuarantine.rows[0]?.quarantinedAt.toISOString()).not.toBe(
            '1998-01-01T00:00:00.000Z',
          )
          expect(directQuarantine.rows[0]?.quarantinedAt.getTime()).toBeGreaterThanOrEqual(
            quarantineInsertStartedAt.getTime() - 1000,
          )
          await expect(
            client.query(
              `UPDATE legacy_revision_quarantines
               SET system_reason = 'Changed'
               WHERE revision_id = 'clock-quarantine'`,
            ),
          ).rejects.toThrow(/quarantine history is immutable/)
        } finally {
          await client.end().catch(() => undefined)
        }
      } finally {
        await admin
          .query(
            `SELECT pg_terminate_backend(pid)
             FROM pg_stat_activity
             WHERE datname = $1 AND pid <> pg_backend_pid()`,
            [databaseName],
          )
          .catch(() => undefined)
        await admin.query(`DROP DATABASE IF EXISTS "${databaseName}"`).catch(() => undefined)
        await admin.end().catch(() => undefined)
      }
    },
  )
})
