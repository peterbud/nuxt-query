<script setup lang="ts">
import { onServerPrefetch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useRoute, useRequestHeaders, useState } from '#app'

defineOptions({ name: 'QueryPage' })

const id = String(useRoute().params.id)
const request = useRequestHeaders(['x-query-request'])['x-query-request'] ?? 'public'
const calls = useState<Record<string, number>>('query-calls', () => ({}))
const { data, suspense } = useQuery({
  queryKey: ['page', id],
  queryFn: async () => {
    if (import.meta.client)
      calls.value[id] = (calls.value[id] ?? 0) + 1

    return {
      source: import.meta.server ? 'server-query' : 'client-query',
      request,
      createdAt: new Date('2026-01-01T00:00:00Z'),
    }
  },
  enabled: import.meta.client || id !== 'empty',
  staleTime: id === 'stale' ? 0 : 60_000,
})
const initialSource = data.value?.source ?? 'missing'

if (id !== 'empty')
  onServerPrefetch(suspense)
</script>

<template>
  <div>
    <p
      id="query"
      :data-initial="initialSource"
      :data-calls="calls[id] ?? 0"
    >
      {{ data?.source }} {{ data?.request }}
    </p>
    <NuxtLink
      to="/"
      :prefetch="false"
    >Home</NuxtLink>
  </div>
</template>
