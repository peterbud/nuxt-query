<script setup lang="ts">
import { useDevtoolsClient } from '@nuxt/devtools-kit/iframe-client'
import type { Query, QueryCacheNotifyEvent, QueryClient, Mutation, MutationCacheNotifyEvent } from '@tanstack/vue-query'
import 'splitpanes/dist/splitpanes.css'

const activeView = ref('query') // 'query' or 'mutation'
const searchString = ref('')
const queries = ref(new Array<Query>())
const selectedQuery = ref<Query | null>(null)
const mutations = ref(new Array<Mutation>())
const selectedMutation = ref<Mutation | null>(null)
const mutationSearchString = ref('')

const devtoolsClient = useDevtoolsClient()
const queryClient = computed(() => devtoolsClient.value?.host?.nuxt.vueApp.config.globalProperties?.$queryClient as QueryClient | undefined)
const queryCache = computed(() => queryClient.value?.getQueryCache())
const mutationCache = computed(() => queryClient.value?.getMutationCache())
const filteredQueries = computed(() => {
  return !queries.value
    ? [] as Query[]
    : !searchString.value
        ? queries.value
        : queries.value.filter((query) => {
            return query.queryKey.toString().toLowerCase().includes(searchString.value.toLowerCase())
          })
})
const filteredMutations = computed(() => {
  return !mutations.value
    ? [] as Mutation[]
    : !mutationSearchString.value
        ? mutations.value
        : mutations.value.filter((mutation) => {
            return mutation.options.mutationKey?.toString().toLowerCase().includes(mutationSearchString.value.toLowerCase())
          })
})

function onQueryNotification(event: QueryCacheNotifyEvent) {
  switch (event.type) {
    case 'observerResultsUpdated':
      // When data becomes stale/invalidate etc, the query is updated
      // fall through
    case 'observerAdded':
      // fall through
    case 'observerRemoved':
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
    case 'observerOptionsUpdated':
      // TODO
      break
  }
}

