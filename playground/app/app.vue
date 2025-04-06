<script setup>
const selectedUser = ref(null)
const queryClient = useQueryClient()

const getUsers = async () => {
  await new Promise(resolve => setTimeout(resolve, 2000))
  return await $fetch('https://jsonplaceholder.typicode.com/users')
}

const getPosts = async (userId) => {
  const url = 'https://jsonplaceholder.typicode.com/posts'
  return await $fetch(url, { method: 'GET', params: { userId } })
}

const { isPending: isUsersPending, data: users, suspense } = useQuery({
  queryKey: ['users'],
  queryFn: getUsers,
})

const selectedUserId = computed(() => selectedUser.value?.id)

const { isPending, isFetching, isError, data: posts, error } = useQuery({
  queryKey: ['posts', selectedUserId],
  queryFn: () => getPosts(selectedUserId.value),
  staleTime: 1000 * 10, // for 10 seconds it will be considered as "fresh"
  gcTime: 1000 * 20, // after 20 seconds it will be garbage collected
  enabled: computed(() => selectedUser.value !== null),
  meta: {
    title: 'Posts',
    id: selectedUserId,
  },

})

const { mutate: addPost, isPending: isMutationPending } = useMutation({
  mutationFn: async (post) => {
    const url = 'https://jsonplaceholder.typicode.com/posts'
    return await $fetch(url, { method: 'POST', body: post })
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['posts', selectedUserId] })
  },
})

onServerPrefetch(async () => {
  await suspense()
})

function selectUser(user) {
  selectedUser.value = user
}

function addNewPost() {
  addPost({
    title: 'New Post',
    body: 'This is a new post',
    userId: selectedUserId.value,
  })
}
</script>

<template>
  <div
    :style="{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '2rem',
    }"
  >
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
            paddingTop: '0.25rem',
            borderRadius: '0.125rem',
          }"
          @click="selectUser(user)"
        >
          {{ user.name }} ({{ user.email }})
        </div>
      </div>
    </div>
    <div>
      <div
        :style="{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }"
      >
        <h1>Posts</h1>
        <button @click="addNewPost">
          Add Post
        </button>
      </div>
      <div v-if="isPending">
        Select a user first...
      </div>
      <div v-if="isMutationPending">
        Adding post...
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
  </div>
</template>
