<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const {
  icon,
  text,
  open = true,
  padding = false,
} = defineProps<{
  icon?: string
  text: string
  open?: boolean
  padding?: boolean
}>()

const isOpen = ref(open)

watch(() => open, (value) => {
  isOpen.value = value
})

const contentClass = computed(() => {
  return padding ? 'px-2 py-2' : ''
})

function toggleOpen() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <section class="nq-section-block border rounded overflow-hidden">
    <div class="nq-section-block-header flex items-center gap-2 px-3 py-2 border-b">
      <button
        type="button"
        class="flex min-w-0 flex-1 items-center gap-2 text-left text-lg font-medium nq-text-strong"
        @click="toggleOpen"
      >
        <span
          v-if="icon"
          :class="[icon, 'shrink-0 op75']"
        />
        <span class="truncate">{{ text }}</span>
        <span
          :class="[
            isOpen ? 'i-carbon-chevron-down' : 'i-carbon-chevron-right',
            'ml-auto shrink-0 op60',
          ]"
        />
      </button>
      <div
        v-if="$slots.actions"
        class="flex items-center gap-2"
      >
        <slot name="actions" />
      </div>
    </div>
    <div
      v-show="isOpen"
      :class="contentClass"
    >
      <slot />
    </div>
  </section>
</template>

<style>
.nq-section-block {
  border-color: var(--nq-border);
  background: var(--nq-surface);
}

.nq-section-block-header {
  border-color: var(--nq-border);
}

.nq-text-strong {
  color: var(--nq-text-strong);
}
</style>
