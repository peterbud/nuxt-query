<script setup lang="ts">
import { computed, useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const {
  size = 'default',
  active = false,
  iconOnly = false,
} = defineProps<{
  size?: 'default' | 'small'
  active?: boolean
  iconOnly?: boolean
}>()

const attrs = useAttrs()

const classes = computed(() => [
  'inline-flex items-center gap-2 rounded border transition-colors disabled:cursor-not-allowed disabled:op50',
  size === 'small' ? 'min-h-8 px-2 text-xs' : 'min-h-9 px-3 text-sm',
  iconOnly ? 'justify-center px-2' : 'justify-center',
  active
    ? 'nq-button-active'
    : 'nq-button',
  attrs.class,
])
</script>

<template>
  <button
    v-bind="attrs"
    type="button"
    :class="classes"
  >
    <slot name="icon" />
    <slot />
  </button>
</template>

<style>
.nq-button,
.nq-button-active {
  appearance: none;
  -webkit-appearance: none;
  border-style: solid;
  box-shadow: none;
}

.nq-button {
  border-color: var(--nq-border-strong);
  background: var(--nq-surface);
  color: var(--nq-accent);
}

.nq-button:hover {
  background: var(--nq-surface-hover);
}

.nq-button-active {
  border-color: var(--nq-accent);
  background: var(--nq-accent);
  color: var(--nq-accent-contrast);
}
</style>
