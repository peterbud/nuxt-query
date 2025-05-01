import type { Query, Mutation } from '@tanstack/query-core'

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
