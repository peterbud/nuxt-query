<script setup lang="ts">
defineOptions({ name: 'IndexPage' })
</script>

<template>
  <div>basic</div>
  <NuxtLink
    to="/swr"
    :prefetch="false"
  >SWR</NuxtLink>
  <NuxtLink
    to="/isr"
    :prefetch="false"
  >ISR</NuxtLink>
  <NuxtLink
    to="/plain"
    :prefetch="false"
  >Plain</NuxtLink>
  <NuxtLink
    to="/client"
    :prefetch="false"
  >Client</NuxtLink>
</template>
