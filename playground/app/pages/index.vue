<script setup>
defineOptions({ name: 'PlaygroundIndexPage' })

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
  enabled: computed(() => !!selectedUser.value),
  meta: {
    title: 'Posts',
    id: selectedUserId,
  },
})

const { mutate: addPost, isPending: isMutationPending } = useMutation({
  mutationKey: ['addPost'],
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
  <main class="playground-page">
    <div class="playground-shell">
      <nav
        class="playground-nav"
        aria-label="Playground navigation"
      >
        <span>Playground</span>
        <span aria-hidden="true">/</span>
        <NuxtLink href="/payload-demo/1">Payload extraction demo</NuxtLink>
      </nav>

      <header class="playground-header">
        <p class="playground-label">
          TanStack Query + Nuxt
        </p>
        <h1>Nuxt Query playground</h1>
      </header>

      <div class="query-layout">
        <section aria-labelledby="users-heading">
          <div class="section-heading">
            <h2 id="users-heading">
              Users
            </h2>
          </div>
          <p
            v-if="isUsersPending"
            class="state-message"
          >
            Loading users...
          </p>
          <ul
            v-else
            class="user-list"
          >
            <li
              v-for="user in users"
              :key="user.id"
            >
              <button
                type="button"
                class="user-button"
                :class="{ 'user-button--selected': selectedUserId === user.id }"
                :aria-pressed="selectedUserId === user.id"
                @click="selectUser(user)"
              >
                <span class="user-name">{{ user.name }}</span>
                <span class="user-email">{{ user.email }}</span>
              </button>
            </li>
          </ul>
        </section>

        <section aria-labelledby="posts-heading">
          <div class="section-heading">
            <h2 id="posts-heading">
              Posts
            </h2>
            <button
              type="button"
              class="add-post-button"
              :disabled="!selectedUserId || isMutationPending"
              @click="addNewPost"
            >
              Add Post
            </button>
          </div>
          <p
            v-if="!selectedUserId"
            class="state-message"
          >
            Select a user first...
          </p>
          <p
            v-else-if="isMutationPending"
            class="state-message"
          >
            Adding post...
          </p>
          <p
            v-else-if="isPending || isFetching"
            class="state-message"
          >
            Fetching posts...
          </p>
          <p
            v-else-if="isError"
            class="state-message state-message--error"
          >
            Error: {{ error.message }}
          </p>
          <ul
            v-else
            class="post-list"
          >
            <li
              v-for="post in posts"
              :key="post.id"
            >
              <h3 class="post-title">
                {{ post.title }}
              </h3>
              <p class="post-body">
                {{ post.body }}
              </p>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped>
.playground-page {
  min-height: 100vh;
  padding: 20px 16px 32px;
  box-sizing: border-box;
  color: #222;
  background: #fff;
}

.playground-shell {
  width: min(100%, 880px);
  margin: 0 auto;
}

.playground-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 20px;
  color: #666;
  font-size: 14px;
}

a {
  color: #006f47;
}

.playground-label {
  margin: 0 0 4px;
  color: #666;
  font-size: 14px;
}

h1 {
  margin: 0;
  font-size: 28px;
  line-height: 1.2;
}

.query-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 24px;
  padding-top: 24px;
}

.query-layout > section {
  min-width: 0;
}

.section-heading {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  min-height: 32px;
  margin-bottom: 8px;
}

h2 {
  margin: 0;
  font-size: 18px;
}

button {
  font: inherit;
  cursor: pointer;
}

button:focus-visible,
a:focus-visible {
  outline: 2px solid #006f47;
  outline-offset: 2px;
}

.user-list,
.post-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.user-list {
  border-top: 1px solid #ddd;
}

.user-list li {
  border-bottom: 1px solid #ddd;
}

.user-button {
  display: grid;
  gap: 2px;
  width: 100%;
  padding: 8px;
  border: 0;
  color: inherit;
  background: transparent;
  text-align: left;
  overflow-wrap: anywhere;
}

.user-button:hover,
.add-post-button:hover:not(:disabled) {
  background: #f3f3f3;
}

.user-button--selected,
.user-button--selected:hover {
  background: #e5f2eb;
}

.user-name {
  font-weight: 600;
}

.user-email {
  color: #666;
  font-size: 13px;
}

.add-post-button {
  min-height: 32px;
  padding: 4px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  color: inherit;
  background: #fff;
  font-size: 14px;
}

.add-post-button:disabled {
  color: #777;
  background: #f3f3f3;
  cursor: not-allowed;
}

.post-list li {
  overflow-wrap: anywhere;
}

.post-list li + li {
  margin-top: 16px;
}

.post-title {
  margin: 0 0 4px;
  font-size: 16px;
  line-height: 1.4;
}

.post-body {
  margin: 0;
  color: #555;
  line-height: 1.5;
  white-space: pre-line;
}

.state-message {
  margin: 0;
  padding: 8px 0;
  color: #666;
  line-height: 1.5;
}

.state-message--error {
  color: #8f2518;
}

@media (max-width: 640px) {
  .query-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>
