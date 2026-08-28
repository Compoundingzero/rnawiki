import { describe, expect, it } from 'vitest'

import { createRng, shuffleInPlace } from '@/lib/agents/core/rng'
import {
  benjaminiHochberg,
  hypergeometricUpperTail,
  logChoose,
  logGamma,
  median,
  medianAbsoluteDeviation,
  quantileSorted,
  robustSummary,
} from '@/lib/agents/core/statistics'
import {
  logScaleNonconformity,
  minimumCalibrationSize,
  mondrianConformal,
} from '@/lib/agents/core/conformal'
import { cosine, fitTfIdf, tokenize, transform } from '@/lib/agents/core/text'
import { sphericalKMeans } from '@/lib/agents/core/cluster'

/**
 * The mathematical core is tested against values computed independently, not against itself.
 * Every agent's output rests on these functions, so an error here would be invisible and
 * everywhere at once.
 */

describe('seeded randomness', () => {
  it('reproduces its stream exactly, which is what makes an agent rerunnable', () => {
    const first = Array.from({ length: 8 }, () => createRng(42).next())
    const second = Array.from({ length: 8 }, () => createRng(42).next())
    expect(first).toEqual(second)
    expect(createRng(42).next()).not.toBe(createRng(43).next())
  })

  it('shuffles deterministically for a given seed', () => {
    const items = () => [1, 2, 3, 4, 5, 6, 7, 8]
    expect(shuffleInPlace(items(), createRng(7))).toEqual(shuffleInPlace(items(), createRng(7)))
  })

  it('draws gaussians with roughly the right moments', () => {
    const rng = createRng(1)
    const draws = Array.from({ length: 20000 }, () => rng.nextGaussian())
    const mean = draws.reduce((a, b) => a + b, 0) / draws.length
    const variance = draws.reduce((a, b) => a + (b - mean) ** 2, 0) / draws.length
    expect(Math.abs(mean)).toBeLessThan(0.05)
    expect(Math.abs(variance - 1)).toBeLessThan(0.05)
  })
})

describe('robust statistics', () => {
  it('computes type-7 quantiles the way R and NumPy do', () => {
    const sorted = [1, 2, 3, 4]
    // numpy.percentile([1,2,3,4], 25) == 1.75
    expect(quantileSorted(sorted, 0.25)).toBeCloseTo(1.75, 10)
    expect(quantileSorted(sorted, 0.5)).toBeCloseTo(2.5, 10)
    expect(quantileSorted(sorted, 0.75)).toBeCloseTo(3.25, 10)
  })

  it('resists contamination that would destroy a mean', () => {
    const clean = [10, 11, 12, 13, 14]
    const poisoned = [...clean, 1e9]
    expect(median(poisoned)).toBeCloseTo(12.5, 10)
    // The mean of the poisoned sample is above 1.6e8; the median barely moves.
    expect(Math.abs(median(poisoned) - median(clean))).toBeLessThan(1)
  })

  it('scales the median absolute deviation to estimate a normal standard deviation', () => {
    const rng = createRng(3)
    const draws = Array.from({ length: 20000 }, () => rng.nextGaussian() * 5)
    expect(medianAbsoluteDeviation(draws)).toBeGreaterThan(4.5)
    expect(medianAbsoluteDeviation(draws)).toBeLessThan(5.5)
  })

  it('summarises or reports nothing, never a fabricated zero', () => {
    expect(robustSummary([])).toBeNull()
    expect(robustSummary([2, 4, 6])).toMatchObject({ count: 3, median: 4, min: 2, max: 6 })
  })
})

