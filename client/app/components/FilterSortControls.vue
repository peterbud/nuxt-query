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
    class="grid gap-2 p-2 b-b-1"
    :style="{ 'border-color': 'var(--nq-border-strong)' }"
  >
    <div
      class="grid items-center gap-2 grid-cols-[minmax(7em,1fr)_auto]"
    >
      <div
        class="flex min-w-16 items-center gap-2 rounded pl-2"
        :style="{
          'border': '1px solid var(--nq-border-strong)',
          'background-color': 'var(--nq-surface-muted)',
        }"
      >
        <span class="i-carbon-search h-4 w-4 shrink-0 op50" />
        <input
          v-model="searchModel"
          type="text"
          class="block min-w-0 flex-1 appearance-none border-0 bg-transparent px-0 py-2 text-sm outline-none"
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
        <AppButton
          size="small"
          class="w-auto"
          :title="sortDirection === 'asc' ? 'Ascending' : 'Descending'"
          @click="toggleDirection"
        >
          {{ sortDirection === 'asc' ? 'ASC' : 'DESC' }}
        </AppButton>
      </div>
    </div>

    <div class="text-sm">
      <span op50>{{ totalCount }} {{ itemLabel }} in total</span>
    </div>
  </div>
</template>
