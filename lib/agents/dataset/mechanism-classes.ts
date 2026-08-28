/**
 * Groups medicines by the wording of their recorded mechanism statements.
 *
 * The corpus holds roughly 1,200 mechanism statements copied verbatim from label sections. Nothing
 * in the corpus states which medicines act alike, and nothing here discovers that: what this agent
 * computes is a partition of the recorded TEXT, produced by TF-IDF vectorisation and spherical
 * k-means at a cluster count chosen by silhouette over a declared sweep. Peer groups for the
 * anomaly agents have to come from somewhere, and a grouping induced from recorded wording — with
 * its method, parameters and seed frozen beside it — is inspectable in a way that a borrowed class
 * list is not.
 *
 * WHY THERE IS NO NAME FIELD. The one dangerous move available here is to look at a group whose
 * distinguishing terms are "receptor, antagonist, adrenergic" and call it "beta blockers". That
 * would convert a fact about prose into a pharmacological assertion the grouping never established,
 * and it would be wrong for every member whose label happens to use that vocabulary for a different
 * reason. The output type therefore has no field a class name could be written into. A group is
 * identified by an opaque id and described by the terms that distinguish it, and that is all.
 *
 * WHAT CO-MEMBERSHIP IS NOT. Two medicines landing in one group is a statement about two documents,
 * not a relation between two medicines. No pair, edge, ranking or similarity row between medicines
 * is emitted anywhere in this output, and a consumer must not derive one from the membership lists.
 */

import {
  describeCluster,
  sampledSilhouette,
  sphericalKMeans,
  type Clustering,
} from '@/lib/agents/core/cluster'
import { cosine, fitTfIdf, transform, type SparseVector } from '@/lib/agents/core/text'
import type {
  AgentInput,
  AgentRun,
  DatasetAgent,
  ReviewCandidate,
} from '@/lib/agents/core/types'

/**
 * Cluster counts the run tries before choosing one. Declared as a constant rather than an argument
 * because the swept range is part of what makes the chosen count meaningful: a silhouette that is
 * best at the edge of the range means something different from one that is best in the middle.
 */
export const MECHANISM_GROUP_CLUSTER_COUNTS = [8, 12, 16, 24, 32, 48] as const

/** A term below this document frequency cannot group anything; see `fitTfIdf`. */
const MIN_DOCUMENT_FREQUENCY = 3

/** Silhouette is quadratic in the corpus, so it is evaluated against a seeded sample. */
const SILHOUETTE_SAMPLE_SIZE = 300

const MAX_ITERATIONS = 60

const TERMS_PER_GROUP = 8

/**
 * Attachment below this cosine means the record's wording has almost nothing in common with the
 * group it was nonetheless placed in. Those records are routed to a person rather than presented as
 * ordinary members.
 */
const WEAK_ATTACHMENT_COSINE = 0.1

const MAX_QUEUE_LENGTH = 25

/** One point of the cluster-count sweep, kept so the choice of k can be checked rather than trusted. */
export interface MechanismGroupSweepPoint {
  clusterCount: number
  /** Sampled silhouette at this cluster count. Higher is better separated. */
  silhouette: number
  /** Mean cosine of every document to its own centroid. Rises with k almost mechanically. */
  cohesion: number
  iterations: number
  converged: boolean
  /** Clusters that ended with no members, which k-means can produce and which are not emitted. */
  emptyClusters: number
}

export interface MechanismGroupMember {
  slug: string
  name: string
  /**
   * Cosine of this record's mechanism vector to its own group centroid. Published per member so a
   * record that barely belongs is visible instead of being absorbed into the group's mean.
   */
  cosineToCentroid: number
}

/**
 * One induced group.
 *
 * There is deliberately no name, label, class or category field. `terms` are the terms that
 * distinguish this group's centroid from the mean of all centroids, and `termSummary` is those
 * terms rendered for reading. Anything more would be an assertion the method cannot support.
 */
export interface MechanismGroup {
  /**
   * Identifier of the form `mechanism-group-<k>-<index>`. The index is the k-means cluster index of
   * this run: stable for a given corpus, seed and k, and meaningless across any of those changing.
   */
  groupId: string
  size: number
  /** Distinguishing terms, highest contrast first. */
  terms: ReadonlyArray<{ term: string; weight: number }>
  /** The same terms as one reader-facing line, e.g. `terms: receptor, antagonist, adrenergic`. */
  termSummary: string
  /** Mean of the members' cosine to this centroid. */
  meanCohesion: number
  /** Sorted by attachment, strongest first, then by slug. */
  members: readonly MechanismGroupMember[]
}

