import { validateNeurodeContract, type NeurodeDefinition } from './contracts'

export type NeurodeGraphErrorCode =
  | 'DUPLICATE_NEURODE_ID'
  | 'DUPLICATE_DEPENDENCY'
  | 'MISSING_DEPENDENCY'
  | 'AMBIGUOUS_DEPENDENCY'
  | 'DEPENDENCY_CYCLE'
  | 'UNKNOWN_REQUESTED_NEURODE'

export class NeurodeGraphError extends Error {
  constructor(
    readonly code: NeurodeGraphErrorCode,
    message: string,
    readonly neurodeIds: readonly string[],
  ) {
    super(message)
    this.name = 'NeurodeGraphError'
  }
}

export interface NeurodePlan {
  /** User-requested roots, canonicalized independently of caller order. */
  requestedIds: readonly string[]
  /** Requested roots plus every transitive prerequisite, in deterministic topological order. */
  definitions: readonly NeurodeDefinition[]
}

/**
 * A fully resolved DAG. Dependency selectors are resolved once, before execution, so a registry
 * change cannot silently bind one node to a different producer halfway through a run.
 */
export class NeurodeGraph {
  readonly #definitions: readonly NeurodeDefinition[]
  readonly #byId: ReadonlyMap<string, NeurodeDefinition>
  readonly #dependencyIds: ReadonlyMap<string, readonly string[]>
  readonly #topologicalIds: readonly string[]

  constructor(definitions: readonly NeurodeDefinition[]) {
    const byId = new Map<string, NeurodeDefinition>()
    for (const definition of definitions) {
      validateNeurodeContract(definition.contract)
      const id = definition.contract.id
      if (byId.has(id)) {
        throw new NeurodeGraphError(
          'DUPLICATE_NEURODE_ID',
          `Neurode id "${id}" occurs more than once, so dependencies cannot be resolved.`,
          [id],
        )
      }
      byId.set(id, definition)
    }

    const providersBySchema = new Map<string, string[]>()
    for (const definition of definitions) {
      const providers = providersBySchema.get(definition.contract.outputSchemaId) ?? []
      providers.push(definition.contract.id)
      providersBySchema.set(definition.contract.outputSchemaId, providers)
    }
    for (const providers of providersBySchema.values()) providers.sort()

    const dependencyIds = new Map<string, readonly string[]>()
    for (const definition of definitions) {
      const id = definition.contract.id
      const resolved: string[] = []
      for (const dependency of definition.contract.dependencies) {
        let dependencyId: string
        if (dependency.selector === 'NEURODE_ID') {
          dependencyId = dependency.neurodeId
          if (!byId.has(dependencyId)) {
            throw new NeurodeGraphError(
              'MISSING_DEPENDENCY',
              `${id} depends on unregistered neurode "${dependencyId}".`,
              [id, dependencyId],
            )
          }
        } else {
          const providers = providersBySchema.get(dependency.outputSchemaId) ?? []
          if (providers.length === 0) {
            throw new NeurodeGraphError(
              'MISSING_DEPENDENCY',
              `${id} requires output schema "${dependency.outputSchemaId}", but no neurode provides it.`,
              [id],
            )
          }
          if (providers.length > 1) {
            throw new NeurodeGraphError(
              'AMBIGUOUS_DEPENDENCY',
              `${id} requires output schema "${dependency.outputSchemaId}", which has multiple providers: ${providers.join(', ')}.`,
              [id, ...providers],
            )
          }
          const onlyProvider = providers[0]
          if (onlyProvider === undefined) {
            throw new NeurodeGraphError(
              'MISSING_DEPENDENCY',
              `${id} has an unresolved output schema dependency.`,
              [id],
            )
          }
          dependencyId = onlyProvider
        }

        if (resolved.includes(dependencyId)) {
          throw new NeurodeGraphError(
            'DUPLICATE_DEPENDENCY',
            `${id} resolves more than one dependency declaration to "${dependencyId}".`,
            [id, dependencyId],
          )
        }
        resolved.push(dependencyId)
      }
      dependencyIds.set(id, Object.freeze(resolved.sort()))
    }

    const inDegree = new Map<string, number>()
    const dependents = new Map<string, string[]>()
    for (const id of byId.keys()) {
      inDegree.set(id, dependencyIds.get(id)?.length ?? 0)
      dependents.set(id, [])
    }
    for (const [id, dependencies] of dependencyIds) {
      for (const dependencyId of dependencies) dependents.get(dependencyId)?.push(id)
    }
    for (const values of dependents.values()) values.sort()

    const ready = [...inDegree]
      .filter(([, degree]) => degree === 0)
      .map(([id]) => id)
      .sort()
    const topologicalIds: string[] = []
    while (ready.length > 0) {
      const id = ready.shift()
      if (id === undefined) break
      topologicalIds.push(id)
      for (const dependentId of dependents.get(id) ?? []) {
        const remaining = (inDegree.get(dependentId) ?? 0) - 1
        inDegree.set(dependentId, remaining)
        if (remaining === 0) {
          ready.push(dependentId)
          ready.sort()
        }
      }
    }

    if (topologicalIds.length !== definitions.length) {
      const blocked = [...inDegree]
        .filter(([, degree]) => degree > 0)
        .map(([id]) => id)
        .sort()
      throw new NeurodeGraphError(
        'DEPENDENCY_CYCLE',
        `Neurode dependencies contain a cycle involving: ${blocked.join(', ')}.`,
        blocked,
      )
    }

    this.#definitions = Object.freeze([...definitions])
    this.#byId = byId
    this.#dependencyIds = dependencyIds
    this.#topologicalIds = Object.freeze(topologicalIds)
  }

  definitions(): readonly NeurodeDefinition[] {
    return this.#definitions
  }

  get(id: string): NeurodeDefinition | undefined {
    return this.#byId.get(id)
  }

  dependenciesOf(id: string): readonly string[] {
    const dependencies = this.#dependencyIds.get(id)
    if (dependencies === undefined) {
      throw new NeurodeGraphError(
        'UNKNOWN_REQUESTED_NEURODE',
        `Neurode id "${id}" is not in this graph.`,
        [id],
      )
    }
    return dependencies
  }

  topologicalIds(): readonly string[] {
    return this.#topologicalIds
  }

  /**
   * Selects requested nodes and their entire upstream closure. Downstream consumers are not added:
   * asking to rerun an analysis does not implicitly publish it.
   */
  plan(requestedIds?: readonly string[]): NeurodePlan {
    const requested =
      requestedIds === undefined ? [...this.#topologicalIds] : [...new Set(requestedIds)].sort()

    for (const id of requested) {
      if (!this.#byId.has(id)) {
        throw new NeurodeGraphError(
          'UNKNOWN_REQUESTED_NEURODE',
          `Requested neurode id "${id}" is not in this graph.`,
          [id],
        )
      }
    }

    const included = new Set<string>()
    const includeWithDependencies = (id: string): void => {
      if (included.has(id)) return
      included.add(id)
      for (const dependencyId of this.#dependencyIds.get(id) ?? []) {
        includeWithDependencies(dependencyId)
      }
    }
    for (const id of requested) includeWithDependencies(id)

    const planned = this.#topologicalIds.flatMap((id) => {
      if (!included.has(id)) return []
      const definition = this.#byId.get(id)
      return definition === undefined ? [] : [definition]
    })
    return {
      requestedIds: Object.freeze(requested),
      definitions: Object.freeze(planned),
    }
  }
}
