<script setup lang="ts">
import { useDevtoolsClient } from '@nuxt/devtools-kit/iframe-client'
import type { Query, QueryCacheNotifyEvent, QueryClient } from '@tanstack/vue-query'

// function mapQuery(query: Query) {
//   return {
//     queryKey: query.queryKey,
//     queryHash: query.queryHash,
//     observerCount: query.observers?.length ?? 0,
//     state: ref(query.state),
//   }
// }

const searchString = ref('')
const queries = ref(new Array<Query>())
const selectedQuery = ref<Query | null>(null)

const devtoolsClient = useDevtoolsClient()
const queryClient = computed(() => devtoolsClient.value?.host?.nuxt.vueApp.config.globalProperties?.$queryClient as QueryClient | undefined)
const queryCache = computed(() => queryClient.value?.getQueryCache())
const filteredQueries = computed(() => {
  if (!queries.value) {
    return [] as Query[]
  }
  return queries.value
})

function onQueryNotification(event: QueryCacheNotifyEvent) {
  switch (event.type) {
    case 'updated': {
      const query = queries.value.find(q => q.queryHash === event.query.queryHash)
      if (query) {
        query.state = { ...event.query.state }
      }
      break
    }
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

  queryCache.value.getAll().forEach((query) => {
    queries.value.push(query)
  })
  const unsubscribe = queryCache.value.subscribe(onQueryNotification)

  onBeforeUnmount(() => {
    queries.value = []
    queryCache.value?.clear()
    unsubscribe()
  })
})

function selectQuery(query: Query) {
  console.log('Selected query', query.queryKey)
  selectedQuery.value = toRaw(query)
}
</script>

<template>
  <NSplitPane
    storage-key="tab-vue-query"
    class="h-full"
  >
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
        :item="item as Query"
        @click="selectQuery(item as Query)"
      />
    </template>

    <template #right>
      <NPanelGrids class="">
        <div
          v-if="selectedQuery"
          class="w-full"
        >
          <NSectionBlock
            icon="carbon-moon"
            text="Query Overview"
            :padding="true"
          >
            <NCard class="px6 py2">
              <p><strong>Query Key:</strong> {{ selectedQuery?.queryKey }}</p>
              <p><strong>Query Hash:</strong> {{ selectedQuery?.queryHash }}</p>
              <p><strong>Last Updated:</strong> {{ new Date(selectedQuery.state.dataUpdatedAt).toLocaleString() }}</p>
            </NCard>
          </NSectionBlock>
          <NSectionBlock
            icon="carbon-settings"
            text="Data Explorer"
            :padding="true"
          >
            <NCard>
              TBD
            </NCard>
          </NSectionBlock>
          <NSectionBlock
            icon="carbon-settings"
            text="Query Explorer"
            :padding="true"
          >
            <NCard>
              <p><strong>Status:</strong> {{ selectedQuery.state.status }}</p>
              <p><strong>Fetch Status:</strong> {{ selectedQuery.state.fetchStatus }}</p>
              <p><strong>Invalidated:</strong> {{ selectedQuery.state.isInvalidated }}</p>
              <p><strong>Update Count:</strong> {{ selectedQuery.state.dataUpdateCount }}</p>
              <p><strong>Active:</strong> {{ selectedQuery.observers.length === 0 ? 'Inactive' : 'Active' }}</p>
              <p><strong>IsStale:</strong> {{ toRaw(selectedQuery)?.isStale() }}</p>
              <p><strong>Disabled:</strong> {{ toRaw(selectedQuery)?.isDisabled() }}</p>
            </NCard>
          </NSectionBlock>
        </div>
        <div v-else>
          <span class="op75">Select a query</span>
        </div>
      </NPanelGrids>
    </template>
  </NSplitPane>
</template>
