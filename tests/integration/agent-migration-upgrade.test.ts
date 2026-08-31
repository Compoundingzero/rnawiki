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

async function migrationTags(): Promise<string[]> {
  const journal = JSON.parse(
    await readFile(path.join(process.cwd(), 'db/migrations/meta/_journal.json'), 'utf8'),
  ) as { entries: Array<{ idx: number; tag: string }> }
  return journal.entries
    .filter(({ idx }) => idx <= 19)
    .sort((left, right) => left.idx - right.idx)
    .map(({ tag }) => `${tag}.sql`)
}

async function applyMigration(client: Client, migrationName: string): Promise<void> {
  const migrationSql = await readFile(
    path.join(process.cwd(), 'db', 'migrations', migrationName),
    'utf8',
  )
  const statements = migrationSql
    .split('--> statement-breakpoint')
    .map((statement) => statement.trim())
    .filter(Boolean)
  for (const statement of statements) await client.query(statement)
}

describe.skipIf(!mayCreateDisposableDatabase)('0020 agent review workbench migration', () => {
  it(
    'refuses to invent a legacy explanation, then upgrades after explicit remediation',
    { timeout: 180_000 },
    async () => {
      if (!connectionString) throw new Error('DATABASE_URL is required')
      const databaseName = `rnawiki_agent_migration_${randomUUID().replaceAll('-', '').slice(0, 12)}`
      if (!/^rnawiki_agent_migration_[a-f0-9]{12}$/u.test(databaseName)) {
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
          for (const migration of await migrationTags()) {
            await client.query('BEGIN')
            try {
              await applyMigration(client, migration)
              await client.query('COMMIT')
            } catch (error) {
              await client.query('ROLLBACK').catch(() => undefined)
              throw error
            }
          }

          const candidateKey = 'a'.repeat(64)
          const occurrenceKey = 'b'.repeat(64)
          const evidenceDigest = 'c'.repeat(64)
          await client.query(`
            INSERT INTO users (
              id, email, password_hash, name, handle, is_doctor,
              medical_license_or_npi, medical_specialty, institution, verification_state,
              accepted_edit_count, rejected_edit_count
            ) VALUES (
              'legacy-agent-reviewer', 'legacy-agent-reviewer@example.test', 'unused',
              'Legacy agent reviewer', 'legacy-agent-reviewer', false,
              NULL, NULL, NULL, 'none', 0, 0
            )
          `)
          await client.query(
            `INSERT INTO agent_runs (
               id, agent_name, agent_version, reason_schema_version, corpus_version,
               input_digest, output_digest, run_date, seed, records_considered, records_used,
               candidates_emitted, status
             ) VALUES (
               'legacy-agent-run', 'legacy-agent', '1.0.0', '1', $1, $1, $2,
               DATE '2026-08-30', 7, 1, 1, 1, 'COMPLETED'
             )`,
            ['d'.repeat(64), 'e'.repeat(64)],
          )
          await client.query(
            `INSERT INTO agent_review_candidates (
               id, candidate_key, occurrence_key, run_id, agent_name, subject_type, subject_id,
               field_path, reason, priority, basis, question, evidence, source_ids
             ) VALUES (
               'legacy-agent-candidate', $1, $2, 'legacy-agent-run', 'legacy-agent', 'medicine',
               'legacy-medicine', 'recordedBackground.test', 'COVERAGE_GAP', 1,
               'Synthetic legacy basis.', 'Synthetic legacy question?', '{}'::jsonb, ARRAY[]::text[]
             )`,
            [candidateKey, occurrenceKey],
          )
          await client.query(
            `INSERT INTO agent_queue_decisions (
               id, candidate_key, occurrence_key, decided_by_user_id, decision, explanation,
               evidence_digest
             ) VALUES (
               'legacy-agent-decision', $1, $2, 'legacy-agent-reviewer', 'NOT_A_PROBLEM', NULL, $3
             )`,
            [candidateKey, occurrenceKey, evidenceDigest],
          )

          await client.query('BEGIN')
          let rejected = false
          try {
            await applyMigration(client, '0020_agent_review_workbench.sql')
            await client.query('COMMIT')
          } catch (error) {
            rejected = true
            await client.query('ROLLBACK').catch(() => undefined)
            expect(String(error)).toContain('legacy agent decisions still have no explanation')
          }
          expect(rejected).toBe(true)

          const untouched = await client.query<{ explanation: string | null }>(
            `SELECT explanation FROM agent_queue_decisions WHERE id = 'legacy-agent-decision'`,
          )
          expect(untouched.rows[0]?.explanation).toBeNull()

          await client.query(
            `UPDATE agent_queue_decisions
             SET explanation = 'Synthetic reviewer-authored migration fixture explanation.'
             WHERE id = 'legacy-agent-decision'`,
          )
          await client.query('BEGIN')
          try {
            await applyMigration(client, '0020_agent_review_workbench.sql')
            await client.query('COMMIT')
          } catch (error) {
            await client.query('ROLLBACK').catch(() => undefined)
            throw error
          }

          const upgraded = await client.query<{ decisions: string; currentRuns: string }>(`
            SELECT
              (SELECT count(*)::text FROM agent_queue_decisions) AS decisions,
              (SELECT count(*)::text FROM agent_current_runs) AS "currentRuns"
          `)
          expect(upgraded.rows).toEqual([{ decisions: '1', currentRuns: '0' }])
        } finally {
          await client.end().catch(() => undefined)
        }
      } finally {
        await admin.query(
          `SELECT pg_terminate_backend(pid) FROM pg_stat_activity
           WHERE datname = $1 AND pid <> pg_backend_pid()`,
          [databaseName],
        )
        await admin.query(`DROP DATABASE IF EXISTS "${databaseName}"`)
        await admin.end()
      }
    },
  )
})
