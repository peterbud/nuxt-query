<script setup lang="ts">
defineOptions({ name: 'PayloadDemoPage' })

type PayloadDemoResponse = {
  demoId: string
  generatedAt: string
  serverRequestCount: number
  records: Array<{
    id: string
    label: string
  }>
}

const route = useRoute()
const demoId = computed(() => String(route.params.id))
const browserQueryExecutions = ref(0)

const fetchPayloadDemo = async () => {
  if (import.meta.client)
    browserQueryExecutions.value += 1

  return await $fetch<PayloadDemoResponse>(`/api/payload-demo/${demoId.value}`)
}

const { data, error, isError, isPending, suspense } = useQuery({
  queryKey: ['payload-demo', demoId],
  queryFn: fetchPayloadDemo,
  staleTime: Infinity,
})

onServerPrefetch(async () => {
  await suspense()
})
</script>

<template>
  <main class="demo-page">
    <div class="demo-shell">
      <nav
        class="demo-nav"
        aria-label="Payload demo navigation"
      >
        <NuxtLink href="/">Playground</NuxtLink>
        <span aria-hidden="true">/</span>
        <span>Payload demo {{ demoId }}</span>
      </nav>

      <header class="demo-header">
        <div>
          <p class="demo-label">
            Dynamic SSR + SWR
          </p>
          <h1>Nuxt payload extraction</h1>
          <p class="demo-intro">
            This route is rendered on demand and cached for 60 seconds. Its TanStack Query cache is transferred through Nuxt's extracted payload.
          </p>
        </div>
        <div
          class="hydration-status"
          :data-success="browserQueryExecutions === 0"
        >
          {{ browserQueryExecutions === 0 ? 'Hydrated from payload' : 'Fetched in browser' }}
        </div>
      </header>

      <p
        v-if="isPending"
        class="state-message"
      >
        Loading query data...
      </p>
      <p
        v-else-if="isError"
        class="state-message state-message--error"
      >
        {{ error?.message }}
      </p>

      <template v-else-if="data">
        <dl class="metrics">
          <div>
            <dt>Generated at</dt>
            <dd>{{ data.generatedAt }}</dd>
          </div>
          <div>
            <dt>Server API execution</dt>
            <dd>#{{ data.serverRequestCount }}</dd>
          </div>
          <div>
            <dt>Browser query executions</dt>
            <dd>{{ browserQueryExecutions }}</dd>
          </div>
          <div>
            <dt>SWR window</dt>
            <dd>60 seconds</dd>
          </div>
        </dl>

        <section
          class="records"
          aria-labelledby="records-heading"
        >
          <div class="records-heading">
            <div>
              <h2 id="records-heading">
                Query result
              </h2>
              <p>Response for dynamic route {{ data.demoId }}</p>
            </div>
            <div
              class="route-links"
              aria-label="Other payload demo routes"
            >
              <NuxtLink
                href="/payload-demo/1"
                no-prefetch
              >
                1
              </NuxtLink>
              <NuxtLink
                href="/payload-demo/2"
                no-prefetch
              >
                2
              </NuxtLink>
              <NuxtLink
                href="/payload-demo/3"
                no-prefetch
              >
                3
              </NuxtLink>
            </div>
          </div>

          <ul>
            <li
              v-for="record in data.records"
              :key="record.id"
            >
              <code>{{ record.id }}</code>
              <span>{{ record.label }}</span>
            </li>
          </ul>
        </section>
      </template>
    </div>
  </main>
</template>

<style scoped>
.demo-page {
  min-height: 100vh;
  padding: 20px 16px 32px;
  box-sizing: border-box;
  color: #222;
  background: #fff;
}

.demo-shell {
  width: min(100%, 880px);
  margin: 0 auto;
}

.demo-nav {
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

a:focus-visible {
  outline: 2px solid #006f47;
  outline-offset: 2px;
}

.demo-header {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
  align-items: flex-start;
}

.demo-header > div:first-child {
  flex: 1 1 360px;
  min-width: 0;
}

.demo-label {
  margin: 0 0 4px;
  color: #666;
  font-size: 14px;
}

h1 {
  margin: 0;
  font-size: 28px;
  line-height: 1.2;
}

.demo-intro {
  margin: 8px 0 0;
  color: #555;
  font-size: 14px;
  line-height: 1.5;
}

.hydration-status {
  color: #8f2518;
  font-size: 14px;
}

.hydration-status[data-success="true"] {
  color: #006f47;
}

.state-message {
  margin: 16px 0;
}

.state-message--error {
  color: #8f2518;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px 16px;
  margin: 20px 0 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #ddd;
}

.metrics > div {
  min-width: 0;
}

dt {
  margin-bottom: 4px;
  color: #666;
  font-size: 13px;
}

dd {
  margin: 0;
  overflow-wrap: anywhere;
  font-size: 14px;
  font-weight: 600;
}

.records {
  padding-top: 20px;
}

.records-heading {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

h2 {
  margin: 0 0 4px;
  font-size: 18px;
}

.records-heading p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.route-links {
  display: flex;
  gap: 4px;
}

.route-links a {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
}

.records ul {
  margin: 0;
  padding: 0;
  border-top: 1px solid #ddd;
  list-style: none;
}

.records li {
  display: grid;
  grid-template-columns: minmax(90px, 0.25fr) 1fr;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid #ddd;
  overflow-wrap: anywhere;
}

@media (max-width: 640px) {
  .metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 480px) {
  .records li {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}
</style>
