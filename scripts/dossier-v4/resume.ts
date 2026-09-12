/**
 * Print where the dossier v4 rollout stopped and the one command that continues it.
 *
 *   npx tsx scripts/dossier-v4/resume.ts
 *
 * A session can end mid-phase. This reads the rollout state file and the worklog rather than any
 * summary written into a conversation, so what it prints is what is actually on disk.
 *
 * Read-only. It writes nothing.
 */
import { existsSync, readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const STATE_FILE = 'data/dossier-v4/full-rollout-state.json'
const WORKLOG = 'docs/worklogs/dossier-v4-full-production-rollout-2026-09.md'

interface RolloutState {
  repository?: string
  worktree?: string
  branch?: string
  starting_commit?: string
  last_safe_commit?: string
  pull_request?: string
  current_phase?: string
  last_completed_phase?: string
  total_public_slugs?: number
  rendered_v4_slugs?: number
  reviewed_pages?: number
  preliminary_pages?: number
  limited_pages?: number
  correction_hold_pages?: number
  pipeline_failure_pages?: number
  stacks_status?: string
  community_status?: string
  experiment_planner_status?: string
  staging_url?: string
  staging_revision?: string
  production_url?: string
  production_revision?: string
  tests?: Record<string, string>
  critical_blockers?: string[]
  noncritical_blindspots?: string[]
  files_in_progress?: string[]
  next_exact_command?: string
  updated_at?: string
}

function git(command: string): string {
  try {
    return execSync(command, { encoding: 'utf8' }).trim()
  } catch {
    return 'unavailable'
  }
}

function section(title: string): void {
  console.log(`\n${title}`)
  console.log('-'.repeat(title.length))
}

function main(): void {
  if (!existsSync(STATE_FILE)) {
    console.error(`No rollout state at ${STATE_FILE}. This worktree has not started the rollout.`)
    process.exit(1)
  }
  const state = JSON.parse(readFileSync(STATE_FILE, 'utf8')) as RolloutState

  section('Where this is')
  console.log(`repository        ${state.repository ?? 'unknown'}`)
  console.log(
    `branch            ${state.branch ?? 'unknown'} (on disk: ${git('git branch --show-current')})`,
  )
  console.log(`commit            ${git('git rev-parse --short HEAD')}`)
  console.log(`last safe commit  ${state.last_safe_commit ?? 'unknown'}`)
  console.log(`pull request      ${state.pull_request ?? 'none'}`)
  console.log(`state written     ${state.updated_at ?? 'unknown'}`)

  const dirty = git('git status --porcelain')
  console.log(
    `working tree      ${dirty === '' ? 'clean' : `${dirty.split('\n').length} changed files`}`,
  )
  const unpushed = git('git log --oneline @{u}..HEAD')
  console.log(`unpushed commits  ${unpushed === '' ? 'none' : unpushed.split('\n').length}`)

  section('Phase')
  console.log(`last completed    ${state.last_completed_phase ?? 'none'}`)
  console.log(`current           ${state.current_phase ?? 'unknown'}`)

  section('Corpus')
  const counted = state.total_public_slugs ?? 0
  if (counted === 0) {
    console.log('No corpus inventory has been taken yet.')
  } else {
    console.log(`public slugs      ${counted}`)
    console.log(`rendered through v4 ${state.rendered_v4_slugs ?? 0}`)
    console.log(`  reviewed        ${state.reviewed_pages ?? 0}`)
    console.log(`  preliminary     ${state.preliminary_pages ?? 0}`)
    console.log(`  limited         ${state.limited_pages ?? 0}`)
    console.log(`  correction hold ${state.correction_hold_pages ?? 0}`)
    console.log(`  pipeline failure ${state.pipeline_failure_pages ?? 0}`)
  }

  section('Features')
  console.log(`stacks            ${state.stacks_status ?? 'unknown'}`)
  console.log(`community         ${state.community_status ?? 'unknown'}`)
  console.log(`experiment planner ${state.experiment_planner_status ?? 'unknown'}`)

  section('Environments')
  console.log(`staging           ${state.staging_url || 'none'} ${state.staging_revision ?? ''}`)
  console.log(
    `production        ${state.production_url || 'none'} ${state.production_revision ?? ''}`,
  )

  if (state.tests && Object.keys(state.tests).length > 0) {
    section('Tests last recorded')
    for (const [name, result] of Object.entries(state.tests))
      console.log(`${name.padEnd(18)}${result}`)
  }

  const blockers = state.critical_blockers ?? []
  section(`Critical blockers (${blockers.length})`)
  if (blockers.length === 0) console.log('none recorded')
  for (const blocker of blockers) console.log(`- ${blocker}`)

  const blindspots = state.noncritical_blindspots ?? []
  if (blindspots.length > 0) {
    section(`Known blindspots (${blindspots.length})`)
    for (const blindspot of blindspots) console.log(`- ${blindspot}`)
  }

  const inProgress = state.files_in_progress ?? []
  if (inProgress.length > 0) {
    section('Files left mid-edit')
    for (const file of inProgress) console.log(`- ${file}`)
  }

  section('Environment this needs')
  console.log('DATABASE_URL      a local PostgreSQL database migrated to the current head')
  console.log('SESSION_SECRET    at least 32 characters')

  section('Validation')
  console.log(
    'npx tsx scripts/dossier-v4/check-gate.ts --slugs <slug>   one page, before enabling it',
  )
  console.log('npm run gate                                             the full release chain')

  section('Next')
  console.log(state.next_exact_command || 'No next command recorded.')
  if (existsSync(WORKLOG)) console.log(`\nFull context: ${WORKLOG}`)
}

main()