function onMutationNotification(event: MutationCacheNotifyEvent) {
  switch (event.type) {
    case 'added':
      mutations.value.push(event.mutation)
      break
    case 'removed': {
      const index = mutations.value.findIndex(m => m.mutationId === event.mutation.mutationId)
      if (index !== -1) {
        mutations.value.splice(index, 1)
      }
      if (selectedMutation.value?.mutationId === event.mutation.mutationId) {
        selectedMutation.value = null
      }
      break
    }
    case 'updated': {
      const mutation = mutations.value.find(m => m.mutationId === event.mutation.mutationId)
      if (mutation) {
        mutation.state = { ...event.mutation.state }
      }
      break
    }
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

watchEffect(() => {
  if (!mutationCache.value) {
    return
  }

  mutationCache.value.getAll().forEach((mutation) => {
    mutations.value.push(mutation)
  })
  const unsubscribe = mutationCache.value.subscribe(onMutationNotification)

  onBeforeUnmount(() => {
    mutations.value = []
    mutationCache.value?.clear()
    unsubscribe()
  })
})

function selectQuery(query: Query) {
  selectedQuery.value = toRaw(query)
}

function selectMutation(mutation: Mutation) {
  selectedMutation.value = toRaw(mutation)
}

function getQueryOptions(query: Query) {
  // return all query.options except for the functions

  return Object.entries(query.options).reduce((acc, [key, value]) => {
    if (typeof value === 'function') {
      return acc
    }
    // exclude queryKey, queryHash, and meta
    if (key === 'queryKey'
      || key === 'queryHash'
      || key === 'meta'
      || key.startsWith('_')) {
      return acc
    }
    acc[key] = value
    return acc
  }, {} as Record<string, unknown>)
}

function handleRestoreTriggerError(query: Query) {
  if (!query.state.error) {
    const error = new Error('Unknown error from devtools')

    const __previousQueryOptions = query.options

    query.setState({
      status: 'error',
      error,
      fetchMeta: {
        ...query.state.fetchMeta,
        __previousQueryOptions,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    })
  }
  else {
    query.reset()
    // reset() does NOT seem to refetch, even when the query IS active (has observers)
    // maybe a bug?
    // do it manually
    query.fetch()
  }
}

function restoreQueryAfterLoadingOrError(query: Query) {
  const previousState = query.state
  const previousOptions = query.state.fetchMeta
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? (query.state.fetchMeta as any).__previousQueryOptions
    : null

  query.cancel({ silent: true })
  query.setState({
    ...previousState,
    fetchStatus: 'idle',
    fetchMeta: null,
  })

  if (previousOptions) {
    query.fetch(previousOptions)
  }
}

function handleRestoreTriggerLoading(query: Query) {
  if (query.state.data === undefined) {
    restoreQueryAfterLoadingOrError(query)
  }
  else {
    if (!query) return
    const __previousQueryOptions = query.options
    // Trigger a fetch in order to trigger suspense as well.
    query.fetch({
      ...__previousQueryOptions,
      queryFn: () => {
        return new Promise(() => {
          // Never resolve
        })
      },
      gcTime: -1,
    })
    query.setState({
      data: undefined,
      status: 'pending',
      fetchMeta: {
        ...query.state.fetchMeta,
        __previousQueryOptions,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    })
  }
}
</script>

<template>
  <div class="h-full flex flex-col">
    <div
      class="flex gap-2 p-2"
      :style="{ 'border-bottom': '1px solid rgba(128,128,128, 0.8)' }"
    >
      <NButton
        class="text-white"
        :class="{ 'bg-primary': activeView === 'query' }"
        @click="activeView = 'query'"
      >
        Query Cache
      </NButton>
      <NButton
        :class="{ 'bg-primary text-white': activeView === 'mutation' }"
        @click="activeView = 'mutation'"
      >
        Mutation Cache
      </NButton>
    </div>

    <NSplitPane
      v-if="activeView === 'query'"
      storage-key="tab-vue-query"
      class="h-full"
    >
      <template #left>
        <NNavbar
          v-model:search="searchString"
          class="pb2"
          :style="{ 'border-bottom': '1px solid rgba(128,128,128, 0.8)' }"
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
                <NButton
                  v-tooltip="selectedQuery.state.status === 'pending' ? 'Restore Loading' : 'Trigger Loading'"
                  :title="selectedQuery.state.status === 'pending' ? 'Restore Loading' : 'Trigger Loading'"
                  class="text-primary self-start"
                  icon="i-carbon-hourglass"
                  @click="handleRestoreTriggerLoading(toRaw(selectedQuery) as Query)"
                />
                <NButton
                  v-tooltip="selectedQuery.state.status === 'error' ? 'Restore Error' : 'Trigger Error'"
                  :title="selectedQuery.state.status === 'error' ? 'Restore Error' : 'Trigger Error'"
                  class="text-primary self-start"
                  icon="i-carbon-warning"
                  :disabled="selectedQuery.state.status === 'pending'"
                  @click="handleRestoreTriggerError(toRaw(selectedQuery) as Query)"
                />
              </template>
              <div class="grid grid-cols-[auto_1fr] gap-1 px-2 py-2">
                <div>
                  <strong>Query Key:</strong>
                </div>
                <div>
                  {{ selectedQuery?.queryKey }}
                </div>
                <div>
                  <strong>Observers:</strong>
                </div>
                <div>
                  {{ selectedQuery.observers.length }}
                </div>
                <div>
                  <strong>Overall status:</strong>
                </div>
                <div>
                  <span
                    class="rounded whitespace-nowrap select-none mx-0.5 px-1.5 py-0.5"
                    :style="{
                      'background-color': `${getQueryBackgroundColor(selectedQuery as Query)}`,
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
                :deep="2"
                :virtual="true"
                :height="150"
              />
            </NSectionBlock>
            <NSectionBlock
              icon="carbon-query-queue"
              text="Query Details"
              :padding="true"
            >
              <div class="grid grid-cols-[auto_1fr] gap-1 px-2 py-2">
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
                <div><strong>Options:</strong></div>
                <VueJsonPretty
                  :data="getQueryOptions(selectedQuery as Query)"
                  :deep="2"
                  :virtual="true"
                  :height="150"
                />
                <div><strong>Meta:</strong></div>
                <VueJsonPretty
                  :data="toRaw(selectedQuery)?.meta"
                  :deep="2"
                  :virtual="true"
                  :height="150"
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

    <NSplitPane
      v-else
      storage-key="tab-vue-mutation"
      class="h-full"
    >
      <template #left>
        <NNavbar
          v-model:search="mutationSearchString"
          class="pb2"
          :style="{ 'border-bottom': '1px solid rgba(128,128,128, 0.8)' }"
        >
          <div class="flex gap-1 text-sm">
            <span op50>{{ mutations?.length }} mutations in total</span>
          </div>
        </NNavbar>

        <MutationListItem
          v-for="item in filteredMutations"
          :key="item.mutationId"
          :item="item as Mutation"
          @click="selectMutation(item as Mutation)"
        />
      </template>

      <template #right>
        <NPanelGrids class="">
          <div
            v-if="selectedMutation"
            class="w-full"
          >
            <NSectionBlock
              icon="carbon-mutation"
              text="Mutation Overview"
              :padding="true"
            >
              <div class="grid grid-cols-[auto_1fr] gap-1 px-2 py-2">
                <div>
                  <strong>Mutation Key:</strong>
                </div>
                <div>
                  {{ selectedMutation?.options.mutationKey }}
                </div>
                <div>
                  <strong>Status:</strong>
                </div>
                <div>
                  <span
                    class="rounded whitespace-nowrap select-none mx-0.5 px-1.5 py-0.5"
                    :style="{
                      'background-color': `${getMutationBackgroundColor(selectedMutation as Mutation)}`,
                    }"
                  >
                    {{ getMutationStatusLabel(selectedMutation as Mutation) }}
                  </span>
                </div>
              </div>
            </NSectionBlock>
          </div>
          <div v-else>
            <span class="op75">Select a mutation</span>
          </div>
        </NPanelGrids>
      </template>
    </NSplitPane>
  </div>
</template>

<style>
.splitpanes__splitter {
  border-color: rgba(128,128,128, 0.8);
}
</style>