/** A record that has recorded mechanism text but could not be placed, with the reason it could not. */
export interface UnplacedMechanismRecord {
  slug: string
  name: string
  reason: string
}

export interface MechanismGroupingDataset {
  groups: readonly MechanismGroup[]
  /**
   * Slug to group id, the peer-group map the anomaly agents read. A slug absent from this map has
   * no induced peer group and must be treated as ungrouped, never as a member of a default group.
   */
  groupIdBySlug: Readonly<Record<string, string>>
  /** Every cluster count tried, in the order they were tried. */
  sweep: readonly MechanismGroupSweepPoint[]
  /** The cluster count with the best sampled silhouette; ties go to the smaller count. */
  chosenClusterCount: number
  /** Terms surviving the document-frequency floor. The basis every vector is expressed in. */
  vocabularySize: number
  minDocumentFrequency: number
  /** Documents the vocabulary and IDF were fitted on. */
  documentCount: number
  silhouetteSampleSize: number
  /** Records with mechanism text that no group could take, listed rather than dropped silently. */
  unplaced: readonly UnplacedMechanismRecord[]
}

function padIndex(index: number, count: number): string {
  return String(index).padStart(String(Math.max(1, count - 1)).length, '0')
}

/** Source identifiers behind a record's mechanism statements, for a reviewer to check against. */
function mechanismSourceIdentifiers(statements: ReadonlyArray<{ source: { kind: string; identifier: string } }>): string[] {
  const seen = new Set<string>()
  for (const statement of statements) {
    seen.add(`${statement.source.kind}:${statement.source.identifier}`)
  }
  return [...seen].sort()
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

export const mechanismGroupingAgent: DatasetAgent<MechanismGroupingDataset> = {
  name: 'mechanism-text-grouping',
  version: '1.0.0',
  description:
    'Groups medicines whose recorded mechanism statements use similar wording, and describes each group by the terms that distinguish it.',

  run(input: AgentInput): AgentRun<MechanismGroupingDataset> {
    // Sorted by slug so the run cannot depend on the order the caller happened to assemble the
    // corpus in: k-means seeding draws by position, and an unsorted corpus would reproduce a
    // different grouping from the same seed.
    const withText = [...input.corpus]
      .sort((left, right) => (left.slug < right.slug ? -1 : left.slug > right.slug ? 1 : 0))
      .map((entry) => {
        const statements = entry.background.mechanism?.statements ?? []
        return {
          entry,
          statements,
          text: statements
            .map((statement) => statement.textAsRecorded)
            .join(' ')
            .trim(),
        }
      })
      .filter((candidate) => candidate.text.length > 0)

    const model = fitTfIdf(
      withText.map((candidate) => candidate.text),
      MIN_DOCUMENT_FREQUENCY,
    )

    // A statement whose only words are the medicine's own name and a term no other statement uses
    // vectorises to nothing. It is held out rather than assigned: a zero vector is equidistant from
    // every centroid, so placing it would record an arbitrary index as a peer group.
    const placeable: Array<{ slug: string; name: string; vector: SparseVector }> = []
    const unplaced: UnplacedMechanismRecord[] = []
    for (const candidate of withText) {
      const vector = transform(model, candidate.text)
      if (vector.indices.length === 0) {
        unplaced.push({
          slug: candidate.entry.slug,
          name: candidate.entry.name,
          reason: `The recorded mechanism statement contains no term that at least ${MIN_DOCUMENT_FREQUENCY} recorded statements share, so it has no position in the corpus vocabulary.`,
        })
        continue
      }
      placeable.push({ slug: candidate.entry.slug, name: candidate.entry.name, vector })
    }

    const vectors = placeable.map((item) => item.vector)

    const sweep: MechanismGroupSweepPoint[] = []
    const clusterings = new Map<number, Clustering>()
    for (const clusterCount of MECHANISM_GROUP_CLUSTER_COUNTS) {
      if (clusterCount > vectors.length) continue
      const clustering = sphericalKMeans(vectors, clusterCount, input.seed, MAX_ITERATIONS)
      // One seed for every k, so the silhouette sample is the same set of documents at each
      // cluster count and the sweep is a paired comparison rather than six unrelated draws.
      const silhouette = sampledSilhouette(
        vectors,
        clustering.assignments,
        input.seed,
        SILHOUETTE_SAMPLE_SIZE,
      )
      const occupied = new Set<number>()
      for (const assignment of clustering.assignments) occupied.add(assignment)
      clusterings.set(clusterCount, clustering)
      sweep.push({
        clusterCount,
        silhouette: round(silhouette, 6),
        cohesion: round(clustering.cohesion, 6),
        iterations: clustering.iterations,
        converged: clustering.converged,
        emptyClusters: clustering.centroids.length - occupied.size,
      })
    }

    // Ties go to the smaller cluster count: a coarser grouping that scores the same separates the
    // corpus no worse and leaves fewer groups too small to serve as anyone's peer group.
    const best = sweep.reduce<MechanismGroupSweepPoint | undefined>(
      (chosen, point) =>
        chosen === undefined || point.silhouette > chosen.silhouette ? point : chosen,
      undefined,
    )
    const chosenClusterCount = best?.clusterCount ?? 0
    const clustering = best ? clusterings.get(best.clusterCount) : undefined

    const groups: MechanismGroup[] = []
    const groupIdBySlug: Record<string, string> = {}

    if (clustering) {
      const membersByCluster = new Map<number, MechanismGroupMember[]>()
      for (let index = 0; index < placeable.length; index += 1) {
        const item = placeable[index]!
        const cluster = clustering.assignments[index]!
        const centroid = clustering.centroids[cluster]!
        const members = membersByCluster.get(cluster) ?? []
        members.push({
          slug: item.slug,
          name: item.name,
          cosineToCentroid: round(cosine(item.vector, centroid), 6),
        })
        membersByCluster.set(cluster, members)
      }

      for (let cluster = 0; cluster < clustering.centroids.length; cluster += 1) {
        const members = membersByCluster.get(cluster)
        // k-means keeps the stale centroid of an emptied cluster so the parameter stays honest.
        // Describing that centroid would attach terms to a group nothing is in, so it is counted
        // in the sweep and not emitted here.
        if (!members || members.length === 0) continue
        members.sort(
          (left, right) =>
            right.cosineToCentroid - left.cosineToCentroid ||
            (left.slug < right.slug ? -1 : left.slug > right.slug ? 1 : 0),
        )
        const terms = describeCluster(
          model,
          clustering.centroids[cluster]!,
          clustering.centroids,
          TERMS_PER_GROUP,
        ).map((term) => ({ term: term.term, weight: round(term.weight, 6) }))
        const groupId = `mechanism-group-${chosenClusterCount}-${padIndex(cluster, chosenClusterCount)}`
        for (const member of members) groupIdBySlug[member.slug] = groupId
        groups.push({
          groupId,
          size: members.length,
          terms,
          termSummary: `terms: ${terms.map((term) => term.term).join(', ')}`,
          meanCohesion: round(
            members.reduce((total, member) => total + member.cosineToCentroid, 0) / members.length,
            6,
          ),
          members,
        })
      }

      groups.sort((left, right) => right.size - left.size || (left.groupId < right.groupId ? -1 : 1))
    }

    const statementsBySlug = new Map(
      withText.map((candidate) => [candidate.entry.slug, candidate.statements]),
    )
    const queue: ReviewCandidate[] = groups
      .flatMap((group) =>
        group.members
          .filter((member) => member.cosineToCentroid < WEAK_ATTACHMENT_COSINE)
          .map((member) => ({ group, member })),
      )
      .sort(
        (left, right) =>
          left.member.cosineToCentroid - right.member.cosineToCentroid ||
          (left.member.slug < right.member.slug ? -1 : 1),
      )
      .slice(0, MAX_QUEUE_LENGTH)
      .map(({ group, member }) => ({
        slug: member.slug,
        reason: 'COVERAGE_GAP' as const,
        question: `The recorded mechanism wording for this record sits at cosine ${member.cosineToCentroid.toFixed(3)} from the nearest induced group of wording. Is the recorded statement the full text the source section prints?`,
        priority: round(1 - member.cosineToCentroid, 6),
        basis: `Cosine of the record's mechanism vector to the centroid of ${group.groupId}, under term frequency-inverse document frequency over ${model.vocabulary.size} terms and spherical k-means at ${chosenClusterCount} groups, seed ${input.seed}. A low value describes the wording on file, not the medicine.`,
        sources: mechanismSourceIdentifiers(statementsBySlug.get(member.slug) ?? []),
      }))

    const silhouettes = sweep.map((point) => point.silhouette)
    const lowestSilhouette = silhouettes.length > 0 ? Math.min(...silhouettes) : 0
    const highestSilhouette = silhouettes.length > 0 ? Math.max(...silhouettes) : 0
    const lastSwept = MECHANISM_GROUP_CLUSTER_COUNTS[MECHANISM_GROUP_CLUSTER_COUNTS.length - 1]!

    const caveats: string[] = [
      'A group here is a set of medicines whose recorded mechanism wording clusters together under the stated method, parameters and seed. It is not a pharmacological class and must never be given a class name; the output has no field for one, and the only honest description of a group is the terms that distinguish it.',
      'Two medicines appearing in one group is a statement about two documents. Nothing in this dataset pairs, ranks or links one medicine to another, and no such relation may be read out of the membership lists.',
      'The vocabulary, the inverse document frequencies and therefore the whole basis are computed from this corpus. Adding or removing medicines shifts every vector, so groups from two different corpus versions are not comparable and a group id means nothing outside the run that produced it.',
      'The grouping reflects how mechanism statements are written as much as what they describe. Two medicines whose recorded mechanisms are the same but whose label sections use different prose will not group together, and two whose sections share vocabulary for unrelated reasons may.',
      `Separation is weak throughout the sweep: the sampled silhouette ran from ${lowestSilhouette.toFixed(4)} to ${highestSilhouette.toFixed(4)}, where 0 means groups overlap as much as they separate. The chosen cluster count is the best of a poorly separated set, not evidence that the corpus falls into distinct groups.`,
      ...(chosenClusterCount === lastSwept
        ? [
            `The best silhouette fell at ${chosenClusterCount}, the largest cluster count swept, so a finer grouping might score higher. The swept range is a declared parameter of this version and is not extended silently.`,
          ]
        : []),
      `${unplaced.length} record${unplaced.length === 1 ? '' : 's'} with recorded mechanism text could not be placed and ${unplaced.length === 1 ? 'is' : 'are'} listed in full rather than assigned to a nearest group.`,
      'Medicines with no recorded mechanism statement are absent from every group. That absence is a gap in the corpus and says nothing about the medicine.',
    ]

    return {
      agent: this.name,
      version: this.version,
      runDate: input.runDate,
      seed: input.seed,
      parameters: {
        vectoriser: 'tf-idf sublinear, l2-normalised',
        minDocumentFrequency: MIN_DOCUMENT_FREQUENCY,
        vocabularySize: model.vocabulary.size,
        clusterer: 'spherical k-means, k-means++ seeding',
        maxIterations: MAX_ITERATIONS,
        sweptClusterCounts: MECHANISM_GROUP_CLUSTER_COUNTS.join(','),
        silhouetteSampleSize: SILHOUETTE_SAMPLE_SIZE,
        // The whole sweep is repeated into the parameters, not only the winner, so the choice can
        // be second-guessed from the run header alone.
        silhouetteByClusterCount: sweep
          .map((point) => `${point.clusterCount}:${point.silhouette.toFixed(6)}`)
          .join(' '),
        chosenClusterCount,
        termsPerGroup: TERMS_PER_GROUP,
        weakAttachmentCosine: WEAK_ATTACHMENT_COSINE,
        seed: input.seed,
      },
      coverage: {
        considered: input.corpus.length,
        used: placeable.length,
        reason: `Of ${input.corpus.length} records, ${withText.length} carry recorded mechanism text and ${placeable.length} of those contain at least one term shared by ${MIN_DOCUMENT_FREQUENCY} or more recorded statements. The rest have no mechanism statement on file or no wording the corpus vocabulary covers.`,
      },
      output: {
        groups,
        groupIdBySlug,
        sweep,
        chosenClusterCount,
        vocabularySize: model.vocabulary.size,
        minDocumentFrequency: MIN_DOCUMENT_FREQUENCY,
        documentCount: model.documentCount,
        silhouetteSampleSize: SILHOUETTE_SAMPLE_SIZE,
        unplaced,
      },
      queue,
      caveats,
    }
  },
}
