# Nuxt Query

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

A powerful Nuxt module for integrating [TanStack Query](https://tanstack.com/query/latest/docs/framework/vue/overview) (formerly Vue Query) into your Nuxt application. Provides robust server state management with intelligent caching, background updates, and seamless data synchronization.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
- [🏀 &nbsp;Online playground](https://stackblitz.com/github/peterbud/nuxt-query/tree/main/examples/minimal)

## Features

- ⚙️ &nbsp; Zero-configuration integration
- 💪 &nbsp; Full TypeScript support with Vue Query configuration
- 🏆 &nbsp; Advanced `QueryClient` setup with custom handlers via hooks
- 🤖 &nbsp; Configurable auto-imports for Vue Query composables
- 🧩 &nbsp; Nuxt DevTools integration for debugging and inspection

## Installation

You can add the module via the Nuxt CLI:

```bash
npx nuxi module add @peterbud/nuxt-query
```

or via npm:

```bash
npm install @peterbud/nuxt-query
```

## Configuration

To configure Nuxt Query, update your `nuxt.config.ts` specifying the options you want for Vue Query:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@peterbud/nuxt-query'],
  nuxtQuery: {
    /**
     * Specify which Vue Query composables to auto-import
     * Default: `false`, set to `true` to auto-import all Vue Query composables
     */
    autoImports: ['useQuery', 'useMutation'],

    // Enable/disable Nuxt DevTools integration (default: true)
    devtools: true,

    /**
     * These are the same options as the QueryClient 
     * from @tanstack/vue-query, which will be passed 
     * to the QueryClient constructor
     * More details: https://tanstack.com/query/v5/docs/reference/QueryClient
     */
    
    queryClientOptions: {
      defaultOptions: {
        queries: {
          // for example disable refetching on window focus
          refetchOnWindowFocus: false,

          // or change the default refetch interval
          refetchInterval: 5000,
        },
      },
    },
  },
})
```

Then, in your component, you can define and run queries with the `useQuery` composable (auto-imported):

```vue
// app.vue
<script setup>
const getPosts = async () => {
  await new Promise(resolve => setTimeout(resolve, 2000))
  return await $fetch('https://jsonplaceholder.typicode.com/posts')
}

const { isPending, isFetching, isError, data, error } = useQuery({
  queryKey: ['posts'],
  queryFn: getPosts,
})
</script>
```

That's it! You can now use Nuxt Query in your Nuxt app ✨

## Module Hooks

Nuxt Query provides a hook that you can use in your application if you need a more complex setup for TanStack Query, such as a custom query client with centralized `onSuccess` or `onError` handlers, which would not be possible to configure with the options available in the `nuxt.config.ts`.

The hook is called `nuxt-query:configure` and you can use it in a plugin to return a custom `QueryClient` object in the following way:

```typescript
// plugins/nuxt-query.ts
import { QueryClient, QueryCache } from '@tanstack/vue-query'

export default defineNuxtPlugin({
  enforce: 'pre',
  setup(nuxtApp) {
    nuxtApp.hook('nuxt-query:configure', (getPluginOptions) => {
      const clientOptions = useRuntimeConfig().public.nuxtQuery?.queryClientOptions || {}

      const queryClient = new QueryClient({
        ...clientOptions,
        queryCache: new QueryCache({
          onSuccess: (data: unknown) => console.log('onSuccess', { data }),
        }),
      })

      // return the plugin options which will be used
      // by the module at startup
      getPluginOptions(queryClient)
    })
  },
})
```

## SSR And Payloads

Await server queries with `onServerPrefetch(suspense)` or an awaited `queryClient.prefetchQuery()` during page rendering. The module captures `dehydrate(queryClient)` at `app:rendered`, after awaited rendering finishes and before Nuxt serializes the payload. Each server app creates its own QueryClient; custom clients supplied through `nuxt-query:configure` must also be created per request, never shared between requests.

The snapshot lives only in `nuxtApp.payload.data['vue-query-state']`, not in `useState`. Its transport format is TanStack's unmodified `DehydratedState`, with no route metadata or wrapper. The QueryClient itself is never serialized. This replaces the previous `payload.state` transport; applications inspecting that internal value must migrate. Use the query cache, not the transport key, in application code.

For extracted routes, Nuxt includes this key in `_payload.json` (or its configured JavaScript payload). The browser hydrates before components mount, after Nuxt has revived and merged the initial payload:

- `experimental.payloadExtraction: 'client'`: initial data stays inline; navigation uses extracted payloads.
- `true`: Nuxt loads the external initial payload before the module hydrates it; navigation also uses extracted payloads.
- `false`: direct SSR hydration still works inline; navigation fetches queries normally.

On navigation, Nuxt loads the destination payload in `router.beforeResolve` and copies its data into `nuxtApp.static.data`. A synchronous successful `router.afterEach` reads `static.data['vue-query-state']` and passes the snapshot to TanStack's `hydrate()` before Vue mounts destination query consumers. The static snapshot is removed on both successful and failed navigation; failed navigation does not hydrate it. The module does not request payloads or add a prefetch cache: NuxtLink prefetching and Nuxt's own loader/HTTP cache remain responsible for transport. Query identity, freshness, and merging remain TanStack's responsibility. Failed, cancelled, superseded, or missing payloads do not stop normal client fetching. Routes without extraction and client-only routes continue to fetch normally.

### Cache And Privacy

Hydration uses TanStack's normal merge semantics, preserving query keys and `dataUpdatedAt`; an older SWR snapshot does not overwrite newer browser data. Nitro's SWR/ISR lifetime controls server response caching, independently of TanStack's `staleTime`. Set a suitable `staleTime` when hydrated data should remain fresh; stale queries still refetch normally. The module does not disable refetching or introduce another query cache.

`dehydrate(queryClient)` continues to respect `defaultOptions.dehydrate` on a custom QueryClient, including query/mutation filters and serialization options. Nuxt remains responsible for payload serialization and configured reducers/revivers. JSON payloads support Nuxt's serializable rich values, such as `Date`; arbitrary class instances and functions are not made serializable by this module.

**Only cache public routes with shared SWR/ISR.** Request-local QueryClients prevent cross-request cache reuse, but do not make a shared Nitro response private. Do not include authenticated or user-specific query data in a shared route's snapshot or rendered HTML. Configure dehydration filters through a custom QueryClient when needed, for example:

```typescript
import type { QueryClientConfig } from '@tanstack/vue-query'
import { defaultShouldDehydrateQuery } from '@tanstack/vue-query'

