<script setup lang="ts">
import { useDevtoolsClient } from '@nuxt/devtools-kit/iframe-client'
import type { Query, QueryCacheNotifyEvent, QueryState } from '@tanstack/vue-query'

function mapQuery(query: Query) {
  return {
    queryKey: query.queryKey,
    queryHash: query.queryHash,
    observerCount: query.observers?.length ?? 0,
    state: ref(query.state),
  }
}

const devtoolsClient = useDevtoolsClient()
const queryClient = computed(() => devtoolsClient.value?.host?.nuxt.vueApp.config.globalProperties?.$queryClient)
const queryCache = computed(() => queryClient.value?.getQueryCache())
const queries = computed(() => queryClient.value?.getQueryCache().getAll().map(mapQuery))

const searchString = ref('')
const selectedQuery = reactive({
  queryKey: '',
  queryHash: '',
  observerCount: 0,
  state: ref({
    fetchStatus: 'idle',
    status: 'pending',
    dataUpdatedAt: 0,
    dataUpdateCount: 0,
    isInvalidated: false,
  } as QueryState),
})

function onQueryNotification(event: QueryCacheNotifyEvent) {
  switch (event.type) {
    case 'updated':
      console.log('Query updated', event.query.queryKey)
      if (selectedQuery.queryHash === event.query.queryHash) {
        selectedQuery.queryKey = event.query.queryKey
        selectedQuery.queryHash = event.query.queryHash
        selectedQuery.observerCount = event.query.observers?.length ?? 0
        selectedQuery.state = { ...event.query.state }
      }
      break
    case 'added':
      console.log('Query added', event.query.queryKey)
      break
    case 'removed':
      console.log('Query removed', event.query.queryKey)
      break
    default:
      break
  }
}

watchEffect(() => {
  if (!queryCache.value) {
    return
  }

  const unsubscribe = queryCache.value.subscribe(onQueryNotification)

  onBeforeUnmount(() => {
    queryCache.value?.clear()
    unsubscribe()
  })
})

function selectQuery(queryItem: Query) {
  Object.assign(selectedQuery, mapQuery(queryItem))
}
</script>

<template>
  <NSplitPane storage-key="tab-vue-query">
    <template #left>
      <NNavbar
        v-model:search="searchString"
        class="pb2"
      >
        <div class="flex gap-1 text-sm">
          <span op50>{{ queries?.length }} queries in total</span>
        </div>
      </NNavbar>

      <QueryListItem
        v-for="item in queries"
        :key="item.queryHash"
        :item="item"
        @click="selectQuery(item)"
      />
    </template>

    <template #right>
      <NPanelGrids class="w-full">
        <NCard class="px6 py2 w-full">
          <div v-if="selectedQuery">
            <h3>Selected Query</h3>
            <p><strong>Query Key:</strong> {{ selectedQuery?.queryKey }}</p>
            <p><strong>Query Hash:</strong> {{ selectedQuery?.queryHash }}</p>
            <p><strong>Status:</strong> {{ selectedQuery.state.status }}</p>
            <p><strong>Fetch Status:</strong> {{ selectedQuery.state.fetchStatus }}</p>
            <p><strong>Invalidated:</strong> {{ selectedQuery.state.isInvalidated }}</p>
            <p><strong>Updated At:</strong> {{ new Date(selectedQuery.state.dataUpdatedAt).toLocaleString() }}</p>
            <p><strong>Update Count:</strong> {{ selectedQuery.state.dataUpdateCount }}</p>
            <p><strong>Active:</strong> {{ selectedQuery.observerCount === 0 ? 'Inactive' : 'Active' }}</p>
            <!-- <p><strong>IsStale:</strong> {{ selectedQuery.isStale() }}</p> -->
            <!-- <p><strong>Disabled:</strong> {{ selectedQuery.isDisabled() }}</p> -->
          </div>
          <div v-else>
            <span class="op75">Select a query</span>
          </div>
        </NCard>
      </NPanelGrids>
    </template>
  </NSplitPane>
</template>
