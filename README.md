# Nuxt Query

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Nuxt Query is a module for integrating [Vue Query](https://tanstack.com/query/latest/docs/framework/vue/overview) into your Nuxt application, providing a powerful solution for fetching, caching, synchronizing and updating server state.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
<!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/nuxt-query?file=playground%2Fapp.vue) -->
<!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Features

<!-- Highlight some of the features your module provide here -->
- ⛰ &nbsp; 0 config integration
- 🚠 &nbsp; Full support of Vue Query config settings
- 🌲 &nbsp; Support for complex `QueryClient` setup with handlers via hooks
- 🪄 &nbsp; Configurable auto-imports for Vue Query composables
- 🧩 &nbsp; Nuxt DevTools integration for easy debugging

## Installation

You can add the module via the Nuxt CLI:

```bash
npx nuxi module add nuxt-query @tanstack/vue-query
```

## Configuration

To configure Nuxt Query, update your `nuxt.config.ts` specifying the options you want for Vue Query:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-query'],
  nuxtQuery: {
    autoImports: ['useQuery'],
    queryClientOptions: {
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          refetchInterval: 5000,
        },
      },
    },
  },
})
```

Then, in your component, you can define and queries with the `useQuery` composable (autoimported):

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

## Module Options

- `autoImports`: Boolean or an array of Vue Query composable names to be auto-imported (default: false).
- `devtools`: Boolean flag to enable Nuxt DevTools integration (default: true).
- `queryClientOptions`: Object to configure the QueryClient from @tanstack/vue-query (optional).

## Module Hooks

Nuxt Query provides a hook that you can use in your application if you need a more complex setup for Vue Query, like custom query client with onSuccess or onError handlers, which would not be possible to configure with the options available in the `nuxt.config.ts`.

The hook is called `nuxt-query:configure` and you can use it in a plugin to return a custom `QueryClient` object:

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

      // return the plugin options which will be used by the module
      getPluginOptions(queryClient)
    })
  },
})
```

## Contribution

<details>
  <summary>Local development</summary>
  
  ```bash
  # Install dependencies
  npm install
  
  # Generate type stubs
  npm run dev:prepare
  
  # Develop with the playground
  npm run dev
  
  # Build the playground
  npm run dev:build
  
  # Run ESLint
  npm run lint
  
  # Run Vitest
  npm run test
  npm run test:watch
  
  # Release new version
  npm run release
  ```

</details>


<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-query/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-query

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-query.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/nuxt-query

[license-src]: https://img.shields.io/npm/l/nuxt-query.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-query

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
