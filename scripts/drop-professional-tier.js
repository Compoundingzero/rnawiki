// scripts/drop-professional-tier.js — 2026-08-11 · D-5 · P0-P3
//
// Deletes the last physical traces of the abolished clinician/professional tier from Postgres:
//
//   1. DROP TABLE clinician_interest — name, email, discipline, country, professional registration
//      number and a base64 PHOTOGRAPH OF A CREDENTIAL DOCUMENT, collected for a verification
//      programme abolished on 2026-07-30. Felix, 2026-08-11: "delete. i do not need to collect any
//      licence number and credentials."
//
//   2. Six dead columns on `users` — domain, credential, domain_verified, requested_domain,
//      application_status, role_backlink. db.js has said since 2026-08-08 that they mean nothing,
//      that nothing writes them, and that they were "kept for one release ... drop them by hand once
//      this has shipped and nothing 500s". It shipped, and nothing did.
//
// WHY THIS IS A SCRIPT AND NOT IN db.js. db.js is idempotent DDL executed on EVERY boot. A DROP in
// there would re-fire on every container start for the rest of the site's life — a loaded gun aimed
// at any table somebody later recreates under the same name. A destructive migration should run
// once, by hand, with a person watching.
//
// RUN:  railway run --service Postgres node ./scripts/drop-professional-tier.js
//       (add --apply to actually execute; without it this only reports)
//
// The GitHub public-signal job is manual-only and cannot restore this schema or any private row.
// A read-only Railway check on 2026-08-15 found PITR and scheduled volume backups off. Before using
// --apply, independently verify an approved Postgres recovery point or full logical backup and its
// retention. This script PRINTS what it will destroy and deliberately writes no export file.
// Felix's instruction was to delete the data, and a script that quietly leaves a CSV of licence
// numbers on somebody's laptop has not deleted it.

const { Client } = require('pg');

const APPLY = process.argv.includes('--apply');
const USER_COLUMNS = ['domain', 'credential', 'domain_verified', 'requested_domain', 'application_status', 'role_backlink'];

(async () => {
  const conn = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
  if (!conn) { console.error('No DATABASE_PUBLIC_URL / DATABASE_URL in the environment.'); process.exit(1); }
  const c = new Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });
  await c.connect();

  const exists = async (t) => (await c.query('SELECT to_regclass($1) AS t', ['public.' + t])).rows[0].t !== null;
  const columns = async (t) => (await c.query(
    'SELECT column_name FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2', ['public', t]
  )).rows.map((r) => r.column_name);

  console.log(APPLY ? '=== APPLY ===' : '=== DRY RUN (pass --apply to execute) ===');

  // ---- 1. clinician_interest ----
  if (await exists('clinician_interest')) {
    const r = await c.query('SELECT count(*)::int n, count(license_no)::int licences, count(proof_photo)::int photos FROM clinician_interest');
    const { n, licences, photos } = r.rows[0];
    console.log(`clinician_interest: ${n} row(s), ${licences} licence number(s), ${photos} credential photograph(s) — DROP`);
    if (APPLY) { await c.query('DROP TABLE clinician_interest'); console.log('  dropped.'); }
  } else {
    console.log('clinician_interest: already absent.');
  }

  // ---- 2. the six dead user columns ----
  const present = (await columns('users')).filter((x) => USER_COLUMNS.includes(x));
  if (!present.length) {
    console.log('users: none of the six professional-tier columns are present.');
  } else {
    // Report any non-null data BEFORE dropping. If a column turns out to hold something, that is a
    // fact worth seeing on the way past, not after.
    for (const col of present) {
      const q = await c.query(`SELECT count(*)::int n FROM users WHERE ${col} IS NOT NULL`);
      const extra = col === 'domain_verified'
        ? ` · true on ${(await c.query('SELECT count(*)::int n FROM users WHERE domain_verified')).rows[0].n}`
        : '';
      console.log(`users.${col}: non-null on ${q.rows[0].n} row(s)${extra} — DROP`);
    }
    if (APPLY) {
      await c.query(`ALTER TABLE users ${present.map((x) => `DROP COLUMN IF EXISTS ${x}`).join(', ')}`);
      console.log(`  dropped ${present.length} column(s).`);
    }
  }

  await c.end();
  console.log(APPLY ? 'done.' : 'nothing was changed.');
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
