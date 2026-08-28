/**
 * Spherical k-means over L2-normalised sparse vectors, with seeded initialisation.
 *
 * Spherical rather than Euclidean because the vectors are L2-normalised TF-IDF, where cosine is
 * the meaningful distance and Euclidean distance is a monotone function of it that distorts the
 * centroid update. Seeded because the contract requires a rerun to reproduce the run a person
 * reviewed, and k-means++ is randomised.
 *
 * WHAT A CLUSTER IS NOT: a cluster produced here is a set of medicines whose recorded mechanism
 * text groups together under a named method with named parameters at a named version. It is not a
 * pharmacological class, and it must never be labelled as one. Calling a cluster "beta blockers"
 * would assert a pharmacological fact that the text grouping does not establish — the honest label
 * is the terms that actually distinguish the group, which is what `describeCluster` returns.
 */

import { createRng, type Rng } from './rng'
import { cosine, topTerms, type SparseVector, type TfIdfModel } from './text'

export interface Clustering {
  /** Cluster index per input document, aligned to the input order. */
  assignments: Int32Array
  centroids: SparseVector[]
  /** Mean cosine similarity of each document to its own centroid. */
  cohesion: number
  iterations: number
  converged: boolean
}

function centroidOf(members: readonly SparseVector[]): SparseVector {
  const totals = new Map<number, number>()
  for (const vector of members) {
    for (let position = 0; position < vector.indices.length; position += 1) {
      const column = vector.indices[position]!
      totals.set(column, (totals.get(column) ?? 0) + vector.values[position]!)
    }
  }
  const indices = [...totals.keys()].sort((left, right) => left - right)
  const raw = indices.map((column) => totals.get(column)!)
  const norm = Math.hypot(...raw)
  return {
    indices: Int32Array.from(indices),
    values: Float64Array.from(norm > 0 ? raw.map((value) => value / norm) : raw),
  }
}

/** k-means++ seeding, which picks spread-out starting centroids rather than uniform ones. */
function seedCentroids(vectors: readonly SparseVector[], k: number, rng: Rng): SparseVector[] {
  const chosen: SparseVector[] = [vectors[rng.nextInt(vectors.length)]!]
  while (chosen.length < k) {
    const distances = vectors.map((vector) => {
      const best = Math.max(...chosen.map((centroid) => cosine(vector, centroid)))
      // Cosine distance, floored at zero so numerical drift cannot produce a negative weight.
      return Math.max(0, 1 - best) ** 2
    })
    const total = distances.reduce((sum, value) => sum + value, 0)
    if (total <= 0) break
    let target = rng.next() * total
    let index = 0
    while (index < distances.length - 1 && target > distances[index]!) {
      target -= distances[index]!
      index += 1
    }
    chosen.push(vectors[index]!)
  }
  return chosen
}

export function sphericalKMeans(
  vectors: readonly SparseVector[],
  k: number,
  seed: number,
  maxIterations = 60,
): Clustering {
  const rng = createRng(seed)
  const assignments = new Int32Array(vectors.length).fill(-1)
  let centroids = seedCentroids(vectors, Math.min(k, vectors.length), rng)
  let iterations = 0
  let converged = false

  for (; iterations < maxIterations; iterations += 1) {
    let moved = false
    for (let index = 0; index < vectors.length; index += 1) {
      let best = -1
      let bestSimilarity = -Infinity
      for (let cluster = 0; cluster < centroids.length; cluster += 1) {
        const similarity = cosine(vectors[index]!, centroids[cluster]!)
        if (similarity > bestSimilarity) {
          bestSimilarity = similarity
          best = cluster
        }
      }
      if (assignments[index] !== best) {
        assignments[index] = best
        moved = true
      }
    }
    if (!moved) {
      converged = true
      break
    }
    const grouped: SparseVector[][] = Array.from({ length: centroids.length }, () => [])
    for (let index = 0; index < vectors.length; index += 1) {
      grouped[assignments[index]!]!.push(vectors[index]!)
    }
    // An emptied cluster keeps its previous centroid rather than being dropped, so the cluster
    // count stays equal to the declared parameter and reruns stay comparable.
    centroids = grouped.map((members, cluster) =>
      members.length > 0 ? centroidOf(members) : centroids[cluster]!,
    )
  }

  let cohesionTotal = 0
  for (let index = 0; index < vectors.length; index += 1) {
    cohesionTotal += cosine(vectors[index]!, centroids[assignments[index]!]!)
  }

  return {
    assignments,
    centroids,
    cohesion: vectors.length > 0 ? cohesionTotal / vectors.length : 0,
    iterations,
    converged,
  }
}

/**
 * The terms that distinguish a cluster from the corpus as a whole.
 *
 * A centroid's highest-weighted terms are dominated by whatever is common everywhere, so the
 * centroid is contrasted against the mean of all centroids first. What survives is what actually
 * separates this group — and that contrast, not a pharmacological name, is the only honest label.
 */
export function describeCluster(
  model: TfIdfModel,
  centroid: SparseVector,
  allCentroids: readonly SparseVector[],
  limit = 8,
): Array<{ term: string; weight: number }> {
  const background = new Map<number, number>()
  for (const other of allCentroids) {
    for (let position = 0; position < other.indices.length; position += 1) {
      const column = other.indices[position]!
      background.set(column, (background.get(column) ?? 0) + other.values[position]!)
    }
  }
  const contrasted: SparseVector = {
    indices: centroid.indices,
    values: Float64Array.from(
      [...centroid.indices].map((column, position) => {
        const mean = (background.get(column) ?? 0) / Math.max(1, allCentroids.length)
        return Math.max(0, centroid.values[position]! - mean)
      }),
    ),
  }
  return topTerms(model, contrasted, limit)
}

/**
 * Silhouette score against a sample, used to choose the cluster count.
 *
 * Sampled because the full computation is quadratic in the corpus size, and seeded so the choice
 * of k is reproducible rather than a property of when the agent happened to run.
 */
export function sampledSilhouette(
  vectors: readonly SparseVector[],
  assignments: Int32Array,
  seed: number,
  sampleSize = 300,
): number {
  const rng = createRng(seed)
  const indices = Array.from({ length: vectors.length }, (_, index) => index)
  for (let index = indices.length - 1; index > 0; index -= 1) {
    const swap = rng.nextInt(index + 1)
    const held = indices[index]!
    indices[index] = indices[swap]!
    indices[swap] = held
  }
  const sample = indices.slice(0, Math.min(sampleSize, indices.length))
  let total = 0
  let counted = 0
  for (const index of sample) {
    const own = assignments[index]!
    const distancesByCluster = new Map<number, { sum: number; count: number }>()
    for (let other = 0; other < vectors.length; other += 1) {
      if (other === index) continue
      const cluster = assignments[other]!
      const distance = 1 - cosine(vectors[index]!, vectors[other]!)
      const entry = distancesByCluster.get(cluster) ?? { sum: 0, count: 0 }
      entry.sum += distance
      entry.count += 1
      distancesByCluster.set(cluster, entry)
    }
    const ownEntry = distancesByCluster.get(own)
    if (!ownEntry || ownEntry.count === 0) continue
    const a = ownEntry.sum / ownEntry.count
    let b = Infinity
    for (const [cluster, entry] of distancesByCluster) {
      if (cluster === own || entry.count === 0) continue
      b = Math.min(b, entry.sum / entry.count)
    }
    if (!Number.isFinite(b)) continue
    total += (b - a) / Math.max(a, b)
    counted += 1
  }
  return counted > 0 ? total / counted : 0
}
