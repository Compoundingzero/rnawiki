/**
 * Seeded pseudorandom generation.
 *
 * RNA Intelligence is contractually deterministic and versioned. Several of the methods the
 * dataset agents need — k-means initialisation, permutation baselines, randomised projections —
 * are randomised in their textbook form, which would make a rerun disagree with the run a person
 * reviewed. Every such method here draws from a seeded generator instead, so the seed is part of
 * the agent's declared parameters and the same inputs always produce the same output.
 *
 * mulberry32 is used because it is exactly specified in 32-bit integer arithmetic, so it produces
 * the same stream on every platform and in every JavaScript engine. Statistical quality beyond
 * that is not required: nothing here is cryptographic, and nothing depends on the stream being
 * unpredictable.
 */

export interface Rng {
  /** Uniform in [0, 1). */
  next(): number
  /** Uniform integer in [0, bound). */
  nextInt(bound: number): number
  /** Standard normal, by the Box-Muller transform. */
  nextGaussian(): number
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    next,
    nextInt: (bound: number) => Math.floor(next() * bound),
    nextGaussian: () => {
      // Guard against log(0), which Box-Muller does not tolerate.
      const u = Math.max(next(), Number.EPSILON)
      const v = next()
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
    },
  }
}

/** Fisher-Yates, in place, from a seeded generator. */
export function shuffleInPlace<T>(items: T[], rng: Rng): T[] {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swap = rng.nextInt(index + 1)
    const held = items[index]!
    items[index] = items[swap]!
    items[swap] = held
  }
  return items
}
