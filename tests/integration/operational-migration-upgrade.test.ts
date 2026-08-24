import { randomUUID } from 'node:crypto'
import { spawn } from 'node:child_process'
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

const migrations = [
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
  '0011_legacy_identity_corrections.sql',
] as const

async function applyMigration(client: Client, migrationName: string): Promise<void> {
  const migrationSql = await readFile(
    path.join(process.cwd(), 'db', 'migrations', migrationName),
    'utf8',
  )
  const statements = migrationSql
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

function runBootstrap(databaseUrl: string, email: string, label: string) {
  return new Promise<{ code: number; stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(
      'npm',
      [
        'run',
        'admin:bootstrap',
        '--',
        '--email',
        email,
        '--confirm-email',
        email,
        '--reason',
        `Initial administrator race candidate ${label}`,
      ],
      {
        cwd: process.cwd(),
        env: { ...process.env, DATABASE_URL: databaseUrl },
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    )
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString('utf8')
    })
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf8')
    })
    child.once('error', reject)
    child.once('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`Bootstrap process ended after signal ${signal}.`))
        return
      }
      resolve({ code: code ?? 1, stdout, stderr })
    })
  })
}

describe.skipIf(!mayCreateDisposableDatabase)('0012 operational workflow migration', () => {
  it(
    'upgrades representative 0011 rows and serializes first-admin bootstrap',
    { timeout: 120_000 },
    async () => {
      if (!connectionString) throw new Error('DATABASE_URL is required')
      const databaseName = `rnawiki_ops_${randomUUID().replaceAll('-', '').slice(0, 16)}`
      if (!/^rnawiki_ops_[a-f0-9]{16}$/.test(databaseName)) {
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
          for (const migration of migrations) await applyMigration(client, migration)

          await client.query(`
            INSERT INTO users (
              id, email, password_hash, name, handle, is_doctor,
              medical_license_or_npi, medical_specialty, institution, verification_state,
              accepted_edit_count, rejected_edit_count
            ) VALUES
              ('legacy-physician', 'legacy-physician@example.test', 'unused',
               'Legacy physician', 'legacy-physician', true, 'LEGACY-123', 'Cardiology',
               'Legacy Hospital', 'pending', 0, 0),
              ('contribution-author', 'contribution-author@example.test', 'unused',
               'Contribution author', 'contribution-author', false, NULL, NULL, NULL, 'none', 77, 44),
              ('reviewer-one', 'reviewer-one@example.test', 'unused',
               'Reviewer one', 'reviewer-one', false, NULL, NULL, NULL, 'none', 0, 0),
              ('reviewer-two', 'reviewer-two@example.test', 'unused',
               'Reviewer two', 'reviewer-two', false, NULL, NULL, NULL, 'none', 0, 0),
              ('bootstrap-a', 'bootstrap-a@example.test', 'unused',
               'Bootstrap A', 'bootstrap-a', false, NULL, NULL, NULL, 'none', 0, 0),
              ('bootstrap-b', 'bootstrap-b@example.test', 'unused',
               'Bootstrap B', 'bootstrap-b', false, NULL, NULL, NULL, 'none', 0, 0)
          `)
          await client.query(`
            UPDATE users SET trust_tier = 'trusted' WHERE id IN ('reviewer-one', 'reviewer-two')
          `)
          await client.query(`
            INSERT INTO users (
              id, email, password_hash, name, handle, is_doctor,
              medical_license_or_npi, medical_specialty, institution, verification_state,
              verified_at
            ) VALUES (
              'legacy-verified-physician', 'legacy-verified-physician@example.test', 'unused',
              'Legacy verified physician', 'legacy-verified-physician', true, 'LEGACY-VERIFIED-123',
              'Neurology', 'Legacy Neurology Hospital', 'verified',
              TIMESTAMPTZ '2025-01-02 03:04:05+00'
            )
          `)
          await client.query(`
            INSERT INTO feedback (id, type, message, resolved)
            VALUES
              ('legacy-resolved-feedback', 'correction', 'Legacy unaudited resolution', true),
              ('legacy-open-feedback', 'suggestion', 'Legacy open report', false)
          `)
          await client.query(`
            INSERT INTO drugs (id, slug, name, modality, approval_status)
            VALUES ('ops-drug', 'ops-drug', 'Operational migration medicine',
                    'Small Molecule', 'Phase 2 Investigational')
          `)
          await client.query(`
            INSERT INTO development_programmes (id, drug_id, slug, title)
            VALUES ('ops-programme', 'ops-drug', 'ops-programme', 'Operational programme')
          `)

          await client.query('BEGIN')
          try {
            await client.query(`SET LOCAL session_replication_role = 'replica'`)
            for (const [id, terminalStatus, decision] of [
              ['accepted-proposal', 'ACCEPTED_FOR_IMPLEMENTATION', 'APPROVE'],
              ['changes-proposal', 'CHANGES_REQUESTED', 'CHANGES_REQUESTED'],
              ['rejected-proposal', 'REJECTED', 'REJECT'],
            ] as const) {
              await client.query(
                `INSERT INTO programme_contribution_proposals (
                   id, proposal_key, programme_id, author_user_id, proposal_type, status,
                   selected_field, proposed_text, source_type, source_locator, source_identifier,
                   claim_nature, reasoning, what_was_wrong_or_missing, affects,
                   conflicts_of_interest, conflicts_of_interest_attested, current_value_snapshot,
                   machine_checks, impact_preview, content_digest, submitted_at
                 ) VALUES (
                   $1, $1, 'ops-programme', 'contribution-author', 'CORRECTION', 'SUBMITTED',
                   'programme.title', $2, 'CLINICAL_TRIAL_REGISTRY',
                   'https://clinicaltrials.gov/study/NCT00000000', 'NCT00000000', 'MEASURED',
                   'Registry title differs from the saved title.',
                   'Saved title does not match the cited registry.', 'OPEN_QUESTIONS',
                   'None', true,
                   '{"version":"rna-intelligence/contribution-current-value-v1"}'::jsonb,
                   '{"version":"rna-intelligence/contribution-checks-v1","passed":true,"checks":[]}'::jsonb,
                   '{"version":"rna-intelligence/contribution-impact-v1"}'::jsonb,
                   $3, clock_timestamp()
                 )`,
                [
                  id,
                  `Corrected title ${id}`,
                  id
                    .replace(/[^0-9a-f]/g, 'a')
                    .padEnd(64, 'a')
                    .slice(0, 64),
                ],
              )
              await client.query(
                `INSERT INTO programme_contribution_reviews (
                   id, proposal_id, reviewer_user_id, reviewer_name_snapshot, expertise_tags,
                   decision, independence_attested, conflicts_of_interest,
                   conflicts_of_interest_attested, review_note, content_digest
                 ) VALUES
                   ($1, $2, 'reviewer-one', 'Reviewer one', ARRAY['CLINICAL_DEVELOPMENT']::verdict_reviewer_expertise[],
                    $3, true, 'None', true, $4, $5),
                   ($6, $2, 'reviewer-two', 'Reviewer two', ARRAY['CLINICAL_DEVELOPMENT']::verdict_reviewer_expertise[],
                    $3, true, 'None', true, $4, $5)`,
                [
                  `${id}-review-1`,
                  id,
                  decision,
                  decision === 'APPROVE' ? null : `Synthetic ${decision} rationale.`,
                  id
                    .replace(/[^0-9a-f]/g, 'a')
                    .padEnd(64, 'a')
                    .slice(0, 64),
                  `${id}-review-2`,
                ],
              )
              await client.query(
                `INSERT INTO programme_contribution_review_states (
                   proposal_id, status, review_count, resolved_at
                 ) VALUES ($1, $2, 2, clock_timestamp())`,
                [id, terminalStatus],
              )
            }
            await client.query('COMMIT')
          } catch (error) {
            await client.query('ROLLBACK').catch(() => undefined)
            throw error
          }

          // Drizzle applies one migration inside one transaction. Reproduce that exact boundary so
          // PostgreSQL catches unsafe same-migration enum additions and all-or-nothing upgrade bugs.
          await client.query('BEGIN')
          try {
            await applyMigration(client, '0012_operational_review_and_source_refresh.sql')
            await client.query('COMMIT')
          } catch (error) {
            await client.query('ROLLBACK').catch(() => undefined)
            throw error
          }

          const legacyPhysician = await client.query<{
            state: string
            note: string | null
            requestCount: string
          }>(`
            SELECT account.verification_state AS state, account.verification_note AS note,
                   (SELECT count(*)::text FROM physician_verification_requests) AS "requestCount"
            FROM users account WHERE account.id = 'legacy-physician'
          `)
          expect(legacyPhysician.rows).toEqual([
            {
              state: 'none',
              note: 'Credential resubmission required after the auditable review workflow upgrade.',
              requestCount: '0',
            },
          ])
          const unauditedBadgeStates = await client.query<{ count: string }>(`
            SELECT count(*)::text AS count
            FROM users
            WHERE verification_state <> 'none'
          `)
          expect(unauditedBadgeStates.rows).toEqual([{ count: '0' }])

          const feedbackRows = await client.query<{
            id: string
            resolved: boolean
            resolvedAt: Date | null
          }>(`
            SELECT id, resolved, resolved_at AS "resolvedAt"
            FROM feedback ORDER BY id
          `)
          expect(feedbackRows.rows).toEqual([
            { id: 'legacy-open-feedback', resolved: false, resolvedAt: null },
            { id: 'legacy-resolved-feedback', resolved: false, resolvedAt: null },
          ])

          const counters = await client.query<{
            accepted: number
            rejected: number
            trustTier: string
          }>(`
            SELECT accepted_edit_count AS accepted, rejected_edit_count AS rejected,
                   trust_tier AS "trustTier"
            FROM users WHERE id = 'contribution-author'
          `)
          expect(counters.rows).toEqual([{ accepted: 1, rejected: 1, trustTier: 'new' }])

          const [candidateA, candidateB] = await Promise.all([
            runBootstrap(disposableUrl.toString(), 'bootstrap-a@example.test', 'A'),
            runBootstrap(disposableUrl.toString(), 'bootstrap-b@example.test', 'B'),
          ])
          expect([candidateA.code, candidateB.code].sort()).toEqual([0, 1])
          expect(candidateA.stdout + candidateB.stdout).toContain('first_admin_bootstrapped')

          const adminState = await client.query<{
            adminCount: string
            eventCount: string
            actorMatchesTarget: boolean
          }>(`
            SELECT
              (SELECT count(*)::text FROM users WHERE is_admin) AS "adminCount",
              count(*)::text AS "eventCount",
              bool_and(actor_user_id = target_user_id) AS "actorMatchesTarget"
            FROM account_role_events
          `)
          expect(adminState.rows).toEqual([
            { adminCount: '1', eventCount: '1', actorMatchesTarget: true },
          ])

          const refused = await runBootstrap(
            disposableUrl.toString(),
            'bootstrap-a@example.test',
            'after-close',
          )
          expect(refused.code).toBe(1)
          expect(refused.stderr).toContain('one-time bootstrap path is closed')
          await expect(
            client.query(`UPDATE account_role_events SET reason = 'Changed after bootstrap'`),
          ).rejects.toThrow(/append-only/)
          await expect(client.query(`DELETE FROM account_role_events`)).rejects.toThrow(
            /append-only/,
          )
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