describe('log-gamma and the hypergeometric tail', () => {
  it('matches known factorials through log-gamma', () => {
    // gamma(n) = (n-1)!  =>  logGamma(6) = log(120)
    expect(Math.exp(logGamma(6))).toBeCloseTo(120, 6)
    expect(Math.exp(logGamma(11))).toBeCloseTo(3628800, 2)
  })

  it('matches exact binomial coefficients', () => {
    expect(Math.exp(logChoose(10, 3))).toBeCloseTo(120, 6)
    expect(Math.exp(logChoose(52, 5))).toBeCloseTo(2598960, 1)
  })

  it('agrees with an independently computed hypergeometric tail', () => {
    // Population 50, 10 marked, draw 5. Exact:
    //   P(3) = C(10,3)C(40,2)/C(50,5), P(4) = C(10,4)C(40,1)/C(50,5), P(5) = C(10,5)/C(50,5)
    //   = (93600 + 8400 + 252) / 2118760 = 0.0482603031962091
    expect(hypergeometricUpperTail(3, 5, 10, 50)).toBeCloseTo(0.0482603032, 9)
    // The whole distribution above the minimum is probability 1.
    expect(hypergeometricUpperTail(0, 5, 10, 50)).toBeCloseTo(1, 10)
    // More successes than can possibly be drawn has probability 0.
    expect(hypergeometricUpperTail(11, 5, 10, 50)).toBe(0)
  })
})

describe('Benjamini-Hochberg', () => {
  it('rejects the classic worked example', () => {
    // Benjamini & Hochberg 1995 example: 15 p-values, alpha 0.05, four rejections.
    const p = [
      0.0001, 0.0004, 0.0019, 0.0095, 0.0201, 0.0278, 0.0298, 0.0344, 0.0459, 0.324, 0.4262, 0.5719,
      0.6528, 0.759, 1.0,
    ]
    expect(benjaminiHochberg(p, 0.05).sort((a, b) => a - b)).toEqual([0, 1, 2, 3])
  })

  it('rejects nothing when nothing is significant', () => {
    expect(benjaminiHochberg([0.4, 0.6, 0.9], 0.05)).toEqual([])
  })
})

describe('conformal flagging', () => {
  it('states the resolution limit a small group imposes', () => {
    // At alpha = 0.05 a group needs 19 calibration points before any p-value can reach it.
    expect(minimumCalibrationSize(0.05)).toBe(19)
  })

  it('gives super-uniform p-values, so a flag rate is honest', () => {
    const rng = createRng(11)
    const items = Array.from({ length: 400 }, (_, index) => ({
      id: index,
      value: Math.exp(rng.nextGaussian()),
    }))
    const score = logScaleNonconformity(items.map((item) => item.value))
    const result = mondrianConformal(
      items.map((item) => ({ item, score: score(item.value) })),
      () => 'all',
      0.05,
    )
    // Under the null, at most about 10% of p-values should fall below 0.10.
    const below = result.all.filter((entry) => entry.pValue <= 0.1).length / result.all.length
    expect(below).toBeLessThanOrEqual(0.14)
  })

  it('finds an outlier inside its peer group that is unremarkable globally', () => {
    // Two groups: one measured in hours, one in days. 60 hours is ordinary overall and extreme
    // for the short-acting group — which is exactly the case a global screen would miss.
    const shortActing = [
      2, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 3.2, 4.4, 5.1, 2.8, 6.2, 3.9, 4.8, 5.7, 6.8, 3.3,
    ]
    const longActing = [
      40, 50, 60, 70, 80, 90, 100, 110, 45, 55, 65, 75, 85, 95, 105, 48, 58, 68, 78, 88,
    ]
    const items = [
      ...shortActing.map((value) => ({ value, group: 'short' })),
      ...longActing.map((value) => ({ value, group: 'long' })),
      { value: 60, group: 'short' },
    ]
    const byGroup = new Map<string, number[]>()
    for (const item of items)
      byGroup.set(item.group, [...(byGroup.get(item.group) ?? []), item.value])
    const scorers = new Map(
      [...byGroup].map(([group, values]) => [group, logScaleNonconformity(values)]),
    )
    const result = mondrianConformal(
      items.map((item) => ({ item, score: scorers.get(item.group)!(item.value) })),
      (item) => item.group,
      0.05,
    )
    const flaggedShort = result.flagged.filter((entry) => entry.item.group === 'short')
    expect(flaggedShort.length).toBeGreaterThan(0)
    expect(flaggedShort[0]!.item.value).toBe(60)
    // The same magnitude inside the long-acting group is not flagged.
    expect(
      result.flagged.some((entry) => entry.item.group === 'long' && entry.item.value === 60),
    ).toBe(false)
  })

  it('says plainly that false-discovery control is out of reach at this resolution', () => {
    // Leave-one-out conformal in a group of n cannot emit a p-value below 1/(n+1), while BH over m
    // tests needs one below alpha/m. At corpus scale the second is far below the first, so a queue
    // claiming FDR control would be claiming a guarantee it does not have.
    const rng = createRng(21)
    const items = Array.from({ length: 200 }, () => ({ value: Math.exp(rng.nextGaussian()) }))
    const score = logScaleNonconformity(items.map((item) => item.value))
    const result = mondrianConformal(
      items.map((item) => ({ item, score: score(item.value) })),
      () => 'all',
      0.05,
    )
    expect(result.falseDiscoveryControl.achievable).toBe(false)
    expect(result.falseDiscoveryControl.explanation).toContain('uncorrected threshold')
    // The honest substitute is an expected count a reviewer can plan around.
    expect(result.expectedFalseFlags).toBeCloseTo(200 * 0.05, 6)
    expect(result.testCount).toBe(200)
  })

  it('reports groups too small to flag rather than passing them silently', () => {
    const items = [{ value: 1 }, { value: 2 }, { value: 900 }]
    const score = logScaleNonconformity(items.map((i) => i.value))
    const result = mondrianConformal(
      items.map((item) => ({ item, score: score(item.value) })),
      () => 'tiny',
      0.05,
    )
    expect(result.underpoweredGroups[0]).toMatchObject({ group: 'tiny', size: 3 })
    expect(result.flagged).toEqual([])
  })
})

