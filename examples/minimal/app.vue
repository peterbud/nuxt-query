<script lang="ts" setup>
const getUsers = async () => {
  return await $fetch('https://jsonplaceholder.typicode.com/users')
}

const { isPending: isPending, data: users, suspense } = useQuery({
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
