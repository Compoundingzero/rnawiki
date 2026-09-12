import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  PAGE_STATEMENT_FLAGS,
  autoPublishEnabled,
  communityReviewEnabled,
  communityReviewSurfaceEnabled,
  proposalsEnabled,
  reviewDecisionsEnabled,
} from '@/lib/page-statements/flags'

/**
 * The switches an operator has when something goes wrong at three in the morning.
 *
 * What matters here is what happens when nothing is set, because that is the state of every
 * deployment today: the whole feature has to be inert without anyone having to remember a second
 * variable. After that, each layer has to come off on its own — freezing publication must not stop
 * reviews being recorded, and stopping proposals must not close the ones in flight.
 */
const NAMES = [
  'DOSSIER_V4_SLUGS',
  PAGE_STATEMENT_FLAGS.review,
  PAGE_STATEMENT_FLAGS.proposals,
  PAGE_STATEMENT_FLAGS.decisions,
  PAGE_STATEMENT_FLAGS.autopublish,
]

let saved: Record<string, string | undefined> = {}

beforeEach(() => {
  saved = Object.fromEntries(NAMES.map((name) => [name, process.env[name]]))
  for (const name of NAMES) delete process.env[name]
})

afterEach(() => {
  for (const name of NAMES) {
    if (saved[name] === undefined) delete process.env[name]
    else process.env[name] = saved[name]
  }
})

describe('with nothing set', () => {
  it('offers nothing: the compass is off, so review is off', () => {
    expect(communityReviewEnabled('creatine-monohydrate')).toBe(false)
    expect(communityReviewSurfaceEnabled()).toBe(false)
    expect(proposalsEnabled()).toBe(false)
    expect(reviewDecisionsEnabled()).toBe(false)
    expect(autoPublishEnabled()).toBe(false)
  })
})

describe('following the compass', () => {
  it('is available for a page the compass serves, and not for one it does not', () => {
    process.env.DOSSIER_V4_SLUGS = 'creatine-monohydrate'
    expect(communityReviewEnabled('creatine-monohydrate')).toBe(true)
    expect(communityReviewEnabled('semaglutide')).toBe(false)
    expect(communityReviewSurfaceEnabled()).toBe(true)
  })

  it('follows a prefix and a wildcard the same way the compass does', () => {
    process.env.DOSSIER_V4_SLUGS = 'e2e-v4-*'
    expect(communityReviewEnabled('e2e-v4-abc')).toBe(true)
    expect(communityReviewEnabled('creatine-monohydrate')).toBe(false)
    process.env.DOSSIER_V4_SLUGS = 'all'
    expect(communityReviewEnabled('anything-at-all')).toBe(true)
  })
})

describe('withdrawing one layer at a time', () => {
  beforeEach(() => {
    process.env.DOSSIER_V4_SLUGS = 'all'
  })

  it('freezes publication without stopping reviews', () => {
    process.env[PAGE_STATEMENT_FLAGS.autopublish] = 'off'
    expect(autoPublishEnabled()).toBe(false)
    expect(reviewDecisionsEnabled()).toBe(true)
    expect(proposalsEnabled()).toBe(true)
    expect(communityReviewEnabled('creatine-monohydrate')).toBe(true)
  })

  it('stops decisions without closing the queue', () => {
    process.env[PAGE_STATEMENT_FLAGS.decisions] = 'off'
    expect(reviewDecisionsEnabled()).toBe(false)
    expect(proposalsEnabled()).toBe(true)
    expect(communityReviewEnabled('creatine-monohydrate')).toBe(true)
  })

  it('stops new proposals without stopping the ones in flight being reviewed', () => {
    process.env[PAGE_STATEMENT_FLAGS.proposals] = 'off'
    expect(proposalsEnabled()).toBe(false)
    expect(reviewDecisionsEnabled()).toBe(true)
  })

  it('withdraws the whole surface with one variable', () => {
    process.env[PAGE_STATEMENT_FLAGS.review] = 'off'
    expect(communityReviewEnabled('creatine-monohydrate')).toBe(false)
    expect(communityReviewSurfaceEnabled()).toBe(false)
    expect(proposalsEnabled()).toBe(false)
    expect(reviewDecisionsEnabled()).toBe(false)
    expect(autoPublishEnabled()).toBe(false)
  })

  it('can be kept on while the compass itself is rolled back', () => {
    delete process.env.DOSSIER_V4_SLUGS
    process.env[PAGE_STATEMENT_FLAGS.review] = 'on'
    expect(communityReviewEnabled('creatine-monohydrate')).toBe(true)
    expect(communityReviewSurfaceEnabled()).toBe(true)
  })
})

describe('the words an operator might type', () => {
  beforeEach(() => {
    process.env.DOSSIER_V4_SLUGS = 'all'
  })

  for (const value of ['off', 'OFF', 'false', '0', 'no', ' off ']) {
    it(`treats ${JSON.stringify(value)} as off`, () => {
      process.env[PAGE_STATEMENT_FLAGS.autopublish] = value
      expect(autoPublishEnabled()).toBe(false)
    })
  }

  for (const value of ['on', 'true', '1', 'yes']) {
    it(`treats ${JSON.stringify(value)} as on`, () => {
      process.env[PAGE_STATEMENT_FLAGS.autopublish] = value
      expect(autoPublishEnabled()).toBe(true)
    })
  }

  it('treats a value it does not recognise as leaving the switch alone', () => {
    process.env[PAGE_STATEMENT_FLAGS.autopublish] = 'maybe'
    expect(autoPublishEnabled()).toBe(true)
  })
})

describe('the approval threshold', () => {
  it('is not an environment setting, because the database fixes it at three', () => {
    const source = Object.values(PAGE_STATEMENT_FLAGS).join(' ')
    expect(source).not.toContain('APPROVALS')
  })
})
