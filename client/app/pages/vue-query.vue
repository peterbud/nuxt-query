<script setup lang="ts">
import { useDevtoolsClient } from '@nuxt/devtools-kit/iframe-client'
import type { Query, QueryCacheNotifyEvent, QueryClient } from '@tanstack/vue-query'

const searchString = ref('')
const queries = ref(new Array<Query>())
const selectedQuery = ref<Query | null>(null)

const devtoolsClient = useDevtoolsClient()
const queryClient = computed(() => devtoolsClient.value?.host?.nuxt.vueApp.config.globalProperties?.$queryClient as QueryClient | undefined)
const queryCache = computed(() => queryClient.value?.getQueryCache())
const filteredQueries = computed(() => {
  return !queries.value
    ? [] as Query[]
    : !searchString.value
        ? queries.value
        : queries.value.filter((query) => {
            return query.queryKey.toString().toLowerCase().includes(searchString.value.toLowerCase())
          })
})

function onQueryNotification(event: QueryCacheNotifyEvent) {
  switch (event.type) {
    case 'observerResultsUpdated':
      // TODO: when data becomes stale/invalidate etc, the query is updated
      // fall through
    case 'updated': {
      const query = queries.value.find(q => q.queryHash === event.query.queryHash)
      if (query) {
        query.state = { ...event.query.state }
      }
      break
    }
    case 'added':
      queries.value.push(event.query)
      break
    case 'removed': {
      const index = queries.value.findIndex(q => q.queryHash === event.query.queryHash)
      if (index !== -1) {
        queries.value.splice(index, 1)
      }
      if (selectedQuery.value?.queryHash === event.query.queryHash) {
        selectedQuery.value = null
      }
      break
    }
    default:
      console.log('Unknown event', event.type)
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
        v-for="item in filteredQueries"
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
            icon="carbon-query"
            text="Query Overview"
            :padding="true"
          >
            <template #actions>
              <NButton
                v-tooltip="'Refetch'"
                title="Refetch"
                class="text-primary self-start"
                icon="i-carbon-recycle"
                :disabled="selectedQuery.state.fetchStatus === 'fetching'"
                @click="toRaw(selectedQuery)?.fetch()"
              />
              <NButton
                v-tooltip="'Invalidate'"
                title="Invalidate"
                class="text-primary self-start"
                icon="i-carbon-trash-can"
                :disabled="selectedQuery.state.status === 'pending'"
                @click="toRaw(selectedQuery)?.invalidate()"
              />
              <NButton
                v-tooltip="'Reset'"
                title="Reset"
                class="text-primary self-start"
                icon="i-carbon-restart"
                :disabled="selectedQuery.state.status === 'pending'"
                @click="toRaw(selectedQuery)?.reset()"
              />
            </template>
            <div class="grid grid-cols-[auto_1fr] gap-1 px-2 py-2 b-1 b-solid b-gray-200">
              <div>
                <strong>Query Key:</strong>
              </div>
              <div>
                {{ selectedQuery?.queryKey }}
              </div>
              <div>
                <strong>Query Hash:</strong>
              </div>
              <div>
                {{ selectedQuery?.queryHash }}
              </div>
              <div>
                <strong>Overall status:</strong>
              </div>
              <div>
                <span
                  class="rounded whitespace-nowrap select-none mx-0.5 px-1.5 py-0.5"
                  :style="{
                    'background-color': `${getBackgroundColor(selectedQuery as Query)}`,
                  }"
                >
                  {{ getQueryStatusLabel(selectedQuery as Query) }}
                </span>
              </div>
              <div>
                <strong>Last Updated:</strong>
              </div>
              <div>
                {{ new Date(selectedQuery.state.dataUpdatedAt).toLocaleString() }}
              </div>
            </div>
          </NSectionBlock>
          <NSectionBlock
            icon="carbon-cube"
            text="Data Explorer"
            :padding="true"
            :open="false"
          >
            <VueJsonPretty
              :data="selectedQuery.state.data"
              deep="2"
              virtual="true"
              height="150"
            />
          </NSectionBlock>
          <NSectionBlock
            icon="carbon-query-queue"
            text="Query Details"
            :padding="true"
          >
            <div class="grid grid-cols-[auto_1fr] gap-1 px-2 py-2 b-1 b-solid b-gray-200">
              <div><strong>Status:</strong></div>
              <div>
                {{ selectedQuery.state.status }}
              </div>
              <div><strong>Fetch Status:</strong></div>
              <div>
                {{ selectedQuery.state.fetchStatus }}
              </div>
              <div><strong>Invalidated:</strong></div>
              <div>
                {{ selectedQuery.state.isInvalidated }}
              </div>
              <div><strong>Update Count:</strong></div>
              <div>
                {{ selectedQuery.state.dataUpdateCount }}
              </div>
              <div><strong>Active:</strong></div>
              <div>
                {{ selectedQuery.observers.length === 0 ? 'Inactive' : 'Active' }}
              </div>
              <div><strong>IsStale:</strong></div>
              <div>
                {{ toRaw(selectedQuery)?.isStale() }}
              </div>
              <div><strong>Disabled:</strong></div>
              <div>
                {{ toRaw(selectedQuery)?.isDisabled() }}
              </div>
              <div><strong>GCTime:</strong></div>
              <div>
                {{ selectedQuery.gcTime }}
              </div>
              <div><strong>Meta:</strong></div>
              <VueJsonPretty
                :data="toRaw(selectedQuery)?.meta"
                deep="2"
                virtual="true"
                height="150"
              />
            </div>
          </NSectionBlock>
        </div>
        <div v-else>
          <span class="op75">Select a query</span>
        </div>
      </NPanelGrids>
    </template>
  </NSplitPane>
</template>