describe('TF-IDF and clustering', () => {
  it('drops stopwords and regulatory boilerplate, keeping what distinguishes a document', () => {
    const tokens = tokenize(
      'The precise mechanism of action in patients is not fully understood but may involve inhibition of dihydrofolate reductase.',
    )
    // Every word of the hedge goes, because grouping on it groups medicines by how uncertain their
    // label sounds rather than by what the label says.
    for (const hedge of [
      'the',
      'precise',
      'mechanism',
      'action',
      'patients',
      'fully',
      'understood',
      'involve',
    ]) {
      expect(tokens, hedge).not.toContain(hedge)
    }
    // What the sentence actually contributes survives.
    expect(tokens).toContain('inhibition')
    expect(tokens).toContain('dihydrofolate')
    expect(tokens).toContain('reductase')
  })

  it('produces unit-length vectors whose cosine separates unrelated text', () => {
    const documents = [
      'inhibits sodium channels in cardiac tissue reducing conduction velocity',
      'blocks sodium channels in cardiac muscle slowing conduction',
      'binds oestrogen receptors in breast tissue reducing proliferation signalling',
      'antagonises oestrogen receptor binding in breast tumour proliferation',
    ]
    const model = fitTfIdf(documents, 1)
    const vectors = documents.map((document) => transform(model, document))
    expect(cosine(vectors[0]!, vectors[0]!)).toBeCloseTo(1, 9)
    // Same topic scores higher than different topic.
    expect(cosine(vectors[0]!, vectors[1]!)).toBeGreaterThan(cosine(vectors[0]!, vectors[2]!))
  })

  it('recovers planted groups and reproduces the partition for a fixed seed', () => {
    const cardiac = Array.from(
      { length: 12 },
      (_, i) => `inhibits sodium channels cardiac conduction velocity variant ${i % 3}`,
    )
    const oncology = Array.from(
      { length: 12 },
      (_, i) => `binds oestrogen receptor breast proliferation signalling variant ${i % 3}`,
    )
    const documents = [...cardiac, ...oncology]
    const model = fitTfIdf(documents, 2)
    const vectors = documents.map((document) => transform(model, document))
    const first = sphericalKMeans(vectors, 2, 5)
    const second = sphericalKMeans(vectors, 2, 5)
    expect([...first.assignments]).toEqual([...second.assignments])
    // Every cardiac document lands with every other cardiac document.
    const cardiacClusters = new Set([...first.assignments].slice(0, 12))
    const oncologyClusters = new Set([...first.assignments].slice(12))
    expect(cardiacClusters.size).toBe(1)
    expect(oncologyClusters.size).toBe(1)
    expect([...cardiacClusters][0]).not.toBe([...oncologyClusters][0])
  })
})
