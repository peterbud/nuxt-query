<script setup lang="ts">
import { computed } from 'vue'
import type { SortDirection, SortField } from '../utils/utils'

const props = defineProps<{
  search: string
  totalCount: number
  itemLabel: string
  sortField: SortField
  sortDirection: SortDirection
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:sortField': [value: SortField]
  'update:sortDirection': [value: SortDirection]
}>()

const searchModel = computed({
  get: () => props.search,
  set: (value: string) => emit('update:search', value),
})

function toggleDirection() {
  emit('update:sortDirection', props.sortDirection === 'asc' ? 'desc' : 'asc')
}
</script>

<template>
  <div
    class="grid gap-2 p-2 b-b-1 b-[rgba(128,128,128,0.8)]"
  >
    <div
      class="grid items-center gap-2 grid-cols-[minmax(0,1fr)_auto]"
    >
      <div class="relative min-w-16">
        <span class="i-carbon-search absolute left-3 top-1/2 -translate-y-1/2 op50" />
        <input
          v-model="searchModel"
          type="text"
          class="w-full rounded pl-9 pr-1 py-2 text-sm"
          placeholder="Search..."
          aria-label="Search"
        >
      </div>

      <div
        class="grid items-center gap-2 grid-cols-[auto_auto_auto]"
      >
        <label
          class="text-xs op75"
          for="sort-field"
        >
          Sort
        </label>
        <select
          id="sort-field"
          class="rounded px-2 text-xs min-w-16 h-8"
          :value="sortField"
          @change="emit('update:sortField', ($event.target as HTMLSelectElement).value as SortField)"
        >
          <option value="status">
            Status
          </option>
          <option value="key">
            Key
          </option>
          <option value="date">
            Date/Time
          </option>
        </select>
        <NButton
          size="small"
          class="text-primary w-auto"
          :title="sortDirection === 'asc' ? 'Ascending' : 'Descending'"
          @click="toggleDirection"
        >
          {{ sortDirection === 'asc' ? 'ASC' : 'DESC' }}
        </NButton>
      </div>
    </div>

    <div class="text-sm">
      <span op50>{{ totalCount }} {{ itemLabel }} in total</span>
    </div>
  </div>
</template>