// Inside the per-request QueryClient options:
const defaultOptions: QueryClientConfig['defaultOptions'] = {
  dehydrate: {
    shouldDehydrateQuery: query =>
      defaultShouldDehydrateQuery(query) && query.meta?.private !== true,
  },
}
```

Mark those queries with `meta: { private: true }`. Filtering the snapshot does not protect private data already rendered into cached HTML; such routes must not use shared response caching.

### Compatibility

The lifecycle and extraction modes above were source-checked against Nuxt 4.4.7 and 4.5.2. Production SSR/browser tests run against Nuxt 4.5.2 and TanStack Query 5.103.1, covering runtime SWR/ISR payloads, all three extraction modes, initial/navigation hydration, rich values, custom dehydration filtering, request isolation, stale refetching, and failed/superseded navigation. Older Nuxt releases are not covered by this verification, and deployment-specific ISR adapters are not tested by the Node fixture.

Nuxt 4.4.7 does not expose SSR streaming. In Nuxt 4.5.2, the streaming renderer calls `app:rendered` after the body stream finishes and before emitting the final inline payload; an opted-in streaming route is tested. Nuxt excludes cached SWR/ISR routes, prerendering, and payload requests from streaming. Only awaited queries completed by that capture point are guaranteed to be included; background work continuing after rendering is not. Streaming support on other Nuxt versions is not assumed.

## Nuxt DevTools Integration

Nuxt Query integrates with Nuxt DevTools to provide a dedicated tab for Vue Query, where you can inspect the state of your queries, view their cache, and properties, initiate refetch or remove certain queries and more.

![Nuxt DevTools](assets/devtools.png)

Also, you can inspect your mutation cache using the same DevTools in a convenient way.

![Mutation Cache](assets/mutationcache.png)

## Contribution

<details>
  <summary>Local development</summary>
  
  ```bash
  # Install dependencies
  npm install
  
  # Generate type stubs
  npm run dev:prepare
  
  # Develop with the playground
  npm run dev:client
  
  # Build the playground
  npm run dev:build
  
  # Run ESLint
  npm run lint
  
  # Install Chromium for the Nuxt browser tests
  pnpm exec playwright-core install chromium

  # Run Vitest
  npm run test
  npm run test:watch
  
  # Build the module
  npm run build

  # Release new version
  npm run release
  ```

</details>

If you want to report a bug, please make sure you have a minimal reproduction of the issue. You can use the [minimal example](https://stackblitz.com/github/peterbud/nuxt-query/tree/main/examples/minimal?title=Nuxt-Query%20Minimal%20Example) to create a reproduction.

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@peterbud/nuxt-query/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/@peterbud/nuxt-query

[npm-downloads-src]: https://img.shields.io/npm/dm/@peterbud/nuxt-query.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/@peterbud/nuxt-query

[license-src]: https://img.shields.io/npm/l/@peterbud/nuxt-query.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/@peterbud/nuxt-query

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
