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

describe.skipIf(!mayCreateDisposableDatabase)('programme migration upgrade chain', () => {
  it(
    'preserves non-attributable 0003 reviews and a published NULL-presentation verdict through 0010',
    { timeout: 60_000 },
    async () => {
      if (!connectionString) throw new Error('DATABASE_URL is required')

      const databaseName = `rnawiki_migration_${randomUUID().replaceAll('-', '').slice(0, 16)}`
      if (!/^rnawiki_migration_[a-f0-9]{16}$/.test(databaseName)) {
        throw new Error('Refusing to use an unexpected disposable database identifier')
      }

      const adminClient = new Client({ connectionString })
      const disposableUrl = new URL(connectionString)
      disposableUrl.pathname = `/${databaseName}`
      const migrationClient = new Client({ connectionString: disposableUrl.toString() })

      await adminClient.connect()
      try {
        await adminClient.query(`CREATE DATABASE "${databaseName}"`)
        await migrationClient.connect()

        try {
          for (const migration of [
            '0000_rnawiki_reference_overhaul.sql',
            '0001_drug_aliases.sql',
            '0002_controlled_and_withdrawn_statuses.sql',
            '0003_programme_evidence_model.sql',
          ]) {
            await applyMigration(migrationClient, migration)
          }

          await migrationClient.query(
            `INSERT INTO drugs (id, slug, name, modality, approval_status)
             VALUES ($1, $2, $3, 'Small Molecule', 'Phase 2 Investigational')`,
            ['migration-drug', 'migration-drug', 'Synthetic migration medicine'],
          )
          await migrationClient.query(
            `INSERT INTO development_programmes (id, drug_id, slug, title, status)
             VALUES ($1, $2, $3, $4, 'STOPPED')`,
            [
              'migration-programme',
              'migration-drug',
              'migration-programme',
              'Synthetic migration programme',
            ],
          )
          await migrationClient.query(
            `INSERT INTO programme_verdict_revisions (
               id, programme_id, revision_number, review_status, programme_status_at_review,
               verdict_code, public_label, professional_label, indication_scope, population_scope,
               dose_exposure_scope, period_scope, trial_scope, outcome_scope, one_sentence_reason,
               author_name
             ) VALUES (
               $1, $2, 1, 'DRAFT', 'STOPPED', 'TEST_UNANSWERED', $3, $4, $5, $6, $7, $8,
               $9, $10, $11, $12
             )`,
            [
              'migration-verdict',
              'migration-programme',
              'Synthetic public label',
              'Synthetic professional label',
              'Synthetic indication scope',
              'Synthetic population scope',
              'Synthetic dose scope',
              'Synthetic period scope',
              'Synthetic trial scope',
              'Synthetic outcome scope',
              'Synthetic migration reason',
              'Legacy reviewer fixture author',
            ],
          )
          await migrationClient.query(
            `INSERT INTO programme_verdict_reviews (
               id, verdict_revision_id, reviewer_user_id, reviewer_name, decision, is_independent,
               conflicts_of_interest, review_note
             ) VALUES ($1, $2, NULL, $3, 'APPROVE', true, $4, $5)`,
            [
              'migration-legacy-review',
              'migration-verdict',
              'Legacy reviewer without a principal',
              'Synthetic disclosure',
              'Synthetic pre-0004 review note',
            ],
          )

          for (const migration of [
            '0004_programme_publication_hardening.sql',
            '0005_programme_contribution_proposals.sql',
            '0006_programme_contribution_reviews.sql',
            '0007_programme_contribution_hardening.sql',
            '0008_programme_publication_bundles.sql',
            '0009_canonical_publication_bridge.sql',
          ]) {
            await applyMigration(migrationClient, migration)
          }

          await migrationClient.query(
            `INSERT INTO development_programmes (id, drug_id, slug, title, status)
             VALUES ($1, $2, $3, $4, 'STOPPED')`,
            [
              'migration-published-programme',
              'migration-drug',
              'migration-published-programme',
              'Published legacy migration programme',
            ],
          )
          // This test models rows that were already committed under 0009. The publication workflow
          // itself is covered separately; disabling triggers here avoids trying to replay that whole
          // workflow while the database intentionally has the 0009 shape.
          await migrationClient.query('BEGIN')
          try {
            await migrationClient.query(`SET LOCAL session_replication_role = 'replica'`)
            await migrationClient.query(
              `INSERT INTO programme_verdict_revisions (
               id, programme_id, revision_number, review_status, programme_status_at_review,
               verdict_code, proposal_as_of_date, public_label, professional_label,
               indication_scope, population_scope, dose_exposure_scope, period_scope, trial_scope,
               outcome_scope, plain_mechanism, best_supported_finding, main_limitation,
               one_sentence_reason, author_name, engine_version, input_digest, proposal_digest,
               proposal_prepared_at, reviewed_at, published_at
             ) VALUES (
               $1, $2, 1, 'PUBLISHED', 'STOPPED', 'TEST_UNANSWERED', DATE '2026-01-15',
               $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
               'rna-intelligence/evidence-2.0.1', $16, $17,
               TIMESTAMPTZ '2026-01-16 09:00:00+00', TIMESTAMPTZ '2026-01-17 09:00:00+00',
               TIMESTAMPTZ '2026-01-18 09:00:00+00'
             )`,
              [
                'migration-published-verdict',
                'migration-published-programme',
                'Published legacy conclusion',
                'Published legacy professional conclusion',
                'Synthetic indication scope',
                'Synthetic population scope',
                'Synthetic dose scope',
                'Synthetic period scope',
                'Synthetic trial scope',
                'Synthetic outcome scope',
                'Legacy plain mechanism',
                'Legacy supported finding',
                'Legacy limitation',
                'Legacy published reason',
                'Legacy publication fixture author',
                'a'.repeat(64),
                'b'.repeat(64),
              ],
            )
            await migrationClient.query(
              `INSERT INTO programme_verdict_scope_snapshots (
                 verdict_revision_id, programme_id, drug_id, slug, title, partners, status,
                 stopping_reason_category, captured_at
               ) VALUES ($1, $2, $3, $4, $5, '[]'::jsonb, 'STOPPED', 'OPERATIONAL_EXECUTION', $6)`,
              [
                'migration-published-verdict',
                'migration-published-programme',
                'migration-drug',
                'migration-published-programme',
                'Published legacy migration programme',
                new Date('2026-01-16T09:00:00.000Z'),
              ],
            )
            await migrationClient.query(
              `INSERT INTO programme_current_publications (
                 programme_id, verdict_revision_id, published_at
               ) VALUES ($1, $2, $3)`,
              [
                'migration-published-programme',
                'migration-published-verdict',
                new Date('2026-01-18T09:00:00.000Z'),
              ],
            )
            await migrationClient.query('COMMIT')
          } catch (error) {
            await migrationClient.query('ROLLBACK').catch(() => undefined)
            throw error
          }

          await applyMigration(migrationClient, '0010_programme_presentation_bundle.sql')

          const activeReviews = await migrationClient.query<{ count: string }>(
            'SELECT count(*)::text AS count FROM programme_verdict_reviews',
          )
          expect(activeReviews.rows[0]?.count).toBe('0')

          const archivedReviews = await migrationClient.query<{
            id: string
            reviewerUserId: string | null
            reviewerName: string
            reviewNote: string | null
            archiveReason: string
          }>(
            `SELECT id, reviewer_user_id AS "reviewerUserId", reviewer_name AS "reviewerName",
                    review_note AS "reviewNote", archive_reason AS "archiveReason"
             FROM programme_verdict_reviews_legacy_0003`,
          )
          expect(archivedReviews.rows).toEqual([
            {
              id: 'migration-legacy-review',
              reviewerUserId: null,
              reviewerName: 'Legacy reviewer without a principal',
              reviewNote: 'Synthetic pre-0004 review note',
              archiveReason: 'UNBOUND_PRE_0004_REVIEW',
            },
          ])

          const snapshotTables = await migrationClient.query<{ tableName: string }>(
            `SELECT table_name AS "tableName"
             FROM information_schema.tables
             WHERE table_schema = 'public'
               AND table_name IN (
                 'programme_verdict_scope_snapshots',
                 'programme_verdict_source_metadata_snapshots',
                 'programme_verdict_trial_snapshots',
                 'programme_verdict_reviewer_qualification_events',
                 'programme_verdict_adjudications',
                 'programme_verdict_mechanism_steps',
                 'programme_verdict_mechanism_step_claims',
                 'programme_verdict_timeline_events',
                 'programme_verdict_timeline_event_claims',
                 'programme_contribution_implementations',
                 'programme_contribution_source_task_resolutions'
               )
             ORDER BY table_name`,
          )
          expect(snapshotTables.rows.map(({ tableName }) => tableName)).toEqual([
            'programme_contribution_implementations',
            'programme_contribution_source_task_resolutions',
            'programme_verdict_adjudications',
            'programme_verdict_mechanism_step_claims',
            'programme_verdict_mechanism_steps',
            'programme_verdict_reviewer_qualification_events',
            'programme_verdict_scope_snapshots',
            'programme_verdict_source_metadata_snapshots',
            'programme_verdict_timeline_event_claims',
            'programme_verdict_timeline_events',
            'programme_verdict_trial_snapshots',
          ])

          const legacyPresentation = await migrationClient.query<{
            presentationSchemaVersion: string | null
          }>(
            `SELECT presentation_schema_version AS "presentationSchemaVersion"
             FROM programme_verdict_revisions
             WHERE id = 'migration-verdict'`,
          )
          expect(legacyPresentation.rows).toEqual([{ presentationSchemaVersion: null }])

          const publishedLegacyPresentation = await migrationClient.query<{
            reviewStatus: string
            engineVersion: string
            presentationSchemaVersion: string | null
            publishedAt: Date | null
          }>(
            `SELECT review_status AS "reviewStatus", engine_version AS "engineVersion",
                    presentation_schema_version AS "presentationSchemaVersion",
                    published_at AS "publishedAt"
             FROM programme_verdict_revisions
             WHERE id = 'migration-published-verdict'`,
          )
          expect(publishedLegacyPresentation.rows).toEqual([
            {
              reviewStatus: 'PUBLISHED',
              engineVersion: 'rna-intelligence/evidence-2.0.1',
              presentationSchemaVersion: null,
              publishedAt: new Date('2026-01-18T09:00:00.000Z'),
            },
          ])
          const publishedLegacyPointer = await migrationClient.query<{
            verdictRevisionId: string
          }>(
            `SELECT verdict_revision_id AS "verdictRevisionId"
             FROM programme_current_publications
             WHERE programme_id = 'migration-published-programme'`,
          )
          expect(publishedLegacyPointer.rows).toEqual([
            { verdictRevisionId: 'migration-published-verdict' },
          ])
        } finally {
          await migrationClient.end().catch(() => undefined)
        }
      } finally {
        await adminClient
          .query('SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1', [
            databaseName,
          ])
          .catch(() => undefined)
        await adminClient.query(`DROP DATABASE IF EXISTS "${databaseName}"`)
        await adminClient.end()
      }
    },
  )
})
