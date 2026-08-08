<script setup lang="ts">
import type { Mutation } from '@tanstack/vue-query'

defineProps<{
  item: Mutation
}>()

defineEmits(['click'])
</script>

<template>
  <div
    class="grid gap-2 px-2 py-1.5 cursor-pointer truncate max-w-full nq-list-item"
    :style="{
      'grid-template-columns': '1em 1fr',
    }"
    @click="$emit('click')"
  >
    <div
      :style="{
        'width': '1em',
        'height': '1em',
        'border-radius': '10%',
        'align-self': 'center',
        'background-color': getMutationBackgroundColor(item),
      }"
    />
    <div>
      {{ item.options.mutationKey || 'No mutation key provided' }}
    </div>
  </div>
</template>

<style>
.nq-list-item {
  color: var(--nq-text-muted);
}

.nq-list-item:hover {
  background: var(--nq-surface-hover);
}
</style>
