<script setup lang="ts">
import { computed } from 'vue'
import type { Mutation } from '@tanstack/vue-query'
import { getMutationBackgroundColor, getMutationStatusLabel } from '../utils/utils'

type MutationStatus = 'Paused' | 'Error' | 'Loading' | 'Success' | 'Idle'

const props = defineProps<{
  mutations: Mutation[]
}>()

const statusOrder: Array<{ key: MutationStatus, label: string }> = [
  { key: 'Loading', label: 'Loading' },
  { key: 'Success', label: 'Success' },
  { key: 'Error', label: 'Error' },
  { key: 'Paused', label: 'Paused' },
  { key: 'Idle', label: 'Idle' },
]

const fallbackColors: Record<MutationStatus, string> = {
  Paused: 'purple',
  Error: 'red',
  Loading: 'yellow',
  Success: 'green',
  Idle: 'gray',
}

const statusCounts = computed<Record<MutationStatus, number>>(() => {
  return props.mutations.reduce((acc, mutation) => {
    const status = getMutationStatusLabel(mutation) as MutationStatus
    acc[status] += 1
    return acc
  }, {
    Paused: 0,
    Error: 0,
    Loading: 0,
    Success: 0,
    Idle: 0,
  })
})

function getStatusColor(status: MutationStatus) {
  const matchingMutation = props.mutations.find(mutation => getMutationStatusLabel(mutation) === status)
  return matchingMutation ? getMutationBackgroundColor(matchingMutation) : fallbackColors[status]
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
