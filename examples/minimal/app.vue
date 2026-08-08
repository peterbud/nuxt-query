<script lang="ts" setup>
import { onServerPrefetch } from 'vue'
import { useQuery } from '@tanstack/vue-query'

type User = {
  id: number
  name: string
  email: string
}

const getUsers = async (): Promise<User[]> => {
  return await $fetch('https://jsonplaceholder.typicode.com/users')
}

const { isPending: isPending, data: users, suspense } = useQuery<User[]>({
  queryKey: ['users'],
  queryFn: getUsers,
})

onServerPrefetch(async () => {
  await suspense()
})
</script>

<template>
  <h1>Users</h1>
  <div v-if="isPending">
    Loading...
  </div>
  <div
    v-else
    :style="{
      display: 'grid',
      gap: '0.5rem',
      paddingLeft: '0.5rem',
    }"
  >
    <div
      v-for="user in users"
      :key="user.id"
      :style="{
        cursor: 'pointer',
        paddingTop: '0.25rem',
        borderRadius: '0.125rem',
      }"
    >
      {{ user.name }} ({{ user.email }})
    </div>
  </div>
</template>
