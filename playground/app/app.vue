<script setup>
const selectedUser = ref(null)

const getUsers = async () => {
  await new Promise(resolve => setTimeout(resolve, 2000))
  return await $fetch('https://jsonplaceholder.typicode.com/users')
}

const getPosts = async (userId) => {
  const url = 'https://jsonplaceholder.typicode.com/posts'
  return await $fetch(url, { method: 'GET', params: { userId } })
}

const { isPending: isUsersPending, data: users } = useQuery({
  queryKey: ['users'],
  queryFn: getUsers,
})

const selectedUserId = computed(() => selectedUser.value?.id)

const { isPending, isFetching, isError, data: posts, error } = useQuery({
  queryKey: ['posts', selectedUserId],
  queryFn: () => getPosts(selectedUserId.value),
  staleTime: 1000 * 10,
  gcTime: 1000 * 20,
  enabled: !selectedUser.value,

})
function selectUser(user) {
  selectedUser.value = user
}
</script>

<template>
  <div>
    <h1>Users</h1>
    <div v-if="isUsersPending">
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
          backgroundColor: selectedUserId === user.id ? 'blue' : 'white',
          color: selectedUserId === user.id ? 'white' : 'black',
          padding: '0.25rem',
        }"
        @click="selectUser(user)"
      >
        {{ user.name }} ({{ user.email }})
      </div>
    </div>
  </div>
  <div>
    <h1>Posts</h1>
    <div v-if="isPending">
      Loading...
    </div>
    <div v-else-if="isFetching">
      Fetching...
    </div>
    <ul v-else-if="isError">
      <li>Error: {{ error.message }}</li>
    </ul>
    <ul v-else>
      <li
        v-for="post in posts"
        :key="post.id"
      >
        {{ post.title }}
      </li>
    </ul>
  </div>
</template>
