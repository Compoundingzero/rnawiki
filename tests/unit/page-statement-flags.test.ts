import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  PAGE_STATEMENT_FLAGS,
  autoPublishEnabled,
  communityReviewSurfaceEnabled,
  proposalsEnabled,
  reviewDecisionsEnabled,
} from '@/lib/page-statements/flags'

/**
 * The switches an operator has when something goes wrong at three in the morning.
 *
 * None of them reaches a reader's medicine page: there is one layout, review lives at
 * /review-queue, and what these withdraw is what a member can do there. Each layer has to come off
 * on its own — freezing publication must not stop reviews being recorded, and stopping proposals
 * must not close the ones already in flight.
 */
const NAMES = [
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
  it('offers the whole surface, because review is part of the product', () => {
    expect(communityReviewSurfaceEnabled()).toBe(true)
    expect(proposalsEnabled()).toBe(true)
    expect(reviewDecisionsEnabled()).toBe(true)
    expect(autoPublishEnabled()).toBe(true)
  })
})

describe('withdrawing one layer at a time', () => {
  it('freezes publication without stopping reviews', () => {
    process.env[PAGE_STATEMENT_FLAGS.autopublish] = 'off'
    expect(autoPublishEnabled()).toBe(false)
    expect(reviewDecisionsEnabled()).toBe(true)
    expect(proposalsEnabled()).toBe(true)
  })

  it('stops decisions without closing the queue', () => {
    process.env[PAGE_STATEMENT_FLAGS.decisions] = 'off'
    expect(reviewDecisionsEnabled()).toBe(false)
    expect(proposalsEnabled()).toBe(true)
  })

  it('stops new proposals without stopping the ones in flight being reviewed', () => {
    process.env[PAGE_STATEMENT_FLAGS.proposals] = 'off'
    expect(proposalsEnabled()).toBe(false)
    expect(reviewDecisionsEnabled()).toBe(true)
  })

  it('withdraws the whole surface with one variable', () => {
    process.env[PAGE_STATEMENT_FLAGS.review] = 'off'
    expect(communityReviewSurfaceEnabled()).toBe(false)
    expect(proposalsEnabled()).toBe(false)
    expect(reviewDecisionsEnabled()).toBe(false)
    expect(autoPublishEnabled()).toBe(false)
  })
})

describe('the words an operator might type', () => {
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

describe('no layout flag survives', () => {
  it('names no variable that selects a medicine layout', () => {
    expect(Object.values(PAGE_STATEMENT_FLAGS).join(' ')).not.toMatch(/SLUGS|V3|V4/u)
  })
})
