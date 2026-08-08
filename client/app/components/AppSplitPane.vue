<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { SplitpanesReadyPayload, SplitpanesResizedPayload } from 'splitpanes'
import { Pane, Splitpanes } from 'splitpanes'

const {
  storageKey,
  leftSize = 35,
  rightSize = 65,
  leftMinSize = 20,
  rightMinSize = 25,
} = defineProps<{
  storageKey?: string
  leftSize?: number
  rightSize?: number
  leftMinSize?: number
  rightMinSize?: number
}>()

const leftPaneSize = ref(leftSize)
const rightPaneSize = ref(rightSize)
const hasStoredSizes = ref(false)

function applyPanes(panes: Array<{ size: number }>) {
  const [leftPane, rightPane] = panes

  if (!leftPane || !rightPane) {
    return
  }

  leftPaneSize.value = leftPane.size
  rightPaneSize.value = rightPane.size
}

function persistSizes() {
  if (!storageKey || typeof window === 'undefined') {
    return
  }

  localStorage.setItem(storageKey, JSON.stringify([
    leftPaneSize.value,
    rightPaneSize.value,
  ]))
}

function handleReady(payload: SplitpanesReadyPayload) {
  if (!hasStoredSizes.value) {
    applyPanes(payload.panes)
  }
}

function handleResized(payload: SplitpanesResizedPayload) {
  applyPanes(payload.panes)
  persistSizes()
}

onMounted(() => {
  if (!storageKey || typeof window === 'undefined') {
    return
  }

  const rawValue = localStorage.getItem(storageKey)
  if (!rawValue) {
    return
  }

  try {
    const parsed = JSON.parse(rawValue)
    if (
      Array.isArray(parsed)
      && parsed.length === 2
      && parsed.every(value => typeof value === 'number' && Number.isFinite(value))
    ) {
      leftPaneSize.value = parsed[0]
      rightPaneSize.value = parsed[1]
      hasStoredSizes.value = true
    }
  }
  catch {
    localStorage.removeItem(storageKey)
  }
})
</script>

<template>
  <Splitpanes
    class="h-full app-split-pane"
    @ready="handleReady"
    @resized="handleResized"
  >
    <Pane
      :size="leftPaneSize"
      :min-size="leftMinSize"
    >
      <slot name="left" />
    </Pane>
    <Pane
      :size="rightPaneSize"
      :min-size="rightMinSize"
    >
      <slot name="right" />
    </Pane>
  </Splitpanes>
</template>

<style>
.app-split-pane .splitpanes__splitter {
  border-color: var(--nq-border-strong);
  background-color: var(--nq-surface-muted);
}

.app-split-pane .splitpanes__pane {
  overflow: auto;
}
</style>
