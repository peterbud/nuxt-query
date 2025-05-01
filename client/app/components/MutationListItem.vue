<script setup lang="ts">
import type { Mutation } from '@tanstack/vue-query'

defineProps<{
  item: Mutation
}>()

defineEmits(['click'])
</script>

<template>
  <div
    class="flex flex-col p-2 overflow-hidden hover-bg-active cursor-pointer border-b border-gray-100 dark:border-gray-800"
    @click="$emit('click')"
  >
    <div class="flex items-center gap-2">
      <span
        class="rounded whitespace-nowrap select-none mx-0.5 px-1.5 py-0.5"
        :style="{
          'background-color': `${getMutationBackgroundColor(item)}`,
        }"
      >
        {{ getMutationStatusLabel(item) }}
      </span>
      <div class="truncate font-mono text-sm opacity-75">
        {{ item.options.mutationKey || 'Anonymous' }}
      </div>
    </div>
  </div>
</template>
