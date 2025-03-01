<script setup lang="ts">
import type { Query } from '@tanstack/vue-query'

defineProps<{
  item: Query
  index?: number
}>()
</script>

<template>
  <div
    class="grid gap-2 px-2 text-secondary hover:n-bg-hover truncate max-w-full"
    :style="{
      'grid-template-columns': '1em 1fr auto auto auto',
    }"
  >
    <div
      :style="{
        'width': '1em',
        'height': '1em',
        'border-radius': '10%',
        'align-self': 'center',
        'background-color': getBackgroundColor(item),
      }"
    />
    <div
      class="truncate"
    >
      {{ item.queryKey }}
    </div>
    <div class="text-right">
      <span
        :class="{
          'i-carbon-play-outline-filled text-green': item.state.fetchStatus === 'fetching',
          'i-carbon-pause-outline-filled text-gray': item.state.fetchStatus === 'paused',
          'i-carbon-navaid-helipad text-blue': item.state.fetchStatus === 'idle',
        }"
      />
    </div>
    <div class="text-right">
      <span
        :class="{
          'i-carbon-checkmark-filled text-green': item.state.status === 'success',
          'i-carbon-error-filled text-red': item.state.status === 'error',
          'i-carbon-help-filled text-gray': item.state.status === 'pending',
        }"
      />
    </div>
    <div class="text-right">
      <span
        :class="{
          'i-carbon-view-off-filled text-gray': item.observers.length === 0,
          'i-carbon-view-filled text-blue': item.observers.length !== 0,
        }"
      />
    </div>
  </div>
</template>
