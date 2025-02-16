<script setup lang="ts">
import type { QueryKey, QueryState } from '@tanstack/vue-query'

interface QueryItem {
  queryKey: QueryKey
  queryHash: string
  observerCount: number
  state: Ref<QueryState>
}

withDefaults(defineProps<{
  item: QueryItem
  index?: number
}>(), {
  index: 0,
})
</script>

<template>
  <div class="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-2 text-secondary hover:n-bg-hover truncate">
    <div>
      {{ item.queryKey }}
    </div>
    <div class="text-right">
      <span
        :class="{
          'i-carbon-play-outline-filled text-green': item.state.value.fetchStatus === 'fetching',
          'i-carbon-pause-outline-filled text-gray': item.state.value.fetchStatus === 'paused',
          'i-carbon-navaid-helipad text-blue': item.state.value.fetchStatus === 'idle',
        }"
      />
    </div>
    <div class="text-right">
      <span
        :class="{
          'i-carbon-checkmark-filled text-green': item.state.value.status === 'success',
          'i-carbon-error-filled text-red': item.state.value.status === 'error',
          'i-carbon-help-filled text-gray': item.state.value.status === 'pending',
        }"
      />
    </div>
    <div class="text-right">
      <span
        :class="{
          'i-carbon-view-off-filled text-gray': item.observerCount === 0,
          'i-carbon-view-filled text-blue': item.observerCount !== 0,
        }"
      />
    </div>
  </div>
</template>
