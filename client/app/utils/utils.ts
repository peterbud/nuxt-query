import type { Query } from '@tanstack/query-core'

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

export function getBackgroundColor(query: Query) {
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
