<script setup lang="ts">
import { computed } from 'vue'
import type { Query } from '@tanstack/vue-query'
import { getQueryBackgroundColor, getQueryStatusLabel } from '../utils/utils'

type QueryStatus = 'fetching' | 'inactive' | 'paused' | 'stale' | 'fresh'

const props = defineProps<{
  queries: Query[]
}>()

const statusOrder: Array<{ key: QueryStatus, label: string }> = [
  { key: 'fetching', label: 'Fetching' },
  { key: 'stale', label: 'Stale' },
  { key: 'fresh', label: 'Fresh' },
  { key: 'inactive', label: 'Inactive' },
  { key: 'paused', label: 'Paused' },
]

const fallbackColors: Record<QueryStatus, string> = {
  fetching: 'blue',
  inactive: 'gray',
  paused: 'purple',
  stale: 'orange',
  fresh: 'green',
}

const statusCounts = computed<Record<QueryStatus, number>>(() => {
  return props.queries.reduce((acc, query) => {
    const status = getQueryStatusLabel(query) as QueryStatus
    acc[status] += 1
    return acc
  }, {
    fetching: 0,
    inactive: 0,
    paused: 0,
    stale: 0,
    fresh: 0,
  })
})

function getStatusColor(status: QueryStatus) {
  const matchingQuery = props.queries.find(query => getQueryStatusLabel(query) === status)
  return matchingQuery ? getQueryBackgroundColor(matchingQuery) : fallbackColors[status]
}
</script>

<template>
  <div
    class="flex flex-wrap gap-2 p-2"
    :style="{ 'border-bottom': '1px solid rgba(128,128,128, 0.8)' }"
  >
    <div
      v-for="status in statusOrder"
      :key="status.key"
      class="inline-flex items-center gap-2 rounded px-2 py-1 text-xs"
      :style="{ 'background-color': 'rgba(128,128,128, 0.12)' }"
    >
      <span
        :style="{
          'width': '0.75em',
          'height': '0.75em',
          'border-radius': '2px',
          'background-color': getStatusColor(status.key),
        }"
      />
      <span class="op75">{{ status.label }}</span>
      <span class="text-secondary font-mono">{{ statusCounts[status.key] }}</span>
    </div>
  </div>
</template>
