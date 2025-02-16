<script setup>
const getPosts = async () => {
  await new Promise(resolve => setTimeout(resolve, 2000))
  const response = await fetch('https://jsonplaceholder.typicode.com/posts')
  return response.json()
}

const { isPending, isFetching, isError, data, error } = useQuery({
  queryKey: ['posts'],
  queryFn: getPosts,
  refetchInterval: 5000,
})
</script>

<template>
  <div>
    <h1>Posts</h1>
    <div v-if="isPending">
      Loading...
    </div>

    <div v-else-if="isError">
      {{ error.message }}
    </div>

    <div v-else-if="isFetching">
      Refetching...
    </div>

    <ul v-else>
      <li
        v-for="post in data"
        :key="post.id"
      >
        {{ post.title }}
      </li>
    </ul>
  </div>
</template>
