import type { Query, Mutation } from '@tanstack/vue-query'

export type SortDirection = 'asc' | 'desc'
export type SortField = 'status' | 'key' | 'date'

const queryStatusRank: Record<string, number> = {
  fetching: 0,
  paused: 1,
  stale: 2,
  fresh: 3,
  inactive: 4,
}

const mutationStatusRank: Record<string, number> = {
  Loading: 0,
  Success: 1,
  Error: 2,
  Paused: 3,
  Idle: 4,
}

function compareString(a: string, b: string) {
  return a.localeCompare(b)
}

function compareNumber(a: number, b: number) {
  return a - b
}

function applyDirection(value: number, direction: SortDirection) {
  return direction === 'desc' ? -value : value
}

function getQueryKeyString(query: Query) {
  return query.queryKey?.toString().toLowerCase() || ''
}

function getMutationKeyString(mutation: Mutation) {
  return mutation.options.mutationKey?.toString().toLowerCase() || ''
}

export function sortQueries(queries: Query[], field: SortField, direction: SortDirection) {
  return queries
    .map((query, index) => ({ query, index }))
    .sort((a, b) => {
      const queryA = a.query
      const queryB = b.query

      let value = 0

      if (field === 'status') {
        const statusA = getQueryStatusLabel(queryA)
        const statusB = getQueryStatusLabel(queryB)
        value = compareNumber(queryStatusRank[statusA] ?? Number.MAX_SAFE_INTEGER, queryStatusRank[statusB] ?? Number.MAX_SAFE_INTEGER)
      }
      else if (field === 'key') {
        value = compareString(getQueryKeyString(queryA), getQueryKeyString(queryB))
      }
      else {
        value = compareNumber(queryA.state.dataUpdatedAt || 0, queryB.state.dataUpdatedAt || 0)
      }

      if (value !== 0) {
        return applyDirection(value, direction)
      }

      value = compareString(queryA.queryHash, queryB.queryHash)

      if (value !== 0) {
        return value
      }

      return compareNumber(a.index, b.index)
    })
    .map(item => item.query)
}

export function sortMutations(mutations: Mutation[], field: SortField, direction: SortDirection) {
  return mutations
    .map((mutation, index) => ({ mutation, index }))
    .sort((a, b) => {
      const mutationA = a.mutation
      const mutationB = b.mutation

      let value = 0

      if (field === 'status') {
        const statusA = getMutationStatusLabel(mutationA)
        const statusB = getMutationStatusLabel(mutationB)
        value = compareNumber(mutationStatusRank[statusA] ?? Number.MAX_SAFE_INTEGER, mutationStatusRank[statusB] ?? Number.MAX_SAFE_INTEGER)
      }
      else if (field === 'key') {
        value = compareString(getMutationKeyString(mutationA), getMutationKeyString(mutationB))
      }
      else {
        value = compareNumber(mutationA.state.submittedAt || 0, mutationB.state.submittedAt || 0)
      }

      if (value !== 0) {
        return applyDirection(value, direction)
      }

      value = compareNumber(mutationA.mutationId, mutationB.mutationId)

      if (value !== 0) {
        return value
      }

      return compareNumber(a.index, b.index)
    })
    .map(item => item.mutation)
}

export function getQueryStatusLabel(query: Query) {
  return query.state.fetchStatus === 'fetching'
    ? 'fetching'
    : query.observers.length < 1
      ? 'inactive'
      : query.state.fetchStatus === 'paused'
        ? 'paused'
        : toRaw(query)?.isStale()
          ? 'stale'
          : 'fresh'
}

export function getQueryBackgroundColor(query: Query) {
  return query.state.fetchStatus === 'fetching'
    ? 'blue'
    : query.observers.length < 1
      ? 'gray'
      : query.state.fetchStatus === 'paused'
        ? 'purple'
        : toRaw(query)?.isStale()
          ? 'orange'
          : 'green'
}

export function getMutationStatusLabel(mutation: Mutation) {
  const { status } = mutation.state
  if (mutation.state.isPaused) return 'Paused'
  if (status === 'error') return 'Error'
  if (status === 'pending') return 'Loading'
  if (status === 'success') return 'Success'
  return 'Idle'
}

export function getMutationBackgroundColor(mutation: Mutation) {
  const { status } = mutation.state
  if (mutation.state.isPaused) return 'purple'
  if (status === 'error') return 'red'
  if (status === 'pending') return 'yellow'
  if (status === 'success') return 'green'
  return 'gray'
}
